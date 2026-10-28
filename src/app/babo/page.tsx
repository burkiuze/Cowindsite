import { cookies } from "next/headers";
import { db, dbConfigured } from "@/lib/kronos/db";
import { ADMIN_COOKIE, adminSessionOk } from "@/lib/kronos/crypto";
import { globalDayLimitMicro, PLANS, planById, planLimits } from "@/lib/kronos/catalog";
import { accountView } from "@/lib/kronos/view";
import { LoginForm, ModelChecker, PromoForm } from "./forms";
import { logoutAction, setPlanAction, togglePromoAction } from "./actions";

export const metadata = { title: "Kronos operator", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const usd = (micro: number) => `$${(micro / 1_000_000).toFixed(micro >= 10_000_000 ? 0 : 2)}`;
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

/** Kronos Cloud operator panel: memberships, promo codes and the model catalogue. */
export default async function OperatorPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const jar = await cookies();
  if (!adminSessionOk(jar.get(ADMIN_COOKIE)?.value)) {
    return (
      <div className="mx-auto max-w-sm px-6 py-28">
        <h1 className="text-[22px] font-semibold">Kronos operator</h1>
        <p className="mt-1 text-[13.5px] text-[var(--color-ink-muted)]">Sign in to manage memberships and promo codes.</p>
        {process.env.KRONOS_ADMIN_PASSWORD_HASH ? <LoginForm /> : <p className="mt-6 text-[13px] text-[var(--color-stream-amber)]">KRONOS_ADMIN_PASSWORD_HASH is not set.</p>}
      </div>
    );
  }
  if (!dbConfigured()) {
    return <p className="mx-auto max-w-lg px-6 py-28 text-[14px] text-[var(--color-stream-amber)]">Kronos Cloud storage is not configured (KRONOS_SUPABASE_URL, KRONOS_SUPABASE_ANON_KEY, KRONOS_DB_SECRET).</p>;
  }

  const { q, page } = await searchParams;
  const pageNo = Math.max(Number(page) || 1, 1);
  const [stats, promos, accounts, dayMicro] = await Promise.all([db.admin.stats(), db.admin.listPromos(), db.admin.listAccounts(q?.trim() || null, 50, (pageNo - 1) * 50), db.globalSpend()]);
  const members = Object.values(stats.members ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold">Kronos operator</h1>
        <form action={logoutAction}>
          <button className="rounded-lg border border-[var(--color-hairline)] px-3 py-1.5 text-[13px] hover:bg-[var(--color-raised)]">Sign out</button>
        </form>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Accounts" value={String(stats.accounts)} />
        <Stat label="Active members" value={String(members)} detail={PLANS.map((p) => `${p.name} ${stats.members?.[p.id] ?? 0}`).join(" · ")} />
        <Stat label="Requests (7 days)" value={stats.requests_7d.toLocaleString("en-US")} />
        <Stat label="Upstream cost (7 days)" value={usd(stats.spent_7d_micro)} />
        <Stat
          label="Last 24 hours"
          value={`${usd(dayMicro)} of ${usd(globalDayLimitMicro())}`}
          detail={`Daily cap for the whole service (KRONOS_GLOBAL_DAY_USD). Pro: ${usd(planLimits("pro").fiveHourMicro)} per 5 hours, ${usd(planLimits("pro").weekMicro)} per week (KRONOS_PRO_5H_USD, KRONOS_PRO_WEEK_USD).`}
        />
      </section>

      <section className="panel mt-6 px-6 py-6">
        <h2 className="text-[16px] font-semibold">Create promo codes</h2>
        <p className="mt-1 mb-4 text-[13px] text-[var(--color-ink-muted)]">
          A code gives its plan for the number of days set. Redeeming the same plan again extends it; another plan replaces the current one.
        </p>
        <PromoForm plans={PLANS.map((p) => ({ id: p.id, name: p.name }))} />
      </section>

      <section className="panel mt-6 px-6 py-6">
        <h2 className="text-[16px] font-semibold">Promo codes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11.5px] tracking-wide text-[var(--color-ink-faint)] uppercase">
              <tr>
                <th className="py-2 pr-4 font-medium">Code</th>
                <th className="py-2 pr-4 font-medium">Plan</th>
                <th className="py-2 pr-4 font-medium">Days</th>
                <th className="py-2 pr-4 font-medium">Used</th>
                <th className="py-2 pr-4 font-medium">Until</th>
                <th className="py-2 pr-4 font-medium">Note</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.code} className={`border-t border-[var(--color-hairline)] ${p.active ? "" : "opacity-50"}`}>
                  <td className="py-2 pr-4 font-mono">{p.code}</td>
                  <td className="py-2 pr-4">{planById(p.plan)?.name ?? p.plan}</td>
                  <td className="py-2 pr-4">{p.duration_days ?? "no end"}</td>
                  <td className="py-2 pr-4">
                    {p.uses}
                    {p.max_uses ? ` / ${p.max_uses}` : ""}
                  </td>
                  <td className="py-2 pr-4">{day(p.expires_at)}</td>
                  <td className="max-w-[220px] truncate py-2 pr-4 text-[var(--color-ink-muted)]">{p.note ?? ""}</td>
                  <td className="py-2 text-right">
                    <form action={togglePromoAction}>
                      <input type="hidden" name="code" value={p.code} />
                      <input type="hidden" name="active" value={p.active ? "0" : "1"} />
                      <button className="rounded px-2 py-1 text-[12.5px] text-[var(--color-ink-muted)] hover:bg-[var(--color-raised)]">{p.active ? "Disable" : "Enable"}</button>
                    </form>
                  </td>
                </tr>
              ))}
              {!promos.length ? (
                <tr>
                  <td colSpan={7} className="py-4 text-[var(--color-ink-muted)]">
                    No codes yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel mt-6 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[16px] font-semibold">Accounts ({accounts.total})</h2>
          <form className="flex gap-2">
            <input name="q" defaultValue={q ?? ""} placeholder="Search email" className="rounded-lg border border-[var(--color-hairline)] bg-[var(--color-raised)] px-3 py-1.5 text-[13px]" />
            <button className="rounded-lg border border-[var(--color-hairline)] px-3 py-1.5 text-[13px]">Search</button>
          </form>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11.5px] tracking-wide text-[var(--color-ink-faint)] uppercase">
              <tr>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Plan</th>
                <th className="py-2 pr-4 font-medium">5h / week</th>
                <th className="py-2 pr-4 font-medium">30 days</th>
                <th className="py-2 pr-4 font-medium">Joined</th>
                <th className="py-2 font-medium">Set plan</th>
              </tr>
            </thead>
            <tbody>
              {accounts.rows.map((a) => {
                const v = accountView(a);
                return (
                  <tr key={a.user_id} className="border-t border-[var(--color-hairline)]">
                    <td className="py-2 pr-4">{a.email ?? a.user_id}</td>
                    <td className="py-2 pr-4">
                      {v.plan ? v.plan.name : "—"}
                      {v.plan && a.plan_expires_at ? <span className="text-[var(--color-ink-faint)]"> · {day(a.plan_expires_at)}</span> : null}
                    </td>
                    <td className="py-2 pr-4">{v.plan ? `${v.usage.fiveHour.percent}% / ${v.usage.week.percent}%` : "—"}</td>
                    <td className="py-2 pr-4">{usd(a.spent_30d_micro)}</td>
                    <td className="py-2 pr-4">{day(a.created_at)}</td>
                    <td className="py-2">
                      <form action={setPlanAction} className="flex gap-1.5">
                        <input type="hidden" name="userId" value={a.user_id} />
                        <select name="plan" defaultValue={v.plan?.id ?? ""} className="rounded border border-[var(--color-hairline)] bg-[var(--color-raised)] px-1.5 py-1 text-[12.5px]">
                          <option value="">None</option>
                          {PLANS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <input name="days" type="number" min={0} placeholder="days" className="w-16 rounded border border-[var(--color-hairline)] bg-[var(--color-raised)] px-1.5 py-1 text-[12.5px]" />
                        <button className="rounded px-2 py-1 text-[12.5px] text-[var(--color-ink-muted)] hover:bg-[var(--color-raised)]">Save</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {accounts.total > pageNo * 50 ? (
          <a href={`/babo?${new URLSearchParams({ ...(q ? { q } : {}), page: String(pageNo + 1) })}`} className="mt-3 inline-block text-[13px] underline">
            Next page
          </a>
        ) : null}
      </section>

      <section className="panel mt-6 px-6 py-6">
        <h2 className="text-[16px] font-semibold">Models</h2>
        <p className="mt-1 mb-4 text-[13px] text-[var(--color-ink-muted)]">
          Checks that each model and its pinned provider exist on OpenRouter. Correct a slug with KRONOS_MODEL_OVERRIDES.
          {stats.by_model_7d ? ` Last 7 days: ${Object.entries(stats.by_model_7d).map(([m, s]) => `${m} ${s.requests} req · ${usd(s.cost_micro)}`).join(" — ")}.` : ""}
        </p>
        <ModelChecker />
      </section>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="panel px-5 py-4">
      <p className="text-[12px] text-[var(--color-ink-faint)]">{label}</p>
      <p className="mt-1 text-[22px] font-semibold">{value}</p>
      {detail ? <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-muted)]">{detail}</p> : null}
    </div>
  );
}
