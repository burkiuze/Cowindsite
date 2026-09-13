import Link from "next/link";
import { WindMark } from "@/components/brand/WindMark";
import { Icon } from "@/components/ui/Icon";

export const metadata = {
  title: "About",
  description: "Why Cowind exists, what it refuses to do, and the principles the product is built on.",
};

const PRINCIPLES = [
  {
    title: "An outcome, not a prompt",
    body: "The person asking should not have to know which model is good at what, or how to phrase it. They describe the result they want. Working out the rest is the system's job, not theirs.",
  },
  {
    title: "One voice",
    body: "A company does not want to manage a roster of assistants. Cowind presents one — Wind — and keeps the machinery behind it out of the conversation entirely.",
  },
  {
    title: "Consequence needs a person",
    body: "Reading is cheap and reversible. Sending, publishing, merging and deleting are not. Everything in the second category is prepared in full and then stopped, every time, by default.",
  },
  {
    title: "Never pretend",
    body: "If a tool is not connected, Cowind says so and refuses to imply the action happened. An honest “I did not do that” is worth more than a convincing lie, and a system that fabricates once cannot be trusted again.",
  },
  {
    title: "Authority flows down, never up",
    body: "Automation that can quietly acquire more access than the person who started it is not automation, it is a liability. An agent's power is always the intersection with its initiator's.",
  },
  {
    title: "Show the work, not the thinking",
    body: "You get to see which streams are open, what each is doing, and where it landed. You do not get a transcript of private reasoning — that is noise pretending to be transparency.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <WindMark size={40} state="flow" />

      <h1 className="mt-7 text-[34px] leading-tight font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
        Most work inside a company is coordination
      </h1>

      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
        <p>
          Reading what changed. Pulling the figures. Checking what the team already decided. Writing the summary that
          three people will skim. Chasing the one approval that blocks everything else. None of it is the hard part of
          the business, and all of it eats the day.
        </p>
        <p>
          Cowind exists to carry that layer. Not as a chat window bolted onto a workspace, but as an operating layer:
          it holds the company&rsquo;s knowledge with real boundaries, reaches the tools the work already lives in, runs
          what can run at once, and stops in front of anything a person should decide.
        </p>
        <p>
          The measure we hold it to is simple. Could you leave it running for a week and then explain, line by line,
          everything it did? If the answer is no, the feature is not finished.
        </p>
      </div>

      <h2 className="mt-14 text-[13px] font-semibold tracking-[0.14em] text-[var(--color-ink-faint)] uppercase">
        Principles
      </h2>
      <ul className="mt-6 space-y-3">
        {PRINCIPLES.map((principle) => (
          <li key={principle.title} className="panel px-5 py-4">
            <h3 className="text-[14.5px] font-medium text-[var(--color-ink)]">{principle.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">{principle.body}</p>
          </li>
        ))}
      </ul>

      <div className="panel mt-12 flex flex-wrap items-center gap-4 px-5 py-5">
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">Try it on real work</h3>
          <p className="mt-1.5 text-[13px] text-[var(--color-ink-muted)]">
            The workspace is live, with knowledge, tasks, approvals and an audit trail already in it.
          </p>
        </div>
        <Link
          href="/app/wind"
          className="focus-ring inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] px-4 py-2.5 text-[13.5px] font-medium text-[#04121a] transition-opacity hover:opacity-90"
        >
          Ask Wind
          <Icon name="arrow-right" size={14} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
