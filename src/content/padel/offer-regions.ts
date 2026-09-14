/**
 * Shared regional Offer builders for padel catalog seeds.
 * Uses the canonical Offer type — no padel-specific pricing engine.
 *
 * Rules:
 * - Prefer product listing URLs (never leave Amazon/Decathlon homepages).
 * - Do not invent affiliate tags — `/go` + AffiliateProgram credentials resolve tracking.
 * - Do not FX-fabricate BE/FR/ZA prices from NL; only emit regions with real listings.
 * - Commission is never a field on Offer and never ranks recommendations.
 */

import type { Offer } from "@/domain/commerce/types";
import type { RegionCode } from "@/domain/shared/types";
import { SEED_DATES } from "@/content/config";

export type PadelOfferSeedInput = {
  productId: string;
  /** Stable slug fragment for offer ids */
  slug: string;
  priceEur: number;
  /** Optional GBP listing price — do not invent from FX if unknown */
  priceGbp?: number;
  /** Optional USD listing price — do not invent from FX if unknown */
  priceUsd?: number;
  /** Amazon NL product listing or amzn.to — required for NL Amazon row */
  amazonNlUrl?: string;
  amazonDeUrl?: string;
  amazonUkUrl?: string;
  amazonUsUrl?: string;
  amazonFrUrl?: string;
  /** Decathlon NL product listing — never homepage */
  decathlonNlUrl?: string;
  /** Specialist listing URLs when researched */
  justpadelUrl?: string;
  availability?: Offer["availability"];
  lastChecked?: string;
};

function baseOffer(
  partial: Omit<Offer, "availability" | "lastChecked"> &
    Partial<Pick<Offer, "availability" | "lastChecked">>,
): Offer {
  return {
    availability: "in-stock",
    lastChecked: SEED_DATES.verified,
    source: "seed",
    condition: "new",
    status: "active",
    ...partial,
  };
}

/**
 * Build regional Offers only where a listing URL is provided.
 * Homepage-only rows are rejected — the commerce materializer also gates them.
 */
export function buildPadelRegionalOffers(input: PadelOfferSeedInput): Offer[] {
  const checked = input.lastChecked ?? SEED_DATES.verified;
  const availability = input.availability ?? "in-stock";
  const offers: Offer[] = [];

  const pushAmazon = (
    region: RegionCode,
    retailerId: string,
    currency: string,
    price: number | undefined,
    url: string | undefined,
  ) => {
    if (!url || price == null || !(price > 0)) return;
    if (/amazon\.[a-z.]+\/?$/i.test(url.replace(/\/+$/, ""))) return;
    offers.push(
      baseOffer({
        id: `offer-${input.slug}-${region.toLowerCase()}`,
        productId: input.productId,
        retailerId,
        region,
        url,
        currency,
        price,
        availability,
        lastChecked: checked,
      }),
    );
  };

  pushAmazon("NL", "ret-amazon-nl", "EUR", input.priceEur, input.amazonNlUrl);
  pushAmazon(
    "DE",
    "ret-amazon-de",
    "EUR",
    input.priceEur,
    input.amazonDeUrl ?? input.amazonNlUrl,
  );
  pushAmazon(
    "UK",
    "ret-amazon-uk",
    "GBP",
    input.priceGbp,
    input.amazonUkUrl,
  );
  pushAmazon(
    "US",
    "ret-amazon-us",
    "USD",
    input.priceUsd,
    input.amazonUsUrl,
  );
  pushAmazon(
    "FR",
    "ret-amazon-fr",
    "EUR",
    input.priceEur,
    input.amazonFrUrl,
  );

  if (input.decathlonNlUrl && !/decathlon\.[a-z]+\/?$/i.test(input.decathlonNlUrl)) {
    offers.push(
      baseOffer({
        id: `offer-${input.slug}-decathlon-nl`,
        productId: input.productId,
        retailerId: "ret-decathlon",
        region: "NL",
        url: input.decathlonNlUrl,
        currency: "EUR",
        price: input.priceEur,
        availability,
        lastChecked: checked,
      }),
    );
  }

  if (input.justpadelUrl) {
    offers.push(
      baseOffer({
        id: `offer-${input.slug}-justpadel-nl`,
        productId: input.productId,
        retailerId: "ret-justpadel",
        region: "NL",
        url: input.justpadelUrl,
        currency: "EUR",
        price: input.priceEur,
        availability,
        lastChecked: checked,
      }),
    );
  }

  return offers;
}
