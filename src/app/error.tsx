"use client";

import Link from "next/link";
import { useEffect } from "react";
import { NavioMark } from "@/components/brand/NavioMark";

/**
 * Last line of defence in the browser. It says what happened and gives a way
 * out — it never shows a stack trace or anything about the machinery.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Server-side logging already has the detail; this keeps the digest linkable.
    console.error("[navio] render failed", error.digest);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <NavioMark size={44} state="flow" />
      <h1 className="text-[20px] font-semibold tracking-[-0.02em]">Something went wrong on this page</h1>
      <p className="max-w-sm text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
        Nothing was changed. Try again, and if it keeps happening the reference is{" "}
        <code className="rounded bg-[var(--color-raised)] px-1.5 py-0.5 font-mono text-[12px]">
          {error.digest ?? "unknown"}
        </code>
        .
      </p>
      <div className="mt-2 flex gap-2.5">
        <button
          type="button"
          onClick={reset}
          className="focus-ring rounded-lg bg-gradient-to-br from-[var(--color-stream-cyan)] to-[var(--color-stream-blue)] px-4 py-2 text-[13px] font-medium text-[#04121a]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="focus-ring rounded-lg border border-[var(--color-hairline)] px-4 py-2 text-[13px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
        >
          Back to the site
        </Link>
      </div>
    </div>
  );
}
