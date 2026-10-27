import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { db } from "@/lib/kronos/db";
import { SITE_PATH } from "@/lib/kronos/catalog";
import { clerkConfigured, siteAccount } from "@/lib/kronos/session";
import { accountView } from "@/lib/kronos/view";
import { NotConfigured } from "@/components/kronos/NotConfigured";
import { RedeemForm } from "./RedeemForm";
import { revokeAction } from "./actions";

export const metadata = { title: "Account", robots: { index: false } };
export const dynamic = "force-dynamic";

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

export default async function AccountPage() {
  if (!clerkConfigured()) return <NotConfigured />;
  const me = await siteAccount();
  if (!me) redirect(`${SITE_PATH}/sign-in?redirect_url=${encodeURIComponent(`${SITE_PATH}/account`)}`);
  const view = accountView(me.account);
  const tokens = await db.listTokens(me.userId);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Your account</h1>
          <p className="mt-1 text-[14px] text-[var(--color-ink-muted)]">{me.email}</p>
        </div>
        <SignOutButton redirectUrl={SITE_PATH}>
          <button className="rounded-lg border border-[var(--color-hairline)] px-3 py-1.5 text-[13px] hover:bg-[var(--color-raised)]">Sign out</button>
        </SignOutButton>
      </div>

      <section className="panel mt-8 px-6 py-6">
        <h2 className="text-[13px] font-medium tracking-wide text-[var(--color-ink-faint)] uppercase">Membership</h2>
        {view.plan ? (
          <>
            <p className="mt-2 text-[22px] font-semibold">{view.plan.name}</p>
            <p className="text-[13.5px] text-[var(--color-ink-muted)]">{view.planExpiresAt ? `Active until ${fmtDate(view.planExpiresAt)}` : "Active"}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Meter label="This 5-hour session" pct={view.usage.fiveHour.percent} resets={view.usage.fiveHour.resetsAt} />
              <Meter label="This week" pct={view.usage.week.percent} resets={view.usage.week.resetsAt} />
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-[18px] font-semibold">No membership</p>
            <p className="mt-1 text-[13.5px] text-[var(--color-ink-muted)]">
              Kronos Cloud models need a Lite, Pro, Max or Max 5 membership. You can always use Kronos with your own API keys.
            </p>
          </>
        )}
        <div className="mt-6 border-t border-[var(--color-hairline)] pt-5">
          <h3 className="text-[14px] font-medium">Redeem a promo code</h3>
          <RedeemForm />
        </div>
      </section>

      <section className="panel mt-6 px-6 py-6">
        <h2 className="text-[13px] font-medium tracking-wide text-[var(--color-ink-faint)] uppercase">Connected apps</h2>
        {tokens.length ? (
          <ul className="mt-3 divide-y divide-[var(--color-hairline)]">
            {tokens.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px]">{t.label || "Kronos"}</p>
                  <p className="text-[12.5px] text-[var(--color-ink-faint)]">
                    Connected {fmtDate(t.created_at)}
                    {t.last_used_at ? ` · last used ${fmtTime(t.last_used_at)}` : ""}
                  </p>
                </div>
                <form action={revokeAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="rounded-lg px-3 py-1.5 text-[13px] text-[var(--color-ink-muted)] hover:bg-[var(--color-raised)] hover:text-[var(--color-stream-pink)]">Disconnect</button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[13.5px] text-[var(--color-ink-muted)]">No apps yet. In Kronos, open Settings → Membership and choose Sign in.</p>
        )}
      </section>
    </div>
  );
}

function Meter({ label, pct, resets }: { label: string; pct: number; resets: string | null }) {
  return (
    <div>
      <div className="flex justify-between text-[13px]">
        <span>{label}</span>
        <span className="text-[var(--color-ink-muted)]">{pct}% used</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-raised)]">
        <div className={`h-full rounded-full ${pct >= 90 ? "bg-[var(--color-stream-pink)]" : "bg-[var(--color-stream-cyan)]"}`} style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }} />
      </div>
      <p className="mt-1.5 text-[12px] text-[var(--color-ink-faint)]">{resets ? `Resets ${fmtTime(resets)}` : "Starts with your next request"}</p>
    </div>
  );
}
