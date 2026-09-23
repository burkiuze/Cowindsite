import { currentSession } from "@/lib/workspace/session";
import { sparkRun } from "@/lib/workspace/store";
import { fail, handleRouteError, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Ask a Spark run to stop.
 *
 * It stops at the next step boundary rather than mid-call, and keeps the latest
 * draft — stopping means "that is enough", not "throw it away".
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await currentSession();
    const run = sparkRun(id);
    if (!run || run.createdBy !== session.user.id) return fail(404, "That Spark run could not be found.");
    if (run.status === "running") run.stopRequested = true;
    return ok({ status: run.status, stopRequested: Boolean(run.stopRequested) });
  } catch (error) {
    return handleRouteError(error);
  }
}
