/** Shared identity helpers for Kitletics domain entities. */

export type EntityId = string;

export type PublishStatus =
  | "draft"
  | "review"
  | "scheduled"
  | "published"
  | "archived";

export interface PublishFields {
  status: PublishStatus;
  /** ISO datetime — required for scheduled; used as gate in production */
  publishedAt?: string;
  /** ISO datetime for scheduled go-live (status=scheduled) */
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
  lastVerifiedAt?: string;
}

export interface SeoFields {
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface MediaAsset {
  id: EntityId;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  type: "image" | "video" | "logo" | "icon";
  credit?: string;
  /** Provenance — stored for QA; not heavily surfaced in UI */
  source?: string;
  sourceUrl?: string;
  licence?: string;
  attribution?: string;
  usageType?:
    | "hero"
    | "side"
    | "top"
    | "rear"
    | "outsole"
    | "detail"
    | "on-foot"
    | "lifestyle"
    | "review-test"
    | "review-detail"
    | "review-comparison"
    | "other";
}

export type RegionCode = "NL" | "DE" | "FR" | "BE" | "UK" | "US" | "ZA";

export const REGIONS: readonly RegionCode[] = [
  "NL",
  "DE",
  "FR",
  "BE",
  "UK",
  "US",
  "ZA",
] as const;

export interface RegionContext {
  code: RegionCode;
  currency: string;
  label: string;
}

export const REGION_META: Record<RegionCode, RegionContext> = {
  NL: { code: "NL", currency: "EUR", label: "Netherlands" },
  DE: { code: "DE", currency: "EUR", label: "Germany" },
  FR: { code: "FR", currency: "EUR", label: "France" },
  BE: { code: "BE", currency: "EUR", label: "Belgium" },
  UK: { code: "UK", currency: "GBP", label: "United Kingdom" },
  US: { code: "US", currency: "USD", label: "United States" },
  ZA: { code: "ZA", currency: "ZAR", label: "South Africa" },
};

export const DEFAULT_REGION: RegionCode = "NL";
