import { TrustPageShell, trustMetadata } from "@/components/trust/TrustPageShell";
import { TrustRelatedNav } from "@/components/trust/TrustRelatedNav";
import Link from "next/link";

export const metadata = trustMetadata(
  "Editorial Policy",
  "How Kitletics researches content, selects products, updates pages, and handles corrections — without inventing expertise.",
  "/editorial-policy",
);

export default function EditorialPolicyPage() {
  return (
    <TrustPageShell
      title="Editorial policy"
      description="How we research, select, update, and correct kit guidance — and what we never claim."
    >
      <p>
        Kitletics publishes product guidance for athletes who need a clear
        buying decision. Running is our deepest vertical today. Content is
        produced under{" "}
        <Link href="/authors/kitletics-editorial" className="text-accent hover:underline">
          Kitletics Editorial
        </Link>
        — an editorial desk attribution, not a roster of invented named
        experts.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        How content is researched
      </h2>
      <p>
        We start from structured catalog data: manufacturer specifications,
        category taxonomy, use-case fit, and verified retailer offers when
        available. We then synthesise public independent coverage and category
        norms. Every claim type is governed by our{" "}
        <Link href="/evidence-policy" className="text-accent hover:underline">
          evidence policy
        </Link>
        . Unknown fields stay unknown.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        How products are selected
      </h2>
      <p>
        Catalog inclusion follows availability, category coverage, and
        editorial usefulness for a real buying job — not commission rates.
        Best Guides shortlist products that fit a stated use case; considered
        and shortlisted lists stay distinct from winners. Comparisons only
        exist when there is a meaningful decision between peers — we do not
        generate combinatorial pair pages.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        How updates work
      </h2>
      <p>
        Product specs, offers, and editorial pages carry update timestamps.
        When a generation changes, successor relationships and reviews are
        refreshed as evidence allows. Price and stock always come from offer
        feeds or verified retailer checks — never invented MSRP in prose.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        How corrections work
      </h2>
      <p>
        If you spot a factual error (wrong spec, mislabelled review type, or
        broken attribution), contact us via{" "}
        <Link href="/contact" className="text-accent hover:underline">
          /contact
        </Link>
        . Material corrections are applied to the live page and reflected in
        the updated date. We do not quietly rewrite history to invent testing
        that did not happen.
      </p>

      <h2 className="font-display text-xl font-semibold text-foreground">
        What Kitletics does not claim
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>We do not invent first-hand wear tests.</li>
        <li>We do not diagnose injuries or prescribe medical treatment.</li>
        <li>
          We do not claim that buying a product guarantees race times or injury
          prevention.
        </li>
        <li>
          We do not present affiliate commission as a quality signal — see{" "}
          <Link
            href="/affiliate-disclosure"
            className="text-accent hover:underline"
          >
            affiliate disclosure
          </Link>
          .
        </li>
        <li>
          We do not fabricate AggregateRating / “user score” counts we do not
          operate.
        </li>
      </ul>

      <p>
        Scoring mechanics live on{" "}
        <Link
          href="/scoring-methodology"
          className="text-accent hover:underline"
        >
          scoring methodology
        </Link>
        . Review formats live on{" "}
        <Link href="/how-we-review" className="text-accent hover:underline">
          how we review
        </Link>
        .
      </p>

      <TrustRelatedNav currentPath="/editorial-policy" />
    </TrustPageShell>
  );
}
