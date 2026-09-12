import { describe, expect, it } from "vitest";
import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";
import {
  auditRunningShoeHistoricalCoverage,
  buildHistoricalObservationsFromCatalog,
  assessHistoricalPublicInsightsReadiness,
  getPublishableHistoricalSeries,
  assessTrendMetric,
  MIN_YEARS_FOR_PUBLIC_TREND,
  MIN_OBS_PER_YEAR_FOR_TREND,
} from "@/lib/running-shoe-database/historical";
import type { HistoricalShoeObservation } from "@/lib/running-shoe-database/historical";

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
    useCaseSlugs: ["daily-training"],
    useCaseLabels: ["Daily Training"],
    primaryUseSlug: "daily-training",
    primaryUseLabel: "Daily Training",
    audiences: ["unisex"],
    genderFit: ["unisex"],
    carbonPlated: false,
    terrain: ["road"],
    surface: ["asphalt"],
    recommendedDistance: [],
    trainingTypes: [],
    widthOptions: [],
    hasAlternatives: false,
    inComparison: false,
    productHref: `/products/${partial.slug}`,
    ...partial,
  };
}

describe("historical observation model", () => {
  it("builds per-product observations with field evidence and never sets launch price from offers", () => {
    const records = [
      shoe({
        id: "curr",
        slug: "alpha-2",
        name: "Alpha 2",
        brandId: "b1",
        brandSlug: "alpha",
        brandName: "Alpha",
        generation: "2",
        familyId: "fam-a",
        releaseYear: 2024,
        weightG: 250,
        heelStackMm: 36,
        dropMm: 8,
        plate: false,
        price: { amount: 140, currency: "EUR" },
      }),
      shoe({
        id: "prev",
        slug: "alpha-1",
        name: "Alpha 1",
        brandId: "b1",
        brandSlug: "alpha",
        brandName: "Alpha",
        generation: "1",
        familyId: "fam-a",
        weightG: 270,
        heelStackMm: 34,
        dropMm: 10,
        plate: false,
      }),
    ];

    const obs = buildHistoricalObservationsFromCatalog(records, {
      observedAt: "2026-09-11T00:00:00.000Z",
    });

    expect(obs).toHaveLength(2);
    expect(obs[0]!.launchPriceEur).toBeUndefined();
    expect(obs[0]!.evidence.launchPriceEur).toBeUndefined();
    expect(obs[0]!.evidence.weightG?.sourceEntityId).toBe("curr");
    expect(obs[1]!.releaseYear).toBeUndefined();
    expect(obs[1]!.weightG).toBe(270);
    // Never copy current gen weight onto previous
    expect(obs[1]!.weightG).not.toBe(obs[0]!.weightG);
    expect(obs[1]!.evidence.weightG?.sourceEntityId).toBe("prev");
  });

  it("does not publish year trends on the live eligible cohort", () => {
    const audit = auditRunningShoeHistoricalCoverage({ isDev: false });
    expect(audit.populationSize).toBeGreaterThan(50);
    expect(audit.readiness.evidenceReady).toBe(false);
    expect(audit.readiness.datedObservationCount).toBeLessThan(
      MIN_YEARS_FOR_PUBLIC_TREND * MIN_OBS_PER_YEAR_FOR_TREND,
    );
    expect(audit.readiness.publicStatus.kind).toBe("not-ready");
    expect(
      getPublishableHistoricalSeries(audit.readiness, "medianWeightG"),
    ).toBeNull();
    expect(
      getPublishableHistoricalSeries(audit.readiness, "medianLaunchPriceEur"),
    ).toBeNull();

    const release = audit.fields.find((f) => f.field === "release year");
    expect(release?.present).toBe(audit.readiness.datedObservationCount);
    expect(release?.coverage).toBeLessThan(0.1);

    const launch = audit.fields.find((f) => f.field === "launch price");
    expect(launch?.present).toBe(0);
  });

  it("blocks launch-price trends even when synthetic years exist", () => {
    const rich: HistoricalShoeObservation[] = [];
    const brands = ["a", "b", "c", "d", "e", "f"];
    for (let year = 2018; year <= 2024; year++) {
      for (let i = 0; i < 15; i++) {
        const brand = brands[i % brands.length]!;
        rich.push({
          id: `o-${year}-${i}`,
          productId: `p-${year}-${i}`,
          productSlug: `shoe-${year}-${i}`,
          brandId: brand,
          brandSlug: brand,
          brandName: brand.toUpperCase(),
          releaseYear: year,
          weightG: 200 + i,
          heelStackMm: 30 + (i % 5),
          dropMm: 6 + (i % 4),
          plate: i % 4 === 0,
          surface: ["asphalt"],
          evidence: {
            releaseYear: {
              kind: "catalog-product-field",
              sourceEntityId: `p-${year}-${i}`,
              sourceField: "Product.releaseDate",
              observedAt: "2026-09-11T00:00:00.000Z",
            },
            weightG: {
              kind: "catalog-specification",
              sourceEntityId: `p-${year}-${i}`,
              sourceField: "specifications.weight",
              observedAt: "2026-09-11T00:00:00.000Z",
            },
          },
        });
      }
    }

    const weight = assessTrendMetric(rich, "medianWeightG", rich.length);
    expect(weight.eligible).toBe(true);
    expect(weight.series?.length).toBeGreaterThanOrEqual(MIN_YEARS_FOR_PUBLIC_TREND);

    const launch = assessTrendMetric(rich, "medianLaunchPriceEur", rich.length);
    expect(launch.eligible).toBe(false);
    expect(launch.blockers.some((b) => /launchPrice/i.test(b))).toBe(true);

    const readiness = assessHistoricalPublicInsightsReadiness(rich, {
      populationSize: rich.length,
      generationRelationshipCount: 1,
    });
    expect(readiness.evidenceReady).toBe(true);
    expect(getPublishableHistoricalSeries(readiness, "medianWeightG")).not.toBeNull();
    expect(
      getPublishableHistoricalSeries(readiness, "medianLaunchPriceEur"),
    ).toBeNull();
  });
});
