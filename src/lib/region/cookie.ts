import type { RegionCode } from "@/domain/shared/types";
import { REGION_META } from "@/domain/shared/types";
import { REGION_COOKIE, isRegionCode } from "@/lib/region/resolve";

const MAX_AGE = 60 * 60 * 24 * 365;

export function readDocumentRegionCookie(): RegionCode | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${REGION_COOKIE}=`));
  if (!match) return null;
  const value = match.split("=")[1];
  return isRegionCode(value) && value in REGION_META ? value : null;
}

export function writeDocumentRegionCookie(code: RegionCode): void {
  if (typeof document === "undefined") return;
  document.cookie = `${REGION_COOKIE}=${code};path=/;max-age=${MAX_AGE};samesite=lax`;
}
