import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { StreamField } from "@/components/app/StreamField";
import { LIMITS } from "@/lib/wind/config";
import { CATALOG } from "@/lib/workspace/integrations";
import { RunDemo } from "@/components/marketing/RunDemo";

export const metadata = {
  title: "Platform",
  description:
    "How Navio works underneath: one assistant, a router, an orchestrator that runs work in parallel, scoped company memory, and an approval gate in front of every consequence.",
};

const SPECIALISTS: Array<{ name: string; role: string; icon: IconName }> = [
  { name: "Wind", role: "Conversation, routing, planning, and the final answer in one voice.", icon: "wind" },
  { name: "Wind Code", role: "Repositories, architecture, debugging, multi-file change, tests.", icon: "integrations" },
  { name: "Wind Finance", role: "Statements, unit economics, runway, valuation, financial documents.", icon: "analytics" },
  { name: "Wind Reasoning", role: "Long material, contradictions, trade-offs, root cause, risk.", icon: "sparkle" },
  { name: "Wind Research", role: "Markets, competitors, prior art, comparative evaluation.", icon: "search" },
  { name: "Wind Vision", role: "Screenshots, diagrams, charts, scanned documents, UI.", icon: "home" },
  { name: "Wind Data", role: "Extraction, structure, fast passes over long text.", icon: "knowledge" },
];

export default function PlatformPage() {
  return (
    <div className="relative overflow-hidden">
      <StreamField intensity={0.6} />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-16 pb-14">
        <p className="eyebrow">Platform</p>
        <h1 className="display mt-5 max-w-3xl text-[44px] text-[var(--color-ink)]">
          One assistant on the surface. A runtime underneath.
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
          People do not want to choose a model, wire a chain, or babysit an agent. They want an outcome, and they want
          to know what happened. Navio is built around exactly that: Wind decides what a request needs, does the parts
          it is allowed to do, and stops in front of anything that would be hard to take back.
        </p>
      </section>

      {/* The path of a request */}
      <section className="relative z-10 border-t border-[var(--color-hairline)] bg-[var(--color-surface)]/60">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="eyebrow">The path of one request</p>

          <div className="mt-8">
            <RunDemo />
          </div>

          <ol className="mt-6 space-y-3">
            {[
              {
                title: "Intent and complexity",
                body: "A deterministic pass reads the attachments first, then the wording, in English and Turkish alike. An image routes to visual work no matter how the sentence is phrased. A greeting costs nothing: Wind answers it directly, with no specialist involved.",
              },
              {
                title: "A plan, not a chain",
                body: "Wind produces lanes with dependencies rather than a fixed pipeline. Independent lanes are allowed to run at the same time; dependent ones wait for what they actually need.",
              },
              {
                title: "Scoped retrieval",
                body: "Before answering, Wind searches the workspace knowledge the person in front of it is allowed to read — filtered by department and by the agent's own scopes, not by what happens to be in the same workspace.",
              },
              {
                title: "Parallel execution",
                body: `Up to ${LIMITS.maxParallelLanes} lanes run concurrently, each with its own fallback path. Every stream is visible while it runs — its name and its state, never its private reasoning.`,
              },
              {
                title: "Synthesis",
                body: "Several passes come back as one answer in one voice. Contradictions are reconciled, or named as unresolved. Nothing in the output hints that the work was split up.",
              },
              {
                title: "Approval, then a receipt",
                body: "If the work implies sending, publishing, changing or deleting anything, Wind prepares the exact content and stops. A person approves, edits or rejects — and the decision is receipted either way.",
              },
            ].map((step, index) => (
              <li key={step.title} className="panel flex gap-4 px-5 py-4">
                <span className="mt-0.5 font-mono text-[12px] text-[var(--color-ink-faint)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[14.5px] font-medium text-[var(--color-ink)]">{step.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Specialists */}
      <section className="relative z-10 border-t border-[var(--color-hairline)]">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="eyebrow">Specialists</p>
          <h2 className="display mt-4 max-w-2xl text-[34px] text-[var(--color-ink)]">
            You never pick one. Wind does, per request, and often picks several at once.
          </h2>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {SPECIALISTS.map((specialist) => (
              <li key={specialist.name} className="panel flex items-start gap-3 px-4 py-3.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--color-hairline)] bg-[var(--color-raised)] text-[var(--color-stream-cyan)]">
                  <Icon name={specialist.icon} size={16} />
                </span>
                <div>
                  <p className="text-[13.5px] font-medium text-[var(--color-ink)]">{specialist.name}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">{specialist.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Control */}
      <section id="control" className="relative z-10 scroll-mt-20 border-t border-[var(--color-hairline)] bg-[var(--color-surface)]/60">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="eyebrow">Control</p>
          <h2 className="display mt-4 max-w-2xl text-[34px] text-[var(--color-ink)]">
            The limits are the product. Without them, nobody would leave this running.
          </h2>

          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            <Limit label="Specialist calls per run" value={String(LIMITS.maxSpecialistCalls)} />
            <Limit label="Orchestration depth" value={String(LIMITS.maxOrchestrationDepth)} />
            <Limit label="Parallel streams" value={String(LIMITS.maxParallelLanes)} />
            <Limit label="Attempts per stream" value={String(LIMITS.maxAttemptsPerLane)} />
            <Limit label="Run timeout" value={`${Math.round(LIMITS.taskTimeoutMs / 1000)}s`} />
            <Limit label="Rate limit" value={`${LIMITS.rateLimitPerMinute}/min`} />
          </dl>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Note
              icon="lock"
              title="An agent is never wider than you"
              body="Every agent run intersects the agent's grants with the permissions of the person who started it. Narrower is allowed. Wider is not expressible."
            />
            <Note
              icon="shield"
              title="No fabricated tool results"
              body={`Wind is told which of the ${CATALOG.length} services are actually connected. It cannot claim to have used one that is not.`}
            />
            <Note
              icon="alert"
              title="Failure degrades, it does not break"
              body="Each lane walks an ordered fallback path. You see one calm line — Wind switched paths — while the cause goes to server telemetry."
            />
            <Note
              icon="analytics"
              title="Everything leaves a trail"
              body="Runs, retrievals, specialist passes, approvals and executions are recorded as operational events. Private reasoning is never recorded or shown."
            />
          </div>

          <Link
            href="/access"
            className="focus-ring mt-10 inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] px-5 py-2.5 text-[14px] font-medium text-[#04121a] transition-opacity hover:opacity-90"
          >
            Request access
            <Icon name="arrow-right" size={15} strokeWidth={2} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Limit({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--color-hairline)] pb-2.5">
      <dt className="text-[12.5px] text-[var(--color-ink-faint)]">{label}</dt>
      <dd className="mt-1 text-[16px] font-semibold text-[var(--color-ink)]">{value}</dd>
    </div>
  );
}

function Note({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <div className="panel px-4 py-4">
      <Icon name={icon} size={16} className="text-[var(--color-stream-cyan)]" />
      <h3 className="mt-3 text-[13.5px] font-medium text-[var(--color-ink)]">{title}</h3>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">{body}</p>
    </div>
  );
}
