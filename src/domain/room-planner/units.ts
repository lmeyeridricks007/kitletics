import type { LengthUnit } from "@/domain/room-planner/types";

/** Convert any supported display unit → millimetres (internal). */
export function toMm(value: number, unit: LengthUnit): number {
  switch (unit) {
    case "mm":
      return value;
    case "cm":
      return value * 10;
    case "m":
      return value * 1000;
    case "ft":
      return value * 304.8;
    case "in":
      return value * 25.4;
    default:
      return value;
  }
}

export function fromMm(mm: number, unit: LengthUnit): number {
  switch (unit) {
    case "mm":
      return mm;
    case "cm":
      return mm / 10;
    case "m":
      return mm / 1000;
    case "ft":
      return mm / 304.8;
    case "in":
      return mm / 25.4;
    default:
      return mm;
  }
}

export function formatLength(mm: number, unit: LengthUnit = "m"): string {
  if (unit === "m") {
    return `${(mm / 1000).toFixed(2).replace(/\.?0+$/, "")} m`;
  }
  if (unit === "ft") {
    const totalIn = mm / 25.4;
    const ft = Math.floor(totalIn / 12);
    const inches = Math.round(totalIn % 12);
    return `${ft}' ${inches}"`;
  }
  return `${Math.round(fromMm(mm, unit))} ${unit}`;
}

/** Round to placement grid (default 50 mm). */
export function snapToGrid(mm: number, gridMm = 50): number {
  return Math.round(mm / gridMm) * gridMm;
}
