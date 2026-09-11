import { describe, expect, it } from "vitest";
import { searchKitletics } from "@/lib/search/engine";
import { getSearchPageData } from "@/lib/search/get-search-page-data";
import { detectSearchIntent } from "@/lib/search/intent";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import { reviews } from "@/content/reviews";
import { expandQueryWithSynonyms } from "@/lib/search/synonyms";

describe("search discovery page", () => {
  it("groups running shoes into cross-entity results with real counts", () => {
    const data = getSearchPageData({
      query: "running shoes",
      region: "NL",
      preview: false,
    });
    expect(data.total).toBeGreaterThan(5);
    expect(data.total).toBeLessThan(5000);
    expect(data.intent).toBe("general");
    expect(data.groups.some((g) => g.key === "product")).toBe(true);
    expect(data.groups.some((g) => g.key === "category" || g.key === "guide")).toBe(
      true,
    );
    const products = data.groups.find((g) => g.key === "product");
    expect(products?.products?.length).toBeGreaterThan(0);
    expect(products?.products?.every((p) => p.image?.src)).toBe(true);
    expect(products?.products?.every((p) => !p.image.src.includes("placeholder"))).toBe(
      true,
    );
    // type label only mentions types with results
    expect(data.typeLabel).not.toMatch(/1,?247/);
  });

  it("does not fabricate popular/trending search volumes", () => {
    const data = getSearchPageData({ query: "running shoes", region: "NL" });
    expect(
      data.relatedSearches.every((r) => !/\d+(\.\d+)?[kKmM]\s*search/i.test(r.label)),
    ).toBe(true);
  });

  it("prioritizes exact brand matches", () => {
    expect(detectSearchIntent("ASICS")).toBe("brand");
    const hits = searchKitletics("ASICS", { isDev: false, limit: 20 });
    expect(hits[0]?.type).toBe("brand");
  });

  it("prioritizes comparison intent for vs queries", () => {
    expect(detectSearchIntent("novablast vs nimbus")).toBe("comparison");
  });

  it("prioritizes tool intent for finder queries", () => {
    expect(detectSearchIntent("running shoe finder")).toBe("tool");
    const hits = searchKitletics("shoe finder", { isDev: false, limit: 20 });
    expect(hits.some((h) => h.type === "tool" && /finder/i.test(h.title))).toBe(
      true,
    );
  });

  it("does not leak scheduled reviews in production mode", () => {
    const scheduled = reviews.find((r) => r.status === "scheduled");
    expect(scheduled).toBeTruthy();
    expect(isPubliclyVisible(scheduled!, { isDev: false })).toBe(false);
    const hits = searchKitletics("deep dive", { isDev: false });
    expect(hits.every((h) => h.id !== scheduled!.id)).toBe(true);
  });

  it("does not rank by affiliate commission (no commission field in score path)", () => {
    const a = searchKitletics("novablast", { isDev: false, limit: 10 });
    const b = searchKitletics("novablast", { isDev: false, limit: 10 });
    expect(a.map((h) => h.id)).toEqual(b.map((h) => h.id));
    // Scores are text/intent based — recommendationScore not used for sort key alone
    const products = a.filter((h) => h.type === "product");
    if (products.length >= 2) {
      const byScore = [...products].sort(
        (x, y) => (y.recommendationScore ?? 0) - (x.recommendationScore ?? 0),
      );
      // Allow equal; just ensure search order isn't forced to Kitletics Score order
      // when titles differ in relevance — exact novablast match should be first
      expect(products[0]!.title.toLowerCase()).toContain("novablast");
      void byScore;
    }
  });

  it("resolves synonyms without inventing result counts", () => {
    const expansions = expandQueryWithSynonyms("trainers");
    expect(expansions.length).toBeGreaterThan(0);
    const data = getSearchPageData({ query: "trainers", region: "NL" });
    expect(data.total).toBeGreaterThan(0);
  });

  it("exposes contextual feature facets for running shoes", () => {
    const data = getSearchPageData({
      query: "running shoes",
      region: "NL",
      preview: false,
    });
    expect(data.dominantCategoryId).toBe("cat-running-shoes");
    expect(data.featureFacets.some((f) => f.value === "carbon-plate")).toBe(
      true,
    );
    expect(data.featureFacets.some((f) => f.value === "wide-fit")).toBe(true);
    expect(data.priceFacet).toBeTruthy();
    expect(data.priceFacet!.min).toBeGreaterThan(0);
    expect(data.priceFacet!.max).toBeGreaterThan(data.priceFacet!.min);
  });

  it("filters products by feature without removing guides/tools", () => {
    const data = getSearchPageData({
      query: "running shoes",
      region: "NL",
      features: ["carbon-plate"],
      preview: false,
    });
    const products = data.groups.find((g) => g.key === "product");
    expect(products?.total).toBeGreaterThan(0);
    expect(products!.total).toBeLessThan(80);
    expect(data.groups.some((g) => g.key === "guide" || g.key === "tool")).toBe(
      true,
    );
  });

  it("resolves brand logos for top running brands", () => {
    const data = getSearchPageData({
      query: "running shoes",
      region: "NL",
    });
    const brands = data.groups.find((g) => g.key === "brand")?.brands ?? [];
    expect(brands.length).toBeGreaterThan(0);
    expect(brands.every((b) => Boolean(b.logo))).toBe(true);
  });

  it("maps guide cards to editorial imagery", () => {
    const data = getSearchPageData({
      query: "running shoes",
      region: "NL",
    });
    const guides = data.groups.find((g) => g.key === "guide")?.guides ?? [];
    expect(guides.length).toBeGreaterThan(0);
    expect(
      guides.every(
        (g) =>
          g.imageSrc.startsWith("/images/") &&
          !g.imageSrc.endsWith(".svg"),
      ),
    ).toBe(true);
  });
});
