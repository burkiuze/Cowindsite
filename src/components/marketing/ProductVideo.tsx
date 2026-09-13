"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * The product, recorded.
 *
 * Three real runs captured in the real workspace — the cursor you see is the
 * one that drove them. They loop silently like screenshots that move, but they
 * stay video: they can be paused, they never autoplay for someone who asked for
 * reduced motion, and they fall back to their own poster frame if playback is
 * unavailable.
 */

type Take = {
  id: string;
  tab: string;
  file: string;
  caption: string;
  description: string;
};

const TAKES: Take[] = [
  {
    id: "meeting",
    tab: "Schedule a meeting",
    file: "preview",
    caption:
      "One request in Turkish. Navio reads the calendar, the mail threads and the workspace notes it is allowed to read, reviews the sponsorship agreements, then prepares the meeting with its invitations and per-person assignments — and sends nothing until a person approves.",
    description:
      "A run in the Navio workspace: one request fans out across specialist streams, prepares a meeting with invitations and assignments, and waits for a person to approve before anything is sent.",
  },
  {
    id: "engineering",
    tab: "Prepare a release",
    file: "preview-engineering",
    caption:
      "The same request shape, a different department. Navio reads the open pull requests and the blocker issues, finds the one decision the release actually turns on, puts it at the top of the agenda and prepares the invitation — still waiting on a person.",
    description:
      "A run in the Navio workspace: Navio reads a repository and an issue tracker, prepares a release meeting around the blocking decision, and holds the invitations for approval.",
  },
  {
    id: "finance",
    tab: "Close the month",
    file: "preview-finance",
    caption:
      "One question about the month. Navio reads the ledger and the payment tool, checks what is committed against what is used, writes the summary with the figures it used — and holds the mail to the board until someone approves it.",
    description:
      "A run in the Navio workspace: Navio reads accounting and payment tools, reviews vendor commitments, drafts a board summary and holds the email for approval.",
  },
  {
    id: "social",
    tab: "Produce and publish",
    file: "preview-social",
    caption:
      "One approval, four steps, in order. The video is generated first and the upload waits for it; the posts wait for the upload. Each step runs in front of you and leaves its own receipt — nothing is marked done before it is.",
    description:
      "A run in the Navio workspace: an approved action produces a video, uploads it, then publishes to three channels one step at a time, each leaving a receipt.",
  },
];

/**
 * `only` narrows the switcher to a single run — the finance page shows the
 * finance take and nothing else, rather than asking a visitor to find it.
 */
export function ProductVideo({ only }: { only?: string } = {}) {
  const takes = only ? TAKES.filter((take) => take.id === only) : TAKES;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [take, setTake] = useState(takes[0] ?? TAKES[0]);
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

  /** Swapping the source needs an explicit reload: the element keeps the old one. */
  function choose(next: Take) {
    if (next.id === take.id) return;
    setTake(next);
    const video = videoRef.current;
    if (!video) return;
    video.load();
    if (!reduced) {
      void video.play().catch(() => undefined);
    }
  }

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
    <figure className="panel mx-auto w-full overflow-hidden p-0">
      {/* Frame chrome: this is the workspace, not the site you are on. */}
      <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] bg-[var(--color-surface)] px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          {["#2c333d", "#2c333d", "#2c333d"].map((color, index) => (
            <span key={index} className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          ))}
        </span>
        <span className="ml-1 font-mono text-[11.5px] text-[var(--color-ink-faint)]">
          navio · workspace preview
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

      {/* Each run was recorded end to end; the tabs switch between them. */}
      <div
        role="tablist"
        aria-label="Recorded runs"
        hidden={takes.length < 2}
        className="flex flex-wrap gap-1 border-b border-[var(--color-hairline)] bg-[var(--color-surface)] px-2.5 py-2"
      >
        {takes.map((candidate) => {
          const active = candidate.id === take.id;
          return (
            <button
              key={candidate.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => choose(candidate)}
              className={`focus-ring rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                active
                  ? "bg-[var(--color-raised)] text-[var(--color-ink)]"
                  : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]"
              }`}
            >
              {candidate.tab}
            </button>
          );
        })}
      </div>

      <video
        ref={videoRef}
        key={take.id}
        className="block w-full bg-[var(--color-void)]"
        poster={`/video/${take.file}-poster.webp`}
        width={1280}
        height={800}
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-label={take.description}
      >
        <source src={`/video/${take.file}.mp4`} type="video/mp4" />
        <source src={`/video/${take.file}.webm`} type="video/webm" />
      </video>

      <figcaption className="border-t border-[var(--color-hairline)] px-3.5 py-2.5 text-left text-[11.5px] text-[var(--color-ink-faint)]">
        {take.caption}
      </figcaption>
    </figure>
  );
}
