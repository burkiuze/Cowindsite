import Link from "next/link";
import { WindMark } from "@/components/brand/WindMark";
import { Icon } from "@/components/ui/Icon";
import { CATALOG } from "@/lib/workspace/integrations";

export const metadata = {
  title: "Request access",
  description: "Cowind's workspace is in private access. Tell us what you would put on it.",
};

const WANTS = [
  "The work you would hand over first",
  "The tools it would have to reach",
  "What must never happen without a person",
];

export default function AccessPage() {
  const subject = encodeURIComponent("Cowind access");
  const body = encodeURIComponent(
    [
      "Company:",
      "What we would hand over first:",
      "Tools it would need to reach:",
      "What must never happen without a person:",
      "",
    ].join("\n"),
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-20">
      <WindMark size={40} state="flow" />

      <h1 className="display mt-7 text-[42px] text-[var(--color-ink)]">
        The workspace is in private access
      </h1>

      <p className="mt-5 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
        Cowind runs a company&rsquo;s work, which means it holds that company&rsquo;s knowledge and reaches its tools.
        We open it one workspace at a time, with the integrations that workspace actually needs, rather than handing
        out a login and hoping.
      </p>

      <div className="panel mt-8 px-5 py-5">
        <h2 className="display text-[22px] text-[var(--color-ink)]">What to tell us</h2>
        <ul className="mt-3 space-y-2">
          {WANTS.map((want) => (
            <li key={want} className="flex items-start gap-2.5 text-[13.5px] text-[var(--color-ink-muted)]">
              <Icon name="check" size={14} className="mt-1 shrink-0 text-[var(--color-stream-cyan)]" />
              {want}
            </li>
          ))}
        </ul>

        <a
          href={`mailto:access@cowind.app?subject=${subject}&body=${body}`}
          className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] px-4 py-2.5 text-[13.5px] font-medium text-[#04121a] transition-opacity hover:opacity-90"
        >
          Write to us
          <Icon name="arrow-up-right" size={14} strokeWidth={2} />
        </a>
      </div>

      <div className="mt-8 space-y-3 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
        <p>
          In the meantime, the public pages describe the system honestly: how a request is routed, what runs in
          parallel, where a human is required, and which of the {CATALOG.length} catalogued services have an adapter
          today.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/platform"
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-hairline)] px-4 py-2.5 text-[13.5px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
        >
          How the runtime works
          <Icon name="arrow-right" size={14} />
        </Link>
        <Link
          href="/integrations"
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-hairline)] px-4 py-2.5 text-[13.5px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
        >
          Browse the catalogue
          <Icon name="arrow-right" size={14} />
        </Link>
      </div>
    </div>
  );
}
