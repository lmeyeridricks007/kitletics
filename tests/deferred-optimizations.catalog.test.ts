import { describe, expect, it } from "vitest";
import { getBestIndexShellData } from "@/lib/best/get-best-index-shell";
import { getBrandsIndexShellData } from "@/lib/brands/get-brands-index-shell";
import { getReviewsIndexShellData } from "@/lib/review/get-reviews-index-shell";
import { getGuidesIndexShellData } from "@/lib/guides/get-guides-index-shell";
import { getSetupsIndexShellData } from "@/lib/setups/get-setups-index-shell";
import { getCompareIndexShellData } from "@/lib/comparison/get-compare-index-shell";
import { getSearchPageData } from "@/lib/search/get-search-page-data";
import { searchKitletics } from "@/lib/search/engine";
import { getProducts } from "@/repositories";

function kb(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), "utf8") / 1024;
}

describe("Compact index payloads", () => {
  it("does not ship full editorial bodies to the browser", () => {
    const best = getBestIndexShellData();
    const brands = getBrandsIndexShellData();
    const reviews = getReviewsIndexShellData();
    const guides = getGuidesIndexShellData();
    const setups = getSetupsIndexShellData();
    const compare = getCompareIndexShellData();

    expect(best.cards.length).toBeGreaterThan(10);
    expect(reviews.cards.length).toBeGreaterThan(50);
    expect(kb(best)).toBeLessThan(200);
    expect(kb(brands)).toBeLessThan(80);
    expect(kb(reviews)).toBeLessThan(400);
    expect(kb(guides)).toBeLessThan(400);
    expect(kb(setups)).toBeLessThan(40);
    expect(kb(compare.featured)).toBeLessThan(200);
    expect(JSON.stringify(reviews)).not.toMatch(/"sections"\s*:/);
    expect(JSON.stringify(best)).not.toMatch(/selectionMethodology/);
  });
});

describe("Search 5000-hit ceiling", () => {
  it("scores a lightweight in-memory index smaller than the ceiling", () => {
    expect(getProducts().length).toBeLessThan(5000);
    const hits = searchKitletics("shoes", { limit: 5000 });
    expect(hits.length).toBeGreaterThan(10);
    expect(hits.length).toBeLessThan(5000);
    const page = getSearchPageData({ query: "novablast", region: "NL" });
    expect(page.total).toBeGreaterThan(0);
    expect(page.featureFacets.length + page.typeFacets.length).toBeGreaterThan(0);
  });
});
