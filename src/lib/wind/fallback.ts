import "server-only";
import { FALLBACK_CHAIN, engine } from "./models";
import { LIMITS } from "./config";
import { WindError, classifyError, type ErrorCode } from "./redaction";
import { telemetry } from "./telemetry";
import { complete } from "./adapters/transport";
import type { AttemptRecord, ChatCompletionResult, WindMessage } from "./types";

/**
 * Fallback execution.
 *
 * When the preferred engine errors, times out, is at capacity, blows its
 * context window or returns nothing usable, Navio walks a fallback chain rather
 * than surfacing a failure. The user sees at most a calm one-line note that
 * Navio took another path; the reason lives in server telemetry.
 */

export interface ResilientCall {
  preferredKey: string;
  messages: WindMessage[];
  traceId: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  /** Called when Navio moves to a different engine. Safe, user-facing copy. */
  onFallback?: (note: string) => void;
  /** Called before each attempt; returning false aborts (budget exhausted). */
  reserve?: () => boolean;
}

export interface ResilientResult extends ChatCompletionResult {
  attempts: AttemptRecord[];
  fellBack: boolean;
}

/** Errors that are worth retrying somewhere else. */
const RETRYABLE: ErrorCode[] = ["capacity", "unavailable", "timeout", "context", "invalid", "unknown"];

/** Copy shown when Navio changes route. Never names an engine. */
function fallbackNote(reason: ErrorCode): string {
  switch (reason) {
    case "context":
      return "Navio switched to a wider-context path to finish this step.";
    case "capacity":
      return "Navio switched to another path while capacity frees up.";
    case "timeout":
      return "Navio switched to a faster path after that step ran long.";
    default:
      return "Navio switched to another reasoning path to finish this step.";
  }
}

export function chainFor(preferredKey: string): string[] {
  const chain = FALLBACK_CHAIN[preferredKey] ?? [];
  // De-duplicate and drop anything unknown, keeping the preferred engine first.
  const ordered = [preferredKey, ...chain].filter((key, index, all) => all.indexOf(key) === index);
  return ordered.filter((key) => {
    try {
      engine(key);
      return true;
    } catch {
      return false;
    }
  });
}

export async function callWithFallback(call: ResilientCall): Promise<ResilientResult> {
  const chain = chainFor(call.preferredKey);
  const attempts: AttemptRecord[] = [];
  let lastError: unknown = new WindError("unavailable", "no engine attempted");

  for (const modelKey of chain.slice(0, LIMITS.maxAttemptsPerLane)) {
    if (call.signal?.aborted) throw new WindError("cancelled", "aborted by caller");
    if (call.reserve && !call.reserve()) throw new WindError("budget", "execution budget exhausted");

    const startedAt = Date.now();
    try {
      const result = await complete({
        modelKey,
        messages: call.messages,
        traceId: call.traceId,
        temperature: call.temperature,
        maxTokens: call.maxTokens,
        signal: call.signal,
      });

      const record: AttemptRecord = { modelKey, ok: true, ms: Date.now() - startedAt };
      attempts.push(record);
      telemetry.attempt(call.traceId, record);

      return { ...result, attempts, fellBack: attempts.length > 1 };
    } catch (error) {
      const code = classifyError(error);
      const record: AttemptRecord = {
        modelKey,
        ok: false,
        ms: Date.now() - startedAt,
        errorCode: code,
        errorDetail: error instanceof Error ? error.message.slice(0, 240) : String(error),
      };
      attempts.push(record);
      telemetry.attempt(call.traceId, record);
      lastError = error;

      if (code === "cancelled" || code === "budget") throw error;
      // An unconfigured credential will not resolve by trying a sibling engine
      // in the same pool, but the chain crosses pools, so keep walking.
      if (!RETRYABLE.includes(code) && code !== "unconfigured") break;

      const next = chain[chain.indexOf(modelKey) + 1];
      if (next) call.onFallback?.(fallbackNote(code));
    }
  }

  throw lastError instanceof WindError ? lastError : new WindError(classifyError(lastError), String(lastError));
}
