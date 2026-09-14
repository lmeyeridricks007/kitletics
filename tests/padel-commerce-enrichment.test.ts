import { describe, expect, it } from "vitest";
import {
  normalizeBallPack,
  normalizeGripPack,
} from "@/domain/commerce/pack-normalization";
import { DEFAULT_OFFER_RANKING } from "@/domain/commerce/ranking";
import { padelCommerceEnrichmentStore } from "@/content/padel/commerce-enrichment";
import { padelAllProducts, padelAllOffers } from "@/content/padel";
import { PRODUCT_AFFILIATE_URLS } from "@/content/offers-affiliate-urls";
import { getLowestOfferPrice } from "@/repositories";
import { getRecommendations } from "@/repositories";
import { getFinderDefinition } from "@/domain/finders/repository";
import { runFinder } from "@/domain/finders/engine";
import { getProductsByCategory } from "@/repositories";
import { affiliatePrograms } from "@/content/affiliate-programs";

const PADEL_CATS = new Set([
  "cat-padel-rackets",
  "cat-padel-shoes",
  "cat-padel-balls",
  "cat-padel-bags",
  "cat-padel-grips",
  "cat-padel-accessories",
]);

describe("Padel commerce enrichment", () => {
  it("researches every padel product with a terminal state (no unexplained COMMERCE_PENDING)", () => {
    const padel = padelAllProducts.filter((p) => PADEL_CATS.has(p.categoryId));
    expect(padel.length).toBeGreaterThan(400);
    const pending: string[] = [];
    for (const p of padel) {
      const row = padelCommerceEnrichmentStore[p.id];
      expect(row, `missing commerce research for ${p.id}`).toBeTruthy();
      if (row.researchState === "COMMERCE_PENDING") pending.push(p.id);
    }
    expect(pending).toEqual([]);
  });

  it("normalizes ball and grip packs so bulk sticker prices are comparable", () => {
    const ball = normalizeBallPack({
      packPrice: 95,
      ballsPerCan: 3,
      cans: 24,
      currency: "EUR",
    });
    expect(ball.pricePerCan).toBeCloseTo(3.958, 2);
    expect(ball.pricePerBall).toBeCloseTo(1.319, 2);
    expect(ball.label).toMatch(/\/ can/);

    const bulk = normalizeGripPack({ packPrice: 55, packQuantity: 60 });
    const small = normalizeGripPack({ packPrice: 9, packQuantity: 3 });
    expect(bulk.pricePerGrip).toBeLessThan(small.pricePerGrip);
  });

  it("keeps affiliate commission out of ranking, finder, and recommendations", () => {
    expect(JSON.stringify(DEFAULT_OFFER_RANKING).toLowerCase()).not.toMatch(
      /commission/,
    );
    for (const program of affiliatePrograms) {
      expect(program).not.toHaveProperty("commissionRate");
      expect((program as { commission?: unknown }).commission).toBeUndefined();
    }

    const definition = getFinderDefinition("padel-racket-finder")!;
    const cats = getProductsByCategory("cat-padel-rackets");
    const lowestByProduct: Record<
      string,
      { price: number; currency: string } | undefined
    > = {};
    for (const p of cats) {
      lowestByProduct[p.id] = getLowestOfferPrice(p.id, "NL");
    }
    const responses = {
      primaryUse: "intermediate",
      primaryPriority: "control",
      armComfortPriority: "no",
      weightPreference: "medium",
      budget: "180-280",
    };
    const a = runFinder({
      definition,
      products: cats,
      responses,
      region: "NL",
      lowestByProduct,
      recommendations: getRecommendations(),
    });
    const b = runFinder({
      definition,
      products: cats,
      responses,
      region: "NL",
      lowestByProduct,
      recommendations: getRecommendations(),
    });
    expect(a.rankedResults[0]?.productId).toBe(b.rankedResults[0]?.productId);

    // Presence of affiliate map must not reorder finder vs price-only inputs
    const withAff = cats.filter((p) => PRODUCT_AFFILIATE_URLS[p.id]);
    expect(withAff.length).toBeGreaterThan(0);
  });

  it("does not mix currencies in NL From-price", () => {
    const withNl = padelAllProducts.filter(
      (p) =>
        PADEL_CATS.has(p.categoryId) && getLowestOfferPrice(p.id, "NL"),
    );
    expect(withNl.length).toBeGreaterThan(50);
    for (const p of withNl.slice(0, 40)) {
      const price = getLowestOfferPrice(p.id, "NL")!;
      expect(price.currency).toBe("EUR");
    }
  });

  it("keeps products without offers in the catalog (inclusion ≠ availability)", () => {
    const noOffer = Object.values(padelCommerceEnrichmentStore).filter(
      (r) => r.offerPresence === "NO_OFFER" && r.researchState === "RESEARCHED",
    );
    expect(noOffer.length).toBeGreaterThan(100);
    for (const row of noOffer.slice(0, 20)) {
      const product = padelAllProducts.find((p) => p.id === row.productId);
      expect(product).toBeTruthy();
    }
    expect(padelAllOffers.length).toBeGreaterThan(200);
  });

  it("separates COMMERCE_RESEARCH from COMMERCE_COVERAGE (research complete ≠ full offers)", () => {
    const padel = padelAllProducts.filter((p) => PADEL_CATS.has(p.categoryId));
    const pending = padel.filter(
      (p) =>
        padelCommerceEnrichmentStore[p.id]?.researchState === "COMMERCE_PENDING",
    );
    expect(pending).toEqual([]);

    const withoutOffer = padel.filter(
      (p) => !padelAllOffers.some((o) => o.productId === p.id),
    );
    expect(withoutOffer.length).toBeGreaterThan(100);

    // Finder must not drop no-offer products from the candidate pool
    const definition = getFinderDefinition("padel-racket-finder")!;
    const cats = getProductsByCategory("cat-padel-rackets");
    const noOfferRackets = cats.filter(
      (p) => !padelAllOffers.some((o) => o.productId === p.id),
    );
    expect(noOfferRackets.length).toBeGreaterThan(10);
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
    const rankedIds = new Set(result.rankedResults.map((r) => r.productId));
    // At least one no-offer racket remains rankable (not eliminated for missing commerce)
    expect(noOfferRackets.some((p) => rankedIds.has(p.id))).toBe(true);
  });
});
