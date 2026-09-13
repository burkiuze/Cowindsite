/** Openers that show what Cowind is for: outcomes, not prompts. */
export const SUGGESTIONS = [
  {
    title: "Prepare tomorrow's product meeting",
    hint: "Pulls what the workspace knows, builds the agenda, drafts the decisions to make.",
    prompt:
      "Prepare everything I need for tomorrow's product meeting: what changed since last time, the decisions we owe an answer on, and the open risks. Give me an agenda I can walk in with.",
  },
  {
    title: "Review our position across the board",
    hint: "Runs technical, financial and market passes at the same time, then reconciles them.",
    prompt:
      "Review our startup across technical, financial and market dimensions and prepare a report for the founders. Say what you are confident about and what needs verification.",
  },
  {
    title: "Find the risk in this quarter's numbers",
    hint: "Reads the finance knowledge in the workspace and names what would actually hurt.",
    prompt:
      "Read the quarter's financials in our workspace knowledge and tell me the single risk most likely to hurt us in the next two quarters, with the figures behind it.",
  },
  {
    title: "Explain a spike we cannot reproduce",
    hint: "Engineering analysis with the trade-offs spelled out before you commit.",
    prompt:
      "Our p99 latency triples at the same time every night and we cannot reproduce it. Work out the likely cause from our architecture notes and propose a fix that does not need a migration.",
  },
];
