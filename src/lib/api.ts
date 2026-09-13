import "server-only";
import { NextResponse } from "next/server";
import { LIMITS } from "./wind/config";
import { AccessError } from "./workspace/rbac";
import { sanitizeForUser, userFacingError, WindError } from "./wind/redaction";

/**
 * API helpers.
 *
 * Every response that leaves Navio goes through here, so a stack trace, an
 * engine name or a transport detail cannot reach a browser by accident.
 */

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, { status: 200, ...init });
}

export function fail(status: number, message: string): NextResponse {
  return NextResponse.json({ error: sanitizeForUser(message) }, { status });
}

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof AccessError) {
    return fail(403, "You do not have permission to do that in this workspace.");
  }
  if (error instanceof WindError) {
    return fail(error.code === "unconfigured" ? 503 : 502, userFacingError(error.code));
  }
  if (error instanceof SyntaxError) {
    return fail(400, "That request could not be read.");
  }
  console.error("[navio:route]", error);
  return fail(500, "Something went wrong on Navio's side. Nothing was changed.");
}

// --- rate limiting ---------------------------------------------------------

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Token bucket, per key, refilling at the configured per-minute rate.
 * In-process by design: a multi-instance deployment should back this with the
 * same shared store as the workspace data.
 */
export function rateLimit(key: string, perMinute = LIMITS.rateLimitPerMinute): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: perMinute, updatedAt: now };
  const refill = ((now - bucket.updatedAt) / 60_000) * perMinute;
  bucket.tokens = Math.min(perMinute, bucket.tokens + refill);
  bucket.updatedAt = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    const retryAfter = Math.ceil(((1 - bucket.tokens) / perMinute) * 60);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { allowed: true, retryAfter: 0 };
}

export function tooMany(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: "You are sending requests faster than Wind can take them. Try again in a moment." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

/** Guard against oversized bodies before anything is parsed. */
export async function readJson<T>(request: Request, maxBytes = LIMITS.maxUploadBytes): Promise<T> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes) throw new WindError("invalid", "payload too large");
  const text = await request.text();
  if (text.length > maxBytes) throw new WindError("invalid", "payload too large");
  return JSON.parse(text) as T;
}
