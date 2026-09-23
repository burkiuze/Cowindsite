"use client";

import { useMemo, useState } from "react";
import { moneyFormatter } from "@/lib/money";
import { EXPENSE, REVENUE } from "./palette";

export type MonthPoint = { label: string; revenue: number; expenses: number };

/**
 * Revenue against expenses, month by month.
 *
 * One axis, one pair of bars per month, in a fixed order that never repaints:
 * revenue is always the first colour, expenses always the second, whichever way
 * the numbers go. The reading sits under the plot rather than on the bars —
 * labels drawn over two bars that close on each other are unreadable exactly
 * when the month is interesting — and follows the pointer across the chart.
 */
export function MonthlyBars({
  history,
  currency,
  title = "Six months, month by month",
}: {
  history: MonthPoint[];
  currency: string;
  title?: string;
}) {
  const money = useMemo(() => moneyFormatter(currency), [currency]);
  const compact = useMemo(() => moneyFormatter(currency, true), [currency]);
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
  const reading = history[hovered ?? last];

  return (
    <figure>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-[12px] font-medium text-[var(--color-ink)]">{title}</span>
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
              <text x={left - 8} y={y(ceiling * step) + 3.5} textAnchor="end" fontSize={10} fill="var(--color-ink-faint)">
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
            const dim = hovered !== null && hovered !== index;

            return (
              <g key={month.label} opacity={dim ? 0.45 : 1} style={{ transition: "opacity 140ms ease" }}>
                <path d={bar(revenueX, y(month.revenue), barWidth, top + plot - y(month.revenue))} fill={REVENUE} />
                <path d={bar(expenseX, y(month.expenses), barWidth, top + plot - y(month.expenses))} fill={EXPENSE} />
                <text
                  x={centre}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fill={index === (hovered ?? last) ? "var(--color-ink-muted)" : "var(--color-ink-faint)"}
                >
                  {month.label}
                </text>
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
        <span className="tabular-nums text-[var(--color-ink-faint)]">Net {money(reading.revenue - reading.expenses)}</span>
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

/** A bar with rounded data-ends, square where it meets the baseline. */
export function bar(x: number, y: number, width: number, height: number, radius = 4): string {
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
export function niceCeiling(peak: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(peak));
  return Math.ceil(peak / (magnitude / 2)) * (magnitude / 2);
}
