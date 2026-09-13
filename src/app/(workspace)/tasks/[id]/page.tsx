import Link from "next/link";
import { notFound } from "next/navigation";
import { store } from "@/lib/workspace/store";
import { currentSession } from "@/lib/workspace/session";
import { Icon } from "@/components/ui/Icon";
import { Panel, Pill, SectionHeader, relativeTime } from "@/components/ui/primitives";
import { Markdown } from "@/components/app/Markdown";
import { ActivityTimeline } from "@/components/app/ActivityTimeline";
import { STATUS_LABEL, STATUS_TONE } from "../status";

export const dynamic = "force-dynamic";

const STEP_TONE = {
  waiting: "neutral",
  running: "running",
  completed: "success",
  failed: "danger",
  skipped: "neutral",
  needs_approval: "warning",
} as const;

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await currentSession();
  const state = store();
  const task = state.tasks.find((candidate) => candidate.id === id);
  if (!task) notFound();

  const artifacts = state.artifacts.filter((artifact) => artifact.taskId === task.id);
  const approvals = state.approvals.filter((approval) => approval.taskId === task.id);
  const events = state.activity.filter((event) => event.taskId === task.id).sort((a, b) => b.at - a.at);

  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-10">
      <Link
        href="/tasks"
        className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[12.5px] text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink)]"
      >
        <Icon name="chevron-left" size={14} />
        Tasks
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-hairline)] pb-6">
        <div className="min-w-0">
          <h1 className="text-[21px] leading-tight font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            {task.title}
          </h1>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">{task.goal}</p>
          <p className="mt-2.5 text-[12px] text-[var(--color-ink-faint)]">
            Opened {relativeTime(task.createdAt)} · last change {relativeTime(task.updatedAt)}
          </p>
        </div>
        <Pill tone={STATUS_TONE[task.status]} dot={task.status === "running"}>
          {STATUS_LABEL[task.status]}
        </Pill>
      </header>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Panel padded={false}>
            <div className="px-5 py-4">
              <SectionHeader title="Steps" hint="What ran, in what order, and where each landed" />
            </div>
            <ul className="divide-y divide-[var(--color-hairline)] border-t border-[var(--color-hairline)]">
              {task.steps.map((step) => (
                <li key={step.id} className="flex items-start gap-3.5 px-5 py-3.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                    {step.status === "completed" ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0e2417] text-[#8ee6a4]">
                        <Icon name="check" size={12} strokeWidth={2.2} />
                      </span>
                    ) : step.status === "running" ? (
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-[var(--color-stream-cyan)]"
                        style={{ animation: "pulse-dot 1.3s ease-in-out infinite" }}
                      />
                    ) : step.status === "failed" ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2c1015] text-[#ff9aa8]">
                        <Icon name="close" size={11} strokeWidth={2.2} />
                      </span>
                    ) : (
                      <span className="h-2 w-2 rounded-full border border-[#2b323c]" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] text-[var(--color-ink)]">{step.title}</p>
                    <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">
                      {step.actor}
                      {step.finishedAt && step.startedAt
                        ? ` · ${Math.max(1, Math.round((step.finishedAt - step.startedAt) / 1000))}s`
                        : ""}
                    </p>
                    {step.note ? (
                      <p className="mt-1 text-[12px] text-[var(--color-ink-muted)]">{step.note}</p>
                    ) : null}
                  </div>

                  <Pill tone={STEP_TONE[step.status]} dot={step.status === "running"}>
                    {step.status === "needs_approval" ? "Needs approval" : step.status}
                  </Pill>
                </li>
              ))}
            </ul>
          </Panel>

          {artifacts.map((artifact) => (
            <Panel key={artifact.id} padded={false}>
              <div className="flex items-center justify-between px-5 py-4">
                <SectionHeader title="Output" hint={artifact.title} />
                <Pill tone="info">{artifact.kind}</Pill>
              </div>
              <div className="border-t border-[var(--color-hairline)] px-5 py-4">
                <Markdown text={artifact.content} />
              </div>
            </Panel>
          ))}
        </div>

        <div className="space-y-6">
          {approvals.length > 0 ? (
            <Panel padded={false}>
              <div className="px-5 py-4">
                <SectionHeader title="Approvals" />
              </div>
              <ul className="divide-y divide-[var(--color-hairline)] border-t border-[var(--color-hairline)]">
                {approvals.map((approval) => (
                  <li key={approval.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[13px] text-[var(--color-ink)]">{approval.title}</p>
                      <Pill tone={approval.status === "pending" ? "warning" : "success"}>{approval.status}</Pill>
                    </div>
                    {approval.status === "pending" ? (
                      <Link
                        href="/approvals"
                        className="focus-ring mt-2 inline-flex items-center gap-1.5 text-[12px] text-[var(--color-stream-amber)]"
                      >
                        Decide
                        <Icon name="arrow-right" size={12} />
                      </Link>
                    ) : approval.receipt ? (
                      <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">
                        {approval.receipt}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          <Panel>
            <SectionHeader title="Trail" hint="Operational events only" />
            <div className="mt-4">
              <ActivityTimeline events={events} />
            </div>
          </Panel>

          {task.conversationId ? (
            <Link
              href={`/wind/${task.conversationId}`}
              className="focus-ring panel flex items-center justify-between px-4 py-3 text-[13px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
            >
              Open the conversation
              <Icon name="arrow-right" size={14} />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
