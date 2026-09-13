import { WindChat } from "@/components/app/WindChat";
import { currentSession } from "@/lib/workspace/session";
import { isConfigured } from "@/lib/wind/adapters/endpoints";
import { SUGGESTIONS } from "./suggestions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Navio" };

export default async function NewChatPage() {
  const session = await currentSession();
  return (
    <WindChat
      initialMessages={[]}
      userInitials={session.user.avatarInitials}
      windReady={isConfigured()}
      suggestions={SUGGESTIONS}
    />
  );
}
