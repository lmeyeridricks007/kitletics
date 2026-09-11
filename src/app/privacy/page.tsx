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
        If analytics or consent tooling is enabled in a given deployment, it
        follows that deployment’s consent policy. We do not sell personal data.
      </p>
      <p className="text-sm text-subtle">
        This interim notice will be replaced with counsel-reviewed privacy
        policy before broad public marketing.
      </p>
    </TrustPageShell>
  );
}
