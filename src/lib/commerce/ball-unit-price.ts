/**
 * @deprecated Prefer `normalizeBallPackPrice` from `@/lib/commerce/ball-pack-price`.
 * Thin display wrapper kept for call sites that want €/can · €/ball strings.
 */
export {
  normalizeBallPackPrice,
  type BallPackPriceInput,
  type BallPackPriceBreakdown,
} from "@/lib/commerce/ball-pack-price";

import {
  normalizeBallPackPrice,
  type BallPackPriceInput,
} from "@/lib/commerce/ball-pack-price";

export type BallPackOfferInput = {
  price: number;
  currency: string;
  ballsPerUnit: number;
  cansPerUnit?: number;
  unitLabel?: "can" | "box" | "pack";
};

export type BallNormalizedPrice = {
  pricePerCan: number | null;
  pricePerBall: number | null;
  currency: string;
  unitLabel: string;
  displayCan: string | null;
  displayBall: string | null;
};

function money(n: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-NL", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

/** Display-oriented wrapper around pack-price normalization. */
export function normalizeBallOfferPrice(
  input: BallPackOfferInput,
): BallNormalizedPrice {
  const pack: BallPackPriceInput = {
    offerPrice: input.price,
    currency: input.currency,
    ballsPerCan: input.ballsPerUnit,
    packCanCount: input.cansPerUnit,
  };
  const n = normalizeBallPackPrice(pack);
  const unitLabel = input.unitLabel ?? ((n.cansInListing ?? 1) > 1 ? "box" : "can");
  return {
    pricePerCan: n.pricePerCan ?? null,
    pricePerBall: n.pricePerBall ?? null,
    currency: input.currency,
    unitLabel,
    displayCan:
      n.pricePerCan != null
        ? `${money(n.pricePerCan, input.currency)} / can`
        : null,
    displayBall:
      n.pricePerBall != null
        ? `${money(n.pricePerBall, input.currency)} / ball`
        : null,
  };
}
