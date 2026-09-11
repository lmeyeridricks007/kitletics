import type { CalculatorDefinition } from "@/domain/calculators/types";
import { getRaceDistanceById } from "@/domain/calculators/running/distances";
import { distanceToMeters, type DistanceUnit } from "@/domain/calculators/units";
import type { PaceCalcMode } from "@/domain/calculators/running/pace";

/**
 * Human-readable query state for calculators.
 * Not encrypted — values are non-sensitive.
 */

export interface PaceUrlState {
  mode: PaceCalcMode;
  distanceId?: string;
  distanceMeters?: number;
  distanceUnit: DistanceUnit;
  timeSeconds?: number;
  /** Pace seconds per km (display unit keyed separately) */
  paceSecondsPerKm?: number;
  paceUnit: "km" | "mi";
  splitInterval: string;
  negativeSplit?: string;
}

export interface PredictorUrlState {
  fromId?: string;
  fromMeters?: number;
  toId?: string;
  toMeters?: number;
  timeSeconds?: number;
  distanceUnit: DistanceUnit;
  exponent?: number;
}

function positiveInt(raw: string | null | undefined): number | undefined {
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.round(n);
}

function positiveFloat(raw: string | null | undefined): number | undefined {
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

export function parsePaceUrlState(
  params: URLSearchParams | Record<string, string | undefined>,
): PaceUrlState {
  const get = (key: string) =>
    params instanceof URLSearchParams
      ? params.get(key)
      : (params[key] ?? null);

  const modeRaw = get("mode") ?? "pace";
  const mode: PaceCalcMode =
    modeRaw === "time" || modeRaw === "distance" ? modeRaw : "pace";

  const unitRaw = get("unit") ?? "km";
  const distanceUnit: DistanceUnit = unitRaw === "mi" ? "mi" : "km";
  const paceUnit = get("paceUnit") === "mi" ? "mi" : "km";

  const distance = get("distance");
  let distanceId: string | undefined;
  let distanceMeters: number | undefined;

  if (distance) {
    const preset = getRaceDistanceById(distance);
    if (preset) {
      distanceId = preset.id;
      distanceMeters = preset.meters;
    } else {
      const custom = positiveFloat(distance);
      if (custom) {
        distanceMeters = distanceToMeters(custom, distanceUnit);
      }
    }
  }

  const customMeters = positiveFloat(get("meters"));
  if (customMeters) distanceMeters = customMeters;

  return {
    mode,
    distanceId,
    distanceMeters,
    distanceUnit,
    timeSeconds: positiveInt(get("time")),
    paceSecondsPerKm: positiveInt(get("pace")),
    paceUnit,
    splitInterval: get("splits") ?? "auto",
    negativeSplit: get("ns") ?? undefined,
  };
}

export function serializePaceUrlState(state: PaceUrlState): string {
  const p = new URLSearchParams();
  p.set("mode", state.mode);
  if (state.distanceId) p.set("distance", state.distanceId);
  else if (state.distanceMeters) {
    p.set("meters", String(Math.round(state.distanceMeters * 1000) / 1000));
  }
  if (state.distanceUnit !== "km") p.set("unit", state.distanceUnit);
  if (state.timeSeconds) p.set("time", String(state.timeSeconds));
  if (state.paceSecondsPerKm) p.set("pace", String(state.paceSecondsPerKm));
  if (state.paceUnit !== "km") p.set("paceUnit", state.paceUnit);
  if (state.splitInterval && state.splitInterval !== "auto") {
    p.set("splits", state.splitInterval);
  }
  if (state.negativeSplit) p.set("ns", state.negativeSplit);
  return p.toString();
}

export function parsePredictorUrlState(
  params: URLSearchParams | Record<string, string | undefined>,
): PredictorUrlState {
  const get = (key: string) =>
    params instanceof URLSearchParams
      ? params.get(key)
      : (params[key] ?? null);

  const unitRaw = get("unit") ?? "km";
  const distanceUnit: DistanceUnit = unitRaw === "mi" ? "mi" : "km";

  const resolve = (
    key: string,
  ): { id?: string; meters?: number } => {
    const raw = get(key);
    if (!raw) return {};
    const preset = getRaceDistanceById(raw);
    if (preset) return { id: preset.id, meters: preset.meters };
    const n = positiveFloat(raw);
    if (n) return { meters: distanceToMeters(n, distanceUnit) };
    return {};
  };

  const from = resolve("from");
  const to = resolve("to");
  const exp = positiveFloat(get("k"));

  return {
    fromId: from.id,
    fromMeters: from.meters,
    toId: to.id,
    toMeters: to.meters,
    timeSeconds: positiveInt(get("time")),
    distanceUnit,
    exponent: exp && exp > 1 && exp < 1.2 ? exp : undefined,
  };
}

export function serializePredictorUrlState(state: PredictorUrlState): string {
  const p = new URLSearchParams();
  if (state.fromId) p.set("from", state.fromId);
  else if (state.fromMeters) p.set("from", String(state.fromMeters));
  if (state.toId) p.set("to", state.toId);
  else if (state.toMeters) p.set("to", String(state.toMeters));
  if (state.timeSeconds) p.set("time", String(state.timeSeconds));
  if (state.distanceUnit !== "km") p.set("unit", state.distanceUnit);
  if (state.exponent && state.exponent !== 1.06) {
    p.set("k", String(state.exponent));
  }
  return p.toString();
}

export function buildPaceHandoffQuery(input: {
  distanceId?: string;
  distanceMeters: number;
  timeSeconds: number;
}): string {
  return serializePaceUrlState({
    mode: "pace",
    distanceId: input.distanceId,
    distanceMeters: input.distanceMeters,
    distanceUnit: "km",
    timeSeconds: input.timeSeconds,
    paceUnit: "km",
    splitInterval: "auto",
  });
}

export function assertCalculatorVersion(
  definition: CalculatorDefinition,
  version?: string,
): boolean {
  if (!version) return true;
  return version === definition.version;
}
