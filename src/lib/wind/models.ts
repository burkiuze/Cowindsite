import "server-only";
import type { Capability, WindRole } from "./types";

/**
 * ---------------------------------------------------------------------------
 * THE ONLY PLACE WHERE ENGINE IDENTIFIERS LIVE.
 * ---------------------------------------------------------------------------
 * Every engine Wind can reach is declared here once. Routing, fallback and
 * telemetry all refer to engines by their Cowind `key` — never by a raw
 * identifier — so swapping an engine is a one-line change in this file (or a
 * single environment variable, no deploy of code required).
 *
 * `identifier` values are sent to the private server-side adapters only. They
 * are never serialised into any response that reaches a browser.
 */

export type Pool = "primary" | "specialist";

export interface EngineSpec {
  /** Stable internal key used everywhere else in the codebase. */
  key: string;
  /** Which credential pool / endpoint serves this engine. */
  pool: Pool;
  /** Raw upstream identifier. Server-side only. Overridable via env. */
  identifier: string;
  /** Product-facing Wind role this engine backs. */
  role: WindRole;
  /** Human label shown in execution traces (Cowind branding only). */
  label: string;
  capabilities: Capability[];
  /** Usable context window in tokens (approximate, used for routing). */
  contextTokens: number;
  /** Relative latency class — lower is faster. */
  latencyClass: 1 | 2 | 3;
  /** Whether the engine accepts image input. */
  vision: boolean;
  /** Default sampling temperature for this engine. */
  temperature: number;
  maxOutputTokens: number;
}

const env = (name: string): string | undefined => {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
};

/**
 * Default upstream identifiers. Override any of them with the matching
 * `WIND_MODEL_*` environment variable if an identifier changes upstream.
 */
const IDENTIFIERS = {
  primary: env("WIND_MODEL_PRIMARY") ?? "inclusionai/ling-3.0-flash-fin:free",
  code: env("WIND_MODEL_CODE") ?? "nex-agi/nex-n2.5-pro:free",
  finance: env("WIND_MODEL_FINANCE") ?? "inclusionai/ling-3.0-flash-fin:free",
  reasoning: env("WIND_MODEL_REASONING") ?? "thinkingmachines/inkling:free",
  vision: env("WIND_MODEL_VISION") ?? "google/gemma-4-31b-it:free",
  data: env("WIND_MODEL_DATA") ?? "liquid/lfm2.5-2.6b:free",
} as const;

export const ENGINES: Record<string, EngineSpec> = {
  /** Fast conversational layer: everyday chat, routing, planning, synthesis. */
  "wind.core": {
    key: "wind.core",
    pool: "primary",
    identifier: IDENTIFIERS.primary,
    role: "wind",
    label: "Wind",
    capabilities: ["conversation", "routing", "synthesis"],
    contextTokens: 128_000,
    latencyClass: 1,
    vision: false,
    temperature: 0.6,
    maxOutputTokens: 2_048,
  },

  /** Engineering specialist: repositories, debugging, multi-file changes. */
  "wind.code": {
    key: "wind.code",
    pool: "specialist",
    identifier: IDENTIFIERS.code,
    role: "wind-code",
    label: "Wind Code",
    capabilities: ["code", "deep-reasoning", "long-context"],
    contextTokens: 262_000,
    latencyClass: 2,
    vision: false,
    temperature: 0.25,
    maxOutputTokens: 4_096,
  },

  /** Finance specialist: statements, investment workflows, financial reasoning. */
  "wind.finance": {
    key: "wind.finance",
    pool: "specialist",
    identifier: IDENTIFIERS.finance,
    role: "wind-finance",
    label: "Wind Finance",
    capabilities: ["finance", "deep-reasoning", "long-context"],
    contextTokens: 262_000,
    latencyClass: 2,
    vision: false,
    temperature: 0.2,
    maxOutputTokens: 4_096,
  },

  /** Reasoning specialist: hard problems, retrieval-heavy and long-context work. */
  "wind.reasoning": {
    key: "wind.reasoning",
    pool: "specialist",
    identifier: IDENTIFIERS.reasoning,
    role: "wind-reasoning",
    label: "Wind Reasoning",
    capabilities: ["deep-reasoning", "long-context", "research", "synthesis", "vision"],
    contextTokens: 1_050_000,
    latencyClass: 3,
    vision: true,
    temperature: 0.4,
    maxOutputTokens: 4_096,
  },

  /** Visual specialist: images, screenshots, visual document analysis. */
  "wind.vision": {
    key: "wind.vision",
    pool: "specialist",
    identifier: IDENTIFIERS.vision,
    role: "wind-vision",
    label: "Wind Vision",
    capabilities: ["vision", "conversation"],
    contextTokens: 262_000,
    latencyClass: 2,
    vision: true,
    temperature: 0.4,
    maxOutputTokens: 2_048,
  },

  /** Lightweight worker: extraction, structured data, background subtasks. */
  "wind.data": {
    key: "wind.data",
    pool: "specialist",
    identifier: IDENTIFIERS.data,
    role: "wind-data",
    label: "Wind Data",
    capabilities: ["extraction", "long-context", "conversation"],
    contextTokens: 66_000,
    latencyClass: 1,
    vision: false,
    temperature: 0.1,
    maxOutputTokens: 2_048,
  },
};

/** Default engine for a Wind role. */
export const ROLE_ENGINE: Record<WindRole, string> = {
  wind: "wind.core",
  "wind-code": "wind.code",
  "wind-finance": "wind.finance",
  "wind-vision": "wind.vision",
  "wind-reasoning": "wind.reasoning",
  "wind-research": "wind.reasoning",
  "wind-data": "wind.data",
  "wind-fast": "wind.data",
};

/**
 * Ordered fallback chains. When the preferred engine fails, Wind walks the
 * chain instead of surfacing an error. Every chain ends at an engine served by
 * the primary pool so a specialist-pool outage never breaks a conversation.
 */
export const FALLBACK_CHAIN: Record<string, string[]> = {
  "wind.core": ["wind.data", "wind.reasoning"],
  "wind.code": ["wind.reasoning", "wind.core"],
  "wind.finance": ["wind.reasoning", "wind.core"],
  "wind.reasoning": ["wind.code", "wind.core"],
  "wind.vision": ["wind.reasoning", "wind.core"],
  "wind.data": ["wind.core", "wind.reasoning"],
};

export function engine(key: string): EngineSpec {
  const spec = ENGINES[key];
  if (!spec) throw new Error(`Unknown Wind engine key: ${key}`);
  return spec;
}

export function engineForRole(role: WindRole): EngineSpec {
  return engine(ROLE_ENGINE[role]);
}

/** Public label for a role — the only naming users ever see. */
export const ROLE_LABEL: Record<WindRole, string> = {
  wind: "Wind",
  "wind-code": "Wind Code",
  "wind-finance": "Wind Finance",
  "wind-vision": "Wind Vision",
  "wind-reasoning": "Wind Reasoning",
  "wind-research": "Wind Research",
  "wind-data": "Wind Data",
  "wind-fast": "Wind Fast",
};

/** Engines that can satisfy a capability, best first. */
export function enginesFor(capability: Capability): EngineSpec[] {
  return Object.values(ENGINES)
    .filter((e) => e.capabilities.includes(capability))
    .sort((a, b) => a.latencyClass - b.latencyClass);
}
