/**
 * The backdrop, taken from the brand card.
 *
 * The card is built from glossy black spheres catching a single light. The page
 * uses the same object: two of them, mostly off-frame, far behind the content —
 * so the site and the card are the same picture rather than two moods sharing a
 * logo. Pure CSS, no canvas and no scroll work, and the drift is slow enough to
 * read as light rather than motion.
 */
export function Spheres({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`} aria-hidden="true">
      {/* The near sphere, cropped by the top-right corner like the card's. */}
      <div
        className="sphere -top-[38%] -right-[18%] h-[780px] w-[780px] sm:-right-[8%]"
        style={{ animation: "sphere-drift 26s ease-in-out infinite" }}
      />
      {/* The far one, low and to the left, holding the bottom of the frame. */}
      <div
        className="sphere -bottom-[52%] -left-[22%] h-[620px] w-[620px] opacity-80"
        style={{ animation: "sphere-drift 34s ease-in-out infinite reverse" }}
      />
      {/* A single horizon keeps the light from floating free of the page. */}
      <div className="absolute inset-x-0 top-[82%] h-px bg-gradient-to-r from-transparent via-[var(--color-hairline)] to-transparent" />
    </div>
  );
}
