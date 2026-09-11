/**
 * Split generation — each split from absolute distance × pace (no cumulative drift).
 */

import { formatDuration } from "@/domain/calculators/units";
import {
  HALF_MARATHON_CHECKPOINTS,
  HALF_MARATHON_METERS,
  MARATHON_CHECKPOINTS,
  MARATHON_METERS,
  METERS_PER_KM,
  METERS_PER_MILE,
} from "@/domain/calculators/running/distances";

export type SplitIntervalMode =
  | "1km"
  | "5km"
  | "1mi"
  | "checkpoints"
  | "finish-only";

export interface SplitRow {
  label: string;
  distanceMeters: number;
  cumulativeSeconds: number;
  cumulativeLabel: string;
  segmentSeconds: number;
  segmentLabel: string;
}

export interface SplitPlanOptions {
  distanceMeters: number;
  paceSecondsPerMeter: number;
  interval: SplitIntervalMode;
  negativeSplitFraction?: number;
}

const MAX_DEFAULT_ROWS = 42;

function evenPaceSplits(
  distanceMeters: number,
  paceSecondsPerMeter: number,
  stepMeters: number,
  labelFn: (i: number, meters: number) => string,
): SplitRow[] {
  const rows: SplitRow[] = [];
  let prevSeconds = 0;
  const steps = Math.floor(distanceMeters / stepMeters);
  const count = Math.min(steps, MAX_DEFAULT_ROWS);

  for (let i = 1; i <= count; i++) {
    const meters = Math.min(i * stepMeters, distanceMeters);
    const cumulativeSeconds = Math.round(meters * paceSecondsPerMeter);
    const segmentSeconds = cumulativeSeconds - prevSeconds;
    rows.push({
      label: labelFn(i, meters),
      distanceMeters: meters,
      cumulativeSeconds,
      cumulativeLabel: formatDuration(cumulativeSeconds),
      segmentSeconds,
      segmentLabel: formatDuration(segmentSeconds),
    });
    prevSeconds = cumulativeSeconds;
  }

  const last = rows[rows.length - 1];
  if (!last || Math.abs(last.distanceMeters - distanceMeters) > 0.5) {
    const cumulativeSeconds = Math.round(distanceMeters * paceSecondsPerMeter);
    rows.push({
      label: "Finish",
      distanceMeters,
      cumulativeSeconds,
      cumulativeLabel: formatDuration(cumulativeSeconds),
      segmentSeconds: cumulativeSeconds - prevSeconds,
      segmentLabel: formatDuration(cumulativeSeconds - prevSeconds),
    });
  } else if (last.distanceMeters >= distanceMeters - 0.5) {
    last.label = "Finish";
  }

  return rows;
}

function checkpointSplits(
  checkpoints: { label: string; meters: number }[],
  paceSecondsPerMeter: number,
): SplitRow[] {
  const rows: SplitRow[] = [];
  let prevSeconds = 0;
  for (const cp of checkpoints) {
    const cumulativeSeconds = Math.round(cp.meters * paceSecondsPerMeter);
    const segmentSeconds = cumulativeSeconds - prevSeconds;
    rows.push({
      label: cp.label,
      distanceMeters: cp.meters,
      cumulativeSeconds,
      cumulativeLabel: formatDuration(cumulativeSeconds),
      segmentSeconds,
      segmentLabel: formatDuration(segmentSeconds),
    });
    prevSeconds = cumulativeSeconds;
  }
  return rows;
}

export function generateSplits(options: SplitPlanOptions): SplitRow[] {
  const { distanceMeters, paceSecondsPerMeter, interval } = options;
  if (
    !Number.isFinite(distanceMeters) ||
    !Number.isFinite(paceSecondsPerMeter) ||
    distanceMeters <= 0 ||
    paceSecondsPerMeter <= 0
  ) {
    return [];
  }

  if (options.negativeSplitFraction && options.negativeSplitFraction > 0) {
    return generateNegativeSplitPlan(options);
  }

  if (interval === "checkpoints") {
    if (Math.abs(distanceMeters - MARATHON_METERS) < 1) {
      return checkpointSplits(MARATHON_CHECKPOINTS, paceSecondsPerMeter);
    }
    if (Math.abs(distanceMeters - HALF_MARATHON_METERS) < 1) {
      return checkpointSplits(HALF_MARATHON_CHECKPOINTS, paceSecondsPerMeter);
    }
    return evenPaceSplits(
      distanceMeters,
      paceSecondsPerMeter,
      5 * METERS_PER_KM,
      (i) => `${i * 5} km`,
    );
  }

  if (interval === "1km") {
    if (distanceMeters / METERS_PER_KM > MAX_DEFAULT_ROWS) {
      return evenPaceSplits(
        distanceMeters,
        paceSecondsPerMeter,
        5 * METERS_PER_KM,
        (i) => `${i * 5} km`,
      );
    }
    return evenPaceSplits(
      distanceMeters,
      paceSecondsPerMeter,
      METERS_PER_KM,
      (i) => `${i} km`,
    );
  }

  if (interval === "5km") {
    return evenPaceSplits(
      distanceMeters,
      paceSecondsPerMeter,
      5 * METERS_PER_KM,
      (i) => `${i * 5} km`,
    );
  }

  if (interval === "1mi") {
    if (distanceMeters / METERS_PER_MILE > MAX_DEFAULT_ROWS) {
      return evenPaceSplits(
        distanceMeters,
        paceSecondsPerMeter,
        5 * METERS_PER_MILE,
        (i) => `${i * 5} mi`,
      );
    }
    return evenPaceSplits(
      distanceMeters,
      paceSecondsPerMeter,
      METERS_PER_MILE,
      (i) => `${i} mi`,
    );
  }

  const finish = Math.round(distanceMeters * paceSecondsPerMeter);
  return [
    {
      label: "Finish",
      distanceMeters,
      cumulativeSeconds: finish,
      cumulativeLabel: formatDuration(finish),
      segmentSeconds: finish,
      segmentLabel: formatDuration(finish),
    },
  ];
}

export function generateNegativeSplitPlan(
  options: SplitPlanOptions,
): SplitRow[] {
  const frac = options.negativeSplitFraction ?? 0.02;
  const halfDist = options.distanceMeters / 2;
  const totalTime = options.distanceMeters * options.paceSecondsPerMeter;
  const firstHalfTime = totalTime / (2 - frac);
  const secondHalfTime = totalTime - firstHalfTime;

  return [
    {
      label: "First half",
      distanceMeters: halfDist,
      cumulativeSeconds: Math.round(firstHalfTime),
      cumulativeLabel: formatDuration(Math.round(firstHalfTime)),
      segmentSeconds: Math.round(firstHalfTime),
      segmentLabel: formatDuration(Math.round(firstHalfTime)),
    },
    {
      label: "Second half",
      distanceMeters: options.distanceMeters,
      cumulativeSeconds: Math.round(totalTime),
      cumulativeLabel: formatDuration(Math.round(totalTime)),
      segmentSeconds: Math.round(secondHalfTime),
      segmentLabel: formatDuration(Math.round(secondHalfTime)),
    },
  ];
}

export function negativeSplitPaceSummary(
  distanceMeters: number,
  paceSecondsPerMeter: number,
  fraction: number,
): {
  firstHalfPaceSpm: number;
  secondHalfPaceSpm: number;
  firstHalfSeconds: number;
  secondHalfSeconds: number;
} | null {
  if (
    !Number.isFinite(distanceMeters) ||
    distanceMeters <= 0 ||
    fraction <= 0 ||
    fraction >= 1
  ) {
    return null;
  }
  const halfDist = distanceMeters / 2;
  const totalTime = distanceMeters * paceSecondsPerMeter;
  const firstHalfTime = totalTime / (2 - fraction);
  const secondHalfTime = totalTime - firstHalfTime;
  return {
    firstHalfPaceSpm: firstHalfTime / halfDist,
    secondHalfPaceSpm: secondHalfTime / halfDist,
    firstHalfSeconds: Math.round(firstHalfTime),
    secondHalfSeconds: Math.round(secondHalfTime),
  };
}
