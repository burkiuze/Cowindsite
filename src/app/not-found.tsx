import Link from "next/link";
import { WindMark } from "@/components/brand/WindMark";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <WindMark size={44} state="flow" />
      <h1 className="text-[20px] font-semibold tracking-[-0.02em]">That page is not here</h1>
      <p className="max-w-sm text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
        The link may be stale, or the thing it pointed at was removed from the workspace.
      </p>
      <Link
        href="/home"
        className="focus-ring mt-2 rounded-lg border border-[var(--color-hairline)] px-4 py-2 text-[13px] text-[var(--color-ink-muted)] transition-colors hover:border-[#2b3d4a] hover:text-[var(--color-ink)]"
      >
        Back to the workspace
      </Link>
    </div>
  );
}
