"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Markdown } from "@/components/app/Markdown";
import { ServiceLogo } from "@/components/app/ServiceLogo";
import type { SparkRunView } from "@/lib/workspace/spark-view";

const POLL_MS = 1_200;

/**
 * A Spark run, in the conversation.
 *
 * The run happens on the server; this card only watches it. It polls while the
 * run is going and stops polling once it has settled, so a conversation left
 * open overnight is not a conversation hammering the server. Everything it
 * shows is what the run recorded: the tools it read, the bar it set, each
 * round's verdict against that bar, and the version it ended on.
 */
export function SparkRunCard({ runId, fallback }: { runId: string; fallback?: string }) {
  const [run, setRun] = useState<SparkRunView | null>(null);
  const [missing, setMissing] = useState(false);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let misses = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/spark/${runId}`, { cache: "no-store" });
        if (response.status === 404) {
          misses += 1;
          if (misses >= 3) {
            if (!cancelled) setMissing(true);
            return;
          }
        } else if (response.ok) {
          misses = 0;
          const data = (await response.json()) as { run: SparkRunView };
          if (cancelled) return;
          setRun(data.run);
          if (data.run.status !== "running") return;
        }
      } catch {
        // A dropped poll is not a failed run; try again on the next tick.
      }
      if (!cancelled) timer = setTimeout(poll, POLL_MS);
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [runId]);

  async function stop() {
    setStopping(true);
    try {
      await fetch(`/api/spark/${runId}/stop`, { method: "POST" });
    } catch {
      setStopping(false);
    }
  }

  if (missing) {
    return fallback ? (
      <Markdown text={fallback} />
    ) : (
      <p className="text-[13px] text-[var(--color-ink-faint)]">This Spark run is no longer available on this server.</p>
    );
  }

  if (!run) {
    return (
      <div className="panel-quiet flex items-center gap-2.5 px-4 py-3.5 text-[13px] text-[var(--color-ink-muted)]">
        <SparkGlyph running />
        Starting Spark…
      </div>
    );
  }

  const running = run.status === "running";
  const latest = [...run.rounds].reverse().find((round) => round.finishedAt);
  const current = run.rounds[run.rounds.length - 1];

  return (
    <div className="space-y-3" data-spark-run={run.status}>
      <section className="panel overflow-hidden">
        {/* ---------------------------------------------------------- header */}
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-[var(--color-hairline)] px-4 py-3">
          <SparkGlyph running={running} />
          <span className="text-[13.5px] font-semibold text-[var(--color-ink)]">Spark</span>
          <span className="text-[12.5px] text-[var(--color-ink-muted)]" data-spark-phase={run.phase}>
            {headline(run)}
          </span>
          <span className="ml-auto flex items-center gap-2">
            <Elapsed from={run.startedAt} to={run.finishedAt} />
            {running ? (
              <button
                type="button"
                onClick={() => void stop()}
                disabled={stopping || run.stopRequested}
                className="focus-ring rounded-md border border-[var(--color-hairline)] px-2 py-1 text-[11.5px] text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)] disabled:opacity-50"
              >
                {stopping || run.stopRequested ? "Stopping…" : "Stop"}
              </button>
            ) : null}
          </span>
        </header>

        {running ? (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-[var(--color-hairline)] bg-[var(--color-raised)]/30 px-4 py-2 text-[11.5px] text-[var(--color-ink-faint)]">
            <Icon name="clock" size={12} />
            Working in the background — you can leave this page. The result lands here when it is ready.
            {run.taskId ? (
              <Link
                href={`/app/tasks/${run.taskId}`}
                data-spark-task=""
                className="focus-ring ml-auto inline-flex items-center gap-1 rounded text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
              >
                Follow it in Tasks
                <Icon name="arrow-right" size={12} />
              </Link>
            ) : null}
          </p>
        ) : null}

        {/* ------------------------------------------------------- the rounds */}
        <div className="px-4 py-3.5">
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: run.maxRounds }, (_, index) => {
              const round = run.rounds[index];
              const state = !round
                ? "empty"
                : round.passed
                  ? "passed"
                  : round.finishedAt
                    ? "reviewed"
                    : "active";
              return (
                <span
                  key={index}
                  className={`h-1.5 flex-1 rounded-full ${
                    state === "passed"
                      ? "bg-[#6fdc8c]"
                      : state === "reviewed"
                        ? "bg-[var(--color-stream-amber)]"
                        : state === "active"
                          ? "bg-[var(--color-stream-cyan)]"
                          : "bg-[var(--color-raised)]"
                  }`}
                  style={state === "active" ? { animation: "pulse-dot 1.4s ease-in-out infinite" } : undefined}
                />
              );
            })}
          </div>

          {run.reads.length > 0 ? (
            <ul className="mt-3.5 flex flex-wrap gap-1.5">
              {run.reads.map((read) => (
                <li
                  key={read.id}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--color-hairline)] py-1 pr-2.5 pl-1.5 text-[11.5px] text-[var(--color-ink-muted)]"
                >
                  <ServiceLogo slug={read.integrationId} name={read.name} logo={read.logo} dark={read.dark} size={15} />
                  {read.name}
                  <Icon
                    name={read.status === "running" ? "clock" : read.status === "failed" ? "close" : "check"}
                    size={11}
                    strokeWidth={2}
                    className={
                      read.status === "running"
                        ? "text-[var(--color-stream-cyan)]"
                        : read.status === "failed"
                          ? "text-[#ff9aa8]"
                          : "text-[#8ee6a4]"
                    }
                  />
                </li>
              ))}
            </ul>
          ) : null}

          {run.rounds.length > 0 ? (
            <ol className="mt-3.5 space-y-1.5" data-spark-rounds={run.rounds.length}>
              {run.rounds.map((round) => {
                const passed = round.checks.filter((check) => check.ok).length;
                const failed = round.checks.filter((check) => !check.ok);
                const open = round === current && run.status === "running";
                return (
                  <li key={round.n} className="rounded-lg border border-[var(--color-hairline)] px-3 py-2">
                    <div className="flex items-center gap-2.5 text-[12.5px]">
                      <span className="font-medium text-[var(--color-ink)]">Round {round.n}</span>
                      <span className="text-[var(--color-ink-faint)]">{round.kind === "draft" ? "Draft" : "Revision"}</span>
                      <span className="ml-auto tabular-nums">
                        {round.finishedAt ? (
                          <span className={round.passed ? "text-[#8ee6a4]" : "text-[var(--color-stream-amber)]"}>
                            {round.passed ? `All ${round.checks.length} checks passed` : `${passed} of ${round.checks.length} checks passed`}
                          </span>
                        ) : (
                          <span className="text-[var(--color-stream-cyan)]">
                            {open && run.phase === "reviewing" ? "Reviewing…" : "Writing…"}
                          </span>
                        )}
                      </span>
                    </div>
                    {round.finishedAt && failed.length > 0 ? (
                      <ul className="mt-1.5 space-y-1">
                        {failed.map((check) => (
                          <li key={check.criterion} className="flex gap-2 text-[11.5px] leading-snug text-[var(--color-ink-muted)]">
                            <Icon name="alert" size={12} className="mt-px shrink-0 text-[var(--color-stream-amber)]" />
                            <span>{check.issue}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          ) : null}

          {/* The bar, with the latest verdict against each check. */}
          {run.criteria.length > 0 ? (
            <details className="group mt-3.5" open={!running}>
              <summary className="focus-ring flex cursor-pointer list-none items-center gap-1.5 rounded text-[11.5px] font-medium tracking-[0.04em] text-[var(--color-ink-faint)] uppercase">
                <Icon name="chevron-right" size={12} className="transition-transform group-open:rotate-90" />
                Quality bar · {run.criteria.length} checks
              </summary>
              <ul className="mt-2 space-y-1.5">
                {run.criteria.map((criterion, index) => {
                  const verdict = latest?.checks[index];
                  return (
                    <li key={criterion} className="flex gap-2 text-[12px] leading-snug text-[var(--color-ink-muted)]">
                      <Icon
                        name={!verdict ? "dot" : verdict.ok ? "check" : "close"}
                        size={12}
                        strokeWidth={2}
                        className={`mt-0.5 shrink-0 ${
                          !verdict ? "text-[var(--color-ink-faint)]" : verdict.ok ? "text-[#8ee6a4]" : "text-[var(--color-stream-amber)]"
                        }`}
                      />
                      <span>{criterion}</span>
                    </li>
                  );
                })}
              </ul>
            </details>
          ) : null}
        </div>

        {/* While it runs, the version it is working on, cut short. */}
        {running && run.draft ? (
          <div className="relative max-h-[148px] overflow-hidden border-t border-[var(--color-hairline)] px-4 pt-3 pb-2">
            <p className="mb-1.5 text-[11px] font-medium tracking-[0.04em] text-[var(--color-ink-faint)] uppercase">
              {/* While round n is being written, the draft on screen is round n − 1's. */}
              Latest draft · round {run.phase === "revising" ? Math.max(1, (current?.n ?? 2) - 1) : current?.n ?? 1}
            </p>
            <div className="text-[12.5px] opacity-70">
              <Markdown text={run.draft} />
            </div>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[var(--color-panel)] to-transparent" />
          </div>
        ) : null}

        {run.error ? (
          <p className="border-t border-[var(--color-hairline)] px-4 py-3 text-[12.5px] text-[#ffb3bd]">{run.error}</p>
        ) : null}
      </section>

      {/* The version it ended on, in full. */}
      {!running && run.draft ? <Markdown text={run.draft} /> : null}

      {run.approvalId ? (
        <Link
          href="/app/approvals"
          data-spark-approval=""
          className="focus-ring flex items-start gap-2.5 rounded-[14px] border border-[#4a3812] bg-[#1a1408] px-4 py-3 transition-colors hover:border-[#6b5219]"
        >
          <Icon name="shield" size={16} className="mt-0.5 shrink-0 text-[var(--color-stream-amber)]" />
          <span>
            <span className="block text-[13px] font-medium text-[var(--color-ink)]">Prepared from the final version — waiting for your approval</span>
            <span className="mt-0.5 block text-[12px] text-[var(--color-ink-muted)]">
              Nothing has been sent. Review it, edit it, approve or reject it in Approvals.
            </span>
          </span>
        </Link>
      ) : null}
    </div>
  );
}

function headline(run: SparkRunView): string {
  const round = run.rounds[run.rounds.length - 1]?.n ?? 1;
  if (run.status === "stopped") {
    return `Stopped after ${run.rounds.length} round${run.rounds.length === 1 ? "" : "s"} — latest draft kept`;
  }
  if (run.status === "failed") return "Could not finish";
  if (run.status === "completed") {
    if (run.outcome === "passed") {
      return `Polished in ${run.rounds.length} round${run.rounds.length === 1 ? "" : "s"} — every check passed`;
    }
    const open = run.rounds[run.rounds.length - 1]?.checks.filter((check) => !check.ok).length ?? 0;
    return `Stopped at the round limit — ${open} check${open === 1 ? "" : "s"} still open`;
  }
  switch (run.phase) {
    case "reading":
      return "Reading connected tools";
    case "criteria":
      return "Setting the quality bar";
    case "drafting":
      return "Writing the first draft";
    case "reviewing":
      return `Reviewing round ${round} against the bar`;
    case "revising":
      return `Revising — round ${round} of ${run.maxRounds}`;
    case "preparing":
      return "Preparing the action for approval";
    default:
      return "Working";
  }
}

function Elapsed({ from, to }: { from: number; to?: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (to) return;
    const timer = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, [to]);
  const seconds = Math.max(0, Math.round(((to ?? now) - from) / 1000));
  const label = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return <span className="font-mono text-[11px] text-[var(--color-ink-faint)] tabular-nums">{label}</span>;
}

function SparkGlyph({ running = false }: { running?: boolean }) {
  return (
    <span
      className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#ffb937] to-[#f0567f] text-[#1a0d05]"
      style={running ? { animation: "pulse-dot 1.6s ease-in-out infinite" } : undefined}
    >
      <Icon name="sparkle" size={14} strokeWidth={2} />
    </span>
  );
}
