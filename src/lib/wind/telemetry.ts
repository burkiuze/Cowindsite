import "server-only";
import type { AttemptRecord } from "./types";

/**
 * Server-side telemetry. Holds the detail that must never reach the browser:
 * engine identifiers, error text, latency per attempt. Kept in a bounded ring
 * buffer so a long-running instance cannot grow without limit.
 */

export interface TraceEvent {
  traceId: string;
  at: number;
  kind: "route" | "attempt" | "lane" | "budget" | "error";
  message: string;
  data?: Record<string, unknown>;
}

const MAX_EVENTS = 500;
const buffer: TraceEvent[] = [];

function push(event: TraceEvent) {
  buffer.push(event);
  if (buffer.length > MAX_EVENTS) buffer.splice(0, buffer.length - MAX_EVENTS);
  if (process.env.WIND_DEBUG === "1") {
    // Server console only. Never streamed.
    console.log(`[wind:${event.kind}] ${event.traceId} ${event.message}`, event.data ?? "");
  }
}

export const telemetry = {
  route(traceId: string, message: string, data?: Record<string, unknown>) {
    push({ traceId, at: Date.now(), kind: "route", message, data });
  },
  attempt(traceId: string, record: AttemptRecord) {
    push({
      traceId,
      at: Date.now(),
      kind: "attempt",
      message: `${record.modelKey} ${record.ok ? "ok" : "failed"} in ${record.ms}ms`,
      data: { ...record },
    });
  },
  lane(traceId: string, laneId: string, status: string, data?: Record<string, unknown>) {
    push({ traceId, at: Date.now(), kind: "lane", message: `${laneId} → ${status}`, data });
  },
  budget(traceId: string, data: Record<string, unknown>) {
    push({ traceId, at: Date.now(), kind: "budget", message: "budget snapshot", data });
  },
  error(traceId: string, message: string, data?: Record<string, unknown>) {
    push({ traceId, at: Date.now(), kind: "error", message, data });
  },
  /** Diagnostics for operators. Exposed only through an authenticated route. */
  recent(traceId?: string): TraceEvent[] {
    return traceId ? buffer.filter((e) => e.traceId === traceId) : [...buffer];
  },
};

export function newTraceId(): string {
  return `tr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
