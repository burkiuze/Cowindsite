import { notFound } from "next/navigation";
import { WindChat, type ChatMessage } from "@/components/app/WindChat";
import { currentSession } from "@/lib/workspace/session";
import { messagesFor, store } from "@/lib/workspace/store";
import { isConfigured } from "@/lib/wind/adapters/endpoints";
import { SUGGESTIONS } from "../suggestions";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await currentSession();
  const conversation = store().conversations.find((candidate) => candidate.id === id);
  if (!conversation || conversation.userId !== session.user.id) notFound();

  const messages: ChatMessage[] = messagesFor(conversation.id).map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
    attachments: message.attachments,
    trace: message.trace?.map((step) => ({
      id: step.id,
      label: step.label,
      actor: step.actor,
      status: step.status,
      note: step.note,
    })),
    taskId: message.taskId,
    approvalId: message.approvalId,
  }));

  return (
    <WindChat
      conversationId={conversation.id}
      initialMessages={messages}
      userInitials={session.user.avatarInitials}
      windReady={isConfigured()}
      suggestions={SUGGESTIONS}
    />
  );
}
