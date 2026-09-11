/**
 * Fix 70 — strip review alternative IDs that are unpublished or not substitutes.
 */
import type { Product } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import { scoreReviewAlternative } from "@/lib/decision-graph/semantic-quality";

export function sanitizeReviewAlternativeIds(
  review: Review,
  productsById: Map<string, Product>,
): string[] {
  const source = productsById.get(review.productId);
  const ids = review.alternativeProductIds ?? [];
  const text = [
    review.verdict,
    review.summary,
    ...(review.cons ?? []),
    ...(review.whoShouldAvoid ?? []),
  ].join(" ");

  return ids.filter((id) => {
    if (!id || id === review.productId) return false;
    const target = productsById.get(id);
    if (!target || target.status !== "published" || target.noindex) return false;
    if (!source) return true;
    return scoreReviewAlternative(source, target, text).cls !== "INVALID";
  });
}

export function applySanitizedReviewAlternatives(
  review: Review,
  productsById: Map<string, Product>,
): Review {
  const next = sanitizeReviewAlternativeIds(review, productsById);
  const prev = review.alternativeProductIds ?? [];
  if (next.length === prev.length && next.every((id, i) => id === prev[i])) {
    return review;
  }
  return { ...review, alternativeProductIds: next };
}
