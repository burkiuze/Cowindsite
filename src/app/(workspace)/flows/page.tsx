import { store } from "@/lib/workspace/store";
import { currentSession } from "@/lib/workspace/session";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, PageHeader, Panel, Pill, relativeTime } from "@/components/ui/primitives";
import { INTEGRATIONS } from "@/lib/workspace/integrations";

export const dynamic = "force-dynamic";
export const metadata = { title: "Flows" };

export default async function FlowsPage() {
  await currentSession();
  const state = store();

  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-10">
      <PageHeader
        title="Flows"
        description="Work that repeats on a trigger. Each flow is a chain of steps with named actors and explicit approval points — nothing publishes itself."
      />

      {state.workflows.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No flows yet" description="Turn a run that worked into a flow and it repeats on a schedule or an event." />
        </div>
      ) : (
        <ul className="mt-7 space-y-4">
          {state.workflows.map((flow) => {
            const integration = flow.trigger.integrationId
              ? INTEGRATIONS.find((candidate) => candidate.id === flow.trigger.integrationId)
              : undefined;
            const connection = state.connections.find(
              (candidate) => candidate.integrationId === flow.trigger.integrationId,
            );

            return (
              <li key={flow.id}>
                <Panel padded={false}>
                  <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-[14.5px] font-medium text-[var(--color-ink)]">{flow.name}</h3>
                        <Pill tone={flow.status === "active" ? "success" : flow.status === "paused" ? "neutral" : "info"}>
                          {flow.status}
                        </Pill>
                      </div>
                      <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
                        {flow.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center justify-end gap-1.5 text-[12px] text-[var(--color-ink-muted)]">
                        <Icon name={flow.trigger.kind === "schedule" ? "clock" : "flows"} size={13} />
                        {flow.trigger.description}
                      </p>
                      {flow.lastRunAt ? (
                        <p className="mt-1 text-[11.5px] text-[var(--color-ink-faint)]">
                          Last run {relativeTime(flow.lastRunAt)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* The chain, drawn as a current passing through steps. */}
                  <div className="border-t border-[var(--color-hairline)] px-5 py-4">
                    <ol className="flex flex-wrap items-center gap-1.5">
                      {flow.steps.map((step, index) => (
                        <li key={step.id} className="flex items-center gap-1.5">
                          <span
                            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] ${
                              step.requiresApproval
                                ? "border-[#4a3812] bg-[#1a1408] text-[var(--color-stream-amber)]"
                                : "border-[var(--color-hairline)] bg-[var(--color-raised)] text-[var(--color-ink-muted)]"
                            }`}
                          >
                            {step.requiresApproval ? <Icon name="shield" size={12} /> : null}
                            {step.title}
                            <span className="text-[10.5px] text-[var(--color-ink-faint)]">{step.actor}</span>
                          </span>
                          {index < flow.steps.length - 1 ? (
                            <Icon name="chevron-right" size={13} className="text-[var(--color-ink-faint)]" />
                          ) : null}
                        </li>
                      ))}
                    </ol>

                    {integration && connection?.status !== "connected" ? (
                      <p className="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--color-ink-faint)]">
                        <Icon name="alert" size={13} className="text-[var(--color-stream-amber)]" />
                        This flow needs {integration.name}, which is not connected — Wind will prepare the work and hold
                        the step rather than pretend it ran.
                      </p>
                    ) : null}
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
