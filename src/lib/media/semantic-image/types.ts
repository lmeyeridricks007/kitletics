/**
 * Canonical semantic image types.
 *
 * AUTHENTIC IMAGE ≠ CORRECT IMAGE. A licensed padel photograph is still
 * wrong on a running-watch guide. Classification never upgrades UNKNOWN to
 * CORRECT just to pass a gate.
 */

export type PageType =
  | "home"
  | "guide"
  | "best"
  | "product"
  | "brand"
  | "discipline"
  | "sport"
  | "search"
  | "alternatives"
  | "comparison"
  | "finder"
  | "category"
  | "review";

export type ImagePlacement =
  | "hero"
  | "card"
  | "methodology"
  | "related"
  | "primary";

/** What the page/card is actually about. */
export type EditorialTopic =
  | "running_shoes"
  | "training_shoes"
  | "gps_watches"
  | "hrm"
  | "headphones"
  | "headlamps"
  | "hydration"
  | "belts"
  | "packs"
  | "clothing"
  | "socks"
  | "safety"
  | "sunglasses"
  | "fuel"
  | "recovery"
  | "padel_rackets"
  | "tennis_rackets"
  | "fitness"
  | "running_generic"
  | "mixed_home"
  | "unknown";

/** What the file actually depicts (known pixels or path family). */
export type ImageSubject =
  | "padel_racket"
  | "tennis_racket"
  | "running_shoes"
  | "training_shoes"
  | "home_gym"
  | "city_skyline"
  | "running_atmosphere"
  | "gps_watch"
  | "hrm"
  | "headphones"
  | "headlamp"
  | "hydration"
  | "pack"
  | "belt"
  | "clothing"
  | "socks"
  | "sunglasses"
  | "fuel"
  | "recovery"
  | "mixed_gear"
  | "placeholder"
  | "unknown";

export type SemanticClass =
  | "CORRECT"
  | "LIKELY_CORRECT"
  | "GENERIC_BUT_RELEVANT"
  | "WRONG_SPORT"
  | "WRONG_CONTENT_TYPE"
  | "WRONG_PRODUCT"
  | "WRONG_BRAND"
  | "DUPLICATE_PLACEHOLDER"
  | "UNKNOWN";

export interface SemanticImageInput {
  pageType: PageType;
  placement: ImagePlacement;
  slug?: string;
  title?: string;
  categoryId?: string;
  sportId?: string;
  relatedProductIds?: string[];
  /** Dedicated article / hub image when one exists. */
  dedicatedSrc?: string;
  dedicatedAlt?: string;
  /** When known, the product this surface is about. */
  productSlug?: string;
  brandSlug?: string;
  /** Force topic (brand hub cards must match the hub, not the attached guide). */
  topicHint?: EditorialTopic;
}

export interface SemanticImageResult {
  src: string;
  alt: string;
  topic: EditorialTopic;
  reason: string;
}

export interface SemanticClassification {
  class: SemanticClass;
  topic: EditorialTopic;
  subject: ImageSubject;
  reason: string;
}
