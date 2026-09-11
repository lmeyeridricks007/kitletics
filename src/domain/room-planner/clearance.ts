import { expandRect, placementRect } from "@/domain/room-planner/geometry";
import type {
  ClearanceRule,
  PlacedEquipment,
  ProductDimensions,
  RectMm,
  Room,
  RoomOpening,
  RotationDeg,
} from "@/domain/room-planner/types";

/** Kitletics planning clearances — NOT manufacturer requirements. */
export const KITLETICS_PLANNING_CLEARANCE: Record<
  string,
  ClearanceRule
> = {
  "cat-power-racks": {
    kind: "kitletics-planning",
    hardness: "soft",
    provenance: "kitletics-planning",
    frontMm: 600,
    rearMm: 200,
    leftMm: 400,
    rightMm: 400,
    notes:
      "Planning allowance for barbell loading access — not a manufacturer safety spec.",
  },
  "cat-weight-benches": {
    kind: "kitletics-planning",
    hardness: "shared",
    provenance: "kitletics-planning",
    frontMm: 800,
    rearMm: 200,
    leftMm: 300,
    rightMm: 300,
    notes: "Shared open training / bench press movement zone.",
  },
  "cat-adjustable-dumbbells": {
    kind: "kitletics-planning",
    hardness: "shared",
    provenance: "kitletics-planning",
    frontMm: 900,
    rearMm: 100,
    leftMm: 400,
    rightMm: 400,
    notes: "Shared dumbbell training zone — may overlap open training space.",
  },
  "cat-rowing-machines": {
    kind: "operating",
    hardness: "soft",
    provenance: "kitletics-planning",
    frontMm: 400,
    rearMm: 200,
    leftMm: 300,
    rightMm: 300,
    notes: "Access clearance around rower — verify manufacturer if published.",
  },
  "cat-air-bikes": {
    kind: "operating",
    hardness: "soft",
    provenance: "kitletics-planning",
    frontMm: 400,
    rearMm: 200,
    leftMm: 300,
    rightMm: 300,
  },
  "cat-treadmills": {
    kind: "operating",
    hardness: "hard",
    provenance: "kitletics-planning",
    rearMm: 600,
    frontMm: 200,
    leftMm: 200,
    rightMm: 200,
    notes: "Rear dismount clearance — confirm manufacturer requirement.",
  },
  "cat-pull-up-bars": {
    kind: "exercise",
    hardness: "soft",
    provenance: "kitletics-planning",
    frontMm: 800,
    rearMm: 200,
    leftMm: 200,
    rightMm: 200,
  },
  default: {
    kind: "kitletics-planning",
    hardness: "soft",
    provenance: "kitletics-planning",
    frontMm: 300,
    rearMm: 150,
    leftMm: 150,
    rightMm: 150,
  },
};

export function clearanceForCategory(categoryId: string): ClearanceRule {
  return (
    KITLETICS_PLANNING_CLEARANCE[categoryId] ??
    KITLETICS_PLANNING_CLEARANCE.default
  );
}

export function clearanceZonesForPlacement(
  xMm: number,
  yMm: number,
  widthMm: number,
  depthMm: number,
  rotation: RotationDeg,
  categoryId: string,
  dims?: ProductDimensions,
): RectMm[] {
  const physical = placementRect(xMm, yMm, widthMm, depthMm, rotation);
  const rule = clearanceForCategory(categoryId);
  const opW = dims?.operatingWidthMm ?? widthMm;
  const opD = dims?.operatingDepthMm ?? depthMm;
  const zones: RectMm[] = [];

  if (
    typeof dims?.operatingWidthMm === "number" &&
    typeof dims?.operatingDepthMm === "number"
  ) {
    zones.push(
      placementRect(xMm, yMm, opW, opD, rotation),
    );
  }

  zones.push(
    expandRect(
      physical,
      rule.frontMm ?? 0,
      rule.rearMm ?? 0,
      rule.leftMm ?? 0,
      rule.rightMm ?? 0,
      rotation,
    ),
  );
  return zones;
}

/** Door inward swing becomes a hard restricted rectangle. */
export function doorSwingZone(room: Room, opening: RoomOpening): RectMm | null {
  if (opening.type !== "door") return null;
  if (opening.swingDirection === "out" || opening.swingDirection === "sliding") {
    return null;
  }
  const swing = opening.swingDepthMm ?? opening.widthMm;
  const { widthMm: rw, lengthMm: rl } = room;
  switch (opening.wallId) {
    case "north":
      return {
        x: opening.offsetMm,
        y: 0,
        width: opening.widthMm,
        depth: swing,
      };
    case "south":
      return {
        x: opening.offsetMm,
        y: rl - swing,
        width: opening.widthMm,
        depth: swing,
      };
    case "west":
      return {
        x: 0,
        y: opening.offsetMm,
        width: swing,
        depth: opening.widthMm,
      };
    case "east":
      return {
        x: rw - swing,
        y: opening.offsetMm,
        width: swing,
        depth: opening.widthMm,
      };
    default:
      return null;
  }
}

export function hardExclusionZones(room: Room): RectMm[] {
  const zones: RectMm[] = [];
  for (const o of room.obstacles) {
    const c = o.clearanceMm ?? 0;
    zones.push({
      x: o.xMm - c,
      y: o.yMm - c,
      width: o.widthMm + 2 * c,
      depth: o.depthMm + 2 * c,
    });
  }
  for (const z of room.restrictedZones) {
    zones.push({
      x: z.xMm,
      y: z.yMm,
      width: z.widthMm,
      depth: z.depthMm,
    });
  }
  for (const opening of room.openings) {
    const swing = doorSwingZone(room, opening);
    if (swing) zones.push(swing);
  }
  return zones;
}

export function physicalRects(placements: PlacedEquipment[]): RectMm[] {
  return placements.map((p) =>
    placementRect(
      p.xMm,
      p.yMm,
      p.footprint.widthMm,
      p.footprint.depthMm,
      p.rotation,
    ),
  );
}
