import {
  getGuidesHubData,
  type GuidesHubCardData,
  type GuidesHubPageData,
} from "@/lib/guides/get-guides-hub-data";
import { resolveBestGuideImage } from "@/lib/best/resolve-best-guide-image";
import { getPrimaryProductMedia } from "@/lib/product/media";
import type {
  CompactGuidesHubCard,
  CompactGuidesHubPageData,
  GuidesIndexShellData,
} from "@/lib/guides/guides-index-shared";

export type {
  CompactBestGuideCard,
  CompactGuideRef,
  CompactGuideReviewCard,
  CompactGuidesHubCard,
  CompactGuidesHubPageData,
  GuidesIndexShellData,
} from "@/lib/guides/guides-index-shared";

function compactCard(card: GuidesHubCardData): CompactGuidesHubCard {
  return {
    guide: {
      id: card.guide.id,
      slug: card.guide.slug,
      title: card.guide.title,
    },
    typeLabel: card.typeLabel,
    summary: card.summary,
    imageSrc: card.imageSrc,
    imageAlt: card.imageAlt,
    readingMinutes: card.readingMinutes,
    updatedLabel: card.updatedLabel,
    href: card.href,
  };
}

function compactHub(data: GuidesHubPageData): CompactGuidesHubPageData {
  const config = data.config
    ? (({ guideMeta: _guideMeta, ...rest }) => rest)(data.config)
    : undefined;
  return {
    sport: data.sport
      ? { id: data.sport.id, slug: data.sport.slug, name: data.sport.name }
      : undefined,
    domain: data.domain,
    config,
    allSportsWithGuides: data.allSportsWithGuides.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
    })),
    guideCount: data.guideCount,
    buyingCount: data.buyingCount,
    explainerCount: data.explainerCount,
    toolCount: data.toolCount,
    featuredGuide: data.featuredGuide
      ? compactCard(data.featuredGuide)
      : undefined,
    startHereGuides: data.startHereGuides.map(compactCard),
    topics: data.topics.map((t) => ({
      topic: t.topic,
      featured: t.featured ? compactCard(t.featured) : undefined,
      guides: t.guides.map(compactCard),
    })),
    buyingGuides: data.buyingGuides.map(compactCard),
    explainers: data.explainers.map(compactCard),
    decisionGuides: data.decisionGuides.map(compactCard),
    relatedBestGuides: data.relatedBestGuides.map((g) => {
      const image = resolveBestGuideImage(g);
      return {
        id: g.id,
        slug: g.slug,
        title: g.title,
        description: (g.shortDescription ?? g.intro).slice(0, 180),
        recCount: g.recommendations.length,
        image,
      };
    }),
    reviews: data.reviews.map(({ review, brand, href, product }) => {
      const media = product ? getPrimaryProductMedia(product) : undefined;
      return {
        id: review.id,
        slug: review.slug,
        title: review.title,
        summary: review.summary.slice(0, 180),
        reviewType: review.reviewType,
        score: product?.recommendationScore ?? review.score,
        href,
        productName: product?.name ?? review.title,
        brandName: brand?.name,
        image: media ? { src: media.src, alt: media.alt } : undefined,
      };
    }),
    tools: data.tools.map((t) => ({ id: t.id, slug: t.slug, name: t.name })),
    recentlyUpdated: data.recentlyUpdated.map(compactCard),
    breadcrumbs: data.breadcrumbs,
    compareHref: data.compareHref,
  };
}

export function getGuidesIndexShellData(): GuidesIndexShellData {
  const all = compactHub(getGuidesHubData({}));
  const shoes = compactHub(getGuidesHubData({ domain: "shoes" }));
  const bySport: Record<string, CompactGuidesHubPageData> = {};
  for (const sport of all.allSportsWithGuides) {
    bySport[sport.slug] = compactHub(getGuidesHubData({ sportSlug: sport.slug }));
  }
  return { all, shoes, bySport };
}
