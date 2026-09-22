import { describe, expect, it } from "vitest";
import {
  assembleCategoryPage,
  getCatalogProducts,
  parseCatalogSearchParams,
  catalogHref,
  serializeCatalogSearchParams,
} from "@/lib/catalog";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { products } from "@/content/products";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import { getLowestOfferPrice, getCategoryBySlug, getProductById } from "@/repositories";

describe("Running Shoes catalog", () => {
  it("assembles /running/shoes successfully", () => {
    const page = assembleCategoryPage({
      sportSlug: "running",
      pathSegment: "shoes",
      options: { isDev: false },
    });
    expect(page).toBeTruthy();
    expect(page!.category.slug).toBe("running-shoes");
    expect(page!.basePath).toBe("/running/shoes");
    expect(page!.catalog.total).toBeGreaterThan(0);
  });

  it("only includes running-shoe products", () => {
    const page = assembleCategoryPage({
      sportSlug: "running",
      pathSegment: "shoes",
      options: { isDev: false },
    });
    expect(
      page!.catalog.products.every(
        (r) => r.categoryId === "cat-running-shoes",
      ),
    ).toBe(true);
  });

  it("filters by brand", () => {
    const result = getCatalogProducts(
      {
        sportId: "sport-running",
        categoryId: "cat-running-shoes",
        filters: {
          type: [],
          brand: ["asics"],
          specs: {},
          useCase: [],
          sort: "recommended",
        },
        unpaginated: true,
      },
      { isDev: false },
    );
    expect(result.total).toBeGreaterThan(0);
    expect(
      result.products.every((r) =>
        (r.brandName ?? "").toLowerCase().includes("asics"),
      ),
    ).toBe(true);
  });

  it("filters by cushion", () => {
    const result = getCatalogProducts(
      {
        sportId: "sport-running",
        categoryId: "cat-running-shoes",
        filters: {
          type: [],
          brand: [],
          specs: { cushionLevel: ["high"] },
          useCase: [],
          sort: "recommended",
        },
        unpaginated: true,
      },
      { isDev: false },
    );
    expect(result.total).toBeGreaterThan(0);
    expect(
      result.products.every((r) => {
        const product = getProductById(r.id, { isDev: false });
        return product?.specifications.cushionLevel === "high";
      }),
    ).toBe(true);
    expect(result.products.every((r) => !("cushionLevel" in r))).toBe(true);
  });

  it("combines multiple filters", () => {
    const result = getCatalogProducts(
      {
        sportId: "sport-running",
        categoryId: "cat-running-shoes",
        filters: {
          type: ["daily-trainers"],
          brand: ["asics"],
          specs: { cushionLevel: ["high"] },
          useCase: [],
          sort: "recommended",
        },
        unpaginated: true,
      },
      { isDev: false },
    );
    for (const row of result.products) {
      expect((row.brandName ?? "").toLowerCase()).toContain("asics");
      expect(getProductById(row.id, { isDev: false })?.specifications.cushionLevel).toBe("high");
      expect("cushionLevel" in row).toBe(false);
      expect(
        row.subcategoryLabels.some((l) =>
          l.toLowerCase().includes("daily"),
        ),
      ).toBe(true);
    }
  });

  it("parses and serializes query state (refresh-safe)", () => {
    const parsed = parseCatalogSearchParams({
      type: "daily-trainers",
      brand: "asics,hoka",
      cushion: "high",
      sort: "score",
    });
    expect(parsed.type).toEqual(["daily-trainers"]);
    expect(parsed.brand).toEqual(["asics", "hoka"]);
    expect(parsed.specs.cushionLevel).toEqual(["high"]);
    expect(parsed.sort).toBe("score");

    const href = catalogHref("/running/shoes", parsed);
    expect(href).toContain("type=daily-trainers");
    expect(href).toContain("brand=asics%2Choka");
    expect(href).toContain("cushion=high");
    expect(href).toContain("sort=score");

    const roundTrip = parseCatalogSearchParams(
      Object.fromEntries(new URL(href, "https://kitletics.com").searchParams),
    );
    expect(roundTrip.type).toEqual(parsed.type);
    expect(roundTrip.brand).toEqual(parsed.brand);
    expect(roundTrip.specs.cushionLevel).toEqual(parsed.specs.cushionLevel);
  });

  it("derives facet counts from catalog", () => {
    const result = getCatalogProducts(
      {
        sportId: "sport-running",
        categoryId: "cat-running-shoes",
        filters: {
          type: [],
          brand: [],
          specs: {},
          useCase: [],
          sort: "recommended",
        },
        unpaginated: true,
      },
      { isDev: false },
    );
    const brandFacet = result.availableFilters.find((f) => f.key === "brand");
    expect(brandFacet).toBeTruthy();
    expect(brandFacet!.options.every((o) => o.count > 0)).toBe(true);
    const asics = brandFacet!.options.find((o) => o.value === "asics");
    expect(asics?.count).toBe(
      result.products.filter((r) =>
        (r.brandName ?? "").toLowerCase().includes("asics"),
      ).length,
    );
  });

  it("sorts by score", () => {
    const result = getCatalogProducts(
      {
        sportId: "sport-running",
        categoryId: "cat-running-shoes",
        filters: {
          type: [],
          brand: [],
          specs: {},
          useCase: [],
          sort: "score",
        },
        unpaginated: true,
      },
      { isDev: false },
    );
    const scores = result.products.map((r) => r.score ?? -1);
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted);
  });

  it("excludes unpublished products", () => {
    const draft = products.find((p) => p.status === "draft");
    expect(draft).toBeTruthy();
    expect(isPubliclyVisible(draft!, { isDev: false })).toBe(false);

    const result = getCatalogProducts(
      {
        sportId: "sport-running",
        categoryId: "cat-running-shoes",
        filters: {
          type: [],
          brand: [],
          specs: {},
          useCase: [],
          sort: "recommended",
        },
        unpaginated: true,
      },
      { isDev: false },
    );
    expect(result.products.every((r) => r.id !== draft!.id)).toBe(true);
  });

  it("uses regional NL pricing when available", () => {
    const result = getCatalogProducts(
      {
        sportId: "sport-running",
        categoryId: "cat-running-shoes",
        region: DEFAULT_REGION,
        filters: {
          type: [],
          brand: [],
          specs: {},
          useCase: [],
          sort: "recommended",
        },
        unpaginated: true,
      },
      { isDev: false },
    );
    const withPrice = result.products.find((r) => r.price);
    expect(withPrice).toBeTruthy();
    const nl = getLowestOfferPrice(withPrice!.id, "NL", {
      isDev: false,
    });
    expect(withPrice!.price?.price).toBe(nl?.price);
    expect(withPrice!.price?.currency).toBe(nl?.currency);
  });

  it("omits price safely when no regional offer", () => {
    const result = getCatalogProducts(
      {
        sportId: "sport-running",
        categoryId: "cat-running-shoes",
        region: "ZA",
        filters: {
          type: [],
          brand: [],
          specs: {},
          useCase: [],
          sort: "recommended",
        },
      },
      { isDev: false },
    );
    // ZA may have no offers — rows should still render without crashing
    expect(result.products.length).toBeGreaterThan(0);
    for (const row of result.products) {
      if (row.price) {
        expect(typeof row.price.price).toBe("number");
      }
    }
  });

  it("returns empty result state for impossible filters", () => {
    const result = getCatalogProducts(
      {
        sportId: "sport-running",
        categoryId: "cat-running-shoes",
        filters: {
          type: ["daily-trainers"],
          brand: ["asics"],
          specs: { cushionLevel: ["minimal"] },
          useCase: [],
          sort: "recommended",
        },
      },
      { isDev: false },
    );
    // May be 0 — that's the empty state we design for
    expect(result.total).toBe(result.products.length);
    if (result.total === 0) {
      expect(result.activeFilters.length).toBeGreaterThan(0);
    }
  });

  it("documents canonical category path (not /gear/running-shoes)", () => {
    const category = getCategoryBySlug("running-shoes");
    expect(category?.pathSegment).toBe("shoes");
    const page = assembleCategoryPage({
      sportSlug: "running",
      pathSegment: "shoes",
    });
    expect(page!.basePath).toBe("/running/shoes");
    // Filtered URLs keep path; query is additive
    const href = catalogHref(page!.basePath, {
      type: ["daily-trainers"],
      brand: [],
      specs: {},
      useCase: [],
      sort: "recommended",
    });
    expect(href.startsWith("/running/shoes")).toBe(true);
    expect(serializeCatalogSearchParams({
      type: ["daily-trainers"],
      brand: [],
      specs: {},
      useCase: [],
      sort: "recommended",
    }).toString()).toContain("type=daily-trainers");
  });

  it("other running categories assemble as lightweight shells", () => {
    for (const segment of [
      "watches",
      "heart-rate-monitors",
      "hydration",
      "packs",
      "clothing",
      "socks",
      "headphones",
      "sunglasses",
      "recovery",
      "accessories",
      "nutrition",
    ]) {
      const page = assembleCategoryPage({
        sportSlug: "running",
        pathSegment: segment,
        options: { isDev: false },
      });
      expect(page, segment).toBeTruthy();
      expect(page!.basePath).toBe(`/running/${segment}`);
    }
  });
});

describe("Padel rackets catalog", () => {
  it("assembles /padel/rackets with matching header and grid counts", () => {
    const page = assembleCategoryPage({
      sportSlug: "padel",
      pathSegment: "rackets",
      options: { isDev: false },
    });
    expect(page).toBeTruthy();
    expect(page!.basePath).toBe("/padel/rackets");
    expect(page!.catalog.total).toBeGreaterThan(0);
    expect(page!.productCount).toBe(page!.catalog.total);
    expect(page!.config.hero.primaryCta.label).not.toMatch(/^Browse /);
  });

  it("does not zero the catalog on shoe-style weight= query params", () => {
    const page = assembleCategoryPage({
      sportSlug: "padel",
      pathSegment: "rackets",
      searchParams: { weight: "light" },
      options: { isDev: false },
    });
    expect(page!.catalog.total).toBeGreaterThan(0);
    expect(page!.catalog.total).toBe(page!.productCount);
  });

  it("filters padel frames by weightMin buckets", () => {
    const result = getCatalogProducts(
      {
        sportId: "sport-padel",
        categoryId: "cat-padel-rackets",
        filters: {
          type: [],
          brand: [],
          specs: { weightMin: ["350-365"] },
          useCase: [],
          sort: "recommended",
        },
        unpaginated: true,
      },
      { isDev: false },
    );
    expect(result.total).toBeGreaterThan(0);
    expect(
      result.availableFilters.some(
        (f) =>
          (f.key === "weightMin" || f.key === "minimum-weight") &&
          f.options.length > 0,
      ),
    ).toBe(true);
  });

  it("does not assemble empty held-vertical tennis catalogs", () => {
    const page = assembleCategoryPage({
      sportSlug: "tennis",
      pathSegment: "rackets",
      options: { isDev: false },
    });
    expect(page).toBeTruthy();
    expect(page!.productCount).toBe(0);
    expect(page!.catalog.total).toBe(0);
  });
});
