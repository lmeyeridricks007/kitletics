/**
 * Controlled GA4 page / event taxonomy for Kitletics.
 */

export const ANALYTICS_PAGE_TYPES = [
  "home",
  "sport_hub",
  "discipline_hub",
  "category",
  "shoe_database",
  "racket_database",
  "product",
  "review",
  "best_guide",
  "guide",
  "comparison",
  "alternatives",
  "brand",
  "finder",
  "tool",
  "search",
  "other",
] as const;

export type AnalyticsPageType = (typeof ANALYTICS_PAGE_TYPES)[number];

export const ANALYTICS_PLACEMENTS = [
  "product_primary_offer",
  "product_offer_list",
  "review_offer",
  "best_guide_product",
  "comparison_offer",
  "finder_result",
  "alternatives_offer",
  "category_card",
  "search",
  "setup",
  "rotation_planner",
  "other",
] as const;

export type AnalyticsPlacement = (typeof ANALYTICS_PLACEMENTS)[number];

/** Kitletics decision-journey + commerce events (typed API). */
export const ANALYTICS_EVENTS = [
  "view_product",
  "view_review",
  "view_best_guide",
  "view_guide",
  "view_comparison",
  "finder_start",
  "finder_answer",
  "finder_complete",
  "finder_result_view",
  "finder_product_click",
  "finder_offer_click",
  "compare_start",
  "compare_add",
  "compare_remove",
  "compare_complete",
  "search",
  "filter_use",
  /** Alias of filter_use for padel/category discovery reporting */
  "category_filter",
  "offer_view",
  "retailer_click",
  "email_signup",
  "price_alert_signup",
  "internal_recommendation_click",
  // Running Shoe Database
  "shoe_database_view",
  "shoe_database_filter",
  "shoe_database_sort",
  "shoe_database_result_click",
  "shoe_database_compare_add",
  "shoe_database_review_click",
  "shoe_database_alternatives_click",
  "shoe_database_insight_view",
  "shoe_database_insight_click",
  "shoe_database_share",
  "shoe_database_citation_copy",
  "shoe_database_data_download",
  // Padel Racket Database
  "racket_database_view",
  "racket_database_filter",
  /** Alias of racket_database_filter for discovery reporting */
  "database_filter",
  "racket_database_sort",
  "racket_database_result_click",
  "racket_database_compare_add",
  "racket_database_review_click",
  "racket_database_data_download",
  "racket_database_citation_copy",
  // GA4 recommended ecommerce (affiliate-safe subset)
  "view_item",
  "view_item_list",
  "select_item",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type PageContextParams = {
  page_type?: AnalyticsPageType;
  sport?: string;
  discipline?: string;
  category?: string;
  brand?: string;
  product_slug?: string;
  content_slug?: string;
  page_path?: string;
  page_location?: string;
  page_title?: string;
};

export type RetailerClickParams = PageContextParams & {
  product_id?: string;
  product_slug?: string;
  brand?: string;
  retailer?: string;
  region?: string;
  placement?: AnalyticsPlacement;
  offer_id?: string;
  is_affiliate?: boolean;
};

export type FinderEventParams = PageContextParams & {
  finder_id?: string;
  question_key?: string;
  result_count?: number;
  product_slug?: string;
  product_id?: string;
};

export type CompareEventParams = PageContextParams & {
  category_id?: string;
  product_count?: number;
  product_ids?: string;
  source?: string;
};

export type SearchEventParams = PageContextParams & {
  /** Coarse query length only — never full free-form PII-prone text by default */
  query_length?: number;
  has_query?: boolean;
  result_count?: number;
};

export type FilterEventParams = PageContextParams & {
  filter_key?: string;
  filter_count?: number;
};

export type ShoeDatabaseAnalyticsParams = PageContextParams & {
  filter_type?: string;
  filter_value?: string;
  sort_type?: string;
  result_position?: number;
  product_slug?: string;
  brand?: string;
  insight_type?: string;
  share_channel?: string;
  result_count?: number;
  has_query?: boolean;
  query_length?: number;
};

export type RacketDatabaseAnalyticsParams = ShoeDatabaseAnalyticsParams;

export type AnalyticsEventParams =
  | PageContextParams
  | RetailerClickParams
  | FinderEventParams
  | CompareEventParams
  | SearchEventParams
  | FilterEventParams
  | ShoeDatabaseAnalyticsParams
  | RacketDatabaseAnalyticsParams
  | Record<string, string | number | boolean | undefined>;

export type ConsentStatus = "unknown" | "granted" | "denied";

export type ConsentState = {
  analytics_storage: ConsentStatus;
  ad_storage: ConsentStatus;
  ad_user_data: ConsentStatus;
  ad_personalization: ConsentStatus;
};
