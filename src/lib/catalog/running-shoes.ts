import type { ProductCategoryPageConfig } from "@/lib/catalog/types";
import {
  runningWatchesCategoryConfig,
  runningHydrationCategoryConfig,
  runningPacksCategoryConfig,
  runningClothingCategoryConfig,
  runningNutritionCategoryConfig,
  runningRecoveryCategoryConfig,
  runningHeadphonesCategoryConfig,
  runningHrmCategoryConfig,
  runningBeltsCategoryConfig,
  runningSocksCategoryConfig,
  runningSunglassesCategoryConfig,
  runningLightsCategoryConfig,
  runningSafetyCategoryConfig,
  runningAccessoriesCategoryConfig,
} from "@/lib/catalog/running-category-configs";
import { withRunningDecisionEnrichment } from "@/lib/catalog/running-decisions";

export const runningShoesCategoryConfig: ProductCategoryPageConfig = {
  sportSlug: "running",
  categorySlug: "running-shoes",
  hero: {
    title: "Running Shoes",
    description:
      "Find the right shoes for your run. Compare daily trainers, race shoes, stability shoes and more — or use Kitletics Match to get your perfect recommendation.",
    primaryCta: {
      label: "Find My Running Shoes",
      href: "/tools/running-shoe-finder",
    },
    secondaryCta: {
      label: "Shoe Database",
      href: "/running/shoes/database",
    },
  },
  featuredSubcategoryIds: [
    "sub-daily-trainers",
    "sub-max-cushion",
    "sub-tempo",
    "sub-race",
    "sub-stability",
    "sub-trail",
    "sub-carbon",
    "sub-wide",
  ],
  goalUseCaseIds: [
    "uc-daily-training",
    "uc-easy-runs",
    "uc-long-runs",
    "uc-recovery-runs",
    "uc-tempo-runs",
    "uc-intervals",
    "uc-5k",
    "uc-10k",
    "uc-half",
    "uc-marathon",
    "uc-trail-training",
    "uc-treadmill",
  ],
  runnerUseCaseIds: [
    "uc-beginners",
    "uc-heavy",
    "uc-wide-feet",
    "uc-overpronators",
    "uc-neutral-runners",
    "uc-high-mileage",
    "uc-comfort",
    "uc-pb",
  ],
  runnerUseCaseHrefs: {
    "uc-beginners": "/best/running-shoes",
    // Intentional use-case listing (not only the Best guide) — keeps listing in the graph
    "uc-heavy": "/running/shoes/heavy-runners",
    "uc-wide-feet": "/running/shoes?width=wide",
    "uc-overpronators": "/running/shoes?type=stability",
    "uc-neutral-runners": "/running/shoes?stability=neutral",
    "uc-high-mileage": "/best/daily-trainers",
    "uc-comfort": "/running/shoes?cushion=high,maximum",
    "uc-pb": "/running/shoes?type=race,tempo",
  },
  featuredToolSlugs: ["running-shoe-finder", "running-pace-calculator", "shoe-rotation-planner"],
  finder: {
    toolSlug: "running-shoe-finder",
    headline: "Not sure which shoe?",
    title: "Use the Running Shoe Finder",
    description:
      "Tell Kitletics about your running, body, goals, terrain and preferences. We’ll rank suitable shoes and explain the strengths and trade-offs.",
    ctaLabel: "Find My Shoes",
  },
  primaryFilterKeys: [
    "genderFit",
    "type",
    "usecase",
    "terrain",
    "cushionLevel",
    "stability",
    "drop",
    "weight",
    "recommendedDistance",
    "trainingTypes",
    "widthOptions",
    "brand",
    "price",
  ],
  educationFactors: [
    {
      title: "Fit",
      body: "Length, width and lockdown matter more than stack marketing. Try before high-mileage commitment when you can.",
      href: "/guides/how-to-choose-running-shoes",
    },
    {
      title: "Market specs",
      body: "Browse weight, drop, stack and plate status across the current catalog in the Shoe Database.",
      href: "/running/shoes/database",
    },
    {
      title: "Terrain",
      body: "Road, trail and mixed surfaces change grip, protection and rocker needs.",
      href: "/running/trail",
    },
    {
      title: "Cushioning",
      body: "From firmer, responsive rides to maximum-cushion protection for long easy miles.",
      href: "/guides/how-to-choose-running-shoes",
    },
    {
      title: "Stability",
      body: "Neutral vs guided rides — choose based on how your foot moves, not fear alone.",
      href: "/guides/how-to-choose-running-shoes",
    },
    {
      title: "Training purpose",
      body: "Daily trainers, tempo shoes and race shoes pull different traits from the same runner.",
      href: "/best/daily-trainers",
    },
    {
      title: "Distance / pace",
      body: "Easy mileage, long runs and race-day efforts reward different stack, weight and plate choices.",
      href: "/guides/carbon-vs-nylon-plates",
    },
  ],
  terminology: [
    {
      term: "Stack height",
      definition:
        "How much foam sits under the heel and forefoot. Higher stack often feels more protective; geometry still matters.",
    },
    {
      term: "Drop",
      definition:
        "Heel stack minus forefoot stack in millimetres. A geometry trait — not a performance score.",
    },
    {
      term: "Stability",
      definition:
        "How much guidance a shoe provides against excessive inward roll. Ranges from neutral to maximum stability.",
    },
    {
      term: "Carbon plate",
      definition:
        "A stiff plate embedded in the midsole, typically for race-day propulsion. Not required for every runner.",
    },
    {
      term: "Energy return",
      definition:
        "How lively or springy the foam feels when you push off. Subjective but useful for daily vs race pairing.",
    },
    {
      term: "Rockers",
      definition:
        "Curved sole geometry that encourages a rolling transition from heel or midfoot through toe-off.",
    },
    {
      term: "Neutral",
      definition:
        "Shoes without strong medial posting or guidance rails — suited to many runners with stable gait.",
    },
    {
      term: "Pronation",
      definition:
        "Natural inward roll after landing. Overpronation may benefit from stability options; it is not a diagnosis.",
    },
  ],
  faqIds: [
    "faq-shoes-pairs",
    "faq-shoes-fit",
    "faq-shoes-replace",
    "faq-shoes-stability",
    "faq-drop-1",
    "faq-shoes-carbon",
  ],
  picks: [
    {
      label: "Best Daily Trainer",
      productId: "prod-novablast-5",
      rationale: "Soft bounce for easy and long miles.",
    },
    {
      label: "Best Max Cushion",
      productId: "prod-nimbus-27",
      rationale: "Protective stack with width options.",
    },
    {
      label: "Best for Marathon Training",
      productId: "prod-boston-12",
      rationale: "Daily + workout versatility for race blocks.",
    },
    {
      label: "Best for Wide Feet",
      productId: "prod-ghost-16",
      rationale: "Forgiving fit and strong width range.",
    },
  ],
  defaultSort: "recommended",
};

/** Registry of deep category configs. Others use a generic shell. */
export const CATEGORY_PAGE_CONFIGS: Record<string, ProductCategoryPageConfig> =
  {
    "running:running-shoes": runningShoesCategoryConfig,
    "running:gps-watches": runningWatchesCategoryConfig,
    "running:heart-rate-monitors": runningHrmCategoryConfig,
    "running:hydration": runningHydrationCategoryConfig,
    "running:running-packs-vests": runningPacksCategoryConfig,
    "running:running-belts": runningBeltsCategoryConfig,
    "running:running-clothing": runningClothingCategoryConfig,
    "running:running-socks": runningSocksCategoryConfig,
    "running:nutrition-fuel": runningNutritionCategoryConfig,
    "running:recovery": runningRecoveryCategoryConfig,
    "running:headphones": runningHeadphonesCategoryConfig,
    "running:sunglasses": runningSunglassesCategoryConfig,
    "running:running-lights": runningLightsCategoryConfig,
    "running:safety-gear": runningSafetyCategoryConfig,
    "running:accessories": runningAccessoriesCategoryConfig,
  };

export function getCategoryPageConfig(
  sportSlug: string,
  categorySlug: string,
): ProductCategoryPageConfig | undefined {
  const base = CATEGORY_PAGE_CONFIGS[`${sportSlug}:${categorySlug}`];
  if (!base) return undefined;
  return withRunningDecisionEnrichment(base);
}
