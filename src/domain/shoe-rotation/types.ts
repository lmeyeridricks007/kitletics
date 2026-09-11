import type { RegionCode } from "@/domain/shared/types";
import type { RotationRoleId, CoverageStatus } from "@/domain/shoe-rotation/roles";

export type RotationMode = "from-scratch" | "improve";

export type RotationSizeChoice = 1 | 2 | 3 | 4 | "recommend";

export type WeeklyFrequency = "1-2" | "3" | "4" | "5" | "6+";

export type WeeklyDistanceBucket =
  | "under-20"
  | "20-40"
  | "40-60"
  | "60-80"
  | "80-plus"
  | "not-sure";

export type TerrainChoice = "road" | "trail" | "both" | "treadmill";

export type RotationPriority =
  | "comfort"
  | "performance"
  | "versatility"
  | "durability"
  | "value"
  | "minimal-shoes"
  | "race-performance";

export interface ManualOwnedShoe {
  id: string;
  label: string;
  /** User-declared primary roles only */
  roleIds: RotationRoleId[];
}

export interface RotationResponses {
  mode: RotationMode;
  trainingTypes: string[];
  weeklyFrequency?: WeeklyFrequency;
  weeklyDistance?: WeeklyDistanceBucket;
  raceDistances?: string[];
  terrain?: TerrainChoice;
  priorities: RotationPriority[];
  budgetBandId?: string;
  /** Strict budget hard-excludes over-budget additions */
  strictBudget?: boolean;
  desiredSize?: RotationSizeChoice;
  /** Max new shoes when improving */
  maxAdditions?: 1 | 2 | 3 | "recommend";
  ownedProductIds: string[];
  manualShoes: ManualOwnedShoe[];
  /** Session overrides: productId → declared primary roles */
  roleOverrides?: Record<string, RotationRoleId[]>;
  openToReplace?: boolean;
}

export interface RotationBudgetBand {
  id: string;
  label: string;
  min?: number;
  max?: number;
  currency: string;
}

export interface RotationProfile {
  mode: RotationMode;
  requiredRoles: RotationRoleId[];
  roleWeights: Record<RotationRoleId, number>;
  terrain: TerrainChoice;
  weeklyFrequency?: WeeklyFrequency;
  weeklyDistance?: WeeklyDistanceBucket;
  raceDistances: string[];
  priorities: RotationPriority[];
  budgetBandId?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency?: string;
  strictBudget: boolean;
  desiredSize: RotationSizeChoice;
  maxAdditions: 1 | 2 | 3 | "recommend";
  ownedProductIds: string[];
  manualShoes: ManualOwnedShoe[];
  roleOverrides: Record<string, RotationRoleId[]>;
  openToReplace: boolean;
  region: RegionCode;
  preferMinimal: boolean;
  preferValue: boolean;
  preferRace: boolean;
}

export interface RoleSuitability {
  roleId: RotationRoleId;
  score: number;
  confidence: "recommendation" | "inferred" | "manual" | "unknown";
  useCaseId?: string;
}

export interface ProductRoleProfile {
  productId: string;
  /** Catalog product or manual */
  kind: "catalog" | "manual";
  label?: string;
  roles: RoleSuitability[];
  byRole: Partial<Record<RotationRoleId, RoleSuitability>>;
  dataCoverage: number;
}

export interface RoleCoverageEntry {
  roleId: RotationRoleId;
  required: boolean;
  importance: number;
  coveredBy: { productId: string; suitability: number; label?: string }[];
  bestCoverage: number;
  secondBest?: number;
  status: CoverageStatus;
}

export interface RotationOverlap {
  productIds: string[];
  overlappingRoles: RotationRoleId[];
  overlapScore: number;
  useful: boolean;
  explanation: string;
}

export interface RotationGap {
  roleId: RotationRoleId;
  bestCoverage: number;
  explanation: string;
}

export interface ScoredRotationSet {
  productIds: string[];
  coverageScore: number;
  overlapPenalty: number;
  budgetScore: number;
  sizePenalty: number;
  priorityScore: number;
  totalScore: number;
  roleCoverage: RoleCoverageEntry[];
  estimatedCost?: number;
  missingPriceCount: number;
}

export interface RotationAddition {
  productId: string;
  rank: number;
  coverageBefore: number;
  coverageAfter: number;
  rolesAdded: RotationRoleId[];
  strengths: string[];
  compromises: string[];
  overlapNote: string;
}

export interface RotationResult {
  version: string;
  profile: RotationProfile;
  existingCoverage: RoleCoverageEntry[];
  gaps: RotationGap[];
  overlaps: RotationOverlap[];
  /** Full recommended catalog product IDs (owned + additions for improve mode) */
  recommendedProductIds: string[];
  additions: RotationAddition[];
  recommendedSize: number;
  sizeExplanation: string;
  primarySet: ScoredRotationSet;
  alternatives: {
    id: string;
    label: string;
    reason: string;
    set: ScoredRotationSet;
  }[];
  strongRolesCovered: number;
  requiredRolesCount: number;
  coverageSummary: string;
  catalogCoverageMessage: string;
}

export interface RotationShareState {
  v: string;
  mode: RotationMode;
  training: string[];
  freq?: string;
  dist?: string;
  races?: string[];
  terrain?: string;
  priorities: string[];
  budget?: string;
  size?: string;
  additions?: string;
  owned: string[];
  manuals?: { id: string; label: string; roles: string[] }[];
  overrides?: Record<string, string[]>;
}
