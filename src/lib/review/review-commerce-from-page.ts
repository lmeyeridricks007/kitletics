import { DEFAULT_REGION } from "@/domain/shared/types";
import type { ReviewPageData } from "@/lib/review/get-review-page-data";
import {
  buildProductCommerceResponse,
  toCommerceOfferDto,
  type ProductCommerceResponse,
} from "@/lib/product/product-commerce";

/**
 * Map ISR NL ReviewPageData into the product commerce island DTO.
 * Reviews reuse GET /api/products/[slug]/commerce/[region] — this mapper is
 * only for the review server render, not for the commerce API.
 */
export function reviewPageDataToCommerce(
  data: ReviewPageData,
): ProductCommerceResponse {
  const now = new Date();
  return buildProductCommerceResponse({
    productId: data.product.id,
    slug: data.product.slug,
    region: DEFAULT_REGION,
    offers: data.offers.map((row) =>
      toCommerceOfferDto(row.offer, row.retailer, now),
    ),
    offersOtherRegions: data.offersOtherRegions.map((row) =>
      toCommerceOfferDto(row.offer, row.retailer, now),
    ),
    lowestPrice: data.lowestPrice
      ? {
          amount: data.lowestPrice.price,
          currency: data.lowestPrice.currency,
        }
      : null,
    peerPrices: {},
  });
}
