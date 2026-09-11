import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import type { BuyingGuidePageData } from "@/lib/best/get-best-guide-page-data";
import { getBuyingGuidePageData } from "@/lib/best/get-best-guide-page-data";
import {
  getLongFormGuideConfig,
  type LongFormGuideConfig,
} from "@/lib/guides/long-form-config";
import {
  getProductById,
  getBrandById,
  getLowestOfferPrice,
  getCategoryById,
  getSportById,
} from "@/repositories";
import { getReviewByProduct } from "@/repositories/editorial";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { getScoreBand } from "@/lib/product/score";
import { promotableReviewSlug } from "@/domain/launch";
import type { MediaAsset } from "@/domain/shared/types";
import type { Product, Brand } from "@/domain/products/types";

export interface GuideProductCardData {
  product: Product;
  brand?: Brand;
  media?: MediaAsset;
  score?: number;
  scoreLabel?: string;
  roleLabel?: string;
  price?: { price: number; currency: string };
  reviewSlug?: string;
}

export interface LongFormGuidePageData extends BuyingGuidePageData {
  config?: LongFormGuideConfig;
  readingMinutes: number;
  lastUpdatedLabel?: string;
  nextReviewLabel?: string;
  productExamples: GuideProductCardData[];
  factorProductMedia: Record<string, GuideProductCardData | undefined>;
  anatomyMedia?: MediaAsset;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateReadingMinutes(
  guide: BuyingGuidePageData["guide"],
  config?: LongFormGuideConfig,
): number {
  let words = wordCount(guide.title);
  if (guide.subtitle) words += wordCount(guide.subtitle);
  if (guide.shortDescription) words += wordCount(guide.shortDescription);
  if (guide.quickAnswer) words += wordCount(guide.quickAnswer);
  for (const s of guide.sections) {
    words += wordCount(s.heading) + wordCount(s.body);
  }
  if (config?.deck) words += wordCount(config.deck);
  if (config?.explainer) {
    for (const b of config.explainer.quickAnswerBullets) {
      words += wordCount(b);
    }
    for (const block of config.explainer.blocks) {
      words += wordCount(block.title);
      if ("paragraphs" in block && Array.isArray(block.paragraphs)) {
        for (const p of block.paragraphs) words += wordCount(p);
      }
      if ("body" in block && typeof block.body === "string") {
        words += wordCount(block.body);
      }
      if ("cards" in block && Array.isArray(block.cards)) {
        for (const c of block.cards as { title?: string; description?: string; whatItIs?: string; howItChanges?: string; whatYouNotice?: string; body?: string }[]) {
          words += wordCount(c.title ?? "");
          words += wordCount(c.description ?? "");
          words += wordCount(c.whatItIs ?? "");
          words += wordCount(c.howItChanges ?? "");
          words += wordCount(c.whatYouNotice ?? "");
          words += wordCount(c.body ?? "");
        }
      }
      if ("examples" in block && Array.isArray(block.examples)) {
        for (const ex of block.examples as { whyIllustrates?: string; tradeoff?: string }[]) {
          words += wordCount(ex.whyIllustrates ?? "");
          words += wordCount(ex.tradeoff ?? "");
        }
      }
      if ("mistakes" in block && Array.isArray(block.mistakes)) {
        for (const m of block.mistakes as { title?: string; body?: string }[]) {
          words += wordCount(m.title ?? "");
          words += wordCount(m.body ?? "");
        }
      }
      if ("steps" in block && Array.isArray(block.steps)) {
        for (const s of block.steps as { title?: string; body?: string }[]) {
          words += wordCount(s.title ?? "");
          words += wordCount(s.body ?? "");
        }
      }
    }
  }
  return Math.max(5, Math.round(words / 200));
}

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function nextReviewLabel(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  d.setMonth(d.getMonth() + 3);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function toProductCard(
  productId: string,
  region: RegionCode,
  options?: PublishResolverOptions,
  roleLabel?: string,
): GuideProductCardData | undefined {
  const product = getProductById(productId, options);
  if (!product || product.status !== "published") return undefined;
  const score =
    typeof product.recommendationScore === "number"
      ? product.recommendationScore
      : undefined;
  const price = getLowestOfferPrice(product.id, region, options);
  const review = getReviewByProduct(product.id, options);
  return {
    product,
    brand: getBrandById(product.brandId),
    media: getPrimaryProductMedia(product),
    score,
    scoreLabel: typeof score === "number" ? getScoreBand(score).label : undefined,
    roleLabel,
    price: price
      ? { price: price.price, currency: price.currency }
      : undefined,
    reviewSlug: promotableReviewSlug(
      review?.status === "published" ? review : undefined,
      options,
    ),
  };
}

export function getLongFormGuidePageData(
  slug: string,
  options?: PublishResolverOptions & { region?: RegionCode },
): LongFormGuidePageData | undefined {
  const region = options?.region ?? DEFAULT_REGION;
  const base = getBuyingGuidePageData(slug, options);
  if (!base) return undefined;

  const config = getLongFormGuideConfig(slug);
  const sport = base.sport ?? getSportById(base.guide.sportId);
  const category = base.category
    ?? (base.guide.categoryId
      ? getCategoryById(base.guide.categoryId)
      : undefined);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Guides", href: "/guides" },
    ...(category && sport
      ? [
          {
            label: category.name,
            href: `/${sport.slug}/${category.pathSegment}`,
          },
        ]
      : []),
    { label: base.guide.title },
  ];

  const productExamples = (config?.productExampleRoles ?? [])
    .map((role) =>
      toProductCard(role.productId, region, options, role.roleLabel),
    )
    .filter((x): x is GuideProductCardData => Boolean(x));

  // Fallback to related products if no config roles
  const examples =
    productExamples.length > 0
      ? productExamples
      : base.relatedProducts
          .map(({ product }) =>
            toProductCard(product.id, region, options),
          )
          .filter((x): x is GuideProductCardData => Boolean(x));

  const factorProductMedia: Record<string, GuideProductCardData | undefined> =
    {};
  if (config) {
    for (const factor of config.factors) {
      for (const level of factor.levels ?? []) {
        if (level.productId) {
          factorProductMedia[level.productId] = toProductCard(
            level.productId,
            region,
            options,
          );
        }
      }
    }
  }

  let anatomyMedia: MediaAsset | undefined;
  if (config?.anatomy) {
    anatomyMedia = {
      id: "guide-anatomy",
      type: "image",
      src: config.anatomy.imageSrc,
      alt: config.anatomy.imageAlt,
      licence: "manufacturer-marketing",
    };
  }

  return {
    ...base,
    sport,
    category,
    breadcrumbs,
    config,
    readingMinutes: estimateReadingMinutes(base.guide, config),
    lastUpdatedLabel: formatDate(
      base.guide.lastVerifiedAt ?? base.guide.updatedAt,
    ),
    nextReviewLabel: nextReviewLabel(
      base.guide.lastVerifiedAt ?? base.guide.updatedAt,
    ),
    productExamples: examples,
    factorProductMedia,
    anatomyMedia,
  };
}
