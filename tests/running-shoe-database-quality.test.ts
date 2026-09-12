import { describe, expect, it } from "vitest";
import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";
import {
  assessRunningShoeQuality,
  buildRunningShoeDatabaseQualityReport,
  withValidStatisticMetric,
} from "@/lib/running-shoe-database/quality";
import {
  sanityDropMm,
  sanityStackDropConsistency,
  sanityWeightG,
  sanityOfferPrice,
} from "@/lib/running-shoe-database/quality/sanity";
import { computeLightestDailyTrainers } from "@/lib/running-shoe-database/statistics/insights";
import { toDataExplorerRows } from "@/lib/running-shoe-database/charts/build-explorer-data";
import { getRunningShoeDatabaseRecords } from "@/lib/running-shoe-database/build-records";

function shoe(
  partial: Partial<RunningShoeDatabaseRecord> &
    Pick<
      RunningShoeDatabaseRecord,
      "id" | "slug" | "name" | "brandId" | "brandSlug" | "brandName"
    >,
): RunningShoeDatabaseRecord {
  return {
    fullName: `${partial.brandName} ${partial.name}`,
    categoryId: "cat-running-shoes",
    categorySlug: "running-shoes",
    typeSlugs: ["daily-trainers"],
    typeLabels: ["Daily Trainers"],
    useCaseSlugs: [],
    useCaseLabels: [],
    audiences: ["unisex"],
    genderFit: ["unisex"],
    carbonPlated: false,
    terrain: [],
    surface: ["road"],
    recommendedDistance: [],
    trainingTypes: [],
    widthOptions: [],
    hasAlternatives: false,
    inComparison: false,
    productHref: `/products/${partial.slug}`,
    image: { src: "/images/test.png", alt: "test" },
    weightG: 250,
    heelStackMm: 32,
    forefootStackMm: 24,
    dropMm: 8,
    plate: false,
    ...partial,
  };
}

describe("running shoe database sanity rules", () => {
  it("flags impossible and unit-confused weights", () => {
    expect(sanityWeightG(12).verdict).toBe("invalid");
    expect(sanityWeightG(12).code).toBe("weight_unit_suspect_oz");
    expect(sanityWeightG(90).verdict).toBe("invalid");
    expect(sanityWeightG(600).verdict).toBe("invalid");
    expect(sanityWeightG(250).verdict).toBe("valid");
  });

  it("flags negative drop", () => {
    expect(sanityDropMm(-2).verdict).toBe("invalid");
    expect(sanityDropMm(-2).code).toBe("drop_negative");
  });

  it("flags forefoot > heel and drop/stack mismatch", () => {
    expect(sanityStackDropConsistency(30, 34, 8)?.verdict).toBe("invalid");
    expect(sanityStackDropConsistency(32, 24, 8)?.verdict).toBe("valid");
    expect(sanityStackDropConsistency(40, 24, 8)?.code).toBe(
      "drop_stack_mismatch",
    );
  });

  it("flags price outliers without correcting them", () => {
    expect(sanityOfferPrice(0, "EUR").verdict).toBe("invalid");
    expect(sanityOfferPrice(900, "EUR").verdict).toBe("invalid");
    expect(sanityOfferPrice(25, "EUR").verdict).toBe("suspect");
    expect(sanityOfferPrice(140, "EUR").verdict).toBe("valid");
  });
});

describe("running shoe database quality classification", () => {
  it("classifies a complete sane shoe as VALID", () => {
    const a = assessRunningShoeQuality(
      shoe({
        id: "1",
        slug: "ok",
        name: "OK",
        brandId: "b",
        brandSlug: "brand",
        brandName: "Brand",
      }),
    );
    expect(a.status).toBe("VALID");
    expect(a.validMetrics).toContain("weight");
    expect(a.validMetrics).toContain("drop");
  });

  it("classifies missing geometry as PARTIAL, not INVALID", () => {
    const a = assessRunningShoeQuality(
      shoe({
        id: "2",
        slug: "partial",
        name: "Partial",
        brandId: "b",
        brandSlug: "brand",
        brandName: "Brand",
        weightG: undefined,
      }),
    );
    expect(a.status).toBe("PARTIAL");
    expect(a.validMetrics).not.toContain("weight");
  });

  it("classifies impossible weight as INVALID and excludes from stats", () => {
    const bad = shoe({
      id: "3",
      slug: "bad-weight",
      name: "Bad",
      brandId: "b",
      brandSlug: "brand",
      brandName: "Brand",
      weightG: 40,
    });
    const good = shoe({
      id: "4",
      slug: "good-weight",
      name: "Good",
      brandId: "b",
      brandSlug: "brand",
      brandName: "Brand",
      weightG: 200,
    });
    expect(assessRunningShoeQuality(bad).status).toBe("INVALID");
    const known = withValidStatisticMetric(
      [bad, good],
      "weight",
      (r) => r.weightG,
    );
    expect(known.map((k) => k.record.slug)).toEqual(["good-weight"]);
  });

  it("excludes suspect/invalid weights from lightest-trainer insight", () => {
    const records = [
      shoe({
        id: "a",
        slug: "oz-confused",
        name: "Oz",
        brandId: "b",
        brandSlug: "brand",
        brandName: "Brand",
        weightG: 14,
      }),
      shoe({
        id: "b",
        slug: "real-light",
        name: "Light",
        brandId: "b",
        brandSlug: "brand",
        brandName: "Brand",
        weightG: 210,
      }),
    ];
    const result = computeLightestDailyTrainers(records, 3);
    expect(result.value.map((r) => r.slug)).toEqual(["real-light"]);
  });

  it("strips unsafe metrics from Data Explorer rows", () => {
    const rows = toDataExplorerRows([
      shoe({
        id: "x",
        slug: "mismatch",
        name: "Mismatch",
        brandId: "b",
        brandSlug: "brand",
        brandName: "Brand",
        heelStackMm: 40,
        forefootStackMm: 24,
        dropMm: 2,
      }),
    ]);
    expect(rows[0]?.dropMm).toBeUndefined();
    expect(rows[0]?.heelStackMm).toBeUndefined();
  });

  it("builds a cohort report with field coverage and gate payload fields", () => {
    const report = buildRunningShoeDatabaseQualityReport([
      shoe({
        id: "1",
        slug: "ok",
        name: "OK",
        brandId: "b",
        brandSlug: "brand",
        brandName: "Brand",
      }),
    ]);
    expect(report.populationSize).toBe(1);
    expect(report.fieldCoverage.length).toBeGreaterThan(5);
    expect(report.validMetricSamples.weight).toBe(1);
    expect(report.statisticsAffected.length).toBeGreaterThan(0);
  });

  it("runs against the live eligible cohort without throwing", () => {
    const records = getRunningShoeDatabaseRecords();
    const report = buildRunningShoeDatabaseQualityReport(records);
    expect(report.populationSize).toBe(records.length);
    expect(report.populationSize).toBeGreaterThan(0);
  });
});
