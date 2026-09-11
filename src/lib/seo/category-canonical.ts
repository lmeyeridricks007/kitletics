import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { ProductCategory, Sport } from "@/domain/sports/types";
import { getCategoryHref } from "@/lib/navigation/category-href";
import { getSportBySlug } from "@/repositories/sports";

/**
 * Canonical sport-scoped category path for sitemap + redirects.
 * Returns null when this sport/segment shell is a non-canonical duplicate
 * (e.g. `/hyrox/shoes` when canonical is `/running/shoes`).
 */
export function canonicalCategoryPathForSport(
  sport: Sport,
  category: ProductCategory,
  options?: PublishResolverOptions,
): string | null {
  const canonical = getCategoryHref(category, options);
  const requested = `/${sport.slug}/${category.pathSegment}`;
  if (canonical !== requested) return null;
  return requested;
}

/**
 * When a parent sport discipline slug matches a live child sport
 * (e.g. `/racket/padel` → `/padel`), prefer the child hub.
 *
 * Exception: HYROX — production canonical is `/fitness/hyrox`
 * (`next.config` 301s `/hyrox` → `/fitness/hyrox`).
 */
export function resolveChildSportRedirect(
  parentSport: Sport,
  segment: string,
  options?: PublishResolverOptions,
): string | undefined {
  if (parentSport.slug === "fitness" && segment === "hyrox") {
    return undefined;
  }

  const child = getSportBySlug(segment, options);
  if (!child) return undefined;
  if (child.contentStatus !== "live") return undefined;
  if (child.parentSportId !== parentSport.id) return undefined;
  return `/${child.slug}`;
}
