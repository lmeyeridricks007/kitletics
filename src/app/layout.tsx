import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CompareTrayProvider } from "@/components/compare/CompareTrayProvider";
import { GlobalCompareTray } from "@/components/compare/GlobalCompareTray";
import { SkipLink } from "@/components/layout/SkipLink";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooterGate } from "@/components/layout/SiteFooterGate";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { siteConfig } from "@/content/config";
import "./globals.css";

const display = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: "/og/default.png", width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/og/default.png"],
  },
  ...(googleVerification || bingVerification
    ? {
        verification: {
          ...(googleVerification ? { google: googleVerification } : {}),
          ...(bingVerification
            ? { other: { "msvalidate.01": bingVerification } }
            : {}),
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${body.variable} min-h-svh bg-background font-sans text-foreground antialiased`}
      >
        <ThemeProvider>
          <CompareTrayProvider>
            <SkipLink />
            <div className="flex min-h-svh flex-col">
              <SiteHeader />
              <main id="main-content" tabIndex={-1} className="flex-1 outline-none scroll-mt-[var(--header-height)]">
                {children}
              </main>
              <SiteFooterGate footer={<SiteFooter />} />
            </div>
            <GlobalCompareTray />
          </CompareTrayProvider>
        </ThemeProvider>
        <AnalyticsScripts />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
