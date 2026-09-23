import type { Permission, Role } from "./rbac";

/** Core entities of the Navio workspace. */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  title?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: "starter" | "team" | "enterprise";
  createdAt: number;
  /** Departments are user-defined; nothing about them is hard-coded. */
  departments: Department[];
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  /** Knowledge scopes this department's agents may read. */
  knowledgeScopes: string[];
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  departmentIds: string[];
  joinedAt: number;
  status: "active" | "invited" | "suspended";
}

export interface Team {
  id: string;
  workspaceId: string;
  departmentId: string;
  name: string;
  memberIds: string[];
}

export interface Conversation {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

export interface StoredAttachment {
  id: string;
  name: string;
  kind: "image" | "document" | "spreadsheet" | "code" | "data" | "other";
  mimeType: string;
  size: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  attachments?: StoredAttachment[];
  /** Execution trace shown under an assistant message. Safe fields only. */
  trace?: TraceStep[];
  /** Read-only tool calls Navio made on connected services during the run. */
  actions?: MessageAction[];
  /** A month's figures, when the run produced one. */
  report?: FinanceReport;
  /** Set when this answer is the product of a Spark run rather than one pass. */
  sparkRunId?: string;
  taskId?: string;
  approvalId?: string;
}

/**
 * A Spark run.
 *
 * Normal mode answers in one pass while you watch. Spark takes the request
 * away and works it on the server: it reads what it is allowed to read, sets
 * its own quality bar for the result, drafts, reviews the draft against that
 * bar, revises what fell short, and repeats until every check passes or it runs
 * out of rounds — whichever comes first, and it says which. Leaving the page
 * does not stop it; the result lands in the conversation when it is ready.
 *
 * Spark polishes work, it does not widen what Navio may do: anything that
 * sends, pays, publishes or changes a record is still prepared and held for a
 * person, exactly as in normal mode.
 */
export interface SparkRun {
  id: string;
  workspaceId: string;
  conversationId: string;
  /** The assistant message this run fills in when it finishes. */
  messageId: string;
  taskId?: string;
  request: string;
  createdBy: string;
  status: "running" | "completed" | "stopped" | "failed";
  phase: SparkPhase;
  reads: Array<{ id: string; integrationId: string; label: string; status: "running" | "completed" | "failed" }>;
  /** The bar the result is held to, set by Navio before the first draft. */
  criteria: string[];
  rounds: SparkRound[];
  maxRounds: number;
  /** The latest draft, markers stripped: what a person would read right now. */
  draft?: string;
  /** Why the run stopped iterating: every check passed, or the round limit. */
  outcome?: "passed" | "limit";
  approvalId?: string;
  error?: string;
  stopRequested?: boolean;
  startedAt: number;
  finishedAt?: number;
}

export type SparkPhase = "reading" | "criteria" | "drafting" | "reviewing" | "revising" | "preparing" | "done";

export interface SparkRound {
  n: number;
  kind: "draft" | "revision";
  startedAt: number;
  finishedAt?: number;
  /** The review of this round's draft, one entry per criterion. */
  checks: SparkCheck[];
  passed?: boolean;
}

export interface SparkCheck {
  criterion: string;
  ok: boolean;
  /** What fell short, in one line. Present only when `ok` is false. */
  issue?: string;
}

/**
 * A month's figures, as Navio assembled them.
 *
 * Every line names where it came from, because a number in a finance report is
 * only worth as much as its provenance: a subscription total read from the
 * payment tool and an invoice read out of a mail thread are different kinds of
 * fact, and the report says which is which rather than blending them into one
 * confident figure.
 */
export interface FinanceReport {
  /** The month this report covers, e.g. "September 2026". */
  month: string;
  /** The month it is compared against. */
  previous: string;
  currency: string;
  revenue: FinanceLine[];
  expenses: FinanceLine[];
  /** Six months of totals, oldest first, for the trend. */
  history: FinanceMonth[];
  /** What Navio could not reach, said plainly rather than estimated. */
  missing?: string[];
}

export interface FinanceLine {
  label: string;
  /** Where the figure was read: an integration id, e.g. "stripe" or "gmail". */
  source: string;
  /** What the source called it — a thread subject, a product name. */
  detail?: string;
  amount: number;
  /** The same line last month, when there was one. */
  previousAmount?: number;
}

export interface FinanceMonth {
  label: string;
  revenue: number;
  expenses: number;
}

export interface MessageAction {
  id: string;
  integrationId: string;
  toolId: string;
  label: string;
  status: "running" | "completed" | "failed";
}

export interface TraceStep {
  id: string;
  label: string;
  /** Product role label, e.g. "Navio Code". Never an engine name. */
  actor: string;
  status: "waiting" | "running" | "completed" | "failed" | "skipped";
  note?: string;
  startedAt: number;
  finishedAt?: number;
}

export type TaskStatus = "queued" | "running" | "blocked" | "needs_approval" | "completed" | "failed" | "cancelled";

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  goal: string;
  status: TaskStatus;
  createdBy: string;
  agentId?: string;
  conversationId?: string;
  createdAt: number;
  updatedAt: number;
  steps: TaskStep[];
  /** Ids of artifacts produced by this task. */
  artifactIds: string[];
}

export interface TaskStep {
  id: string;
  title: string;
  detail?: string;
  actor: string;
  status: "waiting" | "running" | "completed" | "failed" | "skipped" | "needs_approval";
  startedAt?: number;
  finishedAt?: number;
  note?: string;
}

export interface Agent {
  id: string;
  workspaceId: string;
  departmentId: string;
  name: string;
  /** What this agent is for, in the operator's words. */
  purpose: string;
  /** Navio role this agent leans on. */
  role: string;
  /** Permissions granted to the agent — always intersected with the initiator. */
  grants: Permission[];
  /** Knowledge scopes the agent may read. */
  knowledgeScopes: string[];
  status: "active" | "paused" | "draft";
  createdAt: number;
  runsLast30Days: number;
  successRate: number;
}

export interface Workflow {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  status: "active" | "paused" | "draft";
  createdBy: string;
  createdAt: number;
  lastRunAt?: number;
}

export interface WorkflowTrigger {
  kind: "schedule" | "event" | "manual";
  /** Human description, e.g. "Every Monday 09:00" or "New pull request". */
  description: string;
  integrationId?: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  actor: string;
  toolId?: string;
  requiresApproval: boolean;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workspaceId: string;
  status: "running" | "completed" | "failed" | "needs_approval";
  startedAt: number;
  finishedAt?: number;
  stepStates: Array<{ stepId: string; status: TaskStep["status"]; note?: string }>;
}

export interface KnowledgeSource {
  id: string;
  workspaceId: string;
  title: string;
  kind: "document" | "note" | "policy" | "repository" | "dataset" | "link";
  /** Scope controls which agents and departments may read it. */
  scope: string;
  content: string;
  sizeBytes: number;
  updatedAt: number;
  uploadedBy: string;
  /** Departments allowed to read; empty means the whole workspace. */
  departmentIds: string[];
}

/**
 * Catalogue categories. The generated catalogue assigns one per service;
 * anything genuinely ambiguous stays "other" rather than being guessed into the
 * wrong shelf.
 */
export type IntegrationCategory =
  | "development"
  | "communication"
  | "productivity"
  | "crm"
  | "marketing"
  | "support"
  | "finance"
  | "commerce"
  | "data"
  | "ai"
  | "search"
  | "storage"
  | "hr"
  | "security"
  | "other";

export interface IntegrationDefinition {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  /** True when an adapter exists in this build. */
  implemented: boolean;
  /** Environment variables required to complete the connection. */
  requiredEnv: string[];
  docsPath?: string;
}

export interface IntegrationConnection {
  id: string;
  workspaceId: string;
  integrationId: string;
  status: "connected" | "available" | "not_configured" | "error";
  connectedBy?: string;
  connectedAt?: number;
  /** Account label, e.g. "navio/product". Never a credential. */
  accountLabel?: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "executed" | "failed";

export interface ApprovalStep {
  id: string;
  toolId: string;
  integrationId: string;
  /** Product-facing description, e.g. "Publish to the company page". */
  label: string;
  /** Exactly what this step will send, shown to the approver. */
  payload: string;
  status: "pending" | "running" | "completed" | "failed";
  receipt?: string;
}

export interface Approval {
  id: string;
  workspaceId: string;
  title: string;
  summary: string;
  /** Exactly what will happen, shown verbatim to the approver. */
  payload: string;
  toolId?: string;
  integrationId?: string;
  risk: "low" | "medium" | "high";
  status: ApprovalStatus;
  requestedBy: string;
  requestedByAgent?: string;
  createdAt: number;
  decidedAt?: number;
  decidedBy?: string;
  decisionNote?: string;
  conversationId?: string;
  taskId?: string;
  /** Receipt written after execution. */
  receipt?: string;
  /**
   * An action can be several calls — make the video, then publish it in three
   * places. One decision releases them all, and each carries its own receipt.
   */
  steps?: ApprovalStep[];
}

export interface Artifact {
  id: string;
  workspaceId: string;
  title: string;
  kind: "document" | "analysis" | "code" | "dataset" | "message";
  content: string;
  createdAt: number;
  createdBy: string;
  taskId?: string;
  conversationId?: string;
}

export type ActivityKind =
  | "task.started"
  | "task.completed"
  | "task.failed"
  | "knowledge.searched"
  | "knowledge.added"
  | "specialist.started"
  | "specialist.completed"
  | "approval.requested"
  | "approval.decided"
  | "action.executed"
  | "integration.connected"
  | "agent.created"
  | "flow.run"
  | "member.changed";

export interface ActivityEvent {
  id: string;
  workspaceId: string;
  kind: ActivityKind;
  /** Who or what acted — a member name or a Navio role label. */
  actor: string;
  summary: string;
  at: number;
  taskId?: string;
  conversationId?: string;
  approvalId?: string;
  meta?: Record<string, string | number | boolean>;
}
