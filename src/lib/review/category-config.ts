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

const BY_CATEGORY: Record<string, ReviewPageCategoryConfig> = {
  [runningShoesReviewPageConfig.categoryId]: runningShoesReviewPageConfig,
  [gpsWatchReviewPageConfig.categoryId]: gpsWatchReviewPageConfig,
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
