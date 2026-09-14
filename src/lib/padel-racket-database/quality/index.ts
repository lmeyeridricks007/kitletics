/**
 * Basic quality helpers: only include numeric stats when values are present.
 * Do not average fabricated or invented midpoints.
 */

import type { PadelRacketDatabaseRecord } from "@/lib/padel-racket-database/types";

export type PadelQualityMetricKey =
  | "weightMin"
  | "price"
  | "power"
  | "control"
  | "comfort"
  | "maneuverability";

/** Presence-only — never invent a value when missing. */
export function withKnownMetric<T>(
  records: PadelRacketDatabaseRecord[],
  pick: (r: PadelRacketDatabaseRecord) => T | undefined | null,
): Array<{ record: PadelRacketDatabaseRecord; value: T }> {
  const out: Array<{ record: PadelRacketDatabaseRecord; value: T }> = [];
  for (const record of records) {
    const value = pick(record);
    if (value === undefined || value === null) continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    out.push({ record, value });
  }
  return out;
}

/**
 * Weight for statistics: use weightMin only (never invent a midpoint from max).
 */
export function knownWeightMinG(
  record: PadelRacketDatabaseRecord,
): number | undefined {
  if (
    typeof record.weightMinG === "number" &&
    Number.isFinite(record.weightMinG) &&
    record.weightMinG > 0
  ) {
    return record.weightMinG;
  }
  return undefined;
}

export function knownPriceEur(
  record: PadelRacketDatabaseRecord,
): number | undefined {
  if (
    record.price &&
    record.price.currency === "EUR" &&
    Number.isFinite(record.price.amount) &&
    record.price.amount > 0
  ) {
    return record.price.amount;
  }
  return undefined;
}

export function formatWeightLabel(record: PadelRacketDatabaseRecord): string | undefined {
  if (record.weightMinG === undefined) return undefined;
  if (
    record.weightMaxG !== undefined &&
    record.weightMaxG !== record.weightMinG
  ) {
    return `${record.weightMinG}–${record.weightMaxG} g`;
  }
  return `${record.weightMinG} g`;
}
