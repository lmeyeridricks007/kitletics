"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { setCommercialAnalyticsSink } from "@/domain/commerce/analytics";
import { setCompareAnalyticsSink } from "@/lib/comparison/analytics";
import { setFinderAnalyticsSink } from "@/domain/finders/analytics";
import {
  buildPageContext,
  handleCommercialAnalytics,
  handleCompareAnalytics,
  handleFinderAnalytics,
  isAnalyticsCollectionAllowed,
  mapOfferPlacement,
  readConsentCookieFromDocument,
  setAnalyticsCollectionAllowed,
  track,
  trackPageView,
  viewEventForPageType,
  type AnalyticsRuntimeConfig,
  type ConsentState,
  consentStateFromStorage,
  defaultConsentState,
} from "@/lib/analytics";
import {
  applyConsentDefault,
  configureGa,
  ensureDataLayer,
  updateConsent,
} from "@/lib/analytics/gtag";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { parsePlacement } from "@/domain/commerce/analytics";

type Props = {
  config: AnalyticsRuntimeConfig;
  children?: ReactNode;
};

function parseGoHref(href: string): {
  offerId: string;
  placement: string | null;
  pageType: string | null;
} | null {
  try {
    const url = new URL(href, "https://kitletics.local");
    if (!url.pathname.startsWith("/go/")) return null;
    const offerId = url.pathname.replace(/^\/go\//, "").split("/")[0];
    if (!offerId) return null;
    return {
      offerId,
      placement: url.searchParams.get("placement"),
      pageType: url.searchParams.get("pageType"),
    };
  } catch {
    return null;
  }
}

/**
 * Boots GA4 (when enabled), Consent Mode, domain sink wiring, and /go click capture.
 */
export function AnalyticsProvider({ config, children }: Props) {
  const enabled = config.enabled && Boolean(config.measurementId);

  const applyConsent = useCallback(
    (state: ConsentState) => {
      const allowed = state.analytics_storage === "granted";
      const wasAllowed = isAnalyticsCollectionAllowed();
      setAnalyticsCollectionAllowed(allowed);
      if (!enabled || !config.measurementId) return;
      ensureDataLayer();
      updateConsent(state);
      // First grant after deny/unknown — send the current page once
      if (allowed && !wasAllowed) {
        const ctx = buildPageContext(
          window.location.pathname,
          window.location.search,
        );
        ctx.page_title = document.title || undefined;
        ctx.page_location = window.location.href;
        trackPageView(ctx);
        const viewEvent = viewEventForPageType(ctx.page_type ?? "other");
        if (viewEvent) track(viewEvent, ctx);
      }
    },
    [config.measurementId, enabled],
  );

  useEffect(() => {
    if (!enabled || !config.measurementId) {
      setAnalyticsCollectionAllowed(false);
      return;
    }

    const stored = readConsentCookieFromDocument();
    const initial = stored
      ? consentStateFromStorage(stored)
      : defaultConsentState("denied");

    ensureDataLayer();
    applyConsentDefault(initial);
    configureGa(config.measurementId, { sendPageView: false });
    setAnalyticsCollectionAllowed(initial.analytics_storage === "granted");
  }, [config.measurementId, enabled]);

  useEffect(() => {
    if (!enabled) return;
    setCommercialAnalyticsSink(handleCommercialAnalytics);
    setCompareAnalyticsSink(handleCompareAnalytics);
    setFinderAnalyticsSink(handleFinderAnalytics);
    return () => {
      setCommercialAnalyticsSink(() => {});
      setCompareAnalyticsSink(() => {});
      setFinderAnalyticsSink(() => {});
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    function onClick(event: MouseEvent) {
      const target = event.target as Element | null;
      if (!target?.closest) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;

      const go = parseGoHref(href);
      if (go) {
        const page = buildPageContext(
          window.location.pathname,
          window.location.search,
        );
        track(
          "retailer_click",
          {
            ...page,
            page_type: (go.pageType as typeof page.page_type) || page.page_type,
            offer_id: go.offerId,
            placement: mapOfferPlacement(parsePlacement(go.placement)),
          },
          { beacon: true },
        );
        return;
      }

      const pageType = buildPageContext(window.location.pathname).page_type;
      if (pageType === "finder" && href.startsWith("/products/")) {
        const slug = href.split("/").filter(Boolean)[1];
        track("finder_product_click", {
          ...buildPageContext(window.location.pathname, window.location.search),
          product_slug: slug,
        });
        track("select_item", {
          item_id: slug,
          item_list_name: "finder_results",
        });
      }
    }

    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, [enabled]);

  return (
    <>
      {children}
      {enabled ? (
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
      ) : null}
      <ConsentBanner active={enabled} onConsentChange={applyConsent} />
    </>
  );
}
