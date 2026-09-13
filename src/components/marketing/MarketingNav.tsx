"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WindMark } from "@/components/brand/WindMark";
import { Icon } from "@/components/ui/Icon";

const LINKS = [
  { href: "/platform", label: "Platform" },
  { href: "/integrations", label: "Integrations" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-hairline)] bg-[var(--color-void)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[62px] w-full max-w-6xl items-center gap-3 px-6">
        <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-lg">
          <WindMark size={25} state="flow" priority />
          <span className="text-[15.5px] font-semibold tracking-[-0.02em]">Cowind</span>
        </Link>

        <nav className="ml-9 hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`focus-ring rounded text-[13.5px] transition-colors ${
                pathname === link.href
                  ? "text-[var(--color-ink)]"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/faq"
            className="focus-ring hidden rounded-lg px-3 py-2 text-[13px] text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)] sm:block"
          >
            How it works
          </Link>
          <Link
            href="/access"
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] px-3.5 py-2 text-[13px] font-medium text-[#04121a] transition-opacity hover:opacity-90"
          >
            Request access
            <Icon name="arrow-right" size={14} strokeWidth={2} />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="focus-ring rounded-lg p-2 text-[var(--color-ink-muted)] md:hidden"
            aria-label="Menu"
            aria-expanded={open}
          >
            <Icon name={open ? "close" : "menu"} size={18} />
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-[var(--color-hairline)] px-6 py-3 md:hidden">
          <ul className="space-y-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="focus-ring block rounded-lg px-2 py-2 text-[14px] text-[var(--color-ink-muted)] hover:bg-[var(--color-panel)] hover:text-[var(--color-ink)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
