/**
 * Pure pace / time / distance arithmetic.
 * Internal: metres, seconds, seconds-per-metre.
 * Rounding: nearest second for pace and finish times.
 */

import {
  formatDuration,
  formatPace,
  formatDistanceMeters,
  formatSpeed,
  secondsPerMeterToPaceDisplay,
  type DistanceUnit,
  type PaceUnit,
} from "@/domain/calculators/units";

export function calculatePaceSecondsPerMeter(
  distanceMeters: number,
  durationSeconds: number,
): number {
  if (
    !Number.isFinite(distanceMeters) ||
    !Number.isFinite(durationSeconds) ||
    distanceMeters <= 0 ||
    durationSeconds <= 0
  ) {
    return NaN;
  }
  return durationSeconds / distanceMeters;
}

export function calculateDurationSeconds(
  distanceMeters: number,
  paceSecondsPerMeter: number,
): number {
  if (
    !Number.isFinite(distanceMeters) ||
    !Number.isFinite(paceSecondsPerMeter) ||
    distanceMeters <= 0 ||
    paceSecondsPerMeter <= 0
  ) {
    return NaN;
  }
  return Math.round(distanceMeters * paceSecondsPerMeter);
}

export function calculateDistanceMeters(
  durationSeconds: number,
  paceSecondsPerMeter: number,
): number {
  if (
    !Number.isFinite(durationSeconds) ||
    !Number.isFinite(paceSecondsPerMeter) ||
    durationSeconds <= 0 ||
    paceSecondsPerMeter <= 0
  ) {
    return NaN;
  }
  return durationSeconds / paceSecondsPerMeter;
}

export interface PaceConversionBundle {
  pacePerKmSeconds: number;
  pacePerMileSeconds: number;
  speedKmh: number;
  speedMph: number;
  pacePerKmLabel: string;
  pacePerMileLabel: string;
  speedKmhLabel: string;
  speedMphLabel: string;
}

export function paceConversions(
  paceSecondsPerMeter: number,
): PaceConversionBundle | null {
  if (!Number.isFinite(paceSecondsPerMeter) || paceSecondsPerMeter <= 0) {
    return null;
  }
  const pacePerKmSeconds = Math.round(
    secondsPerMeterToPaceDisplay(paceSecondsPerMeter, "min_per_km"),
  );
  const pacePerMileSeconds = Math.round(
    secondsPerMeterToPaceDisplay(paceSecondsPerMeter, "min_per_mile"),
  );
  const mps = 1 / paceSecondsPerMeter;
  return {
    pacePerKmSeconds,
    pacePerMileSeconds,
    speedKmh: mps * 3.6,
    speedMph: mps * (3600 / 1609.344),
    pacePerKmLabel: formatPace(pacePerKmSeconds),
    pacePerMileLabel: formatPace(pacePerMileSeconds),
    speedKmhLabel: formatSpeed(mps, "km"),
    speedMphLabel: formatSpeed(mps, "mi"),
  };
}

export type PaceCalcMode = "pace" | "time" | "distance";

export interface PaceCalculatorInput {
  mode: PaceCalcMode;
  distanceMeters?: number;
  durationSeconds?: number;
  paceSecondsPerMeter?: number;
}

export interface PaceCalculatorResult {
  mode: PaceCalcMode;
  paceSecondsPerMeter: number;
  durationSeconds: number;
  distanceMeters: number;
  conversions: PaceConversionBundle;
  primaryLabel: string;
  primaryValue: string;
  primaryUnit?: string;
  secondaryLines: { label: string; value: string }[];
  copyText: string;
}

export function runPaceCalculation(
  input: PaceCalculatorInput,
): PaceCalculatorResult | null {
  const { mode } = input;
  let paceSecondsPerMeter = NaN;
  let durationSeconds = NaN;
  let distanceMeters = NaN;

  if (mode === "pace") {
    if (
      input.distanceMeters == null ||
      input.durationSeconds == null
    ) {
      return null;
    }
    distanceMeters = input.distanceMeters;
    durationSeconds = input.durationSeconds;
    paceSecondsPerMeter = calculatePaceSecondsPerMeter(
      distanceMeters,
      durationSeconds,
    );
  } else if (mode === "time") {
    if (
      input.distanceMeters == null ||
      input.paceSecondsPerMeter == null
    ) {
      return null;
    }
    distanceMeters = input.distanceMeters;
    paceSecondsPerMeter = input.paceSecondsPerMeter;
    durationSeconds = calculateDurationSeconds(
      distanceMeters,
      paceSecondsPerMeter,
    );
  } else {
    if (
      input.durationSeconds == null ||
      input.paceSecondsPerMeter == null
    ) {
      return null;
    }
    durationSeconds = input.durationSeconds;
    paceSecondsPerMeter = input.paceSecondsPerMeter;
    distanceMeters = calculateDistanceMeters(
      durationSeconds,
      paceSecondsPerMeter,
    );
  }

  if (
    !Number.isFinite(paceSecondsPerMeter) ||
    !Number.isFinite(durationSeconds) ||
    !Number.isFinite(distanceMeters)
  ) {
    return null;
  }

  const conversions = paceConversions(paceSecondsPerMeter);
  if (!conversions) return null;

  if (mode === "pace") {
    return {
      mode,
      paceSecondsPerMeter,
      durationSeconds: Math.round(durationSeconds),
      distanceMeters,
      conversions,
      primaryLabel: "Pace",
      primaryValue: conversions.pacePerKmLabel,
      primaryUnit: "/km",
      secondaryLines: [
        { label: "Pace", value: `${conversions.pacePerMileLabel} /mile` },
        {
          label: "Speed",
          value: `${conversions.speedKmhLabel} km/h · ${conversions.speedMphLabel} mph`,
        },
      ],
      copyText: `${formatDistanceMeters(distanceMeters, "km")} km in ${formatDuration(durationSeconds)} = ${conversions.pacePerKmLabel}/km (${conversions.pacePerMileLabel}/mile)`,
    };
  }

  if (mode === "time") {
    return {
      mode,
      paceSecondsPerMeter,
      durationSeconds,
      distanceMeters,
      conversions,
      primaryLabel: "Estimated time",
      primaryValue: formatDuration(durationSeconds),
      secondaryLines: [
        {
          label: "Average pace",
          value: `${conversions.pacePerKmLabel} /km · ${conversions.pacePerMileLabel} /mile`,
        },
      ],
      copyText: `${formatDistanceMeters(distanceMeters, "km")} km at ${conversions.pacePerKmLabel}/km = ${formatDuration(durationSeconds)}`,
    };
  }

  return {
    mode,
    paceSecondsPerMeter,
    durationSeconds: Math.round(durationSeconds),
    distanceMeters,
    conversions,
    primaryLabel: "Distance",
    primaryValue: formatDistanceMeters(distanceMeters, "km"),
    primaryUnit: "km",
    secondaryLines: [
      {
        label: "Miles",
        value: `${formatDistanceMeters(distanceMeters, "mi")} mi`,
      },
    ],
    copyText: `${formatDuration(durationSeconds)} at ${conversions.pacePerKmLabel}/km = ${formatDistanceMeters(distanceMeters, "km")} km (${formatDistanceMeters(distanceMeters, "mi")} mi)`,
  };
}

export type { DistanceUnit, PaceUnit };
