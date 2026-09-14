/**
 * Normalize padel ball listing prices into per-can / per-ball units.
 *
 * `Offer` has no pack metadata today (`src/domain/commerce/types.ts`).
 * Callers must pass verified pack counts from product specs
 * (`ballsPerCan`, `cansPerBox`, or an explicit `packBallCount`) — never invent them.
 *
 * Pack unit normalization for balls should live here (or adjacent under
 * `src/lib/commerce/`), not on the Offer type, until offers optionally carry
 * listing pack quantity as first-class fields.
 */

export interface BallPackPriceInput {
  /** Listing price from an Offer (or other verified commercial source). */
  offerPrice: number;
  currency: string;
  /** Balls in one can — from product `ballsPerCan` when verified. */
  ballsPerCan?: number;
  /** Cans in the offered box/multipack — from product `cansPerBox` when verified. */
  cansPerBox?: number;
  /**
   * Total balls in the listing when known directly
   * (overrides ballsPerCan × cansPerBox).
   */
  packBallCount?: number;
  /** Number of cans in the listing when known directly (defaults to cansPerBox or 1). */
  packCanCount?: number;
}

export interface BallPackPriceBreakdown {
  currency: string;
  listingPrice: number;
  cansInListing?: number;
  ballsInListing?: number;
  pricePerCan?: number;
  pricePerBall?: number;
}

function positiveFinite(n: number | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/** Derive per-can / per-ball prices only when pack counts are supplied and valid. */
export function normalizeBallPackPrice(
  input: BallPackPriceInput,
): BallPackPriceBreakdown {
  const listingPrice = input.offerPrice;
  const result: BallPackPriceBreakdown = {
    currency: input.currency,
    listingPrice,
  };

  if (!positiveFinite(listingPrice)) {
    return result;
  }

  const cansInListing = positiveFinite(input.packCanCount)
    ? input.packCanCount
    : positiveFinite(input.cansPerBox)
      ? input.cansPerBox
      : undefined;

  let ballsInListing: number | undefined;
  if (positiveFinite(input.packBallCount)) {
    ballsInListing = input.packBallCount;
  } else if (
    positiveFinite(input.ballsPerCan) &&
    positiveFinite(cansInListing)
  ) {
    ballsInListing = input.ballsPerCan * cansInListing;
  } else if (positiveFinite(input.ballsPerCan) && cansInListing === undefined) {
    // Single-can listing assumed only when cans are unspecified and ballsPerCan is known.
    ballsInListing = input.ballsPerCan;
  }

  if (positiveFinite(cansInListing)) {
    result.cansInListing = cansInListing;
    result.pricePerCan = listingPrice / cansInListing;
  } else if (positiveFinite(input.ballsPerCan) && !positiveFinite(input.cansPerBox)) {
    result.cansInListing = 1;
    result.pricePerCan = listingPrice;
  }

  if (positiveFinite(ballsInListing)) {
    result.ballsInListing = ballsInListing;
    result.pricePerBall = listingPrice / ballsInListing;
  }

  return result;
}
