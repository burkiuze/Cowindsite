import type { MetadataRoute } from "next";

/**
 * The public site is indexable. The workspace and the routes that drive it are
 * not — they are sealed by middleware, and this keeps crawlers from knocking.
 */
function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_COWIND_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production}`;
  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) return `https://${deployment}`;
  return "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app", "/app/", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
