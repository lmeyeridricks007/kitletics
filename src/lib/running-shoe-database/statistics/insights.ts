import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";
import { databaseHref } from "@/lib/running-shoe-database/params";
import { DEFAULT_DATABASE_FILTERS } from "@/lib/running-shoe-database/params";
import {
  getCachedShoeQuality,
  isMetricSafeForStatistics,
  withValidStatisticMetric,
} from "@/lib/running-shoe-database/quality";
import type { QualityMetricKey } from "@/lib/running-shoe-database/quality/types";
import {
  BEST_VALUE_PRICE_CEILING_EUR,
  MIN_BRAND_SAMPLE_FOR_RANKING,
  averageKnown,
  isDailyTrainer,
  roundMetric,
  statisticResult,
  withKnownMetric,
} from "@/lib/running-shoe-database/statistics/helpers";
import type {
  BrandAverageStat,
  GroupAverageStat,
  InsightCardModel,
  RankedShoeStat,
  RunningShoeMarketInsights,
  StatisticResult,
} from "@/lib/running-shoe-database/statistics/types";

function rankedShoe(
  rank: number,
  record: RunningShoeDatabaseRecord,
  metricValue: number,
  metricUnit: string,
  metricLabel: string,
): RankedShoeStat {
  return {
    rank,
    productId: record.id,
    slug: record.slug,
    name: record.name,
    brandName: record.brandName,
    href: record.productHref,
    metricLabel,
    metricValue: roundMetric(metricValue, metricUnit === "g" || metricUnit === "mm" ? 0 : 1),
    metricUnit,
  };
}

export function computeLightestDailyTrainers(
  records: RunningShoeDatabaseRecord[],
  limit = 3,
): StatisticResult<RankedShoeStat[]> {
  const cohort = records.filter(isDailyTrainer);
  const known = withValidStatisticMetric(cohort, "weight", (r) => r.weightG);
  known.sort(
    (a, b) =>
      a.value - b.value || a.record.fullName.localeCompare(b.record.fullName),
  );
  const top = known.slice(0, limit).map((row, i) =>
    rankedShoe(i + 1, row.record, row.value, "g", "Weight"),
  );
  return statisticResult(
    {
      id: "lightest-daily-trainers",
      label: "Lightest daily trainers",
      definition:
        "Eligible product models in subcategory daily-trainers with a quality-valid weight (g), ranked ascending by weight. One row per product model — not per gender variant. Suspect/invalid weights are excluded.",
      unitOfAnalysis: "product-model-with-metric",
      caveat:
        known.length === 0
          ? "No daily trainers currently expose a verified weight."
          : undefined,
    },
    top,
    known.length,
    cohort.length,
  );
}

export function computeHighestStackShoes(
  records: RunningShoeDatabaseRecord[],
  limit = 3,
): StatisticResult<RankedShoeStat[]> {
  const known = withValidStatisticMetric(
    records,
    "heelStack",
    (r) => r.heelStackMm,
  );
  known.sort(
    (a, b) =>
      b.value - a.value || a.record.fullName.localeCompare(b.record.fullName),
  );
  const top = known.slice(0, limit).map((row, i) =>
    rankedShoe(i + 1, row.record, row.value, "mm", "Heel stack"),
  );
  return statisticResult(
    {
      id: "highest-stack-shoes",
      label: "Highest-stack shoes",
      definition:
        "Eligible product models with quality-valid heel stack (mm), ranked descending. Forefoot stack is not used for this ranking. Suspect/invalid stacks are excluded.",
      unitOfAnalysis: "product-model-with-metric",
    },
    top,
    known.length,
    records.length,
  );
}

export function computeLowestDropTrainers(
  records: RunningShoeDatabaseRecord[],
  limit = 3,
): StatisticResult<RankedShoeStat[]> {
  const cohort = records.filter(isDailyTrainer);
  const known = withValidStatisticMetric(cohort, "drop", (r) => r.dropMm);
  known.sort(
    (a, b) =>
      a.value - b.value || a.record.fullName.localeCompare(b.record.fullName),
  );
  const top = known.slice(0, limit).map((row, i) =>
    rankedShoe(i + 1, row.record, row.value, "mm", "Drop"),
  );
  return statisticResult(
    {
      id: "lowest-drop-trainers",
      label: "Lowest-drop trainers",
      definition:
        "Eligible daily-trainer product models with quality-valid drop (mm), ranked ascending. Suspect/invalid drops are excluded.",
      unitOfAnalysis: "product-model-with-metric",
    },
    top,
    known.length,
    cohort.length,
  );
}

/**
 * Best value under a price ceiling:
 * rank by Product.valueScore (Kitletics decision signal) among models with
 * verified offer price ≤ ceiling. Never uses affiliate commission.
 */
export function computeBestValueUnderPrice(
  records: RunningShoeDatabaseRecord[],
  priceCeiling = BEST_VALUE_PRICE_CEILING_EUR,
  limit = 3,
): StatisticResult<RankedShoeStat[]> & {
  priceCeiling: number;
  currency: string;
} {
  const priced = records.filter((r) => {
    if (
      !r.price ||
      r.price.currency !== "EUR" ||
      r.price.amount > priceCeiling ||
      typeof r.valueScore !== "number"
    ) {
      return false;
    }
    return isMetricSafeForStatistics(getCachedShoeQuality(r), "price");
  });
  const sorted = [...priced].sort(
    (a, b) =>
      (b.valueScore ?? 0) - (a.valueScore ?? 0) ||
      (a.price?.amount ?? 0) - (b.price?.amount ?? 0) ||
      a.fullName.localeCompare(b.fullName),
  );
  const top = sorted.slice(0, limit).map((r, i) =>
    rankedShoe(i + 1, r, r.valueScore!, "pts", "Value score"),
  );

  const populationWithPrice = records.filter((r) => r.price).length;

  return {
    ...statisticResult(
      {
        id: "best-value-under-price",
        label: `Best Kitletics value under €${priceCeiling}`,
        definition: `Eligible product models with a verified EUR offer ≤ €${priceCeiling} and a Kitletics valueScore, ranked by valueScore descending (ties broken by lower price). Affiliate commission is never used.`,
        unitOfAnalysis: "product-model-with-metric",
        caveat:
          "“Value” here is Kitletics valueScore vs verified offer price — not MSRP and not retailer payout.",
      },
      top,
      priced.length,
      populationWithPrice,
    ),
    priceCeiling,
    currency: "EUR",
  };
}

function brandAverages(
  records: RunningShoeDatabaseRecord[],
  metric: QualityMetricKey,
  pick: (r: RunningShoeDatabaseRecord) => number | undefined,
  minSample: number,
): BrandAverageStat[] {
  const byBrand = new Map<
    string,
    {
      brandId: string;
      brandSlug: string;
      brandName: string;
      values: number[];
    }
  >();

  for (const r of records) {
    if (!isMetricSafeForStatistics(getCachedShoeQuality(r), metric)) continue;
    const v = pick(r);
    if (v === undefined || !Number.isFinite(v)) continue;
    const prev = byBrand.get(r.brandId);
    if (prev) {
      prev.values.push(v);
    } else {
      byBrand.set(r.brandId, {
        brandId: r.brandId,
        brandSlug: r.brandSlug,
        brandName: r.brandName,
        values: [v],
      });
    }
  }

  return [...byBrand.values()]
    .map((b) => {
      const average = averageKnown(b.values);
      return {
        brandId: b.brandId,
        brandSlug: b.brandSlug,
        brandName: b.brandName,
        average: average ?? 0,
        sampleSize: b.values.length,
        ranked: b.values.length >= minSample && average !== null,
      };
    })
    .filter((b) => b.sampleSize > 0)
    .sort((a, b) => {
      if (a.ranked !== b.ranked) return a.ranked ? -1 : 1;
      return a.average - b.average || a.brandName.localeCompare(b.brandName);
    });
}

export function computeAverageWeightByBrand(
  records: RunningShoeDatabaseRecord[],
  minSample = MIN_BRAND_SAMPLE_FOR_RANKING,
): StatisticResult<BrandAverageStat[]> {
  const known = withValidStatisticMetric(records, "weight", (r) => r.weightG);
  const brands = brandAverages(records, "weight", (r) => r.weightG, minSample);
  // Sort ranked brands by average weight ascending for the insight
  const ranked = brands
    .filter((b) => b.ranked)
    .sort((a, b) => a.average - b.average || a.brandName.localeCompare(b.brandName));
  const unranked = brands.filter((b) => !b.ranked);
  return statisticResult(
    {
      id: "average-weight-by-brand",
      label: "Average shoe weight by brand",
      definition: `Mean product-model weight (g) per brand among models with known weight. Brands with fewer than ${minSample} weighted models are excluded from ranked comparisons but retained with sampleSize for transparency.`,
      unitOfAnalysis: "product-model-with-metric",
      caveat: `Ranked brands require ≥${minSample} models with verified weight.`,
    },
    [...ranked, ...unranked],
    known.length,
    records.length,
  );
}

/**
 * Average verified offer price by brand.
 * Not launch/MSRP — catalog has no launchPrice field.
 */
export function computeAverageOfferPriceByBrand(
  records: RunningShoeDatabaseRecord[],
  minSample = MIN_BRAND_SAMPLE_FOR_RANKING,
): StatisticResult<BrandAverageStat[]> {
  const known = withValidStatisticMetric(
    records,
    "price",
    (r) => r.price?.amount,
  );
  const brands = brandAverages(
    records,
    "price",
    (r) => r.price?.amount,
    minSample,
  );
  const ranked = brands
    .filter((b) => b.ranked)
    .sort((a, b) => a.average - b.average || a.brandName.localeCompare(b.brandName));
  const unranked = brands.filter((b) => !b.ranked);
  return statisticResult(
    {
      id: "average-offer-price-by-brand",
      label: "Average current offer price by brand",
      definition: `Mean lowest verified regional offer price per brand among models with a displayable price. This is not launch/MSRP — no canonical launchPrice exists in the catalog.`,
      unitOfAnalysis: "product-model-with-metric",
      caveat: `Uses default-region lowest verified offers. Ranked brands require ≥${minSample} priced models.`,
    },
    [...ranked, ...unranked],
    known.length,
    records.length,
  );
}

function groupMetricAverages(
  cohort: RunningShoeDatabaseRecord[],
  groupId: string,
  groupLabel: string,
): GroupAverageStat[] {
  const weight = withValidStatisticMetric(cohort, "weight", (r) => r.weightG);
  const stack = withValidStatisticMetric(
    cohort,
    "heelStack",
    (r) => r.heelStackMm,
  );
  const drop = withValidStatisticMetric(cohort, "drop", (r) => r.dropMm);
  const price = withValidStatisticMetric(
    cohort,
    "price",
    (r) => r.price?.amount,
  );
  const score = withKnownMetric(cohort, (r) => r.score);

  const make = (
    id: string,
    label: string,
    known: Array<{ value: number }>,
  ): GroupAverageStat => ({
    groupId: `${groupId}:${id}`,
    groupLabel: `${groupLabel} · ${label}`,
    average: averageKnown(known.map((k) => k.value)),
    sampleSize: known.length,
    populationSize: cohort.length,
    coverage: cohort.length ? known.length / cohort.length : 0,
  });

  return [
    make("weight", "avg weight (g)", weight),
    make("stack", "avg heel stack (mm)", stack),
    make("drop", "avg drop (mm)", drop),
    make("price", "avg offer (€)", price),
    make("score", "avg Kitletics score", score),
  ];
}

export function computePlatedVsNonPlated(
  records: RunningShoeDatabaseRecord[],
): StatisticResult<{
  plated: GroupAverageStat[];
  nonPlated: GroupAverageStat[];
  platedCount: number;
  nonPlatedCount: number;
  carbonPlatedCount: number;
}> {
  const withPlateFlag = records.filter(
    (r) =>
      typeof r.plate === "boolean" &&
      isMetricSafeForStatistics(getCachedShoeQuality(r), "plate"),
  );
  const plated = withPlateFlag.filter((r) => r.plate === true);
  const nonPlated = withPlateFlag.filter((r) => r.plate === false);
  const carbonPlatedCount = records.filter(
    (r) =>
      r.carbonPlated &&
      isMetricSafeForStatistics(getCachedShoeQuality(r), "plate"),
  ).length;

  return statisticResult(
    {
      id: "plated-vs-non-plated",
      label: "Plated vs non-plated",
      definition:
        "Compares mean weight, heel stack, drop, offer price and Kitletics score between plated and non-plated product models. Unknown plate flags are excluded from both cohorts. Carbon-plated count is reported separately.",
      unitOfAnalysis: "product-model-with-metric",
      caveat:
        "Averages omit models missing that metric — sampleSize is per metric, not assumed equal to cohort size.",
    },
    {
      plated: groupMetricAverages(plated, "plated", "Plated"),
      nonPlated: groupMetricAverages(nonPlated, "non-plated", "Non-plated"),
      platedCount: plated.length,
      nonPlatedCount: nonPlated.length,
      carbonPlatedCount,
    },
    withPlateFlag.length,
    records.length,
  );
}

function cardFromRanked(
  stat: StatisticResult<RankedShoeStat[]>,
  viewAllHref: string,
  viewAllLabel: string,
  formatDetail: (row: RankedShoeStat) => string,
): InsightCardModel {
  return {
    id: stat.id,
    eyebrow: "Market insight",
    title: stat.label,
    definition: stat.definition,
    caveat: stat.caveat,
    sampleSize: stat.sampleSize,
    populationSize: stat.populationSize,
    coverage: stat.coverage,
    rows: stat.value.map((row) => ({
      rank: row.rank,
      label: `${row.brandName} ${row.name}`,
      detail: formatDetail(row),
      href: row.href,
    })),
    viewAllHref,
    viewAllLabel,
  };
}

export function buildInsightCards(
  insights: Omit<RunningShoeMarketInsights, "cards" | "generatedAt">,
): InsightCardModel[] {
  const cards: InsightCardModel[] = [];

  if (insights.lightestDailyTrainers.value.length > 0) {
    cards.push(
      cardFromRanked(
        insights.lightestDailyTrainers,
        databaseHref({
          ...DEFAULT_DATABASE_FILTERS,
          type: ["daily-trainers"],
          sort: "weight-asc",
        }),
        "View all light daily trainers",
        (row) => `${row.metricValue}${row.metricUnit}`,
      ),
    );
  }

  if (insights.highestStackShoes.value.length > 0) {
    cards.push(
      cardFromRanked(
        insights.highestStackShoes,
        databaseHref({
          ...DEFAULT_DATABASE_FILTERS,
          sort: "stack-desc",
        }),
        "View highest-stack shoes",
        (row) => `${row.metricValue} ${row.metricUnit} heel`,
      ),
    );
  }

  if (insights.lowestDropTrainers.value.length > 0) {
    cards.push(
      cardFromRanked(
        insights.lowestDropTrainers,
        databaseHref({
          ...DEFAULT_DATABASE_FILTERS,
          type: ["daily-trainers"],
          sort: "drop-asc",
        }),
        "View lowest-drop trainers",
        (row) => `${row.metricValue} ${row.metricUnit} drop`,
      ),
    );
  }

  if (insights.bestValueUnderPrice.value.length > 0) {
    cards.push(
      cardFromRanked(
        insights.bestValueUnderPrice,
        databaseHref({
          ...DEFAULT_DATABASE_FILTERS,
          priceMax: insights.bestValueUnderPrice.priceCeiling,
          sort: "recommended",
        }),
        `View shoes under €${insights.bestValueUnderPrice.priceCeiling}`,
        (row) => `Value ${row.metricValue}`,
      ),
    );
  }

  // Brand weight card — top 5 ranked brands
  const weightBrands = insights.averageWeightByBrand.value
    .filter((b) => b.ranked)
    .slice(0, 5);
  if (weightBrands.length > 0) {
    cards.push({
      id: "card-avg-weight-by-brand",
      eyebrow: "Market insight",
      title: insights.averageWeightByBrand.label,
      definition: insights.averageWeightByBrand.definition,
      caveat: insights.averageWeightByBrand.caveat,
      sampleSize: insights.averageWeightByBrand.sampleSize,
      populationSize: insights.averageWeightByBrand.populationSize,
      coverage: insights.averageWeightByBrand.coverage,
      rows: weightBrands.map((b, i) => ({
        rank: i + 1,
        label: b.brandName,
        detail: `${b.average} g · n=${b.sampleSize}`,
        href: databaseHref({
          ...DEFAULT_DATABASE_FILTERS,
          brand: [b.brandSlug],
          sort: "weight-asc",
        }),
      })),
      viewAllHref: databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        sort: "weight-asc",
      }),
      viewAllLabel: "Browse by weight",
    });
  }

  const priceBrands = insights.averageOfferPriceByBrand.value
    .filter((b) => b.ranked)
    .slice(0, 5);
  if (priceBrands.length > 0) {
    cards.push({
      id: "card-avg-offer-price-by-brand",
      eyebrow: "Market insight",
      title: insights.averageOfferPriceByBrand.label,
      definition: insights.averageOfferPriceByBrand.definition,
      caveat: insights.averageOfferPriceByBrand.caveat,
      sampleSize: insights.averageOfferPriceByBrand.sampleSize,
      populationSize: insights.averageOfferPriceByBrand.populationSize,
      coverage: insights.averageOfferPriceByBrand.coverage,
      rows: priceBrands.map((b, i) => ({
        rank: i + 1,
        label: b.brandName,
        detail: `€${Math.round(b.average)} · n=${b.sampleSize}`,
        href: databaseHref({
          ...DEFAULT_DATABASE_FILTERS,
          brand: [b.brandSlug],
          sort: "price-asc",
        }),
      })),
      viewAllHref: databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        sort: "price-asc",
      }),
      viewAllLabel: "Browse by price",
    });
  }

  const plated = insights.platedVsNonPlated;
  if (plated.sampleSize > 0) {
    const platedWeight = plated.value.plated.find((g) =>
      g.groupId.endsWith(":weight"),
    );
    const nonWeight = plated.value.nonPlated.find((g) =>
      g.groupId.endsWith(":weight"),
    );
    cards.push({
      id: "card-plated-vs-non-plated",
      eyebrow: "Market insight",
      title: plated.label,
      definition: plated.definition,
      caveat: plated.caveat,
      sampleSize: plated.sampleSize,
      populationSize: plated.populationSize,
      coverage: plated.coverage,
      rows: [
        {
          rank: 1,
          label: `Plated (${plated.value.platedCount})`,
          detail:
            platedWeight?.average != null
              ? `Avg ${platedWeight.average} g · n=${platedWeight.sampleSize}`
              : `n=${plated.value.platedCount}`,
          href: databaseHref({
            ...DEFAULT_DATABASE_FILTERS,
            plate: "plated",
          }),
        },
        {
          rank: 2,
          label: `Non-plated (${plated.value.nonPlatedCount})`,
          detail:
            nonWeight?.average != null
              ? `Avg ${nonWeight.average} g · n=${nonWeight.sampleSize}`
              : `n=${plated.value.nonPlatedCount}`,
          href: databaseHref({
            ...DEFAULT_DATABASE_FILTERS,
            plate: "none",
          }),
        },
        {
          rank: 3,
          label: "Carbon-plated",
          detail: `${plated.value.carbonPlatedCount} models`,
          href: databaseHref({
            ...DEFAULT_DATABASE_FILTERS,
            plate: "carbon",
          }),
        },
      ],
      viewAllHref: databaseHref({
        ...DEFAULT_DATABASE_FILTERS,
        plate: "carbon",
      }),
      viewAllLabel: "View carbon-plated shoes",
    });
  }

  return cards;
}

export function computeRunningShoeMarketInsights(
  records: RunningShoeDatabaseRecord[],
  options?: { minBrandSample?: number; valuePriceCeiling?: number },
): RunningShoeMarketInsights {
  const minBrandSample = options?.minBrandSample ?? MIN_BRAND_SAMPLE_FOR_RANKING;
  const valuePriceCeiling =
    options?.valuePriceCeiling ?? BEST_VALUE_PRICE_CEILING_EUR;

  const base = {
    eligibleCount: records.length,
    unitOfAnalysis: "product-model" as const,
    minBrandSampleForRanking: minBrandSample,
    lightestDailyTrainers: computeLightestDailyTrainers(records),
    highestStackShoes: computeHighestStackShoes(records),
    lowestDropTrainers: computeLowestDropTrainers(records),
    bestValueUnderPrice: computeBestValueUnderPrice(
      records,
      valuePriceCeiling,
    ),
    averageOfferPriceByBrand: computeAverageOfferPriceByBrand(
      records,
      minBrandSample,
    ),
    averageWeightByBrand: computeAverageWeightByBrand(records, minBrandSample),
    platedVsNonPlated: computePlatedVsNonPlated(records),
  };

  return {
    ...base,
    generatedAt: new Date().toISOString(),
    cards: buildInsightCards(base),
  };
}
