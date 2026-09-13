import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { CATALOG } from "@/lib/workspace/integrations";
import { LIMITS } from "@/lib/wind/config";

export const metadata = {
  title: "FAQ",
  description: "Straight answers about how Navio routes work, what it will not do without you, and where your data goes.",
};

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Which model does it use?",
    a: "That is deliberately not a question you have to answer. Navio presents one assistant, Navio, and routes each request internally to the capability it needs — engineering, finance, visual, long-context, extraction — often several at once. The engine layer is private, and it is designed so that swapping a specialist is a configuration change rather than something you would notice in the product.",
  },
  {
    q: "Will it send emails or post messages on its own?",
    a: "No. Anything that sends, publishes, changes or deletes outside the workspace is prepared in full, shown to you exactly as it would go out, and held. You approve, edit before approving, or reject. Every decision produces a receipt — including the case where you approve something whose system is not connected, where the receipt says plainly that nothing was sent.",
  },
  {
    q: "What does it do when a request is trivial?",
    a: "Answers it. A greeting or a one-line question is handled by the fast conversational layer with no specialist involved. Spending a heavy specialist on small talk would be slow and expensive, so the router is built to refuse to.",
  },
  {
    q: "Can an agent end up with more access than me?",
    a: "No, and not by policy — by construction. An agent's permissions for a run are the intersection of its own grants with the permissions of the person who started it. An agent can be narrower than you. Wider is not expressible in the system.",
  },
  {
    q: "Does every agent see everything the company knows?",
    a: "No. Knowledge is scoped to departments and to an agent's own scopes. A finance source is not visible to an engineering run just because both live in the same workspace, and the Knowledge page shows you exactly what a retrieval would and would not surface.",
  },
  {
    q: "What happens when something fails mid-run?",
    a: `Each stream walks an ordered fallback path rather than surfacing an error. You see one calm line — that Navio switched paths — while the real cause goes to server-side telemetry. A run is bounded too: ${LIMITS.maxSpecialistCalls} specialist calls, depth ${LIMITS.maxOrchestrationDepth}, and a hard timeout, so a loop is not possible rather than merely unlikely.`,
  },
  {
    q: "Can I see what it actually did?",
    a: "Yes. Every run records its steps, which specialists ran, what knowledge was searched, what was approved and by whom, and what was executed. What you will not see is private chain-of-thought: operational state is transparency, a reasoning transcript is noise.",
  },
  {
    q: `Are all ${CATALOG.length} integrations connected?`,
    a: "No — and the product never implies otherwise. The catalogue is what Navio can represent; connection state is per workspace and shown honestly. A service without credentials reads as not connected, Navio is told which tools genuinely exist, and it cannot claim to have used one that does not.",
  },
  {
    q: "Where do my credentials live?",
    a: "Server-side only. They are read in a single private module, never sent to the browser, never embedded in a page, never logged, and stripped from any text on its way to a user in case one ever appears in output.",
  },
  {
    q: "Can we run it on our own infrastructure?",
    a: "Yes. It is a standard Node application with the storage layer behind one narrow interface, so pointing it at your own database and your own hosting is a contained change rather than a rewrite.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <header className="text-center">
        <p className="eyebrow">FAQ</p>
        <h1 className="display mt-5 text-[42px] sm:text-[50px]">
          Questions worth asking before you trust it
        </h1>
        <p className="mt-5 text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
          Short answers, no hedging. If something here is not true of the build you are running, that is a bug.
        </p>
      </header>

      <dl className="mt-10 divide-y divide-[var(--color-hairline)] border-y border-[var(--color-hairline)]">
        {FAQ.map((item) => (
          <div key={item.q} className="py-6">
            <dt className="flex items-start gap-2.5 text-[15px] font-medium text-[var(--color-ink)]">
              <Icon name="chevron-right" size={15} className="mt-1 shrink-0 text-[var(--color-stream-cyan)]" />
              {item.q}
            </dt>
            <dd className="mt-2.5 pl-[25px] text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">{item.a}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/platform"
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-hairline)] px-4 py-2.5 text-[13.5px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
        >
          How the runtime works
          <Icon name="arrow-right" size={14} />
        </Link>
        <Link
          href="/access"
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] px-4 py-2.5 text-[13.5px] font-medium text-[#04121a] transition-opacity hover:opacity-90"
        >
          Request access
          <Icon name="arrow-right" size={14} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
