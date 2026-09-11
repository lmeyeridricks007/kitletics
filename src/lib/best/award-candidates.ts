import type { AwardType } from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";
import type { Recommendation } from "@/domain/recommendations/types";
import type { RegionCode } from "@/domain/shared/types";
import { getAwardLabel } from "@/lib/best/awards";

export interface GuideAwardCandidate {
  productId: string;
  productName: string;
  awardType: AwardType;
  contextScore?: number;
  relevantFactors: string[];
  evidenceCoverage: number;
  compromises: string[];
  lowestPrice?: { price: number; currency: string };
  reasons: string[];
}

/**
 * Rank candidate Products for a Best Guide award.
 * Editorial layer chooses/validates — this does NOT auto-publish.
 */
export function getGuideAwardCandidates(input: {
  guideId: string;
  awardType: AwardType;
  region?: RegionCode;
  products: Product[];
  recommendations: Recommendation[];
  /** Use-case IDs that define this award’s context */
  contextIds: string[];
  lowestByProduct?: Record<
    string,
    { price: number; currency: string } | undefined
  >;
  limit?: number;
}): GuideAwardCandidate[] {
  const limit = input.limit ?? 8;
  const scored: GuideAwardCandidate[] = [];

  for (const product of input.products) {
    if (product.status !== "published") continue;
    if (product.lifecycleStatus === "discontinued") continue;

    const recs = input.recommendations.filter(
      (r) =>
        r.productId === product.id &&
        r.useCaseId != null &&
        input.contextIds.includes(r.useCaseId),
    );
    const contextScore =
      recs.length > 0
        ? recs.reduce((s, r) => s + r.score, 0) / recs.length
        : undefined;

    const evidenceIds = new Set(recs.flatMap((r) => r.evidenceIds ?? []));
    const compromises = [
      ...new Set(recs.flatMap((r) => r.compromises ?? [])),
    ].slice(0, 4);

    const relevantFactors: string[] = [];
    if (contextScore != null) {
      relevantFactors.push(
        `Avg context score ${Math.round(contextScore)} across ${recs.length} Recommendation(s)`,
      );
    }
    if (product.recommendationScore != null) {
      relevantFactors.push(
        `Product recommendationScore ${product.recommendationScore}`,
      );
    }
    const cushion = product.specifications.cushionLevel;
    if (cushion) relevantFactors.push(`cushionLevel=${String(cushion)}`);
    const stability = product.specifications.stability;
    if (stability) relevantFactors.push(`stability=${String(stability)}`);

    const reasons: string[] = [
      `Candidate for ${getAwardLabel(input.awardType) ?? input.awardType}`,
    ];
    if (contextScore == null) {
      reasons.push("No matching Recommendation contexts — editorial review required");
    } else if (contextScore >= 85) {
      reasons.push("Strong Recommendation context fit");
    } else if (contextScore >= 70) {
      reasons.push("Moderate Recommendation context fit");
    }

    scored.push({
      productId: product.id,
      productName: product.fullName,
      awardType: input.awardType,
      contextScore,
      relevantFactors,
      evidenceCoverage: evidenceIds.size,
      compromises,
      lowestPrice: input.lowestByProduct?.[product.id],
      reasons,
    });
  }

  return scored
    .sort((a, b) => {
      const sa = a.contextScore ?? (a.relevantFactors.length > 0 ? 50 : 0);
      const sb = b.contextScore ?? (b.relevantFactors.length > 0 ? 50 : 0);
      if (sb !== sa) return sb - sa;
      return b.evidenceCoverage - a.evidenceCoverage;
    })
    .slice(0, limit);
}
