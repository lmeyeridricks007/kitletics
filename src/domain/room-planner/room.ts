import type {
  MountingAnswer,
  Room,
  RoomOpening,
  RoomObstacle,
  RestrictedZone,
  WallId,
} from "@/domain/room-planner/types";
import { toMm } from "@/domain/room-planner/units";

export interface RoomPreset {
  id: string;
  label: string;
  /** Approximate metres — editable after apply */
  widthM: number;
  lengthM: number;
  heightM: number;
  environment: Room["environment"];
}

export const ROOM_PRESETS: RoomPreset[] = [
  { id: "small", label: "Small Room", widthM: 2.5, lengthM: 2.5, heightM: 2.4, environment: "apartment" },
  { id: "spare", label: "Spare Bedroom", widthM: 3.2, lengthM: 3.0, heightM: 2.4, environment: "house" },
  { id: "apartment", label: "Apartment Room", widthM: 3.0, lengthM: 3.0, heightM: 2.4, environment: "apartment" },
  { id: "garage", label: "Garage", widthM: 5.0, lengthM: 4.0, heightM: 2.5, environment: "garage" },
  { id: "single-garage", label: "Single Garage", widthM: 3.0, lengthM: 6.0, heightM: 2.4, environment: "garage" },
  { id: "double-garage", label: "Double Garage", widthM: 5.5, lengthM: 6.0, heightM: 2.5, environment: "garage" },
  { id: "basement", label: "Basement", widthM: 4.0, lengthM: 5.0, heightM: 2.2, environment: "basement" },
  { id: "garden", label: "Garden Room", widthM: 3.5, lengthM: 3.5, heightM: 2.3, environment: "garden-room" },
  { id: "custom", label: "Custom", widthM: 3.4, lengthM: 3.0, heightM: 2.4, environment: "other" },
];

export function createRectangularRoom(input: {
  widthM: number;
  lengthM: number;
  heightM: number;
  name?: string;
  environment?: Room["environment"];
  wallMount?: MountingAnswer;
  openings?: RoomOpening[];
  obstacles?: RoomObstacle[];
  restrictedZones?: RestrictedZone[];
}): Room {
  const mountable =
    input.wallMount === "no"
      ? false
      : input.wallMount === "some-walls"
        ? true
        : true;
  const walls: Room["walls"] = (
    ["north", "east", "south", "west"] as WallId[]
  ).map((id) => ({
    id,
    mountable:
      input.wallMount === "some-walls" ? id === "north" || id === "west" : mountable,
  }));

  return {
    id: `room-${Math.round(input.widthM * 100)}x${Math.round(input.lengthM * 100)}`,
    name: input.name,
    widthMm: Math.round(toMm(input.widthM, "m")),
    lengthMm: Math.round(toMm(input.lengthM, "m")),
    heightMm: Math.round(toMm(input.heightM, "m")),
    unitDisplay: "m",
    shape: "rectangle",
    walls,
    openings: input.openings ?? [],
    obstacles: input.obstacles ?? [],
    restrictedZones: input.restrictedZones ?? [],
    environment: input.environment ?? "other",
  };
}

export function roomAreaM2(room: Room): number {
  return (room.widthMm * room.lengthMm) / 1_000_000;
}
