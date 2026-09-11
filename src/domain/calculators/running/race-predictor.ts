/**
 * Race time prediction — Riegel model.
 * T₂ = T₁ × (D₂ / D₁)^k
 *
 * Model id: race-predictor-riegel-v1
 * Default exponent k = 1.06 (centralized — do not scatter).
 */

import { RACE_DISTANCES } from "@/domain/calculators/running/distances";
import { paceConversions, calculatePaceSecondsPerMeter } from "@/domain/calculators/running/pace";
import { formatDuration } from "@/domain/calculators/units";

/** Default Riegel endurance exponent */
export const RIEGEL_EXPONENT = 1.06;

export const RACE_PREDICTOR_MODEL_ID = "race-predictor-riegel-v1";

export interface RacePredictionModel {
  id: string;
  name: string;
  predict: (input: PredictRaceTimeInput) => number;
}

export interface PredictRaceTimeInput {
  sourceDistanceMeters: number;
  sourceTimeSeconds: number;
  targetDistanceMeters: number;
  exponent?: number;
}

export interface RacePredictionResult {
  modelId: string;
  exponent: number;
  sourceDistanceMeters: number;
  sourceTimeSeconds: number;
  targetDistanceMeters: number;
  predictedTimeSeconds: number;
  predictedPaceSecondsPerMeter: number;
  reliability: "closer" | "moderate" | "broader";
  reliabilityLabel: string;
  copyText: string;
}

function validatePositive(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

/**
 * Pure Riegel prediction. Returns seconds (rounded to nearest second).
 */
export function predictRaceTime(input: PredictRaceTimeInput): number {
  const {
    sourceDistanceMeters: d1,
    sourceTimeSeconds: t1,
    targetDistanceMeters: d2,
    exponent = RIEGEL_EXPONENT,
  } = input;

  if (
    !validatePositive(d1) ||
    !validatePositive(t1) ||
    !validatePositive(d2) ||
    !validatePositive(exponent)
  ) {
    return NaN;
  }

  if (Math.abs(d1 - d2) < 1e-9) {
    return Math.round(t1);
  }

  const t2 = t1 * Math.pow(d2 / d1, exponent);
  return Math.round(t2);
}

export const riegelModel: RacePredictionModel = {
  id: RACE_PREDICTOR_MODEL_ID,
  name: "Riegel",
  predict: predictRaceTime,
};

export function distanceGapReliability(
  sourceMeters: number,
  targetMeters: number,
): RacePredictionResult["reliability"] {
  const ratio =
    Math.max(sourceMeters, targetMeters) /
    Math.min(sourceMeters, targetMeters);
  if (ratio <= 2.2) return "closer";
  if (ratio <= 4.5) return "moderate";
  return "broader";
}

export function reliabilityLabel(
  level: RacePredictionResult["reliability"],
): string {
  if (level === "closer") return "Closer estimate";
  if (level === "moderate") return "Moderate estimate";
  return "Broader estimate";
}

export function runRacePrediction(
  input: PredictRaceTimeInput,
): RacePredictionResult | null {
  const exponent = input.exponent ?? RIEGEL_EXPONENT;
  const predictedTimeSeconds = predictRaceTime({ ...input, exponent });
  if (!Number.isFinite(predictedTimeSeconds)) return null;

  const predictedPaceSecondsPerMeter = calculatePaceSecondsPerMeter(
    input.targetDistanceMeters,
    predictedTimeSeconds,
  );
  const reliability = distanceGapReliability(
    input.sourceDistanceMeters,
    input.targetDistanceMeters,
  );

  const conversions = paceConversions(predictedPaceSecondsPerMeter);

  return {
    modelId: RACE_PREDICTOR_MODEL_ID,
    exponent,
    sourceDistanceMeters: input.sourceDistanceMeters,
    sourceTimeSeconds: input.sourceTimeSeconds,
    targetDistanceMeters: input.targetDistanceMeters,
    predictedTimeSeconds,
    predictedPaceSecondsPerMeter,
    reliability,
    reliabilityLabel: reliabilityLabel(reliability),
    copyText: `${formatDuration(input.sourceTimeSeconds)} → estimated ${formatDuration(predictedTimeSeconds)}${conversions ? ` (${conversions.pacePerKmLabel}/km)` : ""}`,
  };
}

export interface EquivalentRaceRow {
  distanceId: string;
  label: string;
  meters: number;
  predictedTimeSeconds: number;
  timeLabel: string;
  isSource: boolean;
  ultra?: boolean;
}

export function predictEquivalentRaceTimes(input: {
  sourceDistanceMeters: number;
  sourceTimeSeconds: number;
  exponent?: number;
  includeUltra?: boolean;
}): EquivalentRaceRow[] {
  const exponent = input.exponent ?? RIEGEL_EXPONENT;
  const rows: EquivalentRaceRow[] = [];

  for (const d of RACE_DISTANCES) {
    if (!d.predictionTable && !d.ultra) continue;
    if (d.ultra && !input.includeUltra) continue;

    const predictedTimeSeconds = predictRaceTime({
      sourceDistanceMeters: input.sourceDistanceMeters,
      sourceTimeSeconds: input.sourceTimeSeconds,
      targetDistanceMeters: d.meters,
      exponent,
    });
    if (!Number.isFinite(predictedTimeSeconds)) continue;

    rows.push({
      distanceId: d.id,
      label: d.label,
      meters: d.meters,
      predictedTimeSeconds,
      timeLabel: formatDuration(predictedTimeSeconds),
      isSource: Math.abs(d.meters - input.sourceDistanceMeters) < 1,
      ultra: d.ultra,
    });
  }

  return rows.sort((a, b) => a.meters - b.meters);
}
