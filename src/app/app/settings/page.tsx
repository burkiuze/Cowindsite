import { currentSession } from "@/lib/workspace/session";
import { configurationStatus } from "@/lib/wind/adapters/endpoints";
import { LIMITS } from "@/lib/wind/config";
import { ROLE_LABEL, PERMISSION_LABEL } from "@/lib/workspace/rbac";
import { PageHeader, Panel, Pill, SectionHeader } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await currentSession();
  const engines = configurationStatus();
  const ready = engines.primary || engines.specialist;

  return (
    <div className="mx-auto w-full max-w-4xl px-8 py-10">
      <PageHeader title="Settings" description={`${session.workspace.name} · ${ROLE_LABEL[session.role]}`} />

      <div className="mt-7 space-y-6">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <SectionHeader
              title="Wind engines"
              hint="Credentials live only on the server. They are never sent to the browser, never embedded in a page, and never logged."
            />
            <Pill tone={ready ? "success" : "warning"} dot>
              {ready ? "Ready" : "Not connected"}
            </Pill>
          </div>

          <dl className="mt-4 space-y-2.5">
            <EngineRow label="Primary engine" description="Conversation, routing, planning, synthesis" ok={engines.primary} env="WIND_PRIMARY_API_KEY" />
            <EngineRow label="Specialist pool" description="Code, finance, vision, reasoning, data" ok={engines.specialist} env="WIND_SPECIALIST_API_KEY" />
          </dl>

          {!ready ? (
            <div className="mt-4 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface)] p-3.5">
              <p className="text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
                Set both variables in your server environment (locally in <code className="rounded bg-[var(--color-raised)] px-1 py-0.5 font-mono text-[11.5px]">.env.local</code>, in production in your host&apos;s environment panel), then restart. Navio reads them
                server-side only.
              </p>
            </div>
          ) : null}
        </Panel>

        <Panel>
          <SectionHeader title="Guardrails" hint="Limits applied to every request, per run" />
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[13px] sm:grid-cols-3">
            <Limit label="Specialist calls" value={String(LIMITS.maxSpecialistCalls)} />
            <Limit label="Orchestration depth" value={String(LIMITS.maxOrchestrationDepth)} />
            <Limit label="Parallel streams" value={String(LIMITS.maxParallelLanes)} />
            <Limit label="Attempts per stream" value={String(LIMITS.maxAttemptsPerLane)} />
            <Limit label="Request timeout" value={`${Math.round(LIMITS.requestTimeoutMs / 1000)}s`} />
            <Limit label="Run timeout" value={`${Math.round(LIMITS.taskTimeoutMs / 1000)}s`} />
            <Limit label="Upload ceiling" value={`${Math.round(LIMITS.maxUploadBytes / (1024 * 1024))} MB`} />
            <Limit label="Rate limit" value={`${LIMITS.rateLimitPerMinute}/min`} />
            <Limit label="History replayed" value={`${LIMITS.maxHistoryTurns} turns`} />
          </dl>
        </Panel>

        <Panel>
          <SectionHeader title="Your permissions" hint={`Everything an agent you start can do, at most`} />
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {session.permissions.map((permission) => (
              <span
                key={permission}
                className="rounded-md border border-[var(--color-hairline)] px-2 py-1 text-[11.5px] text-[var(--color-ink-muted)]"
              >
                {PERMISSION_LABEL[permission]}
              </span>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function EngineRow({
  label,
  description,
  ok,
  env,
}: {
  label: string;
  description: string;
  ok: boolean;
  env: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--color-hairline)] px-3.5 py-3">
      <Icon
        name={ok ? "check" : "alert"}
        size={15}
        className={ok ? "text-[#8ee6a4]" : "text-[var(--color-stream-amber)]"}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[var(--color-ink)]">{label}</p>
        <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">{description}</p>
      </div>
      <code className="shrink-0 rounded bg-[var(--color-raised)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--color-ink-faint)]">
        {env}
      </code>
    </div>
  );
}

function Limit({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-[var(--color-hairline)] pb-2">
      <dt className="text-[var(--color-ink-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--color-ink)]">{value}</dd>
    </div>
  );
}
