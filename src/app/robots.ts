import type { MetadataRoute } from "next";

/**
 * The public site is indexable. The workspace and the routes that drive it are
 * not — they are sealed by middleware, and this keeps crawlers from knocking.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_COWIND_URL ?? "https://cowindsite.vercel.app";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app", "/app/", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
