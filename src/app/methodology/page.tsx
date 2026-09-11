import { TrustPageShell, trustMetadata } from "@/components/trust/TrustPageShell";
import { TrustRelatedNav } from "@/components/trust/TrustRelatedNav";
import Link from "next/link";

export const metadata = trustMetadata(
  "Methodology",
  "How Kitletics structures recommendations and evidence — overview with links to full policies.",
  "/methodology",
);

export default function MethodologyPage() {
  return (
    <TrustPageShell
      title="Methodology"
      description="Recommendations are explainable. Evidence types are explicit. Full policies live on dedicated pages."
    >
      <p>
        Kitletics does not invent suitability percentages. Scores are tied to
        structured recommendation factors (cushion, stability, terrain fit, and
        similar criteria) for a given use case. This page is the hub; deeper
        detail lives on{" "}
        <Link
          href="/scoring-methodology"
          className="text-accent hover:underline"
        >
          scoring methodology
        </Link>
        ,{" "}
        <Link href="/evidence-policy" className="text-accent hover:underline">
          evidence policy
        </Link>
        , and{" "}
        <Link href="/editorial-policy" className="text-accent hover:underline">
          editorial policy
        </Link>
        .
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Evidence types (summary)
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="text-foreground">Personally tested</strong> — only
          when evidence explicitly records a Kitletics personal test. None of
          our published reviews currently use this label.
        </li>
        <li>
          <strong className="text-foreground">Manufacturer verified</strong> —
          specifications taken from manufacturer materials.
        </li>
        <li>
          <strong className="text-foreground">Third-party evidence</strong> —
          independent reviews or lab tests we cite.
        </li>
        <li>
          <strong className="text-foreground">Editorial research</strong> —
          synthesis from public sources and category norms — not a wear-test
          claim.
        </li>
      </ul>
      <p>
        Incomplete fields stay null. We would rather show a gap than invent a
        specification. Full hierarchy:{" "}
        <Link href="/evidence-policy" className="text-accent hover:underline">
          /evidence-policy
        </Link>
        .
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Reviews
      </h2>
      <p>
        Review formats (First-Hand, Expert Research, Hybrid) are defined on{" "}
        <Link href="/how-we-review" className="text-accent hover:underline">
          how we review
        </Link>
        . Today, published reviews are Expert Research Reviews.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Affiliate independence
      </h2>
      <p>
        Affiliate relationships do not influence recommendation rankings.
        Commission rates never enter Kitletics Score, Finder Match Score, Best
        Guide awards, comparison winners, alternatives, or the Shoe Rotation
        Planner. Commercial Offer ranking (where to buy) is a separate concern
        from product recommendation (what to buy). See{" "}
        <Link
          href="/affiliate-disclosure"
          className="text-accent hover:underline"
        >
          affiliate disclosure
        </Link>
        .
      </p>

      <TrustRelatedNav currentPath="/methodology" />
    </TrustPageShell>
  );
}
