/**
 * Padel commerce research states — catalog inclusion ≠ retail availability.
 * Offers remain on the canonical Offer model; this sidecar tracks research.
 */

export type CommerceAvailabilityClass =
  | "NL_AVAILABLE"
  | "EU_AVAILABLE_TO_NL"
  | "EU_ONLY"
  | "BRAND_DIRECT"
  | "OUT_OF_STOCK"
  | "NO_CURRENT_OFFER_FOUND";

/** Admin / coverage queue buckets (offer presence, not recommendation). */
export type CommerceOfferPresence =
  | "NL_OFFER"
  | "EU_OFFER"
  | "NO_OFFER"
  | "STALE"
  | "IDENTITY_CONFLICT";

/**
 * Terminal research disposition for every current product.
 * COMMERCE_PENDING must not remain unexplained after enrichment.
 */
export type CommerceResearchState =
  | "RESEARCHED"
  | "BLOCKED"
  | "COMMERCE_PENDING";

export type CommerceConflictType =
  | "GENERATION_MISMATCH"
  | "PACK_MISMATCH"
  | "VARIANT_MISMATCH"
  | "BAG_FORM_MISMATCH"
  | "BUNDLE_AS_STANDALONE"
  | "REGION_CURRENCY_MIX";

export interface CommerceConflict {
  productId: string;
  categoryId: string;
  type: CommerceConflictType;
  field: string;
  valueA: string;
  sourceA: string;
  valueB: string;
  sourceB: string;
  resolution: string;
}

export interface ProductCommerceEnrichment {
  productId: string;
  categoryId: string;
  brandId: string;
  /** Research classification (may cite inventory evidence without a Kitletics Offer). */
  availabilityClass: CommerceAvailabilityClass;
  /** What Kitletics Offer rows currently provide. */
  offerPresence: CommerceOfferPresence;
  researchState: CommerceResearchState;
  researchedAt: string;
  evidenceUrls: string[];
  nlOfferCount: number;
  euOfferCount: number;
  affiliateMapped: boolean;
  freshOfferCount: number;
  staleOfferCount: number;
  notes?: string[];
  conflicts?: CommerceConflict[];
  /** Pack normalization snapshot when applicable */
  packNormalization?: {
    unitLabel: string;
    packQuantity: number;
    packPrice?: number;
    unitPrice?: number;
    currency?: string;
  };
}
