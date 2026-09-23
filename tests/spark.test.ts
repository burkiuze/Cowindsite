import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Spark's promises, checked with the engine layer stubbed out.
 *
 * It keeps going until its own review passes, and no further. It stops at the
 * round limit and says so. A review that did not happen, or that hedged, is not
 * a pass. A person's stop is honoured and the latest draft is kept. And the
 * only thing it can do to the outside world is ask for an approval — once, from
 * the final version.
 */

type Script = {
  criteria: string;
  /** Review answer per round, 1-based. */
  reviews: Record<number, string>;
};

let script: Script;
const prompts: string[] = [];

vi.mock("@/lib/wind/adapters/transport", () => ({
  complete: vi.fn(async ({ messages }: { messages: Array<{ content: string }> }) => {
    const text = messages.map((message) => message.content).join("\n");
    prompts.push(text);
    if (text.includes("Spark quality bar")) return { text: script.criteria, modelKey: "k", ms: 1 };
    const review = text.match(/Spark review, round (\d+)/);
    if (review) return { text: script.reviews[Number(review[1])] ?? "no json here", modelKey: "k", ms: 1 };
    const revision = text.match(/Spark revision, round (\d+)/);
    if (revision) return { text: `Draft v${revision[1]}`, modelKey: "k", ms: 1 };
    if (text.includes("Spark draft, round 1")) return { text: "Draft v1", modelKey: "k", ms: 1 };
    if (text.includes("Draft the exact action")) {
      return { text: "TOOL: gmail.send_email\nKime: sponsor@example.com\nKonu: Paket", modelKey: "k", ms: 1 };
    }
    return { text: "", modelKey: "k", ms: 1 };
  }),
  stream: vi.fn(async function* () {
    yield "";
  }),
}));

import { alignChecks, parseChecks, runSpark } from "@/lib/wind/spark";
import type { SparkRun } from "@/lib/workspace/types";

const CRITERIA = JSON.stringify({ criteria: ["Üç kademe var", "Fiyatlar gerekçeli", "Son tarih yazılı", "E-posta hazır"] });

function allOk(): string {
  return JSON.stringify({ checks: JSON.parse(CRITERIA).criteria.map((criterion: string) => ({ criterion, ok: true })) });
}

function failing(index: number, issue: string): string {
  return JSON.stringify({
    checks: JSON.parse(CRITERIA).criteria.map((criterion: string, position: number) =>
      position === index ? { criterion, ok: false, issue } : { criterion, ok: true },
    ),
  });
}

function newRun(overrides: Partial<SparkRun> = {}): SparkRun {
  return {
    id: "spk_test",
    workspaceId: "ws",
    conversationId: "cnv",
    messageId: "msg",
    request: "Sponsorluk paketini hazırla ve sponsorlara e-posta gönder.",
    createdBy: "usr",
    status: "running",
    phase: "reading",
    reads: [],
    criteria: [],
    rounds: [],
    maxRounds: 4,
    startedAt: Date.now(),
    ...overrides,
  };
}

const prompt = { workspaceName: "Navio Company", userName: "Burak", userRole: "Founder", today: "2026-09-23" };

beforeEach(() => {
  process.env.WIND_PRIMARY_API_KEY = "test-key";
  process.env.WIND_SPECIALIST_API_KEY = "test-key";
  prompts.length = 0;
});

describe("runSpark", () => {
  it("keeps revising until the review passes, then stops", async () => {
    script = { criteria: CRITERIA, reviews: { 1: failing(1, "Fiyatların gerekçesi yok"), 2: allOk() } };
    const run = await runSpark({ run: newRun(), prompt, availableTools: [], actor: "Burak" });

    expect(run.status).toBe("completed");
    expect(run.outcome).toBe("passed");
    expect(run.rounds).toHaveLength(2);
    expect(run.rounds[0].passed).toBe(false);
    expect(run.rounds[0].checks[1]).toMatchObject({ ok: false, issue: "Fiyatların gerekçesi yok" });
    expect(run.rounds[1].passed).toBe(true);
    expect(run.draft).toBe("Draft v2");
    // The revision was told exactly what failed.
    expect(prompts.find((text) => text.includes("Spark revision, round 2"))).toContain("Fiyatların gerekçesi yok");
  });

  it("stops at the round limit and says so", async () => {
    script = { criteria: CRITERIA, reviews: { 1: failing(0, "a"), 2: failing(0, "b"), 3: failing(0, "c"), 4: failing(0, "d") } };
    const run = await runSpark({ run: newRun(), prompt, availableTools: [], actor: "Burak" });

    expect(run.rounds).toHaveLength(4);
    expect(run.outcome).toBe("limit");
    expect(run.status).toBe("completed");
    expect(run.draft).toBe("Draft v4");
  });

  it("does not count a review that never came back as a pass", async () => {
    script = { criteria: CRITERIA, reviews: { 1: "I think it looks good overall." } };
    const run = await runSpark({ run: newRun({ maxRounds: 1 }), prompt, availableTools: [], actor: "Burak" });

    expect(run.rounds[0].passed).toBe(false);
    expect(run.rounds[0].checks.every((check) => !check.ok)).toBe(true);
    expect(run.outcome).toBe("limit");
  });

  it("honours a stop and keeps the latest draft", async () => {
    script = { criteria: CRITERIA, reviews: { 1: failing(2, "Son tarih yok") } };
    const run = newRun();
    const result = await runSpark({
      run,
      prompt,
      availableTools: [],
      actor: "Burak",
      services: {
        onChange: (current) => {
          if (current.rounds[0]?.finishedAt) current.stopRequested = true;
        },
      },
    });

    expect(result.status).toBe("stopped");
    expect(result.rounds).toHaveLength(1);
    expect(result.draft).toBe("Draft v1");
  });

  it("asks for approval once, from the final version, and never acts itself", async () => {
    script = { criteria: CRITERIA, reviews: { 1: failing(3, "E-posta eksik"), 2: allOk() } };
    const requestApproval = vi.fn(async (_draft: { toolId?: string }) => ({ id: "apr_1" }));
    const run = await runSpark({
      run: newRun(),
      prompt,
      availableTools: [{ id: "gmail.send_email", name: "Send an email", integrationId: "gmail", effect: "write" }],
      actor: "Burak",
      services: { requestApproval },
    });

    expect(requestApproval).toHaveBeenCalledTimes(1);
    expect(run.approvalId).toBe("apr_1");
    expect(requestApproval.mock.calls[0]?.[0]).toMatchObject({ toolId: "gmail.send_email" });
    // Drafted from the version that passed, not the first one.
    expect(prompts.find((text) => text.includes("Draft the exact action"))).toContain("Draft v2");
  });

  it("falls back to a standing bar when none can be set", async () => {
    script = { criteria: "not json", reviews: { 1: JSON.stringify({ checks: [] }) } };
    const run = await runSpark({ run: newRun({ maxRounds: 1 }), prompt, availableTools: [], actor: "Burak" });

    expect(run.criteria.length).toBeGreaterThanOrEqual(3);
    // A review that covered nothing passes nothing.
    expect(run.rounds[0].passed).toBe(false);
  });
});

describe("review parsing", () => {
  it("only an explicit true passes", () => {
    const checks = parseChecks(
      JSON.stringify({ checks: [{ criterion: "a", ok: "yes" }, { criterion: "b", ok: 1 }, { criterion: "c", ok: true }] }),
    );
    expect(checks.map((check) => check.ok)).toEqual([false, false, true]);
  });

  it("fails a criterion the review skipped", () => {
    const aligned = alignChecks(["a", "b", "c"], [{ criterion: "a", ok: true }]);
    expect(aligned[0].ok).toBe(true);
    expect(aligned[1].ok).toBe(false);
    expect(aligned[2].ok).toBe(false);
  });

  it("keeps engine plumbing out of the issues a person reads", () => {
    const aligned = alignChecks(["a"], [{ criterion: "a", ok: false, issue: "Failed on nex-agi/nex-n2.5-pro:free" }]);
    expect(aligned[0].issue).not.toContain("nex-agi");
  });
});
