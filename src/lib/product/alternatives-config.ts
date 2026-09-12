import type { EntityId } from "@/domain/shared/types";
import type { ProductRelationshipType } from "@/domain/relationships/types";

export interface AlternativesReasonConfig {
  id: string;
  /** Relationship types that map into this quick-reason / filter tab */
  types: ProductRelationshipType[];
  /** Short card title */
  title: string;
  /** Filter tab label */
  tabLabel: string;
  /** Badge label (uppercase display) */
  badgeLabel: string;
  /** One-line card explanation */
  description: string;
  /** Lucide icon name key resolved in UI */
  icon:
    | "cloud"
    | "scale"
    | "zap"
    | "shield"
    | "tag"
    | "clock"
    | "feather"
    | "battery"
    | "map"
    | "minimize"
    | "sparkles"
    | "target"
    | "flame"
    | "box";
}

export interface AlternativesComparisonColumn {
  id: string;
  label: string;
  /** Spec key, score, bestFor, or price */
  kind: "spec" | "score" | "bestFor" | "price" | "name";
  specKey?: string;
}

export interface AlternativesPageConfig {
  categoryId: EntityId;
  reasons: AlternativesReasonConfig[];
  comparisonColumns: AlternativesComparisonColumn[];
  heroImageSrc?: string;
  finderToolSlug?: string;
  finderCtaLabel?: string;
  productNounSingular: string;
  productNounPlural: string;
  trustIndicators: { title: string; description: string }[];
}

const RUNNING_TRUST = [
  {
    title: "Expert & Independent",
    description: "Structured advice — we don’t sell the gear.",
  },
  {
    title: "Data Driven",
    description: "Specs, relationships and recommendations drive picks.",
  },
  {
    title: "Evidence-backed Research",
    description: "Claims tied to manufacturer specs and editorial evidence.",
  },
  {
    title: "Always Up to Date",
    description: "Products and relationships reviewed on a schedule.",
  },
] as const;

export const runningShoesAlternativesConfig: AlternativesPageConfig = {
  categoryId: "cat-running-shoes",
  productNounSingular: "shoe",
  productNounPlural: "shoes",
  heroImageSrc: "/images/home/guide-running-shoes.jpg",
  finderToolSlug: "running-shoe-finder",
  finderCtaLabel: "Find my running shoes →",
  trustIndicators: [...RUNNING_TRUST],
  reasons: [
    {
      id: "more-cushioned",
      types: ["more-cushioned"],
      title: "More Cushioning",
      tabLabel: "Cushioning",
      badgeLabel: "More Cushioning",
      description: "Softer or taller stack for easy and recovery miles.",
      icon: "cloud",
    },
    {
      id: "more-stable",
      types: ["more-stable"],
      title: "More Stability",
      tabLabel: "Stability",
      badgeLabel: "More Stability",
      description: "Support-focused platforms when you need more guidance.",
      icon: "scale",
    },
    {
      id: "more-responsive",
      types: ["more-responsive", "faster", "race-focused-alternative"],
      title: "Faster / More Responsive",
      tabLabel: "Speed",
      badgeLabel: "Faster / More Responsive",
      description: "Quicker geometry for tempo, intervals and race effort.",
      icon: "zap",
    },
    {
      id: "more-durable",
      types: ["more-durable"],
      title: "More Durable",
      tabLabel: "Durability",
      badgeLabel: "More Durable",
      description: "Built for higher weekly mileage and longer wear.",
      icon: "shield",
    },
    {
      id: "better-value",
      types: ["better-value", "cheaper-alternative", "cheaper"],
      title: "Better Value",
      tabLabel: "Value",
      badgeLabel: "Better Value",
      description: "Similar role at a stronger price positioning.",
      icon: "tag",
    },
    {
      id: "similar",
      types: ["similar", "direct-competitor"],
      title: "Same-role Peer",
      tabLabel: "Similar",
      badgeLabel: "Same-role Peer",
      description: "Closest peers when the job stays the same but brand or feel differs.",
      icon: "sparkles",
    },
    {
      id: "previous-generation",
      types: ["previous-generation"],
      title: "Previous Generation",
      tabLabel: "Previous Gen",
      badgeLabel: "Previous Generation",
      description: "Same family experience, often at a lower street price.",
      icon: "clock",
    },
  ],
  comparisonColumns: [
    { id: "name", label: "Shoe", kind: "name" },
    { id: "cushion", label: "Cushioning", kind: "spec", specKey: "cushionLevel" },
    {
      id: "response",
      label: "Responsiveness",
      kind: "spec",
      specKey: "energyReturn",
    },
    { id: "stability", label: "Stability", kind: "spec", specKey: "stability" },
    { id: "durability", label: "Durability", kind: "spec", specKey: "durability" },
    { id: "weight", label: "Weight (M)", kind: "spec", specKey: "weight" },
    { id: "drop", label: "Drop", kind: "spec", specKey: "drop" },
    { id: "widths", label: "Widths", kind: "spec", specKey: "widthOptions" },
    { id: "score", label: "Score", kind: "score" },
    { id: "bestFor", label: "Best for", kind: "bestFor" },
  ],
};

export const gpsWatchAlternativesConfig: AlternativesPageConfig = {
  categoryId: "cat-gps-watches",
  productNounSingular: "watch",
  productNounPlural: "watches",
  heroImageSrc: "/images/running/best-hub/best-gps-watches-running.jpg",
  finderToolSlug: "fitness-watch-finder",
  finderCtaLabel: "Find my watch →",
  trustIndicators: [...RUNNING_TRUST],
  reasons: [
    {
      id: "longer-battery",
      types: ["more-versatile"],
      title: "Longer Battery",
      tabLabel: "Battery",
      badgeLabel: "Longer Battery",
      description: "More GPS hours for long adventures.",
      icon: "battery",
    },
    {
      id: "better-maps",
      types: ["premium-alternative", "premium"],
      title: "Better Maps",
      tabLabel: "Maps",
      badgeLabel: "Better Maps",
      description: "Richer mapping and navigation tools.",
      icon: "map",
    },
    {
      id: "smaller",
      types: ["lighter-alternative", "lighter"],
      title: "Smaller",
      tabLabel: "Size",
      badgeLabel: "Smaller Case",
      description: "Lighter or more compact on the wrist.",
      icon: "minimize",
    },
    {
      id: "better-value",
      types: ["better-value", "cheaper-alternative", "cheaper"],
      title: "More Affordable",
      tabLabel: "Value",
      badgeLabel: "Better Value",
      description: "Strong training tools without the top-tier price.",
      icon: "tag",
    },
    {
      id: "premium",
      types: ["premium-alternative", "premium"],
      title: "Premium Upgrade",
      tabLabel: "Premium",
      badgeLabel: "Premium",
      description: "Flagship sensors, maps and materials.",
      icon: "sparkles",
    },
    {
      id: "previous-generation",
      types: ["previous-generation"],
      title: "Previous Generation",
      tabLabel: "Previous Gen",
      badgeLabel: "Previous Generation",
      description: "Prior model when the core experience is enough.",
      icon: "clock",
    },
  ],
  comparisonColumns: [
    { id: "name", label: "Watch", kind: "name" },
    { id: "battery", label: "Battery", kind: "spec", specKey: "batteryGps" },
    { id: "gps", label: "GPS", kind: "spec", specKey: "multiBandGps" },
    { id: "maps", label: "Maps", kind: "spec", specKey: "maps" },
    { id: "weight", label: "Weight", kind: "spec", specKey: "weight" },
    { id: "score", label: "Score", kind: "score" },
    { id: "bestFor", label: "Best for", kind: "bestFor" },
    { id: "price", label: "From", kind: "price" },
  ],
};

export const padelAlternativesConfig: AlternativesPageConfig = {
  categoryId: "cat-padel-rackets",
  productNounSingular: "racket",
  productNounPlural: "rackets",
  heroImageSrc: "/images/padel/hero.jpg",
  finderToolSlug: "padel-racket-finder",
  finderCtaLabel: "Find my padel racket →",
  trustIndicators: [...RUNNING_TRUST],
  reasons: [
    {
      id: "more-control",
      types: ["more-stable", "beginner-friendly"],
      title: "More Control",
      tabLabel: "Control",
      badgeLabel: "More Control",
      description: "Rounder sweet spots and softer faces for placement.",
      icon: "target",
    },
    {
      id: "more-power",
      types: ["more-responsive", "faster", "premium-alternative"],
      title: "More Power",
      tabLabel: "Power",
      badgeLabel: "More Power",
      description: "Diamond shapes and stiffer constructions for attack.",
      icon: "flame",
    },
    {
      id: "more-maneuverable",
      types: ["lighter-alternative", "lighter"],
      title: "More Maneuverable",
      tabLabel: "Maneuverable",
      badgeLabel: "More Maneuverable",
      description: "Lighter frames for quick hands at net.",
      icon: "feather",
    },
    {
      id: "better-value",
      types: ["better-value", "cheaper-alternative", "cheaper"],
      title: "Better Value",
      tabLabel: "Value",
      badgeLabel: "Better Value",
      description: "Strong performance without flagship pricing.",
      icon: "tag",
    },
    {
      id: "previous-generation",
      types: ["previous-generation"],
      title: "Previous Generation",
      tabLabel: "Previous Gen",
      badgeLabel: "Previous Generation",
      description: "Prior model with a similar playing profile.",
      icon: "clock",
    },
  ],
  comparisonColumns: [
    { id: "name", label: "Racket", kind: "name" },
    { id: "shape", label: "Shape", kind: "spec", specKey: "shape" },
    { id: "weight", label: "Weight", kind: "spec", specKey: "weight" },
    { id: "balance", label: "Balance", kind: "spec", specKey: "balance" },
    { id: "score", label: "Score", kind: "score" },
    { id: "bestFor", label: "Best for", kind: "bestFor" },
    { id: "price", label: "From", kind: "price" },
  ],
};

export const hrmAlternativesConfig: AlternativesPageConfig = {
  categoryId: "cat-hrm",
  productNounSingular: "heart rate monitor",
  productNounPlural: "heart rate monitors",
  finderToolSlug: "fitness-watch-finder",
  finderCtaLabel: "Find my training tools →",
  trustIndicators: [...RUNNING_TRUST],
  reasons: [
    {
      id: "accuracy",
      types: ["premium-alternative", "premium", "more-versatile"],
      title: "More Accurate / Capable",
      tabLabel: "Accuracy",
      badgeLabel: "More Capable",
      description: "Chest-strap accuracy or richer sensor suites.",
      icon: "target",
    },
    {
      id: "comfort",
      types: ["lighter-alternative", "lighter", "beginner-friendly"],
      title: "More Comfortable",
      tabLabel: "Comfort",
      badgeLabel: "More Comfortable",
      description: "Armbands and softer straps for long sessions.",
      icon: "feather",
    },
    {
      id: "better-value",
      types: ["better-value", "cheaper-alternative", "cheaper"],
      title: "Better Value",
      tabLabel: "Value",
      badgeLabel: "Better Value",
      description: "Reliable HR without flagship pricing.",
      icon: "tag",
    },
    {
      id: "ecosystem",
      types: ["similar", "direct-competitor"],
      title: "Ecosystem Fit",
      tabLabel: "Ecosystem",
      badgeLabel: "Ecosystem Peer",
      description: "Peers that fit the same watch / app stack.",
      icon: "sparkles",
    },
    {
      id: "previous-generation",
      types: ["previous-generation"],
      title: "Previous Generation",
      tabLabel: "Previous Gen",
      badgeLabel: "Previous Generation",
      description: "Prior model when the core HR job is enough.",
      icon: "clock",
    },
  ],
  comparisonColumns: [
    { id: "name", label: "Monitor", kind: "name" },
    { id: "battery", label: "Battery", kind: "spec", specKey: "batteryLife" },
    { id: "score", label: "Score", kind: "score" },
    { id: "bestFor", label: "Best for", kind: "bestFor" },
    { id: "price", label: "From", kind: "price" },
  ],
};

export const tennisRacketAlternativesConfig: AlternativesPageConfig = {
  categoryId: "cat-tennis-rackets",
  productNounSingular: "racket",
  productNounPlural: "rackets",
  finderToolSlug: "tennis-racket-finder",
  finderCtaLabel: "Find my tennis racket →",
  trustIndicators: [...RUNNING_TRUST],
  reasons: [
    {
      id: "more-power",
      types: ["more-responsive", "faster", "premium-alternative"],
      title: "More Power",
      tabLabel: "Power",
      badgeLabel: "More Power",
      description: "Livelier frames when you need free depth.",
      icon: "flame",
    },
    {
      id: "more-control",
      types: ["more-stable", "beginner-friendly"],
      title: "More Control",
      tabLabel: "Control",
      badgeLabel: "More Control",
      description: "Denser patterns and ploughing stability.",
      icon: "target",
    },
    {
      id: "comfort",
      types: ["more-cushioned", "more-versatile"],
      title: "More Comfort",
      tabLabel: "Comfort",
      badgeLabel: "More Comfort",
      description: "Softer flex when arm comfort is the filter.",
      icon: "cloud",
    },
    {
      id: "better-value",
      types: ["better-value", "cheaper-alternative", "cheaper"],
      title: "Better Value",
      tabLabel: "Value",
      badgeLabel: "Better Value",
      description: "Strong playability without flagship street price.",
      icon: "tag",
    },
    {
      id: "previous-generation",
      types: ["previous-generation"],
      title: "Previous Generation",
      tabLabel: "Previous Gen",
      badgeLabel: "Previous Generation",
      description: "Prior generation with a similar playing profile.",
      icon: "clock",
    },
  ],
  comparisonColumns: [
    { id: "name", label: "Racket", kind: "name" },
    { id: "weight", label: "Weight", kind: "spec", specKey: "weight" },
    { id: "head", label: "Head size", kind: "spec", specKey: "headSize" },
    { id: "score", label: "Score", kind: "score" },
    { id: "bestFor", label: "Best for", kind: "bestFor" },
    { id: "price", label: "From", kind: "price" },
  ],
};

export const clothingAlternativesConfig: AlternativesPageConfig = {
  categoryId: "cat-running-clothing",
  productNounSingular: "piece",
  productNounPlural: "pieces",
  trustIndicators: [...RUNNING_TRUST],
  reasons: [
    {
      id: "lighter",
      types: ["lighter-alternative", "lighter"],
      title: "Lighter",
      tabLabel: "Lighter",
      badgeLabel: "Lighter",
      description: "Lower pack weight for racing or hot weather.",
      icon: "feather",
    },
    {
      id: "weather",
      types: ["more-durable", "premium-alternative", "premium"],
      title: "More Weather Protection",
      tabLabel: "Weather",
      badgeLabel: "More Protected",
      description: "Stronger shells and coverage when conditions turn.",
      icon: "shield",
    },
    {
      id: "better-value",
      types: ["better-value", "cheaper-alternative", "cheaper"],
      title: "Better Value",
      tabLabel: "Value",
      badgeLabel: "Better Value",
      description: "Similar role without premium apparel pricing.",
      icon: "tag",
    },
    {
      id: "similar",
      types: ["similar", "direct-competitor"],
      title: "Similar Fit / Role",
      tabLabel: "Similar",
      badgeLabel: "Similar",
      description: "Closest peers for the same session type.",
      icon: "sparkles",
    },
  ],
  comparisonColumns: [
    { id: "name", label: "Item", kind: "name" },
    { id: "score", label: "Score", kind: "score" },
    { id: "bestFor", label: "Best for", kind: "bestFor" },
    { id: "price", label: "From", kind: "price" },
  ],
};

export const hydrationAlternativesConfig: AlternativesPageConfig = {
  categoryId: "cat-hydration",
  productNounSingular: "hydration option",
  productNounPlural: "hydration options",
  trustIndicators: [...RUNNING_TRUST],
  reasons: [
    {
      id: "capacity",
      types: ["more-versatile", "premium-alternative", "long-run-alternative"],
      title: "More Capacity",
      tabLabel: "Capacity",
      badgeLabel: "More Capacity",
      description: "Bigger flasks or vest volume for long efforts.",
      icon: "box",
    },
    {
      id: "lighter",
      types: ["lighter-alternative", "lighter"],
      title: "Lighter / Minimal",
      tabLabel: "Lighter",
      badgeLabel: "Lighter",
      description: "Belt and flask setups when bounce and weight matter.",
      icon: "feather",
    },
    {
      id: "better-value",
      types: ["better-value", "cheaper-alternative", "cheaper"],
      title: "Better Value",
      tabLabel: "Value",
      badgeLabel: "Better Value",
      description: "Similar carry at a stronger price.",
      icon: "tag",
    },
    {
      id: "similar",
      types: ["similar", "direct-competitor"],
      title: "Similar Carry",
      tabLabel: "Similar",
      badgeLabel: "Similar",
      description: "Peers in the same carry style.",
      icon: "sparkles",
    },
  ],
  comparisonColumns: [
    { id: "name", label: "Product", kind: "name" },
    { id: "capacity", label: "Capacity", kind: "spec", specKey: "capacity" },
    { id: "score", label: "Score", kind: "score" },
    { id: "bestFor", label: "Best for", kind: "bestFor" },
    { id: "price", label: "From", kind: "price" },
  ],
};

/** Shared fitness equipment defaults (rowers, bikes, racks, etc.) */
export const fitnessEquipmentAlternativesConfig: AlternativesPageConfig = {
  categoryId: "cat-rowing-machines",
  productNounSingular: "machine",
  productNounPlural: "machines",
  trustIndicators: [...RUNNING_TRUST],
  reasons: [
    {
      id: "metrics",
      types: ["premium-alternative", "premium", "more-versatile"],
      title: "Better Metrics / Ecosystem",
      tabLabel: "Metrics",
      badgeLabel: "Better Metrics",
      description: "Standardised scores and community-comparable data.",
      icon: "sparkles",
    },
    {
      id: "quiet",
      types: ["beginner-friendly", "lighter-alternative"],
      title: "Quieter / Home-Friendly",
      tabLabel: "Quiet",
      badgeLabel: "Quieter",
      description: "Magnetic / lower-noise options for shared living spaces.",
      icon: "minimize",
    },
    {
      id: "better-value",
      types: ["better-value", "cheaper-alternative", "cheaper"],
      title: "Better Value",
      tabLabel: "Value",
      badgeLabel: "Better Value",
      description: "Capable training stimulus without flagship pricing.",
      icon: "tag",
    },
    {
      id: "similar",
      types: ["similar", "direct-competitor"],
      title: "Similar Role",
      tabLabel: "Similar",
      badgeLabel: "Similar",
      description: "Closest peers for the same conditioning job.",
      icon: "sparkles",
    },
  ],
  comparisonColumns: [
    { id: "name", label: "Machine", kind: "name" },
    { id: "score", label: "Score", kind: "score" },
    { id: "bestFor", label: "Best for", kind: "bestFor" },
    { id: "price", label: "From", kind: "price" },
  ],
};

const CONFIGS: AlternativesPageConfig[] = [
  runningShoesAlternativesConfig,
  gpsWatchAlternativesConfig,
  padelAlternativesConfig,
  hrmAlternativesConfig,
  tennisRacketAlternativesConfig,
  clothingAlternativesConfig,
  hydrationAlternativesConfig,
  fitnessEquipmentAlternativesConfig,
];

const DEFAULT_CONFIG: AlternativesPageConfig = {
  categoryId: "cat-default",
  productNounSingular: "product",
  productNounPlural: "products",
  trustIndicators: [...RUNNING_TRUST],
  reasons: [
    {
      id: "similar",
      types: ["similar", "direct-competitor"],
      title: "Similar Options",
      tabLabel: "Similar",
      badgeLabel: "Similar",
      description: "Closest peers in the same category role.",
      icon: "sparkles",
    },
    {
      id: "better-value",
      types: ["better-value", "cheaper-alternative", "cheaper"],
      title: "Better Value",
      tabLabel: "Value",
      badgeLabel: "Better Value",
      description: "Similar role at a stronger price positioning.",
      icon: "tag",
    },
    {
      id: "premium",
      types: ["premium-alternative", "premium"],
      title: "Premium Upgrade",
      tabLabel: "Premium",
      badgeLabel: "Premium",
      description: "Higher capability or materials when the budget allows.",
      icon: "sparkles",
    },
    {
      id: "lighter",
      types: ["lighter-alternative", "lighter"],
      title: "Lighter",
      tabLabel: "Lighter",
      badgeLabel: "Lighter",
      description: "Lower weight when carry or speed of use matters.",
      icon: "feather",
    },
    {
      id: "previous-generation",
      types: ["previous-generation"],
      title: "Previous Generation",
      tabLabel: "Previous Gen",
      badgeLabel: "Previous Generation",
      description: "Prior generation when the core experience is enough.",
      icon: "clock",
    },
  ],
  comparisonColumns: [
    { id: "name", label: "Product", kind: "name" },
    { id: "score", label: "Score", kind: "score" },
    { id: "bestFor", label: "Best for", kind: "bestFor" },
    { id: "price", label: "From", kind: "price" },
  ],
};

const FITNESS_CATEGORY_IDS = new Set([
  "cat-rowing-machines",
  "cat-air-bikes",
  "cat-treadmills",
  "cat-ski-ergs",
  "cat-power-racks",
  "cat-adjustable-dumbbells",
  "cat-weight-benches",
  "cat-barbells",
  "cat-kettlebells",
  "cat-functional-fitness",
  "cat-weighted-vests",
]);

const HYDRATION_LIKE_IDS = new Set([
  "cat-hydration",
  "cat-packs-vests",
  "cat-running-belts",
]);

export function getAlternativesPageConfig(
  categoryId: string | undefined,
): AlternativesPageConfig {
  if (!categoryId) return DEFAULT_CONFIG;
  if (FITNESS_CATEGORY_IDS.has(categoryId)) {
    return { ...fitnessEquipmentAlternativesConfig, categoryId };
  }
  if (HYDRATION_LIKE_IDS.has(categoryId)) {
    return { ...hydrationAlternativesConfig, categoryId };
  }
  if (categoryId === "cat-running-socks") {
    return { ...clothingAlternativesConfig, categoryId };
  }
  return CONFIGS.find((c) => c.categoryId === categoryId) ?? DEFAULT_CONFIG;
}

export function reasonConfigForType(
  config: AlternativesPageConfig,
  type: ProductRelationshipType,
): AlternativesReasonConfig | undefined {
  return config.reasons.find((r) => r.types.includes(type));
}
