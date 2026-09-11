import type { OfferClickPlacement } from "@/domain/commerce/types";

/** Client-safe affiliate click URL — no offer table imports. */
export function buildOfferClickHref(
  offerId: string,
  placement: OfferClickPlacement = "product-offers",
  pageType?: string,
): string {
  const params = new URLSearchParams({ placement });
  if (pageType) params.set("pageType", pageType);
  return `/go/${offerId}?${params.toString()}`;
}
