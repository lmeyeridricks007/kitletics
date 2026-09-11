import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import {
  TRAINING_TO_ROLE,
  type RotationRoleId,
} from "@/domain/shoe-rotation/roles";
import type {
  RotationBudgetBand,
  RotationPriority,
  RotationProfile,
  RotationResponses,
  RotationSizeChoice,
} from "@/domain/shoe-rotation/types";

export const ROTATION_BUDGETS: Record<
  string,
  { currency: string; bands: RotationBudgetBand[] }
> = {
  NL: {
    currency: "EUR",
    bands: [
      { id: "under-150", label: "Under €150", max: 149.99, currency: "EUR" },
      { id: "150-250", label: "€150–€250", min: 150, max: 250, currency: "EUR" },
      { id: "250-400", label: "€250–€400", min: 250, max: 400, currency: "EUR" },
      { id: "400-plus", label: "€400+", min: 400, currency: "EUR" },
      { id: "no-limit", label: "No fixed budget", currency: "EUR" },
    ],
  },
  UK: {
    currency: "GBP",
    bands: [
      { id: "under-150", label: "Under £150", max: 149.99, currency: "GBP" },
      { id: "150-250", label: "£150–£250", min: 150, max: 250, currency: "GBP" },
      { id: "250-400", label: "£250–£400", min: 250, max: 400, currency: "GBP" },
      { id: "400-plus", label: "£400+", min: 400, currency: "GBP" },
      { id: "no-limit", label: "No fixed budget", currency: "GBP" },
    ],
  },
  US: {
    currency: "USD",
    bands: [
      { id: "under-150", label: "Under $150", max: 149.99, currency: "USD" },
      { id: "150-250", label: "$150–$250", min: 150, max: 250, currency: "USD" },
      { id: "250-400", label: "$250–$400", min: 250, max: 400, currency: "USD" },
      { id: "400-plus", label: "$400+", min: 400, currency: "USD" },
      { id: "no-limit", label: "No fixed budget", currency: "USD" },
    ],
  },
};

export function getBudgetBands(region: RegionCode): RotationBudgetBand[] {
  return (ROTATION_BUDGETS[region] ?? ROTATION_BUDGETS.NL).bands;
}

export function normalizeRotationResponses(
  responses: RotationResponses,
  region: RegionCode = DEFAULT_REGION,
): RotationProfile {
  const roleSet = new Set<RotationRoleId>();
  for (const t of responses.trainingTypes) {
    const role = TRAINING_TO_ROLE[t];
    if (role) roleSet.add(role);
  }

  // Terrain forces trail role
  if (responses.terrain === "trail" || responses.terrain === "both") {
    roleSet.add("trail");
  }

  // Racing without specific races still needs race role
  if (responses.trainingTypes.includes("racing")) {
    roleSet.add("race");
  }

  // Default if empty
  if (roleSet.size === 0) {
    roleSet.add("daily");
    roleSet.add("long-run");
  }

  const requiredRoles = [...roleSet];
  const roleWeights = buildRoleWeights(requiredRoles, responses.priorities);

  const bands = getBudgetBands(region);
  const band = bands.find((b) => b.id === responses.budgetBandId);

  const desiredSize: RotationSizeChoice = responses.desiredSize ?? "recommend";
  const maxAdditions = responses.maxAdditions ?? "recommend";

  return {
    mode: responses.mode,
    requiredRoles,
    roleWeights,
    terrain: responses.terrain ?? "road",
    weeklyFrequency: responses.weeklyFrequency,
    weeklyDistance: responses.weeklyDistance,
    raceDistances: responses.raceDistances ?? [],
    priorities: responses.priorities,
    budgetBandId: responses.budgetBandId,
    budgetMin: band?.min,
    budgetMax: band?.max,
    budgetCurrency: band?.currency ?? bands[0]?.currency,
    strictBudget: Boolean(responses.strictBudget),
    desiredSize,
    maxAdditions,
    ownedProductIds: responses.ownedProductIds.slice(0, 4),
    manualShoes: responses.manualShoes,
    roleOverrides: responses.roleOverrides ?? {},
    openToReplace: Boolean(responses.openToReplace),
    region,
    preferMinimal: responses.priorities.includes("minimal-shoes"),
    preferValue: responses.priorities.includes("value"),
    preferRace:
      responses.priorities.includes("race-performance") ||
      responses.priorities.includes("performance"),
  };
}

function buildRoleWeights(
  roles: RotationRoleId[],
  priorities: RotationPriority[],
): Record<RotationRoleId, number> {
  const weights = {} as Record<RotationRoleId, number>;
  for (const r of roles) weights[r] = 1;

  if (priorities.includes("race-performance") || priorities.includes("performance")) {
    if (weights.race !== undefined) weights.race *= 1.45;
    if (weights.tempo !== undefined) weights.tempo *= 1.2;
    if (weights.intervals !== undefined) weights.intervals *= 1.25;
  }
  if (priorities.includes("comfort")) {
    if (weights["easy-recovery"] !== undefined) weights["easy-recovery"] *= 1.3;
    if (weights.daily !== undefined) weights.daily *= 1.15;
    if (weights["long-run"] !== undefined) weights["long-run"] *= 1.2;
  }
  if (priorities.includes("versatility")) {
    if (weights.daily !== undefined) weights.daily *= 1.25;
  }

  // Normalize
  const sum = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  for (const r of Object.keys(weights) as RotationRoleId[]) {
    weights[r] = weights[r] / sum;
  }
  return weights;
}

export const TRAINING_OPTIONS = [
  { value: "easy-runs", label: "Easy runs" },
  { value: "daily-mileage", label: "Daily mileage" },
  { value: "long-runs", label: "Long runs" },
  { value: "tempo", label: "Tempo / threshold" },
  { value: "intervals", label: "Intervals" },
  { value: "racing", label: "Racing" },
  { value: "trail", label: "Trail running" },
] as const;

export const PRIORITY_OPTIONS: { value: RotationPriority; label: string }[] = [
  { value: "comfort", label: "Comfort" },
  { value: "performance", label: "Performance" },
  { value: "versatility", label: "Versatility" },
  { value: "durability", label: "Durability" },
  { value: "value", label: "Value" },
  { value: "minimal-shoes", label: "Minimal number of shoes" },
  { value: "race-performance", label: "Race performance" },
];

export const ROTATION_PRESETS: {
  id: string;
  label: string;
  description: string;
  patch: Partial<RotationResponses>;
}[] = [
  {
    id: "simple-2",
    label: "Simple 2-shoe rotation",
    description: "Daily + faster complement",
    patch: {
      mode: "from-scratch",
      trainingTypes: ["daily-mileage", "long-runs", "tempo", "racing"],
      desiredSize: 2,
      priorities: ["versatility", "minimal-shoes"],
    },
  },
  {
    id: "balanced-3",
    label: "Balanced 3-shoe rotation",
    description: "Daily, easy/long, and race",
    patch: {
      mode: "from-scratch",
      trainingTypes: ["daily-mileage", "easy-runs", "long-runs", "tempo", "racing"],
      desiredSize: 3,
      priorities: ["versatility", "comfort"],
    },
  },
  {
    id: "race-focused",
    label: "Race-focused rotation",
    description: "Prioritise race-day performance",
    patch: {
      mode: "from-scratch",
      trainingTypes: ["daily-mileage", "tempo", "intervals", "racing"],
      desiredSize: 3,
      priorities: ["race-performance", "performance"],
      raceDistances: ["half", "marathon"],
    },
  },
  {
    id: "high-mileage",
    label: "High-mileage rotation",
    description: "More easy/daily coverage",
    patch: {
      mode: "from-scratch",
      trainingTypes: ["daily-mileage", "easy-runs", "long-runs"],
      weeklyFrequency: "5",
      weeklyDistance: "60-80",
      desiredSize: 3,
      priorities: ["comfort", "durability"],
    },
  },
  {
    id: "road-trail",
    label: "Road + trail rotation",
    description: "Cover both surfaces",
    patch: {
      mode: "from-scratch",
      trainingTypes: ["daily-mileage", "long-runs", "trail"],
      terrain: "both",
      desiredSize: 2,
      priorities: ["versatility"],
    },
  },
];
