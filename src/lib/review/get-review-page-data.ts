import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION, REGION_META } from "@/domain/shared/types";
import type { ReviewType } from "@/domain/editorial/types";
import {
  getLaunchEligibility,
  shouldPromotePublicly,
} from "@/domain/launch";
import {
  getReviewPageCategoryConfig,
  type ReviewPageCategoryConfig,
} from "@/lib/review/category-config";
import {
  REVIEW_TYPE_META,
  PRODUCT_SOURCE_LABELS,
} from "@/lib/review/review-meta";
import {
  resolveVisibleReviewType,
  visibleReviewTypeMeta,
  type VisibleReviewType,
} from "@/lib/review/visible-type";
import {
  getReviewBySlug,
  getReviews,
  getAuthorById,
  getProductById,
  getBrandById,
  getProductFamilyById,
  getCategoryById,
  getFaqsByIds,
  getEvidenceForIds,
  getRecommendationsForProduct,
  getUseCaseById,
  getComparisonById,
  getBestGuidesForProduct,
  getBestGuides,
  getBuyingGuidesForProduct,
  getBuyingGuideById,
  getBuyingGuides,
  getComparisonsForProduct,
  getAlternativesForProduct,
  getOffersForProduct,
  getLowestOfferPrice,
  getRetailerById,
  getSpecificationDefinitions,
  getProductGraph,
  getReviewById,
  getReviewByProduct,
  getSportBySlug,
  getSubcategoryById,
  getVariantsForProduct,
} from "@/repositories";
import {
  formatAudienceAvailability,
  getProductAudiences,
} from "@/lib/product/audience";
import type {
  Review,
  Author,
  Comparison,
  BestGuide,
  BuyingGuide,
  FAQ,
  ScoreBreakdownItem,
} from "@/domain/editorial/types";
import { CATEGORY_DEFAULT_BUYING_GUIDE_IDS } from "@/content/link-graph-p47";
import type { Product, Brand, ProductFamily } from "@/domain/products/types";
import type { ProductCategory } from "@/domain/sports/types";
import type { Evidence, Recommendation } from "@/domain/recommendations/types";
import type {
  OfferRow,
  AlternativeRow,
  SpecDisplayRow,
} from "@/lib/product/get-product-page-data";
import { isOfferStale, getScoreBand } from "@/lib/product/score";
import type { Offer } from "@/domain/commerce/types";
import { getPrimaryProductMedia } from "@/lib/product/media";
import type { MediaAsset } from "@/domain/shared/types";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";
import {
  resolveDecisionCopyForProduct,
  type CanonicalDecisionCopy,
} from "@/lib/decision-copy";
import { formatPublicSpecDisplayLabel } from "@/lib/specs/public-label";

export { REVIEW_TYPE_META, PRODUCT_SOURCE_LABELS };

function sortOffers(offers: Offer[]): Offer[] {
  const availRank = (a: Offer) => {
    switch (a.availability) {
      case "in-stock":
        return 0;
      case "low-stock":
        return 1;
      case "preorder":
        return 2;
      case "unknown":
        return 3;
      case "out-of-stock":
        return 4;
      default:
        return 5;
    }
  };
  return [...offers].sort((a, b) => {
    const ar = availRank(a) - availRank(b);
    if (ar !== 0) return ar;
    return a.price - b.price;
  });
}

const ALT_LABELS: Record<string, string> = {
  cheaper: "Cheaper",
  premium: "Premium",
  faster: "Faster",
  "more-cushioned": "More Cushioned",
  "more-stable": "More Stable",
  lighter: "Lighter",
  "better-value": "Better Value",
  "trail-capable": "Trail Capable",
  "beginner-friendly": "Beginner Friendly",
};

export interface UseCasePerfRow {
  label: string;
  score: number;
  bandLabel: string;
  recommendation: Recommendation;
}

export interface ComparisonPreviewRow {
  comparison: Comparison;
  productNames: string[];
}

export interface FamilyDiffRow {
  key: string;
  label: string;
  current?: string;
  previous?: string;
}

export interface ComparisonTableCell {
  key: string;
  label: string;
  value: string;
}

export interface ComparisonTableRow {
  product: Product;
  brandName?: string;
  href: string;
  image?: MediaAsset;
  current: boolean;
  score?: number;
  cells: ComparisonTableCell[];
  bestFor?: string;
}

export interface GlanceRow {
  key: string;
  label: string;
  /** Short scalar for compact key/value rows */
  value?: string;
  /** Multi-line audience notes — stacked under the label, never right-aligned blobs */
  items?: string[];
}

export interface ReviewPageData {
  review: Review;
  product: Product;
  brand?: Brand;
  author?: Author;
  category?: ProductCategory;
  config: ReviewPageCategoryConfig;
  displayScore: number;
  scoreBandLabel: string;
  scoreBreakdown: ScoreBreakdownItem[];
  /** Criteria shown in hero panel + gauges (ordered) */
  heroCriteria: ScoreBreakdownItem[];
  hasPersonalTest: boolean;
  visibleReviewType: VisibleReviewType;
  visibleTypeMeta: ReturnType<typeof visibleReviewTypeMeta>;
  evidence: Evidence[];
  recommendations: UseCasePerfRow[];
  keySpecs: SpecDisplayRow[];
  glanceRows: GlanceRow[];
  heroImage?: MediaAsset;
  offers: OfferRow[];
  offersOtherRegions: OfferRow[];
  lowestPrice?: { price: number; currency: string };
  regionLabel: string;
  alternatives: AlternativeRow[];
  comparisons: ComparisonPreviewRow[];
  comparisonTable: ComparisonTableRow[];
  family?: ProductFamily;
  previousGeneration?: Product;
  newerGeneration?: Product;
  familyDiffs: FamilyDiffRow[];
  bestGuides: BestGuide[];
  buyingGuides: BuyingGuide[];
  faqs: FAQ[];
  breadcrumbs: { label: string; href?: string }[];
  sectionNav: { id: string; label: string }[];
  typeMeta: (typeof REVIEW_TYPE_META)[ReviewType];
  bottomLine: string;
  showTestingModule: boolean;
  showResearchModule: boolean;
  /**
   * Fit / sizing coverage + tested-variant honesty for footwear.
   * Never claims a tested last unless first-hand evidence exists.
   */
  fitSizingDisclosure?: string;
  /** Canonical Best For / Buy If / Skip If — two registers, one source. */
  decisionCopy: CanonicalDecisionCopy;
}

function formatSpec(
  key: string,
  product: Product,
  defs: ReturnType<typeof getSpecificationDefinitions>,
): SpecDisplayRow | undefined {
  const raw = product.specifications[key];
  if (raw === null || raw === undefined) return undefined;
  if (Array.isArray(raw) && raw.length === 0) return undefined;
  const def = defs.find((d) => d.key === key);
  let value: string;
  if (typeof raw === "boolean") value = raw ? "Yes" : "No";
  else if (typeof raw === "number") value = String(raw);
  else if (Array.isArray(raw)) value = raw.join(", ");
  else if (typeof raw === "object" && raw !== null && "min" in raw) {
    const r = raw as { min: number; max: number };
    value = `${r.min}–${r.max}`;
  } else value = String(raw);
  return {
    key,
    label: formatPublicSpecDisplayLabel(key),
    value,
    unit: typeof raw === "number" ? def?.unit : undefined,
    raw: raw as SpecDisplayRow["raw"],
  };
}

function formatGlanceValue(row: SpecDisplayRow): string {
  if (row.unit) return `${row.value} ${row.unit}`;
  return row.value;
}

/** Keep glance bullets scannable — prefer the clause before an em dash. */
function glanceAudienceLine(line: string): string {
  const trimmed = line.trim();
  const beforeBreak = trimmed.split(/\s+[—–]\s+/)[0]?.trim();
  if (beforeBreak && beforeBreak.length >= 24 && beforeBreak.length <= 96) {
    return beforeBreak;
  }
  if (trimmed.length <= 110) return trimmed;
  return `${trimmed.slice(0, 107).replace(/\s+\S*$/, "")}…`;
}

function buildGlanceRows(
  product: Product,
  review: Review,
  config: ReviewPageCategoryConfig,
  defs: ReturnType<typeof getSpecificationDefinitions>,
  bestFor: string[],
): GlanceRow[] {
  const rows: GlanceRow[] = [];
  const heel = formatSpec("heelStack", product, defs);
  const fore = formatSpec("forefootStack", product, defs);
  for (const key of config.glanceKeys) {
    if (key === "heelStack" && heel && fore) {
      rows.push({
        key: "stack",
        label: "Stack (heel / forefoot)",
        value: `${heel.value}${heel.unit ? ` ${heel.unit}` : ""} / ${fore.value}${fore.unit ? ` ${fore.unit}` : ""}`,
      });
      continue;
    }
    if (key === "forefootStack") continue;
    const row = formatSpec(key, product, defs);
    if (!row) continue;
    rows.push({
      key: row.key,
      label: row.label,
      value: formatGlanceValue(row),
    });
  }
  if (bestFor[0]) {
    rows.push({
      key: "best-for",
      label: "Best for",
      items: bestFor.slice(0, 3).map(glanceAudienceLine),
    });
  }
  const stability = formatSpec("stability", product, defs);
  if (stability && !rows.some((r) => r.key === "stability")) {
    rows.push({
      key: "runner-type",
      label: "Runner type",
      value: `${stability.value} gait`,
    });
  } else if (stability) {
    // Rename stability row contextually if present as runner type elsewhere
  }
  if (product.releaseDate) {
    const d = new Date(product.releaseDate);
    rows.push({
      key: "release",
      label: "Release date",
      value: d.toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      }),
    });
  }
  return rows;
}

function breakdownOrSpecFallback(
  breakdown: ScoreBreakdownItem[],
  breakdownKey: string,
  product: Product,
  defs: ReturnType<typeof getSpecificationDefinitions>,
): string {
  const item = breakdown.find((b) => b.key === breakdownKey);
  if (item) return (item.score / 10).toFixed(1);

  const specKeyByBreakdown: Record<string, string> = {
    cushioning: "cushionLevel",
    ride: "rideCharacter",
    stability: "stability",
    comfort: "cushionFeel",
    grip: "grip",
    battery: "batteryLife",
    "gps-accuracy": "gps",
    maps: "maps",
    "training-features": "trainingFeatures",
  };
  const specKey = specKeyByBreakdown[breakdownKey];
  if (specKey) {
    const row = formatSpec(specKey, product, defs);
    if (row) return formatGlanceValue(row);
  }
  return "—";
}

function buildComparisonTable(
  product: Product,
  review: Review,
  alternatives: AlternativeRow[],
  config: ReviewPageCategoryConfig,
  options?: PublishResolverOptions,
): ComparisonTableRow[] {
  const defs = getSpecificationDefinitions(product.categoryId);
  const peers = [
    product,
    ...alternatives.slice(0, 3).map((a) => a.product),
  ].filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i,
  );

  return peers.map((p) => {
    const brand = getBrandById(p.brandId, options);
    const peerReview =
      p.id === product.id
        ? review
        : p.reviewId
          ? getReviewById(p.reviewId, options) ??
            getReviewByProduct(p.id, options)
          : getReviewByProduct(p.id, options);
    const breakdown = peerReview?.scoreBreakdown ?? [];
    const score =
      p.recommendationScore !== undefined
        ? p.recommendationScore
        : peerReview?.score;
    const cells: ComparisonTableCell[] = config.comparisonColumns.map(
      (col) => {
        if (col.source === "score") {
          return {
            key: col.key,
            label: col.label,
            value:
              score !== undefined ? (score / 10).toFixed(1) : "—",
          };
        }
        if (col.source === "spec" && col.specKey) {
          const row = formatSpec(col.specKey, p, defs);
          return {
            key: col.key,
            label: col.label,
            value: row
              ? formatGlanceValue(row)
              : "—",
          };
        }
        if (col.source === "breakdown" && col.breakdownKey) {
          return {
            key: col.key,
            label: col.label,
            value: breakdownOrSpecFallback(
              breakdown,
              col.breakdownKey,
              p,
              defs,
            ),
          };
        }
        if (col.source === "bestFor") {
          return {
            key: col.key,
            label: col.label,
            value: comparisonBestForLabel(p),
          };
        }
        return { key: col.key, label: col.label, value: "—" };
      },
    );
    return {
      product: p,
      brandName: brand?.name,
      href: `/products/${p.slug}`,
      image: getPrimaryProductMedia(p),
      current: p.id === product.id,
      score,
      cells,
      bestFor: comparisonBestForLabel(p),
    };
  });
}

/** Keep comparison-table "Best for" punchy like peer strength lines. */
function comparisonBestForLabel(product: Product): string {
  const strength = product.strengths?.[0]?.trim();
  if (strength) {
    if (strength.length <= 42) return strength;
    const beforeBreak = strength.split(/\s+[—–]\s+/)[0]?.trim();
    if (beforeBreak && beforeBreak.length <= 42) return beforeBreak;
    return `${strength.slice(0, 39).replace(/\s+\S*$/, "")}…`;
  }
  const short = product.shortDescription?.trim();
  if (short) {
    const clause = short.split(/[,.]/)[0]?.trim();
    if (clause && clause.length <= 42) return clause;
  }
  return "—";
}

/**
 * Assembles Review page data via repositories. Never imports raw content JSON in UI.
 */
export function getReviewPageData(
  slug: string,
  options?: PublishResolverOptions & { region?: RegionCode },
): ReviewPageData | undefined {
  const region = options?.region ?? DEFAULT_REGION;
  const review = getReviewBySlug(slug, options);
  if (!review) return undefined;
  if (containsPublicContentCorruption(review)) return undefined;

  const product = getProductById(review.productId, options);
  if (!product) return undefined;

  const brand = getBrandById(product.brandId, options);
  const heroImage = getPrimaryProductMedia(product);
  const enrichedReview = enrichReviewForPage(review, product, {
    brand,
    productHero: heroImage,
  });
  if (containsPublicContentCorruption(enrichedReview)) return undefined;

  const author = getAuthorById(
    enrichedReview.reviewerId ?? "author-kitletics-editorial",
  );
  const category = getCategoryById(product.categoryId);
  const config = getReviewPageCategoryConfig(product.categoryId);
  const graph = getProductGraph(product.id, { ...options, region });

  const evidence = getEvidenceForIds(enrichedReview.evidenceIds);
  const hasPersonalTest = evidence.some((e) => e.type === "personal-test");
  const visibleReviewType = resolveVisibleReviewType(enrichedReview, evidence);
  const visibleTypeMeta = visibleReviewTypeMeta(visibleReviewType);

  const displayScore =
    product.recommendationScore !== undefined
      ? product.recommendationScore
      : enrichedReview.score;

  const allowedKeys = new Set(config.scoreCriteriaKeys);
  const scoreBreakdown =
    allowedKeys.size > 0
      ? enrichedReview.scoreBreakdown.filter((item) => allowedKeys.has(item.key))
      : enrichedReview.scoreBreakdown;

  const byKey = new Map(scoreBreakdown.map((i) => [i.key, i]));
  const heroCriteria = (
    config.heroCriteriaKeys.length
      ? config.heroCriteriaKeys
      : scoreBreakdown.slice(0, 6).map((i) => i.key)
  )
    .map((key) => byKey.get(key))
    .filter((i): i is ScoreBreakdownItem => Boolean(i))
    .slice(0, 6);

  const recommendations: UseCasePerfRow[] = getRecommendationsForProduct(
    product.id,
  )
    .sort((a, b) => b.score - a.score)
    .map((recommendation) => {
      const useCase = recommendation.useCaseId
        ? getUseCaseById(recommendation.useCaseId)
        : undefined;
      const label = useCase?.name ?? recommendation.useCaseId ?? "Overall";
      return {
        label,
        score: recommendation.score,
        bandLabel: getScoreBand(recommendation.score).label,
        recommendation,
      };
    });

  const defs = getSpecificationDefinitions(product.categoryId);
  const keySpecs = config.keySpecKeys
    .map((key) => formatSpec(key, product, defs))
    .filter((r): r is SpecDisplayRow => Boolean(r));
  const decisionCopy = resolveDecisionCopyForProduct({
    product,
    review: enrichedReview,
  });
  const glanceRows = buildGlanceRows(
    product,
    enrichedReview,
    config,
    defs,
    decisionCopy.bestFor,
  );

  const regionalOffers = sortOffers(
    graph?.offers ??
      getOffersForProduct(product.id).filter((o) => o.region === region),
  );
  const offers: OfferRow[] = regionalOffers.map((offer) => ({
    offer,
    retailer: getRetailerById(offer.retailerId),
    stale: isOfferStale(offer.lastChecked),
  }));
  const offersOtherRegions: OfferRow[] = sortOffers(
    getOffersForProduct(product.id),
  )
    .filter((o) => o.region !== region)
    .map((offer) => ({
      offer,
      retailer: getRetailerById(offer.retailerId),
      stale: isOfferStale(offer.lastChecked),
    }));
  const lowestPrice = getLowestOfferPrice(product.id, region, options);

  const altFromReview = enrichedReview.alternativeProductIds;
  const graphAlts = getAlternativesForProduct(product.id);
  const alternatives: AlternativeRow[] = [];
  const seenAlt = new Set<string>();

  for (const relationship of graphAlts) {
    const alt = getProductById(relationship.alternativeProductId, options);
    if (!alt || seenAlt.has(alt.id)) continue;
    seenAlt.add(alt.id);
    alternatives.push({
      relationship,
      product: alt,
      brand: getBrandById(alt.brandId, options),
      reasonLabel:
        ALT_LABELS[relationship.relationshipType] ??
        relationship.reasons[0] ??
        "Alternative",
    });
  }
  for (const pid of altFromReview) {
    if (seenAlt.has(pid)) continue;
    const alt = getProductById(pid, options);
    if (!alt) continue;
    seenAlt.add(pid);
    alternatives.push({
      relationship: {
        id: `review-alt-${pid}`,
        sourceProductId: product.id,
        alternativeProductId: pid,
        similarityScore: 0,
        reasons: ["Listed alternative"],
        relationshipType: "better-value",
      },
      product: alt,
      brand: getBrandById(alt.brandId, options),
      reasonLabel: "Alternative",
    });
  }

  const comparisons: ComparisonPreviewRow[] = (() => {
    const byId = new Map<string, Comparison>();
    for (const id of enrichedReview.comparisonIds) {
      const c = getComparisonById(id, options);
      if (c) byId.set(c.id, c);
    }
    for (const c of getComparisonsForProduct(product.id, options)) {
      if (!byId.has(c.id)) byId.set(c.id, c);
    }
    return [...byId.values()].slice(0, 4).map((comparison) => ({
      comparison,
      productNames: comparison.productIds
        .map((id) => getProductById(id, options)?.name)
        .filter((n): n is string => Boolean(n)),
    }));
  })();

  const comparisonTable = buildComparisonTable(
    product,
    enrichedReview,
    alternatives,
    config,
    options,
  );

  const family = product.familyId
    ? getProductFamilyById(product.familyId)
    : undefined;
  const familyProducts = (family?.productIds ?? [])
    .map((id) => getProductById(id, options))
    .filter((p): p is Product => Boolean(p));
  const currentIdx = familyProducts.findIndex((p) => p.id === product.id);
  // Families are typically newest-first
  const newerGeneration =
    currentIdx > 0 ? familyProducts[currentIdx - 1] : undefined;
  const previousGeneration =
    currentIdx >= 0 && currentIdx < familyProducts.length - 1
      ? familyProducts[currentIdx + 1]
      : undefined;

  const familyDiffs: FamilyDiffRow[] = [];
  if (previousGeneration) {
    for (const key of config.keySpecKeys.slice(0, 6)) {
      const cur = formatSpec(key, product, defs);
      const prev = formatSpec(key, previousGeneration, defs);
      if (!cur && !prev) continue;
      if (cur?.value === prev?.value) continue;
      familyDiffs.push({
        key,
        label: cur?.label ?? prev?.label ?? key,
        current: cur
          ? `${cur.value}${cur.unit ? ` ${cur.unit}` : ""}`
          : undefined,
        previous: prev
          ? `${prev.value}${prev.unit ? ` ${prev.unit}` : ""}`
          : undefined,
      });
    }
  }

  const bestGuides = (() => {
    const byId = new Map<string, BestGuide>();
    for (const g of getBestGuidesForProduct(product.id, options)) {
      byId.set(g.id, g);
    }
    if (byId.size === 0) {
      for (const g of getBestGuides(options)) {
        if (g.categoryId === product.categoryId) byId.set(g.id, g);
        if (byId.size >= 3) break;
      }
    }
    return [...byId.values()].slice(0, 4);
  })();

  const buyingGuides: BuyingGuide[] = (() => {
    const byId = new Map<string, BuyingGuide>();
    for (const id of enrichedReview.relatedBuyingGuideIds ?? []) {
      const g = getBuyingGuideById(id);
      if (g) byId.set(g.id, g);
    }
    for (const g of getBuyingGuidesForProduct(product.id, options)) {
      if (!byId.has(g.id)) byId.set(g.id, g);
    }
    if (byId.size === 0) {
      const defaults =
        CATEGORY_DEFAULT_BUYING_GUIDE_IDS[product.categoryId] ?? [];
      for (const id of defaults) {
        const g = getBuyingGuideById(id);
        if (g) byId.set(g.id, g);
      }
    }
    if (byId.size === 0 && product.categoryId) {
      for (const g of getBuyingGuides(options)) {
        if (g.categoryId === product.categoryId) byId.set(g.id, g);
        if (byId.size >= 2) break;
      }
    }
    return [...byId.values()].slice(0, 3);
  })();

  const faqs = getFaqsByIds(enrichedReview.faqIds);

  const showTestingModule =
    (visibleReviewType === "first-hand-test" ||
      visibleReviewType === "hybrid") &&
    hasPersonalTest &&
    Boolean(enrichedReview.testingDetails);
  const showResearchModule =
    visibleReviewType === "expert-research" ||
    (visibleReviewType === "hybrid" && evidence.length > 0);

  const audiences = getProductAudiences(
    product,
    getVariantsForProduct(product.id),
  );
  const availabilityLabel = formatAudienceAvailability(audiences);
  const isFootwear =
    /shoe|trainer|boot/i.test(category?.slug ?? "") ||
    /shoe|trainer|boot/i.test(category?.name ?? "") ||
    product.categoryId === "cat-running-shoes";
  let fitSizingDisclosure: string | undefined;
  if (isFootwear && availabilityLabel) {
    if (hasPersonalTest) {
      fitSizingDisclosure = `Sold in ${availabilityLabel} sizing. Specs and feel notes reflect the variant we tested unless a section says otherwise — confirm Men’s/Women’s SKU on the product page before you buy. Catalog weights are usually a Men’s US 9 reference unless a Women’s weight is verified.`;
    } else {
      fitSizingDisclosure = `Sold in ${availabilityLabel} sizing. This review is research-based, not a first-hand wear test of a specific Men’s or Women’s last — confirm fit on the product page. Catalog weights are usually a Men’s US 9 reference unless a Women’s weight is verified; we do not invent Women’s figures.`;
    }
  }

  const sectionNav: { id: string; label: string }[] = [
    { id: "summary", label: "Review Summary" },
  ];
  if (heroCriteria.length)
    sectionNav.push({ id: "performance", label: "Performance" });
  if (showTestingModule)
    sectionNav.push({ id: "testing", label: "Testing Data" });
  else if (showResearchModule)
    sectionNav.push({ id: "assessment", label: "How we assessed" });
  for (const section of enrichedReview.sections) {
    if (section.body.trim().length < 40) continue;
    const bodyItems = sectionNav.filter(
      (item) =>
        item.id !== "summary" &&
        item.id !== "performance" &&
        item.id !== "testing" &&
        item.id !== "assessment",
    ).length;
    if (bodyItems >= 8) continue;
    sectionNav.push({ id: section.id, label: section.heading });
  }
  if (comparisonTable.length > 1)
    sectionNav.push({ id: "comparisons", label: "Comparisons" });
  if (
    bestGuides.length > 0 ||
    buyingGuides.length > 0 ||
    comparisons.length > 0 ||
    alternatives.length > 0
  ) {
    sectionNav.push({ id: "keep-reading", label: "Keep reading" });
  }
  sectionNav.push({ id: "verdict", label: "Verdict" });
  if (offers.length) sectionNav.push({ id: "offers", label: "Prices" });

  const categoryLabel = category?.name
    ? `${category.name} reviews`
    : "Reviews";

  return {
    review: enrichedReview,
    product,
    brand,
    author,
    category,
    config,
    displayScore,
    scoreBandLabel: getScoreBand(displayScore).label,
    scoreBreakdown,
    heroCriteria,
    hasPersonalTest,
    visibleReviewType,
    visibleTypeMeta,
    evidence,
    recommendations,
    keySpecs,
    glanceRows,
    heroImage,
    offers,
    offersOtherRegions,
    lowestPrice,
    regionLabel: REGION_META[region].label,
    alternatives,
    comparisons,
    comparisonTable,
    family,
    previousGeneration,
    newerGeneration,
    familyDiffs,
    bestGuides,
    buyingGuides,
    faqs,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Reviews", href: "/reviews" },
      { label: categoryLabel, href: category ? `/reviews?category=${category.slug}` : "/reviews" },
      { label: enrichedReview.title },
    ],
    sectionNav,
    typeMeta: REVIEW_TYPE_META[enrichedReview.reviewType],
    bottomLine: enrichedReview.bottomLine?.trim() || enrichedReview.verdict,
    showTestingModule,
    showResearchModule,
    fitSizingDisclosure,
    decisionCopy,
  };
}

export type ReviewGenderFilter = "men" | "women" | "unisex";

/** Shoe-type facets shown on the reviews hub (excludes gait tags like neutral). */
const SHOE_TYPE_FACET_SLUGS = new Set([
  "daily-trainers",
  "max-cushion",
  "tempo",
  "race",
  "carbon-plate",
  "trail",
  "stability",
  "wide",
  "cross-training",
  "weightlifting",
  "hyrox",
  "gym",
  "recovery-walking",
  "zero-drop",
  "minimalist",
  "road-to-trail",
]);

function resolveProductGenderFit(
  product: Product | undefined,
): ReviewGenderFilter {
  const raw = product?.specifications?.genderFit;
  if (raw === "men" || raw === "women" || raw === "unisex") return raw;
  return "unisex";
}

function productMatchesGenderFilter(
  product: Product | undefined,
  gender: ReviewGenderFilter,
): boolean {
  const fit = resolveProductGenderFit(product);
  if (gender === "unisex") return fit === "unisex";
  // Men/Women also include unisex lasts sold as shared fit (catalog parity).
  return fit === gender || fit === "unisex";
}

function productHasShoeType(
  product: Product | undefined,
  shoeTypeSlug: string,
): boolean {
  if (!product) return false;
  return product.subcategoryIds.some((id) => {
    const sub = getSubcategoryById(id);
    return sub?.slug === shoeTypeSlug;
  });
}

export function getReviewsIndexData(
  options?: PublishResolverOptions & {
    typeFilter?: ReviewType | "all";
    sportSlug?: string;
    categoryIds?: string[];
    /** Category path slug, e.g. running-shoes / training-shoes */
    categorySlug?: string;
    brandSlug?: string;
    gender?: ReviewGenderFilter;
    shoeType?: string;
    /** Cap cards per category on hub pages (keeps HTML/TTFB bounded). */
    maxPerCategory?: number;
  },
) {
  const typeFilter = options?.typeFilter ?? "all";
  const all = getReviews(options);
  let reviews = all;
  if (typeFilter !== "all") {
    reviews = reviews.filter((r) => r.reviewType === typeFilter);
  }

  if (options?.sportSlug) {
    const sport = getSportBySlug(options.sportSlug, options);
    if (sport) {
      reviews = reviews.filter((r) => {
        const product = getProductById(r.productId, options);
        return product?.sportIds.includes(sport.id);
      });
    }
  }

  if (options?.categoryIds?.length) {
    const allowed = new Set(options.categoryIds);
    reviews = reviews.filter((r) => {
      const product = getProductById(r.productId, options);
      return product ? allowed.has(product.categoryId) : false;
    });
  }

  // Counts / facets share this sport+category universe (before product facets)
  const countBase = reviews.filter((r) =>
    shouldPromotePublicly(
      getLaunchEligibility({ kind: "review", entity: r }, options),
    ),
  );
  reviews = countBase;

  if (options?.categorySlug) {
    reviews = reviews.filter((r) => {
      const product = getProductById(r.productId, options);
      const category = product
        ? getCategoryById(product.categoryId)
        : undefined;
      return category?.slug === options.categorySlug;
    });
  }

  if (options?.brandSlug) {
    reviews = reviews.filter((r) => {
      const product = getProductById(r.productId, options);
      if (!product) return false;
      const brand = getBrandById(product.brandId, options);
      return brand?.slug === options.brandSlug;
    });
  }

  if (options?.gender) {
    reviews = reviews.filter((r) => {
      const product = getProductById(r.productId, options);
      return productMatchesGenderFilter(product, options.gender!);
    });
  }

  if (options?.shoeType) {
    reviews = reviews.filter((r) => {
      const product = getProductById(r.productId, options);
      return productHasShoeType(product, options.shoeType!);
    });
  }

  const items = reviews.map((review) => {
    const product = getProductById(review.productId, options);
    const brand = product
      ? getBrandById(product.brandId, options)
      : undefined;
    const category = product
      ? getCategoryById(product.categoryId)
      : undefined;
    const displayScore =
      product?.recommendationScore !== undefined
        ? product.recommendationScore
        : review.score;
    const evidence = getEvidenceForIds(review.evidenceIds);
    const visibleReviewType = resolveVisibleReviewType(review, evidence);
    return {
      review,
      product,
      brand,
      category,
      displayScore,
      typeMeta: REVIEW_TYPE_META[visibleReviewType],
      visibleReviewType,
    };
  });

  const byCategory = new Map<
    string,
    { categoryName: string; items: typeof items; totalCount: number }
  >();
  for (const item of items) {
    const key = item.category?.id ?? "other";
    const name = item.category?.name ?? "Other";
    if (!byCategory.has(key)) {
      byCategory.set(key, { categoryName: name, items: [], totalCount: 0 });
    }
    const group = byCategory.get(key)!;
    group.totalCount += 1;
    const cap = options?.maxPerCategory;
    if (cap === undefined || group.items.length < cap) {
      group.items.push(item);
    }
  }

  const brandCounts = new Map<string, { slug: string; name: string; count: number }>();
  const genderCounts: Record<ReviewGenderFilter, number> = {
    men: 0,
    women: 0,
    unisex: 0,
  };
  const shoeTypeCounts = new Map<
    string,
    { slug: string; name: string; count: number }
  >();
  const categoryCounts = new Map<
    string,
    { slug: string; name: string; count: number }
  >();

  for (const review of countBase) {
    const product = getProductById(review.productId, options);
    if (!product) continue;

    const brand = getBrandById(product.brandId, options);
    if (brand) {
      const existing = brandCounts.get(brand.slug);
      if (existing) existing.count += 1;
      else
        brandCounts.set(brand.slug, {
          slug: brand.slug,
          name: brand.name,
          count: 1,
        });
    }

    const fit = resolveProductGenderFit(product);
    genderCounts[fit] += 1;
    if (fit === "unisex") {
      // Facet counts for Men/Women include unisex (same matching rule).
      genderCounts.men += 1;
      genderCounts.women += 1;
    }

    const category = getCategoryById(product.categoryId);
    if (category) {
      const existing = categoryCounts.get(category.slug);
      if (existing) existing.count += 1;
      else
        categoryCounts.set(category.slug, {
          slug: category.slug,
          name: category.name,
          count: 1,
        });
    }

    for (const subId of product.subcategoryIds) {
      const sub = getSubcategoryById(subId);
      if (!sub || !SHOE_TYPE_FACET_SLUGS.has(sub.slug)) continue;
      const existing = shoeTypeCounts.get(sub.slug);
      if (existing) existing.count += 1;
      else
        shoeTypeCounts.set(sub.slug, {
          slug: sub.slug,
          name: sub.name,
          count: 1,
        });
    }
  }

  return {
    items,
    byCategory: [...byCategory.values()],
    counts: {
      all: countBase.length,
      "first-hand-test": countBase.filter(
        (r) => r.reviewType === "first-hand-test",
      ).length,
      "expert-research": countBase.filter(
        (r) => r.reviewType === "expert-research",
      ).length,
      hybrid: countBase.filter((r) => r.reviewType === "hybrid").length,
    },
    facets: {
      brands: [...brandCounts.values()].sort(
        (a, b) => b.count - a.count || a.name.localeCompare(b.name),
      ),
      genders: [
        { id: "men" as const, label: "Men", count: genderCounts.men },
        { id: "women" as const, label: "Women", count: genderCounts.women },
        {
          id: "unisex" as const,
          label: "Unisex",
          count: genderCounts.unisex,
        },
      ].filter((g) => g.count > 0),
      shoeTypes: [...shoeTypeCounts.values()].sort(
        (a, b) => b.count - a.count || a.name.localeCompare(b.name),
      ),
      categories: [...categoryCounts.values()].sort(
        (a, b) => b.count - a.count || a.name.localeCompare(b.name),
      ),
    },
  };
}
