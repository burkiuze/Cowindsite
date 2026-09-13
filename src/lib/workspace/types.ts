import type { Permission, Role } from "./rbac";

/** Core entities of the Cowind workspace. */

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
  taskId?: string;
  approvalId?: string;
}

export interface TraceStep {
  id: string;
  label: string;
  /** Product role label, e.g. "Wind Code". Never an engine name. */
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
  /** Wind role this agent leans on. */
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

export type IntegrationCategory =
  | "development"
  | "communication"
  | "productivity"
  | "storage"
  | "crm"
  | "commerce"
  | "data";

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
  /** Account label, e.g. "cowind/product". Never a credential. */
  accountLabel?: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "executed" | "failed";

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
  /** Who or what acted — a member name or a Wind role label. */
  actor: string;
  summary: string;
  at: number;
  taskId?: string;
  conversationId?: string;
  approvalId?: string;
  meta?: Record<string, string | number | boolean>;
}
