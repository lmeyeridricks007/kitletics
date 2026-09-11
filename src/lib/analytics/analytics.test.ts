/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveAnalyticsConfig } from "@/lib/analytics/config";
import {
  consentStateFromStorage,
  defaultConsentState,
  parseConsentCookie,
  toGtagConsentPayload,
} from "@/lib/analytics/consent";
import {
  isAnalyticsCollectionAllowed,
  setAnalyticsCollectionAllowed,
  track,
  trackPageView,
} from "@/lib/analytics/events";
import {
  __resetGtagBridgeForTests,
  configureGa,
  getConfiguredMeasurementId,
  isGaConfigured,
} from "@/lib/analytics/gtag";
import {
  buildPageContext,
  classifyAnalyticsPageType,
  viewEventForPageType,
} from "@/lib/analytics/page-context";
import { mapOfferPlacement } from "@/lib/analytics/placements";
import {
  isProhibitedAnalyticsValue,
  sanitizeAnalyticsParams,
} from "@/lib/analytics/sanitize";
import { handleCompareAnalytics, handleFinderAnalytics } from "@/lib/analytics/map-domain";

describe("resolveAnalyticsConfig", () => {
  it("disables analytics without Measurement ID", () => {
    const cfg = resolveAnalyticsConfig({
      VERCEL_ENV: "production",
    });
    expect(cfg.enabled).toBe(false);
    expect(cfg.measurementId).toBeNull();
  });

  it("disables analytics outside production even with ID", () => {
    const cfg = resolveAnalyticsConfig({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-82Z9YHTT93",
      VERCEL_ENV: "preview",
    });
    expect(cfg.enabled).toBe(false);
    expect(cfg.measurementId).toBe("G-82Z9YHTT93");
  });

  it("enables analytics in production with valid ID", () => {
    const cfg = resolveAnalyticsConfig({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-82Z9YHTT93",
      VERCEL_ENV: "production",
    });
    expect(cfg.enabled).toBe(true);
  });

  it("rejects non G- measurement IDs", () => {
    const cfg = resolveAnalyticsConfig({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "UA-123",
      VERCEL_ENV: "production",
    });
    expect(cfg.enabled).toBe(false);
  });

  it("allows NEXT_PUBLIC_GA_FORCE for local verification", () => {
    const cfg = resolveAnalyticsConfig({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-82Z9YHTT93",
      NEXT_PUBLIC_GA_FORCE: "1",
    });
    expect(cfg.enabled).toBe(true);
  });

  it("enables Ahrefs only in production with a key", () => {
    expect(
      resolveAnalyticsConfig({
        NEXT_PUBLIC_AHREFS_ANALYTICS_KEY: "rEbRuhuknkWGdlpy/pnmBA",
        VERCEL_ENV: "preview",
      }).ahrefsEnabled,
    ).toBe(false);
    expect(
      resolveAnalyticsConfig({
        NEXT_PUBLIC_AHREFS_ANALYTICS_KEY: "rEbRuhuknkWGdlpy/pnmBA",
        VERCEL_ENV: "production",
      }).ahrefsEnabled,
    ).toBe(true);
  });
});

describe("consent", () => {
  it("defaults analytics and ads to denied", () => {
    const state = defaultConsentState();
    expect(state.analytics_storage).toBe("denied");
    expect(state.ad_storage).toBe("denied");
    expect(toGtagConsentPayload(state).analytics_storage).toBe("denied");
  });

  it("parses consent cookie values", () => {
    expect(parseConsentCookie("granted")).toBe("granted");
    expect(parseConsentCookie("denied")).toBe("denied");
    expect(parseConsentCookie("maybe")).toBeNull();
  });

  it("maps stored consent to Consent Mode state", () => {
    expect(consentStateFromStorage("granted").analytics_storage).toBe("granted");
    expect(consentStateFromStorage(null).analytics_storage).toBe("denied");
  });
});

describe("sanitizeAnalyticsParams", () => {
  it("drops undefined and secret-like keys", () => {
    const clean = sanitizeAnalyticsParams({
      product_slug: "nike-vomero-18",
      email: "a@b.com",
      api_token: "secret",
      missing: undefined,
    });
    expect(clean).toEqual({ product_slug: "nike-vomero-18" });
  });

  it("strips affiliate URLs and emails from values", () => {
    expect(
      isProhibitedAnalyticsValue("https://www.amazon.com/dp/x?tag=kitletics-20"),
    ).toBe(true);
    expect(isProhibitedAnalyticsValue("user@example.com")).toBe(true);
    const clean = sanitizeAnalyticsParams({
      page_path: "/products/x",
      brand: "https://amzn.to/abc123",
    });
    expect(clean.brand).toBeUndefined();
    expect(clean.page_path).toBe("/products/x");
  });
});

describe("page context", () => {
  it("classifies key routes", () => {
    expect(classifyAnalyticsPageType("/")).toBe("home");
    expect(classifyAnalyticsPageType("/products/nike-vomero-18")).toBe("product");
    expect(classifyAnalyticsPageType("/reviews/nike-vomero-18")).toBe("review");
    expect(classifyAnalyticsPageType("/best/daily-trainers")).toBe("best_guide");
    expect(classifyAnalyticsPageType("/guides/shoe-rotation")).toBe("guide");
    expect(classifyAnalyticsPageType("/compare/vomero-vs-pegasus")).toBe(
      "comparison",
    );
    expect(classifyAnalyticsPageType("/running")).toBe("sport_hub");
  });

  it("builds slug context without arbitrary text", () => {
    const ctx = buildPageContext("/products/nike-vomero-18");
    expect(ctx.page_type).toBe("product");
    expect(ctx.product_slug).toBe("nike-vomero-18");
    expect(viewEventForPageType("product")).toBe("view_product");
  });
});

describe("placements", () => {
  it("maps commerce placements to GA taxonomy", () => {
    expect(mapOfferPlacement("product-hero")).toBe("product_primary_offer");
    expect(mapOfferPlacement("best-guide")).toBe("best_guide_product");
    expect(mapOfferPlacement("unknown")).toBe("other");
  });
});

describe("gtag bridge + track", () => {
  beforeEach(() => {
    __resetGtagBridgeForTests();
    setAnalyticsCollectionAllowed(false);
    window.dataLayer = [];
  });

  afterEach(() => {
    __resetGtagBridgeForTests();
    setAnalyticsCollectionAllowed(false);
  });

  it("does not execute meaningful collection during SSR-like unconfigured state", () => {
    expect(isGaConfigured()).toBe(false);
    track("view_product", { product_slug: "x" });
    expect(window.dataLayer?.length ?? 0).toBe(0);
  });

  it("does not send events when consent is denied", () => {
    configureGa("G-82Z9YHTT93", { sendPageView: false });
    setAnalyticsCollectionAllowed(false);
    track("retailer_click", { offer_id: "o1" });
    const events = (window.dataLayer || []).filter(
      (row) => Array.isArray(row) && row[0] === "event",
    );
    expect(events).toHaveLength(0);
  });

  it("sends events when configured and consent granted", () => {
    configureGa("G-82Z9YHTT93", { sendPageView: false });
    setAnalyticsCollectionAllowed(true);
    expect(isAnalyticsCollectionAllowed()).toBe(true);
    expect(getConfiguredMeasurementId()).toBe("G-82Z9YHTT93");
    track("retailer_click", {
      offer_id: "offer_1",
      placement: "product_offer_list",
      brand: "https://www.amazon.com/dp/x?tag=secret-20",
    });
    const events = (window.dataLayer || []).filter(
      (row) => Array.isArray(row) && row[0] === "event" && row[1] === "retailer_click",
    ) as unknown[][];
    expect(events.length).toBe(1);
    const params = events[0]![2] as Record<string, unknown>;
    expect(params.offer_id).toBe("offer_1");
    expect(params.brand).toBeUndefined();
  });

  it("page_view can be sent once per call without automatic duplicates from config", () => {
    configureGa("G-82Z9YHTT93", { sendPageView: false });
    setAnalyticsCollectionAllowed(true);
    trackPageView({ page_type: "home", page_path: "/" });
    trackPageView({ page_type: "home", page_path: "/" });
    const pageViews = (window.dataLayer || []).filter(
      (row) => Array.isArray(row) && row[0] === "event" && row[1] === "page_view",
    );
    // Tracker dedupes in the React layer; API itself is explicit per call
    expect(pageViews.length).toBe(2);
    const configCalls = (window.dataLayer || []).filter(
      (row) => Array.isArray(row) && row[0] === "config",
    ) as unknown[][];
    expect(configCalls[0]![2]).toMatchObject({ send_page_view: false });
  });
});

describe("domain mapping payloads", () => {
  beforeEach(() => {
    __resetGtagBridgeForTests();
    configureGa("G-82Z9YHTT93", { sendPageView: false });
    setAnalyticsCollectionAllowed(true);
    window.dataLayer = window.dataLayer || [];
    // clear prior configure noise for easier asserts
    window.dataLayer.length = 0;
    configureGa("G-82Z9YHTT93", { sendPageView: false });
  });

  afterEach(() => {
    __resetGtagBridgeForTests();
    setAnalyticsCollectionAllowed(false);
  });

  it("maps finder events", () => {
    handleFinderAnalytics("finder_started", { finderId: "daily-trainer" });
    handleFinderAnalytics("finder_question_answered", {
      finderId: "daily-trainer",
      questionKey: "surface",
    });
    handleFinderAnalytics("finder_completed", { finderId: "daily-trainer" });
    const names = (window.dataLayer || [])
      .filter((row) => Array.isArray(row) && row[0] === "event")
      .map((row) => (row as unknown[])[1]);
    expect(names).toContain("finder_start");
    expect(names).toContain("finder_answer");
    expect(names).toContain("finder_complete");
  });

  it("maps compare events", () => {
    handleCompareAnalytics("compare_product_added", {
      categoryId: "road-shoes",
      productCount: 2,
      productIds: ["a", "b"],
    });
    handleCompareAnalytics("compare_product_removed", {
      categoryId: "road-shoes",
      productCount: 1,
    });
    handleCompareAnalytics("compare_shared", { source: "builder" });
    const names = (window.dataLayer || [])
      .filter((row) => Array.isArray(row) && row[0] === "event")
      .map((row) => (row as unknown[])[1]);
    expect(names).toContain("compare_add");
    expect(names).toContain("compare_remove");
    expect(names).toContain("compare_complete");
  });
});

describe("PageViewTracker dedupe helper behaviour", () => {
  it("uses path+search as identity key shape", () => {
    const a = buildPageContext("/search", "?q=shoes");
    const b = buildPageContext("/search", "?q=shoes");
    expect(a.page_path).toBe(b.page_path);
    expect(a.page_type).toBe("search");
  });
});

// silence unused vi in case of future mocks
void vi;
