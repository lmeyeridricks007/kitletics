import { describe, expect, it } from "vitest";
import {
  FRESHNESS_THRESHOLDS_HOURS,
  getOfferFreshness,
  pickLowestDisplayableOffer,
  rankOffersForProduct,
  shouldDisplayNumericPrice,
  buildPriceSummary,
} from "@/domain/commerce/ranking";
import { SEED_DATES } from "@/content/config";
import type { Offer, Retailer } from "@/domain/commerce/types";
import { REGION_META } from "@/domain/shared/types";
import {
  getLowestOfferPrice,
  getOffersForProduct,
  getProductById,
  getProductPriceSummary,
  getVariantsForProduct,
} from "@/repositories";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getCatalogProducts } from "@/lib/catalog/query";
import { getSearchPageData } from "@/lib/search/get-search-page-data";
import { productMatchesPrice } from "@/lib/search/facets";
import { getRunningShoeDatabaseRecords } from "@/lib/running-shoe-database/build-records";

const now = new Date("2026-09-12T18:00:00.000Z");
const freshIso = "2026-09-12T12:00:00.000Z";
const recentIso = new Date(
  now.getTime() - 48 * 60 * 60 * 1000,
).toISOString();
const agingIso = new Date(
  now.getTime() - 96 * 60 * 60 * 1000,
).toISOString();
const staleIso = "2020-01-01T00:00:00.000Z";

function offer(
  partial: Partial<Offer> & Pick<Offer, "id" | "retailerId" | "price">,
): Offer {
  return {
    productId: "prod-fixture",
    region: "NL",
    url: "https://www.example-retailer.test/product",
    currency: "EUR",
    availability: "in-stock",
    condition: "new",
    status: "active",
    source: "seed",
    lastChecked: freshIso,
    ...partial,
  };
}

const retailers = new Map<string, Retailer>([
  [
    "ret-brand",
    {
      id: "ret-brand",
      name: "Brand Direct",
      slug: "brand",
      homepage: "https://www.example-retailer.test",
      regions: ["NL"],
      retailerType: "brand-direct",
      status: "active",
    },
  ],
  [
    "ret-market",
    {
      id: "ret-market",
      name: "Marketplace",
      slug: "market",
      homepage: "https://www.affiliate-shop.test",
      regions: ["NL"],
      retailerType: "marketplace",
      affiliateNetwork: "amazon",
      status: "active",
    },
  ],
]);

describe("canonical freshness bands", () => {
  it("keeps the commercial display window at 24h / 72h / 168h", () => {
    expect(FRESHNESS_THRESHOLDS_HOURS).toEqual({
      fresh: 24,
      recent: 72,
      aging: 168,
    });
    expect(getOfferFreshness(freshIso, now)).toBe("fresh");
    expect(getOfferFreshness(recentIso, now)).toBe("recent");
    expect(getOfferFreshness(agingIso, now)).toBe("aging");
    expect(getOfferFreshness(staleIso, now)).toBe("stale");
    expect(getOfferFreshness("not-a-date", now)).toBe("stale");
  });

  it("seed verified clock is inside the recent window", () => {
    expect(getOfferFreshness(SEED_DATES.verified, now)).toMatch(
      /^(fresh|recent)$/,
    );
  });
});

describe("pickLowestDisplayableOffer — From-price semantics", () => {
  it("returns the only valid NL offer", () => {
    const only = offer({ id: "o-only", retailerId: "ret-brand", price: 129 });
    expect(pickLowestDisplayableOffer([only], now, "NL")?.id).toBe("o-only");
  });

  it("lowest eligible offer wins From-price among multiple valid offers", () => {
    const offers = [
      offer({ id: "o-160", retailerId: "ret-brand", price: 160 }),
      offer({ id: "o-129", retailerId: "ret-market", price: 129 }),
      offer({ id: "o-149", retailerId: "ret-brand", price: 149 }),
    ];
    expect(pickLowestDisplayableOffer(offers, now, "NL")?.price).toBe(129);
  });

  it("ignores a cheaper stale offer", () => {
    const offers = [
      offer({
        id: "o-stale-99",
        retailerId: "ret-market",
        price: 99,
        lastChecked: staleIso,
      }),
      offer({ id: "o-fresh-159", retailerId: "ret-brand", price: 159 }),
    ];
    expect(pickLowestDisplayableOffer(offers, now, "NL")?.price).toBe(159);
    expect(shouldDisplayNumericPrice(offers[0], now)).toBe(false);
  });

  it("ignores a cheaper out-of-stock offer", () => {
    const offers = [
      offer({
        id: "o-oos-80",
        retailerId: "ret-market",
        price: 80,
        availability: "out-of-stock",
      }),
      offer({ id: "o-stock-140", retailerId: "ret-brand", price: 140 }),
    ];
    expect(pickLowestDisplayableOffer(offers, now, "NL")?.price).toBe(140);
  });

  it("does not use a DE EUR offer for NL From-price", () => {
    const offers = [
      offer({
        id: "o-de",
        retailerId: "ret-brand",
        price: 99,
        region: "DE",
        currency: "EUR",
      }),
      offer({
        id: "o-nl",
        retailerId: "ret-brand",
        price: 159,
        region: "NL",
      }),
    ];
    expect(pickLowestDisplayableOffer(offers, now, "NL")?.id).toBe("o-nl");
  });

  it("sale From-price uses current price, not originalPrice", () => {
    const sale = offer({
      id: "o-sale",
      retailerId: "ret-brand",
      price: 130,
      originalPrice: 150,
    });
    expect(pickLowestDisplayableOffer([sale], now, "NL")?.price).toBe(130);
  });

  it("list-price-only offer still yields a From-price", () => {
    const listOnly = offer({
      id: "o-list",
      retailerId: "ret-brand",
      price: 179,
    });
    expect(listOnly.originalPrice).toBeUndefined();
    expect(pickLowestDisplayableOffer([listOnly], now, "NL")?.price).toBe(179);
  });

  it("unknown price when no eligible offer exists", () => {
    expect(pickLowestDisplayableOffer([], now, "NL")).toBeUndefined();
    expect(
      pickLowestDisplayableOffer(
        [
          offer({
            id: "o-stale",
            retailerId: "ret-brand",
            price: 100,
            lastChecked: staleIso,
          }),
        ],
        now,
        "NL",
      ),
    ).toBeUndefined();
  });

  it("does not let affiliate commission change From-price", () => {
    const offers = [
      offer({
        id: "o-aff-expensive",
        retailerId: "ret-market",
        price: 180,
        affiliateUrl: "https://www.affiliate-shop.test/aff?tag=x",
      }),
      offer({
        id: "o-cheap",
        retailerId: "ret-brand",
        price: 129,
      }),
    ];
    expect(pickLowestDisplayableOffer(offers, now, "NL")?.id).toBe("o-cheap");
  });

  it("From-price can differ from ranked CTA when the cheapest offer is not displayable", () => {
    const cheapAging = offer({
      id: "o-cheap-aging",
      retailerId: "ret-market",
      price: 99,
      lastChecked: agingIso,
    });
    const freshHigher = offer({
      id: "o-fresh-160",
      retailerId: "ret-brand",
      price: 160,
    });
    const ranked = rankOffersForProduct([cheapAging, freshHigher], retailers, undefined, now);
    expect(ranked[0].id).toBe("o-cheap-aging");
    expect(pickLowestDisplayableOffer([cheapAging, freshHigher], now, "NL")?.id).toBe(
      "o-fresh-160",
    );
  });

  it("buildPriceSummary.lowestPrice matches From-price, not ranked best", () => {
    const cheapAging = offer({
      id: "o-cheap-aging",
      retailerId: "ret-market",
      price: 99,
      lastChecked: agingIso,
    });
    const freshHigher = offer({
      id: "o-fresh-160",
      retailerId: "ret-brand",
      price: 160,
    });
    const summary = buildPriceSummary(
      [cheapAging, freshHigher],
      retailers,
      "NL",
      (o) => Boolean(o.affiliateUrl),
    );
    expect(summary.lowestPrice).toBe(160);
    expect(summary.bestOfferId).toBe("o-cheap-aging");
  });
});

describe("catalog surfaces share getLowestOfferPrice", () => {
  const opts = { isDev: false as const };
  const productId = "prod-novablast-5";
  const slug = "asics-novablast-5";

  it("NL From-price is €130 for Novablast 5 (sale vs list 150)", () => {
    const from = getLowestOfferPrice(productId, "NL", opts);
    expect(from).toEqual({
      price: 130,
      currency: "EUR",
      offerId: expect.any(String),
    });
    const seed = getOffersForProduct(productId, "NL").find(
      (o) => o.id === "offer-nb5-nl",
    );
    expect(seed?.originalPrice).toBe(150);
    expect(getProductPriceSummary(productId, "NL").lowestPrice).toBe(130);
  });

  it("PDP, catalog card, search card, and shoe database agree on NL From-price", () => {
    const from = getLowestOfferPrice(productId, "NL", opts);
    expect(from).toBeTruthy();

    const pdp = getProductPageData(slug, { isDev: false, region: "NL" });
    expect(pdp!.lowestPrice?.price).toBe(from!.price);
    expect(pdp!.lowestPrice?.currency).toBe(from!.currency);
    expect(pdp!.offers.every((row) => row.offer.region === "NL")).toBe(true);
    expect(
      pdp!.offers.some((row) => row.offer.currency === "GBP"),
    ).toBe(false);

    const catalog = getCatalogProducts(
      {
        sportId: "sport-running",
        categoryId: "cat-running-shoes",
        region: "NL",
        filters: {
          type: [],
          brand: [],
          specs: {},
          useCase: [],
          sort: "recommended",
        },
        unpaginated: true,
      },
      opts,
    );
    const card = catalog.products.find((r) => r.id === productId);
    expect(card?.price?.price).toBe(from!.price);
    expect(card?.price?.currency).toBe(from!.currency);

    const search = getSearchPageData({
      query: "novablast 5",
      type: "products",
      region: "NL",
      preview: false,
    });
    const searchCard = search.groups
      .flatMap((g) => g.products ?? [])
      .find((p) => p.id === productId);
    expect(searchCard?.price?.amount).toBe(from!.price);
    expect(searchCard?.price?.currency).toBe(from!.currency);

    const db = getRunningShoeDatabaseRecords("NL", opts);
    const row = db.find((r) => r.id === productId);
    expect(row?.price?.amount).toBe(from!.price);
    expect(row?.price?.currency).toBe(from!.currency);
  });

  it("catalog Under €150 filter uses the same NL From-price as the card", () => {
    const from = getLowestOfferPrice(productId, "NL", opts)!;
    expect(from.price).toBeLessThanOrEqual(150);
    const catalog = getCatalogProducts(
      {
        sportId: "sport-running",
        categoryId: "cat-running-shoes",
        region: "NL",
        filters: {
          type: [],
          brand: [],
          specs: {},
          useCase: [],
          sort: "recommended",
          priceMax: 150,
        },
        unpaginated: true,
      },
      opts,
    );
    expect(catalog.products.some((r) => r.id === productId)).toBe(true);
    expect(
      catalog.products.every(
        (r) => r.price != null && r.price.price <= 150,
      ),
    ).toBe(true);
  });

  it("search Under €150 facet matches the NL From-price shown on the card", () => {
    const product = getProductById(productId, opts)!;
    const from = getLowestOfferPrice(productId, "NL", opts)!;
    expect(productMatchesPrice(product, "NL", opts, undefined, 150)).toBe(
      true,
    );

    const shoes = getSearchPageData({
      query: "running shoes",
      region: "NL",
      preview: false,
    });
    expect(shoes.priceFacet).toBeTruthy();
    expect(from.price).toBeGreaterThanOrEqual(shoes.priceFacet!.min);
    expect(from.price).toBeLessThanOrEqual(shoes.priceFacet!.max);

    const filtered = getSearchPageData({
      query: "novablast 5",
      type: "products",
      region: "NL",
      maxPrice: 150,
      preview: false,
    });
    const ids = filtered.groups
      .flatMap((g) => g.products ?? [])
      .map((p) => p.id);
    expect(ids).toContain(productId);
  });

  it("variants share the product-level regional From-price", () => {
    const from = getLowestOfferPrice(productId, "NL", opts);
    const variants = getVariantsForProduct(productId);
    expect(from).toBeTruthy();
    for (const variant of variants) {
      expect(getLowestOfferPrice(productId, "NL", opts)?.price).toBe(
        from!.price,
      );
      expect(variant.productId).toBe(productId);
    }
  });

  it("does not fall back to another region's EUR/GBP/USD as the local From-price", () => {
    expect(getLowestOfferPrice(productId, "ZA", opts)).toBeUndefined();
    expect(getLowestOfferPrice(productId, "BE", opts)).toBeUndefined();
    expect(getLowestOfferPrice(productId, "FR", opts)).toBeUndefined();
    const uk = getLowestOfferPrice(productId, "UK", opts);
    if (uk) expect(uk.currency).toBe("GBP");
    const us = getLowestOfferPrice(productId, "US", opts);
    if (us) expect(us.currency).toBe("USD");
    const de = getLowestOfferPrice(productId, "DE", opts);
    if (de) expect(de.currency).toBe("EUR");
    const nl = getLowestOfferPrice(productId, "NL", opts);
    expect(nl?.currency).toBe("EUR");
  });
});

describe("DE / UK / US From-price regression", () => {
  const opts = { isDev: false as const };

  it.each([
    ["NL", "EUR"],
    ["DE", "EUR"],
    ["UK", "GBP"],
    ["US", "USD"],
  ] as const)("%s From-price currency matches REGION_META", (region, currency) => {
    expect(REGION_META[region].currency).toBe(currency);
    const offers = getOffersForProduct("prod-novablast-6", region);
    for (const o of offers) {
      expect(o.currency).toBe(currency);
    }
    const from = getLowestOfferPrice("prod-novablast-6", region, opts);
    if (from) expect(from.currency).toBe(currency);
  });

  it("NL visitor does not receive the UK GBP Novablast 5 offer as From-price", () => {
    const nl = getLowestOfferPrice("prod-novablast-5", "NL", opts);
    const uk = getLowestOfferPrice("prod-novablast-5", "UK", opts);
    expect(nl?.currency).toBe("EUR");
    expect(nl?.price).toBe(130);
    if (uk) {
      expect(uk.currency).toBe("GBP");
      expect(uk.price).not.toBe(nl!.price);
    }
  });
});
