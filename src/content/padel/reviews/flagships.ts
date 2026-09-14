import { getPadelRacketDraft } from "@/content/padel/rackets";
import { racketReviewFromDraft } from "@/content/padel/reviews/build-racket-review";
import type { Review } from "@/domain/editorial/types";

const FLAGSHIPS: Array<{
  productId: string;
  reviewId: string;
  comparisonIds?: string[];
}> = [
  {
    productId: "prod-bullpadel-vertex-05",
    reviewId: "review-bullpadel-vertex-05",
    comparisonIds: ["cmp-vertex05-vs-hack04", "cmp-vertex05-vs-at10-12k"],
  },
  {
    productId: "prod-bullpadel-hack-04",
    reviewId: "review-bullpadel-hack-04",
    comparisonIds: ["cmp-vertex05-vs-hack04"],
  },
  {
    productId: "prod-bullpadel-vertex-05-hybrid",
    reviewId: "review-bullpadel-vertex-05-hybrid",
  },
  {
    productId: "prod-bullpadel-indiga-ctr",
    reviewId: "review-bullpadel-indiga-ctr",
  },
  {
    productId: "prod-nox-at10-18k-2026",
    reviewId: "review-nox-at10-18k-2026",
    comparisonIds: ["cmp-vertex05-vs-at10-12k"],
  },
  {
    productId: "prod-nox-at10-12k-2026",
    reviewId: "review-nox-at10-12k-2026",
    comparisonIds: ["cmp-vertex05-vs-at10-12k"],
  },
  {
    productId: "prod-nox-ml10-pro-cup",
    reviewId: "review-nox-ml10-pro-cup",
  },
  {
    productId: "prod-adidas-metalbone-3-5-2026",
    reviewId: "review-adidas-metalbone-3-5-2026",
  },
  {
    productId: "prod-head-coello-pro",
    reviewId: "review-head-coello-pro",
  },
  {
    productId: "prod-head-gravity-pro",
    reviewId: "review-head-gravity-pro",
  },
  {
    productId: "prod-babolat-technical-viper",
    reviewId: "review-babolat-technical-viper",
  },
  {
    productId: "prod-kuikma-pr-comfort-soft",
    reviewId: "review-kuikma-pr-comfort-soft",
  },
];

export const PADEL_FLAGSHIP_PRODUCT_IDS = FLAGSHIPS.map((f) => f.productId);

export const padelFlagshipRacketReviews: Review[] = FLAGSHIPS.map((row) => {
  const draft = getPadelRacketDraft(row.productId);
  if (!draft) {
    throw new Error(`Missing padel racket draft for ${row.productId}`);
  }
  return racketReviewFromDraft({
    draft,
    reviewId: row.reviewId,
    comparisonIds: row.comparisonIds,
  });
});
