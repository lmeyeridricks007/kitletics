import type { EntityId } from "@/domain/shared/types";

export interface RecommendationFactor {
  key: string;
  score: number;
  weight: number;
  explanation?: string;
  /** Display label when distinct from key */
  label?: string;
}

export interface Recommendation {
  id: EntityId;
  productId: EntityId;
  sportId: EntityId;
  disciplineId?: EntityId;
  useCaseId?: EntityId;
  /** 0–100 explainable suitability score for this context */
  score: number;
  factors: RecommendationFactor[];
  strengths: string[];
  compromises: string[];
  explanation: string;
  evidenceIds: EntityId[];
}

export type EvidenceType =
  | "personal-test"
  | "manufacturer"
  | "retailer"
  | "independent-review"
  | "lab-test"
  | "user-feedback"
  | "editorial-research";

export type EvidenceConfidence = "low" | "medium" | "high";

export type ProductSource =
  | "purchased-by-kitletics"
  | "purchased-by-reviewer"
  | "provided-by-brand"
  | "loaned-by-brand"
  | "retailer-sample"
  | "other";

/** Optional structured fields when Evidence.type = personal-test */
export interface PersonalTestEvidenceFields {
  testerId?: EntityId;
  startDate?: string;
  endDate?: string;
  distanceKm?: number;
  durationHours?: number;
  activities?: string[];
  surfaces?: string[];
  conditions?: string[];
  productSource?: ProductSource;
  notes?: string;
}

export interface Evidence extends PersonalTestEvidenceFields {
  id: EntityId;
  type: EvidenceType;
  source: string;
  sourceUrl?: string;
  summary: string;
  verifiedAt: string;
  confidence: EvidenceConfidence;
}

export type AlternativeRelationshipType =
  | "cheaper"
  | "premium"
  | "faster"
  | "more-cushioned"
  | "more-stable"
  | "lighter"
  | "better-value"
  | "trail-capable"
  | "beginner-friendly";

export interface AlternativeRelationship {
  id: EntityId;
  sourceProductId: EntityId;
  alternativeProductId: EntityId;
  similarityScore: number;
  reasons: string[];
  relationshipType: AlternativeRelationshipType;
}
