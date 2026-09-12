/**
 * Shareable URL state for /running/shoes/database.
 * Filtered states are UX-only — canonical stays /running/shoes/database;
 * pages with query params are noindex via hasNonCanonicalQueryState.
 */

import type {
  RunningShoeDatabaseFilters,
  RunningShoeDatabaseSort,
} from "@/lib/running-shoe-database/types";
import { RUNNING_SHOE_DATABASE_PATH } from "@/lib/running-shoe-database/constants";
import type { AudienceFit } from "@/domain/products/types";

export const DEFAULT_DATABASE_FILTERS: RunningShoeDatabaseFilters = {
  brand: [],
  type: [],
  useCase: [],
  cushion: [],
  stability: [],
  terrain: [],
  surface: [],
  distance: [],
  width: [],
  gender: [],
  plate: "any",
  weightBuckets: [],
  dropBuckets: [],
  stackBuckets: [],
  priceBuckets: [],
  sort: "recommended",
};

export const DATABASE_SORTS = new Set<RunningShoeDatabaseSort>([
  "recommended",
  "price-asc",
  "price-desc",
  "weight-asc",
  "weight-desc",
  "drop-asc",
  "stack-desc",
]);

/** Curated Use facet — canonical taxonomy slugs only (no parallel taxonomy). */
export const DATABASE_PRIMARY_USE_SLUGS = [
  "daily-training",
  "long-runs",
  "tempo-runs",
  "intervals",
  "recovery-runs",
  "trail-running",
  "easy-runs",
] as const;

/** Prefer these when picking a card “primary use” label. */
export const DATABASE_PRIMARY_USE_PRIORITY = [
  "daily-training",
  "long-runs",
  "tempo-runs",
  "intervals",
  "recovery-runs",
  "trail-running",
  "easy-runs",
  "marathon",
  "half-marathon",
  "5k",
  "10k",
] as const;

export interface RangeBucket {
  id: string;
  label: string;
  min?: number;
  max?: number;
}

export const WEIGHT_BUCKETS: RangeBucket[] = [
  { id: "under-220", label: "Under 220 g", max: 219 },
  { id: "220-260", label: "220–260 g", min: 220, max: 260 },
  { id: "260-300", label: "260–300 g", min: 260, max: 300 },
  { id: "300+", label: "300 g+", min: 300 },
];

export const DROP_BUCKETS: RangeBucket[] = [
  { id: "0", label: "0 mm", min: 0, max: 0 },
  { id: "1-4", label: "1–4 mm", min: 1, max: 4 },
  { id: "5-8", label: "5–8 mm", min: 5, max: 8 },
  { id: "9+", label: "9+ mm", min: 9 },
];

export const STACK_BUCKETS: RangeBucket[] = [
  { id: "under-32", label: "Under 32 mm", max: 31 },
  { id: "32-36", label: "32–36 mm", min: 32, max: 36 },
  { id: "37-40", label: "37–40 mm", min: 37, max: 40 },
  { id: "41+", label: "41 mm+", min: 41 },
];

export const PRICE_BUCKETS: RangeBucket[] = [
  { id: "under-120", label: "Under €120", max: 119 },
  { id: "120-160", label: "€120–160", min: 120, max: 160 },
  { id: "160-200", label: "€160–200", min: 160, max: 200 },
  { id: "200+", label: "€200+", min: 200 },
];

function splitCsv(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function asAudience(values: string[]): AudienceFit[] {
  return values.filter(
    (v): v is AudienceFit =>
      v === "men" || v === "women" || v === "unisex",
  );
}

/** Legacy / short aliases → canonical use-case slugs */
const USE_ALIASES: Record<string, string> = {
  daily: "daily-training",
  tempo: "tempo-runs",
  recovery: "recovery-runs",
  long: "long-runs",
  easy: "easy-runs",
  trail: "trail-running",
  racing: "marathon",
};

export function parseDatabaseSearchParams(
  sp: Record<string, string | string[] | undefined>,
): RunningShoeDatabaseFilters {
  const sortRaw = typeof sp.sort === "string" ? sp.sort : "recommended";
  const sort = DATABASE_SORTS.has(sortRaw as RunningShoeDatabaseSort)
    ? (sortRaw as RunningShoeDatabaseSort)
    : "recommended";

  const useRaw = unique([
    ...splitCsv(sp.use),
    ...splitCsv(sp.usecase),
  ]).map((v) => USE_ALIASES[v] ?? v);

  const plateRaw = typeof sp.plate === "string" ? sp.plate : "any";
  const plate =
    plateRaw === "carbon" ||
    plateRaw === "plated" ||
    plateRaw === "none" ||
    plateRaw === "any"
      ? plateRaw
      : plateRaw === "true"
        ? "plated"
        : plateRaw === "false"
          ? "none"
          : "any";

  return {
    ...DEFAULT_DATABASE_FILTERS,
    brand: unique(splitCsv(sp.brand)),
    type: unique(splitCsv(sp.type)),
    useCase: useRaw,
    cushion: unique(splitCsv(sp.cushion)),
    stability: unique(splitCsv(sp.stability)),
    terrain: unique(splitCsv(sp.terrain)),
    surface: unique(splitCsv(sp.surface)),
    distance: unique(splitCsv(sp.distance)),
    width: unique([...splitCsv(sp.width), ...splitCsv(sp.widthOptions)]),
    gender: asAudience(unique([...splitCsv(sp.gender), ...splitCsv(sp.fit)])),
    plate,
    weightBuckets: unique(splitCsv(sp.weight)),
    dropBuckets: unique(splitCsv(sp.drop)),
    stackBuckets: unique(splitCsv(sp.stack)),
    priceBuckets: unique(splitCsv(sp.price)),
    priceMax:
      typeof sp.priceMax === "string" && Number.isFinite(Number(sp.priceMax))
        ? Number(sp.priceMax)
        : undefined,
    q: typeof sp.q === "string" && sp.q.trim() ? sp.q.trim() : undefined,
    sort,
  };
}

export function databaseHref(
  filters: RunningShoeDatabaseFilters,
  path: string = RUNNING_SHOE_DATABASE_PATH,
): string {
  const params = new URLSearchParams();

  const setCsv = (key: string, values: string[]) => {
    if (values.length > 0) params.set(key, values.join(","));
  };

  setCsv("brand", filters.brand);
  setCsv("type", filters.type);
  setCsv("use", filters.useCase);
  setCsv("cushion", filters.cushion);
  setCsv("stability", filters.stability);
  setCsv("terrain", filters.terrain);
  setCsv("surface", filters.surface);
  setCsv("distance", filters.distance);
  setCsv("width", filters.width);
  setCsv("gender", filters.gender);
  setCsv("weight", filters.weightBuckets);
  setCsv("drop", filters.dropBuckets);
  setCsv("stack", filters.stackBuckets);
  setCsv("price", filters.priceBuckets);

  if (filters.plate !== "any") params.set("plate", filters.plate);
  if (filters.priceMax !== undefined) {
    params.set("priceMax", String(filters.priceMax));
  }
  if (filters.q) params.set("q", filters.q);
  if (filters.sort !== "recommended") params.set("sort", filters.sort);

  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function countActiveDatabaseFilters(
  filters: RunningShoeDatabaseFilters,
): number {
  return (
    filters.brand.length +
    filters.type.length +
    filters.useCase.length +
    filters.cushion.length +
    filters.stability.length +
    filters.terrain.length +
    filters.surface.length +
    filters.distance.length +
    filters.width.length +
    filters.gender.length +
    filters.weightBuckets.length +
    filters.dropBuckets.length +
    filters.stackBuckets.length +
    filters.priceBuckets.length +
    (filters.priceMax !== undefined ? 1 : 0) +
    (filters.plate !== "any" ? 1 : 0) +
    (filters.q ? 1 : 0)
  );
}

export function inRangeBucket(
  value: number | undefined,
  bucket: RangeBucket,
): boolean {
  if (value === undefined) return false;
  if (bucket.min !== undefined && value < bucket.min) return false;
  if (bucket.max !== undefined && value > bucket.max) return false;
  return true;
}

export function matchesAnyBucket(
  value: number | undefined,
  selectedIds: string[],
  buckets: RangeBucket[],
): boolean {
  if (selectedIds.length === 0) return true;
  return selectedIds.some((id) => {
    const bucket = buckets.find((b) => b.id === id);
    return bucket ? inRangeBucket(value, bucket) : false;
  });
}
