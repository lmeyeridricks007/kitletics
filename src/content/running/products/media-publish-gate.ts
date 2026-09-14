import { getCatalogProductHeroMedia } from "@/content/catalog-product-media";
import {
  getRunningProductHeroMedia,
  RUNNING_PRODUCT_MEDIA,
} from "@/content/running/product-media";
import type { Product } from "@/domain/products/types";
import { isAuthenticProductMedia } from "@/lib/product/media-authentic";
import {
  isPadelCatalogProduct,
  isPadelMediaVerified,
} from "@/lib/product/media-identity";

/** True when a licensed hero is registered (file may still be pending on disk). */
export function hasRegisteredProductHero(productId: string): boolean {
  return Boolean(
    RUNNING_PRODUCT_MEDIA[productId] ||
      getCatalogProductHeroMedia(productId, productId),
  );
}

function registeredMediaFor(product: Product) {
  const fromRegistry = getRunningProductHeroMedia(product.id, product.fullName);
  if (fromRegistry?.[0] && isAuthenticProductMedia(fromRegistry[0])) {
    return fromRegistry[0];
  }
  const primary = product.images[0];
  if (isAuthenticProductMedia(primary)) return primary;
  return undefined;
}

/**
 * Exact-product hero required for padel; registration alone is not enough.
 * Non-padel keeps the historical "any registered authentic hero" rule.
 */
export function hasVerifiedProductHero(product: Product): boolean {
  const media = registeredMediaFor(product);
  if (!media) return false;
  if (isPadelCatalogProduct(product)) {
    return isPadelMediaVerified(product, media);
  }
  return true;
}

/**
 * Keep products in `pendingIds` as draft until a catalog/running hero is
 * registered. Padel products (any pending padel ID) additionally require
 * exact-product MEDIA_VERIFIED identity — never another SKU's packshot.
 *
 * Once media is verified, preserve the product’s authored status
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
    // Padel: every SKU needs exact-product MEDIA_VERIFIED — registration alone
    // is not enough, and non-pending seed/wave shoes are included.
    if (isPadelCatalogProduct(p)) {
      if (hasVerifiedProductHero(p)) return p;
      return { ...p, status: "draft" as const };
    }
    if (!pendingIds.has(p.id)) return p;
    if (hasVerifiedProductHero(p)) return p;
    return { ...p, status: "draft" as const };
  });
}
