import type { Product, ProductFamily } from "@/domain/products/types";
import type { Recommendation } from "@/domain/recommendations/types";
import type {
  ComparisonPriority,
  RelationshipCandidate,
} from "@/domain/relationships/types";
import { computeProductSimilarity } from "@/domain/relationships/similarity";
import { getSimilarityConfig } from "@/domain/relationships/similarity-configs";

function samePriceTier(a: Product, b: Product): boolean {
  const sa = a.recommendationScore;
  const sb = b.recommendationScore;
  // Without reliable offers, use soft score band as positioning proxy only
  if (sa == null || sb == null) return true;
  return Math.abs(sa - sb) <= 12;
}

function sharedUseCases(a: Product, b: Product): number {
  const set = new Set(a.useCaseIds);
  return b.useCaseIds.filter((id) => set.has(id)).length;
}

/**
 * Generate relationship / comparison candidates. Does NOT auto-approve.
 */
export function generateRelationshipCandidates(input: {
  products: Product[];
  recommendations: Recommendation[];
  families: ProductFamily[];
  /** Limit pairs per source for QA */
  maxPerSource?: number;
}): RelationshipCandidate[] {
  const maxPer = input.maxPerSource ?? 8;
  const byFamily = new Map(input.families.map((f) => [f.id, f]));
  const candidates: RelationshipCandidate[] = [];

  const byCategory = new Map<string, Product[]>();
  for (const p of input.products) {
    if (p.status !== "published") continue;
    if (p.lifecycleStatus === "upcoming") continue;
    const list = byCategory.get(p.categoryId) ?? [];
    list.push(p);
    byCategory.set(p.categoryId, list);
  }

  for (const [, list] of byCategory) {
    const config = getSimilarityConfig(list[0]?.categoryId ?? "");
    for (let i = 0; i < list.length; i++) {
      const scored: RelationshipCandidate[] = [];
      for (let j = 0; j < list.length; j++) {
        if (i === j) continue;
        const a = list[i]!;
        const b = list[j]!;

        // Generation candidates from family order
        if (a.familyId && a.familyId === b.familyId) {
          const fam = byFamily.get(a.familyId);
          if (fam) {
            const ia = fam.productIds.indexOf(a.id);
            const ib = fam.productIds.indexOf(b.id);
            if (ia >= 0 && ib >= 0 && Math.abs(ia - ib) === 1) {
              scored.push({
                sourceProductId: a.id,
                targetProductId: b.id,
                proposedType: ia < ib ? "previous-generation" : "next-generation",
                confidence: 0.95,
                reasons: [
                  `Adjacent generations in ${fam.name} family`,
                  "Validated ProductFamily ordering",
                ],
                comparisonPriority: "HIGH",
              });
              continue;
            }
          }
        }

        if (!config) continue;
        const sim = computeProductSimilarity(
          a,
          b,
          config,
          input.recommendations,
        );
        if (sim.score < 0.55) continue;

        const shared = sharedUseCases(a, b);
        const reasons = [
          `Structured similarity ${sim.label.replace(/-/g, " ")}`,
          shared > 0 ? `Shared use cases: ${shared}` : "Limited use-case overlap",
        ];
        if (samePriceTier(a, b)) reasons.push("Similar catalog positioning band");

        let proposedType: RelationshipCandidate["proposedType"] = "similar";
        let confidence = sim.score;
        let comparisonPriority: ComparisonPriority = "LOW";

        if (sim.score >= 0.78 && shared >= 2) {
          proposedType = "direct-competitor";
          confidence = Math.min(0.95, sim.score + 0.05);
          comparisonPriority = "HIGH";
          reasons.push("Strong competitor signals");
        } else if (sim.score >= 0.68 && shared >= 1) {
          comparisonPriority = "MEDIUM";
        } else if (sim.score < 0.58) {
          continue;
        }

        // Spec-driven directional hints (approved separately)
        const ca = String(a.specifications.cushionLevel ?? "");
        const cb = String(b.specifications.cushionLevel ?? "");
        const cushionOrder = ["minimal", "low", "medium", "high", "maximum"];
        if (cushionOrder.indexOf(cb) > cushionOrder.indexOf(ca) && ca && cb) {
          scored.push({
            sourceProductId: a.id,
            targetProductId: b.id,
            proposedType: "more-cushioned",
            confidence: 0.7,
            reasons: [
              `Cushion classification ${ca} → ${cb}`,
              ...reasons.slice(0, 1),
            ],
            comparisonPriority: "MEDIUM",
          });
        }

        scored.push({
          sourceProductId: a.id,
          targetProductId: b.id,
          proposedType,
          confidence,
          reasons,
          comparisonPriority,
        });
      }

      scored
        .sort((x, y) => y.confidence - x.confidence)
        .slice(0, maxPer)
        .forEach((c) => candidates.push(c));
    }
  }

  return candidates;
}

export function scoreComparisonCandidate(input: {
  sameFamily: boolean;
  isDirectCompetitor: boolean;
  sharedUseCases: number;
  similarity: number;
  bothFlagshipOrMajor: boolean;
  meaningfulSpecDiffs: number;
}): { score: number; priority: ComparisonPriority } {
  let score = 0;
  if (input.isDirectCompetitor) score += 35;
  if (input.sameFamily) score += 30;
  score += Math.min(20, input.sharedUseCases * 5);
  score += Math.round(input.similarity * 15);
  if (input.bothFlagshipOrMajor) score += 10;
  score += Math.min(15, input.meaningfulSpecDiffs * 3);

  let priority: ComparisonPriority = "LOW";
  if (score >= 70) priority = "HIGH";
  else if (score >= 45) priority = "MEDIUM";
  return { score, priority };
}
