import { currentSession } from "@/lib/workspace/session";
import { store } from "@/lib/workspace/store";
import { INTEGRATIONS } from "@/lib/workspace/integrations";
import { can } from "@/lib/workspace/rbac";
import { handleRouteError, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await currentSession();
    const connections = store().connections;
    return ok({
      integrations: INTEGRATIONS.map((integration) => ({
        ...integration,
        // Required environment variable *names* are safe to show an admin; the
        // values are never read on this path.
        status: connections.find((connection) => connection.integrationId === integration.id)?.status ?? "available",
      })),
      canConnect: can(session.role, "integrations:connect"),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
