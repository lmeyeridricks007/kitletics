import type { EntityId } from "@/domain/shared/types";

/**
 * Controlled product relationship types for the decision graph.
 * Category configs decide which types apply (e.g. more-cushioned is shoe-specific).
 */
export type ProductRelationshipType =
  | "similar"
  | "direct-competitor"
  | "cheaper-alternative"
  | "premium-alternative"
  | "lighter-alternative"
  | "more-cushioned"
  | "more-stable"
  | "more-responsive"
  | "more-versatile"
  | "more-durable"
  | "race-focused-alternative"
  | "daily-training-alternative"
  | "long-run-alternative"
  | "trail-alternative"
  | "previous-generation"
  | "next-generation"
  | "complements"
  | "rotation-complement"
  | "comparison-candidate"
  | "compatible-with"
  /** Legacy AlternativeRelationship aliases mapped at repository boundary */
  | "cheaper"
  | "premium"
  | "faster"
  | "lighter"
  | "better-value"
  | "trail-capable"
  | "beginner-friendly";

export type RelationshipGroup =
  | "ALTERNATIVE"
  | "STRUCTURAL"
  | "DECISION"
  | "COMPLEMENTARY";

export type CatalogPriority = "flagship" | "major" | "standard" | "long-tail";

export type ComparisonPriority = "HIGH" | "MEDIUM" | "LOW";

export type RelationshipStatus = "approved" | "candidate" | "deprecated";

export interface ProductRelationship {
  id: EntityId;
  sourceProductId: EntityId;
  targetProductId: EntityId;
  type: ProductRelationshipType;
  categoryId?: EntityId;
  /** Use-case / recommendation contexts this relationship is strongest for */
  contextIds?: EntityId[];
  /** 0–100 internal strength / similarity — never show as “93.74% similar” */
  strength?: number;
  reasons: string[];
  evidenceIds?: EntityId[];
  /** When false, inverse is not implied */
  directional: boolean;
  status: RelationshipStatus;
  createdAt: string;
  updatedAt: string;
  lastVerifiedAt?: string;
}

export interface RelationshipCandidate {
  sourceProductId: EntityId;
  targetProductId: EntityId;
  proposedType: ProductRelationshipType;
  confidence: number;
  reasons: string[];
  comparisonPriority?: ComparisonPriority;
}

export type SpecComparisonType =
  | "exact"
  | "enum-distance"
  | "numeric-band"
  | "multi-overlap"
  | "boolean";

export interface SimilarityFieldConfig {
  key: string;
  weight: number;
  comparisonType: SpecComparisonType;
  /** For numeric-band: band size in same units as the spec */
  bandSize?: number;
}

export interface ProductSimilarityConfig {
  categoryId: EntityId;
  fields: SimilarityFieldConfig[];
  recommendationContexts: EntityId[];
  recommendationWeight: number;
}

export interface SimilarityResult {
  score: number;
  label: "very-similar" | "similar" | "different-emphasis" | "dissimilar";
  fieldHits: { key: string; contribution: number }[];
}

export interface ProductCluster {
  id: EntityId;
  categoryId: EntityId;
  label: string;
  description: string;
  productIds: EntityId[];
  criteria: string;
}

export const RELATIONSHIP_GROUPS: Record<
  ProductRelationshipType,
  RelationshipGroup
> = {
  similar: "ALTERNATIVE",
  "direct-competitor": "DECISION",
  "cheaper-alternative": "ALTERNATIVE",
  "premium-alternative": "ALTERNATIVE",
  "lighter-alternative": "ALTERNATIVE",
  "more-cushioned": "ALTERNATIVE",
  "more-stable": "ALTERNATIVE",
  "more-responsive": "ALTERNATIVE",
  "more-versatile": "ALTERNATIVE",
  "more-durable": "ALTERNATIVE",
  "race-focused-alternative": "ALTERNATIVE",
  "daily-training-alternative": "ALTERNATIVE",
  "long-run-alternative": "ALTERNATIVE",
  "trail-alternative": "ALTERNATIVE",
  "previous-generation": "STRUCTURAL",
  "next-generation": "STRUCTURAL",
  complements: "COMPLEMENTARY",
  "rotation-complement": "COMPLEMENTARY",
  "comparison-candidate": "DECISION",
  "compatible-with": "COMPLEMENTARY",
  cheaper: "ALTERNATIVE",
  premium: "ALTERNATIVE",
  faster: "ALTERNATIVE",
  lighter: "ALTERNATIVE",
  "better-value": "ALTERNATIVE",
  "trail-capable": "ALTERNATIVE",
  "beginner-friendly": "ALTERNATIVE",
};

/** Canonical inverse where logically valid */
export const RELATIONSHIP_INVERSE: Partial<
  Record<ProductRelationshipType, ProductRelationshipType>
> = {
  "cheaper-alternative": "premium-alternative",
  "premium-alternative": "cheaper-alternative",
  cheaper: "premium",
  premium: "cheaper",
  "previous-generation": "next-generation",
  "next-generation": "previous-generation",
  similar: "similar",
  "direct-competitor": "direct-competitor",
  complements: "complements",
  "compatible-with": "compatible-with",
  "rotation-complement": "rotation-complement",
};

export const PUBLIC_SIMILARITY_LABELS: Record<
  SimilarityResult["label"],
  string
> = {
  "very-similar": "Very similar",
  similar: "Similar",
  "different-emphasis": "Different emphasis",
  dissimilar: "Different role",
};

export const ALT_GROUP_LABELS: Partial<
  Record<ProductRelationshipType, string>
> = {
  similar: "Most Similar",
  "direct-competitor": "Direct Competitor",
  "cheaper-alternative": "Cheaper Option",
  cheaper: "Cheaper Option",
  "premium-alternative": "Premium Option",
  premium: "Premium Option",
  "better-value": "Better Value",
  "more-cushioned": "More Cushioned",
  "more-stable": "More Stable",
  faster: "Faster",
  "more-responsive": "More Responsive",
  "lighter-alternative": "Lighter",
  lighter: "Lighter",
  "previous-generation": "Previous Generation",
  "next-generation": "Current / Next Generation",
  "race-focused-alternative": "More Race-Focused",
  "daily-training-alternative": "More Daily-Oriented",
  "long-run-alternative": "Better for Long Runs",
  "trail-alternative": "Trail Alternative",
  "trail-capable": "Trail Alternative",
  "beginner-friendly": "More Beginner-Friendly",
  "more-versatile": "More Versatile",
  "rotation-complement": "Rotation Complement",
  complements: "Complements",
  "compatible-with": "Compatible With",
};

export function isAlternativeType(type: ProductRelationshipType): boolean {
  return RELATIONSHIP_GROUPS[type] === "ALTERNATIVE" || type === "direct-competitor";
}

export function normalizeRelationshipType(
  type: ProductRelationshipType,
): ProductRelationshipType {
  const map: Partial<Record<ProductRelationshipType, ProductRelationshipType>> = {
    cheaper: "cheaper-alternative",
    premium: "premium-alternative",
    lighter: "lighter-alternative",
    "trail-capable": "trail-alternative",
  };
  return map[type] ?? type;
}
