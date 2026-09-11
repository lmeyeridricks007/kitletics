/**
 * Guide-context factor configuration for Best / Use-Case decision guides.
 * Drives “what we look for”, decision comparison columns, and methodology copy.
 * Do not hardcode long-run (or other) logic in UI components — resolve via this config.
 */

export type GuideFactorImportance = "high" | "medium" | "low";

export interface GuideContextFactor {
  key: string;
  label: string;
  /** User-facing “why it matters for this context” — never expose raw weights */
  whyItMatters: string;
  importance: GuideFactorImportance;
}

export interface GuideContextComparisonColumn {
  key: string;
  label: string;
  /** How to derive cell text from a recommendation block */
  source:
    | "decisionRole"
    | "paceCharacter"
    | "bestForProfiles"
    | "tradeoffs"
    | "summary"
    | "cushionFeel"
    | "stabilityFeel"
    | "rideCharacter"
    | "weight"
    | "keyTradeoff";
}

export interface GuideContextConfig {
  /** Matches primary useCaseId or guide slug fragment */
  id: string;
  useCaseIds: string[];
  guideSlugIncludes?: string[];
  label: string;
  /** Teaching sentence for “what makes a good X” */
  whatMattersFallback: string;
  factors: GuideContextFactor[];
  comparisonColumns: GuideContextComparisonColumn[];
  methodologyEmphasis: string;
}

const LONG_RUNS: GuideContextConfig = {
  id: "long-runs",
  useCaseIds: ["uc-long-runs"],
  guideSlugIncludes: ["long-runs", "long-run"],
  label: "Long runs",
  whatMattersFallback:
    "Long runs place different demands on footwear than shorter daily sessions. Comfort remains important as time on feet increases, but cushioning alone is not enough. Stability, fit, weight, durability and how the ride behaves when fatigue sets in all influence whether a shoe remains enjoyable deep into a run.",
  factors: [
    {
      key: "comfort",
      label: "Sustained comfort",
      whyItMatters:
        "Enough cushioning and upper comfort for time on feet — not just the first few kilometres.",
      importance: "high",
    },
    {
      key: "cushioning",
      label: "Cushioning depth",
      whyItMatters:
        "Protection for longer sessions without forcing an overly soft, unstable platform.",
      importance: "high",
    },
    {
      key: "stability",
      label: "Stable platform",
      whyItMatters:
        "Predictable underfoot feel when form becomes less precise late in the run.",
      importance: "high",
    },
    {
      key: "fit",
      label: "Secure fit",
      whyItMatters:
        "Holds the foot without becoming restrictive as swelling and fatigue build.",
      importance: "high",
    },
    {
      key: "paceVersatility",
      label: "Pace versatility",
      whyItMatters:
        "Useful if long runs include steady or marathon-pace work, not only easy jogging.",
      importance: "medium",
    },
    {
      key: "durability",
      label: "Durability",
      whyItMatters:
        "Able to tolerate frequent high-volume use across a training block.",
      importance: "medium",
    },
  ],
  comparisonColumns: [
    { key: "bestType", label: "Best type of long run", source: "decisionRole" },
    { key: "cushion", label: "Cushion feel", source: "cushionFeel" },
    { key: "stability", label: "Stability", source: "stabilityFeel" },
    { key: "ride", label: "Ride character", source: "rideCharacter" },
    { key: "pace", label: "Pace range", source: "paceCharacter" },
    { key: "tradeoff", label: "Key trade-off", source: "keyTradeoff" },
  ],
  methodologyEmphasis:
    "For long-run shoes we place particular emphasis on sustained comfort, cushioning, stability, fit, durability and how versatile the ride remains over longer sessions. We then compare eligible products against the same long-run criteria and select recommendations that cover meaningfully different runner needs.",
};

const MARATHON: GuideContextConfig = {
  id: "marathon",
  useCaseIds: ["uc-marathon", "uc-marathon-training"],
  guideSlugIncludes: ["marathon"],
  label: "Marathon training",
  whatMattersFallback:
    "Marathon training mixes easy volume, long runs and race-pace work. Shoes that stay comfortable for long sessions while remaining usable for steady or marathon-pace efforts usually serve the block better than pure race flats or ultra-soft recovery shoes alone.",
  factors: [
    {
      key: "comfort",
      label: "Long-session comfort",
      whyItMatters: "Weekly volume and long runs dominate most marathon plans.",
      importance: "high",
    },
    {
      key: "cushioning",
      label: "Cushioning",
      whyItMatters: "Protection across repeated long efforts and peak weeks.",
      importance: "high",
    },
    {
      key: "paceVersatility",
      label: "Pace versatility",
      whyItMatters: "Ability to handle easy mileage and controlled marathon-pace segments.",
      importance: "high",
    },
    {
      key: "durability",
      label: "Durability",
      whyItMatters: "High cumulative kilometres before race day.",
      importance: "medium",
    },
    {
      key: "stability",
      label: "Stability",
      whyItMatters: "Predictable platform when fatigue accumulates in long runs.",
      importance: "medium",
    },
  ],
  comparisonColumns: [
    { key: "bestType", label: "Best role", source: "decisionRole" },
    { key: "cushion", label: "Cushion feel", source: "cushionFeel" },
    { key: "pace", label: "Pace range", source: "paceCharacter" },
    { key: "tradeoff", label: "Key trade-off", source: "keyTradeoff" },
  ],
  methodologyEmphasis:
    "For marathon-oriented picks we emphasise long-session comfort, cushioning, pace versatility and durability across a training block — not race-day speed alone.",
};

const BEGINNERS: GuideContextConfig = {
  id: "beginners",
  useCaseIds: ["uc-beginners", "uc-first-5k", "uc-new-runners"],
  guideSlugIncludes: ["beginner"],
  label: "Beginners",
  whatMattersFallback:
    "Beginners need a forgiving daily trainer that is easy to fit, comfortable for easy miles, and versatile enough to cover early training without race plates or extreme geometry.",
  factors: [
    {
      key: "fit",
      label: "Predictable fit",
      whyItMatters:
        "Clear sizing and lockdown reduce early frustration — width options help.",
      importance: "high",
    },
    {
      key: "comfort",
      label: "Approachable comfort",
      whyItMatters: "Protective easy-mile cushioning without demanding advanced gait know-how.",
      importance: "high",
    },
    {
      key: "versatility",
      label: "Daily versatility",
      whyItMatters: "One shoe that covers most early training beats a specialist rotation.",
      importance: "high",
    },
    {
      key: "value",
      label: "First-pair value",
      whyItMatters: "Performance relative to typical street pricing matters early on.",
      importance: "medium",
    },
  ],
  comparisonColumns: [
    { key: "bestType", label: "Best role", source: "decisionRole" },
    { key: "cushion", label: "Cushion feel", source: "cushionFeel" },
    { key: "tradeoff", label: "Key trade-off", source: "keyTradeoff" },
  ],
  methodologyEmphasis:
    "Beginner guides prioritise fit, approachable cushioning and daily versatility over race-day speed or niche workout geometry.",
};

const DAILY: GuideContextConfig = {
  id: "daily-trainers",
  useCaseIds: ["uc-daily-trainers", "uc-daily"],
  guideSlugIncludes: ["daily"],
  label: "Daily trainers",
  whatMattersFallback:
    "A strong daily trainer balances comfort for frequent easy runs with enough durability and versatility to handle mixed training without needing a different shoe every day.",
  factors: [
    {
      key: "comfort",
      label: "Everyday comfort",
      whyItMatters: "Most kilometres in a week are easy or moderate.",
      importance: "high",
    },
    {
      key: "durability",
      label: "Durability",
      whyItMatters: "High weekly use demands lasting foam and outsole.",
      importance: "high",
    },
    {
      key: "versatility",
      label: "Versatility",
      whyItMatters: "Useful across easy days and some steady work.",
      importance: "medium",
    },
    {
      key: "fit",
      label: "Fit",
      whyItMatters: "Reliable fit for repeated wear.",
      importance: "high",
    },
  ],
  comparisonColumns: [
    { key: "bestType", label: "Best role", source: "decisionRole" },
    { key: "cushion", label: "Cushion feel", source: "cushionFeel" },
    { key: "tradeoff", label: "Key trade-off", source: "keyTradeoff" },
  ],
  methodologyEmphasis:
    "Daily-trainer guides prioritise everyday comfort, durability, fit and practical versatility over race-specific speed.",
};

const STABILITY: GuideContextConfig = {
  id: "stability",
  useCaseIds: ["uc-stability", "uc-support"],
  guideSlugIncludes: ["stability"],
  label: "Stability",
  whatMattersFallback:
    "Stability shoes prioritise a supportive, predictable platform for runners who want guidance or a broader base — not soft maximal cushioning alone.",
  factors: [
    {
      key: "stability",
      label: "Supportive platform",
      whyItMatters: "Guidance and geometry that feel secure under load.",
      importance: "high",
    },
    {
      key: "fit",
      label: "Secure fit",
      whyItMatters: "Holds the midfoot without hotspots on longer runs.",
      importance: "high",
    },
    {
      key: "comfort",
      label: "Comfort",
      whyItMatters: "Support should remain wearable for training volume.",
      importance: "high",
    },
    {
      key: "ride",
      label: "Ride quality",
      whyItMatters: "Support without an overly harsh or restrictive feel.",
      importance: "medium",
    },
  ],
  comparisonColumns: [
    { key: "bestType", label: "Best role", source: "decisionRole" },
    { key: "stability", label: "Stability feel", source: "stabilityFeel" },
    { key: "tradeoff", label: "Key trade-off", source: "keyTradeoff" },
  ],
  methodologyEmphasis:
    "Stability guides weigh supportive geometry, fit and wearable comfort more heavily than pure race responsiveness.",
};

const WIDE_FEET: GuideContextConfig = {
  id: "wide-feet",
  useCaseIds: ["uc-wide-feet", "uc-wide"],
  guideSlugIncludes: ["wide"],
  label: "Wide feet",
  whatMattersFallback:
    "For wide feet, official width options, forefoot volume and a secure midfoot matter more than stack height or race geometry alone.",
  factors: [
    {
      key: "officialWidths",
      label: "Official widths",
      whyItMatters: "Verified wide / 2E / 4E availability when published by the brand.",
      importance: "high",
    },
    {
      key: "forefootFit",
      label: "Forefoot fit",
      whyItMatters: "Room through the toes without a collapsing upper.",
      importance: "high",
    },
    {
      key: "upperVolume",
      label: "Upper volume",
      whyItMatters: "Enough volume for wider feet without excessive slip.",
      importance: "high",
    },
    {
      key: "stability",
      label: "Platform stability",
      whyItMatters: "A secure base when the foot needs more room up top.",
      importance: "medium",
    },
  ],
  comparisonColumns: [
    { key: "bestType", label: "Best role", source: "decisionRole" },
    { key: "tradeoff", label: "Key trade-off", source: "keyTradeoff" },
  ],
  methodologyEmphasis:
    "Wide-feet guides prioritise official width options and fit volume over generic comfort claims.",
};

const TEMPO: GuideContextConfig = {
  id: "tempo",
  useCaseIds: ["uc-tempo-runs", "uc-intervals", "uc-speed-work"],
  guideSlugIncludes: ["tempo"],
  label: "Tempo / workouts",
  whatMattersFallback:
    "Tempo and workout shoes are judged on how they behave at controlled hard paces — not how soft they feel on recovery jogs. Responsiveness, plate or geometry character, secure fit under pace, and durability across a training block matter more than max cushioning or race-day stiffness alone.",
  factors: [
    {
      key: "responsiveness",
      label: "Responsiveness at tempo",
      whyItMatters:
        "The shoe should feel alive at threshold and interval paces without needing race-day aggression.",
      importance: "high",
    },
    {
      key: "ride",
      label: "Workout ride character",
      whyItMatters:
        "Nylon/composite plates and firm foams change how surges and repeats feel underfoot.",
      importance: "high",
    },
    {
      key: "durability",
      label: "Workout durability",
      whyItMatters:
        "Quality sessions repeat weekly — foam and outsole need to survive a block, not one race.",
      importance: "high",
    },
    {
      key: "fit",
      label: "Secure fit under pace",
      whyItMatters:
        "Heel and midfoot hold must stay locked when cadence and force rise.",
      importance: "high",
    },
    {
      key: "rotation",
      label: "Rotation role clarity",
      whyItMatters:
        "A tempo shoe should have a clear job beside a daily trainer and any race shoe.",
      importance: "medium",
    },
    {
      key: "versatility",
      label: "Session versatility",
      whyItMatters:
        "Useful across threshold, intervals and faster long runs — not only one niche workout.",
      importance: "medium",
    },
  ],
  comparisonColumns: [
    { key: "bestType", label: "Best workout role", source: "decisionRole" },
    { key: "pace", label: "Pace range", source: "paceCharacter" },
    { key: "ride", label: "Ride character", source: "rideCharacter" },
    { key: "tradeoff", label: "Key trade-off", source: "keyTradeoff" },
  ],
  methodologyEmphasis:
    "For tempo shoes we emphasise responsiveness at controlled hard paces, workout durability, secure fit under load, and a clear role beside daily trainers and race shoes — then select recommendations that cover meaningfully different runner needs.",
};

const RACE_5K: GuideContextConfig = {
  id: "race-5k",
  useCaseIds: ["uc-5k", "uc-race", "uc-racing"],
  guideSlugIncludes: ["5k", "race", "racing"],
  label: "Race / speed",
  whatMattersFallback:
    "Race-oriented shoes emphasise low weight, responsiveness and energy return — with trade-offs in cushioning depth and everyday durability.",
  factors: [
    {
      key: "weight",
      label: "Weight",
      whyItMatters: "Less mass matters more when the goal is race pace.",
      importance: "high",
    },
    {
      key: "responsiveness",
      label: "Responsiveness",
      whyItMatters: "Quick rebound for faster efforts.",
      importance: "high",
    },
    {
      key: "energyReturn",
      label: "Energy return",
      whyItMatters: "Foam and geometry that support race effort.",
      importance: "high",
    },
    {
      key: "grip",
      label: "Grip",
      whyItMatters: "Reliable outsole for the intended race surface.",
      importance: "medium",
    },
  ],
  comparisonColumns: [
    { key: "bestType", label: "Best role", source: "decisionRole" },
    { key: "pace", label: "Pace range", source: "paceCharacter" },
    { key: "tradeoff", label: "Key trade-off", source: "keyTradeoff" },
  ],
  methodologyEmphasis:
    "Race guides emphasise weight, responsiveness and energy return more than long-run softness.",
};

const GPS_MARATHON: GuideContextConfig = {
  id: "gps-marathon",
  useCaseIds: ["uc-gps-marathon", "uc-watches"],
  guideSlugIncludes: ["gps", "watch"],
  label: "GPS watches",
  whatMattersFallback:
    "For marathon training, battery life, reliable GPS, pacing tools and wearable comfort usually matter more than niche multisport features.",
  factors: [
    {
      key: "gps-accuracy",
      label: "GPS accuracy",
      whyItMatters: "Reliable distance and pace for training feedback and race splits.",
      importance: "high",
    },
    {
      key: "battery",
      label: "Battery",
      whyItMatters: "Long runs and race-day tracking without anxiety.",
      importance: "high",
    },
    {
      key: "screen-readability",
      label: "Screen readability",
      whyItMatters: "Readable pace/data in bright sun or with gloves.",
      importance: "high",
    },
    {
      key: "comfort",
      label: "Comfort & weight",
      whyItMatters: "Comfortable for multi-hour sessions and all-day wear.",
      importance: "high",
    },
    {
      key: "training-analytics",
      label: "Training analytics",
      whyItMatters: "Load, recovery and structured workouts that change how you train.",
      importance: "high",
    },
    {
      key: "navigation",
      label: "Navigation & mapping",
      whyItMatters: "Offline maps and routing when courses leave the usual loop.",
      importance: "medium",
    },
    {
      key: "ecosystem",
      label: "Ecosystem",
      whyItMatters: "App coaching, straps and phone sync you will actually keep using.",
      importance: "medium",
    },
    {
      key: "ease-of-use",
      label: "Ease of use",
      whyItMatters: "Start a run fast without drowning in menus.",
      importance: "medium",
    },
    {
      key: "smartwatch",
      label: "Smartwatch functionality",
      whyItMatters: "Music, payments and notifications when lifestyle features matter.",
      importance: "medium",
    },
    {
      key: "sensors",
      label: "Sensor support",
      whyItMatters: "HR and related sensors that match how seriously you train.",
      importance: "medium",
    },
    {
      key: "durability",
      label: "Durability",
      whyItMatters: "Build strength for trail knocks and daily wear.",
      importance: "medium",
    },
    {
      key: "value",
      label: "Value",
      whyItMatters: "Feature set relative to what you will use weekly.",
      importance: "high",
    },
  ],
  comparisonColumns: [
    { key: "bestType", label: "Best role", source: "decisionRole" },
    { key: "tradeoff", label: "Key compromise", source: "keyTradeoff" },
  ],
  methodologyEmphasis:
    "GPS marathon guides weigh battery, GPS quality, pacing tools and comfort for long efforts.",
};

const GENERIC: GuideContextConfig = {
  id: "generic",
  useCaseIds: [],
  label: "Use case",
  whatMattersFallback:
    "The best products for this use case balance the factors that matter most for the decision — not overall popularity or a single product score.",
  factors: [
    {
      key: "fitForPurpose",
      label: "Fit for purpose",
      whyItMatters: "How well the product matches this specific use case.",
      importance: "high",
    },
    {
      key: "tradeoffs",
      label: "Clear trade-offs",
      whyItMatters: "Honest limits so you can choose an alternative when needed.",
      importance: "high",
    },
  ],
  comparisonColumns: [
    { key: "bestType", label: "Best role", source: "decisionRole" },
    { key: "tradeoff", label: "Key trade-off", source: "keyTradeoff" },
  ],
  methodologyEmphasis:
    "We compare eligible products against the same use-case criteria and select recommendations that cover meaningfully different needs.",
};

export const GUIDE_CONTEXT_CONFIGS: GuideContextConfig[] = [
  LONG_RUNS,
  MARATHON,
  BEGINNERS,
  DAILY,
  STABILITY,
  WIDE_FEET,
  TEMPO,
  RACE_5K,
  GPS_MARATHON,
  GENERIC,
];

export function resolveGuideContextConfig(input: {
  useCaseIds?: string[];
  slug?: string;
}): GuideContextConfig {
  const slug = (input.slug ?? "").toLowerCase();

  // Prefer slug-specific match so shared useCaseIds don't mis-label guides
  for (const cfg of GUIDE_CONTEXT_CONFIGS) {
    if (cfg.id === "generic") continue;
    if (cfg.guideSlugIncludes?.some((frag) => slug.includes(frag))) return cfg;
  }

  // Then walk the guide's useCaseIds in order (primary first)
  for (const useCaseId of input.useCaseIds ?? []) {
    for (const cfg of GUIDE_CONTEXT_CONFIGS) {
      if (cfg.id === "generic") continue;
      if (cfg.useCaseIds.includes(useCaseId)) return cfg;
    }
  }

  return GENERIC;
}
