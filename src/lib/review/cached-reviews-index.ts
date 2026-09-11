import { unstable_cache } from "next/cache";
import {
  getReviewsIndexData,
  type ReviewGenderFilter,
} from "@/lib/review/get-review-page-data";
import type { ReviewType } from "@/domain/editorial/types";

type HubOpts = {
  typeFilter?: ReviewType | "all";
  sportSlug?: string;
  categoryIds?: string[];
  categorySlug?: string;
  brandSlug?: string;
  gender?: ReviewGenderFilter;
  shoeType?: string;
  maxPerCategory?: number;
};

/**
 * Cross-request cache for the reviews hub. Eligibility walks are expensive;
 * avoid recomputing on every TTFB-sensitive request.
 */
export function getCachedReviewsIndexData(options: HubOpts = {}) {
  const key = JSON.stringify({
    typeFilter: options.typeFilter ?? "all",
    sportSlug: options.sportSlug ?? "",
    categoryIds: options.categoryIds ?? [],
    categorySlug: options.categorySlug ?? "",
    brandSlug: options.brandSlug ?? "",
    gender: options.gender ?? "",
    shoeType: options.shoeType ?? "",
    maxPerCategory: options.maxPerCategory ?? null,
  });

  return unstable_cache(
    async () => getReviewsIndexData(options),
    ["reviews-index", key],
    { revalidate: 3600 },
  )();
}
