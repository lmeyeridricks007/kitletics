import { TrustPageShell, trustMetadata } from "@/components/trust/TrustPageShell";
import { TrustRelatedNav } from "@/components/trust/TrustRelatedNav";
import Link from "next/link";

export const metadata = trustMetadata(
  "How We Review",
  "How Kitletics structures product reviews — and how First-Hand, Expert Research, and Hybrid labels differ.",
  "/how-we-review",
);

export default function HowWeReviewPage() {
  return (
    <TrustPageShell
      title="How we review"
      description="Reviews attach to Product records. Review type is labelled honestly."
    >
      <p>
        Every review references a single Product entity. Specs live on the
        product so comparisons stay consistent. Testing context is disclosed.
        If a review is editorial research rather than a personal wear-test, we
        say so — see{" "}
        <Link href="/evidence-policy" className="text-accent hover:underline">
          evidence policy
        </Link>
        .
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Review types
      </h2>
      <ul className="list-disc space-y-3 pl-5">
        <li>
          <strong className="text-foreground">First-Hand Review</strong> —
          Kitletics or an identified reviewer personally used the product, with
          personal-test evidence and structured testing context on the page.
          <em> Kitletics currently publishes zero first-hand reviews.</em> We
          do not imply otherwise.
        </li>
        <li>
          <strong className="text-foreground">Expert Research Review</strong> —
          published specs, catalog peers, and independent coverage synthesised
          into buying guidance. This is the default label for Kitletics reviews
          today.
        </li>
        <li>
          <strong className="text-foreground">Hybrid</strong> — personal testing
          plus research. Requires the same personal-test evidence gate as
          first-hand. Not used without that evidence.
        </li>
      </ul>

      <h2 className="font-display text-xl font-semibold text-foreground">
        What you will see on a review page
      </h2>
      <p>
        Verdict and audience signals (buy if / skip if), strengths and
        trade-offs, category sections, score breakdown for the product’s role,
        alternatives and comparisons when they exist, and an editorial
        disclosure when the review is research-based. Affiliate links never
        change the verdict —{" "}
        <Link
          href="/affiliate-disclosure"
          className="text-accent hover:underline"
        >
          affiliate disclosure
        </Link>
        .
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        Authorship
      </h2>
      <p>
        Reviews are attributed to{" "}
        <Link
          href="/authors/kitletics-editorial"
          className="text-accent hover:underline"
        >
          Kitletics Editorial
        </Link>{" "}
        unless a real named author exists in the repository. That is desk
        attribution — not a fake individual expert. See{" "}
        <Link href="/authors" className="text-accent hover:underline">
          authors
        </Link>
        .
      </p>

      <p>
        Score meaning:{" "}
        <Link
          href="/scoring-methodology"
          className="text-accent hover:underline"
        >
          scoring methodology
        </Link>
        . Broader process:{" "}
        <Link href="/editorial-policy" className="text-accent hover:underline">
          editorial policy
        </Link>
        .
      </p>

      <TrustRelatedNav currentPath="/how-we-review" />
    </TrustPageShell>
  );
}
