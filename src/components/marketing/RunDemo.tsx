"use client";

import { useEffect, useState } from "react";
import { WindMark } from "@/components/brand/WindMark";
import { Icon } from "@/components/ui/Icon";
import { ServiceLogo } from "@/components/app/ServiceLogo";

type LaneState = "waiting" | "running" | "completed";

const LANES = [
  { id: "fin", label: "Financial analysis", actor: "Wind Finance", at: 1 },
  { id: "code", label: "Code architecture", actor: "Wind Code", at: 1 },
  { id: "market", label: "Market research", actor: "Wind Research", at: 2 },
  { id: "risk", label: "Risk assessment", actor: "Wind Reasoning", at: 3 },
];

const TOUCHED: Array<{ slug: string; name: string; logo: string; dark: boolean }> = [
  { slug: "github", name: "GitHub", logo: "/logos/github.webp", dark: false },
  { slug: "stripe", name: "Stripe", logo: "/logos/stripe.webp", dark: false },
  { slug: "notion", name: "Notion", logo: "/logos/notion.webp", dark: false },
  { slug: "slack", name: "Slack", logo: "/logos/slack.webp", dark: false },
];

/**
 * A run, shown the way the product actually shows it.
 *
 * Not a video and not a screenshot: the same trace component the workspace
 * renders, driven by a timer, so the marketing page cannot drift from what the
 * app really does. It loops, and it always ends where a real run ends — at an
 * approval that has not been sent.
 */
export function RunDemo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => (value + 1) % 9), 1100);
    return () => clearInterval(timer);
  }, []);

  const stateOf = (lane: (typeof LANES)[number]): LaneState => {
    if (tick < lane.at) return "waiting";
    if (tick < lane.at + 3) return "running";
    return "completed";
  };

  const done = LANES.filter((lane) => stateOf(lane) === "completed").length;
  const running = LANES.filter((lane) => stateOf(lane) === "running").length;
  const finished = done === LANES.length;

  return (
    <div className="panel mx-auto max-w-3xl overflow-hidden text-left">
      <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] px-4 py-3">
        <WindMark size={18} state={finished ? "flow" : "thinking"} />
        <span className="text-[12.5px] text-[var(--color-ink-muted)]">
          {finished ? "Run complete — one action held for approval" : `Wind is working across ${LANES.length} streams`}
        </span>
        <span className="ml-auto font-mono text-[11.5px] text-[var(--color-ink-faint)]">
          {done}/{LANES.length}
        </span>
      </div>

      <ul className="divide-y divide-[var(--color-hairline)]">
        {LANES.map((lane) => {
          const state = stateOf(lane);
          return (
            <li
              key={lane.id}
              className={`relative flex items-center gap-3 overflow-hidden px-4 py-2.5 ${
                state === "running" ? "lane-running" : ""
              }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {state === "completed" ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0e2417] text-[#8ee6a4]">
                    <Icon name="check" size={12} strokeWidth={2.2} />
                  </span>
                ) : state === "running" ? (
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-[var(--color-stream-cyan)]"
                    style={{ animation: "pulse-dot 1.3s ease-in-out infinite" }}
                  />
                ) : (
                  <span className="h-2 w-2 rounded-full border border-[#2b323c]" />
                )}
              </span>
              <span className="text-[13px] text-[var(--color-ink)]">{lane.label}</span>
              <span className="text-[11.5px] text-[var(--color-ink-faint)]">{lane.actor}</span>
              <span
                className={`ml-auto text-[11.5px] ${
                  state === "running" ? "text-[#7fdcff]" : "text-[var(--color-ink-muted)]"
                }`}
              >
                {state === "completed" ? "Completed" : state === "running" ? "Running" : "Waiting"}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-hairline)] px-4 py-2.5">
        <span className="text-[11.5px] text-[var(--color-ink-faint)]">Reading from</span>
        <ul className="flex items-center gap-3">
          {TOUCHED.map((service, index) => (
            <li key={service.slug} className="flex items-center gap-1.5">
              <ServiceLogo
                slug={service.slug}
                name={service.name}
                logo={service.logo}
                dark={service.dark}
                size={15}
                className={running > 0 && index === tick % TOUCHED.length ? "opacity-100" : "opacity-55"}
              />
              <span className="text-[11.5px] text-[var(--color-ink-faint)]">{service.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`flex items-center gap-2 border-t px-4 py-2.5 transition-colors ${
          finished ? "border-[#4a3812] bg-[#1a1408]" : "border-[var(--color-hairline)] bg-transparent"
        }`}
      >
        <Icon
          name="shield"
          size={14}
          className={finished ? "text-[var(--color-stream-amber)]" : "text-[var(--color-ink-faint)]"}
        />
        <span
          className={`text-[12.5px] ${finished ? "text-[var(--color-stream-amber)]" : "text-[var(--color-ink-faint)]"}`}
        >
          {finished
            ? "1 action prepared and held for approval — nothing was sent"
            : "Anything that leaves the workspace will stop here"}
        </span>
      </div>
    </div>
  );
}
