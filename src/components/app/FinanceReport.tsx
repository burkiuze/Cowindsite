"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ServiceLogo } from "@/components/app/ServiceLogo";
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

/** Two series, validated against this surface for normal and colour-blind vision. */
const REVENUE = "#3987e5";
const EXPENSE = "#d95926";

export function FinanceReport({ report }: { report: FinanceReportView }) {
  const money = useMemo(() => formatter(report.currency), [report.currency]);
  const compact = useMemo(() => formatter(report.currency, true), [report.currency]);

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

      <MonthlyChart history={report.history} money={money} compact={compact} />

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

/**
 * Six months, revenue against expenses.
 *
 * One axis, one pair of bars per month, in a fixed order that never repaints:
 * revenue is always the first colour, expenses always the second, whichever way
 * the numbers go. Only the latest month is labelled directly — the rest are
 * there to be read as a shape, and a number on every bar would drown it.
 */
function MonthlyChart({
  history,
  money,
  compact,
}: {
  history: FinanceReportView["history"];
  money: (value: number) => string;
  compact: (value: number) => string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  if (history.length === 0) return null;

  const width = 640;
  const height = 208;
  const left = 52;
  const right = 8;
  const top = 14;
  const bottom = 26;

  const peak = Math.max(...history.flatMap((month) => [month.revenue, month.expenses]), 1);
  const ceiling = niceCeiling(peak);
  const plot = height - top - bottom;
  const band = (width - left - right) / history.length;
  const barWidth = Math.min(20, band * 0.3);
  const gap = 2;

  const y = (value: number) => top + plot - (value / ceiling) * plot;
  const last = history.length - 1;
  const active = hovered;
  const reading = history[active ?? last];

  return (
    <figure className="border-t border-[var(--color-hairline)] px-4 py-4">
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-[12px] font-medium text-[var(--color-ink)]">Six months, month by month</span>
        <span className="flex items-center gap-3.5">
          <Key color={REVENUE} label="Revenue" />
          <Key color={EXPENSE} label="Expenses" />
        </span>
      </figcaption>

      <div className="relative mt-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block w-full"
          role="img"
          data-finance-chart=""
          aria-label={`Revenue and expenses for the last ${history.length} months. ${history
            .map((month) => `${month.label}: revenue ${money(month.revenue)}, expenses ${money(month.expenses)}`)
            .join(". ")}`}
        >
          {/* Recessive grid, labelled where a reader needs the scale. */}
          {[0, 0.5, 1].map((step) => (
            <g key={step}>
              <line
                x1={left}
                x2={width - right}
                y1={y(ceiling * step)}
                y2={y(ceiling * step)}
                stroke="var(--color-hairline)"
                strokeWidth={1}
              />
              <text
                x={left - 8}
                y={y(ceiling * step) + 3.5}
                textAnchor="end"
                fontSize={10}
                fill="var(--color-ink-faint)"
              >
                {compact(ceiling * step)}
              </text>
            </g>
          ))}
          {[0.25, 0.75].map((step) => (
            <line
              key={step}
              x1={left}
              x2={width - right}
              y1={y(ceiling * step)}
              y2={y(ceiling * step)}
              stroke="var(--color-hairline)"
              strokeWidth={1}
              opacity={0.55}
            />
          ))}

          {history.map((month, index) => {
            const centre = left + band * index + band / 2;
            const revenueX = centre - barWidth - gap / 2;
            const expenseX = centre + gap / 2;
            const dim = active !== null && active !== index;

            return (
              <g key={month.label} opacity={dim ? 0.45 : 1} style={{ transition: "opacity 140ms ease" }}>
                <path d={bar(revenueX, y(month.revenue), barWidth, top + plot - y(month.revenue))} fill={REVENUE} />
                <path d={bar(expenseX, y(month.expenses), barWidth, top + plot - y(month.expenses))} fill={EXPENSE} />

                <text
                  x={centre}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fill={index === (active ?? last) ? "var(--color-ink-muted)" : "var(--color-ink-faint)"}
                >
                  {month.label}
                </text>

                {/* A hit target the size of the band, not of the bars. */}
                <rect
                  x={left + band * index}
                  y={top}
                  width={band}
                  height={plot}
                  fill="transparent"
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered((current) => (current === index ? null : current))}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* One reading at a time, under the plot rather than on top of it: two
          labels drawn over the bars close on each other exactly when the months
          are interesting, and they cover the bars either side. Defaults to the
          latest month, and follows the pointer across the chart. */}
      <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px]">
        <span className="font-medium text-[var(--color-ink)]">{reading.label}</span>
        <span className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
          <span className="h-2 w-2 rounded-[2px]" style={{ background: REVENUE }} aria-hidden="true" />
          <span className="tabular-nums">{money(reading.revenue)}</span>
        </span>
        <span className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
          <span className="h-2 w-2 rounded-[2px]" style={{ background: EXPENSE }} aria-hidden="true" />
          <span className="tabular-nums">{money(reading.expenses)}</span>
        </span>
        <span className="text-[var(--color-ink-faint)] tabular-nums">
          Net {money(reading.revenue - reading.expenses)}
        </span>
      </p>
    </figure>
  );
}

function Key({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-muted)]">
      <span className="h-2 w-2 rounded-[2px]" style={{ background: color }} aria-hidden="true" />
      {label}
    </span>
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

/** A bar with rounded data-ends, square where it meets the baseline. */
function bar(x: number, y: number, width: number, height: number, radius = 4): string {
  const safe = Math.max(height, 0.5);
  const r = Math.min(radius, width / 2, safe);
  return [
    `M ${x} ${y + safe}`,
    `V ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    `H ${x + width - r}`,
    `A ${r} ${r} 0 0 1 ${x + width} ${y + r}`,
    `V ${y + safe}`,
    "Z",
  ].join(" ");
}

/** Round the top of the scale up so the grid lands on readable numbers. */
function niceCeiling(peak: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(peak));
  return Math.ceil(peak / (magnitude / 2)) * (magnitude / 2);
}

/**
 * Money, in the currency the report was written in. A currency code the browser
 * does not know is shown as a plain number rather than throwing away the report.
 */
function formatter(currency: string, short = false): (value: number) => string {
  const options: Intl.NumberFormatOptions = short
    ? { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }
    : { style: "currency", currency, maximumFractionDigits: 0 };
  try {
    const format = new Intl.NumberFormat("tr-TR", options);
    return (value) => format.format(value);
  } catch {
    const plain = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
    return (value) => `${plain.format(value)} ${currency}`;
  }
}
