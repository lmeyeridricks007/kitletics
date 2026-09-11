/**
 * Pre-launch 08 — link published Reviews onto Products (product.reviewId)
 * when a review exists for that product and the field is empty.
 * Prefer the review the product already names; else highest-score published review.
 */

import type { Product } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import { reviews as allReviews } from "@/content/reviews";

function pickReviewForProduct(productId: string): Review | undefined {
  const candidates = allReviews.filter(
    (r) =>
      r.productId === productId &&
      r.status === "published" &&
      !r.noindex,
  );
  if (!candidates.length) return undefined;
  return [...candidates].sort(
    (a, b) =>
      (b.score ?? 0) - (a.score ?? 0) || a.slug.localeCompare(b.slug),
  )[0];
}

export function applyReviewProductLinkage(products: Product[]): Product[] {
  return products.map((product) => {
    if (product.reviewId) {
      const linked = allReviews.find((r) => r.id === product.reviewId);
      if (linked && linked.productId === product.id) return product;
      // Broken link — repair when possible
    }
    const review = pickReviewForProduct(product.id);
    if (!review) return product;
    return { ...product, reviewId: review.id };
  });
}
