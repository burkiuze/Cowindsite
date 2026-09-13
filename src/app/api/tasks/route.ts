import { currentSession } from "@/lib/workspace/session";
import { store } from "@/lib/workspace/store";
import { handleRouteError, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await currentSession();
    const tasks = [...store().tasks].sort((a, b) => b.updatedAt - a.updatedAt);
    return ok({ tasks });
  } catch (error) {
    return handleRouteError(error);
  }
}
