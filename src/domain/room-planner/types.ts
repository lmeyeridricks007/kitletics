/**
 * Room planner domain types.
 *
 * Coordinate system (documented):
 * - Origin: top-left (north-west) of the room floor plan
 * - +X: along room width (left → right)
 * - +Y: along room length (top → bottom)
 * - Internal units: millimetres
 * - Rotation: 0 | 90 | 180 | 270 (clockwise from default footprint orientation)
 *
 * Kitletics is a planning tool, not structural engineering software.
 */

export type LengthUnit = "mm" | "cm" | "m" | "ft" | "in";

export type WallId = "north" | "east" | "south" | "west";

export type MountingAnswer = "yes" | "no" | "some-walls" | "not-sure";

export type ClearanceProvenance =
  | "manufacturer"
  | "derived"
  | "kitletics-planning";

export type ClearanceKind =
  | "physical"
  | "operating"
  | "access"
  | "safety"
  | "exercise"
  | "manufacturer-required"
  | "kitletics-planning";

export type ClearanceHardness = "hard" | "soft" | "shared" | "temporary";

export type FitStatus =
  | "fits"
  | "fits-with-limitations"
  | "tight-fit"
  | "does-not-fit"
  | "unknown";

export type FitConfidence = "high" | "medium" | "low";

export type NoiseProfile = "quiet" | "moderate" | "loud" | "unknown";

export type NoiseImportance = "not-important" | "somewhat" | "very";

export type RotationDeg = 0 | 90 | 180 | 270;

export interface RectMm {
  x: number;
  y: number;
  width: number;
  depth: number;
}

export interface ProductDimensions {
  widthMm?: number | null;
  depthMm?: number | null;
  heightMm?: number | null;
  weightKg?: number | null;
  foldedWidthMm?: number | null;
  foldedDepthMm?: number | null;
  foldedHeightMm?: number | null;
  operatingWidthMm?: number | null;
  operatingDepthMm?: number | null;
  operatingHeightMm?: number | null;
  storageWidthMm?: number | null;
  storageDepthMm?: number | null;
  storageHeightMm?: number | null;
}

export interface ProductFootprint {
  widthMm: number;
  depthMm: number;
  rotationAllowed: boolean;
}

export interface ClearanceRule {
  kind: ClearanceKind;
  hardness: ClearanceHardness;
  provenance: ClearanceProvenance;
  /** Extra mm beyond footprint on each side, or absolute zone */
  frontMm?: number;
  rearMm?: number;
  leftMm?: number;
  rightMm?: number;
  notes?: string;
}

export interface RoomOpening {
  id: string;
  type: "door" | "window";
  wallId: WallId;
  /** Offset from wall start (NW→ along wall) in mm */
  offsetMm: number;
  widthMm: number;
  /** Door swing into room */
  swingDirection?: "in" | "out" | "sliding" | "unknown";
  swingDepthMm?: number;
  sillHeightMm?: number;
  heightMm?: number;
}

export interface RoomObstacle {
  id: string;
  type:
    | "radiator"
    | "column"
    | "boiler"
    | "stairs"
    | "cupboard"
    | "utility-box"
    | "other";
  xMm: number;
  yMm: number;
  widthMm: number;
  depthMm: number;
  heightMm?: number;
  clearanceMm?: number;
  label?: string;
}

export interface RestrictedZone {
  id: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  depthMm: number;
  label?: string;
  reason?: string;
}

export interface RoomWall {
  id: WallId;
  /** Usable for mounting */
  mountable: boolean;
}

export type RoomShape = "rectangle";

export interface Room {
  id: string;
  name?: string;
  /** Internal: millimetres */
  widthMm: number;
  lengthMm: number;
  heightMm: number;
  unitDisplay: LengthUnit;
  shape: RoomShape;
  walls: RoomWall[];
  openings: RoomOpening[];
  obstacles: RoomObstacle[];
  restrictedZones: RestrictedZone[];
  floorType?: string;
  notes?: string;
  environment?:
    | "apartment"
    | "house"
    | "garage"
    | "basement"
    | "garden-room"
    | "commercial"
    | "other";
}

export type PlacementSource = "generated" | "user" | "owned";

export type PlacementConstraint =
  | "must-touch-wall"
  | "cannot-touch-wall"
  | "wall-mounted"
  | "floor-mounted"
  | "requires-front-access"
  | "requires-side-access"
  | "requires-rear-access";

export interface PlacedEquipment {
  id: string;
  productId: string;
  variantId?: string;
  roleIds: string[];
  xMm: number;
  yMm: number;
  rotation: RotationDeg;
  footprint: ProductFootprint;
  clearanceZones: RectMm[];
  locked: boolean;
  source: PlacementSource;
  wallId?: WallId;
  label: string;
  existing?: boolean;
}

export interface ManualEquipment {
  id: string;
  name: string;
  roleId: string;
  dimensions?: ProductDimensions;
  capabilities: string[];
  locked: true;
}

export interface LayoutWarning {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
  placementId?: string;
  productId?: string;
}

export interface LayoutUtilization {
  roomAreaMm2: number;
  equipmentFootprintMm2: number;
  restrictedAreaMm2: number;
  openTrainingMm2: number;
  /** 0–1 fraction of room occupied by physical footprints */
  footprintRatio: number;
}

export interface LayoutResult {
  placements: PlacedEquipment[];
  openZones: RectMm[];
  warnings: LayoutWarning[];
  utilization: LayoutUtilization;
  /** Qualitative — not fake precision */
  layoutBand: "excellent" | "strong" | "good" | "limited" | "invalid";
  mode: "training" | "stored";
}

export interface ProductFitAssessment {
  status: FitStatus;
  confidence: FitConfidence;
  reasons: string[];
  ceilingOk: boolean;
  footprintOk: boolean;
  mountingOk: boolean;
  activityLimitations: string[];
}
