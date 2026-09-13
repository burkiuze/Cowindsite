import { currentSession } from "@/lib/workspace/session";
import { store } from "@/lib/workspace/store";
import { CATEGORY_LABEL, INTEGRATIONS, STATUS_LABEL } from "@/lib/workspace/integrations";
import { toolsForIntegration } from "@/lib/wind/tools/registry";
import { can } from "@/lib/workspace/rbac";
import { PageHeader, Panel, Pill, type Tone } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { BrandIcon } from "@/components/app/BrandIcon";
import type { IntegrationCategory, IntegrationConnection } from "@/lib/workspace/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Integrations" };

const STATUS_TONE: Record<IntegrationConnection["status"], Tone> = {
  connected: "success",
  available: "neutral",
  not_configured: "neutral",
  error: "danger",
};

export default async function IntegrationsPage() {
  const session = await currentSession();
  const state = store();
  const canConnect = can(session.role, "integrations:connect");

  const categories = Object.keys(CATEGORY_LABEL) as IntegrationCategory[];
  const connectedCount = state.connections.filter((connection) => connection.status === "connected").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-10">
      <PageHeader
        title="Integrations"
        description={`${connectedCount} of ${INTEGRATIONS.length} connected. Cowind shows the true state of every connection — an integration without credentials is never treated as if it worked.`}
      />

      <div className="mt-5 flex items-start gap-2.5 rounded-[14px] border border-[var(--color-hairline)] bg-[var(--color-panel)] px-4 py-3">
        <Icon name="shield" size={15} className="mt-0.5 shrink-0 text-[var(--color-stream-cyan)]" />
        <p className="text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
          Every tool call runs through the same path: permission check, then approval check for anything that writes,
          then execution, then an audit receipt. Read-only calls run without a prompt; anything that sends, publishes
          or changes something waits for a person.
        </p>
      </div>

      <div className="mt-8 space-y-9">
        {categories.map((category) => {
          const items = INTEGRATIONS.filter((integration) => integration.category === category);
          if (items.length === 0) return null;

          return (
            <section key={category}>
              <div className="mb-3 flex items-baseline gap-2.5">
                <h2 className="text-[13px] font-semibold tracking-[0.06em] text-[var(--color-ink-muted)] uppercase">
                  {CATEGORY_LABEL[category]}
                </h2>
                <span className="text-[12px] text-[var(--color-ink-faint)]">{items.length}</span>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((integration) => {
                  const status =
                    state.connections.find((connection) => connection.integrationId === integration.id)?.status ??
                    "available";
                  const tools = toolsForIntegration(integration.id);

                  return (
                    <li key={integration.id}>
                      <Panel className="group flex h-full flex-col px-4 py-4 transition-colors hover:border-[#2b3d4a]">
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-hairline)] bg-[var(--color-raised)]">
                            <BrandIcon id={integration.id} name={integration.name} size={17} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[13.5px] font-medium text-[var(--color-ink)]">{integration.name}</h3>
                            <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-faint)]">
                              {integration.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[var(--color-hairline)] pt-3">
                          <Pill tone={STATUS_TONE[status]} dot={status === "connected"}>
                            {STATUS_LABEL[status]}
                          </Pill>

                          {status === "connected" ? (
                            <span className="text-[11.5px] text-[var(--color-ink-faint)]">
                              {tools.length} tool{tools.length === 1 ? "" : "s"}
                            </span>
                          ) : integration.implemented ? (
                            <button
                              type="button"
                              disabled={!canConnect}
                              title={
                                canConnect
                                  ? `Set ${integration.requiredEnv.join(", ")} on the server to finish this connection`
                                  : "Your role cannot connect integrations"
                              }
                              className="focus-ring rounded-md border border-[var(--color-hairline)] px-2 py-1 text-[11.5px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Connect
                            </button>
                          ) : (
                            <span className="text-[11.5px] text-[var(--color-ink-faint)]">Adapter not built yet</span>
                          )}
                        </div>
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
