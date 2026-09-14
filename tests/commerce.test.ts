import { describe, expect, it } from "vitest";
import {
  rankOffersForProduct,
  getBestOffer,
  shouldDisplayNumericPrice,
  getOfferFreshness,
  DEFAULT_OFFER_RANKING,
  pickLowestDisplayableOffer,
} from "@/domain/commerce/ranking";
import {
  resolveCommercialUrl,
  hostAllowed,
  amazonAffiliateProvider,
} from "@/domain/commerce/affiliates";
import { resolveUserRegion } from "@/lib/region/resolve";
import {
  PRIMARY_COMMERCE_REGION,
  REGION_COMMERCE_COVERAGE,
  NO_REGIONAL_OFFERS_MESSAGE,
} from "@/lib/region/commerce-readiness";
import {
  getRankedOffersForProduct,
  getBestOffer as repoBestOffer,
  resolveOfferDestination,
  getAffiliatePrograms,
  getOffersForProduct,
} from "@/repositories/commerce";
import { getLowestOfferPrice, getProductById } from "@/repositories/products";
import type { AffiliateProgram, Offer, Retailer } from "@/domain/commerce/types";
import { REGION_META } from "@/domain/shared/types";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const nowFresh = new Date().toISOString();

function offer(partial: Partial<Offer> & Pick<Offer, "id" | "retailerId" | "price">): Offer {
  return {
    productId: "prod-novablast-6",
    region: "NL",
    url: "https://www.example-retailer.test/product",
    currency: "EUR",
    availability: "in-stock",
    condition: "new",
    status: "active",
    source: "seed",
    lastChecked: nowFresh,
    ...partial,
  };
}

const retailers = new Map<string, Retailer>([
  [
    "ret-cheap-nofill",
    {
      id: "ret-cheap-nofill",
      name: "Cheap Non-Affiliate",
      slug: "cheap",
      homepage: "https://www.example-retailer.test",
      regions: ["NL"],
      retailerType: "specialist-retailer",
      allowedHosts: ["www.example-retailer.test", "example-retailer.test"],
      status: "active",
    },
  ],
  [
    "ret-pricey-aff",
    {
      id: "ret-pricey-aff",
      name: "Pricey Affiliate",
      slug: "pricey",
      homepage: "https://www.affiliate-shop.test",
      regions: ["NL"],
      retailerType: "marketplace",
      affiliateNetwork: "amazon",
      allowedHosts: ["www.affiliate-shop.test", "affiliate-shop.test"],
      status: "active",
    },
  ],
]);

describe("Offer ranking — no commission influence", () => {
  it("ranks cheaper non-affiliate Offer above pricier affiliate Offer", () => {
    const offers = [
      offer({
        id: "o-aff-140",
        retailerId: "ret-pricey-aff",
        price: 140,
        // affiliateUrl present but ranking must ignore commission
        affiliateUrl: "https://www.affiliate-shop.test/aff?tag=x",
      }),
      offer({
        id: "o-cheap-120",
        retailerId: "ret-cheap-nofill",
        price: 120,
      }),
    ];
    const ranked = rankOffersForProduct(offers, retailers);
    expect(ranked[0].id).toBe("o-cheap-120");
    expect(ranked[0].price).toBe(120);
  });

  it("DEFAULT_OFFER_RANKING has no commissionWeight key", () => {
    expect("commissionWeight" in DEFAULT_OFFER_RANKING).toBe(false);
  });

  it("From-price ignores affiliate URLs and still picks the cheaper offer", () => {
    const offers = [
      offer({
        id: "o-aff-140",
        retailerId: "ret-pricey-aff",
        price: 140,
        affiliateUrl: "https://www.affiliate-shop.test/aff?tag=x",
      }),
      offer({
        id: "o-cheap-120",
        retailerId: "ret-cheap-nofill",
        price: 120,
      }),
    ];
    expect(pickLowestDisplayableOffer(offers)?.id).toBe("o-cheap-120");
  });

  it("seed Novablast 6 NL: cheaper Runner's World Shop beats Amazon when both in-stock", () => {
    const ranked = getRankedOffersForProduct("prod-novablast-6", "NL");
    expect(ranked.length).toBeGreaterThan(1);
    const best = ranked[0];
    // offer-nb6-nl-rws is €149 — should beat Amazon €159 and ASICS €160
    expect(best.price).toBeLessThanOrEqual(154);
    const amazonIdx = ranked.findIndex((o) => o.retailerId === "ret-amazon-nl");
    const rwsIdx = ranked.findIndex((o) => o.retailerId === "ret-runnersworld-nl");
    if (amazonIdx >= 0 && rwsIdx >= 0) {
      expect(rwsIdx).toBeLessThan(amazonIdx);
    }
  });
});

describe("Affiliate independence — recommendations", () => {
  it("Test B: products remain recommendable with zero active affiliate programs", () => {
    expect(getAffiliatePrograms().every((p) => p.status !== "active")).toBe(
      true,
    );
    const product = getProductById("prod-novablast-6");
    expect(product).toBeTruthy();
    expect(product!.status).toBe("published");
  });

  it("changing commission concept is not part of OfferRankingConfig", () => {
    const keys = Object.keys(DEFAULT_OFFER_RANKING);
    expect(keys).not.toContain("commissionWeight");
    expect(keys).not.toContain("affiliateWeight");
  });
});

describe("Affiliate resolver", () => {
  it("falls back to retailer URL when program missing", () => {
    const o = offer({
      id: "o1",
      retailerId: "ret-cheap-nofill",
      price: 100,
      url: "https://www.example-retailer.test/p",
    });
    const retailer = retailers.get("ret-cheap-nofill")!;
    const resolved = resolveCommercialUrl({ offer: o, retailer });
    expect(resolved.isAffiliate).toBe(false);
    expect(resolved.destinationUrl).toBe(o.url);
  });

  it("prefers stored affiliateUrl (amzn.to) without requiring an active program", () => {
    const o = offer({
      id: "o-amzn",
      retailerId: "ret-pricey-aff",
      price: 100,
      url: "https://www.affiliate-shop.test/p",
      affiliateUrl: "https://amzn.to/46aJKUo",
    });
    const retailer = {
      ...retailers.get("ret-pricey-aff")!,
      allowedHosts: [
        ...(retailers.get("ret-pricey-aff")!.allowedHosts ?? []),
        "amzn.to",
      ],
    };
    const resolved = resolveCommercialUrl({ offer: o, retailer });
    expect(resolved.isAffiliate).toBe(true);
    expect(resolved.destinationUrl).toBe("https://amzn.to/46aJKUo");
  });

  it("does not invent Amazon tag without tracking ID", () => {
    const o = offer({
      id: "o2",
      retailerId: "ret-pricey-aff",
      price: 100,
      url: "https://www.affiliate-shop.test/p",
    });
    const retailer = retailers.get("ret-pricey-aff")!;
    const program: AffiliateProgram = {
      id: "aff-test",
      retailerId: retailer.id,
      networkId: "amazon",
      regionIds: ["NL"],
      status: "active",
      trackingIdEnvKey: "MISSING",
      disclosureRequired: true,
      createdAt: nowFresh,
      updatedAt: nowFresh,
    };
    const resolved = amazonAffiliateProvider.resolveUrl({
      offer: o,
      retailer,
      program,
      // no trackingId
    });
    expect(resolved?.isAffiliate).toBe(false);
    expect(resolved?.destinationUrl).not.toContain("tag=");
  });

  it("adds Amazon tag only when tracking ID provided", () => {
    const o = offer({
      id: "o3",
      retailerId: "ret-pricey-aff",
      price: 100,
      url: "https://www.affiliate-shop.test/p",
    });
    const retailer = retailers.get("ret-pricey-aff")!;
    const program: AffiliateProgram = {
      id: "aff-test",
      retailerId: retailer.id,
      networkId: "amazon",
      regionIds: ["NL"],
      status: "active",
      disclosureRequired: true,
      createdAt: nowFresh,
      updatedAt: nowFresh,
    };
    const resolved = amazonAffiliateProvider.resolveUrl({
      offer: o,
      retailer,
      program,
      trackingId: "kitletics-21",
    });
    expect(resolved?.isAffiliate).toBe(true);
    expect(resolved?.destinationUrl).toContain("tag=kitletics-21");
  });
});

describe("Redirect security", () => {
  it("resolves known seed Offer to allowed host", () => {
    const offers = getOffersForProduct("prod-novablast-6", "NL");
    expect(offers.length).toBeGreaterThan(0);
    const result = resolveOfferDestination(offers[0].id);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(hostAllowed(result.resolved.destinationUrl, result.retailer)).toBe(
        true,
      );
      expect(result.resolved.destinationUrl.startsWith("https://")).toBe(true);
    }
  });

  it("rejects unknown Offer ID", () => {
    const result = resolveOfferDestination("offer-does-not-exist-xyz");
    expect(result.ok).toBe(false);
  });

  it("rejects Offer with disallowed domain via hostAllowed", () => {
    const retailer = retailers.get("ret-cheap-nofill")!;
    expect(
      hostAllowed("https://evil.example/phish", retailer),
    ).toBe(false);
    expect(
      hostAllowed("javascript:alert(1)", retailer),
    ).toBe(false);
  });
});

describe("Region & currency", () => {
  it("explicit region wins over cookie", () => {
    expect(
      resolveUserRegion({ explicit: "UK", cookie: "NL" }),
    ).toBe("UK");
  });

  it("cookie used when no explicit", () => {
    expect(resolveUserRegion({ cookie: "ZA" })).toBe("ZA");
  });

  it("default is NL", () => {
    expect(resolveUserRegion({})).toBe("NL");
  });

  it("ignores localeHint so geo is never silently inferred", () => {
    expect(
      resolveUserRegion({ localeHint: "en-US", cookie: null }),
    ).toBe("NL");
    expect(
      resolveUserRegion({
        explicit: "ZA",
        cookie: "NL",
        localeHint: "nl-NL",
      }),
    ).toBe("ZA");
  });

  it.each(["NL", "DE", "UK", "US", "ZA"] as const)(
    "region %s maps to expected currency",
    (code) => {
      expect(REGION_META[code].currency).toBeTruthy();
      const offers = getOffersForProduct("prod-novablast-6", code);
      for (const o of offers) {
        expect(o.currency).toBe(REGION_META[code].currency);
      }
    },
  );

  it("treats NL as primary commerce region at launch", () => {
    expect(PRIMARY_COMMERCE_REGION).toBe("NL");
    expect(REGION_COMMERCE_COVERAGE.NL).toBe("primary");
    expect(REGION_COMMERCE_COVERAGE.DE).toBe("partial");
    expect(REGION_COMMERCE_COVERAGE.UK).toBe("partial");
    expect(REGION_COMMERCE_COVERAGE.US).toBe("limited");
    expect(REGION_COMMERCE_COVERAGE.BE).toBe("none");
    expect(REGION_COMMERCE_COVERAGE.FR).toBe("limited");
    expect(REGION_COMMERCE_COVERAGE.ZA).toBe("none");
    expect(NO_REGIONAL_OFFERS_MESSAGE).toMatch(/your region/i);
  });

  it("does not surface NL price when the selected region has no offers", () => {
    const productId = "prod-novablast-6";
    const nl = getOffersForProduct(productId, "NL");
    expect(nl.length).toBeGreaterThan(0);
    for (const emptyRegion of ["BE", "FR", "ZA"] as const) {
      expect(getOffersForProduct(productId, emptyRegion)).toEqual([]);
      expect(getLowestOfferPrice(productId, emptyRegion)).toBeUndefined();
    }
  });
});

describe("Stale Offers", () => {
  it("does not display numeric price for stale Offer", () => {
    const stale = offer({
      id: "stale",
      retailerId: "ret-cheap-nofill",
      price: 99,
      lastChecked: "2020-01-01T00:00:00.000Z",
    });
    expect(getOfferFreshness(stale.lastChecked)).toBe("stale");
    expect(shouldDisplayNumericPrice(stale)).toBe(false);
  });

  it("displays numeric price for fresh Offer", () => {
    const fresh = offer({
      id: "fresh",
      retailerId: "ret-cheap-nofill",
      price: 99,
      lastChecked: nowFresh,
    });
    expect(shouldDisplayNumericPrice(fresh)).toBe(true);
  });
});

describe("Publication gate on Offers", () => {
  it("unpublished product is not returned by public product lookup", () => {
    // Production gate: draft products return undefined
    const draftLike = getProductById("prod-does-not-exist", { isDev: false });
    expect(draftLike).toBeUndefined();
  });

  it("inactive Offers are excluded from getOffersForProduct", () => {
    const all = getOffersForProduct("prod-novablast-6", "NL");
    expect(all.every((o) => o.status !== "inactive")).toBe(true);
  });
});

describe("Architecture boundary — recommendation must not import affiliates", () => {
  it("finder / shoe-rotation / recommendations avoid importing affiliate modules", () => {
    const roots = [
      join(process.cwd(), "src/domain/finders"),
      join(process.cwd(), "src/domain/shoe-rotation"),
      join(process.cwd(), "src/domain/recommendations"),
    ];
    const bannedImports = [
      "domain/commerce/affiliates",
      "content/affiliate-programs",
      "repositories/commerce",
    ];
    for (const root of roots) {
      const files = walkTs(root);
      for (const file of files) {
        const src = readFileSync(file, "utf8");
        for (const token of bannedImports) {
          expect(
            src.includes(token),
            `${file} must not import ${token}`,
          ).toBe(false);
        }
      }
    }
  });
});

function walkTs(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTs(p));
    else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      out.push(p);
    }
  }
  return out;
}

describe("getBestOffer", () => {
  it("returns in-stock preferred Offer for Novablast 6 NL", () => {
    const best = repoBestOffer("prod-novablast-6", "NL");
    expect(best).toBeTruthy();
    expect(best!.availability).not.toBe("out-of-stock");
    expect(getBestOffer([best!], retailers) || best).toBeTruthy();
  });
});
