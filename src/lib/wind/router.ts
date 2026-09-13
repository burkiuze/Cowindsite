import "server-only";
import { classifierPrompt, heuristicClassify, parseClassifierJson, type HeuristicResult } from "./classifier";
import { primaryComplete } from "./adapters/primary";
import { ENGINES, ROLE_LABEL } from "./models";
import { telemetry } from "./telemetry";
import type { Attachment, Complexity, Intent, LanePlan, RouteDecision, WindMessage, WindRole } from "./types";

/**
 * The Wind router.
 *
 * Decides — for every single user turn — whether Wind answers directly or
 * whether specialists are needed, which ones, and whether they can run in
 * parallel. It combines deterministic signal (cheap, instant, predictable) with
 * a single lightweight classification call (only when the deterministic layer
 * is unsure), then maps the result onto an execution plan.
 *
 * Design rule: a specialist is a cost. The router must be willing to answer
 * "Selam" with nothing but the primary engine.
 */

const ASSIST_THRESHOLD = 0.72;

/** Below this complexity, a domain intent still answers on the primary engine. */
const DIRECT_ANSWER_INTENTS: Intent[] = ["GENERAL"];

export interface RouteInput {
  message: string;
  attachments: Attachment[];
  history: WindMessage[];
  traceId: string;
  /** Skip the assisted pass (used by tests and by budget-constrained reruns). */
  deterministicOnly?: boolean;
  signal?: AbortSignal;
}

export async function route(input: RouteInput): Promise<RouteDecision> {
  const heuristic = heuristicClassify(input.message, input.attachments, input.history);
  let intent = heuristic.intent;
  let complexity = heuristic.complexity;
  let confidence = heuristic.confidence;
  let assisted = false;
  let summary = describe(intent, complexity);
  let needsAction = intent === "ACTION_REQUEST";

  const shouldAssist =
    !input.deterministicOnly &&
    heuristic.confidence < ASSIST_THRESHOLD &&
    input.message.trim().length > 12;

  if (shouldAssist) {
    const assistedResult = await assistedClassify(input, heuristic);
    if (assistedResult) {
      assisted = true;
      intent = assistedResult.intent ?? intent;
      complexity = assistedResult.complexity ?? complexity;
      needsAction = assistedResult.needs_action ?? needsAction;
      summary = assistedResult.summary ?? summary;
      confidence = Math.max(confidence, 0.8);
    }
  }

  const lanes = planLanes({ intent, complexity, heuristic, attachments: input.attachments, needsAction });

  const decision: RouteDecision = {
    intent,
    complexity,
    lanes,
    synthesize: lanes.length > 1 || (lanes.length === 1 && complexity === "deep"),
    summary,
    assisted,
    confidence,
  };

  telemetry.route(input.traceId, `intent=${intent} complexity=${complexity} lanes=${lanes.length}`, {
    assisted,
    confidence: Number(confidence.toFixed(2)),
    signals: heuristic.signals,
    lanes: lanes.map((lane) => ({ id: lane.id, engine: lane.role })),
  });

  return decision;
}

async function assistedClassify(input: RouteInput, heuristic: HeuristicResult) {
  const attachmentSummary = input.attachments.map((a) => `${a.kind}:${a.name}`).join(", ");
  try {
    const result = await primaryComplete(
      [
        { role: "system", content: "You classify work requests. Output JSON only." },
        { role: "user", content: classifierPrompt(input.message, attachmentSummary) },
      ],
      input.traceId,
      { temperature: 0, maxTokens: 220, timeoutMs: 12_000, signal: input.signal },
    );
    return parseClassifierJson(result.text);
  } catch {
    // Classification is best-effort: the deterministic result already stands.
    telemetry.route(input.traceId, "assisted classification unavailable, using deterministic result", {
      intent: heuristic.intent,
    });
    return null;
  }
}

interface PlanInput {
  intent: Intent;
  complexity: Complexity;
  heuristic: HeuristicResult;
  attachments: Attachment[];
  needsAction: boolean;
}

/**
 * Maps an intent + complexity onto concrete specialist lanes.
 * Returning an empty array means "Wind answers this itself".
 */
export function planLanes({ intent, complexity, heuristic, attachments, needsAction }: PlanInput): LanePlan[] {
  const hasImage = attachments.some((a) => a.kind === "image");
  const lanes: LanePlan[] = [];

  const add = (role: WindRole, label: string, objective: string, dependsOn: string[] = []) => {
    const id = `lane_${lanes.length + 1}`;
    lanes.push({
      id,
      role,
      label,
      objective,
      capabilities: ENGINES[roleEngineKey(role)].capabilities,
      dependsOn,
    });
    return id;
  };

  // Vision is decided by the payload, not by the wording of the request.
  if (hasImage) {
    add("wind-vision", "Visual analysis", "Describe precisely what the attached visuals show and what matters about them.");
  }

  if (DIRECT_ANSWER_INTENTS.includes(intent) && complexity !== "deep" && lanes.length === 0) {
    return [];
  }

  switch (intent) {
    case "CODING":
      add("wind-code", "Engineering analysis", "Analyse the code or system described and produce concrete, correct technical guidance.");
      if (complexity === "deep") {
        add("wind-reasoning", "Risk and trade-offs", "Assess architectural risk, trade-offs and second-order consequences of the proposed technical direction.");
      }
      break;

    case "FINANCE":
      add("wind-finance", "Financial analysis", "Analyse the financial material with explicit figures, drivers and caveats.");
      if (complexity === "deep") {
        add("wind-reasoning", "Strategic read", "Interpret what the financial picture means for strategy and risk.");
      }
      break;

    case "VISION":
      if (!hasImage) add("wind-vision", "Visual analysis", "Interpret the visual material referenced by the user.");
      break;

    case "DOCUMENT":
      add("wind-reasoning", "Document analysis", "Read the attached material closely and answer against what it actually says.");
      if (complexity !== "trivial") {
        add("wind-data", "Key facts", "Extract the concrete facts, figures, dates and named entities from the material.");
      }
      break;

    case "DATA_EXTRACTION":
      add("wind-data", "Data extraction", "Extract exactly what was asked for. Return structured output. Invent nothing.");
      break;

    case "LONG_CONTEXT":
      add("wind-reasoning", "Long-context analysis", "Work across the entire body of material and report findings with references to where they appear.");
      add("wind-data", "Fact pass", "Pull the concrete details that support or contradict the main findings.");
      break;

    case "RESEARCH":
      add("wind-research", "Research pass", "Lay out what is known, what is uncertain, and what would settle the question.");
      if (complexity === "deep") {
        add("wind-reasoning", "Comparative analysis", "Compare the options on the dimensions that actually decide the outcome.");
      }
      break;

    case "COMPLEX_REASONING":
      add("wind-reasoning", "Deep analysis", "Reason carefully through the problem and give a defensible conclusion.");
      break;

    case "MULTI_DOMAIN": {
      // Parallel lanes, one per domain the request actually touches.
      const s = heuristic.scores;
      if (s.CODING >= 3) add("wind-code", "Technical review", "Assess the technical and engineering dimension of the request.");
      if (s.FINANCE >= 3) add("wind-finance", "Financial review", "Assess the financial dimension with figures where available.");
      if (s.RESEARCH >= 3) add("wind-research", "Market view", "Assess the market and competitive dimension.");
      if (s.DATA_EXTRACTION >= 3) add("wind-data", "Data pass", "Extract the supporting data points.");
      add("wind-reasoning", "Risk assessment", "Identify the risks, dependencies and open questions across the whole picture.");
      break;
    }

    case "ACTION_REQUEST": {
      // "Set up the meeting, review the sponsorship agreements and check
      // tomorrow" is three pieces of work, not one. Run the domain passes that
      // the request actually carries, then plan the action on top of what they
      // found — the action lane depends on them, everything else is parallel.
      const s = heuristic.scores;
      const groundwork: string[] = [];
      if (s.FINANCE >= 3) groundwork.push(add("wind-finance", "Financial review", "Assess the financial material this action depends on, with figures where available."));
      if (s.CODING >= 3) groundwork.push(add("wind-code", "Technical review", "Assess the technical material this action depends on."));
      if (s.RESEARCH >= 3) groundwork.push(add("wind-research", "Background", "Establish the context this action depends on, separating fact from inference."));
      if (s.DATA_EXTRACTION >= 3 || s.DOCUMENT >= 3) groundwork.push(add("wind-data", "Details", "Pull the concrete details the action needs: dates, names, figures, references."));

      add(
        "wind-reasoning",
        "Action planning",
        "Draft the exact action to take, its content, and what could go wrong if it is wrong.",
        groundwork,
      );
      break;
    }

    case "WORKFLOW_REQUEST":
      add("wind-reasoning", "Flow design", "Design the repeatable steps, their triggers, inputs and approval points.");
      break;

    case "GENERAL":
    default:
      if (complexity === "deep") {
        add("wind-reasoning", "Deep analysis", "Work the problem carefully and answer with a clear position.");
      }
      break;
  }

  if (needsAction && !lanes.some((lane) => lane.label === "Action planning") && intent !== "ACTION_REQUEST") {
    add("wind-reasoning", "Action planning", "Draft the action that the user is asking Wind to carry out.");
  }

  return lanes;
}

function roleEngineKey(role: WindRole): string {
  switch (role) {
    case "wind-code":
      return "wind.code";
    case "wind-finance":
      return "wind.finance";
    case "wind-vision":
      return "wind.vision";
    case "wind-reasoning":
    case "wind-research":
      return "wind.reasoning";
    case "wind-data":
    case "wind-fast":
      return "wind.data";
    default:
      return "wind.core";
  }
}

function describe(intent: Intent, complexity: Complexity): string {
  const base: Record<Intent, string> = {
    GENERAL: "Answering directly",
    CODING: "Engineering work",
    FINANCE: "Financial analysis",
    VISION: "Visual analysis",
    DOCUMENT: "Document analysis",
    RESEARCH: "Research",
    LONG_CONTEXT: "Long-context analysis",
    DATA_EXTRACTION: "Data extraction",
    COMPLEX_REASONING: "Deep analysis",
    MULTI_DOMAIN: "Cross-domain review",
    ACTION_REQUEST: "Preparing an action",
    WORKFLOW_REQUEST: "Designing a flow",
  };
  return complexity === "deep" ? `${base[intent]} — multi-step` : base[intent];
}

/** Public label for the trace UI. */
export function laneLabel(role: WindRole): string {
  return ROLE_LABEL[role];
}
