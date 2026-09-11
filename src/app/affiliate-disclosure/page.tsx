import { TrustPageShell, trustMetadata } from "@/components/trust/TrustPageShell";
import { TrustRelatedNav } from "@/components/trust/TrustRelatedNav";
import Link from "next/link";

export const metadata = trustMetadata(
  "Affiliate Disclosure",
  "How Kitletics may earn commissions from retailer links — and how that never affects recommendations.",
  "/affiliate-disclosure",
);

export default function AffiliateDisclosurePage() {
  return (
    <TrustPageShell
      title="Affiliate disclosure"
      description="Transparency about commercial relationships — commission does not influence ranking."
    >
      <p>
        Some retailer links on Kitletics may be affiliate links. If you purchase
        through them, we may earn a commission at no extra cost to you. Compact
        disclosures also appear near buy / price CTAs on product and review
        pages.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        How affiliate links work
      </h2>
      <p>
        When you click a retailer link, we may route through a controlled
        redirect that records an anonymous click event and appends tracking
        parameters only when an active affiliate program is configured for that
        retailer and region. If no affiliate program is active, we still link to
        the retailer normally — useful buying options are never hidden because
        Kitletics earns no commission.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Which links may earn commission
      </h2>
      <p>
        Only retailers with an <strong className="text-foreground">active</strong>{" "}
        regional affiliate program and valid credentials can generate affiliate
        URLs. Pending or unconfigured programs use the ordinary retailer URL.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Recommendation independence
      </h2>
      <p>
        Affiliate relationships do not determine recommendation scores, Best
        Guide awards, Finder match scores, comparison winners, alternatives, or
        Shoe Rotation Planner results. We decide{" "}
        <em>which product is appropriate</em> before{" "}
        <em>where you can buy it</em>. Scoring detail:{" "}
        <Link
          href="/scoring-methodology"
          className="text-accent hover:underline"
        >
          scoring methodology
        </Link>
        .
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Pricing limitations
      </h2>
      <p>
        Prices shown on Kitletics come from ingested or verified Offer data for
        your selected shopping region. They can change at the retailer. Stale
        prices are not presented as confidently current. Kitletics does not
        control retailer inventory or checkout.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Retailer responsibility
      </h2>
      <p>
        Purchases, returns, warranties, and customer service are handled by the
        retailer. Marketplace sellers may differ from the marketplace brand
        itself — we show seller names when available.
      </p>

      <TrustRelatedNav currentPath="/affiliate-disclosure" />
    </TrustPageShell>
  );
}
