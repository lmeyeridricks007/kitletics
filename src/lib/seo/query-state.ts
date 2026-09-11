import type { Metadata } from "next";

/**
 * Query-state indexation policy
 * -----------------------------
 * Facet / sort / pagination / type filters are UX state, not intentional landings.
 * Any non-empty search param → noindex,follow + canonical to the clean path.
 */
export function hasNonCanonicalQueryState(
  sp: Record<string, string | string[] | undefined>,
): boolean {
  return Object.keys(sp).some((key) => {
    const value = sp[key];
    if (value === undefined) return false;
    if (Array.isArray(value)) {
      return value.some((item) => item !== undefined && String(item).length > 0);
    }
    return String(value).length > 0;
  });
}

export const NOINDEX_FOLLOW: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: true,
};
