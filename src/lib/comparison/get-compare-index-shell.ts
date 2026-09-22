import {
  buildCompareProductIndex,
  getCompareCategoryOptions,
} from "@/lib/comparison/product-index";
import { getFeaturedComparisonsByCategory } from "@/lib/comparison/get-comparison-page-data";
import type { CompareIndexShellData } from "@/lib/comparison/compare-index-shared";

export type {
  CompareIndexShellData,
  FeaturedCompareCard,
  FeaturedCompareGroup,
} from "@/lib/comparison/compare-index-shared";

export function getCompareIndexShellData(): CompareIndexShellData {
  const index = buildCompareProductIndex({ isDev: false });
  const categories = getCompareCategoryOptions(index, { isDev: false });
  const featured = getFeaturedComparisonsByCategory({ isDev: false }).map(
    (group) => ({
      categoryId: group.categoryId,
      categoryName: group.categoryName,
      items: group.items.map((cmp) => ({
        id: cmp.id,
        slug: cmp.slug,
        title: cmp.title,
        productIds: cmp.productIds,
        shortDescription: cmp.shortDescription?.slice(0, 180),
        summary: cmp.summary?.slice(0, 180),
      })),
    }),
  );
  return { index, categories, featured };
}
