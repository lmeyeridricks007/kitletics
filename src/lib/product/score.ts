export type ScoreBand =
  | "exceptional"
  | "excellent"
  | "very-good"
  | "good"
  | "solid"
  | "mixed";

export interface ScoreBandInfo {
  band: ScoreBand;
  label: string;
  min: number;
  max: number;
}

export const SCORE_BANDS: ScoreBandInfo[] = [
  { band: "exceptional", label: "Exceptional", min: 95, max: 100 },
  { band: "excellent", label: "Excellent", min: 90, max: 94 },
  { band: "very-good", label: "Very Good", min: 85, max: 89 },
  { band: "good", label: "Good", min: 80, max: 84 },
  { band: "solid", label: "Solid", min: 70, max: 79 },
  { band: "mixed", label: "Mixed", min: 0, max: 69 },
];

export function getScoreBand(score: number): ScoreBandInfo {
  for (const band of SCORE_BANDS) {
    if (score >= band.min && score <= band.max) return band;
  }
  return SCORE_BANDS[SCORE_BANDS.length - 1];
}

/** Product data older than this many days is considered stale for QA. */
export const PRODUCT_STALE_DAYS = 180;
/** Offer lastChecked older than this many days is considered stale. */
export const OFFER_STALE_DAYS = 14;

function daysBetween(iso: string, now = new Date()): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return (now.getTime() - then) / (1000 * 60 * 60 * 24);
}

export function isProductDataStale(
  lastVerifiedAt: string | undefined,
  now = new Date(),
): boolean {
  if (!lastVerifiedAt) return true;
  return daysBetween(lastVerifiedAt, now) > PRODUCT_STALE_DAYS;
}

export function isOfferStale(
  lastChecked: string | undefined,
  now = new Date(),
): boolean {
  if (!lastChecked) return true;
  return daysBetween(lastChecked, now) > OFFER_STALE_DAYS;
}

export function formatVerifiedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
