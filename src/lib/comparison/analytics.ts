/**
 * Compare Builder analytics stubs — no third-party vendor wired yet.
 * Call trackCompareEvent() from UI; replace sink later.
 */

export type CompareAnalyticsEvent =
  | "compare_started"
  | "compare_product_added"
  | "compare_product_removed"
  | "compare_product_replaced"
  | "compare_shared"
  | "compare_editorial_opened"
  | "compare_offer_clicked"
  | "compare_cleared"
  | "compare_category_changed";

export interface CompareAnalyticsProps {
  categoryId?: string;
  productCount?: number;
  productIds?: string[];
  source?: string;
  [key: string]: string | number | string[] | undefined;
}

type CompareAnalyticsSink = (
  event: CompareAnalyticsEvent,
  props: CompareAnalyticsProps,
) => void;

let sink: CompareAnalyticsSink = () => {
  // no-op until analytics vendor is configured
};

export function setCompareAnalyticsSink(next: CompareAnalyticsSink): void {
  sink = next;
}

export function trackCompareEvent(
  event: CompareAnalyticsEvent,
  props: CompareAnalyticsProps = {},
): void {
  try {
    sink(event, props);
  } catch {
    // never break UX for analytics
  }
}
