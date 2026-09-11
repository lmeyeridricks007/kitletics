import type { Product } from "@/domain/products/types";
import type { RankedFinderResult } from "@/domain/finders/types";
import { getRelationshipBetween } from "@/repositories/relationships";

/**
 * Soft diversity after pure score ranking.
 * Top result stays in place. Near-identical subsequent results
 * (same family or very-similar relationship) receive a small score
 * penalty so distinct alternatives can surface — without burying
 * meaningfully stronger matches.
 *
 * Does NOT change eligibility or core factor scoring.
 */
export function applyFinderDiversityAdjustment(input: {
  ranked: RankedFinderResult[];
  productsById: Map<string, Product>;
  /** Max penalty points (match score scale 0–100) */
  maxPenalty?: number;
  /** Only apply when scores are within this gap of the prior kept result */
  nearTieGap?: number;
}): RankedFinderResult[] {
  const maxPenalty = input.maxPenalty ?? 2.5;
  const nearTieGap = input.nearTieGap ?? 4;
  if (input.ranked.length <= 1) return input.ranked;

  const adjusted: RankedFinderResult[] = [];
  const keptFamilies = new Set<string>();
  const keptIds: string[] = [];

  for (let i = 0; i < input.ranked.length; i++) {
    const row = input.ranked[i]!;
    const product = input.productsById.get(row.productId);
    let penalty = 0;

    if (i > 0 && product) {
      if (product.familyId && keptFamilies.has(product.familyId)) {
        const prev = adjusted[adjusted.length - 1]!;
        if (Math.abs(prev.matchScore - row.matchScore) <= nearTieGap) {
          penalty = Math.max(penalty, maxPenalty);
        }
      }
      for (const kid of keptIds.slice(-3)) {
        const rels = getRelationshipBetween(row.productId, kid);
        const verySimilar = rels.some(
          (r) =>
            r.status === "approved" &&
            (r.type === "similar" || r.type === "previous-generation" || r.type === "next-generation") &&
            (r.strength ?? 0) >= 80,
        );
        if (verySimilar) {
          const prevScore = adjusted.find((a) => a.productId === kid)?.matchScore ?? row.matchScore;
          if (Math.abs(prevScore - row.matchScore) <= nearTieGap) {
            penalty = Math.max(penalty, maxPenalty * 0.8);
          }
        }
      }
    }

    const next: RankedFinderResult = {
      ...row,
      matchScore: Math.max(0, row.matchScore - penalty),
    };
    adjusted.push(next);
    if (product?.familyId) keptFamilies.add(product.familyId);
    keptIds.push(row.productId);
  }

  // Re-sort after soft penalties; top original stays first if still tied-ish
  const top = adjusted[0]!;
  const rest = adjusted
    .slice(1)
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return a.productId.localeCompare(b.productId);
    });

  return [top, ...rest].map((e, i) => ({ ...e, rank: i + 1 }));
}
