import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Absolute base for canonical URLs and social images.
 *
 * Prefer the configured public URL; fall back to what the host reports so a
 * deployment without that variable still shares correctly rather than pointing
 * every card at localhost.
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Cowind — the AI work operating system",
    template: "%s · Cowind",
  },
  description:
    "Cowind is an AI work operating system. Ask Wind for an outcome; it plans the work, runs it across specialists and your connected tools, holds anything consequential for approval, and reports what it did.",
  applicationName: "Cowind",
  openGraph: {
    title: "Cowind — the AI work operating system",
    description:
      "Ask for an outcome. Wind plans it, runs it, holds what matters for approval, and shows its receipts.",
    url: "/",
    siteName: "Cowind",
    images: ["/brand/og.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cowind — the AI work operating system",
    description: "Ask for an outcome. Wind does the work and shows its receipts.",
    images: ["/brand/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh bg-[var(--color-void)] text-[var(--color-ink)] antialiased">{children}</body>
    </html>
  );
}
