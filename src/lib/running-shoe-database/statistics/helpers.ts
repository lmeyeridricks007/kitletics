import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";
import type { StatisticResult } from "@/lib/running-shoe-database/statistics/types";

/** Brands need this many models with the metric before ranked market averages. */
export const MIN_BRAND_SAMPLE_FOR_RANKING = 3;

/** Price ceiling for the best-value insight (EUR, default-region offers). */
export const BEST_VALUE_PRICE_CEILING_EUR = 150;

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

/**
 * Presence-only metric pick. Prefer {@link withValidStatisticMetric} for
 * market statistics so SUSPECT/INVALID values cannot contaminate averages.
 */
export function withKnownMetric<T>(
  records: RunningShoeDatabaseRecord[],
  pick: (r: RunningShoeDatabaseRecord) => T | undefined | null,
): Array<{ record: RunningShoeDatabaseRecord; value: T }> {
  const out: Array<{ record: RunningShoeDatabaseRecord; value: T }> = [];
  for (const record of records) {
    const value = pick(record);
    if (value === undefined || value === null) continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    out.push({ record, value });
  }
  return out;
}

export {
  withValidStatisticMetric,
  getCachedShoeQuality,
} from "@/lib/running-shoe-database/quality";

export function statisticResult<T>(
  meta: Omit<StatisticResult<T>, "value" | "sampleSize" | "populationSize" | "coverage">,
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

export function isDailyTrainer(record: RunningShoeDatabaseRecord): boolean {
  return record.typeSlugs.includes("daily-trainers");
}
