import type {
  EntityId,
  MediaAsset,
  PublishFields,
  SeoFields,
} from "@/domain/shared/types";

export type ProductLifecycleStatus =
  | "upcoming"
  | "current"
  | "previous-generation"
  | "discontinued";

export type ExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "elite";

export type SpecValueType =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "multi-enum"
  | "measurement"
  | "range";

export interface SpecificationDefinition {
  id: EntityId;
  categoryId: EntityId;
  key: string;
  label: string;
  type: SpecValueType;
  unit?: string;
  enumValues?: string[];
  comparisonPriority: number;
  finderRelevant: boolean;
  filterable: boolean;
  description?: string;
  /**
   * How numeric/boolean differences should be interpreted.
   * Default: neutral (never auto-declare better/worse).
   */
  directionality?: "higher-better" | "lower-better" | "contextual" | "neutral";
}

export type SpecPrimitive = string | number | boolean | null;
export type SpecValue = SpecPrimitive | SpecPrimitive[] | { min?: number; max?: number };

export interface Brand extends PublishFields, SeoFields {
  id: EntityId;
  name: string;
  slug: string;
  logo?: string;
  /** Light-on-dark logo variant for brand hub heroes */
  logoOnDark?: string;
  country: string;
  description: string;
  homepage?: string;
  /** Verified founding year when known */
  foundedYear?: number;
  /** Verified origin city when known */
  originCity?: string;
  /** Short positioning line for Brand Hub hero */
  positioning?: string;
}

export interface ProductFamily {
  id: EntityId;
  brandId: EntityId;
  name: string;
  slug: string;
  categoryId: EntityId;
  description?: string;
  /** Ordered newest → oldest when known */
  productIds: EntityId[];
}

export type AudienceFit = "men" | "women" | "unisex";

export interface ProductVariant {
  id: EntityId;
  productId: EntityId;
  sku?: string;
  label: string;
  /**
   * Manufacturer sizing range this variant represents.
   * Prefer this over implying biological eligibility.
   */
  audience: AudienceFit;
  /** e.g. width: 2E, colorway: Black/White */
  attributes: Record<string, string>;
  /** Reference weight (g) when verified for this audience */
  referenceWeightG?: number;
  /** e.g. "US 9" / "US 8" */
  referenceSizeLabel?: string;
  /** Human size range when verified, e.g. "EU 40–48" */
  sizeRangeLabel?: string;
  widthOptions?: string[];
  /** Variant-specific offer IDs when known */
  offerIds?: EntityId[];
  /**
   * Audience-specific hero when manufacturer photography differs by cut
   * (apparel men vs women). Prefer product-level images when shared.
   */
  mediaSrc?: string;
  /** Manufacturer size-chart URL when verified — never invent charts */
  sizeChartUrl?: string;
  /** Availability verified from manufacturer/catalog evidence */
  availabilityVerified: boolean;
  /** Weight figure verified for this audience (false = omit weight claims) */
  weightVerified?: boolean;
}

export interface Product extends PublishFields, SeoFields {
  id: EntityId;
  slug: string;

  brandId: EntityId;
  familyId?: EntityId;
  generation?: string;

  name: string;
  fullName: string;
  shortDescription: string;
  /** 2–4 sentence buying verdict — omit when unknown */
  verdict?: string;

  releaseDate?: string;
  lifecycleStatus: ProductLifecycleStatus;

  sportIds: EntityId[];
  disciplineIds: EntityId[];

  categoryId: EntityId;
  subcategoryIds: EntityId[];

  useCaseIds: EntityId[];

  /** Values keyed by SpecificationDefinition.key */
  specifications: Record<string, SpecValue>;

  strengths: string[];
  weaknesses: string[];

  recommendationScore?: number;
  valueScore?: number;

  experienceLevels: ExperienceLevel[];

  images: MediaAsset[];
  videos: MediaAsset[];

  offerIds: EntityId[];
  evidenceIds: EntityId[];

  relatedProductIds: EntityId[];
  alternativeProductIds: EntityId[];

  reviewId?: EntityId;
}
