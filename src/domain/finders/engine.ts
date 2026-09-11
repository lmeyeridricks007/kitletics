import type { Product } from "@/domain/products/types";
import type { Recommendation } from "@/domain/recommendations/types";
import type {
  EvaluatedProduct,
  FinderDefinition,
  FinderResponses,
  FinderRunResult,
  RankedFinderResult,
} from "@/domain/finders/types";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import {
  normalizeFinderResponses,
  validateResponses,
} from "@/domain/finders/normalization";
import { evaluateEligibility } from "@/domain/finders/eligibility";
import { scoreProductFactors } from "@/domain/finders/scoring";
import {
  buildCompromises,
  buildStrengths,
  detectConflictingPriorities,
  evidenceConfidenceFromFactors,
} from "@/domain/finders/explanations";
import { getMatchBand } from "@/domain/finders/match-bands";
import { applyFinderDiversityAdjustment } from "@/domain/finders/diversity";

export interface RunFinderInput {
  definition: FinderDefinition;
  responses: FinderResponses;
  products: Product[];
  recommendations: Recommendation[];
  /** productId → lowest regional price */
  lowestByProduct: Record<
    string,
    { price: number; currency: string } | undefined
  >;
  region?: RegionCode;
}

/**
 * Generic Finder pipeline:
 * 1. Normalize profile
 * 2. Hard eligibility
 * 3. Factor scores + priority weights
 * 4. Coverage gate for top pool
 * 5. Rank by match (NOT overall Product.recommendationScore)
 * 6. Explanations
 *
 * Deterministic for same inputs + finder version + product snapshot.
 */
export function runFinder(input: RunFinderInput): FinderRunResult {
  const region = input.region ?? DEFAULT_REGION;
  const validation = validateResponses(input.definition, input.responses);
  if (!validation.ok) {
    // Still run with partial answers for progressive UX; missing required
    // handled by UI before calling. Engine tolerates partial.
  }

  const normalizedProfile = normalizeFinderResponses(
    input.definition,
    input.responses,
    region,
  );

  const evaluatedProducts: EvaluatedProduct[] = [];

  for (const product of input.products) {
    const eligibility = evaluateEligibility(product, normalizedProfile);
    if (!eligibility.eligible) {
      evaluatedProducts.push({
        productId: product.id,
        eligible: false,
        exclusions: eligibility.exclusions,
        matchScore: 0,
        factorScores: [],
        strengths: [],
        compromises: [],
        evidenceConfidence: "low",
        dataCoverage: 0,
      });
      continue;
    }

    const scored = scoreProductFactors({
      product,
      profile: normalizedProfile,
      definition: input.definition,
      recommendations: input.recommendations,
      lowestPrice: input.lowestByProduct[product.id],
    });

    evaluatedProducts.push({
      productId: product.id,
      eligible: true,
      exclusions: [],
      matchScore: scored.matchScore,
      factorScores: scored.factors,
      strengths: buildStrengths(scored.factors),
      compromises: buildCompromises(scored.factors),
      evidenceConfidence: evidenceConfidenceFromFactors(
        scored.factors,
        scored.coverage,
      ),
      dataCoverage: scored.coverage,
      contextScore: scored.contextScore,
    });
  }

  const cfg = input.definition.resultConfig;
  const eligible = evaluatedProducts.filter((e) => e.eligible);

  // Sort by matchScore DESC — never by Product.recommendationScore
  // Tie-break: higher coverage, then productId for determinism
  const sorted = [...eligible].sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (b.dataCoverage !== a.dataCoverage) return b.dataCoverage - a.dataCoverage;
    return a.productId.localeCompare(b.productId);
  });

  const displayPool = sorted.filter((e) => {
    if (e.matchScore < cfg.minMatchForDisplay) return false;
    return true;
  });

  // Top recommendation must meet coverage threshold when possible
  const topCandidates = displayPool.filter(
    (e) => e.dataCoverage >= cfg.minCoverageForTopRecommendation,
  );
  const rankedSource =
    topCandidates.length > 0
      ? [
          ...topCandidates,
          ...displayPool.filter(
            (e) => !topCandidates.some((t) => t.productId === e.productId),
          ),
        ]
      : displayPool;

  const rankedResults: RankedFinderResult[] = rankedSource
    .slice(0, cfg.maxResults)
    .map((e, i) => ({
      ...e,
      rank: i + 1,
      band: getMatchBand(e.matchScore),
    }));

  const productsById = new Map(input.products.map((p) => [p.id, p]));
  const diversified = applyFinderDiversityAdjustment({
    ranked: rankedResults,
    productsById,
  }).map((e) => ({
    ...e,
    band: getMatchBand(e.matchScore),
  }));

  return {
    normalizedProfile,
    evaluatedProducts,
    rankedResults: diversified,
    eligibleCount: eligible.length,
    analysedCount: input.products.filter((p) => {
      const cats =
        input.definition.categoryIds ?? [input.definition.categoryId];
      return cats.includes(p.categoryId);
    }).length,
    finderVersion: input.definition.version,
    conflictingPriorities: detectConflictingPriorities(
      normalizedProfile.primaryUses,
      normalizedProfile.priorities,
    ),
  };
}

export { validateResponses, getVisibleQuestions } from "@/domain/finders/normalization";
export { AFFILIATE_NEUTRALITY } from "@/domain/finders/scoring";
