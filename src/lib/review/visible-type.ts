import type { Review, ReviewType } from "@/domain/editorial/types";
import type { Evidence } from "@/domain/recommendations/types";
import { REVIEW_TYPE_META } from "@/lib/review/review-meta";

export type VisibleReviewType = ReviewType;

/**
 * Visible review-type badge — never show first-hand without personal-test evidence.
 */
export function resolveVisibleReviewType(
  review: Pick<Review, "reviewType">,
  evidence: Evidence[],
): VisibleReviewType {
  const hasPersonalTest = evidence.some((e) => e.type === "personal-test");
  if (
    (review.reviewType === "first-hand-test" ||
      review.reviewType === "hybrid") &&
    !hasPersonalTest
  ) {
    return "expert-research";
  }
  return review.reviewType;
}

export function visibleReviewTypeMeta(type: VisibleReviewType) {
  const meta = REVIEW_TYPE_META[type];
  const eyebrow =
    type === "first-hand-test"
      ? "First-Hand Tested"
      : type === "hybrid"
        ? "Tested + Guide"
        : "Expert Research Review";
  const typeBlockLabel =
    type === "expert-research" ? "How we assessed this product" : eyebrow;
  return { ...meta, eyebrow, typeBlockLabel };
}
