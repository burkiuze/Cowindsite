import { currentSession } from "@/lib/workspace/session";
import { recentActivity } from "@/lib/workspace/store";
import { assertCan } from "@/lib/workspace/rbac";
import { handleRouteError, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await currentSession();
    assertCan(session.role, "audit:read");
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? 60);
    return ok({ events: recentActivity(Math.min(200, Math.max(1, limit))) });
  } catch (error) {
    return handleRouteError(error);
  }
}
