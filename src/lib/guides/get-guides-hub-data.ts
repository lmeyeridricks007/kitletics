/**
 * Guides Hub page data — curated discovery, not a chronological blog index.
 */

import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { BuyingGuide, BestGuide, Review } from "@/domain/editorial/types";
import type { Sport } from "@/domain/sports/types";
import type { Product, Brand } from "@/domain/products/types";
import type { Tool } from "@/domain/tools/types";
import {
  getBuyingGuides,
  getBestGuides,
  getBestGuideById,
  getSportBySlug,
  getSports,
  getTools,
  getReviews,
  getProductById,
  getBrandById,
} from "@/repositories";
import { getLongFormGuideConfig } from "@/lib/guides/long-form-config";
import {
  enrichBuyingGuideWithHubMeta,
  getGuidesHubSportConfig,
  type GuidesHubSportConfig,
} from "@/lib/guides/guide-hub-config";
import {
  GUIDE_TYPE_LABEL,
  getGuideTopicById,
  type GuideTopic,
} from "@/lib/guides/guide-topics";
import {
  assessGuideHubQuality,
  canFeatureGuide,
} from "@/lib/guides/can-feature-guide";
import { formatVerifiedDate } from "@/lib/product/score";
import { resolveGuideImage } from "@/lib/guides/resolve-guide-image";
import {
  getLaunchEligibility,
  shouldPromotePublicly,
} from "@/domain/launch";

export interface GuidesHubCardData {
  guide: BuyingGuide;
  typeLabel: string;
  summary: string;
  imageSrc: string;
  imageAlt: string;
  readingMinutes: number;
  updatedLabel?: string;
  quality: ReturnType<typeof assessGuideHubQuality>;
  href: string;
}

export interface GuidesHubTopicSection {
  topic: GuideTopic;
  featured?: GuidesHubCardData;
  guides: GuidesHubCardData[];
}

export interface GuidesHubReviewCard {
  review: Review;
  product?: Product;
  brand?: Brand;
  href: string;
}

export interface GuidesHubPageData {
  sport?: Sport;
  /** When set, secondary nav stays in Shoes domain (not Running sport hub). */
  domain?: "shoes";
  config?: GuidesHubSportConfig;
  allSportsWithGuides: Sport[];
  guideCount: number;
  buyingCount: number;
  explainerCount: number;
  toolCount: number;
  featuredGuide?: GuidesHubCardData;
  startHereGuides: GuidesHubCardData[];
  topics: GuidesHubTopicSection[];
  buyingGuides: GuidesHubCardData[];
  explainers: GuidesHubCardData[];
  decisionGuides: GuidesHubCardData[];
  relatedBestGuides: BestGuide[];
  reviews: GuidesHubReviewCard[];
  tools: Tool[];
  recentlyUpdated: GuidesHubCardData[];
  breadcrumbs: { label: string; href?: string }[];
  compareHref?: string;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateReadingMinutes(guide: BuyingGuide): number {
  const config = getLongFormGuideConfig(guide.slug);
  let words = wordCount(guide.title);
  if (guide.shortDescription) words += wordCount(guide.shortDescription);
  if (guide.quickAnswer) words += wordCount(guide.quickAnswer);
  for (const s of guide.sections) {
    words += wordCount(s.heading) + wordCount(s.body);
  }
  if (config?.deck) words += wordCount(config.deck);
  if (config?.explainer) {
    for (const b of config.explainer.quickAnswerBullets) words += wordCount(b);
    for (const block of config.explainer.blocks) {
      words += wordCount(block.title);
      if ("paragraphs" in block && Array.isArray(block.paragraphs)) {
        for (const p of block.paragraphs) words += wordCount(p);
      }
    }
  }
  return Math.max(4, Math.round(words / 200));
}

function toCard(guide: BuyingGuide): GuidesHubCardData {
  const image = resolveGuideImage(guide);
  const type = guide.guideType ?? "buying";
  const summary =
    guide.shortDescription?.trim() ||
    guide.quickAnswer?.trim() ||
    guide.sections[0]?.body?.trim() ||
    guide.subtitle?.trim() ||
    "";
  return {
    guide,
    typeLabel: GUIDE_TYPE_LABEL[type] ?? "Guide",
    summary: summary.slice(0, 180),
    imageSrc: image.src,
    imageAlt: image.alt,
    readingMinutes: estimateReadingMinutes(guide),
    updatedLabel: guide.updatedAt
      ? formatVerifiedDate(guide.updatedAt)
      : undefined,
    quality: assessGuideHubQuality(guide),
    href: `/guides/${guide.slug}`,
  };
}

function byPriority(a: BuyingGuide, b: BuyingGuide): number {
  return (a.priority ?? 99) - (b.priority ?? 99);
}

export function getGuidesHubData(
  options?: PublishResolverOptions & {
    sportSlug?: string;
    domain?: "shoes";
  },
): GuidesHubPageData {
  const shoesDomain = options?.domain === "shoes";
  const sportSlug = shoesDomain ? "running" : options?.sportSlug;
  const sport = sportSlug ? getSportBySlug(sportSlug, options) : undefined;
  const baseConfig = getGuidesHubSportConfig(sportSlug);
  const hubConfig: GuidesHubSportConfig | undefined = shoesDomain && baseConfig
    ? {
        ...baseConfig,
        eyebrow: "Shoe guides",
        title: "Understand the shoe. Choose with confidence.",
        deck: "Practical buying guides and explainers for running and training shoes — before you buy.",
        topicOrder: ["topic-running-shoes"],
        primaryCta: {
          label: "Start with how to choose",
          href: "/guides/how-to-choose-running-shoes",
        },
      }
    : baseConfig;

  let guides = getBuyingGuides(options)
    .filter((g) =>
      shouldPromotePublicly(
        getLaunchEligibility({ kind: "buying-guide", entity: g }, options),
      ),
    )
    .map((g) => enrichBuyingGuideWithHubMeta(g, hubConfig?.guideMeta[g.slug]));

  if (sport) {
    guides = guides.filter((g) => g.sportId === sport.id);
  }

  if (shoesDomain) {
    guides = guides.filter(
      (g) =>
        g.topicIds?.includes("topic-running-shoes") ||
        /shoe|cushion|drop|stability|plate|rotation|trainer|race|trail|pronat/i.test(
          `${g.slug} ${g.title}`,
        ),
    );
  }

  const allGuides = getBuyingGuides(options);
  const sportsWithGuides = getSports(options).filter((s) =>
    allGuides.some((g) => g.sportId === s.id),
  );

  const cards = guides.map((g) => toCard(g));
  const cardBySlug = new Map(cards.map((c) => [c.guide.slug, c]));

  // Featured
  let featuredGuide: GuidesHubCardData | undefined;
  const featuredSlug =
    hubConfig?.featuredSlug ??
    guides.find((g) => g.featured)?.slug;
  if (featuredSlug) {
    const fg = cardBySlug.get(featuredSlug);
    if (fg && canFeatureGuide(fg.guide)) featuredGuide = fg;
  }
  if (!featuredGuide) {
    featuredGuide = cards
      .filter((c) => canFeatureGuide(c.guide))
      .sort((a, b) => byPriority(a.guide, b.guide))[0];
  }

  // Start here — curated first, then quality-gated fill (never promote thin)
  const startHereGuides: GuidesHubCardData[] = [];
  const startSlugs =
    hubConfig?.startHereSlugs ??
    guides
      .filter((g) => g.startHere)
      .sort(byPriority)
      .map((g) => g.slug);
  const pushStart = (card: GuidesHubCardData) => {
    if (!canFeatureGuide(card.guide)) return;
    if (startHereGuides.some((c) => c.guide.id === card.guide.id)) return;
    startHereGuides.push(card);
  };
  for (const slug of startSlugs) {
    const card = cardBySlug.get(slug);
    if (card) pushStart(card);
    if (startHereGuides.length >= 4) break;
  }
  if (startHereGuides.length < 4) {
    const fillers = cards
      .filter((c) => canFeatureGuide(c.guide))
      .sort((a, b) => byPriority(a.guide, b.guide));
    for (const card of fillers) {
      pushStart(card);
      if (startHereGuides.length >= 4) break;
    }
  }

  // Topics
  const topicOrder =
    hubConfig?.topicOrder ??
    [...new Set(guides.flatMap((g) => g.topicIds ?? []))];
  const topics: GuidesHubTopicSection[] = [];
  for (const topicId of topicOrder) {
    const topic = getGuideTopicById(topicId);
    if (!topic) continue;
    const topicGuides = cards
      .filter((c) => c.guide.topicIds?.includes(topicId))
      .sort((a, b) => byPriority(a.guide, b.guide));
    if (topicGuides.length === 0) continue;

    // Prefer complete/eligible as topic featured — allow start-here to also feature in topic once
    const pageFeaturedSlug = featuredGuide?.guide.slug;
    const startSlugsSet = new Set(startHereGuides.map((c) => c.guide.slug));

    const topicFeatured =
      topicGuides.find(
        (c) =>
          c.guide.slug !== pageFeaturedSlug &&
          canFeatureGuide(c.guide),
      ) ??
      topicGuides.find((c) => c.guide.slug !== pageFeaturedSlug) ??
      topicGuides[0];

    const rest = topicGuides
      .filter((c) => c.guide.id !== topicFeatured?.guide.id)
      .filter(
        (c) =>
          // Prefer non-start-here / non-page-featured for secondary topic cards
          c.guide.slug !== pageFeaturedSlug &&
          !startSlugsSet.has(c.guide.slug),
      );
    const restFallback = topicGuides.filter(
      (c) => c.guide.id !== topicFeatured?.guide.id,
    );
    const secondary = (rest.length >= 2 ? rest : restFallback).slice(0, 5);

    topics.push({
      topic,
      featured: topicFeatured,
      guides: secondary,
    });
  }

  const buyingGuides = cards
    .filter((c) => c.guide.guideType === "buying")
    .sort((a, b) => byPriority(a.guide, b.guide))
    .slice(0, 6);

  const explainers = cards
    .filter(
      (c) =>
        c.guide.guideType === "explainer" ||
        c.guide.guideType === "technical",
    )
    .sort((a, b) => byPriority(a.guide, b.guide))
    .slice(0, 8);

  const decisionGuides = cards
    .filter(
      (c) =>
        c.guide.guideType === "comparison" ||
        c.guide.guideType === "decision",
    )
    .sort((a, b) => byPriority(a.guide, b.guide))
    .slice(0, 6);

  // Best guides
  const relatedBestGuides: BestGuide[] = [];
  if (hubConfig?.relatedBestGuideIds) {
    for (const id of hubConfig.relatedBestGuideIds) {
      const g = getBestGuideById(id, options);
      if (
        g?.status === "published" &&
        shouldPromotePublicly(
          getLaunchEligibility({ kind: "best-guide", entity: g }, options),
        )
      ) {
        relatedBestGuides.push(g);
      }
    }
  } else if (sport) {
    relatedBestGuides.push(
      ...getBestGuides(options)
        .filter(
          (g) =>
            g.sportId === sport.id &&
            shouldPromotePublicly(
              getLaunchEligibility({ kind: "best-guide", entity: g }, options),
            ),
        )
        .slice(0, 4),
    );
  }

  // Tools
  const tools = (hubConfig?.toolSlugs ?? [])
    .map((slug) => getTools(options).find((t) => t.slug === slug))
    .filter((t): t is Tool => Boolean(t))
    .filter((t) =>
      shouldPromotePublicly(
        getLaunchEligibility({ kind: "tool", entity: t }, options),
      ),
    );
  if (tools.length === 0 && sport) {
    tools.push(
      ...getTools(options)
        .filter(
          (t) =>
            t.sportIds.includes(sport.id) &&
            shouldPromotePublicly(
              getLaunchEligibility({ kind: "tool", entity: t }, options),
            ),
        )
        .slice(0, 4),
    );
  }

  // Reviews — compact, sport-scoped via product
  const reviews: GuidesHubReviewCard[] = [];
  if (sport) {
    const shoeCategories = new Set([
      "cat-running-shoes",
      "cat-training-shoes",
    ]);
    for (const review of getReviews(options)) {
      if (review.status !== "published") continue;
      if (
        !shouldPromotePublicly(
          getLaunchEligibility({ kind: "review", entity: review }, options),
        )
      ) {
        continue;
      }
      const product = getProductById(review.productId, options);
      if (!product || !product.sportIds.includes(sport.id)) continue;
      if (shoesDomain && !shoeCategories.has(product.categoryId)) continue;
      reviews.push({
        review,
        product,
        brand: getBrandById(product.brandId),
        href: `/reviews/${review.slug}`,
      });
      if (reviews.length >= 4) break;
    }
  }

  const recentlyUpdated = [...cards]
    .sort((a, b) =>
      (b.guide.updatedAt ?? "").localeCompare(a.guide.updatedAt ?? ""),
    )
    .slice(0, 5);

  const buyingCount = cards.filter((c) => c.guide.guideType === "buying").length;
  const explainerCount = cards.filter(
    (c) =>
      c.guide.guideType === "explainer" ||
      c.guide.guideType === "technical" ||
      c.guide.guideType === "comparison",
  ).length;

  return {
    sport,
    domain: shoesDomain ? "shoes" : undefined,
    config: hubConfig,
    allSportsWithGuides: shoesDomain ? [] : sportsWithGuides,
    guideCount: cards.length,
    buyingCount,
    explainerCount,
    toolCount: tools.length,
    featuredGuide,
    startHereGuides,
    topics,
    buyingGuides,
    explainers,
    decisionGuides,
    relatedBestGuides,
    reviews,
    tools,
    recentlyUpdated,
    compareHref: hubConfig?.compareHref,
    breadcrumbs: shoesDomain
      ? [
          { label: "Home", href: "/" },
          { label: "Shoes", href: "/running/shoes" },
          { label: "Guides" },
        ]
      : [
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          ...(sport ? [{ label: sport.name }] : []),
        ],
  };
}
