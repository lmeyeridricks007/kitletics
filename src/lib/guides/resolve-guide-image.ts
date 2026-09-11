/**
 * Resolve a topic-appropriate image for buying guides / hub cards.
 * Prefer authentic product photography over atmosphere or cross-category fillers.
 */

import type { BuyingGuide } from "@/domain/editorial/types";
import { categoryFallbackSrc } from "@/content/running/media";
import { getLongFormGuideConfig } from "@/lib/guides/long-form-config";
import { firstAuthenticProductImage } from "@/lib/guides/guide-product-hero";

const SHOE_CATEGORY_IDS = new Set([
  "cat-running-shoes",
  "cat-training-shoes",
  "cat-padel-shoes",
  "cat-tennis-shoes",
]);

/** Atmosphere / lifestyle shots that should not stand in for product-topic guides. */
function isAtmosphereSrc(src: string): boolean {
  return (
    src.includes("/brands/heroes/") ||
    src.includes("/images/home/guide-how-to-choose") ||
    src.includes("/images/home/hero-gear")
  );
}

/** Running-shoe packshots used as fillers on non-shoe guides. */
function isMismatchedShoeFiller(src: string, categoryId?: string): boolean {
  if (!categoryId || SHOE_CATEGORY_IDS.has(categoryId)) return false;
  return (
    src.includes("/images/running/products/") ||
    src.includes("/images/home/guide-running-shoes") ||
    src.includes("/images/training/products/") ||
    src.includes("/images/running/guides/concepts/") ||
    src.includes("/images/running/guides/daily-vs-long")
  );
}

export function resolveGuideImage(guide: BuyingGuide): {
  src: string;
  alt: string;
} {
  const config = getLongFormGuideConfig(guide.slug);
  const candidates: Array<{ src: string; alt: string } | undefined> = [
    guide.hubImageSrc
      ? {
          src: guide.hubImageSrc,
          alt: guide.hubImageAlt ?? guide.title,
        }
      : undefined,
    config?.heroImageSrc
      ? {
          src: config.heroImageSrc,
          alt: config.heroImageAlt || guide.title,
        }
      : undefined,
  ];

  for (const candidate of candidates) {
    if (!candidate?.src) continue;
    if (isAtmosphereSrc(candidate.src)) continue;
    if (isMismatchedShoeFiller(candidate.src, guide.categoryId)) continue;
    return candidate;
  }

  const fromProducts = firstAuthenticProductImage(guide.relatedProductIds);
  if (fromProducts) {
    return { src: fromProducts.src, alt: fromProducts.alt };
  }

  // Re-accept atmosphere only when nothing product-specific exists
  for (const candidate of candidates) {
    if (candidate?.src) return candidate;
  }

  if (guide.categoryId) {
    return {
      src: categoryFallbackSrc(guide.categoryId),
      alt: guide.title,
    };
  }

  return {
    src: "/images/catalog/fallbacks/accessory.svg",
    alt: guide.title,
  };
}
