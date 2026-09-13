"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number that counts once when it arrives.
 *
 * Small enough to be a detail rather than a performance: one ease-out over
 * three quarters of a second, and the final value rendered immediately for
 * anyone who asked for reduced motion or has no observer.
 */
export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const started = performance.now();
        const step = (now: number) => {
          const progress = Math.min(1, (now - started) / 750);
          setValue(Math.round(to * (1 - (1 - progress) ** 3)));
          if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
