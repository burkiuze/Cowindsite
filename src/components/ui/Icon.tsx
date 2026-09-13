type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
};

/**
 * Cowind's icon set.
 *
 * Hand-drawn on a 24-grid with a single 1.6 stroke weight and rounded caps, so
 * the whole interface reads as one system. Several glyphs carry the product's
 * motif — a stream that branches, merges or is held — rather than a generic
 * metaphor: `flows` branches, `approvals` is a stream meeting a gate.
 */
export function Icon({ name, size = 18, className = "", strokeWidth = 1.6 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

export type IconName =
  | "home"
  | "wind"
  | "tasks"
  | "flows"
  | "approvals"
  | "agents"
  | "knowledge"
  | "integrations"
  | "team"
  | "analytics"
  | "settings"
  | "plus"
  | "send"
  | "attach"
  | "stop"
  | "check"
  | "close"
  | "alert"
  | "clock"
  | "chevron-right"
  | "chevron-down"
  | "chevron-left"
  | "search"
  | "sparkle"
  | "shield"
  | "arrow-right"
  | "arrow-up-right"
  | "dot"
  | "trash"
  | "copy"
  | "pause"
  | "play"
  | "lock"
  | "external";

const PATHS: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  wind: (
    <>
      <path d="M3 9c3-4.5 7-5.5 10-3 2 1.7 3.4 3.2 5 3.2 1 0 1.6-.4 2-1" />
      <path d="M3 16c3-4.5 7-5.5 10-3 2 1.7 3.4 3.2 5 3.2 1 0 1.6-.4 2-1" />
    </>
  ),
  tasks: (
    <>
      <path d="M4 7h2l1.5 1.5L10 6" />
      <path d="M13 7h7" />
      <path d="M4 13.5h2L7.5 15 10 12.5" />
      <path d="M13 13.5h7" />
      <path d="M13 19h5" />
      <path d="M4 19h2" />
    </>
  ),
  flows: (
    <>
      <path d="M4 12h4" />
      <path d="M8 12c3 0 3-5 6-5h3" />
      <path d="M8 12c3 0 3 5 6 5h3" />
      <circle cx="19" cy="7" r="2" />
      <circle cx="19" cy="17" r="2" />
      <circle cx="4" cy="12" r="1.2" />
    </>
  ),
  approvals: (
    <>
      <path d="M3 12h6" />
      <path d="M12 5v14" />
      <path d="M15 12h6" />
      <path d="m15.5 11.2 1.6 1.6 3-3.2" />
    </>
  ),
  agents: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20c0-3 2.7-5 6-5s6 2 6 5" />
      <path d="M3.5 12.5 2 14M20.5 12.5 22 14" />
    </>
  ),
  knowledge: (
    <>
      <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v14H6.5A1.5 1.5 0 0 0 5 19.5Z" />
      <path d="M5 5.5v14" />
      <path d="M9 9h6M9 12.5h4" />
    </>
  ),
  integrations: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
      <path d="M13.5 7h3a2 2 0 0 1 2 2v2.5" />
      <path d="M10.5 17h-3a2 2 0 0 1-2-2v-2.5" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="9" r="2.6" />
      <path d="M4 19c0-2.8 2.2-4.6 5-4.6s5 1.8 5 4.6" />
      <path d="M16 6.5a2.6 2.6 0 0 1 0 5" />
      <path d="M17 14.6c2 .5 3 2 3 4.4" />
    </>
  ),
  analytics: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16V11" />
      <path d="M12.5 16V7.5" />
      <path d="M17 16v-3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6 16.8 7.2M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  send: (
    <>
      <path d="M5 12h13" />
      <path d="m12.5 6.5 6 5.5-6 5.5" />
    </>
  ),
  attach: (
    <>
      <path d="M15.5 8.5 9 15a2.5 2.5 0 0 0 3.5 3.5l7-7a4.5 4.5 0 0 0-6.4-6.4l-7 7a6.5 6.5 0 0 0 9.2 9.2l4.7-4.7" />
    </>
  ),
  stop: <rect x="7" y="7" width="10" height="10" rx="2" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  alert: (
    <>
      <path d="M12 8v5" />
      <circle cx="12" cy="16.6" r=".8" fill="currentColor" stroke="none" />
      <path d="M10.3 3.9 2.9 17.2A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  "chevron-right": <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  "chevron-down": <path d="m5.5 9.5 6.5 6.5 6.5-6.5" />,
  "chevron-left": <path d="M14.5 5.5 8 12l6.5 6.5" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 4.5 13.4 9 18 10.4 13.4 11.8 12 16.3 10.6 11.8 6 10.4 10.6 9Z" />
      <path d="M18.2 16.2 18.8 18l1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 5.5 6v6c0 4 2.8 7.2 6.5 8.5 3.7-1.3 6.5-4.5 6.5-8.5V6Z" />
      <path d="m9.3 12 2 2 3.4-3.6" />
    </>
  ),
  "arrow-right": (
    <>
      <path d="M4.5 12h15" />
      <path d="m14 6.5 5.5 5.5-5.5 5.5" />
    </>
  ),
  "arrow-up-right": (
    <>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />,
  trash: (
    <>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M6.5 7 7.3 19a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 6.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h.5" />
    </>
  ),
  pause: (
    <>
      <path d="M9.5 5.5v13M14.5 5.5v13" />
    </>
  ),
  play: <path d="M8 5.5 18 12 8 18.5Z" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  external: (
    <>
      <path d="M13 5h6v6" />
      <path d="M19 5 10 14" />
      <path d="M18 14.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5" />
    </>
  ),
};
