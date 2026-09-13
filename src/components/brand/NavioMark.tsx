import Image from "next/image";

type Props = {
  size?: number;
  /** `idle` sits still, `flow` drifts gently, `thinking` breathes and drifts. */
  state?: "idle" | "flow" | "thinking";
  className?: string;
  priority?: boolean;
};

/**
 * The Wind mark.
 *
 * The artwork itself is never redrawn or recoloured — it is the supplied mark,
 * with the black plate lifted to alpha so it can sit on Navio's charcoal
 * surfaces. Motion is applied to the whole mark (a slow airflow drift, and a
 * breath while Wind is working) rather than to its geometry, so the logo stays
 * exactly as designed while still feeling alive instead of spinning.
 */
export function NavioMark({ size = 28, state = "idle", className = "", priority = false }: Props) {
  const animation =
    state === "thinking"
      ? "breathe 2.4s ease-in-out infinite"
      : state === "flow"
        ? "breathe 6s ease-in-out infinite"
        : undefined;

  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {state === "thinking" ? (
        <span
          className="absolute -inset-[22%] rounded-full"
          style={{
            background:
              "radial-gradient(closest-side at 50% 50%, color-mix(in oklab, var(--color-stream-cyan) 26%, transparent), transparent 70%)",
            animation: "pulse-dot 2.4s ease-in-out infinite",
          }}
        />
      ) : null}
      <Image
        src="/brand/navio-mark.png"
        alt=""
        width={size}
        height={size}
        priority={priority}
        className="relative h-full w-full select-none object-contain"
        style={{ animation }}
        draggable={false}
      />
    </span>
  );
}

/** Lockup used in the sidebar, auth and marketing headers. */
export function NavioLockup({
  size = 26,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <NavioMark size={size} state="flow" priority={priority} />
      <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">Navio</span>
    </span>
  );
}
