import type { Product, Brand, SpecificationDefinition } from "@/domain/products/types";
import type { ProductSubcategory, UseCase } from "@/domain/sports/types";
import type { RegionCode } from "@/domain/shared/types";

export type CatalogSort =
  | "recommended"
  | "score"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "lightest"
  | "most-cushioned";

export type FacetControlType =
  | "checkbox"
  | "radio"
  | "multi-select"
  | "boolean"
  | "range"
  | "numeric-range";

export interface CatalogFilterState {
  /** Subcategory slugs */
  type: string[];
  /** Brand slugs */
  brand: string[];
  /** Spec key → selected values (enums, booleans as "true"/"false", bucket ids) */
  specs: Record<string, string[]>;
  /** Use-case slugs */
  useCase: string[];
  /** Price range in active region currency */
  priceMin?: number;
  priceMax?: number;
  sort: CatalogSort;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface CatalogFacet {
  id: string;
  label: string;
  control: FacetControlType;
  /** Spec key, or "type" | "brand" | "price" | "useCase" */
  key: string;
  options: FacetOption[];
  unit?: string;
  /** For price / numeric ranges */
  min?: number;
  max?: number;
}

export interface ActiveFilterChip {
  id: string;
  /** Query param family */
  group: string;
  value: string;
  label: string;
}

/**
 * Card-level catalog row for listing grids.
 * Intentionally excludes full Product evidence/spec trees.
 */
export interface CatalogProductRow {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  brandName?: string;
  categoryId: string;
  image?: { src: string; alt: string };
  score?: number;
  bestFor?: string;
  subcategoryLabels: string[];
  badges: string[];
  weight?: number;
  /** When weight is shown — e.g. "Men's · US 9" */
  weightContext?: string;
  drop?: number;
  stability?: string;
  cushionLevel?: string;
  price?: { price: number; currency: string };
  /** Fit / sizing audiences this model is sold in */
  audiences: Array<"men" | "women" | "unisex">;
  /** Active catalog genderFit filter when single-valued */
  activeAudience?: "men" | "women" | "unisex";
  audienceLabel?: string;
  /** Used for newest / recommended sort — ISO date string */
  releaseDate?: string;
  updatedAt?: string;
}

export interface CatalogQueryResult {
  products: CatalogProductRow[];
  total: number;
  availableFilters: CatalogFacet[];
  activeFilters: ActiveFilterChip[];
  sort: CatalogSort;
  availableSorts: { value: CatalogSort; label: string }[];
  region: RegionCode;
  /** 1-based page when paginated */
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface CatalogQueryInput {
  sportId: string;
  categoryId: string;
  filters?: Partial<CatalogFilterState>;
  region?: RegionCode;
  /** Spec definitions for this category (filterable) */
  specDefs?: SpecificationDefinition[];
  subcategories?: ProductSubcategory[];
  useCases?: UseCase[];
  /** Optional pagination (defaults: page 1, pageSize 24) */
  page?: number;
  pageSize?: number;
  /** When true, return all matched rows (no page slice) — for server-side enrichment */
  unpaginated?: boolean;
}

export interface ProductCategoryPageConfig {
  sportSlug: string;
  categorySlug: string;
  hero: {
    title: string;
    description: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  /** Subcategory ids to feature (rest behind "view all") */
  featuredSubcategoryIds: string[];
  /** Use-case ids for "shop by how you run" */
  goalUseCaseIds: string[];
  /** Use-case ids for "find shoes for you" with optional href overrides */
  runnerUseCaseIds: string[];
  runnerUseCaseHrefs?: Record<string, string>;
  featuredToolSlugs: string[];
  finder?: {
    toolSlug: string;
    headline: string;
    title: string;
    description: string;
    ctaLabel: string;
  };
  /** Spec keys to surface prominently in the filter sidebar (order) */
  primaryFilterKeys: string[];
  /** Bucket definitions for measurement filters */
  numericBuckets?: Record<
    string,
    { id: string; label: string; min?: number; max?: number }[]
  >;
  educationFactors: {
    title: string;
    body: string;
    href: string;
  }[];
  terminology: { term: string; definition: string }[];
  /**
   * Compact discovery decision block — answers what/why/how without SEO essays.
   * Prefer scannable bullets over long prose.
   */
  decision?: {
    whatItIs: string;
    productTypes: { name: string; note: string }[];
    whatMatters: string[];
    specsThatMatter: { spec: string; why: string }[];
    tradeOffs: { left: string; right: string; note: string }[];
    useCaseShifts: { useCase: string; note: string }[];
    beginnerStart: string;
    relatedBestHref?: string;
    relatedBestLabel?: string;
    relatedGuideHref?: string;
    relatedGuideLabel?: string;
    relatedFinderHref?: string;
    relatedFinderLabel?: string;
    usefulComparisonsNote?: string;
  };
  faqIds: string[];
  picks?: {
    label: string;
    productId: string;
    rationale?: string;
  }[];
  defaultSort: CatalogSort;
}

/** @deprecated Prefer CatalogProductRow fields directly */
export type CatalogProductFullRow = {
  product: Product;
  brand?: Brand;
} & Omit<
  CatalogProductRow,
  | "id"
  | "slug"
  | "name"
  | "fullName"
  | "brandName"
  | "categoryId"
  | "image"
  | "score"
  | "bestFor"
  | "releaseDate"
  | "updatedAt"
>;
