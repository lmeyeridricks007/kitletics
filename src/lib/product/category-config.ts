export type SpecGroupId =
  | "geometry"
  | "ride"
  | "construction"
  | "use"
  | "fit"
  | "display"
  | "battery"
  | "sensors"
  | "features"
  | "other";

export interface SpecGroupConfig {
  id: SpecGroupId;
  label: string;
  keys: string[];
}

export interface ProductPageCategoryConfig {
  categoryId: string;
  featuredSpecificationKeys: string[];
  specificationGroups: SpecGroupConfig[];
  comparisonPriorityKeys: string[];
  classificationSpecKeys: string[];
  optionalSections: {
    family: boolean;
    rotation: boolean;
    tools: boolean;
  };
  relatedToolSlugs?: string[];
}

export const runningShoesProductPageConfig: ProductPageCategoryConfig = {
  categoryId: "cat-running-shoes",
  featuredSpecificationKeys: [
    "weight",
    "drop",
    "heelStack",
    "cushionLevel",
    "stability",
    "terrain",
    "plate",
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
        "recommendedPaceRange",
        "surface",
        "weatherSuitability",
        "raceLegal",
      ],
    },
    {
      id: "fit",
      label: "Fit",
      keys: [
        "widthOptions",
        "archSupport",
        "recommendedRunnerWeightRange",
        "grip",
        "durability",
        "breathability",
      ],
    },
  ],
  comparisonPriorityKeys: [
    "weight",
    "drop",
    "cushionLevel",
    "stability",
    "plate",
  ],
  classificationSpecKeys: ["stability", "cushionLevel", "terrain"],
  optionalSections: {
    family: true,
    rotation: false,
    tools: true,
  },
  relatedToolSlugs: [
    "running-shoe-finder",
    "shoe-rotation-planner",
    "running-pace-calculator",
  ],
};

export const gpsWatchProductPageConfig: ProductPageCategoryConfig = {
  categoryId: "cat-gps-watches",
  featuredSpecificationKeys: [
    "weight",
    "displayType",
    "batteryGps",
    "batterySmartwatch",
    "multiBandGps",
    "maps",
    "heartRate",
  ],
  specificationGroups: [
    {
      id: "display",
      label: "Display",
      keys: ["displayType", "displaySize", "touchscreen"],
    },
    {
      id: "battery",
      label: "Battery",
      keys: ["batterySmartwatch", "batteryGps"],
    },
    {
      id: "sensors",
      label: "Sensors & metrics",
      keys: [
        "heartRate",
        "ecg",
        "spo2",
        "runningDynamics",
        "trainingReadiness",
        "recoveryMetrics",
      ],
    },
    {
      id: "features",
      label: "Features",
      keys: [
        "multiBandGps",
        "maps",
        "navigation",
        "music",
        "payments",
        "waterRating",
        "weight",
      ],
    },
  ],
  comparisonPriorityKeys: [
    "batteryGps",
    "multiBandGps",
    "maps",
    "weight",
  ],
  classificationSpecKeys: ["displayType"],
  optionalSections: {
    family: true,
    rotation: false,
    tools: true,
  },
  relatedToolSlugs: ["fitness-watch-finder"],
};

export const padelRacketsProductPageConfig: ProductPageCategoryConfig = {
  categoryId: "cat-padel-rackets",
  featuredSpecificationKeys: [
    "shape",
    "weightMin",
    "weightMax",
    "balance",
    "core",
    "face",
    "thicknessMm",
  ],
  specificationGroups: [
    {
      id: "geometry",
      label: "Shape & weight",
      keys: ["shape", "balance", "weightMin", "weightMax", "thicknessMm", "sweetSpot"],
    },
    {
      id: "construction",
      label: "Construction",
      keys: [
        "frameMaterial",
        "face",
        "faceMaterial",
        "faceCarbonWeave",
        "core",
        "manufacturerCoreName",
        "surfaceTexture",
        "feel",
        "technologies",
      ],
    },
    {
      id: "use",
      label: "Positioning",
      keys: ["playerLevel", "manufacturerPositioning"],
    },
  ],
  comparisonPriorityKeys: ["shape", "balance", "weightMin", "core", "face"],
  classificationSpecKeys: ["shape", "playerLevel"],
  optionalSections: {
    family: true,
    rotation: false,
    tools: true,
  },
  relatedToolSlugs: ["padel-racket-finder"],
};

export const PRODUCT_PAGE_CONFIGS: Record<string, ProductPageCategoryConfig> = {
  "cat-running-shoes": runningShoesProductPageConfig,
  "cat-gps-watches": gpsWatchProductPageConfig,
  "cat-padel-rackets": padelRacketsProductPageConfig,
};

export function getProductPageCategoryConfig(
  categoryId: string,
): ProductPageCategoryConfig {
  return (
    PRODUCT_PAGE_CONFIGS[categoryId] ?? {
      categoryId,
      featuredSpecificationKeys: [],
      specificationGroups: [],
      comparisonPriorityKeys: [],
      classificationSpecKeys: [],
      optionalSections: { family: true, rotation: false, tools: true },
    }
  );
}
