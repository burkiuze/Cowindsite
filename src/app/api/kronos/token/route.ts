import { db, DbError } from "@/lib/kronos/db";
import { newAppToken, sha256Hex, verifyAuthCode } from "@/lib/kronos/crypto";
import { accountView, jsonError, modelsView } from "@/lib/kronos/view";

export const dynamic = "force-dynamic";

/**
 * Step two of connecting the app: it trades the one-time code from the
 * browser, plus the PKCE verifier only it knows, for a long-lived app token.
 */
export async function POST(request: Request) {
  let body: { code?: string; code_verifier?: string; redirect_uri?: string; label?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "bad_request", "Expected a JSON body.");
  }
  if (!body.code || !body.code_verifier || !body.redirect_uri) return jsonError(400, "bad_request", "code, code_verifier and redirect_uri are required.");
  const code = verifyAuthCode(body.code, body.code_verifier, body.redirect_uri);
  if (!code) return jsonError(400, "invalid_grant", "This sign-in link has expired or does not match. Start the sign-in again from Kronos.");
  try {
    const token = newAppToken();
    await db.issueToken(code.uid, sha256Hex(token), (body.label || "Kronos").slice(0, 120));
    const account = await db.account(code.uid);
    if (!account) return jsonError(400, "invalid_grant", "The account was not found.");
    return Response.json({ token, account: accountView(account), models: modelsView() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return jsonError(503, "unavailable", e instanceof DbError ? e.message : "Kronos Cloud is unavailable.");
  }
}
