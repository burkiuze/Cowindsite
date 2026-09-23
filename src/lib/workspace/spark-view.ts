import type { SparkPhase, SparkRound, SparkRun } from "./types";

/**
 * A Spark run, as the browser sees it.
 *
 * The same run the server is filling in, minus what a person has no use for,
 * plus what they do: each tool it read carries its real name and mark. The
 * request text is not echoed back — the conversation already shows it.
 */
export type SparkRunView = {
  id: string;
  status: SparkRun["status"];
  phase: SparkPhase;
  reads: Array<{ id: string; integrationId: string; name: string; logo: string | null; dark: boolean; label: string; status: "running" | "completed" | "failed" }>;
  criteria: string[];
  rounds: SparkRound[];
  maxRounds: number;
  draft?: string;
  outcome?: SparkRun["outcome"];
  approvalId?: string;
  taskId?: string;
  error?: string;
  stopRequested: boolean;
  startedAt: number;
  finishedAt?: number;
};

type ServiceLike = { name: string; logo: string | null; dark: boolean };

export function sparkView(run: SparkRun, services: Map<string, ServiceLike>): SparkRunView {
  return {
    id: run.id,
    status: run.status,
    phase: run.phase,
    reads: run.reads.map((read) => {
      const service = services.get(read.integrationId);
      return {
        ...read,
        name: service?.name ?? read.integrationId,
        logo: service?.logo ?? null,
        dark: service?.dark ?? false,
      };
    }),
    criteria: run.criteria,
    rounds: run.rounds,
    maxRounds: run.maxRounds,
    draft: run.draft,
    outcome: run.outcome,
    approvalId: run.approvalId,
    taskId: run.taskId,
    error: run.error,
    stopRequested: Boolean(run.stopRequested),
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
  };
}
