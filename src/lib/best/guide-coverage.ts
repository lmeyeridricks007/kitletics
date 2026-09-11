/**
 * Best Guide candidate universe + coverage resolution.
 *
 * CONSIDERED ≠ RECOMMENDED.
 * Trust counts must never fall back to recommendations.length.
 */

import type {
  BestGuide,
  ConsideredProductNote,
} from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  getProductById,
  getProductsByCategory,
  getRecommendationsForProduct,
} from "@/repositories";
import type {
  GuideCandidateEvaluation,
  GuideCandidateStatus,
} from "@/lib/best/guide-coverage-ui";

export type {
  GuideCandidateEvaluation,
  GuideCandidateStatus,
} from "@/lib/best/guide-coverage-ui";
export { guideCandidateStatusLabel } from "@/lib/best/guide-coverage-ui";

export interface GuideCoverageStats {
  /** True when the guide authored an explicit considered set */
  hasAuthenticConsideredSet: boolean;
  consideredCount: number;
  shortlistedCount: number;
  recommendedCount: number;
  candidateUniverseCount: number;
  coveragePercent: number | null;
  consideredProductIds: string[];
  shortlistedProductIds: string[];
  recommendedProductIds: string[];
}

function terrainIsRoadSuitable(product: Product): boolean {
  const terrain = product.specifications.terrain;
  if (!Array.isArray(terrain) || terrain.length === 0) return true;
  const values = terrain.map(String);
  // Long-run / road guides: require road or treadmill — trail-only/mixed trail out
  return values.some((t) => t === "road" || t === "treadmill");
}

/**
 * Discover the candidate universe for a guide from live catalog data.
 * Does not invent recommendations — editorial still chooses the final set.
 */
export function getGuideCandidateUniverse(
  guide: BestGuide,
  options?: PublishResolverOptions & {
    /** Primary use-case for suitability (defaults to guide.useCaseIds[0]) */
    primaryUseCaseId?: string;
    /** When true (default for road shoe guides), exclude trail-only products */
    requireRoadTerrain?: boolean;
    includePreviousGeneration?: boolean;
  },
): Product[] {
  const primaryUseCaseId =
    options?.primaryUseCaseId ?? guide.useCaseIds[0];
  const isTrailGuide =
    guide.id.includes("trail") ||
    guide.slug.includes("trail") ||
    guide.useCaseIds.includes("uc-trail-training");
  const requireRoad =
    options?.requireRoadTerrain ??
    (guide.categoryId === "cat-running-shoes" && !isTrailGuide);
  const includePrev = options?.includePreviousGeneration ?? true;

  return getProductsByCategory(guide.categoryId, options).filter((p) => {
    if (p.status !== "published") return false;
    if (p.lifecycleStatus === "discontinued") return false;
    if (
      !includePrev &&
      p.lifecycleStatus === "previous-generation"
    ) {
      return false;
    }
    if (primaryUseCaseId && !p.useCaseIds.includes(primaryUseCaseId)) {
      return false;
    }
    if (requireRoad && !terrainIsRoadSuitable(p)) return false;
    return true;
  });
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.filter(Boolean))];
}

/**
 * Resolve considered / shortlisted / recommended coverage for a guide.
 * Never uses recommendation count as a stand-in for considered count.
 */
export function resolveGuideCoverage(
  guide: BestGuide,
  options?: PublishResolverOptions,
): GuideCoverageStats {
  const recommendedProductIds = uniqueIds(
    guide.recommendations.map((r) => r.productId),
  );

  const noteIds = (guide.consideredProducts ?? []).map((n) => n.productId);
  const authoredConsideredIds = uniqueIds([
    ...(guide.consideredProductIds ?? []),
    ...noteIds,
  ]);

  /**
   * Authentic considered set = explicit consideredProductIds, OR
   * consideredProducts that at least cover the recommendation set
   * (legacy honorable-mention-only notes do NOT count).
   */
  const notesCoverRecommendations =
    noteIds.length > 0 &&
    recommendedProductIds.every((id) => noteIds.includes(id));
  const hasAuthenticConsideredSet =
    (guide.consideredProductIds?.length ?? 0) > 0 ||
    notesCoverRecommendations ||
    authoredConsideredIds.length > recommendedProductIds.length;

  const consideredProductIds = hasAuthenticConsideredSet
    ? uniqueIds([...authoredConsideredIds, ...recommendedProductIds])
    : [];

  const shortlistedFromNotes = (guide.consideredProducts ?? [])
    .filter((n) => n.kind === "shortlisted" || n.kind === "honorable-mention")
    .map((n) => n.productId);

  const shortlistedProductIds = hasAuthenticConsideredSet
    ? uniqueIds([
        ...(guide.shortlistedProductIds ?? []),
        ...shortlistedFromNotes,
        ...recommendedProductIds,
      ]).filter((id) => consideredProductIds.includes(id))
    : [];

  const universe = getGuideCandidateUniverse(guide, {
    ...options,
    primaryUseCaseId: guide.useCaseIds[0],
  });

  const coveragePercent =
    universe.length > 0 && hasAuthenticConsideredSet
      ? Math.min(
          100,
          Math.round((consideredProductIds.length / universe.length) * 100),
        )
      : null;

  return {
    hasAuthenticConsideredSet,
    consideredCount: hasAuthenticConsideredSet
      ? consideredProductIds.length
      : 0,
    shortlistedCount: shortlistedProductIds.length,
    recommendedCount: recommendedProductIds.length,
    candidateUniverseCount: universe.length,
    coveragePercent,
    consideredProductIds,
    shortlistedProductIds,
    recommendedProductIds,
  };
}

/**
 * Build evaluation rows for QA / Products Considered UI.
 */
export function buildGuideCandidateEvaluations(
  guide: BestGuide,
  options?: PublishResolverOptions,
): GuideCandidateEvaluation[] {
  const coverage = resolveGuideCoverage(guide, options);
  const noteById = new Map(
    (guide.consideredProducts ?? []).map((n) => [n.productId, n]),
  );
  const recommended = new Set(coverage.recommendedProductIds);
  const shortlisted = new Set(coverage.shortlistedProductIds);

  const ids =
    coverage.consideredProductIds.length > 0
      ? coverage.consideredProductIds
      : getGuideCandidateUniverse(guide, options).map((p) => p.id);

  return ids.map((productId) => {
    const product = getProductById(productId, options);
    const note = noteById.get(productId);
    const recs = product
      ? getRecommendationsForProduct(product.id).filter(
          (r) => r.useCaseId != null && guide.useCaseIds.includes(r.useCaseId),
        )
      : [];
    const contextScore =
      recs.length > 0
        ? recs.reduce((s, r) => s + r.score, 0) / recs.length
        : undefined;

    let status: GuideCandidateStatus = "considered";
    if (recommended.has(productId)) status = "recommended";
    else if (shortlisted.has(productId)) status = "shortlisted";
    else if (
      note?.kind === "rejected" ||
      note?.kind === "removed" ||
      note?.kind === "previous-pick"
    ) {
      status = "rejected";
    }

    const rejectionReason =
      status === "rejected"
        ? note?.reason
        : status === "considered" && !shortlisted.has(productId)
          ? note?.reason
          : undefined;

    const publicReason =
      status === "recommended"
        ? undefined
        : note?.reason?.trim() || rejectionReason;

    return {
      productId,
      product: product ?? undefined,
      eligible: Boolean(product?.status === "published"),
      recommendationScore: product?.recommendationScore,
      contextScore,
      status,
      rejectionReason,
      publicReason,
      stillConsiderIf: note?.stillConsiderIf,
      closestRecommendedProductId: note?.closestRecommendedProductId,
      reasonCode: note?.reasonCode,
      isPreviousGeneration:
        note?.kind === "previous-pick" ||
        note?.reasonCode === "previous-generation" ||
        product?.lifecycleStatus === "previous-generation",
    };
  }).sort((a, b) => {
    const order = { recommended: 0, shortlisted: 1, considered: 2, rejected: 3 };
    if (order[a.status] !== order[b.status]) {
      return order[a.status] - order[b.status];
    }
    return (b.contextScore ?? b.recommendationScore ?? 0) -
      (a.contextScore ?? a.recommendationScore ?? 0);
  });
}

/** Consumer-safe status label — never “rejected / failed / eliminated” */
// guideCandidateStatusLabel re-exported from guide-coverage-ui

/**
 * Helper for editorial scripts: seed consideredProductIds from the live universe.
 */
export function deriveConsideredProductIds(
  guide: BestGuide,
  options?: PublishResolverOptions,
): string[] {
  return getGuideCandidateUniverse(guide, options).map((p) => p.id);
}

export function mergeConsideredNotes(
  ids: string[],
  notes: ConsideredProductNote[],
): ConsideredProductNote[] {
  const byId = new Map(notes.map((n) => [n.productId, n]));
  return ids.map((productId) => {
    const existing = byId.get(productId);
    if (existing) return existing;
    return {
      productId,
      kind: "considered" as const,
      reason: "Matched guide use-case and category eligibility.",
    };
  });
}
