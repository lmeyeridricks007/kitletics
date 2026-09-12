import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { siteConfig } from "@/content/config";
import type { Product, Brand } from "@/domain/products/types";
import type { ProductCategory, Sport } from "@/domain/sports/types";
import type {
  ProductRelationship,
  ProductRelationshipType,
} from "@/domain/relationships/types";
import { ALT_GROUP_LABELS } from "@/domain/relationships/types";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import {
  getAlternativesFromGraph,
  getGenerationRelationships,
  getAllProductRelationships,
} from "@/repositories/relationships";
import {
  getProductBySlug,
  getProductById,
  getBrandById,
  getCategoryById,
  getSportById,
  getLowestOfferPrice,
  getComparisonsForProduct,
} from "@/repositories";
import { getReviewByProduct } from "@/repositories/editorial";
import { getOffersForProduct } from "@/repositories/commerce";
import { findPublishedComparisonForProducts } from "@/lib/comparison/engine";
import { getComparisons } from "@/repositories/editorial";
import { compareProducts, type SpecDiffRow } from "@/lib/comparison/engine";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import type { Comparison, Review } from "@/domain/editorial/types";
import { allSpecificationDefinitions } from "@/content/specs/definitions";
import { recommendations as allRecommendations } from "@/content/recommendations";
import { useCases } from "@/content/taxonomy/use-cases";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { resolveSemanticImage } from "@/lib/media/semantic-image";
import { resolveDecisionCopyForProduct } from "@/lib/decision-copy";
import { getScoreBand } from "@/lib/product/score";
import {
  getAlternativesPageConfig,
  reasonConfigForType,
  type AlternativesPageConfig,
  type AlternativesReasonConfig,
} from "@/lib/product/alternatives-config";
import {
  buildAlternativeDecisionCopy,
  buildAlternativesPageIntro,
  alternativesHaveDistinctDecisionCopy,
} from "@/lib/product/alternative-decision-copy";
import {
  countRankedReasonGroups,
  countSubstantiveAlternatives,
  evaluateAlternativesContentIndexable,
} from "@/lib/product/alternatives-quality-signals";
import { promotableReviewSlug } from "@/domain/launch/get-launch-eligibility";
import { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";
import type { MediaAsset } from "@/domain/shared/types";

export interface AlternativeItem {
  relationship: ProductRelationship;
  product: Product;
  brand?: Brand;
  media?: MediaAsset;
  score?: number;
  scoreLabel?: string;
  summary: string;
  whyAlternative: string;
  betterAt: string[];
  worseAt: string[];
  whoShouldSwitch: string;
  whoShouldStay: string;
  whyChoose: string[];
  bestFor: string[];
  price?: { price: number; currency: string };
  offerCount: number;
  reviewSlug?: string;
  publishedComparisonSlug?: string;
  reasonId: string;
  badgeLabel: string;
  relevance: number;
}

export interface AlternativeReasonGroup {
  reason: AlternativesReasonConfig;
  count: number;
}

export interface AlternativesPageData {
  product: Product;
  brand?: Brand;
  category?: ProductCategory;
  sport?: Sport;
  config: AlternativesPageConfig;
  breadcrumbs: { label: string; href?: string }[];
  /** Flattened, relevance-ranked alternatives (deduped by product) */
  alternatives: AlternativeItem[];
  reasonGroups: AlternativeReasonGroup[];
  indexable: boolean;
  eligibilityReasons: string[];
  source: {
    media?: MediaAsset;
    score?: number;
    scoreLabel?: string;
    summary: string;
    /** Decision-quality page intro (pair/role aware) */
    intro: string;
    price?: { price: number; currency: string };
    offerCount: number;
    review?: Review;
  };
  comparisonRows: {
    productId: string;
    slug: string;
    name: string;
    isSource: boolean;
    cells: Record<string, string>;
  }[];
  comparisonSpecRows: SpecDiffRow[];
  publishedComparisons: Comparison[];
  generation: {
    previous?: Product;
    next?: Product;
  };
  finder?: {
    href: string;
    ctaLabel: string;
    montage: { src: string; alt: string }[];
  };
  region: RegionCode;
  regionLabel: string;
  lastUpdatedLabel?: string;
  nextReviewLabel?: string;
  compareHrefBase: string;
  heroBackgroundSrc?: string;
}

const MAX_ALTERNATIVES = 8;

const alternativesPageDataCache = new Map<string, AlternativesPageData | undefined>();

function alternativesPageCacheKey(
  slug: string,
  options?: PublishResolverOptions & { region?: RegionCode },
): string {
  return `${slug}::${options?.isDev ? "dev" : "prod"}::${options?.region ?? DEFAULT_REGION}::${options?.now?.toISOString() ?? ""}`;
}

/** Higher = prefer this relationship type when multiple edges share a target */
const TYPE_PRIORITY: Partial<Record<ProductRelationshipType, number>> = {
  "previous-generation": 100,
  "next-generation": 100,
  "more-cushioned": 90,
  "more-stable": 90,
  "more-responsive": 90,
  "more-durable": 90,
  faster: 88,
  "race-focused-alternative": 85,
  "long-run-alternative": 80,
  "trail-alternative": 80,
  "better-value": 70,
  "cheaper-alternative": 68,
  cheaper: 68,
  "beginner-friendly": 65,
  "daily-training-alternative": 60,
  "direct-competitor": 50,
  similar: 40,
};

function typePriority(type: ProductRelationshipType): number {
  return TYPE_PRIORITY[type] ?? 30;
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

function nextReviewFrom(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  d.setMonth(d.getMonth() + 3);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function bestForLabels(product: Product, limit = 3): string[] {
  const review = getReviewByProduct(product.id);
  return resolveDecisionCopyForProduct({ product, review }).bestFor.slice(
    0,
    limit,
  );
}

function displayScore(score: number): string {
  return (score / 10).toFixed(1);
}

function isWeakAlternativeEdge(
  relationship: ProductRelationship,
  source: Product,
  alt: Product,
): boolean {
  // Never keep cross-category arbitrary edges
  if (source.categoryId !== alt.categoryId) return true;
  // Thin catalog peer with no buying signal on either side
  const hasSignal =
    (alt.strengths?.length ?? 0) > 0 ||
    (source.strengths?.length ?? 0) > 0 ||
    (relationship.reasons ?? []).some((r) => r.trim().length > 40);
  if (!hasSignal) return true;
  // Deprecated sync template without replacement signal
  const joined = (relationship.reasons ?? []).join(" ");
  if (
    /same-category alternative when you want a peer/i.test(joined) &&
    (alt.strengths?.length ?? 0) === 0 &&
    (source.strengths?.length ?? 0) === 0
  ) {
    return true;
  }
  return false;
}

function collectRelationships(
  productId: string,
  source: Product,
  options?: PublishResolverOptions,
): ProductRelationship[] {
  const alts = getAlternativesFromGraph(productId).filter((r) => {
    const alt = getProductById(r.targetProductId, options);
    if (!alt || alt.status !== "published") return false;
    return !isWeakAlternativeEdge(r, source, alt);
  });
  const gen = getGenerationRelationships(productId).filter(
    (r) =>
      r.type === "previous-generation" || r.type === "next-generation",
  );
  const seen = new Set(alts.map((r) => r.id));
  const merged = [...alts];
  for (const g of gen) {
    if (!seen.has(g.id)) merged.push(g);
  }
  return merged;
}

/** Prefer diverse reason types in the ranked list */
function rankWithDiversity(
  items: AlternativeItem[],
  preferredReasonOrder: string[],
): AlternativeItem[] {
  const byReason = new Map<string, AlternativeItem[]>();
  for (const item of items) {
    const list = byReason.get(item.reasonId) ?? [];
    list.push(item);
    byReason.set(item.reasonId, list);
  }
  for (const list of byReason.values()) {
    list.sort((a, b) => b.relevance - a.relevance);
  }

  const result: AlternativeItem[] = [];
  const usedProducts = new Set<string>();
  const reasonQueue = [
    ...preferredReasonOrder.filter((id) => byReason.has(id)),
    ...[...byReason.keys()].filter((id) => !preferredReasonOrder.includes(id)),
  ];

  // Round-robin across reasons for diversity
  let added = true;
  while (added && result.length < MAX_ALTERNATIVES) {
    added = false;
    for (const reasonId of reasonQueue) {
      if (result.length >= MAX_ALTERNATIVES) break;
      const list = byReason.get(reasonId);
      if (!list?.length) continue;
      const next = list.find((i) => !usedProducts.has(i.product.id));
      if (!next) continue;
      result.push(next);
      usedProducts.add(next.product.id);
      added = true;
    }
  }

  return result;
}

function specCell(
  rows: SpecDiffRow[],
  key: string,
  productId: string,
): string {
  const row = rows.find((r) => r.key === key);
  const value = row?.valuesByProduct[productId];
  if (!value || value === "Unknown") return "—";
  return value;
}

export function getAlternativesPageData(
  slug: string,
  options?: PublishResolverOptions & { region?: RegionCode },
): AlternativesPageData | undefined {
  const cacheKey = alternativesPageCacheKey(slug, options);
  if (alternativesPageDataCache.has(cacheKey)) {
    return alternativesPageDataCache.get(cacheKey);
  }
  const built = buildAlternativesPageData(slug, options);
  alternativesPageDataCache.set(cacheKey, built);
  return built;
}

function buildAlternativesPageData(
  slug: string,
  options?: PublishResolverOptions & { region?: RegionCode },
): AlternativesPageData | undefined {
  const region = options?.region ?? DEFAULT_REGION;
  const product = getProductBySlug(slug, options);
  if (!product) return undefined;

  const brand = getBrandById(product.brandId);
  const category = getCategoryById(product.categoryId);
  const sport = product.sportIds[0]
    ? getSportById(product.sportIds[0])
    : undefined;
  const config = getAlternativesPageConfig(product.categoryId);

  const relationships = collectRelationships(product.id, product, options);
  const allForEligibility = getAllProductRelationships();
  const eligibility = canPublishAlternativesPage(product, allForEligibility);

  const comparisons = getComparisons(options);
  const rawByTarget = new Map<string, AlternativeItem>();

  for (const relationship of relationships) {
    const alt = getProductById(relationship.targetProductId, options);
    if (!alt || alt.status !== "published") continue;

    const reason =
      reasonConfigForType(config, relationship.type) ??
      ({
        id: relationship.type,
        types: [relationship.type],
        title: ALT_GROUP_LABELS[relationship.type] ?? relationship.type,
        tabLabel: ALT_GROUP_LABELS[relationship.type] ?? relationship.type,
        badgeLabel: ALT_GROUP_LABELS[relationship.type] ?? relationship.type,
        description: "",
        icon: "sparkles" as const,
      } satisfies AlternativesReasonConfig);

    const decision = buildAlternativeDecisionCopy({
      source: product,
      alternative: alt,
      relationship,
      reason,
    });

    const score =
      typeof alt.recommendationScore === "number"
        ? alt.recommendationScore
        : undefined;
    const media = getPrimaryProductMedia(alt);
    const price = getLowestOfferPrice(alt.id, region, options);
    const offers = getOffersForProduct(alt.id, region);
    const review = getReviewByProduct(alt.id, options);
    const cmp = findPublishedComparisonForProducts(comparisons, [
      product.id,
      alt.id,
    ]);

    const item: AlternativeItem = {
      relationship,
      product: alt,
      brand: getBrandById(alt.brandId),
      media,
      score,
      scoreLabel:
        typeof score === "number" ? getScoreBand(score).label : undefined,
      summary: decision.summary,
      whyAlternative: decision.whyAlternative,
      betterAt: decision.betterAt,
      worseAt: decision.worseAt,
      whoShouldSwitch: decision.whoShouldSwitch,
      whoShouldStay: decision.whoShouldStay,
      whyChoose: decision.whyChoose,
      bestFor: bestForLabels(alt),
      price: price
        ? { price: price.price, currency: price.currency }
        : undefined,
      offerCount: offers.length,
      reviewSlug: promotableReviewSlug(
        review?.status === "published" ? review : undefined,
        options,
      ),
      publishedComparisonSlug: cmp?.slug,
      reasonId: reason.id,
      badgeLabel: reason.badgeLabel,
      relevance:
        (relationship.strength ?? 60) +
        typePriority(relationship.type) +
        (relationship.reasons.length > 1 ? 5 : 0) +
        (cmp ? 8 : 0) +
        (typeof score === "number" ? score / 20 : 0) +
        (decision.betterAt.length >= 2 && decision.worseAt.length >= 1
          ? 6
          : 0),
    };

    const existing = rawByTarget.get(alt.id);
    if (
      !existing ||
      typePriority(relationship.type) > typePriority(existing.relationship.type)
    ) {
      rawByTarget.set(alt.id, item);
    }
  }

  const rawItems = [...rawByTarget.values()];
  const preferredOrder = config.reasons.map((r) => r.id);
  const alternatives = rankWithDiversity(rawItems, preferredOrder);

  // Fix 82 — reason groups include fallback reasonIds (types outside config tabs),
  // not only config.reasons matches. Under-counting caused false noindex.
  const reasonCountById = new Map<string, number>();
  for (const alt of alternatives) {
    reasonCountById.set(
      alt.reasonId,
      (reasonCountById.get(alt.reasonId) ?? 0) + 1,
    );
  }
  const reasonGroups: AlternativeReasonGroup[] = [];
  const seenReasonIds = new Set<string>();
  for (const reason of config.reasons) {
    const count = reasonCountById.get(reason.id) ?? 0;
    if (count <= 0) continue;
    reasonGroups.push({ reason, count });
    seenReasonIds.add(reason.id);
  }
  for (const alt of alternatives) {
    if (seenReasonIds.has(alt.reasonId)) continue;
    const count = reasonCountById.get(alt.reasonId) ?? 0;
    reasonGroups.push({
      reason: {
        id: alt.reasonId,
        types: [alt.relationship.type],
        title: alt.badgeLabel,
        tabLabel: alt.badgeLabel,
        badgeLabel: alt.badgeLabel,
        description: "",
        icon: "sparkles",
      },
      count,
    });
    seenReasonIds.add(alt.reasonId);
  }

  const substantiveCount = countSubstantiveAlternatives(alternatives);
  const reasonGroupCount = countRankedReasonGroups(alternatives);
  const distinctNames = [
    product.fullName,
    product.name,
    ...alternatives.flatMap((a) => [
      a.product.fullName,
      a.product.name,
      a.brand?.name ?? "",
    ]),
  ].filter(Boolean);
  const distinctCopy = alternativesHaveDistinctDecisionCopy(
    alternatives,
    distinctNames,
  );
  // Content bar only. Full indexability (parent + editorial) is
  // assessAlternativesIndexability / getLaunchEligibility — used by sitemap + robots.
  const contentEval = evaluateAlternativesContentIndexable({
    canPublish: eligibility.ok,
    categoryId: product.categoryId,
    productSlug: product.slug,
    substantiveCount,
    reasonGroupCount,
    distinctCopy,
  });
  const indexable = contentEval.indexable;

  const pageIntro = buildAlternativesPageIntro({
    source: product,
    altCount: alternatives.length,
    reasonTitles: reasonGroups.map((g) => g.reason.title),
  });

  const sourceMedia = getPrimaryProductMedia(product);
  const sourceScore =
    typeof product.recommendationScore === "number"
      ? product.recommendationScore
      : undefined;
  const sourcePrice = getLowestOfferPrice(product.id, region, options);
  const sourceOffers = getOffersForProduct(product.id, region);
  const sourceReview = getReviewByProduct(product.id, options);

  const tableProducts = [
    product,
    ...alternatives.map((a) => a.product),
  ].slice(0, 7);

  const useCaseLabels: Record<string, string> = {};
  for (const uc of useCases) useCaseLabels[uc.id] = uc.name;
  const lowestByProduct: Record<
    string,
    { price: number; currency: string } | undefined
  > = {};
  for (const p of tableProducts) {
    const low = getLowestOfferPrice(p.id, region, options);
    lowestByProduct[p.id] = low
      ? { price: low.price, currency: low.currency }
      : undefined;
  }

  const matrix =
    tableProducts.length >= 2
      ? compareProducts({
          products: tableProducts,
          defs: allSpecificationDefinitions,
          recommendations: allRecommendations,
          useCaseLabels,
          lowestByProduct,
          categoryId: product.categoryId,
        })
      : undefined;

  const comparisonRows = tableProducts.map((p) => {
    const cells: Record<string, string> = {};
    for (const col of config.comparisonColumns) {
      if (col.kind === "name") {
        cells[col.id] = p.name;
      } else if (col.kind === "score") {
        cells[col.id] =
          typeof p.recommendationScore === "number"
            ? displayScore(p.recommendationScore)
            : "—";
      } else if (col.kind === "bestFor") {
        cells[col.id] = bestForLabels(p, 2).join(", ") || "—";
      } else if (col.kind === "price") {
        const low = lowestByProduct[p.id];
        cells[col.id] = low ? `${low.currency} ${low.price}` : "—";
      } else if (col.kind === "spec" && col.specKey && matrix) {
        cells[col.id] = specCell(matrix.allSpecs, col.specKey, p.id);
      } else {
        cells[col.id] = "—";
      }
    }
    return {
      productId: p.id,
      slug: p.slug,
      name: p.name,
      isSource: p.id === product.id,
      cells,
    };
  });

  const montage = alternatives
    .map((a) => a.media)
    .filter((m): m is MediaAsset => Boolean(m?.src))
    .slice(0, 4)
    .map((m) => ({ src: m.src, alt: m.alt ?? "" }));

  const crumbs = resolveBreadcrumbs({
    type: "product-alternatives",
    productSlug: product.slug,
  });

  const genRels = getGenerationRelationships(product.id);
  const previous = genRels.find((r) => r.type === "previous-generation");
  const next = genRels.find((r) => r.type === "next-generation");

  return {
    product,
    brand,
    category,
    sport,
    config,
    breadcrumbs: crumbs,
    alternatives,
    reasonGroups,
    indexable,
    eligibilityReasons: indexable
      ? eligibility.reasons
      : [
          ...eligibility.reasons,
          ...contentEval.reasons.filter(
            (r) => r !== "canPublishAlternativesPage failed",
          ),
        ],
    source: {
      media: sourceMedia,
      score: sourceScore,
      scoreLabel:
        typeof sourceScore === "number"
          ? getScoreBand(sourceScore).label
          : undefined,
      summary: pageIntro,
      intro: pageIntro,
      price: sourcePrice
        ? { price: sourcePrice.price, currency: sourcePrice.currency }
        : undefined,
      offerCount: sourceOffers.length,
      review:
        sourceReview?.status === "published" &&
        !containsPublicContentCorruption(sourceReview)
          ? sourceReview
          : undefined,
    },
    comparisonRows,
    comparisonSpecRows: matrix?.allSpecs ?? [],
    publishedComparisons: getComparisonsForProduct(product.id, options),
    generation: {
      previous: previous
        ? getProductById(previous.targetProductId, options)
        : undefined,
      next: next ? getProductById(next.targetProductId, options) : undefined,
    },
    finder: config.finderToolSlug
      ? {
          href: `/tools/${config.finderToolSlug}${product.slug ? `?considering=${product.slug}` : ""}`,
          ctaLabel: config.finderCtaLabel ?? "Try the finder →",
          montage,
        }
      : undefined,
    region,
    regionLabel: region,
    lastUpdatedLabel: formatDate(
      product.lastVerifiedAt ?? product.updatedAt,
    ),
    nextReviewLabel: nextReviewFrom(
      product.lastVerifiedAt ?? product.updatedAt,
    ),
    compareHrefBase: "/compare",
    heroBackgroundSrc: resolveSemanticImage({
      pageType: "alternatives",
      placement: "hero",
      slug: product.slug,
      title: product.fullName,
      categoryId: product.categoryId,
      dedicatedSrc: config.heroImageSrc,
    }).src,
  };
}

/** Spec table rows via comparison engine for alternatives page */
export function getAlternativesComparisonMatrix(
  products: Product[],
  region: RegionCode = DEFAULT_REGION,
  options?: PublishResolverOptions,
) {
  if (products.length < 2) return undefined;
  const useCaseLabels: Record<string, string> = {};
  for (const uc of useCases) useCaseLabels[uc.id] = uc.name;
  const lowestByProduct: Record<
    string,
    { price: number; currency: string } | undefined
  > = {};
  for (const p of products) {
    const low = getLowestOfferPrice(p.id, region, options);
    lowestByProduct[p.id] = low
      ? { price: low.price, currency: low.currency }
      : undefined;
  }
  return compareProducts({
    products,
    defs: allSpecificationDefinitions,
    recommendations: allRecommendations,
    useCaseLabels,
    lowestByProduct,
    categoryId: products[0]?.categoryId,
  });
}

export function alternativesCanonicalPath(slug: string): string {
  return `${siteConfig.url}/products/${slug}/alternatives`;
}

export type { ProductRelationshipType };
