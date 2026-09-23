import Link from "next/link";
import { currentSession } from "@/lib/workspace/session";
import { can } from "@/lib/workspace/rbac";
import { allServices } from "@/lib/workspace/integrations";
import {
  financeSnapshot,
  receivableState,
  runwayMonths,
  sum,
  sumPrevious,
  type Commitment,
  type Receivable,
} from "@/lib/workspace/finance";
import { moneyFormatter, change, signed } from "@/lib/money";
import { EmptyState, PageHeader, Panel, Pill, SectionHeader } from "@/components/ui/primitives";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ServiceLogo } from "@/components/app/ServiceLogo";
import { MonthlyBars } from "@/components/app/charts/MonthlyBars";
import { CashTrend } from "@/components/app/charts/CashTrend";
import { EXPENSE, REVENUE } from "@/components/app/charts/palette";

export const dynamic = "force-dynamic";
export const metadata = { title: "Finance" };

/**
 * Navio Finance.
 *
 * The month, already read. Nobody asks for this page's contents: Navio reads the
 * payment tool, the mailbox and the ledger on its own schedule and lays the
 * result out here — position, where the money came from and went, what is still
 * owed, what is committed to vendors, and where revenue is leaking.
 *
 * Two things this page will not do. It does not estimate: anything Navio could
 * not reach is named at the bottom and left out of every total above it. And it
 * does not act: every figure here was read, and the decisions it surfaces
 * (chase this invoice, give notice on that contract) are handed to a person.
 */
export default async function FinancePage() {
  const session = await currentSession();

  if (!can(session.role, "finance:read")) {
    return (
      <div className="mx-auto w-full max-w-5xl px-8 py-10">
        <PageHeader title="Finance" description="The ledger, as Navio reads it." />
        <div className="mt-7">
          <EmptyState
            title="Finance is scoped to the finance department"
            description="Your role does not include finance:read in this workspace. An owner or admin can grant it — permissions here are the same ones an agent inherits, so widening this widens what an agent started by you could reach."
            action={
              <Link
                href="/app/team"
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-hairline)] px-3 py-1.5 text-[12.5px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b323c] hover:text-[var(--color-ink)]"
              >
                <Icon name="team" size={13} />
                See who can grant it
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const snapshot = financeSnapshot();
  const services = new Map(allServices().map((service) => [service.slug, service]));
  const money = moneyFormatter(snapshot.currency);

  const revenue = sum(snapshot.revenue);
  const expenses = sum(snapshot.expenses);
  const previousRevenue = sumPrevious(snapshot.revenue);
  const previousExpenses = sumPrevious(snapshot.expenses);
  const net = revenue - expenses;
  const previousNet = previousRevenue - previousExpenses;

  const runway = runwayMonths(snapshot.cash, snapshot.burn);
  const outstanding = sum(snapshot.receivables);
  const overdue = snapshot.receivables.filter((entry) => entry.overdueDays > 0);
  const atRisk = snapshot.receivables.filter((entry) => receivableState(entry) === "at-risk");
  const leak = sum(snapshot.leaks);
  const margin = revenue > 0 ? (net / revenue) * 100 : 0;
  const previousMargin = previousRevenue > 0 ? (previousNet / previousRevenue) * 100 : 0;

  // Three things the figures above say are waiting on a person, picked by size
  // and by deadline rather than by opinion: the notice window that closes first,
  // the invoice that has been owed longest, and the biggest recoverable leak.
  const closing = [...snapshot.commitments].sort((a, b) => a.noticeBy.localeCompare(b.noticeBy))[0];
  const oldest = [...snapshot.receivables].sort((a, b) => b.overdueDays - a.overdueDays)[0];
  const biggestLeak = [...snapshot.leaks].sort((a, b) => b.amount - a.amount)[0];

  const attention: Array<{ icon: IconName; tone: "warning" | "danger"; title: string; detail: string }> = [];
  if (closing) {
    const left = daysUntil(closing.noticeBy);
    attention.push({
      icon: "clock",
      tone: left <= 30 ? "danger" : "warning",
      title: `${closing.vendor} — notice window closes in ${days(left)}`,
      detail: `${closing.recommendation} Renewal ${new Date(closing.renewal).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}; miss the window and it renews as it is.`,
    });
  }
  if (oldest && oldest.overdueDays > 0) {
    attention.push({
      icon: "alert",
      tone: receivableState(oldest) === "at-risk" ? "danger" : "warning",
      title: `${oldest.customer} is ${days(oldest.overdueDays)} late — ${money(oldest.amount)}`,
      detail: `${oldest.reference}${oldest.note ? ` · ${oldest.note}` : ""}. Navio can prepare the chase, but it will not send it on its own.`,
    });
  }
  if (biggestLeak) {
    attention.push({
      icon: "alert",
      tone: "warning",
      title: `${biggestLeak.label} — ${money(biggestLeak.amount)}`,
      detail: `${biggestLeak.detail}. Recoverable while the card is still live.`,
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-10">
      <PageHeader
        title="Finance"
        description="The month as Navio read it, from the tools the books already live in. Every figure names its source; nothing on this page was estimated, and nothing here was sent, paid or filed."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="info">{snapshot.period}</Pill>
            <Pill tone="neutral">vs {snapshot.previous}</Pill>
            <Pill tone="running" dot>
              Read {snapshot.reads[0]?.minutesAgo ?? 0}m ago
            </Pill>
          </div>
        }
      />

      {/* ------------------------------------------------------------ position */}
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Figure
          label="Cash on hand"
          value={money(snapshot.cash)}
          current={snapshot.cash}
          previous={snapshot.previousCash}
          good="up"
          footnote="Across the accounts Navio can read"
        />
        <Figure
          label="Net profit"
          value={money(net)}
          current={net}
          previous={previousNet}
          good="up"
          footnote={`${money(revenue)} in, ${money(expenses)} out`}
          lead
        />
        <Figure
          label="Runway"
          value={runway === null ? "—" : `${runway.toFixed(1)} months`}
          footnote={`${money(snapshot.cash)} ÷ ${money(snapshot.burn)} average net burn`}
        />
        <Figure
          label="Collectible pending"
          value={money(outstanding)}
          footnote={`${snapshot.receivables.length} open invoices · ${overdue.length} past due`}
          tone={atRisk.length > 0 ? "warning" : "neutral"}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Figure
          label="MRR"
          value={money(snapshot.mrr)}
          current={snapshot.mrr}
          previous={snapshot.previousMrr}
          good="up"
          footnote="Recurring subscriptions only"
          small
        />
        <Figure
          label="Net churn"
          value={`${snapshot.netChurn.toFixed(1)}%`}
          footnote="Revenue lost against expansion"
          small
        />
        <Figure
          label="Margin"
          value={`${margin.toFixed(1)}%`}
          // A percentage moves in points, not in percent of a percent: "+32.8%"
          // on a margin is arithmetically true and completely unreadable.
          delta={`${margin >= previousMargin ? "+" : ""}${(margin - previousMargin).toFixed(1)} pts`}
          deltaHealthy={margin >= previousMargin}
          footnote="Net profit over revenue"
          small
        />
        <Figure
          label="Revenue leak"
          value={money(leak)}
          footnote={`${snapshot.leaks.length} causes, all recoverable`}
          tone={leak > 0 ? "warning" : "neutral"}
          small
        />
      </div>

      {/* ----------------------------------------------------------- attention */}
      <Panel className="mt-3">
        <SectionHeader
          title="Needs attention"
          hint="Read off the figures above — each one is a decision a person still has to make"
        />
        <ul className="mt-4 grid gap-2.5 lg:grid-cols-3">
          {attention.map((item) => (
            <li key={item.title} className="panel-quiet flex gap-2.5 px-4 py-3.5">
              <Icon
                name={item.icon}
                size={15}
                className={`mt-px shrink-0 ${
                  item.tone === "danger" ? "text-[#ff9aa8]" : "text-[var(--color-stream-amber)]"
                }`}
              />
              <span className="min-w-0">
                <span className="block text-[12.5px] font-medium text-[var(--color-ink)]">{item.title}</span>
                <span className="mt-1 block text-[11.5px] leading-relaxed text-[var(--color-ink-muted)]">
                  {item.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* -------------------------------------------------------------- charts */}
      <div className="mt-6 grid items-start gap-3 xl:grid-cols-2">
        <Panel>
          <MonthlyBars history={snapshot.history} currency={snapshot.currency} />
        </Panel>
        <Panel>
          <CashTrend points={snapshot.cashTrend} currency={snapshot.currency} />
        </Panel>
      </div>

      {/* ------------------------------------------------------------- ledgers */}
      <div className="mt-3 grid items-start gap-3 xl:grid-cols-2">
        <Ledger
          title="Revenue"
          hint="Read from the payment tool and the invoices in the mailbox"
          tint={REVENUE}
          lines={snapshot.revenue}
          total={revenue}
          previousTotal={previousRevenue}
          money={money}
          services={services}
        />
        <Ledger
          title="Expenses"
          hint="Built from the bills that arrived by email, plus the ledger for payroll"
          tint={EXPENSE}
          lines={snapshot.expenses}
          total={expenses}
          previousTotal={previousExpenses}
          money={money}
          services={services}
        />
      </div>

      {/* --------------------------------------------------------- receivables */}
      <Panel className="mt-3" padded={false}>
        <div className="px-5 pt-5">
          <SectionHeader
            title="Who owes us"
            hint={`${money(outstanding)} across ${snapshot.receivables.length} invoices · ${money(
              sum(overdue),
            )} past due · ${money(sum(atRisk))} at risk`}
          />
        </div>
        <table className="mt-4 w-full border-collapse">
          <caption className="sr-only">Open invoices with their age and the tool each was read from</caption>
          <thead>
            <tr className="border-y border-[var(--color-hairline)] text-[11px] tracking-[0.04em] text-[var(--color-ink-faint)] uppercase">
              <th className="py-2 pr-2 pl-5 text-left font-medium">Invoice</th>
              <th className="py-2 pr-2 text-left font-medium">Customer</th>
              <th className="py-2 pr-2 text-left font-medium">Due</th>
              <th className="py-2 pr-2 text-left font-medium">State</th>
              <th className="py-2 pr-2 text-left font-medium">Source</th>
              <th className="py-2 pr-5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.receivables.map((entry) => (
              <ReceivableRow key={entry.id} entry={entry} money={money} services={services} />
            ))}
          </tbody>
        </table>
      </Panel>

      {/* --------------------------------------------------------- commitments */}
      <Panel className="mt-3">
        <SectionHeader
          title="What we are committed to"
          hint="Vendor contracts against what they are actually used for. Notice windows close before renewals do."
        />
        <ul className="mt-4 space-y-2.5">
          {snapshot.commitments.map((commitment) => (
            <li key={commitment.id}>
              <CommitmentRow commitment={commitment} money={money} />
            </li>
          ))}
        </ul>
      </Panel>

      {/* ---------------------------------------------------------------- leak */}
      <div className="mt-3 grid items-start gap-3 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <SectionHeader title="Revenue leak" hint="Money already earned that has not landed" />
          <ul className="mt-4 divide-y divide-[var(--color-hairline)]">
            {snapshot.leaks.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 py-2.5 first:pt-0">
                <ServiceLogo
                  slug={entry.source}
                  name={services.get(entry.source)?.name ?? entry.source}
                  logo={services.get(entry.source)?.logo ?? null}
                  dark={services.get(entry.source)?.dark ?? false}
                  size={18}
                />
                <span className="min-w-0">
                  <span className="block text-[12.5px] text-[var(--color-ink)]">{entry.label}</span>
                  <span className="block truncate text-[11.5px] text-[var(--color-ink-faint)]">{entry.detail}</span>
                </span>
                <span className="ml-auto font-mono text-[12.5px] text-[var(--color-ink)] tabular-nums">
                  {money(entry.amount)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-[var(--color-hairline)] pt-3">
            <span className="text-[12.5px] font-medium text-[var(--color-ink)]">Recoverable this month</span>
            <span className="font-mono text-[13.5px] font-semibold text-[var(--color-ink)] tabular-nums">
              {money(leak)}
            </span>
          </div>
        </Panel>

        {/* The honesty panel: what was read, when, and what could not be. */}
        <Panel>
          <SectionHeader title="Where these figures came from" hint="Every read is a read-only call on a connected tool" />
          <ul className="mt-4 divide-y divide-[var(--color-hairline)]">
            {snapshot.reads.map((read) => {
              const service = services.get(read.integrationId);
              return (
                <li key={read.integrationId} className="flex items-center gap-3 py-2.5 first:pt-0">
                  <ServiceLogo
                    slug={read.integrationId}
                    name={service?.name ?? read.integrationId}
                    logo={service?.logo ?? null}
                    dark={service?.dark ?? false}
                    size={20}
                  />
                  <span className="min-w-0">
                    <span className="block text-[12.5px] text-[var(--color-ink)]">{service?.name ?? read.integrationId}</span>
                    <span className="block truncate text-[11.5px] text-[var(--color-ink-faint)]">{read.what}</span>
                  </span>
                  <span className="ml-auto text-[11.5px] text-[var(--color-ink-faint)]">{read.minutesAgo}m ago</span>
                </li>
              );
            })}
          </ul>

          {snapshot.missing.map((entry) => (
            <p
              key={entry}
              className="mt-3 flex items-start gap-2 border-t border-[var(--color-hairline)] pt-3 text-[12px] leading-relaxed text-[var(--color-ink-muted)]"
            >
              <Icon name="alert" size={14} className="mt-px shrink-0 text-[var(--color-stream-amber)]" />
              {entry}
            </p>
          ))}

          <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-ink-faint)]">
            Navio reads these tools on its own. Anything that would send, pay, file or change a record — chasing an
            invoice, giving notice on a contract, emailing the board — is prepared and held for a person in{" "}
            <Link href="/app/approvals" className="focus-ring underline decoration-[var(--color-hairline)] underline-offset-2 hover:text-[var(--color-ink-muted)]">
              Approvals
            </Link>
            .
          </p>
        </Panel>
      </div>
    </div>
  );
}

/** One figure, with the direction it moved and the arithmetic behind it. */
function Figure({
  label,
  value,
  current,
  previous,
  good = "up",
  delta,
  deltaHealthy = true,
  footnote,
  tone = "neutral",
  lead = false,
  small = false,
}: {
  label: string;
  value: string;
  current?: number;
  previous?: number;
  good?: "up" | "down";
  /** Written out, for a figure whose move is not a percentage change. */
  delta?: string;
  deltaHealthy?: boolean;
  footnote?: string;
  tone?: "neutral" | "warning";
  lead?: boolean;
  small?: boolean;
}) {
  const move = current !== undefined && previous !== undefined ? change(current, previous) : null;
  const up = (current ?? 0) >= (previous ?? 0);
  const healthy = good === "up" ? up : !up;

  return (
    <div className="panel px-4 py-3.5">
      <p className="text-[11.5px] font-medium tracking-[0.04em] text-[var(--color-ink-faint)] uppercase">{label}</p>
      <p
        className={`mt-1.5 font-mono font-semibold tabular-nums ${
          tone === "warning" ? "text-[#ffcd6b]" : "text-[var(--color-ink)]"
        } ${lead ? "text-[24px]" : small ? "text-[17px]" : "text-[20px]"}`}
      >
        {value}
      </p>
      {move !== null || delta ? (
        <p
          className={`mt-1 flex items-center gap-1 text-[11.5px] tabular-nums ${
            (delta ? deltaHealthy : healthy) ? "text-[#8ee6a4]" : "text-[#ff9aa8]"
          }`}
        >
          <Icon
            name="arrow-up-right"
            size={12}
            strokeWidth={2}
            className={(delta ? deltaHealthy : up) ? "" : "rotate-90"}
          />
          {delta ?? signed(move ?? 0)}
          <span className="text-[var(--color-ink-faint)]">vs last month</span>
        </p>
      ) : null}
      {footnote ? <p className="mt-1.5 text-[11.5px] leading-snug text-[var(--color-ink-faint)]">{footnote}</p> : null}
    </div>
  );
}

type ServiceLike = { name: string; logo: string | null; dark: boolean };

/** One side of the ledger: every line, its share, where it was read, how it moved. */
function Ledger({
  title,
  hint,
  tint,
  lines,
  total,
  previousTotal,
  money,
  services,
}: {
  title: string;
  hint: string;
  tint: string;
  lines: Array<{ label: string; detail?: string; source: string; amount: number; previousAmount?: number }>;
  total: number;
  previousTotal: number;
  money: (value: number) => string;
  services: Map<string, ServiceLike>;
}) {
  const move = change(total, previousTotal);

  return (
    <section className="panel p-0">
      <div className="flex items-start gap-2.5 px-5 pt-5">
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-[2px]" style={{ background: tint }} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-semibold tracking-[0.06em] text-[var(--color-ink-muted)] uppercase">{title}</h2>
          <p className="mt-1 text-[12.5px] leading-snug text-[var(--color-ink-faint)]">{hint}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[15px] font-semibold text-[var(--color-ink)] tabular-nums">{money(total)}</p>
          {move === null ? null : (
            <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)] tabular-nums">{signed(move)}</p>
          )}
        </div>
      </div>

      <ul className="mt-4">
        {lines.map((line) => {
          const share = total > 0 ? (line.amount / total) * 100 : 0;
          const move = line.previousAmount ? change(line.amount, line.previousAmount) : null;
          const service = services.get(line.source);

          return (
            <li key={`${line.label}-${line.source}`} className="border-t border-[var(--color-hairline)] px-5 py-2.5">
              <div className="flex items-baseline gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-[var(--color-ink)]">{line.label}</span>
                  {line.detail ? (
                    <span className="block truncate text-[11px] text-[var(--color-ink-faint)]">{line.detail}</span>
                  ) : null}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <ServiceLogo
                    slug={line.source}
                    name={service?.name ?? line.source}
                    logo={service?.logo ?? null}
                    dark={service?.dark ?? false}
                    size={15}
                  />
                  <span className="hidden text-[11.5px] text-[var(--color-ink-muted)] sm:inline">
                    {service?.name ?? line.source}
                  </span>
                </span>
                <span className="w-[118px] shrink-0 text-right">
                  <span className="block font-mono text-[12.5px] text-[var(--color-ink)] tabular-nums">
                    {money(line.amount)}
                  </span>
                  {move === null ? null : (
                    <span className="block font-mono text-[10.5px] text-[var(--color-ink-faint)] tabular-nums">
                      {signed(move, 0)}
                    </span>
                  )}
                </span>
              </div>
              {/* Share of the side it belongs to: magnitude, one hue, no second axis. */}
              <span className="mt-2 block h-[3px] w-full overflow-hidden rounded-full bg-[var(--color-raised)]">
                <span className="block h-full rounded-full" style={{ width: `${share}%`, background: tint, opacity: 0.85 }} />
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ReceivableRow({
  entry,
  money,
  services,
}: {
  entry: Receivable;
  money: (value: number) => string;
  services: Map<string, ServiceLike>;
}) {
  const state = receivableState(entry);
  const service = services.get(entry.source);
  const due = new Date(entry.due).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

  return (
    <tr className="border-b border-[var(--color-hairline)] last:border-0">
      <td className="py-2.5 pr-2 pl-5 font-mono text-[12px] text-[var(--color-ink-muted)]">{entry.reference}</td>
      <td className="py-2.5 pr-2">
        <span className="block text-[12.5px] text-[var(--color-ink)]">{entry.customer}</span>
        {entry.note ? <span className="block text-[11px] text-[var(--color-ink-faint)]">{entry.note}</span> : null}
      </td>
      <td className="py-2.5 pr-2 text-[12px] whitespace-nowrap text-[var(--color-ink-muted)] tabular-nums">{due}</td>
      <td className="py-2.5 pr-2">
        {/* State is never colour alone: each pill carries its own words. */}
        {state === "at-risk" ? (
          <Pill tone="danger">{days(entry.overdueDays)} late</Pill>
        ) : state === "late" ? (
          <Pill tone="warning">{days(entry.overdueDays)} late</Pill>
        ) : (
          <Pill tone="neutral">Not due yet</Pill>
        )}
      </td>
      <td className="py-2.5 pr-2">
        <span className="flex items-center gap-1.5">
          <ServiceLogo
            slug={entry.source}
            name={service?.name ?? entry.source}
            logo={service?.logo ?? null}
            dark={service?.dark ?? false}
            size={15}
          />
          <span className="hidden text-[11.5px] text-[var(--color-ink-muted)] sm:inline">
            {service?.name ?? entry.source}
          </span>
        </span>
      </td>
      <td className="py-2.5 pr-5 text-right font-mono text-[12.5px] text-[var(--color-ink)] tabular-nums">
        {money(entry.amount)}
      </td>
    </tr>
  );
}

function CommitmentRow({ commitment, money }: { commitment: Commitment; money: (value: number) => string }) {
  const over = commitment.usage > 1;
  const monthly = commitment.annual / 12;
  const renewal = new Date(commitment.renewal).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const notice = new Date(commitment.noticeBy).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });

  return (
    <div className="panel-quiet px-4 py-3.5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[13px] font-medium text-[var(--color-ink)]">{commitment.vendor}</span>
        <span className="font-mono text-[12px] text-[var(--color-ink-muted)] tabular-nums">
          {money(commitment.annual)}/yıl · {money(monthly)}/ay
        </span>
        <span className="ml-auto flex items-center gap-2">
          {over ? <Pill tone="danger">{Math.round(commitment.usage * 100)}% of commitment</Pill> : null}
          {!over && commitment.usage < 0.8 ? (
            <Pill tone="warning">{Math.round(commitment.usage * 100)}% used</Pill>
          ) : null}
          {!over && commitment.usage >= 0.8 ? (
            <Pill tone="success">{Math.round(commitment.usage * 100)}% used</Pill>
          ) : null}
        </span>
      </div>

      {/* Usage against the commitment, with the commitment itself marked. */}
      <div className="relative mt-2.5 h-[6px] w-full overflow-hidden rounded-full bg-[var(--color-raised)]">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${Math.min(commitment.usage, 1.4) / 1.4 * 100}%`,
            background: over ? EXPENSE : REVENUE,
          }}
        />
        <span
          className="absolute top-0 bottom-0 w-px bg-[var(--color-ink-faint)]"
          style={{ left: `${(1 / 1.4) * 100}%` }}
          aria-hidden="true"
        />
      </div>

      <p className="mt-2 text-[11.5px] text-[var(--color-ink-faint)]">
        Renews {renewal} · notice by <span className="text-[var(--color-ink-muted)]">{notice}</span>
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">{commitment.recommendation}</p>
    </div>
  );
}

/** "1 day", "12 days" — a count that reads like a person wrote it. */
function days(count: number): string {
  return `${count} day${count === 1 ? "" : "s"}`;
}

/** Whole days from today to an ISO date; never negative. */
function daysUntil(iso: string): number {
  const delta = new Date(`${iso}T00:00:00`).getTime() - Date.now();
  return Math.max(0, Math.ceil(delta / (24 * 60 * 60 * 1000)));
}
