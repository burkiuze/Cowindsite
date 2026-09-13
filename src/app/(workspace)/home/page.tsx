import Link from "next/link";
import { currentSession } from "@/lib/workspace/session";
import { pendingApprovals, recentActivity, store } from "@/lib/workspace/store";
import { isConfigured } from "@/lib/wind/adapters/endpoints";
import { Icon } from "@/components/ui/Icon";
import { Panel, PageHeader, Pill, SectionHeader, Stat, relativeTime } from "@/components/ui/primitives";
import { StreamField } from "@/components/app/StreamField";
import { WindMark } from "@/components/brand/WindMark";
import { ActivityTimeline } from "@/components/app/ActivityTimeline";

export const dynamic = "force-dynamic";
export const metadata = { title: "Home" };

export default async function HomePage() {
  const session = await currentSession();
  const state = store();
  const approvals = pendingApprovals();
  const running = state.tasks.filter((task) => task.status === "running");
  const needsApproval = state.tasks.filter((task) => task.status === "needs_approval");
  const completedThisWeek = state.tasks.filter(
    (task) => task.status === "completed" && task.updatedAt > Date.now() - 7 * 24 * 60 * 60 * 1000,
  );
  const activeAgents = state.agents.filter((agent) => agent.status === "active");
  const connected = state.connections.filter((connection) => connection.status === "connected");

  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Late night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="relative">
      <StreamField intensity={0.7} />

      <div className="mx-auto w-full max-w-6xl px-8 py-10">
        <PageHeader
          title={`${greeting}, ${session.user.name.split(" ")[0]}`}
          description={`Here is what Cowind is holding for ${session.workspace.name} right now.`}
          action={
            <Link
              href="/wind"
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] px-3.5 py-2 text-[13px] font-medium text-[#04121a] transition-opacity hover:opacity-90"
            >
              <Icon name="wind" size={15} strokeWidth={1.9} />
              Ask Wind
            </Link>
          }
        />

        {!isConfigured() ? (
          <div className="mt-6 flex items-start gap-3 rounded-[14px] border border-[#4a3812] bg-[#1a1408] px-4 py-3.5">
            <Icon name="alert" size={16} className="mt-0.5 shrink-0 text-[var(--color-stream-amber)]" />
            <div>
              <p className="text-[13.5px] font-medium text-[var(--color-ink)]">Wind is not connected to its engines</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
                Everything in the workspace works, but Wind cannot run until the workspace credentials are set on the
                server. The rest of Cowind is fully usable meanwhile.
              </p>
              <Link
                href="/settings"
                className="focus-ring mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-stream-amber)]"
              >
                Open Settings
                <Icon name="arrow-right" size={13} />
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Running now" value={String(running.length)} delta={running.length > 0 ? "live" : undefined} tone="running" />
          <Stat label="Waiting on you" value={String(approvals.length)} delta={approvals.length > 0 ? "decide" : undefined} tone="warning" />
          <Stat label="Done this week" value={String(completedThisWeek.length)} />
          <Stat label="Active agents" value={`${activeAgents.length}/${state.agents.length}`} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-6">
            <Panel padded={false}>
              <div className="flex items-center justify-between px-5 py-4">
                <SectionHeader title="In flight" hint="Work Wind is running or holding right now" />
                <Link
                  href="/tasks"
                  className="focus-ring shrink-0 rounded-md px-2 py-1 text-[12.5px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                >
                  All tasks
                </Link>
              </div>

              <ul className="divide-y divide-[var(--color-hairline)] border-t border-[var(--color-hairline)]">
                {[...running, ...needsApproval].slice(0, 4).map((task) => {
                  const done = task.steps.filter((step) => step.status === "completed").length;
                  return (
                    <li key={task.id}>
                      <Link
                        href={`/tasks/${task.id}`}
                        className="focus-ring flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--color-raised)]/40"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-medium text-[var(--color-ink)]">{task.title}</p>
                          <p className="mt-1 flex items-center gap-2 text-[12px] text-[var(--color-ink-faint)]">
                            <span>
                              {done}/{task.steps.length} steps
                            </span>
                            <span>·</span>
                            <span>{relativeTime(task.updatedAt)}</span>
                          </p>
                        </div>
                        <Pill tone={task.status === "running" ? "running" : "warning"} dot={task.status === "running"}>
                          {task.status === "running" ? "Running" : "Needs approval"}
                        </Pill>
                      </Link>
                    </li>
                  );
                })}
                {running.length + needsApproval.length === 0 ? (
                  <li className="px-5 py-8 text-center text-[13px] text-[var(--color-ink-faint)]">
                    Nothing is running. Ask Wind for an outcome and it will open a run here.
                  </li>
                ) : null}
              </ul>
            </Panel>

            <Panel padded={false}>
              <div className="px-5 py-4">
                <SectionHeader title="Activity" hint="Every meaningful step Cowind took, in order" />
              </div>
              <div className="border-t border-[var(--color-hairline)] px-5 py-4">
                <ActivityTimeline events={recentActivity(7)} compact />
                <Link
                  href="/analytics"
                  className="focus-ring mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                >
                  Full audit trail
                  <Icon name="arrow-right" size={13} />
                </Link>
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel>
              <div className="flex items-start gap-3">
                <WindMark size={30} state="flow" />
                <div className="min-w-0">
                  <h3 className="text-[14px] font-semibold text-[var(--color-ink)]">Ask, plan, act, report</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
                    Describe an outcome. Wind works out what it needs, runs what can run at once, and reports what it
                    did — including what it deliberately did not do.
                  </p>
                </div>
              </div>
              <Link
                href="/wind"
                className="focus-ring mt-4 flex items-center justify-between rounded-lg border border-[var(--color-hairline)] px-3 py-2.5 text-[13px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
              >
                Start a conversation
                <Icon name="arrow-right" size={14} />
              </Link>
            </Panel>

            {approvals.length > 0 ? (
              <Panel padded={false}>
                <div className="px-5 py-4">
                  <SectionHeader title="Waiting on a decision" hint="Nothing has been sent" />
                </div>
                <ul className="divide-y divide-[var(--color-hairline)] border-t border-[var(--color-hairline)]">
                  {approvals.slice(0, 3).map((approval) => (
                    <li key={approval.id}>
                      <Link
                        href="/approvals"
                        className="focus-ring flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--color-raised)]/40"
                      >
                        <Icon name="shield" size={15} className="mt-0.5 shrink-0 text-[var(--color-stream-amber)]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-[var(--color-ink)]">{approval.title}</p>
                          <p className="mt-0.5 truncate text-[12px] text-[var(--color-ink-faint)]">{approval.summary}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            ) : null}

            <Panel>
              <SectionHeader title="Workspace" />
              <dl className="mt-3.5 space-y-2.5 text-[13px]">
                <Row label="Knowledge sources" value={String(state.knowledge.length)} href="/knowledge" />
                <Row label="Connected tools" value={`${connected.length} of ${state.connections.length}`} href="/integrations" />
                <Row label="People" value={String(state.members.length)} href="/team" />
                <Row label="Flows" value={String(state.workflows.filter((flow) => flow.status === "active").length)} href="/flows" />
              </dl>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[var(--color-ink-muted)]">
        <Link href={href} className="focus-ring rounded hover:text-[var(--color-ink)]">
          {label}
        </Link>
      </dt>
      <dd className="font-medium text-[var(--color-ink)]">{value}</dd>
    </div>
  );
}
