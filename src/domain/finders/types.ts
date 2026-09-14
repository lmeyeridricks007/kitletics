import type { EntityId } from "@/domain/shared/types";
import type { ExperienceLevel } from "@/domain/products/types";
import type { RegionCode } from "@/domain/shared/types";
import type { MatchBand } from "@/domain/finders/match-bands";

export type FinderQuestionType =
  | "single-select"
  | "multi-select"
  | "boolean"
  | "number"
  | "range"
  | "slider"
  | "optional-number";

export interface FinderOption {
  id: string;
  value: string;
  label: string;
  description?: string;
}

export interface FinderQuestion {
  id: string;
  key: string;
  type: FinderQuestionType;
  title: string;
  description?: string;
  options?: FinderOption[];
  required: boolean;
  /** Show when these response predicates hold */
  showWhen?: FinderShowWhen;
  /** Max selections for multi-select */
  maxSelections?: number;
  unitOptions?: { value: string; label: string }[];
  min?: number;
  max?: number;
  affects?: string[];
}

export interface FinderShowWhen {
  key: string;
  /** Response includes any of these values */
  anyOf?: string[];
  equals?: string;
}

export type FinderResponseValue =
  | string
  | string[]
  | number
  | boolean
  | { value: number; unit: string }
  | null
  | undefined;

export type FinderResponses = Record<string, FinderResponseValue>;

export interface FinderBudgetBand {
  id: string;
  label: string;
  /** Inclusive min in band currency; omit for open lower */
  min?: number;
  /** Inclusive max; omit for open upper */
  max?: number;
  currency: string;
}

export interface FinderRegionalBudgetConfig {
  region: RegionCode;
  currency: string;
  bands: FinderBudgetBand[];
}

export interface FinderScoringProfile {
  /** Base factor weights (relative; normalized at runtime) */
  baseWeights: Record<string, number>;
  /** User priority value → factor key multipliers */
  priorityMultipliers: Record<string, Record<string, number>>;
  /** Soft penalty curve for budget overspend */
  budget: {
    withinScore: number;
    slightOverRatio: number;
    slightOverScore: number;
    farOverRatio: number;
    farOverScore: number;
    noOfferScore: number;
  };
}

export interface FinderResultConfig {
  minMatchForDisplay: number;
  minCoverageForTopRecommendation: number;
  maxResults: number;
  catalogCoverageMessage?: string;
}

export interface FinderDefinition {
  id: string;
  slug: string;
  toolId: string;
  sportId: EntityId;
  categoryId: EntityId;
  /** Optional multi-category support (e.g. HYROX shoes spanning training + running) */
  categoryIds?: EntityId[];
  title: string;
  description: string;
  version: string;
  questions: FinderQuestion[];
  scoringProfile: FinderScoringProfile;
  resultConfig: FinderResultConfig;
  regionalBudgets: FinderRegionalBudgetConfig[];
  /** Question key for priorities */
  priorityKey: string;
  /** Question key for budget */
  budgetKey: string;
}

/** Normalized profile — canonical IDs, not display strings */
export interface FinderNormalizedProfile {
  sportIds: EntityId[];
  categoryId: EntityId;
  categoryIds?: EntityId[];
  terrain?: string;
  primaryUses: string[];
  distances: string[];
  raceDistance?: string;
  cushioning?: string;
  stability?: string;
  width?: string;
  /** Manufacturer sizing range — men / women / unisex / unsure */
  sizingRange?: string;
  experienceLevel?: ExperienceLevel;
  /** Never put exact weight in share URLs — session only */
  weightKg?: number;
  priorities: string[];
  budgetBandId?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency?: string;
  region: RegionCode;
  /** Room ceiling in cm — used by rack / pull-up finders */
  ceilingHeightCm?: number;
  /** GPS watch finder — offline maps required */
  needsMaps?: boolean;
  /** HRM finder — chest / armband / any */
  formFactor?: string;
  /** HRM finder — running dynamics required */
  needsDynamics?: boolean;
  /** Racket Match — sport-specific preferences (consumer language) */
  playingStyle?: string;
  weightPreference?: string;
  balancePreference?: string;
  feelPreference?: string;
  /** Existing product id when comparing to current equipment */
  currentEquipmentId?: string;
  /** What the user wants to change vs current equipment */
  changeGoals?: string[];
  /** Padel — court side preference (soft signal) */
  courtPosition?: string;
  /** Padel — arm/elbow comfort is a hard priority */
  armComfortPriority?: boolean;
}

export type FactorConfidence =
  | "verified-spec"
  | "recommendation"
  | "inferred"
  | "unknown"
  | "neutral";

export interface FactorScore {
  factor: string;
  label: string;
  score: number;
  weight: number;
  confidence: FactorConfidence;
  explanation: string;
  evidenceIds?: string[];
}

export interface EligibilityExclusion {
  ruleId: string;
  reason: string;
}

export interface EligibilityResult {
  productId: string;
  eligible: boolean;
  exclusions: EligibilityExclusion[];
}

export interface EvaluatedProduct {
  productId: string;
  eligible: boolean;
  exclusions: EligibilityExclusion[];
  matchScore: number;
  factorScores: FactorScore[];
  strengths: string[];
  compromises: string[];
  evidenceConfidence: "high" | "medium" | "low";
  dataCoverage: number;
  /** Average of known recommendation context scores used */
  contextScore?: number;
}

export interface RankedFinderResult extends EvaluatedProduct {
  rank: number;
  band: MatchBand;
}

export interface FinderRunResult {
  normalizedProfile: FinderNormalizedProfile;
  evaluatedProducts: EvaluatedProduct[];
  rankedResults: RankedFinderResult[];
  eligibleCount: number;
  analysedCount: number;
  finderVersion: string;
  conflictingPriorities: boolean;
}

export interface FinderShareState {
  v: string;
  f: string;
  /** Compact responses — sensitive fields excluded */
  r: Record<string, string | string[] | number | boolean>;
}
