import type { EntityId } from "@/domain/shared/types";
import type { ExplainerGuideExtras } from "@/lib/guides/explainer-blocks";
import { stabilityShoesExplainedConfig } from "@/lib/guides/stability-shoes-explained-config";
import {
  carbonVsNylonPlatesConfig,
  howToChooseRunningWatchConfig,
  roadVsTrailRunningShoesConfig,
  runningShoeCushioningConfig,
  runningShoeDropConfig,
  runningShoeRotationConfig,
  runningShoeTerminologyConfig,
  whatIsADailyTrainerConfig,
} from "@/lib/guides/explainers";
import { ALL_BACKFILL_LONG_FORM_CONFIGS } from "@/lib/guides/guide-backfill-faqs";
import { enrichExplainerBlocksWithVisuals } from "@/lib/guides/enrich-explainer-visuals";
import { tocFromExplainer } from "@/lib/guides/explainer-blocks";
import { enrichLongFormDecisionLinks } from "@/content/guides-p40-journey";

export interface GuideNeedCard {
  id: string;
  title: string;
  description: string;
  icon:
    | "activity"
    | "route"
    | "zap"
    | "flag"
    | "heart"
    | "target"
    | "battery"
    | "map"
    | "box";
  href?: string;
}

export interface GuideAnatomyAnnotation {
  id: string;
  number: number;
  label: string;
  description: string;
  /** Percent position on diagram (0–100) */
  x: number;
  y: number;
  termSlug?: string;
}

export interface GuideFactorPanel {
  id: string;
  label: string;
  bullets: string[];
  levels?: {
    id: string;
    label: string;
    description: string;
    productId?: EntityId;
  }[];
  browseHref?: string;
  browseLabel?: string;
}

export interface GuideFitCard {
  id: string;
  title: string;
  description: string;
}

export interface GuideGlossaryTerm {
  id: string;
  term: string;
  definition: string;
  icon: "layers" | "ruler" | "circle" | "shield" | "scale" | "gauge";
}

export interface GuideProductExampleRole {
  productId: EntityId;
  roleLabel: string;
}

export interface GuideTocItem {
  id: string;
  title: string;
}

export interface LongFormGuideConfig {
  guideSlug: string;
  eyebrow:
    | "Buying Guide"
    | "Gear Guide"
    | "Explainer"
    | "Comparison"
    | "Decision guide"
    | "Setup guide";
  /** framework = how-to-choose layout; explainer = technical buying guide blocks */
  layout?: "framework" | "explainer";
  /** Optional display title override for hero */
  displayTitle?: string;
  deck?: string;
  heroImageSrc: string;
  heroImageAlt: string;
  finder?: {
    toolSlug: string;
    title: string;
    description: string;
    ctaLabel: string;
  };
  decisionLinks?: { label: string; href: string }[];
  glossaryTerms: GuideGlossaryTerm[];
  glossaryHref?: string;
  needs: GuideNeedCard[];
  needsTip?: { title: string; body: string };
  anatomy?: {
    title: string;
    imageSrc: string;
    imageAlt: string;
    annotations: GuideAnatomyAnnotation[];
  };
  factors: GuideFactorPanel[];
  fit: GuideFitCard[];
  fitTip?: { title: string; body: string };
  /** Ordered TOC / numbered section anchors beyond interactive modules */
  toc: GuideTocItem[];
  productExampleRoles: GuideProductExampleRole[];
  productRailTitle: string;
  productRailBrowseHref?: string;
  productRailBrowseLabel?: string;
  newsletter?: {
    title: string;
    description: string;
  };
  /** Present when layout === "explainer" */
  explainer?: ExplainerGuideExtras;
}

export const howToChooseRunningShoesConfig: LongFormGuideConfig = {
  guideSlug: "how-to-choose-running-shoes",
  eyebrow: "Buying Guide",
  displayTitle: "How to Choose Running Shoes: The Complete Guide",
  deck: "Finding the right running shoes can transform your runs. This guide explains the key factors that matter most — so you can choose shoes that fit your feet, support your goals, and keep you running comfortably.",
  heroImageSrc: "/images/home/guide-running-shoes.jpg",
  heroImageAlt: "Modern cushioned running shoes on a studio surface",
  finder: {
    toolSlug: "running-shoe-finder",
    title: "Find your perfect shoes",
    description:
      "Not sure where to start? Use the Running Shoe Finder for personalized recommendations based on how you run.",
    ctaLabel: "Find my running shoes →",
  },
  decisionLinks: [
    { label: "Compare shoes →", href: "/compare?category=running-shoes" },
    { label: "Best running shoes →", href: "/best/running-shoes" },
  ],
  glossaryHref: "/guides/running-shoe-terminology",
  glossaryTerms: [
    {
      id: "stack",
      term: "Stack height",
      definition: "Foam height underfoot at heel and/or forefoot.",
      icon: "layers",
    },
    {
      id: "drop",
      term: "Drop",
      definition: "Heel-to-toe height difference in millimetres.",
      icon: "ruler",
    },
    {
      id: "neutral",
      term: "Neutral shoe",
      definition: "Built without strong guidance for a neutral gait preference.",
      icon: "circle",
    },
    {
      id: "stability",
      term: "Stability shoe",
      definition: "Support-focused geometry or guidance elements.",
      icon: "shield",
    },
  ],
  needs: [
    {
      id: "daily",
      title: "Daily Training",
      description: "Versatile option for regular mileage and mixed easy days.",
      icon: "activity",
      href: "/running/shoes/daily-trainers",
    },
    {
      id: "long",
      title: "Long Runs",
      description: "More emphasis on sustained comfort and cushioning.",
      icon: "route",
      href: "/running/shoes?usecase=long-runs",
    },
    {
      id: "tempo",
      title: "Speed / Tempo",
      description: "Usually lighter and more responsive for faster efforts.",
      icon: "zap",
      href: "/running/shoes?type=tempo",
    },
    {
      id: "race",
      title: "Race Day",
      description: "Prioritises faster running and lower weight for goal races.",
      icon: "flag",
      href: "/running/shoes/race",
    },
    {
      id: "recovery",
      title: "Recovery",
      description: "Comfort-focused options for easy and recovery running.",
      icon: "heart",
      href: "/running/shoes?usecase=recovery-runs",
    },
  ],
  needsTip: {
    title: "Pro tip",
    body: "Most runners benefit from matching shoe type to the session — a soft daily for easy miles and a lighter shoe for workouts — rather than forcing one pair to do every job.",
  },
  anatomy: {
    title: "Shoe anatomy 101",
    imageSrc: "/images/running/products/novablast-6-hero.jpg",
    imageAlt: "Annotated running shoe side profile for anatomy education",
    annotations: [
      {
        id: "upper",
        number: 1,
        label: "Upper",
        description:
          "Holds the foot. Breathability, lockdown and stretch affect fit feel.",
        x: 42,
        y: 28,
      },
      {
        id: "heel",
        number: 2,
        label: "Heel counter",
        description:
          "Structure around the heel that influences lockdown and rearfoot feel.",
        x: 12,
        y: 38,
      },
      {
        id: "midsole",
        number: 3,
        label: "Midsole",
        description:
          "Primary cushioning layer. Foam type and geometry shape the ride.",
        x: 48,
        y: 62,
      },
      {
        id: "outsole",
        number: 4,
        label: "Outsole",
        description:
          "Rubber contact with the ground — grip, durability and flex behaviour.",
        x: 58,
        y: 82,
      },
      {
        id: "stack",
        number: 5,
        label: "Stack height",
        description:
          "How much material sits underfoot. Higher is not automatically softer.",
        x: 78,
        y: 70,
        termSlug: "stack",
      },
      {
        id: "drop",
        number: 6,
        label: "Drop",
        description:
          "Heel-to-toe height difference. Contextual — not a quality score.",
        x: 88,
        y: 48,
        termSlug: "drop",
      },
    ],
  },
  factors: [
    {
      id: "cushioning",
      label: "Cushioning",
      bullets: [
        "Cushioning affects how protective and soft the shoe feels underfoot.",
        "Stack height is not the same as perceived softness.",
        "More foam can help easy and long miles; less can feel livelier or more connected.",
        "Choose based on preference and session type — not a universal “more is better” rule.",
      ],
      levels: [
        {
          id: "max",
          label: "Max Cushion",
          description: "Taller/protective stack often favoured for easy or long running.",
          productId: "prod-bondi-9",
        },
        {
          id: "moderate",
          label: "Moderate Cushion",
          description: "Balanced daily feel for general training.",
          productId: "prod-pegasus-42",
        },
        {
          id: "low",
          label: "Low Cushion",
          description: "Less material and more ground feel for some runners.",
          productId: "prod-escalante-4",
        },
      ],
      browseHref: "/running/shoes?cushion=high,maximum",
      browseLabel: "See cushioned running shoes →",
    },
    {
      id: "stability",
      label: "Support & Stability",
      bullets: [
        "Stability designs use geometry, guidance elements or firmer foams.",
        "“Support-focused” does not mean the shoe diagnoses or corrects your gait.",
        "Neutral shoes remain appropriate for many runners who prefer that ride.",
        "Fit and professional assessment matter more than marketing labels.",
      ],
      browseHref: "/running/shoes/stability",
      browseLabel: "Explore stability shoes →",
    },
    {
      id: "weight",
      label: "Weight",
      bullets: [
        "Lighter shoes can feel quicker, especially for workouts and racing.",
        "Lower weight is not always better for easy or long training.",
        "Manufacturer sample weights are typically men’s sample sizes — treat them as comparative.",
      ],
    },
    {
      id: "drop",
      label: "Drop",
      bullets: [
        "Drop is the heel-to-toe height difference in millimetres.",
        "There is no universally ideal drop — match it to preference and history.",
        "Large drop changes can irritate calves or Achilles; transition gradually.",
      ],
      browseHref: "/guides/running-shoe-drop",
      browseLabel: "Read drop explained →",
    },
    {
      id: "flexibility",
      label: "Flexibility",
      bullets: [
        "How easily the shoe bends influences ride character and ground feel.",
        "Stiffer setups often pair with plates or rockered geometry.",
        "Flexibility preferences are personal — try before committing when possible.",
      ],
    },
    {
      id: "durability",
      label: "Durability",
      bullets: [
        "Outsole rubber coverage and midsole compounds affect wear patterns.",
        "Surface, body mass, cadence and weekly volume change lifespan.",
        "Kitletics does not promise a fixed kilometre lifespan without evidence.",
      ],
    },
  ],
  fit: [
    {
      id: "length",
      title: "Length",
      description:
        "Aim for comfortable toe room without the foot sliding excessively fore–aft.",
    },
    {
      id: "width",
      title: "Width",
      description:
        "The foot should not feel pinched or spill over the midsole edge. Use official width options when available.",
    },
    {
      id: "heel",
      title: "Heel lock",
      description:
        "A secure heel with minimal unwanted slip after a sensible lace-up.",
    },
  ],
  fitTip: {
    title: "Tips",
    body: "Shop later in the day when feet are slightly larger, and leave room to confirm lockdown after a short jog — a store try-on is not a guarantee of long-run comfort.",
  },
  toc: [
    { id: "needs", title: "Know your running needs" },
    { id: "anatomy", title: "Shoe anatomy 101" },
    { id: "factors", title: "Key factors explained" },
    { id: "fit", title: "Understanding fit" },
    { id: "terrain", title: "Terrain & conditions" },
    { id: "budget", title: "How much should you spend?" },
    { id: "mistakes", title: "Common mistakes to avoid" },
    { id: "faq", title: "FAQ" },
  ],
  productExampleRoles: [
    { productId: "prod-novablast-6", roleLabel: "Versatile daily trainer" },
    { productId: "prod-bondi-9", roleLabel: "Maximum cushioning" },
    { productId: "prod-endorphin-speed-5", roleLabel: "Tempo / faster running" },
    { productId: "prod-ghost-18", roleLabel: "Smooth daily miles" },
    { productId: "prod-vaporfly-4", roleLabel: "Race-day example" },
  ],
  productRailTitle: "Examples: shoes that fit different needs",
  productRailBrowseHref: "/running/shoes",
  productRailBrowseLabel: "View all running shoes →",
  newsletter: {
    title: "Get better gear advice",
    description: "New gear guides and recommendations — no spam.",
  },
};

const CONFIGS: LongFormGuideConfig[] = [
  howToChooseRunningShoesConfig,
  stabilityShoesExplainedConfig,
  runningShoeDropConfig,
  runningShoeCushioningConfig,
  carbonVsNylonPlatesConfig,
  runningShoeRotationConfig,
  whatIsADailyTrainerConfig,
  runningShoeTerminologyConfig,
  roadVsTrailRunningShoesConfig,
  howToChooseRunningWatchConfig,
  ...ALL_BACKFILL_LONG_FORM_CONFIGS,
];

export function getLongFormGuideConfig(
  slug: string,
): LongFormGuideConfig | undefined {
  const config = CONFIGS.find((c) => c.guideSlug === slug);
  if (!config) return undefined;
  if (config.layout !== "explainer" || !config.explainer) {
    return enrichLongFormDecisionLinks(config);
  }

  const blocks = enrichExplainerBlocksWithVisuals(
    config.explainer.blocks,
    slug,
  );
  return enrichLongFormDecisionLinks({
    ...config,
    toc: tocFromExplainer(blocks),
    explainer: {
      ...config.explainer,
      blocks,
    },
  });
}
