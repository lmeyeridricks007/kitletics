/**
 * Pre-launch 09 — attach editorial /compare/{slug} links to Best Guides
 * when recommendation pairs already have meaningful comparison pages.
 */

import type { BestGuide } from "@/domain/editorial/types";
import type { Comparison } from "@/domain/editorial/types";

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

/** Explicit high-intent Best → Compare attachments (P0 Running). */
const MANUAL_BEST_COMPARE: Record<string, string[]> = {
  "running-shoes": [
    "cmp-nb6-nimbus27",
    "cmp-nb6-ghost18",
    "cmp-nb6-clifton10",
    "cmp-kayano-adrenaline",
    "cmp-vaporfly4-alphafly3",
  ],
  "daily-trainers": ["cmp-nb6-ghost18", "cmp-nb6-clifton10", "cmp-nb6-nimbus27", "cmp-ghost18-peg42"],
  "running-shoes-long-runs": ["cmp-nb6-clifton10", "cmp-nb6-nimbus27"],
  "marathon-shoes": ["cmp-vaporfly4-alphafly3", "cmp-speed5-boston12"],
  "stability-running-shoes": ["cmp-kayano-adrenaline"],
  "running-watches": ["cmp-fenix8-fr970", "cmp-pace4-fr165", "cmp-fr970-pacepro"],
  "running-shoes-beginners": ["cmp-nb6-ghost18", "cmp-ghost18-peg42"],
  "running-hydration-vests": ["cmp-advskin12-udrace6", "cmp-advskin12-advskin5"],
  "heart-rate-monitors-running": ["cmp-hrm600-h10", "cmp-h10-h9", "cmp-coros-verity"],
};

export function applyBestGuideComparisonLinks(
  guides: BestGuide[],
  comparisons: Comparison[],
): BestGuide[] {
  const byPair = new Map<string, Comparison>();
  const byId = new Map(comparisons.map((c) => [c.id, c]));
  for (const c of comparisons) {
    if (c.status !== "published" || c.noindex) continue;
    if (c.productIds.length < 2) continue;
    byPair.set(pairKey(c.productIds[0]!, c.productIds[1]!), c);
  }

  return guides.map((guide) => {
    const recIds = guide.recommendations.map((r) => r.productId);
    const auto: string[] = [];
    for (let i = 0; i < recIds.length; i++) {
      for (let j = i + 1; j < recIds.length; j++) {
        const cmp = byPair.get(pairKey(recIds[i]!, recIds[j]!));
        if (cmp) auto.push(cmp.id);
      }
    }
    const manual = (MANUAL_BEST_COMPARE[guide.slug] ?? []).filter((id) =>
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
      .filter((id) => {
        const cmp = byId.get(id);
        if (!cmp) return true;
        return liveIds.has(id);
      })
      .slice(0, 8);

    if (!relatedComparisonIds.length) return guide;
    return { ...guide, relatedComparisonIds };
  });
}
