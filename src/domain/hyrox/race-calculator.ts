/**
 * HYROX race time planner — arithmetic only.
 * Does not predict physiology. Uses CompetitionFormat for segment sequence.
 */

import type { CompetitionFormat } from "@/domain/competition/types";
import { getStationSequence } from "@/domain/competition/types";

export type RacePlanMode = "simple" | "advanced" | "target";

export interface RaceSegmentInput {
  id: string;
  label: string;
  kind: "run" | "station" | "transition";
  /** Duration in whole seconds */
  seconds: number;
}

export interface RacePlanResult {
  segments: (RaceSegmentInput & { cumulativeSeconds: number })[];
  runningSeconds: number;
  stationSeconds: number;
  transitionSeconds: number;
  totalSeconds: number;
  formatId: string;
  formatSeason: string;
  disclaimer: string;
}

export function formatRaceTime(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function parseTimeToSeconds(input: string): number | null {
  const t = input.trim();
  if (!t) return null;
  const parts = t.split(":").map(Number);
  if (parts.some((n) => !Number.isFinite(n))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 1) return parts[0];
  return null;
}

/** Pace as seconds per km from min:sec string */
export function paceToSecondsPerKm(pace: string): number | null {
  return parseTimeToSeconds(pace);
}

export function secondsPerKmToPace(sec: number): string {
  return formatRaceTime(Math.round(sec));
}

export function buildSimplePlan(input: {
  format: CompetitionFormat;
  averageRunPaceSecPerKm: number;
  averageStationSeconds: number;
  totalTransitionSeconds: number;
}): RacePlanResult {
  const seq = getStationSequence(input.format);
  const segments: RaceSegmentInput[] = [];
  for (const step of seq) {
    if (step.kind === "run") {
      segments.push({
        id: `run-${step.runIndex}`,
        label: step.label,
        kind: "run",
        seconds: Math.round(input.averageRunPaceSecPerKm),
      });
    } else {
      segments.push({
        id: step.station?.id ?? step.label,
        label: step.label,
        kind: "station",
        seconds: Math.round(input.averageStationSeconds),
      });
    }
  }
  if (input.totalTransitionSeconds > 0) {
    segments.push({
      id: "transitions",
      label: "Transitions / Roxzone (allowance)",
      kind: "transition",
      seconds: Math.round(input.totalTransitionSeconds),
    });
  }
  return finalize(segments, input.format);
}

export function buildAdvancedPlan(input: {
  format: CompetitionFormat;
  segmentSeconds: Record<string, number>;
  totalTransitionSeconds?: number;
}): RacePlanResult {
  const seq = getStationSequence(input.format);
  const segments: RaceSegmentInput[] = [];
  for (const step of seq) {
    const id =
      step.kind === "run" ? `run-${step.runIndex}` : (step.station?.id ?? step.label);
    const seconds = Math.round(input.segmentSeconds[id] ?? 0);
    segments.push({
      id,
      label: step.label,
      kind: step.kind === "run" ? "run" : "station",
      seconds,
    });
  }
  const tr = input.totalTransitionSeconds ?? 0;
  if (tr > 0) {
    segments.push({
      id: "transitions",
      label: "Transitions / Roxzone (allowance)",
      kind: "transition",
      seconds: Math.round(tr),
    });
  }
  return finalize(segments, input.format);
}

/**
 * Target finish → required average run pace given station + transition assumptions.
 */
export function requiredRunPaceForTarget(input: {
  format: CompetitionFormat;
  targetFinishSeconds: number;
  stationSecondsTotal: number;
  transitionSeconds: number;
}): {
  ok: boolean;
  message: string;
  availableRunningSeconds?: number;
  requiredPaceSecPerKm?: number;
  requiredPaceLabel?: string;
} {
  const runCount = input.format.runningSegments.length;
  const fixed = input.stationSecondsTotal + input.transitionSeconds;
  if (fixed >= input.targetFinishSeconds) {
    return {
      ok: false,
      message:
        "Your station estimates and transition allowance already exceed your target finish time.",
    };
  }
  const available = input.targetFinishSeconds - fixed;
  const pace = available / runCount;
  return {
    ok: true,
    message: "Race plan estimate — not a physiological prediction.",
    availableRunningSeconds: available,
    requiredPaceSecPerKm: pace,
    requiredPaceLabel: secondsPerKmToPace(pace),
  };
}

function finalize(
  segments: RaceSegmentInput[],
  format: CompetitionFormat,
): RacePlanResult {
  let cum = 0;
  const withCum = segments.map((s) => {
    cum += s.seconds;
    return { ...s, cumulativeSeconds: cum };
  });
  const runningSeconds = segments
    .filter((s) => s.kind === "run")
    .reduce((a, s) => a + s.seconds, 0);
  const stationSeconds = segments
    .filter((s) => s.kind === "station")
    .reduce((a, s) => a + s.seconds, 0);
  const transitionSeconds = segments
    .filter((s) => s.kind === "transition")
    .reduce((a, s) => a + s.seconds, 0);
  return {
    segments: withCum,
    runningSeconds,
    stationSeconds,
    transitionSeconds,
    totalSeconds: cum,
    formatId: format.id,
    formatSeason: format.seasonLabel,
    disclaimer:
      "Race plan estimate from your assumptions. Actual finish depends on crowding, transitions, fatigue and execution — not a prediction.",
  };
}

export function compareScenarios(
  a: RacePlanResult,
  b: RacePlanResult,
): { label: string; a: string; b: string; deltaSec: number }[] {
  return [
    {
      label: "Running",
      a: formatRaceTime(a.runningSeconds),
      b: formatRaceTime(b.runningSeconds),
      deltaSec: b.runningSeconds - a.runningSeconds,
    },
    {
      label: "Stations",
      a: formatRaceTime(a.stationSeconds),
      b: formatRaceTime(b.stationSeconds),
      deltaSec: b.stationSeconds - a.stationSeconds,
    },
    {
      label: "Transitions",
      a: formatRaceTime(a.transitionSeconds),
      b: formatRaceTime(b.transitionSeconds),
      deltaSec: b.transitionSeconds - a.transitionSeconds,
    },
    {
      label: "Finish",
      a: formatRaceTime(a.totalSeconds),
      b: formatRaceTime(b.totalSeconds),
      deltaSec: b.totalSeconds - a.totalSeconds,
    },
  ];
}
