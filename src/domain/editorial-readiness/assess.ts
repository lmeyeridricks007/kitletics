/**
 * Unified editorial readiness assessors (Fix 48).
 *
 * Combines quality + uniqueness + evidence safety + intent uniqueness +
 * valid relationships + unbroken references into one READY / not-READY outcome.
 */

import type {
  BestGuide,
  BuyingGuide,
  Comparison,
  Review,
} from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
import { assessBestGuideLaunchQuality } from "@/domain/launch/assess-best-guide-quality";
import { assessComparisonLaunchQuality } from "@/domain/launch/assess-comparison-quality";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import { isContentUniquenessReviewHeld } from "@/content/launch/content-uniqueness-holds";
import { ALTERNATIVES_UNIQUENESS_HOLD_SLUGS } from "@/content/alternatives-uniqueness-holds";
import { EDITORIAL_INTENT_HOLD_PATHS } from "@/content/best-guides-p46-intent-roles";
import { COMPARISON_BROKEN_PEER_SLUGS } from "@/content/comparisons-p41-completion";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { classifyAlternativesHold } from "@/lib/product/classify-alternatives-hold";
import { isReportOrJunkVoice } from "@/lib/review/review-voice";
import {
  getAllProductRelationships,
  getAlternativesForProduct,
  getBrandById,
  getProductById,
  getProducts,
} from "@/repositories";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import type {
  EditorialDimension,
  EditorialDimensionResult,
  EditorialReadinessAssessment,
  EditorialSurfaceKind,
  EditorialWorkState,
} from "@/domain/editorial-readiness/types";

const BROKEN_COMPARISON_SET = new Set<string>(COMPARISON_BROKEN_PEER_SLUGS);

function emptyDims(): Record<EditorialDimension, EditorialDimensionResult> {
  return {
    quality: { ok: false },
    uniqueness: { ok: false },
    evidenceSafety: { ok: false },
    intentUniqueness: { ok: false },
    relationships: { ok: false },
    references: { ok: false },
  };
}

function finalize(
  kind: EditorialSurfaceKind,
  id: string,
  path: string,
  dimensions: Record<EditorialDimension, EditorialDimensionResult>,
  preferredState?: EditorialWorkState,
): EditorialReadinessAssessment {
  const gaps = Object.entries(dimensions)
    .filter(([, d]) => !d.ok)
    .map(([key, d]) => (d.detail ? `${key}:${d.detail}` : key));

  const ready = gaps.length === 0;

  let workState: EditorialWorkState = preferredState ?? "NEEDS_RESEARCH";
  if (ready) {
    workState = "READY";
  } else if (gaps.some((g) => g.startsWith("references:"))) {
    workState = "BROKEN";
  } else if (gaps.some((g) => g.includes("uniqueness") || g.includes("duplicative"))) {
    workState = "NEEDS_UNIQUE_REWRITE";
  } else if (gaps.some((g) => g.includes("intent"))) {
    workState = "NEEDS_INTENT_DIFFERENTIATION";
  } else if (gaps.some((g) => g.includes("evidence"))) {
    workState = "NEEDS_EVIDENCE";
  } else if (preferredState) {
    workState = preferredState;
  } else if (gaps.some((g) => g.includes("relationships"))) {
    workState = "NEEDS_RELATIONSHIP_FIX";
  } else if (gaps.some((g) => g.includes("blocked") || g.includes("archived"))) {
    workState = "BLOCKED_INTENTIONALLY";
  }

  return { kind, id, path, ready, workState, gaps, dimensions };
}

function productNameInText(product: Product, text: string): boolean {
  const name = product.name.trim();
  if (name.length >= 3 && text.toLowerCase().includes(name.toLowerCase())) {
    return true;
  }
  const full = product.fullName?.trim();
  if (full && full.length >= 3 && text.toLowerCase().includes(full.toLowerCase())) {
    return true;
  }
  return text.toLowerCase().includes(product.slug.replace(/-/g, " "));
}

export function assessReviewEditorialReadiness(
  review: Review,
  options?: PublishResolverOptions,
): EditorialReadinessAssessment {
  const path = `/reviews/${review.slug}`;
  const dims = emptyDims();
  const product = getProductById(review.productId, options);
  const assessed = assessReviewLaunchQuality(review, options);

  // References
  if (!product) {
    dims.references = { ok: false, detail: "orphan_product" };
  } else if (product.status === "archived") {
    dims.references = { ok: false, detail: "product_archived" };
  } else {
    dims.references = { ok: true };
  }

  // Quality — substantive LAUNCH_READY only
  if (assessed.quality === "LAUNCH_READY") {
    dims.quality = { ok: true, detail: assessed.quality };
  } else {
    dims.quality = {
      ok: false,
      detail: assessed.quality,
    };
  }

  // Uniqueness
  if (assessed.quality === "DUPLICATIVE" || isContentUniquenessReviewHeld(review.slug)) {
    dims.uniqueness = { ok: false, detail: "content_uniqueness_hold" };
  } else {
    dims.uniqueness = { ok: true };
  }

  // Evidence safety + no fake first-hand
  const falseFirstHand = assessed.reasons.includes(
    "FIRST_HAND_CLAIM_WITHOUT_PERSONAL_TEST_EVIDENCE",
  );
  const hasEvidence = (review.evidenceIds?.length ?? 0) >= 1;
  if (falseFirstHand) {
    dims.evidenceSafety = { ok: false, detail: "fake_first_hand" };
  } else if (!hasEvidence && assessed.quality !== "BLOCKED") {
    dims.evidenceSafety = { ok: false, detail: "missing_evidence" };
  } else {
    dims.evidenceSafety = { ok: true };
  }

  // Intent / product-specific (not generic junk voice on the decision lead)
  const brand = product ? getBrandById(product.brandId, options) : undefined;
  const enriched = product
    ? enrichReviewForPage(review, product, { brand })
    : review;
  const lead = [
    enriched.summary,
    enriched.verdict,
    enriched.bottomLine,
  ]
    .filter(Boolean)
    .join("\n");
  const body = [
    lead,
    ...(enriched.sections ?? []).map((s) => s.body),
  ]
    .filter(Boolean)
    .join("\n");

  if (EDITORIAL_INTENT_HOLD_PATHS.has(path)) {
    dims.intentUniqueness = { ok: false, detail: "intent_hold" };
  } else if (product && !productNameInText(product, body) && words(body) >= 200) {
    dims.intentUniqueness = { ok: false, detail: "not_product_specific" };
  } else if (isReportOrJunkVoice(lead)) {
    dims.intentUniqueness = { ok: false, detail: "report_or_junk_voice" };
  } else {
    dims.intentUniqueness = { ok: true };
  }

  // Relationships — review alts/comps or approved graph alternatives
  const hasAlts = (enriched.alternativeProductIds?.length ?? 0) >= 1;
  const hasComps = (enriched.comparisonIds?.length ?? 0) >= 1;
  const graphAltCount = product
    ? getAlternativesForProduct(product.id).length
    : 0;
  if (hasAlts || hasComps || graphAltCount >= 1) {
    dims.relationships = { ok: true };
  } else {
    dims.relationships = {
      ok: false,
      detail: "missing_alternatives_and_comparisons",
    };
  }

  return finalize("review", review.id, path, dims);
}

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function assessBestGuideEditorialReadiness(
  guide: BestGuide,
  options?: PublishResolverOptions,
): EditorialReadinessAssessment {
  const path = `/best/${guide.slug}`;
  const dims = emptyDims();
  const assessed = assessBestGuideLaunchQuality(guide, options);

  dims.quality = {
    ok: assessed.quality === "LAUNCH_READY",
    detail: assessed.quality,
  };

  dims.uniqueness = { ok: true };
  if (EDITORIAL_INTENT_HOLD_PATHS.has(path)) {
    dims.intentUniqueness = { ok: false, detail: "intent_hold" };
  } else {
    dims.intentUniqueness = { ok: true };
  }

  dims.evidenceSafety = {
    ok: (guide.evidenceIds?.length ?? 0) > 0,
    detail:
      (guide.evidenceIds?.length ?? 0) > 0 ? undefined : "missing_evidence_ids",
  };

  const recs = guide.recommendations ?? [];
  const resolvedRecs = recs.filter((r) =>
    Boolean(getProductById(r.productId, options)),
  );
  const missingRecs = recs.length - resolvedRecs.length;
  const hasShortlistModel =
    resolvedRecs.length >= 1 &&
    ((guide.shortlistedProductIds?.length ?? 0) >= 1 ||
      (guide.consideredProducts?.length ?? 0) >= 1 ||
      (guide.consideredProductIds?.length ?? 0) >= 1 ||
      // Authentic considered set may live only as recommendations when annotated
      resolvedRecs.every(
        (r) =>
          Boolean(r.whyRecommended?.trim() || r.rationale?.trim() || r.whyItFits?.length),
      ));

  if (missingRecs > 0) {
    dims.references = {
      ok: false,
      detail: `missing_recommendation_products=${missingRecs}`,
    };
  } else if (recs.length === 0) {
    dims.references = { ok: false, detail: "no_recommendations" };
  } else {
    dims.references = { ok: true };
  }

  dims.relationships = {
    ok: hasShortlistModel,
    detail: hasShortlistModel ? undefined : "invalid_considered_shortlist_model",
  };

  return finalize("best-guide", guide.id, path, dims);
}

export function assessBuyingGuideEditorialReadiness(
  guide: BuyingGuide,
  options?: PublishResolverOptions,
): EditorialReadinessAssessment {
  void options;
  const path = `/guides/${guide.slug}`;
  const dims = emptyDims();
  const assessed = assessGuideQuality(guide);

  dims.quality = {
    ok: assessed.status === "complete",
    detail: assessed.status,
  };

  dims.uniqueness = { ok: true };
  dims.intentUniqueness = EDITORIAL_INTENT_HOLD_PATHS.has(path)
    ? { ok: false, detail: "intent_hold" }
    : { ok: true };

  // Guides are frameworks — evidence safety = no fake first-hand + decision complete
  const blob = [
    guide.quickAnswer,
    ...guide.sections.map((s) => s.body),
  ]
    .filter(Boolean)
    .join("\n");
  const fakeFirst =
    /\b(we tested|I wore|after \d+\s*km|personally tested)\b/i.test(blob) &&
    !/not personally|research|editorial/i.test(blob);
  dims.evidenceSafety = fakeFirst
    ? { ok: false, detail: "fake_first_hand" }
    : { ok: true };

  dims.relationships = {
    ok: assessed.decisionCompleteness !== "low",
    detail:
      assessed.decisionCompleteness === "low"
        ? "decision_incomplete"
        : assessed.decisionCompleteness,
  };

  const brokenProducts = (guide.relatedProductIds ?? []).filter(
    (id) => !getProductById(id, options),
  );
  dims.references = {
    ok: brokenProducts.length === 0,
    detail:
      brokenProducts.length > 0
        ? `missing_products=${brokenProducts.length}`
        : undefined,
  };

  return finalize("buying-guide", guide.id, path, dims);
}

export function assessComparisonEditorialReadiness(
  comparison: Comparison,
  options?: PublishResolverOptions,
): EditorialReadinessAssessment {
  const path = `/compare/${comparison.slug}`;
  const dims = emptyDims();
  const assessed = assessComparisonLaunchQuality(comparison, options);

  dims.quality = {
    ok: assessed.meaningful,
    detail: assessed.quality,
  };

  if (BROKEN_COMPARISON_SET.has(comparison.slug)) {
    dims.references = { ok: false, detail: "broken_peer_slug_hold" };
  } else {
    const products = comparison.productIds.map((id) =>
      getProductById(id, options),
    );
    const missing = products.filter((p) => !p).length;
    const unpublished = products.filter(
      (p) => p && p.status !== "published",
    ).length;
    if (comparison.productIds.length < 2 || missing > 0) {
      dims.references = {
        ok: false,
        detail: missing > 0 ? "missing_products" : "need_two_products",
      };
    } else if (unpublished > 0) {
      dims.references = { ok: false, detail: "unpublished_products" };
    } else {
      dims.references = { ok: true };
    }
  }

  dims.uniqueness = { ok: true };
  dims.intentUniqueness = EDITORIAL_INTENT_HOLD_PATHS.has(path)
    ? { ok: false, detail: "intent_hold" }
    : { ok: true };

  dims.evidenceSafety = {
    ok: true, // comparisons use criteria/diffs; fake first-hand rare
  };

  const products = comparison.productIds
    .map((id) => getProductById(id, options))
    .filter((p): p is Product => Boolean(p));
  const pairText = `${comparison.summary ?? ""} ${comparison.verdict ?? ""}`;
  const pairSpecific =
    products.length >= 2 &&
    (productNameInText(products[0]!, pairText) ||
      productNameInText(products[1]!, pairText) ||
      pairText.length >= 40);

  dims.relationships = {
    ok: pairSpecific && assessed.meaningful,
    detail: pairSpecific ? undefined : "not_pair_specific",
  };

  return finalize("comparison", comparison.id, path, dims);
}

export function assessAlternativesEditorialReadiness(
  product: Product,
  options?: PublishResolverOptions,
): EditorialReadinessAssessment {
  const path = `/products/${product.slug}/alternatives`;
  const dims = emptyDims();
  const gate = canPublishAlternativesPage(product, getAllProductRelationships());
  const hold = classifyAlternativesHold(
    product,
    getAllProductRelationships(),
    getProducts(options),
  );
  const explicitHold =
    hold === "HOLD_INSUFFICIENT_ALTERNATIVE_MARKET" ||
    hold === "HOLD_DUPLICATE_INTENT" ||
    hold === "HOLD_OBSOLETE_SOURCE";

  dims.quality = {
    ok: gate.ok,
    detail: gate.ok
      ? "decision_shape_ok"
      : explicitHold
        ? hold
        : gate.reasons[0],
  };
  dims.relationships = {
    ok: gate.ok,
    detail: gate.ok
      ? `alts=${gate.alternativeCount};types=${gate.uniqueTypes}`
      : explicitHold
        ? hold
        : gate.reasons.join(";"),
  };
  dims.uniqueness = ALTERNATIVES_UNIQUENESS_HOLD_SLUGS.has(product.slug)
    ? { ok: false, detail: "alternatives_uniqueness_hold" }
    : { ok: true };
  dims.intentUniqueness = EDITORIAL_INTENT_HOLD_PATHS.has(path)
    ? { ok: false, detail: "intent_hold" }
    : { ok: true };
  dims.evidenceSafety = { ok: true };
  dims.references = {
    ok: product.status === "published",
    detail: product.status === "published" ? undefined : "source_not_published",
  };

  return finalize(
    "alternatives",
    product.id,
    path,
    dims,
    explicitHold ? "BLOCKED_INTENTIONALLY" : undefined,
  );
}

export type EditorialReadinessInput =
  | { kind: "review"; entity: Review }
  | { kind: "best-guide"; entity: BestGuide }
  | { kind: "buying-guide"; entity: BuyingGuide }
  | { kind: "comparison"; entity: Comparison }
  | { kind: "alternatives"; entity: Product };

export function assessEditorialReadiness(
  input: EditorialReadinessInput,
  options?: PublishResolverOptions,
): EditorialReadinessAssessment {
  switch (input.kind) {
    case "review":
      return assessReviewEditorialReadiness(input.entity, options);
    case "best-guide":
      return assessBestGuideEditorialReadiness(input.entity, options);
    case "buying-guide":
      return assessBuyingGuideEditorialReadiness(input.entity, options);
    case "comparison":
      return assessComparisonEditorialReadiness(input.entity, options);
    case "alternatives":
      return assessAlternativesEditorialReadiness(input.entity, options);
  }
}

export function isEditorialReady(
  input: EditorialReadinessInput,
  options?: PublishResolverOptions,
): boolean {
  return assessEditorialReadiness(input, options).ready;
}
