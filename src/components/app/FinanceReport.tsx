"use client";

import { useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { ServiceLogo } from "@/components/app/ServiceLogo";
import { MonthlyBars } from "@/components/app/charts/MonthlyBars";
import { EXPENSE, REVENUE } from "@/components/app/charts/palette";
import { moneyFormatter } from "@/lib/money";
import type { FinanceReportView, ReportLineView } from "@/lib/workspace/report-view";

/**
 * A month, closed.
 *
 * The figures Navio read, laid out the way a finance lead reads them: what came
 * in, what went out, what is left, and how each of those moved since last month.
 * Every line names the tool it was read from — a subscription total from the
 * payment tool and an invoice lifted out of a mail thread are different kinds of
 * fact, and the report keeps them distinguishable rather than blending them into
 * one confident number.
 *
 * Nothing here is estimated. A source Navio could not reach is listed as missing
 * at the bottom instead of being filled in with a plausible figure.
 */

export function FinanceReport({ report }: { report: FinanceReportView }) {
  const money = useMemo(() => moneyFormatter(report.currency), [report.currency]);

  const revenue = total(report.revenue);
  const expenses = total(report.expenses);
  const previousRevenue = totalPrevious(report.revenue);
  const previousExpenses = totalPrevious(report.expenses);
  const net = revenue - expenses;
  const previousNet = previousRevenue - previousExpenses;

  return (
    <section className="panel overflow-hidden" data-finance-report={report.month} aria-label={`Finance report, ${report.month}`}>
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--color-hairline)] px-4 py-3">
        <h3 className="text-[13.5px] font-semibold text-[var(--color-ink)]">{report.month}</h3>
        <p className="text-[11.5px] text-[var(--color-ink-faint)]">compared with {report.previous}</p>
      </header>

      {/* The headline: what the month actually left behind. */}
      <div className="grid gap-px bg-[var(--color-hairline)] sm:grid-cols-3">
        <Figure label="Revenue" value={money(revenue)} previous={previousRevenue} current={revenue} good="up" />
        <Figure label="Expenses" value={money(expenses)} previous={previousExpenses} current={expenses} good="down" />
        <Figure label="Net profit" value={money(net)} previous={previousNet} current={net} good="up" lead />
      </div>

      {report.history.length > 0 ? (
        <div className="border-t border-[var(--color-hairline)] px-4 py-4">
          <MonthlyBars history={report.history} currency={report.currency} />
        </div>
      ) : null}

      <Ledger title="Revenue" lines={report.revenue} money={money} tint={REVENUE} />
      <Ledger title="Expenses" lines={report.expenses} money={money} tint={EXPENSE} />

      <div className="flex items-baseline justify-between border-t border-[var(--color-hairline)] bg-[var(--color-raised)]/40 px-4 py-3">
        <span className="text-[12.5px] font-medium text-[var(--color-ink)]">Net profit, {report.month}</span>
        <span className="font-mono text-[14px] font-semibold text-[var(--color-ink)] tabular-nums">{money(net)}</span>
      </div>

      {report.missing && report.missing.length > 0 ? (
        <ul className="space-y-1 border-t border-[var(--color-hairline)] px-4 py-3">
          {report.missing.map((entry) => (
            <li key={entry} className="flex items-start gap-2 text-[12px] text-[var(--color-ink-muted)]">
              <Icon name="alert" size={13} className="mt-px shrink-0 text-[var(--color-stream-amber)]" />
              {entry}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** One headline figure, with the direction it moved and whether that is good. */
function Figure({
  label,
  value,
  current,
  previous,
  good,
  lead = false,
}: {
  label: string;
  value: string;
  current: number;
  previous: number;
  good: "up" | "down";
  lead?: boolean;
}) {
  const change = previous === 0 ? null : ((current - previous) / Math.abs(previous)) * 100;
  const up = current >= previous;
  const healthy = good === "up" ? up : !up;

  return (
    <div className="bg-[var(--color-panel)] px-4 py-3.5">
      <p className="text-[11.5px] text-[var(--color-ink-faint)]">{label}</p>
      <p
        className={`mt-1.5 font-mono font-semibold tabular-nums text-[var(--color-ink)] ${
          lead ? "text-[24px]" : "text-[19px]"
        }`}
      >
        {value}
      </p>
      {change === null ? null : (
        <p
          className={`mt-1 flex items-center gap-1 text-[11.5px] tabular-nums ${
            healthy ? "text-[#8ee6a4]" : "text-[#ff9aa8]"
          }`}
        >
          <Icon
            name="arrow-up-right"
            size={12}
            strokeWidth={2}
            className={up ? "" : "rotate-90"}
          />
          {(change > 0 ? "+" : "") + change.toFixed(1)}%
          <span className="text-[var(--color-ink-faint)]">vs last month</span>
        </p>
      )}
    </div>
  );
}

/** One side of the ledger: every line, where it was read, and how it moved. */
function Ledger({
  title,
  lines,
  money,
  tint,
}: {
  title: string;
  lines: ReportLineView[];
  money: (value: number) => string;
  tint: string;
}) {
  if (lines.length === 0) return null;
  const sum = total(lines);

  return (
    <div className="border-t border-[var(--color-hairline)]">
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
        <span className="h-2 w-2 rounded-[2px]" style={{ background: tint }} aria-hidden="true" />
        <h4 className="text-[12.5px] font-medium text-[var(--color-ink)]">{title}</h4>
        <span className="ml-auto font-mono text-[12.5px] text-[var(--color-ink-muted)] tabular-nums">{money(sum)}</span>
      </div>

      <table className="w-full border-collapse">
        <caption className="sr-only">
          {title}, with the tool each figure was read from and the change since last month
        </caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Line</th>
            <th scope="col">Source</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const change =
              line.previousAmount === undefined || line.previousAmount === 0
                ? null
                : ((line.amount - line.previousAmount) / Math.abs(line.previousAmount)) * 100;

            return (
              <tr key={`${line.label}-${line.source}`} className="border-t border-[var(--color-hairline)]/70">
                <td className="py-2 pr-2 pl-4 align-top">
                  <span className="block text-[12.5px] text-[var(--color-ink)]">{line.label}</span>
                  {line.detail ? (
                    <span className="mt-0.5 block truncate text-[11px] text-[var(--color-ink-faint)]">
                      {line.detail}
                    </span>
                  ) : null}
                </td>
                <td className="w-[34%] py-2 pr-2 align-top">
                  <span className="flex items-center gap-1.5">
                    <ServiceLogo slug={line.source} name={line.sourceName} logo={line.logo} dark={line.dark} size={15} />
                    <span className="truncate text-[11.5px] text-[var(--color-ink-muted)]">{line.sourceName}</span>
                  </span>
                </td>
                <td className="py-2 pr-4 text-right align-top">
                  <span className="block font-mono text-[12.5px] text-[var(--color-ink)] tabular-nums">
                    {money(line.amount)}
                  </span>
                  {change === null ? null : (
                    <span className="mt-0.5 block font-mono text-[10.5px] text-[var(--color-ink-faint)] tabular-nums">
                      {(change > 0 ? "+" : "") + change.toFixed(0)}%
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function total(lines: Array<{ amount: number }>): number {
  return lines.reduce((sum, line) => sum + line.amount, 0);
}

function totalPrevious(lines: ReportLineView[]): number {
  return lines.reduce((sum, line) => sum + (line.previousAmount ?? 0), 0);
}
