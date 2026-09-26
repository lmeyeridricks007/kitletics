/**
 * Final padel commerce resolution — verified NL-shipping listing Offers.
 * Prices/URLs checked 2026-09-23T14:30:00.000Z against live retailer product pages / Shopify JSON.
 * Do not invent prices; do not use retailer homepages.
 */
import type { Offer } from "@/domain/commerce/types";

const CHECKED = "2026-09-23T14:30:00.000Z";

function o(
  partial: Omit<
    Offer,
    | "availability"
    | "currency"
    | "region"
    | "status"
    | "condition"
    | "source"
    | "lastChecked"
  > &
    Partial<
      Pick<
        Offer,
        | "availability"
        | "currency"
        | "region"
        | "status"
        | "condition"
        | "source"
        | "lastChecked"
      >
    >,
): Offer {
  return {
    availability: "in-stock",
    currency: "EUR",
    region: "NL",
    status: "active",
    condition: "new",
    source: "manual",
    lastChecked: CHECKED,
    ...partial,
  };
}

export const padelFinalParityOffers: Offer[] = [
  o({
    id: "offer-bullpadel-indiga-ctr-chefpadel-final-nl",
    productId: "prod-bullpadel-indiga-ctr",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/bullpadel-indiga-ctr-2026",
    price: 84.99,
  }),
  o({
    id: "offer-bullpadel-indiga-ctr-bespanracket-final-nl",
    productId: "prod-bullpadel-indiga-ctr",
    retailerId: "ret-bespanracket",
    url: "https://www.bespanracket.nl/bullpadel-indiga-ctr-26-padelracket.html",
    price: 89.99,
  }),
  o({
    id: "offer-bullpadel-indiga-ctr-bullpadel-direct-final-nl",
    productId: "prod-bullpadel-indiga-ctr",
    retailerId: "ret-bullpadel-direct",
    url: "https://www.bullpadel.com/gb/5697-racket-bullpadel-indiga-ctr-26.html",
    price: 89.99,
  }),
  o({
    id: "offer-adidas-match-light-zonadepadel-final-nl",
    productId: "prod-adidas-match-light",
    retailerId: "ret-zonadepadel",
    url: "https://www.zonadepadel.nl/adidas-padel/14063-adidas-match-light-2026.html",
    price: 58.5,
  }),
  o({
    id: "offer-adidas-match-light-padelmq-final-nl",
    productId: "prod-adidas-match-light",
    retailerId: "ret-padelmq",
    url: "https://www.padelmq.com/en-nl/products/adidas-match-light-3-5-2026",
    price: 59.95,
  }),
  o({
    id: "offer-adidas-match-light-justpadel-final-nl",
    productId: "prod-adidas-match-light",
    retailerId: "ret-justpadel",
    url: "https://justpadel.com/en/products/adidas-match-light-3-5-2026",
    price: 74.95,
  }),
  o({
    id: "offer-bullpadel-neuron-02-padelmq-final-nl",
    productId: "prod-bullpadel-neuron-02",
    retailerId: "ret-padelmq",
    url: "https://www.padelmq.com/en-nl/products/bullpadel-neuron-02-2026",
    price: 174.49,
  }),
  o({
    id: "offer-bullpadel-neuron-02-zonadepadel-final-nl",
    productId: "prod-bullpadel-neuron-02",
    retailerId: "ret-zonadepadel",
    url: "https://www.zonadepadel.nl/bullpadel/13556-bullpadel-neuron-02-2026.html",
    price: 179.96,
  }),
  o({
    id: "offer-bullpadel-neuron-02-chefpadel-final-nl",
    productId: "prod-bullpadel-neuron-02",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/bullpadel-neuron-02-2026",
    price: 259.99,
  }),
  o({
    id: "offer-kuikma-pr-comfort-soft-decathlon-final-nl",
    productId: "prod-kuikma-pr-comfort-soft",
    retailerId: "ret-decathlon",
    url: "https://www.decathlon.nl/p/padelracket-pr-comfort-soft/348617/c1c14m8928692",
    price: 44.99,
  }),
  o({
    id: "offer-nox-at10-team-paletero-zonadepadel-final-nl",
    productId: "prod-nox-at10-team-bag",
    retailerId: "ret-zonadepadel",
    url: "https://www.zonadepadel.nl/nox/11533-nox-padeltas-at10-team-wit-2025.html",
    price: 44.96,
  }),
  o({
    id: "offer-nox-at10-team-paletero-nox-direct-final-nl",
    productId: "prod-nox-at10-team-bag",
    retailerId: "ret-nox-direct",
    url: "https://noxsport.com/en/products/paletero-at10-team-grey-black",
    price: 69.95,
  }),
  o({
    id: "offer-nox-at10-team-paletero-racketshop-final-nl",
    productId: "prod-nox-at10-team-bag",
    retailerId: "ret-racketshop",
    url: "https://racketshop.com/nl/product/nox-at10-team-padel-bag-white-2025/",
    price: 75.0,
  }),
  o({
    id: "offer-bullpadel-vertex-05-hybrid-chefpadel-final-nl",
    productId: "prod-bullpadel-vertex-05-hybrid",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/bullpadel-vertex-05-hybrid-2026",
    price: 269.99,
  }),
  o({
    id: "offer-bullpadel-vertex-05-hybrid-padelmq-final-nl",
    productId: "prod-bullpadel-vertex-05-hybrid",
    retailerId: "ret-padelmq",
    url: "https://www.padelmq.com/products/bullpadel-vertex-05-hybrid-2026",
    price: 223.98,
  }),
  o({
    id: "offer-bullpadel-vertex-05-w-padelmq-final-nl",
    productId: "prod-bullpadel-vertex-05-w",
    retailerId: "ret-padelmq",
    url: "https://www.padelmq.com/products/bullpadel-vertex-05-w-2026",
    price: 167.95,
  }),
  o({
    id: "offer-bullpadel-hack-04-hybrid-chefpadel-final-nl",
    productId: "prod-bullpadel-hack-04-hybrid",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/bullpadel-hack-04-hybrid-2026",
    price: 254.99,
  }),
  o({
    id: "offer-bullpadel-hack-04-hybrid-padelmq-final-nl",
    productId: "prod-bullpadel-hack-04-hybrid",
    retailerId: "ret-padelmq",
    url: "https://www.padelmq.com/products/bullpadel-hack-04-hybrid-2026",
    price: 212.93,
  }),
  o({
    id: "offer-bullpadel-hack-04-comfort-chefpadel-final-nl",
    productId: "prod-bullpadel-hack-04-comfort",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/bullpadel-hack-04-comfort-2026",
    price: 204.99,
  }),
  o({
    id: "offer-bullpadel-neuron-02-edge-chefpadel-final-nl",
    productId: "prod-bullpadel-neuron-02-edge",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/bullpadel-neuron-02-edge-2026",
    price: 269.99,
  }),
  o({
    id: "offer-bullpadel-neuron-02-edge-padelmq-final-nl",
    productId: "prod-bullpadel-neuron-02-edge",
    retailerId: "ret-padelmq",
    url: "https://www.padelmq.com/products/bullpadel-neuron-02-edge-2026",
    price: 178.95,
  }),
  o({
    id: "offer-bullpadel-xplo-chefpadel-final-nl",
    productId: "prod-bullpadel-xplo",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/bullpadel-xplo-2026",
    price: 249.99,
  }),
  o({
    id: "offer-bullpadel-xplo-padelmq-final-nl",
    productId: "prod-bullpadel-xplo",
    retailerId: "ret-padelmq",
    url: "https://www.padelmq.com/products/bullpadel-xplo-2026",
    price: 169.95,
  }),
  o({
    id: "offer-bullpadel-xplo-comfort-chefpadel-final-nl",
    productId: "prod-bullpadel-xplo-comfort",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/bullpadel-xplo-comfort-2026",
    price: 199.99,
  }),
  o({
    id: "offer-bullpadel-xplo-comfort-justpadel-final-nl",
    productId: "prod-bullpadel-xplo-comfort",
    retailerId: "ret-justpadel",
    url: "https://justpadel.com/en/products/bullpadel-xplo-comfort",
    price: 149.95,
  }),
  o({
    id: "offer-bullpadel-xplo-comfort-padelmq-final-nl",
    productId: "prod-bullpadel-xplo-comfort",
    retailerId: "ret-padelmq",
    url: "https://www.padelmq.com/products/bullpadel-xplo-comfort-2026",
    price: 126.95,
  }),
  o({
    id: "offer-bullpadel-ionic-light-chefpadel-final-nl",
    productId: "prod-bullpadel-ionic-light",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/bullpadel-ionic-light-2026",
    price: 129.99,
  }),
  o({
    id: "offer-bullpadel-vertex-advance-padelmq-final-nl",
    productId: "prod-bullpadel-vertex-advance",
    retailerId: "ret-padelmq",
    url: "https://www.padelmq.com/products/bullpadel-vertex-advance-2026",
    price: 99.49,
  }),
  o({
    id: "offer-bullpadel-vertex-advance-chefpadel-final-nl",
    productId: "prod-bullpadel-vertex-advance",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/bullpadel-vertex-advance-2026",
    price: 117.99,
  }),
  o({
    id: "offer-adidas-metalbone-team-light-chefpadel-final-nl",
    productId: "prod-adidas-metalbone-team-light",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/adidas-metalbone-team-light-2026",
    price: 179.99,
  }),
  o({
    id: "offer-adidas-cross-it-light-chefpadel-final-nl",
    productId: "prod-adidas-cross-it-light",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/adidas-cross-it-light-2026",
    price: 239.99,
  }),
  o({
    id: "offer-adidas-arrow-hit-ctrl-chefpadel-final-nl",
    productId: "prod-adidas-arrow-hit-ctrl",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/adidas-arrow-hit-ctrl-2026",
    price: 319.99,
  }),
  o({
    id: "offer-adidas-arrow-hit-ctrl-justpadel-final-nl",
    productId: "prod-adidas-arrow-hit-ctrl",
    retailerId: "ret-justpadel",
    url: "https://justpadel.com/en/products/adidas-arrow-hit-ctrl-2026",
    price: 279.95,
  }),
  o({
    id: "offer-adidas-arrow-hit-justpadel-final-nl",
    productId: "prod-adidas-arrow-hit-attk",
    retailerId: "ret-justpadel",
    url: "https://justpadel.com/en/products/adidas-arrow-hit-2026",
    price: 269.95,
  }),
  o({
    id: "offer-adidas-arrow-hit-chefpadel-final-nl",
    productId: "prod-adidas-arrow-hit-attk",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/adidas-arrow-hit-2026",
    price: 319.99,
  }),
  o({
    id: "offer-head-coello-motion-padelmq-final-nl",
    productId: "prod-head-coello-motion",
    retailerId: "ret-padelmq",
    url: "https://www.padelmq.com/products/head-coello-motion-2026",
    price: 213.49,
  }),
  o({
    id: "offer-head-coello-team-padelmq-final-nl",
    productId: "prod-head-coello-team",
    retailerId: "ret-padelmq",
    url: "https://www.padelmq.com/products/head-coello-team-2026",
    price: 142.95,
  }),
  o({
    id: "offer-head-gravity-pro-padelmq-final-nl",
    productId: "prod-head-gravity-pro",
    retailerId: "ret-padelmq",
    url: "https://www.padelmq.com/products/head-gravity-pro",
    price: 149.95,
  }),
  o({
    id: "offer-siux-electra-pro-chefpadel-final-nl",
    productId: "prod-siux-electra",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/siux-electra-pro-2026",
    price: 249.99,
  }),
  o({
    id: "offer-siux-fenix-pro-chefpadel-final-nl",
    productId: "prod-siux-fenix",
    retailerId: "ret-chefpadel",
    url: "https://chefpadel.nl/products/siux-fenix-pro-2026",
    price: 259.99,
  }),
];
