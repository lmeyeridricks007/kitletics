import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { DEFAULT_REGION, type RegionCode } from "@/domain/shared/types";
import type { CatalogFilterState, CatalogQueryResult } from "@/lib/catalog/types";
import {
  getCategoryPageConfig,
  runningShoesCategoryConfig,
} from "@/lib/catalog/running-shoes";
import { getCatalogProducts } from "@/lib/catalog/query";
import { parseCatalogSearchParams } from "@/lib/catalog/params";
import { isListableCatalogProduct } from "@/lib/catalog/listable-products";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import {
  getSportBySlug,
  getCategoryByPathSegment,
  getSubcategoriesByCategory,
  getUseCaseById,
  getBrandById,
  getProductById,
  getLowestOfferPrice,
  getBestGuides,
  getComparisons,
  getBuyingGuides,
  getTools,
  getFaqsByIds,
  getProductsByCategory,
} from "@/repositories";
import type { ProductCategoryPageConfig } from "@/lib/catalog/types";
import type { Sport, ProductCategory, ProductSubcategory, UseCase } from "@/domain/sports/types";
import type { BestGuide, BuyingGuide, Comparison, FAQ } from "@/domain/editorial/types";
import type { Tool } from "@/domain/tools/types";
import type { Brand, Product } from "@/domain/products/types";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import {
  toPublicSpecifications,
  toPublicSpecKeyList,
  publicSpecRowKey,
} from "@/lib/specs/public-label";
import {
  toPublicCatalogFilterState,
  toPublicComparisonCriteria,
  toPublicEditorialGuide,
} from "@/lib/specs/public-payload";

export interface AssembledCategoryPage {
  sport: Sport;
  category: ProductCategory;
  config: ProductCategoryPageConfig;
  basePath: string;
  breadcrumbs: { label: string; href?: string }[];
  filters: CatalogFilterState;
  catalog: CatalogQueryResult;
  subcategories: ProductSubcategory[];
  featuredSubcategories: (ProductSubcategory & { productCount: number })[];
  otherSubcategories: (ProductSubcategory & { productCount: number })[];
  goalUseCases: (UseCase & { href: string })[];
  runnerUseCases: (UseCase & { href: string })[];
  picks: {
    label: string;
    product: Product;
    brandName?: string;
    rationale?: string;
    price?: { price: number; currency: string };
  }[];
  bestGuides: BestGuide[];
  comparisons: Comparison[];
  comparisonNames: Record<string, string[]>;
  buyingGuides: BuyingGuide[];
  tools: Tool[];
  brands: { brand: Brand; count: number }[];
  faqs: FAQ[];
  productCount: number;
  subcategoryCount: number;
  updatedAt: string;
  region: RegionCode;
}

function buildDefaultConfig(
  sport: Sport,
  category: ProductCategory,
): ProductCategoryPageConfig {
  const shoeLike =
    /shoe|shoes|clothing|apparel|vest|pack/i.test(category.slug) ||
    /shoe|shoes|clothing|vest|pack/i.test(category.name);

  const watchLike = /watch|hrm|heart/i.test(category.slug + category.name);
  const accessoryLike =
    /headphone|sunglass|light|safety|belt|sock|nutrition|fuel|recovery|hydrat/i.test(
      category.slug + category.name,
    );

  return {
    sportSlug: sport.slug,
    categorySlug: category.slug,
    hero: {
      title: category.name,
      description: category.description,
      primaryCta: {
        label: `Browse ${category.name}`,
        href: `#catalog`,
      },
      secondaryCta: {
        label: "Compare",
        href: `/compare?category=${category.slug}`,
      },
    },
    featuredSubcategoryIds: [],
    goalUseCaseIds: [],
    runnerUseCaseIds: [],
    featuredToolSlugs: [],
    primaryFilterKeys: shoeLike
      ? ["genderFit", "brand", "price"]
      : watchLike || accessoryLike
        ? ["brand", "price"]
        : ["brand", "price"],
    educationFactors: [],
    terminology: [],
    faqIds: [],
    defaultSort: "recommended",
  };
}

export function assembleCategoryPage(input: {
  sportSlug: string;
  pathSegment: string;
  searchParams?: Record<string, string | string[] | undefined>;
  region?: RegionCode;
  options?: PublishResolverOptions;
}): AssembledCategoryPage | undefined {
  const sport = getSportBySlug(input.sportSlug, input.options);
  if (!sport) return undefined;

  const category = getCategoryByPathSegment(
    sport.id,
    input.pathSegment,
    input.options,
  );
  if (!category) return undefined;

  const config =
    getCategoryPageConfig(sport.slug, category.slug) ??
    buildDefaultConfig(sport, category);

  const region = input.region ?? DEFAULT_REGION;
  const filters = parseCatalogSearchParams(
    input.searchParams ?? {},
    config.defaultSort,
  );

  const catalog = getCatalogProducts(
    {
      sportId: sport.id,
      categoryId: category.id,
      filters,
      region,
      unpaginated: true,
    },
    input.options,
  );

  const allProducts = getProductsByCategory(category.id, input.options).filter(
    (p) =>
      p.sportIds.includes(sport.id) &&
      isListableCatalogProduct(p, input.options),
  );

  const subcategories = getSubcategoriesByCategory(category.id);
  const withCounts = subcategories.map((sub) => ({
    ...sub,
    productCount: allProducts.filter((p) =>
      p.subcategoryIds.includes(sub.id),
    ).length,
  }));

  const featuredIds = new Set(config.featuredSubcategoryIds);
  const featuredSubcategories = (
    config.featuredSubcategoryIds.length > 0
      ? config.featuredSubcategoryIds
          .map((id) => withCounts.find((s) => s.id === id))
          .filter((s): s is NonNullable<typeof s> => Boolean(s))
      : withCounts.slice(0, 8)
  );

  const otherSubcategories = withCounts.filter(
    (s) => !featuredIds.has(s.id) && featuredIds.size > 0,
  );

  const goalUseCases = config.goalUseCaseIds
    .map((id) => {
      const uc = getUseCaseById(id);
      if (!uc) return undefined;
      return {
        ...uc,
        href: `/${sport.slug}/${category.pathSegment}?usecase=${uc.slug}`,
      };
    })
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  const runnerUseCases = config.runnerUseCaseIds
    .map((id) => {
      const uc = getUseCaseById(id);
      if (!uc) return undefined;
      return {
        ...uc,
        href:
          config.runnerUseCaseHrefs?.[id] ??
          `/${sport.slug}/${category.pathSegment}?usecase=${uc.slug}`,
      };
    })
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  const picks = (config.picks ?? [])
    .map((pick) => {
      const product = getProductById(pick.productId, input.options);
      if (!product) return undefined;
      return {
        label: pick.label,
        product,
        brandName: getBrandById(product.brandId, input.options)?.name,
        rationale: pick.rationale,
        price: getLowestOfferPrice(product.id, region, input.options),
      };
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const productIds = new Set(allProducts.map((p) => p.id));

  const bestGuides = getBestGuides(input.options).filter(
    (g) => g.categoryId === category.id || g.sportId === sport.id,
  ).filter((g) => g.categoryId === category.id).filter((g) =>
    isIndexableEligibility(
      getLaunchEligibility({ kind: "best-guide", entity: g }, input.options),
    ),
  );

  const comparisons = getComparisons(input.options).filter((c) =>
    c.productIds.every((id) => productIds.has(id)),
  ).filter((c) =>
    isIndexableEligibility(
      getLaunchEligibility({ kind: "comparison", entity: c }, input.options),
    ),
  );
  const comparisonNames: Record<string, string[]> = {};
  for (const cmp of comparisons) {
    comparisonNames[cmp.id] = cmp.productIds
      .map((id) => getProductById(id, input.options)?.name)
      .filter((n): n is string => Boolean(n));
  }

  const buyingGuides = getBuyingGuides(input.options).filter(
    (g) => g.categoryId === category.id,
  ).filter((g) =>
    isIndexableEligibility(
      getLaunchEligibility({ kind: "buying-guide", entity: g }, input.options),
    ),
  );

  const tools = config.featuredToolSlugs
    .map((slug) => getTools(input.options).find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .filter((t) => t.available);

  const brandCounts = new Map<string, number>();
  for (const p of allProducts) {
    brandCounts.set(p.brandId, (brandCounts.get(p.brandId) ?? 0) + 1);
  }
  const brands = [...brandCounts.entries()]
    .map(([id, count]) => {
      const brand = getBrandById(id, input.options);
      return brand ? { brand, count } : undefined;
    })
    .filter((b): b is NonNullable<typeof b> => Boolean(b))
    .sort((a, b) => b.count - a.count || a.brand.name.localeCompare(b.brand.name));

  const faqs = getFaqsByIds(config.faqIds);

  const updatedAt = [
    category.updatedAt,
    ...allProducts.map((p) => p.updatedAt),
  ].sort()
    .reverse()[0];

  return {
    sport,
    category,
    config: {
      ...config,
      primaryFilterKeys: toPublicSpecKeyList(config.primaryFilterKeys),
      numericBuckets: config.numericBuckets
        ? Object.fromEntries(
            Object.entries(config.numericBuckets).map(([k, v]) => [
              publicSpecRowKey(k),
              v,
            ]),
          )
        : config.numericBuckets,
    },
    basePath: `/${sport.slug}/${category.pathSegment}`,
    breadcrumbs: resolveBreadcrumbs({
      type: "sport-segment",
      sportSlug: sport.slug,
      segment: category.pathSegment,
    }),
    filters: toPublicCatalogFilterState(filters),
    catalog,
    subcategories,
    featuredSubcategories,
    otherSubcategories,
    goalUseCases,
    runnerUseCases,
    picks: picks.map((p) => ({
      ...p,
      product: {
        ...p.product,
        specifications: toPublicSpecifications(
          p.product.specifications as Record<string, unknown>,
        ) as typeof p.product.specifications,
      },
    })),
    bestGuides: bestGuides.map(toPublicEditorialGuide),
    comparisons: comparisons.map(toPublicComparisonCriteria),
    comparisonNames,
    buyingGuides: buyingGuides.map(toPublicEditorialGuide),
    tools,
    brands,
    faqs,
    productCount: allProducts.length,
    subcategoryCount: subcategories.length,
    updatedAt,
    region,
  };
}

export { runningShoesCategoryConfig, getCategoryPageConfig };
