/**
 * Map commerce OfferClickPlacement → GA placement taxonomy.
 */

import type { OfferClickPlacement } from "@/domain/commerce/types";
import type { AnalyticsPlacement } from "./types";

const MAP: Record<OfferClickPlacement, AnalyticsPlacement> = {
  "product-hero": "product_primary_offer",
  "product-offers": "product_offer_list",
  review: "review_offer",
  "best-guide": "best_guide_product",
  comparison: "comparison_offer",
  alternatives: "alternatives_offer",
  "finder-results": "finder_result",
  "rotation-planner": "rotation_planner",
  search: "search",
  "category-card": "category_card",
  setup: "setup",
  other: "other",
};

export function mapOfferPlacement(
  placement: OfferClickPlacement | string | null | undefined,
): AnalyticsPlacement {
  if (!placement) return "other";
  if (placement in MAP) return MAP[placement as OfferClickPlacement];
  return "other";
}
