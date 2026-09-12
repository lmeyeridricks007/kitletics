/**
 * Running Shoe Database quality / freshness classifications.
 * Flags only — never silently rewrite specs.
 */

export type FieldQualityStatus =
  | "valid"
  | "absent"
  | "suspect"
  | "invalid";

export type RecordQualityStatus =
  | "VALID"
  | "PARTIAL"
  | "SUSPECT"
  | "INVALID";

export type QualityFieldKey =
  | "brand"
  | "model"
  | "primaryImage"
  | "primaryUse"
  | "gender"
  | "weight"
  | "drop"
  | "heelStack"
  | "forefootStack"
  | "price"
  | "releaseYear"
  | "surface"
  | "plate";

/** Metrics that feed market statistics / charts when field status is valid. */
export type QualityMetricKey =
  | "weight"
  | "drop"
  | "heelStack"
  | "forefootStack"
  | "price"
  | "plate";

export interface FieldQualityFinding {
  field: QualityFieldKey;
  status: FieldQualityStatus;
  /** Controlled code — not free-form prose dumps */
  code?: string;
  detail?: string;
  /** Raw observed value when relevant (number/boolean/string), for reports only */
  observed?: string | number | boolean | null;
}

export interface ShoeQualityAssessment {
  productId: string;
  slug: string;
  brandSlug: string;
  status: RecordQualityStatus;
  fields: FieldQualityFinding[];
  /** Fields safe to include in market statistics */
  validMetrics: QualityMetricKey[];
  /** Fields present but flagged */
  suspectMetrics: QualityMetricKey[];
  invalidMetrics: QualityMetricKey[];
}

export interface FieldCoverageRow {
  field: QualityFieldKey;
  present: number;
  valid: number;
  absent: number;
  suspect: number;
  invalid: number;
  coveragePresent: number;
  coverageValid: number;
}

export interface RunningShoeDatabaseQualityReport {
  generatedAt: string;
  populationSize: number;
  statusCounts: Record<RecordQualityStatus, number>;
  fieldCoverage: FieldCoverageRow[];
  validMetricSamples: Record<QualityMetricKey, number>;
  suspectRecords: Array<{
    slug: string;
    brandSlug: string;
    codes: string[];
  }>;
  invalidRecords: Array<{
    slug: string;
    brandSlug: string;
    codes: string[];
  }>;
  /** Which public stats/charts are filtered by quality */
  statisticsAffected: string[];
  assessments: ShoeQualityAssessment[];
}
