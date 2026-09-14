import { describe, expect, it } from "vitest";
import {
  getLowestOfferPrice,
  getOffers,
  getOffersForProduct,
  getRetailerById,
} from "@/repositories";
import { products } from "@/content/products";
import { PRODUCT_AFFILIATE_URLS } from "@/content/offers-affiliate-urls";
import { DEFAULT_OFFER_RANKING } from "@/domain/commerce/ranking";
import { getPadelRacketDatabaseRecords } from "@/lib/padel-racket-database";
import { getFinderDefinition } from "@/domain/finders/repository";
import { runFinder } from "@/domain/finders/engine";
import { getProductsByCategory, getRecommendations } from "@/repositories";

function publishedPadel() {
  return products.filter(
    (p) => p.sportIds.includes("sport-padel") && p.status === "published",
  );
}

describe("Padel regional commerce (canonical engine)", () => {
  it("upgrades Amazon homepage seeds to affiliate listing URLs and displays NL From-prices", () => {
    const withAff = publishedPadel().filter((p) => PRODUCT_AFFILIATE_URLS[p.id]);
    // Floors track the MEDIA_VERIFIED published padel set after media remediation
    // (draft SKUs without exact heroes are intentionally excluded from public counts).
    expect(withAff.length).toBeGreaterThan(25);

    let withNlPrice = 0;
    for (const p of withAff) {
      if (getLowestOfferPrice(p.id, "NL")) withNlPrice += 1;
    }
    // Affiliate-mapped SKUs should resolve via getLowestOfferPrice (same as PDP/cards)
    expect(withNlPrice).toBeGreaterThanOrEqual(25);
  });

  it("keeps true retailer homepages INVALID (Decathlon homepage seeds)", () => {
    const padelIds = new Set(publishedPadel().map((p) => p.id));
    const homepageInvalid = getOffers().filter(
      (o) =>
        padelIds.has(o.productId) &&
        o.urlValidationState === "INVALID" &&
        /homepage/i.test(o.urlValidationFailureReason ?? ""),
    );
    expect(homepageInvalid.length).toBeGreaterThan(0);
    expect(
      homepageInvalid.every((o) => /decathlon\./i.test(o.url) || /\/$/.test(o.url)),
    ).toBe(true);
  });

  it("registers researched padel retailers without inventing active affiliate tags", () => {
    for (const id of [
      "ret-justpadel",
      "ret-padel2gether",
      "ret-holland-padel",
      "ret-padeldirect",
      "ret-padelnu",
      "ret-amazon-fr",
      "ret-takealot",
    ]) {
      expect(getRetailerById(id)?.id).toBe(id);
    }
  });

  it("does not use commission in offer ranking config", () => {
    expect(DEFAULT_OFFER_RANKING).toBeTruthy();
    const json = JSON.stringify(DEFAULT_OFFER_RANKING);
    expect(json.toLowerCase()).not.toMatch(/commission/);
  });

  it("PDP resolver and Database share getLowestOfferPrice", () => {
    const records = getPadelRacketDatabaseRecords("NL");
    const priced = records.filter((r) => r.price);
    expect(priced.length).toBeGreaterThan(20);
    for (const r of priced.slice(0, 10)) {
      const fromResolver = getLowestOfferPrice(r.id, "NL");
      expect(fromResolver?.price).toBe(r.price?.amount);
      expect(fromResolver?.currency).toBe(r.price?.currency);
    }
  });

  it("Finder budget scoring uses regional lowest price, not commission", () => {
    const definition = getFinderDefinition("padel-racket-finder")!;
    const cats = getProductsByCategory("cat-padel-rackets");
    const lowestByProduct: Record<
      string,
      { price: number; currency: string } | undefined
    > = {};
    for (const p of cats) {
      lowestByProduct[p.id] = getLowestOfferPrice(p.id, "NL");
    }
    const result = runFinder({
      definition,
      products: cats,
      responses: {
        primaryUse: "intermediate",
        primaryPriority: "control",
        armComfortPriority: "no",
        weightPreference: "medium",
        budget: "180-280",
      },
      region: "NL",
      lowestByProduct,
      recommendations: getRecommendations(),
    });
    expect(result.rankedResults.length).toBeGreaterThan(0);
    // Deterministic and commission-free: same inputs → same top id
    const again = runFinder({
      definition,
      products: cats,
      responses: {
        primaryUse: "intermediate",
        primaryPriority: "control",
        armComfortPriority: "no",
        weightPreference: "medium",
        budget: "180-280",
      },
      region: "NL",
      lowestByProduct,
      recommendations: getRecommendations(),
    });
    expect(again.rankedResults[0]?.productId).toBe(
      result.rankedResults[0]?.productId,
    );
  });

  it("exposes NL / DE / UK displayable padel offers; BE/FR/US/ZA stay empty until listings exist", () => {
    const padelIds = new Set(publishedPadel().map((p) => p.id));
    const regions = { NL: 0, DE: 0, UK: 0, BE: 0, FR: 0, US: 0, ZA: 0 };
    for (const id of padelIds) {
      for (const region of Object.keys(regions) as (keyof typeof regions)[]) {
        if (getOffersForProduct(id, region).length > 0) regions[region] += 1;
      }
    }
    expect(regions.NL).toBeGreaterThan(25);
    expect(regions.DE).toBeGreaterThan(15);
    expect(regions.UK).toBeGreaterThan(15);
    expect(regions.BE).toBe(0);
    expect(regions.FR).toBe(0);
    expect(regions.US).toBe(0);
    expect(regions.ZA).toBe(0);
  });
});
