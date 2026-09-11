import type { ProductSimilarityConfig } from "@/domain/relationships/types";

export const runningShoeSimilarityConfig: ProductSimilarityConfig = {
  categoryId: "cat-running-shoes",
  fields: [
    { key: "terrain", weight: 0.22, comparisonType: "multi-overlap" },
    { key: "cushionLevel", weight: 0.18, comparisonType: "enum-distance" },
    { key: "stability", weight: 0.16, comparisonType: "enum-distance" },
    { key: "plateMaterial", weight: 0.12, comparisonType: "exact" },
    { key: "drop", weight: 0.08, comparisonType: "numeric-band", bandSize: 4 },
    { key: "weight", weight: 0.08, comparisonType: "numeric-band", bandSize: 30 },
    { key: "trainingTypes", weight: 0.1, comparisonType: "multi-overlap" },
    { key: "recommendedDistance", weight: 0.06, comparisonType: "multi-overlap" },
  ],
  recommendationContexts: [
    "uc-daily-training",
    "uc-easy-runs",
    "uc-long-runs",
    "uc-tempo-runs",
    "uc-intervals",
    "uc-marathon",
    "uc-trail-training",
  ],
  recommendationWeight: 0.2,
};

export const gpsWatchSimilarityConfig: ProductSimilarityConfig = {
  categoryId: "cat-gps-watches",
  fields: [
    { key: "displayType", weight: 0.15, comparisonType: "exact" },
    { key: "maps", weight: 0.2, comparisonType: "boolean" },
    { key: "multiBandGps", weight: 0.15, comparisonType: "boolean" },
    { key: "music", weight: 0.1, comparisonType: "boolean" },
    { key: "batterySmartwatch", weight: 0.12, comparisonType: "numeric-band", bandSize: 5 },
    { key: "batteryGps", weight: 0.12, comparisonType: "numeric-band", bandSize: 10 },
    { key: "trainingReadiness", weight: 0.08, comparisonType: "boolean" },
    { key: "weight", weight: 0.08, comparisonType: "numeric-band", bandSize: 15 },
  ],
  recommendationContexts: [],
  recommendationWeight: 0,
};

export const hydrationVestSimilarityConfig: ProductSimilarityConfig = {
  categoryId: "cat-packs-vests",
  fields: [
    { key: "capacity", weight: 0.25, comparisonType: "numeric-band", bandSize: 3 },
    { key: "raceSuitability", weight: 0.25, comparisonType: "multi-overlap" },
    { key: "poleAttachment", weight: 0.1, comparisonType: "boolean" },
    { key: "bladderCompatible", weight: 0.1, comparisonType: "boolean" },
    { key: "includedFlasks", weight: 0.1, comparisonType: "numeric-band", bandSize: 1 },
    { key: "genderFit", weight: 0.1, comparisonType: "exact" },
    { key: "weight", weight: 0.1, comparisonType: "numeric-band", bandSize: 50 },
  ],
  recommendationContexts: [],
  recommendationWeight: 0,
};

export const hrmSimilarityConfig: ProductSimilarityConfig = {
  categoryId: "cat-hrm",
  fields: [
    { key: "type", weight: 0.35, comparisonType: "exact" },
    { key: "connectivity", weight: 0.3, comparisonType: "multi-overlap" },
    { key: "runningDynamics", weight: 0.2, comparisonType: "boolean" },
    { key: "swimmingSupport", weight: 0.15, comparisonType: "boolean" },
  ],
  recommendationContexts: [],
  recommendationWeight: 0,
};

const BY_CATEGORY: Record<string, ProductSimilarityConfig> = {
  "cat-running-shoes": runningShoeSimilarityConfig,
  "cat-gps-watches": gpsWatchSimilarityConfig,
  "cat-packs-vests": hydrationVestSimilarityConfig,
  "cat-hrm": hrmSimilarityConfig,
};

export function getSimilarityConfig(
  categoryId: string,
): ProductSimilarityConfig | undefined {
  return BY_CATEGORY[categoryId];
}
