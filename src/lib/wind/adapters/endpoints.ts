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

/**
 * Ask the upstream what it actually serves.
 *
 * An identifier that was correct last quarter can be retired without notice,
 * and a deployment should not go silent because of it. When a call comes back
 * saying the model does not exist, this asks the upstream for its catalogue
 * once and picks the most capable general-purpose entry, which is then reused
 * for the life of the process. The result is logged server-side and never
 * surfaces: a visitor sees an answer, not a model name.
 */
const discovered = new Map<Pool, string>();

/** Entries that are not general-purpose chat engines. */
const NOT_CHAT = [
  "whisper", "tts", "embed", "guard", "moderation", "rerank", "transcribe", "ocr", "vision-only",
  // Agentic systems and search products: they answer in their own shape, not as
  // a plain assistant, and they are not what a page of copy needs.
  "compound", "browser", "search",
];

/**
 * Reasoning-first engines spend their budget thinking before they write, so a
 * short answer can come back empty — and their thinking is not something Navio
 * would ever show. When the pool offers a plain instruction-following engine,
 * that is the one to take.
 */
const REASONING = ["gpt-oss", "reason", "think", "qwq", "-r1", "deepseek-r"];

/** Families that follow an instruction well enough to speak for a product. */
const CAPABLE = ["llama", "qwen", "mistral", "mixtral", "gemma", "kimi", "command", "phi"];

/**
 * Size, read out of the identifier.
 *
 * Names change every few months and a keyword list ages badly — this one aged
 * in a week and picked a 7B model trained for another language. Parameter count
 * is the part of the name that has stayed legible for years: take the largest
 * one in the string, and let that carry the ranking.
 */
function billions(id: string): number {
  const matches = [...id.matchAll(/(\d+(?:\.\d+)?)\s*b\b/gi)].map((match) => Number(match[1]));
  return matches.length > 0 ? Math.max(...matches) : 0;
}

function rank(id: string): number {
  const lower = id.toLowerCase();
  if (NOT_CHAT.some((fragment) => lower.includes(fragment))) return -1;

  // A known family that follows instructions is the floor; size decides between
  // them, capped so a very large model cannot outweigh being the wrong tool.
  let score = CAPABLE.some((family) => lower.includes(family)) ? 6 : 0;
  score += Math.min(billions(lower), 140) / 20;
  if (lower.includes("instruct") || lower.includes("chat") || lower.includes("versatile")) score += 2;
  if (lower.includes("preview") || lower.includes("deprecated") || lower.includes("experimental")) score -= 2;
  if (REASONING.some((fragment) => lower.includes(fragment))) score -= 5;
  return score;
}

export async function discoverIdentifier(pool: Pool): Promise<string | undefined> {
  const cached = discovered.get(pool);
  if (cached) return cached;

  const config = poolConfig(pool);
  if (!config.apiKey) return undefined;

  try {
    const response = await fetch(`${config.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${config.apiKey}`, ...config.headers },
      cache: "no-store",
    });
    if (!response.ok) return undefined;

    const json = (await response.json()) as { data?: Array<{ id?: string; active?: boolean }> };
    const ranked = (json.data ?? [])
      .filter((entry) => typeof entry.id === "string" && entry.active !== false)
      .map((entry) => ({ id: entry.id as string, score: rank(entry.id as string) }))
      .sort((a, b) => b.score - a.score);

    // The catalogue, once, to the server log: an operator who wants a specific
    // engine can then pin it with WIND_MODEL_* instead of trusting a heuristic.
    console.error(
      `[wind:pool] ${pool} serves`,
      ranked.map((entry) => `${entry.id}:${entry.score.toFixed(1)}`).join(" "),
    );

    const best = ranked.find((entry) => entry.score >= 0);
    if (!best) return undefined;
    discovered.set(pool, best.id);
    return best.id;
  } catch {
    return undefined;
  }
}
