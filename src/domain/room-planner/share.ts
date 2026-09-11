/**
 * Shareable / persisted Home Gym Builder state.
 * Never encode personal identifiers or authoritative Product dimensions —
 * always rehydrate dimensions from catalog.
 */

import type { AdvancedBuilderProfile } from "@/domain/builders/home-gym";
import type { PlacedEquipment, Room } from "@/domain/room-planner/types";

export const BUILD_SHARE_VERSION = 1 as const;

export interface SharedBuildV1 {
  version: typeof BUILD_SHARE_VERSION;
  name?: string;
  room: Pick<
    Room,
    | "widthMm"
    | "lengthMm"
    | "heightMm"
    | "openings"
    | "obstacles"
    | "restrictedZones"
    | "environment"
    | "walls"
  >;
  goals: AdvancedBuilderProfile["goals"];
  priorities: AdvancedBuilderProfile["priorities"];
  exercises: AdvancedBuilderProfile["exercises"];
  budgetEur: number;
  budgetMode: AdvancedBuilderProfile["budgetMode"];
  noiseImportance: AdvancedBuilderProfile["noiseImportance"];
  wallMount: AdvancedBuilderProfile["wallMount"];
  floorMount: AdvancedBuilderProfile["floorMount"];
  ownedProductIds: string[];
  selectedProductIds: string[];
  placements: {
    productId: string;
    xMm: number;
    yMm: number;
    rotation: PlacedEquipment["rotation"];
    locked: boolean;
  }[];
  createdAt: string;
}

export function encodeBuildShare(build: SharedBuildV1): string {
  const json = JSON.stringify(build);
  if (typeof btoa !== "undefined") {
    return btoa(unescape(encodeURIComponent(json)));
  }
  return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeBuildShare(payload: string): SharedBuildV1 | null {
  try {
    let json: string;
    if (typeof atob !== "undefined") {
      json = decodeURIComponent(escape(atob(payload)));
    } else {
      json = Buffer.from(payload, "base64url").toString("utf8");
    }
    const data = JSON.parse(json) as SharedBuildV1;
    if (data.version !== BUILD_SHARE_VERSION) return null;
    if (!data.room?.widthMm || !Array.isArray(data.selectedProductIds)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export const LOCAL_GYMS_KEY = "kitletics.my-gyms.v1";
export const LOCAL_ROOM_KEY = "kitletics.saved-room.v1";

export interface SavedGymLocal {
  id: string;
  name: string;
  build: SharedBuildV1;
  updatedAt: string;
}

export function validateSavedBuild(build: SharedBuildV1, publishedIds: Set<string>): {
  ok: boolean;
  missingProductIds: string[];
  warnings: string[];
} {
  const missing = build.selectedProductIds.filter((id) => !publishedIds.has(id));
  const warnings: string[] = [];
  if (missing.length) {
    warnings.push(
      `${missing.length} product(s) are no longer published — review before shopping.`,
    );
  }
  return {
    ok: missing.length === 0,
    missingProductIds: missing,
    warnings,
  };
}
