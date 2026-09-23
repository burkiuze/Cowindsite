import "server-only";
import { FIRST_CLASS } from "./integrations";
import { createApproval, logActivity, store } from "./store";
import { TOOLS } from "@/lib/wind/tools/registry";
import type { ApprovalDraft } from "@/lib/wind/runtime";
import type { AvailableTool } from "@/lib/wind/executor";
import type { Session } from "./session";

/**
 * What a run may reach, and how it asks for a decision.
 *
 * Shared by every way Navio runs — a normal turn and a Spark run — so the two
 * can never disagree about which tools are real or about how an action is held
 * for a person. A tool is reachable only when its integration is connected in
 * this workspace; everything else is not an option Navio may take.
 */
export function reachableTools(): { connectedTools: string[]; availableTools: AvailableTool[] } {
  const connectedIds = new Set(
    store()
      .connections.filter((connection) => connection.status === "connected")
      .map((connection) => connection.integrationId),
  );

  return {
    connectedTools: FIRST_CLASS.filter((integration) => connectedIds.has(integration.id)).map(
      (integration) => integration.name,
    ),
    availableTools: TOOLS.filter((tool) => connectedIds.has(tool.integrationId)).map((tool) => ({
      id: tool.id,
      name: tool.name,
      integrationId: tool.integrationId,
      effect: tool.effect,
    })),
  };
}

/** Turn a prepared action into a pending approval, with its activity entry. */
export function approvalRequester(
  session: Session,
  where: { conversationId: string; taskId?: () => string | undefined; agent?: string },
): (draft: ApprovalDraft) => Promise<{ id: string }> {
  return async (draft) => {
    const taskId = where.taskId?.();
    const approval = createApproval({
      workspaceId: session.workspace.id,
      title: draft.title,
      summary: draft.summary,
      payload: draft.payload,
      risk: draft.risk,
      toolId: draft.toolId,
      integrationId: draft.integrationId,
      steps: draft.steps?.map((step, index) => ({
        id: `step_${index + 1}`,
        toolId: step.toolId,
        integrationId: step.integrationId,
        label: step.label,
        payload: step.payload,
        status: "pending" as const,
      })),
      requestedBy: session.user.id,
      requestedByAgent: where.agent ?? "Navio",
      conversationId: where.conversationId,
      taskId,
    });
    logActivity({
      kind: "approval.requested",
      actor: where.agent ?? "Navio",
      summary: `Approval requested: ${draft.title}`,
      approvalId: approval.id,
      conversationId: where.conversationId,
      taskId,
    });
    return { id: approval.id };
  };
}

export function titleFrom(message: string): string {
  const firstLine = message.trim().split("\n")[0]?.trim() ?? "New conversation";
  const clipped = firstLine.length > 56 ? `${firstLine.slice(0, 53).trimEnd()}…` : firstLine;
  return clipped || "New conversation";
}
