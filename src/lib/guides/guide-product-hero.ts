/**
 * Resolve hero imagery from related catalog products.
 */

import { getProductById } from "@/repositories";
import { getPrimaryProductMedia } from "@/lib/product/media";

export function firstAuthenticProductImage(
  productIds: string[] | undefined,
  categoryId?: string,
): { src: string; alt: string } | undefined {
  if (!productIds?.length) return undefined;
  for (const id of productIds.slice(0, 8)) {
    const product = getProductById(id);
    if (!product) continue;
    if (categoryId && product.categoryId !== categoryId) continue;
    const media = getPrimaryProductMedia(product);
    if (media?.src) {
      return { src: media.src, alt: media.alt || product.fullName };
    }
  }
  return undefined;
}

/** Resolve a hero from related product IDs — used when building long-form plans. */
export function resolveHeroFromProductIds(
  productIds: string[],
  fallbackSrc: string,
  fallbackAlt: string,
): { heroImageSrc: string; heroImageAlt: string } {
  const fromProducts = firstAuthenticProductImage(productIds);
  if (fromProducts) {
    return {
      heroImageSrc: fromProducts.src,
      heroImageAlt: fromProducts.alt,
    };
  }
  return { heroImageSrc: fallbackSrc, heroImageAlt: fallbackAlt };
}
