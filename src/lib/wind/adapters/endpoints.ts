import "server-only";
import type { Pool } from "../models";

/**
 * PRIVATE SERVER-SIDE CONFIGURATION.
 *
 * This is the only module in the codebase that knows where Navio's engines are
 * physically served from. Nothing here is ever imported by a client component,
 * returned from an API route, or rendered. If you are looking for something to
 * show a user, you are in the wrong file.
 *
 * Both pools speak the same OpenAI-compatible chat-completions dialect, so a
 * single transport serves them. Point either pool somewhere else with
 * WIND_PRIMARY_BASE_URL / WIND_SPECIALIST_BASE_URL — no code change needed.
 */

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

/**
 * A second way to hold a credential.
 *
 * An operator may already have a key with a single upstream rather than a
 * gateway. When that key is present and no pool key is set, it serves both
 * pools at its own base URL. Everything downstream still speaks the same
 * OpenAI-compatible dialect, so nothing else in the codebase changes — and
 * nothing about it is ever surfaced.
 */
const DIRECT_KEY_ENV = "GROQ_API_KEY";
const DIRECT_BASE_URL = "https://api.groq.com/openai/v1";

function directKey(): string | undefined {
  return clean(process.env[DIRECT_KEY_ENV]);
}

/** True when the deployment is running on the direct credential. */
export function usingDirectPool(): boolean {
  return !clean(process.env.WIND_PRIMARY_API_KEY) && !clean(process.env.WIND_SPECIALIST_API_KEY) && Boolean(directKey());
}

export interface PoolConfig {
  baseUrl: string;
  apiKey: string | undefined;
  /** Extra headers required by the pool, if any. */
  headers: Record<string, string>;
}

function clean(value: string | undefined): string | undefined {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function poolConfig(pool: Pool): PoolConfig {
  const primaryKey = clean(process.env.WIND_PRIMARY_API_KEY);
  const specialistKey = clean(process.env.WIND_SPECIALIST_API_KEY);
  const direct = directKey();

  // If one pool is unconfigured, borrow the other credential rather than
  // failing the request outright. Operators may legitimately run a single key.
  const apiKey = pool === "primary" ? (primaryKey ?? specialistKey ?? direct) : (specialistKey ?? primaryKey ?? direct);
  const fallbackBase = usingDirectPool() ? DIRECT_BASE_URL : DEFAULT_BASE_URL;
  const baseUrl =
    pool === "primary"
      ? (clean(process.env.WIND_PRIMARY_BASE_URL) ?? clean(process.env.WIND_SPECIALIST_BASE_URL) ?? fallbackBase)
      : (clean(process.env.WIND_SPECIALIST_BASE_URL) ?? clean(process.env.WIND_PRIMARY_BASE_URL) ?? fallbackBase);

  const referer = clean(process.env.NEXT_PUBLIC_NAVIO_URL ?? process.env.NEXT_PUBLIC_COWIND_URL) ?? "https://www.heynavio.com";

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiKey,
    headers: {
      "HTTP-Referer": referer,
      "X-Title": "Navio",
    },
  };
}

/** True when at least one credential is present. Drives the setup banner. */
export function isConfigured(): boolean {
  return Boolean(clean(process.env.WIND_PRIMARY_API_KEY) ?? clean(process.env.WIND_SPECIALIST_API_KEY) ?? directKey());
}

/** Per-pool readiness, for the operator health route only. */
export function configurationStatus() {
  const direct = Boolean(directKey());
  return {
    primary: Boolean(clean(process.env.WIND_PRIMARY_API_KEY)) || direct,
    specialist: Boolean(clean(process.env.WIND_SPECIALIST_API_KEY)) || direct,
  };
}
