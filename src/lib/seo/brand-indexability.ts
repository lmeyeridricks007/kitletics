import { canPublishBrandHub } from "@/lib/brand-hub/config";
import { getProductsByBrand, getProductFamilies } from "@/repositories/products";
import type { Brand } from "@/domain/products/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { BRAND_HUB_UNIQUENESS_HOLD_SLUGS } from "@/content/brand-hub-uniqueness-holds";

/**
 * Brand hub indexation gate — same bar as the live Brand Hub page.
 * Sitemap / static params must not emit brands that 404 at request time.
 */
export function isBrandHubIndexable(
  brand: Pick<Brand, "id" | "slug">,
  options?: PublishResolverOptions,
): boolean {
  if (BRAND_HUB_UNIQUENESS_HOLD_SLUGS.has(brand.slug)) return false;
  const products = getProductsByBrand(brand.id, options);
  if (products.length === 0) return false;
  const categoryCount = new Set(products.map((p) => p.categoryId)).size;
  const families = getProductFamilies().filter((f) => f.brandId === brand.id);
  const strengthSignalCount = products.filter(
    (p) => (p.strengths?.length ?? 0) > 0,
  ).length;
  return canPublishBrandHub({
    productCount: products.length,
    categoryCount,
    familyCount: families.length,
    strengthSignalCount,
  });
}

/** Depth-qualified hubs that may still render when uniqueness-held (noindex). */
export function canRenderBrandHub(
  brand: Pick<Brand, "id" | "slug">,
  options?: PublishResolverOptions,
): boolean {
  const products = getProductsByBrand(brand.id, options);
  if (products.length === 0) return false;
  const categoryCount = new Set(products.map((p) => p.categoryId)).size;
  const families = getProductFamilies().filter((f) => f.brandId === brand.id);
  const strengthSignalCount = products.filter(
    (p) => (p.strengths?.length ?? 0) > 0,
  ).length;
  return canPublishBrandHub({
    productCount: products.length,
    categoryCount,
    familyCount: families.length,
    strengthSignalCount,
  });
}
