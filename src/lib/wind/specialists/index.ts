import type { WindRole } from "../types";
import { SHARED_RULES, type SpecialistBrief } from "./shared";
import { codeBrief } from "./code";
import { dataBrief } from "./data";
import { financeBrief } from "./finance";
import { reasoningBrief } from "./reasoning";
import { researchBrief } from "./research";
import { visionBrief } from "./vision";

export type { SpecialistBrief } from "./shared";

export const BRIEFS: Record<WindRole, SpecialistBrief> = {
  wind: { role: "wind", label: "Wind", system: SHARED_RULES },
  "wind-code": codeBrief,
  "wind-finance": financeBrief,
  "wind-vision": visionBrief,
  "wind-reasoning": reasoningBrief,
  "wind-research": researchBrief,
  "wind-data": dataBrief,
  "wind-fast": {
    role: "wind-fast",
    label: "Wind Fast",
    system: [SHARED_RULES, "", "You handle short, low-stakes passes quickly. Be brief and literal."].join("\n"),
  },
};

export function briefFor(role: WindRole): SpecialistBrief {
  return BRIEFS[role] ?? BRIEFS.wind;
}
