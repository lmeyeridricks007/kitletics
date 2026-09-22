import { isBrandHubIndexable } from "@/lib/seo/brand-indexability";
import {
  getBrands,
  getProductsByBrand,
  getSportById,
  getSports,
} from "@/repositories";
import type {
  BrandsIndexRow,
  BrandsIndexShellData,
} from "@/lib/brands/brands-index-shared";

export type {
  BrandsIndexRow,
  BrandsIndexShellData,
  BrandsIndexSport,
} from "@/lib/brands/brands-index-shared";

const SHOE_CATEGORY_IDS = new Set([
  "cat-running-shoes",
  "cat-training-shoes",
]);

export function getBrandsIndexShellData(): BrandsIndexShellData {
  const brands = getBrands().filter((b) => isBrandHubIndexable(b));
  const rows: BrandsIndexRow[] = brands.map((brand) => {
    const products = getProductsByBrand(brand.id);
    const sportIds = new Set<string>();
    let shoeProductCount = 0;
    for (const p of products) {
      for (const sid of p.sportIds) sportIds.add(sid);
      if (SHOE_CATEGORY_IDS.has(p.categoryId)) shoeProductCount += 1;
    }
    const sportSlugs = [...sportIds]
      .map((id) => getSportById(id)?.slug)
      .filter((s): s is string => Boolean(s));
    return {
      id: brand.id,
      slug: brand.slug,
      name: brand.name,
      logo: brand.logo,
      country: brand.country,
      description: (brand.description ?? "").slice(0, 160),
      href: `/brands/${brand.slug}`,
      productCount: products.length,
      shoeProductCount,
      sportSlugs,
    };
  });

  const liveSports = getSports().filter(
    (s) => s.contentStatus === "live" || s.contentStatus === "partial",
  );

  return {
    brands: rows,
    sports: liveSports.map((s) => ({ slug: s.slug, name: s.name })),
  };
}
