import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/components/kronos/theme";
import { clerkConfigured } from "@/lib/kronos/session";
import { SITE_PATH } from "@/lib/kronos/catalog";
import "./kronos.css";

// the hero puts the visitor's own system first, and the app's sign-in pages are per request
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Kronos Agent", template: "%s · Kronos Agent" },
  description:
    "Kronos is an open agent for your terminal, desktop and chat apps. Bring your own API keys, or use Kronos Cloud models with a membership.",
  openGraph: { title: "Kronos Agent", url: SITE_PATH, siteName: "Kronos Agent", images: [{ url: "/kronos/img/og.jpg", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Kronos Agent", images: ["/kronos/img/og.jpg"] },
};

/**
 * Kronos Agent lives under heynavio.com/kronosagent in its own identity — the
 * night-blue ground, the blue frame and the engraved art of kronos-agent.vercel.app.
 * People sign in from the app, not the site: the sign-in and connect pages here are
 * what the app opens, so they are not linked from the page. Clerk wraps them only
 * when keys are configured.
 */
export default async function KronosLayout({ children }: { children: React.ReactNode }) {
  const shell = (
    <div className="kx">
      <div className="kx-frame" aria-hidden="true" />
      <div className="kx-frame-corner" aria-hidden="true" />
      <KronosNav />
      <main style={{ flex: 1 }}>{children}</main>
      <footer className="kx-footer">
        <Image className="kx-footer-bg" src="/kronos/img/footer-banner.webp" alt="" fill sizes="100vw" />
        <div className="kx-footer-inner">
          <div className="kx-footer-word">Kronos Agent</div>
          <div className="kx-footer-links">
            <a href="https://github.com/burkiuze/KronosAgent">GitHub</a>
            <a href="https://github.com/burkiuze/KronosAgent#readme">Docs</a>
            <a href="mailto:info@heynavio.com">info@heynavio.com</a>
            <span>© {new Date().getFullYear()} · a Navio product</span>
          </div>
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

function KronosNav() {
  return (
    <header className="kx-header">
      <div className="kx-bar">
        <Link href={SITE_PATH} className="kx-wordmark">
          <Image src="/kronos/kronos-128.png" alt="" width={30} height={30} />
          Kronos Agent
        </Link>
        <nav className="kx-nav" aria-label="Kronos">
          <Link href={`${SITE_PATH}#why`}>Why</Link>
          <Link href={`${SITE_PATH}#keys`}>Your keys</Link>
          <Link href={`${SITE_PATH}#start`}>Get started</Link>
          <Link href={`${SITE_PATH}#models`}>Cloud</Link>
        </nav>
        <div className="kx-bar-end">
          <Link href={`${SITE_PATH}#download`} className="kx-btn blue">
            Download
          </Link>
        </div>
      </div>
    </header>
  );
}
