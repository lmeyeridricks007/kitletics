import type { BestGuide } from "@/domain/editorial/types";
import type {
  BestGuideBuyingHelpLink,
  BestGuideTableColumn,
} from "@/lib/best/category-config";

export interface UseCaseCriteriaPoint {
  label: string;
  explanation: string;
}

export interface UseCaseGuideConfig {
  /** Section title for quick picks, e.g. "Top picks for heavier runners" */
  quickPicksTitle: string;
  comparisonTitle: string;
  comparisonFootnote: string;
  methodologyTitle: string;
  buyingHelpTitle: string;
  heroImageSrc?: string;
  tableColumns?: BestGuideTableColumn[];
  buyingHelpLinks?: BestGuideBuyingHelpLink[];
  /** Safe Finder share responses — never include body weight */
  finderPrefill?: Record<string, string | string[]>;
}

const HEAVY_TABLE_COLUMNS: BestGuideTableColumn[] = [
  { key: "bestFor", label: "Best for", source: "bestFor" },
  {
    key: "cushioning",
    label: "Cushioning",
    source: "breakdown",
    breakdownKey: "cushioning",
    factorKeys: ["cushion", "cushioning", "protection"],
  },
  {
    key: "stability",
    label: "Stability",
    source: "breakdown",
    breakdownKey: "stability",
    factorKeys: ["stability"],
  },
  {
    key: "durability",
    label: "Durability",
    source: "breakdown",
    breakdownKey: "durability",
    factorKeys: ["durability"],
  },
  {
    key: "fit",
    label: "Upper Comfort",
    source: "breakdown",
    breakdownKey: "fit",
    factorKeys: ["fit", "comfort"],
  },
  { key: "weight", label: "Weight (M)", source: "spec", specKey: "weight" },
  { key: "drop", label: "Drop", source: "spec", specKey: "drop" },
  {
    key: "widths",
    label: "Widths",
    source: "spec",
    specKey: "widthOptions",
  },
  { key: "score", label: "Score", source: "score" },
  { key: "price", label: "Price", source: "price" },
];

const WIDE_TABLE_COLUMNS: BestGuideTableColumn[] = [
  { key: "bestFor", label: "Best for", source: "bestFor" },
  {
    key: "widths",
    label: "Official widths",
    source: "spec",
    specKey: "widthOptions",
  },
  {
    key: "fit",
    label: "Fit",
    source: "breakdown",
    breakdownKey: "fit",
    factorKeys: ["fit", "widths", "comfort"],
  },
  {
    key: "cushioning",
    label: "Cushioning",
    source: "breakdown",
    breakdownKey: "cushioning",
    factorKeys: ["cushion", "cushioning"],
  },
  {
    key: "stability",
    label: "Stability",
    source: "breakdown",
    breakdownKey: "stability",
    factorKeys: ["stability"],
  },
  { key: "weight", label: "Weight (M)", source: "spec", specKey: "weight" },
  { key: "score", label: "Score", source: "score" },
  { key: "price", label: "Price", source: "price" },
];

const MARATHON_TABLE_COLUMNS: BestGuideTableColumn[] = [
  { key: "bestFor", label: "Best for", source: "bestFor" },
  {
    key: "cushioning",
    label: "Cushioning",
    source: "breakdown",
    breakdownKey: "cushioning",
    factorKeys: ["cushion", "cushioning"],
  },
  {
    key: "ride",
    label: "Ride",
    source: "breakdown",
    breakdownKey: "ride",
    factorKeys: ["ride", "responsiveness", "energy"],
  },
  {
    key: "durability",
    label: "Durability",
    source: "breakdown",
    breakdownKey: "durability",
    factorKeys: ["durability"],
  },
  { key: "weight", label: "Weight (M)", source: "spec", specKey: "weight" },
  { key: "drop", label: "Drop", source: "spec", specKey: "drop" },
  { key: "plate", label: "Plate", source: "spec", specKey: "plate" },
  { key: "score", label: "Score", source: "score" },
  { key: "price", label: "Price", source: "price" },
];

const TEMPO_TABLE_COLUMNS: BestGuideTableColumn[] = [
  { key: "bestFor", label: "Best for", source: "bestFor" },
  {
    key: "ride",
    label: "Ride",
    source: "breakdown",
    breakdownKey: "ride",
    factorKeys: ["ride", "responsiveness", "energy"],
  },
  {
    key: "cushioning",
    label: "Cushioning",
    source: "breakdown",
    breakdownKey: "cushioning",
    factorKeys: ["cushion", "cushioning"],
  },
  { key: "weight", label: "Weight (M)", source: "spec", specKey: "weight" },
  { key: "drop", label: "Drop", source: "spec", specKey: "drop" },
  { key: "plate", label: "Plate", source: "spec", specKey: "plate" },
  { key: "score", label: "Score", source: "score" },
  { key: "price", label: "Price", source: "price" },
];

const PADEL_RACKET_USE_TABLE: BestGuideTableColumn[] = [
  { key: "bestFor", label: "Best for", source: "bestFor" },
  { key: "shape", label: "Shape", source: "spec", specKey: "shape" },
  { key: "balance", label: "Balance", source: "spec", specKey: "balance" },
  { key: "weight", label: "Weight", source: "spec", specKey: "weightMin" },
  { key: "score", label: "Score", source: "score" },
  { key: "price", label: "Price", source: "price" },
];

const PADEL_SHOE_USE_TABLE: BestGuideTableColumn[] = [
  { key: "bestFor", label: "Best for", source: "bestFor" },
  { key: "gender", label: "Last", source: "spec", specKey: "genderFit" },
  {
    key: "lateral",
    label: "Lateral",
    source: "spec",
    specKey: "lateralStability",
  },
  { key: "cushion", label: "Cushioning", source: "spec", specKey: "cushioning" },
  { key: "score", label: "Score", source: "score" },
  { key: "price", label: "Price", source: "price" },
];

function padelRacketUse(
  quickPicksTitle: string,
  buyingHelpTitle: string,
  heroImageSrc: string,
): UseCaseGuideConfig {
  return {
    quickPicksTitle,
    comparisonTitle: "How they compare",
    comparisonFootnote:
      "Scores are Kitletics Product scores. This page awards the job in the title — not a global ranking.",
    methodologyTitle: "How we research & score",
    buyingHelpTitle,
    heroImageSrc,
    tableColumns: PADEL_RACKET_USE_TABLE,
    buyingHelpLinks: [
      {
        label: "How to choose a padel racket",
        href: "/guides/how-to-choose-a-padel-racket",
      },
    ],
  };
}

function padelShoeUse(
  quickPicksTitle: string,
  buyingHelpTitle: string,
  heroImageSrc: string,
): UseCaseGuideConfig {
  return {
    quickPicksTitle,
    comparisonTitle: "How they compare",
    comparisonFootnote:
      "Scores are Kitletics Product scores. Last, outsole, and lateral listing matter more than a running-shoe score.",
    methodologyTitle: "How we research & score",
    buyingHelpTitle,
    heroImageSrc,
    tableColumns: PADEL_SHOE_USE_TABLE,
    buyingHelpLinks: [
      {
        label: "How to choose padel shoes",
        href: "/guides/how-to-choose-padel-shoes",
      },
    ],
  };
}

const BY_GUIDE_ID: Record<string, UseCaseGuideConfig> = {
  "best-running-shoes-heavy": {
    quickPicksTitle: "Top picks for heavier runners",
    comparisonTitle: "How they compare",
    comparisonFootnote:
      "Scores are Kitletics Product scores; this guide additionally weights cushioning, platform stability, durability and fit for higher-load training preferences.",
    methodologyTitle: "How we research & score",
    buyingHelpTitle: "How to choose the right shoe",
    heroImageSrc: "/images/running/products/nimbus-27-hero.jpg",
    tableColumns: HEAVY_TABLE_COLUMNS,
    buyingHelpLinks: [
      {
        label: "Understand cushioning & stack height",
        href: "/guides/running-shoe-cushioning",
      },
      {
        label: "Stability vs neutral shoes",
        href: "/guides/how-to-choose-running-shoes",
      },
      {
        label: "Drop and its trade-offs",
        href: "/guides/running-shoe-drop",
      },
      {
        label: "Wide & fit options",
        href: "/best/running-shoes-wide-feet",
      },
    ],
    // Prefer cushioning/durability — never prefill body weight
    finderPrefill: {
      priorities: ["cushioning", "durability", "comfort"],
    },
  },
  "best-running-shoes-wide": {
    quickPicksTitle: "Top picks for wide feet",
    comparisonTitle: "How they compare",
    comparisonFootnote:
      "Scores are Kitletics Product scores; this guide prioritises official width options and fit assessment over race-day speed.",
    methodologyTitle: "How we research & score",
    buyingHelpTitle: "How to choose for wide feet",
    heroImageSrc: "/images/running/best-hub/best-wide-feet-running.jpg",
    tableColumns: WIDE_TABLE_COLUMNS,
    buyingHelpLinks: [
      {
        label: "How to choose running shoes",
        href: "/guides/how-to-choose-running-shoes",
      },
      {
        label: "Running shoe cushioning explained",
        href: "/guides/running-shoe-cushioning",
      },
    ],
    finderPrefill: { width: "wide" },
  },
  "best-running-shoes-beginners": {
    quickPicksTitle: "Top picks for beginners",
    comparisonTitle: "How they compare",
    comparisonFootnote:
      "Scores are Kitletics Product scores; beginner suitability emphasises versatility, predictable fit and daily comfort.",
    methodologyTitle: "How we research & score",
    buyingHelpTitle: "How to choose as a beginner",
    heroImageSrc: "/images/running/best-hub/best-beginners-running.jpg",
    finderPrefill: { experience: "beginner" },
  },
  "best-marathon-shoes": {
    quickPicksTitle: "Top picks for marathon training",
    comparisonTitle: "How they compare",
    comparisonFootnote:
      "Scores are Kitletics Product scores; marathon context weights long-run cushioning, durability and race/training role.",
    methodologyTitle: "How we research & score",
    buyingHelpTitle: "How to choose for marathon",
    heroImageSrc: "/images/running/best-hub/best-marathon-running.jpg",
    tableColumns: MARATHON_TABLE_COLUMNS,
    buyingHelpLinks: [
      {
        label: "Running shoe cushioning explained",
        href: "/guides/running-shoe-cushioning",
      },
      {
        label: "Shoe rotation explained",
        href: "/guides/running-shoe-rotation",
      },
      {
        label: "Best race day shoes",
        href: "/best/race-day-shoes",
      },
    ],
    finderPrefill: {
      primaryUse: "long-runs",
      distances: ["marathon"],
      priorities: ["cushioning", "durability", "comfort"],
    },
  },
  "best-tempo-running-shoes": {
    quickPicksTitle: "Top picks for tempo & workouts",
    comparisonTitle: "How tempo shoes compare",
    comparisonFootnote:
      "Scores are Kitletics Product scores; this guide weights responsiveness at controlled hard paces, workout durability and rotation role over easy-mile softness.",
    methodologyTitle: "How we research tempo shoes",
    buyingHelpTitle: "How to choose a tempo shoe",
    heroImageSrc: "/images/running/category/use-tempo.jpg",
    tableColumns: TEMPO_TABLE_COLUMNS,
    buyingHelpLinks: [
      {
        label: "Plates explained (nylon vs carbon)",
        href: "/guides/carbon-vs-nylon-plates",
      },
      {
        label: "Shoe rotation explained",
        href: "/guides/running-shoe-rotation",
      },
      {
        label: "Best race-day shoes",
        href: "/best/race-shoes",
      },
      {
        label: "How to choose running shoes",
        href: "/guides/how-to-choose-running-shoes",
      },
    ],
    finderPrefill: {
      primaryUse: "tempo",
      priorities: ["responsiveness", "lightweight", "energy-return"],
    },
  },
  "best-padel-rackets-beginners": padelRacketUse(
    "Top picks for beginners",
    "How to choose a first racket",
    "/images/padel/products/bullpadel-indiga-ctr-hero.jpg",
  ),
  "best-padel-rackets-intermediate": padelRacketUse(
    "Top picks for intermediate players",
    "How to choose a step-up racket",
    "/images/padel/products/bullpadel-ionic-light-hero.jpg",
  ),
  "best-padel-rackets-advanced": padelRacketUse(
    "Top picks for advanced players",
    "How to choose an advanced racket",
    "/images/padel/products/bullpadel-vertex-05-hero.png",
  ),
  "best-padel-rackets-control": padelRacketUse(
    "Top picks for control",
    "How to choose for control",
    "/images/padel/products/nox-ml10-pro-cup-2026-hero.jpg",
  ),
  "best-padel-rackets-power": padelRacketUse(
    "Top picks for power",
    "How to choose for power",
    "/images/padel/products/bullpadel-hack-04-hero.png",
  ),
  "best-padel-rackets-all-round": padelRacketUse(
    "Top picks for all-round play",
    "How to choose an all-round racket",
    "/images/padel/products/bullpadel-vertex-05-hybrid-hero.jpg",
  ),
  "best-padel-rackets-lightweight": padelRacketUse(
    "Top picks for lightweight rackets",
    "How to choose by weight band",
    "/images/padel/products/head-one-ultralight-hero.jpg",
  ),
  "best-padel-rackets-comfort": padelRacketUse(
    "Top picks for comfort",
    "How to choose a comfort racket",
    "/images/padel/products/kuikma-pr-comfort-soft-hero.jpg",
  ),
  "best-padel-rackets-maneuverability": padelRacketUse(
    "Top picks for maneuverability",
    "How to choose for handling",
    "/images/padel/products/babolat-air-viper-hero.jpg",
  ),
  "best-padel-rackets-women": padelRacketUse(
    "Top picks for women’s lines",
    "How to choose a women’s-line racket",
    "/images/padel/products/bullpadel-vertex-05-w-hero.jpg",
  ),
  "best-padel-shoes-men": padelShoeUse(
    "Top picks for men’s lasts",
    "How to choose a men’s padel last",
    "/images/padel/products/adidas-courtquick-padel-hero.jpg",
  ),
  "best-padel-shoes-women": padelShoeUse(
    "Top picks for women’s lasts",
    "How to choose a women’s padel last",
    "/images/padel/products/adidas-courtquick-padel-women-hero.jpg",
  ),
  "best-padel-shoes-stability": padelShoeUse(
    "Top picks for lateral stability",
    "How to choose a stable padel shoe",
    "/images/padel/products/joma-t-slam-hero.jpg",
  ),
  "best-padel-shoes-comfort": padelShoeUse(
    "Top picks for court comfort",
    "How to choose a cushioned padel shoe",
    "/images/padel/products/adidas-crazyquick-boost-padel-hero.jpg",
  ),
  "best-padel-overgrips": {
    quickPicksTitle: "Top picks for overgrips",
    comparisonTitle: "How they compare",
    comparisonFootnote:
      "Two jobs: thin tack versus absorption. Not a replacement grip ranking.",
    methodologyTitle: "How we research & score",
    buyingHelpTitle: "How to choose an overgrip",
    heroImageSrc: "/images/padel/guides/grips.jpg",
    buyingHelpLinks: [
      { label: "Grips and overgrips explained", href: "/guides/padel-grips-overgrips-explained" },
    ],
  },
  "best-padel-bags": {
    quickPicksTitle: "Top picks by carry job",
    comparisonTitle: "How they compare",
    comparisonFootnote:
      "Club paletero, tournament volume, and day backpack are different jobs.",
    methodologyTitle: "How we research & score",
    buyingHelpTitle: "How to choose a padel bag",
    heroImageSrc: "/images/padel/products/nox-at10-team-paletero-hero.jpg",
  },
};

export function isUseCaseGuide(guide: BestGuide): boolean {
  if (guide.guideKind === "use-case") return true;
  if (guide.guideKind === "category") return false;
  // Known use-case configs without requiring every guide to set guideKind yet
  return Boolean(BY_GUIDE_ID[guide.id]);
}

export function getUseCaseGuideConfig(
  guide: BestGuide,
): UseCaseGuideConfig | undefined {
  if (!isUseCaseGuide(guide)) return undefined;
  return BY_GUIDE_ID[guide.id];
}

export function resolveCriteriaChangePoints(
  guide: BestGuide,
): UseCaseCriteriaPoint[] {
  if (guide.criteriaChangePoints?.length) {
    return guide.criteriaChangePoints.map((p) => ({
      label: p.label,
      explanation: p.explanation,
    }));
  }
  return (guide.selectionCriteria ?? [])
    .filter((c) => Boolean(c.label))
    .slice(0, 6)
    .map((c) => ({
      label: c.label,
      explanation: c.description,
    }));
}

/** Derive a human section label from the primary use case when config is absent */
export function defaultUseCaseQuickPicksTitle(
  useCaseName: string | undefined,
  productNoun: string,
): string {
  if (useCaseName) {
    return `Top picks for ${useCaseName.toLowerCase()}`;
  }
  return `Top picks — ${productNoun}`;
}
