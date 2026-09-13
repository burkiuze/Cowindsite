import { currentSession } from "@/lib/workspace/session";
import { store } from "@/lib/workspace/store";
import { can } from "@/lib/workspace/rbac";
import { PageHeader } from "@/components/ui/primitives";
import { ApprovalList } from "./ApprovalList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Approvals" };

export default async function ApprovalsPage() {
  const session = await currentSession();
  const approvals = [...store().approvals].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto w-full max-w-4xl px-8 py-10">
      <PageHeader
        title="Approvals"
        description="Wind prepares the action and stops. You see exactly what would happen, change it if you want, and decide. Every decision leaves a receipt."
      />
      <ApprovalList approvals={approvals} canDecide={can(session.role, "approvals:decide")} />
    </div>
  );
}
