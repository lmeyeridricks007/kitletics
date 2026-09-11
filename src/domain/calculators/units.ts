/**
 * Distance, duration, pace, and speed unit utilities.
 * Internal canonical units: metres, seconds, seconds-per-metre.
 */

import { METERS_PER_KM, METERS_PER_MILE } from "@/domain/calculators/running/distances";

export type DistanceUnit = "km" | "mi";
export type PaceUnit = "min_per_km" | "min_per_mile";

export function distanceToMeters(value: number, unit: DistanceUnit): number {
  if (!Number.isFinite(value) || value <= 0) return NaN;
  return unit === "mi" ? value * METERS_PER_MILE : value * METERS_PER_KM;
}

export function metersToDistance(meters: number, unit: DistanceUnit): number {
  if (!Number.isFinite(meters) || meters < 0) return NaN;
  return unit === "mi" ? meters / METERS_PER_MILE : meters / METERS_PER_KM;
}

/** Pace as seconds per metre from display pace (seconds per km or mile) */
export function paceDisplayToSecondsPerMeter(
  paceSecondsPerUnit: number,
  unit: PaceUnit,
): number {
  if (!Number.isFinite(paceSecondsPerUnit) || paceSecondsPerUnit <= 0) return NaN;
  const meters =
    unit === "min_per_mile" ? METERS_PER_MILE : METERS_PER_KM;
  return paceSecondsPerUnit / meters;
}

export function secondsPerMeterToPaceDisplay(
  secondsPerMeter: number,
  unit: PaceUnit,
): number {
  if (!Number.isFinite(secondsPerMeter) || secondsPerMeter <= 0) return NaN;
  const meters =
    unit === "min_per_mile" ? METERS_PER_MILE : METERS_PER_KM;
  return secondsPerMeter * meters;
}

/** Speed: m/s → km/h or mph */
export function metersPerSecondToSpeed(
  mps: number,
  unit: DistanceUnit,
): number {
  if (!Number.isFinite(mps) || mps <= 0) return NaN;
  if (unit === "mi") return mps * (3600 / METERS_PER_MILE);
  return mps * 3.6;
}

/**
 * Format elapsed duration (not time-of-day).
 * 330 → "5:30", 3600 → "1:00:00", 3661 → "1:01:01"
 */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const s = Math.round(totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  if (hours > 0) {
    return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
  }
  return `${minutes}:${pad2(seconds)}`;
}

export function formatPace(
  paceSecondsPerUnit: number,
): string {
  if (!Number.isFinite(paceSecondsPerUnit) || paceSecondsPerUnit <= 0) return "—";
  const s = Math.round(paceSecondsPerUnit);
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes}:${pad2(seconds)}`;
}

export function parseDurationParts(
  hours: number,
  minutes: number,
  seconds: number,
): number {
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    !Number.isFinite(seconds)
  ) {
    return NaN;
  }
  if (hours < 0 || minutes < 0 || seconds < 0) return NaN;
  if (minutes > 59 || seconds > 59) return NaN;
  return hours * 3600 + minutes * 60 + seconds;
}

export function durationToParts(totalSeconds: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const s = Math.max(0, Math.round(totalSeconds));
  return {
    hours: Math.floor(s / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/** Parse "5:30" or "1:05:30" into seconds */
export function parsePaceOrDurationString(raw: string): number {
  const parts = raw.trim().split(":").map((p) => Number(p));
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return NaN;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return NaN;
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Format distance with sensible decimals */
export function formatDistanceMeters(
  meters: number,
  unit: DistanceUnit,
): string {
  const value = metersToDistance(meters, unit);
  if (!Number.isFinite(value)) return "—";
  if (value >= 100) return value.toFixed(1);
  if (value >= 10) return value.toFixed(2);
  return value.toFixed(2);
}

export function formatSpeed(mps: number, unit: DistanceUnit): string {
  const speed = metersPerSecondToSpeed(mps, unit);
  if (!Number.isFinite(speed)) return "—";
  return speed.toFixed(1);
}
