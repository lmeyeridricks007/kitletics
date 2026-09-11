import { describe, expect, it } from "vitest";
import { getCatalogProducts } from "@/lib/catalog/query";
import { getProductBySlug, getVariantsForProduct } from "@/repositories/products";
import { getProductPageData } from "@/lib/product/get-product-page-data";

describe("audience / fit sizing UX data", () => {
  it("running shoes expose men and women filters with distinct counts", () => {
    const all = getCatalogProducts({
      sportId: "sport-running",
      categoryId: "cat-running-shoes",
    });
    const women = getCatalogProducts({
      sportId: "sport-running",
      categoryId: "cat-running-shoes",
      filters: { specs: { genderFit: ["women"] } },
    });
    const unisex = getCatalogProducts({
      sportId: "sport-running",
      categoryId: "cat-running-shoes",
      filters: { specs: { genderFit: ["unisex"] } },
    });
    const facet = all.availableFilters.find((f) => f.key === "genderFit");
    expect(facet?.label).toMatch(/Fit/i);
    expect(women.total).toBeGreaterThan(50);
    expect(unisex.total).toBeGreaterThan(0);
    expect(unisex.total).toBeLessThan(women.total);
    expect(women.products[0]?.audienceLabel).toMatch(/Women/i);
    // Women's weight not invented
    for (const row of women.products.slice(0, 10)) {
      if (row.weight !== undefined) {
        expect(row.weightContext).toBeTruthy();
      }
    }
  });

  it("Ghost 18 product page has men and women variants", () => {
    const product = getProductBySlug("brooks-ghost-18", { isDev: true });
    expect(product).toBeDefined();
    const variants = getVariantsForProduct(product!.id);
    expect(variants.map((v) => v.audience).sort()).toEqual(["men", "women"]);
    const men = variants.find((v) => v.audience === "men");
    expect(men?.weightVerified).toBe(true);
    const women = variants.find((v) => v.audience === "women");
    expect(women?.weightVerified).toBe(false);

    const page = getProductPageData("brooks-ghost-18");
    expect(page?.variants.length).toBeGreaterThanOrEqual(2);
  });
});
