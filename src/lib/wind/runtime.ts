import "server-only";
import { EventChannel } from "./channel";
import { ExecutionBudget, LIMITS } from "./config";
import { orchestrate } from "./orchestrator";
import type { AvailableTool } from "./executor";
import { asContext, gather, type GatheredAction } from "./tools/gather";
import { route } from "./router";
import { primaryStream } from "./adapters/primary";
import { isConfigured } from "./adapters/endpoints";
import { synthesisPrompt, windSystemPrompt, type PromptContext } from "./prompts";
import { classifyError, sanitizeForUser, userFacingError, WindError } from "./redaction";
import { newTraceId, telemetry } from "./telemetry";
import type { Attachment, LaneResult, RouteDecision, WindEvent, WindMessage } from "./types";

/**
 * Wind runtime — ASK → PLAN → ACT → REPORT.
 *
 * This is the seam between Cowind the product and Wind the system. It emits a
 * stream of user-safe events and returns the final answer text. Everything it
 * emits is sanitised: no engine names, no vendors, no transport detail, no
 * private reasoning.
 */

export interface RuntimeServices {
  /** Permission-filtered knowledge retrieval for this user + workspace. */
  retrieveKnowledge?: (query: string) => Promise<{ text: string; sources: string[] } | null>;
  /** Register an action that needs a human decision before it can run. */
  requestApproval?: (draft: ApprovalDraft) => Promise<{ id: string } | null>;
}

export interface ApprovalDraft {
  title: string;
  summary: string;
  /** Prepared content of the action, shown verbatim to the approver. */
  payload: string;
  risk: "low" | "medium" | "high";
  /** The tool that would carry it out, when one was chosen from what is connected. */
  toolId?: string;
  integrationId?: string;
}

export interface RuntimeInput {
  message: string;
  attachments: Attachment[];
  history: WindMessage[];
  prompt: PromptContext;
  services?: RuntimeServices;
  /** Tools the workspace can actually reach. Wind may only choose from these. */
  availableTools?: AvailableTool[];
  signal?: AbortSignal;
  /** Set by callers that must not spend specialist budget (e.g. previews). */
  fastPathOnly?: boolean;
}

export interface RuntimeOutput {
  text: string;
  decision: RouteDecision;
  laneResults: LaneResult[];
  /** Read-only tool calls Wind actually made on connected integrations. */
  actions: GatheredAction[];
  approvalId?: string;
  traceId: string;
  /** True when Wind answered without any specialist pass. */
  direct: boolean;
}

export async function* runWind(input: RuntimeInput): AsyncGenerator<WindEvent, RuntimeOutput, unknown> {
  const traceId = newTraceId();
  const budget = new ExecutionBudget();

  let finalText = "";
  let approvalId: string | undefined;
  let laneResults: LaneResult[] = [];
  let actions: GatheredAction[] = [];

  if (!isConfigured()) {
    yield { type: "error", message: userFacingError("unconfigured") };
    return {
      text: "",
      decision: emptyDecision(),
      laneResults: [],
      actions: [],
      traceId,
      direct: true,
    };
  }

  yield { type: "status", phase: "thinking", message: "Wind is thinking" };

  // ---- PLAN ---------------------------------------------------------------
  let decision: RouteDecision;
  try {
    decision = await route({
      message: input.message,
      attachments: input.attachments,
      history: input.history,
      traceId,
      deterministicOnly: input.fastPathOnly,
      signal: input.signal,
    });
  } catch (error) {
    telemetry.error(traceId, "routing failed", { code: classifyError(error) });
    decision = emptyDecision();
  }

  if (input.fastPathOnly) decision = { ...decision, lanes: [], synthesize: false };

  // ---- LOOK ---------------------------------------------------------------
  // Read-only lookups on connected tools, before any of the work is planned.
  if ((input.availableTools?.length ?? 0) > 0 && decision.complexity !== "trivial") {
    yield { type: "status", phase: "retrieving", message: "Wind is checking connected tools" };

    const started = new Map<string, { integrationId: string; label: string }>();
    try {
      actions = await gather({
        request: input.message,
        intent: decision.intent,
        available: input.availableTools!,
        actor: input.prompt.userName,
        traceId,
        signal: input.signal,
        onStart: (tool) => started.set(tool.id, { integrationId: tool.integrationId, label: tool.name }),
      });
    } catch (error) {
      telemetry.error(traceId, "gather failed", { code: classifyError(error) });
      actions = [];
    }

    for (const action of actions) {
      yield {
        type: "action",
        id: action.id,
        integrationId: action.integrationId,
        toolId: action.toolId,
        label: action.label,
        status: action.status,
      };
    }
  }

  // ---- RETRIEVE -----------------------------------------------------------
  let knowledge: string | undefined;
  if (input.services?.retrieveKnowledge && decision.complexity !== "trivial") {
    yield { type: "status", phase: "retrieving", message: "Searching workspace knowledge" };
    try {
      const retrieved = await input.services.retrieveKnowledge(input.message);
      if (retrieved?.text) {
        knowledge = retrieved.text.slice(0, 40_000);
        if (retrieved.sources.length > 0) {
          yield {
            type: "notice",
            level: "info",
            message: `Using workspace knowledge: ${retrieved.sources.slice(0, 3).join(", ")}`,
          };
        }
      }
    } catch (error) {
      telemetry.error(traceId, "knowledge retrieval failed", { code: classifyError(error) });
    }
  }

  const liveData = asContext(actions);
  const context = [knowledge, liveData].filter(Boolean).join("\n\n") || undefined;
  const system = windSystemPrompt({ ...input.prompt, knowledge: context });

  // ---- DIRECT ANSWER ------------------------------------------------------
  if (decision.lanes.length === 0) {
    yield { type: "status", phase: "finalizing", message: "Wind is replying" };
    try {
      for await (const chunk of primaryStream(
        [
          { role: "system", content: system },
          ...trimHistory(input.history),
          { role: "user", content: input.message, attachments: input.attachments },
        ],
        traceId,
        { signal: input.signal },
      )) {
        finalText += chunk;
        yield { type: "delta", text: chunk };
      }
    } catch (error) {
      const code = classifyError(error);
      telemetry.error(traceId, "direct answer failed", { code });
      // A direct answer that fails still has a route: escalate to a specialist.
      const recovered = yield* recoverWithSpecialist(input, system, traceId, budget);
      if (recovered) {
        finalText = recovered;
      } else {
        yield { type: "error", message: userFacingError(code) };
      }
    }

    return { text: finalText, decision, laneResults: [], actions, traceId, direct: true };
  }

  // ---- ACT ----------------------------------------------------------------
  yield { type: "status", phase: "planning", message: "Wind is planning the work" };
  yield { type: "status", phase: "routing", message: "Wind is routing the task" };

  // Lane events stream to the browser while lanes are still running.
  const channel = new EventChannel<WindEvent>();
  const running = orchestrate({
    lanes: decision.lanes,
    userRequest: input.message,
    attachments: input.attachments,
    knowledge: context,
    traceId,
    budget,
    signal: input.signal,
    availableTools: input.availableTools,
    emit: (event) => channel.push(sanitizeEvent(event)),
  }).finally(() => channel.close());

  for await (const event of channel) yield event;
  const orchestration = await running.catch((error: unknown) => {
    telemetry.error(traceId, "orchestration failed", { code: classifyError(error) });
    return { results: [], completed: [], failed: [], usable: false };
  });
  laneResults = orchestration.results;

  if (!orchestration.usable) {
    yield { type: "status", phase: "finalizing", message: "Wind is replying" };
    try {
      for await (const chunk of primaryStream(
        [
          { role: "system", content: system },
          ...trimHistory(input.history),
          { role: "user", content: input.message, attachments: input.attachments },
        ],
        traceId,
        { signal: input.signal },
      )) {
        finalText += chunk;
        yield { type: "delta", text: chunk };
      }
      return { text: finalText, decision, laneResults, actions, traceId, direct: true };
    } catch (error) {
      yield { type: "error", message: userFacingError(classifyError(error)) };
      return { text: finalText, decision, laneResults, actions, traceId, direct: true };
    }
  }

  // ---- REPORT -------------------------------------------------------------
  const outputs = orchestration.completed.map((lane) => ({ label: lane.label, output: lane.output }));

  if (!decision.synthesize && outputs.length === 1) {
    finalText = outputs[0].output;
    for (const chunk of chunkText(finalText)) yield { type: "delta", text: chunk };
  } else {
    yield { type: "status", phase: "synthesizing", message: "Preparing final result" };
    try {
      for await (const chunk of primaryStream(
        [
          { role: "system", content: system },
          { role: "user", content: synthesisPrompt(input.message, outputs) },
        ],
        traceId,
        { signal: input.signal, maxTokens: 3_000 },
      )) {
        finalText += chunk;
        yield { type: "delta", text: chunk };
      }
    } catch (error) {
      telemetry.error(traceId, "synthesis failed, falling back to lane output", { code: classifyError(error) });
      yield { type: "notice", level: "info", message: "Wind switched to another path to finish the summary." };
      finalText = outputs.map((lane) => `**${lane.label}**\n\n${lane.output}`).join("\n\n---\n\n");
      for (const chunk of chunkText(finalText)) yield { type: "delta", text: chunk };
    }
  }

  // ---- APPROVAL -----------------------------------------------------------
  if (needsApproval(decision) && input.services?.requestApproval) {
    const actionLane = orchestration.completed.find((lane) => lane.label === "Action planning");
    const chosen = extractTool(actionLane?.output ?? "", input.availableTools ?? []);

    const draft: ApprovalDraft = {
      // A prepared action names itself: its first line says what it is far
      // better than the route summary ("Preparing an action") ever could.
      title: (chosen.tool ? firstLine(chosen.payload) : "") || decision.summary,
      summary: firstLine(finalText) || "Wind prepared an action that needs your decision.",
      payload: chosen.payload || finalText,
      risk: decision.complexity === "deep" ? "high" : "medium",
      toolId: chosen.tool?.id,
      integrationId: chosen.tool?.integrationId,
    };
    try {
      const approval = await input.services.requestApproval(draft);
      if (approval) {
        approvalId = approval.id;
        yield { type: "approval", approvalId: approval.id, title: draft.title, summary: draft.summary };
      }
    } catch (error) {
      telemetry.error(traceId, "approval creation failed", { code: classifyError(error) });
    }
  }

  return { text: finalText, decision, laneResults, actions, approvalId, traceId, direct: false };
}

/** Escalation path when the fast conversational layer itself fails. */
async function* recoverWithSpecialist(
  input: RuntimeInput,
  system: string,
  traceId: string,
  budget: ExecutionBudget,
): AsyncGenerator<WindEvent, string | null, unknown> {
  const { callWithFallback } = await import("./fallback");
  yield { type: "notice", level: "info", message: "Wind switched to another reasoning path to finish this step." };
  try {
    const result = await callWithFallback({
      preferredKey: "wind.reasoning",
      messages: [
        { role: "system", content: system },
        { role: "user", content: input.message, attachments: input.attachments },
      ],
      traceId,
      signal: input.signal,
      reserve: () => budget.tryReserveCall(),
    });
    for (const chunk of chunkText(result.text)) yield { type: "delta", text: chunk };
    return result.text;
  } catch {
    return null;
  }
}

function needsApproval(decision: RouteDecision): boolean {
  return decision.intent === "ACTION_REQUEST" || decision.lanes.some((lane) => lane.label === "Action planning");
}

function trimHistory(history: WindMessage[]): WindMessage[] {
  return history.slice(-LIMITS.maxHistoryTurns).map((message) => ({
    ...message,
    content: message.content.slice(0, LIMITS.maxMessageChars),
  }));
}

/** Replays non-streamed text in small pieces so the UI still animates. */
function* chunkText(text: string, size = 90): Generator<string> {
  for (let index = 0; index < text.length; index += size) yield text.slice(index, index + size);
}

/**
 * The action-planning lane is asked to name its tool on the first line. Take it
 * only when it matches a tool the workspace can actually reach, and strip the
 * line so the approver sees the action content and nothing else.
 */
function extractTool(
  output: string,
  available: AvailableTool[],
): { tool?: AvailableTool; payload: string } {
  const match = output.match(/^\s*TOOL:\s*([A-Za-z0-9_.-]+)\s*$/m);
  if (!match) return { payload: output.trim() };

  const payload = output.replace(match[0], "").trim();
  const tool = available.find((candidate) => candidate.id === match[1]);
  return { tool, payload };
}

function firstLine(text: string): string {
  const line = text.split("\n").find((candidate) => candidate.trim().length > 0) ?? "";
  return line.replace(/^#+\s*/, "").slice(0, 160);
}

/** Last line of defence: nothing user-facing escapes without sanitisation. */
function sanitizeEvent(event: WindEvent): WindEvent {
  switch (event.type) {
    case "status":
    case "notice":
    case "error":
      return { ...event, message: sanitizeForUser(event.message) };
    case "lane":
      return { ...event, note: event.note ? sanitizeForUser(event.note) : undefined };
    default:
      return event;
  }
}

function emptyDecision(): RouteDecision {
  return {
    intent: "GENERAL",
    complexity: "simple",
    lanes: [],
    synthesize: false,
    summary: "Answering directly",
    assisted: false,
    confidence: 0.5,
  };
}

export { WindError };
