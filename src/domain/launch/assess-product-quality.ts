import type { Product } from "@/domain/products/types";
import type { ProductLaunchQuality } from "@/domain/launch/types";
import { canPublishProduct } from "@/domain/catalog/publishability";
import {
  getPrimaryProductMedia,
  isAuthenticProductMedia,
} from "@/lib/product/media";
import { isSoftGatedCategory } from "@/lib/navigation/category-href";
import { getCategoryById } from "@/repositories/sports";
import { getBrandById } from "@/repositories/products";
import { getReviews } from "@/repositories/editorial";
import { getOffersForProduct } from "@/repositories/commerce";
import {
  getAlternativesFromGraph,
  getDirectCompetitors,
} from "@/repositories/relationships";
import { getComparisons } from "@/repositories/editorial";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";

/**
 * Canonical product launch-quality assessor.
 *
 * Source of truth for `ProductLaunchQuality` / LAUNCH_READY used by:
 * - launch eligibility (`getLaunchEligibility`)
 * - prelaunch forensic 02 (classification only; dimensions remain diagnostic)
 *
 * Eligibility may apply *overlays* that change disposition (e.g. soft-gated
 * categories → PUBLIC_NOINDEX) without redefining quality here.
 */
export type ProductDecisionFlags = {
  whatIsThis: boolean;
  whoFor: boolean;
  whoAvoid: boolean;
  doesWell: boolean;
  weaknesses: boolean;
  howDiffers: boolean;
  alternatives: boolean;
  canCompare: boolean;
  canBuy: boolean;
  evidenceSupports: boolean;
};

export interface ProductQualityAssessment {
  quality: ProductLaunchQuality;
  reasons: string[];
  decisionScore: number;
  decisionFlags: ProductDecisionFlags;
}

/** Description length that counts as answering “what is this?” */
export const PRODUCT_WHAT_IS_THIS_MIN_CHARS = 40;

/** Minimum shortDescription length before the page is treated as description-thin. */
export const PRODUCT_DESCRIPTION_THIN_CHARS = 20;

export function buildProductDecisionFlags(
  product: Product,
  options?: PublishResolverOptions,
): ProductDecisionFlags {
  const descLen = (product.shortDescription ?? "").trim().length;
  const strengths = product.strengths ?? [];
  const weaknesses = product.weaknesses ?? [];
  const evidenceCount = product.evidenceIds?.length ?? 0;
  const reviews = getReviews(options).filter((r) => r.productId === product.id);
  const hasReview = reviews.some((r) => r.status === "published" && !r.noindex);
  const offers = getOffersForProduct(product.id);
  const alts = getAlternativesFromGraph(product.id);
  const competitors = getDirectCompetitors(product.id);
  const comps = getComparisons(options).filter((c) =>
    c.productIds.includes(product.id),
  );

  return {
    whatIsThis:
      descLen >= PRODUCT_WHAT_IS_THIS_MIN_CHARS ||
      Boolean(product.verdict?.trim()),
    whoFor: strengths.length >= 1 || (product.useCaseIds?.length ?? 0) >= 1,
    whoAvoid: weaknesses.length >= 1,
    doesWell: strengths.length >= 2,
    weaknesses: weaknesses.length >= 1,
    howDiffers: Boolean(product.verdict?.trim()) || competitors.length >= 1,
    alternatives: alts.length >= 1 || comps.length >= 1,
    canCompare: comps.length >= 1 || competitors.length >= 1,
    canBuy: offers.length >= 1,
    evidenceSupports: evidenceCount >= 1 || hasReview,
  };
}

export function decisionScoreFromFlags(flags: ProductDecisionFlags): number {
  return Object.values(flags).filter(Boolean).length * 10;
}

/**
 * Runtime product launch-quality assessment (canonical — do not fork LAUNCH_READY rules).
 */
export function assessProductLaunchQuality(
  product: Product,
  options?: PublishResolverOptions,
): ProductQualityAssessment {
  const reasons: string[] = [];
  const productionExposed =
    isPubliclyVisible(product, options) && !product.noindex;

  const emptyFlags = buildProductDecisionFlags(product, options);

  if (product.status === "archived" || product.noindex) {
    return {
      quality: "BLOCKED",
      reasons: [
        product.noindex ? "noindex" : "archived",
        ...(!productionExposed ? ["not_production_exposed"] : []),
      ],
      decisionScore: 0,
      decisionFlags: emptyFlags,
    };
  }

  if (!productionExposed) {
    return {
      quality: "BLOCKED",
      reasons: ["not_production_exposed", `status=${product.status}`],
      decisionScore: 0,
      decisionFlags: emptyFlags,
    };
  }

  const brand = getBrandById(product.brandId, options);
  if (!brand) {
    return {
      quality: "BLOCKED",
      reasons: ["brand_missing"],
      decisionScore: 0,
      decisionFlags: emptyFlags,
    };
  }

  const category = getCategoryById(product.categoryId, options);
  // Informational only — soft-gate is an eligibility disposition overlay.
  if (category && isSoftGatedCategory(category)) {
    reasons.push("soft_gated_category");
  }

  const media = getPrimaryProductMedia(product);
  const hasRealMedia = Boolean(media && isAuthenticProductMedia(media));
  const descLen = (product.shortDescription ?? "").trim().length;
  const strengths = product.strengths ?? [];
  const weaknesses = product.weaknesses ?? [];
  const publish = canPublishProduct(product);
  const evidenceCount = product.evidenceIds?.length ?? 0;
  const reviews = getReviews(options).filter((r) => r.productId === product.id);
  const hasReview = reviews.some((r) => r.status === "published" && !r.noindex);

  const flags = buildProductDecisionFlags(product, options);
  const decisionScore = decisionScoreFromFlags(flags);

  const majorMissing =
    [
      !hasRealMedia,
      descLen < PRODUCT_DESCRIPTION_THIN_CHARS,
      !publish.ok && strengths.length === 0,
      strengths.length === 0 && weaknesses.length === 0,
    ].filter(Boolean).length;

  if (
    !hasRealMedia ||
    descLen < PRODUCT_DESCRIPTION_THIN_CHARS ||
    majorMissing >= 2
  ) {
    return {
      quality: majorMissing >= 2 || !hasRealMedia ? "INCOMPLETE" : "THIN",
      reasons: [
        ...reasons,
        `decisionScore=${decisionScore}`,
        !hasRealMedia ? "media_missing" : "",
        descLen < PRODUCT_DESCRIPTION_THIN_CHARS ? "description_thin" : "",
        !publish.ok ? `publish:${publish.reasons[0] ?? "fail"}` : "",
      ].filter(Boolean),
      decisionScore,
      decisionFlags: flags,
    };
  }

  const readyCore =
    hasRealMedia &&
    descLen >= PRODUCT_WHAT_IS_THIS_MIN_CHARS &&
    strengths.length >= 2 &&
    weaknesses.length >= 1 &&
    (evidenceCount >= 1 || hasReview) &&
    decisionScore >= 70 &&
    publish.ok;

  if (readyCore && decisionScore >= 80) {
    return {
      quality: "LAUNCH_READY",
      reasons: [`decisionScore=${decisionScore}`, ...reasons],
      decisionScore,
      decisionFlags: flags,
    };
  }

  if (
    decisionScore >= 50 &&
    hasRealMedia &&
    (strengths.length >= 1 || weaknesses.length >= 1)
  ) {
    return {
      quality: "NEEDS_MINOR_WORK",
      reasons: [
        `decisionScore=${decisionScore}`,
        ...Object.entries(flags)
          .filter(([, v]) => !v)
          .map(([k]) => `missing:${k}`)
          .slice(0, 6),
        !publish.ok ? `publish:${publish.reasons[0] ?? "fail"}` : "",
        ...reasons,
      ].filter(Boolean),
      decisionScore,
      decisionFlags: flags,
    };
  }

  if (decisionScore >= 30) {
    return {
      quality: "THIN",
      reasons: [`decisionScore=${decisionScore}`, ...reasons],
      decisionScore,
      decisionFlags: flags,
    };
  }

  return {
    quality: "INCOMPLETE",
    reasons: [`decisionScore=${decisionScore}`, ...reasons],
    decisionScore,
    decisionFlags: flags,
  };
}
