import { describe, expect, it } from "vitest";
import {
  getProducts,
  getOffersForProductInRegion,
  getLowestOfferPrice,
} from "@/repositories";
import { shouldDisplayNumericPrice } from "@/domain/commerce/ranking";

describe("commerce freshness & NL coverage (P0)", () => {
  it("has displayable NL prices for the majority of covered products", () => {
    const products = getProducts({ isDev: false });
    let covered = 0;
    let displayable = 0;
    for (const p of products) {
      const offers = getOffersForProductInRegion(p.id, "NL");
      if (!offers.length) continue;
      covered++;
      if (offers.some((o) => shouldDisplayNumericPrice(o))) displayable++;
    }
    expect(covered).toBeGreaterThan(0);
    expect(displayable).toBeGreaterThan(0);
    expect(displayable / covered).toBeGreaterThanOrEqual(0.95);
  });

  it("gives every published running shoe an NL offer", () => {
    const shoes = getProducts({ isDev: false }).filter(
      (p) => p.categoryId === "cat-running-shoes",
    );
    const missing = shoes.filter(
      (p) => getOffersForProductInRegion(p.id, "NL").length === 0,
    );
    expect(missing.map((p) => p.slug)).toEqual([]);
  });

  it("gives every published GPS watch an NL offer", () => {
    const watches = getProducts({ isDev: false }).filter(
      (p) => p.categoryId === "cat-gps-watches",
    );
    const missing = watches.filter(
      (p) => getOffersForProductInRegion(p.id, "NL").length === 0,
    );
    expect(missing.map((p) => p.slug)).toEqual([]);
  });

  it("returns a From-price for hero shoes and watches", () => {
    for (const id of [
      "prod-superblast-2",
      "prod-vomero-18",
      "prod-glycerin-22",
      "prod-bondi-8",
      "prod-novablast-6",
      "prod-forerunner-265",
      "prod-apple-watch-ultra-2",
    ]) {
      const price = getLowestOfferPrice(id, "NL");
      expect(price, id).toBeTruthy();
      expect(price!.price).toBeGreaterThan(0);
      expect(price!.currency).toBe("EUR");
    }
  });
});
