import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  getProducts,
  getBrandById,
  getProductFamilyById,
  getCategoryById,
} from "@/repositories";
import {
  getComparisonCandidateRelationships,
  getDirectCompetitors,
  getGenerationRelationships,
} from "@/repositories/relationships";
import type {
  CompareCategoryOption,
  CompareProductIndexItem,
} from "@/lib/comparison/product-index-types";
import { searchCompareProducts as searchCompareProductsPure } from "@/lib/comparison/product-index-search";

export type {
  CompareCategoryOption,
  CompareProductIndexItem,
} from "@/lib/comparison/product-index-types";

export { findIndexItemsBySlugs } from "@/lib/comparison/product-index-search";

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Lightweight product index for Compare Builder selectors.
 * No specs, offers, or reviews — keep payloads small.
 * Server-only (imports repositories).
 */
export function buildCompareProductIndex(
  options?: PublishResolverOptions,
): CompareProductIndexItem[] {
  return getProducts(options).map((p) => {
    const brand = getBrandById(p.brandId, options);
    const family = p.familyId
      ? getProductFamilyById(p.familyId)
      : undefined;
    const category = getCategoryById(p.categoryId, options);
    const keywords = normalize(
      [
        p.name,
        p.fullName,
        p.slug,
        brand?.name,
        family?.name,
        p.generation,
      ]
        .filter(Boolean)
        .join(" "),
    );

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      fullName: p.fullName,
      brandId: p.brandId,
      brandName: brand?.name ?? "",
      familyId: p.familyId,
      familyName: family?.name,
      categoryId: p.categoryId,
      categorySlug: category?.slug ?? "",
      categoryName: category?.name ?? "",
      generation: p.generation,
      lifecycleStatus: p.lifecycleStatus,
      thumbnailSrc: p.images[0]?.src,
      thumbnailAlt: p.images[0]?.alt,
      keywords,
    };
  });
}

export function getCompareCategoryOptions(
  index: CompareProductIndexItem[],
  options?: PublishResolverOptions,
): CompareCategoryOption[] {
  const byCat = new Map<string, CompareProductIndexItem[]>();
  for (const item of index) {
    const list = byCat.get(item.categoryId) ?? [];
    list.push(item);
    byCat.set(item.categoryId, list);
  }

  const categories = [...byCat.entries()]
    .map(([categoryId, items]) => {
      const cat = getCategoryById(categoryId, options);
      return {
        id: categoryId,
        slug: cat?.slug ?? items[0]?.categorySlug ?? categoryId,
        name: cat?.name ?? items[0]?.categoryName ?? categoryId,
        productCount: items.length,
        ready: items.length >= 2,
      };
    })
    .sort((a, b) => {
      if (a.ready !== b.ready) return a.ready ? -1 : 1;
      // Prefer launch vertical (running shoes) as default builder category
      const prefer = (slug: string) =>
        slug === "running-shoes" ? 0 : slug === "gps-watches" ? 1 : 2;
      const pref = prefer(a.slug) - prefer(b.slug);
      if (pref !== 0) return pref;
      return a.name.localeCompare(b.name);
    });

  return categories;
}

/**
 * Server-friendly search that can inject relationship priority when query empty.
 * Prefer `product-index-search` from client components.
 */
export function searchCompareProducts(
  index: CompareProductIndexItem[],
  query: string,
  opts: {
    categoryId?: string;
    excludeIds?: string[];
    limit?: number;
  } = {},
): CompareProductIndexItem[] {
  const priorityIds: string[] = [];
  if (!query.trim() && opts.excludeIds?.[0]) {
    const selectedId = opts.excludeIds[0];
    for (const r of [
      ...getDirectCompetitors(selectedId),
      ...getComparisonCandidateRelationships(selectedId),
      ...getGenerationRelationships(selectedId),
    ]) {
      priorityIds.push(r.targetProductId);
    }
  }
  return searchCompareProductsPure(index, query, { ...opts, priorityIds });
}
