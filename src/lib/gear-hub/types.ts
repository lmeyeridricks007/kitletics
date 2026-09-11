import type { RegionCode } from "@/domain/shared/types";

export interface GearHubBrowseItem {
  id: string;
  label: string;
  href: string;
  /** Query key when selecting this browse item */
  sportFilter?: string;
  isActive?: boolean;
}

export interface GearHubFacetOption {
  id: string;
  label: string;
  value: string;
  count: number;
}

export interface GearHubCategoryCard {
  id: string;
  title: string;
  shortDescription: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  publishedProductCount: number;
}

export interface GearHubToolCard {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  icon: string;
}

export interface GearHubFeaturedCategory {
  id: string;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

export interface GearHubBrandCard {
  id: string;
  name: string;
  href: string;
  logo?: string;
  productCount: number;
}

export interface GearHubProductPick {
  id: string;
  fullName: string;
  brandName: string;
  name: string;
  href: string;
  role: string;
  image?: { src: string; alt: string };
  score?: number;
  scoreLabel?: string;
  price?: { amount: number; currency: string };
  offerCount: number;
}

export interface GearHubLearnLink {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: "compare" | "guides" | "best" | "reviews";
}

export interface GearHubFiltersState {
  sport?: string;
  usecase?: string;
  brand?: string;
  maxPrice?: number;
}

export interface GearHubPageData {
  region: RegionCode;
  breadcrumbs: { label: string; href?: string }[];
  hero: {
    eyebrow: string;
    titleLines: [string, string];
    description: string;
    montage: { src: string; alt: string }[];
    trust: { title: string; description: string; icon: string }[];
  };
  browse: GearHubBrowseItem[];
  facets: {
    bestFor: GearHubFacetOption[];
    brands: GearHubFacetOption[];
    priceStops: number[];
  };
  filters: GearHubFiltersState;
  categories: GearHubCategoryCard[];
  tools: {
    title: string;
    description: string;
    items: GearHubToolCard[];
    viewAllHref: string;
  };
  featuredCategories: {
    title: string;
    items: GearHubFeaturedCategory[];
  };
  brands: {
    title: string;
    items: GearHubBrandCard[];
    viewAllHref: string;
  };
  picks: {
    title: string;
    items: GearHubProductPick[];
    viewAllHref?: string;
    viewAllLabel?: string;
  };
  learn: {
    title: string;
    items: GearHubLearnLink[];
    viewAllHref: string;
  };
  help: {
    title: string;
    description: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
  };
  bottomTrust: { title: string; description: string; icon: string }[];
}
