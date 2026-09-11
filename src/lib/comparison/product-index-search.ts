import type { CompareProductIndexItem } from "@/lib/comparison/product-index-types";
import type { ProductLifecycleStatus } from "@/domain/products/types";

export type {
  CompareProductIndexItem,
  CompareCategoryOption,
} from "@/lib/comparison/product-index-types";

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Ranked search within a preloaded (already slim) compare index.
 * Pure — safe for client bundles. No repository imports.
 */
export function searchCompareProducts(
  index: CompareProductIndexItem[],
  query: string,
  opts: {
    categoryId?: string;
    excludeIds?: string[];
    limit?: number;
    /** Optional priority product ids (competitors) when query empty */
    priorityIds?: string[];
  } = {},
): CompareProductIndexItem[] {
  const { categoryId, excludeIds = [], limit = 12, priorityIds = [] } = opts;
  const exclude = new Set(excludeIds);
  const q = normalize(query);

  let pool = index.filter((item) => !exclude.has(item.id));
  if (categoryId) {
    pool = pool.filter((item) => item.categoryId === categoryId);
  }

  if (!q) {
    const priority = new Set(priorityIds);
    const rankLife = (s: ProductLifecycleStatus) =>
      s === "current" ? 0 : s === "previous-generation" ? 1 : 2;
    return [...pool]
      .sort((a, b) => {
        const ap = priority.has(a.id) ? 0 : 1;
        const bp = priority.has(b.id) ? 0 : 1;
        if (ap !== bp) return ap - bp;
        const lr = rankLife(a.lifecycleStatus) - rankLife(b.lifecycleStatus);
        if (lr !== 0) return lr;
        return a.fullName.localeCompare(b.fullName);
      })
      .slice(0, limit);
  }

  const scored = pool
    .map((item) => {
      const name = normalize(item.name);
      const full = normalize(item.fullName);
      const brand = normalize(item.brandName);
      const family = normalize(item.familyName ?? "");
      const brandModel = normalize(`${item.brandName} ${item.name}`);

      let score = 0;
      if (name === q || full === q) score = 1000;
      else if (name.startsWith(q) || full.startsWith(q)) score = 800;
      else if (brandModel.startsWith(q) || brandModel.includes(q)) score = 700;
      else if (family && (family === q || family.startsWith(q))) score = 600;
      else if (item.keywords.includes(q)) score = 400;
      else if (brand.startsWith(q)) score = 300;
      else return null;

      if (item.lifecycleStatus === "current") score += 15;
      if (item.lifecycleStatus === "discontinued") score -= 40;

      return { item, score };
    })
    .filter((x): x is { item: CompareProductIndexItem; score: number } =>
      Boolean(x),
    )
    .sort(
      (a, b) =>
        b.score - a.score || a.item.fullName.localeCompare(b.item.fullName),
    );

  return scored.slice(0, limit).map((s) => s.item);
}

export function findIndexItemsBySlugs(
  index: CompareProductIndexItem[],
  slugs: string[],
): { items: CompareProductIndexItem[]; invalidSlugs: string[] } {
  const bySlug = new Map(index.map((i) => [i.slug, i]));
  const items: CompareProductIndexItem[] = [];
  const invalidSlugs: string[] = [];
  for (const slug of slugs) {
    const found = bySlug.get(slug);
    if (found) items.push(found);
    else invalidSlugs.push(slug);
  }
  return { items, invalidSlugs };
}
