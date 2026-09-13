import { describe, expect, it } from "vitest";
import { planLanes } from "@/lib/wind/router";
import { heuristicClassify } from "@/lib/wind/classifier";
import type { Attachment, Complexity, Intent } from "@/lib/wind/types";

function plan(message: string, attachments: Attachment[] = [], overrides: Partial<{ intent: Intent; complexity: Complexity }> = {}) {
  const heuristic = heuristicClassify(message, attachments);
  return planLanes({
    intent: overrides.intent ?? heuristic.intent,
    complexity: overrides.complexity ?? heuristic.complexity,
    heuristic,
    attachments,
    needsAction: false,
  });
}

describe("lane planning", () => {
  it("spends nothing on small talk", () => {
    expect(plan("Selam")).toHaveLength(0);
    expect(plan("thanks!")).toHaveLength(0);
  });

  it("opens one specialist lane for a focused domain request", () => {
    const lanes = plan("Find the bug in this repository and propose a fix", [], { complexity: "standard" });
    expect(lanes).toHaveLength(1);
    expect(lanes[0].role).toBe("wind-code");
  });

  it("adds a risk lane when a domain request is deep", () => {
    const lanes = plan("Analyse the balance sheet", [], { intent: "FINANCE", complexity: "deep" });
    expect(lanes.map((lane) => lane.role)).toEqual(["wind-finance", "wind-reasoning"]);
  });

  it("fans out across domains for multi-domain work", () => {
    const lanes = plan(
      "Bu startupın teknik, finansal ve stratejik durumunu incele: kod kalitesi, bütçe ve pazar rakip analizi dahil olsun",
    );
    expect(lanes.length).toBeGreaterThanOrEqual(3);
    // Independent lanes carry no dependencies, so they can run at once.
    expect(lanes.every((lane) => lane.dependsOn.length === 0)).toBe(true);
  });

  it("hears a Turkish scheduling request as an action", () => {
    const heuristic = heuristicClassify("Yarın 18:00 için toplantı ayarla ve katılımcılara davet gönder");
    expect(heuristic.intent).toBe("ACTION_REQUEST");
  });

  it("runs the domain work an action request carries, then plans the action on top", () => {
    const message =
      "Yarın saat 18:00'de ürün ve büyüme ekipleriyle toplantı ayarla, herkese davet gönder. Mevcut sponsorluk anlaşmalarımızı incele ve yarının programına göz at.";
    const heuristic = heuristicClassify(message);
    const lanes = planLanes({
      intent: heuristic.intent,
      complexity: heuristic.complexity,
      heuristic,
      attachments: [],
      needsAction: true,
    });

    const labels = lanes.map((lane) => lane.label);
    expect(labels).toContain("Financial review");
    expect(labels).toContain("Details");
    expect(labels).toContain("Action planning");

    // The groundwork runs in parallel; the action waits for all of it.
    const action = lanes.find((lane) => lane.label === "Action planning")!;
    const groundwork = lanes.filter((lane) => lane.label !== "Action planning");
    expect(groundwork.every((lane) => lane.dependsOn.length === 0)).toBe(true);
    expect(action.dependsOn.sort()).toEqual(groundwork.map((lane) => lane.id).sort());
  });

  it("keeps a bare action request to a single lane", () => {
    const heuristic = heuristicClassify("Yarın 18:00 için toplantı kur ve katılımcılara davet gönder");
    const lanes = planLanes({
      intent: heuristic.intent,
      complexity: heuristic.complexity,
      heuristic,
      attachments: [],
      needsAction: true,
    });
    expect(lanes.map((lane) => lane.label)).toEqual(["Action planning"]);
  });

  it("always opens a visual lane when an image is attached", () => {
    const attachment: Attachment = {
      id: "a1",
      name: "chart.png",
      kind: "image",
      mimeType: "image/png",
      size: 2048,
      dataUrl: "data:image/png;base64,AAA",
    };
    const lanes = plan("what is this", [attachment]);
    expect(lanes[0].role).toBe("wind-vision");
  });

  it("gives every lane a user-safe label and a real objective", () => {
    const lanes = plan("Review our technical and financial position with market context", [], {
      intent: "MULTI_DOMAIN",
      complexity: "deep",
    });
    for (const lane of lanes) {
      expect(lane.label.length).toBeGreaterThan(2);
      expect(lane.objective.length).toBeGreaterThan(20);
      expect(lane.label.toLowerCase()).not.toMatch(/model|engine|gpt|gemma|inkling/);
    }
  });
});
