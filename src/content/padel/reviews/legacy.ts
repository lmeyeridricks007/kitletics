import type { Review } from "@/domain/editorial/types";
import { padelRacketDrafts } from "@/content/padel/rackets";
import { PADEL_FLAGSHIP_PRODUCT_IDS } from "@/content/padel/reviews/flagships";
import { PADEL_SHOE_REVIEW_PRODUCT_IDS } from "@/content/padel/reviews/shoes";
import { PADEL_ACCESSORY_REVIEW_PRODUCT_IDS } from "@/content/padel/reviews/accessories";
import { PADEL_SOFT_DECISION_REVIEW_PRODUCT_IDS } from "@/content/padel/reviews/soft-decision";

const PADEL_CATALOG_IDS = new Set<string>([
  ...padelRacketDrafts.map((d) => d.id),
  ...PADEL_FLAGSHIP_PRODUCT_IDS,
  ...PADEL_SHOE_REVIEW_PRODUCT_IDS,
  ...PADEL_ACCESSORY_REVIEW_PRODUCT_IDS,
  ...PADEL_SOFT_DECISION_REVIEW_PRODUCT_IDS,
  "prod-adidas-courtstabil",
  "prod-adidas-courtquick-w",
  "prod-adidas-crazyquick-boost-m",
  "prod-adidas-crazyquick-boost-w",
  "prod-asics-gel-resolution-padel",
  "prod-asics-gel-resolution-padel-w",
  "prod-asics-game-ff-padel",
  "prod-asics-gel-dedicate-8-padel",
  "prod-asics-solution-swift-ff2-padel",
  "prod-asics-gel-challenger-court",
  "prod-babolat-jet-premura",
  "prod-babolat-movea-2",
  "prod-babolat-sensa-women",
  "prod-bullpadel-ionic-woman",
  "prod-bullpadel-hybrid-fly",
  "prod-head-sprint-pro-4-padel",
  "prod-head-extreme-pro-padel",
  "prod-joma-t-slam",
  "prod-joma-slam-lady",
  "prod-joma-spin-men",
  "prod-joma-spin-lady",
  "prod-kuikma-ps-990",
  "prod-kuikma-pr-soft-500",
  "prod-nox-at10-lux",
  "prod-nox-ml10-hexa",
  "prod-wilson-rush-pro-5-padel",
  "prod-wilson-overgrip",
  "prod-siux-diablo",
  "prod-head-revolt-pro-court",
]);

/**
 * Uniqueness-era / generated padel rows in reviews-backfill.
 * Do not treat as handwritten. Quarantine from winning until rewritten.
 */
export function isLegacyPadelBackfillReview(review: Review): boolean {
  if (PADEL_CATALOG_IDS.has(review.productId)) return true;
  const hay = `${review.slug} ${review.title} ${review.productId}`;
  if (/padel/i.test(hay)) return true;
  if (
    /bullpadel|starvie|kuikma|royal-padel|head-coello|head-gravity|head-revolt-pro-court|technical-viper|counter-viper|air-viper|metalbone|indiga/i.test(
      hay,
    )
  ) {
    return true;
  }
  return false;
}
