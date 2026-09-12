/**
 * Resolve a topic-appropriate image for buying guides / hub cards.
 * Cards and articles share this resolver so homepage mappings cannot
 * contradict the long-form guide.
 */

import type { BuyingGuide } from "@/domain/editorial/types";
import { getSportById } from "@/repositories";
import { getLongFormGuideConfig } from "@/lib/guides/long-form-config";
import { getGuidesHubSportConfig } from "@/lib/guides/guide-hub-config";
import { resolveSemanticImage } from "@/lib/media/semantic-image";

export function resolveGuideImage(guide: BuyingGuide): {
  src: string;
  alt: string;
} {
  const config = getLongFormGuideConfig(guide.slug);
  const sport = getSportById(guide.sportId);
  const hubMeta = getGuidesHubSportConfig(sport?.slug)?.guideMeta[guide.slug];
  const dedicatedSrc =
    config?.heroImageSrc ?? guide.hubImageSrc ?? hubMeta?.hubImageSrc;
  const dedicatedAlt =
    config?.heroImageAlt ??
    guide.hubImageAlt ??
    hubMeta?.hubImageAlt ??
    guide.title;

  const resolved = resolveSemanticImage({
    pageType: "guide",
    placement: "card",
    slug: guide.slug,
    title: guide.title,
    categoryId: guide.categoryId,
    sportId: guide.sportId,
    relatedProductIds: guide.relatedProductIds,
    dedicatedSrc,
    dedicatedAlt,
  });

  return { src: resolved.src, alt: resolved.alt };
}
