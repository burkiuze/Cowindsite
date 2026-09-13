import { describe, expect, it } from "vitest";
import { classifyError, sanitizeForUser, userFacingError, WindError } from "@/lib/wind/redaction";

/**
 * The single most important guarantee in the product: nothing about the private
 * engine layer reaches a user. These tests are the guard on that promise.
 */
describe("sanitizeForUser", () => {
  it("removes raw engine identifiers", () => {
    const output = sanitizeForUser("Request to nex-agi/nex-n2.5-pro:free failed");
    expect(output).not.toContain("nex-agi");
    expect(output).not.toContain("nex-n2.5-pro");
  });

  it("removes vendor names in any casing", () => {
    for (const vendor of ["OpenRouter", "InclusionAI", "Thinking Machines", "LiquidAI", "Gemma", "Inkling"]) {
      expect(sanitizeForUser(`Served by ${vendor} today`).toLowerCase()).not.toContain(
        vendor.toLowerCase().replace(" ", ""),
      );
    }
  });

  it("removes endpoints and api hosts", () => {
    const output = sanitizeForUser("POST https://openrouter.ai/api/v1/chat/completions returned 500");
    expect(output).not.toContain("openrouter");
    expect(output).not.toContain("https://");
  });

  it("removes credentials", () => {
    expect(sanitizeForUser("Authorization: Bearer sk-abc123def456ghi789")).not.toContain("sk-abc123def456ghi789");
    expect(sanitizeForUser("key sk-live-9f8e7d6c5b4a3210")).toContain("[redacted]");
  });

  it("rewrites transport vocabulary into product language", () => {
    const output = sanitizeForUser("HTTP 429 rate limited by upstream provider");
    expect(output).not.toMatch(/HTTP\s?429/);
    expect(output).not.toContain("upstream");
    expect(output.toLowerCase()).not.toContain("provider");
  });

  it("keeps ordinary product text and file paths intact", () => {
    expect(sanitizeForUser("Wind read src/lib/wind/router.ts and found the issue")).toContain("src/lib/wind/router.ts");
    expect(sanitizeForUser("Runway is 17.9 months on 6.9M cash")).toBe("Runway is 17.9 months on 6.9M cash");
  });
});

describe("error mapping", () => {
  it("classifies transport failures", () => {
    expect(classifyError(new Error("fetch failed"))).toBe("unavailable");
    expect(classifyError(new Error("429 Too Many Requests"))).toBe("capacity");
    expect(classifyError(new Error("The operation was aborted"))).toBe("timeout");
    expect(classifyError(new WindError("context", "too long"))).toBe("context");
  });

  it("produces calm, Navio-branded copy for every code", () => {
    for (const code of ["timeout", "capacity", "context", "unavailable", "unconfigured", "invalid", "budget"] as const) {
      const message = userFacingError(code);
      expect(message.length).toBeGreaterThan(10);
      expect(message.toLowerCase()).not.toMatch(/http|api key|provider|openrouter|model/);
    }
  });
});

describe("StreamSanitizer", () => {
  it("catches an identifier split across chunks", async () => {
    const { StreamSanitizer } = await import("@/lib/wind/redaction");
    const guard = new StreamSanitizer(16);
    const chunks = ["Served by inclu", "sionai/ling-3.0", "-flash-fin:free", " for this step, all good, carry on now."];
    let out = "";
    for (const chunk of chunks) out += guard.push(chunk);
    out += guard.flush();
    expect(out.toLowerCase()).not.toContain("inclusionai");
    expect(out.toLowerCase()).not.toContain("ling-3.0");
  });

  it("reassembles into the same text when there is nothing to scrub", async () => {
    const { StreamSanitizer } = await import("@/lib/wind/redaction");
    const guard = new StreamSanitizer(12);
    const source = "Runway is 17.9 months on 6.9M cash, and the risk is concentration in three accounts.";
    let out = "";
    for (const piece of source.match(/.{1,7}/g)!) out += guard.push(piece);
    out += guard.flush();
    expect(out).toBe(source);
  });

  it("holds everything back until the stream ends if it is short", async () => {
    const { StreamSanitizer } = await import("@/lib/wind/redaction");
    const guard = new StreamSanitizer(64);
    expect(guard.push("hello")).toBe("");
    expect(guard.flush()).toBe("hello");
  });
});
