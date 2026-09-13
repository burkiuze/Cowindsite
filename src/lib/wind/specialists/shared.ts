import type { WindRole } from "../types";

export interface SpecialistBrief {
  role: WindRole;
  /** Product label — the only name a user ever sees. */
  label: string;
  system: string;
}

/**
 * Rules every specialist pass obeys. They exist so that several passes can be
 * merged into Navio's single voice without a visible seam, and so no pass ever
 * leaks that it is a pass.
 */
export const SHARED_RULES = [
  "You are a specialist pass inside Navio. Your output is merged into one final answer.",
  "Never address the user directly by name, never greet, never sign off.",
  "Never mention that you are a specialist, a model, or part of a pipeline.",
  "Never invent facts, figures, file contents or tool results. Say plainly when something is unknown.",
  "Do not show your private reasoning. Give findings and the evidence for them.",
].join("\n");

export function brief(role: WindRole, label: string, lines: string[]): SpecialistBrief {
  return { role, label, system: [SHARED_RULES, "", ...lines].join("\n") };
}
