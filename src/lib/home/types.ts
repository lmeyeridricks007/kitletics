import type { RegionCode } from "@/domain/shared/types";

export interface HomepageProductCard {
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

export interface HomepageBestSection {
  /** Stable key for React lists */
  id: string;
  title: string;
  href: string;
  /** Optional short category label above the title */
  eyebrow?: string;
  products: HomepageProductCard[];
}

export interface HomepageComparisonRow {
  id: string;
  slug: string;
  href: string;
  productA: {
    id: string;
    name: string;
    brandName?: string;
    image?: { src: string; alt: string };
    href: string;
  };
  productB: {
    id: string;
    name: string;
    brandName?: string;
    image?: { src: string; alt: string };
    href: string;
  };
}

export interface HomepageGuideCard {
  id: string;
  slug: string;
  title: string;
  href: string;
  updatedLabel?: string;
  imageSrc: string;
  imageAlt: string;
}

export interface HomepageJournalItem {
  id: string;
  title: string;
  href: string;
  dateLabel?: string;
  readingTime: string;
  imageSrc: string;
  imageAlt: string;
}

export interface HomepageData {
  region: RegionCode;
  hero: {
    headlineLead: string;
    headlineAccent: string;
    accentPhrase: string;
    description: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    imageSrc: string;
    imageAlt: string;
  };
  finder: {
    title: string;
    footnotePrefix: string;
    footnoteLinkLabel: string;
    footnoteHref: string;
    ctaLabel: string;
    ctaHref: string;
    shoeFinderHref: string;
  };
  /** Cross-vertical best-guide carousels (shoes, watches, padel, fitness, …) */
  bestSections: HomepageBestSection[];
  /** @deprecated Prefer bestSections[0] — kept for older callers */
  bestSection?: HomepageBestSection;
  featuredGuide?: {
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    ctaLabel: string;
    imageSrc: string;
  };
  comparisons: {
    title: string;
    href: string;
    items: HomepageComparisonRow[];
  };
  latestGuides: HomepageGuideCard[];
  journalItems: HomepageJournalItem[];
}
