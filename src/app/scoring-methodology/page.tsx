import { TrustPageShell, trustMetadata } from "@/components/trust/TrustPageShell";
import { TrustRelatedNav } from "@/components/trust/TrustRelatedNav";
import Link from "next/link";

export const metadata = trustMetadata(
  "Scoring Methodology",
  "How Kitletics Score and use-case recommendation scores work — and why the same product can rank differently by job.",
  "/scoring-methodology",
);

export default function ScoringMethodologyPage() {
  return (
    <TrustPageShell
      title="Scoring methodology"
      description="Explainable scores for buying decisions — not opaque “overall best” theatre."
    >
      <p>
        Kitletics publishes scores to help you compare options for a job. This
        page explains what the numbers mean. Exact internal factor weights are
        proprietary and not published in full; the principles below are what
        readers need to interpret a page honestly.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Kitletics Score
      </h2>
      <p>
        The Kitletics Score (0–100) is an editorial suitability signal for a
        product’s primary role in catalog — tied to structured factors such as
        cushion character, stability intent, terrain fit, and similar
        category-specific criteria. It is not a crowd AggregateRating, not a
        star average from user comments, and not a claim that we personally
        wear-tested the product.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Context-specific recommendation scoring
      </h2>
      <p>
        Finder Match Scores and Best Guide rankings are{" "}
        <strong className="text-foreground">use-case specific</strong>. A shoe
        that ranks highly for easy daily miles can rank lower for race-day
        geometry, and a watch strong for battery can lose to one strong for
        maps. The same Product entity can therefore appear in different
        positions across guides without contradiction — the job changed.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Why ranks differ by use case
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Different criteria matter (cushion vs plate stiffness vs grip).</li>
        <li>Trade-offs that help one job hurt another.</li>
        <li>
          Shortlists exclude products outside the stated intent even if the
          catalog score is high overall.
        </li>
      </ul>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Affiliate neutrality
      </h2>
      <p>
        Commission rates never enter Kitletics Score, Finder Match Score, Best
        Guide awards, comparison winners, alternatives, or rotation planner
        results. Commercial offer ranking (where to buy) is separate from
        product recommendation (what to buy). Full detail:{" "}
        <Link
          href="/affiliate-disclosure"
          className="text-accent hover:underline"
        >
          affiliate disclosure
        </Link>
        .
      </p>

      <p>
        Evidence inputs are described in the{" "}
        <Link href="/evidence-policy" className="text-accent hover:underline">
          evidence policy
        </Link>
        . A shorter overview remains on{" "}
        <Link href="/methodology" className="text-accent hover:underline">
          /methodology
        </Link>
        .
      </p>

      <TrustRelatedNav currentPath="/scoring-methodology" />
    </TrustPageShell>
  );
}
