import type { Offer, OfferAvailability, Retailer, RetailerType } from "@/domain/commerce/types";
import type { RegionCode } from "@/domain/shared/types";
import { REGION_META } from "@/domain/shared/types";
import { shouldDisplayNumericPrice } from "@/domain/commerce/ranking";
import { buildOfferClickHref } from "@/lib/commerce/offer-click-href";
import {
  regionCommerceCoverage,
  type RegionCommerceCoverage,
} from "@/lib/region/commerce-readiness";
import { isOfferStale } from "@/lib/product/score";

export type CommercePrice = {
  amount: number;
  currency: string;
  offerId?: string;
};

export type ProductCommerceOfferDto = {
  id: string;
  retailerId: string;
  retailerName: string;
  retailerType?: RetailerType;
  region: RegionCode;
  price: number;
  currency: string;
  availability: OfferAvailability;
  shipping?: string;
  lastChecked: string;
  stale: boolean;
  displayPrice: boolean;
  goUrl: string;
};

export type ProductCommerceResponse = {
  productId: string;
  slug: string;
  region: RegionCode;
  regionLabel: string;
  currency: string;
  coverage: RegionCommerceCoverage;
  lowestPrice: CommercePrice | null;
  offers: ProductCommerceOfferDto[];
  offersOtherRegions: ProductCommerceOfferDto[];
  peerPrices: Record<string, CommercePrice | null>;
  pricesCheckedAt: string | null;
};

export const COMMERCE_CACHE_CONTROL =
  "public, s-maxage=3600, stale-while-revalidate=82800";
export const COMMERCE_NO_STORE = "private, no-store, max-age=0";
export const COMMERCE_ROBOTS = "noindex, nofollow";

export function toCommerceOfferDto(
  offer: Offer,
  retailer: Retailer | undefined,
  now = new Date(),
): ProductCommerceOfferDto {
  const stale = isOfferStale(offer.lastChecked, now);
  return {
    id: offer.id,
    retailerId: offer.retailerId,
    retailerName: retailer?.name ?? "Retailer",
    retailerType: retailer?.retailerType,
    region: offer.region,
    price: offer.price,
    currency: offer.currency,
    availability: offer.availability,
    shipping: offer.shipping,
    lastChecked: offer.lastChecked,
    stale,
    displayPrice: shouldDisplayNumericPrice(offer, now) && !stale,
    goUrl: buildOfferClickHref(offer.id, "product-offers"),
  };
}

export function isAmazonCommerceOffer(offer: ProductCommerceOfferDto): boolean {
  return /amazon/i.test(`${offer.retailerId} ${offer.retailerName}`);
}

export function commercePriceFromOffer(
  offer: Offer | undefined,
): CommercePrice | null {
  if (!offer) return null;
  return {
    amount: offer.price,
    currency: offer.currency,
    offerId: offer.id,
  };
}

export function buildProductCommerceResponse(input: {
  productId: string;
  slug: string;
  region: RegionCode;
  offers: ProductCommerceOfferDto[];
  offersOtherRegions: ProductCommerceOfferDto[];
  lowestPrice: CommercePrice | null;
  peerPrices: Record<string, CommercePrice | null>;
}): ProductCommerceResponse {
  const meta = REGION_META[input.region];
  return {
    productId: input.productId,
    slug: input.slug,
    region: input.region,
    regionLabel: meta.label,
    currency: meta.currency,
    coverage: regionCommerceCoverage(input.region),
    lowestPrice: input.lowestPrice,
    offers: input.offers,
    offersOtherRegions: input.offersOtherRegions,
    peerPrices: input.peerPrices,
    pricesCheckedAt: input.offers[0]?.lastChecked ?? null,
  };
}

const FORBIDDEN_COMMERCE_JSON_KEYS = [
  "affiliateUrl",
  "trackingTemplate",
  "trackingIdEnvKey",
  "reviewBody",
  "specifications",
  "faqs",
  "evidence",
  "recommendations",
] as const;

export function commercePayloadLooksSafe(payload: unknown): boolean {
  const json = JSON.stringify(payload);
  return FORBIDDEN_COMMERCE_JSON_KEYS.every((key) => !json.includes(`"${key}"`));
}
