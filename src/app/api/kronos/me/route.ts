import { DbError } from "@/lib/kronos/db";
import { bearerAccount } from "@/lib/kronos/session";
import { accountView, jsonError, modelsView, plansView } from "@/lib/kronos/view";

export const dynamic = "force-dynamic";

/** The signed-in app's account: plan, usage against its limits, and the models it can use. */
export async function GET(request: Request) {
  try {
    const account = await bearerAccount(request);
    if (!account) return jsonError(401, "unauthorized", "Sign in to Kronos again.");
    return Response.json({ account: accountView(account), models: modelsView(), plans: plansView() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return jsonError(503, "unavailable", e instanceof DbError ? e.message : "Kronos Cloud is unavailable.");
  }
}
