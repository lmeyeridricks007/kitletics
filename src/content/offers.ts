import type { Offer } from "@/domain/commerce/types";
import { SEED_DATES } from "@/content/config";
import { padelAllOffers } from "@/content/padel";
import { racketOffers } from "@/content/racket";
import { fitnessOffers } from "@/content/fitness";
import { nlOfferBackfill } from "@/content/offers-nl-backfill";

const checked = SEED_DATES.verified;

function o(
  partial: Omit<Offer, "source" | "condition" | "status"> &
    Partial<Pick<Offer, "source" | "condition" | "status">>,
): Offer {
  return {
    source: "seed",
    condition: "new",
    status: "active",
    ...partial,
  };
}

/**
 * Seed Offers for architecture + commercial UX.
 * Prices are illustrative seed data — not live retailer scrapes.
 * Amazon affiliate short links (amzn.to) are applied from
 * offers-affiliate-urls.ts via materializeOffers → Offer.affiliateUrl.
 * Outbound clicks always go through /go/[offerId].
 */
export const offers: Offer[] = [
  // Legacy / previous-gen (still commercially relevant)
  o({ id: "offer-nb5-nl", productId: "prod-novablast-5", retailerId: "ret-asics-direct", region: "NL", url: "https://www.asics.com/nl/nl-nl/", currency: "EUR", price: 130, originalPrice: 150, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-nb5-uk", productId: "prod-novablast-5", retailerId: "ret-amazon-uk", region: "UK", url: "https://www.amazon.co.uk/", currency: "GBP", price: 115, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-nb5-us", productId: "prod-novablast-5", retailerId: "ret-amazon-us", region: "US", url: "https://www.amazon.com/", currency: "USD", price: 130, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-nb4-nl", productId: "prod-novablast-4", retailerId: "ret-decathlon", region: "NL", url: "https://www.decathlon.nl/", currency: "EUR", price: 99, originalPrice: 140, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-nimbus-nl", productId: "prod-nimbus-27", retailerId: "ret-asics-direct", region: "NL", url: "https://www.asics.com/nl/nl-nl/", currency: "EUR", price: 190, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-nimbus-uk", productId: "prod-nimbus-27", retailerId: "ret-amazon-uk", region: "UK", url: "https://www.amazon.co.uk/", currency: "GBP", price: 165, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-pegasus41-nl", productId: "prod-pegasus-41", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 120, originalPrice: 140, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-ghost16-nl", productId: "prod-ghost-16", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 125, originalPrice: 150, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-clifton9-nl", productId: "prod-clifton-9", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 110, originalPrice: 150, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-speed4-nl", productId: "prod-endorphin-speed-4", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 140, originalPrice: 170, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-boston-nl", productId: "prod-boston-12", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 160, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-boston-uk", productId: "prod-boston-12", retailerId: "ret-amazon-uk", region: "UK", url: "https://www.amazon.co.uk/", currency: "GBP", price: 140, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-boston-de", productId: "prod-boston-12", retailerId: "ret-amazon-de", region: "DE", url: "https://www.amazon.de/", currency: "EUR", price: 160, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-fr965-nl", productId: "prod-forerunner-965", retailerId: "ret-garmin-direct", region: "NL", url: "https://www.garmin.com/", currency: "EUR", price: 549, originalPrice: 649, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-fr255-nl", productId: "prod-forerunner-255", retailerId: "ret-garmin-direct", region: "NL", url: "https://www.garmin.com/", currency: "EUR", price: 349, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-pace3-nl", productId: "prod-coros-pace-3", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 229, originalPrice: 249, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-hrm-nl", productId: "prod-hrm-pro-plus", retailerId: "ret-garmin-direct", region: "NL", url: "https://www.garmin.com/", currency: "EUR", price: 139, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-hrm-uk", productId: "prod-hrm-pro-plus", retailerId: "ret-amazon-uk", region: "UK", url: "https://www.amazon.co.uk/", currency: "GBP", price: 119, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-advskin-nl", productId: "prod-adv-skin-12", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 160, availability: "in-stock", lastChecked: checked }),

  // Wave2 flagships — NL primary region
  o({ id: "offer-nb6-nl-asics", productId: "prod-novablast-6", retailerId: "ret-asics-direct", region: "NL", url: "https://www.asics.com/nl/nl-nl/", currency: "EUR", price: 160, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-nb6-nl-a4r", productId: "prod-novablast-6", retailerId: "ret-all4running", region: "NL", url: "https://www.all4running.nl/", currency: "EUR", price: 154, availability: "in-stock", shipping: "From €4.95", shippingCost: 4.95, lastChecked: checked }),
  o({ id: "offer-nb6-nl-amz", productId: "prod-novablast-6", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 159, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-nb6-de", productId: "prod-novablast-6", retailerId: "ret-amazon-de", region: "DE", url: "https://www.amazon.de/", currency: "EUR", price: 159, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-nb6-uk", productId: "prod-novablast-6", retailerId: "ret-amazon-uk", region: "UK", url: "https://www.amazon.co.uk/", currency: "GBP", price: 140, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-nb6-us", productId: "prod-novablast-6", retailerId: "ret-amazon-us", region: "US", url: "https://www.amazon.com/", currency: "USD", price: 150, availability: "in-stock", lastChecked: checked }),

  o({ id: "offer-ghost18-nl", productId: "prod-ghost-18", retailerId: "ret-brooks-direct", region: "NL", url: "https://www.brooksrunning.com/", currency: "EUR", price: 150, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-ghost18-nl-a4r", productId: "prod-ghost-18", retailerId: "ret-all4running", region: "NL", url: "https://www.all4running.nl/", currency: "EUR", price: 144, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-ghost18-nl-amz", productId: "prod-ghost-18", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 149, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-ghost18-uk", productId: "prod-ghost-18", retailerId: "ret-amazon-uk", region: "UK", url: "https://www.amazon.co.uk/", currency: "GBP", price: 130, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-ghost18-us", productId: "prod-ghost-18", retailerId: "ret-amazon-us", region: "US", url: "https://www.amazon.com/", currency: "USD", price: 140, availability: "in-stock", lastChecked: checked }),

  o({ id: "offer-peg42-nl", productId: "prod-pegasus-42", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 140, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-peg42-nl-a4r", productId: "prod-pegasus-42", retailerId: "ret-all4running", region: "NL", url: "https://www.all4running.nl/", currency: "EUR", price: 135, availability: "in-stock", lastChecked: checked }),

  o({ id: "offer-clifton10-nl", productId: "prod-clifton-10", retailerId: "ret-hoka-direct", region: "NL", url: "https://www.hoka.com/", currency: "EUR", price: 150, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-clifton10-nl-a4r", productId: "prod-clifton-10", retailerId: "ret-all4running", region: "NL", url: "https://www.all4running.nl/", currency: "EUR", price: 144, availability: "in-stock", lastChecked: checked }),

  o({ id: "offer-bondi9-nl", productId: "prod-bondi-9", retailerId: "ret-hoka-direct", region: "NL", url: "https://www.hoka.com/", currency: "EUR", price: 180, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-speed5-nl", productId: "prod-endorphin-speed-5", retailerId: "ret-all4running", region: "NL", url: "https://www.all4running.nl/", currency: "EUR", price: 170, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-speed5-nl-amz", productId: "prod-endorphin-speed-5", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 175, availability: "in-stock", lastChecked: checked }),

  o({ id: "offer-vf4-nl", productId: "prod-vaporfly-4", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 250, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-vf4-nl-a4r", productId: "prod-vaporfly-4", retailerId: "ret-all4running", region: "NL", url: "https://www.all4running.nl/", currency: "EUR", price: 245, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-alphafly3-nl", productId: "prod-alphafly-3", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 300, availability: "in-stock", lastChecked: checked }),

  o({ id: "offer-kayano-nl", productId: "prod-kayano-32", retailerId: "ret-asics-direct", region: "NL", url: "https://www.asics.com/nl/nl-nl/", currency: "EUR", price: 190, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-adrenaline-nl", productId: "prod-adrenaline-gts-25", retailerId: "ret-brooks-direct", region: "NL", url: "https://www.brooksrunning.com/", currency: "EUR", price: 150, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-speedgoat-nl", productId: "prod-speedgoat-6", retailerId: "ret-hoka-direct", region: "NL", url: "https://www.hoka.com/", currency: "EUR", price: 170, availability: "in-stock", lastChecked: checked }),

  o({ id: "offer-fr970-nl", productId: "prod-forerunner-970", retailerId: "ret-garmin-direct", region: "NL", url: "https://www.garmin.com/", currency: "EUR", price: 699, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-fr970-nl-amz", productId: "prod-forerunner-970", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 689, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-fr570-nl", productId: "prod-forerunner-570", retailerId: "ret-garmin-direct", region: "NL", url: "https://www.garmin.com/", currency: "EUR", price: 449, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-pacepro-nl", productId: "prod-coros-pace-pro", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 349, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-fr165-nl", productId: "prod-forerunner-165", retailerId: "ret-garmin-direct", region: "NL", url: "https://www.garmin.com/", currency: "EUR", price: 249, availability: "in-stock", lastChecked: checked }),

  o({ id: "offer-h10-nl", productId: "prod-polar-h10", retailerId: "ret-amazon-nl", region: "NL", url: "https://www.amazon.nl/", currency: "EUR", price: 89, availability: "in-stock", lastChecked: checked }),
  o({ id: "offer-vaporair-nl", productId: "prod-nathan-vaporair-2", retailerId: "ret-runnersworld-nl", region: "NL", url: "https://www.runnersworldshop.nl/", currency: "EUR", price: 120, availability: "in-stock", lastChecked: checked }),

  // Explicit non-affiliate cheaper vs affiliate-pricier pair for independence tests
  o({ id: "offer-nb6-nl-rws", productId: "prod-novablast-6", retailerId: "ret-runnersworld-nl", region: "NL", url: "https://www.runnersworldshop.nl/", currency: "EUR", price: 149, availability: "in-stock", lastChecked: checked }),

  ...padelAllOffers.map((p) =>
    o({
      ...p,
      condition: "new",
      status: "active",
      source: "seed",
    }),
  ),
  ...racketOffers.map((p) =>
    o({
      ...p,
      condition: "new",
      status: "active",
      source: "seed",
    }),
  ),
  ...fitnessOffers.map((p) =>
    o({
      ...p,
      condition: "new",
      status: "active",
      source: "seed",
    }),
  ),
  ...nlOfferBackfill,
];
