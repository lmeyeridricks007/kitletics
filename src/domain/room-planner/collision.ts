import { rectsOverlap } from "@/domain/room-planner/geometry";
import type { RectMm } from "@/domain/room-planner/types";

/** Physical footprints must not overlap (edge contact allowed). */
export function checkCollision(a: RectMm, b: RectMm): boolean {
  return rectsOverlap(a, b);
}

/**
 * Clearance conflict — hard clearances should not overlap physical footprints
 * of other equipment. Soft/shared clearances may overlap each other.
 */
export function checkClearanceConflict(
  clearance: RectMm,
  otherPhysical: RectMm,
): boolean {
  return rectsOverlap(clearance, otherPhysical);
}

export function anyCollision(
  candidate: RectMm,
  others: RectMm[],
): boolean {
  return others.some((o) => checkCollision(candidate, o));
}
