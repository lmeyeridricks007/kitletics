import type { OfferRow } from "@/lib/product/get-product-page-data";
import { buildOfferClickHref } from "@/repositories/commerce";
import type { OfferClickPlacement } from "@/domain/commerce/types";

export function isAmazonOfferRow(row: OfferRow): boolean {
  const r = row.retailer;
  if (!r) return /amazon/i.test(row.offer.retailerId);
  if (r.affiliateNetwork === "amazon") return true;
  return /amazon/i.test(`${r.slug} ${r.name} ${r.id}`);
}

/** Prefer in-region Amazon offer only — never fall back to another region. */
export function pickAmazonOffer(offers: OfferRow[]): OfferRow | undefined {
  return offers.find(isAmazonOfferRow);
}

export function amazonOfferHref(
  offer: OfferRow,
  placement: OfferClickPlacement = "review",
): string {
  return buildOfferClickHref(offer.offer.id, placement);
}
