export interface ReviewComparisonColumn {
  key: string;
  label: string;
  /** Spec key on Product, or "score" / "bestFor" */
  source: "score" | "spec" | "breakdown" | "bestFor";
  specKey?: string;
  breakdownKey?: string;
}

export interface ReviewPageCategoryConfig {
  categoryId: string;
  /** Allowed score-breakdown keys for this category */
  scoreCriteriaKeys: string[];
  /**
   * Preferred hero / gauge criteria order (subset of scoreCriteriaKeys).
   * Display labels come from ScoreBreakdownItem.label.
   */
  heroCriteriaKeys: string[];
  /** Preferred section ids / headings order for TOC */
  defaultSectionKeys: string[];
  /** At-a-glance card field keys */
  glanceKeys: string[];
  keySpecKeys: string[];
  comparisonColumns: ReviewComparisonColumn[];
  recommendedEvidenceTypes: string[];
  /** Optional editorial background behind product cutout */
  heroAtmosphereSrc?: string;
}

export const runningShoesReviewPageConfig: ReviewPageCategoryConfig = {
  categoryId: "cat-running-shoes",
  scoreCriteriaKeys: [
    "fit",
    "comfort",
    "ride",
    "cushioning",
    "stability",
    "responsiveness",
    "grip",
    "durability",
    "versatility",
    "value",
  ],
  heroCriteriaKeys: [
    "cushioning",
    "ride",
    "comfort",
    "stability",
    "durability",
    "value",
  ],
  defaultSectionKeys: [
    "ride",
    "upper",
    "outsole",
    "durability",
    "value",
  ],
  glanceKeys: [
    "weight",
    "drop",
    "heelStack",
    "forefootStack",
    "terrain",
    "stability",
    "widthOptions",
  ],
  keySpecKeys: [
    "weight",
    "drop",
    "heelStack",
    "cushionLevel",
    "stability",
    "terrain",
  ],
  comparisonColumns: [
    { key: "score", label: "Score", source: "score" },
    {
      key: "cushion",
      label: "Cushioning",
      source: "breakdown",
      breakdownKey: "cushioning",
    },
    { key: "ride", label: "Ride", source: "breakdown", breakdownKey: "ride" },
    {
      key: "stability",
      label: "Stability",
      source: "breakdown",
      breakdownKey: "stability",
    },
    { key: "weight", label: "Weight", source: "spec", specKey: "weight" },
    { key: "bestFor", label: "Best for", source: "bestFor" },
  ],
  recommendedEvidenceTypes: [
    "manufacturer",
    "independent-review",
    "editorial-research",
    "user-feedback",
    "personal-test",
    "lab-test",
  ],
  heroAtmosphereSrc: "/images/brands/heroes/running-urban.jpg",
};

export const gpsWatchReviewPageConfig: ReviewPageCategoryConfig = {
  categoryId: "cat-gps-watches",
  scoreCriteriaKeys: [
    "gps-accuracy",
    "battery",
    "maps",
    "training-features",
    "recovery-features",
    "interface",
    "smartwatch-features",
    "value",
  ],
  heroCriteriaKeys: [
    "gps-accuracy",
    "battery",
    "training-features",
    "maps",
    "recovery-features",
    "value",
  ],
  defaultSectionKeys: [
    "gps",
    "battery",
    "training",
    "recovery",
    "interface",
    "value",
  ],
  glanceKeys: [
    "weight",
    "batteryGps",
    "batterySmartwatch",
    "multiBandGps",
    "maps",
    "displayType",
  ],
  keySpecKeys: [
    "weight",
    "batteryGps",
    "batterySmartwatch",
    "multiBandGps",
    "maps",
    "displayType",
  ],
  comparisonColumns: [
    { key: "score", label: "Score", source: "score" },
    {
      key: "battery",
      label: "Battery",
      source: "breakdown",
      breakdownKey: "battery",
    },
    {
      key: "gps",
      label: "GPS",
      source: "breakdown",
      breakdownKey: "gps-accuracy",
    },
    { key: "maps", label: "Maps", source: "breakdown", breakdownKey: "maps" },
    {
      key: "training",
      label: "Training",
      source: "breakdown",
      breakdownKey: "training-features",
    },
    { key: "bestFor", label: "Best for", source: "bestFor" },
  ],
  recommendedEvidenceTypes: [
    "manufacturer",
    "independent-review",
    "editorial-research",
    "lab-test",
    "personal-test",
  ],
};

export const padelRacketReviewPageConfig: ReviewPageCategoryConfig = {
  categoryId: "cat-padel-rackets",
  scoreCriteriaKeys: [
    "power",
    "control",
    "forgiveness",
    "maneuverability",
    "comfort",
    "stability",
    "spin",
    "value",
  ],
  heroCriteriaKeys: [
    "power",
    "control",
    "forgiveness",
    "maneuverability",
    "comfort",
    "value",
  ],
  defaultSectionKeys: [
    "overview",
    "usecase",
    "tradeoffs",
    "construction",
    "shape",
    "power",
    "control",
    "sweetspot",
    "maneuverability",
    "comfort",
    "spin",
    "defense",
    "net",
    "attack",
    "serve",
    "strengths",
    "weaknesses",
    "bestFor",
    "notIdeal",
    "alternatives",
    "comparisons",
    "specs",
    "value",
    "methodology",
    "sources",
  ],
  glanceKeys: [
    "shape",
    "weightMin",
    "balance",
    "core",
    "face",
    "feel",
  ],
  keySpecKeys: [
    "shape",
    "balance",
    "weightMin",
    "weightMax",
    "thicknessMm",
    "core",
    "face",
  ],
  comparisonColumns: [
    { key: "score", label: "Score", source: "score" },
    { key: "shape", label: "Shape", source: "spec", specKey: "shape" },
    { key: "weight", label: "Weight", source: "spec", specKey: "weightMin" },
    { key: "balance", label: "Balance", source: "spec", specKey: "balance" },
    { key: "bestFor", label: "Best for", source: "bestFor" },
  ],
  recommendedEvidenceTypes: [
    "manufacturer",
    "editorial-research",
    "independent-review",
  ],
};

export const padelShoeReviewPageConfig: ReviewPageCategoryConfig = {
  categoryId: "cat-padel-shoes",
  scoreCriteriaKeys: [
    "stability",
    "grip",
    "comfort",
    "durability",
    "fit",
    "cushioning",
    "value",
  ],
  heroCriteriaKeys: [
    "stability",
    "grip",
    "comfort",
    "durability",
    "value",
  ],
  defaultSectionKeys: [
    "overview",
    "specs",
    "traction",
    "stability",
    "courtFeel",
    "cushioning",
    "support",
    "fit",
    "durability",
    "comfort",
    "strengths",
    "tradeoffs",
    "usecase",
    "value",
    "methodology",
    "sources",
  ],
  glanceKeys: [
    "outsole",
    "courtOutsole",
    "cushioning",
    "support",
    "genderFit",
  ],
  keySpecKeys: [
    "outsole",
    "courtOutsole",
    "tractionPattern",
    "lateralStability",
    "courtFeel",
    "cushioning",
    "support",
  ],
  comparisonColumns: [
    { key: "score", label: "Score", source: "score" },
    { key: "outsole", label: "Outsole", source: "spec", specKey: "outsole" },
    { key: "support", label: "Support", source: "spec", specKey: "support" },
    { key: "bestFor", label: "Best for", source: "bestFor" },
  ],
  recommendedEvidenceTypes: [
    "manufacturer",
    "editorial-research",
    "independent-review",
  ],
};

const BY_CATEGORY: Record<string, ReviewPageCategoryConfig> = {
  [runningShoesReviewPageConfig.categoryId]: runningShoesReviewPageConfig,
  [gpsWatchReviewPageConfig.categoryId]: gpsWatchReviewPageConfig,
  [padelRacketReviewPageConfig.categoryId]: padelRacketReviewPageConfig,
  [padelShoeReviewPageConfig.categoryId]: padelShoeReviewPageConfig,
};

export function getReviewPageCategoryConfig(
  categoryId: string,
): ReviewPageCategoryConfig {
  return (
    BY_CATEGORY[categoryId] ?? {
      categoryId,
      scoreCriteriaKeys: [],
      heroCriteriaKeys: [],
      defaultSectionKeys: [],
      glanceKeys: [],
      keySpecKeys: [],
      comparisonColumns: [
        { key: "score", label: "Score", source: "score" },
        { key: "bestFor", label: "Best for", source: "bestFor" },
      ],
      recommendedEvidenceTypes: [
        "manufacturer",
        "editorial-research",
        "independent-review",
      ],
    }
  );
}
