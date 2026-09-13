import { Icon, type IconName } from "@/components/ui/Icon";
import { relativeTime } from "@/components/ui/primitives";
import type { ActivityEvent, ActivityKind } from "@/lib/workspace/types";

const KIND_ICON: Record<ActivityKind, IconName> = {
  "task.started": "play",
  "task.completed": "check",
  "task.failed": "alert",
  "knowledge.searched": "search",
  "knowledge.added": "knowledge",
  "specialist.started": "wind",
  "specialist.completed": "wind",
  "approval.requested": "shield",
  "approval.decided": "check",
  "action.executed": "arrow-up-right",
  "integration.connected": "integrations",
  "agent.created": "agents",
  "flow.run": "flows",
  "member.changed": "team",
};

const KIND_COLOR: Partial<Record<ActivityKind, string>> = {
  "task.completed": "text-[#8ee6a4]",
  "task.failed": "text-[#ff9aa8]",
  "approval.requested": "text-[var(--color-stream-amber)]",
  "approval.decided": "text-[#8ee6a4]",
  "action.executed": "text-[var(--color-stream-cyan)]",
};

/**
 * The audit trail, as a timeline.
 *
 * Operational events only: what ran, what it touched, who decided. Never the
 * content of Wind's reasoning — that is deliberately not recorded here.
 */
export function ActivityTimeline({ events, compact = false }: { events: ActivityEvent[]; compact?: boolean }) {
  if (events.length === 0) {
    return <p className="py-6 text-center text-[13px] text-[var(--color-ink-faint)]">No activity yet.</p>;
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, index) => (
        <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
          {index < events.length - 1 ? (
            <span className="absolute top-6 bottom-0 left-[11px] w-px bg-[var(--color-hairline)]" aria-hidden="true" />
          ) : null}
          <span
            className={`relative z-10 flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border border-[var(--color-hairline)] bg-[var(--color-panel)] ${
              KIND_COLOR[event.kind] ?? "text-[var(--color-ink-faint)]"
            }`}
          >
            <Icon name={KIND_ICON[event.kind]} size={12} strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className={`${compact ? "truncate" : ""} text-[13px] text-[var(--color-ink)]`}>{event.summary}</p>
            <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">
              {event.actor} · {relativeTime(event.at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
