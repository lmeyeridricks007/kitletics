import type { Offer, Retailer } from "@/domain/commerce/types";
import type { RegionCode } from "@/domain/shared/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { getProductBySlug } from "@/repositories/products";
import {
  getOffersForProduct,
  getRetailerById,
} from "@/repositories/commerce";
import {
  pickLowestDisplayableOffer,
  rankOffersForProduct,
} from "@/domain/commerce/ranking";
import {
  getLaunchEligibility,
  shouldRenderPublicly,
} from "@/domain/launch";
import {
  buildProductCommerceResponse,
  commercePriceFromOffer,
  toCommerceOfferDto,
  type CommercePrice,
  type ProductCommerceResponse,
} from "@/lib/product/product-commerce";

function rankOffers(offers: Offer[]): Offer[] {
  const retailersById = new Map<string, Retailer>();
  for (const offer of offers) {
    const retailer = getRetailerById(offer.retailerId);
    if (retailer) retailersById.set(retailer.id, retailer);
  }
  return rankOffersForProduct(offers, retailersById);
}

function toDtos(offers: Offer[], now: Date) {
  return offers.map((offer) =>
    toCommerceOfferDto(offer, getRetailerById(offer.retailerId), now),
  );
}

function peerIdsFor(product: {
  alternativeProductIds: string[];
  relatedProductIds: string[];
}): string[] {
  const ids = new Set<string>();
  for (const id of product.alternativeProductIds) ids.add(id);
  for (const id of product.relatedProductIds) ids.add(id);
  return [...ids];
}

function peerPricesFor(
  ids: string[],
  region: RegionCode,
  now: Date,
): Record<string, CommercePrice | null> {
  const out: Record<string, CommercePrice | null> = {};
  for (const id of ids) {
    const lowest = pickLowestDisplayableOffer(
      getOffersForProduct(id, region),
      now,
      region,
    );
    out[id] = commercePriceFromOffer(lowest);
  }
  return out;
}

/**
 * Commerce-only read path for regional PDP prices.
 * Keep this module off the product page graph and repository barrel.
 */
export function getProductCommerce(
  slug: string,
  region: RegionCode,
  options?: PublishResolverOptions,
): ProductCommerceResponse | undefined {
  const product = getProductBySlug(slug, options);
  if (!product) return undefined;

  const elig = getLaunchEligibility(
    { kind: "product", entity: product },
    options,
  );
  if (!shouldRenderPublicly(elig)) return undefined;

  const now = options?.now ?? new Date();
  const regional = rankOffers(getOffersForProduct(product.id, region));
  const other = rankOffers(
    getOffersForProduct(product.id).filter((offer) => offer.region !== region),
  );
  const lowest = pickLowestDisplayableOffer(regional, now, region);

  return buildProductCommerceResponse({
    productId: product.id,
    slug: product.slug,
    region,
    offers: toDtos(regional, now),
    offersOtherRegions: toDtos(other, now),
    lowestPrice: commercePriceFromOffer(lowest),
    peerPrices: peerPricesFor(peerIdsFor(product), region, now),
  });
}
