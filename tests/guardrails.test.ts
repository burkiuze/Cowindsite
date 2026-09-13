import { describe, expect, it } from "vitest";
import { ExecutionBudget, LIMITS } from "@/lib/wind/config";
import { EventChannel } from "@/lib/wind/channel";

describe("execution budget", () => {
  it("stops runaway specialist usage", () => {
    const budget = new ExecutionBudget();
    let reserved = 0;
    while (budget.tryReserveCall()) reserved += 1;
    expect(reserved).toBe(LIMITS.maxSpecialistCalls);
    expect(budget.exhausted).toBe(true);
  });

  it("bounds orchestration depth", () => {
    const budget = new ExecutionBudget();
    let depth = 0;
    while (budget.enterDepth()) depth += 1;
    expect(depth).toBe(LIMITS.maxOrchestrationDepth);
    budget.exitDepth();
    expect(budget.enterDepth()).toBe(true);
  });

  it("reports a shrinking time budget", () => {
    const budget = new ExecutionBudget();
    expect(budget.remainingMs).toBeLessThanOrEqual(LIMITS.taskTimeoutMs);
    expect(budget.snapshot().specialistCalls).toBe(0);
  });
});

describe("event channel", () => {
  it("delivers events pushed before and after a reader arrives", async () => {
    const channel = new EventChannel<number>();
    channel.push(1);

    const received: number[] = [];
    const reader = (async () => {
      for await (const value of channel) received.push(value);
    })();

    channel.push(2);
    await new Promise((resolve) => setTimeout(resolve, 5));
    channel.push(3);
    channel.close();
    await reader;

    expect(received).toEqual([1, 2, 3]);
  });

  it("ignores pushes after close", async () => {
    const channel = new EventChannel<string>();
    channel.close();
    channel.push("late");
    const received: string[] = [];
    for await (const value of channel) received.push(value);
    expect(received).toEqual([]);
  });
});
