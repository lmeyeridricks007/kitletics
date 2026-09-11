import { TrustPageShell, trustMetadata } from "@/components/trust/TrustPageShell";

export const metadata = trustMetadata(
  "Terms of Use",
  "Interim terms for Kitletics.com pending full legal publication.",
  "/terms",
);

export default function TermsPage() {
  return (
    <TrustPageShell
      title="Terms of use"
      description="Interim terms for Kitletics visitors and users."
    >
      <p>
        By using Kitletics.com you agree to use the site for personal,
        non-commercial research about sports gear. Product information,
        recommendations and prices may change and can be incomplete.
      </p>
      <p>
        Kitletics is an independent decision platform. We do not sell products
        directly. Purchases are made with third-party retailers under their
        terms. Affiliate relationships, when active, are disclosed separately.
      </p>
      <p>
        Content is provided as-is without warranty. Do not rely solely on
        Kitletics for medical, safety or purchasing decisions.
      </p>
      <p className="text-sm text-subtle">
        This interim page will be replaced with counsel-reviewed terms before
        broad public marketing. Contact: see the Contact page.
      </p>
    </TrustPageShell>
  );
}
