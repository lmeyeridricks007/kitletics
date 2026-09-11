import type { Product } from "@/domain/products/types";
import type { MediaAsset } from "@/domain/shared/types";
import { getRunningProductHeroMedia } from "@/content/running/product-media";
import { isLogoOrWordmarkMedia } from "@/lib/product/logo-media";

/** True when media is a real product photograph (not Kitletics illustration / SVG fallback / brand logo). */
export function isAuthenticProductMedia(
  media: MediaAsset | undefined | null,
): boolean {
  if (!media?.src) return false;
  if (media.src.includes("/fallbacks/")) return false;
  if (media.src.endsWith(".svg")) return false;
  if (media.licence === "kitletics-owned") return false;
  if (isLogoOrWordmarkMedia(media)) return false;
  if (
    media.attribution?.toLowerCase().includes("not a product photograph") ||
    media.attribution?.toLowerCase().includes("illustration")
  ) {
    return false;
  }
  return (
    media.src.includes("-hero.") ||
    media.licence === "manufacturer-marketing" ||
    media.licence === "retailer-authorized" ||
    Boolean(media.sourceUrl)
  );
}

/**
 * Canonical primary product image for cards, rails, comparisons, search.
 * Prefers licensed running hero media, then authentic product.images[0].
 * Returns undefined when only placeholders exist — callers must show Image unavailable.
 */
export function getPrimaryProductMedia(
  product: Product,
): MediaAsset | undefined {
  const fromRegistry = getRunningProductHeroMedia(product.id, product.fullName);
  if (fromRegistry?.[0] && isAuthenticProductMedia(fromRegistry[0])) {
    return fromRegistry[0];
  }

  const primary = product.images[0];
  if (isAuthenticProductMedia(primary)) return primary;

  return undefined;
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
