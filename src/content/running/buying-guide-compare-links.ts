/**
 * Pre-launch 09 — attach editorial /compare/{slug} links to buying guides
 * when related products already have meaningful comparison pages.
 */

import type { BuyingGuide, Comparison } from "@/domain/editorial/types";

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

/** High-intent Guide → Compare attachments (Running decision flows). */
const MANUAL_GUIDE_COMPARE: Record<string, string[]> = {
  "how-to-choose-running-shoes": [
    "cmp-nb6-ghost18",
    "cmp-nb6-nimbus27",
    "cmp-kayano-adrenaline",
    "cmp-vaporfly4-alphafly3",
  ],
  "running-shoe-cushioning": [
    "cmp-nb6-clifton10",
    "cmp-nb6-nimbus27",
    "cmp-nb6-ghost18",
  ],
  "stability-shoes-explained": ["cmp-kayano-adrenaline"],
  "what-is-a-daily-trainer": [
    "cmp-nb6-ghost18",
    "cmp-ghost18-peg42",
    "cmp-nb6-clifton10",
  ],
  "carbon-vs-nylon-plates": [
    "cmp-vaporfly4-alphafly3",
    "cmp-speed5-boston12",
  ],
  "how-to-choose-running-watch": [
    "cmp-fenix8-fr970",
    "cmp-pace4-fr165",
    "cmp-fr970-pacepro",
  ],
  "how-to-choose-heart-rate-monitor": [
    "cmp-hrm600-h10",
    "cmp-h10-h9",
    "cmp-coros-verity",
  ],
  "road-vs-trail-running-shoes": ["cmp-nb6-ghost18"],
  "beginner-vs-advanced-running-watch": [
    "cmp-fenix8-fr970",
    "cmp-pace4-fr165",
  ],
};

export function applyBuyingGuideComparisonLinks(
  guides: BuyingGuide[],
  comparisons: Comparison[],
): BuyingGuide[] {
  const byPair = new Map<string, Comparison>();
  const byId = new Map(comparisons.map((c) => [c.id, c]));
  for (const c of comparisons) {
    if (c.status !== "published" || c.noindex) continue;
    if (c.productIds.length < 2) continue;
    byPair.set(pairKey(c.productIds[0]!, c.productIds[1]!), c);
  }

  return guides.map((guide) => {
    const ids = guide.relatedProductIds ?? [];
    const auto: string[] = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const cmp = byPair.get(pairKey(ids[i]!, ids[j]!));
        if (cmp) auto.push(cmp.id);
      }
    }
    const manual = (MANUAL_GUIDE_COMPARE[guide.slug] ?? []).filter((id) =>
      byId.has(id),
    );
    const liveIds = new Set(
      comparisons
        .filter((c) => c.status === "published" && !c.noindex)
        .map((c) => c.id),
    );

    const relatedComparisonIds = [
      ...new Set([
        ...(guide.relatedComparisonIds ?? []),
        ...manual,
        ...auto,
      ]),
    ]
      .filter((id) => liveIds.has(id))
      .slice(0, 6);

    if (!relatedComparisonIds.length) return guide;
    return { ...guide, relatedComparisonIds };
  });
}
