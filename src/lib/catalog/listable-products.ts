import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { Product } from "@/domain/products/types";
import {
  getCategoriesBySport,
  getProductsByCategory,
  getSportById,
  getSportBySlug,
} from "@/repositories";
import { canFeatureProduct } from "@/lib/product/media";
import {
  getLaunchEligibility,
  isLaunchListable,
} from "@/domain/launch";
import {
  getVerticalSportPolicy,
  type VerticalLaunchMode,
} from "@/content/launch/vertical-strategy";

/**
 * Catalog visibility must match launch gates — raw seed counts open empty
 * tennis/badminton shells while every product is HIDDEN_404.
 */
export function isListableCatalogProduct(
  product: Product,
  options?: PublishResolverOptions,
): boolean {
  return (
    canFeatureProduct(product) &&
    isLaunchListable(
      getLaunchEligibility({ kind: "product", entity: product }, options),
    )
  );
}

export function getListableProductsForCategory(
  categoryId: string,
  sportId: string,
  options?: PublishResolverOptions,
): Product[] {
  return getProductsByCategory(categoryId, options).filter(
    (p) =>
      p.sportIds.includes(sportId) && isListableCatalogProduct(p, options),
  );
}

export function countListableCategoryProducts(
  categoryId: string,
  sportId: string,
  options?: PublishResolverOptions,
): number {
  return getListableProductsForCategory(categoryId, sportId, options).length;
}

export function countListableSportProducts(
  sportId: string,
  options?: PublishResolverOptions,
): number {
  let total = 0;
  for (const category of getCategoriesBySport(sportId, options)) {
    total += countListableCategoryProducts(category.id, sportId, options);
  }
  return total;
}

export function sportHasPublicCatalog(
  sportIdOrSlug: string,
  options?: PublishResolverOptions,
): boolean {
  const sport =
    getSportById(sportIdOrSlug, options) ??
    getSportBySlug(sportIdOrSlug, options);
  if (!sport || sport.contentStatus !== "live") return false;
  return countListableSportProducts(sport.id, options) > 0;
}

export function getSportVerticalMode(
  sportIdOrSlug: string,
): VerticalLaunchMode {
  return getVerticalSportPolicy(sportIdOrSlug).mode;
}

/** Public hubs for sports whose deep catalog is still held. */
export function isHeldSportHub(sportIdOrSlug: string): boolean {
  const mode = getSportVerticalMode(sportIdOrSlug);
  return mode === "disabled";
}
