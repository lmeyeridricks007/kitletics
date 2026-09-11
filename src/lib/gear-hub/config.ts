/**
 * Presentation mapping for Gear Hub — IDs/slugs only.
 * Resolved entities + counts come from getGearHubData().
 */

export interface GearHubShopCardConfig {
  id: string;
  /** Display title (may differ from entity name for family cards) */
  title: string;
  shortDescription: string;
  /** Prefer category; sport aggregates multiple categories */
  type: "category" | "sport";
  categorySlug?: string;
  sportSlug?: string;
  /** Lifestyle / product image override when category has no authentic product media */
  imageSrc?: string;
  imageAlt?: string;
}

export interface GearHubFeaturedCategoryConfig {
  id: string;
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

/** Shop-by-category grid — only cards with publishedProductCount > 0 render */
export const GEAR_HUB_SHOP_CARDS: GearHubShopCardConfig[] = [
  {
    id: "running-shoes",
    type: "category",
    categorySlug: "running-shoes",
    title: "Running Shoes",
    shortDescription: "Daily, race & trail",
  },
  {
    id: "padel-rackets",
    type: "category",
    categorySlug: "padel-rackets",
    title: "Padel Rackets",
    shortDescription: "Control, power & all-round",
    imageSrc: "/images/padel/products/racket-1.png",
    imageAlt: "Padel racket",
  },
  {
    id: "running",
    type: "sport",
    sportSlug: "running",
    title: "Running",
    shortDescription: "Shoes, watches & race gear",
    imageSrc: "/images/running/category/use-daily.jpg",
    imageAlt: "Running gear",
  },
  {
    id: "fitness",
    type: "sport",
    sportSlug: "fitness",
    title: "Fitness",
    shortDescription: "Racks, weights & conditioning",
    imageSrc: "/images/home/guide-home-gym.jpg",
    imageAlt: "Fitness equipment",
  },
  {
    id: "gps-watches",
    type: "category",
    categorySlug: "gps-watches",
    title: "GPS Watches",
    shortDescription: "Training & race tracking",
    imageSrc: "/images/running/category/use-tempo.jpg",
    imageAlt: "Runner checking training pace",
  },
  {
    id: "tennis-rackets",
    type: "category",
    categorySlug: "tennis-rackets",
    title: "Tennis Rackets",
    shortDescription: "Frame, string & play style",
    imageSrc: "/images/home/guide-tennis.jpg",
    imageAlt: "Tennis gear",
  },
  {
    id: "power-racks",
    type: "category",
    categorySlug: "power-racks",
    title: "Power Racks",
    shortDescription: "Home & garage strength",
    imageSrc: "/images/home/guide-home-gym.jpg",
    imageAlt: "Power rack training",
  },
  {
    id: "training-shoes",
    type: "category",
    categorySlug: "training-shoes",
    title: "Training Shoes",
    shortDescription: "Gym, HYROX & lifting",
  },
  {
    id: "hyrox",
    type: "sport",
    sportSlug: "hyrox",
    title: "HYROX",
    shortDescription: "Race shoes & station gear",
    imageSrc: "/images/running/category/use-race.jpg",
    imageAlt: "HYROX training",
  },
  {
    id: "padel",
    type: "sport",
    sportSlug: "padel",
    title: "Padel",
    shortDescription: "Rackets, shoes & court kit",
    imageSrc: "/images/padel/hero.jpg",
    imageAlt: "Padel court gear",
  },
  {
    id: "tennis",
    type: "sport",
    sportSlug: "tennis",
    title: "Tennis",
    shortDescription: "Rackets, shoes & strings",
    imageSrc: "/images/home/guide-tennis.jpg",
    imageAlt: "Tennis equipment",
  },
  {
    id: "calisthenics",
    type: "sport",
    sportSlug: "calisthenics",
    title: "Calisthenics",
    shortDescription: "Bars, rings & progression",
    imageSrc: "/images/home/guide-home-gym.jpg",
    imageAlt: "Calisthenics training",
  },
];

export const GEAR_HUB_FEATURED_CATEGORIES: GearHubFeaturedCategoryConfig[] = [
  {
    id: "race-shoes",
    title: "Race Shoes",
    description: "Plated racers for goal days",
    href: "/best/race-shoes",
    imageSrc: "/images/running/category/use-race.jpg",
    imageAlt: "Race day running",
  },
  {
    id: "trail",
    title: "Trail Running Shoes",
    description: "Grip and protection off-road",
    href: "/best/trail-running-shoes",
    imageSrc: "/images/running/category/hero-trail.jpg",
    imageAlt: "Trail running",
  },
  {
    id: "hyrox-gear",
    title: "HYROX Gear",
    description: "Shoes and race-day kits",
    href: "/fitness/hyrox",
    imageSrc: "/images/running/category/hero-race.jpg",
    imageAlt: "HYROX competition",
  },
  {
    id: "home-gym",
    title: "Home Gym",
    description: "Racks, benches and free weights",
    href: "/fitness",
    imageSrc: "/images/home/guide-home-gym.jpg",
    imageAlt: "Home gym setup",
  },
  {
    id: "padel",
    title: "Padel Rackets",
    description: "Find a racket for how you play",
    href: "/padel",
    imageSrc: "/images/padel/hero.jpg",
    imageAlt: "Padel play",
  },
];

/** Curated Best Guide slots for Kitletics Picks — not global score ranking */
export const GEAR_HUB_PICK_GUIDES = [
  { guideSlug: "running-shoes", roleFallback: "Daily training" },
  { guideSlug: "race-shoes", roleFallback: "Race day" },
  { guideSlug: "trail-running-shoes", roleFallback: "Trail" },
  { guideSlug: "running-shoes-beginners", roleFallback: "Beginners" },
] as const;

/** Prefer these available finders (watch finder is published but unavailable) */
export const GEAR_HUB_FINDER_SLUGS = [
  "running-shoe-finder",
  "fitness-watch-finder",
  "padel-racket-finder",
  "power-rack-finder",
  "tennis-racket-finder",
] as const;

export const GEAR_HUB_BEST_FOR = [
  { value: "daily-training", label: "Daily training", useCaseSlug: "daily-training" },
  { value: "beginners", label: "Beginners", useCaseSlug: "beginners" },
  { value: "marathon", label: "Endurance / marathon", useCaseSlug: "marathon" },
  { value: "home-gym", label: "Strength / home gym", useCaseSlug: "home-gym" },
  { value: "hyrox-training", label: "HYROX training", useCaseSlug: "hyrox-training" },
  { value: "trail-training", label: "Trail", useCaseSlug: "trail-training" },
] as const;

export const GEAR_HUB_HERO_MONTAGE = [
  {
    src: "/images/running/products/novablast-6-hero.jpg",
    alt: "ASICS Novablast 6 running shoe",
  },
  {
    src: "/images/padel/products/racket-1.png",
    alt: "Padel racket",
  },
  {
    src: "/images/running/products/vaporfly-4-hero.jpg",
    alt: "Nike Vaporfly 4 race shoe",
  },
  {
    src: "/images/home/guide-home-gym.jpg",
    alt: "Strength training equipment",
  },
] as const;

export const GEAR_HUB_PRICE_STOPS = [100, 150, 200, 300, 500] as const;
