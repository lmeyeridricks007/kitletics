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
    heroTagKeys: ["shape", "weight", "balance", "level"],
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
