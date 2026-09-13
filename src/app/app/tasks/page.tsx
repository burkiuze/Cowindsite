import Link from "next/link";
import { store } from "@/lib/workspace/store";
import { currentSession } from "@/lib/workspace/session";
import { EmptyState, PageHeader, Pill, relativeTime } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { STATUS_LABEL, STATUS_TONE } from "./status";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tasks" };

export default async function TasksPage() {
  await currentSession();
  const tasks = [...store().tasks].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-10">
      <PageHeader
        title="Tasks"
        description="Every run Wind has opened, with the steps it took and where each one landed."
        action={
          <Link
            href="/app/wind"
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-[var(--color-hairline)] px-3 py-2 text-[13px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
          >
            <Icon name="plus" size={14} />
            New run
          </Link>
        }
      />

      {tasks.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No runs yet"
            description="Ask Wind for something that takes more than an answer — a review, a report, a plan — and it opens a run you can follow here."
          />
        </div>
      ) : (
        <ul className="mt-7 space-y-2.5">
          {tasks.map((task) => {
            const done = task.steps.filter((step) => step.status === "completed").length;
            const progress = task.steps.length > 0 ? (done / task.steps.length) * 100 : 0;

            return (
              <li key={task.id}>
                <Link
                  href={`/app/tasks/${task.id}`}
                  className="focus-ring panel block px-5 py-4 transition-colors hover:border-[#2b3d4a]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[14px] font-medium text-[var(--color-ink)]">{task.title}</h3>
                      <p className="mt-1 line-clamp-1 text-[12.5px] text-[var(--color-ink-faint)]">{task.goal}</p>
                    </div>
                    <Pill tone={STATUS_TONE[task.status]} dot={task.status === "running"}>
                      {STATUS_LABEL[task.status]}
                    </Pill>
                  </div>

                  <div className="mt-3.5 flex items-center gap-3">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--color-raised)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] transition-[width] duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-[11.5px] text-[var(--color-ink-faint)]">
                      {done}/{task.steps.length} steps · {relativeTime(task.updatedAt)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {task.steps.slice(0, 6).map((step) => (
                      <span
                        key={step.id}
                        className="rounded-md border border-[var(--color-hairline)] px-1.5 py-0.5 text-[11px] text-[var(--color-ink-faint)]"
                      >
                        {step.actor}
                      </span>
                    ))}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
