/**
 * Navio runtime — shared types.
 *
 * Everything in `lib/wind` is server-only. Nothing here should ever be
 * imported into a client component: it carries routing metadata that is
 * deliberately not part of the user-facing surface.
 */

/** Product-facing identity of a Navio capability. Users only ever see these. */
export type WindRole =
  | "wind"
  | "wind-code"
  | "wind-finance"
  | "wind-vision"
  | "wind-reasoning"
  | "wind-research"
  | "wind-data"
  | "wind-fast";

/** What a route needs from an engine. */
export type Capability =
  | "conversation"
  | "routing"
  | "code"
  | "finance"
  | "vision"
  | "long-context"
  | "deep-reasoning"
  | "extraction"
  | "research"
  | "synthesis";

export type Intent =
  | "GENERAL"
  | "CODING"
  | "FINANCE"
  | "VISION"
  | "DOCUMENT"
  | "RESEARCH"
  | "LONG_CONTEXT"
  | "DATA_EXTRACTION"
  | "COMPLEX_REASONING"
  | "MULTI_DOMAIN"
  | "ACTION_REQUEST"
  | "WORKFLOW_REQUEST";

export type Complexity = "trivial" | "simple" | "standard" | "deep";

export type AttachmentKind = "image" | "document" | "spreadsheet" | "code" | "data" | "other";

export interface Attachment {
  id: string;
  name: string;
  kind: AttachmentKind;
  mimeType: string;
  size: number;
  /** Base64 data URL, images only, used for vision routes. */
  dataUrl?: string;
  /** Extracted text for document-like attachments. */
  text?: string;
}

export interface WindMessage {
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[];
}

export interface RouteDecision {
  intent: Intent;
  complexity: Complexity;
  /** Ordered plan of specialist lanes to run. Empty means primary-only. */
  lanes: LanePlan[];
  /** Whether the primary engine should synthesise lane outputs. */
  synthesize: boolean;
  /** Non-sensitive rationale shown in the execution trace. */
  summary: string;
  /** True when the classifier LLM was consulted (vs. deterministic rules). */
  assisted: boolean;
  /** Confidence 0..1 of the routing decision. */
  confidence: number;
}

export interface LanePlan {
  id: string;
  /** Product-facing label, e.g. "Navio Code". */
  role: WindRole;
  /** What this lane is doing, safe to show. */
  label: string;
  /** Prompt fragment steering the specialist. */
  objective: string;
  capabilities: Capability[];
  /** Lane ids this lane depends on. Independent lanes run in parallel. */
  dependsOn: string[];
}

export type LaneStatus = "waiting" | "running" | "completed" | "failed" | "skipped";

export interface LaneResult {
  laneId: string;
  role: WindRole;
  label: string;
  status: LaneStatus;
  output: string;
  /** Product-facing note, e.g. "switched to another reasoning path". */
  note?: string;
  startedAt: number;
  finishedAt?: number;
  /** Internal diagnostics; never serialised to the browser. */
  diagnostics?: LaneDiagnostics;
}

export interface LaneDiagnostics {
  attempts: AttemptRecord[];
  totalMs: number;
}

export interface AttemptRecord {
  modelKey: string;
  ok: boolean;
  ms: number;
  errorCode?: string;
  /** Redacted error summary, server logs only. */
  errorDetail?: string;
}

/** Safe, user-visible execution events streamed to the browser. */
export type WindEvent =
  | { type: "status"; phase: WindPhase; message: string }
  | { type: "plan"; lanes: Array<{ id: string; label: string; role: WindRole; status: LaneStatus }> }
  | { type: "lane"; id: string; status: LaneStatus; label: string; role: WindRole; note?: string }
  | { type: "delta"; text: string }
  | { type: "approval"; approvalId: string; title: string; summary: string }
  | { type: "artifact"; id: string; title: string; kind: string }
  | {
      type: "action";
      id: string;
      integrationId: string;
      toolId: string;
      label: string;
      status: "running" | "completed" | "failed";
    }
  | { type: "notice"; level: "info" | "warn"; message: string }
  | { type: "done"; conversationId: string; messageId: string; taskId?: string }
  | { type: "error"; message: string };

export type WindPhase =
  | "receiving"
  | "thinking"
  | "planning"
  | "routing"
  | "retrieving"
  | "executing"
  | "synthesizing"
  | "finalizing";

export interface ChatCompletionRequest {
  modelKey: string;
  messages: WindMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  signal?: AbortSignal;
  /** Correlates every attempt of a single user request in telemetry. */
  traceId: string;
}

export interface ChatCompletionResult {
  text: string;
  modelKey: string;
  ms: number;
  truncated?: boolean;
}
