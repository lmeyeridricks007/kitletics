import type { Product } from "@/domain/products/types";
import type {
  FitConfidence,
  FitStatus,
  MountingAnswer,
  ProductDimensions,
  ProductFitAssessment,
  Room,
} from "@/domain/room-planner/types";
import { resolveProductDimensions } from "@/domain/room-planner/product-geometry";

/** Planning clearance above product height (Kitletics assumption, not manufacturer). */
export const CEILING_PLANNING_CLEARANCE_MM = 50;

/** Extra overhead for pull-ups / overhead press activity (Kitletics planning). */
export const PULLUP_ACTIVITY_CLEARANCE_MM = 150;
export const OVERHEAD_PRESS_CLEARANCE_MM = 200;

export function assessProductFit(input: {
  product: Product;
  room: Room;
  wallMount: MountingAnswer;
  floorMount: MountingAnswer;
  dims?: ProductDimensions;
}): ProductFitAssessment {
  const dims = input.dims ?? resolveProductDimensions(input.product);
  const reasons: string[] = [];
  const activityLimitations: string[] = [];
  let confidence: FitConfidence = "high";
  let ceilingOk = true;
  let footprintOk = true;
  let mountingOk = true;

  const h = dims.heightMm;
  const w = dims.widthMm;
  const d = dims.depthMm;

  if (typeof h !== "number") {
    confidence = "low";
    ceilingOk = false;
    reasons.push(
      "Height unknown — cannot verify ceiling fit (unknown ≠ fits).",
    );
  } else if (h + CEILING_PLANNING_CLEARANCE_MM > input.room.heightMm) {
    ceilingOk = false;
    footprintOk = false;
    reasons.push(
      `Height ${h} mm + ${CEILING_PLANNING_CLEARANCE_MM} mm planning clearance exceeds ceiling ${input.room.heightMm} mm.`,
    );
  } else if (h + PULLUP_ACTIVITY_CLEARANCE_MM > input.room.heightMm) {
    activityLimitations.push(
      "Pull-up / overhead clearance is limited for this ceiling.",
    );
    reasons.push("Product fits physically; pull-up activity clearance is limited.");
  }

  if (typeof w !== "number" || typeof d !== "number") {
    confidence = confidence === "high" ? "medium" : "low";
    reasons.push("Incomplete footprint dimensions.");
    if (typeof w !== "number" && typeof d !== "number") {
      footprintOk = false;
    }
  } else {
    const fitsFlat =
      w <= input.room.widthMm && d <= input.room.lengthMm;
    const fitsRotated =
      d <= input.room.widthMm && w <= input.room.lengthMm;
    if (!fitsFlat && !fitsRotated) {
      footprintOk = false;
      reasons.push("Footprint exceeds room in both orientations.");
    } else if (
      Math.max(w, d) > Math.min(input.room.widthMm, input.room.lengthMm) * 0.85
    ) {
      reasons.push("Tight footprint relative to room size.");
    }
  }

  const mountType = String(
    input.product.specifications.mountType ??
      input.product.specifications.mounting ??
      "",
  ).toLowerCase();
  if (mountType.includes("wall") && input.wallMount === "no") {
    mountingOk = false;
    reasons.push("Requires wall mounting — not allowed.");
  }
  if (mountType.includes("floor") && input.floorMount === "no") {
    mountingOk = false;
    reasons.push("Requires floor mounting — not allowed.");
  }

  let status: FitStatus;
  if (!mountingOk || (footprintOk === false && typeof w === "number")) {
    status = "does-not-fit";
  } else if (typeof h !== "number" || (typeof w !== "number" && typeof d !== "number")) {
    status = "unknown";
  } else if (!ceilingOk && typeof h === "number" && h > input.room.heightMm) {
    status = "does-not-fit";
  } else if (!ceilingOk) {
    status = "does-not-fit";
  } else if (activityLimitations.length) {
    status = "fits-with-limitations";
  } else if (reasons.some((r) => /tight/i.test(r))) {
    status = "tight-fit";
  } else {
    status = "fits";
  }

  return {
    status,
    confidence,
    reasons,
    ceilingOk,
    footprintOk,
    mountingOk,
    activityLimitations,
  };
}
