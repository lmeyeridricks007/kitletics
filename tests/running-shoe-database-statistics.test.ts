import { describe, expect, it } from "vitest";
import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";
import {
  BEST_VALUE_PRICE_CEILING_EUR,
  MIN_BRAND_SAMPLE_FOR_RANKING,
  averageKnown,
  coverageRatio,
  withKnownMetric,
} from "@/lib/running-shoe-database/statistics/helpers";
import {
  computeAverageOfferPriceByBrand,
  computeAverageWeightByBrand,
  computeBestValueUnderPrice,
  computeHighestStackShoes,
  computeLightestDailyTrainers,
  computeLowestDropTrainers,
  computePlatedVsNonPlated,
  computeRunningShoeMarketInsights,
} from "@/lib/running-shoe-database/statistics/insights";
import { getRunningShoeStatisticsMethodology } from "@/lib/running-shoe-database/statistics/methodology";
import { getRunningShoeDatabasePageData } from "@/lib/running-shoe-database/get-page-data";

function shoe(
  partial: Partial<RunningShoeDatabaseRecord> &
    Pick<RunningShoeDatabaseRecord, "id" | "slug" | "name" | "brandId" | "brandSlug" | "brandName">,
): RunningShoeDatabaseRecord {
  return {
    fullName: `${partial.brandName} ${partial.name}`,
    categoryId: "cat-running-shoes",
    categorySlug: "running-shoes",
    typeSlugs: [],
    typeLabels: [],
    useCaseSlugs: [],
    useCaseLabels: [],
    audiences: ["unisex"],
    genderFit: ["unisex"],
    carbonPlated: false,
    terrain: [],
    surface: [],
    recommendedDistance: [],
    trainingTypes: [],
    widthOptions: [],
    hasAlternatives: false,
    inComparison: false,
    productHref: `/products/${partial.slug}`,
    ...partial,
  };
}

const fixtures: RunningShoeDatabaseRecord[] = [
  shoe({
    id: "a1",
    slug: "alpha-light",
    name: "Light",
    brandId: "b-alpha",
    brandSlug: "alpha",
    brandName: "Alpha",
    typeSlugs: ["daily-trainers"],
    typeLabels: ["Daily Trainers"],
    weightG: 200,
    heelStackMm: 32,
    dropMm: 4,
    plate: false,
    price: { amount: 120, currency: "EUR" },
    valueScore: 88,
    score: 85,
  }),
  shoe({
    id: "a2",
    slug: "alpha-mid",
    name: "Mid",
    brandId: "b-alpha",
    brandSlug: "alpha",
    brandName: "Alpha",
    typeSlugs: ["daily-trainers"],
    typeLabels: ["Daily Trainers"],
    weightG: 240,
    heelStackMm: 36,
    dropMm: 8,
    plate: false,
    price: { amount: 140, currency: "EUR" },
    valueScore: 80,
    score: 82,
  }),
  shoe({
    id: "a3",
    slug: "alpha-heavy",
    name: "Heavy",
    brandId: "b-alpha",
    brandSlug: "alpha",
    brandName: "Alpha",
    typeSlugs: ["daily-trainers"],
    typeLabels: ["Daily Trainers"],
    weightG: 280,
    heelStackMm: 40,
    dropMm: 10,
    plate: false,
    price: { amount: 130, currency: "EUR" },
    valueScore: 70,
    score: 78,
  }),
  shoe({
    id: "b1",
    slug: "beta-race",
    name: "Race",
    brandId: "b-beta",
    brandSlug: "beta",
    brandName: "Beta",
    typeSlugs: ["race"],
    typeLabels: ["Race Shoes"],
    weightG: 180,
    heelStackMm: 40,
    dropMm: 6,
    plate: true,
    plateMaterial: "carbon",
    carbonPlated: true,
    price: { amount: 220, currency: "EUR" },
    valueScore: 75,
    score: 90,
  }),
  shoe({
    id: "b2",
    slug: "beta-stack",
    name: "Stack",
    brandId: "b-beta",
    brandSlug: "beta",
    brandName: "Beta",
    typeSlugs: ["max-cushion"],
    typeLabels: ["Max Cushion"],
    weightG: 260,
    heelStackMm: 45,
    dropMm: 5,
    plate: false,
    price: { amount: 160, currency: "EUR" },
    valueScore: 72,
    score: 84,
  }),
  shoe({
    id: "c1",
    slug: "gamma-solo",
    name: "Solo",
    brandId: "b-gamma",
    brandSlug: "gamma",
    brandName: "Gamma",
    typeSlugs: ["daily-trainers"],
    typeLabels: ["Daily Trainers"],
    weightG: 190,
    // missing drop intentionally
    heelStackMm: 30,
    plate: true,
    plateMaterial: "nylon",
    carbonPlated: false,
    price: { amount: 110, currency: "EUR" },
    valueScore: 92,
    score: 80,
  }),
  shoe({
    id: "d1",
    slug: "delta-unknown-weight",
    name: "Unknown",
    brandId: "b-delta",
    brandSlug: "delta",
    brandName: "Delta",
    typeSlugs: ["daily-trainers"],
    typeLabels: ["Daily Trainers"],
    // no weight — must be excluded from weight averages
    heelStackMm: 38,
    dropMm: 0,
    plate: false,
    price: { amount: 99, currency: "EUR" },
    valueScore: 95,
    score: 77,
  }),
];

describe("Running shoe statistics helpers", () => {
  it("excludes unknown values from averages (never treats as zero)", () => {
    expect(averageKnown([200, 240])).toBe(220);
    expect(averageKnown([])).toBeNull();
    const known = withKnownMetric(fixtures, (r) => r.weightG);
    expect(known.some((k) => k.record.slug === "delta-unknown-weight")).toBe(
      false,
    );
    expect(known.length).toBe(6);
  });

  it("reports coverage as sample/population", () => {
    expect(coverageRatio(3, 6)).toBe(0.5);
    expect(coverageRatio(0, 0)).toBe(0);
  });
});

describe("lightest daily trainers", () => {
  it("ranks daily trainers by weight ascending and exposes coverage", () => {
    const stat = computeLightestDailyTrainers(fixtures, 3);
    expect(stat.value.map((r) => r.slug)).toEqual([
      "gamma-solo",
      "alpha-light",
      "alpha-mid",
    ]);
    expect(stat.value[0]!.metricValue).toBe(190);
    expect(stat.sampleSize).toBe(4); // 4 daily trainers with weight (delta missing)
    expect(stat.populationSize).toBe(5); // 5 daily trainers including unknown weight
    expect(stat.coverage).toBeCloseTo(4 / 5);
    expect(stat.definition.toLowerCase()).toContain("daily-trainers");
  });
});

describe("highest stack shoes", () => {
  it("ranks by heel stack descending", () => {
    const stat = computeHighestStackShoes(fixtures, 3);
    expect(stat.value[0]!.slug).toBe("beta-stack");
    expect(stat.value[0]!.metricValue).toBe(45);
    expect(stat.sampleSize).toBe(7);
  });
});

describe("lowest drop trainers", () => {
  it("only includes daily trainers with known drop", () => {
    const stat = computeLowestDropTrainers(fixtures, 3);
    expect(stat.value[0]!.slug).toBe("delta-unknown-weight");
    expect(stat.value[0]!.metricValue).toBe(0);
    // gamma-solo excluded (no drop)
    expect(stat.value.every((r) => r.slug !== "gamma-solo")).toBe(true);
    expect(stat.sampleSize).toBe(4);
  });
});

describe("best Kitletics value under price", () => {
  it("ranks by valueScore among EUR offers ≤ ceiling — never invents launch price", () => {
    const stat = computeBestValueUnderPrice(fixtures, 150, 3);
    expect(stat.priceCeiling).toBe(150);
    expect(stat.value[0]!.slug).toBe("delta-unknown-weight"); // 95 value, €99
    expect(stat.value[1]!.slug).toBe("gamma-solo"); // 92
    expect(stat.value.every((r) => {
      const src = fixtures.find((f) => f.slug === r.slug)!;
      return src.price!.amount <= 150;
    })).toBe(true);
    // beta-race is €220 — excluded
    expect(stat.value.every((r) => r.slug !== "beta-race")).toBe(true);
    expect(stat.definition.toLowerCase()).toContain("valuescore");
    expect(stat.definition.toLowerCase()).toContain("never used");
  });
});

describe("average weight by brand", () => {
  it("requires minimum sample before ranking", () => {
    const stat = computeAverageWeightByBrand(fixtures, 3);
    const alpha = stat.value.find((b) => b.brandSlug === "alpha")!;
    const gamma = stat.value.find((b) => b.brandSlug === "gamma")!;
    expect(alpha.ranked).toBe(true);
    expect(alpha.sampleSize).toBe(3);
    expect(alpha.average).toBe(240); // (200+240+280)/3
    expect(gamma.ranked).toBe(false);
    expect(gamma.sampleSize).toBe(1);
    expect(stat.caveat).toContain(String(MIN_BRAND_SAMPLE_FOR_RANKING));
  });
});

describe("average offer price by brand", () => {
  it("is labelled as offer price not launch/MSRP", () => {
    const stat = computeAverageOfferPriceByBrand(fixtures, 3);
    expect(stat.label.toLowerCase()).toContain("offer");
    expect(stat.definition.toLowerCase()).toContain("launch");
    const alpha = stat.value.find((b) => b.brandSlug === "alpha")!;
    expect(alpha.ranked).toBe(true);
    expect(alpha.average).toBeCloseTo((120 + 140 + 130) / 3, 1);
  });
});

describe("plated vs non-plated", () => {
  it("splits cohorts and omits missing metrics from averages", () => {
    const stat = computePlatedVsNonPlated(fixtures);
    expect(stat.value.platedCount).toBe(2);
    expect(stat.value.nonPlatedCount).toBe(5);
    expect(stat.value.carbonPlatedCount).toBe(1);
    const platedWeight = stat.value.plated.find((g) =>
      g.groupId.endsWith(":weight"),
    )!;
    expect(platedWeight.average).toBe(185); // (180+190)/2
    expect(platedWeight.sampleSize).toBe(2);
  });
});

describe("computeRunningShoeMarketInsights", () => {
  it("returns cards and methodology-ready metadata", () => {
    const insights = computeRunningShoeMarketInsights(fixtures);
    expect(insights.eligibleCount).toBe(fixtures.length);
    expect(insights.unitOfAnalysis).toBe("product-model");
    expect(insights.cards.length).toBeGreaterThan(0);
    expect(insights.bestValueUnderPrice.priceCeiling).toBe(
      BEST_VALUE_PRICE_CEILING_EUR,
    );
    for (const card of insights.cards) {
      expect(card.sampleSize).toBeGreaterThan(0);
      expect(card.viewAllHref.startsWith("/running/shoes/database")).toBe(true);
    }
  });
});

describe("statistics methodology + page wiring", () => {
  it("documents eligibility, missing values, brand thresholds, and price basis", () => {
    const method = getRunningShoeStatisticsMethodology();
    const blob = method.paragraphs.join(" ").toLowerCase();
    expect(blob).toContain("eligibility");
    expect(blob).toContain("variant");
    expect(blob).toContain("missing");
    expect(blob).toContain("offer");
    expect(blob).toContain(String(MIN_BRAND_SAMPLE_FOR_RANKING));
  });

  it("page data includes live marketInsights from eligible catalog", () => {
    const page = getRunningShoeDatabasePageData({ options: { isDev: false } });
    expect(page.marketInsights.eligibleCount).toBe(page.total);
    expect(page.marketInsights.cards.length).toBeGreaterThan(0);
    expect(page.statisticsMethodology.paragraphs.length).toBeGreaterThan(3);
  });
});
