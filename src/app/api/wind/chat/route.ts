import { z } from "zod";
import { runWind } from "@/lib/wind/runtime";
import { LIMITS } from "@/lib/wind/config";
import { isConfigured } from "@/lib/wind/adapters/endpoints";
import { userFacingError } from "@/lib/wind/redaction";
import { StreamSanitizer, sanitizeForUser } from "@/lib/wind/redaction";
import { ROLE_LABEL } from "@/lib/wind/models";
import type { WindEvent, WindRole, Attachment } from "@/lib/wind/types";
import { currentSession } from "@/lib/workspace/session";
import { retrieve } from "@/lib/workspace/knowledge";
import {
  appendMessage,
  createApproval,
  createConversation,
  createTask,
  logActivity,
  messagesFor,
  store,
  updateTask,
} from "@/lib/workspace/store";
import { FIRST_CLASS, allServices } from "@/lib/workspace/integrations";
import { TOOLS } from "@/lib/wind/tools/registry";
import { can } from "@/lib/workspace/rbac";
import { fail, handleRouteError, rateLimit, readJson, tooMany } from "@/lib/api";
import type { MessageAction, TaskStep, TraceStep } from "@/lib/workspace/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const attachmentSchema = z.object({
  id: z.string().max(64),
  name: z.string().max(240),
  kind: z.enum(["image", "document", "spreadsheet", "code", "data", "other"]),
  mimeType: z.string().max(160),
  size: z.number().int().nonnegative().max(LIMITS.maxUploadBytes),
  dataUrl: z.string().max(14_000_000).optional(),
  text: z.string().max(LIMITS.maxPromptChars).optional(),
});

const bodySchema = z.object({
  conversationId: z.string().max(64).optional(),
  message: z.string().min(1).max(LIMITS.maxMessageChars),
  attachments: z.array(attachmentSchema).max(LIMITS.maxAttachments).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await currentSession();

    if (!can(session.role, "agents:run")) {
      return fail(403, "Your role can read this workspace but cannot run Wind.");
    }

    // Refuse before anything is written: an unconfigured Wind should not leave
    // half a conversation behind.
    if (!isConfigured()) return fail(503, userFacingError("unconfigured"));

    const limit = rateLimit(`chat:${session.member.id}`);
    if (!limit.allowed) return tooMany(limit.retryAfter);

    const parsed = bodySchema.safeParse(await readJson(request));
    if (!parsed.success) return fail(400, "Wind could not read that request. Check the input and try again.");

    const { message, attachments = [] } = parsed.data;

    const conversation =
      store().conversations.find((candidate) => candidate.id === parsed.data.conversationId) ??
      createConversation(session.user.id, titleFrom(message));

    appendMessage({
      conversationId: conversation.id,
      role: "user",
      content: message,
      attachments: attachments.map(({ id, name, kind, mimeType, size }) => ({ id, name, kind, mimeType, size })),
    });

    const history = messagesFor(conversation.id)
      .slice(-LIMITS.maxHistoryTurns)
      .filter((entry) => entry.content.trim().length > 0)
      .map((entry) => ({ role: entry.role, content: entry.content }));
    // The current turn is passed separately.
    history.pop();

    const connectedIds = new Set(
      store()
        .connections.filter((connection) => connection.status === "connected")
        .map((connection) => connection.integrationId),
    );

    const connectedTools = FIRST_CLASS.filter((integration) => connectedIds.has(integration.id)).map(
      (integration) => integration.name,
    );

    // Wind may only choose a tool that is genuinely reachable from here.
    const availableTools = TOOLS.filter((tool) => connectedIds.has(tool.integrationId)).map((tool) => ({
      id: tool.id,
      name: tool.name,
      integrationId: tool.integrationId,
      effect: tool.effect,
    }));

    const encoder = new TextEncoder();
    const abort = new AbortController();
    request.signal.addEventListener("abort", () => abort.abort());

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: WindEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        let taskId: string | undefined;
        const trace: TraceStep[] = [];
        const actions: MessageAction[] = [];
        // The client renders a service's real mark, so resolve identity here
        // rather than making the browser look it up.
        const services = new Map(allServices().map((service) => [service.slug, service]));
        let answer = "";
        // Deltas are scrubbed on the way out, across chunk boundaries, so a
        // vendor name split over two frames still cannot reach the browser.
        const guard = new StreamSanitizer();

        try {
          const generator = runWind({
            message,
            attachments: attachments as Attachment[],
            history,
            signal: abort.signal,
            availableTools,
            prompt: {
              workspaceName: session.workspace.name,
              userName: session.user.name,
              userRole: session.user.title ?? session.role,
              connectedTools,
              today: new Date().toISOString().slice(0, 10),
            },
            services: {
              retrieveKnowledge: async (query) => {
                if (!can(session.role, "knowledge:read")) return null;
                const result = retrieve(query, { member: session.member });
                if (result.sources.length > 0) {
                  logActivity({
                    kind: "knowledge.searched",
                    actor: "Wind",
                    summary: `Searched workspace knowledge — ${result.sources.length} source${result.sources.length === 1 ? "" : "s"} matched`,
                    conversationId: conversation.id,
                  });
                }
                return result.sources.length > 0 ? { text: result.text, sources: result.sources } : null;
              },
              requestApproval: async (draft) => {
                const approval = createApproval({
                  workspaceId: session.workspace.id,
                  title: draft.title,
                  summary: draft.summary,
                  payload: draft.payload,
                  risk: draft.risk,
                  toolId: draft.toolId,
                  integrationId: draft.integrationId,
                  requestedBy: session.user.id,
                  requestedByAgent: "Wind",
                  conversationId: conversation.id,
                  taskId,
                });
                logActivity({
                  kind: "approval.requested",
                  actor: "Wind",
                  summary: `Approval requested: ${draft.title}`,
                  approvalId: approval.id,
                  conversationId: conversation.id,
                  taskId,
                });
                return { id: approval.id };
              },
            },
          });

          let result = await generator.next();
          while (!result.done) {
            const event = result.value;

            // A multi-lane plan becomes a real task the workspace can track.
            if (event.type === "plan" && event.lanes.length > 0) {
              const task = createTask({
                workspaceId: session.workspace.id,
                title: titleFrom(message),
                goal: message.slice(0, 500),
                status: "running",
                createdBy: session.user.id,
                conversationId: conversation.id,
                artifactIds: [],
                steps: event.lanes.map<TaskStep>((lane) => ({
                  id: lane.id,
                  title: lane.label,
                  actor: roleLabel(lane.role),
                  status: "waiting",
                })),
              });
              taskId = task.id;
              logActivity({
                kind: "task.started",
                actor: session.user.name,
                summary: `Started “${task.title}”`,
                taskId: task.id,
                conversationId: conversation.id,
              });
            }

            if (event.type === "lane") {
              const step: TraceStep = {
                id: event.id,
                label: event.label,
                actor: roleLabel(event.role),
                status: event.status,
                note: event.note,
                startedAt: Date.now(),
              };
              const existing = trace.find((candidate) => candidate.id === event.id);
              if (existing) Object.assign(existing, step, { startedAt: existing.startedAt, finishedAt: Date.now() });
              else trace.push(step);

              if (taskId) {
                const task = store().tasks.find((candidate) => candidate.id === taskId);
                const taskStep = task?.steps.find((candidate) => candidate.id === event.id);
                if (taskStep) {
                  taskStep.status = event.status === "waiting" ? "waiting" : event.status;
                  taskStep.note = event.note;
                  if (event.status === "running" && !taskStep.startedAt) taskStep.startedAt = Date.now();
                  if (event.status !== "running" && event.status !== "waiting") taskStep.finishedAt = Date.now();
                }
              }

              if (event.status === "running") {
                logActivity({
                  kind: "specialist.started",
                  actor: roleLabel(event.role),
                  summary: `${event.label} started`,
                  taskId,
                  conversationId: conversation.id,
                });
              } else if (event.status === "completed") {
                logActivity({
                  kind: "specialist.completed",
                  actor: roleLabel(event.role),
                  summary: `${event.label} completed`,
                  taskId,
                  conversationId: conversation.id,
                });
              }
            }

            if (event.type === "action") {
              actions.push({
                id: event.id,
                integrationId: event.integrationId,
                toolId: event.toolId,
                label: event.label,
                status: event.status,
              });

              const service = services.get(event.integrationId);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    ...event,
                    integrationName: service?.name ?? event.integrationId,
                    logo: service?.logo ?? null,
                    dark: service?.dark ?? false,
                  })}\n\n`,
                ),
              );

              logActivity({
                kind: "action.executed",
                actor: "Wind",
                summary: `${event.label} — ${service?.name ?? event.integrationId}`,
                taskId,
                conversationId: conversation.id,
              });

              result = await generator.next();
              continue;
            }

            if (event.type === "delta") {
              const safe = guard.push(event.text);
              if (safe) {
                answer += safe;
                send({ type: "delta", text: safe });
              }
              result = await generator.next();
              continue;
            }

            send(event);
            result = await generator.next();
          }

          const remainder = guard.flush();
          if (remainder) {
            answer += remainder;
            send({ type: "delta", text: remainder });
          }

          const output = result.value;
          if (!answer.trim() && output.text) answer = sanitizeForUser(output.text);

          const assistantMessage = answer.trim()
            ? appendMessage({
                conversationId: conversation.id,
                role: "assistant",
                content: sanitizeForUser(answer),
                trace: trace.length > 0 ? trace : undefined,
                actions: actions.length > 0 ? actions : undefined,
                taskId,
                approvalId: output.approvalId,
              })
            : undefined;

          if (taskId) {
            const status = output.approvalId ? "needs_approval" : "completed";
            updateTask(taskId, { status });
            logActivity({
              kind: status === "completed" ? "task.completed" : "task.started",
              actor: "Wind",
              summary:
                status === "completed"
                  ? `Completed “${titleFrom(message)}”`
                  : `Waiting on approval for “${titleFrom(message)}”`,
              taskId,
              conversationId: conversation.id,
            });
          }

          send({
            type: "done",
            conversationId: conversation.id,
            messageId: assistantMessage?.id ?? `msg_${Date.now().toString(36)}`,
            taskId,
          });
        } catch (error) {
          console.error("[cowind:wind]", error);
          send({ type: "error", message: "Temporary Wind service error. Nothing was changed — try again." });
          if (taskId) updateTask(taskId, { status: "failed" });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

function roleLabel(role: WindRole): string {
  return ROLE_LABEL[role] ?? "Wind";
}

function titleFrom(message: string): string {
  const firstLine = message.trim().split("\n")[0]?.trim() ?? "New conversation";
  const clipped = firstLine.length > 56 ? `${firstLine.slice(0, 53).trimEnd()}…` : firstLine;
  return clipped || "New conversation";
}
