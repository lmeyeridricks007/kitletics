import type { Offer, Retailer } from "@/domain/commerce/types";
import type { RegionCode } from "@/domain/shared/types";
import {
  pickLowestDisplayableOffer,
  rankOffersForProduct,
} from "@/domain/commerce/ranking";
import {
  getLaunchEligibility,
  shouldRenderPublicly,
} from "@/domain/launch";
import { getProductById, getProductBySlug } from "@/repositories/products";
import {
  getOffersForProduct,
  getRetailerById,
} from "@/repositories/commerce";
import { buildOfferClickHref } from "@/lib/commerce/offer-click-href";
import { commercePriceFromOffer } from "@/lib/product/product-commerce";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  emptyCatalogPriceMap,
  type CatalogPriceMapResponse,
  type CatalogPriceRow,
} from "@/lib/commerce/catalog-price-dto";

export type { CatalogPriceMapResponse, CatalogPriceRow };
export { emptyCatalogPriceMap, parseCatalogPriceMap } from "@/lib/commerce/catalog-price-dto";

const PUBLISH: PublishResolverOptions = { isDev: false };

function rankOffers(offers: Offer[]): Offer[] {
  const retailersById = new Map<string, Retailer>();
  for (const offer of offers) {
    const retailer = getRetailerById(offer.retailerId);
    if (retailer) retailersById.set(retailer.id, retailer);
  }
  return rankOffersForProduct(offers, retailersById);
}

function rowForProduct(
  productId: string,
  slug: string,
  region: RegionCode,
  now: Date,
): CatalogPriceRow {
  const ranked = rankOffers(getOffersForProduct(productId, region));
  const lowest = pickLowestDisplayableOffer(ranked, now, region);
  const price = commercePriceFromOffer(lowest);
  return {
    lowestPrice: price,
    offerCount: ranked.length,
    bestOfferId: lowest?.id,
    bestGoUrl: lowest
      ? buildOfferClickHref(lowest.id, "category-card")
      : undefined,
  };
}

function isPublicProduct(product: {
  id: string;
  slug: string;
  status: string;
}): boolean {
  const elig = getLaunchEligibility(
    { kind: "product", entity: product as never },
    PUBLISH,
  );
  return shouldRenderPublicly(elig);
}

export function buildCatalogPriceMapFromProductIds(
  productIds: string[],
  region: RegionCode,
  now = new Date(),
): CatalogPriceMapResponse {
  const map = emptyCatalogPriceMap(region);
  const seen = new Set<string>();
  for (const id of productIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const product = getProductById(id, PUBLISH);
    if (!product || !isPublicProduct(product)) continue;
    map.products[product.slug] = rowForProduct(
      product.id,
      product.slug,
      region,
      now,
    );
  }
  return map;
}

export function buildCatalogPriceMapFromSlugs(
  slugs: string[],
  region: RegionCode,
  now = new Date(),
): CatalogPriceMapResponse {
  const map = emptyCatalogPriceMap(region);
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const product = getProductBySlug(slug, PUBLISH);
    if (!product || !isPublicProduct(product)) continue;
    map.products[product.slug] = rowForProduct(
      product.id,
      product.slug,
      region,
      now,
    );
  }
  return map;
}
