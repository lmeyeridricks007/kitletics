import type { RegionCode } from "@/domain/shared/types";

/** Launch priority for Running categories */
export type LaunchCategoryStatus = "launch-core" | "launch-supporting" | "future";

export interface RunningCategoryTarget {
  categoryId: string;
  slug: string;
  status: LaunchCategoryStatus;
  /** Soft minimum published products for credibility */
  minProducts: number;
}

export interface RunningQualityThresholds {
  /** Required publishability fields must pass */
  requiredFieldCompleteness: number;
  /** Important specs: allow justified unknowns */
  importantFieldCompleteness: number;
  launchCoreMinProducts: number;
  finderScenarioPassRate: number;
}

/**
 * Machine-readable Running launch manifest — single source for QA thresholds.
 * Do not scatter completeness assumptions across scripts.
 */
export const runningLaunchManifest = {
  sport: "sport-running" as const,
  sportSlug: "running" as const,
  asOf: "2026-08-30",

  categories: [
    { categoryId: "cat-running-shoes", slug: "running-shoes", status: "launch-core", minProducts: 40 },
    { categoryId: "cat-gps-watches", slug: "gps-watches", status: "launch-core", minProducts: 28 },
    { categoryId: "cat-hrm", slug: "heart-rate-monitors", status: "launch-core", minProducts: 12 },
    { categoryId: "cat-packs-vests", slug: "running-packs-vests", status: "launch-core", minProducts: 12 },
    { categoryId: "cat-hydration", slug: "hydration", status: "launch-core", minProducts: 5 },
    { categoryId: "cat-running-belts", slug: "running-belts", status: "launch-core", minProducts: 5 },
    { categoryId: "cat-running-clothing", slug: "running-clothing", status: "launch-supporting", minProducts: 20 },
    { categoryId: "cat-running-socks", slug: "running-socks", status: "launch-core", minProducts: 1 },
    { categoryId: "cat-headphones", slug: "headphones", status: "launch-supporting", minProducts: 2 },
    { categoryId: "cat-sunglasses", slug: "sunglasses", status: "launch-supporting", minProducts: 8 },
    { categoryId: "cat-running-lights", slug: "running-lights", status: "launch-supporting", minProducts: 2 },
    { categoryId: "cat-safety", slug: "safety-gear", status: "launch-supporting", minProducts: 2 },
    { categoryId: "cat-recovery-gear", slug: "recovery", status: "launch-supporting", minProducts: 3 },
    /** Specialist anti-chafe shelf — launch-supporting after Fix 58 editorial */
    { categoryId: "cat-accessories", slug: "accessories", status: "launch-supporting", minProducts: 3 },
    { categoryId: "cat-nutrition", slug: "nutrition-fuel", status: "launch-supporting", minProducts: 8 },
  ] satisfies RunningCategoryTarget[],

  productTargets: {
    launchCoreRequireFamilyWhereApplicable: true,
    launchCoreRequireHeroOrHonestFallback: true,
    noDummyProductPhotos: true,
    noFabricatedPersonalTesting: true,
  },

  contentTargets: {
    bestGuidesMin: 15,
    buyingGuidesMin: 10,
    setupsMin: 3,
    comparisonsMin: 10,
    reviewsFlagshipPreferred: true,
  },

  toolTargets: [
    "running-shoe-finder",
    "shoe-rotation-planner",
    "running-pace-calculator",
    "race-time-predictor",
  ] as const,

  relationshipTargets: {
    highValueProductsRequireAlternatives: true,
    generationLinksWhereKnown: true,
  },

  commercialTargets: {
    regions: ["NL", "DE", "BE", "FR", "UK", "US", "ZA"] as RegionCode[],
    /** NL is primary commerce-ready at launch; DE/UK partial; do not prioritize empty US. */
    prioritizeRegions: ["NL", "DE", "UK"] as RegionCode[],
    primaryCommerceRegion: "NL" as RegionCode,
    neverFabricateOffers: true,
    neverPresentCrossRegionOfferAsLocal: true,
    affiliateMustNotAffectRecommendations: true,
  },

  qualityThresholds: {
    requiredFieldCompleteness: 1,
    importantFieldCompleteness: 0.7,
    launchCoreMinProducts: 40,
    finderScenarioPassRate: 1,
  } satisfies RunningQualityThresholds,

  finderScenarios: [
    "beginner-road",
    "experienced-daily",
    "long-run",
    "marathon-racer",
    "wide-foot",
    "stability",
    "max-cushion",
    "tempo",
    "budget",
    "trail",
    "heavy",
    "treadmill",
  ] as const,
} as const;

export type RunningLaunchManifest = typeof runningLaunchManifest;

export function launchCoreCategoryIds(): string[] {
  return runningLaunchManifest.categories
    .filter((c) => c.status === "launch-core")
    .map((c) => c.categoryId);
}

export function futureCategoryIds(): string[] {
  return (runningLaunchManifest.categories as readonly RunningCategoryTarget[])
    .filter((c) => c.status === "future")
    .map((c) => c.categoryId);
}
