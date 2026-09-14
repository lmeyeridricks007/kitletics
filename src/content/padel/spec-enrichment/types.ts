/**
 * Field-level spec provenance for Padel catalog enrichment.
 * Specs on Product remain SpecValue; provenance lives in this sidecar.
 */

import type { SpecValue } from "@/domain/products/types";

export type SpecSourceType =
  | "manufacturer"
  | "distributor"
  | "specialist-retailer"
  | "major-retailer"
  | "inventory-research"
  | "curated-catalog"
  | "not-published-check";

export type SpecFieldState =
  | "VERIFIED"
  | "UNKNOWN"
  | "NOT_PUBLISHED"
  | "NOT_APPLICABLE"
  | "CONFLICT";

export type SpecCompleteness =
  | "VERIFIED_COMPLETE"
  | "COMPLETE_WITH_UNKNOWN"
  | "INCOMPLETE_RESEARCH"
  | "BLOCKED";

export const SPEC_TERMINAL_VALUES = new Set([
  "UNKNOWN",
  "NOT_PUBLISHED",
  "NOT_APPLICABLE",
]);

export interface SpecFieldProvenance {
  value: SpecValue;
  sourceUrl?: string;
  sourceType: SpecSourceType;
  retrievedAt: string;
  state: SpecFieldState;
  notes?: string;
  conflictWith?: {
    value: SpecValue;
    sourceUrl?: string;
    sourceType: SpecSourceType;
  };
}

export interface ProductSpecEnrichment {
  productId: string;
  categoryId: string;
  completeness: SpecCompleteness;
  fields: Record<string, SpecFieldProvenance>;
  identityNotes?: string[];
  researchedAt: string;
}

export function isTerminalSpecValue(v: SpecValue | undefined): boolean {
  if (v == null) return false;
  if (typeof v === "string") return SPEC_TERMINAL_VALUES.has(v);
  return false;
}

export function hasMeaningfulSpecValue(v: SpecValue | undefined): boolean {
  if (v == null) return false;
  if (isTerminalSpecValue(v)) return false;
  if (typeof v === "string" && v.trim() === "") return false;
  if (typeof v === "string" && v.toLowerCase() === "unknown") return false;
  return true;
}
