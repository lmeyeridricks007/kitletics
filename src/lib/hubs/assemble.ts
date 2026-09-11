import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { SportHubConfig, SportHubData, RecentlyUpdatedItem } from "@/lib/hubs/types";
import { fitnessHubConfig } from "@/lib/hubs/fitness";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import {
  getSportBySlug,
  getCategoriesBySport,
  getCategoryById,
  getSubcategoryById,
  getUseCaseById,
  getDisciplineById,
  getProductsBySport,
  getProductsByCategory,
  getBrandById,
  getLowestOfferPrice,
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getGearSetups,
  getTools,
  getToolBySlug,
  getReviews,
  getProductById,
} from "@/repositories";
import {
  getLaunchEligibility,
  shouldPromotePublicly,
  isLaunchListable,
} from "@/domain/launch";

/**
 * Assemble-style hubs only (fitness).
 * Running / padel use `lib/sport-hub` declarative configs — do not re-add them here.
 */
const HUB_CONFIGS: Record<string, SportHubConfig> = {
  fitness: fitnessHubConfig,
};

export function getSportHubConfig(sportSlug: string): SportHubConfig | undefined {
  return HUB_CONFIGS[sportSlug];
}

export function hasSportHub(sportSlug: string): boolean {
  return Boolean(HUB_CONFIGS[sportSlug]);
}

function sortByUpdatedDesc<T extends { updatedAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

/**
 * Resolve a sport hub config into presentation-ready data via repositories.
 * Unpublished / scheduled content is excluded by repository publication gates.
 */
export function assembleSportHubData(
  sportSlug: string,
  options?: PublishResolverOptions,
): SportHubData | undefined {
  const config = getSportHubConfig(sportSlug);
  if (!config) return undefined;

  const sport = getSportBySlug(sportSlug, options);
  if (!sport) return undefined;

  const allCategories = getCategoriesBySport(sport.id, options);
  const products = getProductsBySport(sport.id, options).filter((p) =>
    isLaunchListable(
      getLaunchEligibility({ kind: "product", entity: p }, options),
    ),
  );

  const categoryCounts: Record<string, number> = {};
  const categoryHrefs: Record<string, string> = {};
  for (const cat of allCategories) {
    categoryCounts[cat.id] = products.filter((p) => p.categoryId === cat.id).length;
    categoryHrefs[cat.id] = `/${sport.slug}/${cat.pathSegment}`;
  }

  const primaryCategories = config.primaryCategoryIds
    .map((id) => getCategoryById(id, options))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .filter((c) => getProductsByCategory(c.id, options).length > 0);

  const shoeTypes = config.shoeTypeIds
    .map((id) => getSubcategoryById(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const useCases = config.featuredUseCaseIds
    .map((id) => {
      const uc = getUseCaseById(id);
      if (!uc) return undefined;
      const href =
        config.useCaseHrefs?.[id] ??
        `/search?q=${encodeURIComponent(uc.name)}`;
      return { ...uc, href };
    })
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  const disciplines = config.featuredDisciplineIds
    .map((id) => {
      const d = getDisciplineById(id, options);
      if (!d) return undefined;
      return {
        ...d,
        gearCopy: config.disciplineGearCopy?.[id] ?? d.description,
      };
    })
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  // Featured products: prefer scored items across primary categories
  const featuredPool: typeof products = [];
  const seen = new Set<string>();
  for (const catId of config.primaryCategoryIds) {
    const inCat = products
      .filter((p) => p.categoryId === catId)
      .sort(
        (a, b) =>
          (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0),
      );
    for (const p of inCat.slice(0, 2)) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        featuredPool.push(p);
      }
    }
  }
  const featuredProducts = featuredPool.slice(0, 6);

  const productMeta: SportHubData["productMeta"] = {};
  for (const product of products) {
    const brand = getBrandById(product.brandId, options);
    const cat = getCategoryById(product.categoryId, options);
    const price = getLowestOfferPrice(product.id);
    productMeta[product.id] = {
      brandName: brand?.name,
      categoryName: cat?.name,
      price: price ?? undefined,
      recommendationLabel: product.strengths[0],
    };
  }

  const categoryRows = config.recommendationCategoryIds
    .map((id) => {
      const category = getCategoryById(id, options);
      if (!category) return undefined;
      const rowProducts = getProductsByCategory(id, options)
        .sort(
          (a, b) =>
            (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0),
        )
        .slice(0, 4);
      if (rowProducts.length < config.recommendationMinProducts) return undefined;
      return { category, products: rowProducts };
    })
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  const bestGuides = getBestGuides(options).filter(
    (g) =>
      g.sportId === sport.id &&
      isLaunchListable(
        getLaunchEligibility({ kind: "best-guide", entity: g }, options),
      ),
  );
  const buyingGuides = getBuyingGuides(options).filter(
    (g) =>
      g.sportId === sport.id &&
      isLaunchListable(
        getLaunchEligibility({ kind: "buying-guide", entity: g }, options),
      ),
  );

  const sportProductIds = new Set(products.map((p) => p.id));
  const comparisons = getComparisons(options).filter(
    (c) =>
      c.productIds.every((id) => sportProductIds.has(id)) &&
      isLaunchListable(
        getLaunchEligibility({ kind: "comparison", entity: c }, options),
      ),
  );
  const comparisonProductNames: Record<string, string[]> = {};
  for (const cmp of comparisons) {
    comparisonProductNames[cmp.id] = cmp.productIds
      .map((id) => getProductById(id, options)?.name)
      .filter((n): n is string => Boolean(n));
  }
  const featuredComparison =
    comparisons[0] && comparisonProductNames[comparisons[0].id]?.length === 2
      ? {
          comparison: comparisons[0],
          productNames: comparisonProductNames[comparisons[0].id],
        }
      : undefined;

  const tools = config.featuredToolSlugs
    .map((slug) => getToolBySlug(slug, options))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .filter((t) => t.sportIds.includes(sport.id))
    .filter((t) => t.available)
    .filter((t) =>
      isLaunchListable(
        getLaunchEligibility({ kind: "tool", entity: t }, options),
      ),
    );

  // Fallback: any sport tools if config empty
  const resolvedTools =
    tools.length > 0
      ? tools
      : getTools(options).filter(
          (t) =>
            t.sportIds.includes(sport.id) &&
            isLaunchListable(
              getLaunchEligibility({ kind: "tool", entity: t }, options),
            ),
        );

  const setups = config.featuredSetupSlugs
    .map((slug) =>
      getGearSetups(options).find(
        (s) => s.slug === slug && s.sportId === sport.id,
      ),
    )
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .filter((s) =>
      isLaunchListable(
        getLaunchEligibility({ kind: "setup", entity: s }, options),
      ),
    );

  const brandIds = [...new Set(products.map((p) => p.brandId))];
  const brands = brandIds
    .map((id) => getBrandById(id, options))
    .filter((b): b is NonNullable<typeof b> => Boolean(b))
    .sort((a, b) => a.name.localeCompare(b.name));

  const reviews = getReviews(options)
    .map((review) => {
      const product = getProductById(review.productId, options);
      if (!product || !product.sportIds.includes(sport.id)) return undefined;
      if (
        !shouldPromotePublicly(
          getLaunchEligibility({ kind: "review", entity: review }, options),
        )
      ) {
        return undefined;
      }
      return { review, productName: product.fullName };
    })
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  const recentlyUpdated: RecentlyUpdatedItem[] = sortByUpdatedDesc([
    ...bestGuides.map((g) => ({
      id: g.id,
      kind: "best-guide" as const,
      title: g.title,
      href: `/best/${g.slug}`,
      updatedAt: g.updatedAt,
      summary: g.intro,
    })),
    ...comparisons.map((c) => ({
      id: c.id,
      kind: "comparison" as const,
      title: c.title,
      href: `/compare/${c.slug}`,
      updatedAt: c.updatedAt,
      summary: c.summary,
    })),
    ...reviews.map(({ review, productName }) => ({
      id: review.id,
      kind: "review" as const,
      title: `${productName} Review`,
      href: `/reviews/${review.slug}`,
      updatedAt: review.updatedAt,
      summary: review.summary,
    })),
    ...buyingGuides.map((g) => ({
      id: g.id,
      kind: "buying-guide" as const,
      title: g.title,
      href: `/guides/${g.slug}`,
      updatedAt: g.updatedAt,
      summary: g.sections[0]?.body,
    })),
  ]).slice(0, 6);

  return {
    sport,
    config,
    breadcrumbs: resolveBreadcrumbs({ type: "sport", sportSlug: sport.slug }),
    primaryCategories,
    allCategories,
    categoryCounts,
    categoryHrefs,
    shoeTypes,
    useCases,
    disciplines,
    featuredProducts,
    productMeta,
    categoryRows,
    bestGuides,
    buyingGuides,
    comparisons,
    comparisonProductNames,
    featuredComparison,
    tools: resolvedTools,
    primaryTool: resolvedTools[0],
    setups,
    brands,
    recentlyUpdated,
    reviews,
  };
}
