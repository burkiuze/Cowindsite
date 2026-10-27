import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/components/kronos/theme";
import { clerkConfigured, siteAccount } from "@/lib/kronos/session";
import { SITE_PATH } from "@/lib/kronos/catalog";

// the header shows who is signed in, so every page here renders per request
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Kronos Agent", template: "%s · Kronos Agent" },
  description:
    "Kronos is an open agent for your terminal, desktop and chat apps. Bring your own API keys, or use Kronos Cloud models with a membership.",
  openGraph: { title: "Kronos Agent", url: SITE_PATH, siteName: "Kronos Agent", images: [{ url: "/kronos/kronos-512.png", width: 512, height: 512 }] },
};

/**
 * Kronos Agent lives under heynavio.com/kronosagent with its own header and
 * footer. Clerk wraps it only when keys are configured, so the public page
 * still renders on a deployment where sign-in is not set up yet.
 */
export default async function KronosLayout({ children }: { children: React.ReactNode }) {
  const shell = (
    <div className="flex min-h-dvh flex-col bg-[var(--color-void)]">
      <KronosNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--color-hairline)]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-8 text-[12.5px] text-[var(--color-ink-faint)]">
          <span>© {new Date().getFullYear()} Kronos Agent · a Navio product</span>
          <a className="hover:text-[var(--color-ink-muted)]" href="https://github.com/burkiuze/KronosAgent">
            GitHub
          </a>
          <a className="hover:text-[var(--color-ink-muted)]" href="mailto:info@heynavio.com">
            info@heynavio.com
          </a>
        </div>
      </footer>
    </div>
  );
  if (!clerkConfigured()) return shell;
  return (
    <ClerkProvider appearance={clerkAppearance} signInUrl={`${SITE_PATH}/sign-in`} signUpUrl={`${SITE_PATH}/sign-up`} afterSignOutUrl={SITE_PATH}>
      {shell}
    </ClerkProvider>
  );
}

async function KronosNav() {
  const me = await siteAccount().catch(() => null);
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-hairline)] bg-[var(--color-void)]/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-6">
        <Link href={SITE_PATH} className="flex items-center gap-2.5">
          <Image src="/kronos/kronos-128.png" alt="" width={26} height={26} className="rounded-md" />
          <span className="text-[15px] font-semibold tracking-tight">Kronos Agent</span>
        </Link>
        <nav className="hidden items-center gap-5 text-[13px] text-[var(--color-ink-muted)] sm:flex">
          <Link href={`${SITE_PATH}#models`} className="hover:text-[var(--color-ink)]">
            Models
          </Link>
          <Link href={`${SITE_PATH}#plans`} className="hover:text-[var(--color-ink)]">
            Plans
          </Link>
          <Link href={`${SITE_PATH}#install`} className="hover:text-[var(--color-ink)]">
            Install
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 text-[13px]">
          {me ? (
            <Link href={`${SITE_PATH}/account`} className="rounded-lg border border-[var(--color-hairline)] px-3 py-1.5 hover:bg-[var(--color-raised)]">
              {me.email ?? "Account"}
            </Link>
          ) : (
            <>
              <Link href={`${SITE_PATH}/sign-in`} className="rounded-lg px-3 py-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
                Sign in
              </Link>
              <Link href={`${SITE_PATH}/sign-up`} className="rounded-lg bg-[var(--color-porcelain)] px-3 py-1.5 font-medium text-[var(--color-on-light)] hover:opacity-90">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
