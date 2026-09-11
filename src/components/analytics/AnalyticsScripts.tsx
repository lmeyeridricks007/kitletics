"use client";

import Script from "next/script";

/**
 * Optional GA4 loader. Only mounts when NEXT_PUBLIC_GA_MEASUREMENT_ID is set.
 * Uses Consent Mode defaults denied until a CMP updates consent (EU-friendly).
 */
export function AnalyticsScripts() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-consent-init" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', '${measurementId}', { anonymize_ip: true });
`}
      </Script>
    </>
  );
}
