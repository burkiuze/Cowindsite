import "server-only";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Tokens, one-time authorization codes and the operator session.
 *
 * - App tokens (`kro_…`) are random; only their SHA-256 is stored.
 * - Authorization codes are short-lived, HMAC-signed and bound to the PKCE
 *   challenge and the redirect address of the app that asked, so a code that
 *   leaks is useless without the verifier only that app holds.
 * - The operator session is an HMAC-signed expiry in an http-only cookie.
 */

function signingSecret(): string {
  const s = process.env.KRONOS_SIGNING_SECRET;
  if (!s || s.length < 32) throw new Error("KRONOS_SIGNING_SECRET is not set.");
  return s;
}

const b64url = (buf: Buffer) => buf.toString("base64url");

export function sha256Hex(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function newAppToken(): string {
  return `kro_${b64url(randomBytes(32))}`;
}

function sign(payload: string, purpose: string): string {
  return b64url(createHmac("sha256", signingSecret()).update(`${purpose}.${payload}`).digest());
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export interface AuthCode {
  uid: string;
  challenge: string;
  redirectUri: string;
  exp: number;
}

export function createAuthCode(uid: string, challenge: string, redirectUri: string, ttlSeconds = 300): string {
  const payload = b64url(Buffer.from(JSON.stringify({ uid, ch: challenge, ru: redirectUri, exp: Math.floor(Date.now() / 1000) + ttlSeconds, n: b64url(randomBytes(8)) })));
  return `${payload}.${sign(payload, "code")}`;
}

/** The code's content when its signature, expiry, redirect address and PKCE verifier all check out. */
export function verifyAuthCode(code: string, verifier: string, redirectUri: string): AuthCode | null {
  const [payload, sig] = code.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload, "code"))) return null;
  let data: { uid: string; ch: string; ru: string; exp: number };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!data.uid || data.exp < Math.floor(Date.now() / 1000) || data.ru !== redirectUri) return null;
  if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return null;
  if (!safeEqual(b64url(createHash("sha256").update(verifier).digest()), data.ch)) return null;
  return { uid: data.uid, challenge: data.ch, redirectUri: data.ru, exp: data.exp };
}

// --- operator --------------------------------------------------------------

export const ADMIN_COOKIE = "kronos_admin";
const ADMIN_TTL = 60 * 60 * 12;

/** Checks a password against KRONOS_ADMIN_PASSWORD_HASH ("scrypt$<salt>$<hash>", base64url). */
export function adminPasswordOk(password: string): boolean {
  const stored = process.env.KRONOS_ADMIN_PASSWORD_HASH ?? "";
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password, Buffer.from(salt, "base64url"), expected.length, { N: 16384, r: 8, p: 1 });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function adminSessionValue(): { value: string; maxAge: number } {
  const exp = String(Math.floor(Date.now() / 1000) + ADMIN_TTL);
  return { value: `${exp}.${sign(exp, "admin")}`, maxAge: ADMIN_TTL };
}

export function adminSessionOk(value: string | undefined): boolean {
  if (!value) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig) return false;
  try {
    if (!safeEqual(sig, sign(exp, "admin"))) return false;
  } catch {
    return false;
  }
  return Number(exp) > Math.floor(Date.now() / 1000);
}

/** Loopback addresses are the app on the user's own machine; anything else gets an explicit warning. */
export function isLoopbackRedirect(uri: string): boolean {
  try {
    const u = new URL(uri);
    return u.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(u.hostname);
  } catch {
    return false;
  }
}

export function validRedirect(uri: string): boolean {
  try {
    const u = new URL(uri);
    return (u.protocol === "http:" || u.protocol === "https:") && !u.username && !u.password && !u.hash;
  } catch {
    return false;
  }
}
