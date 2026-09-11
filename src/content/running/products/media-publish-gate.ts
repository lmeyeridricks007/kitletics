import { CATALOG_PRODUCT_MEDIA } from "@/content/catalog-product-media";
import { RUNNING_PRODUCT_MEDIA } from "@/content/running/product-media";
import type { Product } from "@/domain/products/types";

/** True when a licensed hero is registered (file may still be pending on disk). */
export function hasRegisteredProductHero(productId: string): boolean {
  return Boolean(
    CATALOG_PRODUCT_MEDIA[productId] || RUNNING_PRODUCT_MEDIA[productId],
  );
}

/**
 * Keep products in `pendingIds` as draft until a catalog/running hero is
 * registered. Once media is registered, preserve the product’s authored status
 * (typically published via publishedMeta()).
 *
 * After heroes promote SKUs to published, run the review publish path so
 * section images stay in sync:
 *
 *   npm run reviews:publish-path
 *   # or for specific slugs:
 *   npm run reviews:section-images -- --slugs=<review-slug>,...
 */
export function applyMediaPublishGate(
  products: Product[],
  pendingIds: ReadonlySet<string>,
): Product[] {
  return products.map((p) => {
    if (!pendingIds.has(p.id)) return p;
    if (hasRegisteredProductHero(p.id)) return p;
    return { ...p, status: "draft" as const };
  });
}
