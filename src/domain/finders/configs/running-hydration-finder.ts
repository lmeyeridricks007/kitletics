import type { FinderDefinition } from "@/domain/finders/types";

const EUR_BUDGETS = {
  region: "NL" as const,
  currency: "EUR",
  bands: [
    { id: "under-50", label: "Under €50", max: 50, currency: "EUR" },
    { id: "50-100", label: "€50–€100", min: 50, max: 100, currency: "EUR" },
    { id: "100-180", label: "€100–€180", min: 100, max: 180, currency: "EUR" },
    { id: "180-plus", label: "€180+", min: 180, currency: "EUR" },
  ],
};

const DEFAULT_RESULT = {
  maxResults: 8,
  minMatchForDisplay: 40,
  minCoverageForTopRecommendation: 0.35,
};

const DEFAULT_SCORING = {
  baseWeights: {
    primaryUse: 25,
    budget: 15,
    priorities: 20,
    lifecycle: 5,
    value: 10,
    specs: 25,
  },
  priorityMultipliers: {
    capacity: { specs: 1.4 },
    value: { value: 1.5, budget: 1.3 },
    comfort: { specs: 1.3 },
    lightweight: { specs: 1.3 },
  },
  budget: {
    withinScore: 100,
    slightOverRatio: 0.15,
    slightOverScore: 72,
    farOverRatio: 0.4,
    farOverScore: 35,
    noOfferScore: 55,
  },
};

export const runningHydrationFinderDefinition: FinderDefinition = {
  id: "finder-running-hydration",
  slug: "running-hydration-finder",
  toolId: "tool-running-hydration-finder",
  sportId: "sport-running",
  categoryId: "cat-packs-vests",
  categoryIds: ["cat-packs-vests", "cat-running-belts", "cat-hydration"],
  title: "Running Hydration Finder",
  description:
    "Match hydration vests, belts and flasks to distance, terrain, water needs and carry style.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-distance",
      key: "primaryUse",
      type: "single-select",
      title: "What distance / effort are you mainly carrying for?",
      required: true,
      options: [
        { id: "d-5-10", value: "daily-training", label: "5K–10K" },
        { id: "d-half", value: "long-runs", label: "Half marathon" },
        { id: "d-marathon", value: "racing", label: "Marathon" },
        { id: "d-trail", value: "trail", label: "Trail" },
        { id: "d-ultra", value: "ultra", label: "Ultra" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-distances",
      key: "distances",
      type: "single-select",
      title: "Primary race / long-run distance band",
      required: true,
      showWhen: {
        key: "primaryUse",
        anyOf: ["daily-training", "long-runs", "racing", "ultra"],
      },
      options: [
        { id: "rd-10k", value: "10k", label: "Up to 10K" },
        { id: "rd-half", value: "half", label: "Half marathon" },
        { id: "rd-marathon", value: "marathon", label: "Marathon" },
        { id: "rd-ultra", value: "ultra", label: "Ultra" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-terrain",
      key: "terrain",
      type: "single-select",
      title: "Where will you mainly run?",
      required: true,
      options: [
        { id: "t-road", value: "road", label: "Road" },
        { id: "t-trail", value: "trail", label: "Trail" },
        { id: "t-mixed", value: "mixed", label: "Mixed road & trail" },
      ],
      affects: ["terrain", "useCases"],
    },
    {
      id: "q-water",
      key: "waterRequired",
      type: "single-select",
      title: "How much water do you usually need to carry?",
      required: true,
      options: [
        { id: "w-min", value: "minimal", label: "Minimal — short carries / aid stations" },
        { id: "w-mod", value: "moderate", label: "Moderate — soft flasks / belt bottle" },
        { id: "w-high", value: "high", label: "High — multi-flask or reservoir days" },
      ],
      affects: ["specs"],
    },
    {
      id: "q-kit",
      key: "mandatoryGear",
      type: "boolean",
      title: "Do you need room for mandatory race kit?",
      required: true,
      options: [
        { id: "k-yes", value: "yes", label: "Yes — jacket / kit list days" },
        { id: "k-no", value: "no", label: "No — fuel and water only" },
      ],
      affects: ["specs"],
    },
    {
      id: "q-phone",
      key: "phone",
      type: "boolean",
      title: "Will you carry a phone?",
      required: true,
      options: [
        { id: "p-yes", value: "yes", label: "Yes" },
        { id: "p-no", value: "no", label: "No" },
      ],
      affects: ["specs"],
    },
    {
      id: "q-poles",
      key: "poles",
      type: "boolean",
      title: "Do you need pole attachment?",
      required: true,
      options: [
        { id: "po-yes", value: "yes", label: "Yes" },
        { id: "po-no", value: "no", label: "No" },
      ],
      affects: ["specs"],
    },
    {
      id: "q-carry",
      key: "carryStyle",
      type: "single-select",
      title: "Carry preference",
      required: true,
      options: [
        {
          id: "c-min",
          value: "minimal",
          label: "Minimal — belt or handheld preference",
        },
        {
          id: "c-storage",
          value: "storage",
          label: "Storage — vest with pockets / flasks",
        },
      ],
      affects: ["specs"],
    },
    {
      id: "q-fit",
      key: "sizingRange",
      type: "single-select",
      title: "Fit / sizing range",
      required: true,
      options: [
        { id: "f-men", value: "men", label: "Men's" },
        { id: "f-women", value: "women", label: "Women's" },
        { id: "f-any", value: "unisex", label: "Unisex / any" },
      ],
      affects: ["genderFit"],
    },
    {
      id: "q-priority",
      key: "priorities",
      type: "multi-select",
      title: "What matters most?",
      required: true,
      maxSelections: 2,
      options: [
        { id: "p-cap", value: "capacity", label: "Capacity" },
        { id: "p-bounce", value: "comfort", label: "Bounce control / comfort" },
        { id: "p-light", value: "lightweight", label: "Light weight" },
        { id: "p-value", value: "value", label: "Value" },
      ],
    },
    {
      id: "q-budget",
      key: "budget",
      type: "single-select",
      title: "Budget",
      required: true,
      options: EUR_BUDGETS.bands.map((b) => ({
        id: b.id,
        value: b.id,
        label: b.label,
      })),
    },
  ],
  scoringProfile: DEFAULT_SCORING,
  resultConfig: DEFAULT_RESULT,
  regionalBudgets: [EUR_BUDGETS],
};

export const runningHydrationFinderDefinitions: FinderDefinition[] = [
  runningHydrationFinderDefinition,
];
