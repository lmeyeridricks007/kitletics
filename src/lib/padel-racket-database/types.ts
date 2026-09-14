/**
 * Kitletics Padel Racket Database — derived view over canonical catalog.
 * Does not duplicate Product records; only validated public discovery fields.
 */

import type { RegionCode } from "@/domain/shared/types";
import type { PadelRacketMarketInsights } from "@/lib/padel-racket-database/statistics/types";
import type { PadelRacketDataExplorerPayload } from "@/lib/padel-racket-database/charts/types";
import type { PadelRacketDatasetAboutModel } from "@/lib/padel-racket-database/citation/about-dataset";

/** Compact public row — safe to serialize to the client. */
export interface PadelRacketDatabaseRecord {
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
  image?: { src: string; alt: string };
  shape?: string;
  balance?: string;
  /** Published manufacturer min weight (g). Never invent midpoints. */
  weightMinG?: number;
  weightMaxG?: number;
  core?: string;
  feel?: string;
  faceMaterial?: string;
  surfaceTexture?: string;
  playerLevel?: string;
  playStyleTags: string[];
  powerScore?: number;
  controlScore?: number;
  comfortScore?: number;
  maneuverabilityScore?: number;
  price?: { amount: number; currency: string };
  reviewSlug?: string;
  hasAlternatives: boolean;
  inComparison: boolean;
  productHref: string;
  score?: number;
  useCaseSlugs: string[];
  useCaseLabels: string[];
}

export type PadelRacketDatabaseSort =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "weight-asc"
  | "weight-desc"
  | "power-desc"
  | "control-desc";

export interface PadelRacketDatabaseFilters {
  brand: string[];
  shape: string[];
  balance: string[];
  weightBuckets: string[];
  playerLevel: string[];
  playStyle: string[];
  faceMaterial: string[];
  surface: string[];
  core: string[];
  feel: string[];
  powerBuckets: string[];
  controlBuckets: string[];
  comfortBuckets: string[];
  maneuverabilityBuckets: string[];
  priceBuckets: string[];
  q?: string;
  sort: PadelRacketDatabaseSort;
}

export interface PadelRacketDatabaseFacetOption {
  value: string;
  label: string;
  count: number;
}

export interface PadelRacketDatabaseMarketSummary {
  total: number;
  brandCount: number;
  withShape: number;
  withWeight: number;
  withPrice: number;
}

export interface PadelRacketDatabaseInsights {
  total: number;
  brandCount: number;
  withPriceCount: number;
  withReviewCount: number;
  withShapeCount: number;
  withWeightCount: number;
  shapeBreakdown: Array<{ value: string; count: number }>;
  balanceBreakdown: Array<{ value: string; count: number }>;
  weightBreakdown: Array<{ value: string; count: number }>;
  materialBreakdown: Array<{ value: string; count: number }>;
  priceBreakdown: Array<{ value: string; count: number }>;
  brandAssortment: Array<{ value: string; label: string; count: number }>;
  market: PadelRacketDatabaseMarketSummary;
}

export interface PadelRacketDatabaseActiveChip {
  id: string;
  group: keyof PadelRacketDatabaseFilters | "q";
  value: string;
  label: string;
}

export interface PadelRacketDatabasePageData {
  path: "/padel/rackets/database";
  title: string;
  description: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  total: number;
  region: RegionCode;
  records: PadelRacketDatabaseRecord[];
  insights: PadelRacketDatabaseInsights;
  marketInsights: PadelRacketMarketInsights;
  dataExplorer: PadelRacketDataExplorerPayload;
  facets: {
    brands: PadelRacketDatabaseFacetOption[];
    shapes: PadelRacketDatabaseFacetOption[];
    balances: PadelRacketDatabaseFacetOption[];
    playerLevels: PadelRacketDatabaseFacetOption[];
    playStyles: PadelRacketDatabaseFacetOption[];
    faceMaterials: PadelRacketDatabaseFacetOption[];
    surfaces: PadelRacketDatabaseFacetOption[];
    cores: PadelRacketDatabaseFacetOption[];
    feels: PadelRacketDatabaseFacetOption[];
  };
  /** Facet keys intentionally soft-gated when coverage is thin */
  softGatedFacets: string[];
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
  datasetAbout: PadelRacketDatasetAboutModel;
}
