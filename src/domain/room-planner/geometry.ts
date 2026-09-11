import type { RectMm, RotationDeg } from "@/domain/room-planner/types";

/** Axis-aligned rectangle overlap (exclusive edges — edge contact is OK). */
export function rectsOverlap(a: RectMm, b: RectMm): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.depth &&
    a.y + a.depth > b.y
  );
}

export function rectsTouchOrOverlap(a: RectMm, b: RectMm): boolean {
  return (
    a.x <= b.x + b.width &&
    a.x + a.width >= b.x &&
    a.y <= b.y + b.depth &&
    a.y + a.depth >= b.y
  );
}

export function rectArea(r: RectMm): number {
  return Math.max(0, r.width) * Math.max(0, r.depth);
}

export function rectContains(outer: RectMm, inner: RectMm): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.depth <= outer.y + outer.depth
  );
}

export function rotateFootprint(
  widthMm: number,
  depthMm: number,
  rotation: RotationDeg,
): { widthMm: number; depthMm: number } {
  if (rotation === 90 || rotation === 270) {
    return { widthMm: depthMm, depthMm: widthMm };
  }
  return { widthMm, depthMm };
}

export function placementRect(
  xMm: number,
  yMm: number,
  widthMm: number,
  depthMm: number,
  rotation: RotationDeg,
): RectMm {
  const { widthMm: w, depthMm: d } = rotateFootprint(widthMm, depthMm, rotation);
  return { x: xMm, y: yMm, width: w, depth: d };
}

export function expandRect(
  r: RectMm,
  frontMm: number,
  rearMm: number,
  leftMm: number,
  rightMm: number,
  rotation: RotationDeg = 0,
): RectMm {
  // front = +Y direction in default orientation; rotate with equipment
  let f = frontMm;
  let rear = rearMm;
  let left = leftMm;
  let right = rightMm;
  if (rotation === 90) {
    [left, f, right, rear] = [rear, left, f, right];
  } else if (rotation === 180) {
    [f, rear] = [rear, f];
    [left, right] = [right, left];
  } else if (rotation === 270) {
    [left, f, right, rear] = [f, right, rear, left];
  }
  return {
    x: r.x - left,
    y: r.y - rear,
    width: r.width + left + right,
    depth: r.depth + rear + f,
  };
}

export function clampRectToRoom(
  r: RectMm,
  roomWidthMm: number,
  roomLengthMm: number,
): RectMm {
  const x = Math.max(0, Math.min(r.x, roomWidthMm - r.width));
  const y = Math.max(0, Math.min(r.y, roomLengthMm - r.depth));
  return { ...r, x, y };
}
