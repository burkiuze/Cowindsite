import "server-only";
import type {
  ActivityEvent,
  ActivityKind,
  Agent,
  Approval,
  Artifact,
  Conversation,
  IntegrationConnection,
  KnowledgeSource,
  Message,
  SparkRun,
  Task,
  Team,
  User,
  Workflow,
  WorkflowRun,
  Workspace,
  WorkspaceMember,
} from "./types";
import {
  SEED_ACTIVITY,
  SEED_AGENTS,
  SEED_APPROVALS,
  SEED_CONVERSATIONS,
  SEED_KNOWLEDGE,
  SEED_MEMBERS,
  SEED_MESSAGES,
  SEED_TASKS,
  SEED_TEAMS,
  SEED_USERS,
  SEED_WORKFLOWS,
  SEED_WORKSPACE,
} from "./seed";
import { INTEGRATIONS, resolveStatus } from "./integrations";

/**
 * Workspace store.
 *
 * A single in-process store with a narrow interface, seeded on first use. It is
 * deliberately the only module that holds state, so swapping it for Postgres,
 * Supabase or Mongo means implementing `WorkspaceStore` once — every route and
 * page above it is already storage-agnostic.
 *
 * State is held per server instance. For a multi-instance deployment, point
 * this at a shared database before relying on cross-request durability.
 */

export interface WorkspaceStore {
  workspace: Workspace;
  users: User[];
  members: WorkspaceMember[];
  teams: Team[];
  conversations: Conversation[];
  messages: Message[];
  tasks: Task[];
  agents: Agent[];
  workflows: Workflow[];
  workflowRuns: WorkflowRun[];
  knowledge: KnowledgeSource[];
  connections: IntegrationConnection[];
  approvals: Approval[];
  artifacts: Artifact[];
  activity: ActivityEvent[];
  sparkRuns: SparkRun[];
}

const DAY = 24 * 60 * 60 * 1000;

function seedArtifacts(): Artifact[] {
  const now = Date.now();
  return [
    {
      id: "art_board_pack",
      workspaceId: SEED_WORKSPACE.id,
      title: "Q3 board pack",
      kind: "document",
      createdAt: now - 150 * 60 * 1000,
      createdBy: "Navio",
      taskId: "tsk_board_pack",
      content: [
        "# Q3 board pack",
        "",
        "## Figures",
        "ARR 4.12M (+16.1% QoQ). NRR 114%. Gross margin 78.4%. Opex 1.46M, 61% payroll.",
        "Cash 6.9M, average net burn 385K, runway 17.9 months.",
        "",
        "## Product",
        "Shipped: approvals inbox v2, knowledge scoping. Slipping: SSO, two weeks behind plan.",
        "",
        "## Risks",
        "Concentration: 22% of ARR across three accounts, one in procurement review.",
        "Mitigation in flight: two Q4 renewals worth 410K are unrelated to those accounts.",
      ].join("\n"),
    },
    {
      id: "art_latency",
      workspaceId: SEED_WORKSPACE.id,
      title: "03:00 latency — cause and fix",
      kind: "analysis",
      createdAt: now - 2 * DAY + 24 * 60 * 1000,
      createdBy: "Navio",
      taskId: "tsk_latency",
      content: [
        "Cause: nightly compaction in the graph service holds one writer lock for the full pass.",
        "Reads queue behind it — p99 climbs while median holds flat.",
        "",
        "Recommended fix: chunk compaction per tenant and release the lock between chunks.",
        "Prerequisite: idempotent resume, so a failed chunk cannot leave a partial state.",
        "Stopgap: move the window to 04:30 with concurrency 1 — moves the spike, does not remove it.",
      ].join("\n"),
    },
  ];
}

function seedConnections(): IntegrationConnection[] {
  return INTEGRATIONS.map((definition) => ({
    id: `con_${definition.id}`,
    workspaceId: SEED_WORKSPACE.id,
    integrationId: definition.id,
    status: resolveStatus(definition),
  }));
}

function createStore(): WorkspaceStore {
  return {
    workspace: SEED_WORKSPACE,
    users: [...SEED_USERS],
    members: [...SEED_MEMBERS],
    teams: [...SEED_TEAMS],
    conversations: [...SEED_CONVERSATIONS],
    messages: [...SEED_MESSAGES],
    tasks: [...SEED_TASKS],
    agents: [...SEED_AGENTS],
    workflows: [...SEED_WORKFLOWS],
    workflowRuns: [],
    knowledge: [...SEED_KNOWLEDGE],
    connections: seedConnections(),
    approvals: [...SEED_APPROVALS],
    artifacts: seedArtifacts(),
    activity: [...SEED_ACTIVITY],
    sparkRuns: [],
  };
}

// Survives hot reload in development and module re-evaluation in serverless.
const globalRef = globalThis as unknown as { __navioStore?: WorkspaceStore };

export function store(): WorkspaceStore {
  if (!globalRef.__navioStore) globalRef.__navioStore = createStore();
  return globalRef.__navioStore;
}

/** Test seam: drop all state and reseed. */
export function resetStore(): WorkspaceStore {
  globalRef.__navioStore = createStore();
  return globalRef.__navioStore;
}

export function id(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// --- reads -----------------------------------------------------------------

export function getUser(userId: string): User | undefined {
  return store().users.find((user) => user.id === userId);
}

export function getMember(userId: string): WorkspaceMember | undefined {
  return store().members.find((member) => member.userId === userId);
}

export function userName(userId: string): string {
  return getUser(userId)?.name ?? "Someone";
}

export function conversationsFor(userId: string): Conversation[] {
  return store()
    .conversations.filter((conversation) => conversation.userId === userId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function messagesFor(conversationId: string): Message[] {
  return store()
    .messages.filter((message) => message.conversationId === conversationId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function pendingApprovals(): Approval[] {
  return store()
    .approvals.filter((approval) => approval.status === "pending")
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function recentActivity(limit = 40): ActivityEvent[] {
  return [...store().activity].sort((a, b) => b.at - a.at).slice(0, limit);
}

// --- writes ----------------------------------------------------------------

export function logActivity(event: {
  kind: ActivityKind;
  actor: string;
  summary: string;
  taskId?: string;
  conversationId?: string;
  approvalId?: string;
  meta?: Record<string, string | number | boolean>;
}): ActivityEvent {
  const entry: ActivityEvent = {
    id: id("act"),
    workspaceId: store().workspace.id,
    at: Date.now(),
    ...event,
  };
  store().activity.push(entry);
  // Bound the log in memory; a durable store would page instead.
  if (store().activity.length > 1_000) store().activity.splice(0, store().activity.length - 1_000);
  return entry;
}

export function createConversation(userId: string, title: string): Conversation {
  const conversation: Conversation = {
    id: id("cnv"),
    workspaceId: store().workspace.id,
    userId,
    title: title.slice(0, 80),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  store().conversations.push(conversation);
  return conversation;
}

export function appendMessage(message: Omit<Message, "id" | "createdAt"> & { id?: string; createdAt?: number }): Message {
  const entry: Message = {
    id: message.id ?? id("msg"),
    createdAt: message.createdAt ?? Date.now(),
    ...message,
  };
  store().messages.push(entry);
  const conversation = store().conversations.find((c) => c.id === message.conversationId);
  if (conversation) conversation.updatedAt = entry.createdAt;
  return entry;
}

/** Change a stored message in place — how a Spark run fills in its answer. */
export function updateMessage(messageId: string, patch: Partial<Omit<Message, "id" | "conversationId">>): Message | undefined {
  const message = store().messages.find((candidate) => candidate.id === messageId);
  if (!message) return undefined;
  Object.assign(message, patch);
  const conversation = store().conversations.find((c) => c.id === message.conversationId);
  if (conversation) conversation.updatedAt = Date.now();
  return message;
}

export function sparkRun(runId: string): SparkRun | undefined {
  return store().sparkRuns.find((run) => run.id === runId);
}

export function createSparkRun(run: Omit<SparkRun, "id">): SparkRun {
  const entry: SparkRun = { id: id("spk"), ...run };
  store().sparkRuns.push(entry);
  return entry;
}

export function createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
  const entry: Task = { id: id("tsk"), createdAt: Date.now(), updatedAt: Date.now(), ...task };
  store().tasks.push(entry);
  return entry;
}

export function updateTask(taskId: string, patch: Partial<Task>): Task | undefined {
  const task = store().tasks.find((candidate) => candidate.id === taskId);
  if (!task) return undefined;
  Object.assign(task, patch, { updatedAt: Date.now() });
  return task;
}

export function createApproval(approval: Omit<Approval, "id" | "createdAt" | "status"> & { status?: Approval["status"] }): Approval {
  const entry: Approval = {
    id: id("apr"),
    createdAt: Date.now(),
    status: approval.status ?? "pending",
    ...approval,
  };
  store().approvals.push(entry);
  return entry;
}

export function decideApproval(
  approvalId: string,
  decision: "approved" | "rejected",
  decidedBy: string,
  note?: string,
): Approval | undefined {
  const approval = store().approvals.find((candidate) => candidate.id === approvalId);
  if (!approval || approval.status !== "pending") return undefined;
  approval.status = decision;
  approval.decidedAt = Date.now();
  approval.decidedBy = decidedBy;
  approval.decisionNote = note;
  return approval;
}

export function createArtifact(artifact: Omit<Artifact, "id" | "createdAt">): Artifact {
  const entry: Artifact = { id: id("art"), createdAt: Date.now(), ...artifact };
  store().artifacts.push(entry);
  return entry;
}

export function addKnowledge(source: Omit<KnowledgeSource, "id" | "updatedAt">): KnowledgeSource {
  const entry: KnowledgeSource = { id: id("kb"), updatedAt: Date.now(), ...source };
  store().knowledge.push(entry);
  return entry;
}
