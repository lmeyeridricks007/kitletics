/**
 * Category-specific Review staleness cadences.
 * Do not hardcode one global cadence.
 */

export interface ReviewStalenessPolicy {
  categoryId: string;
  /** Days after lastVerifiedAt / updatedAt before review-soon */
  reviewSoonDays: number;
  /** Days before stale */
  staleDays: number;
  notes?: string;
}

const DEFAULT: Omit<ReviewStalenessPolicy, "categoryId"> = {
  reviewSoonDays: 150,
  staleDays: 180,
};

const BY_CATEGORY: Record<string, Omit<ReviewStalenessPolicy, "categoryId">> = {
  "cat-running-shoes": {
    reviewSoonDays: 150,
    staleDays: 365,
    notes: "Re-verify every 6–12 months or on generation/spec triggers",
  },
  "cat-gps-watches": {
    reviewSoonDays: 90,
    staleDays: 180,
    notes: "Firmware/feature churn — verify more often",
  },
  "cat-hrm": {
    reviewSoonDays: 120,
    staleDays: 240,
  },
  "cat-padel-rackets": {
    reviewSoonDays: 150,
    staleDays: 300,
  },
  "cat-tennis-rackets": {
    reviewSoonDays: 150,
    staleDays: 300,
  },
  "cat-power-racks": {
    reviewSoonDays: 270,
    staleDays: 540,
    notes: "Hardware changes slowly",
  },
  "cat-adjustable-dumbbells": {
    reviewSoonDays: 270,
    staleDays: 540,
  },
  "cat-headphones": {
    reviewSoonDays: 120,
    staleDays: 240,
  },
};

export function getReviewStalenessPolicy(categoryId: string): ReviewStalenessPolicy {
  const partial = BY_CATEGORY[categoryId] ?? DEFAULT;
  return { categoryId, ...partial };
}

export type ReviewFreshnessBand = "fresh" | "review-soon" | "stale" | "unknown";

export function evaluateReviewFreshness(input: {
  categoryId: string;
  lastVerifiedAt?: string;
  updatedAt?: string;
  now?: Date;
}): { band: ReviewFreshnessBand; ageDays: number | null; policy: ReviewStalenessPolicy } {
  const policy = getReviewStalenessPolicy(input.categoryId);
  const now = input.now ?? new Date();
  const iso = input.lastVerifiedAt ?? input.updatedAt;
  if (!iso) return { band: "unknown", ageDays: null, policy };
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return { band: "unknown", ageDays: null, policy };
  const ageDays = (now.getTime() - t) / (1000 * 60 * 60 * 24);
  if (ageDays >= policy.staleDays) return { band: "stale", ageDays, policy };
  if (ageDays >= policy.reviewSoonDays) return { band: "review-soon", ageDays, policy };
  return { band: "fresh", ageDays, policy };
}

/** Spec fields whose change may invalidate Review claims */
export const REVIEW_CLAIM_SENSITIVE_FIELDS = new Set([
  "weight",
  "heelStack",
  "forefootStack",
  "drop",
  "cushionLevel",
  "stability",
  "terrain",
  "plate",
  "plateMaterial",
  "batteryGps",
  "batterySmartwatch",
  "displayType",
  "shape",
  "balance",
  "core",
  "face",
  "lifecycleStatus",
  "generation",
]);
