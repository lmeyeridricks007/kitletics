import { describe, expect, it } from "vitest";
import {
  buildCompareProductIndex,
  getCompareCategoryOptions,
  searchCompareProducts,
  findIndexItemsBySlugs,
} from "@/lib/comparison/product-index";
import {
  parseCompareProductsParam,
  buildCompareHref,
  addProductSlug,
  removeProductSlug,
  replaceProductSlug,
  COMPARE_MAX_PRODUCTS,
} from "@/lib/comparison/selection";
import { getComparisonInsights } from "@/lib/comparison/insights";
import {
  compareProducts,
  findPublishedComparisonForProducts,
} from "@/lib/comparison/engine";
import { getDynamicComparisonData } from "@/lib/comparison/get-comparison-page-data";
import {
  getComparisons,
  getProducts,
  getSpecificationDefinitions,
} from "@/repositories";
import { getComparisonCategoryConfig } from "@/lib/comparison/category-config";

describe("Compare product index", () => {
  it("builds lightweight index without crashing", () => {
    const index = buildCompareProductIndex({ isDev: false });
    expect(index.length).toBeGreaterThan(5);
    expect(index[0]).toHaveProperty("slug");
    expect(index[0]).toHaveProperty("brandName");
    expect(index[0]).not.toHaveProperty("specifications");
  });

  it("lists categories with ready flag", () => {
    const index = buildCompareProductIndex({ isDev: false });
    const cats = getCompareCategoryOptions(index, { isDev: false });
    const shoes = cats.find((c) => c.slug === "running-shoes");
    const watches = cats.find((c) => c.slug === "gps-watches");
    expect(shoes?.ready).toBe(true);
    expect(watches?.ready).toBe(true);
  });

  it("searches by prefix and brand", () => {
    const index = buildCompareProductIndex({ isDev: false });
    const hits = searchCompareProducts(index, "nova", {
      categoryId: "cat-running-shoes",
    });
    expect(hits.some((h) => h.slug.includes("novablast"))).toBe(true);
  });

  it("excludes already selected products from search", () => {
    const index = buildCompareProductIndex({ isDev: false });
    const nb5 = index.find((i) => i.slug === "asics-novablast-5")!;
    const hits = searchCompareProducts(index, "novablast", {
      categoryId: nb5.categoryId,
      excludeIds: [nb5.id],
    });
    expect(hits.every((h) => h.id !== nb5.id)).toBe(true);
  });
});

describe("Compare selection / URL", () => {
  it("parses product query param", () => {
    expect(parseCompareProductsParam("a,b,c")).toEqual(["a", "b", "c"]);
    expect(parseCompareProductsParam("a,a,b")).toEqual(["a", "b"]);
    expect(parseCompareProductsParam("a,b,c,d,e")).toHaveLength(4);
  });

  it("builds stable compare href", () => {
    expect(
      buildCompareHref({
        categorySlug: "running-shoes",
        productSlugs: ["asics-novablast-5", "brooks-ghost-16"],
      }),
    ).toBe(
      "/compare?category=running-shoes&products=asics-novablast-5,brooks-ghost-16",
    );
  });

  it("enforces max 4 and no duplicates", () => {
    const slugs = ["a", "b", "c", "d"];
    expect(addProductSlug(slugs, "e")).toEqual(slugs);
    expect(addProductSlug(["a"], "a")).toEqual(["a"]);
    expect(addProductSlug(["a"], "b")).toEqual(["a", "b"]);
    expect(COMPARE_MAX_PRODUCTS).toBe(4);
  });

  it("remove and replace work", () => {
    expect(removeProductSlug(["a", "b", "c"], "b")).toEqual(["a", "c"]);
    expect(replaceProductSlug(["a", "b"], "b", "c")).toEqual(["a", "c"]);
  });
});

describe("Compare Builder data flows", () => {
  it("loads shared URL with two running shoes as noindex data", () => {
    const data = getDynamicComparisonData(
      ["asics-novablast-5", "brooks-ghost-16"],
      { isDev: false },
    );
    expect(data).toBeTruthy();
    expect(data!.indexable).toBe(false);
    expect(data!.products).toHaveLength(2);
  });

  it("supports three and four products", () => {
    const three = getDynamicComparisonData(
      ["asics-novablast-5", "brooks-ghost-16", "asics-gel-nimbus-27"],
      { isDev: false },
    );
    expect(three?.products).toHaveLength(3);

    const four = getDynamicComparisonData(
      [
        "asics-novablast-5",
        "brooks-ghost-16",
        "asics-gel-nimbus-27",
        "nike-pegasus-41",
      ],
      { isDev: false },
    );
    expect(four?.products).toHaveLength(4);
  });

  it("rejects cross-category URL products", () => {
    const data = getDynamicComparisonData(
      ["asics-novablast-5", "garmin-forerunner-965"],
      { isDev: false },
    );
    expect(data).toBeUndefined();
  });

  it("detects editorial comparison for pair regardless of order", () => {
    const found = findPublishedComparisonForProducts(
      getComparisons({ isDev: false }),
      ["prod-nimbus-27", "prod-novablast-5"],
    );
    expect(found?.slug).toBe("asics-novablast-5-vs-asics-gel-nimbus-27");
  });

  it("does not expose scheduled comparisons via published list", () => {
    const published = getComparisons({ isDev: false });
    expect(published.every((c) => c.status === "published")).toBe(true);
  });

  it("GPS watch comparison uses watch config not shoe specs", () => {
    const watches = getProducts({ isDev: false }).filter(
      (p) => p.categoryId === "cat-gps-watches",
    );
    expect(watches.length).toBeGreaterThanOrEqual(2);
    const result = compareProducts({
      products: watches.slice(0, 2),
      defs: getSpecificationDefinitions("cat-gps-watches"),
      recommendations: [],
      useCaseLabels: {},
      lowestByProduct: {},
      categoryId: "cat-gps-watches",
    });
    expect(result.config.keySpecificationKeys).toContain("batteryGps");
    expect(result.config.keySpecificationKeys).not.toContain("drop");
  });

  it("handles invalid slug in findIndexItemsBySlugs", () => {
    const index = buildCompareProductIndex({ isDev: false });
    const { items, invalidSlugs } = findIndexItemsBySlugs(index, [
      "asics-novablast-5",
      "does-not-exist",
    ]);
    expect(items).toHaveLength(1);
    expect(invalidSlugs).toEqual(["does-not-exist"]);
  });
});

describe("Comparison insights", () => {
  it("emits factual numeric insights without subjective claims", () => {
    const products = getProducts({ isDev: false }).filter((p) =>
      ["prod-novablast-5", "prod-ghost-16"].includes(p.id),
    );
    if (products.length < 2) return;
    const diffs = compareProducts({
      products,
      defs: getSpecificationDefinitions("cat-running-shoes"),
      recommendations: [],
      useCaseLabels: {},
      lowestByProduct: {},
    });
    const insights = getComparisonInsights({
      products,
      differences: diffs,
      productLabels: Object.fromEntries(products.map((p) => [p.id, p.name])),
    });
    for (const insight of insights) {
      expect(insight.text.toLowerCase()).not.toContain("feels");
      expect(insight.sourceKeys.length).toBeGreaterThan(0);
    }
  });
});

describe("Use-case ranking multi-product", () => {
  it("reuses centralized winner threshold", () => {
    const cfg = getComparisonCategoryConfig("cat-running-shoes");
    expect(cfg.winnerDifferenceThreshold).toBe(3);
  });
});
