import { describe, expect, it } from "vitest";
import {
  buildSpecDiffs,
  buildUseCaseDiffs,
  compareProducts,
  canonicalProductPairKey,
  findEditorialComparisonForProducts,
} from "@/lib/comparison/engine";
import {
  getComparisonCategoryConfig,
  isComparisonStale,
} from "@/lib/comparison/category-config";
import {
  getComparisonPageData,
  getDynamicComparisonData,
  resolveCanonicalComparisonSlug,
} from "@/lib/comparison/get-comparison-page-data";
import { getComparisons, getProductById, getProducts } from "@/repositories";
import { comparisons } from "@/content/editorial";
import { SEED_DATES } from "@/content/config";
import type { Product } from "@/domain/products/types";
import type { Recommendation } from "@/domain/recommendations/types";
import type { SpecificationDefinition } from "@/domain/products/types";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import {
  getSitemapPathSetFixture,
  getSitemapPathsFixture,
} from "./helpers/sitemap-fixture";

function miniProduct(
  id: string,
  specs: Product["specifications"],
  categoryId = "cat-running-shoes",
): Product {
  return {
    id,
    slug: id,
    brandId: "brand-asics",
    name: id,
    fullName: id,
    shortDescription: "",
    lifecycleStatus: "current",
    sportIds: ["sport-running"],
    disciplineIds: [],
    categoryId,
    subcategoryIds: [],
    useCaseIds: [],
    specifications: specs,
    strengths: [],
    weaknesses: [],
    experienceLevels: [],
    images: [],
    videos: [],
    offerIds: [],
    evidenceIds: [],
    relatedProductIds: [],
    alternativeProductIds: [],
    status: "published",
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
    publishedAt: SEED_DATES.published,
  };
}

describe("Comparison engine", () => {
  it("detects differing and equal specs", () => {
    const a = miniProduct("a", { weight: 260, drop: 8, plate: false });
    const b = miniProduct("b", { weight: 300, drop: 8, plate: false });
    const defs: SpecificationDefinition[] = [
      {
        id: "1",
        categoryId: "cat-running-shoes",
        key: "weight",
        label: "Weight",
        type: "number",
        unit: "g",
        comparisonPriority: 90,
        finderRelevant: true,
        filterable: true,
      },
      {
        id: "2",
        categoryId: "cat-running-shoes",
        key: "drop",
        label: "Drop",
        type: "number",
        unit: "mm",
        comparisonPriority: 80,
        finderRelevant: true,
        filterable: true,
      },
      {
        id: "3",
        categoryId: "cat-running-shoes",
        key: "plate",
        label: "Plate",
        type: "boolean",
        comparisonPriority: 70,
        finderRelevant: true,
        filterable: true,
      },
    ];
    const rows = buildSpecDiffs([a, b], defs);
    expect(rows.find((r) => r.key === "weight")?.state).toBe("different");
    expect(rows.find((r) => r.key === "drop")?.state).toBe("same");
    expect(rows.find((r) => r.key === "plate")?.state).toBe("same");
  });

  it("does not treat unknown (null) as false", () => {
    const a = miniProduct("a", { plate: false });
    const b = miniProduct("b", { plate: null });
    const defs: SpecificationDefinition[] = [
      {
        id: "3",
        categoryId: "cat-running-shoes",
        key: "plate",
        label: "Plate",
        type: "boolean",
        comparisonPriority: 70,
        finderRelevant: true,
        filterable: true,
      },
    ];
    const rows = buildSpecDiffs([a, b], defs);
    expect(rows.find((r) => r.key === "plate")?.state).toBe("different");
    expect(rows.find((r) => r.key === "plate")?.valuesByProduct.a).toBe("No");
    expect(rows.find((r) => r.key === "plate")?.valuesByProduct.b).toBe(
      "—",
    );
  });

  it("applies use-case winner threshold and ties", () => {
    const products = [miniProduct("a", {}), miniProduct("b", {})];
    const recommendations: Recommendation[] = [
      {
        id: "r1",
        productId: "a",
        sportId: "sport-running",
        useCaseId: "uc-daily-training",
        score: 91,
        factors: [],
        strengths: [],
        compromises: [],
        explanation: "",
        evidenceIds: [],
      },
      {
        id: "r2",
        productId: "b",
        sportId: "sport-running",
        useCaseId: "uc-daily-training",
        score: 90,
        factors: [],
        strengths: [],
        compromises: [],
        explanation: "",
        evidenceIds: [],
      },
    ];
    const tied = buildUseCaseDiffs({
      products,
      recommendations,
      useCaseLabels: { "uc-daily-training": "Daily" },
      primaryUseCaseIds: ["uc-daily-training"],
      threshold: 3,
    });
    expect(tied[0].state).toBe("tie");
    expect(tied[0].winnerProductId).toBeUndefined();

    const clear = buildUseCaseDiffs({
      products,
      recommendations: [
        { ...recommendations[0], score: 96 },
        { ...recommendations[1], score: 90 },
      ],
      useCaseLabels: { "uc-daily-training": "Daily" },
      primaryUseCaseIds: ["uc-daily-training"],
      threshold: 3,
    });
    expect(clear[0].state).toBe("winner");
    expect(clear[0].winnerProductId).toBe("a");
  });

  it("supports 2, 3 and 4 product comparisons", () => {
    const products = [
      miniProduct("a", { weight: 250 }),
      miniProduct("b", { weight: 260 }),
      miniProduct("c", { weight: 270 }),
      miniProduct("d", { weight: 280 }),
    ];
    for (const n of [2, 3, 4]) {
      const result = compareProducts({
        products: products.slice(0, n),
        defs: [
          {
            id: "1",
            categoryId: "cat-running-shoes",
            key: "weight",
            label: "Weight",
            type: "number",
            comparisonPriority: 90,
            finderRelevant: true,
            filterable: true,
          },
        ],
        recommendations: [],
        useCaseLabels: {},
        lowestByProduct: {},
      });
      expect(result.differingSpecs[0]?.state).toBe("different");
      expect(Object.keys(result.differingSpecs[0].valuesByProduct)).toHaveLength(
        n,
      );
    }
  });

  it("does not invent a universal winner from overall product scores", () => {
    const a = miniProduct("a", { weight: 250 });
    a.recommendationScore = 99;
    const b = miniProduct("b", { weight: 300 });
    b.recommendationScore = 50;
    const result = compareProducts({
      products: [a, b],
      defs: [],
      recommendations: [],
      useCaseLabels: {},
      lowestByProduct: {},
    });
    // Engine has no overallWinner field — use-case list empty without recs
    expect(result.useCaseDifferences).toHaveLength(0);
  });

  it("uses GPS watch config keys not running shoe geometry", () => {
    const cfg = getComparisonCategoryConfig("cat-gps-watches");
    expect(cfg.keySpecificationKeys).toContain("batteryGps");
    expect(cfg.keySpecificationKeys).not.toContain("drop");
    expect(cfg.keySpecificationKeys).not.toContain("cushionLevel");
  });
});

describe("Comparison page data", () => {
  it("resolves editorial comparison", () => {
    const data = getComparisonPageData(
      "asics-novablast-6-vs-asics-gel-nimbus-27",
      { isDev: false },
    );
    expect(data).toBeTruthy();
    expect(data!.mode).toBe("editorial");
    expect(data!.indexable).toBe(true);
    expect(data!.products).toHaveLength(2);
    expect(data!.chooseReasons.length).toBeGreaterThan(0);
    expect(data!.comparison?.comparisonType).toBe("hybrid");
    expect(data!.displayTitle).toContain("GEL-Nimbus 27");
    expect(data!.displayTitle).not.toContain("Nimbus 28");
    expect(data!.metaKind).toBe("Expert comparison");
    expect(data!.sectionIds).toContain("overview");
    expect(data!.breadcrumbs.map((b) => b.label)).toEqual(
      expect.arrayContaining(["Home", "Running", "Running Shoes"]),
    );
    expect(data!.useCaseCards.length).toBeGreaterThan(0);
    expect(data!.useCaseCards.every((c) => c.state === "winner" || c.state === "tie")).toBe(
      true,
    );
    expect(
      data!.useCaseCards.find((c) => c.useCaseId === "uc-long-runs")?.winnerLabel,
    ).toMatch(/Nimbus/i);
  });

  it("redirects reverse slug to canonical for nb6 vs nimbus", () => {
    const canonical = resolveCanonicalComparisonSlug(
      "asics-gel-nimbus-27-vs-asics-novablast-6",
      { isDev: false },
    );
    expect(canonical).toBe("asics-novablast-6-vs-asics-gel-nimbus-27");
  });

  it("redirects reverse slug to canonical", () => {
    const canonical = resolveCanonicalComparisonSlug(
      "asics-gel-nimbus-27-vs-asics-novablast-5",
      { isDev: false },
    );
    expect(canonical).toBe("asics-novablast-5-vs-asics-gel-nimbus-27");
  });

  it("keeps reverse-order canonical redirects working for healthy pairs", () => {
    const published = getComparisons({ isDev: false }).filter(
      (c) => getComparisonPageData(c.slug, { isDev: false }),
    );
    const withTwo = published.find((c) => c.productIds.length === 2);
    expect(withTwo).toBeTruthy();
    const [a, b] = withTwo!.productIds
      .map((id) => getProductById(id, { isDev: false })?.slug)
      .filter(Boolean) as string[];
    expect(a && b).toBeTruthy();
    const reverse = `${b}-vs-${a}`;
    if (reverse === withTwo!.slug) return;
    const canonical = resolveCanonicalComparisonSlug(reverse, {
      isDev: false,
    });
    expect(canonical).toBe(withTwo!.slug);
    expect(
      resolveCanonicalComparisonSlug(withTwo!.slug, { isDev: false }),
    ).toBeUndefined();
  });

  it("does not assemble page data when a peer product is unpublished", () => {
    // RC Fix 29: draft peers → half-comparison guard
    const broken = [
      "lululemon-hotty-hot-vs-janji-pace-short",
      "theragun-prime-vs-renpho-r3",
      "triggerpoint-grid-vs-grid-x",
      "oofos-ooriginal-vs-hoka-ora-recovery-slide",
    ];
    for (const slug of broken) {
      expect(getComparisonPageData(slug, { isDev: false }), slug).toBeUndefined();
    }
  });

  it("requires every INDEXABLE comparison product ref to resolve", () => {
    for (const cmp of getComparisons({ isDev: false })) {
      const elig = getLaunchEligibility(
        { kind: "comparison", entity: cmp },
        { isDev: false },
      );
      if (!isIndexableEligibility(elig)) continue;
      expect(cmp.productIds.length).toBeGreaterThanOrEqual(2);
      for (const id of cmp.productIds) {
        expect(
          getProductById(id, { isDev: false }),
          `${cmp.slug}:${id}`,
        ).toBeTruthy();
      }
      expect(
        getComparisonPageData(cmp.slug, { isDev: false }),
        cmp.slug,
      ).toBeTruthy();
    }
  });

  it("excludes broken-peer comparisons from the sitemap", () => {
    const paths = getSitemapPathSetFixture();
    for (const slug of [
      "lululemon-hotty-hot-vs-janji-pace-short",
      "theragun-prime-vs-renpho-r3",
      "triggerpoint-grid-vs-grid-x",
      "oofos-ooriginal-vs-hoka-ora-recovery-slide",
    ]) {
      expect(paths.has(`/compare/${slug}`), slug).toBe(false);
      const cmp = getComparisons({ isDev: false }).find((c) => c.slug === slug);
      if (!cmp) continue;
      const elig = getLaunchEligibility(
        { kind: "comparison", entity: cmp },
        { isDev: false },
      );
      expect(elig.disposition).toBe("HIDDEN_404");
      expect(elig.reasons.some((r) => r.code === "missing_comparison_product")).toBe(
        true,
      );
    }
  });

  it("sitemap Comparison URLs all assemble page data (200-ready)", () => {
    const comparePaths = getSitemapPathsFixture().filter((p) =>
      p.startsWith("/compare/"),
    );
    expect(comparePaths.length).toBeGreaterThan(0);
    for (const path of comparePaths) {
      const slug = path.replace("/compare/", "");
      expect(getComparisonPageData(slug, { isDev: false }), path).toBeTruthy();
    }
  });

  it("resolves dynamic comparison as noindex", () => {
    const data = getDynamicComparisonData(
      ["asics-novablast-5", "nike-pegasus-41"],
      { isDev: false },
    );
    expect(data).toBeTruthy();
    expect(data!.indexable).toBe(false);
    expect(data!.mode).toBe("generated");
  });

  it("scheduled comparison is not public in production", () => {
    const scheduled = comparisons.find((c) => c.status === "scheduled");
    // Seed may not include scheduled comparison — create expectation via resolver
    if (scheduled) {
      expect(
        getComparisonPageData(scheduled.slug, { isDev: false }),
      ).toBeUndefined();
    } else {
      expect(getComparisons({ isDev: false }).every((c) => c.status === "published")).toBe(
        true,
      );
    }
  });

  it("rejects cross-category dynamic compare", () => {
    const data = getDynamicComparisonData(
      ["asics-novablast-5", "garmin-forerunner-965"],
      { isDev: false },
    );
    expect(data).toBeUndefined();
  });

  it("handles missing regional price", () => {
    const data = getComparisonPageData(
      "asics-novablast-5-vs-asics-gel-nimbus-27",
      { isDev: false, region: "ZA" },
    );
    expect(data).toBeTruthy();
    // ZA may have no offers — available flags should reflect that
    expect(data!.differences.priceDifferences).toHaveLength(2);
  });

  it("finds editorial pair canonically regardless of order", () => {
    const found = findEditorialComparisonForProducts(
      getComparisons({ isDev: false }),
      ["prod-nimbus-27", "prod-novablast-5"],
    );
    expect(found?.slug).toBe("asics-novablast-5-vs-asics-gel-nimbus-27");
    expect(
      canonicalProductPairKey(["prod-b", "prod-a"]),
    ).toBe(canonicalProductPairKey(["prod-a", "prod-b"]));
  });

  it("generation comparison has upgrade advice", () => {
    const data = getComparisonPageData(
      "asics-novablast-4-vs-asics-novablast-5",
      { isDev: false },
    );
    expect(data?.isGenerationComparison).toBe(true);
    expect(data?.comparison?.upgradeAdvice?.upgradeIf.length).toBeGreaterThan(
      0,
    );
  });

  it("product page comparison links resolve", () => {
    const nb5 = getProductById("prod-novablast-5");
    expect(nb5).toBeTruthy();
    const linked = getComparisons({ isDev: false }).filter((c) =>
      c.productIds.includes(nb5!.id),
    );
    expect(linked.length).toBeGreaterThan(0);
    for (const c of linked) {
      expect(getComparisonPageData(c.slug, { isDev: false })).toBeTruthy();
    }
  });
});

describe("Comparison freshness", () => {
  it("isComparisonStale respects lastVerifiedAt", () => {
    expect(isComparisonStale(SEED_DATES.verified)).toBe(false);
    expect(isComparisonStale("2020-01-01T00:00:00.000Z")).toBe(true);
    expect(isComparisonStale(undefined)).toBe(true);
  });
});

describe("GPS watch comparison specs", () => {
  it("GPS watch products use watch specs in engine", () => {
    const watches = getProducts({ isDev: false }).filter(
      (p) => p.categoryId === "cat-gps-watches",
    );
    expect(watches.length).toBeGreaterThanOrEqual(2);
    const result = compareProducts({
      products: watches.slice(0, 2),
      defs: [],
      recommendations: [],
      useCaseLabels: {},
      lowestByProduct: {},
      categoryId: "cat-gps-watches",
    });
    expect(result.config.categoryId).toBe("cat-gps-watches");
    expect(result.config.keySpecificationKeys).not.toContain("drop");
  });
});
