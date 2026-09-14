import type { Review } from "@/domain/editorial/types";
import { padelFlagshipRacketReviews } from "@/content/padel/reviews/flagships";
import { padelFlagshipShoeReviews } from "@/content/padel/reviews/shoes";
import { padelAccessoryReviews } from "@/content/padel/reviews/accessories";
import { padelSoftDecisionReviews } from "@/content/padel/reviews/soft-decision";

export { isLegacyPadelBackfillReview } from "@/content/padel/reviews/legacy";
export { PADEL_FLAGSHIP_PRODUCT_IDS } from "@/content/padel/reviews/flagships";
export { PADEL_SHOE_REVIEW_PRODUCT_IDS } from "@/content/padel/reviews/shoes";
export { PADEL_ACCESSORY_REVIEW_PRODUCT_IDS } from "@/content/padel/reviews/accessories";
export { PADEL_SOFT_DECISION_REVIEW_PRODUCT_IDS } from "@/content/padel/reviews/soft-decision";

export const padelEstateReviews: Review[] = [
  ...padelFlagshipRacketReviews,
  ...padelFlagshipShoeReviews,
  ...padelAccessoryReviews,
  ...padelSoftDecisionReviews,
];
