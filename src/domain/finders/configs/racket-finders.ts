/**
 * Shared Racket Match Finder configs.
 * Same Finder engine as Running/Fitness — sport-specific questions & weights only.
 */

import type { FinderDefinition } from "@/domain/finders/types";

const EUR_BUDGETS = {
  region: "NL" as const,
  currency: "EUR",
  bands: [
    { id: "under-100", label: "Under €100", max: 100, currency: "EUR" },
    { id: "100-180", label: "€100–€180", min: 100, max: 180, currency: "EUR" },
    { id: "180-280", label: "€180–€280", min: 180, max: 280, currency: "EUR" },
    { id: "280-plus", label: "€280+", min: 280, currency: "EUR" },
  ],
};

const DEFAULT_RESULT = {
  maxResults: 8,
  minMatchForDisplay: 40,
  minCoverageForTopRecommendation: 0.3,
};

const PADEL_SCORING = {
  baseWeights: {
    primaryUse: 22,
    budget: 14,
    priorities: 28,
    lifecycle: 4,
    value: 10,
    specs: 22,
  },
  priorityMultipliers: {
    control: { specs: 1.5, primaryUse: 1.2 },
    power: { specs: 1.5, primaryUse: 1.2 },
    forgiveness: { specs: 1.4 },
    maneuverability: { specs: 1.4 },
    comfort: { specs: 1.3 },
    spin: { specs: 1.2 },
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
};

const TENNIS_SCORING = {
  baseWeights: {
    primaryUse: 24,
    budget: 14,
    priorities: 26,
    lifecycle: 4,
    value: 10,
    specs: 22,
  },
  priorityMultipliers: {
    control: { specs: 1.5 },
    power: { specs: 1.5 },
    spin: { specs: 1.5 },
    forgiveness: { specs: 1.55, primaryUse: 1.25 },
    comfort: { specs: 1.4, primaryUse: 1.2 },
    maneuverability: { specs: 1.3 },
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
};

export const padelRacketFinderDefinition: FinderDefinition = {
  id: "finder-padel-rackets",
  slug: "padel-racket-finder",
  toolId: "tool-padel-racket-finder",
  sportId: "sport-padel",
  categoryId: "cat-padel-rackets",
  title: "Padel Racket Finder",
  description:
    "Find the right balance of control, power and maneuverability for how you play.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-experience",
      key: "primaryUse",
      type: "single-select",
      title: "What is your experience level?",
      required: true,
      options: [
        { id: "e-start", value: "beginner", label: "Just starting / beginner" },
        { id: "e-int", value: "intermediate", label: "Intermediate" },
        { id: "e-adv", value: "advanced", label: "Advanced" },
        { id: "e-comp", value: "competitive", label: "Competitive" },
      ],
      affects: ["useCases", "experience"],
    },
    {
      id: "q-current",
      key: "currentEquipment",
      type: "single-select",
      title: "Do you already have a racket?",
      required: false,
      options: [
        { id: "cur-yes", value: "yes", label: "Yes — I want to improve on it" },
        { id: "cur-no", value: "no", label: "No / starting fresh" },
      ],
    },
    {
      id: "q-change",
      key: "changeGoals",
      type: "multi-select",
      title: "What do you want to change vs your current racket?",
      required: false,
      maxSelections: 3,
      showWhen: { key: "currentEquipment", equals: "yes" },
      options: [
        { id: "c-pow", value: "more-power", label: "More power" },
        { id: "c-ctrl", value: "more-control", label: "More control" },
        { id: "c-light", value: "lighter", label: "Lighter / easier handling" },
        { id: "c-for", value: "more-forgiving", label: "More forgiving" },
        { id: "c-spin", value: "more-spin", label: "More spin" },
        { id: "c-sim", value: "similar-newer", label: "Similar but newer" },
      ],
    },
    {
      id: "q-style",
      key: "playingStyle",
      type: "single-select",
      title: "How do you like to play?",
      required: true,
      options: [
        { id: "s-ctrl", value: "control", label: "I prioritize control" },
        { id: "s-bal", value: "balanced", label: "Balanced" },
        { id: "s-pow", value: "power", label: "I like attacking / power" },
        { id: "s-fig", value: "figuring-out", label: "I'm still figuring it out" },
      ],
      showWhen: {
        key: "primaryUse",
        anyOf: ["intermediate", "advanced", "competitive"],
      },
    },
    {
      id: "q-priority",
      key: "priorities",
      type: "multi-select",
      title: "What matters most?",
      required: true,
      maxSelections: 3,
      options: [
        { id: "p-ctrl", value: "control", label: "Control" },
        { id: "p-pow", value: "power", label: "Power" },
        { id: "p-for", value: "forgiveness", label: "Forgiveness / sweet spot" },
        { id: "p-man", value: "maneuverability", label: "Maneuverability" },
        { id: "p-com", value: "comfort", label: "Comfort / easier handling" },
        { id: "p-spin", value: "spin", label: "Spin" },
        { id: "p-val", value: "value", label: "Value" },
      ],
    },
    {
      id: "q-weight",
      key: "weightPreference",
      type: "single-select",
      title: "Weight preference",
      required: true,
      options: [
        { id: "w-light", value: "light", label: "Light" },
        { id: "w-med", value: "medium", label: "Medium" },
        { id: "w-heavy", value: "heavy", label: "Heavy" },
        { id: "w-any", value: "any", label: "No preference" },
      ],
    },
    {
      id: "q-balance",
      key: "balancePreference",
      type: "single-select",
      title: "Balance preference",
      required: false,
      options: [
        { id: "b-easy", value: "low", label: "Easy to maneuver" },
        { id: "b-bal", value: "medium", label: "Balanced" },
        { id: "b-head", value: "head-heavy", label: "More weight through the shot" },
        { id: "b-any", value: "any", label: "No preference" },
      ],
    },
    {
      id: "q-feel",
      key: "feelPreference",
      type: "single-select",
      title: "Preferred feel",
      required: false,
      options: [
        { id: "f-soft", value: "softer", label: "Softer" },
        { id: "f-bal", value: "balanced", label: "Balanced" },
        { id: "f-firm", value: "firmer", label: "Firmer" },
        { id: "f-any", value: "any", label: "No preference" },
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
  scoringProfile: PADEL_SCORING,
  resultConfig: DEFAULT_RESULT,
  regionalBudgets: [EUR_BUDGETS],
};

export const tennisRacketFinderDefinition: FinderDefinition = {
  id: "finder-tennis-rackets",
  slug: "tennis-racket-finder",
  toolId: "tool-tennis-racket-finder",
  sportId: "sport-tennis",
  categoryId: "cat-tennis-rackets",
  title: "Tennis Racket Finder",
  description:
    "Match tennis rackets to experience, power vs control priorities and handling preferences.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-experience",
      key: "primaryUse",
      type: "single-select",
      title: "Experience level",
      required: true,
      options: [
        { id: "e-beg", value: "beginner", label: "Beginner" },
        { id: "e-int", value: "intermediate", label: "Intermediate" },
        { id: "e-adv", value: "advanced", label: "Advanced" },
      ],
      affects: ["useCases", "experience"],
    },
    {
      id: "q-style",
      key: "playingStyle",
      type: "single-select",
      title: "Playing priority",
      required: true,
      options: [
        { id: "s-for", value: "forgiveness", label: "Easy handling / forgiveness" },
        { id: "s-ctrl", value: "control", label: "Control" },
        { id: "s-pow", value: "power", label: "Power" },
        { id: "s-spin", value: "spin", label: "Spin" },
        { id: "s-bal", value: "balanced", label: "Balanced" },
      ],
    },
    {
      id: "q-priority",
      key: "priorities",
      type: "multi-select",
      title: "What matters most?",
      required: true,
      maxSelections: 3,
      options: [
        { id: "p-for", value: "forgiveness", label: "Forgiveness" },
        { id: "p-ctrl", value: "control", label: "Control" },
        { id: "p-pow", value: "power", label: "Power" },
        { id: "p-spin", value: "spin", label: "Spin" },
        { id: "p-man", value: "maneuverability", label: "Maneuverability" },
        { id: "p-val", value: "value", label: "Value" },
      ],
    },
    {
      id: "q-weight",
      key: "weightPreference",
      type: "single-select",
      title: "Preferred racket weight",
      required: true,
      options: [
        { id: "w-light", value: "light", label: "Lighter / easier swing" },
        { id: "w-med", value: "medium", label: "Medium" },
        { id: "w-heavy", value: "heavy", label: "Heavier / more stable" },
        { id: "w-any", value: "any", label: "No preference" },
      ],
    },
    {
      id: "q-budget",
      key: "budget",
      type: "single-select",
      title: "Budget",
      required: true,
      options: [
        { id: "b-120", value: "under-150", label: "Under €150" },
        { id: "b-220", value: "150-250", label: "€150–€250" },
        { id: "b-250", value: "250-plus", label: "€250+" },
      ],
    },
  ],
  scoringProfile: TENNIS_SCORING,
  resultConfig: DEFAULT_RESULT,
  regionalBudgets: [
    {
      region: "NL",
      currency: "EUR",
      bands: [
        { id: "under-150", label: "Under €150", max: 150, currency: "EUR" },
        { id: "150-250", label: "€150–€250", min: 150, max: 250, currency: "EUR" },
        { id: "250-plus", label: "€250+", min: 250, currency: "EUR" },
      ],
    },
  ],
};

/** Config-ready — expose only when catalog gate passes */
export const pickleballPaddleFinderDefinition: FinderDefinition = {
  id: "finder-pickleball-paddles",
  slug: "pickleball-paddle-finder",
  toolId: "tool-pickleball-paddle-finder",
  sportId: "sport-pickleball",
  categoryId: "cat-pickleball-paddles",
  title: "Pickleball Paddle Finder",
  description: "Match pickleball paddles to control, power and spin priorities.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: tennisRacketFinderDefinition.questions.slice(0, 4).map((q) => ({
    ...q,
    id: `pb-${q.id}`,
  })),
  scoringProfile: TENNIS_SCORING,
  resultConfig: DEFAULT_RESULT,
  regionalBudgets: [EUR_BUDGETS],
};

export const racketFinderDefinitions: FinderDefinition[] = [
  padelRacketFinderDefinition,
  tennisRacketFinderDefinition,
];

/** Finders registered but gated for publication by racket:qa */
export const racketFinderDefinitionsConfigReady: FinderDefinition[] = [
  pickleballPaddleFinderDefinition,
];

export function canPublishFinder(input: {
  candidateCount: number;
  brandCount: number;
  recommendationCount: number;
  minCandidates?: number;
  minBrands?: number;
}): boolean {
  const minC = input.minCandidates ?? 8;
  const minB = input.minBrands ?? 3;
  return (
    input.candidateCount >= minC &&
    input.brandCount >= minB &&
    input.recommendationCount >= Math.min(5, input.candidateCount)
  );
}
