import "server-only";
import { ROLE_ENGINE } from "./models";
import { briefFor } from "./specialists";
import { callWithFallback } from "./fallback";
import { classifyError } from "./redaction";
import { telemetry } from "./telemetry";
import type { ExecutionBudget } from "./config";
import type { Attachment, LanePlan, LaneResult, WindMessage } from "./types";

/**
 * Lane executor — runs one specialist lane end to end.
 *
 * A lane is the unit of parallel work: one brief, one objective, one engine
 * (plus its fallback chain), one result. The executor never throws for an
 * ordinary failure; it returns a failed `LaneResult` so the orchestrator can
 * continue with whatever else succeeded.
 */

export interface AvailableTool {
  id: string;
  name: string;
  integrationId: string;
  effect: "read" | "write";
}

export interface LaneContext {
  userRequest: string;
  attachments: Attachment[];
  /** Outputs of lanes this lane depends on, already completed. */
  upstream: LaneResult[];
  /** Permission-filtered workspace knowledge. */
  knowledge?: string;
  traceId: string;
  budget: ExecutionBudget;
  signal?: AbortSignal;
  onNote?: (note: string) => void;
  /** Tools the workspace can genuinely reach, for the action-planning lane. */
  availableTools?: AvailableTool[];
}

export async function runLane(lane: LanePlan, context: LaneContext): Promise<LaneResult> {
  const startedAt = Date.now();
  const brief = briefFor(lane.role);
  const preferredKey = ROLE_ENGINE[lane.role];

  const messages: WindMessage[] = [
    { role: "system", content: brief.system },
    {
      role: "user",
      content: buildLanePrompt(lane, context),
      // Images travel with the lane so vision-capable engines can see them.
      attachments: context.attachments,
    },
  ];

  let note: string | undefined;

  try {
    const result = await callWithFallback({
      preferredKey,
      messages,
      traceId: context.traceId,
      signal: context.signal,
      reserve: () => context.budget.tryReserveCall(),
      onFallback: (fallbackMessage) => {
        note = fallbackMessage;
        context.onNote?.(fallbackMessage);
      },
    });

    telemetry.lane(context.traceId, lane.id, "completed", { ms: result.ms, fellBack: result.fellBack });

    return {
      laneId: lane.id,
      role: lane.role,
      label: lane.label,
      status: "completed",
      output: result.text.trim(),
      note,
      startedAt,
      finishedAt: Date.now(),
      diagnostics: { attempts: result.attempts, totalMs: Date.now() - startedAt },
    };
  } catch (error) {
    const code = classifyError(error);
    telemetry.lane(context.traceId, lane.id, "failed", { code });

    return {
      laneId: lane.id,
      role: lane.role,
      label: lane.label,
      status: code === "cancelled" ? "skipped" : "failed",
      output: "",
      note:
        code === "budget"
          ? "Wind stopped this step to stay inside its execution budget."
          : "Wind could not complete this step.",
      startedAt,
      finishedAt: Date.now(),
      diagnostics: { attempts: [], totalMs: Date.now() - startedAt },
    };
  }
}

export function buildLanePrompt(lane: LanePlan, context: LaneContext): string {
  const parts: string[] = [`Objective for this pass: ${lane.objective}`, "", `User request:\n${context.userRequest}`];

  if (context.knowledge) {
    parts.push("", `Workspace knowledge available to you:\n${context.knowledge}`);
  }

  const upstream = context.upstream.filter((result) => result.status === "completed" && result.output);
  if (upstream.length > 0) {
    parts.push("", "Findings from earlier passes — build on these, do not repeat them:");
    for (const result of upstream) parts.push(`\n[${result.label}]\n${result.output.slice(0, 8_000)}`);
  }

  // Only the planning lane picks a tool, and only from what is actually
  // connected — an unreachable tool is not an option Wind may take.
  if (lane.label === "Action planning" && context.availableTools && context.availableTools.length > 0) {
    const writable = context.availableTools.filter((tool) => tool.effect === "write");
    if (writable.length > 0) {
      parts.push(
        "",
        "Tools this workspace can actually reach:",
        ...writable.map((tool) => `  ${tool.id} — ${tool.name}`),
        "",
        "Begin your output with a single line `TOOL: <id>` naming the one tool that would carry this out,",
        "choosing only from the list above. If none of them fits, write `TOOL: none`.",
        "Then, on the following lines, write the exact content of the action.",
      );
    }
  }

  const textAttachments = context.attachments.filter((a) => a.text);
  if (textAttachments.length > 0) {
    parts.push("", "Attached material:");
    for (const attachment of textAttachments) {
      parts.push(`\n--- ${attachment.name} ---\n${attachment.text!.slice(0, 60_000)}`);
    }
  }

  return parts.join("\n");
}
