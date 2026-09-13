import { currentSession } from "@/lib/workspace/session";
import { messagesFor, store } from "@/lib/workspace/store";
import { fail, handleRouteError, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await currentSession();
    const { id } = await context.params;
    const conversation = store().conversations.find((candidate) => candidate.id === id);
    if (!conversation || conversation.userId !== session.user.id) return fail(404, "That conversation is not available.");
    return ok({ conversation, messages: messagesFor(conversation.id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await currentSession();
    const { id } = await context.params;
    const state = store();
    const index = state.conversations.findIndex(
      (candidate) => candidate.id === id && candidate.userId === session.user.id,
    );
    if (index === -1) return fail(404, "That conversation is not available.");
    state.conversations.splice(index, 1);
    state.messages = state.messages.filter((message) => message.conversationId !== id);
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
