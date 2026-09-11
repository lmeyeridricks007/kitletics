import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import type {
  FinderDefinition,
  FinderResponses,
  FinderRunResult,
} from "@/domain/finders/types";
import { getFinderDefinition } from "@/domain/finders/repository";
import { runFinder } from "@/domain/finders/engine";
import { explainRankDifference } from "@/domain/finders/explanations";
import {
  getProductsByCategory,
  getBrandById,
  getRecommendations,
  getLowestOfferPrice,
  getReviewByProduct,
  getAlternativesForProduct,
  getProductById,
  getOffersForProduct,
  getCategoryById,
  getBuyingGuideBySlug,
  getBestGuideBySlug,
} from "@/repositories";
import type { Product, Brand } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import { buildCompareHref } from "@/lib/comparison/selection";
import { rankLabel } from "@/domain/finders/match-bands";
import { getPrimaryProductMedia } from "@/lib/product/media";
import {
  getFinderUiConfig,
  type FinderUiConfig,
} from "@/lib/finder/finder-ui-config";
import {
  formatResponseLabel,
  resolveFinderSteps,
  type ResolvedFinderStep,
} from "@/lib/finder/resolve-steps";

export interface FinderResultProductRow {
  evaluation: FinderRunResult["rankedResults"][number];
  product: Product;
  brand?: Brand;
  review?: Review;
  lowestPrice?: { price: number; currency: string };
  offerCount: number;
  rankLabel: string;
  imageSrc?: string;
  imageAlt?: string;
  summary: string;
  alternatives: { product: Product; brand?: Brand; reason: string }[];
}

export interface FinderRelatedGuideCard {
  title: string;
  href: string;
  description?: string;
  imageSrc?: string;
}

export interface FinderResultsPageData {
  definition: FinderDefinition;
  ui: FinderUiConfig;
  run: FinderRunResult;
  rows: FinderResultProductRow[];
  topResults: FinderResultProductRow[];
  otherResults: FinderResultProductRow[];
  compareTopHref?: string;
  compareCount: number;
  whyTopBeatSecond?: {
    winnerName: string;
    runnerUpName: string;
    winnerAdvantages: string[];
    runnerUpAdvantages: string[];
  };
  region: RegionCode;
  debug?: boolean;
  categorySlug?: string;
  productNoun: string;
  candidateCount: number;
  overallQuality: "High" | "Medium" | "Low";
  /** Recommendation confidence — not top-product Match */
  overallConfidencePercent: number;
  summaryRows: { key: string; label: string; value: string; icon?: string }[];
  relatedGuides: FinderRelatedGuideCard[];
  steps: ResolvedFinderStep[];
  editHref: string;
  restartHref: string;
  headerHeroes: { src: string; alt: string; id: string }[];
}

function overallQualityFromRun(
  run: FinderRunResult,
  top: FinderResultProductRow | undefined,
): {
  overallQuality: "High" | "Medium" | "Low";
  overallConfidencePercent: number;
} {
  const coverage =
    top?.evaluation.dataCoverage ??
    (run.rankedResults[0]?.dataCoverage ?? 0);
  const evidence = top?.evaluation.evidenceConfidence ?? "low";
  const avgTop =
    run.rankedResults.slice(0, 3).reduce((s, r) => s + r.matchScore, 0) /
    Math.max(1, Math.min(3, run.rankedResults.length));

  let overallQuality: "High" | "Medium" | "Low" = "Low";
  if (evidence === "high" && coverage >= 0.6 && avgTop >= 80) {
    overallQuality = "High";
  } else if (coverage >= 0.4 && avgTop >= 70) {
    overallQuality = "Medium";
  }

  // Completeness / coverage confidence — distinct from any single product Match
  const overallConfidencePercent = Math.round(
    Math.min(
      96,
      coverage * 40 +
        (evidence === "high" ? 35 : evidence === "medium" ? 25 : 12) +
        (run.rankedResults.length > 0 ? 15 : 0) +
        Math.min(20, run.eligibleCount),
    ),
  );

  return { overallQuality, overallConfidencePercent };
}

export function getFinderResultsData(input: {
  finderSlug: string;
  responses: FinderResponses;
  region?: RegionCode;
  options?: PublishResolverOptions;
  debug?: boolean;
}): FinderResultsPageData | undefined {
  const region = input.region ?? DEFAULT_REGION;
  const definition = getFinderDefinition(input.finderSlug, region);
  if (!definition) return undefined;

  const ui = getFinderUiConfig(definition.slug);
  const category = getCategoryById(definition.categoryId, input.options);
  const products = getProductsByCategory(definition.categoryId, input.options);
  const recommendations = getRecommendations().filter((r) =>
    products.some((p) => p.id === r.productId),
  );

  const lowestByProduct: Record<
    string,
    { price: number; currency: string } | undefined
  > = {};
  for (const p of products) {
    lowestByProduct[p.id] = getLowestOfferPrice(p.id, region, input.options);
  }

  const run = runFinder({
    definition,
    responses: input.responses,
    products,
    recommendations,
    lowestByProduct,
    region,
  });

  const rows: FinderResultProductRow[] = [];
  for (const evaluation of run.rankedResults) {
    const product = getProductById(evaluation.productId, input.options);
    if (!product) continue;
    const brand = getBrandById(product.brandId, input.options);
    const review = getReviewByProduct(product.id, input.options);
    const offers = getOffersForProduct(product.id, region);
    const media = getPrimaryProductMedia(product);
    const alts = getAlternativesForProduct(product.id)
      .slice(0, 2)
      .map((a) => {
        const altProduct = getProductById(a.alternativeProductId, input.options);
        if (!altProduct) return null;
        return {
          product: altProduct,
          brand: getBrandById(altProduct.brandId, input.options),
          reason: a.reasons[0] ?? "Alternative",
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    rows.push({
      evaluation,
      product,
      brand,
      review,
      lowestPrice: lowestByProduct[product.id],
      offerCount: offers.length,
      rankLabel: rankLabel(evaluation.rank, evaluation.band),
      imageSrc: media?.src,
      imageAlt: media?.alt || product.fullName,
      summary:
        product.shortDescription?.trim() ||
        evaluation.strengths[0] ||
        `${brand?.name ?? ""} ${product.name}`.trim(),
      alternatives: alts,
    });
  }

  const topResults = rows.slice(0, 3);
  const otherResults = rows.slice(3, 7);

  let whyTopBeatSecond: FinderResultsPageData["whyTopBeatSecond"];
  if (rows.length >= 2) {
    const diff = explainRankDifference(
      rows[0].evaluation,
      rows[1].evaluation,
      rows[0].product.name,
      rows[1].product.name,
    );
    whyTopBeatSecond = {
      winnerName: `${rows[0].brand?.name ?? ""} ${rows[0].product.name}`.trim(),
      runnerUpName: `${rows[1].brand?.name ?? ""} ${rows[1].product.name}`.trim(),
      ...diff,
    };
  }

  const categorySlug = category?.slug;
  const topSlugs = topResults.map((r) => r.product.slug);
  const compareCount = topSlugs.length >= 2 ? topSlugs.length : 0;

  const summaryRows = (
    ui.summaryFields.length > 0
      ? ui.summaryFields
      : definition.questions.slice(0, 6).map((q) => ({
          key: q.key,
          label: q.title,
          icon: "Footprints",
        }))
  )
    .map((f) => {
      const value = formatResponseLabel(definition, f.key, input.responses);
      if (!value) return null;
      return { key: f.key, label: f.label, value, icon: f.icon };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  // Budget may be answered but not in default summary — append if present
  if (
    definition.budgetKey &&
    !summaryRows.some((r) => r.key === definition.budgetKey)
  ) {
    const value = formatResponseLabel(
      definition,
      definition.budgetKey,
      input.responses,
    );
    if (value) {
      summaryRows.push({
        key: definition.budgetKey,
        label: "Budget",
        value,
        icon: "Map",
      });
    }
  }

  const relatedGuides: FinderRelatedGuideCard[] = [];
  for (const g of ui.relatedGuideSlugs ?? []) {
    if (g.type === "buying") {
      const guide = getBuyingGuideBySlug(g.slug, input.options);
      if (!guide) continue;
      relatedGuides.push({
        title: guide.title,
        href: `/guides/${guide.slug}`,
        description:
          guide.shortDescription?.slice(0, 110) ??
          guide.quickAnswer?.slice(0, 110),
        imageSrc: g.imageSrc,
      });
    } else {
      const guide = getBestGuideBySlug(g.slug, input.options);
      if (!guide) continue;
      relatedGuides.push({
        title: guide.title,
        href: `/best/${guide.slug}`,
        description:
          guide.shortDescription?.slice(0, 110) ?? guide.intro?.slice(0, 110),
        imageSrc: g.imageSrc,
      });
    }
  }

  // Fallback: sport buying guides if none configured
  if (relatedGuides.length === 0) {
    // leave empty — UI hides panel
  }

  const { overallQuality, overallConfidencePercent } = overallQualityFromRun(
    run,
    topResults[0],
  );

  const steps = resolveFinderSteps(definition, input.responses, ui);
  const encodedPlaceholder = ""; // filled by page via editHref prop pattern
  void encodedPlaceholder;

  const headerHeroes = topResults
    .filter((r) => r.imageSrc)
    .slice(0, 3)
    .map((r) => ({
      id: r.product.id,
      src: r.imageSrc!,
      alt: r.imageAlt || r.product.fullName,
    }));

  return {
    definition,
    ui,
    run,
    rows,
    topResults,
    otherResults,
    compareTopHref:
      compareCount >= 2 && categorySlug
        ? buildCompareHref({
            categorySlug,
            productSlugs: topSlugs,
          })
        : undefined,
    compareCount,
    whyTopBeatSecond,
    region,
    debug: input.debug,
    categorySlug,
    productNoun: ui.productNoun ?? "products",
    candidateCount: run.analysedCount,
    overallQuality,
    overallConfidencePercent,
    summaryRows,
    relatedGuides,
    steps,
    editHref: `/tools/${definition.slug}`,
    restartHref: `/tools/${definition.slug}`,
    headerHeroes,
  };
}
