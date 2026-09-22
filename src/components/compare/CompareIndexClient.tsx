"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CompareExperience } from "@/components/compare/CompareExperience";
import { findIndexItemsBySlugs } from "@/lib/comparison/product-index-search";
import { parseCompareProductsParam } from "@/lib/comparison/selection";
import type { CompareIndexShellData } from "@/lib/comparison/compare-index-shared";

export function CompareIndexClient({ data }: { data: CompareIndexShellData }) {
  const searchParams = useSearchParams();
  const productsParam = searchParams.get("products") ?? "";
  const categorySlug = searchParams.get("category") ?? undefined;

  const requestedSlugs = useMemo(
    () => parseCompareProductsParam(productsParam),
    [productsParam],
  );
  const { items, invalidSlugs } = useMemo(
    () => findIndexItemsBySlugs(data.index, requestedSlugs),
    [data.index, requestedSlugs],
  );

  const categoryIds = new Set(items.map((i) => i.categoryId));
  const crossCategoryError = items.length >= 2 && categoryIds.size > 1;
  const derivedCategorySlug =
    items[0]?.categorySlug ||
    categorySlug ||
    data.categories.find((c) => c.ready)?.slug ||
    data.categories[0]?.slug;
  const initialProductSlugs = useMemo(
    () => (crossCategoryError ? [] : items.map((i) => i.slug)),
    [crossCategoryError, items],
  );

  return (
    <CompareExperience
      index={data.index}
      categories={data.categories}
      featured={data.featured}
      initialCategorySlug={derivedCategorySlug}
      initialProductSlugs={initialProductSlugs}
      initialComparison={null}
      crossCategoryError={crossCategoryError}
      invalidSlugs={invalidSlugs}
    />
  );
}
