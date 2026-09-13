import type { MetadataRoute } from "next";

const PAGES = ["", "/platform", "/integrations", "/about", "/faq", "/access"];

function siteUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_NAVIO_URL ?? process.env.NEXT_PUBLIC_COWIND_URL)?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production}`;
  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) return `https://${deployment}`;
  return "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date();

  return PAGES.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/integrations" ? 0.8 : 0.6,
  }));
}
