import type { Metadata } from "next";
import { CompareExperience } from "@/components/compare/CompareExperience";
import {
  getDynamicComparisonData,
  getFeaturedComparisonsByCategory,
} from "@/lib/comparison/get-comparison-page-data";
import {
  buildCompareProductIndex,
  findIndexItemsBySlugs,
  getCompareCategoryOptions,
} from "@/lib/comparison/product-index";
import { parseCompareProductsParam } from "@/lib/comparison/selection";
import { getCategoryBySlug } from "@/repositories";
import { siteConfig } from "@/content/config";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    products?: string;
    edit?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { products: productsParam, category: categorySlug } =
    await searchParams;
  const slugs = parseCompareProductsParam(productsParam);

  if (slugs.length >= 2) {
    const cat = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
    const title = cat
      ? `Compare ${cat.name}`
      : "Compare Sports Gear";
    return {
      title,
      description:
        "Interactive side-by-side comparison from Kitletics structured product data.",
      robots: { index: false, follow: true },
      alternates: { canonical: `${siteConfig.url}/compare` },
      openGraph: {
        title: `${title} | Kitletics`,
        description:
          "Compare gear side by side — specs, use cases and regional prices.",
      },
    };
  }

  const cat = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
  return {
    title: "Compare Sports Gear Side by Side",
    description:
      cat
        ? `Compare ${cat.name} side by side — differences that matter for how you train.`
        : "Choose products and see the differences that matter — specs, use cases and prices.",
    alternates: { canonical: `${siteConfig.url}/compare` },
  };
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { category: categorySlug, products: productsParam } =
    await searchParams;

  const index = buildCompareProductIndex({ isDev: false });
  const categories = getCompareCategoryOptions(index, { isDev: false });
  const featured = getFeaturedComparisonsByCategory({ isDev: false });

  const requestedSlugs = parseCompareProductsParam(productsParam);
  const { items, invalidSlugs } = findIndexItemsBySlugs(index, requestedSlugs);

  const categoryIds = new Set(items.map((i) => i.categoryId));
  const crossCategoryError = items.length >= 2 && categoryIds.size > 1;

  // Product data is source of truth for category when URL category mismatches
  const derivedCategorySlug =
    items[0]?.categorySlug ||
    categorySlug ||
    categories.find((c) => c.ready)?.slug ||
    categories[0]?.slug;

  let initialComparison = null;
  if (!crossCategoryError && items.length >= 2) {
    initialComparison =
      getDynamicComparisonData(
        items.map((i) => i.slug),
        { isDev: false },
      ) ?? null;
  }

  return (
    <CompareExperience
      index={index}
      categories={categories}
      featured={featured}
      initialCategorySlug={derivedCategorySlug}
      initialProductSlugs={crossCategoryError ? [] : items.map((i) => i.slug)}
      initialComparison={initialComparison}
      crossCategoryError={crossCategoryError}
      invalidSlugs={invalidSlugs}
    />
  );
}
