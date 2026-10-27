import { db, DbError, REDEEM_ERRORS } from "@/lib/kronos/db";
import { bearerAccount } from "@/lib/kronos/session";
import { accountView, jsonError } from "@/lib/kronos/view";

export const dynamic = "force-dynamic";

/** Redeems a promo code for the signed-in app's account. */
export async function POST(request: Request) {
  try {
    const account = await bearerAccount(request);
    if (!account) return jsonError(401, "unauthorized", "Sign in to Kronos again.");
    const body = (await request.json().catch(() => ({}))) as { code?: string };
    const code = (body.code ?? "").trim();
    if (!/^[A-Za-z0-9_-]{3,64}$/.test(code)) return jsonError(400, "invalid", REDEEM_ERRORS.invalid);
    const r = await db.redeem(account.user_id, code);
    if (r.error || !r.account) return jsonError(400, r.error ?? "invalid", REDEEM_ERRORS[r.error ?? "invalid"] ?? REDEEM_ERRORS.invalid);
    return Response.json({ ok: true, account: accountView(r.account) }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return jsonError(503, "unavailable", e instanceof DbError ? e.message : "Kronos Cloud is unavailable.");
  }
}
