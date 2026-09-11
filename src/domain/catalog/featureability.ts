import type { Product } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import type { Evidence, Recommendation } from "@/domain/recommendations/types";
import type { ReviewPriority } from "@/domain/review-agent/types";
import { computeReviewReadiness } from "@/domain/review-agent/readiness";
import { getReviewAgentCategoryConfig } from "@/domain/review-agent/category-config";
import { canPublishProduct } from "@/domain/catalog/publishability";
import {
  canFeatureProduct as canFeatureProductMedia,
  getPrimaryProductMedia,
} from "@/lib/product/media";

export type FeatureSurface =
  | "listing"
  | "finder-candidate"
  | "finder-top-match"
  | "best-guide"
  | "gear-setup-core"
  | "homepage"
  | "gear-hub"
  | "brand-hub-featured"
  | "category-hero";

export interface FeatureReadinessDimensions {
  published: boolean;
  mediaValid: boolean;
  specCoverage: boolean;
  recommendationReady: boolean;
  evidenceReady: boolean;
  reviewReady: boolean;
  relationshipCoverage: boolean;
}

export interface FeatureReadinessResult {
  /** True when product may appear on the requested surface */
  ok: boolean;
  /** Listing/card media gate (existing canFeatureProduct semantics) */
  mediaFeatureable: boolean;
  dimensions: FeatureReadinessDimensions;
  issues: string[];
  warnings: string[];
  priority?: ReviewPriority;
  surface: FeatureSurface;
}

/**
 * Listing / card feature gate — published + authentic media.
 * Kept as the default for search/category grids (browse still works without Review).
 */
export function canFeatureProduct(product: Product): boolean {
  return canFeatureProductMedia(product);
}

/**
 * Whether Product publication should require a ready Review for this priority.
 * Long-tail / not-recommended categories may publish without Review.
 * P0 flagships should normally have Review readiness before strategic use.
 */
export function reviewRequiredForPublication(
  product: Product,
  priority: ReviewPriority,
): boolean {
  const cat = getReviewAgentCategoryConfig(product.categoryId);
  if (!cat.reviewRecommended && priority === "P3") return false;
  if (priority === "P0") return true;
  if (priority === "P1" && product.lifecycleStatus === "current") return true;
  return false;
}

function isReviewReady(input: {
  product: Product;
  review?: Review | null;
  evidence: Evidence[];
}): boolean {
  const { product, review, evidence } = input;
  if (!review || review.status !== "published") return false;
  const readiness = computeReviewReadiness({ product, review, evidence });
  if (readiness.score < 70 || readiness.blockers.length) return false;
  if (!readiness.dimensions.typeCorrect || !readiness.dimensions.noFakeFirstHand) {
    return false;
  }
  if (!readiness.dimensions.noInternalWording) return false;
  // Evidence linkage
  if (!review.evidenceIds?.length && evidence.length === 0) return false;
  return true;
}

/**
 * Strategic prominence gate — separate from canPublishProduct.
 * Does not change Finder match scores; controls whether a Product may be
 * featured in Top Matches / Best Guides / hubs / homepage slots.
 */
export function assessFeatureReadiness(input: {
  product: Product;
  review?: Review | null;
  evidence: Evidence[];
  recommendations: Recommendation[];
  priority: ReviewPriority;
  surface: FeatureSurface;
  hasAlternatives?: boolean;
}): FeatureReadinessResult {
  const {
    product,
    review,
    evidence,
    recommendations,
    priority,
    surface,
    hasAlternatives,
  } = input;

  const issues: string[] = [];
  const warnings: string[] = [];
  const mediaFeatureable = canFeatureProductMedia(product);
  const publish = canPublishProduct(product);

  const dims: FeatureReadinessDimensions = {
    published: product.status === "published",
    mediaValid: Boolean(getPrimaryProductMedia(product)),
    specCoverage: publish.tier === "complete" || publish.tier === "usable",
    recommendationReady: recommendations.length > 0 || (product.recommendationScore ?? 0) >= 70,
    evidenceReady: evidence.length > 0 || product.evidenceIds.length > 0,
    reviewReady: isReviewReady({ product, review, evidence }),
    relationshipCoverage:
      hasAlternatives ??
      (product.alternativeProductIds?.length ?? 0) +
        (product.relatedProductIds?.length ?? 0) >
        0,
  };

  if (!dims.published) issues.push("Product not published");
  if (!dims.mediaValid) issues.push("Authentic product media missing");
  if (!dims.specCoverage) warnings.push(`Spec coverage tier: ${publish.tier}`);
  if (!dims.evidenceReady) warnings.push("Limited evidence");
  if (!dims.recommendationReady) warnings.push("No recommendation contexts");
  if (!dims.relationshipCoverage) warnings.push("No alternatives/relationships");

  // Surface policies
  let ok = dims.published && dims.mediaValid;

  switch (surface) {
    case "listing":
      ok = mediaFeatureable;
      break;
    case "finder-candidate":
      // Candidates may lack full Review if recommendation data is strong
      ok = dims.published && dims.mediaValid && dims.recommendationReady;
      if (!dims.reviewReady) warnings.push("Finder candidate without ready Review");
      break;
    case "finder-top-match":
    case "best-guide":
    case "homepage":
    case "gear-hub":
    case "category-hero":
    case "brand-hub-featured":
      ok =
        dims.published &&
        dims.mediaValid &&
        dims.recommendationReady &&
        dims.evidenceReady &&
        dims.reviewReady;
      if (!dims.reviewReady) {
        issues.push("Ready Review required for prominent placement");
      }
      break;
    case "gear-setup-core":
      ok =
        dims.published &&
        dims.mediaValid &&
        (dims.reviewReady || (dims.evidenceReady && dims.recommendationReady));
      if (!dims.reviewReady) {
        warnings.push("Core setup Product lacks ready Review — evidence/rationale required");
        if (!dims.evidenceReady) issues.push("Setup core needs Review or evidence");
      }
      break;
  }

  // P0 never prominently featured without Review
  if (
    priority === "P0" &&
    surface !== "listing" &&
    surface !== "finder-candidate" &&
    !dims.reviewReady
  ) {
    ok = false;
    if (!issues.includes("Ready Review required for prominent placement")) {
      issues.push("P0 Product requires ready Review for prominence");
    }
  }

  return {
    ok,
    mediaFeatureable,
    dimensions: dims,
    issues,
    warnings,
    priority,
    surface,
  };
}

export function canFeatureProductStrategically(
  input: Parameters<typeof assessFeatureReadiness>[0],
): boolean {
  return assessFeatureReadiness(input).ok;
}
