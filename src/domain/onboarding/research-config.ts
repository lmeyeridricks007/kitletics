import type { ProductResearchConfig } from "@/domain/onboarding/types";

export const runningShoesResearchConfig: ProductResearchConfig = {
  categoryId: "cat-running-shoes",
  categorySlug: "running-shoes",
  sportId: "sport-running",
  identityFields: [
    "brand",
    "family",
    "generation",
    "model",
    "lifecycle",
    "releaseDate",
  ],
  requiredSpecs: [
    "drop",
    "cushionLevel",
    "stability",
    "terrain",
    "plateMaterial",
  ],
  importantSpecs: [
    "weight",
    "heelStack",
    "forefootStack",
    "midsole",
    "upper",
    "outsole",
    "plate",
    "widthOptions",
  ],
  optionalSpecs: [
    "lugDepth",
    "rockPlate",
    "waterproof",
    "raceLegal",
    "recommendedDistance",
  ],
  recommendationContexts: [
    "uc-daily-training",
    "uc-easy-runs",
    "uc-long-runs",
    "uc-tempo-runs",
    "uc-recovery-runs",
    "uc-5k",
    "uc-10k",
    "uc-half",
    "uc-marathon",
    "uc-trail-training",
  ],
  mediaRequirements: ["hero", "side"],
  trustedSourcePatterns: [
    "asics.com",
    "nike.com",
    "adidas.com",
    "brooksrunning.com",
    "hoka.com",
    "saucony.com",
    "newbalance.com",
    "on.com",
    "salomon.com",
    "mizuno.com",
    "altra.com",
  ],
  outlierBounds: {
    weight: { min: 120, max: 450, unit: "g" },
    drop: { min: 0, max: 16, unit: "mm" },
    heelStack: { min: 10, max: 55, unit: "mm" },
    forefootStack: { min: 8, max: 50, unit: "mm" },
  },
};

export const gpsWatchesResearchConfig: ProductResearchConfig = {
  categoryId: "cat-gps-watches",
  categorySlug: "gps-watches",
  sportId: "sport-running",
  identityFields: ["brand", "family", "generation", "model", "lifecycle"],
  requiredSpecs: ["displayType", "multiBandGps", "heartRate"],
  importantSpecs: [
    "weight",
    "batterySmartwatch",
    "batteryGps",
    "batteryMultiBand",
    "maps",
    "music",
    "waterRating",
  ],
  optionalSpecs: ["ecg", "spo2", "payments", "dimensions"],
  recommendationContexts: [],
  mediaRequirements: ["hero"],
  trustedSourcePatterns: [
    "garmin.com",
    "coros.com",
    "polar.com",
    "suunto.com",
    "apple.com",
  ],
  outlierBounds: {
    weight: { min: 20, max: 120, unit: "g" },
    batteryGps: { min: 5, max: 200, unit: "h" },
  },
};

/** Non-Running fixture proving pipeline is category-plugin based */
export const padelRacketsResearchConfig: ProductResearchConfig = {
  categoryId: "cat-padel-rackets",
  categorySlug: "padel-rackets",
  sportId: "sport-padel",
  identityFields: ["brand", "family", "generation", "model", "lifecycle"],
  requiredSpecs: ["shape", "balance", "weight"],
  importantSpecs: ["core", "frame", "surface", "playerLevel"],
  optionalSpecs: ["sweetSpot"],
  recommendationContexts: [],
  mediaRequirements: ["hero"],
  trustedSourcePatterns: ["bullpadel.com", "nox.com", "babolat.com", "head.com"],
  outlierBounds: {
    weight: { min: 300, max: 400, unit: "g" },
  },
};

const BY_CATEGORY: Record<string, ProductResearchConfig> = {
  "cat-running-shoes": runningShoesResearchConfig,
  "running-shoes": runningShoesResearchConfig,
  "cat-gps-watches": gpsWatchesResearchConfig,
  "gps-watches": gpsWatchesResearchConfig,
  "cat-padel-rackets": padelRacketsResearchConfig,
  "padel-rackets": padelRacketsResearchConfig,
};

export function getProductResearchConfig(
  categoryIdOrSlug: string,
): ProductResearchConfig | undefined {
  return BY_CATEGORY[categoryIdOrSlug];
}

export function listProductResearchConfigs(): ProductResearchConfig[] {
  return [
    runningShoesResearchConfig,
    gpsWatchesResearchConfig,
    padelRacketsResearchConfig,
  ];
}
