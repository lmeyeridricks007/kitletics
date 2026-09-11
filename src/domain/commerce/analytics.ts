/**
 * Commercial analytics stubs — no vendor wired.
 * Never attach Finder health/weight/pace data.
 */

import type {
  CommercialClickEvent,
  OfferClickPlacement,
} from "@/domain/commerce/types";
import type { RegionCode } from "@/domain/shared/types";

export type CommercialAnalyticsEvent =
  | "offer_impression"
  | "offer_click"
  | "retailer_selected"
  | "region_changed"
  | "price_unavailable"
  | "affiliate_redirect_failed";

export interface CommercialAnalyticsProps {
  offerId?: string;
  productId?: string;
  retailerId?: string;
  region?: RegionCode;
  pageType?: string;
  pageId?: string;
  placement?: OfferClickPlacement;
  isAffiliate?: boolean;
  [key: string]: string | number | boolean | undefined;
}

type Sink = (
  event: CommercialAnalyticsEvent,
  props: CommercialAnalyticsProps,
) => void;

let sink: Sink = () => {
  // no-op until analytics vendor is configured
};

export function setCommercialAnalyticsSink(next: Sink): void {
  sink = next;
}

export function trackCommercialEvent(
  event: CommercialAnalyticsEvent,
  props: CommercialAnalyticsProps = {},
): void {
  try {
    sink(event, props);
  } catch {
    // never break purchase journey for analytics
  }
}

export function recordOfferClick(
  event: Omit<CommercialClickEvent, "type" | "timestamp">,
): void {
  trackCommercialEvent("offer_click", {
    offerId: event.offerId,
    productId: event.productId,
    retailerId: event.retailerId,
    region: event.region,
    pageType: event.pageType,
    pageId: event.pageId,
    placement: event.placement,
    isAffiliate: event.isAffiliate,
  });
}

const PLACEMENTS: ReadonlySet<string> = new Set([
  "product-hero",
  "product-offers",
  "best-guide",
  "review",
  "comparison",
  "alternatives",
  "finder-results",
  "rotation-planner",
  "search",
  "category-card",
  "setup",
  "other",
]);

export function parsePlacement(value: string | null): OfferClickPlacement {
  if (value && PLACEMENTS.has(value)) return value as OfferClickPlacement;
  return "other";
}
