/**
 * Build ReviewAgentCatalog from published content repositories.
 * Prefer reusing existing Evidence over live research.
 */
import type { ReviewAgentCatalog } from "@/domain/review-agent/orchestrator";
import {
  getBestGuides,
  getComparisons,
  getGearSetups,
  getReviews,
} from "@/repositories/editorial";
import {
  getBrands,
  getProductFamilies,
  getProducts,
} from "@/repositories/products";
import {
  getEvidence,
  getRecommendations,
} from "@/repositories/recommendations";

const DEV_OPTS = { isDev: true as const };

export function buildReviewAgentCatalog(): ReviewAgentCatalog {
  const products = getProducts(DEV_OPTS);
  const brands = getBrands(DEV_OPTS);
  const families = getProductFamilies();
  const reviews = getReviews(DEV_OPTS);
  const evidence = getEvidence();
  const recommendations = getRecommendations();

  const bestGuideProductIds: string[] = [];
  for (const g of getBestGuides(DEV_OPTS)) {
    for (const r of g.recommendations) bestGuideProductIds.push(r.productId);
  }

  const comparisonProductIds: string[] = [];
  const comparisonIdsByProductId = new Map<string, string[]>();
  for (const c of getComparisons(DEV_OPTS)) {
    for (const id of c.productIds) {
      comparisonProductIds.push(id);
      const list = comparisonIdsByProductId.get(id) ?? [];
      list.push(c.id);
      comparisonIdsByProductId.set(id, list);
    }
  }

  const gearSetupProductIds: string[] = [];
  for (const s of getGearSetups(DEV_OPTS)) {
    for (const item of s.items) gearSetupProductIds.push(item.productId);
  }

  const featuredHubProductIds = products
    .filter(
      (p) =>
        p.lifecycleStatus === "current" &&
        (p.recommendationScore ?? 0) >= 85 &&
        (p.categoryId === "cat-running-shoes" ||
          p.categoryId === "cat-gps-watches" ||
          p.categoryId === "cat-padel-rackets" ||
          p.categoryId === "cat-power-racks"),
    )
    .map((p) => p.id);

  const finderCandidateIds = products
    .filter((p) => (p.recommendationScore ?? 0) >= 78)
    .map((p) => p.id);

  return {
    products,
    brands,
    families,
    reviews,
    evidence,
    recommendations,
    bestGuideProductIds,
    comparisonProductIds,
    gearSetupProductIds,
    featuredHubProductIds,
    finderCandidateIds,
    comparisonIdsByProductId,
  };
}
