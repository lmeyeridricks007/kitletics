import type {
  Offer,
  OfferRankingConfig,
  PriceFreshnessBand,
  ProductPriceSummary,
  Retailer,
} from "@/domain/commerce/types";
import type { RegionCode } from "@/domain/shared/types";
import { REGION_META } from "@/domain/shared/types";

/** Default Offer ranking — commission is intentionally absent */
export const DEFAULT_OFFER_RANKING: OfferRankingConfig = {
  availabilityWeight: 40,
  priceWeight: 35,
  shippingWeight: 10,
  retailerTrustWeight: 10,
  freshnessWeight: 5,
};

export const FRESHNESS_THRESHOLDS_HOURS = {
  fresh: 24,
  recent: 72,
  aging: 168,
} as const;

export function getOfferFreshness(
  lastChecked: string,
  now = new Date(),
  maxAgeHours = FRESHNESS_THRESHOLDS_HOURS,
): PriceFreshnessBand {
  const then = Date.parse(lastChecked);
  if (Number.isNaN(then)) return "stale";
  const hours = (now.getTime() - then) / (1000 * 60 * 60);
  if (hours <= maxAgeHours.fresh) return "fresh";
  if (hours <= maxAgeHours.recent) return "recent";
  if (hours <= maxAgeHours.aging) return "aging";
  return "stale";
}

export function isOfferActive(offer: Offer): boolean {
  if (offer.status === "inactive" || offer.status === "expired") return false;
  if (offer.expiresAt && Date.parse(offer.expiresAt) < Date.now()) return false;
  return true;
}

export function isPurchasableCondition(offer: Offer): boolean {
  const c = offer.condition ?? "new";
  return c === "new" || c === "unknown";
}

function availabilityScore(a: Offer["availability"]): number {
  switch (a) {
    case "in-stock":
      return 100;
    case "low-stock":
      return 85;
    case "preorder":
      return 60;
    case "backorder":
      return 40;
    case "unknown":
      return 50;
    case "out-of-stock":
      return 0;
    default:
      return 30;
  }
}

function retailerTrustScore(retailer?: Retailer): number {
  if (!retailer) return 50;
  switch (retailer.retailerType) {
    case "brand-direct":
      return 90;
    case "specialist-retailer":
      return 85;
    case "general-sports-retailer":
      return 75;
    case "marketplace":
      return 65;
    default:
      return 60;
  }
}

function freshnessScore(band: PriceFreshnessBand): number {
  switch (band) {
    case "fresh":
      return 100;
    case "recent":
      return 80;
    case "aging":
      return 40;
    case "stale":
      return 10;
  }
}

/**
 * Rank Offers for a Product in a region.
 * NEVER accepts or uses commission / affiliate payout data.
 */
export function rankOffersForProduct(
  offers: Offer[],
  retailersById: Map<string, Retailer>,
  config: OfferRankingConfig = DEFAULT_OFFER_RANKING,
  now = new Date(),
): Offer[] {
  const active = offers.filter(
    (o) => isOfferActive(o) && isPurchasableCondition(o),
  );
  if (active.length === 0) return [];

  const prices = active
    .filter((o) => o.availability !== "out-of-stock")
    .map((o) => o.price + (o.shippingCost ?? 0));
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 1;
  const span = Math.max(1, maxPrice - minPrice);

  const scored = active.map((offer) => {
    const retailer = retailersById.get(offer.retailerId);
    const effective = offer.price + (offer.shippingCost ?? 0);
    const priceNorm =
      offer.availability === "out-of-stock"
        ? 0
        : 100 * (1 - (effective - minPrice) / span);
    const band = getOfferFreshness(offer.lastChecked, now);
    const score =
      (availabilityScore(offer.availability) / 100) * config.availabilityWeight +
      (priceNorm / 100) * config.priceWeight +
      ((offer.shippingCost == null ? 70 : offer.shippingCost === 0 ? 100 : 50) /
        100) *
        config.shippingWeight +
      (retailerTrustScore(retailer) / 100) * config.retailerTrustWeight +
      (freshnessScore(band) / 100) * config.freshnessWeight;
    return { offer, score };
  });

  return scored
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.offer.price - b.offer.price;
    })
    .map((s) => s.offer);
}

export function getBestOffer(
  offers: Offer[],
  retailersById: Map<string, Retailer>,
): Offer | undefined {
  return rankOffersForProduct(offers, retailersById)[0];
}

export function shouldDisplayNumericPrice(offer: Offer, now = new Date()): boolean {
  if (!isOfferActive(offer)) return false;
  if (offer.availability === "out-of-stock") return false;
  const band = getOfferFreshness(offer.lastChecked, now);
  return band === "fresh" || band === "recent";
}

export function deriveDiscountPercent(offer: Offer): number | undefined {
  if (offer.originalPrice == null || offer.originalPrice <= offer.price) {
    return undefined;
  }
  return Math.round(
    ((offer.originalPrice - offer.price) / offer.originalPrice) * 100,
  );
}

export function buildPriceSummary(
  offers: Offer[],
  retailersById: Map<string, Retailer>,
  region: RegionCode,
  hasActiveAffiliateProgram: (offer: Offer) => boolean,
): ProductPriceSummary {
  const regional = offers.filter((o) => o.region === region && isOfferActive(o));
  const ranked = rankOffersForProduct(regional, retailersById);
  const best = ranked[0];
  const inStock = regional.filter(
    (o) => o.availability === "in-stock" || o.availability === "low-stock",
  );
  const displayable = best && shouldDisplayNumericPrice(best) ? best : undefined;

  return {
    lowestPrice: displayable?.price,
    currency:
      displayable?.currency ??
      regional[0]?.currency ??
      REGION_META[region].currency,
    offerCount: regional.length,
    inStockCount: inStock.length,
    lastChecked: best?.lastChecked,
    freshness: best ? getOfferFreshness(best.lastChecked) : undefined,
    hasAffiliateOffers: regional.some(hasActiveAffiliateProgram),
    bestOfferId: best?.id,
  };
}
