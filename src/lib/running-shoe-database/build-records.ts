import type { Product, SpecValue } from "@/domain/products/types";
import type { AudienceFit } from "@/domain/products/types";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  getProductsByCategory,
  getBrandById,
  getProductFamilyById,
  getVariantsForProduct,
  getLowestOfferPrice,
  getSubcategoriesByCategory,
  getUseCaseById,
} from "@/repositories";
import { getReviewByProduct, getComparisons } from "@/repositories/editorial";
import { getAllProductRelationships } from "@/repositories/relationships";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { getProductAudiences } from "@/lib/product/audience";
import {
  RUNNING_SHOE_CATEGORY_ID,
  RUNNING_SHOE_CATEGORY_SLUG,
  RUNNING_SPORT_ID,
} from "@/lib/running-shoe-database/constants";
import { DATABASE_PRIMARY_USE_PRIORITY } from "@/lib/running-shoe-database/params";
import { isRunningShoeDatabaseEligible } from "@/lib/running-shoe-database/eligibility";
import { withValidStatisticMetric } from "@/lib/running-shoe-database/quality";
import type {
  RunningShoeDatabaseInsights,
  RunningShoeDatabaseRecord,
} from "@/lib/running-shoe-database/types";

function asNumber(value: SpecValue | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asString(value: SpecValue | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asBoolean(value: SpecValue | undefined): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asStringList(value: SpecValue | undefined): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string" && v.length > 0);
  }
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

function asAudienceList(value: SpecValue | undefined): AudienceFit[] {
  return asStringList(value).filter(
    (v): v is AudienceFit =>
      v === "men" || v === "women" || v === "unisex",
  );
}

function releaseYear(iso?: string): number | undefined {
  if (!iso) return undefined;
  const y = new Date(iso).getFullYear();
  return Number.isFinite(y) && y >= 1990 && y <= 2100 ? y : undefined;
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
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

export function getEligibleRunningShoes(
  options?: PublishResolverOptions,
): Product[] {
  return getProductsByCategory(RUNNING_SHOE_CATEGORY_ID, options).filter(
    (p) =>
      p.sportIds.includes(RUNNING_SPORT_ID) &&
      isRunningShoeDatabaseEligible(p, options),
  );
}

export function buildRunningShoeDatabaseRecord(
  product: Product,
  ctx: {
    region: RegionCode;
    options?: PublishResolverOptions;
    subcategoryNameById: Record<string, string>;
    subcategorySlugById: Record<string, string>;
    productsInComparisons: Set<string>;
    productsWithAlts: Set<string>;
  },
): RunningShoeDatabaseRecord | null {
  if (!isRunningShoeDatabaseEligible(product, ctx.options)) return null;

  const brand = getBrandById(product.brandId, ctx.options);
  if (!brand) return null;

  const family = product.familyId
    ? getProductFamilyById(product.familyId)
    : undefined;
  const variants = getVariantsForProduct(product.id);
  const audiences = getProductAudiences(product, variants);
  const genderFit = asAudienceList(product.specifications.genderFit);
  const media = getPrimaryProductMedia(product);
  const plate = asBoolean(product.specifications.plate);
  const plateMaterial = asString(product.specifications.plateMaterial);
  const carbonPlated = plate === true && plateMaterial === "carbon";
  const price = getLowestOfferPrice(product.id, ctx.region, ctx.options);
  const review = getReviewByProduct(product.id, ctx.options);
  const reviewSlug =
    review && review.status === "published" ? review.slug : undefined;

  const typeSlugs: string[] = [];
  const typeLabels: string[] = [];
  for (const id of product.subcategoryIds) {
    const slug = ctx.subcategorySlugById[id];
    const label = ctx.subcategoryNameById[id];
    if (slug && label) {
      typeSlugs.push(slug);
      typeLabels.push(label);
    }
  }

  const useCaseSlugs: string[] = [];
  const useCaseLabels: string[] = [];
  for (const id of product.useCaseIds) {
    const uc = getUseCaseById(id);
    if (uc) {
      useCaseSlugs.push(uc.slug);
      useCaseLabels.push(uc.name);
    }
  }

  let primaryUseSlug: string | undefined;
  let primaryUseLabel: string | undefined;
  for (const preferred of DATABASE_PRIMARY_USE_PRIORITY) {
    const idx = useCaseSlugs.indexOf(preferred);
    if (idx >= 0) {
      primaryUseSlug = useCaseSlugs[idx];
      primaryUseLabel = useCaseLabels[idx];
      break;
    }
  }
  if (!primaryUseSlug && useCaseSlugs[0]) {
    primaryUseSlug = useCaseSlugs[0];
    primaryUseLabel = useCaseLabels[0];
  }

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    fullName: product.fullName,
    brandId: brand.id,
    brandSlug: brand.slug,
    brandName: brand.name,
    categoryId: RUNNING_SHOE_CATEGORY_ID,
    categorySlug: RUNNING_SHOE_CATEGORY_SLUG,
    familyId: family?.id,
    familyName: family?.name,
    familySlug: family?.slug,
    generation: product.generation || undefined,
    typeSlugs,
    typeLabels,
    useCaseSlugs,
    useCaseLabels,
    primaryUseSlug,
    primaryUseLabel,
    audiences,
    genderFit: genderFit.length > 0 ? genderFit : audiences,
    image: media
      ? { src: media.src, alt: media.alt || product.fullName }
      : undefined,
    weightG: asNumber(product.specifications.weight),
    heelStackMm: asNumber(product.specifications.heelStack),
    forefootStackMm: asNumber(product.specifications.forefootStack),
    dropMm: asNumber(product.specifications.drop),
    cushionLevel: asString(product.specifications.cushionLevel),
    cushionFeel: asString(product.specifications.cushionFeel),
    stability: asString(product.specifications.stability),
    plate,
    plateMaterial,
    carbonPlated,
    terrain: asStringList(product.specifications.terrain),
    surface: asStringList(product.specifications.surface),
    recommendedDistance: asStringList(
      product.specifications.recommendedDistance,
    ),
    trainingTypes: asStringList(product.specifications.trainingTypes),
    widthOptions: asStringList(product.specifications.widthOptions),
    score: product.recommendationScore,
    valueScore: product.valueScore,
    price: price
      ? { amount: price.price, currency: price.currency }
      : undefined,
    reviewSlug,
    hasAlternatives: ctx.productsWithAlts.has(product.id),
    inComparison: ctx.productsInComparisons.has(product.id),
    productHref: `/products/${product.slug}`,
    releaseYear: releaseYear(product.releaseDate),
  };
}

export function buildRunningShoeDatabaseInsights(
  records: RunningShoeDatabaseRecord[],
): RunningShoeDatabaseInsights {
  const brands = new Set(records.map((r) => r.brandId));
  const weights = withValidStatisticMetric(
    records,
    "weight",
    (r) => r.weightG,
  ).map((x) => x.value);
  const drops = withValidStatisticMetric(records, "drop", (r) => r.dropMm).map(
    (x) => x.value,
  );
  const stacks = withValidStatisticMetric(
    records,
    "heelStack",
    (r) => r.heelStackMm,
  ).map((x) => x.value);

  const typeMap = new Map<string, { label: string; count: number }>();
  for (const r of records) {
    r.typeSlugs.forEach((slug, i) => {
      const label = r.typeLabels[i] ?? slug;
      const prev = typeMap.get(slug);
      typeMap.set(slug, {
        label,
        count: (prev?.count ?? 0) + 1,
      });
    });
  }

  return {
    total: records.length,
    brandCount: brands.size,
    carbonPlatedCount: records.filter((r) => r.carbonPlated).length,
    platedCount: records.filter((r) => r.plate === true).length,
    withPriceCount: records.filter((r) => r.price).length,
    withReviewCount: records.filter((r) => r.reviewSlug).length,
    avgWeightG: avg(weights),
    avgDropMm: avg(drops),
    avgHeelStackMm: avg(stacks),
    cushionBreakdown: breakdown(
      records
        .map((r) => r.cushionLevel)
        .filter((v): v is string => Boolean(v)),
    ),
    stabilityBreakdown: breakdown(
      records
        .map((r) => r.stability)
        .filter((v): v is string => Boolean(v)),
    ),
    terrainBreakdown: breakdown(records.flatMap((r) => r.terrain)),
    typeBreakdown: [...typeMap.entries()]
      .map(([value, { label, count }]) => ({ value, label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    market: {
      total: records.length,
      brandCount: brands.size,
      dailyTrainers: records.filter((r) =>
        r.typeSlugs.includes("daily-trainers"),
      ).length,
      raceShoes: records.filter((r) => r.typeSlugs.includes("race")).length,
      trailShoes: records.filter((r) => r.typeSlugs.includes("trail")).length,
    },
  };
}

export function getRunningShoeDatabaseRecords(
  region: RegionCode = DEFAULT_REGION,
  options?: PublishResolverOptions,
): RunningShoeDatabaseRecord[] {
  const products = getEligibleRunningShoes(options);
  const subcategories = getSubcategoriesByCategory(RUNNING_SHOE_CATEGORY_ID);
  const subcategoryNameById = Object.fromEntries(
    subcategories.map((s) => [s.id, s.name]),
  );
  const subcategorySlugById = Object.fromEntries(
    subcategories.map((s) => [s.id, s.slug]),
  );

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
    subcategoryNameById,
    subcategorySlugById,
    productsInComparisons,
    productsWithAlts,
  };

  const records: RunningShoeDatabaseRecord[] = [];
  for (const p of products) {
    const row = buildRunningShoeDatabaseRecord(p, ctx);
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
