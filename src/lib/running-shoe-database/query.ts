import type { AudienceFit } from "@/domain/products/types";
import type {
  RunningShoeDatabaseActiveChip,
  RunningShoeDatabaseFilters,
  RunningShoeDatabaseRecord,
  RunningShoeDatabaseSort,
} from "@/lib/running-shoe-database/types";
import {
  DROP_BUCKETS,
  PRICE_BUCKETS,
  STACK_BUCKETS,
  WEIGHT_BUCKETS,
  DEFAULT_DATABASE_FILTERS,
  matchesAnyBucket,
} from "@/lib/running-shoe-database/params";

export { DEFAULT_DATABASE_FILTERS };

export const DATABASE_SORT_OPTIONS: Array<{
  value: RunningShoeDatabaseSort;
  label: string;
}> = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price low → high" },
  { value: "price-desc", label: "Price high → low" },
  { value: "weight-asc", label: "Lightest" },
  { value: "weight-desc", label: "Heaviest" },
  { value: "drop-asc", label: "Lowest drop" },
  { value: "stack-desc", label: "Highest stack" },
];

function includesAny(hay: string[], needles: string[]): boolean {
  if (needles.length === 0) return true;
  return needles.some((n) => hay.includes(n));
}

function matchesGender(
  record: RunningShoeDatabaseRecord,
  gender: AudienceFit[],
): boolean {
  if (gender.length === 0) return true;
  const available =
    record.genderFit.length > 0 ? record.genderFit : record.audiences;
  return gender.some((g) => available.includes(g));
}

export function filterRunningShoeDatabaseRecords(
  records: RunningShoeDatabaseRecord[],
  filters: RunningShoeDatabaseFilters,
): RunningShoeDatabaseRecord[] {
  const q = filters.q?.trim().toLowerCase();

  return records.filter((r) => {
    if (filters.brand.length > 0 && !filters.brand.includes(r.brandSlug)) {
      return false;
    }
    if (!includesAny(r.typeSlugs, filters.type)) return false;
    if (!includesAny(r.useCaseSlugs, filters.useCase)) return false;
    if (
      filters.cushion.length > 0 &&
      (!r.cushionLevel || !filters.cushion.includes(r.cushionLevel))
    ) {
      return false;
    }
    if (
      filters.stability.length > 0 &&
      (!r.stability || !filters.stability.includes(r.stability))
    ) {
      return false;
    }
    if (!includesAny(r.terrain, filters.terrain)) return false;
    if (!includesAny(r.surface, filters.surface)) return false;
    if (!includesAny(r.recommendedDistance, filters.distance)) return false;
    if (!includesAny(r.widthOptions, filters.width)) return false;
    if (!matchesGender(r, filters.gender)) return false;

    if (filters.plate === "plated" && r.plate !== true) return false;
    if (filters.plate === "carbon" && !r.carbonPlated) return false;
    if (filters.plate === "none" && r.plate === true) return false;

    if (!matchesAnyBucket(r.weightG, filters.weightBuckets, WEIGHT_BUCKETS)) {
      return false;
    }
    if (!matchesAnyBucket(r.dropMm, filters.dropBuckets, DROP_BUCKETS)) {
      return false;
    }
    if (
      !matchesAnyBucket(r.heelStackMm, filters.stackBuckets, STACK_BUCKETS)
    ) {
      return false;
    }
    if (
      !matchesAnyBucket(r.price?.amount, filters.priceBuckets, PRICE_BUCKETS)
    ) {
      return false;
    }
    if (filters.priceMax !== undefined) {
      if (!r.price || r.price.amount > filters.priceMax) return false;
    }

    if (q) {
      const hay = [
        r.fullName,
        r.name,
        r.brandName,
        r.familyName,
        ...r.typeLabels,
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
export function sortRunningShoeDatabaseRecords(
  records: RunningShoeDatabaseRecord[],
  sort: RunningShoeDatabaseSort,
): RunningShoeDatabaseRecord[] {
  const copy = [...records];
  const byName = (a: RunningShoeDatabaseRecord, b: RunningShoeDatabaseRecord) =>
    a.fullName.localeCompare(b.fullName);

  switch (sort) {
    case "weight-asc":
      return copy.sort(
        (a, b) => (a.weightG ?? 9999) - (b.weightG ?? 9999) || byName(a, b),
      );
    case "weight-desc":
      return copy.sort(
        (a, b) => (b.weightG ?? 0) - (a.weightG ?? 0) || byName(a, b),
      );
    case "drop-asc":
      return copy.sort(
        (a, b) => (a.dropMm ?? 999) - (b.dropMm ?? 999) || byName(a, b),
      );
    case "stack-desc":
      return copy.sort(
        (a, b) =>
          (b.heelStackMm ?? 0) - (a.heelStackMm ?? 0) || byName(a, b),
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
    case "recommended":
    default:
      return copy.sort(
        (a, b) => (b.score ?? 0) - (a.score ?? 0) || byName(a, b),
      );
  }
}

export function queryRunningShoeDatabase(
  records: RunningShoeDatabaseRecord[],
  filters: RunningShoeDatabaseFilters,
): RunningShoeDatabaseRecord[] {
  return sortRunningShoeDatabaseRecords(
    filterRunningShoeDatabaseRecords(records, filters),
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
  filters: RunningShoeDatabaseFilters,
  labelMaps: {
    brand: Record<string, string>;
    type: Record<string, string>;
    useCase: Record<string, string>;
  },
): RunningShoeDatabaseActiveChip[] {
  const chips: RunningShoeDatabaseActiveChip[] = [];
  const push = (
    group: RunningShoeDatabaseActiveChip["group"],
    value: string,
    label: string,
  ) => {
    chips.push({ id: `${group}:${value}`, group, value, label });
  };

  for (const v of filters.brand) {
    push("brand", v, labelMaps.brand[v] ?? humanizeToken(v));
  }
  for (const v of filters.type) {
    push("type", v, labelMaps.type[v] ?? humanizeToken(v));
  }
  for (const v of filters.useCase) {
    push("useCase", v, labelMaps.useCase[v] ?? humanizeToken(v));
  }
  for (const v of filters.cushion) push("cushion", v, humanizeToken(v));
  for (const v of filters.stability) push("stability", v, humanizeToken(v));
  for (const v of filters.terrain) push("terrain", v, humanizeToken(v));
  for (const v of filters.surface) push("surface", v, humanizeToken(v));
  for (const v of filters.distance) push("distance", v, humanizeToken(v));
  for (const v of filters.width) push("width", v, humanizeToken(v));
  for (const v of filters.gender) {
    push(
      "gender",
      v,
      v === "men" ? "Men" : v === "women" ? "Women" : "Unisex",
    );
  }
  for (const v of filters.weightBuckets) {
    push(
      "weightBuckets",
      v,
      WEIGHT_BUCKETS.find((b) => b.id === v)?.label ?? v,
    );
  }
  for (const v of filters.dropBuckets) {
    push("dropBuckets", v, DROP_BUCKETS.find((b) => b.id === v)?.label ?? v);
  }
  for (const v of filters.stackBuckets) {
    push(
      "stackBuckets",
      v,
      STACK_BUCKETS.find((b) => b.id === v)?.label ?? v,
    );
  }
  for (const v of filters.priceBuckets) {
    push(
      "priceBuckets",
      v,
      PRICE_BUCKETS.find((b) => b.id === v)?.label ?? v,
    );
  }
  if (filters.priceMax !== undefined) {
    push("priceMax", String(filters.priceMax), `≤ €${filters.priceMax}`);
  }
  if (filters.plate !== "any") {
    push(
      "plate",
      filters.plate,
      filters.plate === "carbon"
        ? "Carbon plate"
        : filters.plate === "plated"
          ? "Plated"
          : "No plate",
    );
  }
  if (filters.q) push("q", filters.q, `“${filters.q}”`);
  return chips;
}

export function removeDatabaseFilterValue(
  filters: RunningShoeDatabaseFilters,
  chip: RunningShoeDatabaseActiveChip,
): RunningShoeDatabaseFilters {
  if (chip.group === "plate") {
    return { ...filters, plate: "any" };
  }
  if (chip.group === "q") {
    return { ...filters, q: undefined };
  }
  if (chip.group === "priceMax") {
    return { ...filters, priceMax: undefined };
  }
  const key = chip.group as keyof RunningShoeDatabaseFilters;
  const current = filters[key];
  if (!Array.isArray(current)) return filters;
  return {
    ...filters,
    [key]: current.filter((v) => v !== chip.value),
  };
}

/** Identify which filter groups are most likely over-constraining a zero result. */
export function suggestRestrictiveFilters(
  filters: RunningShoeDatabaseFilters,
  chips: RunningShoeDatabaseActiveChip[],
): RunningShoeDatabaseActiveChip[] {
  const priority: RunningShoeDatabaseActiveChip["group"][] = [
    "q",
    "priceMax",
    "priceBuckets",
    "weightBuckets",
    "dropBuckets",
    "stackBuckets",
    "plate",
    "brand",
    "type",
    "useCase",
    "cushion",
    "stability",
    "surface",
    "distance",
    "gender",
  ];
  const ranked = [...chips].sort(
    (a, b) => priority.indexOf(a.group) - priority.indexOf(b.group),
  );
  return ranked.slice(0, 3);
}
