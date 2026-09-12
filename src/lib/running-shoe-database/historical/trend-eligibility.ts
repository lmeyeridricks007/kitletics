import type { HistoricalShoeObservation } from "@/lib/running-shoe-database/historical/types";
import type {
  HistoricalPublicInsightsReadiness,
  HistoricalTrendAssessment,
  HistoricalTrendMetric,
  HistoricalTrendSeriesPoint,
  HistoricalYearBucket,
} from "@/lib/running-shoe-database/historical/types";
import {
  MAX_BRAND_SHARE_PER_YEAR,
  MIN_BRANDS_IN_TREND_SAMPLE,
  MIN_OBS_PER_YEAR_FOR_TREND,
  MIN_RELEASE_YEAR_COVERAGE_OF_POPULATION,
  MIN_TOTAL_DATED_OBS_FOR_TREND,
  MIN_YEARS_FOR_PUBLIC_TREND,
} from "@/lib/running-shoe-database/historical/thresholds";

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

function metricValue(
  obs: HistoricalShoeObservation,
  metric: HistoricalTrendMetric,
): number | null {
  switch (metric) {
    case "medianWeightG":
      return obs.weightG ?? null;
    case "medianHeelStackMm":
      return obs.heelStackMm ?? null;
    case "medianDropMm":
      return obs.dropMm ?? null;
    case "medianLaunchPriceEur":
      return obs.launchPriceEur ?? null;
    case "platedShare":
      return typeof obs.plate === "boolean" ? (obs.plate ? 1 : 0) : null;
    default:
      return null;
  }
}

function yearBucketsForMetric(
  dated: HistoricalShoeObservation[],
  metric: HistoricalTrendMetric,
): HistoricalYearBucket[] {
  const byYear = new Map<number, HistoricalShoeObservation[]>();
  for (const obs of dated) {
    if (obs.releaseYear == null) continue;
    if (metricValue(obs, metric) == null) continue;
    const list = byYear.get(obs.releaseYear) ?? [];
    list.push(obs);
    byYear.set(obs.releaseYear, list);
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, rows]) => {
      const brandMap = new Map<string, { brandName: string; count: number }>();
      for (const r of rows) {
        const prev = brandMap.get(r.brandSlug);
        if (prev) prev.count += 1;
        else brandMap.set(r.brandSlug, { brandName: r.brandName, count: 1 });
      }
      const brands = [...brandMap.entries()]
        .map(([brandSlug, v]) => ({
          brandSlug,
          brandName: v.brandName,
          count: v.count,
        }))
        .sort((a, b) => b.count - a.count || a.brandSlug.localeCompare(b.brandSlug));
      const maxBrandShare =
        rows.length === 0 ? 0 : (brands[0]?.count ?? 0) / rows.length;
      return {
        year,
        sampleSize: rows.length,
        coverage: 1,
        brandCount: brands.length,
        maxBrandShare,
        brands,
      };
    });
}

function seriesForMetric(
  dated: HistoricalShoeObservation[],
  metric: HistoricalTrendMetric,
): HistoricalTrendSeriesPoint[] {
  const byYear = new Map<number, number[]>();
  const buckets = yearBucketsForMetric(dated, metric);
  const bucketByYear = new Map(buckets.map((b) => [b.year, b]));

  for (const obs of dated) {
    if (obs.releaseYear == null) continue;
    const v = metricValue(obs, metric);
    if (v == null) continue;
    const list = byYear.get(obs.releaseYear) ?? [];
    list.push(v);
    byYear.set(obs.releaseYear, list);
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, values]) => {
      const bucket = bucketByYear.get(year)!;
      const value =
        metric === "platedShare"
          ? values.reduce((a, b) => a + b, 0) / values.length
          : median(values)!;
      return {
        year,
        value,
        sampleSize: bucket.sampleSize,
        coverage: bucket.coverage,
        brandCount: bucket.brandCount,
        maxBrandShare: bucket.maxBrandShare,
      };
    });
}

export function assessTrendMetric(
  observations: HistoricalShoeObservation[],
  metric: HistoricalTrendMetric,
  populationSize: number,
): HistoricalTrendAssessment {
  const dated = observations.filter((o) => o.releaseYear != null);
  const withMetric = dated.filter((o) => metricValue(o, metric) != null);
  const years = yearBucketsForMetric(dated, metric);
  const blockers: string[] = [];

  const releaseCoverage =
    populationSize > 0 ? dated.length / populationSize : 0;
  if (releaseCoverage < MIN_RELEASE_YEAR_COVERAGE_OF_POPULATION) {
    blockers.push(
      `Release-year coverage ${(releaseCoverage * 100).toFixed(1)}% < ${(MIN_RELEASE_YEAR_COVERAGE_OF_POPULATION * 100).toFixed(0)}% of eligible population`,
    );
  }

  if (years.length < MIN_YEARS_FOR_PUBLIC_TREND) {
    blockers.push(
      `Only ${years.length} distinct release year(s); need ≥${MIN_YEARS_FOR_PUBLIC_TREND}`,
    );
  }

  if (withMetric.length < MIN_TOTAL_DATED_OBS_FOR_TREND) {
    blockers.push(
      `Only ${withMetric.length} dated observations with ${metric}; need ≥${MIN_TOTAL_DATED_OBS_FOR_TREND}`,
    );
  }

  const thinYears = years.filter((y) => y.sampleSize < MIN_OBS_PER_YEAR_FOR_TREND);
  if (thinYears.length > 0) {
    blockers.push(
      `Year(s) below n=${MIN_OBS_PER_YEAR_FOR_TREND}: ${thinYears
        .map((y) => `${y.year}(n=${y.sampleSize})`)
        .join(", ")}`,
    );
  }

  const brands = new Set(withMetric.map((o) => o.brandSlug));
  if (brands.size < MIN_BRANDS_IN_TREND_SAMPLE) {
    blockers.push(
      `Only ${brands.size} brand(s) in dated ${metric} sample; need ≥${MIN_BRANDS_IN_TREND_SAMPLE}`,
    );
  }

  const dominated = years.filter((y) => y.maxBrandShare > MAX_BRAND_SHARE_PER_YEAR);
  if (dominated.length > 0) {
    blockers.push(
      `Brand concentration >${(MAX_BRAND_SHARE_PER_YEAR * 100).toFixed(0)}% in year(s): ${dominated
        .map((y) => `${y.year}(${(y.maxBrandShare * 100).toFixed(0)}%)`)
        .join(", ")}`,
    );
  }

  if (metric === "medianLaunchPriceEur") {
    blockers.push(
      "No canonical launchPrice/MSRP field — offer prices must not proxy launch price",
    );
  }

  const eligible = blockers.length === 0;
  return {
    metric,
    eligible,
    blockers,
    years,
    series: eligible ? seriesForMetric(dated, metric) : null,
  };
}

const PUBLIC_METRICS: HistoricalTrendMetric[] = [
  "medianWeightG",
  "medianHeelStackMm",
  "medianDropMm",
  "medianLaunchPriceEur",
  "platedShare",
];

/**
 * Gate for the public “How running shoes have changed” section.
 * Returns evidenceReady=false until thresholds clear — callers must not publish charts.
 */
export function assessHistoricalPublicInsightsReadiness(
  observations: HistoricalShoeObservation[],
  options?: {
    populationSize?: number;
    familyMultiYearCount?: number;
    generationRelationshipCount?: number;
    assessedAt?: string;
  },
): HistoricalPublicInsightsReadiness {
  const populationSize = options?.populationSize ?? observations.length;
  const dated = observations.filter((o) => o.releaseYear != null);
  const years = new Set(dated.map((o) => o.releaseYear!));
  const launchPriceObservationCount = observations.filter(
    (o) => o.launchPriceEur != null && o.evidence.launchPriceEur,
  ).length;

  const trends = PUBLIC_METRICS.map((metric) =>
    assessTrendMetric(observations, metric, populationSize),
  );

  const blockers = [
    ...new Set(trends.flatMap((t) => t.blockers)),
  ];

  if ((options?.generationRelationshipCount ?? 0) === 0) {
    blockers.push(
      "No previous/next-generation product relationships among eligible shoes — family lineage graph is empty",
    );
  }

  const evidenceReady = trends.some((t) => t.eligible);

  return {
    evidenceReady,
    assessedAt: options?.assessedAt ?? new Date().toISOString(),
    populationSize,
    datedObservationCount: dated.length,
    distinctReleaseYears: years.size,
    launchPriceObservationCount,
    familyMultiYearCount: options?.familyMultiYearCount ?? 0,
    generationRelationshipCount: options?.generationRelationshipCount ?? 0,
    blockers,
    trends,
    publicStatus: evidenceReady
      ? {
          kind: "ready",
          headline: "How running shoes have changed",
        }
      : {
          kind: "not-ready",
          headline: "Historical market trends are not evidence-ready",
          summary:
            "Kitletics will not publish “how running shoes have changed” charts until release-year coverage, per-year samples, brand diversity, and (for price) launch/MSRP fields meet published thresholds. Current catalog specs describe today’s models — they are not a backfilled history.",
        },
  };
}

/**
 * Guard helper for UI / API — never return series when not eligible.
 */
export function getPublishableHistoricalSeries(
  readiness: HistoricalPublicInsightsReadiness,
  metric: HistoricalTrendMetric,
): HistoricalTrendSeriesPoint[] | null {
  if (!readiness.evidenceReady) return null;
  const trend = readiness.trends.find((t) => t.metric === metric);
  if (!trend?.eligible) return null;
  return trend.series;
}
