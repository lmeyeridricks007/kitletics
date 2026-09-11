import type { Product } from "@/domain/products/types";
import type { MediaAsset } from "@/domain/shared/types";
import { getRunningProductHeroMedia } from "@/content/running/product-media";
import { getProductGalleryMedia } from "@/content/product-gallery-media";
import { isAuthenticProductMedia } from "@/lib/product/media";

/**
 * Intentional Kitletics category placeholders — clearly not product photographs.
 * Used only when no licensed manufacturer / retailer hero exists.
 */
const FALLBACK_BY_CATEGORY: Record<string, string> = {
  "cat-running-shoes": "/images/catalog/fallbacks/shoe.svg",
  "cat-gps-watches": "/images/catalog/fallbacks/watch.svg",
  "cat-hrm": "/images/catalog/fallbacks/electronics.svg",
  "cat-headphones": "/images/catalog/fallbacks/electronics.svg",
  "cat-sunglasses": "/images/catalog/fallbacks/accessory.svg",
  "cat-running-lights": "/images/catalog/fallbacks/accessory.svg",
  "cat-safety": "/images/catalog/fallbacks/accessory.svg",
  "cat-accessories": "/images/catalog/fallbacks/accessory.svg",
  "cat-hydration": "/images/catalog/fallbacks/hydration.svg",
  "cat-packs-vests": "/images/catalog/fallbacks/hydration.svg",
  "cat-running-belts": "/images/catalog/fallbacks/hydration.svg",
  "cat-running-clothing": "/images/catalog/fallbacks/clothing.svg",
  "cat-running-socks": "/images/catalog/fallbacks/clothing.svg",
  "cat-recovery-gear": "/images/catalog/fallbacks/accessory.svg",
  "cat-nutrition": "/images/catalog/fallbacks/accessory.svg",
  "cat-training-shoes": "/images/catalog/fallbacks/shoe.svg",
  "cat-padel-shoes": "/images/catalog/fallbacks/shoe.svg",
  "cat-tennis-shoes": "/images/catalog/fallbacks/shoe.svg",
  "cat-adjustable-dumbbells": "/images/catalog/fallbacks/accessory.svg",
  "cat-power-racks": "/images/catalog/fallbacks/accessory.svg",
  "cat-weight-benches": "/images/catalog/fallbacks/accessory.svg",
  "cat-barbells": "/images/catalog/fallbacks/accessory.svg",
  "cat-weight-plates": "/images/catalog/fallbacks/accessory.svg",
  "cat-kettlebells": "/images/catalog/fallbacks/accessory.svg",
  "cat-rowing-machines": "/images/catalog/fallbacks/accessory.svg",
  "cat-air-bikes": "/images/catalog/fallbacks/accessory.svg",
  "cat-treadmills": "/images/catalog/fallbacks/accessory.svg",
  "cat-ski-ergs": "/images/catalog/fallbacks/accessory.svg",
  "cat-pull-up-bars": "/images/catalog/fallbacks/accessory.svg",
  "cat-parallettes": "/images/catalog/fallbacks/accessory.svg",
  "cat-gymnastic-rings": "/images/catalog/fallbacks/accessory.svg",
  "cat-weighted-vests": "/images/catalog/fallbacks/accessory.svg",
  "cat-functional-fitness": "/images/catalog/fallbacks/accessory.svg",
  "cat-gym-flooring": "/images/catalog/fallbacks/accessory.svg",
  "cat-gym-storage": "/images/catalog/fallbacks/accessory.svg",
  "cat-lifting-accessories": "/images/catalog/fallbacks/accessory.svg",
};

export function categoryFallbackSrc(categoryId: string): string {
  return FALLBACK_BY_CATEGORY[categoryId] ?? "/images/catalog/fallbacks/accessory.svg";
}

/** Hero media for catalog products — prefers licensed sources, else category fallback. */
export function categoryFallbackImage(
  categoryId: string,
  productId: string,
  alt: string,
): MediaAsset[] {
  const sourced = getRunningProductHeroMedia(productId, alt);
  if (sourced) return sourced;

  return [
    {
      id: `media-fallback-${productId}`,
      src: categoryFallbackSrc(categoryId),
      alt,
      width: 800,
      height: 800,
      type: "image",
      source: "Kitletics category fallback",
      usageType: "hero",
      licence: "kitletics-owned",
      attribution: "Kitletics — product image unavailable (not a product photograph)",
    },
  ];
}

/**
 * Resolve primary hero (registry) + gallery extras without dropping authentic
 * secondary shots or replacing a good primary identity.
 */
export function resolveRunningProductImages(product: Product): Product {
  const heroFromRegistry = getRunningProductHeroMedia(
    product.id,
    product.fullName,
  );
  const gallery = getProductGalleryMedia(product.id, product.fullName);

  const existingPrimary = product.images[0];
  const primary =
    (heroFromRegistry?.[0] && isAuthenticProductMedia(heroFromRegistry[0])
      ? heroFromRegistry[0]
      : undefined) ??
    (isAuthenticProductMedia(existingPrimary) ? existingPrimary : undefined);

  if (!primary && gallery.length === 0) return product;

  const out: MediaAsset[] = [];
  const seen = new Set<string>();

  if (primary) {
    out.push(primary);
    seen.add(primary.src);
  }

  for (const img of gallery) {
    if (seen.has(img.src)) continue;
    if (!isAuthenticProductMedia(img)) continue;
    out.push(img);
    seen.add(img.src);
  }

  // Keep any other authentic seed images that aren't placeholders / hero dupes.
  for (const img of product.images ?? []) {
    if (seen.has(img.src)) continue;
    if (!isAuthenticProductMedia(img)) continue;
    if (img.usageType === "hero") continue;
    out.push(img);
    seen.add(img.src);
  }

  // No change if we only have the same single primary already on the product.
  if (
    out.length === 1 &&
    product.images.length === 1 &&
    product.images[0]?.src === out[0]?.src
  ) {
    return product;
  }

  return { ...product, images: out };
}

export function resolveRunningCatalogImages(products: Product[]): Product[] {
  return products.map(resolveRunningProductImages);
}
