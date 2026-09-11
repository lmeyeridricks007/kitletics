import type { FinderDefinition } from "@/domain/finders/types";

const EUR_BUDGETS = {
  region: "NL" as const,
  currency: "EUR",
  bands: [
    { id: "under-50", label: "Under €50", max: 50, currency: "EUR" },
    { id: "50-100", label: "€50–€100", min: 50, max: 100, currency: "EUR" },
    { id: "100-150", label: "€100–€150", min: 100, max: 150, currency: "EUR" },
    { id: "150-plus", label: "€150+", min: 150, currency: "EUR" },
  ],
};

const DEFAULT_RESULT = {
  maxResults: 8,
  minMatchForDisplay: 40,
  minCoverageForTopRecommendation: 0.35,
};

export const runningHrmFinderDefinition: FinderDefinition = {
  id: "finder-running-hrm",
  slug: "running-hrm-finder",
  toolId: "tool-running-hrm-finder",
  sportId: "sport-running",
  categoryId: "cat-hrm",
  title: "Running Heart Rate Monitor Finder",
  description:
    "Match chest straps and armband optical HRMs to training style, comfort and budget.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-primary",
      key: "primaryUse",
      type: "single-select",
      title: "What will you mainly use the HRM for?",
      required: true,
      options: [
        { id: "u-daily", value: "daily-training", label: "Daily training" },
        { id: "u-int", value: "intervals", label: "Intervals / track" },
        { id: "u-race", value: "racing", label: "Racing & PBs" },
        { id: "u-hyrox", value: "hyrox", label: "HYROX / mixed sessions" },
        { id: "u-trail", value: "trail", label: "Trail / long days" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-form",
      key: "formFactor",
      type: "single-select",
      title: "Preferred form factor",
      required: true,
      options: [
        { id: "f-chest", value: "chest", label: "Chest strap — max accuracy" },
        { id: "f-arm", value: "armband", label: "Armband / optical — no chest strap" },
        { id: "f-any", value: "any", label: "Either — best match wins" },
      ],
      affects: ["specs"],
    },
    {
      id: "q-dynamics",
      key: "needsDynamics",
      type: "boolean",
      title: "Do you need running dynamics (cadence, ground contact, etc.)?",
      required: true,
      options: [
        { id: "d-yes", value: "yes", label: "Yes — dynamics matter" },
        { id: "d-no", value: "no", label: "No — heart rate is enough" },
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
        { id: "p-acc", value: "accuracy", label: "Accuracy" },
        { id: "p-com", value: "comfort", label: "Comfort" },
        { id: "p-bat", value: "battery", label: "Battery life" },
        { id: "p-compat", value: "compatibility", label: "Watch / app pairing" },
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
  scoringProfile: {
    baseWeights: {
      primaryUse: 28,
      budget: 18,
      priorities: 18,
      lifecycle: 5,
      value: 12,
      specs: 19,
    },
    priorityMultipliers: {
      accuracy: { specs: 1.4 },
      comfort: { specs: 1.3 },
      battery: { specs: 1.2 },
      compatibility: { specs: 1.2 },
      value: { value: 1.5, budget: 1.3 },
    },
    budget: {
      withinScore: 100,
      slightOverRatio: 0.15,
      slightOverScore: 72,
      farOverRatio: 0.4,
      farOverScore: 35,
      noOfferScore: 55,
    },
  },
  resultConfig: DEFAULT_RESULT,
  regionalBudgets: [EUR_BUDGETS],
};

export const runningHrmFinderDefinitions: FinderDefinition[] = [
  runningHrmFinderDefinition,
];
