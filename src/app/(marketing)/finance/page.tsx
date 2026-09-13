import Link from "next/link";
import { ProductVideo } from "@/components/marketing/ProductVideo";
import { Reveal } from "@/components/marketing/Reveal";
import { Spheres } from "@/components/marketing/Spheres";
import { ServiceLogo } from "@/components/app/ServiceLogo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { allServices } from "@/lib/workspace/integrations";

export const metadata = {
  title: "Finance",
  description:
    "Navio Finance reads the ledger and the payment tools it is allowed to read, answers runway and burn in plain language, and prepares the board pack, the vendor review and the payment — then stops for a person.",
};

/** What a finance team actually hands over, and what Navio does with it. */
const WORK: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "analytics",
    title: "Runway and burn, asked in a sentence",
    body: "“How long do we have at this burn?” is a question, not a report request. Navio reads the ledger and the payment tools, does the arithmetic against real balances, and answers with the figures it used — so you can check it rather than trust it.",
  },
  {
    icon: "knowledge",
    title: "Receipts and bills, filed as they arrive",
    body: "Drop in a photo, a PDF or a forwarded invoice. Navio extracts the vendor, the amount, the date, the tax and the category, matches it against the ledger, and flags what it could not read rather than guessing a number.",
  },
  {
    icon: "shield",
    title: "Vendor and subscription review",
    body: "Every agreement has a renewal window and a notice period, and both are usually discovered late. Navio reviews what is committed against what is used, and names the ones worth renegotiating before the window closes.",
  },
  {
    icon: "tasks",
    title: "The board pack, assembled",
    body: "Revenue, spend by category, the month's variances, the decisions that need making — pulled from the sources, written in one voice, and held in front of you before a single recipient is emailed.",
  },
  {
    icon: "flows",
    title: "A weekly health read",
    body: "Liquidity, efficiency, solvency and the direction each is moving, on a schedule you set. It arrives as a short brief with the working shown, not a dashboard nobody opens.",
  },
  {
    icon: "lock",
    title: "Money never moves on its own",
    body: "A payment, an invoice, an email to the board: prepared in full, shown exactly as it would go out, editable, and executed only when a named person approves. Nothing in this list is an exception.",
  },
];

/** The line a finance team needs to hear before it hands anything over. */
const RULES = [
  {
    title: "Every figure names its source",
    body: "A number Navio reports comes with the tool it came from and when it was read. A figure it could not reach is reported as missing, not estimated into place.",
  },
  {
    title: "Reading is not the same as acting",
    body: "Navio reads the accounting and payment tools it has credentials for, at any time, without interrupting you. Anything that sends, pays, files or publishes stops at a human decision.",
  },
  {
    title: "Not connected means not connected",
    body: "A service without credentials reads “not connected” and stays that way. Navio is told which tools genuinely exist, so it cannot claim to have checked a ledger it never opened.",
  },
];

export default function FinancePage() {
  const services = allServices();
  const byId = new Map(services.map((service) => [service.slug, service]));
  const sources = ["stripe", "quickbooks", "xero", "gmail", "notion", "google-sheets", "paypal", "wise"]
    .map((slug) => byId.get(slug))
    .filter((service): service is NonNullable<typeof service> => Boolean(service?.logo));

  return (
    <div className="relative">
      <section className="relative isolate overflow-hidden">
        <Spheres />
        <div className="mx-auto w-full max-w-3xl px-6 pt-20 pb-12 text-center sm:pt-24">
          <Reveal>
            <p className="eyebrow">Navio Finance</p>
            <h1 className="display mt-6 text-[40px] sm:text-[58px]">
              The finance work nobody
              <br />
              wanted to do on a Friday.
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-[15.5px] leading-relaxed text-[var(--color-ink-muted)]">
              Navio Finance is not a separate product. It is the same assistant, pointed at the ledger: it reads the
              accounting and payment tools it is allowed to read, answers runway and burn in plain language, prepares
              the review, the pack and the payment — and never sends one of them without you.
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
                How the runtime works
              </Link>
            </div>
          </Reveal>
        </div>

        {/* One finance run, recorded end to end. */}
        <div className="mx-auto w-full max-w-4xl px-6 pb-16">
          <Reveal delay={90}>
            <ProductVideo only="finance" />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------- the work */}
      <section className="band-inset">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <Reveal>
            <p className="eyebrow">What it carries</p>
            <h2 className="display mt-4 max-w-2xl text-[34px] sm:text-[40px]">
              A finance department&rsquo;s week, minus the parts that never needed a person.
            </h2>
          </Reveal>

          <ul className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {WORK.map((item, index) => (
              <li key={item.title}>
                <Reveal delay={index * 60}>
                  <article className="panel-lift h-full px-5 py-5">
                    <Icon name={item.icon} size={18} className="text-[var(--color-ink-muted)]" />
                    <h3 className="display mt-4 text-[20px]">{item.title}</h3>
                    <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">{item.body}</p>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------- where it reads */}
      <section className="border-b border-[var(--color-hairline)]">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal>
            <p className="eyebrow">Where the figures come from</p>
            <h2 className="display mt-4 text-[34px] sm:text-[40px]">Your books stay where they are.</h2>
            <p className="mt-5 max-w-md text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
              Navio does not ask you to migrate the ledger into it. It connects to the accounting, payment and
              document tools the work already lives in, reads them with the permissions you grant, and writes back only
              through an approval.
            </p>
            <Link
              href="/integrations"
              className="focus-ring mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline)] px-4 py-2.5 text-[13.5px] text-[var(--color-ink-muted)] transition-colors hover:border-[#33353b] hover:text-[var(--color-ink)]"
            >
              See the whole catalogue
              <Icon name="arrow-right" size={14} />
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {sources.map((service) => (
                <li key={service.slug} className="panel-lift flex flex-col items-center gap-2.5 px-3 py-5 text-center">
                  <ServiceLogo slug={service.slug} name={service.name} logo={service.logo} dark={service.dark} size={28} />
                  <span className="truncate text-[11.5px] text-[var(--color-ink-muted)]">{service.name}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ the rules */}
      <section className="border-b border-[var(--color-hairline)] bg-[var(--color-surface)]/50">
        <div className="mx-auto w-full max-w-4xl px-6 py-20">
          <Reveal>
            <p className="eyebrow">Before you hand over the books</p>
            <h2 className="display mt-4 text-[34px] sm:text-[40px]">
              Three rules that make this safe to leave running.
            </h2>
          </Reveal>

          <dl className="mt-10 divide-y divide-[var(--color-hairline)] border-y border-[var(--color-hairline)]">
            {RULES.map((rule, index) => (
              <Reveal key={rule.title} delay={index * 60}>
                <div className="py-6">
                  <dt className="display text-[21px]">{rule.title}</dt>
                  <dd className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">{rule.body}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* --------------------------------------------------------------- close */}
      <section className="relative isolate overflow-hidden">
        <Spheres className="opacity-80" />
        <div className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
          <Reveal>
            <h2 className="display text-[36px] sm:text-[44px]">Start with one month&rsquo;s books</h2>
            <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
              Connect the ledger and the payment tool, ask for the month, and check every figure against its source. If
              it does not hold up, nothing was sent anywhere.
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
