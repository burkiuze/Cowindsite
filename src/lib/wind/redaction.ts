/**
 * Outbound sanitiser.
 *
 * Navio presents a single assistant — Navio. Nothing about the private engine
 * layer (hosts, vendor names, raw engine identifiers, HTTP semantics) may reach
 * a browser, a chat bubble, an execution card or an error toast.
 *
 * Every string that leaves the server on the user-facing path runs through
 * `sanitizeForUser`. This module is intentionally dependency-free and pure so
 * it can be unit tested in isolation.
 */

/** Raw engine identifiers look like `vendor/model-name:tag`. */
const ENGINE_IDENTIFIER = /\b[a-z0-9][a-z0-9._-]{1,40}\/[a-z0-9][a-z0-9._:-]{1,60}\b/gi;

/** Any http(s) endpoint, plus bare API hostnames. */
const URL_LIKE = /\bhttps?:\/\/[^\s"'<>)\]]+/gi;
const API_HOST = /\b(?:api|inference|gateway|router|openrouter|chat)[a-z0-9.-]*\.[a-z]{2,}\b/gi;

/** Bearer tokens / API keys of common shapes. */
const SECRET_LIKE = /\b(?:sk|pk|rk|gsk|or)[-_][A-Za-z0-9_-]{12,}\b/g;
const BEARER = /\bBearer\s+[A-Za-z0-9._~+/-]{8,}=*/gi;

/** HTTP/transport vocabulary that reads as a provider leak in the product. */
const TRANSPORT_NOISE: Array<[RegExp, string]> = [
  [/\bHTTP\s?\d{3}\b/gi, "a service interruption"],
  [/\bstatus(?:\s?code)?\s?[:=]?\s?\d{3}\b/gi, "a service interruption"],
  [/\brate[\s-]?limit(?:ed|ing)?\b/gi, "capacity limit"],
  [/\bupstream\b/gi, "engine"],
  [/\bprovider(?:'s)?\b/gi, "engine"],
  [/\bAPI key\b/gi, "workspace credential"],
  [/\bendpoint\b/gi, "engine"],
  [/\btoken limit\b/gi, "context limit"],
];

/**
 * Vendor names that must never surface. Kept as fragments so inflections and
 * possessives are caught too.
 */
const VENDOR_FRAGMENTS = [
  "openrouter",
  "open router",
  "inclusionai",
  "inclusion ai",
  "thinkingmachines",
  "thinking machines",
  "nex-agi",
  "nex agi",
  "nexagi",
  "liquidai",
  "liquid ai",
  "lfm2",
  "gemma",
  "inkling",
  "ling-3",
  "ling 3",
  "nex-n2",
  "deepmind",
  "openai",
  "anthropic",
  "groq",
  "cerebras",
  "together ai",
  "fireworks ai",
  "mistral",
  "qwen",
  "llama",
];

const VENDOR_PATTERN = new RegExp(
  `\\b(?:${VENDOR_FRAGMENTS.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})[a-z0-9._-]*\\b`,
  "gi",
);

/**
 * Scrub a string for user-facing display.
 * Order matters: secrets and URLs first, then identifiers, then vocabulary.
 */
export function sanitizeForUser(input: string): string {
  if (!input) return "";
  return scrub(input).replace(/\s{3,}/g, "  ").trim();
}

/**
 * Scrub a fragment of a stream. Identical passes, but whitespace is preserved
 * so chunks still join back into the text the user is watching appear.
 */
export function sanitizeChunk(input: string): string {
  return input ? scrub(input) : "";
}

function scrub(input: string): string {
  let out = input;
  out = out.replace(BEARER, "[redacted]");
  out = out.replace(SECRET_LIKE, "[redacted]");
  out = out.replace(URL_LIKE, (match) => (isSafeUrl(match) ? match : "a private service"));
  out = out.replace(API_HOST, (match) => (isSafePath(match) ? match : "a private service"));
  out = out.replace(ENGINE_IDENTIFIER, (match) => (isSafePath(match) ? match : "a Navio specialist"));
  out = out.replace(VENDOR_PATTERN, "Navio");
  for (const [pattern, replacement] of TRANSPORT_NOISE) out = out.replace(pattern, replacement);
  return out;
}

/**
 * Streaming guard.
 *
 * A vendor name can straddle two chunks, so nothing is released until enough
 * following text has arrived for the patterns to match across the seam. The
 * guard holds a short tail back, cuts at a word boundary, and scrubs what it
 * releases. `flush` empties the remainder when the stream ends.
 */
export class StreamSanitizer {
  private pending = "";
  /** Long enough to cover the longest identifier the patterns look for. */
  constructor(private readonly tail = 64) {}

  push(chunk: string): string {
    this.pending += chunk;
    if (this.pending.length <= this.tail) return "";

    const limit = this.pending.length - this.tail;
    const boundary = this.pending.lastIndexOf(" ", limit);
    const cut = boundary > 0 ? boundary + 1 : limit;

    const head = this.pending.slice(0, cut);
    this.pending = this.pending.slice(cut);
    return sanitizeChunk(head);
  }

  flush(): string {
    const rest = this.pending;
    this.pending = "";
    return sanitizeChunk(rest);
  }
}

/** Navio's own links stay intact; everything external is scrubbed. */
function isSafeUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "localhost" ||
      hostname.endsWith("navio.ai") ||
      hostname.endsWith("navio.app") ||
      hostname === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

/**
 * `src/lib/wind` and `app/api/wind` look like engine identifiers to the regex.
 * Keep genuine file paths and common English slashes readable.
 */
const SAFE_PATH_PREFIXES = ["src/", "app/", "lib/", "public/", "tests/", "docs/", "and/", "he/", "she/"];
/** Suffixes that make a dotted token a file rather than a host. */
const CODE_SUFFIXES = [
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".py", ".go", ".rs", ".rb",
  ".java", ".css", ".scss", ".html", ".sql", ".yml", ".yaml", ".txt", ".sh", ".toml",
];
function isSafePath(value: string): boolean {
  const lower = value.toLowerCase();
  if (VENDOR_FRAGMENTS.some((fragment) => lower.includes(fragment))) return false;
  if (CODE_SUFFIXES.some((suffix) => lower.endsWith(suffix))) return true;
  return SAFE_PATH_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

/**
 * Map any failure to a calm, Navio-branded message. The caller logs the real
 * error server-side; the user sees only this.
 */
export function userFacingError(code: ErrorCode): string {
  switch (code) {
    case "timeout":
      return "Navio took too long on that step and stopped it safely. Try again, or narrow the request.";
    case "capacity":
      return "Navio is at capacity right now. Give it a moment and run this again.";
    case "context":
      return "That is larger than Navio can hold in one pass. Split it up, or point Navio at the key sections.";
    case "unavailable":
      return "A Navio service is temporarily unavailable. Navio saved your request — try again shortly.";
    case "unconfigured":
      return "Navio is not connected to its engines yet. Add the workspace credentials in Settings to enable it.";
    case "invalid":
      return "Navio could not read that request. Check the input and try again.";
    case "budget":
      return "This request reached Navio's execution budget. Narrow the scope or split it into smaller tasks.";
    case "cancelled":
      return "Navio stopped this run.";
    default:
      return "Temporary Navio service error. Nothing was changed — try again.";
  }
}

export type ErrorCode =
  | "timeout"
  | "capacity"
  | "context"
  | "unavailable"
  | "unconfigured"
  | "invalid"
  | "budget"
  | "cancelled"
  | "unknown";

/** Classify a thrown value into a Navio error code. Never returns raw text. */
export function classifyError(error: unknown): ErrorCode {
  if (error instanceof WindError) return error.code;
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lower = message.toLowerCase();
  if (lower.includes("abort") || lower.includes("timeout") || lower.includes("timed out")) return "timeout";
  if (lower.includes("429") || lower.includes("rate limit") || lower.includes("quota")) return "capacity";
  if (lower.includes("context") || lower.includes("too long") || lower.includes("maximum tokens")) return "context";
  if (lower.includes("401") || lower.includes("403") || lower.includes("credential") || lower.includes("api key"))
    return "unconfigured";
  if (lower.includes("400") || lower.includes("invalid") || lower.includes("malformed")) return "invalid";
  if (lower.includes("50") || lower.includes("unavailable") || lower.includes("fetch failed")) return "unavailable";
  return "unknown";
}

export class WindError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "WindError";
  }
}
