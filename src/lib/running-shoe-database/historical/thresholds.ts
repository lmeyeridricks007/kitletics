/**
 * Minimum evidence before publishing “how running shoes have changed” trends.
 * Tuned to block thin year slices and single-brand domination.
 */

/** Distinct calendar years with dated observations */
export const MIN_YEARS_FOR_PUBLIC_TREND = 5;

/** Observations with the metric present in a given year */
export const MIN_OBS_PER_YEAR_FOR_TREND = 12;

/** Total dated observations carrying the metric across the series */
export const MIN_TOTAL_DATED_OBS_FOR_TREND = 60;

/** Distinct brands represented in the dated trend sample */
export const MIN_BRANDS_IN_TREND_SAMPLE = 5;

/**
 * Cap on any single brand’s share within a year bucket.
 * Prevents “Nike-only 2020 vs mixed 2024” false market stories.
 */
export const MAX_BRAND_SHARE_PER_YEAR = 0.4;

/** Minimum share of database-eligible models that must carry releaseYear for market claims */
export const MIN_RELEASE_YEAR_COVERAGE_OF_POPULATION = 0.35;
