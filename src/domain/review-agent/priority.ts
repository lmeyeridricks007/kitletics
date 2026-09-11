import type { Product } from "@/domain/products/types";
import type { ReviewPriority } from "@/domain/review-agent/types";

export interface PrioritySignals {
  /** Product appears in a published Best Guide recommendation */
  inBestGuide: boolean;
  /** Product appears in a published Comparison */
  inComparison: boolean;
  /** Product appears in a Gear Setup */
  inGearSetup: boolean;
  /** Featured on sport hub / gear hub shortlists */
  featuredOnHub: boolean;
  /** Finder / tool candidate shortlist */
  finderCandidate: boolean;
  /** Flagship family / high recommendationScore current product */
  majorFamily: boolean;
}

/**
 * Internal review priority. Never expose P0/P1 labels publicly.
 */
export function computeReviewPriority(
  product: Product,
  signals: PrioritySignals,
): ReviewPriority {
  if (
    signals.inBestGuide ||
    signals.inComparison ||
    signals.inGearSetup ||
    signals.featuredOnHub ||
    signals.finderCandidate
  ) {
    return "P0";
  }

  if (
    product.lifecycleStatus === "current" &&
    (signals.majorFamily ||
      (product.recommendationScore != null && product.recommendationScore >= 80))
  ) {
    return "P1";
  }

  if (product.lifecycleStatus === "current") {
    return "P2";
  }

  return "P3";
}

export function buildPriorityIndex(input: {
  bestGuideProductIds: Iterable<string>;
  comparisonProductIds: Iterable<string>;
  gearSetupProductIds: Iterable<string>;
  featuredHubProductIds: Iterable<string>;
  finderCandidateIds: Iterable<string>;
  majorFamilyProductIds: Iterable<string>;
}): (productId: string) => PrioritySignals {
  const best = new Set(input.bestGuideProductIds);
  const comps = new Set(input.comparisonProductIds);
  const setups = new Set(input.gearSetupProductIds);
  const hubs = new Set(input.featuredHubProductIds);
  const finder = new Set(input.finderCandidateIds);
  const major = new Set(input.majorFamilyProductIds);

  return (productId: string): PrioritySignals => ({
    inBestGuide: best.has(productId),
    inComparison: comps.has(productId),
    inGearSetup: setups.has(productId),
    featuredOnHub: hubs.has(productId),
    finderCandidate: finder.has(productId),
    majorFamily: major.has(productId),
  });
}
