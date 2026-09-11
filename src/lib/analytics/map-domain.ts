/**
 * Map existing domain analytics sinks → typed GA4 events.
 */

import { track } from "./events";
import { mapOfferPlacement } from "./placements";
import { buildPageContext } from "./page-context";
import type { CommercialAnalyticsEvent, CommercialAnalyticsProps } from "@/domain/commerce/analytics";
import type { CompareAnalyticsEvent, CompareAnalyticsProps } from "@/lib/comparison/analytics";
import type { FinderAnalyticsEvent, FinderAnalyticsProps } from "@/domain/finders/analytics";
import { isBrowser } from "./config";

function currentPageContext() {
  if (!isBrowser()) return {};
  return buildPageContext(window.location.pathname, window.location.search);
}

export function handleCommercialAnalytics(
  event: CommercialAnalyticsEvent,
  props: CommercialAnalyticsProps,
): void {
  const page = currentPageContext();
  // offer_click is recorded on the server /go route (no gtag there).
  // Browser retailer_click is emitted by AnalyticsProvider /go capture.
  if (event === "offer_impression") {
    track("offer_view", {
      ...page,
      product_id: props.productId,
      retailer: props.retailerId,
      region: props.region,
      placement: mapOfferPlacement(props.placement),
      offer_id: props.offerId,
    });
  }
}

export function handleCompareAnalytics(
  event: CompareAnalyticsEvent,
  props: CompareAnalyticsProps,
): void {
  const page = currentPageContext();
  const base = {
    ...page,
    category_id: props.categoryId,
    product_count: props.productCount,
    product_ids: props.productIds?.slice(0, 8).join(","),
    source: props.source,
  };

  if (event === "compare_product_added") {
    track("compare_add", base);
    return;
  }
  if (event === "compare_product_removed") {
    track("compare_remove", base);
    return;
  }
  if (event === "compare_shared") {
    track("compare_complete", base);
    return;
  }
  // compare_offer_clicked → retailer_click via central /go click capture only
}

export function handleFinderAnalytics(
  event: FinderAnalyticsEvent,
  props: FinderAnalyticsProps,
): void {
  const page = currentPageContext();
  const base = {
    ...page,
    finder_id: props.finderId,
    question_key: props.questionKey,
    result_count: props.resultCount,
  };

  if (event === "finder_started") {
    track("finder_start", base);
    return;
  }
  if (event === "finder_question_answered") {
    track("finder_answer", base);
    return;
  }
  if (event === "finder_completed") {
    track("finder_complete", base);
    return;
  }
  if (
    event === "finder_result_clicked" ||
    event === "finder_result_product_opened"
  ) {
    track("finder_product_click", base);
    return;
  }
  // finder_offer_clicked → retailer_click via central /go click capture only
}
