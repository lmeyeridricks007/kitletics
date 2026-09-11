import { anyCollision } from "@/domain/room-planner/collision";
import {
  clearanceZonesForPlacement,
  hardExclusionZones,
  physicalRects,
} from "@/domain/room-planner/clearance";
import {
  placementRect,
  rectArea,
  rectContains,
  rotateFootprint,
} from "@/domain/room-planner/geometry";
import {
  footprintFromDimensions,
  resolveProductDimensions,
} from "@/domain/room-planner/product-geometry";
import { snapToGrid } from "@/domain/room-planner/units";
import type { Product } from "@/domain/products/types";
import type {
  LayoutResult,
  LayoutWarning,
  PlacedEquipment,
  RectMm,
  Room,
  RotationDeg,
} from "@/domain/room-planner/types";
import type { BuilderRoleId } from "@/domain/room-planner/exercises";

const GRID_MM = 50;
const ROTATIONS: RotationDeg[] = [0, 90, 180, 270];

export interface LayoutItemInput {
  product: Product;
  roleIds: BuilderRoleId[];
  locked?: boolean;
  existing?: boolean;
  /** Prefer this placement if locked */
  placement?: Pick<PlacedEquipment, "xMm" | "yMm" | "rotation" | "wallId">;
  source?: PlacedEquipment["source"];
}

export interface GenerateLayoutInput {
  room: Room;
  items: LayoutItemInput[];
  mode?: "training" | "stored";
  /** Prefer more open center space */
  preserveOpenSpace?: boolean;
}

function candidatePositions(
  room: Room,
  widthMm: number,
  depthMm: number,
  preferWall: boolean,
): { x: number; y: number; rotation: RotationDeg }[] {
  const out: { x: number; y: number; rotation: RotationDeg }[] = [];
  for (const rotation of ROTATIONS) {
    const { widthMm: w, depthMm: d } = rotateFootprint(widthMm, depthMm, rotation);
    if (w > room.widthMm || d > room.lengthMm) continue;
    const maxX = room.widthMm - w;
    const maxY = room.lengthMm - d;
    const xs = new Set<number>([
      0,
      snapToGrid(maxX),
      snapToGrid(maxX / 2),
    ]);
    const ys = new Set<number>([
      0,
      snapToGrid(maxY),
      snapToGrid(maxY / 2),
    ]);
    if (preferWall) {
      for (let x = 0; x <= maxX; x += GRID_MM * 2) xs.add(x);
      ys.add(0);
      ys.add(snapToGrid(maxY));
    } else {
      for (let x = 0; x <= maxX; x += GRID_MM * 4) xs.add(x);
      for (let y = 0; y <= maxY; y += GRID_MM * 4) ys.add(y);
    }
    for (const x of xs) {
      for (const y of ys) {
        if (x < 0 || y < 0 || x > maxX || y > maxY) continue;
        out.push({ x, y, rotation });
      }
    }
  }
  // Deterministic order: wall-adjacent first when preferWall
  return out.sort((a, b) => {
    const aWall = a.x === 0 || a.y === 0 ? 0 : 1;
    const bWall = b.x === 0 || b.y === 0 ? 0 : 1;
    if (preferWall && aWall !== bWall) return aWall - bWall;
    if (a.y !== b.y) return a.y - b.y;
    if (a.x !== b.x) return a.x - b.x;
    return a.rotation - b.rotation;
  });
}

function prefersPerimeter(categoryId: string): boolean {
  return (
    categoryId === "cat-power-racks" ||
    categoryId === "cat-gym-storage" ||
    categoryId === "cat-rowing-machines" ||
    categoryId === "cat-air-bikes" ||
    categoryId === "cat-treadmills" ||
    categoryId === "cat-ski-ergs" ||
    categoryId === "cat-pull-up-bars"
  );
}

function openTrainingEstimate(
  room: Room,
  placements: PlacedEquipment[],
  exclusions: RectMm[],
): { openMm2: number; zones: RectMm[] } {
  const phys = physicalRects(placements);
  const occupied = phys.reduce((s, r) => s + rectArea(r), 0);
  const restricted = exclusions.reduce((s, r) => s + rectArea(r), 0);
  const roomA = room.widthMm * room.lengthMm;
  // Approximate open zone as largest empty rectangle heuristic: center remaining
  const openMm2 = Math.max(0, roomA - occupied - restricted * 0.5);
  const margin = 400;
  const zones: RectMm[] = [
    {
      x: margin,
      y: margin,
      width: Math.max(0, room.widthMm - margin * 2),
      depth: Math.max(0, room.lengthMm - margin * 2),
    },
  ];
  return { openMm2, zones };
}

/**
 * Deterministic layout generator.
 * Locked items placed first; others searched on a 50 mm grid.
 */
export function generateLayout(input: GenerateLayoutInput): LayoutResult {
  const mode = input.mode ?? "training";
  const warnings: LayoutWarning[] = [];
  const placements: PlacedEquipment[] = [];
  const exclusions = hardExclusionZones(input.room);
  const roomRect: RectMm = {
    x: 0,
    y: 0,
    width: input.room.widthMm,
    depth: input.room.lengthMm,
  };

  const sorted = [...input.items].sort((a, b) => {
    if (a.locked && !b.locked) return -1;
    if (!a.locked && b.locked) return 1;
    const aPri = prefersPerimeter(a.product.categoryId) ? 0 : 1;
    const bPri = prefersPerimeter(b.product.categoryId) ? 0 : 1;
    return aPri - bPri;
  });

  for (const item of sorted) {
    // Flooring is area coverage — skip as floorplan object (or place as marker)
    if (item.product.categoryId === "cat-gym-flooring") {
      warnings.push({
        code: "flooring-area",
        severity: "info",
        message: `${item.product.fullName} covers floor area — not shown as a furniture block.`,
        productId: item.product.id,
      });
      continue;
    }
    // Barbells stored on rack — don't place full 2.2m bar as furniture if rack present
    if (
      item.product.categoryId === "cat-barbells" &&
      sorted.some((i) => i.product.categoryId === "cat-power-racks")
    ) {
      warnings.push({
        code: "bar-on-rack",
        severity: "info",
        message: `${item.product.fullName} assumed stored on the rack — not placed as a separate floor object.`,
        productId: item.product.id,
      });
      continue;
    }

    const dims = resolveProductDimensions(item.product);
    const fp = footprintFromDimensions(dims, mode);
    if (!fp) {
      warnings.push({
        code: "missing-dimensions",
        severity: "warning",
        message: `${item.product.fullName} missing footprint — not auto-placed (verification required).`,
        productId: item.product.id,
      });
      continue;
    }

    if (typeof dims.heightMm === "number") {
      if (dims.heightMm > input.room.heightMm) {
        warnings.push({
          code: "ceiling",
          severity: "error",
          message: `${item.product.fullName} height exceeds ceiling.`,
          productId: item.product.id,
        });
        continue;
      }
    } else {
      warnings.push({
        code: "unknown-height",
        severity: "warning",
        message: `${item.product.fullName} height unknown — placed with low confidence if footprint fits.`,
        productId: item.product.id,
      });
    }

    const existingPhys = physicalRects(placements);

    if (item.locked && item.placement) {
      const rect = placementRect(
        item.placement.xMm,
        item.placement.yMm,
        fp.widthMm,
        fp.depthMm,
        item.placement.rotation,
      );
      if (!rectContains(roomRect, rect)) {
        warnings.push({
          code: "locked-out-of-bounds",
          severity: "error",
          message: `Locked ${item.product.fullName} is outside the room.`,
          productId: item.product.id,
        });
      } else if (anyCollision(rect, [...existingPhys, ...exclusions])) {
        warnings.push({
          code: "locked-collision",
          severity: "error",
          message: `Locked ${item.product.fullName} collides with door swing, obstacle, or other equipment.`,
          productId: item.product.id,
        });
      }
      placements.push({
        id: `place-${item.product.id}`,
        productId: item.product.id,
        roleIds: item.roleIds,
        xMm: item.placement.xMm,
        yMm: item.placement.yMm,
        rotation: item.placement.rotation,
        footprint: fp,
        clearanceZones: clearanceZonesForPlacement(
          item.placement.xMm,
          item.placement.yMm,
          fp.widthMm,
          fp.depthMm,
          item.placement.rotation,
          item.product.categoryId,
          dims,
        ),
        locked: true,
        source: item.source ?? "owned",
        wallId: item.placement.wallId,
        label: item.product.name,
        existing: item.existing,
      });
      continue;
    }

    const preferWall = prefersPerimeter(item.product.categoryId);
    const candidates = candidatePositions(
      input.room,
      fp.widthMm,
      fp.depthMm,
      preferWall,
    );

    let placed: PlacedEquipment | null = null;
    for (const c of candidates) {
      const rect = placementRect(c.x, c.y, fp.widthMm, fp.depthMm, c.rotation);
      if (!rectContains(roomRect, rect)) continue;
      if (anyCollision(rect, [...existingPhys, ...exclusions])) continue;

      // Soft: prefer not filling center if preserveOpenSpace and perimeter item
      placed = {
        id: `place-${item.product.id}`,
        productId: item.product.id,
        roleIds: item.roleIds,
        xMm: c.x,
        yMm: c.y,
        rotation: c.rotation,
        footprint: fp,
        clearanceZones: clearanceZonesForPlacement(
          c.x,
          c.y,
          fp.widthMm,
          fp.depthMm,
          c.rotation,
          item.product.categoryId,
          dims,
        ),
        locked: false,
        source: item.source ?? "generated",
        label: item.product.name,
        existing: item.existing,
      };
      break;
    }

    if (!placed) {
      warnings.push({
        code: "no-placement",
        severity: "error",
        message: `Could not place ${item.product.fullName} without collision.`,
        productId: item.product.id,
      });
      continue;
    }
    placements.push(placed);
  }

  const { openMm2, zones } = openTrainingEstimate(
    input.room,
    placements,
    exclusions,
  );
  const roomA = input.room.widthMm * input.room.lengthMm;
  const equipA = physicalRects(placements).reduce((s, r) => s + rectArea(r), 0);
  const restrictedA = exclusions.reduce((s, r) => s + rectArea(r), 0);
  const footprintRatio = equipA / Math.max(roomA, 1);

  let layoutBand: LayoutResult["layoutBand"] = "excellent";
  if (warnings.some((w) => w.severity === "error")) layoutBand = "limited";
  else if (footprintRatio > 0.55) layoutBand = "limited";
  else if (footprintRatio > 0.4) layoutBand = "good";
  else if (openMm2 / roomA < 0.25) layoutBand = "good";
  else layoutBand = "strong";
  if (
    !warnings.some((w) => w.severity === "error") &&
    footprintRatio <= 0.35 &&
    openMm2 / roomA >= 0.3
  ) {
    layoutBand = "excellent";
  }

  if (input.preserveOpenSpace && footprintRatio > 0.5) {
    warnings.push({
      code: "crowded",
      severity: "warning",
      message:
        "Equipment covers a large share of the floor — consider a more compact set or folding gear.",
    });
  }

  return {
    placements,
    openZones: zones,
    warnings,
    utilization: {
      roomAreaMm2: roomA,
      equipmentFootprintMm2: equipA,
      restrictedAreaMm2: restrictedA,
      openTrainingMm2: openMm2,
      footprintRatio,
    },
    layoutBand,
    mode,
  };
}

/** Re-run layout keeping locked placements. */
export function autoArrange(
  room: Room,
  placements: PlacedEquipment[],
  productsById: Map<string, Product>,
  preserveOpenSpace = true,
): LayoutResult {
  const items: LayoutItemInput[] = placements
    .map((p) => {
      const product = productsById.get(p.productId);
      if (!product) return null;
      return {
        product,
        roleIds: p.roleIds as BuilderRoleId[],
        locked: p.locked,
        existing: p.existing,
        source: p.source,
        placement: p.locked
          ? { xMm: p.xMm, yMm: p.yMm, rotation: p.rotation, wallId: p.wallId }
          : undefined,
      };
    })
    .filter(Boolean) as LayoutItemInput[];

  return generateLayout({ room, items, preserveOpenSpace });
}

export function validatePlacementMove(input: {
  room: Room;
  placement: PlacedEquipment;
  others: PlacedEquipment[];
  xMm: number;
  yMm: number;
  rotation: RotationDeg;
}): { ok: boolean; reason?: string } {
  const rect = placementRect(
    input.xMm,
    input.yMm,
    input.placement.footprint.widthMm,
    input.placement.footprint.depthMm,
    input.rotation,
  );
  const roomRect: RectMm = {
    x: 0,
    y: 0,
    width: input.room.widthMm,
    depth: input.room.lengthMm,
  };
  if (!rectContains(roomRect, rect)) {
    return { ok: false, reason: "Does not fit here — outside room bounds." };
  }
  const exclusions = hardExclusionZones(input.room);
  const others = physicalRects(
    input.others.filter((p) => p.id !== input.placement.id),
  );
  if (anyCollision(rect, exclusions)) {
    return {
      ok: false,
      reason: "Blocks door swing, obstacle, or restricted zone.",
    };
  }
  if (anyCollision(rect, others)) {
    return { ok: false, reason: "Overlaps another piece of equipment." };
  }
  return { ok: true };
}
