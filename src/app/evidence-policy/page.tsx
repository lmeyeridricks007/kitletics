import { TrustPageShell, trustMetadata } from "@/components/trust/TrustPageShell";
import { TrustRelatedNav } from "@/components/trust/TrustRelatedNav";
import Link from "next/link";

export const metadata = trustMetadata(
  "Evidence Policy",
  "How Kitletics ranks evidence: manufacturer specs, retailer data, independent sources, and first-hand testing only when it exists.",
  "/evidence-policy",
);

export default function EvidencePolicyPage() {
  return (
    <TrustPageShell
      title="Evidence policy"
      description="What counts as evidence on Kitletics — and what stays marked unknown."
    >
      <p>
        Kitletics separates evidence types so readers can tell a manufacturer
        number from a wear-test note. This page is the canonical hierarchy.
        The{" "}
        <Link href="/methodology" className="text-accent hover:underline">
          methodology overview
        </Link>{" "}
        summarises the same rules without repeating every detail.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Evidence hierarchy
      </h2>
      <ol className="list-decimal space-y-3 pl-5">
        <li>
          <strong className="text-foreground">Manufacturer specifications</strong>{" "}
          — stack, drop, weight, materials, and published geometry when taken
          from manufacturer materials. Useful for comparing design intent; not
          a comfort guarantee.
        </li>
        <li>
          <strong className="text-foreground">Retailer / offer data</strong> —
          regional prices, availability, and seller labels from verified Offer
          records. Prices can change; stale offers are not presented as
          confidently current.
        </li>
        <li>
          <strong className="text-foreground">Independent sources</strong> —
          third-party reviews, lab notes, or specialist coverage we cite when
          available. These inform editorial synthesis; they are not Kitletics
          first-hand tests.
        </li>
        <li>
          <strong className="text-foreground">First-hand evidence</strong> —
          only when a review carries personal-test evidence and structured
          testing context. Today, Kitletics publishes{" "}
          <em>zero</em> first-hand reviews. Pages must not imply otherwise.
        </li>
      </ol>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Editorial research
      </h2>
      <p>
        Most Kitletics reviews are{" "}
        <strong className="text-foreground">Expert Research Reviews</strong>:
        synthesis from specs, catalog peers, and independent coverage. That is
        buying guidance — not a lab certificate and not a wear log.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Unknown stays unknown
      </h2>
      <p>
        Incomplete fields remain null or omitted. We would rather show a gap
        than invent a Women’s weight, a stack height, or a “tested for X km”
        claim. Specs used in comparisons come from the Product record so
        articles cannot quietly diverge from the catalog.
      </p>

      <p>
        Review-type labels are defined on{" "}
        <Link href="/how-we-review" className="text-accent hover:underline">
          how we review
        </Link>
        .
      </p>

      <TrustRelatedNav currentPath="/evidence-policy" />
    </TrustPageShell>
  );
}
