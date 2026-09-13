import "server-only";
import { complete, stream, type CallOptions } from "./transport";
import type { ChatCompletionResult, WindMessage } from "../types";

/**
 * Navio's primary engine — the fast conversational layer. Handles everyday
 * conversation, intent classification, planning and final synthesis.
 */

const PRIMARY_KEY = "wind.core";

export function primaryComplete(
  messages: WindMessage[],
  traceId: string,
  options: Partial<Omit<CallOptions, "messages" | "traceId">> = {},
): Promise<ChatCompletionResult> {
  return complete({ modelKey: PRIMARY_KEY, messages, traceId, ...options });
}

export function primaryStream(
  messages: WindMessage[],
  traceId: string,
  options: Partial<Omit<CallOptions, "messages" | "traceId">> = {},
): AsyncGenerator<string, void, unknown> {
  return stream({ modelKey: PRIMARY_KEY, messages, traceId, ...options });
}

export { PRIMARY_KEY };
