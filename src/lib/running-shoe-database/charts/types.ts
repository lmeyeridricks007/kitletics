/**
 * Editorial Data Explorer chart models for /running/shoes/database.
 * Built from eligible product-model records — no fabricated history.
 */

export type ChartFilterKey = "use" | "gender" | "surface" | "brand";

export interface ChartBarPoint {
  id: string;
  label: string;
  count: number;
  /** Share of sample (0–1) */
  share: number;
  /** Pattern key for non-color differentiation */
  pattern: "solid" | "striped" | "dotted" | "dashed" | "cross";
  /** Database filter deep-link */
  href: string;
  /** Optional secondary label (e.g. average) */
  secondary?: string;
}

export interface DistributionChartModel {
  kind: "distribution";
  metric: "weight" | "drop" | "stack" | "offerPrice";
  unit: string;
  points: ChartBarPoint[];
  sampleSize: number;
  populationSize: number;
  median: number | null;
  mean: number | null;
}

export interface BrandBarChartModel {
  kind: "brand-bars";
  metric: "weight" | "offerPrice";
  unit: string;
  points: ChartBarPoint[];
  sampleSize: number;
  populationSize: number;
  minBrandSample: number;
}

export interface CompositionChartModel {
  kind: "composition";
  points: ChartBarPoint[];
  sampleSize: number;
  populationSize: number;
}

export interface UseCountChartModel {
  kind: "use-counts";
  points: ChartBarPoint[];
  sampleSize: number;
  populationSize: number;
}

export type DataExplorerChartModel =
  | DistributionChartModel
  | BrandBarChartModel
  | CompositionChartModel
  | UseCountChartModel;

export interface DataExplorerPanel {
  id: string;
  headline: string;
  interpretation: string;
  sampleNote: string;
  chart: DataExplorerChartModel;
}

export interface RunningShoeDataExplorerPayload {
  eligibleCount: number;
  unitOfAnalysis: "product-model";
  panels: DataExplorerPanel[];
  /** Compact rows for client-side chart refiltering */
  rows: DataExplorerMetricRow[];
  filterOptions: {
    use: Array<{ value: string; label: string }>;
    gender: Array<{ value: string; label: string }>;
    surface: Array<{ value: string; label: string }>;
    brand: Array<{ value: string; label: string }>;
  };
}

export interface DataExplorerMetricRow {
  id: string;
  brandSlug: string;
  brandName: string;
  useSlugs: string[];
  gender: Array<"men" | "women" | "unisex">;
  surface: string[];
  weightG?: number;
  dropMm?: number;
  heelStackMm?: number;
  priceEur?: number;
  plate?: boolean;
  carbonPlated: boolean;
  primaryUseSlug?: string;
  primaryUseLabel?: string;
}
