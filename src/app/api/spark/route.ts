import { after } from "next/server";
import { z } from "zod";
import { runSpark, SPARK_MAX_ROUNDS } from "@/lib/wind/spark";
import { LIMITS } from "@/lib/wind/config";
import { isConfigured } from "@/lib/wind/adapters/endpoints";
import { sanitizeForUser, userFacingError } from "@/lib/wind/redaction";
import { currentSession } from "@/lib/workspace/session";
import {
  appendMessage,
  createConversation,
  createSparkRun,
  createTask,
  logActivity,
  store,
  updateMessage,
  updateTask,
} from "@/lib/workspace/store";
import { approvalRequester, reachableTools, titleFrom } from "@/lib/workspace/run-context";
import { can } from "@/lib/workspace/rbac";
import { fail, handleRouteError, ok, rateLimit, readJson, tooMany } from "@/lib/api";
import type { SparkRun, TaskStep } from "@/lib/workspace/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The response returns at once; the run itself continues after it, inside this
// budget. See `budgetMs` in the Spark loop, which finishes well inside it.
export const maxDuration = 300;

const bodySchema = z.object({
  conversationId: z.string().max(64).optional(),
  message: z.string().min(1).max(LIMITS.maxMessageChars),
});

/**
 * Start a Spark run.
 *
 * Answers immediately with where the run lives, then keeps working after the
 * response has gone — the browser can close, navigate away or come back later.
 * Progress is read from `GET /api/spark/:id`; the finished result is written
 * into the conversation, into the run's task, and, when the request asked for
 * something to be sent or changed, into Approvals as a pending decision.
 */
export async function POST(request: Request) {
  try {
    const session = await currentSession();
    if (!can(session.role, "agents:run")) {
      return fail(403, "Your role can read this workspace but cannot run Navio.");
    }
    if (!isConfigured()) return fail(503, userFacingError("unconfigured"));

    // A Spark run is several passes' worth of work: rationed accordingly.
    const limit = rateLimit(`spark:${session.member.id}`, 4);
    if (!limit.allowed) return tooMany(limit.retryAfter);

    const parsed = bodySchema.safeParse(await readJson(request));
    if (!parsed.success) return fail(400, "Navio could not read that request. Check the input and try again.");
    const { message } = parsed.data;

    const conversation =
      store().conversations.find(
        (candidate) => candidate.id === parsed.data.conversationId && candidate.userId === session.user.id,
      ) ?? createConversation(session.user.id, titleFrom(message));

    const userMessage = appendMessage({ conversationId: conversation.id, role: "user", content: message });
    // The answer's place in the conversation exists from the start, so the run
    // shows up where it will land — and a reload finds it there mid-flight.
    const placeholder = appendMessage({ conversationId: conversation.id, role: "assistant", content: "" });

    const task = createTask({
      workspaceId: session.workspace.id,
      title: titleFrom(message),
      goal: message.slice(0, 500),
      status: "running",
      createdBy: session.user.id,
      conversationId: conversation.id,
      artifactIds: [],
      steps: [{ id: "spark_read", title: "Read connected tools", actor: "Navio Spark", status: "running", startedAt: Date.now() }],
    });

    const run = createSparkRun({
      workspaceId: session.workspace.id,
      conversationId: conversation.id,
      messageId: placeholder.id,
      taskId: task.id,
      request: message,
      createdBy: session.user.id,
      status: "running",
      phase: "reading",
      reads: [],
      criteria: [],
      rounds: [],
      maxRounds: SPARK_MAX_ROUNDS,
      startedAt: Date.now(),
    });
    updateMessage(placeholder.id, { sparkRunId: run.id, taskId: task.id });

    logActivity({
      kind: "task.started",
      actor: session.user.name,
      summary: `Started a Spark run: “${task.title}”`,
      taskId: task.id,
      conversationId: conversation.id,
    });

    const { connectedTools, availableTools } = reachableTools();

    after(async () => {
      await runSpark({
        run,
        availableTools,
        actor: session.user.name,
        prompt: {
          workspaceName: session.workspace.name,
          userName: session.user.name,
          userRole: session.user.title ?? session.role,
          connectedTools,
          today: new Date().toISOString().slice(0, 10),
        },
        services: {
          requestApproval: approvalRequester(session, {
            conversationId: conversation.id,
            taskId: () => task.id,
            agent: "Navio Spark",
          }),
          onChange: (current) => mirrorToTask(task.id, current),
        },
      });

      // The answer lands where the run said it would.
      const content =
        run.status === "failed" && !run.draft
          ? run.error ?? "Spark could not finish this run. Nothing was changed."
          : sanitizeForUser(run.draft ?? "");
      updateMessage(placeholder.id, { content, approvalId: run.approvalId });

      const status = run.status === "failed" ? "failed" : run.approvalId ? "needs_approval" : "completed";
      updateTask(task.id, { status });
      logActivity({
        kind: status === "failed" ? "task.failed" : status === "completed" ? "task.completed" : "task.started",
        actor: "Navio Spark",
        summary:
          run.status === "stopped"
            ? `Stopped “${task.title}” after ${run.rounds.length} round${run.rounds.length === 1 ? "" : "s"}`
            : status === "needs_approval"
              ? `Polished “${task.title}” in ${run.rounds.length} rounds — waiting on approval`
              : status === "completed"
                ? `Polished “${task.title}” in ${run.rounds.length} round${run.rounds.length === 1 ? "" : "s"}`
                : `Spark run failed: “${task.title}”`,
        taskId: task.id,
        conversationId: conversation.id,
      });
    });

    return ok({
      runId: run.id,
      conversationId: conversation.id,
      userMessageId: userMessage.id,
      messageId: placeholder.id,
      taskId: task.id,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** Keep the run's task in step with it, so Tasks shows Spark working too. */
function mirrorToTask(taskId: string, run: SparkRun) {
  const task = store().tasks.find((candidate) => candidate.id === taskId);
  if (!task) return;

  const steps: TaskStep[] = [
    {
      id: "spark_read",
      title: "Read connected tools",
      actor: "Navio Spark",
      status: run.phase === "reading" ? "running" : "completed",
    },
  ];
  if (run.phase !== "reading") {
    steps.push({
      id: "spark_bar",
      title: run.criteria.length > 0 ? `Set a ${run.criteria.length}-check quality bar` : "Set the quality bar",
      actor: "Navio Spark",
      status: run.phase === "criteria" ? "running" : "completed",
    });
  }
  for (const round of run.rounds) {
    const passed = round.checks.filter((check) => check.ok).length;
    steps.push({
      id: `spark_round_${round.n}`,
      title: `Round ${round.n} — ${round.kind === "draft" ? "draft" : "revision"}`,
      actor: "Navio Spark",
      status: round.finishedAt ? "completed" : run.status === "running" ? "running" : "skipped",
      note: round.finishedAt ? `${passed} of ${round.checks.length} checks passed` : undefined,
    });
  }
  if (run.phase === "preparing" || run.approvalId) {
    steps.push({
      id: "spark_action",
      title: "Prepare the action for approval",
      actor: "Navio Spark",
      status: run.approvalId ? "completed" : "running",
    });
  }
  task.steps = steps;
  task.updatedAt = Date.now();
}
