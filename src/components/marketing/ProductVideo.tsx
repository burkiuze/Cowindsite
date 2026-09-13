"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * The product, recorded.
 *
 * A real run captured in the real workspace — the cursor you see is the one
 * that drove it. It loops silently like a screenshot that moves, but it stays a
 * video: it can be paused, it never autoplays for someone who asked for reduced
 * motion, and it falls back to its own poster frame if playback is unavailable.
 */
export function ProductVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(query.matches);
      if (query.matches) {
        videoRef.current?.pause();
        setPlaying(false);
      }
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <figure className="panel mx-auto max-w-4xl overflow-hidden p-0">
      {/* Frame chrome: this is the workspace, not the site you are on. */}
      <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] bg-[var(--color-surface)] px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          {["#2c333d", "#2c333d", "#2c333d"].map((color, index) => (
            <span key={index} className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          ))}
        </span>
        <span className="ml-1 font-mono text-[11.5px] text-[var(--color-ink-faint)]">
          cowind · workspace preview
        </span>
        <span className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-[#164254] bg-[#0c2733] px-2 py-[3px] text-[10.5px] font-medium text-[#7fdcff] sm:inline-flex">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#7fdcff]"
              style={{ animation: "pulse-dot 1.6s ease-in-out infinite" }}
            />
            Recorded run
          </span>
          <button
            type="button"
            onClick={toggle}
            className="focus-ring rounded-md p-1 text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink)]"
            aria-label={playing ? "Pause the preview" : "Play the preview"}
          >
            <Icon name={playing ? "pause" : "play"} size={14} />
          </button>
        </span>
      </div>

      <video
        ref={videoRef}
        className="block w-full bg-[var(--color-void)]"
        poster="/video/poster.webp"
        width={1280}
        height={800}
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label="A run in the Cowind workspace: one request fans out across specialist streams, prepares a meeting with invitations and assignments, and waits for a person to approve before anything is sent."
      >
        <source src="/video/preview.mp4" type="video/mp4" />
        <source src="/video/preview.webm" type="video/webm" />
      </video>

      <figcaption className="border-t border-[var(--color-hairline)] px-3.5 py-2.5 text-left text-[11.5px] text-[var(--color-ink-faint)]">
        One request in Turkish. Wind reads the calendar, the mail threads and the workspace notes it is allowed to
        read, reviews the sponsorship agreements, then prepares the meeting with its invitations and per-person
        assignments — and sends nothing until a person approves.
      </figcaption>
    </figure>
  );
}
