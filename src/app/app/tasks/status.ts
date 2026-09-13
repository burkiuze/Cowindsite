import type { Tone } from "@/components/ui/primitives";
import type { TaskStatus } from "@/lib/workspace/types";

/** Shared status vocabulary for task surfaces. */
export const STATUS_TONE: Record<TaskStatus, Tone> = {
  queued: "neutral",
  running: "running",
  blocked: "warning",
  needs_approval: "warning",
  completed: "success",
  failed: "danger",
  cancelled: "neutral",
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  queued: "Queued",
  running: "Running",
  blocked: "Blocked",
  needs_approval: "Needs approval",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};
