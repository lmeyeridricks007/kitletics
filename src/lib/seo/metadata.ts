import type { Metadata } from "next";
import { siteConfig } from "@/content/config";
import type { SeoFields } from "@/domain/shared/types";
import type { Product } from "@/domain/products/types";
import type { Sport, ProductCategory } from "@/domain/sports/types";
import type {
  BestGuide,
  BuyingGuide,
  Comparison,
  Review,
} from "@/domain/editorial/types";
import type { Tool } from "@/domain/tools/types";
import type { Brand } from "@/domain/products/types";

const DEFAULT_OG_IMAGE = "/og/default.png";

type BaseMetaOptions = {
  ogType?: "website" | "article";
  noindex?: boolean;
};

function baseMeta(
  title: string,
  description: string,
  seo?: SeoFields,
  path?: string,
  options?: BaseMetaOptions,
): Metadata {
  const resolvedTitle = seo?.seoTitle ?? title;
  const resolvedDescription = seo?.seoDescription ?? description;
  const ogTitle = seo?.ogTitle ?? resolvedTitle;
  const ogDescription = seo?.ogDescription ?? resolvedDescription;
  const canonical = seo?.canonical ?? (path ? `${siteConfig.url}${path}` : undefined);
  const ogImage = seo?.ogImage ?? DEFAULT_OG_IMAGE;
  const noindex = options?.noindex || seo?.noindex;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogImage }],
      siteName: siteConfig.name,
      type: options?.ogType ?? "website",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

export function productMetadata(product: Product): Metadata {
  const title =
    product.seoTitle ??
    `${product.fullName}: Specs, Performance & Best Uses`;
  const description =
    product.seoDescription ??
    product.verdict ??
    product.shortDescription;
  return baseMeta(title, description, product, `/products/${product.slug}`);
}

export function categoryMetadata(category: ProductCategory): Metadata {
  return baseMeta(
    category.name,
    category.description,
    category,
    `/gear/${category.slug}`,
  );
}

export function sportMetadata(sport: Sport): Metadata {
  const title =
    sport.seoTitle ??
    `${sport.name} Gear, Equipment & Buying Advice`;
  const description =
    sport.seoDescription ??
    `Find ${sport.name.toLowerCase()} gear matched to how you train — shoes, equipment, comparisons and finders.`;
  const comingSoon = sport.contentStatus !== "live";
  return baseMeta(title, description, sport, `/${sport.slug}`, {
    noindex: comingSoon,
  });
}

export function brandMetadata(brand: Brand): Metadata {
  return baseMeta(brand.name, brand.description, brand, `/brands/${brand.slug}`);
}

export function reviewMetadata(review: Review, productName: string): Metadata {
  const researchSafe =
    review.reviewType === "expert-research"
      ? `${productName} Review: Performance, Fit & Verdict`
      : `${productName} Review: Performance, Fit & Verdict`;
  const title = review.seoTitle ?? researchSafe;
  const description =
    review.seoDescription ??
    (review.reviewType === "expert-research"
      ? `Expert research review of the ${productName}. ${review.summary}`
      : review.summary);
  return baseMeta(title, description, review, `/reviews/${review.slug}`, {
    ogType: "article",
  });
}

export function bestGuideMetadata(guide: BestGuide): Metadata {
  const description =
    guide.seoDescription ??
    guide.shortDescription ??
    guide.intro;
  const title =
    guide.seoTitle ?? `${guide.title}: Top Picks by Use Case`;
  return baseMeta(title, description, guide, `/best/${guide.slug}`, {
    ogType: "article",
  });
}

export function comparisonMetadata(comparison: Comparison): Metadata {
  const productHint =
    comparison.shortDescription ?? comparison.summary;
  const title =
    comparison.seoTitle ??
    `${comparison.title.replace(/\s+vs\s+/i, " vs ")}: Which Is Better? | Kitletics`;
  const description =
    comparison.seoDescription ??
    productHint ??
    "Compare specifications, use cases and regional pricing to see which product fits your training.";
  return baseMeta(title, description, comparison, `/compare/${comparison.slug}`);
}

export function guideMetadata(guide: BuyingGuide): Metadata {
  return baseMeta(
    guide.seoTitle ?? guide.title,
    guide.seoDescription ??
      guide.shortDescription ??
      guide.quickAnswer ??
      guide.sections[0]?.body?.slice(0, 160) ??
      guide.title,
    guide,
    `/guides/${guide.slug}`,
    { ogType: "article" },
  );
}

export function toolMetadata(tool: Tool): Metadata {
  return baseMeta(
    tool.name,
    tool.description,
    tool,
    `/tools/${tool.slug}`,
  );
}
