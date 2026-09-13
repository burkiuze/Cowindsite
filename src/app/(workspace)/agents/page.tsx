import { store } from "@/lib/workspace/store";
import { currentSession } from "@/lib/workspace/session";
import { PERMISSION_LABEL, effectivePermissions } from "@/lib/workspace/rbac";
import { PageHeader, Panel, Pill, SectionHeader } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agents" };

export default async function AgentsPage() {
  const session = await currentSession();
  const state = store();

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-10">
      <PageHeader
        title="Agents"
        description="Standing workers, each owned by a department, each with a narrow purpose and an explicit grant. An agent never holds more authority than the person who starts it."
      />

      <div className="mt-7 space-y-8">
        {state.workspace.departments.map((department) => {
          const agents = state.agents.filter((agent) => agent.departmentId === department.id);
          if (agents.length === 0) return null;

          return (
            <section key={department.id}>
              <SectionHeader title={department.name} hint={department.description} />
              <ul className="mt-3 grid gap-3 md:grid-cols-2">
                {agents.map((agent) => {
                  const effective = effectivePermissions(session.role, agent.grants);
                  const narrowed = effective.length < agent.grants.length;

                  return (
                    <li key={agent.id}>
                      <Panel className="h-full">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--color-hairline)] bg-[var(--color-raised)] text-[var(--color-stream-cyan)]">
                              <Icon name="agents" size={16} />
                            </span>
                            <div className="min-w-0">
                              <h3 className="text-[14px] font-medium text-[var(--color-ink)]">{agent.name}</h3>
                              <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
                                {agent.purpose}
                              </p>
                            </div>
                          </div>
                          <Pill
                            tone={agent.status === "active" ? "success" : agent.status === "paused" ? "neutral" : "info"}
                          >
                            {agent.status}
                          </Pill>
                        </div>

                        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-[var(--color-hairline)] pt-3.5 text-[12px]">
                          <div>
                            <dt className="text-[var(--color-ink-faint)]">Runs (30d)</dt>
                            <dd className="mt-0.5 font-medium text-[var(--color-ink)]">{agent.runsLast30Days}</dd>
                          </div>
                          <div>
                            <dt className="text-[var(--color-ink-faint)]">Success</dt>
                            <dd className="mt-0.5 font-medium text-[var(--color-ink)]">
                              {agent.runsLast30Days > 0 ? `${Math.round(agent.successRate * 100)}%` : "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[var(--color-ink-faint)]">Knowledge</dt>
                            <dd className="mt-0.5 font-medium text-[var(--color-ink)]">
                              {agent.knowledgeScopes.length} scope{agent.knowledgeScopes.length === 1 ? "" : "s"}
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {agent.grants.map((grant) => (
                            <span
                              key={grant}
                              className={`rounded-md border px-1.5 py-0.5 text-[11px] ${
                                effective.includes(grant)
                                  ? "border-[var(--color-hairline)] text-[var(--color-ink-muted)]"
                                  : "border-[#3a2a12] text-[var(--color-ink-faint)] line-through"
                              }`}
                            >
                              {PERMISSION_LABEL[grant]}
                            </span>
                          ))}
                        </div>

                        {narrowed ? (
                          <p className="mt-2.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">
                            <Icon name="lock" size={12} className="mt-px shrink-0" />
                            Struck-through grants are dropped when you run this agent — your role does not hold them.
                          </p>
                        ) : null}
                      </Panel>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
