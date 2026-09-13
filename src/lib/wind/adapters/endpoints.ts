import "server-only";
import type { Pool } from "../models";

/**
 * PRIVATE SERVER-SIDE CONFIGURATION.
 *
 * This is the only module in the codebase that knows where Wind's engines are
 * physically served from. Nothing here is ever imported by a client component,
 * returned from an API route, or rendered. If you are looking for something to
 * show a user, you are in the wrong file.
 *
 * Both pools speak the same OpenAI-compatible chat-completions dialect, so a
 * single transport serves them. Point either pool somewhere else with
 * WIND_PRIMARY_BASE_URL / WIND_SPECIALIST_BASE_URL — no code change needed.
 */

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

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

  // If one pool is unconfigured, borrow the other credential rather than
  // failing the request outright. Operators may legitimately run a single key.
  const apiKey = pool === "primary" ? (primaryKey ?? specialistKey) : (specialistKey ?? primaryKey);
  const baseUrl =
    pool === "primary"
      ? (clean(process.env.WIND_PRIMARY_BASE_URL) ?? clean(process.env.WIND_SPECIALIST_BASE_URL) ?? DEFAULT_BASE_URL)
      : (clean(process.env.WIND_SPECIALIST_BASE_URL) ?? clean(process.env.WIND_PRIMARY_BASE_URL) ?? DEFAULT_BASE_URL);

  const referer = clean(process.env.NEXT_PUBLIC_NAVIO_URL ?? process.env.NEXT_PUBLIC_COWIND_URL) ?? "https://navio.app";

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
  return Boolean(clean(process.env.WIND_PRIMARY_API_KEY) ?? clean(process.env.WIND_SPECIALIST_API_KEY));
}

/** Per-pool readiness, for the operator health route only. */
export function configurationStatus() {
  return {
    primary: Boolean(clean(process.env.WIND_PRIMARY_API_KEY)),
    specialist: Boolean(clean(process.env.WIND_SPECIALIST_API_KEY)),
  };
}
