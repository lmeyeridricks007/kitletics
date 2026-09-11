import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { ProductCategory } from "@/domain/sports/types";
import {
  getCategoryById,
  getCategoryBySlug,
  getSportById,
  getSports,
} from "@/repositories/sports";
import { getProductsByCategory } from "@/repositories/products";

/**
 * Category URL policy
 * --------------------
 * Canonical: sport-scoped `/{sport}/{pathSegment}` when a live sport owns the category
 *   (e.g. `/running/shoes`, `/padel/rackets`, `/fitness/power-racks`).
 * Fallback: `/gear/{slug}` only when no live sport-scoped shell exists.
 * HYROX-tagged categories that lack another live sport resolve to `/fitness/hyrox`.
 *
 * `/gear/[slug]` should 308 to the sport-scoped canonical when one exists so we
 * do not maintain duplicate indexable catalog shells.
 */

export function getCategoryHref(
  category: ProductCategory | string,
  options?: PublishResolverOptions & { query?: Record<string, string> },
): string {
  const cat =
    typeof category === "string"
      ? getCategoryBySlug(category, options)
      : category;
  if (!cat) {
    return typeof category === "string" ? `/gear/${category}` : "/gear";
  }

  const sports = getSports(options);
  for (const sportId of cat.sportIds) {
    const sport = sports.find((s) => s.id === sportId);
    if (sport?.contentStatus === "live" && sport.slug !== "hyrox") {
      const base = `/${sport.slug}/${cat.pathSegment}`;
      return appendQuery(base, options?.query);
    }
  }

  if (cat.sportIds.includes("sport-hyrox")) {
    return appendQuery("/fitness/hyrox", options?.query);
  }

  return appendQuery(`/gear/${cat.slug}`, options?.query);
}

export function getCategoryProductCount(
  categoryId: string,
  options?: PublishResolverOptions,
): number {
  return getProductsByCategory(categoryId, options).length;
}

export function isCategoryEmpty(
  category: ProductCategory | string,
  options?: PublishResolverOptions,
): boolean {
  const cat =
    typeof category === "string"
      ? getCategoryBySlug(category, options) ?? getCategoryById(category, options)
      : category;
  if (!cat) return true;
  return getCategoryProductCount(cat.id, options) === 0;
}

/** Known empty / future / launch-hold taxonomy shells — soft-gate in nav and listings.
 * Soft-gated Running apparel/fuel/eyewear removed after editorial 44 decision content;
 * Running accessories ungated after Fix 58 anti-chafe decision content.
 */
export const SOFT_GATED_CATEGORY_SLUGS = new Set([
  "padel-accessories",
  "padel-clothing",
]);

export function isSoftGatedCategory(
  category: ProductCategory | string,
  options?: PublishResolverOptions,
): boolean {
  const slug =
    typeof category === "string"
      ? (getCategoryBySlug(category, options)?.slug ??
        getCategoryById(category, options)?.slug ??
        category)
      : category.slug;
  if (SOFT_GATED_CATEGORY_SLUGS.has(slug)) return true;
  return isCategoryEmpty(category, options);
}

function appendQuery(
  href: string,
  query?: Record<string, string>,
): string {
  if (!query || Object.keys(query).length === 0) return href;
  const params = new URLSearchParams(query);
  return `${href}?${params.toString()}`;
}

export function sportIsSearchable(
  sportId: string,
  options?: PublishResolverOptions,
): boolean {
  const sport = getSportById(sportId, options);
  if (!sport) return false;
  return sport.contentStatus === "live" || sport.contentStatus === "partial";
}
