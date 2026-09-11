import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ComparisonCard } from "@/components/cards/ContentCards";
import type { BestGuidePageData } from "@/lib/best/get-best-guide-page-data";
import type { Comparison } from "@/domain/editorial/types";

/** Contextual CTA labels for P0 Best → Compare edges. */
const CONTEXT_LABELS: Record<string, Record<string, string>> = {
  "running-shoes": {
    "cmp-nb6-ghost18": "Compare top two dailies",
    "cmp-nb6-nimbus27": "Compare energetic vs max-cushion",
    "cmp-kayano-adrenaline": "Compare stability picks",
    "cmp-vaporfly4-alphafly3": "Compare race-day supershoes",
  },
  "stability-running-shoes": {
    "cmp-kayano-adrenaline": "Compare stability picks",
  },
  "running-watches": {
    "cmp-fenix8-fr970": "Compare watch shortlist",
    "cmp-pace4-fr165": "Compare value GPS picks",
    "cmp-fr970-pacepro": "Compare premium GPS picks",
  },
  "daily-trainers": {
    "cmp-nb6-ghost18": "Compare top two",
    "cmp-ghost18-peg42": "Compare classic dailies",
  },
  "marathon-shoes": {
    "cmp-vaporfly4-alphafly3": "Compare marathon race shoes",
    "cmp-speed5-boston12": "Compare workout / race bridges",
  },
  "heart-rate-monitors-running": {
    "cmp-hrm600-h10": "Compare chest-strap shortlist",
  },
};

function labelFor(guideSlug: string, cmp: Comparison, index: number): string {
  const mapped = CONTEXT_LABELS[guideSlug]?.[cmp.id];
  if (mapped) return mapped;
  if (index === 0) return "Compare top shortlist";
  return cmp.shortDescription?.trim() || cmp.title;
}

export function BestGuideRelatedComparisons({
  data,
}: {
  data: BestGuidePageData;
}) {
  const comparisons = data.relatedComparisons;
  if (!comparisons.length) return null;

  return (
    <section className="border-y border-border bg-[#f7f7f5] py-8">
      <Container size="wide">
        <h2 className="heading-section">Compare these picks</h2>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Editorial head-to-heads for the closest decisions in this guide —
          not a random product matrix.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((cmp, index) => (
            <li key={cmp.id}>
              <Link
                href={`/compare/${cmp.slug}`}
                className="flex h-full flex-col border border-border bg-surface px-4 py-4 transition-colors hover:border-accent"
              >
                <p className="text-[12px] font-bold tracking-wide text-subtle uppercase">
                  {labelFor(data.guide.slug, cmp, index)}
                </p>
                <p className="mt-2 text-[15px] font-semibold text-foreground">
                  {cmp.title}
                </p>
                {(cmp.shortDescription || cmp.summary) && (
                  <p className="mt-2 line-clamp-3 text-[13px] leading-snug text-muted">
                    {cmp.shortDescription?.trim() || cmp.summary}
                  </p>
                )}
                <span className="mt-3 text-[13px] font-medium text-link">
                  Open comparison →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function GuideRelatedComparisons({
  comparisons,
  title = "Compare related products",
}: {
  comparisons: Comparison[];
  title?: string;
}) {
  if (!comparisons.length) return null;

  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-2xl text-[14px] text-muted">
        Continue the decision with focused head-to-heads — who should choose
        which, and the trade-offs that matter.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {comparisons.slice(0, 4).map((cmp) => (
          <ComparisonCard key={cmp.id} comparison={cmp} />
        ))}
      </div>
    </section>
  );
}
