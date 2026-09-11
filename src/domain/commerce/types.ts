import type { EntityId, RegionCode } from "@/domain/shared/types";

/** Controlled retailer classification — not a ranking signal */
export type RetailerType =
  | "marketplace"
  | "specialist-retailer"
  | "general-sports-retailer"
  | "brand-direct"
  | "department-store"
  | "other";

export type AffiliateNetworkId =
  | "amazon"
  | "awin"
  | "impact"
  | "cj"
  | "rakuten"
  | "tradedoubler"
  | "partnerize"
  | "direct"
  | "other";

/** @deprecated Prefer AffiliateNetworkId — kept for seed compatibility */
export type AffiliateNetwork = AffiliateNetworkId;

export type AffiliateProgramStatus =
  | "active"
  | "pending"
  | "inactive"
  | "rejected"
  | "expired";

export type RetailerStatus = "active" | "inactive" | "pending";

export type OfferAvailability =
  | "in-stock"
  | "low-stock"
  | "out-of-stock"
  | "preorder"
  | "backorder"
  | "unknown";

export type OfferCondition = "new" | "refurbished" | "used" | "unknown";

export type OfferStatus = "active" | "inactive" | "expired";

export type OfferSource =
  | "api"
  | "affiliate-feed"
  | "merchant-feed"
  | "manual"
  | "seed";

export type OfferClickPlacement =
  | "product-hero"
  | "product-offers"
  | "best-guide"
  | "review"
  | "comparison"
  | "alternatives"
  | "finder-results"
  | "rotation-planner"
  | "search"
  | "category-card"
  | "setup"
  | "other";

export type PriceFreshnessBand = "fresh" | "recent" | "aging" | "stale";

export interface Retailer {
  id: EntityId;
  name: string;
  slug: string;
  legalName?: string;
  logo?: string;
  /** Homepage / primary domain */
  homepage: string;
  regions: RegionCode[];
  currencies?: string[];
  retailerType?: RetailerType;
  /** Network hint for display — actual programs live in AffiliateProgram */
  affiliateNetwork?: AffiliateNetworkId;
  shippingRegions?: RegionCode[];
  status?: RetailerStatus;
  /** Allowed outbound hostnames for redirect allowlist */
  allowedHosts?: string[];
  createdAt?: string;
  updatedAt?: string;
  lastVerifiedAt?: string;
}

export interface RetailerStorefront {
  id: EntityId;
  retailerId: EntityId;
  regionId: RegionCode;
  domain: string;
  currency: string;
  affiliateProgramId?: EntityId;
  status: RetailerStatus;
}

export interface AffiliateNetworkEntity {
  id: AffiliateNetworkId;
  name: string;
  website?: string;
  trackingMethod: "tag" | "deep-link" | "redirect" | "direct";
  supportedRegions: RegionCode[];
  status: AffiliateProgramStatus;
}

/**
 * Regional affiliate program configuration.
 * Secrets live in env vars named by trackingIdEnvKey — never in content.
 */
export interface AffiliateProgram {
  id: EntityId;
  retailerId: EntityId;
  networkId: AffiliateNetworkId;
  regionIds: RegionCode[];
  status: AffiliateProgramStatus;
  /** Optional URL template with {{url}} or {{asin}} placeholders */
  trackingTemplate?: string;
  deepLinkMode?: "passthrough" | "template" | "provider";
  /** Name of env var holding tag/publisher ID — never the secret itself */
  trackingIdEnvKey?: string;
  disclosureRequired: boolean;
  createdAt: string;
  updatedAt: string;
  lastVerifiedAt?: string;
}

export interface Offer {
  id: EntityId;
  productId: EntityId;
  variantId?: EntityId;
  retailerId: EntityId;
  region: RegionCode;
  /** Canonical retailer product URL (never mutated for affiliate) */
  url: string;
  /**
   * Optional pre-resolved affiliate URL — prefer resolver at /go.
   * Do not guess affiliate params.
   */
  affiliateUrl?: string;
  currency: string;
  price: number;
  /** Retailer-stated was/now price — not Product MSRP */
  originalPrice?: number;
  availability: OfferAvailability;
  condition?: OfferCondition;
  shipping?: string;
  shippingCost?: number;
  sellerName?: string;
  status?: OfferStatus;
  source?: OfferSource;
  evidenceId?: EntityId;
  /** External listing IDs (ASIN, merchant SKU) — not Kitletics Product IDs */
  externalIds?: {
    asin?: string;
    gtin?: string;
    sku?: string;
  };
  lastChecked: string;
  expiresAt?: string;
  /**
   * URL reachability validation (optional overlay).
   * INVALID offers must not appear in CTAs; bot-blocked → LIKELY_VALID.
   */
  urlValidationState?:
    | "VALID"
    | "LIKELY_VALID"
    | "UNKNOWN"
    | "INVALID";
  urlValidationCheckedAt?: string;
  urlValidationHttpStatus?: number;
  urlValidationRedirectUrl?: string;
  urlValidationFailureReason?: string;
}

export interface CommercialClickEvent {
  type: "offer_click";
  timestamp: string;
  offerId: EntityId;
  productId: EntityId;
  retailerId: EntityId;
  region: RegionCode;
  pageType?: string;
  pageId?: string;
  placement: OfferClickPlacement;
  isAffiliate: boolean;
}

export interface OfferRankingConfig {
  availabilityWeight: number;
  priceWeight: number;
  shippingWeight: number;
  retailerTrustWeight: number;
  freshnessWeight: number;
  /** Explicitly forbidden — commission must never appear here */
  // commissionWeight: never
}

export interface ProductPriceSummary {
  lowestPrice?: number;
  currency?: string;
  offerCount: number;
  inStockCount: number;
  lastChecked?: string;
  freshness?: PriceFreshnessBand;
  hasAffiliateOffers: boolean;
  bestOfferId?: EntityId;
}

export interface ResolvedCommercialUrl {
  destinationUrl: string;
  isAffiliate: boolean;
  network?: AffiliateNetworkId;
  retailerId: EntityId;
  offerId: EntityId;
  programId?: EntityId;
}

export interface CommercialSourcePolicy {
  retailerId: EntityId;
  priceMaxAgeHours?: number;
  cachingRules?: string;
  attributionRules?: string;
}
