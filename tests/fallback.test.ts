import { describe, expect, it } from "vitest";
import { chainFor } from "@/lib/wind/fallback";
import { ENGINES, FALLBACK_CHAIN, ROLE_ENGINE, engineForRole } from "@/lib/wind/models";
import type { WindRole } from "@/lib/wind/types";

describe("fallback chains", () => {
  it("starts with the preferred engine and never repeats one", () => {
    for (const key of Object.keys(ENGINES)) {
      const chain = chainFor(key);
      expect(chain[0]).toBe(key);
      expect(new Set(chain).size).toBe(chain.length);
    }
  });

  it("gives every engine somewhere to fall back to", () => {
    for (const key of Object.keys(ENGINES)) {
      expect(chainFor(key).length).toBeGreaterThan(1);
    }
  });

  it("always ends up able to reach the primary pool", () => {
    // A specialist-pool outage must not be able to break a conversation.
    for (const key of Object.keys(ENGINES)) {
      const pools = chainFor(key).map((candidate) => ENGINES[candidate].pool);
      expect(pools).toContain("primary");
    }
  });

  it("ignores unknown keys in a chain instead of throwing", () => {
    expect(chainFor("wind.core")).not.toContain("does.not.exist");
  });

  it("references only declared engines", () => {
    for (const [key, chain] of Object.entries(FALLBACK_CHAIN)) {
      expect(ENGINES[key]).toBeDefined();
      for (const next of chain) expect(ENGINES[next]).toBeDefined();
    }
  });
});

describe("engine registry", () => {
  it("maps every product role to a declared engine", () => {
    for (const role of Object.keys(ROLE_ENGINE) as WindRole[]) {
      expect(engineForRole(role)).toBeDefined();
    }
  });

  it("only routes images to engines that accept them", () => {
    expect(engineForRole("wind-vision").vision).toBe(true);
  });

  it("labels every engine with Cowind branding only", () => {
    for (const engine of Object.values(ENGINES)) {
      expect(engine.label.startsWith("Wind")).toBe(true);
    }
  });
});
