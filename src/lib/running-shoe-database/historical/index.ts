export {
  MIN_YEARS_FOR_PUBLIC_TREND,
  MIN_OBS_PER_YEAR_FOR_TREND,
  MIN_TOTAL_DATED_OBS_FOR_TREND,
  MIN_BRANDS_IN_TREND_SAMPLE,
  MAX_BRAND_SHARE_PER_YEAR,
  MIN_RELEASE_YEAR_COVERAGE_OF_POPULATION,
} from "@/lib/running-shoe-database/historical/thresholds";
export { buildHistoricalObservationsFromCatalog } from "@/lib/running-shoe-database/historical/build-observations";
export {
  assessTrendMetric,
  assessHistoricalPublicInsightsReadiness,
  getPublishableHistoricalSeries,
} from "@/lib/running-shoe-database/historical/trend-eligibility";
export { auditRunningShoeHistoricalCoverage } from "@/lib/running-shoe-database/historical/coverage";
export type {
  HistoricalEvidenceKind,
  HistoricalFieldEvidence,
  HistoricalShoeObservation,
  HistoricalTrendMetric,
  HistoricalYearBucket,
  HistoricalTrendSeriesPoint,
  HistoricalTrendAssessment,
  HistoricalPublicInsightsReadiness,
} from "@/lib/running-shoe-database/historical/types";
export type { HistoricalCoverageAudit } from "@/lib/running-shoe-database/historical/coverage";
