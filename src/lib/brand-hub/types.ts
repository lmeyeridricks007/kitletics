import type { RegionCode } from "@/domain/shared/types";

export interface BrandHubPillar {
  id: string;
  title: string;
  description: string;
  icon: "calendar" | "layers" | "route" | "watch" | "dumbbell" | "flag";
}

export interface BrandHubTechnology {
  id: string;
  name: string;
  description: string;
  href?: string;
  icon: "foam" | "gel" | "line" | "sole" | "gps" | "battery" | "map" | "rack";
}

export interface BrandHubWhyItem {
  id: string;
  label: string;
}

export interface BrandHubConfig {
  brandSlug: string;
  relatedBrandIds?: string[];
  /** Editorial summary override (not manufacturer slogan) */
  editorialSummary?: string;
  /** How product lines differ — uniqueness-critical */
  howLinesDiffer?: string;
  /** Current vs previous generation context */
  generationContext?: string;
  pillars?: BrandHubPillar[];
  featuredProductId?: string;
  featuredCategoryId?: string;
  familyIds?: string[];
  technologies?: BrandHubTechnology[];
  whyTitle?: string;
  whyItems?: BrandHubWhyItem[];
  guideSlugs?: string[];
  guideImageMap?: Record<string, string>;
}

export interface BrandHubNavItem {
  id: string;
  label: string;
  href: string;
}

export interface BrandHubMedia {
  src: string;
  alt: string;
}

export interface BrandHubProductCard {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  fullName: string;
  href: string;
  role: string;
  score?: number;
  scoreLabel?: string;
  price?: { amount: number; currency: string };
  offerCount: number;
  image?: BrandHubMedia;
}

export interface BrandHubCategoryRow {
  id: string;
  name: string;
  count: number;
  href: string;
  image?: BrandHubMedia;
}

export interface BrandHubFamilyCard {
  id: string;
  name: string;
  description: string;
  href: string;
  image?: BrandHubMedia;
  whoSuits?: string;
  generationLabel?: string;
}

export interface BrandHubLinkCard {
  id: string;
  title: string;
  description: string;
  href: string;
  meta?: string;
}

export interface BrandHubGuideCard {
  id: string;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
}

export interface BrandHubReviewCard {
  id: string;
  title: string;
  productName: string;
  href: string;
  score?: number;
  scoreLabel?: string;
  verdict: string;
  dateLabel?: string;
}

export interface BrandHubMetric {
  id: string;
  value: string;
  label: string;
}

export interface BrandHubPageData {
  brand: {
    id: string;
    name: string;
    slug: string;
    description: string;
    summary: string;
    logoSrc?: string;
    foundedYear?: number;
    originCity?: string;
    country: string;
    homepage?: string;
  };
  breadcrumbs: { label: string; href?: string }[];
  pillars: BrandHubPillar[];
  heroProduct?: BrandHubProductCard;
  overview: {
    mode: "factual";
    metrics: BrandHubMetric[];
    blurb: string;
    ctaLabel: string;
    ctaHref: string;
  };
  localNav: BrandHubNavItem[];
  about: {
    title: string;
    body: string;
    metrics: BrandHubMetric[];
    howLinesDiffer?: string;
    generationContext?: string;
  };
  products: {
    title: string;
    href: string;
    items: BrandHubProductCard[];
    /** Sizing / audience chips when variants exist — no stereotypes */
    fitChips?: { label: string; href: string }[];
  };
  families: {
    title: string;
    items: BrandHubFamilyCard[];
  };
  technologies: {
    title: string;
    items: BrandHubTechnology[];
  };
  reviews: {
    title: string;
    href: string;
    items: BrandHubReviewCard[];
  };
  comparisons: {
    title: string;
    items: BrandHubLinkCard[];
  };
  bestAppearances: {
    title: string;
    items: BrandHubLinkCard[];
  };
  categories: {
    title: string;
    href?: string;
    items: BrandHubCategoryRow[];
  };
  knownFor: {
    title: string;
    items: BrandHubWhyItem[];
  };
  guides: {
    title: string;
    href: string;
    items: BrandHubGuideCard[];
  };
  officialSite?: {
    title: string;
    description: string;
    href: string;
    ctaLabel: string;
  };
  trust: { title: string; description: string; icon: string }[];
  region: RegionCode;
  publishedProductCount: number;
}
