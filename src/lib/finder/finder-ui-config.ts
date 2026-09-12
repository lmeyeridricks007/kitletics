import type { EntityId } from "@/domain/shared/types";

/** Logical UI step grouping — questions remain the source of truth. */
export interface FinderUiStep {
  id: string;
  title: string;
  shortTitle: string;
  /** Question keys belonging to this step (visibility still applies) */
  questionKeys: string[];
}

export interface FinderSummaryField {
  key: string;
  label: string;
  /** Lucide icon name */
  icon?: string;
}

export interface FinderUiConfig {
  eyebrow: string;
  headline: string;
  supportingCopy: string;
  estimatedTimeMinutes?: number;
  /** Decorative category products — not recommendations */
  heroProductIds?: EntityId[];
  helpGuideHref?: string;
  helpGuideLabel?: string;
  /** Min answered required questions before showing product preview */
  previewMinAnswered?: number;
  /** Plural noun for candidate copy — "shoes", "rackets", "racks" */
  productNoun?: string;
  resultsSupportingCopy?: string;
  /** Related buying/best guide slugs for results sidebar */
  relatedGuideSlugs?: { slug: string; type: "buying" | "best"; imageSrc?: string }[];
  steps: FinderUiStep[];
  summaryFields: FinderSummaryField[];
}

export const FINDER_UI_BY_SLUG: Record<string, FinderUiConfig> = {
  "running-shoe-finder": {
    eyebrow: "RUNNING SHOE FINDER",
    headline: "Find your perfect running shoes",
    supportingCopy:
      "Answer a few quick questions and we'll match you with shoes that fit your running, goals and preferences.",
    estimatedTimeMinutes: 2,
    heroProductIds: [
      "prod-novablast-6",
      "prod-ghost-18",
      "prod-endorphin-speed-5",
    ],
    helpGuideHref: "/guides/how-to-choose-running-shoes",
    helpGuideLabel: "Guide to running shoes",
    previewMinAnswered: 2,
    productNoun: "shoes",
    resultsSupportingCopy:
      "Based on your answers, we found the shoes that best match your needs.",
    relatedGuideSlugs: [
      {
        slug: "how-to-choose-running-shoes",
        type: "buying",
        imageSrc: "/images/home/guide-running-shoes.jpg",
      },
      {
        slug: "daily-trainers",
        type: "best",
        imageSrc: "/images/home/guide-running-shoes.jpg",
      },
      {
        slug: "running-shoe-rotation",
        type: "buying",
        imageSrc: "/images/running/guides/daily-vs-long.jpg",
      },
    ],
    steps: [
      {
        id: "basics",
        title: "Running basics",
        shortTitle: "Running basics",
        questionKeys: ["sizingRange", "terrain"],
      },
      {
        id: "goals",
        title: "Goals & use",
        shortTitle: "Goals & use",
        questionKeys: ["primaryUse", "raceDistance", "distances"],
      },
      {
        id: "feel",
        title: "Cushioning & support",
        shortTitle: "Cushioning & support",
        questionKeys: ["cushioning", "stability"],
      },
      {
        id: "fit",
        title: "Fit preferences",
        shortTitle: "Fit preferences",
        questionKeys: ["width"],
      },
      {
        id: "profile",
        title: "Runner profile",
        shortTitle: "Runner profile",
        questionKeys: ["experience", "weight"],
      },
      {
        id: "budget",
        title: "Priorities & budget",
        shortTitle: "Budget",
        questionKeys: ["priorities", "budget"],
      },
      {
        id: "results",
        title: "Results",
        shortTitle: "Results",
        questionKeys: [],
      },
    ],
    summaryFields: [
      { key: "sizingRange", label: "Sizing", icon: "Footprints" },
      { key: "primaryUse", label: "Main use", icon: "Footprints" },
      { key: "stability", label: "Support preference", icon: "Target" },
      { key: "terrain", label: "Surfaces", icon: "Map" },
      { key: "experience", label: "Experience", icon: "User" },
      { key: "cushioning", label: "Cushioning", icon: "Layers" },
    ],
  },
  "padel-racket-finder": {
    eyebrow: "PADEL RACKET FINDER",
    headline: "Find the right padel racket for your game",
    supportingCopy:
      "Answer a few questions about your level, style and preferences — we'll match rackets that fit how you play.",
    estimatedTimeMinutes: 2,
    helpGuideHref: "/guides/how-to-choose-padel-shoes",
    helpGuideLabel: "Related padel guides",
    previewMinAnswered: 2,
    productNoun: "rackets",
    resultsSupportingCopy:
      "Based on your answers, we found the rackets that best match your game.",
    steps: [
      {
        id: "level",
        title: "Your level",
        shortTitle: "Level",
        questionKeys: [
          "primaryUse",
          "currentEquipment",
          "changeGoals",
          "playingStyle",
        ],
      },
      {
        id: "priorities",
        title: "Priorities",
        shortTitle: "Priorities",
        questionKeys: ["priorities"],
      },
      {
        id: "feel",
        title: "Feel & balance",
        shortTitle: "Feel",
        questionKeys: ["weightPreference", "balancePreference", "feelPreference"],
      },
      {
        id: "budget",
        title: "Budget",
        shortTitle: "Budget",
        questionKeys: ["budget"],
      },
      {
        id: "results",
        title: "Results",
        shortTitle: "Results",
        questionKeys: [],
      },
    ],
    summaryFields: [
      { key: "primaryUse", label: "Level", icon: "User" },
      { key: "playingStyle", label: "Style", icon: "Target" },
      { key: "balancePreference", label: "Balance", icon: "Layers" },
      { key: "budget", label: "Budget", icon: "Map" },
    ],
  },
  "training-shoe-finder": {
    eyebrow: "TRAINING SHOE FINDER",
    headline: "Find training shoes for how you lift and condition",
    supportingCopy:
      "Tell us about your training and preferences — we'll match shoes suited to gym work and conditioning.",
    estimatedTimeMinutes: 2,
    previewMinAnswered: 2,
    productNoun: "shoes",
    resultsSupportingCopy:
      "Based on your answers, we found training shoes that best match how you train.",
    steps: [
      {
        id: "use",
        title: "Training use",
        shortTitle: "Use",
        questionKeys: ["primaryUse", "includesRunning"],
      },
      {
        id: "support",
        title: "Support",
        shortTitle: "Support",
        questionKeys: ["stability"],
      },
      {
        id: "priorities",
        title: "Priorities",
        shortTitle: "Priorities",
        questionKeys: ["priorities"],
      },
      {
        id: "budget",
        title: "Budget",
        shortTitle: "Budget",
        questionKeys: ["budget"],
      },
      {
        id: "results",
        title: "Results",
        shortTitle: "Results",
        questionKeys: [],
      },
    ],
    summaryFields: [
      { key: "primaryUse", label: "Main use", icon: "Footprints" },
      { key: "stability", label: "Support", icon: "Target" },
      { key: "budget", label: "Budget", icon: "Map" },
    ],
  },
  "power-rack-finder": {
    eyebrow: "POWER RACK FINDER",
    headline: "Find a power rack that fits your space",
    supportingCopy:
      "Answer questions about room, mounting and goals — we'll match racks that fit your constraints.",
    estimatedTimeMinutes: 2,
    previewMinAnswered: 2,
    productNoun: "racks",
    resultsSupportingCopy:
      "Based on your answers, we found power racks that best fit your space and goals.",
    steps: [
      {
        id: "space",
        title: "Your space",
        shortTitle: "Space",
        questionKeys: ["ceilingHeightCm"],
      },
      {
        id: "use",
        title: "Training goals",
        shortTitle: "Goals",
        questionKeys: ["primaryUse"],
      },
      {
        id: "mount",
        title: "Mounting",
        shortTitle: "Mounting",
        questionKeys: ["wallMount"],
      },
      {
        id: "priorities",
        title: "Priorities",
        shortTitle: "Priorities",
        questionKeys: ["priorities"],
      },
      {
        id: "budget",
        title: "Budget",
        shortTitle: "Budget",
        questionKeys: ["budget"],
      },
      {
        id: "results",
        title: "Results",
        shortTitle: "Results",
        questionKeys: [],
      },
    ],
    summaryFields: [
      { key: "ceilingHeightCm", label: "Ceiling", icon: "Map" },
      { key: "primaryUse", label: "Goals", icon: "Target" },
      { key: "wallMount", label: "Mounting", icon: "Layers" },
      { key: "budget", label: "Budget", icon: "User" },
    ],
  },
  "fitness-watch-finder": {
    eyebrow: "FITNESS WATCH FINDER",
    headline: "Find the right GPS watch",
    supportingCopy:
      "Answer a few questions about training, maps and budget — get explainable watch matches.",
    estimatedTimeMinutes: 2,
    heroProductIds: [
      "prod-forerunner-970",
      "prod-coros-pace-3",
      "prod-forerunner-255",
    ],
    helpGuideHref: "/guides/how-to-choose-running-watch",
    helpGuideLabel: "Guide to running watches",
    previewMinAnswered: 2,
    productNoun: "watches",
    resultsSupportingCopy:
      "Based on your answers, these GPS watches best match your training and feature needs.",
    relatedGuideSlugs: [
      {
        slug: "how-to-choose-running-watch",
        type: "buying",
      },
      {
        slug: "running-watches",
        type: "best",
      },
    ],
    steps: [
      {
        id: "use",
        title: "How you train",
        shortTitle: "Use",
        questionKeys: ["primaryUse", "experience"],
      },
      {
        id: "features",
        title: "Features",
        shortTitle: "Features",
        questionKeys: ["needsMaps", "priorities"],
      },
      {
        id: "budget",
        title: "Budget",
        shortTitle: "Budget",
        questionKeys: ["budget"],
      },
      {
        id: "results",
        title: "Results",
        shortTitle: "Results",
        questionKeys: [],
      },
    ],
    summaryFields: [
      { key: "primaryUse", label: "Main use", icon: "Target" },
      { key: "experience", label: "Experience", icon: "User" },
      { key: "needsMaps", label: "Maps", icon: "Map" },
      { key: "priorities", label: "Priorities", icon: "Layers" },
      { key: "budget", label: "Budget", icon: "User" },
    ],
  },
  "running-hydration-finder": {
    eyebrow: "RUNNING HYDRATION FINDER",
    headline: "Find the right hydration carry",
    supportingCopy:
      "Answer a few questions about distance, terrain and carry style — get explainable vest, belt and flask matches.",
    estimatedTimeMinutes: 2,
    heroProductIds: [
      "prod-adv-skin-12",
      "prod-salomon-adv-skin-5",
      "prod-flipbelt-classic",
    ],
    helpGuideHref: "/guides/how-to-choose-running-hydration-vest",
    helpGuideLabel: "Guide to hydration vests",
    previewMinAnswered: 2,
    productNoun: "hydration options",
    resultsSupportingCopy:
      "Based on your answers, these vests, belts and flasks best match your carry needs.",
    relatedGuideSlugs: [
      { slug: "running-hydration-vests", type: "best" },
      { slug: "running-belts", type: "best" },
      { slug: "hydration-marathon-training", type: "best" },
    ],
    steps: [
      {
        id: "use",
        title: "Distance & terrain",
        shortTitle: "Use",
        questionKeys: ["primaryUse", "distances", "terrain"],
      },
      {
        id: "carry",
        title: "Carry needs",
        shortTitle: "Carry",
        questionKeys: ["waterRequired", "mandatoryGear", "phone", "poles", "carryStyle"],
      },
      {
        id: "fit",
        title: "Fit & priorities",
        shortTitle: "Fit",
        questionKeys: ["sizingRange", "priorities"],
      },
      {
        id: "budget",
        title: "Budget",
        shortTitle: "Budget",
        questionKeys: ["budget"],
      },
      {
        id: "results",
        title: "Results",
        shortTitle: "Results",
        questionKeys: [],
      },
    ],
    summaryFields: [
      { key: "primaryUse", label: "Distance", icon: "Target" },
      { key: "terrain", label: "Terrain", icon: "Map" },
      { key: "carryStyle", label: "Carry", icon: "Layers" },
      { key: "budget", label: "Budget", icon: "User" },
    ],
  },
  "running-hrm-finder": {
    eyebrow: "HEART RATE MONITOR FINDER",
    headline: "Find the right running HRM",
    supportingCopy:
      "Answer a few questions about form factor, dynamics and budget — get explainable chest strap and armband matches.",
    estimatedTimeMinutes: 2,
    heroProductIds: [
      "prod-polar-h10",
      "prod-garmin-hrm-600",
      "prod-polar-verity-sense",
    ],
    helpGuideHref: "/best/heart-rate-monitors-running",
    helpGuideLabel: "Best HRMs for running",
    previewMinAnswered: 2,
    productNoun: "heart rate monitors",
    resultsSupportingCopy:
      "Based on your answers, these HRMs best match your training and comfort needs.",
    relatedGuideSlugs: [
      { slug: "heart-rate-monitors-running", type: "best" },
      { slug: "heart-rate-monitors-chest-straps", type: "best" },
      { slug: "heart-rate-monitors-intervals", type: "best" },
    ],
    steps: [
      {
        id: "use",
        title: "How you train",
        shortTitle: "Use",
        questionKeys: ["primaryUse", "formFactor"],
      },
      {
        id: "features",
        title: "Features",
        shortTitle: "Features",
        questionKeys: ["needsDynamics", "priorities"],
      },
      {
        id: "budget",
        title: "Budget",
        shortTitle: "Budget",
        questionKeys: ["budget"],
      },
      {
        id: "results",
        title: "Results",
        shortTitle: "Results",
        questionKeys: [],
      },
    ],
    summaryFields: [
      { key: "primaryUse", label: "Main use", icon: "Target" },
      { key: "formFactor", label: "Form", icon: "Layers" },
      { key: "needsDynamics", label: "Dynamics", icon: "Map" },
      { key: "budget", label: "Budget", icon: "User" },
    ],
  },
  "running-clothing-finder": {
    eyebrow: "RUNNING APPAREL FINDER",
    headline: "Find the right running kit",
    supportingCopy:
      "Answer a few questions about training context and fit — get explainable clothing and sock matches.",
    estimatedTimeMinutes: 2,
    previewMinAnswered: 2,
    productNoun: "apparel picks",
    resultsSupportingCopy:
      "Based on your answers, these apparel options best match your training and comfort needs.",
    steps: [
      {
        id: "use",
        title: "What you need",
        shortTitle: "Use",
        questionKeys: ["primaryUse", "sizingRange"],
      },
      {
        id: "priorities",
        title: "Priorities & budget",
        shortTitle: "Priorities",
        questionKeys: ["priorities", "budget"],
      },
      { id: "results", title: "Results", shortTitle: "Results", questionKeys: [] },
    ],
    summaryFields: [
      { key: "primaryUse", label: "Need", icon: "Target" },
      { key: "sizingRange", label: "Fit", icon: "User" },
      { key: "budget", label: "Budget", icon: "User" },
    ],
  },
  "running-fuel-finder": {
    eyebrow: "RUNNING FUEL FINDER",
    headline: "Find the right race fuel",
    supportingCopy:
      "Answer a few questions about distance and format — get explainable gel, chew and drink-mix matches.",
    estimatedTimeMinutes: 2,
    previewMinAnswered: 2,
    productNoun: "fuel options",
    resultsSupportingCopy:
      "Based on your answers, these fuel options best match your distance and stomach priorities.",
    steps: [
      {
        id: "use",
        title: "Distance & format",
        shortTitle: "Use",
        questionKeys: ["primaryUse", "formFactor"],
      },
      {
        id: "priorities",
        title: "Priorities & budget",
        shortTitle: "Priorities",
        questionKeys: ["priorities", "budget"],
      },
      { id: "results", title: "Results", shortTitle: "Results", questionKeys: [] },
    ],
    summaryFields: [
      { key: "primaryUse", label: "Distance", icon: "Target" },
      { key: "formFactor", label: "Format", icon: "Layers" },
      { key: "budget", label: "Budget", icon: "User" },
    ],
  },
  "running-recovery-finder": {
    eyebrow: "RUNNING RECOVERY FINDER",
    headline: "Find the right recovery tools",
    supportingCopy:
      "Answer a few questions about recovery needs and budget — get explainable massage and mobility matches.",
    estimatedTimeMinutes: 2,
    previewMinAnswered: 2,
    productNoun: "recovery tools",
    resultsSupportingCopy:
      "Based on your answers, these recovery tools best match how you bounce back between runs.",
    steps: [
      {
        id: "use",
        title: "Recovery need",
        shortTitle: "Use",
        questionKeys: ["primaryUse", "priorities"],
      },
      {
        id: "budget",
        title: "Budget",
        shortTitle: "Budget",
        questionKeys: ["budget"],
      },
      { id: "results", title: "Results", shortTitle: "Results", questionKeys: [] },
    ],
    summaryFields: [
      { key: "primaryUse", label: "Need", icon: "Target" },
      { key: "priorities", label: "Priorities", icon: "Layers" },
      { key: "budget", label: "Budget", icon: "User" },
    ],
  },
  "running-accessories-finder": {
    eyebrow: "RUNNING ACCESSORIES FINDER",
    headline: "Find the right running accessories",
    supportingCopy:
      "Answer a few questions about audio, eyewear, lights and safety — get explainable accessory matches.",
    estimatedTimeMinutes: 2,
    previewMinAnswered: 2,
    productNoun: "accessories",
    resultsSupportingCopy:
      "Based on your answers, these accessories best match when and where you run.",
    steps: [
      {
        id: "use",
        title: "What & when",
        shortTitle: "Use",
        questionKeys: ["primaryUse", "terrain"],
      },
      {
        id: "priorities",
        title: "Priorities & budget",
        shortTitle: "Priorities",
        questionKeys: ["priorities", "budget"],
      },
      { id: "results", title: "Results", shortTitle: "Results", questionKeys: [] },
    ],
    summaryFields: [
      { key: "primaryUse", label: "Accessory", icon: "Target" },
      { key: "terrain", label: "When", icon: "Map" },
      { key: "budget", label: "Budget", icon: "User" },
    ],
  },
};

export function getFinderUiConfig(slug: string): FinderUiConfig {
  const known = FINDER_UI_BY_SLUG[slug];
  if (known) {
    return known;
  }
  return {
    eyebrow: "GEAR FINDER",
    headline: "Find the right gear for you",
    supportingCopy:
      "Answer a few quick questions and we'll match products to your needs.",
    previewMinAnswered: 2,
    steps: [],
    summaryFields: [],
  };
}
