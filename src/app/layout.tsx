import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CompareTrayProvider } from "@/components/compare/CompareTrayProvider";
import { RegionPreferenceProvider } from "@/components/region/RegionPreferenceProvider";
import { GlobalCompareTray } from "@/components/compare/GlobalCompareTray";
import { SkipLink } from "@/components/layout/SkipLink";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooterGate } from "@/components/layout/SiteFooterGate";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicChromeGate } from "@/components/layout/PublicChromeGate";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { getServerAnalyticsConfig } from "@/lib/analytics";
import { siteConfig } from "@/content/config";
import "./globals.css";

/**
 * Deterministic typography tokens — no next/font/google network fetch at build.
 * Prefer DM Sans / Outfit when present on the device; otherwise system UI sans.
 * CSS variables keep the existing design-system classNames (font-body / font-display).
 */
const fontVariables = "font-kitletics";

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
  // Do not read cookies()/headers() here — that forces the entire app dynamic
  // (no CDN cache, multi-second TTFB). Consent defaults are applied in the
  // client stub (reads kit_analytics_consent when present).
  const analyticsConfig = getServerAnalyticsConfig();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontVariables} min-h-svh bg-background font-sans text-foreground antialiased`}
      >
        <ThemeProvider>
          <AnalyticsProvider config={analyticsConfig}>
            <CompareTrayProvider>
            <RegionPreferenceProvider>
              <SkipLink />
              <div className="flex min-h-svh flex-col">
                <PublicChromeGate>
                  <SiteHeader />
                </PublicChromeGate>
                <main id="main-content" tabIndex={-1} className="flex-1 outline-none scroll-mt-[var(--header-height)]">
                  {children}
                </main>
                <PublicChromeGate>
                  <SiteFooterGate footer={<SiteFooter />} />
                </PublicChromeGate>
              </div>
              <PublicChromeGate>
                <GlobalCompareTray />
              </PublicChromeGate>
            </RegionPreferenceProvider>
            </CompareTrayProvider>
          </AnalyticsProvider>
        </ThemeProvider>
        <PublicChromeGate>
          <AnalyticsScripts
            enabled={analyticsConfig.enabled}
            measurementId={analyticsConfig.measurementId}
            ahrefsEnabled={analyticsConfig.ahrefsEnabled}
            ahrefsKey={analyticsConfig.ahrefsKey}
            initialAnalyticsConsent={null}
          />
          <Analytics />
          <SpeedInsights sampleRate={0.1} />
        </PublicChromeGate>
      </body>
    </html>
  );
}
