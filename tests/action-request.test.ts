import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * What happens when someone asks for an outcome rather than an answer.
 *
 * An action request is the sharp end of the product: it routes work, prepares
 * something real, and stops for a decision. Three things must hold — it is not
 * mistaken for analysis because it names a subject, the person is told what was
 * prepared, and the machine plumbing behind the action never reaches them.
 */

const laneOutputs: Record<string, string> = {};
let synthesisFails = false;

vi.mock("@/lib/wind/adapters/transport", () => ({
  complete: vi.fn(async ({ modelKey }: { modelKey: string }) => ({
    text: laneOutputs[modelKey] ?? `findings from ${modelKey}`,
    modelKey,
    ms: 5,
  })),
  stream: vi.fn(async function* () {
    if (synthesisFails) throw new Error("HTTP 503 from the engine gateway");
    yield "Toplantı hazırlandı. ";
    yield "Onayınıza sunuldu.";
  }),
}));

import { heuristicClassify } from "@/lib/wind/classifier";
import { route } from "@/lib/wind/router";
import { runWind } from "@/lib/wind/runtime";
import type { WindEvent } from "@/lib/wind/types";

const prompt = {
  workspaceName: "Meridian",
  userName: "Burak Şimşek",
  userRole: "Owner",
  today: "2026-09-13",
};

beforeEach(() => {
  process.env.WIND_PRIMARY_API_KEY = "test-key";
  process.env.WIND_SPECIALIST_API_KEY = "test-key";
  for (const key of Object.keys(laneOutputs)) delete laneOutputs[key];
  synthesisFails = false;
});

describe("routing an action that names a subject", () => {
  it("does the work instead of analysing it", () => {
    const heuristic = heuristicClassify(
      "Yazılım ekibiyle sürüm 2.15 için hazırlık toplantısı ayarla. Açık pull request'leri incele ve herkese davet gönder.",
      [],
    );
    expect(heuristic.intent).toBe("ACTION_REQUEST");
    // The subject is not lost: it is what the groundwork lane is for.
    expect(heuristic.scores.CODING).toBeGreaterThanOrEqual(3);
  });

  it("still reports back when the action stands alone", async () => {
    const decision = await route({
      message: "Bu videoyu YouTube, LinkedIn ve X'te paylaş",
      attachments: [],
      history: [],
      traceId: "t1",
      deterministicOnly: true,
    });
    expect(decision.intent).toBe("ACTION_REQUEST");
    expect(decision.lanes).toHaveLength(1);
    // One lane, and it drafts the action — so the answer is written separately.
    expect(decision.synthesize).toBe(true);
  });
});

describe("what the reader is shown", () => {
  it("never carries the tool plan into the answer, even when synthesis fails", async () => {
    // With synthesis unavailable the lane's own output is read out instead —
    // the one path where the plan could reach the page.
    synthesisFails = true;
    laneOutputs["wind.reasoning"] = [
      '{"steps":[',
      '  {"tool":"youtube.upload_video","label":"Yükle","payload":"Başlık: test"}',
      "]}",
      "",
      "TOOL: youtube.upload_video",
      "",
      "Yayın planı: önce yükleme, sonra paylaşım.",
    ].join("\n");

    const events: WindEvent[] = [];
    const generator = runWind({
      message: "Bu videoyu YouTube'da paylaş",
      attachments: [],
      history: [],
      prompt,
    });
    let step = await generator.next();
    while (!step.done) {
      events.push(step.value);
      step = await generator.next();
    }

    const shown = events
      .filter((event): event is Extract<WindEvent, { type: "delta" }> => event.type === "delta")
      .map((event) => event.text)
      .join("");
    // The lane's own words did come through: this is the fallback path.
    expect(shown).toContain("Yayın planı");
    expect(shown).not.toContain("TOOL:");
    expect(shown).not.toContain('"steps"');
  });
});
