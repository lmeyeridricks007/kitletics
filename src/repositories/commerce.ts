import { retailers as rawRetailers } from "@/content/retailers";
import { offers as rawOffers } from "@/content/offers";
import {
  OFFER_PRICE_PATCHES,
  NEW_PRICING_OFFERS,
} from "@/content/offers-pricing-refresh";
import { PRODUCT_AFFILIATE_URLS } from "@/content/offers-affiliate-urls";
import {
  affiliatePrograms as rawPrograms,
  affiliateNetworks as rawNetworks,
  retailerStorefronts as rawStorefronts,
} from "@/content/affiliate-programs";
import type {
  AffiliateProgram,
  Offer,
  OfferClickPlacement,
  ProductPriceSummary,
  ResolvedCommercialUrl,
  Retailer,
} from "@/domain/commerce/types";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import {
  buildPriceSummary,
  getBestOffer as rankBest,
  isOfferActive,
  rankOffersForProduct,
} from "@/domain/commerce/ranking";
import {
  hostAllowed,
  resolveCommercialUrl,
} from "@/domain/commerce/affiliates";
import { isOfferUrlDisplayable } from "@/domain/commerce/offer-url-validation";
import { OFFER_URL_VALIDATION } from "@/content/offers-url-validation";
import { buildOfferClickHref as buildOfferClickHrefClient } from "@/lib/commerce/offer-click-href";
import { SEED_DATES } from "@/content/config";

const retailersById = new Map(rawRetailers.map((r) => [r.id, r]));

const AMAZON_HOMEPAGE_URL =
  /^https:\/\/(www\.)?amazon\.(nl|de|com|co\.uk)\/?$/i;

const AMAZON_RETAILER_BY_REGION: Record<
  "NL" | "DE" | "UK" | "US",
  { retailerId: string; currency: "EUR" | "GBP" | "USD"; homepage: string }
> = {
  NL: {
    retailerId: "ret-amazon-nl",
    currency: "EUR",
    homepage: "https://www.amazon.nl/",
  },
  DE: {
    retailerId: "ret-amazon-de",
    currency: "EUR",
    homepage: "https://www.amazon.de/",
  },
  UK: {
    retailerId: "ret-amazon-uk",
    currency: "GBP",
    homepage: "https://www.amazon.co.uk/",
  },
  US: {
    retailerId: "ret-amazon-us",
    currency: "USD",
    homepage: "https://www.amazon.com/",
  },
};

function isAmazonRetailerId(retailerId: string): boolean {
  return retailerId.startsWith("ret-amazon");
}

function applyAffiliateUrl(offer: Offer): Offer {
  const affiliateUrl = PRODUCT_AFFILIATE_URLS[offer.productId];
  if (!affiliateUrl || !isAmazonRetailerId(offer.retailerId)) return offer;

  const next: Offer = {
    ...offer,
    affiliateUrl,
  };
  // Homepage-only seeds → use the short affiliate link as the stored URL too
  if (AMAZON_HOMEPAGE_URL.test(offer.url)) {
    next.url = affiliateUrl;
  }
  return next;
}

function applyUrlValidation(offer: Offer): Offer {
  const v = OFFER_URL_VALIDATION[offer.id];
  if (!v) return offer;
  return {
    ...offer,
    urlValidationState: v.state,
    urlValidationCheckedAt: v.checkedAt,
    urlValidationHttpStatus: v.httpStatus,
    urlValidationRedirectUrl: v.redirectUrl,
    urlValidationFailureReason: v.failureReason,
  };
}

function isDisplayableOffer(offer: Offer): boolean {
  return (
    isOfferActive(offer) && isOfferUrlDisplayable(offer.urlValidationState)
  );
}

/** Seed Amazon NL offers for products that have amzn.to but no Amazon offer yet. */
function buildAffiliateOnlyOffers(
  existing: Map<string, Offer>,
): Offer[] {
  const productsWithAmazon = new Set<string>();
  for (const offer of existing.values()) {
    if (isAmazonRetailerId(offer.retailerId)) {
      productsWithAmazon.add(offer.productId);
    }
  }

  const created: Offer[] = [];
  const checked = SEED_DATES.verified;
  for (const [productId, affiliateUrl] of Object.entries(
    PRODUCT_AFFILIATE_URLS,
  )) {
    if (productsWithAmazon.has(productId)) continue;
    const region = "NL" as const;
    const store = AMAZON_RETAILER_BY_REGION[region];
    const id = `offer-${productId.replace(/^prod-/, "")}-nl-amzn-aff`;
    if (existing.has(id)) continue;
    const sibling = [...existing.values()].find(
      (o) => o.productId === productId && o.price > 0,
    );
    created.push({
      id,
      productId,
      retailerId: store.retailerId,
      region,
      url: affiliateUrl,
      affiliateUrl,
      currency: sibling?.currency ?? store.currency,
      price: sibling?.price ?? 0,
      originalPrice: sibling?.originalPrice,
      availability: sibling?.availability ?? "unknown",
      lastChecked: checked,
      source: "manual",
      condition: "new",
      status: "active",
    });
  }
  return created;
}

/** Seed offers + pricing-agent patches + affiliate URLs + newly discovered offers + URL validation */
function materializeOffers(): Offer[] {
  const byId = new Map<string, Offer>();
  for (const offer of rawOffers) {
    const patch = OFFER_PRICE_PATCHES[offer.id];
    const merged = patch
      ? {
          ...offer,
          ...patch,
          id: offer.id,
          productId: offer.productId,
          retailerId: offer.retailerId,
          region: offer.region,
        }
      : offer;
    byId.set(offer.id, applyUrlValidation(applyAffiliateUrl(merged)));
  }
  for (const offer of NEW_PRICING_OFFERS) {
    if (!byId.has(offer.id)) {
      byId.set(offer.id, applyUrlValidation(applyAffiliateUrl(offer)));
    }
  }
  for (const offer of buildAffiliateOnlyOffers(byId)) {
    byId.set(offer.id, applyUrlValidation(offer));
  }
  return [...byId.values()];
}

const materializedOffers = materializeOffers();

export function getRetailers(): Retailer[] {
  return [...rawRetailers];
}

export function getRetailerById(id: string): Retailer | undefined {
  return retailersById.get(id);
}

export function getRetailerBySlug(slug: string): Retailer | undefined {
  return rawRetailers.find((r) => r.slug === slug);
}

export function getOffers(): Offer[] {
  return [...materializedOffers];
}

export function getOfferById(id: string): Offer | undefined {
  return materializedOffers.find((o) => o.id === id);
}

export function getActiveOffers(): Offer[] {
  return materializedOffers.filter(isDisplayableOffer);
}

export function getOffersForProduct(
  productId: string,
  region?: RegionCode,
): Offer[] {
  return materializedOffers.filter(
    (o) =>
      isDisplayableOffer(o) &&
      o.productId === productId &&
      (region === undefined || o.region === region),
  );
}

export function getOffersForProductInRegion(
  productId: string,
  region: RegionCode = DEFAULT_REGION,
): Offer[] {
  return getOffersForProduct(productId, region);
}

export function getOffersByRegion(region: RegionCode): Offer[] {
  return materializedOffers.filter(
    (o) => o.region === region && isDisplayableOffer(o),
  );
}

export function getRankedOffersForProduct(
  productId: string,
  region: RegionCode = DEFAULT_REGION,
): Offer[] {
  return rankOffersForProduct(
    getOffersForProduct(productId, region),
    retailersById,
  );
}

export function getBestOffer(
  productId: string,
  region: RegionCode = DEFAULT_REGION,
): Offer | undefined {
  return rankBest(getOffersForProduct(productId, region), retailersById);
}

export function getAffiliatePrograms(): AffiliateProgram[] {
  return [...rawPrograms];
}

export function getActiveAffiliatePrograms(): AffiliateProgram[] {
  return rawPrograms.filter((p) => p.status === "active");
}

export function getAffiliateProgramForOffer(
  offer: Offer,
): AffiliateProgram | undefined {
  return rawPrograms.find(
    (p) =>
      p.retailerId === offer.retailerId &&
      p.regionIds.includes(offer.region) &&
      p.status === "active",
  );
}

export function getAffiliateProgramForRetailerRegion(
  retailerId: string,
  region: RegionCode,
): AffiliateProgram | undefined {
  return rawPrograms.find(
    (p) =>
      p.retailerId === retailerId &&
      p.regionIds.includes(region) &&
      (p.status === "active" || p.status === "pending"),
  );
}

function readTrackingId(envKey?: string): string | undefined {
  if (!envKey) return undefined;
  const value = process.env[envKey];
  if (!value || value.trim() === "" || value.includes("PLACEHOLDER")) {
    return undefined;
  }
  return value.trim();
}

/**
 * Resolve outbound commercial URL for an Offer.
 * Uses affiliate only when program is active AND credentials exist.
 */
export function resolveOfferDestination(
  offerId: string,
):
  | { ok: true; resolved: ResolvedCommercialUrl; offer: Offer; retailer: Retailer }
  | { ok: false; reason: string } {
  const offer = getOfferById(offerId);
  if (!offer) return { ok: false, reason: "offer_not_found" };
  if (!isOfferActive(offer)) return { ok: false, reason: "offer_inactive" };
  if (!isOfferUrlDisplayable(offer.urlValidationState)) {
    return { ok: false, reason: "offer_url_invalid" };
  }

  const retailer = getRetailerById(offer.retailerId);
  if (!retailer || retailer.status === "inactive") {
    return { ok: false, reason: "retailer_inactive" };
  }

  const program = getAffiliateProgramForOffer(offer);
  const trackingId = readTrackingId(program?.trackingIdEnvKey);

  // Pending programs without credentials → passthrough
  const activeProgram =
    program?.status === "active" && trackingId ? program : undefined;

  const resolved = resolveCommercialUrl({
    offer,
    retailer,
    program: activeProgram,
    trackingId,
  });

  if (!hostAllowed(resolved.destinationUrl, retailer)) {
    // Fall back to retailer homepage URL path from offer if host mismatch
    if (!hostAllowed(offer.url, retailer)) {
      return { ok: false, reason: "domain_not_allowed" };
    }
    return {
      ok: true,
      offer,
      retailer,
      resolved: {
        destinationUrl: offer.url,
        isAffiliate: false,
        retailerId: retailer.id,
        offerId: offer.id,
      },
    };
  }

  return { ok: true, resolved, offer, retailer };
}

export function buildOfferClickHref(
  offerId: string,
  placement: OfferClickPlacement = "product-offers",
  pageType?: string,
): string {
  return buildOfferClickHrefClient(offerId, placement, pageType);
}

export function getProductPriceSummary(
  productId: string,
  region: RegionCode = DEFAULT_REGION,
): ProductPriceSummary {
  return buildPriceSummary(
    getOffersForProduct(productId, region),
    retailersById,
    region,
    (offer) => Boolean(getAffiliateProgramForOffer(offer)),
  );
}

export function getPriceSummaries(
  productIds: string[],
  region: RegionCode = DEFAULT_REGION,
): Record<string, ProductPriceSummary> {
  const out: Record<string, ProductPriceSummary> = {};
  for (const id of productIds) {
    out[id] = getProductPriceSummary(id, region);
  }
  return out;
}

export {
  rawNetworks as affiliateNetworks,
  rawStorefronts as retailerStorefronts,
};
