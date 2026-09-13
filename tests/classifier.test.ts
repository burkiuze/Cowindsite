import { describe, expect, it } from "vitest";
import { heuristicClassify, parseClassifierJson } from "@/lib/wind/classifier";
import type { Attachment } from "@/lib/wind/types";

const image = (): Attachment => ({
  id: "a1",
  name: "screen.png",
  kind: "image",
  mimeType: "image/png",
  size: 1024,
  dataUrl: "data:image/png;base64,AAA",
});

describe("heuristic classification", () => {
  it("treats a greeting as trivial general work", () => {
    const result = heuristicClassify("Selam");
    expect(result.intent).toBe("GENERAL");
    expect(result.complexity).toBe("trivial");
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("routes Turkish finance requests to finance", () => {
    expect(heuristicClassify("Bu şirketin bilançosunu analiz et").intent).toBe("FINANCE");
  });

  it("routes engineering requests to coding", () => {
    expect(heuristicClassify("Bu repodaki bugı bul ve çözüm öner").intent).toBe("CODING");
    expect(heuristicClassify("Find the bug in this repository and propose a fix").intent).toBe("CODING");
  });

  it("routes on the attachment, not the wording, when an image is present", () => {
    expect(heuristicClassify("Bu fotoğrafta ne oluyor?", [image()]).intent).toBe("VISION");
    expect(heuristicClassify("what about this", [image()]).intent).toBe("VISION");
  });

  it("recognises extraction work", () => {
    expect(heuristicClassify("Bu JSON'dan sadece isimleri çıkar").intent).toBe("DATA_EXTRACTION");
  });

  it("recognises long-context work", () => {
    expect(heuristicClassify("300 sayfalık belgede temel çelişkileri bul").intent).toBe("LONG_CONTEXT");
  });

  it("marks compound cross-domain requests as multi-domain and deep", () => {
    const result = heuristicClassify(
      "Bu startupın teknik, finansal ve stratejik durumunu incele: kod kalitesi, bütçe ve pazar rakip analizi dahil olsun",
    );
    expect(result.intent).toBe("MULTI_DOMAIN");
    expect(["standard", "deep"]).toContain(result.complexity);
  });

  it("recognises an action request", () => {
    expect(heuristicClassify("Send an email to the finance leads with this summary").intent).toBe("ACTION_REQUEST");
  });
});

describe("classifier json parsing", () => {
  it("accepts a well-formed object even with surrounding prose", () => {
    const parsed = parseClassifierJson('sure: {"intent":"CODING","complexity":"deep","domains":["code"],"needs_action":false}');
    expect(parsed?.intent).toBe("CODING");
    expect(parsed?.complexity).toBe("deep");
  });

  it("rejects unknown values rather than trusting them", () => {
    const parsed = parseClassifierJson('{"intent":"NONSENSE","complexity":"epic"}');
    expect(parsed?.intent).toBeUndefined();
    expect(parsed?.complexity).toBeUndefined();
  });

  it("returns null when there is no object at all", () => {
    expect(parseClassifierJson("I think this is about code.")).toBeNull();
  });
});
