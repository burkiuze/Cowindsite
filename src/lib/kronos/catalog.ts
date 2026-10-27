/**
 * Kronos Cloud: the models it serves and the memberships that unlock them.
 *
 * Shared by the public page, the account page, the API and the operator panel,
 * so a price or a limit is stated once. Usage is metered in what the requests
 * actually cost upstream; a plan is a budget per 5-hour session and per week.
 */

export type PlanId = "lite" | "pro" | "max" | "max5";

export interface Plan {
  id: PlanId;
  name: string;
  /** usage relative to Pro */
  multiplier: number;
  blurb: string;
}

export const PLANS: Plan[] = [
  { id: "lite", name: "Lite", multiplier: 0.5, blurb: "For trying Kronos Cloud on everyday tasks." },
  { id: "pro", name: "Pro", multiplier: 1, blurb: "For daily work with the agent." },
  { id: "max", name: "Max", multiplier: 2, blurb: "2× the usage of Pro, for long agent sessions." },
  { id: "max5", name: "Max 5", multiplier: 5, blurb: "5× the usage of Pro, for running Kronos all day." },
];

export const PLAN_IDS = PLANS.map((p) => p.id);

export function planById(id: string | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

function envNumber(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

/** Budgets in millionths of a US dollar of upstream cost. */
export function planLimits(plan: PlanId): { fiveHourMicro: number; weekMicro: number } {
  const p = planById(plan);
  const m = p?.multiplier ?? 0;
  return {
    fiveHourMicro: Math.round(envNumber("KRONOS_PRO_5H_USD", 2) * m * 1_000_000),
    weekMicro: Math.round(envNumber("KRONOS_PRO_WEEK_USD", 15) * m * 1_000_000),
  };
}

export interface CloudModel {
  /** what Kronos sends as the model name */
  id: string;
  name: string;
  /** OpenRouter model slug */
  upstream: string;
  /** OpenRouter provider slug the request is pinned to */
  provider: string;
  providerName: string;
  contextWindow: number;
  maxOutput: number;
  vision: boolean;
  /** USD per million tokens, used only when the upstream response carries no cost */
  price: { input: number; output: number };
  blurb: string;
}

const BASE_MODELS: CloudModel[] = [
  {
    id: "glm-5.3-flash",
    name: "GLM 5.3 Flash",
    upstream: "z-ai/glm-5.3-flash",
    provider: "open-inference",
    providerName: "Open Inference",
    contextWindow: 262_144,
    maxOutput: 32_768,
    vision: false,
    price: { input: 0.15, output: 0.5 },
    blurb: "Fast coding and long agent runs.",
  },
  {
    id: "minimax-m3.1-flash",
    name: "MiniMax M3.1 Flash",
    upstream: "minimax/minimax-m3.1-flash",
    provider: "nebius",
    providerName: "Nebius Token Factory",
    contextWindow: 262_144,
    maxOutput: 32_768,
    vision: false,
    price: { input: 0.3, output: 1.2 },
    blurb: "Strong tool use at a low price per task.",
  },
  {
    id: "nemotron-3.5-super-vl",
    name: "Nemotron 3.5 Super VL",
    upstream: "nvidia/nemotron-3.5-super-vl",
    provider: "crusoe",
    providerName: "Crusoe",
    contextWindow: 262_144,
    maxOutput: 32_768,
    vision: true,
    price: { input: 0.3, output: 1.2 },
    blurb: "Reads screenshots, diagrams and documents.",
  },
  {
    id: "deepseek-v4.1-flash-1017",
    name: "DeepSeek V4.1 Flash 1017",
    upstream: "deepseek/deepseek-v4.1-flash-1017",
    provider: "wafer",
    providerName: "Wafer",
    contextWindow: 262_144,
    maxOutput: 32_768,
    vision: false,
    price: { input: 0.15, output: 0.6 },
    blurb: "Reasoning and code at flash speed.",
  },
];

/**
 * The catalogue, with optional per-model corrections from KRONOS_MODEL_OVERRIDES
 * (JSON keyed by model id), so an upstream slug or provider can be fixed
 * without a code change.
 */
export function cloudModels(): CloudModel[] {
  let overrides: Record<string, Partial<CloudModel>> = {};
  try {
    overrides = JSON.parse(process.env.KRONOS_MODEL_OVERRIDES || "{}");
  } catch {
    overrides = {};
  }
  return BASE_MODELS.map((m) => ({ ...m, ...(overrides[m.id] ?? {}) }));
}

export function cloudModel(id: string): CloudModel | undefined {
  const bare = id.replace(/^kronos[:/]/, "");
  return cloudModels().find((m) => m.id === bare || m.upstream === bare);
}

export const SITE_PATH = "/kronosagent";

/** Installers from the latest Kronos release (published by the KronosAgent release workflow). */
const RELEASES = "https://github.com/burkiuze/KronosAgent/releases/latest/download";
export const DOWNLOADS = {
  windows: { label: "Windows", file: `${RELEASES}/Kronos-Setup.exe`, note: "Windows 10 and 11 · 64-bit" },
  mac: { label: "macOS", file: `${RELEASES}/Kronos-mac.dmg`, note: "Apple silicon and Intel" },
} as const;
