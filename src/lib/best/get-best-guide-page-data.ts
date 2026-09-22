import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION, REGION_META } from "@/domain/shared/types";
import {
  getBestGuideCategoryConfig,
  isGuideStale,
  type BestGuideCategoryConfig,
  type BestGuideBuyingHelpLink,
  type BestGuideTableColumn,
  type BestGuideTrustPillar,
} from "@/lib/best/category-config";
import {
  defaultUseCaseQuickPicksTitle,
  getUseCaseGuideConfig,
  isUseCaseGuide,
  resolveCriteriaChangePoints,
  type UseCaseCriteriaPoint,
} from "@/lib/best/use-case-config";
import { getAwardLabel } from "@/lib/best/awards";
import {
  resolveBestGuideImage,
  resolveBestGuideMethodologyImage,
} from "@/lib/best/resolve-best-guide-image";
import {
  buildGuideCandidateEvaluations,
  resolveGuideCoverage,
  type GuideCandidateEvaluation,
  type GuideCoverageStats,
} from "@/lib/best/guide-coverage";
import {
  resolveGuideContextConfig,
  type GuideContextConfig,
  type GuideContextComparisonColumn,
} from "@/lib/best/guide-context-config";
import { enrichGuideRecommendation } from "@/lib/best/enrich-guide-recommendation";
import { encodeFinderShareState } from "@/domain/finders/share-state";
import { getFinderDefinition } from "@/domain/finders/repository";
import type { FinderResponses } from "@/domain/finders/types";
import { mergeGuideFaqIds } from "@/lib/guides/guide-backfill-faqs";
import {
  ensureShoeDatabaseBuyingHelpLink,
  shouldLinkShoeDatabaseFromBestGuide,
  shouldLinkShoeDatabaseFromBuyingGuide,
  SHOE_DATABASE_DISCOVERY_LINK,
} from "@/lib/running-shoe-database/discovery";
import {
  CATEGORY_DEFAULT_BUYING_GUIDE_IDS,
  peerGuideIdsFor,
} from "@/content/link-graph-p47";
import {
  getLaunchEligibility,
  isIndexableEligibility,
  promotableReviewSlug,
} from "@/domain/launch";
import {
  getBestGuideBySlug,
  getBestGuides,
  getBuyingGuideBySlug,
  getBuyingGuides,
  getAuthorById,
  getProductById,
  getBrandById,
  getCategoryById,
  getSportById,
  getSportBySlug,
  getFaqsByIds,
  getEvidenceForIds,
  getRecommendationById,
  getReviewByProduct,
  getComparisonsForProduct,
  getComparisonById,
  getComparisons,
  getAlternativesForProduct,
  getOffersForProduct,
  getLowestOfferPrice,
  getRetailerById,
  getSpecificationDefinitions,
  getTools,
  getUseCaseById,
  getVariantsForProduct,
} from "@/repositories";
import {
  formatAudienceAvailability,
  getProductAudiences,
} from "@/lib/product/audience";
import type {
  BestGuide,
  BestGuideRecommendation,
  BuyingGuide,
  Author,
  FAQ,
  Comparison,
  ConsideredProductNote,
  ScoreBreakdownItem,
} from "@/domain/editorial/types";
import type { Product, Brand } from "@/domain/products/types";
import type { ProductCategory, Sport, UseCase } from "@/domain/sports/types";
import type { Evidence, Recommendation } from "@/domain/recommendations/types";
import type { Tool } from "@/domain/tools/types";
import type { OfferRow } from "@/lib/product/get-product-page-data";
import { isOfferStale, formatVerifiedDate } from "@/lib/product/score";
import type { Offer, Retailer } from "@/domain/commerce/types";
import { rankOffersForProduct } from "@/domain/commerce/ranking";
import type { SpecValue } from "@/domain/products/types";
import { compareProducts } from "@/lib/comparison/engine";
import { getRecommendationsForProduct } from "@/repositories/recommendations";
import { getPrimaryProductMedia } from "@/lib/product/media";
import type { MediaAsset } from "@/domain/shared/types";
import { formatPrice } from "@/lib/utils";
import { formatPublicSpecDisplayLabel, isInternalSchemaKey, publicSpecRowKey, toPublicSpecKeyList } from "@/lib/specs/public-label";
import {
  toPublicComparisonCriteria,
  toPublicEditorialGuide,
  toPublicProduct,
} from "@/lib/specs/public-payload";

function toPublicBestGuideConfig(
  config: BestGuideCategoryConfig,
): BestGuideCategoryConfig {
  return {
    ...config,
    comparisonKeys: toPublicSpecKeyList(config.comparisonKeys),
    tableColumns: config.tableColumns.map((col) =>
      col.specKey
        ? { ...col, specKey: publicSpecRowKey(col.specKey) }
        : col,
    ),
  };
}

function sortOffers(offers: Offer[]): Offer[] {
  const retailersById = new Map<string, Retailer>();
  for (const offer of offers) {
    const ret = getRetailerById(offer.retailerId);
    if (ret) retailersById.set(ret.id, ret);
  }
  return rankOffersForProduct(offers, retailersById);
}

function formatSpecValue(value: SpecValue | undefined): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return "—";
    return value
      .map((p) => {
        const s = String(p);
        if (s === "standard") return "Std";
        if (s === "wide") return "Wide";
        if (s === "extra-wide") return "X-Wide";
        if (s === "narrow") return "Narrow";
        return s
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
      })
      .join(", ");
  }
  if (typeof value === "object" && value !== null && "min" in value) {
    const r = value as { min: number; max: number };
    return `${r.min}–${r.max}`;
  }
  return String(value)
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export interface GuideSpecCell {
  key: string;
  label: string;
  unit?: string;
  values: Record<string, string>;
}

export interface GuideRecommendationBlock {
  entry: BestGuideRecommendation;
  awardLabel?: string;
  product: Product;
  brand?: Brand;
  reviewSlug?: string;
  /** Short review verdict/bottom line for guide detail rows */
  reviewExcerpt?: string;
  recommendation?: Recommendation;
  evidence: Evidence[];
  evidenceBadges: string[];
  keySpecs: { label: string; value: string }[];
  offers: OfferRow[];
  lowestPrice?: { price: number; currency: string };
  comparisons: Comparison[];
  considerInstead: { product: Product; brand?: Brand; reason?: string }[];
  /** Guide-context “why this pick” prose (whyRecommended / explanation / rationale) */
  whyText: string;
  strengths: string[];
  compromises: string[];
  /** Authentic primary product media when available */
  media?: MediaAsset;
  /** Use-case names (or short summary) for Best for columns */
  bestForLabels: string[];
  /** Men / Women / Unisex availability badge when known */
  audienceAvailability?: string;
}

export interface GuideTableProductRow {
  rec: GuideRecommendationBlock;
  image?: MediaAsset;
  bestForLabels: string[];
  cells: Record<string, string>;
  scoreDisplay?: string;
  priceDisplay?: string;
}

export interface BestGuidePageData {
  guide: BestGuide;
  author?: Author;
  sport?: Sport;
  category?: ProductCategory;
  config: BestGuideCategoryConfig;
  recommendations: GuideRecommendationBlock[];
  comparisonRows: GuideSpecCell[];
  comparisonProducts: { product: Product; brand?: Brand }[];
  relatedGuides: BestGuide[];
  relatedComparisons: Comparison[];
  buyingGuides: BuyingGuide[];
  tools: Tool[];
  faqs: FAQ[];
  considered: {
    note: ConsideredProductNote;
    product?: Product;
    brand?: Brand;
  }[];
  /** Structured considered / shortlisted / recommended coverage */
  coverage: GuideCoverageStats;
  /** Evaluation rows for Products Considered section */
  candidateEvaluations: GuideCandidateEvaluation[];
  evidence: Evidence[];
  regionLabel: string;
  compareHref: string;
  categoryHref: string;
  finderHref?: string;
  stale: boolean;
  updatedLabel: string;
  breadcrumbs: { label: string; href?: string }[];
  heroImageSrc?: string;
  methodologyImageSrc?: string;
  quickPicks: GuideRecommendationBlock[];
  tableProductRows: GuideTableProductRow[];
  resolvedTrustPillars: BestGuideTrustPillar[];
  nextReviewLabel?: string;
  methodologyBullets: string[];
  buyingHelpLinks: BestGuideBuyingHelpLink[];
  finderThumbnails: string[];
  /** Use-case recommendation layout (criteria panel hero) */
  isUseCaseGuide: boolean;
  primaryUseCase?: UseCase;
  criteriaChangePoints: UseCaseCriteriaPoint[];
  quickPicksTitle: string;
  comparisonTitle: string;
  comparisonFootnote?: string;
  /** Resolved use-case factor / comparison config */
  contextConfig: GuideContextConfig;
  /** Guide-specific decision comparison (before raw specs) */
  contextComparisonRows: {
    key: string;
    label: string;
    values: Record<string, string>;
  }[];
  methodologyCardTitle: string;
  buyingHelpTitle: string;
  tableColumns: BestGuideTableColumn[];
}

/** Display score on /10 scale to one decimal. */
export function formatGuideScore(score0to100: number): string {
  return (score0to100 / 10).toFixed(1);
}

const DEFAULT_METHODOLOGY_BULLETS = [
  "Independent research",
  "Manufacturer specifications",
  "Independent coverage where available",
  "Current product & price monitoring",
];

function splitMethodologyBullets(...texts: (string | undefined)[]): string[] {
  const joined = texts.filter(Boolean).join(" ");
  if (!joined.trim()) return [...DEFAULT_METHODOLOGY_BULLETS];

  const parts = joined
    .split(/(?<=[.!;])\s+|;\s+|\n+/)
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter((s) => s.length > 12 && s.length < 120)
    .filter(
      (s) =>
        !/first-hand testing of all/i.test(s) &&
        !/tested hundreds/i.test(s) &&
        !/we test all/i.test(s),
    );

  if (parts.length >= 2) return parts.slice(0, 5);
  return [...DEFAULT_METHODOLOGY_BULLETS];
}

function resolveBestForLabels(entry: BestGuideRecommendation): string[] {
  if (entry.bestForProfiles?.length) {
    return entry.bestForProfiles.slice(0, 3);
  }
  const fromUseCases = (entry.useCaseIds ?? [])
    .map((id) => getUseCaseById(id)?.name)
    .filter((n): n is string => Boolean(n))
    .slice(0, 2);
  if (fromUseCases.length > 0) return fromUseCases;
  if (entry.summary) {
    const short =
      entry.summary.length > 48
        ? `${entry.summary.slice(0, 45).trim()}…`
        : entry.summary;
    return [short];
  }
  return [];
}

function contextCellFromSource(
  source: GuideContextComparisonColumn["source"],
  rec: GuideRecommendationBlock,
): string {
  const entry = rec.entry;
  const specs = rec.product.specifications as Record<string, unknown>;

  switch (source) {
    case "decisionRole":
      return entry.decisionRole ?? entry.summary ?? "—";
    case "paceCharacter":
      return entry.paceCharacter ?? "—";
    case "bestForProfiles":
      return entry.bestForProfiles?.[0] ?? rec.bestForLabels[0] ?? "—";
    case "tradeoffs":
    case "keyTradeoff": {
      const fromEntry =
        entry.tradeoffs?.[0]?.trim() ||
        entry.compromises?.[0]?.trim() ||
        rec.compromises[0]?.trim();
      if (fromEntry) return fromEntry;
      const weakness = rec.product.weaknesses?.[0]?.trim();
      if (weakness) {
        // Turn short catalog weaknesses into a readable trade-off line
        return weakness.length >= 28
          ? weakness
          : `${weakness} — another pick may suit that need better`;
      }
      if (entry.summary) {
        return "Less specialized than other picks on this list";
      }
      return "—";
    }
    case "summary":
      return entry.summary ?? "—";
    case "cushionFeel": {
      const cushion =
        specs.cushionFeel ?? specs.cushionLevel ?? specs.cushioningLevel ?? specs.cushioning;
      if (typeof cushion === "string") {
        return formatSpecValue(cushion as SpecValue);
      }
      return entry.decisionRole?.toLowerCase().includes("max")
        ? "Max / plush"
        : entry.decisionRole?.toLowerCase().includes("soft")
          ? "Soft"
          : "—";
    }
    case "stabilityFeel": {
      if (entry.decisionRole?.toLowerCase().includes("stability")) {
        return "Guided / support";
      }
      const stab = specs.stability ?? specs.stabilityType;
      if (typeof stab === "string") {
        return formatSpecValue(stab as SpecValue);
      }
      return "Neutral";
    }
    case "rideCharacter": {
      const ride = specs.rideCharacter;
      if (typeof ride === "string") return ride;
      return entry.paceCharacter ?? "—";
    }
    case "weight": {
      const w = specs.weight;
      if (typeof w === "number") return `${w} g`;
      if (typeof w === "string") return w;
      return "—";
    }
    default:
      return "—";
  }
}

function buildContextComparisonRows(
  config: GuideContextConfig,
  recommendations: GuideRecommendationBlock[],
): BestGuidePageData["contextComparisonRows"] {
  return config.comparisonColumns.map((col) => {
    const values: Record<string, string> = {};
    for (const rec of recommendations) {
      values[rec.product.id] = contextCellFromSource(col.source, rec);
    }
    return { key: col.key, label: col.label, values };
  });
}

function lookupBreakdownScore(
  column: BestGuideTableColumn,
  reviewBreakdown: ScoreBreakdownItem[] | undefined,
  recommendation: Recommendation | undefined,
): number | undefined {
  const keys = [
    column.breakdownKey,
    ...(column.factorKeys ?? []),
    column.key,
  ].filter((k): k is string => Boolean(k));

  if (reviewBreakdown?.length) {
    for (const key of keys) {
      const hit = reviewBreakdown.find(
        (b) => b.key === key || b.key.replace(/-/g, "") === key.replace(/-/g, ""),
      );
      if (hit) return hit.score;
    }
  }

  if (recommendation?.factors?.length) {
    for (const key of keys) {
      const hit = recommendation.factors.find((f) => f.key === key);
      if (hit) return hit.score;
    }
  }

  return undefined;
}

function formatSpecCell(
  raw: SpecValue | undefined,
  unit?: string,
): string {
  const formatted = formatSpecValue(raw);
  if (formatted === "—") return "—";
  if (unit && typeof raw === "number") return `${formatted}${unit}`;
  return formatted;
}

function buyingHelpLinkExists(href: string): boolean {
  if (href.startsWith("/guides/")) {
    const slug = href.replace(/^\/guides\//, "").split(/[?#]/)[0];
    return Boolean(getBuyingGuideBySlug(slug));
  }
  if (href.startsWith("/best/")) {
    const slug = href.replace(/^\/best\//, "").split(/[?#]/)[0];
    return Boolean(getBestGuideBySlug(slug));
  }
  if (href.startsWith("/tools/")) {
    const slug = href.replace(/^\/tools\//, "").split(/[?#]/)[0];
    return Boolean(getTools().find((t) => t.slug === slug));
  }
  // Category / listing paths — keep as configured
  return true;
}

function buildTableProductRow(
  rec: GuideRecommendationBlock,
  columns: BestGuideTableColumn[],
  defByKey: Map<string, { key: string; label: string; unit?: string }>,
): GuideTableProductRow {
  const review = getReviewByProduct(rec.product.id);
  const bestForLabels = rec.bestForLabels;
  const cells: Record<string, string> = {};

  let scoreDisplay: string | undefined;
  if (rec.product.recommendationScore !== undefined) {
    scoreDisplay = formatGuideScore(rec.product.recommendationScore);
  }

  let priceDisplay: string | undefined;
  if (rec.lowestPrice) {
    priceDisplay = `From ${formatPrice(rec.lowestPrice.price, rec.lowestPrice.currency)}`;
  }

  for (const col of columns) {
    switch (col.source) {
      case "bestFor": {
        cells[col.key] =
          bestForLabels.length > 0
            ? bestForLabels.join(", ")
            : "—";
        break;
      }
      case "breakdown": {
        const score = lookupBreakdownScore(
          col,
          review?.scoreBreakdown,
          rec.recommendation,
        );
        // Scores only — never fall back to enum specs (High/Neutral), which
        // mixed numeric and text values in the same column.
        cells[col.key] =
          score !== undefined ? formatGuideScore(score) : "—";
        break;
      }
      case "spec": {
        const specKey = col.specKey ?? col.key;
        const def = defByKey.get(specKey);
        cells[col.key] = formatSpecCell(
          rec.product.specifications[specKey] as SpecValue | undefined,
          def?.unit,
        );
        break;
      }
      case "score": {
        cells[col.key] = scoreDisplay ?? "—";
        break;
      }
      case "price": {
        cells[col.key] = priceDisplay
          ? priceDisplay.replace(/^From\s+/i, "")
          : "—";
        break;
      }
      default:
        cells[col.key] = "—";
    }
  }

  return {
    rec,
    image: rec.media,
    bestForLabels,
    cells,
    scoreDisplay,
    priceDisplay,
  };
}

export function getBestGuidePageData(
  slug: string,
  options?: PublishResolverOptions & { region?: RegionCode },
): BestGuidePageData | undefined {
  const region = options?.region ?? DEFAULT_REGION;
  const guide = getBestGuideBySlug(slug, options);
  if (!guide) return undefined;

  const author = guide.authorId ? getAuthorById(guide.authorId) : undefined;
  const sport = getSportById(guide.sportId);
  const category = getCategoryById(guide.categoryId);
  const config = getBestGuideCategoryConfig(guide.categoryId);
  const useCaseConfig = getUseCaseGuideConfig(guide);
  const useCaseLayout = isUseCaseGuide(guide);
  const primaryUseCase = guide.useCaseIds
    .map((id) => getUseCaseById(id))
    .find((u): u is UseCase => Boolean(u));
  const defs = getSpecificationDefinitions(guide.categoryId);
  const defByKey = new Map(defs.map((d) => [d.key, d]));
  const tableColumns =
    useCaseConfig?.tableColumns ?? config.tableColumns;

  const sortedRecs = [...guide.recommendations].sort((a, b) => a.rank - b.rank);

  const recommendations: GuideRecommendationBlock[] = [];
  for (const entry of sortedRecs) {
    const product = getProductById(entry.productId, options);
    if (!product) continue; // unpublished — skip; validator flags

    const brand = getBrandById(product.brandId, options);
    const review = getReviewByProduct(product.id, options);
    const recommendation = entry.recommendationId
      ? getRecommendationById(entry.recommendationId)
      : undefined;

    const evidenceIds = [
      ...(entry.evidenceIds ?? []),
      ...(recommendation?.evidenceIds ?? []),
    ];
    const evidence = getEvidenceForIds([...new Set(evidenceIds)]);
    const evidenceBadges: string[] = [];
    if (evidence.some((e) => e.type === "personal-test"))
      evidenceBadges.push("Personally Tested");
    if (evidence.some((e) => e.type === "lab-test"))
      evidenceBadges.push("Independent Lab Data");
    if (evidence.some((e) => e.type === "manufacturer"))
      evidenceBadges.push("Manufacturer Specs Verified");
    if (
      evidence.some(
        (e) =>
          e.type === "editorial-research" ||
          e.type === "independent-review" ||
          e.type === "user-feedback",
      )
    ) {
      evidenceBadges.push("Expert Research");
    }

    const keySpecs = config.comparisonKeys
      .map((key) => {
        const raw = product.specifications[key];
        if (raw === null || raw === undefined) return undefined;
        const def = defByKey.get(key);
        const formatted = formatSpecValue(raw as SpecValue);
        if (formatted === "—") return undefined;
        return {
          label: formatPublicSpecDisplayLabel(key),
          value: def?.unit && typeof raw === "number" ? `${formatted} ${def.unit}` : formatted,
        };
      })
      .filter((s): s is { label: string; value: string } => Boolean(s));

    const regional = sortOffers(
      getOffersForProduct(product.id).filter((o) => o.region === region),
    );
    const offers: OfferRow[] = regional.map((offer) => ({
      offer,
      retailer: getRetailerById(offer.retailerId),
      stale: isOfferStale(offer.lastChecked),
    }));
    const lowestPrice = getLowestOfferPrice(product.id, region, options);

    const comparisons = getComparisonsForProduct(product.id, options).slice(0, 2);

    const considerInstead = (entry.considerInsteadProductIds ?? [])
      .map((id) => {
        const p = getProductById(id, options);
        if (!p) return undefined;
        const alt = getAlternativesForProduct(product.id).find(
          (a) => a.alternativeProductId === id,
        );
        return {
          product: p,
          brand: getBrandById(p.brandId, options),
          reason: alt?.reasons[0],
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    const factorStrengths = (recommendation?.factors ?? [])
      .filter((f) => f.explanation && f.score >= 70)
      .sort((a, b) => b.score - a.score)
      .map((f) => f.explanation!)
      .slice(0, 3);

    const strengths =
      entry.strengths?.length
        ? entry.strengths
        : (recommendation?.strengths?.length
            ? recommendation.strengths
            : factorStrengths
          ).slice(0, 4);
    const compromises =
      entry.compromises?.length
        ? entry.compromises
        : (recommendation?.compromises ?? []).slice(0, 4);

    const whyText =
      entry.whyRecommended?.trim() ||
      recommendation?.explanation?.trim() ||
      entry.rationale;

    const reviewExcerpt =
      review?.verdict?.trim() ||
      review?.bottomLine?.trim() ||
      undefined;

    const audienceAvailability = formatAudienceAvailability(
      getProductAudiences(product, getVariantsForProduct(product.id)),
    );

    recommendations.push({
      entry,
      awardLabel: getAwardLabel(entry.awardType, entry.badge),
      product,
      brand,
      reviewSlug: promotableReviewSlug(review, options),
      reviewExcerpt,
      recommendation,
      evidence,
      evidenceBadges: [...new Set(evidenceBadges)],
      keySpecs,
      offers,
      lowestPrice,
      comparisons,
      considerInstead,
      whyText,
      strengths,
      compromises,
      media: getPrimaryProductMedia(product),
      bestForLabels: resolveBestForLabels(entry),
      audienceAvailability,
    });
  }

  // Upgrade thin / clinical guide copy so every pick explains why it fits
  for (let i = 0; i < recommendations.length; i++) {
    const block = recommendations[i]!;
    const peers = recommendations
      .filter((_, j) => j !== i)
      .map((r) => ({ product: r.product, entry: r.entry }));
    const review = getReviewByProduct(block.product.id, options);
    const enrichedEntry = enrichGuideRecommendation({
      guide,
      entry: block.entry,
      product: block.product,
      brand: block.brand,
      review,
      peers,
      isTopPick: i === 0,
    });
    const strengths = enrichedEntry.useCaseStrengths?.length
      ? enrichedEntry.useCaseStrengths
      : block.strengths;
    const compromises = enrichedEntry.tradeoffs?.length
      ? enrichedEntry.tradeoffs
      : block.compromises;
    const whyText = enrichedEntry.whyRecommended?.trim() || block.whyText;
    recommendations[i] = {
      ...block,
      entry: {
        ...enrichedEntry,
        // Keep legacy compromises aligned for comparison + older UI
        compromises:
          enrichedEntry.compromises?.length
            ? enrichedEntry.compromises
            : compromises,
      },
      whyText,
      strengths,
      compromises,
      bestForLabels: resolveBestForLabels(enrichedEntry),
    };
  }

  // Comparison table — reuse shared comparison engine
  const comparisonProducts = (guide.comparisonProductIds.length
    ? guide.comparisonProductIds
    : recommendations.map((r) => r.product.id)
  )
    .map((id) => {
      const product = getProductById(id, options);
      if (!product) return undefined;
      return { product, brand: getBrandById(product.brandId, options) };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const engineDiff =
    comparisonProducts.length >= 2
      ? compareProducts({
          products: comparisonProducts.map((c) => c.product),
          defs: [...defByKey.values()],
          recommendations: comparisonProducts.flatMap((c) =>
            getRecommendationsForProduct(c.product.id),
          ),
          useCaseLabels: {},
          lowestByProduct: {},
          categoryId: guide.categoryId,
        })
      : undefined;

  let comparisonRows: GuideSpecCell[];
  if (engineDiff) {
    const preferredKeys = new Set(config.comparisonKeys);
    const rows = [
      ...engineDiff.importantDifferences.filter(
        (r) => preferredKeys.size === 0 || preferredKeys.has(r.key),
      ),
      ...engineDiff.allSpecs.filter(
        (r) =>
          preferredKeys.has(r.key) &&
          !engineDiff.importantDifferences.some((d) => d.key === r.key),
      ),
    ];
    // Fall back to config keys order if filter emptied
    const finalRows =
      rows.length > 0
        ? rows
        : config.comparisonKeys
            .map((key) => engineDiff.allSpecs.find((r) => r.key === key))
            .filter((r): r is NonNullable<typeof r> => Boolean(r));
    comparisonRows = finalRows.map((row) => ({
      key: publicSpecRowKey(row.key),
      label: row.label,
      unit: row.unit,
      values: row.valuesByProduct,
    }));
  } else {
    comparisonRows = config.comparisonKeys.map((key) => {
      const def = defByKey.get(key);
      const values: Record<string, string> = {};
      for (const { product } of comparisonProducts) {
        values[product.id] = formatSpecValue(
          product.specifications[key] as SpecValue | undefined,
        );
      }
      return {
        key: publicSpecRowKey(key),
        label: formatPublicSpecDisplayLabel(key),
        unit: def?.unit,
        values,
      };
    });
  }

  const relatedGuides = (guide.relatedGuideIds ?? [])
    .map((id) => getBestGuides(options).find((g) => g.id === id))
    .filter((g): g is BestGuide => Boolean(g));

  // Same-category fallbacks if no related ids
  if (relatedGuides.length === 0) {
    for (const g of getBestGuides(options)) {
      if (g.id === guide.id) continue;
      if (g.categoryId === guide.categoryId) relatedGuides.push(g);
      if (relatedGuides.length >= 4) break;
    }
  }

  const relatedComparisons = (() => {
    const byId = new Map<string, Comparison>();
    for (const id of guide.relatedComparisonIds ?? []) {
      const c = getComparisonById(id, options);
      if (c) byId.set(c.id, c);
    }
    if (byId.size === 0) {
      for (const c of getComparisons(options)) {
        if (c.categoryId === guide.categoryId) byId.set(c.id, c);
        if (byId.size >= 3) break;
      }
    }
    return [...byId.values()];
  })();

  const buyingGuides = (() => {
    const byId = new Map<string, BuyingGuide>();
    for (const id of guide.relatedBuyingGuideIds ?? []) {
      const g = getBuyingGuides(options).find((x) => x.id === id);
      if (g) byId.set(g.id, g);
    }
    if (byId.size === 0) {
      for (const id of CATEGORY_DEFAULT_BUYING_GUIDE_IDS[guide.categoryId] ?? []) {
        const g = getBuyingGuides(options).find((x) => x.id === id);
        if (g) byId.set(g.id, g);
      }
    }
    if (byId.size === 0) {
      for (const g of getBuyingGuides(options)) {
        if (g.categoryId === guide.categoryId) byId.set(g.id, g);
        if (byId.size >= 2) break;
      }
    }
    return [...byId.values()].slice(0, 3);
  })();

  const toolSlugs = [
    ...new Set(
      [
        ...(guide.relatedToolSlugs ?? []),
        config.relatedToolSlug,
      ].filter((s): s is string => Boolean(s)),
    ),
  ];
  const tools = toolSlugs
    .map((slug) => getTools(options).find((t) => t.slug === slug))
    .filter((t): t is Tool => Boolean(t));

  const faqs = getFaqsByIds(guide.faqIds);
  const evidence = getEvidenceForIds(guide.evidenceIds ?? []);

  const considered = (guide.consideredProducts ?? []).map((note) => {
    const product = getProductById(note.productId, options);
    return {
      note,
      product,
      brand: product ? getBrandById(product.brandId, options) : undefined,
    };
  });

  const coverage = resolveGuideCoverage(guide, options);
  const candidateEvaluations = coverage.hasAuthenticConsideredSet
    ? buildGuideCandidateEvaluations(guide, options)
    : [];

  const productSlugs = recommendations
    .map((r) => r.product.slug)
    .slice(0, Math.min(recommendations.length, 8));
  const compareHref = `/compare?category=${category?.slug ?? "running-shoes"}&products=${productSlugs.join(",")}`;
  const categoryHref =
    config.categoryBrowseHref ??
    (sport && category
      ? `/${sport.slug}/${category.pathSegment}`
      : `/gear/${category?.slug ?? ""}`);
  const finder = tools.find((t) => t.slug === (config.relatedToolSlug ?? ""));
  let finderHref = finder ? `/tools/${finder.slug}` : undefined;
  if (finderHref && useCaseConfig?.finderPrefill && config.relatedToolSlug) {
    const definition = getFinderDefinition(config.relatedToolSlug);
    if (definition) {
      const responses: FinderResponses = {};
      for (const [key, value] of Object.entries(useCaseConfig.finderPrefill)) {
        // Never encode body weight from guide handoff
        if (key === "weight") continue;
        responses[key] = value;
      }
      if (Object.keys(responses).length > 0) {
        const encoded = encodeFinderShareState(definition, responses);
        finderHref = `/tools/${finder!.slug}?s=${encoded}&edit=1`;
      }
    }
  }

  const quickPickLimit = useCaseLayout
    ? Math.min(config.quickPickLimit, 5)
    : config.quickPickLimit;
  const quickPicks = recommendations
    .filter((r) => Boolean(getPrimaryProductMedia(r.product)))
    .slice(0, quickPickLimit);

  const tableProductRows = recommendations.map((rec) =>
    buildTableProductRow(rec, tableColumns, defByKey),
  );

  // Trust count: ONLY authentic considered sets — never recommendations.length
  const resolvedTrustPillars = config.trustPillars.map((p) => {
    if (!p.description.includes("{count}")) {
      return { ...p };
    }
    if (!coverage.hasAuthenticConsideredSet) {
      return {
        ...p,
        description: "Catalog-backed evaluation",
      };
    }
    return {
      ...p,
      description: p.description.replace(
        /\{count\}/g,
        String(coverage.consideredCount),
      ),
    };
  });

  const nextReviewLabel = guide.nextReviewAt
    ? formatVerifiedDate(guide.nextReviewAt)
    : undefined;

  const methodologyBullets = splitMethodologyBullets(
    guide.methodologySummary,
    guide.selectionMethodology,
  );

  let buyingHelpLinks: BestGuideBuyingHelpLink[] = (
    useCaseConfig?.buyingHelpLinks ?? config.buyingHelpLinks
  ).filter((link) => buyingHelpLinkExists(link.href));
  if (buyingHelpLinks.length === 0 && guide.howToChooseSections?.length) {
    buyingHelpLinks = guide.howToChooseSections.map((s) => ({
      label: s.heading,
      href: `#how-to-choose-${s.id}`,
    }));
  }
  if (buyingHelpLinks.length === 0 && config.buyingHelpLinks.length > 0) {
    buyingHelpLinks = config.buyingHelpLinks;
  }
  if (shouldLinkShoeDatabaseFromBestGuide(guide.categoryId)) {
    buyingHelpLinks = ensureShoeDatabaseBuyingHelpLink(buyingHelpLinks);
  }

  const finderThumbnails = quickPicks
    .map((r) => r.media?.src)
    .filter((src): src is string => Boolean(src))
    .slice(0, 4);

  const criteriaChangePoints = useCaseLayout
    ? resolveCriteriaChangePoints(guide)
    : [];

  const productNoun = config.productNoun ?? category?.name ?? "Products";
  const quickPicksTitle =
    useCaseConfig?.quickPicksTitle ??
    (useCaseLayout
      ? defaultUseCaseQuickPicksTitle(primaryUseCase?.name, productNoun)
      : "Quick Picks");
  const comparisonTitle =
    useCaseConfig?.comparisonTitle ??
    (useCaseLayout ? "How they compare" : `Top ${productNoun} Compared`);

  const contextConfig = resolveGuideContextConfig({
    useCaseIds: guide.useCaseIds,
    slug: guide.slug,
  });
  const contextComparisonRows = buildContextComparisonRows(
    contextConfig,
    recommendations,
  );
  const comparisonFootnote = useCaseConfig?.comparisonFootnote;
  const methodologyCardTitle =
    useCaseConfig?.methodologyTitle ?? "How we research & score";
  const buyingHelpTitle =
    useCaseConfig?.buyingHelpTitle ?? "How to choose";

  const breadcrumbs = useCaseLayout
    ? [
        { label: "Home", href: "/" },
        ...(sport ? [{ label: sport.name, href: `/${sport.slug}` }] : []),
        ...(category
          ? [
              {
                label: category.name,
                href:
                  sport && category.pathSegment
                    ? `/${sport.slug}/${category.pathSegment}`
                    : categoryHref,
              },
            ]
          : []),
        { label: guide.title },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Best", href: "/best" },
        ...(category
          ? [{ label: category.name, href: `/best?category=${category.slug}` }]
          : []),
        { label: guide.title },
      ];

  const publicRecommendations = recommendations.map((block) => ({
    ...block,
    product: toPublicProduct(block.product),
    comparisons: block.comparisons.map(toPublicComparisonCriteria),
    considerInstead: block.considerInstead.map((c) => ({
      ...c,
      product: toPublicProduct(c.product),
    })),
  }));

  return {
    guide: toPublicEditorialGuide(guide),
    author,
    sport,
    category,
    config: toPublicBestGuideConfig(config),
    recommendations: publicRecommendations,
    comparisonRows,
    comparisonProducts: comparisonProducts.map((c) => ({
      ...c,
      product: toPublicProduct(c.product),
    })),
    relatedGuides: relatedGuides.map(toPublicEditorialGuide),
    relatedComparisons: relatedComparisons.map(toPublicComparisonCriteria),
    buyingGuides: buyingGuides.map(toPublicEditorialGuide),
    tools,
    faqs,
    considered: considered.map((c) =>
      c.product
        ? { ...c, product: toPublicProduct(c.product) }
        : c,
    ),
    coverage,
    candidateEvaluations: candidateEvaluations.map((ev) => ({
      ...ev,
      product: ev.product ? toPublicProduct(ev.product) : ev.product,
    })),
    evidence,
    regionLabel: REGION_META[region].label,
    compareHref,
    categoryHref,
    finderHref,
    stale: isGuideStale(guide.lastVerifiedAt),
    updatedLabel: guide.updatedAt
      ? formatVerifiedDate(guide.updatedAt)
      : "",
    breadcrumbs,
    heroImageSrc: resolveBestGuideImage(guide).src,
    methodologyImageSrc: resolveBestGuideMethodologyImage(guide),
    quickPicks: publicRecommendations
      .filter((r) => Boolean(getPrimaryProductMedia(r.product)))
      .slice(0, quickPickLimit),
    tableProductRows: tableProductRows.map((row) => ({
      ...row,
      rec: {
        ...row.rec,
        product: toPublicProduct(row.rec.product),
        comparisons: row.rec.comparisons.map(toPublicComparisonCriteria),
        considerInstead: row.rec.considerInstead.map((c) => ({
          ...c,
          product: toPublicProduct(c.product),
        })),
      },
    })),
    resolvedTrustPillars,
    nextReviewLabel,
    methodologyBullets,
    buyingHelpLinks,
    finderThumbnails,
    isUseCaseGuide: useCaseLayout,
    primaryUseCase,
    criteriaChangePoints,
    quickPicksTitle,
    comparisonTitle,
    comparisonFootnote,
    contextConfig: {
      ...contextConfig,
      comparisonColumns: contextConfig.comparisonColumns.map((col) => ({
        ...col,
        source: (isInternalSchemaKey(col.source)
          ? publicSpecRowKey(col.source)
          : col.source) as typeof col.source,
      })),
    },
    contextComparisonRows,
    methodologyCardTitle,
    buyingHelpTitle,
    tableColumns: tableColumns.map((col) =>
      col.specKey ? { ...col, specKey: publicSpecRowKey(col.specKey) } : col,
    ),
  };
}

export interface BuyingGuidePageData {
  guide: BuyingGuide;
  author?: Author;
  sport?: Sport;
  category?: ProductCategory;
  relatedProducts: { product: Product; brand?: Brand }[];
  relatedComparisons: Comparison[];
  relatedPeerGuides: BuyingGuide[];
  useCases: UseCase[];
  bestGuides: BestGuide[];
  tools: Tool[];
  faqs: FAQ[];
  breadcrumbs: { label: string; href?: string }[];
  /** Contextual Running Shoe Database CTA — shoe guides only */
  shoeDatabaseLink?: {
    label: string;
    href: string;
    description: string;
  };
}

export function getBuyingGuidePageData(
  slug: string,
  options?: PublishResolverOptions,
): BuyingGuidePageData | undefined {
  const guide = getBuyingGuideBySlug(slug, options);
  if (!guide) return undefined;

  const author = guide.authorId ? getAuthorById(guide.authorId) : undefined;
  const sport = getSportById(guide.sportId);
  const category = guide.categoryId
    ? getCategoryById(guide.categoryId)
    : undefined;

  const relatedProducts = guide.relatedProductIds
    .map((id) => {
      const product = getProductById(id, options);
      if (!product) return undefined;
      return { product: toPublicProduct(product), brand: getBrandById(product.brandId, options) };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const relatedComparisons = (() => {
    const byId = new Map<string, Comparison>();
    for (const id of guide.relatedComparisonIds ?? []) {
      const c = getComparisonById(id, options);
      if (c) byId.set(c.id, c);
    }
    if (byId.size === 0 && guide.categoryId) {
      for (const c of getComparisons(options)) {
        if (c.categoryId === guide.categoryId) byId.set(c.id, c);
        if (byId.size >= 3) break;
      }
    }
    return [...byId.values()];
  })();

  const relatedPeerGuides = (() => {
    const byId = new Map<string, BuyingGuide>();
    const explicit = [
      ...new Set([
        ...(guide.relatedGuideIds ?? []),
        ...peerGuideIdsFor(guide.id),
      ]),
    ];
    for (const id of explicit) {
      const g = getBuyingGuides(options).find((x) => x.id === id);
      if (g && g.id !== guide.id) byId.set(g.id, g);
    }
    if (byId.size === 0 && guide.categoryId) {
      for (const g of getBuyingGuides(options)) {
        if (g.id === guide.id) continue;
        if (g.categoryId === guide.categoryId) byId.set(g.id, g);
        if (byId.size >= 3) break;
      }
    }
    return [...byId.values()].slice(0, 4);
  })();

  const useCases = guide.relatedUseCaseIds
    .map((id) => getUseCaseById(id))
    .filter((u): u is UseCase => Boolean(u));

  const bestGuides = (() => {
    const byId = new Map<string, BestGuide>();
    for (const id of guide.relatedBestGuideIds ?? []) {
      const g = getBestGuides(options).find((x) => x.id === id);
      if (g) byId.set(g.id, g);
    }
    if (byId.size === 0 && guide.categoryId) {
      for (const g of getBestGuides(options)) {
        if (g.categoryId === guide.categoryId) byId.set(g.id, g);
        if (byId.size >= 3) break;
      }
    }
    return [...byId.values()].slice(0, 3);
  })();

  const tools = (() => {
    const bySlug = new Map<string, Tool>();
    for (const s of guide.relatedToolSlugs ?? []) {
      const t = getTools(options).find((x) => x.slug === s);
      if (t) bySlug.set(t.slug, t);
    }
    if (bySlug.size === 0 && guide.categoryId) {
      const cfg = getBestGuideCategoryConfig(guide.categoryId);
      if (cfg.relatedToolSlug) {
        const t = getTools(options).find((x) => x.slug === cfg.relatedToolSlug);
        if (t) bySlug.set(t.slug, t);
      }
    }
    return [...bySlug.values()];
  })();

  return {
    guide: toPublicEditorialGuide(guide),
    author,
    sport,
    category,
    relatedProducts,
    relatedComparisons: relatedComparisons.map(toPublicComparisonCriteria),
    relatedPeerGuides: relatedPeerGuides.map(toPublicEditorialGuide),
    useCases,
    bestGuides: bestGuides.map(toPublicEditorialGuide),
    tools,
    faqs: getFaqsByIds(mergeGuideFaqIds(guide.faqIds, guide.slug)),
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Guides", href: "/guides" },
      { label: guide.title },
    ],
    shoeDatabaseLink: shouldLinkShoeDatabaseFromBuyingGuide({
      slug: guide.slug,
      categoryId: guide.categoryId,
    })
      ? SHOE_DATABASE_DISCOVERY_LINK
      : undefined,
  };
}

export function getBestIndexData(
  options?: PublishResolverOptions & {
    sportSlug?: string;
    /** Shoes domain hub — running + training shoe guides only */
    domain?: "shoes";
  },
) {
  let guides = getBestGuides(options);
  guides = guides.filter((g) =>
    isIndexableEligibility(
      getLaunchEligibility({ kind: "best-guide", entity: g }, options),
    ),
  );
  if (options?.domain === "shoes") {
    const shoeCategories = new Set([
      "cat-running-shoes",
      "cat-training-shoes",
    ]);
    guides = guides.filter((g) => shoeCategories.has(g.categoryId));
  } else if (options?.sportSlug) {
    const sport = getSportBySlug(options.sportSlug, options);
    if (sport) {
      guides = guides.filter((g) => g.sportId === sport.id);
    }
  }
  const bySport = new Map<
    string,
    { sport?: Sport; guides: BestGuide[] }
  >();

  for (const guide of guides) {
    const key = guide.sportId;
    if (!bySport.has(key)) {
      bySport.set(key, { sport: getSportById(key), guides: [] });
    }
    bySport.get(key)!.guides.push(guide);
  }

  return {
    guides,
    bySport: [...bySport.values()],
  };
}

/** Alias for use-case recommendation page data (same BestGuide resolver). */
export function getUseCaseRecommendationPageData(
  options: PublishResolverOptions & { guideSlug: string; region?: RegionCode },
): BestGuidePageData | undefined {
  return getBestGuidePageData(options.guideSlug, options);
}
