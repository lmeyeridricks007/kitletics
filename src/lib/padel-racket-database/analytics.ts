/**
 * Padel Racket Database → GA4 via Kitletics `track()`.
 * Controlled params only — no PII / free-form search text.
 */

import { track } from "@/lib/analytics/events";
import { buildPageContext } from "@/lib/analytics/page-context";
import { isBrowser } from "@/lib/analytics/config";
import type { PadelRacketDatabaseFilters } from "@/lib/padel-racket-database/types";
import type { PadelRacketDatabaseSort } from "@/lib/padel-racket-database/types";

export type RacketDatabaseAnalyticsEvent =
  | "racket_database_view"
  | "racket_database_filter"
  | "racket_database_sort"
  | "racket_database_result_click"
  | "racket_database_compare_add"
  | "racket_database_review_click"
  | "racket_database_data_download"
  | "racket_database_citation_copy";

export type RacketDatabaseFilterType =
  | "brand"
  | "shape"
  | "balance"
  | "weightBuckets"
  | "playerLevel"
  | "playStyle"
  | "faceMaterial"
  | "surface"
  | "core"
  | "feel"
  | "powerBuckets"
  | "controlBuckets"
  | "comfortBuckets"
  | "maneuverabilityBuckets"
  | "priceBuckets"
  | "q"
  | "clear"
  | "chip_remove";

export type RacketDatabaseEventParams = {
  filter_type?: RacketDatabaseFilterType | string;
  filter_value?: string;
  sort_type?: PadelRacketDatabaseSort | string;
  result_position?: number;
  product_slug?: string;
  brand?: string;
  result_count?: number;
  has_query?: boolean;
  query_length?: number;
};

const FILTER_LIST_KEYS = [
  "brand",
  "shape",
  "balance",
  "weightBuckets",
  "playerLevel",
  "playStyle",
  "faceMaterial",
  "surface",
  "core",
  "feel",
  "powerBuckets",
  "controlBuckets",
  "comfortBuckets",
  "maneuverabilityBuckets",
  "priceBuckets",
] as const satisfies ReadonlyArray<keyof PadelRacketDatabaseFilters>;

function pageContext() {
  if (!isBrowser()) return { page_type: "racket_database" as const };
  return buildPageContext(window.location.pathname, window.location.search);
}

export function trackRacketDatabaseEvent(
  event: RacketDatabaseAnalyticsEvent,
  params: RacketDatabaseEventParams = {},
): void {
  try {
    track(event, {
      ...pageContext(),
      page_type: "racket_database",
      sport: "padel",
      category: "rackets",
      ...params,
    });
  } catch {
    // never break UX
  }
}

export function diffDatabaseFilters(
  prev: PadelRacketDatabaseFilters,
  next: PadelRacketDatabaseFilters,
): RacketDatabaseEventParams | null {
  if (prev.sort !== next.sort) {
    return { sort_type: next.sort };
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

  if (
    next.brand.length === 0 &&
    next.shape.length === 0 &&
    next.playStyle.length === 0 &&
    !next.q
  ) {
    return { filter_type: "clear" };
  }

  return { filter_type: "chip_remove" };
}

export function trackDatabaseFilterChange(
  prev: PadelRacketDatabaseFilters,
  next: PadelRacketDatabaseFilters,
  resultCount: number,
): void {
  const diff = diffDatabaseFilters(prev, next);
  if (!diff) return;
  if (diff.filter_type === "q") {
    const len = diff.query_length ?? 0;
    if (diff.has_query && len < 3) return;
  }

  if (diff.sort_type) {
    trackRacketDatabaseEvent("racket_database_sort", {
      sort_type: diff.sort_type,
      result_count: resultCount,
    });
    return;
  }
  trackRacketDatabaseEvent("racket_database_filter", {
    ...diff,
    result_count: resultCount,
  });
  track("database_filter", {
    ...diff,
    result_count: resultCount,
  });
}
