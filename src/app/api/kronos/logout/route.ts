import { db, DbError } from "@/lib/kronos/db";
import { bearerAccount } from "@/lib/kronos/session";
import { jsonError } from "@/lib/kronos/view";

export const dynamic = "force-dynamic";

/** Signs the app out: its token stops working everywhere. */
export async function POST(request: Request) {
  try {
    const account = await bearerAccount(request);
    if (account?.token_id) await db.revokeToken(account.user_id, account.token_id);
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(503, "unavailable", e instanceof DbError ? e.message : "Kronos Cloud is unavailable.");
  }
}
