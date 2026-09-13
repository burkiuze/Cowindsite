import Link from "next/link";
import { NavioMark } from "@/components/brand/NavioMark";
import { Icon } from "@/components/ui/Icon";
import { MarketingNav } from "@/components/marketing/MarketingNav";

/**
 * Public shell. One header, one footer, and the app's own namespace kept
 * separate at /app so the marketing site owns the root.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-void)]">
      <MarketingNav />
      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--color-hairline)] bg-[var(--color-surface)]/50">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="flex flex-wrap items-start justify-between gap-10">
            <div className="max-w-xs">
              <Link href="/" className="focus-ring inline-flex items-center gap-2.5 rounded-lg">
                <NavioMark size={22} state="flow" />
                <span className="wordmark text-[16px]">Navio</span>
              </Link>
              <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--color-ink-faint)]">
                An AI work operating system. Ask for an outcome; Navio plans it, runs it, and holds anything
                consequential for a human decision.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-14 gap-y-6 sm:grid-cols-3">
              <FooterColumn
                title="Product"
                links={[
                  { href: "/platform", label: "Platform" },
                  { href: "/integrations", label: "Integrations" },
                  { href: "/access", label: "Request access" },
                ]}
              />
              <FooterColumn
                title="Company"
                links={[
                  { href: "/about", label: "About" },
                  { href: "/faq", label: "FAQ" },
                ]}
              />
              <FooterColumn
                title="System"
                links={[
                  { href: "/platform#control", label: "Guardrails" },
                  { href: "/faq", label: "FAQ" },
                  { href: "/api/health", label: "Status" },
                ]}
              />
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-[var(--color-hairline)] pt-6 text-[12px] text-[var(--color-ink-faint)]">
            <span>© {new Date().getFullYear()} Navio</span>
            <a
              href="mailto:info@heynavio.com"
              className="focus-ring rounded transition-colors hover:text-[var(--color-ink-muted)]"
            >
              info@heynavio.com
            </a>
            <span className="flex items-center gap-1.5">
              <Icon name="shield" size={13} />
              Nothing consequential happens without a human decision
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold tracking-[0.12em] text-[var(--color-ink-faint)] uppercase">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="focus-ring rounded text-[13px] text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
