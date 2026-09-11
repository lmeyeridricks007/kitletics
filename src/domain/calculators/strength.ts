/** Strength calculators — estimates only, not physiological measurements. */

export type OneRmFormula = "epley" | "brzycki" | "lombardi";

export function estimateOneRepMax(
  weight: number,
  reps: number,
  formula: OneRmFormula = "epley",
): number {
  if (weight <= 0 || reps < 1) return 0;
  if (reps === 1) return weight;
  switch (formula) {
    case "brzycki":
      return weight * (36 / (37 - reps));
    case "lombardi":
      return weight * Math.pow(reps, 0.1);
    case "epley":
    default:
      return weight * (1 + reps / 30);
  }
}

export function estimateOneRepMaxSuite(weight: number, reps: number) {
  return {
    epley: estimateOneRepMax(weight, reps, "epley"),
    brzycki: estimateOneRepMax(weight, reps, "brzycki"),
    lombardi: estimateOneRepMax(weight, reps, "lombardi"),
    note: "Estimates only — formulas diverge as reps increase. Not a measured 1RM.",
  };
}

export type PlateUnit = "kg" | "lb";

const DEFAULT_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
const DEFAULT_PLATES_LB = [45, 35, 25, 10, 5, 2.5];

/**
 * Greedy plate calculator — plates per side for target total bar weight.
 */
export function calculatePlatesPerSide(input: {
  targetWeight: number;
  barWeight: number;
  unit: PlateUnit;
  availablePlates?: number[];
}): { perSide: { plate: number; count: number }[]; loadable: number; remainder: number } {
  const plates =
    input.availablePlates ??
    (input.unit === "kg" ? DEFAULT_PLATES_KG : DEFAULT_PLATES_LB);
  const sideLoad = (input.targetWeight - input.barWeight) / 2;
  if (sideLoad < 0) {
    return { perSide: [], loadable: input.barWeight, remainder: input.targetWeight - input.barWeight };
  }

  let remaining = sideLoad;
  const perSide: { plate: number; count: number }[] = [];
  for (const plate of [...plates].sort((a, b) => b - a)) {
    const count = Math.floor(remaining / plate + 1e-9);
    if (count > 0) {
      perSide.push({ plate, count });
      remaining -= count * plate;
    }
  }
  const loaded = input.barWeight + (sideLoad - remaining) * 2;
  return {
    perSide,
    loadable: Math.round(loaded * 100) / 100,
    remainder: Math.round(remaining * 2 * 100) / 100,
  };
}
