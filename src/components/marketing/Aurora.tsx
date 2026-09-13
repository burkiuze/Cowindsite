/**
 * Hero backdrop.
 *
 * Two slow colour fields drawn from the mark's own gradient, sitting far behind
 * the content at low opacity, with a grain-free radial mask so they never turn
 * into the purple haze every AI site has. Pure CSS: no canvas, no scroll work.
 */
export function Aurora({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="absolute -top-[22%] left-1/2 h-[620px] w-[1100px] -translate-x-1/2 rounded-[50%] blur-[120px]"
        style={{
          background:
            "radial-gradient(60% 60% at 40% 50%, color-mix(in oklab, var(--color-stream-cyan) 30%, transparent), transparent 70%), radial-gradient(50% 50% at 70% 45%, color-mix(in oklab, var(--color-stream-blue) 26%, transparent), transparent 72%)",
          animation: "aurora-drift 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-[8%] left-[58%] h-[420px] w-[720px] rounded-[50%] blur-[130px]"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 50%, color-mix(in oklab, var(--color-stream-violet) 22%, transparent), transparent 72%)",
          animation: "aurora-drift 28s ease-in-out infinite reverse",
        }}
      />
      {/* A single hairline horizon keeps the glow from floating free. */}
      <div className="absolute inset-x-0 top-[78%] h-px bg-gradient-to-r from-transparent via-[var(--color-hairline)] to-transparent" />
    </div>
  );
}
