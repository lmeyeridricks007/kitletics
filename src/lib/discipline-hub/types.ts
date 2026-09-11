import type { RegionCode } from "@/domain/shared/types";

export interface DisciplineHubNavItem {
  id: string;
  label: string;
  href: string;
}

export interface DisciplineHubProductCard {
  id: string;
  slug: string;
  brandName: string;
  name: string;
  fullName: string;
  href: string;
  /** Role / award context — not affiliate rank */
  role: string;
  image?: { src: string; alt: string };
  score?: number;
  scoreLabel?: string;
  price?: { amount: number; currency: string };
  offerCount: number;
}

export interface DisciplineHubGuideCard {
  id: string;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
}

export interface DisciplineHubToolCard {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  available: boolean;
}

export interface DisciplineHubGoal {
  id: string;
  label: string;
  href: string;
}

export interface DisciplineHubGlanceMetric {
  label: string;
  value: string;
}

export interface DisciplineHubPageData {
  sportSlug: string;
  disciplineSlug: string;
  sportName: string;
  disciplineName: string;
  region: RegionCode;
  breadcrumbs: { label: string; href?: string }[];
  eyebrow: string;
  hero: {
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
  };
  pillars: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
  /** Factual focus card — no fabricated match % */
  focusCard: {
    mode: "factual";
    title: string;
    bestFor: string;
    typicalTerrain: string;
    keyGear: string;
    ctaLabel: string;
    ctaHref: string;
  };
  localNav: DisciplineHubNavItem[];
  why: {
    title: string;
    intro: string;
    benefits: {
      id: string;
      title: string;
      description: string;
      icon: string;
    }[];
  };
  goals: {
    title: string;
    items: DisciplineHubGoal[];
    seeAllHref?: string;
  };
  tools: {
    title: string;
    items: DisciplineHubToolCard[];
  };
  atAGlance: {
    title: string;
    metrics: DisciplineHubGlanceMetric[];
  };
  products?: {
    title: string;
    href: string;
    viewAllLabel: string;
    items: DisciplineHubProductCard[];
  };
  raceDay: {
    title: string;
    items: { id: string; label: string; description: string; href: string }[];
  };
  guides: {
    title: string;
    href: string;
    items: DisciplineHubGuideCard[];
  };
  related: {
    title: string;
    items: { id: string; label: string; href: string }[];
  };
  trust: { title: string; description: string; icon: string }[];
  footer: {
    shop: { label: string; href: string }[];
    tools: { label: string; href: string }[];
    about: { label: string; href: string }[];
  };
}
