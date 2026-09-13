import "server-only";
import { LIMITS, ExecutionBudget } from "./config";
import { runLane, type AvailableTool, type LaneContext } from "./executor";
import { telemetry } from "./telemetry";
import type { Attachment, LanePlan, LaneResult, WindEvent } from "./types";

/**
 * The orchestrator.
 *
 * Takes a routed plan and runs it: dependencies respected, independent lanes in
 * parallel, bounded by the execution budget, cancellable, and reporting only
 * safe operational state ("Financial analysis — running") as it goes.
 *
 * It never reveals private reasoning: lane labels and statuses are the entire
 * user-visible surface of execution.
 */

export interface OrchestrationInput {
  lanes: LanePlan[];
  userRequest: string;
  attachments: Attachment[];
  knowledge?: string;
  traceId: string;
  budget: ExecutionBudget;
  signal?: AbortSignal;
  emit: (event: WindEvent) => void;
  availableTools?: AvailableTool[];
}

export interface OrchestrationOutput {
  results: LaneResult[];
  completed: LaneResult[];
  failed: LaneResult[];
  /** True when at least one lane produced usable output. */
  usable: boolean;
}

export async function orchestrate(input: OrchestrationInput): Promise<OrchestrationOutput> {
  const { lanes, emit, budget } = input;

  if (!budget.enterDepth()) {
    telemetry.error(input.traceId, "orchestration depth limit reached");
    return { results: [], completed: [], failed: [], usable: false };
  }

  const statuses = new Map<string, LaneResult["status"]>(lanes.map((lane) => [lane.id, "waiting" as const]));
  const results = new Map<string, LaneResult>();

  emit({
    type: "plan",
    lanes: lanes.map((lane) => ({ id: lane.id, label: lane.label, role: lane.role, status: "waiting" as const })),
  });

  try {
    const pending = new Set(lanes.map((lane) => lane.id));
    const byId = new Map(lanes.map((lane) => [lane.id, lane]));

    while (pending.size > 0) {
      if (input.signal?.aborted) break;

      // Lanes whose dependencies are all resolved can start now.
      const ready = [...pending]
        .map((id) => byId.get(id)!)
        .filter((lane) => lane.dependsOn.every((dependency) => !pending.has(dependency)))
        .slice(0, LIMITS.maxParallelLanes);

      if (ready.length === 0) {
        // Cyclic or unsatisfiable dependency: fail the remainder safely.
        for (const id of pending) {
          const lane = byId.get(id)!;
          results.set(id, skipped(lane, "Navio skipped this step because a step it depended on did not finish."));
          emit({ type: "lane", id, status: "skipped", label: lane.label, role: lane.role });
        }
        break;
      }

      for (const lane of ready) {
        statuses.set(lane.id, "running");
        emit({ type: "lane", id: lane.id, status: "running", label: lane.label, role: lane.role });
      }

      const settled = await Promise.all(
        ready.map((lane) => {
          const context: LaneContext = {
            userRequest: input.userRequest,
            attachments: input.attachments,
            upstream: lane.dependsOn.map((id) => results.get(id)).filter((r): r is LaneResult => Boolean(r)),
            knowledge: input.knowledge,
            traceId: input.traceId,
            budget,
            signal: input.signal,
            availableTools: input.availableTools,
            onNote: (note) => emit({ type: "lane", id: lane.id, status: "running", label: lane.label, role: lane.role, note }),
          };
          return runLane(lane, context);
        }),
      );

      for (const result of settled) {
        results.set(result.laneId, result);
        statuses.set(result.laneId, result.status);
        pending.delete(result.laneId);
        emit({
          type: "lane",
          id: result.laneId,
          status: result.status,
          label: result.label,
          role: result.role,
          note: result.note,
        });
      }

      if (budget.exhausted) {
        for (const id of pending) {
          const lane = byId.get(id)!;
          results.set(id, skipped(lane, "Navio stopped here to stay inside its execution budget."));
          emit({ type: "lane", id, status: "skipped", label: lane.label, role: lane.role });
        }
        emit({ type: "notice", level: "warn", message: "Navio reached its execution budget for this request." });
        break;
      }
    }
  } finally {
    budget.exitDepth();
    telemetry.budget(input.traceId, budget.snapshot());
  }

  const ordered = lanes.map((lane) => results.get(lane.id)).filter((r): r is LaneResult => Boolean(r));
  const completed = ordered.filter((r) => r.status === "completed" && r.output.trim().length > 0);

  return {
    results: ordered,
    completed,
    failed: ordered.filter((r) => r.status === "failed"),
    usable: completed.length > 0,
  };
}

function skipped(lane: LanePlan, note: string): LaneResult {
  return {
    laneId: lane.id,
    role: lane.role,
    label: lane.label,
    status: "skipped",
    output: "",
    note,
    startedAt: Date.now(),
    finishedAt: Date.now(),
  };
}
