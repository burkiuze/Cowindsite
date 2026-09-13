import "server-only";

/**
 * Runtime guardrails. Every limit is overridable by environment variable so an
 * operator can tighten the system without a code change. Defaults are chosen to
 * keep a single user request bounded in cost, time and blast radius.
 */

function num(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export const LIMITS = {
  /** Hard ceiling on specialist invocations for one user request. */
  maxSpecialistCalls: num("WIND_MAX_SPECIALIST_CALLS", 6, 1, 16),
  /** How deep the orchestrator may nest plans. Guards against agent loops. */
  maxOrchestrationDepth: num("WIND_MAX_ORCHESTRATION_DEPTH", 2, 1, 4),
  /** Retries per lane before the fallback chain is exhausted. */
  maxAttemptsPerLane: num("WIND_MAX_ATTEMPTS_PER_LANE", 3, 1, 5),
  /** Lanes allowed to execute at the same time. */
  maxParallelLanes: num("WIND_MAX_PARALLEL_LANES", 4, 1, 8),
  /** Timeout for one upstream engine call. */
  requestTimeoutMs: num("WIND_REQUEST_TIMEOUT_MS", 60_000, 5_000, 120_000),
  /** Timeout for an entire orchestrated task. */
  taskTimeoutMs: num("WIND_TASK_TIMEOUT_MS", 180_000, 10_000, 600_000),
  /** Largest single upload Wind will accept. */
  maxUploadBytes: num("WIND_MAX_UPLOAD_BYTES", 10 * 1024 * 1024, 64 * 1024, 25 * 1024 * 1024),
  /** Largest prompt Wind will assemble, in characters. */
  maxPromptChars: num("WIND_MAX_PROMPT_CHARS", 240_000, 4_000, 1_500_000),
  /** Message characters accepted from one request. */
  maxMessageChars: num("WIND_MAX_MESSAGE_CHARS", 32_000, 500, 200_000),
  /** History turns replayed to an engine. */
  maxHistoryTurns: num("WIND_MAX_HISTORY_TURNS", 20, 2, 60),
  /** Requests per minute, per workspace member. */
  rateLimitPerMinute: num("WIND_RATE_LIMIT_PER_MINUTE", 30, 1, 600),
  /** Attachments per request. */
  maxAttachments: num("WIND_MAX_ATTACHMENTS", 6, 1, 20),
} as const;

/** Execution budget for one request. Throws once a ceiling is reached. */
export class ExecutionBudget {
  private specialistCalls = 0;
  private depth = 0;
  readonly startedAt = Date.now();

  constructor(private readonly limits = LIMITS) {}

  get remainingMs(): number {
    return Math.max(0, this.limits.taskTimeoutMs - (Date.now() - this.startedAt));
  }

  get exhausted(): boolean {
    return this.remainingMs <= 0 || this.specialistCalls >= this.limits.maxSpecialistCalls;
  }

  /** Reserve a specialist call. Returns false when the budget is spent. */
  tryReserveCall(): boolean {
    if (this.specialistCalls >= this.limits.maxSpecialistCalls) return false;
    if (this.remainingMs <= 0) return false;
    this.specialistCalls += 1;
    return true;
  }

  enterDepth(): boolean {
    if (this.depth >= this.limits.maxOrchestrationDepth) return false;
    this.depth += 1;
    return true;
  }

  exitDepth(): void {
    this.depth = Math.max(0, this.depth - 1);
  }

  snapshot() {
    return {
      specialistCalls: this.specialistCalls,
      depth: this.depth,
      elapsedMs: Date.now() - this.startedAt,
      remainingMs: this.remainingMs,
    };
  }
}
