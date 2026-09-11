import type { Brand, Product } from "@/domain/products/types";
import type {
  Discipline,
  ProductCategory,
  ProductSubcategory,
  Sport,
  UseCase,
} from "@/domain/sports/types";
import type {
  BestGuide,
  BuyingGuide,
  Comparison,
  GearSetup,
  Review,
} from "@/domain/editorial/types";
import type { Tool } from "@/domain/tools/types";

/** Declarative sport hub config — IDs/slugs only; repos resolve entities. */
export interface SportHubConfig {
  sportSlug: string;
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  primaryActions: {
    label: string;
    href: string;
    description?: string;
    featured?: boolean;
  }[];
  /** Category IDs shown in "What are you looking for?" */
  primaryCategoryIds: string[];
  /** Shoe subcategory IDs for shoe-type discovery */
  shoeTypeIds: string[];
  /** Use case IDs for "shop by runner" */
  featuredUseCaseIds: string[];
  /** Optional href overrides for use cases */
  useCaseHrefs?: Record<string, string>;
  /** Discipline IDs in display order */
  featuredDisciplineIds: string[];
  /** Gear needs blurb override per discipline id */
  disciplineGearCopy?: Record<string, string>;
  /** Tool slugs in display order; first is primary */
  featuredToolSlugs: string[];
  /** Setup slugs to feature */
  featuredSetupSlugs: string[];
  /** Category IDs for recommendation rows (omit if too few products) */
  recommendationCategoryIds: string[];
  /** Minimum products before a recommendation row renders */
  recommendationMinProducts: number;
  finder: {
    toolSlug: string;
    headline: string;
    title: string;
    description: string;
    ctaLabel: string;
    preview?: {
      scoreLabel: string;
      productName: string;
      rationale: string;
      note: string;
    };
  };
  checklist: {
    group: string;
    items: { label: string; categoryId: string }[];
  }[];
  education: {
    title: string;
    description: string;
    dimensions: {
      label: string;
      description: string;
      href: string;
      linkLabel: string;
    }[];
  };
  searchPlaceholders: string[];
  compareCategorySlug: string;
}

export interface HubProductMeta {
  brandName?: string;
  categoryName?: string;
  price?: { price: number; currency: string };
  recommendationLabel?: string;
}

export interface RecentlyUpdatedItem {
  id: string;
  kind: "best-guide" | "comparison" | "review" | "buying-guide";
  title: string;
  href: string;
  updatedAt: string;
  summary?: string;
}

export interface SportHubData {
  sport: Sport;
  config: SportHubConfig;
  breadcrumbs: { label: string; href?: string }[];
  primaryCategories: ProductCategory[];
  allCategories: ProductCategory[];
  categoryCounts: Record<string, number>;
  categoryHrefs: Record<string, string>;
  shoeTypes: ProductSubcategory[];
  useCases: (UseCase & { href: string })[];
  disciplines: (Discipline & { gearCopy: string })[];
  featuredProducts: Product[];
  productMeta: Record<string, HubProductMeta>;
  categoryRows: {
    category: ProductCategory;
    products: Product[];
  }[];
  bestGuides: BestGuide[];
  buyingGuides: BuyingGuide[];
  comparisons: Comparison[];
  comparisonProductNames: Record<string, string[]>;
  featuredComparison?: {
    comparison: Comparison;
    productNames: string[];
  };
  tools: Tool[];
  primaryTool?: Tool;
  setups: GearSetup[];
  brands: Brand[];
  recentlyUpdated: RecentlyUpdatedItem[];
  reviews: { review: Review; productName: string }[];
}
