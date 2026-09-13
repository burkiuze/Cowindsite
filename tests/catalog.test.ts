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

  it("ships a real logo asset for every entry", () => {
    const missing = CATALOG.filter((entry) => !existsSync(join("public", "logos", `${entry.slug}.${entry.ext}`)));
    expect(missing.map((entry) => entry.slug)).toEqual([]);
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
  it("every adapter points at a real catalogue entry", () => {
    const slugs = new Set(CATALOG.map((entry) => entry.slug));
    for (const integration of FIRST_CLASS) {
      expect(slugs.has(integration.id), `${integration.id} is not in the catalogue`).toBe(true);
      expect(logoPath(integration.id)).not.toBeNull();
    }
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
    expect(github?.logo).toBe("/logos/github.webp");
  });

  it("resolves every featured service", () => {
    const featured = featuredServices();
    expect(featured.length).toBeGreaterThan(20);
    expect(featured.every((service) => service.logo)).toBe(true);
  });
});
