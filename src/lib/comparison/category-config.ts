export interface ComparisonScoreFactor {
  key: string;
  label: string;
  /** Keys to look up in review scoreBreakdown or recommendation factors */
  factorKeys: string[];
}

export interface ComparisonCategoryConfig {
  categoryId: string;
  keySpecificationKeys: string[];
  specificationGroups: { id: string; label: string; keys: string[] }[];
  primaryUseCaseIds: string[];
  /** Minimum score gap to declare a use-case winner (not a tie) */
  winnerDifferenceThreshold: number;
  valueComparisonEnabled: boolean;
  generationComparisonEnabled: boolean;
  /** Score comparison chart factors (category-specific) */
  scoreFactors?: ComparisonScoreFactor[];
  heroImageSrc?: string;
  finderToolSlug?: string;
  finderCtaLabel?: string;
  /** Compare Builder section nav tabs */
  builderSectionTabs?: { id: string; label: string }[];
  /** Singular noun for UI copy — "shoe", "watch", "racket" */
  productNounSingular?: string;
  productNounPlural?: string;
  /** Optional contextual header action (running rotation, etc.) */
  builderProductAction?: {
    kind: "rotation" | "product" | "gym";
    label: string;
    href?: string;
  };
}

export const runningShoesComparisonConfig: ComparisonCategoryConfig = {
  categoryId: "cat-running-shoes",
  keySpecificationKeys: [
    "weight",
    "drop",
    "heelStack",
    "cushionLevel",
    "stability",
    "plate",
    "terrain",
    "trainingTypes",
  ],
  specificationGroups: [
    {
      id: "geometry",
      label: "Geometry",
      keys: ["weight", "heelStack", "forefootStack", "drop"],
    },
    {
      id: "ride",
      label: "Ride",
      keys: [
        "cushionLevel",
        "cushionFeel",
        "stability",
        "energyReturn",
        "flexibility",
        "rideCharacter",
      ],
    },
    {
      id: "construction",
      label: "Construction",
      keys: ["upper", "midsole", "outsole", "plate", "plateMaterial"],
    },
    {
      id: "use",
      label: "Use",
      keys: [
        "terrain",
        "trainingTypes",
        "recommendedDistance",
        "weatherSuitability",
      ],
    },
    {
      id: "fit",
      label: "Fit",
      keys: ["widthOptions", "archSupport"],
    },
  ],
  primaryUseCaseIds: [
    "uc-daily-training",
    "uc-long-runs",
    "uc-recovery-runs",
    "uc-tempo-runs",
    "uc-easy-runs",
  ],
  winnerDifferenceThreshold: 3,
  valueComparisonEnabled: true,
  generationComparisonEnabled: true,
  scoreFactors: [
    {
      key: "cushioning",
      label: "Cushioning",
      factorKeys: ["cushioning", "cushion", "protection"],
    },
    {
      key: "ride",
      label: "Ride & Energy",
      factorKeys: ["ride", "energy", "responsiveness"],
    },
    {
      key: "fit",
      label: "Fit & Comfort",
      factorKeys: ["fit", "comfort", "cushion"],
    },
    {
      key: "stability",
      label: "Stability",
      factorKeys: ["stability"],
    },
    {
      key: "durability",
      label: "Durability",
      factorKeys: ["durability"],
    },
    {
      key: "value",
      label: "Value for Money",
      factorKeys: ["value"],
    },
  ],
  heroImageSrc: "/images/home/guide-running-shoes.jpg",
  finderToolSlug: "running-shoe-finder",
  finderCtaLabel: "Find my running shoes →",
  productNounSingular: "shoe",
  productNounPlural: "shoes",
  builderProductAction: {
    kind: "rotation",
    label: "Add to rotation",
    href: "/tools/shoe-rotation-planner",
  },
  builderSectionTabs: [
    { id: "overview", label: "Overview" },
    { id: "use-cases", label: "Use-Case Scores" },
    { id: "specs", label: "Specs" },
    { id: "comfort", label: "Comfort & Fit" },
    { id: "outsole", label: "Outsole" },
    { id: "ride", label: "Ride & Feel" },
    { id: "durability", label: "Durability" },
    { id: "prices", label: "Prices" },
    { id: "reviews", label: "Reviews" },
  ],
};

export const gpsWatchComparisonConfig: ComparisonCategoryConfig = {
  categoryId: "cat-gps-watches",
  keySpecificationKeys: [
    "batteryGps",
    "batterySmartwatch",
    "multiBandGps",
    "maps",
    "navigation",
    "weight",
    "displayType",
    "music",
    "payments",
    "trainingReadiness",
    "recoveryMetrics",
  ],
  specificationGroups: [
    {
      id: "battery",
      label: "Battery",
      keys: ["batteryGps", "batterySmartwatch"],
    },
    {
      id: "sensors",
      label: "GPS & sensors",
      keys: ["multiBandGps", "heartRate", "runningDynamics"],
    },
    {
      id: "features",
      label: "Features",
      keys: [
        "maps",
        "navigation",
        "music",
        "payments",
        "trainingReadiness",
        "recoveryMetrics",
      ],
    },
    {
      id: "display",
      label: "Display",
      keys: ["displayType", "displaySize", "touchscreen", "weight"],
    },
  ],
  primaryUseCaseIds: [],
  winnerDifferenceThreshold: 3,
  valueComparisonEnabled: true,
  generationComparisonEnabled: true,
  scoreFactors: [
    { key: "gps", label: "GPS", factorKeys: ["gps", "gps-accuracy"] },
    { key: "battery", label: "Battery", factorKeys: ["battery"] },
    { key: "training", label: "Training", factorKeys: ["training", "training-features"] },
    { key: "navigation", label: "Navigation", factorKeys: ["navigation", "maps"] },
    { key: "recovery", label: "Recovery", factorKeys: ["recovery"] },
    { key: "value", label: "Value", factorKeys: ["value"] },
  ],
  heroImageSrc: "/images/running/best-hub/best-gps-watches-running.jpg",
  finderToolSlug: "fitness-watch-finder",
  finderCtaLabel: "Find my running watch →",
  productNounSingular: "watch",
  productNounPlural: "watches",
  builderProductAction: { kind: "product", label: "View product" },
  builderSectionTabs: [
    { id: "overview", label: "Overview" },
    { id: "use-cases", label: "Use-Case Scores" },
    { id: "battery", label: "Battery" },
    { id: "gps", label: "GPS & Sensors" },
    { id: "training", label: "Training" },
    { id: "navigation", label: "Navigation" },
    { id: "smart", label: "Smart Features" },
    { id: "prices", label: "Prices" },
    { id: "reviews", label: "Reviews" },
  ],
};

export const padelRacketComparisonConfig: ComparisonCategoryConfig = {
  categoryId: "cat-padel-rackets",
  keySpecificationKeys: [
    "shape",
    "balance",
    "weightMin",
    "weightMax",
    "face",
    "faceMaterial",
    "frame",
    "core",
    "manufacturerCoreName",
    "feel",
    "sweetSpot",
    "playerLevel",
    "playStyle",
  ],
  specificationGroups: [
    {
      id: "shape-balance",
      label: "Shape, balance & weight",
      keys: ["shape", "balance", "weightMin", "weightMax", "thicknessMm", "sweetSpot"],
    },
    {
      id: "construction",
      label: "Surface, frame & core",
      keys: [
        "face",
        "faceMaterial",
        "frame",
        "core",
        "manufacturerCoreName",
        "feel",
      ],
    },
    {
      id: "play-profile",
      label: "Play profile",
      keys: ["playerLevel", "playStyle", "sweetSpot", "feel"],
    },
  ],
  primaryUseCaseIds: [
    "uc-padel-beginner",
    "uc-padel-control",
    "uc-padel-power",
    "uc-padel-balanced",
  ],
  winnerDifferenceThreshold: 3,
  valueComparisonEnabled: true,
  generationComparisonEnabled: true,
  scoreFactors: [
    { key: "power", label: "Power", factorKeys: ["power"] },
    { key: "control", label: "Control", factorKeys: ["control"] },
    { key: "comfort", label: "Comfort", factorKeys: ["comfort"] },
    {
      key: "maneuverability",
      label: "Maneuverability",
      factorKeys: ["maneuverability", "manoeuvrability"],
    },
    {
      key: "forgiveness",
      label: "Forgiveness",
      factorKeys: ["forgiveness", "sweet-spot"],
    },
    { key: "stability", label: "Stability", factorKeys: ["stability"] },
    { key: "spin", label: "Spin", factorKeys: ["spin"] },
    { key: "value", label: "Value / offers", factorKeys: ["value"] },
  ],
  heroImageSrc: "/images/padel/hero.jpg",
  finderToolSlug: "padel-racket-finder",
  finderCtaLabel: "Find my padel racket →",
  productNounSingular: "racket",
  productNounPlural: "rackets",
  builderProductAction: { kind: "product", label: "View product" },
  builderSectionTabs: [
    { id: "overview", label: "Overview" },
    { id: "use-cases", label: "Use-Case Scores" },
    { id: "shape", label: "Shape & Balance" },
    { id: "control", label: "Control & Power" },
    { id: "construction", label: "Construction" },
    { id: "comfort", label: "Comfort & Feel" },
    { id: "prices", label: "Prices / Offers" },
    { id: "reviews", label: "Reviews" },
  ],
};

export const tennisRacketComparisonConfig: ComparisonCategoryConfig = {
  categoryId: "cat-tennis-rackets",
  keySpecificationKeys: [
    "headSizeSqIn",
    "strungWeightG",
    "balance",
    "stringPattern",
    "powerPositioning",
    "controlPositioning",
    "spinPositioning",
  ],
  specificationGroups: [
    {
      id: "geometry",
      label: "Geometry",
      keys: ["headSizeSqIn", "lengthIn", "beamWidthMm"],
    },
    {
      id: "weight-balance",
      label: "Weight & Balance",
      keys: ["strungWeightG", "unstrungWeightG", "balance", "swingweight"],
    },
    {
      id: "string",
      label: "Stringbed",
      keys: ["stringPattern", "stiffnessRa"],
    },
    {
      id: "positioning",
      label: "Play Profile",
      keys: ["powerPositioning", "controlPositioning", "spinPositioning"],
    },
  ],
  primaryUseCaseIds: [
    "uc-tennis-beginner",
    "uc-tennis-control",
    "uc-tennis-power",
    "uc-tennis-spin",
    "uc-tennis-balanced",
  ],
  winnerDifferenceThreshold: 3,
  valueComparisonEnabled: true,
  generationComparisonEnabled: true,
};

export const pickleballPaddleComparisonConfig: ComparisonCategoryConfig = {
  categoryId: "cat-pickleball-paddles",
  keySpecificationKeys: [
    "shape",
    "weight",
    "thickness",
    "faceMaterial",
    "coreMaterial",
    "powerPositioning",
    "controlPositioning",
  ],
  specificationGroups: [
    {
      id: "size",
      label: "Size & Weight",
      keys: ["length", "width", "thickness", "weight"],
    },
    {
      id: "construction",
      label: "Construction",
      keys: ["faceMaterial", "coreMaterial", "coreThickness"],
    },
    {
      id: "positioning",
      label: "Play Profile",
      keys: ["powerPositioning", "controlPositioning", "spinPositioning"],
    },
  ],
  primaryUseCaseIds: ["uc-pickleball-general"],
  winnerDifferenceThreshold: 3,
  valueComparisonEnabled: true,
  generationComparisonEnabled: false,
};

export const badmintonRacketComparisonConfig: ComparisonCategoryConfig = {
  categoryId: "cat-badminton-rackets",
  keySpecificationKeys: [
    "weightClass",
    "balance",
    "flex",
    "material",
    "powerPositioning",
    "controlPositioning",
  ],
  specificationGroups: [
    {
      id: "weight-balance",
      label: "Weight & Balance",
      keys: ["weightClass", "weight", "balance", "balancePoint"],
    },
    {
      id: "feel",
      label: "Feel",
      keys: ["flex", "shaft", "material"],
    },
  ],
  primaryUseCaseIds: ["uc-badminton-general"],
  winnerDifferenceThreshold: 3,
  valueComparisonEnabled: true,
  generationComparisonEnabled: false,
};

export const squashRacketComparisonConfig: ComparisonCategoryConfig = {
  categoryId: "cat-squash-rackets",
  keySpecificationKeys: [
    "weight",
    "headSize",
    "balance",
    "stringPattern",
    "powerPositioning",
    "controlPositioning",
  ],
  specificationGroups: [
    {
      id: "geometry",
      label: "Geometry",
      keys: ["weight", "headSize", "length", "balance"],
    },
    {
      id: "construction",
      label: "Construction",
      keys: ["stringPattern", "beam", "construction"],
    },
  ],
  primaryUseCaseIds: ["uc-squash-general"],
  winnerDifferenceThreshold: 3,
  valueComparisonEnabled: true,
  generationComparisonEnabled: false,
};

export const powerRacksComparisonConfig: ComparisonCategoryConfig = {
  categoryId: "cat-power-racks",
  keySpecificationKeys: [
    "heightMm",
    "widthMm",
    "depthMm",
    "weightCapacity",
    "uprightSize",
    "holeSpacing",
  ],
  specificationGroups: [
    {
      id: "dimensions",
      label: "Dimensions",
      keys: ["heightMm", "widthMm", "depthMm"],
    },
    {
      id: "structure",
      label: "Structure",
      keys: ["weightCapacity", "uprightSize", "holeSpacing"],
    },
  ],
  primaryUseCaseIds: ["uc-home-gym", "uc-garage-gym", "uc-small-space"],
  winnerDifferenceThreshold: 3,
  valueComparisonEnabled: true,
  generationComparisonEnabled: false,
};

export const adjustableDumbbellsComparisonConfig: ComparisonCategoryConfig = {
  categoryId: "cat-adjustable-dumbbells",
  keySpecificationKeys: [
    "weightRangeMin",
    "weightRangeMax",
    "increments",
    "adjustmentMechanism",
  ],
  specificationGroups: [
    {
      id: "range",
      label: "Weight range",
      keys: ["weightRangeMin", "weightRangeMax", "increments"],
    },
    {
      id: "mechanism",
      label: "Adjustment",
      keys: ["adjustmentMechanism"],
    },
  ],
  primaryUseCaseIds: ["uc-home-gym", "uc-apartment-gym", "uc-small-space"],
  winnerDifferenceThreshold: 3,
  valueComparisonEnabled: true,
  generationComparisonEnabled: false,
};

export const trainingShoesComparisonConfig: ComparisonCategoryConfig = {
  categoryId: "cat-training-shoes",
  keySpecificationKeys: [
    "weight",
    "drop",
    "stability",
    "hyroxSuitability",
    "liftingSuitability",
    "runningSuitability",
  ],
  specificationGroups: [
    {
      id: "geometry",
      label: "Geometry",
      keys: ["weight", "drop"],
    },
    {
      id: "suitability",
      label: "Suitability",
      keys: [
        "stability",
        "hyroxSuitability",
        "liftingSuitability",
        "runningSuitability",
      ],
    },
  ],
  primaryUseCaseIds: ["uc-hyrox-race", "uc-hyrox-training", "uc-general-fitness"],
  winnerDifferenceThreshold: 3,
  valueComparisonEnabled: true,
  generationComparisonEnabled: true,
};

export const rowingMachinesComparisonConfig: ComparisonCategoryConfig = {
  categoryId: "cat-rowing-machines",
  keySpecificationKeys: ["resistanceType", "maxUserWeight", "dimensions"],
  specificationGroups: [
    {
      id: "drive",
      label: "Drive",
      keys: ["resistanceType", "maxUserWeight"],
    },
  ],
  primaryUseCaseIds: ["uc-home-gym", "uc-hyrox-training", "uc-apartment-gym"],
  winnerDifferenceThreshold: 3,
  valueComparisonEnabled: true,
  generationComparisonEnabled: false,
};

export const treadmillsComparisonConfig: ComparisonCategoryConfig = {
  categoryId: "cat-treadmills",
  keySpecificationKeys: [
    "motorised",
    "foldable",
    "maxUserWeight",
    "maxSpeedKph",
    "widthMm",
    "depthMm",
  ],
  specificationGroups: [
    {
      id: "drive",
      label: "Drive & capacity",
      keys: ["motorised", "foldable", "maxUserWeight", "maxSpeedKph"],
    },
    {
      id: "footprint",
      label: "Footprint",
      keys: ["widthMm", "depthMm"],
    },
  ],
  primaryUseCaseIds: ["uc-home-gym", "uc-apartment-gym"],
  winnerDifferenceThreshold: 3,
  valueComparisonEnabled: true,
  generationComparisonEnabled: false,
};

export const weightBenchesComparisonConfig: ComparisonCategoryConfig = {
  categoryId: "cat-weight-benches",
  keySpecificationKeys: [
    "benchType",
    "weightCapacity",
    "widthMm",
    "depthMm",
    "foldable",
  ],
  specificationGroups: [
    {
      id: "type",
      label: "Type & capacity",
      keys: ["benchType", "weightCapacity", "foldable"],
    },
    {
      id: "size",
      label: "Size",
      keys: ["widthMm", "depthMm"],
    },
  ],
  primaryUseCaseIds: ["uc-home-gym", "uc-garage-gym"],
  winnerDifferenceThreshold: 3,
  valueComparisonEnabled: true,
  generationComparisonEnabled: false,
};

const BY_CATEGORY: Record<string, ComparisonCategoryConfig> = {
  [runningShoesComparisonConfig.categoryId]: runningShoesComparisonConfig,
  [gpsWatchComparisonConfig.categoryId]: gpsWatchComparisonConfig,
  [padelRacketComparisonConfig.categoryId]: padelRacketComparisonConfig,
  [tennisRacketComparisonConfig.categoryId]: tennisRacketComparisonConfig,
  [pickleballPaddleComparisonConfig.categoryId]: pickleballPaddleComparisonConfig,
  [badmintonRacketComparisonConfig.categoryId]: badmintonRacketComparisonConfig,
  [squashRacketComparisonConfig.categoryId]: squashRacketComparisonConfig,
  [powerRacksComparisonConfig.categoryId]: powerRacksComparisonConfig,
  [adjustableDumbbellsComparisonConfig.categoryId]:
    adjustableDumbbellsComparisonConfig,
  [trainingShoesComparisonConfig.categoryId]: trainingShoesComparisonConfig,
  [rowingMachinesComparisonConfig.categoryId]: rowingMachinesComparisonConfig,
  [treadmillsComparisonConfig.categoryId]: treadmillsComparisonConfig,
  [weightBenchesComparisonConfig.categoryId]: weightBenchesComparisonConfig,
};

export function getComparisonCategoryConfig(
  categoryId: string,
): ComparisonCategoryConfig {
  return (
    BY_CATEGORY[categoryId] ?? {
      categoryId,
      keySpecificationKeys: [],
      specificationGroups: [],
      primaryUseCaseIds: [],
      winnerDifferenceThreshold: 3,
      valueComparisonEnabled: true,
      generationComparisonEnabled: false,
    }
  );
}

export const COMPARISON_STALE_DAYS = 180;

export function isComparisonStale(
  lastVerifiedAt: string | undefined,
  now = new Date(),
): boolean {
  if (!lastVerifiedAt) return true;
  const then = new Date(lastVerifiedAt).getTime();
  if (Number.isNaN(then)) return true;
  return (now.getTime() - then) / (1000 * 60 * 60 * 24) > COMPARISON_STALE_DAYS;
}
