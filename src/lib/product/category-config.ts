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
    "balance",
    "weightMin",
    "weightMax",
    "thicknessMm",
    "face",
    "core",
    "frameMaterial",
    "surfaceTexture",
    "feel",
    "sweetSpot",
    "playerLevel",
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

/** Court shoes — same PDP chrome as running; padel court fields, not road geometry. */
export const padelShoesProductPageConfig: ProductPageCategoryConfig = {
  categoryId: "cat-padel-shoes",
  featuredSpecificationKeys: [
    "surfaceCompatibility",
    "courtOutsole",
    "lateralStability",
    "courtFeel",
    "tractionPattern",
    "durability",
    "fit",
  ],
  specificationGroups: [
    {
      id: "use",
      label: "Court use",
      keys: [
        "surfaceCompatibility",
        "courtOutsole",
        "tractionPattern",
        "durability",
      ],
    },
    {
      id: "fit",
      label: "Support & fit",
      keys: ["lateralStability", "courtFeel", "fit", "width", "upper"],
    },
    {
      id: "construction",
      label: "Construction",
      keys: ["upper", "courtOutsole", "tractionPattern"],
    },
  ],
  comparisonPriorityKeys: [
    "surfaceCompatibility",
    "lateralStability",
    "courtOutsole",
    "courtFeel",
  ],
  classificationSpecKeys: ["surfaceCompatibility", "lateralStability"],
  optionalSections: {
    family: true,
    rotation: false,
    tools: true,
  },
};

export const padelBallsProductPageConfig: ProductPageCategoryConfig = {
  categoryId: "cat-padel-balls",
  featuredSpecificationKeys: [
    "speed",
    "pressurization",
    "ballType",
    "use",
    "packSize",
  ],
  specificationGroups: [
    {
      id: "use",
      label: "Play character",
      keys: ["speed", "ballType", "pressurization", "use", "officialApproval"],
    },
    {
      id: "construction",
      label: "Construction & pack",
      keys: ["durability", "packSize", "ballsPerCan", "feltType"],
    },
  ],
  comparisonPriorityKeys: ["speed", "pressurization", "ballType", "use"],
  classificationSpecKeys: ["speed", "ballType"],
  optionalSections: {
    family: true,
    rotation: false,
    tools: false,
  },
};

export const padelBagsProductPageConfig: ProductPageCategoryConfig = {
  categoryId: "cat-padel-bags",
  featuredSpecificationKeys: [
    "racketCompartments",
    "thermalProtection",
    "shoeCompartment",
    "form",
    "volumeL",
  ],
  specificationGroups: [
    {
      id: "use",
      label: "Capacity & carry",
      keys: [
        "racketCompartments",
        "form",
        "volumeL",
        "carrySystem",
        "capacity",
      ],
    },
    {
      id: "features",
      label: "Storage features",
      keys: ["thermalProtection", "shoeCompartment", "compartments"],
    },
  ],
  comparisonPriorityKeys: [
    "racketCompartments",
    "thermalProtection",
    "shoeCompartment",
    "form",
  ],
  classificationSpecKeys: ["form", "thermalProtection"],
  optionalSections: {
    family: true,
    rotation: false,
    tools: false,
  },
};

export const padelGripsProductPageConfig: ProductPageCategoryConfig = {
  categoryId: "cat-padel-grips",
  featuredSpecificationKeys: [
    "gripType",
    "thickness",
    "tack",
    "absorption",
    "packQuantity",
  ],
  specificationGroups: [
    {
      id: "features",
      label: "Grip character",
      keys: ["gripType", "thickness", "tack", "absorption", "feel"],
    },
    {
      id: "use",
      label: "Pack & install",
      keys: ["packQuantity", "installationMethod", "handleThicknessEffect"],
    },
  ],
  comparisonPriorityKeys: ["gripType", "tack", "absorption", "thickness"],
  classificationSpecKeys: ["gripType", "tack"],
  optionalSections: {
    family: false,
    rotation: false,
    tools: false,
  },
};

export const padelAccessoriesProductPageConfig: ProductPageCategoryConfig = {
  categoryId: "cat-padel-accessories",
  featuredSpecificationKeys: [
    "type",
    "compatibility",
    "pressureSystem",
    "packQuantity",
  ],
  specificationGroups: [
    {
      id: "features",
      label: "What it does",
      keys: ["type", "pressureSystem", "manualOrElectric", "compatibility"],
    },
    {
      id: "use",
      label: "Use context",
      keys: ["packQuantity", "capacityBalls", "compatibility"],
    },
  ],
  comparisonPriorityKeys: ["type", "compatibility", "pressureSystem"],
  classificationSpecKeys: ["type"],
  optionalSections: {
    family: false,
    rotation: false,
    tools: false,
  },
};

export const PRODUCT_PAGE_CONFIGS: Record<string, ProductPageCategoryConfig> = {
  "cat-running-shoes": runningShoesProductPageConfig,
  "cat-gps-watches": gpsWatchProductPageConfig,
  "cat-padel-rackets": padelRacketsProductPageConfig,
  "cat-padel-shoes": padelShoesProductPageConfig,
  "cat-padel-balls": padelBallsProductPageConfig,
  "cat-padel-bags": padelBagsProductPageConfig,
  "cat-padel-grips": padelGripsProductPageConfig,
  "cat-padel-accessories": padelAccessoriesProductPageConfig,
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
