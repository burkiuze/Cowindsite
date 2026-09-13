import "server-only";
import { complete, stream, type CallOptions } from "./transport";
import { engineForRole } from "../models";
import type { ChatCompletionResult, WindMessage, WindRole } from "../types";

/**
 * Wind's specialist pool. Selected by role, never by raw identifier, so a
 * specialist can be re-pointed in `models.ts` without touching call sites.
 */

export function specialistComplete(
  role: WindRole,
  messages: WindMessage[],
  traceId: string,
  options: Partial<Omit<CallOptions, "messages" | "traceId" | "modelKey">> = {},
): Promise<ChatCompletionResult> {
  return complete({ modelKey: engineForRole(role).key, messages, traceId, ...options });
}

export function specialistStream(
  role: WindRole,
  messages: WindMessage[],
  traceId: string,
  options: Partial<Omit<CallOptions, "messages" | "traceId" | "modelKey">> = {},
): AsyncGenerator<string, void, unknown> {
  return stream({ modelKey: engineForRole(role).key, messages, traceId, ...options });
}
