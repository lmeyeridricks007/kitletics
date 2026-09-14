/**
 * Citation / freshness metadata for the public Padel Racket Database.
 *
 * IMPORTANT:
 * - Never set `updatedOn` from Date.now(), deploy time, or build time.
 * - Only set `updatedOn` when an intentional catalog/dataset refresh is recorded.
 * - Keep `updatedOn` null until ops intentionally stamps a refresh.
 */
export const PADEL_RACKET_DATASET_META = {
  version: "2026.09",
  updatedOn: null as string | null,
  path: "/padel/rackets/database" as const,
  researchCsvPath: "/padel/rackets/database/research.csv" as const,
} as const;

export type PadelRacketDatasetMeta = typeof PADEL_RACKET_DATASET_META;
