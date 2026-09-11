import type { FinderDefinition } from "@/domain/finders/types";

/**
 * Running Shoe Finder configuration.
 *
 * Weight rationale (baseWeights — relative before normalization):
 * - primaryUse (25): largest signal — daily vs race vs recovery drives UseCase reuse
 * - terrain (20): high-impact eligibility + soft scoring
 * - cushioning (12): preference, usually soft not hard
 * - budget (10): preference unless no regional offer
 * - width (10): hard when explicit wide/extra-wide
 * - stability (8): soft unless user says yes
 * - experience (5): context only
 * - lifecycle (5): prefer current generation lightly
 * - value (5): only boosted when user prioritizes value
 *
 * Weight calibration vs expert-labeled scenarios is FUTURE_ROADMAP
 * (FUT-FINDER-SCORING) — see docs/prelaunch/FUTURE_ROADMAP.md. Not Day-1 correctness debt.
 */
export const runningShoeFinderDefinition: FinderDefinition = {
  id: "finder-running-shoes",
  slug: "running-shoe-finder",
  toolId: "tool-shoe-finder",
  sportId: "sport-running",
  categoryId: "cat-running-shoes",
  title: "Running Shoe Finder",
  description:
    "Find shoes matched to the way you run — terrain, training, preferences and budget.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-sizing",
      key: "sizingRange",
      type: "single-select",
      title: "Which sizing range should we use?",
      description:
        "This filters shoes sold in that manufacturer sizing — not a question about gender identity.",
      required: true,
      options: [
        { id: "sz-women", value: "women", label: "Women's" },
        { id: "sz-men", value: "men", label: "Men's" },
        { id: "sz-unisex", value: "unisex", label: "Unisex / Show all" },
        { id: "sz-unsure", value: "unsure", label: "I'm not sure" },
      ],
      affects: ["genderFit"],
    },
    {
      id: "q-terrain",
      key: "terrain",
      type: "single-select",
      title: "Where will you mainly run?",
      description: "This helps us filter shoes for the right surface.",
      required: true,
      options: [
        { id: "t-road", value: "road", label: "Road" },
        { id: "t-trail", value: "trail", label: "Trail" },
        { id: "t-treadmill", value: "treadmill", label: "Treadmill" },
        { id: "t-mixed", value: "mixed", label: "Mixed road & trail" },
        { id: "t-track", value: "track", label: "Track" },
      ],
      affects: ["terrain", "discipline"],
    },
    {
      id: "q-primary-use",
      key: "primaryUse",
      type: "single-select",
      title: "What will you mainly use these shoes for?",
      required: true,
      options: [
        { id: "u-daily", value: "daily-training", label: "Daily training" },
        { id: "u-easy", value: "easy-runs", label: "Easy runs" },
        { id: "u-long", value: "long-runs", label: "Long runs" },
        { id: "u-tempo", value: "tempo", label: "Tempo / faster training" },
        { id: "u-intervals", value: "intervals", label: "Intervals" },
        { id: "u-racing", value: "racing", label: "Racing" },
        { id: "u-recovery", value: "recovery", label: "Recovery runs" },
        { id: "u-everything", value: "everything", label: "A bit of everything" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-race-distance",
      key: "raceDistance",
      type: "single-select",
      title: "What distance are you racing?",
      required: true,
      showWhen: { key: "primaryUse", equals: "racing" },
      options: [
        { id: "rd-5k", value: "5k", label: "5K" },
        { id: "rd-10k", value: "10k", label: "10K" },
        { id: "rd-half", value: "half", label: "Half Marathon" },
        { id: "rd-marathon", value: "marathon", label: "Marathon" },
        { id: "rd-ultra", value: "ultra", label: "Ultra" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-distances",
      key: "distances",
      type: "multi-select",
      title: "What distances matter most?",
      description: "Select all that apply.",
      required: false,
      maxSelections: 4,
      showWhen: { key: "primaryUse", anyOf: ["daily-training", "easy-runs", "long-runs", "everything", "tempo", "intervals", "recovery"] },
      options: [
        { id: "d-u5", value: "under-5k", label: "Under 5K" },
        { id: "d-5k", value: "5k", label: "5K" },
        { id: "d-10k", value: "10k", label: "10K" },
        { id: "d-half", value: "half", label: "Half Marathon" },
        { id: "d-marathon", value: "marathon", label: "Marathon" },
        { id: "d-ultra", value: "ultra", label: "Ultra" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-cushion",
      key: "cushioning",
      type: "single-select",
      title: "How much cushioning do you prefer?",
      required: true,
      options: [
        { id: "c-min", value: "minimal", label: "Minimal / ground feel" },
        { id: "c-bal", value: "balanced", label: "Balanced" },
        { id: "c-cush", value: "cushioned", label: "Cushioned" },
        { id: "c-max", value: "maximum", label: "Maximum cushioning" },
        { id: "c-none", value: "no-preference", label: "No preference" },
      ],
      affects: ["cushioning"],
    },
    {
      id: "q-stability",
      key: "stability",
      type: "single-select",
      title: "Do you prefer shoes with extra stability support?",
      description:
        "Only select “Yes” if you already know you want more support. We do not diagnose gait from this answer.",
      required: true,
      options: [
        {
          id: "s-no",
          value: "no",
          label: "Neutral / no extra support",
          description: "Standard daily trainers without a stability bias.",
        },
        {
          id: "s-yes",
          value: "yes",
          label: "Prefer more stability",
          description: "You already know you want extra support features.",
        },
        {
          id: "s-ns",
          value: "not-sure",
          label: "Not sure",
          description: "We'll rely more on your other answers.",
        },
      ],
      affects: ["stability"],
    },
    {
      id: "q-width",
      key: "width",
      type: "single-select",
      title: "What fit do you usually need?",
      required: true,
      options: [
        { id: "w-std", value: "standard", label: "Standard" },
        { id: "w-wide", value: "wide", label: "Wide" },
        { id: "w-xw", value: "extra-wide", label: "Extra wide" },
        { id: "w-narrow", value: "narrow", label: "Narrow" },
        { id: "w-ns", value: "not-sure", label: "Not sure" },
      ],
      affects: ["width"],
    },
    {
      id: "q-experience",
      key: "experience",
      type: "single-select",
      title: "How experienced are you with running?",
      required: true,
      options: [
        { id: "e-beg", value: "beginner", label: "Beginner" },
        { id: "e-int", value: "intermediate", label: "Intermediate" },
        { id: "e-adv", value: "advanced", label: "Advanced" },
      ],
      affects: ["experience"],
    },
    {
      id: "q-weight",
      key: "weight",
      type: "optional-number",
      title: "Roughly how much do you weigh? (optional)",
      description:
        "This can help us account for cushioning and durability preferences when data supports it. Exact values are not shared in links.",
      required: false,
      min: 30,
      max: 250,
      unitOptions: [
        { value: "kg", label: "kg" },
        { value: "lb", label: "lb" },
      ],
      affects: ["runnerWeight"],
    },
    {
      id: "q-priorities",
      key: "priorities",
      type: "multi-select",
      title: "What matters most?",
      description: "Choose up to 3.",
      required: true,
      maxSelections: 3,
      options: [
        { id: "p-comfort", value: "comfort", label: "Comfort" },
        { id: "p-speed", value: "speed", label: "Speed" },
        { id: "p-cushion", value: "cushioning", label: "Cushioning" },
        { id: "p-stability", value: "stability", label: "Stability" },
        { id: "p-weight", value: "low-weight", label: "Low weight" },
        { id: "p-durability", value: "durability", label: "Durability" },
        { id: "p-versatility", value: "versatility", label: "Versatility" },
        { id: "p-value", value: "value", label: "Value" },
        { id: "p-grip", value: "grip", label: "Grip" },
      ],
      affects: ["weights"],
    },
    {
      id: "q-budget",
      key: "budget",
      type: "single-select",
      title: "What's your budget?",
      required: true,
      options: [], // filled from regionalBudgets at runtime via option ids
      affects: ["budget"],
    },
  ],
  scoringProfile: {
    baseWeights: {
      primaryUse: 25,
      terrain: 20,
      cushioning: 12,
      budget: 10,
      width: 10,
      stability: 8,
      experience: 5,
      lifecycle: 5,
      value: 5,
    },
    priorityMultipliers: {
      comfort: { cushioning: 1.4, primaryUse: 1.1 },
      speed: { primaryUse: 1.35, cushioning: 0.85 },
      cushioning: { cushioning: 1.5 },
      stability: { stability: 1.6 },
      "low-weight": { primaryUse: 1.15 },
      durability: { lifecycle: 1.2, value: 1.1 },
      versatility: { primaryUse: 1.3, terrain: 1.1 },
      value: { value: 1.8, budget: 1.3 },
      grip: { terrain: 1.4 },
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
  resultConfig: {
    minMatchForDisplay: 60,
    minCoverageForTopRecommendation: 0.45,
    maxResults: 5,
    catalogCoverageMessage:
      "Kitletics recommendations are based on products currently included in our verified catalog.",
  },
  regionalBudgets: [
    {
      region: "NL",
      currency: "EUR",
      bands: [
        { id: "under-100", label: "Under €100", max: 99.99, currency: "EUR" },
        { id: "100-150", label: "€100–€150", min: 100, max: 150, currency: "EUR" },
        { id: "150-200", label: "€150–€200", min: 150, max: 200, currency: "EUR" },
        { id: "200-plus", label: "€200+", min: 200, currency: "EUR" },
        { id: "no-limit", label: "No budget limit", currency: "EUR" },
      ],
    },
    {
      region: "UK",
      currency: "GBP",
      bands: [
        { id: "under-100", label: "Under £100", max: 99.99, currency: "GBP" },
        { id: "100-150", label: "£100–£150", min: 100, max: 150, currency: "GBP" },
        { id: "150-200", label: "£150–£200", min: 150, max: 200, currency: "GBP" },
        { id: "200-plus", label: "£200+", min: 200, currency: "GBP" },
        { id: "no-limit", label: "No budget limit", currency: "GBP" },
      ],
    },
    {
      region: "US",
      currency: "USD",
      bands: [
        { id: "under-100", label: "Under $100", max: 99.99, currency: "USD" },
        { id: "100-150", label: "$100–$150", min: 100, max: 150, currency: "USD" },
        { id: "150-200", label: "$150–$200", min: 150, max: 200, currency: "USD" },
        { id: "200-plus", label: "$200+", min: 200, currency: "USD" },
        { id: "no-limit", label: "No budget limit", currency: "USD" },
      ],
    },
  ],
};

/** Resolve budget question options for active region */
export function withRegionalBudgetOptions(
  definition: FinderDefinition,
  region: string,
): FinderDefinition {
  const budget =
    definition.regionalBudgets.find((b) => b.region === region) ??
    definition.regionalBudgets[0];
  const questions = definition.questions.map((q) => {
    if (q.key !== definition.budgetKey) return q;
    return {
      ...q,
      options: budget.bands.map((band) => ({
        id: `b-${band.id}`,
        value: band.id,
        label: band.label,
      })),
    };
  });
  return { ...definition, questions };
}
