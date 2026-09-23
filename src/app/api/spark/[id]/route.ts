import { currentSession } from "@/lib/workspace/session";
import { sparkRun } from "@/lib/workspace/store";
import { allServices } from "@/lib/workspace/integrations";
import { sparkView } from "@/lib/workspace/spark-view";
import { fail, handleRouteError, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Where a Spark run is right now. Only the person who started it may look. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await currentSession();
    const run = sparkRun(id);
    if (!run || run.createdBy !== session.user.id) return fail(404, "That Spark run could not be found.");

    const services = new Map(allServices().map((service) => [service.slug, service]));
    return ok({ run: sparkView(run, services) });
  } catch (error) {
    return handleRouteError(error);
  }
}
