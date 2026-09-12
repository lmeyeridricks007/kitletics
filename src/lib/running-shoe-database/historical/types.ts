/**
 * Historical shoe observations — provenance-first.
 *
 * Rules:
 * - Never invent release year, launch price, or prior-generation specs.
 * - Never copy current-generation specs onto a previous generation.
 * - Offer price is not launch/MSRP.
 */

export type HistoricalEvidenceKind =
  | "catalog-product-field"
  | "catalog-specification"
  | "external-pending";

/** Provenance for a single observed field on a historical observation. */
export interface HistoricalFieldEvidence {
  kind: HistoricalEvidenceKind;
  /** Product / family / evidence entity id when from catalog */
  sourceEntityId: string;
  /** Field path, e.g. Product.releaseDate or specifications.weight */
  sourceField: string;
  /** ISO timestamp when the observation was materialised from source */
  observedAt: string;
  notes?: string;
}

/**
 * One row = one product model’s verified specs at a known identity.
 * Unit of analysis: product model (not gender variant).
 */
export interface HistoricalShoeObservation {
  id: string;
  productId: string;
  productSlug: string;
  brandId: string;
  brandSlug: string;
  brandName: string;
  familyId?: string;
  familySlug?: string;
  familyName?: string;
  /** Generation label only — never treat as calendar year */
  generationLabel?: string;
  /** From Product.lifecycleStatus when projected; else catalog-snapshot */
  lifecycleStatus?: string;

  releaseYear?: number;
  releaseDate?: string;
  /** Canonical launch/MSRP when a field exists — never offer price */
  launchPriceEur?: number;

  weightG?: number;
  heelStackMm?: number;
  forefootStackMm?: number;
  dropMm?: number;
  plate?: boolean;
  plateMaterial?: string;
  primaryUseSlug?: string;
  primaryUseLabel?: string;
  surface: string[];

  /**
   * Evidence keyed by observation field name.
   * A field without evidence must not be treated as known.
   */
  evidence: Partial<
    Record<
      | "releaseYear"
      | "releaseDate"
      | "launchPriceEur"
      | "weightG"
      | "heelStackMm"
      | "forefootStackMm"
      | "dropMm"
      | "plate"
      | "plateMaterial"
      | "primaryUseSlug"
      | "surface"
      | "familyId"
      | "generationLabel",
      HistoricalFieldEvidence
    >
  >;
}

export type HistoricalTrendMetric =
  | "medianWeightG"
  | "medianHeelStackMm"
  | "medianDropMm"
  | "medianLaunchPriceEur"
  | "platedShare";

export interface HistoricalYearBucket {
  year: number;
  sampleSize: number;
  /** Share of that year’s sample with the metric present */
  coverage: number;
  brandCount: number;
  /** Largest brand’s share of the year’s sample (0–1) */
  maxBrandShare: number;
  brands: Array<{ brandSlug: string; brandName: string; count: number }>;
}

export interface HistoricalTrendSeriesPoint {
  year: number;
  value: number;
  sampleSize: number;
  coverage: number;
  brandCount: number;
  maxBrandShare: number;
}

export interface HistoricalTrendAssessment {
  metric: HistoricalTrendMetric;
  eligible: boolean;
  blockers: string[];
  years: HistoricalYearBucket[];
  series: HistoricalTrendSeriesPoint[] | null;
}

export interface HistoricalPublicInsightsReadiness {
  /** True only when at least one market-level year trend clears thresholds */
  evidenceReady: boolean;
  assessedAt: string;
  populationSize: number;
  datedObservationCount: number;
  distinctReleaseYears: number;
  launchPriceObservationCount: number;
  familyMultiYearCount: number;
  generationRelationshipCount: number;
  blockers: string[];
  trends: HistoricalTrendAssessment[];
  /** Safe public copy when not ready — never invent a trend claim */
  publicStatus:
    | { kind: "ready"; headline: string }
    | { kind: "not-ready"; headline: string; summary: string };
}
