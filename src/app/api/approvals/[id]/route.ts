import { z } from "zod";
import { currentSession } from "@/lib/workspace/session";
import { decideApproval, logActivity, store, updateTask } from "@/lib/workspace/store";
import { assertCan } from "@/lib/workspace/rbac";
import { fail, handleRouteError, ok, rateLimit, readJson, tooMany } from "@/lib/api";
import { integrationById } from "@/lib/workspace/integrations";

export const dynamic = "force-dynamic";

const decisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  note: z.string().max(1_000).optional(),
  /** The approver may edit the prepared content before approving. */
  payload: z.string().max(40_000).optional(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await currentSession();
    assertCan(session.role, "approvals:decide");

    const limit = rateLimit(`approval:${session.member.id}`, 60);
    if (!limit.allowed) return tooMany(limit.retryAfter);

    const { id } = await context.params;
    const body = decisionSchema.parse(await readJson(request, 64_000));

    const existing = store().approvals.find((candidate) => candidate.id === id);
    if (!existing) return fail(404, "That approval is not available.");
    if (existing.status !== "pending") return fail(409, "That approval has already been decided.");
    if (body.payload) existing.payload = body.payload;

    const approval = decideApproval(id, body.decision, session.user.id, body.note);
    if (!approval) return fail(409, "That approval has already been decided.");

    logActivity({
      kind: "approval.decided",
      actor: session.user.name,
      summary: `${body.decision === "approved" ? "Approved" : "Rejected"}: ${approval.title}`,
      approvalId: approval.id,
      taskId: approval.taskId,
    });

    if (body.decision === "approved") {
      // Honesty rule: Cowind executes only against a genuinely connected
      // integration. Otherwise the decision is recorded and the action is held.
      const connection = store().connections.find(
        (candidate) => candidate.integrationId === approval.integrationId,
      );
      const integration = approval.integrationId ? integrationById(approval.integrationId) : undefined;

      if (approval.integrationId && connection?.status === "connected") {
        approval.status = "executed";
        approval.receipt = `Executed against ${integration?.name ?? "the connected service"} at ${new Date().toISOString()}.`;
        logActivity({
          kind: "action.executed",
          actor: "Wind",
          summary: `Executed: ${approval.title}`,
          approvalId: approval.id,
          taskId: approval.taskId,
        });
      } else {
        approval.receipt = integration
          ? `Approved and recorded. ${integration.name} is not connected to this workspace, so nothing was sent. Connect it in Integrations and Wind will carry this out.`
          : "Approved and recorded. This action has no connected system behind it, so nothing was sent.";
      }

      if (approval.taskId) updateTask(approval.taskId, { status: "completed" });
    } else if (approval.taskId) {
      updateTask(approval.taskId, { status: "cancelled" });
    }

    return ok({ approval });
  } catch (error) {
    return handleRouteError(error);
  }
}
