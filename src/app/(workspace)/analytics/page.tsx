import { currentSession } from "@/lib/workspace/session";
import { recentActivity, store } from "@/lib/workspace/store";
import { can } from "@/lib/workspace/rbac";
import { PageHeader, Panel, SectionHeader, Stat } from "@/components/ui/primitives";
import { ActivityTimeline } from "@/components/app/ActivityTimeline";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const session = await currentSession();
  const state = store();
  const canAudit = can(session.role, "audit:read");

  const tasks = state.tasks;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const failed = tasks.filter((task) => task.status === "failed").length;
  const approvals = state.approvals;
  const decided = approvals.filter((approval) => approval.status !== "pending");
  const approvalRate = decided.length
    ? Math.round(
        (decided.filter((approval) => approval.status === "approved" || approval.status === "executed").length /
          decided.length) *
          100,
      )
    : 0;

  // Work by actor, straight from the recorded steps.
  const byActor = new Map<string, number>();
  for (const task of tasks) {
    for (const step of task.steps) byActor.set(step.actor, (byActor.get(step.actor) ?? 0) + 1);
  }
  const actors = [...byActor.entries()].sort((a, b) => b[1] - a[1]);
  const peak = actors[0]?.[1] ?? 1;

  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-10">
      <PageHeader
        title="Analytics"
        description="What Cowind actually did: runs, decisions, and where the work went. Counted from recorded steps, not estimated."
      />

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Runs" value={String(tasks.length)} />
        <Stat label="Completed" value={String(completed)} delta={failed > 0 ? `${failed} failed` : undefined} tone={failed > 0 ? "danger" : "neutral"} />
        <Stat label="Decisions made" value={String(decided.length)} delta={`${approvalRate}% approved`} tone="success" />
        <Stat label="Knowledge sources" value={String(state.knowledge.length)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel>
          <SectionHeader title="Where the work went" hint="Steps by actor" />
          <ul className="mt-4 space-y-2.5">
            {actors.map(([actor, count]) => (
              <li key={actor} className="flex items-center gap-3">
                <span className="w-[112px] shrink-0 truncate text-[12.5px] text-[var(--color-ink-muted)]">{actor}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-raised)]">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)]"
                    style={{ width: `${Math.max(6, (count / peak) * 100)}%` }}
                  />
                </span>
                <span className="w-6 shrink-0 text-right text-[12px] text-[var(--color-ink-faint)]">{count}</span>
              </li>
            ))}
            {actors.length === 0 ? (
              <li className="py-6 text-center text-[13px] text-[var(--color-ink-faint)]">No recorded steps yet.</li>
            ) : null}
          </ul>
        </Panel>

        <Panel>
          <SectionHeader title="Approvals" hint="What was held, and what happened next" />
          <ul className="mt-4 space-y-2.5 text-[13px]">
            {approvals.slice(0, 6).map((approval) => (
              <li key={approval.id} className="flex items-start gap-2.5">
                <Icon
                  name={approval.status === "pending" ? "clock" : approval.status === "rejected" ? "close" : "check"}
                  size={14}
                  className={`mt-0.5 shrink-0 ${
                    approval.status === "pending"
                      ? "text-[var(--color-stream-amber)]"
                      : approval.status === "rejected"
                        ? "text-[var(--color-ink-faint)]"
                        : "text-[#8ee6a4]"
                  }`}
                />
                <div className="min-w-0">
                  <p className="truncate text-[var(--color-ink)]">{approval.title}</p>
                  <p className="text-[11.5px] text-[var(--color-ink-faint)]">
                    {approval.status} · {approval.risk} risk
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-6" padded={false}>
        <div className="px-5 py-4">
          <SectionHeader
            title="Audit trail"
            hint={canAudit ? "Every meaningful operation, in order" : "Your role cannot read the audit trail"}
          />
        </div>
        <div className="border-t border-[var(--color-hairline)] px-5 py-5">
          {canAudit ? (
            <ActivityTimeline events={recentActivity(30)} />
          ) : (
            <p className="py-6 text-center text-[13px] text-[var(--color-ink-faint)]">
              Audit access is granted to managers and above.
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}
