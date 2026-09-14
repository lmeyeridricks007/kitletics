/**
 * Soft-goods Offers with product listing URLs (NL specialist).
 * Homepage seed offers remain INVALID in commerce materializer.
 */
import type { Offer } from "@/domain/commerce/types";
import { SEED_DATES } from "@/content/config";

function o(
  partial: Omit<
    Offer,
    | "availability"
    | "lastChecked"
    | "currency"
    | "region"
    | "status"
    | "condition"
    | "source"
    | "retailerId"
  > &
    Partial<
      Pick<
        Offer,
        | "availability"
        | "lastChecked"
        | "currency"
        | "region"
        | "status"
        | "condition"
        | "source"
        | "retailerId"
      >
    >,
): Offer {
  const { retailerId = "ret-padelmq", ...rest } = partial;
  return {
    availability: "in-stock",
    lastChecked: SEED_DATES.verified,
    currency: "EUR",
    region: "NL",
    status: "active",
    condition: "new",
    source: "seed",
    ...rest,
    retailerId,
  };
}

/** PadeLMQ NL listing prices researched 2026-09-13 (single-can / unit where applicable). */
export const padelSoftGoodsOffers: Offer[] = [
  o({
    id: "offer-head-pro-plus-padelmq-nl",
    productId: "prod-head-padel-pro-plus",
    url: "https://www.padelmq.com/en-nl/products/head-pro-tube",
    price: 5.79,
  }),
  o({
    id: "offer-head-pro-s-padelmq-nl",
    productId: "prod-head-padel-pro-s",
    url: "https://www.padelmq.com/en-nl/products/head-pro-s",
    price: 5.79,
  }),
  o({
    id: "offer-wilson-premier-padelmq-nl",
    productId: "prod-wilson-padel-premier",
    url: "https://www.padelmq.com/en-nl/products/wilson-premier-tube",
    price: 6.25,
  }),
  o({
    id: "offer-wilson-premier-speed-padelmq-nl",
    productId: "prod-wilson-padel-premier-speed",
    url: "https://www.padelmq.com/en-nl/products/wilson-padel-premier-speed-tube",
    price: 6.19,
  }),
  o({
    id: "offer-bullpadel-premium-pro-padelmq-nl",
    productId: "prod-bullpadel-premium-pro",
    url: "https://www.padelmq.com/en-nl/products/premium-pro-tube",
    price: 5.95,
  }),
  o({
    id: "offer-dunlop-pro-padelmq-nl",
    productId: "prod-dunlop-pro-padel",
    url: "https://www.padelmq.com/en-nl/products/dunlop-pro-padel-ball-tube",
    price: 5.99,
  }),
  o({
    id: "offer-babolat-court-balls-padelmq-nl",
    productId: "prod-babolat-court-padel-balls",
    url: "https://www.padelmq.com/en-nl/products/babolat-court-padel-ballen-tube",
    price: 5.45,
  }),
  o({
    id: "offer-adidas-speed-rx-padelmq-nl",
    productId: "prod-adidas-speed-rx",
    url: "https://www.padelmq.com/en-nl/products/adidas-speed-rx-bal-2023-1-tube-3-ballen",
    price: 5.89,
  }),
  o({
    id: "offer-tecnifibre-team-balls-padelmq-nl",
    productId: "prod-tecnifibre-padel-team",
    url: "https://www.padelmq.com/en-nl/products/tube-van-3-tecnifibre-padel-team-ballen",
    price: 4.9,
  }),
  o({
    id: "offer-vertex-geo-backpack-padelmq-nl",
    productId: "prod-bullpadel-vertex-backpack",
    url: "https://www.padelmq.com/en-nl/products/bullpadel-vertex-geo-rugzak-intense-blue-2026",
    price: 40.95,
  }),
  o({
    id: "offer-adidas-protour-padelmq-nl",
    productId: "prod-adidas-protour-padel",
    url: "https://www.padelmq.com/en-nl/products/adidas-padeltas-protour-3-5-blauw-brons-2026",
    price: 80.37,
  }),
  o({
    id: "offer-wilson-super-tour-padelmq-nl",
    productId: "prod-wilson-super-tour-padel",
    url: "https://www.padelmq.com/en-nl/products/wilson-bela-super-tour-padel-tas-rood",
    price: 80.31,
  }),
  o({
    id: "offer-tecnifibre-endurance-padelmq-nl",
    productId: "prod-tecnifibre-tour-endurance-backpack",
    url: "https://www.padelmq.com/en-nl/products/tecnifibre-tour-endurance-rugzak-caqui",
    price: 41.95,
  }),
  o({
    id: "offer-nox-pro-overgrip-padelmq-nl",
    productId: "prod-nox-pro-overgrip",
    url: "https://www.padelmq.com/en-nl/products/nox-pro-overgrip-wit-3-pack",
    price: 9.95,
  }),
  o({
    id: "offer-head-xtreme-soft-padelmq-nl",
    productId: "prod-head-xtreme-soft",
    url: "https://www.padelmq.com/en-nl/products/head-xtreme-soft-overgrip-wit",
    price: 2.29,
  }),
  o({
    id: "offer-hesacore-padelmq-nl",
    productId: "prod-hesacore-padel",
    url: "https://www.padelmq.com/en-nl/products/hesacore-grip",
    price: 17.99,
  }),
  o({
    id: "offer-bullpadel-protector-padelmq-nl",
    productId: "prod-bullpadel-frame-protector",
    url: "https://www.padelmq.com/en-nl/products/bullpadel-frame-protector-zwart-3-stuks",
    price: 7.95,
  }),
  o({
    id: "offer-nox-protector-padelmq-nl",
    productId: "prod-nox-frame-protector",
    url: "https://www.padelmq.com/en-nl/products/nox-protection-tape-transparant-framebeschermer",
    price: 9.95,
  }),
  o({
    id: "offer-pascal-box-padelmq-nl",
    productId: "prod-bullpadel-pascal-box",
    url: "https://www.padelmq.com/en-nl/products/pascal-box-3b",
    price: 58.49,
  }),
  o({
    id: "offer-custom-weight-padelmq-nl",
    productId: "prod-bullpadel-custom-weight",
    url: "https://www.padelmq.com/en-nl/products/bullpadel-protector-custom-weight-4-stuks",
    price: 12.95,
  }),
];
