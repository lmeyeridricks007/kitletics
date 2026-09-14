import type {
  PadelRacketDatabaseActiveChip,
  PadelRacketDatabaseFilters,
  PadelRacketDatabaseRecord,
  PadelRacketDatabaseSort,
} from "@/lib/padel-racket-database/types";
import {
  PRICE_BUCKETS,
  SCORE_BUCKETS,
  WEIGHT_BUCKETS,
  DEFAULT_DATABASE_FILTERS,
  matchesAnyBucket,
} from "@/lib/padel-racket-database/params";
import { knownWeightMinG } from "@/lib/padel-racket-database/quality";

export { DEFAULT_DATABASE_FILTERS };

export const DATABASE_SORT_OPTIONS: Array<{
  value: PadelRacketDatabaseSort;
  label: string;
}> = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price low → high" },
  { value: "price-desc", label: "Price high → low" },
  { value: "weight-asc", label: "Lightest (min weight)" },
  { value: "weight-desc", label: "Heaviest (min weight)" },
  { value: "power-desc", label: "Highest power score" },
  { value: "control-desc", label: "Highest control score" },
];

function includesAny(hay: string[], needles: string[]): boolean {
  if (needles.length === 0) return true;
  return needles.some((n) => hay.includes(n));
}

function matchesExact(
  value: string | undefined,
  selected: string[],
): boolean {
  if (selected.length === 0) return true;
  if (!value) return false;
  return selected.includes(value);
}

export function filterPadelRacketDatabaseRecords(
  records: PadelRacketDatabaseRecord[],
  filters: PadelRacketDatabaseFilters,
): PadelRacketDatabaseRecord[] {
  const q = filters.q?.trim().toLowerCase();

  return records.filter((r) => {
    if (filters.brand.length > 0 && !filters.brand.includes(r.brandSlug)) {
      return false;
    }
    if (!matchesExact(r.shape, filters.shape)) return false;
    if (!matchesExact(r.balance, filters.balance)) return false;
    if (!matchesExact(r.playerLevel, filters.playerLevel)) return false;
    if (!matchesExact(r.faceMaterial, filters.faceMaterial)) return false;
    if (!matchesExact(r.surfaceTexture, filters.surface)) return false;
    if (!matchesExact(r.core, filters.core)) return false;
    if (!matchesExact(r.feel, filters.feel)) return false;
    if (!includesAny(r.useCaseSlugs, filters.playStyle)) return false;

    if (
      !matchesAnyBucket(
        knownWeightMinG(r),
        filters.weightBuckets,
        WEIGHT_BUCKETS,
      )
    ) {
      return false;
    }
    if (
      !matchesAnyBucket(r.price?.amount, filters.priceBuckets, PRICE_BUCKETS)
    ) {
      return false;
    }
    if (
      !matchesAnyBucket(r.powerScore, filters.powerBuckets, SCORE_BUCKETS)
    ) {
      return false;
    }
    if (
      !matchesAnyBucket(r.controlScore, filters.controlBuckets, SCORE_BUCKETS)
    ) {
      return false;
    }
    if (
      !matchesAnyBucket(r.comfortScore, filters.comfortBuckets, SCORE_BUCKETS)
    ) {
      return false;
    }
    if (
      !matchesAnyBucket(
        r.maneuverabilityScore,
        filters.maneuverabilityBuckets,
        SCORE_BUCKETS,
      )
    ) {
      return false;
    }

    if (q) {
      const hay = [
        r.fullName,
        r.name,
        r.brandName,
        r.familyName,
        r.shape,
        r.balance,
        ...r.useCaseLabels,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}

/**
 * Recommended = Kitletics recommendationScore descending.
 * Never affiliate commission / retailer payout.
 */
export function sortPadelRacketDatabaseRecords(
  records: PadelRacketDatabaseRecord[],
  sort: PadelRacketDatabaseSort,
): PadelRacketDatabaseRecord[] {
  const copy = [...records];
  const byName = (
    a: PadelRacketDatabaseRecord,
    b: PadelRacketDatabaseRecord,
  ) => a.fullName.localeCompare(b.fullName);

  switch (sort) {
    case "weight-asc":
      return copy.sort(
        (a, b) =>
          (knownWeightMinG(a) ?? 9999) - (knownWeightMinG(b) ?? 9999) ||
          byName(a, b),
      );
    case "weight-desc":
      return copy.sort(
        (a, b) =>
          (knownWeightMinG(b) ?? 0) - (knownWeightMinG(a) ?? 0) ||
          byName(a, b),
      );
    case "price-asc":
      return copy.sort(
        (a, b) =>
          (a.price?.amount ?? 999999) - (b.price?.amount ?? 999999) ||
          byName(a, b),
      );
    case "price-desc":
      return copy.sort(
        (a, b) =>
          (b.price?.amount ?? 0) - (a.price?.amount ?? 0) || byName(a, b),
      );
    case "power-desc":
      return copy.sort(
        (a, b) =>
          (b.powerScore ?? 0) - (a.powerScore ?? 0) || byName(a, b),
      );
    case "control-desc":
      return copy.sort(
        (a, b) =>
          (b.controlScore ?? 0) - (a.controlScore ?? 0) || byName(a, b),
      );
    case "recommended":
    default:
      return copy.sort(
        (a, b) => (b.score ?? 0) - (a.score ?? 0) || byName(a, b),
      );
  }
}

export function queryPadelRacketDatabase(
  records: PadelRacketDatabaseRecord[],
  filters: PadelRacketDatabaseFilters,
): PadelRacketDatabaseRecord[] {
  return sortPadelRacketDatabaseRecords(
    filterPadelRacketDatabaseRecords(records, filters),
    filters.sort,
  );
}

export function humanizeToken(value: string): string {
  return value
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function buildActiveDatabaseChips(
  filters: PadelRacketDatabaseFilters,
  labelMaps: {
    brand: Record<string, string>;
    playStyle: Record<string, string>;
  },
): PadelRacketDatabaseActiveChip[] {
  const chips: PadelRacketDatabaseActiveChip[] = [];
  const push = (
    group: PadelRacketDatabaseActiveChip["group"],
    value: string,
    label: string,
  ) => {
    chips.push({ id: `${group}:${value}`, group, value, label });
  };

  for (const v of filters.brand) {
    push("brand", v, labelMaps.brand[v] ?? humanizeToken(v));
  }
  for (const v of filters.shape) push("shape", v, humanizeToken(v));
  for (const v of filters.balance) push("balance", v, humanizeToken(v));
  for (const v of filters.playerLevel) {
    push("playerLevel", v, humanizeToken(v));
  }
  for (const v of filters.playStyle) {
    push("playStyle", v, labelMaps.playStyle[v] ?? humanizeToken(v));
  }
  for (const v of filters.faceMaterial) {
    push("faceMaterial", v, humanizeToken(v));
  }
  for (const v of filters.surface) {
    push("surface", v, humanizeToken(v));
  }
  for (const v of filters.core) push("core", v, humanizeToken(v));
  for (const v of filters.feel) push("feel", v, humanizeToken(v));
  for (const v of filters.weightBuckets) {
    push(
      "weightBuckets",
      v,
      WEIGHT_BUCKETS.find((b) => b.id === v)?.label ?? v,
    );
  }
  for (const v of filters.priceBuckets) {
    push(
      "priceBuckets",
      v,
      PRICE_BUCKETS.find((b) => b.id === v)?.label ?? v,
    );
  }
  for (const v of filters.powerBuckets) {
    push(
      "powerBuckets",
      v,
      SCORE_BUCKETS.find((b) => b.id === v)?.label ?? `Power ${v}`,
    );
  }
  for (const v of filters.controlBuckets) {
    push(
      "controlBuckets",
      v,
      SCORE_BUCKETS.find((b) => b.id === v)?.label ?? `Control ${v}`,
    );
  }
  for (const v of filters.comfortBuckets) {
    push(
      "comfortBuckets",
      v,
      SCORE_BUCKETS.find((b) => b.id === v)?.label ?? `Comfort ${v}`,
    );
  }
  for (const v of filters.maneuverabilityBuckets) {
    push(
      "maneuverabilityBuckets",
      v,
      SCORE_BUCKETS.find((b) => b.id === v)?.label ?? `Maneuverability ${v}`,
    );
  }
  if (filters.q) push("q", filters.q, `“${filters.q}”`);
  return chips;
}

export function removeDatabaseFilterValue(
  filters: PadelRacketDatabaseFilters,
  chip: PadelRacketDatabaseActiveChip,
): PadelRacketDatabaseFilters {
  if (chip.group === "q") {
    return { ...filters, q: undefined };
  }
  const key = chip.group as keyof PadelRacketDatabaseFilters;
  const current = filters[key];
  if (!Array.isArray(current)) return filters;
  return {
    ...filters,
    [key]: current.filter((v) => v !== chip.value),
  };
}

export function suggestRestrictiveFilters(
  filters: PadelRacketDatabaseFilters,
  chips: PadelRacketDatabaseActiveChip[],
): PadelRacketDatabaseActiveChip[] {
  const priority: PadelRacketDatabaseActiveChip["group"][] = [
    "q",
    "priceBuckets",
    "weightBuckets",
    "powerBuckets",
    "controlBuckets",
    "brand",
    "shape",
    "balance",
    "playStyle",
    "faceMaterial",
    "surface",
    "core",
    "feel",
    "playerLevel",
  ];
  const ranked = [...chips].sort(
    (a, b) => priority.indexOf(a.group) - priority.indexOf(b.group),
  );
  return ranked.slice(0, 3);
}
