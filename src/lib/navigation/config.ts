/**
 * Navigation grouping references taxonomy by sport slug.
 * Do not duplicate sport names/descriptions here.
 */

export interface SportNavGroup {
  id: string;
  label: string;
  sportSlugs: string[];
}

export const SPORT_NAV_GROUPS: SportNavGroup[] = [
  {
    id: "popular",
    label: "Popular",
    sportSlugs: ["running", "fitness", "padel", "tennis"],
  },
  {
    id: "racket",
    label: "Racket Sports",
    sportSlugs: ["padel", "tennis", "pickleball", "badminton", "squash"],
  },
  {
    id: "endurance",
    label: "Endurance",
    sportSlugs: ["cycling", "swimming"],
  },
  {
    id: "combat",
    label: "Combat",
    sportSlugs: ["combat"],
  },
  {
    id: "outdoor-water",
    label: "Outdoor & Water",
    sportSlugs: ["watersports", "diving", "fishing"],
  },
  {
    id: "other",
    label: "Other",
    sportSlugs: ["target", "indoor", "winter", "recovery", "recreation"],
  },
];

/** Gear mega-menu: featured Running categories by pathSegment / slug */
export const GEAR_MENU_FEATURED_SLUGS = [
  "running-shoes",
  "gps-watches",
  "heart-rate-monitors",
  "running-clothing",
  "running-socks",
  "hydration",
  "running-packs-vests",
  "running-belts",
  "headphones",
  "sunglasses",
  "running-lights",
  "safety-gear",
  "recovery",
  "nutrition-fuel",
  "accessories",
] as const;

/** Fitness gear mega-menu featured category slugs */
export const FITNESS_GEAR_MENU_FEATURED_SLUGS = [
  "training-shoes",
  "power-racks",
  "adjustable-dumbbells",
  "weight-benches",
  "barbells",
  "rowing-machines",
  "pull-up-bars",
  "kettlebells",
  "weighted-vests",
  "gym-flooring",
] as const;

export interface GearMenuFutureArea {
  id: string;
  label: string;
  href: string;
  comingSoon: boolean;
}

export const GEAR_MENU_FUTURE_AREAS: GearMenuFutureArea[] = [
  { id: "fitness", label: "Fitness Equipment", href: "/fitness", comingSoon: false },
  { id: "hyrox", label: "HYROX Gear", href: "/fitness/hyrox", comingSoon: false },
  { id: "racket", label: "Racket Sports", href: "/racket", comingSoon: false },
  { id: "cycling", label: "Cycling", href: "/cycling", comingSoon: true },
  { id: "combat", label: "Combat", href: "/combat", comingSoon: true },
  { id: "swimming", label: "Swimming", href: "/swimming", comingSoon: true },
  { id: "outdoor", label: "Outdoor", href: "/watersports", comingSoon: true },
];

/** Mockup primary nav — visual source of truth for chrome.
 * Day-1: live hubs only. Coming-soon sports 404 at `/${slug}`.
 * HYROX is a `/hyrox` → `/fitness/hyrox` alias — never chrome as `/hyrox`.
 */
export const PRIMARY_NAV = [
  { label: "Shoes", href: "/running/shoes" },
  {
    label: "Racket Sports",
    href: "/racket",
    activePrefixes: ["/padel", "/racket", "/tennis", "/pickleball", "/badminton", "/squash"],
  },
  { label: "Running", href: "/running" },
  {
    label: "Fitness",
    href: "/fitness",
    activePrefixes: ["/fitness", "/hyrox", "/calisthenics"],
  },
] as const;

/** Sports that may appear as `/${slug}` in More / mobile chrome. */
export function isPublicNavSport(sport: {
  slug: string;
  contentStatus?: string;
}): boolean {
  if (sport.contentStatus !== "live") return false;
  if (sport.slug === "hyrox") return false;
  return true;
}

export const UTILITY_NAV = [
  { label: "About", href: "/about" },
  { label: "Journal", href: "/guides" },
  { label: "Help", href: "/contact" },
] as const;
