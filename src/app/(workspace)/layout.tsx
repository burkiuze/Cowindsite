import { Sidebar } from "@/components/app/Sidebar";
import { currentSession } from "@/lib/workspace/session";
import { conversationsFor, pendingApprovals, store } from "@/lib/workspace/store";
import { ROLE_LABEL } from "@/lib/workspace/rbac";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession();
  const conversations = conversationsFor(session.user.id);
  const running = store().tasks.filter((task) => task.status === "running").length;

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-void)]">
      <Sidebar
        workspaceName={session.workspace.name}
        workspacePlan={session.workspace.plan}
        userName={session.user.name}
        userInitials={session.user.avatarInitials}
        userTitle={session.user.title ?? ""}
        roleLabel={ROLE_LABEL[session.role]}
        pendingApprovals={pendingApprovals().length}
        runningTasks={running}
        conversations={conversations}
      />
      <main className="relative min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
