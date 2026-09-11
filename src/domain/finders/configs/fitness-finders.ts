import type { FinderDefinition } from "@/domain/finders/types";

const EUR_BUDGETS = {
  region: "NL" as const,
  currency: "EUR",
  bands: [
    { id: "under-100", label: "Under €100", max: 100, currency: "EUR" },
    { id: "100-200", label: "€100–€200", min: 100, max: 200, currency: "EUR" },
    { id: "200-400", label: "€200–€400", min: 200, max: 400, currency: "EUR" },
    { id: "400-plus", label: "€400+", min: 400, currency: "EUR" },
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
    stability: { specs: 1.4 },
    value: { value: 1.5, budget: 1.3 },
    durability: { specs: 1.3 },
    footprint: { specs: 1.4 },
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

export const trainingShoeFinderDefinition: FinderDefinition = {
  id: "finder-training-shoes",
  slug: "training-shoe-finder",
  toolId: "tool-training-shoe-finder",
  sportId: "sport-training",
  categoryId: "cat-training-shoes",
  title: "Training Shoe Finder",
  description:
    "Match training shoes to lifting, conditioning, HYROX and gym-floor priorities.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-primary",
      key: "primaryUse",
      type: "single-select",
      title: "What will you mainly use these shoes for?",
      required: true,
      options: [
        { id: "u-gym", value: "gym", label: "General gym training" },
        { id: "u-lift", value: "lifting", label: "Heavy lifting / Olympic lifting" },
        { id: "u-cond", value: "conditioning", label: "Metcons / conditioning" },
        { id: "u-hyrox", value: "hyrox", label: "HYROX training" },
        { id: "u-mix", value: "mixed", label: "Mixed training" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-run",
      key: "includesRunning",
      type: "boolean",
      title: "Will you run in these shoes as part of training?",
      required: true,
      options: [
        { id: "r-yes", value: "yes", label: "Yes" },
        { id: "r-no", value: "no", label: "No" },
      ],
    },
    {
      id: "q-stability",
      key: "stability",
      type: "single-select",
      title: "How important is lateral stability?",
      required: true,
      options: [
        { id: "s-high", value: "high", label: "High — heavy lifts / lateral work" },
        { id: "s-med", value: "medium", label: "Moderate" },
        { id: "s-flex", value: "flexible", label: "Prefer more flexible ride" },
      ],
    },
    {
      id: "q-priority",
      key: "priorities",
      type: "multi-select",
      title: "What matters most?",
      required: true,
      maxSelections: 2,
      options: [
        { id: "p-stab", value: "stability", label: "Stability" },
        { id: "p-flex", value: "flexibility", label: "Flexibility" },
        { id: "p-run", value: "running", label: "Running comfort" },
        { id: "p-value", value: "value", label: "Value" },
        { id: "p-dur", value: "durability", label: "Durability" },
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

export const hyroxShoeFinderDefinition: FinderDefinition = {
  id: "finder-hyrox-shoes",
  slug: "hyrox-shoe-finder",
  toolId: "tool-hyrox-shoe-finder",
  sportId: "sport-training",
  categoryId: "cat-training-shoes",
  categoryIds: ["cat-training-shoes", "cat-running-shoes"],
  title: "HYROX Shoe Finder",
  description:
    "Find shoes for HYROX race day or training — balancing run legs with station work.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-mode",
      key: "primaryUse",
      type: "single-select",
      title: "Race day or training?",
      required: true,
      options: [
        { id: "m-race", value: "hyrox-race", label: "Race day" },
        { id: "m-train", value: "hyrox-training", label: "Training" },
        { id: "m-both", value: "mixed", label: "Both" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-runner",
      key: "runningAbility",
      type: "single-select",
      title: "How important is the running portion for you?",
      required: true,
      options: [
        { id: "ra-high", value: "run-priority", label: "I am a strong runner — prioritize run pace" },
        { id: "ra-bal", value: "balanced", label: "Balanced run + stations" },
        { id: "ra-str", value: "strength-priority", label: "Stations / strength feel more limiting" },
      ],
    },
    {
      id: "q-stab",
      key: "stability",
      type: "single-select",
      title: "Stability preference",
      required: true,
      options: [
        { id: "st-high", value: "high", label: "High — sled and lunges matter" },
        { id: "st-med", value: "medium", label: "Moderate" },
        { id: "st-run", value: "run-feel", label: "Prefer more running shoe feel" },
      ],
    },
    {
      id: "q-priority",
      key: "priorities",
      type: "multi-select",
      title: "Priorities",
      required: true,
      maxSelections: 3,
      options: [
        { id: "p-run", value: "running", label: "Running speed" },
        { id: "p-stab", value: "stability", label: "Station stability" },
        { id: "p-grip", value: "traction", label: "Grip / traction" },
        { id: "p-comfort", value: "comfort", label: "Comfort" },
        { id: "p-light", value: "lightweight", label: "Light weight" },
        { id: "p-vers", value: "versatility", label: "Versatility" },
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
    ...DEFAULT_SCORING,
    baseWeights: {
      primaryUse: 30,
      budget: 12,
      priorities: 25,
      lifecycle: 5,
      value: 8,
      specs: 20,
    },
  },
  resultConfig: DEFAULT_RESULT,
  regionalBudgets: [EUR_BUDGETS],
};

export const adjustableDumbbellFinderDefinition: FinderDefinition = {
  id: "finder-adjustable-dumbbells",
  slug: "adjustable-dumbbell-finder",
  toolId: "tool-adjustable-dumbbell-finder",
  sportId: "sport-training",
  categoryId: "cat-adjustable-dumbbells",
  title: "Adjustable Dumbbell Finder",
  description:
    "Match adjustable dumbbells to weight range, space and budget.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-max",
      key: "primaryUse",
      type: "single-select",
      title: "Maximum weight you need (per hand)?",
      required: true,
      options: [
        { id: "w-50", value: "light", label: "Up to ~25 kg" },
        { id: "w-80", value: "medium", label: "Up to ~36 kg" },
        { id: "w-100", value: "heavy", label: "40 kg+ / heavy lifting" },
      ],
    },
    {
      id: "q-space",
      key: "space",
      type: "single-select",
      title: "Available storage space",
      required: true,
      options: [
        { id: "sp-tiny", value: "small", label: "Very limited" },
        { id: "sp-mod", value: "moderate", label: "Moderate" },
        { id: "sp-ok", value: "open", label: "Space is less of a constraint" },
      ],
    },
    {
      id: "q-priority",
      key: "priorities",
      type: "multi-select",
      title: "What matters most?",
      required: true,
      maxSelections: 2,
      options: [
        { id: "p-range", value: "range", label: "Weight range" },
        { id: "p-speed", value: "adjustment", label: "Adjustment speed" },
        { id: "p-foot", value: "footprint", label: "Small footprint" },
        { id: "p-value", value: "value", label: "Value" },
        { id: "p-dur", value: "durability", label: "Durability" },
      ],
    },
    {
      id: "q-budget",
      key: "budget",
      type: "single-select",
      title: "Budget (pair)",
      required: true,
      options: [
        { id: "b-300", value: "under-400", label: "Under €400" },
        { id: "b-600", value: "400-800", label: "€400–€800" },
        { id: "b-800", value: "800-plus", label: "€800+" },
      ],
    },
  ],
  scoringProfile: DEFAULT_SCORING,
  resultConfig: DEFAULT_RESULT,
  regionalBudgets: [
    {
      region: "NL",
      currency: "EUR",
      bands: [
        { id: "under-400", label: "Under €400", max: 400, currency: "EUR" },
        { id: "400-800", label: "€400–€800", min: 400, max: 800, currency: "EUR" },
        { id: "800-plus", label: "€800+", min: 800, currency: "EUR" },
      ],
    },
  ],
};

export const powerRackFinderDefinition: FinderDefinition = {
  id: "finder-power-racks",
  slug: "power-rack-finder",
  toolId: "tool-power-rack-finder",
  sportId: "sport-training",
  categoryId: "cat-power-racks",
  title: "Power Rack Finder",
  description:
    "Find racks that fit your ceiling height, footprint and training goals.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-ceiling",
      key: "ceilingHeightCm",
      type: "number",
      title: "Ceiling height (cm)",
      description:
        "Products taller than your room are ineligible. Unknown rack height reduces fit confidence.",
      required: true,
      min: 200,
      max: 400,
    },
    {
      id: "q-goals",
      key: "primaryUse",
      type: "single-select",
      title: "Primary training goal",
      required: true,
      options: [
        { id: "g-str", value: "strength", label: "General strength" },
        { id: "g-pl", value: "powerlifting", label: "Powerlifting" },
        { id: "g-oly", value: "olympic", label: "Olympic lifting / taller pulls" },
        { id: "g-home", value: "home", label: "Compact home gym" },
      ],
    },
    {
      id: "q-mount",
      key: "wallMount",
      type: "boolean",
      title: "Can you bolt to the floor or wall if required?",
      required: true,
      options: [
        { id: "m-yes", value: "yes", label: "Yes" },
        { id: "m-no", value: "no", label: "No — freestanding preferred" },
      ],
    },
    {
      id: "q-priority",
      key: "priorities",
      type: "multi-select",
      title: "Priorities",
      required: true,
      maxSelections: 2,
      options: [
        { id: "p-cap", value: "capacity", label: "Load capacity" },
        { id: "p-eco", value: "ecosystem", label: "Attachment ecosystem" },
        { id: "p-foot", value: "footprint", label: "Smaller footprint" },
        { id: "p-value", value: "value", label: "Value" },
      ],
    },
    {
      id: "q-budget",
      key: "budget",
      type: "single-select",
      title: "Budget",
      required: true,
      options: [
        { id: "b-500", value: "under-800", label: "Under €800" },
        { id: "b-1200", value: "800-1500", label: "€800–€1,500" },
        { id: "b-1500", value: "1500-plus", label: "€1,500+" },
      ],
    },
  ],
  scoringProfile: DEFAULT_SCORING,
  resultConfig: DEFAULT_RESULT,
  regionalBudgets: [
    {
      region: "NL",
      currency: "EUR",
      bands: [
        { id: "under-800", label: "Under €800", max: 800, currency: "EUR" },
        { id: "800-1500", label: "€800–€1,500", min: 800, max: 1500, currency: "EUR" },
        { id: "1500-plus", label: "€1,500+", min: 1500, currency: "EUR" },
      ],
    },
  ],
};

export const treadmillFinderDefinition: FinderDefinition = {
  id: "finder-treadmills",
  slug: "treadmill-finder",
  toolId: "tool-treadmill-finder",
  sportId: "sport-training",
  categoryId: "cat-treadmills",
  title: "Treadmill Finder",
  description:
    "Match home treadmills to walking, jogging, sprint conditioning, folding needs and budget.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-primary",
      key: "primaryUse",
      type: "single-select",
      title: "Primary use",
      required: true,
      options: [
        { id: "u-walk", value: "walking", label: "Walking" },
        { id: "u-jog", value: "jogging", label: "Jogging / easy running" },
        { id: "u-int", value: "intervals", label: "Intervals / sprints" },
        { id: "u-mix", value: "mixed", label: "Mixed cardio" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-fold",
      key: "needsFolding",
      type: "boolean",
      title: "Do you need a folding treadmill?",
      required: true,
      options: [
        { id: "f-yes", value: "yes", label: "Yes — must fold" },
        { id: "f-no", value: "no", label: "No — dedicated space" },
      ],
    },
    {
      id: "q-motor",
      key: "preferMotorised",
      type: "single-select",
      title: "Drive preference",
      required: true,
      options: [
        { id: "m-yes", value: "motorised", label: "Motorised" },
        { id: "m-curve", value: "curved", label: "Curved / self-powered" },
        { id: "m-any", value: "any", label: "Either" },
      ],
    },
    {
      id: "q-priority",
      key: "priorities",
      type: "multi-select",
      title: "Priorities",
      required: true,
      maxSelections: 2,
      options: [
        { id: "p-run", value: "running", label: "Running quality" },
        { id: "p-space", value: "footprint", label: "Smaller footprint" },
        { id: "p-quiet", value: "quiet", label: "Apartment quiet" },
        { id: "p-value", value: "value", label: "Value" },
      ],
    },
    {
      id: "q-budget",
      key: "budget",
      type: "single-select",
      title: "Budget",
      required: true,
      options: [
        { id: "b-800", value: "under-1000", label: "Under €1,000" },
        { id: "b-2k", value: "1000-2500", label: "€1,000–€2,500" },
        { id: "b-2kplus", value: "2500-plus", label: "€2,500+" },
      ],
    },
  ],
  scoringProfile: DEFAULT_SCORING,
  resultConfig: DEFAULT_RESULT,
  regionalBudgets: [
    {
      region: "NL",
      currency: "EUR",
      bands: [
        { id: "under-1000", label: "Under €1,000", max: 1000, currency: "EUR" },
        { id: "1000-2500", label: "€1,000–€2,500", min: 1000, max: 2500, currency: "EUR" },
        { id: "2500-plus", label: "€2,500+", min: 2500, currency: "EUR" },
      ],
    },
  ],
};

export const pullUpBarFinderDefinition: FinderDefinition = {
  id: "finder-pull-up-bars",
  slug: "pull-up-bar-finder",
  toolId: "tool-pull-up-bar-finder",
  sportId: "sport-training",
  categoryId: "cat-pull-up-bars",
  title: "Pull-Up Bar Finder",
  description:
    "Match pull-up bars to mounting options, clearance and skill goals.",
  version: "v1",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-mount",
      key: "primaryUse",
      type: "single-select",
      title: "Preferred mounting",
      required: true,
      options: [
        { id: "m-door", value: "doorway", label: "Doorway" },
        { id: "m-wall", value: "wall", label: "Wall-mounted" },
        { id: "m-free", value: "freestanding", label: "Free-standing" },
        { id: "m-any", value: "any", label: "Any that fits" },
      ],
    },
    {
      id: "q-skill",
      key: "skillGoal",
      type: "single-select",
      title: "Primary skill goal",
      required: true,
      options: [
        { id: "sk-pu", value: "pull-ups", label: "Pull-ups / chin-ups" },
        { id: "sk-mu", value: "muscle-up", label: "Muscle-up practice" },
        { id: "sk-w", value: "weighted", label: "Weighted pull-ups" },
      ],
      description:
        "Muscle-up suitability requires adequate clearance — we do not claim it without geometry support.",
    },
    {
      id: "q-ceiling",
      key: "ceilingHeightCm",
      type: "number",
      title: "Ceiling height (cm)",
      required: false,
      min: 200,
      max: 400,
    },
    {
      id: "q-priority",
      key: "priorities",
      type: "multi-select",
      title: "Priorities",
      required: true,
      maxSelections: 2,
      options: [
        { id: "p-cap", value: "capacity", label: "Weight capacity" },
        { id: "p-grip", value: "grips", label: "Grip variety" },
        { id: "p-port", value: "portability", label: "Portability" },
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

const WATCH_BUDGETS = {
  region: "NL" as const,
  currency: "EUR",
  bands: [
    { id: "under-200", label: "Under €200", max: 200, currency: "EUR" },
    { id: "200-400", label: "€200–€400", min: 200, max: 400, currency: "EUR" },
    { id: "400-600", label: "€400–€600", min: 400, max: 600, currency: "EUR" },
    { id: "600-plus", label: "€600+", min: 600, currency: "EUR" },
  ],
};

export const fitnessWatchFinderDefinition: FinderDefinition = {
  id: "finder-fitness-watches",
  slug: "fitness-watch-finder",
  toolId: "tool-watch-finder",
  sportId: "sport-running",
  categoryId: "cat-gps-watches",
  title: "Running GPS Watch Finder",
  description:
    "Match GPS running watches to training goals, maps, battery, music, size and ecosystem.",
  version: "v2",
  priorityKey: "priorities",
  budgetKey: "budget",
  questions: [
    {
      id: "q-primary",
      key: "primaryUse",
      type: "single-select",
      title: "What will you mainly use the watch for?",
      required: true,
      options: [
        { id: "u-daily", value: "daily-training", label: "Daily training & fitness" },
        { id: "u-race", value: "racing", label: "Racing & PBs" },
        { id: "u-long", value: "long-runs", label: "Long runs & high mileage" },
        { id: "u-trail", value: "trail", label: "Trail / ultra" },
        { id: "u-multi", value: "multisport", label: "Multisport (run + bike + swim)" },
      ],
      affects: ["useCases"],
    },
    {
      id: "q-maps",
      key: "needsMaps",
      type: "boolean",
      title: "Do you need full offline maps / navigation?",
      required: true,
      options: [
        { id: "m-yes", value: "yes", label: "Yes — maps matter" },
        { id: "m-no", value: "no", label: "No — turn-by-turn or none is fine" },
      ],
    },
    {
      id: "q-battery",
      key: "batteryPriority",
      type: "boolean",
      title: "Is multi-day GPS battery a top priority?",
      required: true,
      options: [
        { id: "b-yes", value: "yes", label: "Yes — long GPS days matter" },
        { id: "b-no", value: "no", label: "No — normal training battery is fine" },
      ],
    },
    {
      id: "q-music",
      key: "needsMusic",
      type: "boolean",
      title: "Do you need onboard music storage?",
      required: true,
      options: [
        { id: "mu-yes", value: "yes", label: "Yes — music without a phone" },
        { id: "mu-no", value: "no", label: "No — phone or none is fine" },
      ],
    },
    {
      id: "q-size",
      key: "watchSize",
      type: "single-select",
      title: "Watch size preference",
      required: true,
      options: [
        { id: "sz-compact", value: "compact", label: "Compact — smaller wrists / lighter feel" },
        { id: "sz-standard", value: "standard", label: "Standard — typical running watch size" },
      ],
    },
    {
      id: "q-ecosystem",
      key: "ecosystem",
      type: "single-select",
      title: "Preferred brand ecosystem",
      required: true,
      options: [
        { id: "eco-any", value: "any", label: "Any — best match wins" },
        { id: "eco-garmin", value: "garmin", label: "Garmin" },
        { id: "eco-coros", value: "coros", label: "COROS" },
        { id: "eco-apple", value: "apple", label: "Apple" },
        { id: "eco-polar", value: "polar", label: "Polar" },
      ],
    },
    {
      id: "q-budget",
      key: "budget",
      type: "single-select",
      title: "Budget",
      required: true,
      options: WATCH_BUDGETS.bands.map((b) => ({
        id: b.id,
        value: b.id,
        label: b.label,
      })),
    },
  ],
  scoringProfile: {
    baseWeights: {
      primaryUse: 22,
      budget: 18,
      lifecycle: 5,
      value: 12,
      specs: 28,
      experience: 5,
      priorities: 10,
    },
    priorityMultipliers: {
      maps: { specs: 1.5 },
      battery: { specs: 1.4 },
      music: { specs: 1.3 },
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
  regionalBudgets: [WATCH_BUDGETS],
};

export const fitnessFinderDefinitions: FinderDefinition[] = [
  trainingShoeFinderDefinition,
  hyroxShoeFinderDefinition,
  adjustableDumbbellFinderDefinition,
  powerRackFinderDefinition,
  treadmillFinderDefinition,
  pullUpBarFinderDefinition,
  fitnessWatchFinderDefinition,
];
