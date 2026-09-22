import type { ProductPageData } from "@/lib/product/get-product-page-data";
import {
  buildProductCommerceResponse,
  toCommerceOfferDto,
  type CommercePrice,
  type ProductCommerceResponse,
} from "@/lib/product/product-commerce";

/**
 * Map ISR NL ProductPageData into the island DTO.
 * Used only by the PDP server render — not by the commerce API.
 */
export function productPageDataToCommerce(
  data: ProductPageData,
  peerPrices: Record<string, CommercePrice | null>,
): ProductCommerceResponse {
  const now = new Date();
  return buildProductCommerceResponse({
    productId: data.product.id,
    slug: data.product.slug,
    region: data.region,
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
    peerPrices,
  });
}
