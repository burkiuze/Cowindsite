import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG } from "@/lib/workspace/catalog.generated";
import { CATEGORY_LABEL, CATEGORY_ORDER, FIRST_CLASS, allServices, featuredServices, logoPath } from "@/lib/workspace/integrations";

/**
 * The catalogue is generated, so these guard the thing generation can silently
 * break: a service whose logo file is missing renders as a lettered tile, and a
 * curated entry whose slug drifted loses both its logo and its adapter.
 */
describe("generated catalogue", () => {
  it("has a substantial number of services", () => {
    expect(CATALOG.length).toBeGreaterThan(500);
  });

  it("has unique slugs", () => {
    expect(new Set(CATALOG.map((entry) => entry.slug)).size).toBe(CATALOG.length);
  });

  it("ships a real logo asset for every entry that claims one", () => {
    const missing = CATALOG.filter((entry) => entry.file && !existsSync(join("public", "logos", entry.file)));
    expect(missing.map((entry) => entry.slug)).toEqual([]);
  });

  it("carries no mark rather than another company's", () => {
    // A handful of marks in the source set belong to a different brand. Those
    // entries keep their place and fall back to a lettered tile — showing the
    // wrong company's logo would be worse than showing none.
    const unmarked = CATALOG.filter((entry) => entry.file === null);
    expect(unmarked.length).toBeGreaterThan(0);
    for (const entry of unmarked) {
      expect(logoPath(entry.slug)).toBeNull();
    }
  });

  it("uses only categories the UI can label and order", () => {
    for (const entry of CATALOG) {
      expect(CATEGORY_LABEL[entry.category], `missing label for ${entry.category}`).toBeDefined();
      expect(CATEGORY_ORDER).toContain(entry.category);
    }
  });

  it("gives every service a display name without slug artefacts", () => {
    for (const entry of CATALOG) {
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.name).not.toContain("-logo");
      expect(entry.name).not.toMatch(/^-|-$/);
    }
  });
});

describe("curated services", () => {
  it("every adapter resolves to a service people can see", () => {
    const services = new Map(allServices().map((service) => [service.slug, service]));
    for (const integration of FIRST_CLASS) {
      expect(services.has(integration.id), `${integration.id} is not in the catalogue`).toBe(true);
    }
  });

  it("only these adapters are knowingly without a brand mark", () => {
    // A service whose mark the logo set does not carry renders as a lettered
    // tile. That is deliberate; drawing someone else's logo ourselves is not.
    const markless = FIRST_CLASS.filter((integration) => logoPath(integration.id) === null).map(
      (integration) => integration.id,
    );
    expect(markless).toEqual(["higgsfield"]);
  });

  it("every adapter declares the credentials it needs", () => {
    for (const integration of FIRST_CLASS) {
      expect(integration.implemented).toBe(true);
      expect(integration.requiredEnv.length).toBeGreaterThan(0);
    }
  });

  it("merges curated detail over generated entries", () => {
    const github = allServices().find((service) => service.slug === "github");
    expect(github?.implemented).toBe(true);
    expect(github?.description).toBeTruthy();
    // The filename carries a hash of the image, so a corrected mark reaches a
    // browser that cached the old one.
    expect(github?.logo).toMatch(/^\/logos\/github-[0-9a-f]{8}\.webp$/);
  });

  it("resolves every featured service", () => {
    const featured = featuredServices();
    expect(featured.length).toBeGreaterThan(20);
    expect(featured.every((service) => service.logo)).toBe(true);
  });
});

describe("the private engine layer stays private", () => {
  it("never lists the gateway that serves Wind's specialists", () => {
    const forbidden = ["openrouter", "open router"];
    for (const entry of CATALOG) {
      const haystack = `${entry.slug} ${entry.name}`.toLowerCase();
      for (const name of forbidden) {
        expect(haystack, `${entry.slug} names the private engine layer`).not.toContain(name);
      }
    }
  });
});
