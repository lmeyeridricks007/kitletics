import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { getLowestOfferPrice } from "@/repositories";

export interface SetupItemPriceInput {
  productId: string;
  /** When false, excluded from kit total (e.g. optional next items). Default true. */
  includeInTotal?: boolean;
}

export interface SetupItemPrice {
  productId: string;
  price?: number;
  currency?: string;
  known: boolean;
}

export interface SetupPriceResult {
  knownTotal: number | null;
  unknownCount: number;
  currency: string;
  itemPrices: SetupItemPrice[];
  /** Items intentionally included in the total calculation */
  pricedItemCount: number;
}

/**
 * Sum best current regional offers for setup items.
 * Unknown prices are never treated as zero.
 */
export function calculateSetupPrice(opts: {
  items: SetupItemPriceInput[];
  region?: RegionCode;
}): SetupPriceResult {
  const region = opts.region ?? DEFAULT_REGION;
  const itemPrices: SetupItemPrice[] = [];
  let knownTotal = 0;
  let knownCount = 0;
  let unknownCount = 0;
  let currency = "EUR";

  const priced = opts.items.filter((i) => i.includeInTotal !== false);

  for (const item of priced) {
    const lowest = getLowestOfferPrice(item.productId, region);
    if (lowest && typeof lowest.price === "number") {
      knownTotal += lowest.price;
      knownCount += 1;
      currency = lowest.currency || currency;
      itemPrices.push({
        productId: item.productId,
        price: lowest.price,
        currency: lowest.currency,
        known: true,
      });
    } else {
      unknownCount += 1;
      itemPrices.push({
        productId: item.productId,
        known: false,
      });
    }
  }

  return {
    knownTotal: knownCount > 0 ? knownTotal : null,
    unknownCount,
    currency,
    itemPrices,
    pricedItemCount: priced.length,
  };
}
