import type { CatalogSort } from "@/lib/catalog/types";

export type ListingEyebrow =
  | "USE CASE"
  | "SHOE TYPE"
  | "TERRAIN"
  | "RUNNER PROFILE";

export interface ListingSubnavItem {
  id: string;
  label: string;
  href: string;
  icon?: "overview" | "timer" | "route" | "runner" | "bolt" | "tips";
  /** When set, applies as a refinement on this listing */
  refine?: {
    distance?: string;
    type?: string;
    plate?: string;
  };
}

export interface ListingEducationFactor {
  id: string;
  title: string;
  body: string;
}

export interface ListingEducationConfig {
  title: string;
  body: string;
  guideSlug?: string;
  guideCtaLabel?: string;
  factors: ListingEducationFactor[];
  /** Distinct selection trade-offs for this listing (not shared boilerplate). */
  tradeOffs?: { left: string; right: string; note: string }[];
  /** One concrete beginner entry point for this shoe type / use case. */
  beginnerStart?: string;
}

export interface ListingMetadataItem {
  id: string;
  label: string;
  /** "count" | "verified" | "range" | "custom" */
  kind: "count" | "verified" | "range" | "custom";
  value?: string;
}

export interface ProductUseCaseListingConfig {
  id: string;
  /** URL segment under /{sport}/{category}/ */
  slug: string;
  sportSlug: string;
  categoryPathSegment: string;
  categoryId: string;

  /** Canonical eligibility — subcategory and/or use-case */
  subcategoryId?: string;
  subcategorySlug?: string;
  useCaseId?: string;
  useCaseSlug?: string;

  eyebrow: ListingEyebrow;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;

  heroImageSrc: string;
  heroImageAlt: string;

  metadata: ListingMetadataItem[];
  /** Human label for count, e.g. "RACE SHOES" */
  countLabel: string;

  subnav: ListingSubnavItem[];
  primaryFilterKeys: string[];
  /**
   * When set with a locked subcategory, the Shoe Type facet only shows these
   * slugs (plus locked). Keeps the sidebar focused like the mockup.
   */
  typeFacetSlugs?: string[];
  /**
   * Spec filters applied on entry (merged with URL params; URL wins on conflict).
   * Example: trail listing pre-selects terrain=trail so the Terrain facet matches intent.
   */
  defaultSpecs?: Record<string, string[]>;
  defaultSort?: CatalogSort;

  education: ListingEducationConfig;
  relatedGuideSlugs: string[];
  relatedGuidesTitle: string;
  relatedGuidesIndexHref?: string;
  bestGuideSlug?: string;
  comparisonLimit?: number;
}
