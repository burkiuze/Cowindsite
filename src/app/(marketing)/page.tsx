import Link from "next/link";
import { WindMark } from "@/components/brand/WindMark";
import { StreamField } from "@/components/app/StreamField";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ServiceLogo } from "@/components/app/ServiceLogo";
import { CATALOG, featuredServices } from "@/lib/workspace/integrations";
import { RunDemo } from "@/components/marketing/RunDemo";

export const metadata = {
  title: "Cowind — the AI work operating system",
  description:
    "Ask for an outcome. Wind plans the work, runs it across specialists and your connected tools, holds anything consequential for approval, and reports exactly what it did.",
};

const LOOP: Array<{ step: string; title: string; body: string; icon: IconName }> = [
  {
    step: "01",
    title: "Ask",
    body: "Describe the outcome in your own words, in any language — “prepare everything for tomorrow's product meeting”. No prompt craft, no tool picking.",
    icon: "wind",
  },
  {
    step: "02",
    title: "Plan",
    body: "Wind works out what it needs: which knowledge to read, which tools to touch, what can run at the same time, and what needs a person.",
    icon: "flows",
  },
  {
    step: "03",
    title: "Act",
    body: "Independent work runs in parallel across specialists. Anything that would leave the workspace stops at an approval instead.",
    icon: "tasks",
  },
  {
    step: "04",
    title: "Report",
    body: "You get what was done, what was created, what is waiting, and what failed — with a trail you can audit line by line.",
    icon: "check",
  },
];

const PILLARS: Array<{ title: string; body: string; icon: IconName }> = [
  {
    title: "One assistant, many specialists",
    body: "Wind routes each request itself — engineering, finance, visual, long-context, extraction — and answers as one system. You never pick a model, because there is nothing to pick.",
    icon: "wind",
  },
  {
    title: "Parallel by default",
    body: "Work that does not depend on other work runs at the same time, every stream visible while it runs. A four-way review takes one pass, not four.",
    icon: "flows",
  },
  {
    title: "Approval before consequence",
    body: "Sending, publishing, merging, deleting, changing a record: prepared in full, held for a person, executed only on a yes, receipted either way.",
    icon: "shield",
  },
  {
    title: "Scoped company memory",
    body: "Knowledge belongs to departments and agents, not to everything. A finance source does not leak into an engineering run because they share a workspace.",
    icon: "knowledge",
  },
  {
    title: "Authority that cannot inflate",
    body: "An agent's permissions are intersected with the person who started it. An agent can be narrower than you. It can never be wider.",
    icon: "lock",
  },
  {
    title: "Honest about its tools",
    body: "An integration without credentials reads “not connected” and stays that way. Cowind never reports an action it did not take.",
    icon: "integrations",
  },
];

export default function LandingPage() {
  const featured = featuredServices();

  return (
    <div className="relative overflow-hidden">
      <StreamField intensity={1} />

      {/* Hero */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-20 pb-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-[var(--color-panel)] px-3 py-1.5 text-[12px] text-[var(--color-ink-muted)]">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[var(--color-stream-cyan)]"
            style={{ animation: "pulse-dot 2s ease-in-out infinite" }}
          />
          An AI work operating system, not another chat box
        </span>

        <h1 className="mx-auto mt-7 max-w-3xl text-[44px] leading-[1.05] font-semibold tracking-[-0.035em] text-[var(--color-ink)] sm:text-[58px]">
          Ask for the outcome.
          <br />
          <span className="text-gradient-stream">Wind does the work.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
          Cowind runs a company&apos;s work the way a good operator would: it plans, it delegates across specialists,
          it runs what it can at once, it stops before anything consequential, and it shows its receipts.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/app/wind"
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] px-5 py-2.5 text-[14px] font-medium text-[#04121a] transition-opacity hover:opacity-90"
          >
            Start with Wind
            <Icon name="arrow-right" size={15} strokeWidth={2} />
          </Link>
          <Link
            href="/app/home"
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-[var(--color-hairline)] px-5 py-2.5 text-[14px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
          >
            See a live workspace
          </Link>
        </div>

        <div className="mt-16">
          <RunDemo />
        </div>

        {/* Real marks, quietly: proof the catalogue is real. */}
        <div className="mt-14">
          <p className="text-[11.5px] font-medium tracking-[0.14em] text-[var(--color-ink-faint)] uppercase">
            Works with {CATALOG.length}+ services
          </p>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 opacity-80">
            {featured.slice(0, 14).map((service) => (
              <li key={service.slug} className="flex items-center gap-2">
                <ServiceLogo slug={service.slug} name={service.name} logo={service.logo} dark={service.dark} size={19} />
                <span className="text-[12.5px] text-[var(--color-ink-faint)]">{service.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The loop */}
      <section className="relative z-10 border-t border-[var(--color-hairline)] bg-[var(--color-surface)]/60">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="text-[13px] font-semibold tracking-[0.14em] text-[var(--color-ink-faint)] uppercase">
            The loop
          </h2>
          <p className="mt-3 max-w-2xl text-[22px] leading-snug font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Ask. Plan. Act. Report. The same four beats every time, whether the work takes six seconds or six minutes.
          </p>

          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {LOOP.map((item) => (
              <li key={item.step} className="panel relative px-5 py-5">
                <span className="font-mono text-[11.5px] text-[var(--color-ink-faint)]">{item.step}</span>
                <div className="mt-3 flex items-center gap-2.5">
                  <Icon name={item.icon} size={17} className="text-[var(--color-stream-cyan)]" />
                  <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">{item.title}</h3>
                </div>
                <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pillars */}
      <section className="relative z-10 border-t border-[var(--color-hairline)]">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="text-[13px] font-semibold tracking-[0.14em] text-[var(--color-ink-faint)] uppercase">
            The system
          </h2>
          <p className="mt-3 max-w-2xl text-[22px] leading-snug font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Everything underneath exists to make automated work safe enough to actually leave running.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((pillar) => (
              <article key={pillar.title} className="panel px-5 py-5">
                <Icon name={pillar.icon} size={18} className="text-[var(--color-stream-cyan)]" />
                <h3 className="mt-3.5 text-[14.5px] font-semibold text-[var(--color-ink)]">{pillar.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">{pillar.body}</p>
              </article>
            ))}
          </div>

          <Link
            href="/platform"
            className="focus-ring mt-8 inline-flex items-center gap-1.5 text-[13.5px] text-[var(--color-stream-cyan)]"
          >
            How the runtime works
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      </section>

      {/* Integrations */}
      <section className="relative z-10 border-t border-[var(--color-hairline)] bg-[var(--color-surface)]/60">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[13px] font-semibold tracking-[0.14em] text-[var(--color-ink-faint)] uppercase">
                Integrations
              </h2>
              <p className="mt-3 max-w-xl text-[22px] leading-snug font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
                Wind works where the work already is.
              </p>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
                {CATALOG.length} services in the catalogue. Every connection reports its true state — if credentials
                are missing, it says so, and Wind refuses to pretend the action happened.
              </p>
            </div>
            <Link
              href="/integrations"
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-hairline)] px-3.5 py-2 text-[13px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
            >
              Browse all {CATALOG.length}
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>

          <ul className="mt-9 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {featured.slice(0, 16).map((service) => (
              <li
                key={service.slug}
                className="panel flex items-center gap-2.5 px-3.5 py-3 transition-colors hover:border-[#2b3d4a]"
              >
                <ServiceLogo slug={service.slug} name={service.name} logo={service.logo} dark={service.dark} size={20} />
                <span className="truncate text-[12.5px] text-[var(--color-ink-muted)]">{service.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Close */}
      <section className="relative z-10 border-t border-[var(--color-hairline)]">
        <div className="mx-auto w-full max-w-6xl px-6 py-24 text-center">
          <WindMark size={44} state="flow" className="mx-auto" />
          <h2 className="mt-6 text-[30px] leading-tight font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
            Put your work on Cowind
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
            Bring the workspace&rsquo;s knowledge, connect the tools you already use, and let Wind carry the parts that
            never needed a person.
          </p>
          <Link
            href="/app/home"
            className="focus-ring mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] px-5 py-2.5 text-[14px] font-medium text-[#04121a] transition-opacity hover:opacity-90"
          >
            Open the workspace
            <Icon name="arrow-right" size={15} strokeWidth={2} />
          </Link>
        </div>
      </section>
    </div>
  );
}
