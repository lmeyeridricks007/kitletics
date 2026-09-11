import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  resolvePublished,
  resolvePublishedById,
  resolvePublishedBySlug,
} from "@/lib/publishing/resolver";
import { faqs as rawFaqs } from "@/content/faqs";
import { reviews as rawReviews } from "@/content/reviews";
import { authors as rawAuthors } from "@/content/authors";
import { reviewCriteriaDefinitions as rawCriteria } from "@/content/review-criteria";
import {
  bestGuides as rawBestGuides,
  buyingGuides as rawBuyingGuides,
  comparisons as rawComparisons,
  gearSetups as rawSetups,
} from "@/content/editorial";
import { tools as rawTools } from "@/content/tools";
import type {
  Author,
  BestGuide,
  BuyingGuide,
  Comparison,
  FAQ,
  GearSetup,
  Review,
  ReviewCriteriaDefinition,
} from "@/domain/editorial/types";
import type { Tool } from "@/domain/tools/types";
import { getProductById, getComparableSpecs, getProducts } from "@/repositories/products";
import type { Product } from "@/domain/products/types";
import { normalizeBestGuide } from "@/lib/best/normalize-best-guide";
import { applySanitizedReviewAlternatives } from "@/lib/decision-graph/sanitize-review-alternatives";

export function getFaqs(): FAQ[] {
  return [...rawFaqs];
}

export function getFaqById(id: string): FAQ | undefined {
  return rawFaqs.find((f) => f.id === id);
}

export function getFaqsByIds(ids: string[]): FAQ[] {
  return ids.map((id) => getFaqById(id)).filter((f): f is FAQ => Boolean(f));
}

function productMapForReviews(
  options?: PublishResolverOptions,
): Map<string, Product> {
  return new Map(getProducts(options).map((p) => [p.id, p]));
}

function withSanitizedReviewAlts(
  review: Review | undefined,
  options?: PublishResolverOptions,
): Review | undefined {
  if (!review) return undefined;
  return applySanitizedReviewAlternatives(review, productMapForReviews(options));
}

export function getReviews(options?: PublishResolverOptions): Review[] {
  const byId = productMapForReviews(options);
  return resolvePublished(rawReviews, options).map((review) =>
    applySanitizedReviewAlternatives(review, byId),
  );
}

export function getReviewBySlug(
  slug: string,
  options?: PublishResolverOptions,
): Review | undefined {
  return withSanitizedReviewAlts(
    resolvePublishedBySlug(rawReviews, slug, options),
    options,
  );
}

export function getReviewById(
  id: string,
  options?: PublishResolverOptions,
): Review | undefined {
  return withSanitizedReviewAlts(
    resolvePublishedById(rawReviews, id, options),
    options,
  );
}

export function getReviewByProduct(
  productId: string,
  options?: PublishResolverOptions,
): Review | undefined {
  const product = getProductById(productId, options);
  if (product?.reviewId) {
    const primary = getReviewById(product.reviewId, options);
    if (primary) return primary;
  }
  return getReviews(options).find((r) => r.productId === productId);
}

export function getAuthors(): Author[] {
  return [...rawAuthors];
}

export function getAuthorById(id: string): Author | undefined {
  return rawAuthors.find((a) => a.id === id);
}

export function getAuthorBySlug(slug: string): Author | undefined {
  if (slug === "kitletics-editors") {
    return rawAuthors.find((a) => a.slug === "kitletics-editorial");
  }
  return rawAuthors.find((a) => a.slug === slug);
}

export function getReviewsByAuthor(
  authorId: string,
  options?: PublishResolverOptions,
): Review[] {
  const reviews = getReviews(options);
  if (authorId === "author-kitletics-editorial") {
    return reviews.filter(
      (r) =>
        r.reviewerId === authorId ||
        r.reviewerId === undefined ||
        r.reviewerId === "",
    );
  }
  return reviews.filter((r) => r.reviewerId === authorId);
}

export function getReviewCriteriaDefinitions(
  categoryId?: string,
): ReviewCriteriaDefinition[] {
  if (!categoryId) return [...rawCriteria];
  return rawCriteria.filter((c) => c.categoryId === categoryId);
}

export function getBestGuides(options?: PublishResolverOptions): BestGuide[] {
  return resolvePublished(rawBestGuides, options).map((guide) =>
    normalizeBestGuide(guide, options),
  );
}

/**
 * Seed Best Guide without page-time normalize/enrich — used for launch quality
 * so enrichment cannot inflate Day-1 INDEXABLE counts beyond editorial audit.
 */
export function getBestGuideSeedBySlug(
  slug: string,
  options?: PublishResolverOptions,
): BestGuide | undefined {
  return resolvePublishedBySlug(rawBestGuides, slug, options);
}

export function getBestGuideBySlug(
  slug: string,
  options?: PublishResolverOptions,
): BestGuide | undefined {
  const guide = resolvePublishedBySlug(rawBestGuides, slug, options);
  return guide ? normalizeBestGuide(guide, options) : undefined;
}

export function getBestGuidesForProduct(
  productId: string,
  options?: PublishResolverOptions,
): BestGuide[] {
  return getBestGuides(options).filter((g) =>
    g.recommendations.some((r) => r.productId === productId),
  );
}

export function getComparisons(options?: PublishResolverOptions): Comparison[] {
  return resolvePublished(rawComparisons, options);
}

export function getComparisonBySlug(
  slug: string,
  options?: PublishResolverOptions,
): Comparison | undefined {
  return resolvePublishedBySlug(rawComparisons, slug, options);
}

export function getComparisonById(
  id: string,
  options?: PublishResolverOptions,
): Comparison | undefined {
  return resolvePublishedById(rawComparisons, id, options);
}

export function getComparisonsForProduct(
  productId: string,
  options?: PublishResolverOptions,
): Comparison[] {
  return getComparisons(options).filter((c) =>
    c.productIds.includes(productId),
  );
}

/** Order-independent published comparison for a product pair. */
export function getPublishedComparisonForPair(
  productAId: string,
  productBId: string,
  options?: PublishResolverOptions,
): Comparison | undefined {
  const pair = new Set([productAId, productBId]);
  return getComparisons(options).find(
    (c) =>
      c.productIds.length === 2 &&
      pair.has(c.productIds[0]!) &&
      pair.has(c.productIds[1]!),
  );
}

/** Scenario C — comparison pulls live product specs via repository. */
export function getComparisonWithSpecs(
  slug: string,
  options?: PublishResolverOptions,
):
  | {
      comparison: Comparison;
      products: Product[];
      specRows: ReturnType<typeof getComparableSpecs>;
    }
  | undefined {
  const comparison = getComparisonBySlug(slug, options);
  if (!comparison) return undefined;
  const products = comparison.productIds
    .map((id) => getProductById(id, options))
    .filter((p): p is Product => Boolean(p));
  return {
    comparison,
    products,
    specRows: getComparableSpecs(products),
  };
}

export function getBuyingGuides(
  options?: PublishResolverOptions,
): BuyingGuide[] {
  return resolvePublished(rawBuyingGuides, options);
}

export function getBuyingGuideBySlug(
  slug: string,
  options?: PublishResolverOptions,
): BuyingGuide | undefined {
  return resolvePublishedBySlug(rawBuyingGuides, slug, options);
}

export function getBuyingGuidesForProduct(
  productId: string,
  options?: PublishResolverOptions,
): BuyingGuide[] {
  return getBuyingGuides(options).filter((g) =>
    g.relatedProductIds.includes(productId),
  );
}

export function getGearSetups(options?: PublishResolverOptions): GearSetup[] {
  return resolvePublished(rawSetups, options);
}

export function getGearSetupBySlug(
  slug: string,
  options?: PublishResolverOptions,
): GearSetup | undefined {
  const bySlug = resolvePublishedBySlug(rawSetups, slug, options);
  if (bySlug) return bySlug;
  return getGearSetups(options).find((s) => s.slugAliases?.includes(slug));
}

export function getGearSetupById(
  id: string,
  options?: PublishResolverOptions,
): GearSetup | undefined {
  return resolvePublishedById(rawSetups, id, options);
}

export function getBuyingGuideById(
  id: string,
  options?: PublishResolverOptions,
): BuyingGuide | undefined {
  return getBuyingGuides(options).find((g) => g.id === id);
}

export function getBestGuideById(
  id: string,
  options?: PublishResolverOptions,
): BestGuide | undefined {
  return getBestGuides(options).find((g) => g.id === id);
}

export function getTools(options?: PublishResolverOptions): Tool[] {
  return resolvePublished(rawTools, options);
}

export function getToolBySlug(
  slug: string,
  options?: PublishResolverOptions,
): Tool | undefined {
  return resolvePublishedBySlug(rawTools, slug, options);
}

export function getToolsBySport(
  sportId: string,
  options?: PublishResolverOptions,
): Tool[] {
  return getTools(options).filter((t) => t.sportIds.includes(sportId));
}
