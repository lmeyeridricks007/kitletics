/**
 * Category-aware Product Detail presentation config.
 * Visual chrome stays shared; field labels/groups vary by category.
 */

export type ProductDetailConfig = {
  categoryId: string;
  mediaAspect: "wide" | "tall" | "square";
  quickFactPriority: string[];
  heroTagKeys: string[];
  glanceKeys: string[];
  performanceSectionTitle: "Performance scores" | "Test results" | "Assessment";
};

const DEFAULT_CONFIG: Omit<ProductDetailConfig, "categoryId"> = {
  mediaAspect: "wide",
  quickFactPriority: ["best-for", "category", "release"],
  heroTagKeys: [],
  glanceKeys: [],
  performanceSectionTitle: "Performance scores",
};

const BY_CATEGORY: Record<string, Partial<ProductDetailConfig>> = {
  "cat-running-shoes": {
    mediaAspect: "wide",
    quickFactPriority: ["best-for", "runner-type", "surfaces", "release"],
    heroTagKeys: ["classification", "stability", "terrain", "drop", "weight"],
    glanceKeys: [
      "weight",
      "drop",
      "heelStack",
      "cushionLevel",
      "stability",
      "terrain",
      "plate",
    ],
    performanceSectionTitle: "Performance scores",
  },
  "cat-gps-watches": {
    mediaAspect: "square",
    quickFactPriority: ["best-for", "battery", "maps", "release"],
    heroTagKeys: ["classification", "battery", "maps", "gps"],
    glanceKeys: [
      "display",
      "batteryGps",
      "batterySmartwatch",
      "maps",
      "gps",
      "weight",
    ],
    performanceSectionTitle: "Assessment",
  },
  "cat-padel-rackets": {
    mediaAspect: "tall",
    quickFactPriority: ["best-for", "shape", "weight", "release"],
    heroTagKeys: ["shape", "weightMin", "balance", "playerLevel"],
    glanceKeys: [
      "shape",
      "weightMin",
      "balance",
      "core",
      "face",
      "feel",
      "playerLevel",
    ],
    performanceSectionTitle: "Assessment",
  },
  "cat-padel-shoes": {
    mediaAspect: "wide",
    quickFactPriority: ["best-for", "surface", "stability", "release"],
    heroTagKeys: ["surface", "stability", "outsole"],
    glanceKeys: [
      "surfaceCompatibility",
      "courtOutsole",
      "lateralStability",
      "courtFeel",
      "tractionPattern",
      "durability",
    ],
    performanceSectionTitle: "Assessment",
  },
  "cat-padel-balls": {
    mediaAspect: "square",
    quickFactPriority: ["best-for", "speed", "pressure", "release"],
    heroTagKeys: ["speed", "type", "pressure"],
    glanceKeys: ["speed", "pressurization", "ballType", "use", "packSize"],
    performanceSectionTitle: "Assessment",
  },
  "cat-padel-bags": {
    mediaAspect: "wide",
    quickFactPriority: ["best-for", "capacity", "thermal", "release"],
    heroTagKeys: ["capacity", "form", "thermal"],
    glanceKeys: [
      "racketCompartments",
      "form",
      "thermalProtection",
      "shoeCompartment",
      "volumeL",
    ],
    performanceSectionTitle: "Assessment",
  },
  "cat-padel-grips": {
    mediaAspect: "square",
    quickFactPriority: ["best-for", "type", "tack", "release"],
    heroTagKeys: ["type", "tack", "thickness"],
    glanceKeys: ["gripType", "thickness", "tack", "absorption", "packQuantity"],
    performanceSectionTitle: "Assessment",
  },
  "cat-padel-accessories": {
    mediaAspect: "square",
    quickFactPriority: ["best-for", "type", "function", "release"],
    heroTagKeys: ["type", "function"],
    glanceKeys: ["type", "compatibility", "pressureSystem", "packQuantity"],
    performanceSectionTitle: "Assessment",
  },
  "cat-power-racks": {
    mediaAspect: "wide",
    quickFactPriority: ["best-for", "height", "mounting", "release"],
    heroTagKeys: ["height", "footprint", "mounting"],
    glanceKeys: ["height", "width", "depth", "mounting", "weightCapacity"],
    performanceSectionTitle: "Assessment",
  },
};

export function getProductDetailConfig(
  categoryId: string,
): ProductDetailConfig {
  return {
    categoryId,
    ...DEFAULT_CONFIG,
    ...BY_CATEGORY[categoryId],
  };
}
