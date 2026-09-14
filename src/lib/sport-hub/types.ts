import type { RegionCode } from "@/domain/shared/types";

export interface SportHubQuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: "search" | "trophy" | "compare" | "guide";
}

export interface SportHubShopCategory {
  id: string;
  label: string;
  href: string;
  icon: string;
  /** Live published product count when categoryId is known */
  productCount?: number;
}

export interface SportHubShopGroup {
  id: string;
  label: string;
  items: SportHubShopCategory[];
}

export interface SportHubProductCard {
  id: string;
  slug: string;
  brandName: string;
  name: string;
  fullName: string;
  href: string;
  badge: string;
  image?: { src: string; alt: string };
  score?: number;
  scoreLabel?: string;
  price?: { amount: number; currency: string };
  offerCount: number;
}

export interface SportHubGuideCard {
  id: string;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
}

export interface SportHubComparisonRow {
  id: string;
  href: string;
  productA: {
    name: string;
    image?: { src: string; alt: string };
  };
  productB: {
    name: string;
    image?: { src: string; alt: string };
  };
}

export interface SportHubStarterItem {
  productId: string;
  label: string;
  href: string;
  image?: { src: string; alt: string };
  price?: { amount: number; currency: string };
}

export interface SportHubBrandItem {
  id: string;
  name: string;
  href: string;
  logo?: string;
}

export interface SportHubFinderField {
  label: string;
  name: string;
  /** Default selected option value */
  value: string;
  /** Selectable choices — required for usable dropdowns */
  options: Array<{ value: string; label: string }>;
}

export interface SportHubFinderPreview {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  footnoteLabel: string;
  footnoteHref: string;
  fields: SportHubFinderField[];
}

export interface SportHubReviewCard {
  id: string;
  title: string;
  productName: string;
  href: string;
  summary: string;
  image?: { src: string; alt: string };
}

export interface SportHubPageData {
  sportSlug: string;
  sportName: string;
  region: RegionCode;
  breadcrumbs: { label: string; href?: string }[];
  hero: {
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
  };
  quickActions: SportHubQuickAction[];
  shopCategories: SportHubShopCategory[];
  shopGroups?: SportHubShopGroup[];
  bestSection?: {
    title: string;
    href: string;
    products: SportHubProductCard[];
  };
  /** Secondary category best strips (watches, HRMs, packs, …). */
  moreBestSections: {
    id: string;
    title: string;
    href: string;
    products: SportHubProductCard[];
    /** Inline category finder (same layout as shoes + shoe finder). */
    finder?: SportHubFinderPreview;
  }[];
  /** Unused when finders are inlined on moreBestSections; kept for padel/legacy. */
  categoryFinders: Array<SportHubFinderPreview & { id: string }>;
  finder: SportHubFinderPreview;
  benefits: { title: string; description: string; icon: string }[];
  guides: {
    title: string;
    href: string;
    items: SportHubGuideCard[];
  };
  comparisons: {
    title: string;
    href: string;
    items: SportHubComparisonRow[];
  };
  /** Latest promote-able reviews for the sport (padel hub + future verticals). */
  reviews?: {
    title: string;
    href: string;
    items: SportHubReviewCard[];
  };
  starterKit?: {
    title: string;
    href: string;
    items: SportHubStarterItem[];
    total?: { amount: number; currency: string };
    missingPriceCount: number;
  };
  brands: {
    title: string;
    href: string;
    items: SportHubBrandItem[];
  };
  footer: {
    shop: { label: string; href: string }[];
    tools: { label: string; href: string }[];
    about: { label: string; href: string }[];
  };
}
