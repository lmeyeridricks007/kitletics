import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { MediaAsset, RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION, REGION_META } from "@/domain/shared/types";
import type {
  Product,
  Brand,
  ProductFamily,
  SpecificationDefinition,
} from "@/domain/products/types";
import type { ProductCategory } from "@/domain/sports/types";
import type { Recommendation, Evidence } from "@/domain/recommendations/types";
import type { Offer, Retailer } from "@/domain/commerce/types";
import type {
  Comparison,
  ComparisonChooseReason,
  ComparisonKeyDifference,
  FAQ,
  Review,
} from "@/domain/editorial/types";
import type { BreadcrumbItem } from "@/components/layout/Breadcrumbs";
import { formatVerifiedDate } from "@/lib/product/score";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { resolveSemanticImage } from "@/lib/media/semantic-image";
import {
  compareProducts,
  findEditorialComparisonForProducts,
  type CompareProductsResult,
  type SpecDiffRow,
  type UseCaseWinnerState,
} from "@/lib/comparison/engine";
import {
  getComparisonCategoryConfig,
  type ComparisonCategoryConfig,
  type ComparisonScoreFactor,
} from "@/lib/comparison/category-config";
import {
  getComparisonBySlug,
  getComparisons,
  getProductById,
  getProductBySlug,
  getBrandById,
  getProductFamilyById,
  getCategoryById,
  getSpecificationDefinitions,
  getRecommendationsForProduct,
  getOffersForProduct,
  getLowestOfferPrice,
  getRetailerById,
  getReviewByProduct,
  getFaqsByIds,
  getEvidenceById,
  getUseCaseById,
  getAlternativesForProduct,
  getComparisonsForProduct,
  getSportById,
  getToolBySlug,
} from "@/repositories";
import { productGenerationChanges } from "@/content/generation-changes";
import type { ProductGenerationChange } from "@/content/generation-changes";
import { isOfferStale } from "@/lib/product/score";

export interface ComparisonProductBundle {
  product: Product;
  brand?: Brand;
  family?: ProductFamily;
  specs: SpecificationDefinition[];
  recommendations: Recommendation[];
  offers: { offer: Offer; retailer?: Retailer; stale: boolean }[];
  lowestPrice?: { price: number; currency: string };
  review?: Review;
  evidence: Evidence[];
}

export interface ComparisonAlternativeRow {
  product: Product;
  brand?: Brand;
  reason: string;
}

export interface ComparisonScoreRow {
  key: string;
  label: string;
  valuesByProduct: Record<string, number | undefined>;
}

export interface ComparisonUseCaseCard {
  useCaseId: string;
  label: string;
  state: UseCaseWinnerState;
  winnerProductId?: string;
  winnerLabel?: string;
  rationale?: string;
  isValue?: boolean;
}

export interface ComparisonPageData {
  mode: "editorial" | "generated";
  comparison?: Comparison;
  products: ComparisonProductBundle[];
  category?: ProductCategory;
  differences: CompareProductsResult;
  keyDifferencesEditorial: ComparisonKeyDifference[];
  chooseReasons: ComparisonChooseReason[];
  relativeStrengths: { productId: string; items: string[] }[];
  relativeTradeoffs: { productId: string; items: string[] }[];
  alternatives: ComparisonAlternativeRow[];
  relatedComparisons: Comparison[];
  faq: FAQ[];
  evidence: Evidence[];
  region: RegionCode;
  regionLabel: string;
  breadcrumbs: BreadcrumbItem[];
  /** Link to editorial if viewing dynamic pair that has one */
  editorialSlug?: string;
  builderQuery: string;
  isGenerationComparison: boolean;
  pricesLastChecked?: string;
  indexable: boolean;
  groupedSpecs: {
    id: string;
    label: string;
    rows: SpecDiffRow[];
  }[];
  generationChange?: ProductGenerationChange;
  config: ComparisonCategoryConfig;
  heroImageSrc?: string;
  displayTitle: string;
  scoreRows: ComparisonScoreRow[];
  useCaseCards: ComparisonUseCaseCard[];
  productMedia: Record<string, MediaAsset | undefined>;
  finderHref?: string;
  finderCtaLabel?: string;
  finderThumbnails: string[];
  updatedLabel: string;
  metaKind: "Expert comparison" | "Structured comparison";
  sectionIds: string[];
}

function collectEvidence(ids: string[]): Evidence[] {
  return ids
    .map((id) => getEvidenceById(id))
    .filter((e): e is Evidence => Boolean(e));
}

function buildProductBundle(
  product: Product,
  options: PublishResolverOptions | undefined,
  region: RegionCode,
): ComparisonProductBundle {
  const offers = getOffersForProduct(product.id, region).map((offer) => ({
    offer,
    retailer: getRetailerById(offer.retailerId),
    stale: isOfferStale(offer.lastChecked),
  }));
  const lowest = getLowestOfferPrice(product.id, region, options);
  const review = getReviewByProduct(product.id, options);

  return {
    product,
    brand: getBrandById(product.brandId, options),
    family: product.familyId
      ? getProductFamilyById(product.familyId)
      : undefined,
    specs: getSpecificationDefinitions(product.categoryId),
    recommendations: getRecommendationsForProduct(product.id),
    offers,
    lowestPrice: lowest
      ? { price: lowest.price, currency: lowest.currency }
      : undefined,
    review,
    evidence: collectEvidence(product.evidenceIds ?? []),
  };
}

function buildRelativeLists(comparison: Comparison | undefined, products: Product[]) {
  const strengths: { productId: string; items: string[] }[] = products.map(
    (p) => ({ productId: p.id, items: [] }),
  );
  const tradeoffs: { productId: string; items: string[] }[] = products.map(
    (p) => ({ productId: p.id, items: [] }),
  );

  if (!comparison) return { strengths, tradeoffs };

  for (const c of comparison.criteria) {
    if (!c.winnerProductId || !c.notes) continue;
    const row = strengths.find((s) => s.productId === c.winnerProductId);
    if (row) row.items.push(c.notes);
  }

  // keyDifferences productImpacts as relative strengths phrasing
  for (const kd of comparison.keyDifferences ?? []) {
    for (const impact of kd.productImpacts) {
      const row = strengths.find((s) => s.productId === impact.productId);
      if (row && impact.impact) row.items.push(impact.impact);
    }
  }

  return { strengths, tradeoffs };
}

function buildDisplayTitle(
  products: Product[],
  brands: (Brand | undefined)[],
): string {
  const sameBrand =
    brands.length > 0 &&
    brands.every((b) => b?.id && b.id === brands[0]?.id);

  return products
    .map((p, i) => {
      const brandName = brands[i]?.name;
      if (i === 0 || !sameBrand) {
        return brandName ? `${brandName} ${p.name}` : p.name;
      }
      return p.name;
    })
    .join(" vs ");
}

function lookupFactorScore(
  factor: ComparisonScoreFactor,
  bundle: ComparisonProductBundle,
): number | undefined {
  const breakdown = bundle.review?.scoreBreakdown ?? [];
  for (const key of factor.factorKeys) {
    const hit = breakdown.find(
      (item) =>
        item.key.toLowerCase() === key.toLowerCase() ||
        item.label.toLowerCase().includes(key.toLowerCase()),
    );
    if (typeof hit?.score === "number") return hit.score;
  }

  for (const rec of bundle.recommendations) {
    for (const key of factor.factorKeys) {
      const hit = rec.factors.find(
        (f) => f.key.toLowerCase() === key.toLowerCase(),
      );
      if (typeof hit?.score === "number") return hit.score;
    }
  }

  if (factor.key === "value" && typeof bundle.product.valueScore === "number") {
    return bundle.product.valueScore;
  }

  return undefined;
}

function buildScoreRows(
  config: ComparisonCategoryConfig,
  bundles: ComparisonProductBundle[],
): ComparisonScoreRow[] {
  const factors = config.scoreFactors ?? [];
  return factors
    .map((factor) => {
      const valuesByProduct: Record<string, number | undefined> = {};
      for (const b of bundles) {
        valuesByProduct[b.product.id] = lookupFactorScore(factor, b);
      }
      return {
        key: factor.key,
        label: factor.label,
        valuesByProduct,
      };
    })
    .filter((row) =>
      Object.values(row.valuesByProduct).some((v) => typeof v === "number"),
    );
}

const EXTRA_USE_CASE_HINTS = [
  "uc-recovery-runs",
  "uc-tempo-runs",
  "uc-easy-runs",
  "uc-long-runs",
  "uc-daily-training",
];

function buildUseCaseCards(input: {
  differences: CompareProductsResult;
  config: ComparisonCategoryConfig;
  products: Product[];
  productLabels: Record<string, string>;
}): ComparisonUseCaseCard[] {
  const { differences, config, products, productLabels } = input;
  const preferred = new Set([
    ...config.primaryUseCaseIds,
    ...EXTRA_USE_CASE_HINTS,
  ]);

  const primaryOrdered = differences.useCaseDifferences.filter((uc) =>
    preferred.has(uc.useCaseId),
  );
  const rest = differences.useCaseDifferences.filter(
    (uc) => !preferred.has(uc.useCaseId),
  );
  const maxUseCases = config.valueComparisonEnabled ? 5 : 6;
  const ordered = [...primaryOrdered, ...rest].slice(0, maxUseCases);

  const cards: ComparisonUseCaseCard[] = ordered.map((uc) => ({
    useCaseId: uc.useCaseId,
    label: uc.label,
    state: uc.state,
    winnerProductId: uc.winnerProductId,
    winnerLabel:
      uc.state === "tie"
        ? "TIE"
        : uc.winnerProductId
          ? productLabels[uc.winnerProductId]
          : undefined,
    rationale: uc.editorialRationale,
  }));

  if (config.valueComparisonEnabled) {
    const scored = products
      .map((p) => ({
        id: p.id,
        score: p.valueScore,
      }))
      .filter(
        (s): s is { id: string; score: number } => typeof s.score === "number",
      );

    if (scored.length >= 2) {
      const sorted = [...scored].sort((a, b) => b.score - a.score);
      const margin = sorted[0].score - sorted[1].score;
      const threshold = config.winnerDifferenceThreshold;
      if (margin < threshold) {
        cards.push({
          useCaseId: "__value",
          label: "Value",
          state: "tie",
          winnerLabel: "TIE",
          rationale:
            "Kitletics value scores are too close to call on current catalog pricing.",
          isValue: true,
        });
      } else {
        cards.push({
          useCaseId: "__value",
          label: "Value",
          state: "winner",
          winnerProductId: sorted[0].id,
          winnerLabel: productLabels[sorted[0].id],
          rationale: `Clearer Kitletics value score for the current catalog price / performance mix.`,
          isValue: true,
        });
      }
    }
  }

  return cards.slice(0, 6);
}

function buildComparisonBreadcrumbs(input: {
  products: Product[];
  category?: ProductCategory;
  displayTitle: string;
  options?: PublishResolverOptions;
}): BreadcrumbItem[] {
  const { products, category, displayTitle, options } = input;
  const home: BreadcrumbItem = { label: "Home", href: "/" };
  const sportId = products[0]?.sportIds[0];
  const sport = sportId ? getSportById(sportId, options) : undefined;

  const crumbs: BreadcrumbItem[] = [home];
  if (sport) {
    crumbs.push({ label: sport.name, href: `/${sport.slug}` });
  }
  if (category) {
    crumbs.push({
      label: category.name,
      href:
        sport && category.pathSegment
          ? `/${sport.slug}/${category.pathSegment}`
          : `/gear/${category.slug}`,
    });
  }
  crumbs.push({ label: displayTitle });
  return crumbs;
}

function buildSectionIds(input: {
  keyDifferencesEditorial: ComparisonKeyDifference[];
  differences: CompareProductsResult;
  scoreRows: ComparisonScoreRow[];
  useCaseCards: ComparisonUseCaseCard[];
  groupedSpecs: { rows: SpecDiffRow[] }[];
  products: ComparisonProductBundle[];
  alternatives: ComparisonAlternativeRow[];
  faq: FAQ[];
  hasDecisionGuide: boolean;
}): string[] {
  const ids: string[] = ["overview"];
  if (input.hasDecisionGuide) ids.push("decision");
  if (
    input.keyDifferencesEditorial.length > 0 ||
    input.differences.importantDifferences.length > 0
  ) {
    ids.push("key-differences");
  }
  if (input.scoreRows.length > 0) ids.push("scores");
  if (input.useCaseCards.length > 0) ids.push("use-cases");
  if (input.groupedSpecs.some((g) => g.rows.length > 0)) ids.push("specs");
  ids.push("prices");
  if (input.products.some((p) => p.review?.slug)) ids.push("reviews");
  if (input.alternatives.length > 0) ids.push("alternatives");
  if (input.faq.length > 0) ids.push("faq");
  return ids;
}

function assembleFromProducts(input: {
  products: Product[];
  comparison?: Comparison;
  options?: PublishResolverOptions;
  region: RegionCode;
}): ComparisonPageData | undefined {
  const { products, comparison, options, region } = input;
  if (products.length < 2 || products.length > 4) return undefined;

  const categoryIds = new Set(products.map((p) => p.categoryId));
  if (categoryIds.size !== 1) return undefined;

  const categoryId = products[0].categoryId;
  const category = getCategoryById(categoryId, options);
  const defs = getSpecificationDefinitions(categoryId);
  const recommendations = products.flatMap((p) =>
    getRecommendationsForProduct(p.id),
  );

  const useCaseLabels: Record<string, string> = {};
  for (const r of recommendations) {
    if (r.useCaseId && !useCaseLabels[r.useCaseId]) {
      const uc = getUseCaseById(r.useCaseId);
      if (uc) useCaseLabels[r.useCaseId] = uc.name;
    }
  }
  for (const pick of comparison?.recommendationsByUseCase ?? []) {
    if (!useCaseLabels[pick.useCaseId]) {
      const uc = getUseCaseById(pick.useCaseId);
      if (uc) useCaseLabels[pick.useCaseId] = uc.name;
    }
  }

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

  const differences = compareProducts({
    products,
    defs,
    recommendations,
    useCaseLabels,
    lowestByProduct,
    editorialPicks: comparison?.recommendationsByUseCase,
    categoryId,
  });

  const bundles = products.map((p) => buildProductBundle(p, options, region));

  // Alternatives: union of alternative relationships + product.alternativeProductIds
  const seen = new Set(products.map((p) => p.id));
  const alternatives: ComparisonAlternativeRow[] = [];
  for (const p of products) {
    for (const alt of getAlternativesForProduct(p.id)) {
      if (seen.has(alt.alternativeProductId)) continue;
      const altProduct = getProductById(alt.alternativeProductId, options);
      if (!altProduct || altProduct.categoryId !== categoryId) continue;
      seen.add(altProduct.id);
      alternatives.push({
        product: altProduct,
        brand: getBrandById(altProduct.brandId, options),
        reason: alt.reasons[0] ?? "Related alternative",
      });
      if (alternatives.length >= 6) break;
    }
    if (alternatives.length >= 6) break;
  }
  for (const p of products) {
    for (const id of p.alternativeProductIds ?? []) {
      if (seen.has(id)) continue;
      const altProduct = getProductById(id, options);
      if (!altProduct || altProduct.categoryId !== categoryId) continue;
      seen.add(id);
      alternatives.push({
        product: altProduct,
        brand: getBrandById(altProduct.brandId, options),
        reason: "Shared use-case alternative",
      });
      if (alternatives.length >= 6) break;
    }
  }

  const relatedSet = new Map<string, Comparison>();
  for (const p of products) {
    for (const cmp of getComparisonsForProduct(p.id, options)) {
      if (comparison && cmp.id === comparison.id) continue;
      relatedSet.set(cmp.id, cmp);
    }
  }
  const relatedComparisons = [...relatedSet.values()].slice(0, 6);

  const faq = getFaqsByIds(comparison?.faqIds ?? []);

  const evidenceIds = [
    ...(comparison?.evidenceIds ?? []),
    ...products.flatMap((p) => p.evidenceIds ?? []),
  ];
  const evidence = collectEvidence([...new Set(evidenceIds)]);

  const { strengths, tradeoffs } = buildRelativeLists(comparison, products);

  // Prefer editorial relative tradeoffs if present in keyDifferences explanations — otherwise leave empty for generated
  if (comparison?.chooseProductReasons) {
    // no-op — choose reasons are separate
  }

  const config = getComparisonCategoryConfig(categoryId);
  const groupedSpecs = config.specificationGroups
    .map((g) => ({
      id: g.id,
      label: g.label,
      rows: differences.allSpecs.filter((r) => g.keys.includes(r.key)),
    }))
    .filter((g) => g.rows.length > 0);

  // Ungrouped leftover specs
  const groupedKeys = new Set(
    config.specificationGroups.flatMap((g) => g.keys),
  );
  const leftovers = differences.allSpecs.filter((r) => !groupedKeys.has(r.key));
  if (leftovers.length > 0) {
    groupedSpecs.push({ id: "other", label: "Other", rows: leftovers });
  }

  const checkedDates = bundles
    .flatMap((b) => b.offers.map((o) => o.offer.lastChecked))
    .filter(Boolean)
    .sort()
    .reverse();

  const sameFamily =
    products.length >= 2 &&
    products.every((p) => p.familyId && p.familyId === products[0].familyId);

  const generationChange =
    products.length === 2
      ? productGenerationChanges.find(
          (g) =>
            (g.fromProductId === products[0].id &&
              g.toProductId === products[1].id) ||
            (g.fromProductId === products[1].id &&
              g.toProductId === products[0].id),
        )
      : undefined;

  const builderQuery = `products=${products.map((p) => p.slug).join(",")}`;

  const brands = bundles.map((b) => b.brand);
  const displayTitle = buildDisplayTitle(products, brands);
  const productLabels: Record<string, string> = {};
  for (const b of bundles) {
    productLabels[b.product.id] = b.product.name;
  }

  const productMedia: Record<string, MediaAsset | undefined> = {};
  for (const b of bundles) {
    productMedia[b.product.id] = getPrimaryProductMedia(b.product);
  }

  const scoreRows = buildScoreRows(config, bundles);
  const useCaseCards = buildUseCaseCards({
    differences,
    config,
    products,
    productLabels,
  });

  const finderTool = config.finderToolSlug
    ? getToolBySlug(config.finderToolSlug, options)
    : undefined;
  const finderHref = finderTool
    ? `/tools/${finderTool.slug}`
    : config.finderToolSlug
      ? `/tools/${config.finderToolSlug}`
      : undefined;

  const finderThumbnails = products
    .map((p) => getPrimaryProductMedia(p)?.src)
    .filter((src): src is string => Boolean(src))
    .slice(0, 4);

  const updatedSource =
    comparison?.updatedAt ??
    comparison?.lastVerifiedAt ??
    comparison?.publishedAt ??
    checkedDates[0] ??
    products.map((p) => p.updatedAt).sort().reverse()[0];
  const updatedLabel = updatedSource
    ? formatVerifiedDate(updatedSource)
    : "—";

  const mode: ComparisonPageData["mode"] = comparison
    ? "editorial"
    : "generated";
  const metaKind: ComparisonPageData["metaKind"] =
    comparison &&
    (comparison.comparisonType === "editorial" ||
      comparison.comparisonType === "hybrid")
      ? "Expert comparison"
      : "Structured comparison";

  const keyDifferencesEditorial = comparison?.keyDifferences ?? [];
  const chooseReasons = comparison?.chooseProductReasons ?? [];
  const editorialSections = comparison?.editorialSections ?? [];
  const hasDecisionGuide =
    Boolean(comparison?.verdict) ||
    chooseReasons.length > 0 ||
    editorialSections.length > 0;

  const sectionIds = buildSectionIds({
    keyDifferencesEditorial,
    differences,
    scoreRows,
    useCaseCards,
    groupedSpecs,
    products: bundles,
    alternatives,
    faq,
    hasDecisionGuide,
  });

  return {
    mode,
    comparison,
    products: bundles,
    category,
    differences,
    keyDifferencesEditorial,
    chooseReasons,
    relativeStrengths: strengths,
    relativeTradeoffs: tradeoffs,
    alternatives,
    relatedComparisons,
    faq,
    evidence,
    region,
    regionLabel: REGION_META[region]?.label ?? region,
    breadcrumbs: buildComparisonBreadcrumbs({
      products,
      category,
      displayTitle,
      options,
    }),
    editorialSlug: undefined,
    builderQuery,
    isGenerationComparison:
      Boolean(comparison?.isGenerationComparison) ||
      Boolean(generationChange) ||
      (sameFamily && Boolean(comparison?.upgradeAdvice)),
    pricesLastChecked: checkedDates[0],
    indexable: Boolean(comparison) && comparison!.status === "published",
    groupedSpecs,
    generationChange,
    config,
    heroImageSrc: resolveSemanticImage({
      pageType: "comparison",
      placement: "hero",
      slug: comparison?.slug,
      title: displayTitle,
      categoryId,
      dedicatedSrc: config.heroImageSrc,
    }).src,
    displayTitle,
    scoreRows,
    useCaseCards,
    productMedia,
    finderHref,
    finderCtaLabel: config.finderCtaLabel,
    finderThumbnails,
    updatedLabel,
    metaKind,
    sectionIds,
  };
}

/**
 * Editorial/SEO comparison by slug.
 * Returns undefined if not found or any product unpublished (half-comparison guard).
 */
export function getComparisonPageData(
  slug: string,
  options?: PublishResolverOptions & { region?: RegionCode },
): ComparisonPageData | undefined {
  const region = options?.region ?? DEFAULT_REGION;
  const comparison = getComparisonBySlug(slug, options);
  if (!comparison) return undefined;

  const products = comparison.productIds.map((id) =>
    getProductById(id, options),
  );
  if (products.some((p) => !p)) return undefined;

  return assembleFromProducts({
    products: products as Product[],
    comparison,
    options,
    region,
  });
}

/**
 * Dynamic comparison from product slugs/ids — same engine as editorial.
 * Indexable only when an editorial Comparison exists for the pair (caller may redirect).
 */
export function getDynamicComparisonData(
  productRefs: string[],
  options?: PublishResolverOptions & { region?: RegionCode },
): ComparisonPageData | undefined {
  const region = options?.region ?? DEFAULT_REGION;
  const unique = [...new Set(productRefs.map((r) => r.trim()).filter(Boolean))];
  if (unique.length < 2 || unique.length > 4) return undefined;

  const products: Product[] = [];
  for (const ref of unique) {
    const bySlug = getProductBySlug(ref, options);
    const byId = bySlug ?? getProductById(ref, options);
    if (!byId) return undefined;
    products.push(byId);
  }

  if (new Set(products.map((p) => p.categoryId)).size !== 1) return undefined;

  const editorial = findEditorialComparisonForProducts(
    getComparisons(options),
    products.map((p) => p.id),
  );
  const comparison = editorial
    ? getComparisonBySlug(editorial.slug, options)
    : undefined;

  const data = assembleFromProducts({
    products,
    comparison,
    options,
    region,
  });
  if (!data) return undefined;

  // Dynamic URL remains noindex unless we fully resolve to published editorial
  // (Prompt: dynamic arbitrary pairs are noindex; if editorial exists, offer link)
  if (comparison) {
    data.editorialSlug = comparison.slug;
    data.indexable = false; // query URL itself stays noindex; canonical is /compare/slug
  } else {
    data.indexable = false;
    data.mode = "generated";
  }

  return data;
}

/** Find canonical comparison if reverse product-order slug was requested */
export function resolveCanonicalComparisonSlug(
  requestedSlug: string,
  options?: PublishResolverOptions,
): string | undefined {
  const direct = getComparisonBySlug(requestedSlug, options);
  if (direct) return undefined; // already canonical

  // Match reverse product order by reconstructing from all comparisons
  const parts = requestedSlug.split("-vs-");
  if (parts.length !== 2) return undefined;

  for (const cmp of getComparisons(options)) {
    if (cmp.productIds.length !== 2) continue;
    const [a, b] = cmp.productIds
      .map((id) => getProductById(id, options)?.slug)
      .filter(Boolean) as string[];
    if (!a || !b) continue;
    const reverse = `${b}-vs-${a}`;
    if (requestedSlug === reverse && cmp.slug !== requestedSlug) {
      return cmp.slug;
    }
  }
  return undefined;
}

export function getFeaturedComparisonsByCategory(
  options?: PublishResolverOptions,
): { categoryId: string; categoryName: string; items: Comparison[] }[] {
  const byCat = new Map<string, Comparison[]>();
  for (const cmp of getComparisons(options)) {
    const products = cmp.productIds
      .map((id) => getProductById(id, options))
      .filter((p): p is Product => Boolean(p));
    const categoryId =
      cmp.categoryId ?? products[0]?.categoryId ?? "unknown";
    const list = byCat.get(categoryId) ?? [];
    list.push(cmp);
    byCat.set(categoryId, list);
  }

  return [...byCat.entries()].map(([categoryId, items]) => ({
    categoryId,
    categoryName: getCategoryById(categoryId, options)?.name ?? categoryId,
    items,
  }));
}
