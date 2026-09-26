/**
 * Semantic role of a rendered image.
 * Unique-image credit follows asset identity, not <img> count.
 * A crop of the hero is DERIVED_HERO_CROP and counts as the hero.
 */

export type MediaSemanticRole =
  | "PRODUCT_HERO"
  | "PRODUCT_ANGLE"
  | "PRODUCT_DETAIL"
  | "PRODUCT_TECHNOLOGY"
  | "PRODUCT_IN_USE"
  | "PRODUCT_PACKAGING"
  | "PRODUCT_VARIANT"
  | "EDITORIAL_EXPLANATION"
  | "SPORT_CONTEXT"
  | "DERIVED_HERO_CROP";

/** Generated section variants live here. They are not a second photograph. */
export function isDerivedHeroCrop(src: string | undefined | null): boolean {
  if (!src) return false;
  return /\/products\/[^/]+\/sections\//.test(src);
}
