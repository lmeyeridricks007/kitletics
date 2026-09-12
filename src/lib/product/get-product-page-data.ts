import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION, REGION_META } from "@/domain/shared/types";
import type { SpecValue } from "@/domain/products/types";
import {
  getProductPageCategoryConfig,
  type ProductPageCategoryConfig,
  type SpecGroupId,
} from "@/lib/product/category-config";
import { formatPublicSpecDisplayLabel } from "@/lib/specs/public-label";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import {
  getProductBySlug,
  getProductGraph,
  getBrandById,
  getProductFamilyById,
  getProductById,
  getLowestOfferPrice,
  getRetailerById,
  getSpecificationDefinitions,
  getSubcategoryById,
  getUseCaseById,
  getFaqsByIds,
  getTools,
  getOffersForProduct,
  getVariantsForProduct,
} from "@/repositories";
import type { Product, Brand, ProductFamily, SpecificationDefinition, ProductVariant } from "@/domain/products/types";
import type { ProductCategory, Sport, UseCase, ProductSubcategory } from "@/domain/sports/types";
import type {
  Recommendation,
  Evidence,
  AlternativeRelationship,
} from "@/domain/recommendations/types";
import type { Offer, Retailer } from "@/domain/commerce/types";
import { rankOffersForProduct } from "@/domain/commerce/ranking";
import type {
  Review,
  BestGuide,
  Comparison,
  BuyingGuide,
  FAQ,
} from "@/domain/editorial/types";
import type { Tool } from "@/domain/tools/types";
import { isOfferStale, isProductDataStale } from "@/lib/product/score";
import { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";
import { rewriteUniquenessEraSkipProse } from "@/lib/review/rewrite-uniqueness-era-skip";
import { resolveDecisionCopyForProduct } from "@/lib/decision-copy";
import {
  getPrimaryProductMedia,
  isAuthenticProductMedia,
} from "@/lib/product/media";
import type { MediaAsset } from "@/domain/shared/types";

export interface SpecDisplayRow {
  key: string;
  label: string;
  value: string;
  unit?: string;
  raw: SpecValue;
}

export interface SpecDisplayGroup {
  id: SpecGroupId;
  label: string;
  rows: SpecDisplayRow[];
}

export interface OfferRow {
  offer: Offer;
  retailer?: Retailer;
  stale: boolean;
}

export interface AlternativeRow {
  relationship: AlternativeRelationship;
  product: Product;
  brand?: Brand;
  reasonLabel: string;
}

export interface FamilyMember {
  product: Product;
  isCurrent: boolean;
}

export interface UseCaseScoreRow {
  recommendation: Recommendation;
  useCase?: UseCase;
  label: string;
}

export interface ProductPageData {
  product: Product;
  brand?: Brand;
  family?: ProductFamily;
  familyMembers: FamilyMember[];
  newerGeneration?: Product;
  olderGeneration?: Product;
  category?: ProductCategory;
  sports: Sport[];
  subcategories: ProductSubcategory[];
  classifications: string[];
  useCases: UseCase[];
  config: ProductPageCategoryConfig;
  specDefs: SpecificationDefinition[];
  featuredSpecs: SpecDisplayRow[];
  specGroups: SpecDisplayGroup[];
  recommendations: UseCaseScoreRow[];
  hasStructuredRecommendations: boolean;
  showScore: boolean;
  scoreExplainFactors: { label: string; score: number; explanation: string }[];
  bestFor: string[];
  notIdealFor: string[];
  buyIf: string[];
  skipIf: string[];
  evidence: Evidence[];
  hasPersonalTest: boolean;
  offers: OfferRow[];
  offersOtherRegions: OfferRow[];
  lowestPrice?: { price: number; currency: string };
  region: RegionCode;
  regionLabel: string;
  review?: Review;
  comparisons: Comparison[];
  comparisonNames: Record<string, string[]>;
  alternatives: AlternativeRow[];
  bestGuides: BestGuide[];
  buyingGuides: BuyingGuide[];
  tools: Tool[];
  faqs: FAQ[];
  breadcrumbs: { label: string; href?: string }[];
  productStale: boolean;
  verdict?: string;
  /** Authentic gallery images for PDP (never placeholders). */
  galleryImages: import("@/domain/shared/types").MediaAsset[];
  /** Compact chips under product title */
  heroTags: string[];
  /** Four-cell quick facts strip under hero */
  quickFacts: { id: string; label: string; value: string }[];
  /** Audience / fit-sizing variants (men / women / unisex) */
  variants: ProductVariant[];
}

const ALT_LABELS: Record<string, string> = {
  cheaper: "Want something cheaper?",
  "cheaper-alternative": "Want something cheaper?",
  premium: "Want a premium option?",
  "premium-alternative": "Want a premium option?",
  faster: "Want something faster?",
  "more-responsive": "Want something more responsive?",
  "more-cushioned": "Want more cushion?",
  "more-stable": "Want more stability?",
  lighter: "Want something lighter?",
  "lighter-alternative": "Want something lighter?",
  "better-value": "Want better value?",
  "trail-capable": "Need trail capability?",
  "trail-alternative": "Looking for a trail option?",
  "beginner-friendly": "Want a beginner-friendly pick?",
  similar: "Most similar option",
  "direct-competitor": "Direct competitor",
  "previous-generation": "Previous generation",
  "next-generation": "Newer generation",
  "long-run-alternative": "Better for long runs?",
  "race-focused-alternative": "More race-focused?",
  "daily-training-alternative": "More daily-oriented?",
};

function formatSpecValue(
  value: SpecValue,
  def?: SpecificationDefinition,
): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    return def?.unit ? `${value}` : String(value);
  }
  if (typeof value === "string") {
    return value
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }
  if (Array.isArray(value)) {
    const parts = value
      .filter((v) => v !== null)
      .map((v) => formatSpecValue(v as SpecValue, def))
      .filter(Boolean);
    return parts.length ? parts.join(", ") : undefined;
  }
  if (typeof value === "object") {
    const { min, max } = value;
    if (min === undefined && max === undefined) return undefined;
    if (min !== undefined && max !== undefined) return `${min}–${max}`;
    if (min !== undefined) return `${min}+`;
    return `≤${max}`;
  }
  return undefined;
}

function buildSpecRow(
  key: string,
  product: Product,
  defByKey: Map<string, SpecificationDefinition>,
): SpecDisplayRow | undefined {
  const raw = product.specifications[key];
  if (raw === null || raw === undefined) return undefined;
  // Omit empty arrays
  if (Array.isArray(raw) && raw.length === 0) return undefined;
  const def = defByKey.get(key);
  const formatted = formatSpecValue(raw, def);
  if (!formatted) return undefined;
  return {
    key,
    label: formatPublicSpecDisplayLabel(key),
    value: formatted,
    unit: typeof raw === "number" ? def?.unit : undefined,
    raw,
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

/**
 * Assembles everything the Product Detail page needs via repositories.
 */
export function getProductPageData(
  slug: string,
  options?: PublishResolverOptions & { region?: RegionCode },
): ProductPageData | undefined {
  const region = options?.region ?? DEFAULT_REGION;
  const product = getProductBySlug(slug, options);
  if (!product) return undefined;

  const graph = getProductGraph(product.id, { ...options, region });
  if (!graph) return undefined;

  const brand = graph.brand ?? getBrandById(product.brandId, options);
  const category = graph.category;
  const config = getProductPageCategoryConfig(product.categoryId);
  const specDefs = getSpecificationDefinitions(product.categoryId);
  const defByKey = new Map(specDefs.map((d) => [d.key, d]));

  const featuredSpecs = config.featuredSpecificationKeys
    .map((key) => buildSpecRow(key, product, defByKey))
    .filter((r): r is SpecDisplayRow => Boolean(r));

  const usedKeys = new Set<string>();
  const specGroups = config.specificationGroups
    .map((group) => {
      const rows = group.keys
        .map((key) => {
          const row = buildSpecRow(key, product, defByKey);
          if (row) usedKeys.add(key);
          return row;
        })
        .filter((r): r is SpecDisplayRow => Boolean(r));
      return rows.length ? { id: group.id, label: group.label, rows } : undefined;
    })
    .filter((g): g is SpecDisplayGroup => Boolean(g));

  // Any remaining known specs
  const leftover = Object.keys(product.specifications)
    .filter((k) => !usedKeys.has(k))
    .map((key) => buildSpecRow(key, product, defByKey))
    .filter((r): r is SpecDisplayRow => Boolean(r));
  if (leftover.length > 0 && config.specificationGroups.length > 0) {
    specGroups.push({ id: "other", label: "Other", rows: leftover });
  } else if (leftover.length > 0 && specGroups.length === 0) {
    // Generic category — single group of all present specs
    const all = Object.keys(product.specifications)
      .map((key) => buildSpecRow(key, product, defByKey))
      .filter((r): r is SpecDisplayRow => Boolean(r));
    if (all.length) {
      specGroups.push({ id: "other", label: "Specifications", rows: all });
    }
  }

  const subcategories = product.subcategoryIds
    .map((id) => getSubcategoryById(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const classifications: string[] = [];
  for (const sub of subcategories) {
    classifications.push(sub.name.replace(/ Shoes$/i, ""));
  }
  for (const key of config.classificationSpecKeys) {
    const row = buildSpecRow(key, product, defByKey);
    if (row && !classifications.some((c) => c.toLowerCase() === row.value.toLowerCase())) {
      classifications.push(row.value);
    }
  }

  const recommendations: UseCaseScoreRow[] = [...graph.recommendations]
    .sort((a, b) => b.score - a.score)
    .map((recommendation) => {
      const useCase = recommendation.useCaseId
        ? getUseCaseById(recommendation.useCaseId)
        : undefined;
      return {
        recommendation,
        useCase,
        label: useCase?.name ?? recommendation.useCaseId ?? "Overall",
      };
    });

  const hasStructuredRecommendations = recommendations.length > 0;
  // Show Kitletics Score whenever a canonical score exists (factors optional)
  const showScore = product.recommendationScore !== undefined;

  // Factor explain: merge from strong use-case fits only (avoid daily "don't buy" factors)
  const factorMap = new Map<
    string,
    { label: string; score: number; explanation: string }
  >();
  for (const row of recommendations
    .filter((r) => r.recommendation.score >= 70)
    .slice(0, 2)) {
    for (const f of row.recommendation.factors) {
      if (!factorMap.has(f.key)) {
        factorMap.set(f.key, {
          label: f.label
            ? f.label
            : f.key
                .split("-")
                .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                .join(" "),
          score: f.score,
          explanation: f.explanation ?? "",
        });
      }
    }
  }

  const review =
    graph.review && !containsPublicContentCorruption(graph.review)
      ? graph.review
      : undefined;
  const decisionCopy = resolveDecisionCopyForProduct({
    product,
    review,
  });
  const bestFor = decisionCopy.bestFor;
  const notIdealFor = decisionCopy.notIdealFor;
  const buyIf = decisionCopy.buyIf;
  const skipIf = decisionCopy.skipIf;

  const regionalOffers = sortOffers(graph.offers);
  const offers: OfferRow[] = regionalOffers.map((offer) => ({
    offer,
    retailer: getRetailerById(offer.retailerId),
    stale: isOfferStale(offer.lastChecked),
  }));

  const allOffers = sortOffers(getOffersForProduct(product.id));
  const offersOtherRegions: OfferRow[] = allOffers
    .filter((o) => o.region !== region)
    .map((offer) => ({
      offer,
      retailer: getRetailerById(offer.retailerId),
      stale: isOfferStale(offer.lastChecked),
    }));

  const lowestPrice = getLowestOfferPrice(product.id, region, options);

  const family = product.familyId
    ? getProductFamilyById(product.familyId)
    : undefined;
  const familyMembers: FamilyMember[] = (family?.productIds ?? [])
    .map((id) => getProductById(id, options))
    .filter((p): p is Product => Boolean(p))
    .map((p) => ({
      product: p,
      isCurrent: p.id === product.id,
    }));

  const currentIndex = familyMembers.findIndex((m) => m.isCurrent);
  const newerGeneration =
    currentIndex > 0 ? familyMembers[currentIndex - 1]?.product : undefined;
  const olderGeneration =
    currentIndex >= 0 && currentIndex < familyMembers.length - 1
      ? familyMembers[currentIndex + 1]?.product
      : undefined;

  const alternatives: AlternativeRow[] = graph.alternatives
    .flatMap((relationship) => {
      const alt = getProductById(relationship.alternativeProductId, options);
      if (!alt) return [];
      return [
        {
          relationship,
          product: alt,
          brand: getBrandById(alt.brandId, options),
          reasonLabel:
            ALT_LABELS[relationship.relationshipType] ??
            relationship.reasons[0] ??
            "Alternative",
        },
      ];
    })
    .slice(0, 6);

  const comparisonNames: Record<string, string[]> = {};
  for (const cmp of graph.comparisons) {
    comparisonNames[cmp.id] = cmp.productIds
      .map((id) => getProductById(id, options)?.name)
      .filter((n): n is string => Boolean(n));
  }

  const tools = (config.relatedToolSlugs ?? [])
    .map((slug) => getTools(options).find((t) => t.slug === slug))
    .filter((t): t is Tool => Boolean(t));

  const faqIds = [
    ...(graph.review?.faqIds ?? []),
  ];
  const faqs = getFaqsByIds(faqIds).filter(
    (f) => !f.productId || f.productId === product.id,
  );

  const breadcrumbs = resolveBreadcrumbs({
    type: "product",
    productSlug: product.slug,
  });

  // Prefer sport-scoped crumbs when primary sport + category exist
  const primarySport = graph.sports[0];
  if (primarySport && category) {
    breadcrumbs.splice(1, breadcrumbs.length - 1,
      { label: primarySport.name, href: `/${primarySport.slug}` },
      {
        label: category.name,
        href: `/${primarySport.slug}/${category.pathSegment}`,
      },
      { label: product.fullName },
    );
  }

  const galleryImages = buildGalleryImages(product);
  const heroTags = buildHeroTags(product, classifications, featuredSpecs);
  const quickFacts = buildQuickFacts(
    product,
    featuredSpecs,
    bestFor,
    category,
    recommendations,
  );

  return {
    product,
    brand,
    family,
    familyMembers,
    newerGeneration,
    olderGeneration,
    category,
    sports: graph.sports.filter((s): s is Sport => Boolean(s)),
    subcategories,
    classifications: [...new Set(classifications)].slice(0, 5),
    useCases: graph.useCases.filter((u): u is UseCase => Boolean(u)),
    config,
    specDefs,
    featuredSpecs,
    specGroups,
    recommendations,
    hasStructuredRecommendations,
    showScore,
    scoreExplainFactors: [...factorMap.values()],
    bestFor,
    notIdealFor,
    buyIf,
    skipIf,
    evidence: graph.evidence,
    hasPersonalTest: graph.evidence.some((e) => e.type === "personal-test"),
    offers,
    offersOtherRegions,
    lowestPrice,
    region,
    regionLabel: REGION_META[region].label,
    review,
    comparisons: graph.comparisons,
    comparisonNames,
    alternatives,
    bestGuides: graph.bestGuides,
    buyingGuides: graph.buyingGuides,
    tools,
    faqs,
    breadcrumbs,
    productStale: isProductDataStale(product.lastVerifiedAt),
    verdict: product.verdict
      ? rewriteUniquenessEraSkipProse(product.verdict)
      : product.verdict,
    galleryImages,
    heroTags,
    quickFacts,
    variants: getVariantsForProduct(product.id),
  };
}

function buildGalleryImages(product: Product): MediaAsset[] {
  const out: MediaAsset[] = [];
  const seen = new Set<string>();
  const primary = getPrimaryProductMedia(product);
  if (primary) {
    out.push(primary);
    seen.add(primary.src);
  }
  for (const img of product.images ?? []) {
    if (!isAuthenticProductMedia(img)) continue;
    if (seen.has(img.src)) continue;
    out.push(img);
    seen.add(img.src);
  }
  return out;
}

function buildHeroTags(
  product: Product,
  classifications: string[],
  featuredSpecs: SpecDisplayRow[],
): string[] {
  const tags: string[] = [];
  for (const c of classifications) {
    if (c.includes(",")) continue;
    const cleaned = c
      .replace(/Daily Trainers/i, "Daily Trainer")
      .replace(/Max Cushion/i, "Max Cushion");
    if (!tags.includes(cleaned)) tags.push(cleaned);
    if (tags.length >= 3) break;
  }
  const drop = featuredSpecs.find((s) => s.key === "drop");
  if (drop) tags.push(`${drop.value}mm Drop`);
  const weight = featuredSpecs.find((s) => s.key === "weight");
  if (weight) {
    const unit = weight.unit ?? "g";
    // Preserve sample context when only a single reference weight exists
    tags.push(`${weight.value}${unit}`);
  }
  return tags.slice(0, 5);
}

function buildQuickFacts(
  product: Product,
  featuredSpecs: SpecDisplayRow[],
  bestFor: string[],
  category?: ProductCategory,
  _recommendations: UseCaseScoreRow[] = [],
): { id: string; label: string; value: string }[] {
  const facts: { id: string; label: string; value: string }[] = [];
  const isShoe = product.categoryId === "cat-running-shoes";
  const isWatch = product.categoryId === "cat-gps-watches";

  const bestForValue = bestFor[0] ?? "";

  if (bestForValue) {
    facts.push({
      id: "best-for",
      label: "Best for",
      value: bestForValue,
    });
  }

  if (isShoe) {
    const stability = featuredSpecs.find((s) => s.key === "stability");
    if (stability) {
      facts.push({
        id: "runner-type",
        label: "Runner type",
        value: `${stability.value} gait`,
      });
    }
    const terrain = featuredSpecs.find((s) => s.key === "terrain");
    if (terrain) {
      facts.push({
        id: "surfaces",
        label: "Surfaces",
        value: terrain.value,
      });
    }
  } else if (isWatch) {
    const battery = featuredSpecs.find(
      (s) => s.key === "batteryGps" || s.key === "batterySmartwatch",
    );
    if (battery) {
      facts.push({
        id: "battery",
        label: "Battery",
        value: battery.unit
          ? `${battery.value} ${battery.unit}`
          : battery.value,
      });
    }
    const maps = featuredSpecs.find((s) => s.key === "maps");
    if (maps) {
      facts.push({ id: "maps", label: "Maps", value: maps.value });
    }
  } else if (category) {
    facts.push({
      id: "category",
      label: "Category",
      value: category.name,
    });
  }

  if (product.releaseDate) {
    facts.push({
      id: "release",
      label: "Release date",
      value: new Date(product.releaseDate).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      }),
    });
  }

  return facts.slice(0, 4);
}
