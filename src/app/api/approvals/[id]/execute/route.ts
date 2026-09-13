import { currentSession } from "@/lib/workspace/session";
import { logActivity, store, updateTask } from "@/lib/workspace/store";
import { assertCan } from "@/lib/workspace/rbac";
import { executeTool } from "@/lib/wind/tools/execute";
import { newTraceId } from "@/lib/wind/telemetry";
import { fail, handleRouteError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Run an approved action's steps, streaming each one.
 *
 * A decision releases the work; this is the work happening. Steps run in order
 * — publishing something that was not made yet is not a state worth allowing —
 * and each reports running, then its real receipt. A failure stops the rest:
 * the remaining steps stay pending rather than firing into a broken sequence.
 */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await currentSession();
    assertCan(session.role, "approvals:decide");

    const { id } = await context.params;
    const approval = store().approvals.find((candidate) => candidate.id === id);
    if (!approval) return fail(404, "That approval is not available.");
    if (approval.status !== "approved") return fail(409, "That action has not been approved.");

    const steps = approval.steps ?? [];
    if (steps.length === 0) return fail(409, "That approval has no steps to run.");

    const encoder = new TextEncoder();
    const traceId = newTraceId();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (data: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        let failed = false;
        for (const step of steps) {
          if (failed) {
            send({ type: "step", id: step.id, status: "pending" });
            continue;
          }

          step.status = "running";
          send({ type: "step", id: step.id, status: "running", label: step.label });

          const outcome = await executeTool({
            toolId: step.toolId,
            integrationId: step.integrationId,
            payload: step.payload,
            actor: session.user.name,
            traceId,
          });

          step.status = outcome.status === "executed" ? "completed" : "failed";
          step.receipt = outcome.receipt;
          failed = step.status === "failed";

          send({ type: "step", id: step.id, status: step.status, receipt: step.receipt });

          logActivity({
            kind: step.status === "completed" ? "action.executed" : "task.failed",
            actor: "Wind",
            summary: `${step.label} — ${step.status}`,
            approvalId: approval.id,
            taskId: approval.taskId,
          });
        }

        const completed = steps.filter((step) => step.status === "completed").length;
        approval.status = failed ? "failed" : "executed";
        approval.receipt = failed
          ? `${completed} of ${steps.length} steps completed. The rest were held back rather than run into a failure.`
          : `All ${steps.length} steps completed. Each carries its own receipt.`;

        if (approval.taskId) {
          updateTask(approval.taskId, { status: failed ? "failed" : "completed" });
        }

        send({ type: "done", status: approval.status, receipt: approval.receipt });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
