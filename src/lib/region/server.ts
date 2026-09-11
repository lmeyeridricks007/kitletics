import { cookies } from "next/headers";
import type { RegionCode } from "@/domain/shared/types";
import { REGION_COOKIE, resolveUserRegion } from "@/lib/region/resolve";

/**
 * Server-side region resolution for RSC / route handlers.
 * Explicit query/param wins over cookie; never silently overrides explicit.
 */
export async function getRequestRegion(
  explicit?: string | null,
): Promise<RegionCode> {
  const jar = await cookies();
  return resolveUserRegion({
    explicit,
    cookie: jar.get(REGION_COOKIE)?.value ?? null,
  });
}
