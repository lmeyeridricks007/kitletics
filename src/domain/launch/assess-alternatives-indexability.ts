/**
 * Fix 82 — single canonical Alternatives indexability policy.
 *
 * Sitemap eligibility and page robots MUST both consume this result.
 * Weak pages stay non-indexable / out of sitemap — do not loosen the bar
 * merely to preserve URL count.
 *
 * Does not import getLaunchEligibility (avoids circular module graph).
 */
import type { Product } from "@/domain/products/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { getAllProductRelationships } from "@/repositories/relationships";
import { getProducts } from "@/repositories/products";
import { getCategoryById } from "@/repositories/sports";
import { isSoftGatedCategory } from "@/lib/navigation/category-href";
import {
  resolveEntityVerticalPolicy,
  verticalHidesDeepEntities,
} from "@/content/launch/vertical-strategy";
import { assessProductLaunchQuality } from "@/domain/launch/assess-product-quality";
import { isMinorWorkProductApproved } from "@/content/launch/minor-work-approvals";
import { assessEditorialReadiness } from "@/domain/editorial-readiness";
import { ALTERNATIVES_INDEXABLE_CATEGORIES } from "@/lib/product/alternative-decision-copy";
import { ALTERNATIVES_UNIQUENESS_HOLD_SLUGS } from "@/content/alternatives-uniqueness-holds";
import {
  classifyAlternativesHold,
  type AlternativesHoldClass,
} from "@/lib/product/classify-alternatives-hold";
import {
  evaluateAlternativesContentIndexable,
  signalsFromPageParts,
  type AlternativesQualitySignals,
} from "@/lib/product/alternatives-quality-signals";
import { computeAlternativesQualitySignals } from "@/lib/product/compute-alternatives-quality-signals";

export interface AlternativesIndexabilityAssessment {
  indexable: boolean;
  /** Page may render publicly (not HIDDEN_404). */
  publishable: boolean;
  holdReason?: AlternativesHoldClass | string;
  reasons: string[];
  qualitySignals: AlternativesQualitySignals;
}

const assessmentCache = new Map<string, AlternativesIndexabilityAssessment>();

/**
 * Canonical answer: should this Alternatives page be indexable?
 *
 * Quality bar:
 * - canPublishAlternativesPage (graph gate)
 * - indexable category
 * - no uniqueness hold
 * - ≥3 substantive decision alternatives
 * - ≥2 distinct reason groups on the ranked page (by reasonId)
 * - distinct pair-specific decision copy
 * - parent product would be INDEXABLE
 * - editorial READY
 */
export function assessAlternativesIndexability(
  product: Product,
  options?: PublishResolverOptions,
  /** Precomputed signals from page build — avoids rebuilding when available. */
  precomputed?: AlternativesQualitySignals,
): AlternativesIndexabilityAssessment {
  const cacheKey = `${product.id}::${options?.isDev ? "dev" : "prod"}::${precomputed ? "p" : "c"}`;
  if (!precomputed) {
    const hit = assessmentCache.get(cacheKey);
    if (hit) return hit;
  }

  const assessment = assessAlternativesIndexabilityUncached(
    product,
    options,
    precomputed,
  );
  if (!precomputed) assessmentCache.set(cacheKey, assessment);
  return assessment;
}

function assessAlternativesIndexabilityUncached(
  product: Product,
  options?: PublishResolverOptions,
  precomputed?: AlternativesQualitySignals,
): AlternativesIndexabilityAssessment {
  const relationships = getAllProductRelationships();
  const gate = canPublishAlternativesPage(product, relationships);

  const categoryIndexable = ALTERNATIVES_INDEXABLE_CATEGORIES.has(
    product.categoryId,
  );
  const uniquenessHold = ALTERNATIVES_UNIQUENESS_HOLD_SLUGS.has(product.slug);
  const parentIndexable = isParentProductIndexable(product, options);

  // Skip expensive page build when graph / category / uniqueness already fail.
  const needsPageSignals =
    gate.ok && categoryIndexable && !uniquenessHold && parentIndexable;

  const signals =
    precomputed ??
    (needsPageSignals
      ? computeAlternativesQualitySignals(product, options)
      : signalsFromPageParts({
          productSlug: product.slug,
          categoryId: product.categoryId,
          canPublish: gate.ok,
          alternativeCount: gate.alternativeCount,
          substantiveCount: 0,
          reasonGroupCount: 0,
          distinctCopy: false,
        }));

  const reasons: string[] = [];
  let publishable = true;
  let holdReason: AlternativesIndexabilityAssessment["holdReason"];

  const vertical = resolveEntityVerticalPolicy(product.sportIds);
  if (verticalHidesDeepEntities(vertical, "product")) {
    publishable = false;
    holdReason = `vertical_hold:${vertical.slug}`;
    reasons.push(`vertical_hold:${vertical.slug}:${vertical.mode}`);
  }

  if (!isPubliclyVisible(product, options) || product.noindex) {
    publishable = false;
    holdReason = holdReason ?? "parent_product_hidden";
    reasons.push("parent_product_hidden");
  }

  if (!gate.ok) {
    publishable = false;
    const hold = classifyAlternativesHold(
      product,
      relationships,
      getProducts(options),
    );
    holdReason =
      hold === "THIN_UNEXPLAINED" ? "thin_decision_shape" : hold;
    reasons.push(...gate.reasons);
    if (hold !== "READY" && hold !== "THIN_UNEXPLAINED") {
      reasons.push(hold);
    }
  }

  let indexable = publishable && parentIndexable;
  if (!parentIndexable) {
    reasons.push("parent_product_not_indexable");
  }

  const content = evaluateAlternativesContentIndexable({
    canPublish: gate.ok,
    categoryId: product.categoryId,
    productSlug: product.slug,
    substantiveCount: signals.substantiveCount,
    reasonGroupCount: signals.reasonGroupCount,
    distinctCopy: signals.distinctCopy,
  });
  if (!content.indexable) {
    indexable = false;
    for (const r of content.reasons) {
      if (!reasons.includes(r)) reasons.push(r);
    }
  }

  if (indexable) {
    const editorial = assessEditorialReadiness(
      { kind: "alternatives", entity: product },
      options,
    );
    if (!editorial.ready) {
      indexable = false;
      reasons.push(`editorial_not_ready:${editorial.workState}`);
      reasons.push(...editorial.gaps.slice(0, 4));
    }
  }

  if (indexable) {
    reasons.length = 0;
    reasons.push("alternatives_ok");
  }

  return {
    indexable,
    publishable,
    holdReason,
    reasons,
    qualitySignals: {
      ...signals,
      canPublish: gate.ok,
    },
  };
}

const parentIndexableCache = new Map<string, boolean>();

function isParentProductIndexable(
  product: Product,
  options?: PublishResolverOptions,
): boolean {
  const key = `${product.id}::${options?.isDev ? "dev" : "prod"}`;
  const hit = parentIndexableCache.get(key);
  if (hit !== undefined) return hit;

  let ok = true;
  if (!isPubliclyVisible(product, options) || product.noindex) ok = false;
  else {
    const vertical = resolveEntityVerticalPolicy(product.sportIds);
    if (verticalHidesDeepEntities(vertical, "product")) ok = false;
    else {
      const category = getCategoryById(product.categoryId, options);
      if (category && isSoftGatedCategory(category)) ok = false;
      else {
        const assessed = assessProductLaunchQuality(product, options);
        if (assessed.quality === "LAUNCH_READY") ok = true;
        else if (
          assessed.quality === "NEEDS_MINOR_WORK" &&
          isMinorWorkProductApproved(product.slug)
        ) {
          ok = true;
        } else {
          ok = false;
        }
      }
    }
  }
  parentIndexableCache.set(key, ok);
  return ok;
}
