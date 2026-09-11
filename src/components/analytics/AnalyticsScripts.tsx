import Script from "next/script";
import type { StoredAnalyticsConsent } from "@/lib/analytics";
import { ANALYTICS_CONSENT_COOKIE } from "@/lib/analytics";

type Props = {
  /** GA4 production gate */
  enabled: boolean;
  measurementId: string | null;
  /** Ahrefs Web Analytics — cookieless; production-gated separately */
  ahrefsEnabled: boolean;
  ahrefsKey: string | null;
  /** Optional server hint; prefer client cookie read in stub to keep layout static. */
  initialAnalyticsConsent: StoredAnalyticsConsent | null;
};

/**
 * Non-blocking third-party analytics loaders (GA4 + Ahrefs).
 * Consent stub reads the first-party cookie in the browser so root layout
 * never needs cookies() (keeps pages CDN-cacheable).
 */
export function AnalyticsScripts({
  enabled,
  measurementId,
  ahrefsEnabled,
  ahrefsKey,
  initialAnalyticsConsent,
}: Props) {
  const cookieName = ANALYTICS_CONSENT_COOKIE;
  const serverHint = initialAnalyticsConsent === "granted" ? "granted" : "denied";

  return (
    <>
      {enabled && measurementId ? (
        <>
          <Script id="ga4-consent-stub" strategy="afterInteractive">
            {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
(function(){
  var analytics = '${serverHint}';
  try {
    var m = document.cookie.match(/(?:^|; )${cookieName}=([^;]*)/);
    if (m) {
      var v = decodeURIComponent(m[1]);
      if (v === 'granted' || v === 'denied') analytics = v;
    }
  } catch (e) {}
  gtag('consent', 'default', {
    analytics_storage: analytics,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
})();
`}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
        </>
      ) : null}
      {ahrefsEnabled && ahrefsKey ? (
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          strategy="afterInteractive"
          data-key={ahrefsKey}
        />
      ) : null}
    </>
  );
}
