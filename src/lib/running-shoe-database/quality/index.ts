/**
 * Statistics / chart safety: only include metric values classified as valid.
 */

import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";
import {
  assessRunningShoeQuality,
  isMetricSafeForStatistics,
} from "@/lib/running-shoe-database/quality/assess";
import type { QualityMetricKey } from "@/lib/running-shoe-database/quality/types";
import {
  buildRunningShoeDatabaseQualityReport,
  formatRunningShoeDatabaseQualityMarkdown,
  toRunningShoeDatabaseQualityCiPayload,
  STATISTICS_AFFECTED_BY_QUALITY,
} from "@/lib/running-shoe-database/quality/report";

export {
  assessRunningShoeQuality,
  isMetricSafeForStatistics,
  buildRunningShoeDatabaseQualityReport,
  formatRunningShoeDatabaseQualityMarkdown,
  toRunningShoeDatabaseQualityCiPayload,
  STATISTICS_AFFECTED_BY_QUALITY,
};
export type {
  FieldQualityFinding,
  FieldQualityStatus,
  RecordQualityStatus,
  QualityFieldKey,
  QualityMetricKey,
  ShoeQualityAssessment,
  RunningShoeDatabaseQualityReport,
  FieldCoverageRow,
} from "@/lib/running-shoe-database/quality/types";

const assessmentCache = new WeakMap<
  RunningShoeDatabaseRecord,
  ReturnType<typeof assessRunningShoeQuality>
>();

export function getCachedShoeQuality(
  record: RunningShoeDatabaseRecord,
): ReturnType<typeof assessRunningShoeQuality> {
  let a = assessmentCache.get(record);
  if (!a) {
    a = assessRunningShoeQuality(record);
    assessmentCache.set(record, a);
  }
  return a;
}

/**
 * Like presence checks, but drops SUSPECT/INVALID values for the named metric.
 */
export function withValidStatisticMetric<T>(
  records: RunningShoeDatabaseRecord[],
  metric: QualityMetricKey,
  pick: (r: RunningShoeDatabaseRecord) => T | undefined | null,
): Array<{ record: RunningShoeDatabaseRecord; value: T }> {
  const out: Array<{ record: RunningShoeDatabaseRecord; value: T }> = [];
  for (const record of records) {
    const value = pick(record);
    if (value === undefined || value === null) continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    const assessment = getCachedShoeQuality(record);
    if (!isMetricSafeForStatistics(assessment, metric)) continue;
    out.push({ record, value });
  }
  return out;
}

/** Strip unsafe numeric fields for Data Explorer rows (flag, don’t invent). */
export function qualitySafeExplorerFields(record: RunningShoeDatabaseRecord): {
  weightG?: number;
  dropMm?: number;
  heelStackMm?: number;
  priceEur?: number;
  plate?: boolean;
} {
  const a = getCachedShoeQuality(record);
  return {
    weightG: isMetricSafeForStatistics(a, "weight") ? record.weightG : undefined,
    dropMm: isMetricSafeForStatistics(a, "drop") ? record.dropMm : undefined,
    heelStackMm: isMetricSafeForStatistics(a, "heelStack")
      ? record.heelStackMm
      : undefined,
    priceEur:
      isMetricSafeForStatistics(a, "price") && record.price?.currency === "EUR"
        ? record.price.amount
        : undefined,
    plate: isMetricSafeForStatistics(a, "plate") ? record.plate : undefined,
  };
}
