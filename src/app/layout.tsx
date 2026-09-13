import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Display voice. A high-contrast serif for headlines only — it gives the page
 * an editorial weight that a grotesk at 56px cannot, and it keeps Navio from
 * looking like every other dark developer-tool site.
 */
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-serif",
  display: "swap",
});

/**
 * The name itself. A geometric sans, matching the wordmark on the brand card,
 * so "Navio" reads the same in the product as it does on a shared link.
 */
const wordmark = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-wordmark",
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
  const configured = (process.env.NEXT_PUBLIC_NAVIO_URL ?? process.env.NEXT_PUBLIC_COWIND_URL)?.trim();
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
    default: "Navio — the AI work operating system",
    template: "%s · Navio",
  },
  description:
    "Navio is an AI work operating system. Ask Navio for an outcome; it plans the work, runs it across specialists and your connected tools, holds anything consequential for approval, and reports what it did.",
  applicationName: "Navio",
  openGraph: {
    title: "Navio — the AI work operating system",
    description:
      "Ask for an outcome. Navio plans it, runs it, holds what matters for approval, and shows its receipts.",
    url: "/",
    siteName: "Navio",
    images: [
      {
        url: "/brand/og.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Navio — your AI workspace for what's next.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Navio — the AI work operating system",
    description: "Ask for an outcome. Navio does the work and shows its receipts.",
    images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: "Navio" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${wordmark.variable}`}>
      <body className="min-h-dvh bg-[var(--color-void)] text-[var(--color-ink)] antialiased">{children}</body>
    </html>
  );
}
