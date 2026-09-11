import type { Brand } from "@/domain/products/types";
import type { Sport } from "@/domain/sports/types";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import {
  getBrands,
  getProductsByBrand,
  getSportBySlug,
  getSports,
} from "@/repositories";
import { isBrandHubIndexable } from "@/lib/seo/brand-indexability";

export interface BrandsHubBrandRow {
  brand: Brand;
  productCount: number;
  href: string;
}

export interface BrandsHubPageData {
  breadcrumbs: { label: string; href?: string }[];
  sport: Sport | null;
  /** When set, secondary nav stays in Shoes domain (not Running sport hub). */
  domain?: "shoes";
  query: string | null;
  featured: BrandsHubBrandRow[];
  letters: string[];
  byLetter: { letter: string; brands: BrandsHubBrandRow[] }[];
  sportFilters: { slug: string; label: string; href: string; active: boolean }[];
  totalCount: number;
  withLogoCount: number;
}

const SHOE_CATEGORY_IDS = new Set([
  "cat-running-shoes",
  "cat-training-shoes",
]);

const FEATURED_SLUG_PRIORITY = [
  "asics",
  "nike",
  "adidas",
  "saucony",
  "hoka",
  "brooks",
  "new-balance",
  "garmin",
  "coros",
  "salomon",
  "on",
  "rogue",
] as const;

const SHOE_FEATURED_SLUG_PRIORITY = [
  "asics",
  "nike",
  "adidas",
  "saucony",
  "hoka",
  "brooks",
  "new-balance",
  "salomon",
  "on",
  "altra",
  "topo",
  "puma",
] as const;

export function getBrandsHubData(input: {
  sportSlug?: string;
  query?: string;
  domain?: "shoes";
}): BrandsHubPageData {
  const shoesDomain = input.domain === "shoes";
  const sport = !shoesDomain && input.sportSlug
    ? getSportBySlug(input.sportSlug)
    : null;
  const query = input.query?.trim() || null;

  let brands = getBrands().filter((b) => isBrandHubIndexable(b));

  if (query) {
    const needle = query.toLowerCase();
    brands = brands.filter(
      (b) =>
        b.name.toLowerCase().includes(needle) || b.slug.includes(needle),
    );
  }

  if (shoesDomain) {
    brands = brands.filter((brand) =>
      getProductsByBrand(brand.id).some((p) =>
        SHOE_CATEGORY_IDS.has(p.categoryId),
      ),
    );
  } else if (sport) {
    brands = brands.filter((brand) =>
      getProductsByBrand(brand.id).some((p) => p.sportIds.includes(sport.id)),
    );
  }

  const rows: BrandsHubBrandRow[] = brands.map((brand) => ({
    brand,
    productCount: getProductsByBrand(brand.id).filter((p) =>
      shoesDomain ? SHOE_CATEGORY_IDS.has(p.categoryId) : true,
    ).length,
    href: `/brands/${brand.slug}`,
  }));

  const featured = pickFeatured(
    rows,
    4,
    shoesDomain ? SHOE_FEATURED_SLUG_PRIORITY : FEATURED_SLUG_PRIORITY,
  );

  const sorted = [...rows].sort((a, b) =>
    a.brand.name.localeCompare(b.brand.name),
  );

  const letterMap = new Map<string, BrandsHubBrandRow[]>();
  for (const row of sorted) {
    const letter = row.brand.name[0]?.toUpperCase() ?? "#";
    const list = letterMap.get(letter) ?? [];
    list.push(row);
    letterMap.set(letter, list);
  }

  const byLetter = [...letterMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, list]) => ({ letter, brands: list }));

  const liveSports = getSports().filter(
    (s) => s.contentStatus === "live" || s.contentStatus === "partial",
  );

  const sportFilters = shoesDomain
    ? [
        {
          slug: "shoes",
          label: "Shoes",
          href: query
            ? `/brands?domain=shoes&q=${encodeURIComponent(query)}`
            : "/brands?domain=shoes",
          active: true,
        },
        {
          slug: "all",
          label: "All sports",
          href: query ? `/brands?q=${encodeURIComponent(query)}` : "/brands",
          active: false,
        },
      ]
    : [
        {
          slug: "all",
          label: "All sports",
          href: query ? `/brands?q=${encodeURIComponent(query)}` : "/brands",
          active: !sport,
        },
        ...liveSports.map((s) => ({
          slug: s.slug,
          label: s.name,
          href: query
            ? `/brands?sport=${s.slug}&q=${encodeURIComponent(query)}`
            : `/brands?sport=${s.slug}`,
          active: sport?.slug === s.slug,
        })),
      ];

  return {
    breadcrumbs: shoesDomain
      ? [
          { label: "Home", href: "/" },
          { label: "Shoes", href: "/running/shoes" },
          { label: "Brands" },
        ]
      : resolveBreadcrumbs({ type: "brands" }),
    sport: sport ?? null,
    domain: shoesDomain ? "shoes" : undefined,
    query,
    featured,
    letters: byLetter.map((g) => g.letter),
    byLetter,
    sportFilters,
    totalCount: rows.length,
    withLogoCount: rows.filter((r) => Boolean(r.brand.logo)).length,
  };
}

function pickFeatured(
  rows: BrandsHubBrandRow[],
  count: number,
  priority: readonly string[] = FEATURED_SLUG_PRIORITY,
): BrandsHubBrandRow[] {
  const bySlug = new Map(rows.map((r) => [r.brand.slug, r]));
  const picked: BrandsHubBrandRow[] = [];

  for (const slug of priority) {
    const row = bySlug.get(slug);
    if (row?.brand.logo) picked.push(row);
    if (picked.length >= count) return picked;
  }

  const rest = [...rows]
    .filter((r) => r.brand.logo && !picked.some((p) => p.brand.id === r.brand.id))
    .sort((a, b) => b.productCount - a.productCount);

  for (const row of rest) {
    picked.push(row);
    if (picked.length >= count) break;
  }

  if (picked.length < count) {
    for (const row of [...rows].sort(
      (a, b) => b.productCount - a.productCount,
    )) {
      if (picked.some((p) => p.brand.id === row.brand.id)) continue;
      picked.push(row);
      if (picked.length >= count) break;
    }
  }

  return picked;
}
