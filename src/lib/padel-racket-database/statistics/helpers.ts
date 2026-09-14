import type { StatisticResult } from "@/lib/padel-racket-database/statistics/types";

/** Brands need this many models before ranked assortment comparisons. */
export const MIN_BRAND_SAMPLE_FOR_RANKING = 3;

/** Minimum known values before a distribution insight card is shown. */
export const MIN_DISTRIBUTION_SAMPLE = 8;

export function coverageRatio(sampleSize: number, populationSize: number): number {
  if (populationSize <= 0) return 0;
  return sampleSize / populationSize;
}

export function roundMetric(value: number, digits = 1): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function averageKnown(values: number[]): number | null {
  if (values.length === 0) return null;
  return roundMetric(values.reduce((a, b) => a + b, 0) / values.length);
}

export function statisticResult<T>(
  meta: Omit<
    StatisticResult<T>,
    "value" | "sampleSize" | "populationSize" | "coverage"
  >,
  value: T,
  sampleSize: number,
  populationSize: number,
): StatisticResult<T> {
  return {
    ...meta,
    value,
    sampleSize,
    populationSize,
    coverage: coverageRatio(sampleSize, populationSize),
  };
}
