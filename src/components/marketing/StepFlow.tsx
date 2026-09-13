"use client";

import { useState } from "react";

export type Step = { n: string; title: string; body: string };

/**
 * The loop, as a set of numbered steps.
 *
 * One step is open at a time so the text has room to be read; the others stay
 * as titles you can scan. Keyboard and pointer both work, and the whole list is
 * still legible with no interaction at all — the closed steps are not hiding
 * anything you need before you choose to open them.
 */
export function StepFlow({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);

  return (
    <ol className="space-y-2">
      {steps.map((step, index) => {
        const open = index === active;
        return (
          <li key={step.n}>
            <button
              type="button"
              onClick={() => setActive(index)}
              onMouseEnter={() => setActive(index)}
              aria-expanded={open}
              className={`focus-ring w-full rounded-2xl border px-5 py-4 text-left transition-colors ${
                open
                  ? "border-[color-mix(in_oklab,var(--color-stream-cyan)_32%,transparent)] bg-[var(--color-panel)]"
                  : "border-[var(--color-hairline)] bg-[var(--color-panel)]/50 hover:border-[#2b3d4a]"
              }`}
            >
              <div className="flex items-baseline gap-4">
                <span
                  className={`font-mono text-[12px] transition-colors ${
                    open ? "text-[var(--color-stream-cyan)]" : "text-[var(--color-ink-faint)]"
                  }`}
                >
                  /{step.n}
                </span>
                <span className="display text-[22px]">{step.title}</span>
              </div>

              <div
                className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
              >
                <p className="overflow-hidden pl-[46px] text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
                  <span className="block pt-2.5">{step.body}</span>
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
