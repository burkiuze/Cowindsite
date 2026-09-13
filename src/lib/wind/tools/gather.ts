import "server-only";
import { primaryComplete } from "../adapters/primary";
import { executeTool, isWired } from "./execute";
import { findTool, type ToolDefinition } from "./registry";
import { telemetry } from "../telemetry";
import { sanitizeForUser } from "../redaction";
import type { Intent } from "../types";

/**
 * The gather phase.
 *
 * Before Navio plans the work, it looks at what it is allowed to look at. Only
 * read-effect tools, only on integrations that are both connected and wired to
 * an endpoint, and only a handful per request. Writes never happen here — those
 * go through an approval, always.
 *
 * The tools are chosen by the fast engine from the list of what is genuinely
 * reachable, with a deterministic fallback by intent so a classification
 * hiccup cannot leave Navio blind.
 */

export interface GatheredAction {
  id: string;
  integrationId: string;
  toolId: string;
  /** Product-facing description of what was read. */
  label: string;
  status: "running" | "completed" | "failed";
  /** What came back, already sanitised. Fed to the specialists as context. */
  result: string;
  at: number;
}

const MAX_READS = 6;

/** When classification is unavailable, these reads still make sense per intent. */
const BY_INTENT: Partial<Record<Intent, string[]>> = {
  ACTION_REQUEST: ["google-calendar.list_events", "gmail.list_threads"],
  WORKFLOW_REQUEST: ["google-calendar.list_events"],
  CODING: ["github.list_pull_requests"],
  FINANCE: ["stripe.read_metrics"],
  RESEARCH: ["linkedin.read_page_activity", "notion.search"],
  MULTI_DOMAIN: ["github.list_pull_requests", "stripe.read_metrics", "google-calendar.list_events"],
};

export function readableTools(available: Array<{ id: string; effect: string; integrationId: string }>): ToolDefinition[] {
  return available
    .filter((tool) => tool.effect === "read" && isWired(tool.integrationId))
    .map((tool) => findTool(tool.id))
    .filter((tool): tool is ToolDefinition => Boolean(tool));
}

function selectionPrompt(request: string, tools: ToolDefinition[]): string {
  return [
    "You choose which read-only lookups to run before answering. Answer with one JSON object and nothing else.",
    'Shape: {"reads": [{"tool": "<id>", "why": "max 8 words"}]}',
    `Pick between 0 and ${MAX_READS} tools, only from this list, and only where the lookup genuinely informs the request.`,
    "Choosing nothing is a valid answer for a request that needs no outside data.",
    "",
    "Available lookups:",
    ...tools.map((tool) => `  ${tool.id} — ${tool.description}`),
    "",
    "Request:",
    request.slice(0, 2_000),
  ].join("\n");
}

function parseSelection(raw: string, tools: ToolDefinition[]): ToolDefinition[] {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as { reads?: Array<{ tool?: string }> };
    const ids = (parsed.reads ?? []).map((read) => read.tool).filter((id): id is string => typeof id === "string");
    return ids
      .map((id) => tools.find((tool) => tool.id === id))
      .filter((tool): tool is ToolDefinition => Boolean(tool))
      .slice(0, MAX_READS);
  } catch {
    return [];
  }
}

export async function gather(options: {
  request: string;
  intent: Intent;
  available: Array<{ id: string; effect: string; integrationId: string }>;
  actor: string;
  traceId: string;
  signal?: AbortSignal;
  /** Called as each lookup starts and again when it lands. */
  emit?: (action: GatheredAction) => void;
}): Promise<GatheredAction[]> {
  const tools = readableTools(options.available);
  if (tools.length === 0) return [];

  let chosen: ToolDefinition[] = [];
  try {
    const decision = await primaryComplete(
      [
        { role: "system", content: "You select read-only lookups. Output JSON only." },
        { role: "user", content: selectionPrompt(options.request, tools) },
      ],
      options.traceId,
      { temperature: 0, maxTokens: 220, timeoutMs: 12_000, signal: options.signal },
    );
    chosen = parseSelection(decision.text, tools);
  } catch {
    telemetry.route(options.traceId, "read selection unavailable, falling back to intent defaults");
  }

  if (chosen.length === 0) {
    const fallback = BY_INTENT[options.intent] ?? [];
    chosen = fallback
      .map((id) => tools.find((tool) => tool.id === id))
      .filter((tool): tool is ToolDefinition => Boolean(tool));
  }

  if (chosen.length === 0) return [];

  // Reads are independent of each other: run them together. Each one is
  // reported twice — once when it starts, once when it lands — so the interface
  // can show work in flight instead of a list that appears already finished.
  const results = await Promise.all(
    chosen.slice(0, MAX_READS).map(async (tool, index): Promise<GatheredAction> => {
      const base = {
        id: `act_${index + 1}`,
        integrationId: tool.integrationId,
        toolId: tool.id,
        label: tool.name,
        at: Date.now(),
      };
      options.emit?.({ ...base, status: "running", result: "" });

      const outcome = await executeTool({
        toolId: tool.id,
        integrationId: tool.integrationId,
        payload: options.request.slice(0, 2_000),
        actor: options.actor,
        traceId: options.traceId,
      });

      telemetry.route(options.traceId, `read ${tool.id} → ${outcome.status}`);

      const settled: GatheredAction = {
        ...base,
        status: outcome.status === "executed" ? "completed" : "failed",
        result: sanitizeForUser(
          outcome.status === "executed" && outcome.data ? outcome.data : outcome.receipt,
        ).slice(0, 4_000),
        at: Date.now(),
      };
      options.emit?.(settled);
      return settled;
    }),
  );

  return results;
}

/** The gathered material, as context a specialist can read. */
export function asContext(actions: GatheredAction[]): string {
  const usable = actions.filter((action) => action.status === "completed");
  if (usable.length === 0) return "";
  return [
    "Live data read from connected tools for this request:",
    ...usable.map((action) => `\n[${action.toolId}]\n${action.result}`),
  ].join("\n");
}
