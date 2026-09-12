/**
 * Canonical semantic image resolver.
 *
 * Priority for editorial content:
 * 1. dedicated approved article image (if semantically compatible)
 * 2. relevant entity/product imagery
 * 3. sport/category-specific approved editorial image
 * 4. genuinely relevant neutral fallback
 *
 * NEVER: cross-sport filler (padel racket as generic how-to-choose,
 * NYC skyline as a running-watch hero).
 */

import { getProductById } from "@/repositories";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { firstAuthenticProductImage } from "@/lib/guides/guide-product-hero";
import type {
  SemanticImageInput,
  SemanticImageResult,
  EditorialTopic,
} from "./types";
import {
  categoryFallbackForTopic,
  classifyImageSubject,
  defaultAltFor,
  inferEditorialTopic,
  isSemanticallyCompatible,
} from "./subjects";
import { TOPIC_EDITORIAL_POOL } from "./editorial";

function pickCompatible(
  src: string | undefined,
  topic: EditorialTopic,
  placement: SemanticImageInput["placement"],
): string | undefined {
  if (!src) return undefined;
  return isSemanticallyCompatible(src, topic, placement) ? src : undefined;
}

export function resolveSemanticImage(
  input: SemanticImageInput,
): SemanticImageResult {
  const topic = inferEditorialTopic({
    slug: input.slug,
    title: input.title,
    categoryId: input.categoryId,
  });
  const placement = input.placement;
  const alt = input.dedicatedAlt || defaultAltFor(topic, input.title);

  const dedicated = pickCompatible(input.dedicatedSrc, topic, placement);
  if (dedicated) {
    return {
      src: dedicated,
      alt,
      topic,
      reason: "dedicated approved article image",
    };
  }

  // Dedicated files whose pixels are not in the known-subject registry are
  // still the article's approved image — never replace them with a
  // cross-sport filler. Known-wrong subjects (padel on a watch) were
  // already rejected above.
  if (input.dedicatedSrc) {
    const subject = classifyImageSubject(input.dedicatedSrc);
    if (subject === "unknown") {
      return {
        src: input.dedicatedSrc,
        alt,
        topic,
        reason: "dedicated article image (subject unverified)",
      };
    }
  }

  const fromRelated = firstAuthenticProductImage(
    input.relatedProductIds,
    input.categoryId,
  );
  if (
    fromRelated &&
    isSemanticallyCompatible(fromRelated.src, topic, placement)
  ) {
    return {
      src: fromRelated.src,
      alt: fromRelated.alt || alt,
      topic,
      reason: "related product photography",
    };
  }

  const pool = TOPIC_EDITORIAL_POOL[topic] ?? [];
  for (const src of pool) {
    if (isSemanticallyCompatible(src, topic, placement)) {
      return {
        src,
        alt,
        topic,
        reason: "sport/category editorial pool",
      };
    }
  }

  // Last-resort: a catalog product in the same category (never a random sport).
  if (input.relatedProductIds?.length) {
    for (const id of input.relatedProductIds) {
      const product = getProductById(id);
      if (!product) continue;
      if (input.categoryId && product.categoryId !== input.categoryId) continue;
      const media = getPrimaryProductMedia(product);
      if (media?.src && isSemanticallyCompatible(media.src, topic, placement)) {
        return {
          src: media.src,
          alt: media.alt || product.fullName,
          topic,
          reason: "category product photography",
        };
      }
    }
  }

  const fallback = categoryFallbackForTopic(topic);
  if (isSemanticallyCompatible(fallback, topic, placement)) {
    return {
      src: fallback,
      alt,
      topic,
      reason: "topic editorial fallback",
    };
  }

  return {
    src: categoryFallbackForTopic(topic),
    alt,
    topic,
    reason: "neutral category fallback",
  };
}
