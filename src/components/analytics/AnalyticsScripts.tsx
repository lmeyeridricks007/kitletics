"use client";

import Script from "next/script";

/**
 * Optional GA4 loader. Only mounts when NEXT_PUBLIC_GA_MEASUREMENT_ID is set.
 * Analytics storage granted so GA4 collects pageviews; ad consent stays denied
 * until a CMP / ads setup is added.
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
      <Script id="ga4-init" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'granted'
});
gtag('js', new Date());
gtag('config', '${measurementId}');
`}
      </Script>
    </>
  );
}
