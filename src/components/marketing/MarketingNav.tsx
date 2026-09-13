"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WindMark } from "@/components/brand/WindMark";
import { Icon } from "@/components/ui/Icon";

const LINKS = [
  { href: "/platform", label: "Platform" },
  { href: "/integrations", label: "Integrations" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

/**
 * Navigation.
 *
 * A floating shell rather than a full-width bar, so the page reads as a
 * composition on a surface instead of a document with a header. It gains a
 * shadow only once you have scrolled, which is the moment it needs to separate
 * from the content underneath.
 */
export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // The page alternates dark and light bands. A dark pill floating over the
  // light one is unreadable, so the shell inverts while it is over porcelain.
  const [onLight, setOnLight] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const bands = Array.from(document.querySelectorAll(".band-light"));
    if (bands.length === 0 || typeof IntersectionObserver === "undefined") return;

    // Intersecting only while a band covers the strip the shell sits in.
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);
        setOnLight((current) => {
          const others = bands.some(
            (band) => band.getBoundingClientRect().top < 86 && band.getBoundingClientRect().bottom > 20,
          );
          return hit || others ? true : current && others;
        });
      },
      { rootMargin: "-20px 0px -100% 0px", threshold: 0 },
    );

    for (const band of bands) observer.observe(band);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div className="pointer-events-none sticky top-0 z-40 px-4 pt-4 sm:px-6 sm:pt-5">
      <div className="pointer-events-auto mx-auto flex w-full max-w-6xl items-center gap-3">
        <nav
          data-on-light={onLight ? "" : undefined}
          className={`nav-pill flex min-w-0 flex-1 items-center gap-1 py-2 pr-2 pl-3.5 transition-shadow duration-300 sm:gap-2 sm:pl-5 ${
            scrolled ? "shadow-[0_18px_40px_-24px_rgba(0,0,0,0.55)]" : ""
          }`}
        >
          <Link href="/" className="focus-ring flex shrink-0 items-center gap-2.5 rounded-full pr-1">
            <WindMark size={24} state="flow" priority />
            <span className="text-[15px] font-semibold tracking-[-0.02em]">Cowind</span>
          </Link>

          <span className="mx-2 hidden h-4 w-px bg-[var(--color-hairline)] md:block" />

          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`focus-ring rounded-full px-3 py-1.5 text-[13.5px] transition-colors ${
                    pathname === link.href
                      ? "bg-[var(--color-raised)] text-[var(--color-ink)]"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="focus-ring ml-auto rounded-full p-2 text-[var(--color-ink-muted)] md:hidden"
            aria-label="Menu"
            aria-expanded={open}
          >
            <Icon name={open ? "close" : "menu"} size={18} />
          </button>
        </nav>

        <Link
          href="/access"
          className={`focus-ring hidden shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-[13.5px] font-medium transition-transform hover:-translate-y-px sm:inline-flex ${
            onLight
              ? "bg-[var(--color-void)] text-[var(--color-ink)]"
              : "bg-[var(--color-porcelain)] text-[var(--color-on-light)]"
          }`}
        >
          Request access
          <Icon name="arrow-right" size={14} strokeWidth={2} />
        </Link>
      </div>

      {open ? (
        <nav className="pointer-events-auto mx-auto mt-2 w-full max-w-6xl rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-panel)] p-2 md:hidden">
          <ul className="space-y-0.5">
            {[...LINKS, { href: "/access", label: "Request access" }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="focus-ring block rounded-xl px-3 py-2.5 text-[14px] text-[var(--color-ink-muted)] hover:bg-[var(--color-raised)] hover:text-[var(--color-ink)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
