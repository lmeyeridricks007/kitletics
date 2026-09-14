/**
 * Finder analytics stubs — mirror compare pattern; no vendor wired.
 */

export type FinderAnalyticsEvent =
  | "finder_started"
  | "finder_step_viewed"
  | "finder_question_answered"
  | "finder_back"
  | "finder_completed"
  | "finder_result_viewed"
  | "finder_result_clicked"
  | "finder_result_product_opened"
  | "finder_result_review_opened"
  | "finder_result_compared"
  | "finder_product_clicked"
  | "finder_offer_clicked"
  | "finder_answers_edited"
  | "finder_restarted";

export interface FinderAnalyticsProps {
  finderId?: string;
  questionKey?: string;
  resultCount?: number;
  /** Coarse only — never exact body weight */
  [key: string]: string | number | string[] | undefined;
}

type Sink = (event: FinderAnalyticsEvent, props: FinderAnalyticsProps) => void;

let sink: Sink = () => {};

export function setFinderAnalyticsSink(next: Sink): void {
  sink = next;
}

export function trackFinderEvent(
  event: FinderAnalyticsEvent,
  props: FinderAnalyticsProps = {},
): void {
  try {
    sink(event, props);
  } catch {
    // never break UX
  }
}
