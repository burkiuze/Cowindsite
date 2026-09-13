import type { MetadataRoute } from "next";

const PAGES = ["", "/platform", "/integrations", "/about", "/faq", "/access"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_COWIND_URL ?? "https://cowindsite.vercel.app").replace(/\/+$/, "");
  const lastModified = new Date();

  return PAGES.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/integrations" ? 0.8 : 0.6,
  }));
}
