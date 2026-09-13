import Link from "next/link";
import { Spheres } from "@/components/marketing/Spheres";
import { CountUp } from "@/components/marketing/CountUp";
import { LogoRiver } from "@/components/marketing/LogoRiver";
import { ProductVideo } from "@/components/marketing/ProductVideo";
import { Reveal } from "@/components/marketing/Reveal";
import { StepFlow } from "@/components/marketing/StepFlow";
import { ServiceLogo } from "@/components/app/ServiceLogo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { NavioMark } from "@/components/brand/NavioMark";
import { CATALOG, allServices, featuredServices } from "@/lib/workspace/integrations";
import { LIMITS } from "@/lib/wind/config";

export const metadata = {
  title: "Navio — the AI work operating system",
  description:
    "Ask for an outcome. Navio reads the tools it is allowed to read, runs the work across specialists, holds anything consequential for approval, and reports exactly what it did.",
};

const STEPS = [
  {
    n: "01",
    title: "Ask",
    body: "Describe the outcome in your own words, in any language. Nobody picks a model, writes a prompt template, or decides which tool should be involved — that is the system's job.",
  },
  {
    n: "02",
    title: "Look",
    body: "Navio reads what it is allowed to read: the calendar, the mail threads, the workspace notes, the repository. Read-only, on connected services only, and every lookup is shown to you as it happens.",
  },
  {
    n: "03",
    title: "Act",
    body: "Independent work runs at the same time across specialists — engineering, finance, research, reasoning — each visible while it runs. Anything that would leave the workspace stops at an approval instead.",
  },
  {
    n: "04",
    title: "Report",
    body: "One answer in one voice, plus the trail: what ran, what it touched, what is waiting on a person, and the receipt for every action that actually happened.",
  },
];

const NEVERS: Array<{ title: string; body: string; icon: IconName }> = [
  {
    icon: "shield",
    title: "Never acts without you",
    body: "Sending, publishing, merging, deleting, changing a record — prepared in full, shown exactly as it would go out, editable, and executed only on a yes.",
  },
  {
    icon: "lock",
    title: "Never outgrows you",
    body: "An agent's permissions are the intersection with the person who started it. Narrower is allowed. Wider is not expressible in the system.",
  },
  {
    icon: "alert",
    title: "Never pretends",
    body: "A tool without credentials reads “not connected” and stays that way. If nothing ran, the receipt says nothing ran — even when that is the less impressive answer.",
  },
];

const SPECIALISTS = [
  { name: "Navio Code", role: "repositories, architecture, debugging" },
  { name: "Navio Finance", role: "statements, runway, unit economics" },
  { name: "Navio Reasoning", role: "long material, trade-offs, risk" },
  { name: "Navio Research", role: "markets, competitors, prior art" },
  { name: "Navio Vision", role: "screenshots, diagrams, scans" },
  { name: "Navio Data", role: "extraction, structure, fast passes" },
];

export default function LandingPage() {
  const featured = featuredServices();
  const services = allServices();
  const byId = new Map(services.map((service) => [service.slug, service]));
  const river = (slugs: string[]) =>
    slugs
      .map((slug) => byId.get(slug))
      .filter((service): service is NonNullable<typeof service> => Boolean(service?.logo));

  // Names a visitor will recognise on sight — the long tail lives in the gallery.
  const riverTop = river([
    "github", "slack", "notion", "gmail", "linear", "jira", "figma", "google-calendar", "stripe", "hubspot",
    "salesforce", "asana", "airtable", "zoom", "shopify", "intercom", "dropbox", "twilio",
  ]);
  const riverBottom = river([
    "google-drive", "trello", "clickup", "zendesk", "discord", "supabase", "gitlab", "google-docs", "mailchimp",
    "calendly", "typeform", "confluence", "bitbucket", "sentry", "monday", "webflow", "quickbooks", "google-meet",
  ]);

  return (
    <div className="relative">
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative isolate overflow-hidden">
        <Spheres />
        <div className="mx-auto w-full max-w-3xl px-6 pt-20 pb-12 text-center sm:pt-28">
          <Reveal>
            <p className="eyebrow">Chat &middot; Create &middot; Automate</p>

            <h1 className="display mt-6 text-[44px] sm:text-[68px]">
              Ask for the outcome.
              <br />
              Navio does the work.
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-[15.5px] leading-relaxed text-[var(--color-ink-muted)]">
              Navio runs a company&rsquo;s work the way a good operator would: it reads what it is allowed to read,
              runs what can run at once, stops before anything consequential, and shows its receipts.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/access"
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-[var(--color-porcelain)] px-5 py-3 text-[14px] font-medium text-[var(--color-on-light)] transition-transform hover:-translate-y-px"
              >
                Request access
                <Icon name="arrow-right" size={15} strokeWidth={2} />
              </Link>
              <Link
                href="/platform"
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline)] px-5 py-3 text-[14px] text-[var(--color-ink-muted)] transition-colors hover:border-[#33353b] hover:text-[var(--color-ink)]"
              >
                See how it works
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-[var(--color-ink-faint)]">
              {["Parallel by default", "Approval before consequence", "Receipts, not claims"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Icon name="check" size={13} className="text-[var(--color-ink-muted)]" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* The product itself, given the width it deserves. */}
        <div className="mx-auto w-full max-w-4xl px-6 pb-16">
          <Reveal delay={90}>
            <ProductVideo />
          </Reveal>
        </div>

        {/* the catalogue, moving */}
        <div className="mx-auto w-full max-w-6xl px-6 pb-16">
          <Reveal>
            <p className="eyebrow mb-4">
              Works with <CountUp to={CATALOG.length} />+ services
            </p>
            <LogoRiver services={riverTop} />
            <div className="mt-2.5">
              <LogoRiver services={riverBottom} reverse />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------- the loop */}
      <section className="border-y border-[var(--color-hairline)] bg-[var(--color-surface)]/50">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1fr_0.95fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow">How it works</p>
            <h2 className="display mt-4 max-w-md text-[38px]">
              From a sentence to work that is actually finished.
            </h2>
            <p className="mt-5 max-w-md text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
              The same four beats every time, whether the work takes six seconds or six minutes. You watch it happen;
              you are not asked to drive it.
            </p>

            <div className="mt-8">
              <StepFlow steps={STEPS} />
            </div>
          </Reveal>

          <Reveal delay={80} className="lg:pt-12">
            <div className="panel-accent overflow-hidden">
              <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] px-4 py-3">
                <span className="font-mono text-[11.5px] text-[var(--color-ink-faint)]">navio · one run</span>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#164254] bg-[#0c2733] px-2 py-[3px] text-[10.5px] font-medium text-[#7fdcff]">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#7fdcff]"
                    style={{ animation: "pulse-dot 1.6s ease-in-out infinite" }}
                  />
                  live
                </span>
              </div>

              <ul className="divide-y divide-[var(--color-hairline)]">
                {[
                  { label: "Financial review", actor: "Navio Finance", state: "Completed" },
                  { label: "Details", actor: "Navio Data", state: "Completed" },
                  { label: "Action planning", actor: "Navio Reasoning", state: "Running" },
                ].map((lane) => (
                  <li key={lane.label} className="flex items-center gap-3 px-4 py-3">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        lane.state === "Running" ? "bg-[var(--color-stream-cyan)]" : "bg-[#6fdc8c]"
                      }`}
                      style={lane.state === "Running" ? { animation: "pulse-dot 1.3s ease-in-out infinite" } : undefined}
                    />
                    <span className="text-[13px] text-[var(--color-ink)]">{lane.label}</span>
                    <span className="text-[11.5px] text-[var(--color-ink-faint)]">{lane.actor}</span>
                    <span className="ml-auto text-[11.5px] text-[var(--color-ink-muted)]">{lane.state}</span>
                  </li>
                ))}
              </ul>

              <ul className="divide-y divide-[var(--color-hairline)] border-t border-[var(--color-hairline)]">
                {featured.slice(0, 4).map((service) => (
                  <li key={service.slug} className="flex items-center gap-3 px-4 py-2.5">
                    <ServiceLogo
                      slug={service.slug}
                      name={service.name}
                      logo={service.logo}
                      dark={service.dark}
                      size={18}
                    />
                    <span className="text-[12.5px] text-[var(--color-ink)]">{service.name}</span>
                    <span className="text-[11px] text-[var(--color-ink-faint)]">1 action completed</span>
                    <Icon name="check" size={13} className="ml-auto text-[#8ee6a4]" />
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 border-t border-[#4a3812] bg-[#1a1408] px-4 py-2.5">
                <Icon name="shield" size={14} className="text-[var(--color-stream-amber)]" />
                <span className="text-[12px] text-[var(--color-stream-amber)]">
                  1 action prepared and held — nothing was sent
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------- specialists band */}
      <section className="band-inset">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">One assistant</p>
                <h2 className="display mt-4 max-w-xl text-[38px]">
                  You never pick a specialist. Navio picks several, and answers as one.
                </h2>
              </div>
              <p className="max-w-xs text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
                Routing happens per request: intent, complexity, attachments, and what the workspace can actually
                reach. A greeting costs nothing. A cross-domain review opens four streams at once.
              </p>
            </div>
          </Reveal>

          <Reveal delay={70}>
            <ul className="mt-10 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {SPECIALISTS.map((specialist) => (
                <li key={specialist.name} className="panel-lift px-5 py-4">
                  <p className="display text-[20px]">{specialist.name}</p>
                  <p className="mt-1.5 text-[12.5px] text-[var(--color-ink-muted)]">{specialist.role}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={110}>
            <dl className="mt-12 grid gap-6 border-t border-[var(--color-hairline)] pt-8 sm:grid-cols-3">
              {[
                { value: <CountUp to={CATALOG.length} suffix="+" />, label: "services in the catalogue, with real marks" },
                { value: <CountUp to={LIMITS.maxParallelLanes} />, label: "streams of work running at the same time" },
                { value: "Every write", label: "held for a named human decision" },
              ].map((stat, index) => (
                <div key={index}>
                  <dt className="display text-[44px] leading-none">{stat.value}</dt>
                  <dd className="mt-2.5 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- what it won't do */}
      <section className="border-b border-[var(--color-hairline)]">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <Reveal>
            <p className="eyebrow">The part nobody markets</p>
            <h2 className="display mt-4 max-w-2xl text-[38px]">
              What Navio refuses to do is what makes it safe to leave running.
            </h2>
          </Reveal>

          <ul className="mt-10 grid gap-3 md:grid-cols-3">
            {NEVERS.map((never, index) => (
              <li key={never.title}>
                <Reveal delay={index * 70}>
                  <article className="panel-lift h-full px-5 py-5">
                    <Icon name={never.icon} size={18} className="text-[var(--color-stream-cyan)]" />
                    <h3 className="display mt-4 text-[22px]">{never.title}</h3>
                    <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">{never.body}</p>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------- integrations */}
      <section className="border-b border-[var(--color-hairline)] bg-[var(--color-surface)]/50">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <p className="eyebrow">Integrations</p>
            <h2 className="display mt-4 text-[38px]">Navio works where the work already is.</h2>
            <p className="mt-5 max-w-md text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
              {CATALOG.length} services in the catalogue, each with its own brand mark. Every connection reports its
              true state — and a service without credentials is one Navio will tell you it cannot use, rather than
              quietly pretending it did.
            </p>
            <Link
              href="/integrations"
              className="focus-ring mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline)] px-4 py-2.5 text-[13.5px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
            >
              Browse all {CATALOG.length}
              <Icon name="arrow-right" size={14} />
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {featured.slice(0, 12).map((service) => (
                <li
                  key={service.slug}
                  className="panel-lift flex flex-col items-center gap-2.5 px-3 py-5 text-center"
                >
                  <ServiceLogo
                    slug={service.slug}
                    name={service.name}
                    logo={service.logo}
                    dark={service.dark}
                    size={30}
                  />
                  <span className="truncate text-[11.5px] text-[var(--color-ink-muted)]">{service.name}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------------- close */}
      <section className="relative isolate overflow-hidden">
        <Spheres className="opacity-80" />
        <div className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
          <Reveal>
            <NavioMark size={44} state="flow" className="mx-auto" />
            <h2 className="display mt-7 text-[40px] sm:text-[46px]">
              Put your work on Navio
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
              Bring the workspace&rsquo;s knowledge, connect the tools you already use, and let Navio carry the parts
              that never needed a person.
            </p>
            <Link
              href="/access"
              className="focus-ring mt-9 inline-flex items-center gap-2 rounded-full bg-[var(--color-porcelain)] px-5 py-3 text-[14px] font-medium text-[var(--color-on-light)] transition-transform hover:-translate-y-px"
            >
              Request access
              <Icon name="arrow-right" size={15} strokeWidth={2} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
