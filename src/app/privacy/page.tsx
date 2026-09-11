import { TrustPageShell, trustMetadata } from "@/components/trust/TrustPageShell";

export const metadata = trustMetadata(
  "Privacy",
  "How Kitletics handles browsing data — interim privacy notice.",
  "/privacy",
);

export default function PrivacyPage() {
  return (
    <TrustPageShell
      title="Privacy"
      description="Interim privacy notice for Kitletics.com."
    >
      <p>
        Kitletics aims to collect only what is needed to run the site. Finder and
        Compare preferences may be stored in your browser (cookies or local
        storage). Shopping region preference may be stored in a cookie.
      </p>
      <p>
        Commercial click events are anonymous (product, retailer, region,
        placement). We do not send Finder health data such as exact weight or
        pace to affiliate networks.
      </p>
      <p>
        On production we may use Google Analytics 4 (GA4) to understand which
        pages and tools help athletes decide. Analytics cookies load only after
        you accept via our analytics consent banner (EU default: denied). You
        can reject analytics and still use the site. We do not use GA4 for ads
        personalization, and we do not send email addresses, names, or full
        affiliate destination URLs to Google.
      </p>
      <p>
        We may also use Ahrefs Web Analytics (cookieless traffic insights) on
        production. It does not replace the GA4 consent choice above.
      </p>
      <p>
        Affiliate or retailer clicks are not treated as consent for Google
        analytics. Region cookies are functional only.
      </p>
      <p className="text-sm text-subtle">
        This interim notice will be replaced with counsel-reviewed privacy
        policy before broad public marketing.
      </p>
    </TrustPageShell>
  );
}
