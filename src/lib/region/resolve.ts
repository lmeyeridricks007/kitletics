import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION, REGIONS, REGION_META } from "@/domain/shared/types";

export const REGION_COOKIE = "kitletics_region";

export function isRegionCode(value: unknown): value is RegionCode {
  return typeof value === "string" && (REGIONS as readonly string[]).includes(value);
}

/**
 * Resolve active shopping region.
 * Precedence: explicit → cookie → default (NL).
 *
 * Never infer country from IP / Accept-Language — that mis-labels currency and
 * would silently present NL (or another market) as “local.” Explicit selection
 * and the region cookie always win over any future geo hint.
 */
export function resolveUserRegion(input?: {
  explicit?: string | null;
  cookie?: string | null;
  /**
   * Reserved. Must stay unused for resolution until we have an explicit,
   * user-confirmed geo flow — never auto-apply localeHint.
   */
  localeHint?: string | null;
}): RegionCode {
  if (input?.explicit && isRegionCode(input.explicit)) return input.explicit;
  if (input?.cookie && isRegionCode(input.cookie)) return input.cookie;
  // Intentionally ignore localeHint — do not geo-infer country.
  void input?.localeHint;
  return DEFAULT_REGION;
}

export function regionLabel(code: RegionCode): string {
  return REGION_META[code].label;
}

export function regionCurrency(code: RegionCode): string {
  return REGION_META[code].currency;
}

export function allRegionsForSelector(): {
  code: RegionCode;
  label: string;
  currency: string;
}[] {
  return REGIONS.map((code) => ({
    code,
    label: REGION_META[code].label,
    currency: REGION_META[code].currency,
  }));
}
