"use client";

import { useMemo, useState } from "react";
import { moneyFormatter, change, signed } from "@/lib/money";
import { niceCeiling } from "./MonthlyBars";
import { REVENUE } from "./palette";

export type CashPoint = { label: string; cash: number };

/**
 * Cash on hand, month by month.
 *
 * One series, so no legend box — the title names it. A crosshair rather than a
 * label on every point: the shape is the message, and the exact figure is one
 * hover away. The area under the line is the same hue at low opacity, which is
 * fill, not a second series.
 */
export function CashTrend({ points, currency }: { points: CashPoint[]; currency: string }) {
  const money = useMemo(() => moneyFormatter(currency), [currency]);
  const compact = useMemo(() => moneyFormatter(currency, true), [currency]);
  const [hovered, setHovered] = useState<number | null>(null);

  if (points.length < 2) return null;

  const width = 640;
  const height = 208;
  const left = 52;
  const right = 12;
  const top = 16;
  const bottom = 26;

  const ceiling = niceCeiling(Math.max(...points.map((point) => point.cash), 1));
  const plot = height - top - bottom;
  const step = (width - left - right) / (points.length - 1);
  const x = (index: number) => left + step * index;
  const y = (value: number) => top + plot - (value / ceiling) * plot;

  const line = points.map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point.cash)}`).join(" ");
  const area = `${line} L ${x(points.length - 1)} ${top + plot} L ${x(0)} ${top + plot} Z`;

  const last = points.length - 1;
  const reading = points[hovered ?? last];
  const before = points[(hovered ?? last) - 1];
  const move = before ? change(reading.cash, before.cash) : null;

  return (
    <figure>
      <figcaption className="text-[12px] font-medium text-[var(--color-ink)]">Cash on hand, month by month</figcaption>

      <div className="relative mt-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block w-full"
          role="img"
          data-cash-chart=""
          aria-label={`Cash on hand over ${points.length} months. ${points
            .map((point) => `${point.label}: ${money(point.cash)}`)
            .join(". ")}`}
        >
          {[0, 0.5, 1].map((fraction) => (
            <g key={fraction}>
              <line
                x1={left}
                x2={width - right}
                y1={y(ceiling * fraction)}
                y2={y(ceiling * fraction)}
                stroke="var(--color-hairline)"
                strokeWidth={1}
              />
              <text
                x={left - 8}
                y={y(ceiling * fraction) + 3.5}
                textAnchor="end"
                fontSize={10}
                fill="var(--color-ink-faint)"
              >
                {compact(ceiling * fraction)}
              </text>
            </g>
          ))}

          <path d={area} fill={REVENUE} opacity={0.14} />
          <path d={line} fill="none" stroke={REVENUE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point, index) => {
            const active = index === (hovered ?? last);
            return (
              <g key={point.label}>
                {active ? (
                  <line
                    x1={x(index)}
                    x2={x(index)}
                    y1={top}
                    y2={top + plot}
                    stroke="var(--color-hairline)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                ) : null}
                {/* A 2px surface ring keeps the marker readable where it sits on the line. */}
                <circle
                  cx={x(index)}
                  cy={y(point.cash)}
                  r={active ? 5 : 3.5}
                  fill={REVENUE}
                  stroke="var(--color-panel)"
                  strokeWidth={2}
                />
                <text
                  x={x(index)}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fill={active ? "var(--color-ink-muted)" : "var(--color-ink-faint)"}
                >
                  {point.label}
                </text>
                <rect
                  x={x(index) - step / 2}
                  y={top}
                  width={step}
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
          <span className="tabular-nums">{money(reading.cash)}</span>
        </span>
        {move === null ? null : (
          <span className={`tabular-nums ${move >= 0 ? "text-[#8ee6a4]" : "text-[#ff9aa8]"}`}>
            {signed(move)} <span className="text-[var(--color-ink-faint)]">vs {before?.label}</span>
          </span>
        )}
      </p>
    </figure>
  );
}
