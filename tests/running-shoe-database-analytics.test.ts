/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  setAnalyticsCollectionAllowed,
  track,
} from "@/lib/analytics/events";
import {
  __resetGtagBridgeForTests,
  configureGa,
} from "@/lib/analytics/gtag";
import {
  buildPageContext,
  classifyAnalyticsPageType,
  viewEventForPageType,
} from "@/lib/analytics/page-context";
import { sanitizeAnalyticsParams } from "@/lib/analytics/sanitize";
import {
  diffDatabaseFilters,
  trackDatabaseFilterChange,
  trackShoeDatabaseEvent,
} from "@/lib/running-shoe-database/analytics";
import { DEFAULT_DATABASE_FILTERS } from "@/lib/running-shoe-database/params";
import type { RunningShoeDatabaseFilters } from "@/lib/running-shoe-database/types";
import { ANALYTICS_EVENTS } from "@/lib/analytics/types";

function baseFilters(
  partial: Partial<RunningShoeDatabaseFilters> = {},
): RunningShoeDatabaseFilters {
  return { ...DEFAULT_DATABASE_FILTERS, ...partial };
}

describe("shoe database analytics", () => {
  beforeEach(() => {
    __resetGtagBridgeForTests();
    configureGa("G-82Z9YHTT93", { sendPageView: false });
    setAnalyticsCollectionAllowed(true);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.length = 0;
    configureGa("G-82Z9YHTT93", { sendPageView: false });
  });

  afterEach(() => {
    __resetGtagBridgeForTests();
    setAnalyticsCollectionAllowed(false);
  });

  it("classifies database path and maps shoe_database_view", () => {
    expect(classifyAnalyticsPageType("/running/shoes/database")).toBe(
      "shoe_database",
    );
    expect(viewEventForPageType("shoe_database")).toBe("shoe_database_view");
    const ctx = buildPageContext("/running/shoes/database");
    expect(ctx.page_type).toBe("shoe_database");
    expect(ctx.sport).toBe("running");
  });

  it("registers shoe database events in the typed taxonomy", () => {
    expect(ANALYTICS_EVENTS).toContain("shoe_database_view");
    expect(ANALYTICS_EVENTS).toContain("shoe_database_filter");
    expect(ANALYTICS_EVENTS).toContain("shoe_database_data_download");
  });

  it("emits shoe_database events through track()", () => {
    trackShoeDatabaseEvent("shoe_database_result_click", {
      product_slug: "asics-novablast-6",
      brand: "asics",
      result_position: 3,
    });
    const row = (window.dataLayer || []).find(
      (r) => Array.isArray(r) && r[0] === "event" && r[1] === "shoe_database_result_click",
    ) as unknown[] | undefined;
    expect(row).toBeTruthy();
    const params = row?.[2] as Record<string, unknown>;
    expect(params.product_slug).toBe("asics-novablast-6");
    expect(params.brand).toBe("asics");
    expect(params.result_position).toBe(3);
    expect(params.page_type).toBe("shoe_database");
  });

  it("diffs filters without sending search text", () => {
    const prev = baseFilters();
    const next = baseFilters({ brand: ["asics"], q: "secret email@x.com query" });
    const diff = diffDatabaseFilters(prev, next);
    expect(diff?.filter_type).toBe("brand");
    expect(diff?.filter_value).toBe("asics");

    const qDiff = diffDatabaseFilters(
      baseFilters({ brand: ["asics"] }),
      baseFilters({ brand: ["asics"], q: "nov" }),
    );
    expect(qDiff?.filter_type).toBe("q");
    expect(qDiff?.has_query).toBe(true);
    expect(qDiff?.query_length).toBe(3);
    expect(JSON.stringify(qDiff)).not.toContain("nov");

    trackDatabaseFilterChange(
      baseFilters(),
      baseFilters({ sort: "weight-asc" }),
      40,
    );
    const names = (window.dataLayer || [])
      .filter((r) => Array.isArray(r) && r[0] === "event")
      .map((r) => (r as unknown[])[1]);
    expect(names).toContain("shoe_database_sort");
  });

  it("sanitizer keeps shoe database params and drops emails", () => {
    const clean = sanitizeAnalyticsParams({
      filter_type: "brand",
      filter_value: "nike",
      sort_type: "price-asc",
      result_position: 1,
      insight_type: "lightest-daily",
      share_channel: "copy_link",
      email: "a@b.com",
      page_type: "shoe_database",
    });
    expect(clean.filter_type).toBe("brand");
    expect(clean.share_channel).toBe("copy_link");
    expect(clean.email).toBeUndefined();
  });

  it("does not emit when consent denied", () => {
    setAnalyticsCollectionAllowed(false);
    window.dataLayer!.length = 0;
    track("shoe_database_view", { page_type: "shoe_database" });
    const events = (window.dataLayer || []).filter(
      (r) => Array.isArray(r) && r[0] === "event",
    );
    expect(events).toHaveLength(0);
  });
});
