import type { SelectionCriterion } from "@/domain/editorial/types";
import type { AwardType } from "@/domain/editorial/types";

export type BestGuideTableColumnSource =
  | "bestFor"
  | "breakdown"
  | "spec"
  | "score"
  | "price";

export interface BestGuideTableColumn {
  key: string;
  label: string;
  source: BestGuideTableColumnSource;
  specKey?: string;
  breakdownKey?: string;
  /** Alias keys when looking up recommendation factors */
  factorKeys?: string[];
}

export type BestGuideTrustPillarIcon =
  | "shield"
  | "database"
  | "research"
  | "refresh"
  | "check"
  | "sparkles";

export interface BestGuideTrustPillar {
  icon: BestGuideTrustPillarIcon;
  title: string;
  /** May include `{count}` placeholder resolved at page-data time */
  description: string;
}

export interface BestGuideBuyingHelpLink {
  label: string;
  href: string;
}

export interface BestGuideCategoryConfig {
  categoryId: string;
  comparisonKeys: string[];
  defaultSelectionCriteria: SelectionCriterion[];
  commonAwardTypes: AwardType[];
  primaryUseCaseIds: string[];
  relatedToolSlug?: string;
  categoryBrowseHref?: string;
  heroImageSrc?: string;
  methodologyImageSrc?: string;
  quickPickLimit: number;
  trustPillars: BestGuideTrustPillar[];
  buyingHelpLinks: BestGuideBuyingHelpLink[];
  finderCtaLabel?: string;
  /** Singular noun for section titles — e.g. "Running Shoes", "Rackets" */
  productNoun?: string;
  tableColumns: BestGuideTableColumn[];
}

const DEFAULT_TRUST_PILLARS: BestGuideTrustPillar[] = [
  {
    icon: "shield",
    title: "Expert & Independent",
    description: "No brand sponsorships",
  },
  {
    icon: "database",
    title: "Data Driven",
    description: "{count} products evaluated",
  },
  {
    icon: "research",
    title: "Evidence-backed Research",
    description: "Specs, reviews & structured scoring",
  },
  {
    icon: "refresh",
    title: "Always Up to Date",
    description: "We track every release",
  },
];

export const runningShoesBestGuideConfig: BestGuideCategoryConfig = {
  categoryId: "cat-running-shoes",
  comparisonKeys: [
    "weight",
    "drop",
    "cushionLevel",
    "stability",
    "plate",
    "terrain",
  ],
  defaultSelectionCriteria: [
    {
      key: "fit",
      label: "Fit",
      description: "Length, width options and lockdown for the intended runner.",
    },
    {
      key: "comfort",
      label: "Comfort",
      description: "Ride comfort across intended weekly mileage.",
    },
    {
      key: "ride",
      label: "Ride",
      description: "Cushion feel, energy and transition character.",
    },
    {
      key: "stability",
      label: "Stability",
      description: "Platform security relative to neutral vs stability needs.",
    },
    {
      key: "use-case",
      label: "Use-case suitability",
      description: "Fit to the guide’s primary training contexts.",
    },
    {
      key: "durability",
      label: "Durability",
      description: "Expected foam and outsole longevity for the price tier.",
    },
    {
      key: "value",
      label: "Value",
      description: "Performance relative to typical regional street pricing.",
    },
    {
      key: "evidence",
      label: "Available evidence",
      description: "Spec verification, independent research and review depth.",
    },
    {
      key: "market",
      label: "Current market relevance",
      description: "Availability, generation freshness and competitive alternatives.",
    },
  ],
  commonAwardTypes: [
    "best-overall",
    "best-daily",
    "best-cushioned",
    "best-value",
    "best-beginner",
    "best-race",
    "best-tempo",
    "best-long-run",
  ],
  primaryUseCaseIds: [
    "uc-daily-training",
    "uc-long-runs",
    "uc-beginners",
    "uc-heavy",
    "uc-tempo-runs",
  ],
  relatedToolSlug: "running-shoe-finder",
  categoryBrowseHref: "/running/shoes",
  heroImageSrc: "/images/home/guide-running-shoes.jpg",
  methodologyImageSrc: "/images/home/guide-running-shoes.jpg",
  quickPickLimit: 9,
  productNoun: "Running Shoes",
  finderCtaLabel: "Find my running shoes →",
  trustPillars: [
    {
      icon: "shield",
      title: "Expert & Independent",
      description: "No brand sponsorships",
    },
    {
      icon: "database",
      title: "Data Driven",
      description: "{count} shoes considered",
    },
    {
      icon: "research",
      title: "Evidence-backed Research",
      description: "Specs, reviews & structured scoring",
    },
    {
      icon: "refresh",
      title: "Always Up to Date",
      description: "We track every release",
    },
  ],
  buyingHelpLinks: [
    {
      label: "How to choose running shoes",
      href: "/guides/how-to-choose-running-shoes",
    },
    {
      label: "Shoe Database",
      href: "/running/shoes/database",
    },
    {
      label: "What is a daily trainer?",
      href: "/guides/what-is-a-daily-trainer",
    },
    {
      label: "Running shoe cushioning explained",
      href: "/guides/running-shoe-cushioning",
    },
    {
      label: "Running shoe drop explained",
      href: "/guides/running-shoe-drop",
    },
    {
      label: "Shoe rotation explained",
      href: "/guides/running-shoe-rotation",
    },
  ],
  tableColumns: [
    { key: "bestFor", label: "Best for", source: "bestFor" },
    {
      key: "cushioning",
      label: "Cushioning",
      source: "breakdown",
      breakdownKey: "cushioning",
      factorKeys: ["cushion", "cushioning", "protection"],
    },
    {
      key: "ride",
      label: "Ride & Energy",
      source: "breakdown",
      breakdownKey: "ride",
      factorKeys: ["ride", "energy", "responsiveness"],
    },
    {
      key: "fit",
      label: "Fit & Comfort",
      source: "breakdown",
      breakdownKey: "fit",
      factorKeys: ["fit", "comfort"],
    },
    {
      key: "stability",
      label: "Stability",
      source: "breakdown",
      breakdownKey: "stability",
      factorKeys: ["stability"],
      specKey: "stability",
    },
    {
      key: "durability",
      label: "Durability",
      source: "breakdown",
      breakdownKey: "durability",
      factorKeys: ["durability"],
      specKey: "durability",
    },
    {
      key: "weight",
      label: "Weight (M)",
      source: "spec",
      specKey: "weight",
    },
    { key: "drop", label: "Drop", source: "spec", specKey: "drop" },
    { key: "score", label: "Score", source: "score" },
    { key: "price", label: "Price", source: "price" },
  ],
};

export const gpsWatchBestGuideConfig: BestGuideCategoryConfig = {
  categoryId: "cat-gps-watches",
  comparisonKeys: [
    "batteryGps",
    "batterySmartwatch",
    "multiBandGps",
    "maps",
    "weight",
    "displayType",
  ],
  defaultSelectionCriteria: [
    {
      key: "gps",
      label: "GPS accuracy",
      description: "Multi-band GNSS and tracking consistency for road, trail and city canyons.",
    },
    {
      key: "battery",
      label: "Battery",
      description: "Smartwatch, GPS and multi-band endurance for your longest sessions.",
    },
    {
      key: "screen",
      label: "Screen readability",
      description: "AMOLED vs MIP readability outdoors and with gloves.",
    },
    {
      key: "comfort",
      label: "Comfort & weight",
      description: "Case size, weight and all-day wear for small or large wrists.",
    },
    {
      key: "training",
      label: "Training analytics",
      description: "Workouts, load, recovery, dynamics and coaching tools.",
    },
    {
      key: "navigation",
      label: "Navigation & mapping",
      description: "Offline maps, breadcrumb routes and turn-by-turn tools.",
    },
    {
      key: "ecosystem",
      label: "Ecosystem",
      description: "Phone OS, app coaching, sensors and Strava/TrainingPeaks sync.",
    },
    {
      key: "ease",
      label: "Ease of use",
      description: "How quickly you can start a run and use the menus.",
    },
    {
      key: "smartwatch",
      label: "Smartwatch functionality",
      description: "Music, payments, notifications and lifestyle features.",
    },
    {
      key: "sensors",
      label: "Sensor support",
      description: "Optical HR, ECG, SpO2, altimeter and related sensors.",
    },
    {
      key: "durability",
      label: "Durability",
      description: "Build toughness for trail, ultra and daily knocks.",
    },
    {
      key: "value",
      label: "Value",
      description: "Feature set relative to typical street price.",
    },
  ],
  commonAwardTypes: ["best-overall", "best-value", "best-premium", "editors-pick"],
  primaryUseCaseIds: [],
  relatedToolSlug: "fitness-watch-finder",
  categoryBrowseHref: "/running/watches",
  heroImageSrc: "/images/running/best-hub/best-gps-watches-running.jpg",
  methodologyImageSrc: "/images/watches/guides/gps-open-sky-running.jpg",
  quickPickLimit: 9,
  productNoun: "GPS Watches",
  finderCtaLabel: "Find my running watch →",
  trustPillars: DEFAULT_TRUST_PILLARS,
  buyingHelpLinks: [
    {
      label: "How to choose a running watch",
      href: "/guides/how-to-choose-running-watch",
    },
    {
      label: "Multi-band GPS explained",
      href: "/guides/multi-band-gps-running-watches",
    },
  ],
  tableColumns: [
    { key: "bestFor", label: "Best for", source: "bestFor" },
    {
      key: "battery",
      label: "Battery",
      source: "spec",
      specKey: "batteryGps",
    },
    {
      key: "gps",
      label: "GPS",
      source: "breakdown",
      breakdownKey: "gps-accuracy",
      factorKeys: ["gps", "gps-accuracy"],
    },
    { key: "maps", label: "Maps", source: "spec", specKey: "maps" },
    {
      key: "training",
      label: "Training",
      source: "breakdown",
      breakdownKey: "training-features",
      factorKeys: ["training", "training-features"],
    },
    {
      key: "weight",
      label: "Weight",
      source: "spec",
      specKey: "weight",
    },
    { key: "score", label: "Score", source: "score" },
    { key: "price", label: "Price", source: "price" },
  ],
};

export const padelRacketBestGuideConfig: BestGuideCategoryConfig = {
  categoryId: "cat-padel-rackets",
  comparisonKeys: [
    "shape",
    "weightMin",
    "balance",
    "core",
    "face",
    "feel",
    "playerLevel",
  ],
  defaultSelectionCriteria: [
    {
      key: "shape",
      label: "Shape",
      description: "Round, teardrop or diamond play profile — not a hard level rule alone.",
    },
    {
      key: "balance",
      label: "Balance",
      description: "Maneuverability vs weight-through-the-shot bias.",
    },
    {
      key: "control",
      label: "Control vs power",
      description: "Suitability for the player’s level and style.",
    },
    {
      key: "value",
      label: "Value",
      description: "Performance relative to street price.",
    },
  ],
  commonAwardTypes: [
    "best-overall",
    "best-value",
    "best-premium",
    "best-beginner",
    "editors-pick",
  ],
  primaryUseCaseIds: [
    "uc-padel-beginner",
    "uc-padel-control",
    "uc-padel-power",
    "uc-padel-balanced",
  ],
  relatedToolSlug: "padel-racket-finder",
  categoryBrowseHref: "/padel/rackets",
  heroImageSrc: "/images/padel/hero.jpg",
  methodologyImageSrc: "/images/padel/guides/choose-racket.jpg",
  quickPickLimit: 9,
  productNoun: "Padel Rackets",
  finderCtaLabel: "Find my padel racket →",
  trustPillars: DEFAULT_TRUST_PILLARS,
  buyingHelpLinks: [
    {
      label: "How to choose a padel racket",
      href: "/guides/how-to-choose-a-padel-racket",
    },
    {
      label: "Racket shapes explained",
      href: "/guides/padel-racket-shapes-explained",
    },
    {
      label: "Padel racket finder",
      href: "/tools/padel-racket-finder",
    },
    {
      label: "Browse padel rackets",
      href: "/padel/rackets",
    },
  ],
  tableColumns: [
    { key: "bestFor", label: "Best for", source: "bestFor" },
    { key: "shape", label: "Shape", source: "spec", specKey: "shape" },
    {
      key: "weight",
      label: "Weight",
      source: "spec",
      specKey: "weightMin",
    },
    { key: "balance", label: "Balance", source: "spec", specKey: "balance" },
    {
      key: "control",
      label: "Control",
      source: "spec",
      specKey: "controlPositioning",
    },
    {
      key: "power",
      label: "Power",
      source: "spec",
      specKey: "powerPositioning",
    },
    { key: "score", label: "Score", source: "score" },
    { key: "price", label: "Price", source: "price" },
  ],
};

export const padelShoeBestGuideConfig: BestGuideCategoryConfig = {
  categoryId: "cat-padel-shoes",
  comparisonKeys: [
    "genderFit",
    "lateralStability",
    "courtFeel",
    "cushioning",
    "surface",
    "courtOutsole",
  ],
  defaultSelectionCriteria: [
    {
      key: "surface",
      label: "Padel-specific outsole",
      description: "Herringbone or listed padel court rubber — not a running trainer.",
    },
    {
      key: "lateral",
      label: "Lateral stability",
      description: "High-lateral court last for glass-court cuts.",
    },
    {
      key: "last",
      label: "Last / fit",
      description: "Men’s, women’s, and unisex lasts are different products.",
    },
    {
      key: "cushion",
      label: "Court cushioning",
      description: "Plush vs connected court feel.",
    },
  ],
  commonAwardTypes: [
    "best-overall",
    "best-value",
    "best-stability",
    "best-cushioned",
    "editors-pick",
  ],
  primaryUseCaseIds: [],
  categoryBrowseHref: "/padel/shoes",
  heroImageSrc: "/images/padel/guides/choose-shoes.jpg",
  methodologyImageSrc: "/images/padel/guides/choose-shoes.jpg",
  quickPickLimit: 9,
  productNoun: "Padel Shoes",
  trustPillars: DEFAULT_TRUST_PILLARS,
  buyingHelpLinks: [
    {
      label: "How to choose padel shoes",
      href: "/guides/how-to-choose-padel-shoes",
    },
    {
      label: "Padel vs tennis shoes",
      href: "/guides/padel-vs-tennis-shoes",
    },
    {
      label: "Outsoles explained",
      href: "/guides/padel-shoe-outsoles-explained",
    },
    {
      label: "Browse padel shoes",
      href: "/padel/shoes",
    },
  ],
  tableColumns: [
    { key: "bestFor", label: "Best for", source: "bestFor" },
    { key: "gender", label: "Last", source: "spec", specKey: "genderFit" },
    {
      key: "lateral",
      label: "Lateral",
      source: "spec",
      specKey: "lateralStability",
    },
    { key: "cushion", label: "Cushioning", source: "spec", specKey: "cushioning" },
    { key: "feel", label: "Court feel", source: "spec", specKey: "courtFeel" },
    { key: "score", label: "Score", source: "score" },
    { key: "price", label: "Price", source: "price" },
  ],
};

export const padelGripBestGuideConfig: BestGuideCategoryConfig = {
  categoryId: "cat-padel-grips",
  comparisonKeys: ["gripType", "thickness", "tack", "absorption", "perforated"],
  defaultSelectionCriteria: [
    {
      key: "gripType",
      label: "Overgrip vs replacement",
      description: "Overgrips wrap over the base. Sleeves are a different job.",
    },
    {
      key: "tack",
      label: "Tack vs absorption",
      description: "Thin tack for feel; absorbent wraps when sweat kills tack.",
    },
  ],
  commonAwardTypes: ["best-overall", "editors-pick"],
  primaryUseCaseIds: [],
  categoryBrowseHref: "/padel/grips",
  heroImageSrc: "/images/padel/guides/grips.jpg",
  methodologyImageSrc: "/images/padel/guides/grips.jpg",
  quickPickLimit: 6,
  productNoun: "Padel Overgrips",
  trustPillars: DEFAULT_TRUST_PILLARS,
  buyingHelpLinks: [
    {
      label: "Grip vs overgrip",
      href: "/guides/padel-grip-vs-overgrip",
    },
    {
      label: "Grips & overgrips explained",
      href: "/guides/padel-grips-overgrips-explained",
    },
    {
      label: "When to replace an overgrip",
      href: "/guides/how-often-should-you-replace-a-padel-overgrip",
    },
    {
      label: "Browse grips",
      href: "/padel/grips",
    },
  ],
  tableColumns: [
    { key: "bestFor", label: "Best for", source: "bestFor" },
    { key: "type", label: "Type", source: "spec", specKey: "gripType" },
    { key: "thickness", label: "Thickness", source: "spec", specKey: "thickness" },
    { key: "tack", label: "Tack", source: "spec", specKey: "tack" },
    { key: "score", label: "Score", source: "score" },
    { key: "price", label: "Price", source: "price" },
  ],
};

export const padelBagBestGuideConfig: BestGuideCategoryConfig = {
  categoryId: "cat-padel-bags",
  comparisonKeys: [
    "form",
    "capacity",
    "racketCompartments",
    "thermalProtection",
    "shoeCompartment",
    "wetCompartment",
  ],
  defaultSelectionCriteria: [
    {
      key: "form",
      label: "Paletero vs backpack",
      description: "Club paletero, tournament duffel, or commute backpack.",
    },
    {
      key: "capacity",
      label: "Capacity",
      description: "Published litres and racket counts.",
    },
  ],
  commonAwardTypes: ["best-overall", "best-premium", "editors-pick"],
  primaryUseCaseIds: [],
  categoryBrowseHref: "/padel/bags",
  heroImageSrc: "/images/padel/products/nox-at10-team-paletero-hero.jpg",
  methodologyImageSrc: "/images/padel/products/nox-at10-team-paletero-hero.jpg",
  quickPickLimit: 6,
  productNoun: "Padel Bags",
  trustPillars: DEFAULT_TRUST_PILLARS,
  buyingHelpLinks: [
    {
      label: "How to choose a padel bag",
      href: "/guides/how-to-choose-a-padel-bag",
    },
    {
      label: "Complete gear checklist",
      href: "/guides/complete-padel-gear-checklist",
    },
    {
      label: "Browse padel bags",
      href: "/padel/bags",
    },
  ],
  tableColumns: [
    { key: "bestFor", label: "Best for", source: "bestFor" },
    { key: "form", label: "Form", source: "spec", specKey: "form" },
    { key: "capacity", label: "Capacity", source: "spec", specKey: "capacity" },
    { key: "thermo", label: "Thermo", source: "spec", specKey: "thermalProtection" },
    { key: "score", label: "Score", source: "score" },
    { key: "price", label: "Price", source: "price" },
  ],
};

export const tennisRacketBestGuideConfig: BestGuideCategoryConfig = {
  categoryId: "cat-tennis-rackets",
  comparisonKeys: [
    "headSizeSqIn",
    "strungWeightG",
    "balance",
    "stringPattern",
    "powerPositioning",
  ],
  defaultSelectionCriteria: [
    {
      key: "headSizeSqIn",
      label: "Head size",
      description: "Forgiveness vs precision trade-off.",
    },
    {
      key: "strungWeightG",
      label: "Weight",
      description: "Maneuverability vs stability.",
    },
    {
      key: "stringPattern",
      label: "Pattern",
      description: "Spin access vs control density.",
    },
    {
      key: "value",
      label: "Value",
      description: "Performance relative to street price.",
    },
  ],
  commonAwardTypes: [
    "best-overall",
    "best-value",
    "best-beginner",
    "editors-pick",
  ],
  primaryUseCaseIds: [
    "uc-tennis-beginner",
    "uc-tennis-control",
    "uc-tennis-power",
    "uc-tennis-spin",
  ],
  relatedToolSlug: "tennis-racket-finder",
  categoryBrowseHref: "/tennis/rackets",
  heroImageSrc: "/images/home/guide-tennis.jpg",
  methodologyImageSrc: "/images/home/guide-tennis.jpg",
  quickPickLimit: 9,
  productNoun: "Tennis Rackets",
  finderCtaLabel: "Find my tennis racket →",
  trustPillars: DEFAULT_TRUST_PILLARS,
  buyingHelpLinks: [],
  tableColumns: [
    { key: "bestFor", label: "Best for", source: "bestFor" },
    {
      key: "headSize",
      label: "Head size",
      source: "spec",
      specKey: "headSizeSqIn",
    },
    {
      key: "weight",
      label: "Weight",
      source: "spec",
      specKey: "strungWeightG",
    },
    { key: "balance", label: "Balance", source: "spec", specKey: "balance" },
    {
      key: "pattern",
      label: "Pattern",
      source: "spec",
      specKey: "stringPattern",
    },
    {
      key: "power",
      label: "Power",
      source: "spec",
      specKey: "powerPositioning",
    },
    { key: "score", label: "Score", source: "score" },
    { key: "price", label: "Price", source: "price" },
  ],
};

const BY_CATEGORY: Record<string, BestGuideCategoryConfig> = {
  [runningShoesBestGuideConfig.categoryId]: runningShoesBestGuideConfig,
  [gpsWatchBestGuideConfig.categoryId]: gpsWatchBestGuideConfig,
  [padelRacketBestGuideConfig.categoryId]: padelRacketBestGuideConfig,
  [padelShoeBestGuideConfig.categoryId]: padelShoeBestGuideConfig,
  [padelGripBestGuideConfig.categoryId]: padelGripBestGuideConfig,
  [padelBagBestGuideConfig.categoryId]: padelBagBestGuideConfig,
  [tennisRacketBestGuideConfig.categoryId]: tennisRacketBestGuideConfig,
};

export function getBestGuideCategoryConfig(
  categoryId: string,
): BestGuideCategoryConfig {
  return (
    BY_CATEGORY[categoryId] ?? {
      categoryId,
      comparisonKeys: [],
      defaultSelectionCriteria: [],
      commonAwardTypes: ["best-overall", "best-value", "editors-pick"],
      primaryUseCaseIds: [],
      quickPickLimit: 9,
      trustPillars: DEFAULT_TRUST_PILLARS,
      buyingHelpLinks: [],
      tableColumns: [
        { key: "bestFor", label: "Best for", source: "bestFor" },
        { key: "score", label: "Score", source: "score" },
        { key: "price", label: "Price", source: "price" },
      ],
    }
  );
}

/** Guide content older than this many days is stale for QA (not auto-unpublished). */
export const GUIDE_STALE_DAYS = 180;

export function isGuideStale(
  lastVerifiedAt: string | undefined,
  now = new Date(),
): boolean {
  if (!lastVerifiedAt) return true;
  const then = new Date(lastVerifiedAt).getTime();
  if (Number.isNaN(then)) return true;
  const days = (now.getTime() - then) / (1000 * 60 * 60 * 24);
  return days > GUIDE_STALE_DAYS;
}
