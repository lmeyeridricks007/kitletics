import type { EntityId } from "@/domain/shared/types";

/**
 * Physical / ecosystem compatibility — distinct from ProductRelationship
 * alternatives (cheaper, similar, etc.). Used by Home Gym Builder and
 * attachment recommendations.
 */
export type CompatibilityType =
  | "requires"
  | "compatible-with"
  | "incompatible-with"
  | "optional-accessory"
  | "attachment-for"
  | "replacement-part"
  | "ecosystem-compatible";

export type CompatibilityStatus = "verified" | "assumed" | "unknown" | "deprecated";

export interface ProductCompatibility {
  id: EntityId;
  sourceProductId: EntityId;
  targetProductId?: EntityId;
  sourceFamilyId?: EntityId;
  targetFamilyId?: EntityId;
  /** Brand/ecosystem key when target is a series rather than one SKU */
  ecosystemKey?: string;
  compatibilityType: CompatibilityType;
  status: CompatibilityStatus;
  evidenceIds: EntityId[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
