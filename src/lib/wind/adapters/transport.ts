import "server-only";
import { engine } from "../models";
import { LIMITS } from "../config";
import { WindError, classifyError } from "../redaction";
import { telemetry } from "../telemetry";
import type { ChatCompletionResult, WindMessage } from "../types";
import { poolConfig, discoverIdentifier } from "./endpoints";

/**
 * The single transport used by every Navio adapter. Chat-completions dialect,
 * streaming and non-streaming. All failures are converted to `WindError` with a
 * Navio error code; raw response bodies stay in server telemetry.
 */

interface TextPart {
  type: "text";
  text: string;
}
interface ImagePart {
  type: "image_url";
  image_url: { url: string };
}
type ContentPart = TextPart | ImagePart;

interface WirePayload {
  model: string;
  messages: Array<{ role: string; content: string | ContentPart[] }>;
  temperature: number;
  max_tokens: number;
  stream: boolean;
}

function toWireMessages(messages: WindMessage[], allowImages: boolean) {
  return messages.map((message) => {
    const images = allowImages
      ? (message.attachments ?? []).filter((a) => a.kind === "image" && a.dataUrl).slice(0, LIMITS.maxAttachments)
      : [];

    const extractedText = (message.attachments ?? [])
      .filter((a) => a.text && a.text.trim().length > 0)
      .map((a) => `\n\n--- Attached file: ${a.name} ---\n${a.text}`)
      .join("");

    const text = `${message.content}${extractedText}`.slice(0, LIMITS.maxPromptChars);

    if (images.length === 0) {
      return { role: message.role, content: text };
    }

    const parts: ContentPart[] = [{ type: "text", text }];
    for (const image of images) parts.push({ type: "image_url", image_url: { url: image.dataUrl! } });
    return { role: message.role, content: parts };
  });
}

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const body = await response.text();
    return body.slice(0, 600);
  } catch {
    return "<unreadable body>";
  }
}

function failureFor(status: number, detail: string): WindError {
  if (status === 401 || status === 403) return new WindError("unconfigured", `auth ${status}: ${detail}`);
  if (status === 429) return new WindError("capacity", `throttled: ${detail}`);
  if (status === 400 && /context|length|token/i.test(detail)) return new WindError("context", detail);
  if (status === 400 || status === 422) return new WindError("invalid", `rejected: ${detail}`);
  if (status >= 500) return new WindError("unavailable", `engine ${status}: ${detail}`);
  return new WindError("unknown", `status ${status}: ${detail}`);
}

export interface CallOptions {
  modelKey: string;
  messages: WindMessage[];
  traceId: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * An identifier the upstream no longer serves.
 *
 * Upstreams retire model names, and a name that is merely out of date should
 * not read as an outage. When one is rejected, the call is retried once with
 * whatever that upstream says it actually serves today.
 */
/** An engine that returned no content at all. */
function isEmptyCompletion(error: unknown): boolean {
  return error instanceof WindError && error.message.includes("empty completion");
}

function isUnknownModel(error: unknown): boolean {
  const text = error instanceof Error ? error.message : String(error);
  return /model_not_found|does not exist|unknown model|no such model|model .* not found/i.test(text);
}

/** Non-streaming completion. */
export async function complete(options: CallOptions): Promise<ChatCompletionResult> {
  const spec = engine(options.modelKey);
  const config = poolConfig(spec.pool);
  if (!config.apiKey) throw new WindError("unconfigured", "no credential for pool " + spec.pool);

  const budget = options.maxTokens ?? spec.maxOutputTokens;
  const roomy = Math.min(spec.maxOutputTokens, Math.max(budget * 4, 512));

  try {
    return await completeOnce(options, spec, config, spec.identifier);
  } catch (error) {
    const retired = isUnknownModel(error);
    const starved = isEmptyCompletion(error) && roomy > budget;
    if (!retired && !starved) throw error;

    const identifier = retired ? await discoverIdentifier(spec.pool) : spec.identifier;
    if (!identifier || (retired && identifier === spec.identifier)) throw error;

    telemetry.error(
      options.traceId,
      retired ? `identifier retired for ${spec.key}, using what the pool serves` : `retrying ${spec.key} with room to answer`,
      { code: "recovered", ...(retired ? { replacement: identifier } : { budget, roomy }) },
    );

    try {
      return await completeOnce(options, spec, config, identifier, retired ? undefined : roomy);
    } catch (second) {
      // A replacement that also comes back empty is a budget problem too: give
      // it the room, once, before calling the call a failure.
      if (!isEmptyCompletion(second) || !retired) throw second;
      return completeOnce(options, spec, config, identifier, roomy);
    }
  }
}

async function completeOnce(
  options: CallOptions,
  spec: ReturnType<typeof engine>,
  config: ReturnType<typeof poolConfig>,
  identifier: string,
  maxTokens?: number,
): Promise<ChatCompletionResult> {
  const payload: WirePayload = {
    model: identifier,
    messages: toWireMessages(options.messages, spec.vision),
    temperature: options.temperature ?? spec.temperature,
    max_tokens: maxTokens ?? options.maxTokens ?? spec.maxOutputTokens,
    stream: false,
  };

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? LIMITS.requestTimeoutMs);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener("abort", onAbort);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) throw failureFor(response.status, await readErrorDetail(response));

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
      error?: { message?: string };
    };

    if (json.error?.message) throw new WindError("unavailable", json.error.message.slice(0, 300));

    // An engine that thinks before it writes can spend a small budget entirely
    // on thinking and return nothing. That is a budget problem, not an outage,
    // and the caller above retries it once with room to answer. Whatever it
    // thought is never read: only content is ever returned.
    const text = json.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) throw new WindError("invalid", "empty completion");

    return {
      text,
      modelKey: spec.key,
      ms: Date.now() - startedAt,
      truncated: json.choices?.[0]?.finish_reason === "length",
    };
  } catch (error) {
    const code = classifyError(error);
    telemetry.error(options.traceId, `complete failed on ${spec.key}`, {
      code,
      detail: error instanceof Error ? error.message.slice(0, 300) : String(error),
    });
    throw error instanceof WindError ? error : new WindError(code, String(error));
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", onAbort);
  }
}

/** Streaming completion. Yields text chunks as they arrive. */
export async function* stream(options: CallOptions): AsyncGenerator<string, void, unknown> {
  const spec = engine(options.modelKey);
  const config = poolConfig(spec.pool);
  if (!config.apiKey) throw new WindError("unconfigured", "no credential for pool " + spec.pool);

  try {
    yield* streamOnce(options, spec, config, spec.identifier);
  } catch (error) {
    // A retired identifier is rejected before the first byte of the stream, so
    // retrying here cannot repeat text a reader has already seen.
    if (!isUnknownModel(error)) throw error;

    const replacement = await discoverIdentifier(spec.pool);
    if (!replacement || replacement === spec.identifier) throw error;

    telemetry.error(options.traceId, `identifier retired for ${spec.key}, using what the pool serves`, {
      code: "recovered",
      replacement,
    });
    yield* streamOnce(options, spec, config, replacement);
  }
}

async function* streamOnce(
  options: CallOptions,
  spec: ReturnType<typeof engine>,
  config: ReturnType<typeof poolConfig>,
  identifier: string,
): AsyncGenerator<string, void, unknown> {
  const payload: WirePayload = {
    model: identifier,
    messages: toWireMessages(options.messages, spec.vision),
    temperature: options.temperature ?? spec.temperature,
    max_tokens: options.maxTokens ?? spec.maxOutputTokens,
    stream: true,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? LIMITS.requestTimeoutMs);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener("abort", onAbort);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...config.headers,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) throw failureFor(response.status, await readErrorDetail(response));
    if (!response.body) throw new WindError("unavailable", "no response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffered = "";
    let emitted = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffered += decoder.decode(value, { stream: true });

      const lines = buffered.split("\n");
      buffered = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data) as {
            choices?: Array<{ delta?: { content?: string } }>;
            error?: { message?: string };
          };
          if (parsed.error?.message) throw new WindError("unavailable", parsed.error.message.slice(0, 300));
          const chunk = parsed.choices?.[0]?.delta?.content;
          if (chunk) {
            emitted += chunk.length;
            yield chunk;
          }
        } catch (error) {
          if (error instanceof WindError) throw error;
          // A partial JSON frame: ignore and wait for the rest.
        }
      }
    }

    if (emitted === 0) throw new WindError("invalid", "empty stream");
  } catch (error) {
    const code = classifyError(error);
    telemetry.error(options.traceId, `stream failed on ${spec.key}`, {
      code,
      detail: error instanceof Error ? error.message.slice(0, 300) : String(error),
    });
    throw error instanceof WindError ? error : new WindError(code, String(error));
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", onAbort);
  }
}
