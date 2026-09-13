"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ServiceLogo } from "@/components/app/ServiceLogo";

export type RunAction = {
  id: string;
  integrationId: string;
  integrationName: string;
  logo: string | null;
  dark: boolean;
  toolId: string;
  label: string;
  status: "running" | "completed" | "failed";
};

/**
 * What Wind touched, grouped by service.
 *
 * One card per integration, with its real mark and the number of calls that
 * actually completed. Expanding a card lists them individually. Nothing appears
 * here that Wind did not really do: a failed call says failed, and a service
 * Wind never reached has no card at all.
 */
export function ActionCards({ actions }: { actions: RunAction[] }) {
  if (actions.length === 0) return null;

  const groups = new Map<string, RunAction[]>();
  for (const action of actions) {
    const existing = groups.get(action.integrationId);
    if (existing) existing.push(action);
    else groups.set(action.integrationId, [action]);
  }

  return (
    <ul className="space-y-1.5">
      {[...groups.entries()].map(([integrationId, group]) => (
        <li key={integrationId}>
          <IntegrationCard actions={group} />
        </li>
      ))}
    </ul>
  );
}

function IntegrationCard({ actions }: { actions: RunAction[] }) {
  const [open, setOpen] = useState(false);
  const first = actions[0];

  const completed = actions.filter((action) => action.status === "completed").length;
  const failed = actions.filter((action) => action.status === "failed").length;
  const running = actions.filter((action) => action.status === "running").length;

  const summary =
    running > 0
      ? `${running} action${running === 1 ? "" : "s"} running`
      : failed > 0 && completed === 0
        ? `${failed} action${failed === 1 ? "" : "s"} failed`
        : `${completed} action${completed === 1 ? "" : "s"} completed${failed > 0 ? `, ${failed} failed` : ""}`;

  return (
    <div className="panel-quiet overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="focus-ring flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-[var(--color-raised)]/40"
        aria-expanded={open}
      >
        <ServiceLogo
          slug={first.integrationId}
          name={first.integrationName}
          logo={first.logo}
          dark={first.dark}
          size={22}
        />
        <span className="text-[13.5px] font-medium text-[var(--color-ink)]">{first.integrationName}</span>
        <span className="text-[11.5px] text-[var(--color-ink-faint)]">{summary}</span>
        <span className="ml-auto flex items-center gap-2">
          {running > 0 ? (
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-stream-cyan)]"
              style={{ animation: "pulse-dot 1.3s ease-in-out infinite" }}
            />
          ) : null}
          <Icon
            name={open ? "chevron-down" : "chevron-right"}
            size={14}
            className="text-[var(--color-ink-faint)]"
          />
        </span>
      </button>

      {open ? (
        <ul className="divide-y divide-[var(--color-hairline)] border-t border-[var(--color-hairline)]">
          {actions.map((action) => (
            <li key={action.id} className="flex items-center gap-2.5 px-3.5 py-2 pl-[46px]">
              <Icon
                name={action.status === "failed" ? "close" : action.status === "running" ? "clock" : "check"}
                size={12}
                strokeWidth={2}
                className={
                  action.status === "failed"
                    ? "text-[#ff9aa8]"
                    : action.status === "running"
                      ? "text-[var(--color-stream-cyan)]"
                      : "text-[#8ee6a4]"
                }
              />
              <span className="text-[12.5px] text-[var(--color-ink-muted)]">{action.label}</span>
              <span className="ml-auto font-mono text-[10.5px] text-[var(--color-ink-faint)]">{action.toolId}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
