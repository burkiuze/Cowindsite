import "server-only";
import { engine } from "../models";
import { LIMITS } from "../config";
import { WindError, classifyError } from "../redaction";
import { telemetry } from "../telemetry";
import type { ChatCompletionResult, WindMessage } from "../types";
import { poolConfig } from "./endpoints";

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

/** Non-streaming completion. */
export async function complete(options: CallOptions): Promise<ChatCompletionResult> {
  const spec = engine(options.modelKey);
  const config = poolConfig(spec.pool);
  if (!config.apiKey) throw new WindError("unconfigured", "no credential for pool " + spec.pool);

  const payload: WirePayload = {
    model: spec.identifier,
    messages: toWireMessages(options.messages, spec.vision),
    temperature: options.temperature ?? spec.temperature,
    max_tokens: options.maxTokens ?? spec.maxOutputTokens,
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

  const payload: WirePayload = {
    model: spec.identifier,
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
