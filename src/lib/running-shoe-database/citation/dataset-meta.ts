/**
 * Citation / freshness metadata for the public Running Shoe Database.
 *
 * IMPORTANT:
 * - Never set `updatedOn` from Date.now(), deploy time, or build time.
 * - Only set `updatedOn` when an intentional catalog/dataset refresh is recorded.
 * - Today every eligible shoe shares SEED_DATES.updated — that is seed boilerplate,
 *   not a reliable independent dataset timestamp. Keep `updatedOn` null until
 *   ops intentionally stamps a refresh.
 */
export const RUNNING_SHOE_DATASET_META = {
  /** Citation version label (not peer-reviewed). */
  version: "2026.09",
  /**
   * ISO calendar date (YYYY-MM-DD) of the last intentional dataset refresh.
   * Null → do not render “Dataset updated …”.
   */
  updatedOn: null as string | null,
  /** Public path used in citations */
  path: "/running/shoes/database" as const,
  /** Research CSV path (limited factual extract) */
  researchCsvPath: "/running/shoes/database/research.csv" as const,
} as const;

export type RunningShoeDatasetMeta = typeof RUNNING_SHOE_DATASET_META;
