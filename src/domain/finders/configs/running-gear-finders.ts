import type { FinderDefinition } from "@/domain/finders/types";

const DEFAULT_RESULT = {
  maxResults: 8,
  minMatchForDisplay: 40,
  minCoverageForTopRecommendation: 0.35,
};

const DEFAULT_SCORING = {
  baseWeights: {
    primaryUse: 30,
    budget: 20,
    priorities: 20,
    lifecycle: 5,
    value: 15,
    specs: 10,
  },
  priorityMultipliers: {
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

const APPAREL_BUDGETS = {
  region: "NL" as const,
  currency: "EUR",
  bands: [
    { id: "under-40", label: "Under €40", max: 40, currency: "EUR" },
    { id: "40-80", label: "€40–€80", min: 40, max: 80, currency: "EUR" },
    { id: "80-140", label: "€80–€140", min: 80, max: 140, currency: "EUR" },
    { id: "140-plus", label: "€140+", min: 140, currency: "EUR" },
  ],
};

const FUEL_BUDGETS = {
  region: "NL" as const,
  currency: "EUR",
  bands: [
    { id: "under-25", label: "Under €25", max: 25, currency: "EUR" },
    { id: "25-50", label: "€25–€50", min: 25, max: 50, currency: "EUR" },
    { id: "50-100", label: "€50–€100", min: 50, max: 100, currency: "EUR" },
    { id: "100-plus", label: "€100+", min: 100, currency: "EUR" },
  ],
};

const ACCESSORY_BUDGETS = {
  region: "NL" as const,
  currency: "EUR",
  bands: [
    { id: "under-50", label: "Under €50", max: 50, currency: "EUR" },
    { id: "50-120", label: "€50–€120", min: 50, max: 120, currency: "EUR" },
    { id: "120-200", label: "€120–€200", min: 120, max: 200, currency: "EUR" },
    { id: "200-plus", label: "€200+", min: 200, currency: "EUR" },
  ],
};

export const runningClothingFinderDefinition: FinderDefinition = {
  id: "finder-running-clothing",
  slug: "running-clothing-finder",
  toolId: "tool-running-clothing-finder",
  sportId: "sport-running",
  categoryId: "cat-running-clothing",
  categoryIds: ["cat-running-clothing", "cat-running-socks"],
  title: "Running Apparel Finder",
  description:
    "Match running clothing and socks to weather, distance and comfort priorities.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-primary",
      key: "primaryUse",
      type: "single-select",
      title: "What are you shopping for first?",
      required: true,
      options: [
        { id: "u-tops", value: "daily-training", label: "Tops / shorts for daily training" },
        { id: "u-long", value: "long-runs", label: "Long-run comfort kit" },
        { id: "u-race", value: "racing", label: "Race-day apparel" },
        { id: "u-winter", value: "trail", label: "Cold / weather layers" },
        { id: "u-socks", value: "beginners", label: "Socks first" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-fit",
      key: "sizingRange",
      type: "single-select",
      title: "Fit preference",
      required: true,
      options: [
        { id: "f-men", value: "men", label: "Men's" },
        { id: "f-women", value: "women", label: "Women's" },
        { id: "f-uni", value: "unisex", label: "Unisex / any" },
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
        { id: "p-com", value: "comfort", label: "Comfort / chafe control" },
        { id: "p-light", value: "lightweight", label: "Light weight" },
        { id: "p-weather", value: "weather", label: "Weather protection" },
        { id: "p-value", value: "value", label: "Value" },
      ],
    },
    {
      id: "q-budget",
      key: "budget",
      type: "single-select",
      title: "Budget",
      required: true,
      options: APPAREL_BUDGETS.bands.map((b) => ({
        id: b.id,
        value: b.id,
        label: b.label,
      })),
    },
  ],
  scoringProfile: DEFAULT_SCORING,
  resultConfig: DEFAULT_RESULT,
  regionalBudgets: [APPAREL_BUDGETS],
};

export const runningFuelFinderDefinition: FinderDefinition = {
  id: "finder-running-fuel",
  slug: "running-fuel-finder",
  toolId: "tool-running-fuel-finder",
  sportId: "sport-running",
  categoryId: "cat-nutrition",
  title: "Running Fuel Finder",
  description:
    "Match gels, chews and drink mixes to distance, stomach tolerance and race goals.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-primary",
      key: "primaryUse",
      type: "single-select",
      title: "Primary fueling context",
      required: true,
      options: [
        { id: "u-daily", value: "daily-training", label: "Daily training" },
        { id: "u-half", value: "half", label: "Half marathon" },
        { id: "u-marathon", value: "marathon", label: "Marathon" },
        { id: "u-ultra", value: "ultra", label: "Ultra / long trail" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-form",
      key: "formFactor",
      type: "single-select",
      title: "Preferred format",
      required: true,
      options: [
        { id: "f-gel", value: "gel", label: "Gels" },
        { id: "f-chew", value: "chew", label: "Chews / solids" },
        { id: "f-drink", value: "drink", label: "Drink mix" },
        { id: "f-any", value: "any", label: "Open to anything" },
      ],
      affects: ["specs"],
    },
    {
      id: "q-priority",
      key: "priorities",
      type: "multi-select",
      title: "What matters most?",
      required: true,
      maxSelections: 2,
      options: [
        { id: "p-stom", value: "comfort", label: "Stomach comfort" },
        { id: "p-caff", value: "caffeine", label: "Caffeine options" },
        { id: "p-carb", value: "carbs", label: "Carb density" },
        { id: "p-value", value: "value", label: "Value / pack size" },
      ],
    },
    {
      id: "q-budget",
      key: "budget",
      type: "single-select",
      title: "Budget",
      required: true,
      options: FUEL_BUDGETS.bands.map((b) => ({
        id: b.id,
        value: b.id,
        label: b.label,
      })),
    },
  ],
  scoringProfile: DEFAULT_SCORING,
  resultConfig: DEFAULT_RESULT,
  regionalBudgets: [FUEL_BUDGETS],
};

export const runningRecoveryFinderDefinition: FinderDefinition = {
  id: "finder-running-recovery",
  slug: "running-recovery-finder",
  toolId: "tool-running-recovery-finder",
  sportId: "sport-running",
  categoryId: "cat-recovery-gear",
  title: "Running Recovery Finder",
  description:
    "Match recovery tools to sore calves, travel needs and how hard you train.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-primary",
      key: "primaryUse",
      type: "single-select",
      title: "Main recovery need",
      required: true,
      options: [
        { id: "u-daily", value: "daily-training", label: "After daily runs" },
        { id: "u-long", value: "long-runs", label: "After long runs" },
        { id: "u-race", value: "racing", label: "Race / peak block recovery" },
        { id: "u-travel", value: "beginners", label: "Travel / compact tools" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-priority",
      key: "priorities",
      type: "multi-select",
      title: "What matters most?",
      required: true,
      maxSelections: 2,
      options: [
        { id: "p-massage", value: "massage", label: "Massage / percussion" },
        { id: "p-compress", value: "compression", label: "Compression" },
        { id: "p-mobility", value: "mobility", label: "Mobility / foam rolling" },
        { id: "p-value", value: "value", label: "Value" },
      ],
    },
    {
      id: "q-budget",
      key: "budget",
      type: "single-select",
      title: "Budget",
      required: true,
      options: ACCESSORY_BUDGETS.bands.map((b) => ({
        id: b.id,
        value: b.id,
        label: b.label,
      })),
    },
  ],
  scoringProfile: DEFAULT_SCORING,
  resultConfig: DEFAULT_RESULT,
  regionalBudgets: [ACCESSORY_BUDGETS],
};

export const runningAccessoriesFinderDefinition: FinderDefinition = {
  id: "finder-running-accessories",
  slug: "running-accessories-finder",
  toolId: "tool-running-accessories-finder",
  sportId: "sport-running",
  categoryId: "cat-headphones",
  categoryIds: [
    "cat-headphones",
    "cat-sunglasses",
    "cat-running-lights",
    "cat-safety",
    "cat-accessories",
  ],
  title: "Running Accessories Finder",
  description:
    "Match anti-chafe, headphones, sunglasses, lights and safety gear to the job — not one mixed accessories pile.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-primary",
      key: "primaryUse",
      type: "single-select",
      title: "What accessory are you shopping for?",
      required: true,
      options: [
        { id: "u-audio", value: "daily-training", label: "Headphones / audio" },
        { id: "u-sun", value: "racing", label: "Sunglasses" },
        { id: "u-light", value: "trail", label: "Headlamp / lights" },
        { id: "u-safe", value: "beginners", label: "Safety / visibility" },
        { id: "u-chafe", value: "long-runs", label: "Anti-chafe / skin rub" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-when",
      key: "terrain",
      type: "single-select",
      title: "When / where do you mainly run?",
      required: true,
      options: [
        { id: "t-road", value: "road", label: "Road / daylight" },
        { id: "t-dark", value: "mixed", label: "Dark / early mornings" },
        { id: "t-trail", value: "trail", label: "Trail" },
      ],
      affects: ["terrain", "useCases"],
    },
    {
      id: "q-priority",
      key: "priorities",
      type: "multi-select",
      title: "What matters most?",
      required: true,
      maxSelections: 2,
      options: [
        { id: "p-com", value: "comfort", label: "Comfort / fit" },
        { id: "p-bat", value: "battery", label: "Battery life" },
        { id: "p-secure", value: "secure", label: "Stay-put on the run" },
        { id: "p-value", value: "value", label: "Value" },
      ],
    },
    {
      id: "q-budget",
      key: "budget",
      type: "single-select",
      title: "Budget",
      required: true,
      options: ACCESSORY_BUDGETS.bands.map((b) => ({
        id: b.id,
        value: b.id,
        label: b.label,
      })),
    },
  ],
  scoringProfile: DEFAULT_SCORING,
  resultConfig: DEFAULT_RESULT,
  regionalBudgets: [ACCESSORY_BUDGETS],
};

export const runningGearFinderDefinitions: FinderDefinition[] = [
  runningClothingFinderDefinition,
  runningFuelFinderDefinition,
  runningRecoveryFinderDefinition,
  runningAccessoriesFinderDefinition,
];
