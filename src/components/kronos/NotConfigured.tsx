/** Shown where sign-in is needed on a deployment without Clerk or storage keys. */
export function NotConfigured() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-[22px] font-semibold">Accounts are not available yet</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
        Sign-in for Kronos Agent is being set up. You can already use Kronos with your own API keys — no account needed.
      </p>
    </div>
  );
}
