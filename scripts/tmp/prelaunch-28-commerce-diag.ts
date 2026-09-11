import {
  getOffers,
  getOffersForProductInRegion,
} from "../../src/repositories/commerce";
import { getProducts } from "../../src/repositories/products";
import { offers as rawOffers } from "../../src/content/offers";
import { isOfferUrlDisplayable } from "../../src/domain/commerce/offer-url-validation";
import { isOfferActive } from "../../src/domain/commerce/ranking";

const offers = getOffers();
const states: Record<string, number> = {};
let displayable = 0;
let active = 0;
let urlOk = 0;
for (const o of offers) {
  const s = o.urlValidationState ?? "undefined";
  states[s] = (states[s] || 0) + 1;
  if (isOfferActive(o)) active++;
  if (isOfferUrlDisplayable(o.urlValidationState)) urlOk++;
  if (isOfferActive(o) && isOfferUrlDisplayable(o.urlValidationState)) {
    displayable++;
  }
}
console.log(
  JSON.stringify(
    {
      raw: rawOffers.length,
      materialized: offers.length,
      active,
      urlOk,
      displayable,
      states,
    },
    null,
    2,
  ),
);
const shoes = getProducts({ isDev: false }).filter(
  (p) => p.categoryId === "cat-running-shoes",
);
console.log(
  "shoes NL displayable",
  shoes.filter((p) => getOffersForProductInRegion(p.id, "NL").length > 0)
    .length,
  "/",
  shoes.length,
);
const nova = offers.filter((o) => o.productId === "prod-novablast-6");
console.log(
  "novablast",
  nova.map((o) => ({
    id: o.id,
    region: o.region,
    price: o.price,
    currency: o.currency,
    state: o.urlValidationState,
    active: isOfferActive(o),
    displayable: isOfferUrlDisplayable(o.urlValidationState),
  })),
);
