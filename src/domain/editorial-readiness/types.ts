/**
 * Unified editorial readiness (Fix 48).
 * READY ≠ INDEXABLE — vertical / soft-gate / publication still control crawlers.
 */

export type EditorialSurfaceKind =
  | "review"
  | "best-guide"
  | "buying-guide"
  | "comparison"
  | "alternatives";

/** Estate work states (aligned with Editorial 36 master). */
export type EditorialWorkState =
  | "READY"
  | "NEEDS_UNIQUE_REWRITE"
  | "NEEDS_INTENT_DIFFERENTIATION"
  | "NEEDS_RELATIONSHIP_FIX"
  | "NEEDS_EVIDENCE"
  | "NEEDS_RESEARCH"
  | "BROKEN"
  | "BLOCKED_INTENTIONALLY";

export type EditorialDimension =
  | "quality"
  | "uniqueness"
  | "evidenceSafety"
  | "intentUniqueness"
  | "relationships"
  | "references";

export interface EditorialDimensionResult {
  ok: boolean;
  detail?: string;
}

export interface EditorialReadinessAssessment {
  kind: EditorialSurfaceKind;
  id: string;
  path: string;
  /** Authoritative editorial bar for the estate */
  ready: boolean;
  workState: EditorialWorkState;
  gaps: string[];
  dimensions: Record<EditorialDimension, EditorialDimensionResult>;
}
