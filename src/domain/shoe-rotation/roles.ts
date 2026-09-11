/**
 * Running shoe rotation — canonical roles mapped to Kitletics UseCases.
 * Do not invent a parallel taxonomy.
 */

export const ROTATION_PLANNER_VERSION = "rotation-planner-v1";

export type RotationRoleId =
  | "daily"
  | "easy-recovery"
  | "long-run"
  | "tempo"
  | "intervals"
  | "race"
  | "trail";

export interface RotationRole {
  id: RotationRoleId;
  label: string;
  /** Primary UseCase IDs used for suitability lookup */
  useCaseIds: string[];
  /** Roles that naturally overlap (reduce false duplication) */
  relatedRoleIds: RotationRoleId[];
}

export const ROTATION_ROLES: RotationRole[] = [
  {
    id: "daily",
    label: "Daily Trainer",
    useCaseIds: ["uc-daily-training"],
    relatedRoleIds: ["easy-recovery", "long-run"],
  },
  {
    id: "easy-recovery",
    label: "Easy / Recovery",
    useCaseIds: ["uc-easy-runs", "uc-recovery-runs"],
    relatedRoleIds: ["daily", "long-run"],
  },
  {
    id: "long-run",
    label: "Long Run",
    useCaseIds: ["uc-long-runs"],
    relatedRoleIds: ["daily", "easy-recovery"],
  },
  {
    id: "tempo",
    label: "Tempo",
    useCaseIds: ["uc-tempo-runs"],
    relatedRoleIds: ["intervals", "race"],
  },
  {
    id: "intervals",
    label: "Intervals",
    useCaseIds: ["uc-intervals", "uc-speed-work", "uc-tempo-runs"],
    relatedRoleIds: ["tempo", "race"],
  },
  {
    id: "race",
    label: "Race Day",
    useCaseIds: ["uc-5k", "uc-10k", "uc-half", "uc-marathon", "uc-ultra"],
    relatedRoleIds: ["tempo", "intervals"],
  },
  {
    id: "trail",
    label: "Trail",
    useCaseIds: ["uc-trail-training"],
    relatedRoleIds: [],
  },
];

export const ROLE_BY_ID: Record<RotationRoleId, RotationRole> = Object.fromEntries(
  ROTATION_ROLES.map((r) => [r.id, r]),
) as Record<RotationRoleId, RotationRole>;

/** Training answer value → role */
export const TRAINING_TO_ROLE: Record<string, RotationRoleId> = {
  "easy-runs": "easy-recovery",
  "daily-mileage": "daily",
  "long-runs": "long-run",
  tempo: "tempo",
  intervals: "intervals",
  racing: "race",
  trail: "trail",
};

export type CoverageStatus =
  | "strong"
  | "covered"
  | "weak"
  | "gap"
  | "not-required";

/** Centralized coverage thresholds (Recommendation score scale 0–100) */
export const COVERAGE_THRESHOLDS = {
  strong: 90,
  covered: 80,
  weak: 70,
} as const;

export function coverageStatus(score: number | undefined): CoverageStatus {
  if (score === undefined || !Number.isFinite(score)) return "gap";
  if (score >= COVERAGE_THRESHOLDS.strong) return "strong";
  if (score >= COVERAGE_THRESHOLDS.covered) return "covered";
  if (score >= COVERAGE_THRESHOLDS.weak) return "weak";
  return "gap";
}

export function coverageStatusLabel(status: CoverageStatus): string {
  switch (status) {
    case "strong":
      return "Strong coverage";
    case "covered":
      return "Covered";
    case "weak":
      return "Weak coverage";
    case "gap":
      return "Gap";
    case "not-required":
      return "Not required";
  }
}

/** Minimum recommendation data coverage for a product to be a top candidate */
export const MIN_CANDIDATE_ROLE_SCORE_KNOWN = 1;

export const TOP_CANDIDATES_PER_ROLE = 8;
export const MAX_OWNED_SHOES = 4;
export const MAX_COMBINATION_POOL = 24;
export const ACCEPTABLE_COVERAGE_THRESHOLD = 0.82;

/**
 * AFFILIATE NEUTRALITY:
 * Affiliate status, commission, and retailer payout must NEVER affect
 * candidate selection, rotation scoring, or addition ranking.
 */
export const AFFILIATE_NEUTRALITY =
  "Affiliate commission is never an input to Shoe Rotation ranking.";
