import { currentSession } from "@/lib/workspace/session";
import { store } from "@/lib/workspace/store";
import { handleRouteError, ok } from "@/lib/api";
import { can } from "@/lib/workspace/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await currentSession();
    const approvals = [...store().approvals].sort((a, b) => b.createdAt - a.createdAt);
    return ok({ approvals, canDecide: can(session.role, "approvals:decide") });
  } catch (error) {
    return handleRouteError(error);
  }
}
