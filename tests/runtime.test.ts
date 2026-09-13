import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * End-to-end runtime behaviour with the engine layer stubbed out.
 *
 * This is where the product promises are checked together: small talk costs
 * nothing, multi-domain work fans out and is synthesised into one voice, a
 * failing engine falls back instead of surfacing an error, and no event that
 * reaches the browser carries anything about the private engine layer.
 */

const calls: string[] = [];
let failFirst = false;

vi.mock("@/lib/wind/adapters/transport", () => ({
  complete: vi.fn(async ({ modelKey }: { modelKey: string }) => {
    calls.push(`complete:${modelKey}`);
    if (failFirst && modelKey !== "wind.core") {
      failFirst = false;
      throw new Error("HTTP 503 from openrouter.ai — model nex-agi/nex-n2.5-pro:free unavailable");
    }
    return { text: `findings from ${modelKey}`, modelKey, ms: 5 };
  }),
  stream: vi.fn(async function* ({ modelKey }: { modelKey: string }) {
    calls.push(`stream:${modelKey}`);
    yield "Here is ";
    yield "the answer.";
  }),
}));

import { runWind } from "@/lib/wind/runtime";
import type { WindEvent } from "@/lib/wind/types";

const prompt = {
  workspaceName: "Meridian",
  userName: "Deniz Aral",
  userRole: "Founder",
  today: "2026-01-01",
};

async function run(message: string, options: { attachments?: never[] } = {}) {
  const events: WindEvent[] = [];
  const generator = runWind({ message, attachments: [], history: [], prompt, ...options });
  let result = await generator.next();
  while (!result.done) {
    events.push(result.value);
    result = await generator.next();
  }
  return { events, output: result.value };
}

beforeEach(() => {
  process.env.WIND_PRIMARY_API_KEY = "test-key";
  process.env.WIND_SPECIALIST_API_KEY = "test-key";
  calls.length = 0;
  failFirst = false;
});

describe("small talk", () => {
  it("answers on the primary engine alone", async () => {
    const { events, output } = await run("Selam");
    expect(output.direct).toBe(true);
    expect(output.decision.lanes).toHaveLength(0);
    expect(calls.filter((call) => call.startsWith("complete:"))).toHaveLength(0);
    expect(events.filter((event) => event.type === "delta").length).toBeGreaterThan(0);
    expect(output.text).toBe("Here is the answer.");
  });
});

describe("multi-domain work", () => {
  it("opens parallel streams and synthesises one answer", async () => {
    const { events, output } = await run(
      "Bu startupın teknik, finansal ve stratejik durumunu incele: kod kalitesi, bütçe ve pazar rakip analizi dahil olsun",
    );

    const plan = events.find((event) => event.type === "plan");
    expect(plan && plan.type === "plan" && plan.lanes.length).toBeGreaterThanOrEqual(3);

    const completed = events.filter((event) => event.type === "lane" && event.status === "completed");
    expect(completed.length).toBeGreaterThanOrEqual(3);

    // Specialists ran, and the primary engine wrote the single final answer.
    expect(calls.some((call) => call.startsWith("complete:wind."))).toBe(true);
    expect(calls).toContain("stream:wind.core");
    expect(output.direct).toBe(false);
  });

  it("stays inside the execution budget", async () => {
    const { output } = await run(
      "Review the technical, financial and market position with a full risk assessment and data extraction",
    );
    expect(output.laneResults.length).toBeLessThanOrEqual(6);
  });
});

describe("resilience", () => {
  it("falls back to another path instead of failing the step", async () => {
    failFirst = true;
    const { events, output } = await run("Find the bug in this repository and propose a fix", {});
    const lane = events.find((event) => event.type === "lane" && event.status === "completed");
    expect(lane).toBeDefined();
    expect(output.laneResults.every((result) => result.status !== "failed")).toBe(true);
  });
});

describe("nothing leaks", () => {
  it("keeps vendor and transport detail out of every emitted event", async () => {
    failFirst = true;
    const { events } = await run("Find the bug in this repository and propose a fix");
    const serialised = JSON.stringify(events).toLowerCase();
    for (const forbidden of ["openrouter", "nex-agi", "http 503", "gemma", "inkling", "liquid", "inclusionai"]) {
      expect(serialised).not.toContain(forbidden);
    }
  });

  it("refuses cleanly when no credential is present", async () => {
    delete process.env.WIND_PRIMARY_API_KEY;
    delete process.env.WIND_SPECIALIST_API_KEY;
    const { events } = await run("Selam");
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("error");
    expect(events[0].type === "error" && events[0].message).toContain("Settings");
  });
});
