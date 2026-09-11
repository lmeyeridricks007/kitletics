import type { Brand } from "@/domain/products/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { getProductsByBrand, getProductFamilies } from "@/repositories/products";
import { canPublishBrandHub } from "@/lib/brand-hub/config";
import { BRAND_HUB_UNIQUENESS_HOLD_SLUGS } from "@/content/brand-hub-uniqueness-holds";

export type BrandHubHoldClass =
  | "READY"
  | "UNIQUENESS_HOLD"
  | "HOLD_INSUFFICIENT_DEPTH"
  | "HOLD_NO_PRODUCTS"
  | "HOLD_DEPTH_GATE";

/**
 * Explicit Brand hub classification (Fix 56).
 * READY = depth-qualified and not uniqueness-held.
 * Thin catalogs stay held — never padded into a hub.
 */
export function classifyBrandHubHold(
  brand: Pick<Brand, "id" | "slug">,
  options?: PublishResolverOptions,
): BrandHubHoldClass {
  const products = getProductsByBrand(brand.id, options);
  if (products.length === 0) return "HOLD_NO_PRODUCTS";
  if (products.length <= 2) return "HOLD_INSUFFICIENT_DEPTH";

  const categoryCount = new Set(products.map((p) => p.categoryId)).size;
  const familyCount = getProductFamilies().filter((f) => f.brandId === brand.id)
    .length;
  const strengthSignalCount = products.filter(
    (p) => (p.strengths?.length ?? 0) > 0,
  ).length;
  const depthOk = canPublishBrandHub({
    productCount: products.length,
    categoryCount,
    familyCount,
    strengthSignalCount,
  });
  if (!depthOk) return "HOLD_DEPTH_GATE";
  if (BRAND_HUB_UNIQUENESS_HOLD_SLUGS.has(brand.slug)) {
    return "UNIQUENESS_HOLD";
  }
  return "READY";
}
