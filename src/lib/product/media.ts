import type { Product } from "@/domain/products/types";
import type { MediaAsset } from "@/domain/shared/types";
import { getRunningProductHeroMedia } from "@/content/running/product-media";
import { isAuthenticProductMedia } from "@/lib/product/media-authentic";
import {
  isPadelCatalogProduct,
  isPadelMediaVerified,
} from "@/lib/product/media-identity";
import { resolveProductImageSource } from "@/lib/media/resolve-media-url";

export { isAuthenticProductMedia } from "@/lib/product/media-authentic";

/**
 * Canonical primary product image for cards, rails, comparisons, search.
 * Prefers licensed running hero media, then authentic product.images[0].
 * Returns undefined when only placeholders exist — callers must show Image unavailable.
 *
 * Padel: never returns another product's hero. Exact-product MEDIA_VERIFIED only.
 */
export function getPrimaryProductMedia(
  product: Product,
): MediaAsset | undefined {
  const fromRegistry = getRunningProductHeroMedia(product.id, product.fullName);
  const registryHit =
    fromRegistry?.[0] && isAuthenticProductMedia(fromRegistry[0])
      ? fromRegistry[0]
      : undefined;
  const primary = product.images[0];
  const primaryHit = isAuthenticProductMedia(primary) ? primary : undefined;
  const candidate = registryHit ?? primaryHit;
  if (!candidate) return undefined;

  if (isPadelCatalogProduct(product)) {
    if (!isPadelMediaVerified(product, candidate)) return undefined;
  }

  const resolved = resolveProductImageSource(candidate.src);
  return resolved && resolved !== candidate.src
    ? { ...candidate, src: resolved }
    : candidate;
}

/**
 * Listing/card feature gate: published + authentic primary media.
 * For strategic prominence (Top Match / Best Guide / hubs), use
 * `assessFeatureReadiness` / `canFeatureProductStrategically` in
 * `@/domain/catalog/featureability` — Review readiness is required there.
 */
export function canFeatureProduct(product: Product): boolean {
  if (product.status !== "published") return false;
  if (product.lifecycleStatus === "discontinued") {
    return false;
  }
  return Boolean(getPrimaryProductMedia(product));
}
