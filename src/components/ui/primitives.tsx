import type { ReactNode } from "react";

/**
 * Shared surface primitives.
 *
 * Cowind's density comes from a small set of pieces used consistently: a panel
 * with a hairline border, a section header with an optional action, a status
 * pill, and a stat. Pages compose these rather than inventing their own.
 */

export function Panel({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <section className={`panel ${padded ? "p-5" : ""} ${className}`}>{children}</section>;
}

export function SectionHeader({
  title,
  hint,
  action,
  className = "",
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-[13px] font-semibold tracking-[0.06em] text-[var(--color-ink-muted)] uppercase">
          {title}
        </h2>
        {hint ? <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--color-hairline)] pb-6">
      <div className="min-w-0">
        <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

export type Tone = "neutral" | "running" | "success" | "warning" | "danger" | "info";

const TONE_STYLE: Record<Tone, string> = {
  neutral: "text-[var(--color-ink-muted)] bg-[var(--color-raised)] border-[var(--color-hairline)]",
  running: "text-[#7fdcff] bg-[#0c2733] border-[#164254]",
  success: "text-[#8ee6a4] bg-[#0e2417] border-[#1b4429]",
  warning: "text-[#ffcd6b] bg-[#2a2009] border-[#4a3812]",
  danger: "text-[#ff9aa8] bg-[#2c1015] border-[#4d1f27]",
  info: "text-[#a9b6ff] bg-[#131a33] border-[#232f56]",
};

export function Pill({
  children,
  tone = "neutral",
  dot = false,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11.5px] font-medium whitespace-nowrap ${TONE_STYLE[tone]} ${className}`}
    >
      {dot ? (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          style={tone === "running" ? { animation: "pulse-dot 1.4s ease-in-out infinite" } : undefined}
        />
      ) : null}
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  delta,
  tone = "neutral",
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: Tone;
}) {
  return (
    <div className="panel px-4 py-3.5">
      <div className="text-[11.5px] font-medium tracking-[0.04em] text-[var(--color-ink-faint)] uppercase">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[21px] leading-none font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          {value}
        </span>
        {delta ? <Pill tone={tone}>{delta}</Pill> : null}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel-quiet flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <p className="text-[14px] font-medium text-[var(--color-ink)]">{title}</p>
      <p className="max-w-md text-[13px] leading-relaxed text-[var(--color-ink-faint)]">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function relativeTime(timestamp: number): string {
  const delta = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (delta < minute) return "just now";
  if (delta < hour) return `${Math.floor(delta / minute)}m ago`;
  if (delta < day) return `${Math.floor(delta / hour)}h ago`;
  if (delta < 7 * day) return `${Math.floor(delta / day)}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
