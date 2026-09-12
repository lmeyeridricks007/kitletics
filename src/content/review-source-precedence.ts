/**
 * Explicit review-source precedence.
 *
 * Catalog merge must never treat array order as business logic.
 * Uniqueness overlays (P53/P54 token generation) cannot override
 * handwritten or validated genuine rewrites simply by appearing first.
 *
 * Rank (highest wins among uncorrupted candidates):
 *  1. handwritten — curated / flagship / wave / inline editorial
 *  2. genuine_rewrite — validated replacement overlays (e.g. P62)
 *  3. generated_research — acceptable unique-research rewrite (if clean)
 *  4. uniqueness_overlay — P53/P54 uniqueness generation (legacy fallback)
 */

import type { Review } from "@/domain/editorial/types";
import { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";
import { isUnusablePublicEditorial } from "@/lib/review/consumer-copy-quality";
import { sanitizePublicReview } from "@/lib/review/rewrite-uniqueness-era-skip";

export const REVIEW_SOURCE_KIND = {
  HANDWRITTEN: "handwritten",
  GENUINE_REWRITE: "genuine_rewrite",
  EDITORIAL_REBUILD: "editorial_rebuild",
  GENERATED_RESEARCH: "generated_research",
  UNIQUENESS_OVERLAY: "uniqueness_overlay",
} as const;

export type ReviewSourceKind =
  (typeof REVIEW_SOURCE_KIND)[keyof typeof REVIEW_SOURCE_KIND];

export const REVIEW_SOURCE_RANK: Record<ReviewSourceKind, number> = {
  handwritten: 40,
  genuine_rewrite: 30,
  editorial_rebuild: 25,
  generated_research: 20,
  uniqueness_overlay: 10,
};

export type ReviewCorruptionClass = "A" | "B" | "C" | "D";

export type RankedReviewCandidate = {
  review: Review;
  source: ReviewSourceKind;
};

export type ReviewMergeDecision = {
  review: Review;
  source: ReviewSourceKind;
  classification: ReviewCorruptionClass;
  corrupted: boolean;
  candidateSources: ReviewSourceKind[];
};

function wordCount(review: Review): number {
  const text = [
    review.summary,
    review.verdict,
    review.bottomLine,
    review.testingContext,
    ...(review.pros ?? []),
    ...(review.cons ?? []),
    ...(review.whoShouldBuy ?? []),
    ...(review.whoShouldAvoid ?? []),
    ...(review.sections ?? []).map((s) => s.body),
  ]
    .filter(Boolean)
    .join(" ");
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function compareCandidates(
  a: RankedReviewCandidate,
  b: RankedReviewCandidate,
): number {
  const rankDelta =
    REVIEW_SOURCE_RANK[b.source] - REVIEW_SOURCE_RANK[a.source];
  if (rankDelta !== 0) return rankDelta;
  const words = wordCount(b.review) - wordCount(a.review);
  if (words !== 0) return words;
  const aUpdated = a.review.updatedAt ?? "";
  const bUpdated = b.review.updatedAt ?? "";
  return bUpdated.localeCompare(aUpdated);
}

function classifyWinner(
  winner: RankedReviewCandidate,
  candidates: RankedReviewCandidate[],
  winnerCorrupted: boolean,
): ReviewCorruptionClass {
  const status = winner.review.status;
  if (status === "draft" || status === "scheduled" || status === "archived") {
    return "D";
  }
  if (winner.review.noindex) return "D";

  const clean = candidates.filter((c) => !isUnusablePublicEditorial(c.review));
  if (!winnerCorrupted) {
    const hadCorruptOverlay = candidates.some(
      (c) =>
        c.source === "uniqueness_overlay" &&
        containsPublicContentCorruption(c.review),
    );
    if (!hadCorruptOverlay) return "A";
    if (
      winner.source === "handwritten" ||
      winner.source === "genuine_rewrite"
    ) {
      return "A";
    }
    if (winner.source === "generated_research") return "B";
    return "A";
  }

  if (clean.length > 0) {
    return clean.some(
      (c) =>
        c.source === "handwritten" || c.source === "genuine_rewrite",
    )
      ? "A"
      : "B";
  }
  return "C";
}

export function selectWinnerForSlug(
  candidates: RankedReviewCandidate[],
): ReviewMergeDecision {
  if (candidates.length === 0) {
    throw new Error("selectWinnerForSlug requires at least one candidate");
  }
  const sorted = [...candidates].sort(compareCandidates);
  const clean = sorted.filter((c) => !isUnusablePublicEditorial(c.review));
  const winner = clean[0] ?? sorted[0]!;
  const corrupted = isUnusablePublicEditorial(winner.review);
  return {
    review: sanitizePublicReview(winner.review),
    source: winner.source,
    corrupted,
    classification: classifyWinner(winner, candidates, corrupted),
    candidateSources: [...new Set(candidates.map((c) => c.source))],
  };
}

/**
 * First-wins (legacy) — used only to measure pre-remediation winners.
 */
export function selectFirstWinsBySlug(
  candidates: RankedReviewCandidate[],
): RankedReviewCandidate[] {
  const seen = new Set<string>();
  const out: RankedReviewCandidate[] = [];
  for (const candidate of candidates) {
    if (seen.has(candidate.review.slug)) continue;
    seen.add(candidate.review.slug);
    out.push(candidate);
  }
  return out;
}

function collapsePublishedByProductId(
  decisions: ReviewMergeDecision[],
): ReviewMergeDecision[] {
  const byProduct = new Map<string, ReviewMergeDecision[]>();
  const passthrough: ReviewMergeDecision[] = [];
  for (const decision of decisions) {
    if (decision.review.status !== "published") {
      passthrough.push(decision);
      continue;
    }
    const list = byProduct.get(decision.review.productId) ?? [];
    list.push(decision);
    byProduct.set(decision.review.productId, list);
  }

  const collapsed: ReviewMergeDecision[] = [...passthrough];
  for (const group of byProduct.values()) {
    if (group.length === 1) {
      collapsed.push(group[0]!);
      continue;
    }
    const ranked = [...group].sort((a, b) => {
      if (a.corrupted !== b.corrupted) return a.corrupted ? 1 : -1;
      return compareCandidates(
        { review: a.review, source: a.source },
        { review: b.review, source: b.source },
      );
    });
    collapsed.push(ranked[0]!);
  }
  return collapsed;
}

export function selectWinningReviews(
  candidates: RankedReviewCandidate[],
): Review[] {
  return selectWinningReviewDecisions(candidates).map((d) => d.review);
}

export function selectWinningReviewDecisions(
  candidates: RankedReviewCandidate[],
): ReviewMergeDecision[] {
  const bySlug = new Map<string, RankedReviewCandidate[]>();
  for (const candidate of candidates) {
    const list = bySlug.get(candidate.review.slug) ?? [];
    list.push(candidate);
    bySlug.set(candidate.review.slug, list);
  }
  const decisions = [...bySlug.values()].map(selectWinnerForSlug);
  return collapsePublishedByProductId(decisions);
}
