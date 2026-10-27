import Image from "next/image";
import { redirect } from "next/navigation";
import { SITE_PATH } from "@/lib/kronos/catalog";
import { createAuthCode, isLoopbackRedirect, validRedirect } from "@/lib/kronos/crypto";
import { clerkConfigured, siteAccount } from "@/lib/kronos/session";
import { NotConfigured } from "@/components/kronos/NotConfigured";

export const metadata = { title: "Connect Kronos", robots: { index: false } };
export const dynamic = "force-dynamic";

type Params = { redirect_uri?: string; state?: string; code_challenge?: string; client?: string };

function valid(p: Params): p is Required<Pick<Params, "redirect_uri" | "state" | "code_challenge">> & Params {
  return Boolean(
    p.redirect_uri && validRedirect(p.redirect_uri) && p.state && /^[A-Za-z0-9_-]{8,128}$/.test(p.state) && p.code_challenge && /^[A-Za-z0-9_-]{43}$/.test(p.code_challenge),
  );
}

function withQuery(uri: string, q: Record<string, string>): string {
  const u = new URL(uri);
  for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v);
  return u.toString();
}

/** Step one of connecting the app: the signed-in person agrees, and the browser carries a one-time code back to Kronos. */
async function approve(formData: FormData) {
  "use server";
  const p: Params = {
    redirect_uri: String(formData.get("redirect_uri") ?? ""),
    state: String(formData.get("state") ?? ""),
    code_challenge: String(formData.get("code_challenge") ?? ""),
  };
  if (!valid(p)) throw new Error("Invalid request.");
  const me = await siteAccount();
  if (!me) redirect(`${SITE_PATH}/sign-in`);
  const code = createAuthCode(me.userId, p.code_challenge, p.redirect_uri);
  redirect(withQuery(p.redirect_uri, { code, state: p.state }));
}

export default async function ConnectPage({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  if (!clerkConfigured()) return <NotConfigured />;
  if (!valid(p)) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-[22px] font-semibold">This link is not complete</h1>
        <p className="mt-3 text-[14px] text-[var(--color-ink-muted)]">Start signing in again from Kronos (Settings → Membership → Sign in).</p>
      </div>
    );
  }
  const me = await siteAccount();
  if (!me) {
    const back = `${SITE_PATH}/connect?${new URLSearchParams(p as Record<string, string>).toString()}`;
    redirect(`${SITE_PATH}/sign-in?redirect_url=${encodeURIComponent(back)}`);
  }
  const host = new URL(p.redirect_uri).host;
  const local = isLoopbackRedirect(p.redirect_uri);
  const client = (p.client ?? "Kronos").slice(0, 80);
  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <div className="panel px-6 py-7 text-center">
        <Image src="/kronos/kronos-128.png" alt="" width={56} height={56} className="mx-auto rounded-xl" />
        <h1 className="mt-5 text-[21px] font-semibold">Connect {client}</h1>
        <p className="mt-2 text-[14px] text-[var(--color-ink-muted)]">
          Signed in as <span className="text-[var(--color-ink)]">{me.email}</span>
        </p>
        <p className="mt-4 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
          Kronos at <span className="font-mono text-[var(--color-ink)]">{host}</span> will be able to use your Kronos Cloud membership and see your plan and usage.
        </p>
        {!local ? (
          <p className="mt-4 rounded-lg border border-[var(--color-stream-amber)]/40 bg-[var(--color-stream-amber)]/10 px-3 py-2.5 text-[13px] text-[var(--color-stream-amber)]">
            This is not this computer. Only continue if you started signing in from Kronos running at {host}.
          </p>
        ) : null}
        <form action={approve} className="mt-6 flex flex-col gap-2.5">
          <input type="hidden" name="redirect_uri" value={p.redirect_uri} />
          <input type="hidden" name="state" value={p.state} />
          <input type="hidden" name="code_challenge" value={p.code_challenge} />
          <button type="submit" className="rounded-lg bg-[var(--color-porcelain)] px-4 py-2.5 text-[14px] font-medium text-[var(--color-on-light)] hover:opacity-90">
            Connect
          </button>
          <a href={withQuery(p.redirect_uri, { error: "access_denied", state: p.state })} className="rounded-lg px-4 py-2.5 text-[13.5px] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
            Cancel
          </a>
        </form>
      </div>
    </div>
  );
}
