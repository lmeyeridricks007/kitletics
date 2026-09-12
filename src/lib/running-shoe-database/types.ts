/**
 * Kitletics Running Shoe Database — derived view over canonical catalog.
 * Does not duplicate Product records; only validated public discovery fields.
 */

import type { AudienceFit } from "@/domain/products/types";
import type { RegionCode } from "@/domain/shared/types";
import type { RunningShoeMarketInsights } from "@/lib/running-shoe-database/statistics/types";
import type { RunningShoeDataExplorerPayload } from "@/lib/running-shoe-database/charts/types";
import type { RunningShoeDatasetAboutModel } from "@/lib/running-shoe-database/citation/about-dataset";

/** Compact public row — safe to serialize to the client. */
export interface RunningShoeDatabaseRecord {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  brandId: string;
  brandSlug: string;
  brandName: string;
  categoryId: string;
  categorySlug: string;
  familyId?: string;
  familyName?: string;
  familySlug?: string;
  generation?: string;
  /** Subcategory slugs (shoe types) */
  typeSlugs: string[];
  typeLabels: string[];
  useCaseSlugs: string[];
  useCaseLabels: string[];
  /** Best primary-use label from taxonomy priority when available */
  primaryUseLabel?: string;
  primaryUseSlug?: string;
  audiences: AudienceFit[];
  genderFit: AudienceFit[];
  image?: { src: string; alt: string };
  weightG?: number;
  heelStackMm?: number;
  forefootStackMm?: number;
  dropMm?: number;
  cushionLevel?: string;
  cushionFeel?: string;
  stability?: string;
  plate?: boolean;
  plateMaterial?: string;
  carbonPlated: boolean;
  terrain: string[];
  surface: string[];
  recommendedDistance: string[];
  trainingTypes: string[];
  widthOptions: string[];
  score?: number;
  valueScore?: number;
  price?: { amount: number; currency: string };
  reviewSlug?: string;
  hasAlternatives: boolean;
  inComparison: boolean;
  productHref: string;
  releaseYear?: number;
}

/**
 * Truthful sorts with sufficient catalog coverage.
 * "Newest" is intentionally omitted — releaseDate coverage is too thin.
 */
export type RunningShoeDatabaseSort =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "weight-asc"
  | "weight-desc"
  | "drop-asc"
  | "stack-desc";

export interface RunningShoeDatabaseFilters {
  brand: string[];
  type: string[];
  useCase: string[];
  cushion: string[];
  stability: string[];
  terrain: string[];
  surface: string[];
  distance: string[];
  width: string[];
  gender: AudienceFit[];
  plate: "any" | "plated" | "carbon" | "none";
  /** Bucket ids from params.ts */
  weightBuckets: string[];
  dropBuckets: string[];
  stackBuckets: string[];
  priceBuckets: string[];
  /** Exact ceiling used by insight deep-links (e.g. best value under €150) */
  priceMax?: number;
  q?: string;
  sort: RunningShoeDatabaseSort;
}

export interface RunningShoeDatabaseFacetOption {
  value: string;
  label: string;
  count: number;
}

export interface RunningShoeDatabaseMarketSummary {
  total: number;
  brandCount: number;
  dailyTrainers: number;
  raceShoes: number;
  trailShoes: number;
}

export interface RunningShoeDatabaseInsights {
  total: number;
  brandCount: number;
  carbonPlatedCount: number;
  platedCount: number;
  withPriceCount: number;
  withReviewCount: number;
  avgWeightG: number | null;
  avgDropMm: number | null;
  avgHeelStackMm: number | null;
  cushionBreakdown: Array<{ value: string; count: number }>;
  stabilityBreakdown: Array<{ value: string; count: number }>;
  terrainBreakdown: Array<{ value: string; count: number }>;
  typeBreakdown: Array<{ value: string; label: string; count: number }>;
  market: RunningShoeDatabaseMarketSummary;
}

export interface RunningShoeDatabaseActiveChip {
  id: string;
  group: keyof RunningShoeDatabaseFilters | "plate" | "q" | "priceMax";
  value: string;
  label: string;
}

export interface RunningShoeDatabasePageData {
  path: "/running/shoes/database";
  title: string;
  description: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  total: number;
  region: RegionCode;
  records: RunningShoeDatabaseRecord[];
  insights: RunningShoeDatabaseInsights;
  /** Computed market insights — same calculations available outside the page */
  marketInsights: RunningShoeMarketInsights;
  /** Editorial data explorer chart payload */
  dataExplorer: RunningShoeDataExplorerPayload;
  facets: {
    brands: RunningShoeDatabaseFacetOption[];
    types: RunningShoeDatabaseFacetOption[];
    useCases: RunningShoeDatabaseFacetOption[];
    cushion: RunningShoeDatabaseFacetOption[];
    stability: RunningShoeDatabaseFacetOption[];
    terrain: RunningShoeDatabaseFacetOption[];
    surface: RunningShoeDatabaseFacetOption[];
    distance: RunningShoeDatabaseFacetOption[];
    width: RunningShoeDatabaseFacetOption[];
    gender: RunningShoeDatabaseFacetOption[];
  };
  related: {
    tools: Array<{ title: string; href: string; description: string }>;
    editorial: Array<{ title: string; href: string; description: string }>;
  };
  methodology: {
    title: string;
    paragraphs: string[];
  };
  statisticsMethodology: {
    title: string;
    paragraphs: string[];
  };
  /** Journalist / researcher facing dataset about + citation */
  datasetAbout: RunningShoeDatasetAboutModel;
}
