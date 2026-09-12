/**
 * Running Shoe Database → GA4 via Kitletics `track()`.
 * Controlled params only — no PII / free-form search text.
 */

import { track } from "@/lib/analytics/events";
import { buildPageContext } from "@/lib/analytics/page-context";
import { isBrowser } from "@/lib/analytics/config";
import type { RunningShoeDatabaseFilters } from "@/lib/running-shoe-database/types";
import type { RunningShoeDatabaseSort } from "@/lib/running-shoe-database/types";

export type ShoeDatabaseAnalyticsEvent =
  | "shoe_database_view"
  | "shoe_database_filter"
  | "shoe_database_sort"
  | "shoe_database_result_click"
  | "shoe_database_compare_add"
  | "shoe_database_review_click"
  | "shoe_database_alternatives_click"
  | "shoe_database_insight_view"
  | "shoe_database_insight_click"
  | "shoe_database_share"
  | "shoe_database_citation_copy"
  | "shoe_database_data_download";

/** Controlled filter dimension keys (not free-form labels). */
export type ShoeDatabaseFilterType =
  | "brand"
  | "gender"
  | "useCase"
  | "type"
  | "cushion"
  | "stability"
  | "weightBuckets"
  | "dropBuckets"
  | "stackBuckets"
  | "priceBuckets"
  | "plate"
  | "surface"
  | "distance"
  | "terrain"
  | "width"
  | "q"
  | "clear"
  | "chip_remove"
  | "chart_segment";

export type ShoeDatabaseShareChannel =
  | "copy_link"
  | "linkedin"
  | "x"
  | "reddit";

export type ShoeDatabaseEventParams = {
  filter_type?: ShoeDatabaseFilterType | string;
  filter_value?: string;
  sort_type?: RunningShoeDatabaseSort | string;
  result_position?: number;
  product_slug?: string;
  brand?: string;
  insight_type?: string;
  share_channel?: ShoeDatabaseShareChannel | string;
  result_count?: number;
  has_query?: boolean;
  query_length?: number;
};

const FILTER_LIST_KEYS = [
  "brand",
  "gender",
  "useCase",
  "type",
  "cushion",
  "stability",
  "weightBuckets",
  "dropBuckets",
  "stackBuckets",
  "priceBuckets",
  "surface",
  "distance",
  "terrain",
  "width",
] as const satisfies ReadonlyArray<keyof RunningShoeDatabaseFilters>;

function pageContext() {
  if (!isBrowser()) return { page_type: "shoe_database" as const };
  return buildPageContext(window.location.pathname, window.location.search);
}

/**
 * Emit a shoe-database analytics event. Never throws.
 */
export function trackShoeDatabaseEvent(
  event: ShoeDatabaseAnalyticsEvent,
  params: ShoeDatabaseEventParams = {},
): void {
  try {
    track(event, {
      ...pageContext(),
      page_type: "shoe_database",
      sport: "running",
      category: "shoes",
      ...params,
    });
  } catch {
    // never break UX
  }
}

/**
 * Diff two filter states → first meaningful change for analytics.
 * Search text is never sent — only has_query / query_length.
 */
export function diffDatabaseFilters(
  prev: RunningShoeDatabaseFilters,
  next: RunningShoeDatabaseFilters,
): ShoeDatabaseEventParams | null {
  if (prev.sort !== next.sort) {
    return { sort_type: next.sort };
  }

  if (prev.plate !== next.plate) {
    return { filter_type: "plate", filter_value: next.plate };
  }

  for (const key of FILTER_LIST_KEYS) {
    const a = new Set(prev[key] as string[]);
    const b = new Set(next[key] as string[]);
    for (const v of b) {
      if (!a.has(v)) {
        return { filter_type: key, filter_value: v };
      }
    }
    for (const v of a) {
      if (!b.has(v)) {
        return { filter_type: key, filter_value: v };
      }
    }
  }

  const prevQ = (prev.q ?? "").trim();
  const nextQ = (next.q ?? "").trim();
  if (prevQ !== nextQ) {
    return {
      filter_type: "q",
      has_query: nextQ.length > 0,
      query_length: Math.min(nextQ.length, 80),
    };
  }

  // Cleared to defaults (no single facet change detected)
  if (
    next.brand.length === 0 &&
    next.useCase.length === 0 &&
    next.type.length === 0 &&
    next.plate === "any" &&
    !next.q
  ) {
    return { filter_type: "clear" };
  }

  return { filter_type: "chip_remove" };
}

export function trackDatabaseFilterChange(
  prev: RunningShoeDatabaseFilters,
  next: RunningShoeDatabaseFilters,
  resultCount: number,
): void {
  const diff = diffDatabaseFilters(prev, next);
  if (!diff) return;
  if (diff?.filter_type === "q") {
    const len = diff.query_length ?? 0;
    // Avoid keystroke spam — track clear or queries of length ≥3 only
    if (diff.has_query && len < 3) return;
  }

  if (diff.sort_type) {
    trackShoeDatabaseEvent("shoe_database_sort", {
      sort_type: diff.sort_type,
      result_count: resultCount,
    });
    return;
  }
  trackShoeDatabaseEvent("shoe_database_filter", {
    ...diff,
    result_count: resultCount,
  });
}
