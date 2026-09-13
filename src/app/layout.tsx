import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_COWIND_URL ?? "http://localhost:3000"),
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
