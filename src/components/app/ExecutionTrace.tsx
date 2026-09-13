"use client";

import { Icon } from "@/components/ui/Icon";
import { Pill, type Tone } from "@/components/ui/primitives";

export type TraceLane = {
  id: string;
  label: string;
  actor: string;
  status: "waiting" | "running" | "completed" | "failed" | "skipped";
  note?: string;
};

const STATUS_TONE: Record<TraceLane["status"], Tone> = {
  waiting: "neutral",
  running: "running",
  completed: "success",
  failed: "danger",
  skipped: "neutral",
};

const STATUS_LABEL: Record<TraceLane["status"], string> = {
  waiting: "Waiting",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  skipped: "Skipped",
};

/**
 * Execution trace.
 *
 * Shows what Wind is doing — never how it thinks. Each row is one stream of
 * work with a product-facing name and a state. Streams that run at the same
 * time appear at the same time, which is the honest picture of a parallel run.
 */
export function ExecutionTrace({
  lanes,
  phase,
  collapsed = false,
}: {
  lanes: TraceLane[];
  phase?: string;
  collapsed?: boolean;
}) {
  if (lanes.length === 0) return null;

  const running = lanes.filter((lane) => lane.status === "running").length;
  const done = lanes.filter((lane) => lane.status === "completed").length;

  return (
    <div className="panel-quiet overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] px-3.5 py-2.5">
        <StreamGlyph active={running > 0} />
        <span className="text-[12.5px] font-medium text-[var(--color-ink)]">
          {running > 0
            ? `Wind is working across ${lanes.length} stream${lanes.length === 1 ? "" : "s"}`
            : phase && done < lanes.length
              ? phase
              : `${done} of ${lanes.length} complete`}
        </span>
        <span className="ml-auto text-[11.5px] text-[var(--color-ink-faint)]">
          {done}/{lanes.length}
        </span>
      </div>

      {!collapsed ? (
        <ul className="divide-y divide-[var(--color-hairline)]">
          {lanes.map((lane) => (
            <li
              key={lane.id}
              className={`relative flex items-center gap-3 overflow-hidden px-3.5 py-2.5 ${
                lane.status === "running" ? "lane-running" : ""
              }`}
            >
              <StatusDot status={lane.status} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13px] text-[var(--color-ink)]">{lane.label}</span>
                  <span className="shrink-0 text-[11.5px] text-[var(--color-ink-faint)]">{lane.actor}</span>
                </div>
                {lane.note ? (
                  <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">{lane.note}</p>
                ) : null}
              </div>
              <Pill tone={STATUS_TONE[lane.status]} dot={lane.status === "running"}>
                {STATUS_LABEL[lane.status]}
              </Pill>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function StatusDot({ status }: { status: TraceLane["status"] }) {
  if (status === "completed") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0e2417] text-[#8ee6a4]">
        <Icon name="check" size={12} strokeWidth={2.2} />
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2c1015] text-[#ff9aa8]">
        <Icon name="close" size={11} strokeWidth={2.2} />
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="flex h-5 w-5 items-center justify-center">
        <span
          className="h-2.5 w-2.5 rounded-full bg-[var(--color-stream-cyan)]"
          style={{ animation: "pulse-dot 1.3s ease-in-out infinite" }}
        />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center">
      <span className="h-2 w-2 rounded-full border border-[#2b323c]" />
    </span>
  );
}

/** Three short currents; they drift while work is in flight. */
function StreamGlyph({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {[7, 12, 17].map((y, index) => (
        <path
          key={y}
          d={`M2 ${y}c3.5-3 7-3 10.5 0s7 3 9.5 0`}
          stroke={index === 1 ? "var(--color-stream-cyan)" : "var(--color-stream-blue)"}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={index === 1 ? 0.95 : 0.5}
          className={active ? "stream-line" : undefined}
          style={active ? { animationDelay: `${index * -1.1}s`, animationDuration: "5s" } : undefined}
        />
      ))}
    </svg>
  );
}
