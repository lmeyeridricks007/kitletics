/**
 * Normalize Best Guide coverage + recommendation context analysis.
 *
 * - Drop unpublished / missing recommendation IDs (optionally backfill from
 *   published category peers so hub strips match list length)
 * - Authentic considered set from candidate universe when missing
 * - Page-quality context fields via enrichGuideRecommendation
 * - Peer-based considerInsteadProductIds when choose-instead is empty
 *
 * Applied at repository read time so pages, hub strips, and coverage QA share
 * the same resolved shape without hand-editing every seed.
 */

import type { BestGuide, BestGuideRecommendation } from "@/domain/editorial/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  getGuideCandidateUniverse,
  resolveGuideCoverage,
} from "@/lib/best/guide-coverage";
import { enrichGuideRecommendation } from "@/lib/best/enrich-guide-recommendation";
import { getPrimaryProductMedia } from "@/lib/product/media";
import {
  getBrandById,
  getProductById,
  getProductsByCategory,
} from "@/repositories/products";

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.filter(Boolean))];
}

function isPublishedProduct(
  productId: string,
  options?: PublishResolverOptions,
): boolean {
  const p = getProductById(productId, options);
  return Boolean(p && p.status === "published");
}

/**
 * Keep only published recommendations; when the list shrinks, backfill from
 * published category products that have authentic heroes (hub-strip ready).
 */
function repairRecommendations(
  guide: BestGuide,
  options?: PublishResolverOptions,
): BestGuide {
  const original = [...guide.recommendations].sort((a, b) => a.rank - b.rank);
  const kept = original.filter((r) => isPublishedProduct(r.productId, options));
  if (kept.length === original.length) {
    return guide;
  }

  const used = new Set(kept.map((r) => r.productId));
  const targetCount = original.length;
  const fillers = getProductsByCategory(guide.categoryId, options)
    .filter(
      (p) =>
        p.status === "published" &&
        !used.has(p.id) &&
        Boolean(getPrimaryProductMedia(p)),
    )
    .sort(
      (a, b) => (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0),
    );

  const recommendations: BestGuideRecommendation[] = [...kept];
  for (const product of fillers) {
    if (recommendations.length >= targetCount) break;
    used.add(product.id);
    recommendations.push({
      productId: product.id,
      rank: recommendations.length + 1,
      awardType: "editors-pick",
      badge: "Honorable mention",
      summary:
        product.strengths?.[0]?.trim() ||
        product.shortDescription?.slice(0, 100) ||
        product.name,
      whyRecommended: `Published catalog alternative for ${guide.title} while media-pending picks stay off the live list.`,
      rationale: product.shortDescription?.slice(0, 140) || product.name,
      strengths: (product.strengths ?? []).slice(0, 3),
      compromises: (product.weaknesses ?? []).slice(0, 2),
      useCaseIds: guide.useCaseIds.slice(0, 3),
    });
  }

  const renumbered = recommendations.map((r, i) => ({ ...r, rank: i + 1 }));
  const recIds = renumbered.map((r) => r.productId);

  return {
    ...guide,
    recommendations: renumbered,
    comparisonProductIds: uniqueIds([
      ...recIds,
      ...guide.comparisonProductIds.filter((id) => isPublishedProduct(id, options)),
    ]).slice(0, Math.max(recIds.length, 4)),
    intentionallyNarrow:
      guide.intentionallyNarrow || renumbered.length < original.length,
  };
}

function ensureConsideredSet(
  guide: BestGuide,
  options?: PublishResolverOptions,
): BestGuide {
  const coverage = resolveGuideCoverage(guide, options);
  if (coverage.hasAuthenticConsideredSet) {
    const missingRec = coverage.recommendedProductIds.filter(
      (id) => !coverage.consideredProductIds.includes(id),
    );
    if (missingRec.length === 0) return guide;
    return {
      ...guide,
      consideredProductIds: uniqueIds([
        ...(guide.consideredProductIds ?? coverage.consideredProductIds),
        ...missingRec,
      ]),
    };
  }

  const universe = getGuideCandidateUniverse(guide, options);
  const universeIds = universe.map((p) => p.id);
  const recommendedIds = guide.recommendations.map((r) => r.productId);
  const publishedRecIds = recommendedIds.filter((id) =>
    isPublishedProduct(id, options),
  );

  const consideredProductIds = uniqueIds([...universeIds, ...publishedRecIds]);
  if (consideredProductIds.length === 0) {
    return guide;
  }

  const shortlistedProductIds = uniqueIds([
    ...(guide.shortlistedProductIds ?? []),
    ...publishedRecIds,
  ]).filter((id) => consideredProductIds.includes(id));

  return {
    ...guide,
    consideredProductIds,
    shortlistedProductIds:
      shortlistedProductIds.length > 0
        ? shortlistedProductIds
        : publishedRecIds.filter((id) => consideredProductIds.includes(id)),
    intentionallyNarrow:
      guide.intentionallyNarrow ??
      (universeIds.length > 0 &&
        consideredProductIds.length <= Math.max(4, publishedRecIds.length + 1)),
  };
}

function ensurePeerChooseInstead(
  entry: BestGuideRecommendation,
  peerIds: string[],
): BestGuideRecommendation {
  if (
    (entry.chooseInsteadWhen?.length ?? 0) > 0 ||
    (entry.considerInsteadProductIds?.length ?? 0) > 0
  ) {
    return entry;
  }
  const peers = peerIds.filter((id) => id !== entry.productId).slice(0, 3);
  if (!peers.length) return entry;
  return { ...entry, considerInsteadProductIds: peers };
}

function ensureUseCaseIds(
  entry: BestGuideRecommendation,
  guide: BestGuide,
): BestGuideRecommendation {
  if (
    (entry.bestForProfiles?.length ?? 0) > 0 ||
    (entry.useCaseIds?.length ?? 0) > 0
  ) {
    return entry;
  }
  if (!guide.useCaseIds.length) return entry;
  return { ...entry, useCaseIds: guide.useCaseIds.slice(0, 3) };
}

function enrichRecommendations(
  guide: BestGuide,
  options?: PublishResolverOptions,
): BestGuide {
  const sorted = [...guide.recommendations].sort((a, b) => a.rank - b.rank);
  const peerIds = sorted.map((r) => r.productId);

  const recommendations = sorted.map((entry, index) => {
    const product = getProductById(entry.productId, options);
    if (!product) {
      return ensurePeerChooseInstead(ensureUseCaseIds(entry, guide), peerIds);
    }

    const peers = sorted
      .filter((_, j) => j !== index)
      .map((peer) => {
        const peerProduct = getProductById(peer.productId, options);
        return peerProduct
          ? { product: peerProduct, entry: peer }
          : undefined;
      })
      .filter(
        (
          x,
        ): x is {
          product: NonNullable<typeof x>["product"];
          entry: BestGuideRecommendation;
        } => Boolean(x),
      );

    let enriched = enrichGuideRecommendation({
      guide,
      entry,
      product,
      brand: getBrandById(product.brandId, options),
      peers,
      isTopPick: index === 0,
    });

    enriched = ensureUseCaseIds(enriched, guide);
    enriched = ensurePeerChooseInstead(enriched, peerIds);
    return enriched;
  });

  return { ...guide, recommendations };
}

/**
 * Resolve coverage authenticity + recommendation decision fields for a guide.
 */
export function normalizeBestGuide(
  guide: BestGuide,
  options?: PublishResolverOptions,
): BestGuide {
  const repaired = repairRecommendations(guide, options);
  const withConsidered = ensureConsideredSet(repaired, options);
  return enrichRecommendations(withConsidered, options);
}

export function normalizeBestGuides(
  guides: BestGuide[],
  options?: PublishResolverOptions,
): BestGuide[] {
  return guides.map((g) => normalizeBestGuide(g, options));
}
