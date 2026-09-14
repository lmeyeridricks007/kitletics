/**
 * Shareable URL state for /padel/rackets/database.
 * Filtered states are UX-only — canonical stays /padel/rackets/database;
 * pages with query params are noindex via hasNonCanonicalQueryState.
 */

import type {
  PadelRacketDatabaseFilters,
  PadelRacketDatabaseSort,
} from "@/lib/padel-racket-database/types";
import { PADEL_RACKET_DATABASE_PATH } from "@/lib/padel-racket-database/constants";

export const DEFAULT_DATABASE_FILTERS: PadelRacketDatabaseFilters = {
  brand: [],
  shape: [],
  balance: [],
  weightBuckets: [],
  playerLevel: [],
  playStyle: [],
  faceMaterial: [],
  surface: [],
  core: [],
  feel: [],
  powerBuckets: [],
  controlBuckets: [],
  comfortBuckets: [],
  maneuverabilityBuckets: [],
  priceBuckets: [],
  sort: "recommended",
};

export const DATABASE_SORTS = new Set<PadelRacketDatabaseSort>([
  "recommended",
  "price-asc",
  "price-desc",
  "weight-asc",
  "weight-desc",
  "power-desc",
  "control-desc",
]);

/** Curated play-style / use-case slugs for the Play style facet. */
export const DATABASE_PLAY_STYLE_SLUGS = [
  "padel-control",
  "padel-power",
  "padel-balanced",
  "padel-beginner",
  "padel-defensive",
  "padel-easy-power",
  "padel-maneuverability",
  "padel-maximum-power",
  "padel-arm-comfort",
  "padel-intermediate",
  "padel-advanced",
  "padel-competitive",
] as const;

export interface RangeBucket {
  id: string;
  label: string;
  min?: number;
  max?: number;
}

/** Weight buckets for padel rackets (grams, using weightMin). */
export const WEIGHT_BUCKETS: RangeBucket[] = [
  { id: "under-350", label: "Under 350 g", max: 349 },
  { id: "350-365", label: "350–365 g", min: 350, max: 365 },
  { id: "365-375", label: "365–375 g", min: 365, max: 375 },
  { id: "375+", label: "375 g+", min: 375 },
];

export const PRICE_BUCKETS: RangeBucket[] = [
  { id: "under-100", label: "Under €100", max: 99 },
  { id: "100-180", label: "€100–180", min: 100, max: 180 },
  { id: "180-280", label: "€180–280", min: 180, max: 280 },
  { id: "280+", label: "€280+", min: 280 },
];

/** Score buckets only applied when the attribute exists on the record. */
export const SCORE_BUCKETS: RangeBucket[] = [
  { id: "high", label: "High (80+)", min: 80 },
  { id: "mid", label: "Mid (60–79)", min: 60, max: 79 },
  { id: "low", label: "Low (<60)", max: 59 },
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

/** Short aliases → canonical use-case slugs */
const PLAY_STYLE_ALIASES: Record<string, string> = {
  control: "padel-control",
  power: "padel-power",
  balanced: "padel-balanced",
  beginner: "padel-beginner",
  defensive: "padel-defensive",
  advanced: "padel-advanced",
  intermediate: "padel-intermediate",
  competitive: "padel-competitive",
  comfort: "padel-arm-comfort",
  maneuverability: "padel-maneuverability",
};

export function parseDatabaseSearchParams(
  sp: Record<string, string | string[] | undefined>,
): PadelRacketDatabaseFilters {
  const sortRaw = typeof sp.sort === "string" ? sp.sort : "recommended";
  const sort = DATABASE_SORTS.has(sortRaw as PadelRacketDatabaseSort)
    ? (sortRaw as PadelRacketDatabaseSort)
    : "recommended";

  const playRaw = unique([
    ...splitCsv(sp.playStyle),
    ...splitCsv(sp.style),
    ...splitCsv(sp.use),
  ]).map((v) => PLAY_STYLE_ALIASES[v] ?? v);

  return {
    ...DEFAULT_DATABASE_FILTERS,
    brand: unique(splitCsv(sp.brand)),
    shape: unique(splitCsv(sp.shape)),
    balance: unique(splitCsv(sp.balance)),
    weightBuckets: unique(splitCsv(sp.weight)),
    playerLevel: unique(splitCsv(sp.level)),
    playStyle: playRaw,
    faceMaterial: unique(splitCsv(sp.face)),
    surface: unique(splitCsv(sp.surface)),
    core: unique(splitCsv(sp.core)),
    feel: unique(splitCsv(sp.feel)),
    powerBuckets: unique(splitCsv(sp.power)),
    controlBuckets: unique(splitCsv(sp.control)),
    comfortBuckets: unique(splitCsv(sp.comfort)),
    maneuverabilityBuckets: unique(splitCsv(sp.maneuverability)),
    priceBuckets: unique(splitCsv(sp.price)),
    q: typeof sp.q === "string" && sp.q.trim() ? sp.q.trim() : undefined,
    sort,
  };
}

export function databaseHref(
  filters: PadelRacketDatabaseFilters,
  path: string = PADEL_RACKET_DATABASE_PATH,
): string {
  const params = new URLSearchParams();

  const setCsv = (key: string, values: string[]) => {
    if (values.length > 0) params.set(key, values.join(","));
  };

  setCsv("brand", filters.brand);
  setCsv("shape", filters.shape);
  setCsv("balance", filters.balance);
  setCsv("weight", filters.weightBuckets);
  setCsv("level", filters.playerLevel);
  setCsv("playStyle", filters.playStyle);
  setCsv("face", filters.faceMaterial);
  setCsv("surface", filters.surface);
  setCsv("core", filters.core);
  setCsv("feel", filters.feel);
  setCsv("power", filters.powerBuckets);
  setCsv("control", filters.controlBuckets);
  setCsv("comfort", filters.comfortBuckets);
  setCsv("maneuverability", filters.maneuverabilityBuckets);
  setCsv("price", filters.priceBuckets);

  if (filters.q) params.set("q", filters.q);
  if (filters.sort !== "recommended") params.set("sort", filters.sort);

  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function countActiveDatabaseFilters(
  filters: PadelRacketDatabaseFilters,
): number {
  return (
    filters.brand.length +
    filters.shape.length +
    filters.balance.length +
    filters.weightBuckets.length +
    filters.playerLevel.length +
    filters.playStyle.length +
    filters.faceMaterial.length +
    filters.surface.length +
    filters.core.length +
    filters.feel.length +
    filters.powerBuckets.length +
    filters.controlBuckets.length +
    filters.comfortBuckets.length +
    filters.maneuverabilityBuckets.length +
    filters.priceBuckets.length +
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
