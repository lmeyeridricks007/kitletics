import type { Product, SpecValue } from "@/domain/products/types";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  getProductsByCategory,
  getBrandById,
  getProductFamilyById,
  getLowestOfferPrice,
  getUseCaseById,
} from "@/repositories";
import { getReviewByProduct, getComparisons } from "@/repositories/editorial";
import { getAllProductRelationships } from "@/repositories/relationships";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { getPadelRacketDecisionAttributes } from "@/content/padel/rackets";
import {
  PADEL_RACKET_CATEGORY_ID,
  PADEL_RACKET_COMPARE_CATEGORY_SLUG,
  PADEL_SPORT_ID,
} from "@/lib/padel-racket-database/constants";
import { isPadelRacketDatabaseEligible } from "@/lib/padel-racket-database/eligibility";
import {
  PRICE_BUCKETS,
  WEIGHT_BUCKETS,
  inRangeBucket,
} from "@/lib/padel-racket-database/params";
import { knownWeightMinG } from "@/lib/padel-racket-database/quality";
import type {
  PadelRacketDatabaseInsights,
  PadelRacketDatabaseRecord,
} from "@/lib/padel-racket-database/types";

function asNumber(value: SpecValue | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asString(value: SpecValue | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function decisionScore(
  productId: string,
  key: "power" | "control" | "comfort" | "maneuverability",
): number | undefined {
  const attrs = getPadelRacketDecisionAttributes(productId);
  const row = attrs?.find((a) => a.key === key);
  if (!row || !Number.isFinite(row.score)) return undefined;
  return row.score;
}

function breakdown(
  values: string[],
): Array<{ value: string; count: number }> {
  const map = new Map<string, number>();
  for (const v of values) {
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function bucketBreakdown(
  values: number[],
  buckets: typeof WEIGHT_BUCKETS,
): Array<{ value: string; count: number }> {
  const counts = new Map<string, number>();
  for (const b of buckets) counts.set(b.id, 0);
  for (const v of values) {
    for (const b of buckets) {
      if (inRangeBucket(v, b)) {
        counts.set(b.id, (counts.get(b.id) ?? 0) + 1);
        break;
      }
    }
  }
  return buckets
    .map((b) => ({ value: b.id, count: counts.get(b.id) ?? 0 }))
    .filter((r) => r.count > 0);
}

export function getEligiblePadelRackets(
  options?: PublishResolverOptions,
): Product[] {
  return getProductsByCategory(PADEL_RACKET_CATEGORY_ID, options).filter(
    (p) =>
      p.sportIds.includes(PADEL_SPORT_ID) &&
      isPadelRacketDatabaseEligible(p, options),
  );
}

export function buildPadelRacketDatabaseRecord(
  product: Product,
  ctx: {
    region: RegionCode;
    options?: PublishResolverOptions;
    productsInComparisons: Set<string>;
    productsWithAlts: Set<string>;
  },
): PadelRacketDatabaseRecord | null {
  if (!isPadelRacketDatabaseEligible(product, ctx.options)) return null;

  const brand = getBrandById(product.brandId, ctx.options);
  if (!brand) return null;

  const family = product.familyId
    ? getProductFamilyById(product.familyId)
    : undefined;
  const media = getPrimaryProductMedia(product);
  const price = getLowestOfferPrice(product.id, ctx.region, ctx.options);
  const review = getReviewByProduct(product.id, ctx.options);
  const reviewSlug =
    review && review.status === "published" ? review.slug : undefined;

  const useCaseSlugs: string[] = [];
  const useCaseLabels: string[] = [];
  for (const id of product.useCaseIds) {
    const uc = getUseCaseById(id);
    if (uc) {
      useCaseSlugs.push(uc.slug);
      useCaseLabels.push(uc.name);
    }
  }

  const specs = product.specifications;
  const balanceRaw = asString(specs.balance);
  const balance =
    balanceRaw === "head-heavy" ? "high" : balanceRaw;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    fullName: product.fullName,
    brandId: brand.id,
    brandSlug: brand.slug,
    brandName: brand.name,
    categoryId: PADEL_RACKET_CATEGORY_ID,
    categorySlug: PADEL_RACKET_COMPARE_CATEGORY_SLUG,
    familyId: family?.id,
    familyName: family?.name,
    familySlug: family?.slug,
    image: media
      ? { src: media.src, alt: media.alt || product.fullName }
      : undefined,
    shape: asString(specs.shape),
    balance,
    weightMinG: asNumber(specs.weightMin),
    weightMaxG: asNumber(specs.weightMax),
    core: asString(specs.core),
    feel: asString(specs.feel),
    faceMaterial: asString(specs.faceMaterial),
    surfaceTexture: asString(specs.surfaceTexture),
    playerLevel: asString(specs.playerLevel),
    playStyleTags: useCaseSlugs,
    powerScore: decisionScore(product.id, "power"),
    controlScore: decisionScore(product.id, "control"),
    comfortScore: decisionScore(product.id, "comfort"),
    maneuverabilityScore: decisionScore(product.id, "maneuverability"),
    price: price
      ? { amount: price.price, currency: price.currency }
      : undefined,
    reviewSlug,
    hasAlternatives: ctx.productsWithAlts.has(product.id),
    inComparison: ctx.productsInComparisons.has(product.id),
    productHref: `/products/${product.slug}`,
    score: product.recommendationScore,
    useCaseSlugs,
    useCaseLabels,
  };
}

export function buildPadelRacketDatabaseInsights(
  records: PadelRacketDatabaseRecord[],
): PadelRacketDatabaseInsights {
  const brands = new Set(records.map((r) => r.brandId));
  const weights = records
    .map(knownWeightMinG)
    .filter((v): v is number => v !== undefined);
  const prices = records
    .map((r) => r.price?.amount)
    .filter((v): v is number => typeof v === "number");

  const brandMap = new Map<string, { label: string; count: number }>();
  for (const r of records) {
    const prev = brandMap.get(r.brandSlug);
    brandMap.set(r.brandSlug, {
      label: r.brandName,
      count: (prev?.count ?? 0) + 1,
    });
  }

  return {
    total: records.length,
    brandCount: brands.size,
    withPriceCount: records.filter((r) => r.price).length,
    withReviewCount: records.filter((r) => r.reviewSlug).length,
    withShapeCount: records.filter((r) => r.shape).length,
    withWeightCount: weights.length,
    shapeBreakdown: breakdown(
      records.map((r) => r.shape).filter((v): v is string => Boolean(v)),
    ),
    balanceBreakdown: breakdown(
      records.map((r) => r.balance).filter((v): v is string => Boolean(v)),
    ),
    weightBreakdown: bucketBreakdown(weights, WEIGHT_BUCKETS),
    materialBreakdown: breakdown(
      records
        .map((r) => r.faceMaterial)
        .filter((v): v is string => Boolean(v)),
    ),
    priceBreakdown: bucketBreakdown(prices, PRICE_BUCKETS),
    brandAssortment: [...brandMap.entries()]
      .map(([value, { label, count }]) => ({ value, label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    market: {
      total: records.length,
      brandCount: brands.size,
      withShape: records.filter((r) => r.shape).length,
      withWeight: weights.length,
      withPrice: records.filter((r) => r.price).length,
    },
  };
}

export function getPadelRacketDatabaseRecords(
  region: RegionCode = DEFAULT_REGION,
  options?: PublishResolverOptions,
): PadelRacketDatabaseRecord[] {
  const products = getEligiblePadelRackets(options);

  const comparisons = getComparisons(options);
  const productsInComparisons = new Set<string>();
  for (const c of comparisons) {
    for (const id of c.productIds ?? []) productsInComparisons.add(id);
  }

  const productsWithAlts = new Set<string>();
  for (const r of getAllProductRelationships()) {
    productsWithAlts.add(r.sourceProductId);
    productsWithAlts.add(r.targetProductId);
  }
  for (const p of products) {
    if (p.alternativeProductIds?.length || p.relatedProductIds?.length) {
      productsWithAlts.add(p.id);
    }
  }

  const ctx = {
    region,
    options,
    productsInComparisons,
    productsWithAlts,
  };

  const records: PadelRacketDatabaseRecord[] = [];
  for (const p of products) {
    const row = buildPadelRacketDatabaseRecord(p, ctx);
    if (row) records.push(row);
  }

  records.sort(
    (a, b) =>
      (b.score ?? 0) - (a.score ?? 0) ||
      a.brandName.localeCompare(b.brandName) ||
      a.name.localeCompare(b.name),
  );

  return records;
}
