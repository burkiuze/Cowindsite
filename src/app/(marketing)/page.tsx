import Link from "next/link";
import { WindMark } from "@/components/brand/WindMark";
import { StreamField } from "@/components/app/StreamField";
import { Icon, type IconName } from "@/components/ui/Icon";
import { BrandIcon } from "@/components/app/BrandIcon";
import { INTEGRATIONS } from "@/lib/workspace/integrations";

export const metadata = {
  title: "Cowind — the AI work operating system",
  description:
    "Ask for an outcome. Wind plans the work, runs it across specialists and your connected tools, holds anything consequential for approval, and reports exactly what it did.",
};

const LOOP: Array<{ step: string; title: string; body: string; icon: IconName }> = [
  {
    step: "01",
    title: "Ask",
    body: "Describe the outcome in your own words — “prepare everything for tomorrow's product meeting”. No prompt craft, no tool picking.",
    icon: "wind",
  },
  {
    step: "02",
    title: "Plan",
    body: "Wind works out what it needs: which knowledge to read, which tools to touch, which work can run at the same time, and what needs a human.",
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
    body: "Work that does not depend on other work runs at the same time, with every stream visible while it runs. A four-way review takes one pass, not four.",
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
  const featured = [
    "github", "slack", "linear", "notion", "gmail", "google-calendar", "stripe", "figma", "supabase", "salesforce",
  ]
    .map((id) => INTEGRATIONS.find((integration) => integration.id === id))
    .filter((integration): integration is (typeof INTEGRATIONS)[number] => Boolean(integration));

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[var(--color-void)]">
      <StreamField intensity={1} />

      {/* Header */}
      <header className="relative z-10 mx-auto flex h-[68px] w-full max-w-6xl items-center gap-3 px-6">
        <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-lg">
          <WindMark size={26} state="flow" priority />
          <span className="text-[15.5px] font-semibold tracking-[-0.02em]">Cowind</span>
        </Link>
        <nav className="ml-8 hidden items-center gap-6 text-[13.5px] text-[var(--color-ink-muted)] md:flex">
          <a href="#loop" className="focus-ring rounded transition-colors hover:text-[var(--color-ink)]">
            How it works
          </a>
          <a href="#system" className="focus-ring rounded transition-colors hover:text-[var(--color-ink)]">
            The system
          </a>
          <a href="#integrations" className="focus-ring rounded transition-colors hover:text-[var(--color-ink)]">
            Integrations
          </a>
        </nav>
        <Link
          href="/home"
          className="focus-ring ml-auto inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] px-3.5 py-2 text-[13px] font-medium text-[#04121a] transition-opacity hover:opacity-90"
        >
          Open workspace
          <Icon name="arrow-right" size={14} strokeWidth={2} />
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-20 pb-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-[var(--color-panel)] px-3 py-1.5 text-[12px] text-[var(--color-ink-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-stream-cyan)]" style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
          An AI work operating system, not another chat box
        </span>

        <h1 className="mx-auto mt-7 max-w-3xl text-[44px] leading-[1.05] font-semibold tracking-[-0.035em] text-[var(--color-ink)] sm:text-[58px]">
          Ask for the outcome.
          <br />
          <span className="text-gradient-stream">Wind does the work.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
          Cowind runs a company&apos;s work the way a good operator would: it plans, it delegates across specialists, it
          runs what it can at once, it stops before anything consequential, and it shows its receipts.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/wind"
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] px-5 py-2.5 text-[14px] font-medium text-[#04121a] transition-opacity hover:opacity-90"
          >
            Start with Wind
            <Icon name="arrow-right" size={15} strokeWidth={2} />
          </Link>
          <Link
            href="/home"
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-[var(--color-hairline)] px-5 py-2.5 text-[14px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
          >
            See a live workspace
          </Link>
        </div>

        {/* A run, as the product actually shows it. */}
        <div className="panel mx-auto mt-16 max-w-3xl overflow-hidden text-left">
          <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] px-4 py-3">
            <WindMark size={18} state="thinking" />
            <span className="text-[12.5px] text-[var(--color-ink-muted)]">Wind is working across 4 streams</span>
            <span className="ml-auto font-mono text-[11.5px] text-[var(--color-ink-faint)]">2/4</span>
          </div>
          <ul className="divide-y divide-[var(--color-hairline)]">
            {[
              { label: "Financial analysis", actor: "Wind Finance", state: "Completed", tone: "done" },
              { label: "Code architecture", actor: "Wind Code", state: "Running", tone: "run" },
              { label: "Market research", actor: "Wind Research", state: "Running", tone: "run" },
              { label: "Risk assessment", actor: "Wind Reasoning", state: "Waiting", tone: "wait" },
            ].map((lane) => (
              <li
                key={lane.label}
                className={`relative flex items-center gap-3 overflow-hidden px-4 py-2.5 ${
                  lane.tone === "run" ? "lane-running" : ""
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    lane.tone === "done"
                      ? "bg-[#6fdc8c]"
                      : lane.tone === "run"
                        ? "bg-[var(--color-stream-cyan)]"
                        : "border border-[#2b323c]"
                  }`}
                  style={lane.tone === "run" ? { animation: "pulse-dot 1.3s ease-in-out infinite" } : undefined}
                />
                <span className="text-[13px] text-[var(--color-ink)]">{lane.label}</span>
                <span className="text-[11.5px] text-[var(--color-ink-faint)]">{lane.actor}</span>
                <span className="ml-auto text-[11.5px] text-[var(--color-ink-muted)]">{lane.state}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 border-t border-[var(--color-hairline)] bg-[#1a1408] px-4 py-2.5">
            <Icon name="shield" size={14} className="text-[var(--color-stream-amber)]" />
            <span className="text-[12.5px] text-[var(--color-stream-amber)]">
              1 action prepared and held for approval — nothing was sent
            </span>
          </div>
        </div>
      </section>

      {/* The loop */}
      <section id="loop" className="relative z-10 border-t border-[var(--color-hairline)] bg-[var(--color-surface)]/60">
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
      <section id="system" className="relative z-10 border-t border-[var(--color-hairline)]">
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
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="relative z-10 border-t border-[var(--color-hairline)] bg-[var(--color-surface)]/60">
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
                Every connection reports its true state. If credentials are missing, it says so and Wind refuses to
                pretend the action happened.
              </p>
            </div>
            <Link
              href="/integrations"
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-hairline)] px-3.5 py-2 text-[13px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
            >
              All {INTEGRATIONS.length}
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>

          <ul className="mt-9 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {featured.map((integration) => (
              <li
                key={integration.id}
                className="panel group flex items-center gap-2.5 px-3.5 py-3 transition-colors hover:border-[#2b3d4a]"
              >
                <BrandIcon id={integration.id} name={integration.name} size={17} />
                <span className="truncate text-[12.5px] text-[var(--color-ink-muted)]">{integration.name}</span>
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
            Bring the workspace&rsquo;s knowledge, connect the tools you already use, and let Wind carry the parts that never
            needed a person.
          </p>
          <Link
            href="/home"
            className="focus-ring mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] px-5 py-2.5 text-[14px] font-medium text-[#04121a] transition-opacity hover:opacity-90"
          >
            Open the workspace
            <Icon name="arrow-right" size={15} strokeWidth={2} />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[var(--color-hairline)]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-6 py-7 text-[12.5px] text-[var(--color-ink-faint)]">
          <WindMark size={18} />
          <span>Cowind — an AI work operating system.</span>
          <span className="ml-auto">Wind holds anything consequential for a human decision.</span>
        </div>
      </footer>
    </div>
  );
}
