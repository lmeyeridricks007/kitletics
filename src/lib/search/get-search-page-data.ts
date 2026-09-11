import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  searchKitletics,
  type SearchFilter,
  type SearchHit,
} from "@/lib/search/engine";
import {
  contextualFinderForQuery,
  detectSearchIntent,
  groupOrderForIntent,
  relatedSearchesForQuery,
  type SearchIntent,
} from "@/lib/search/intent";
import {
  getProductById,
  getBrandById,
  getBrandBySlug,
  getCategoryById,
  getProductsByBrand,
  getProductsByCategory,
  getLowestOfferPrice,
  getOffersForProductInRegion,
  getComparisonBySlug,
  getToolBySlug,
  getSportById,
} from "@/repositories";
import { getScoreBand } from "@/lib/product/score";
import { canFeatureProduct, getPrimaryProductMedia } from "@/lib/product/media";
import { getCategoryHref } from "@/lib/navigation/category-href";
import {
  buildFeatureFacets,
  buildPriceFacetState,
  detectDominantCategoryId,
  productMatchesFeatures,
  productMatchesPrice,
  resolveGuideImageSrc,
  type SearchFeatureFacet,
  type SearchPriceFacet,
} from "@/lib/search/facets";

export type SearchGroupKey =
  | "product"
  | "category"
  | "brand"
  | "guide"
  | "comparison"
  | "tool"
  | "review"
  | "setup";

export interface SearchPageProductCard {
  id: string;
  href: string;
  brandName: string;
  name: string;
  fullName: string;
  role: string;
  score?: number;
  scoreLabel?: string;
  price?: { amount: number; currency: string };
  offerCount: number;
  image: { src: string; alt: string };
}

export interface SearchPageCategoryCard {
  id: string;
  href: string;
  title: string;
  productCount: number;
  image: { src: string; alt: string };
}

export interface SearchPageBrandCard {
  id: string;
  href: string;
  name: string;
  productCount: number;
  logo?: string;
}

export interface SearchPageGuideCard {
  id: string;
  href: string;
  title: string;
  description: string;
  eyebrow: string;
  imageSrc: string;
}

export interface SearchPageComparisonCard {
  id: string;
  href: string;
  title: string;
  productA?: { name: string; image?: { src: string; alt: string } };
  productB?: { name: string; image?: { src: string; alt: string } };
}

export interface SearchPageToolCard {
  id: string;
  href: string;
  name: string;
  description: string;
  icon: string;
}

export interface SearchFacetOption {
  id: string;
  label: string;
  value: string;
  count: number;
}

export interface SearchPageData {
  query: string;
  intent: SearchIntent;
  total: number;
  typeLabel: string;
  filter: SearchFilter;
  brandFilter?: string;
  minPrice?: number;
  maxPrice?: number;
  activeFeatures: string[];
  breadcrumbs: { label: string; href?: string }[];
  typeFacets: SearchFacetOption[];
  categoryFacets: SearchFacetOption[];
  brandFacets: SearchFacetOption[];
  sportFacets: SearchFacetOption[];
  featureFacets: SearchFeatureFacet[];
  priceFacet?: SearchPriceFacet;
  /** Offers exist but none are displayable yet — show “prices updating”, not a slider. */
  pricesUpdating?: boolean;
  dominantCategoryId?: string;
  groups: {
    key: SearchGroupKey;
    label: string;
    total: number;
    viewAllHref: string;
    products?: SearchPageProductCard[];
    categories?: SearchPageCategoryCard[];
    brands?: SearchPageBrandCard[];
    guides?: SearchPageGuideCard[];
    comparisons?: SearchPageComparisonCard[];
    tools?: SearchPageToolCard[];
  }[];
  relatedSearches: { label: string; href: string }[];
  finderCta: { label: string; href: string };
  guidesCtaHref: string;
  compareAction?: { label: string; href: string };
  region: RegionCode;
}

const CATEGORY_IMAGES: Record<string, string> = {
  "running-shoes": "/images/running/category/use-daily.jpg",
  "trail-running-shoes": "/images/running/category/hero-trail.jpg",
  "race-shoes": "/images/running/category/use-race.jpg",
  "stability-shoes": "/images/running/category/hero-stability.jpg",
  "daily-trainers": "/images/running/category/use-daily.jpg",
};

const VALID_FILTERS: SearchFilter[] = [
  "all",
  "products",
  "categories",
  "brands",
  "guides",
  "comparisons",
  "tools",
  "reviews",
];

function typeFacetValue(key: SearchGroupKey): string {
  switch (key) {
    case "product":
      return "products";
    case "category":
      return "categories";
    case "brand":
      return "brands";
    case "guide":
    case "setup":
      return "guides";
    case "comparison":
      return "comparisons";
    case "tool":
      return "tools";
    case "review":
      return "reviews";
  }
}

function typeFacetLabel(key: SearchGroupKey): string {
  switch (key) {
    case "product":
      return "Products";
    case "category":
      return "Categories";
    case "brand":
      return "Brands";
    case "guide":
    case "setup":
      return "Guides";
    case "comparison":
      return "Comparisons";
    case "tool":
      return "Tools";
    case "review":
      return "Reviews";
  }
}

function mapHitToGroup(hit: SearchHit): SearchGroupKey | null {
  switch (hit.type) {
    case "product":
      return "product";
    case "category":
      return "category";
    case "brand":
      return "brand";
    case "best-guide":
    case "buying-guide":
      return "guide";
    case "setup":
      return "setup";
    case "comparison":
      return "comparison";
    case "tool":
      return "tool";
    case "review":
      return "review";
    case "sport":
    case "discipline":
      return null;
    default:
      return null;
  }
}

function parseVsQuery(query: string): { a?: string; b?: string } | undefined {
  const m = query.match(/^(.+?)\s+vs\.?\s+(.+)$/i);
  if (!m) return undefined;
  return { a: m[1]?.trim(), b: m[2]?.trim() };
}

function categoryHref(slug: string, fallback: string): string {
  try {
    return getCategoryHref(slug);
  } catch {
    return fallback;
  }
}

function productMediaCard(
  hit: SearchHit,
  region: RegionCode,
  options?: PublishResolverOptions,
): SearchPageProductCard | null {
  const product = getProductById(hit.id, options);
  if (!product || !canFeatureProduct(product)) return null;
  const media = getPrimaryProductMedia(product);
  if (!media) return null;
  const brand = getBrandById(product.brandId, options);
  const score = product.recommendationScore;
  const band = score !== undefined ? getScoreBand(score) : undefined;
  const lowest = getLowestOfferPrice(product.id, region, options);
  const offerCount = getOffersForProductInRegion(product.id, region).length;
  return {
    id: product.id,
    href: `/products/${product.slug}`,
    brandName: brand?.name ?? "",
    name: product.name,
    fullName: product.fullName,
    role: product.shortDescription?.split(".")[0] ?? hit.categoryName ?? "",
    score: score !== undefined ? score / 10 : undefined,
    scoreLabel: band?.label,
    price: lowest
      ? { amount: lowest.price, currency: lowest.currency }
      : undefined,
    offerCount,
    image: { src: media.src, alt: media.alt },
  };
}

export function getSearchPageData(input: {
  query: string;
  type?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  features?: string[];
  region?: RegionCode;
  preview?: boolean;
}): SearchPageData {
  const query = input.query.trim();
  const region = input.region ?? DEFAULT_REGION;
  const options: PublishResolverOptions | undefined = input.preview
    ? { isDev: true }
    : undefined;
  const filter = VALID_FILTERS.includes(input.type as SearchFilter)
    ? (input.type as SearchFilter)
    : "all";
  const activeFeatures = (input.features ?? []).filter(Boolean);
  const minPrice =
    input.minPrice != null && Number.isFinite(input.minPrice)
      ? input.minPrice
      : undefined;
  const maxPrice =
    input.maxPrice != null && Number.isFinite(input.maxPrice)
      ? input.maxPrice
      : undefined;

  const intent = detectSearchIntent(query);
  const hits = query
    ? searchKitletics(query, { ...options, filter, limit: 5000 })
    : [];

  let working = hits;
  if (input.brand) {
    const brand = getBrandBySlug(input.brand, options);
    if (brand) {
      working = working.filter((h) => {
        if (h.type === "brand") return h.id === brand.id;
        if (h.type === "product") {
          const p = getProductById(h.id, options);
          return p?.brandId === brand.id;
        }
        return filter !== "products";
      });
    }
  }

  // Resolve product entities for facet dominance + product-only filters
  const productEntities = working
    .filter((h) => h.type === "product")
    .map((h) => getProductById(h.id, options))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const dominantCategoryId = detectDominantCategoryId(productEntities);
  const featureFacets = buildFeatureFacets(productEntities, dominantCategoryId);
  const priceScope = dominantCategoryId
    ? productEntities.filter((p) => p.categoryId === dominantCategoryId)
    : productEntities;
  const priceState = buildPriceFacetState(
    priceScope,
    region,
    options,
    minPrice,
    maxPrice,
  );
  const priceFacet =
    priceState.kind === "range" ? priceState.facet : undefined;
  const pricesUpdating = priceState.kind === "updating";

  const priceOrFeatureActive =
    minPrice != null || maxPrice != null || activeFeatures.length > 0;
  if (priceOrFeatureActive) {
    working = working.filter((h) => {
      if (h.type !== "product") return true;
      const p = getProductById(h.id, options);
      if (!p) return false;
      if (
        !productMatchesFeatures(p, activeFeatures, dominantCategoryId)
      ) {
        return false;
      }
      if (!productMatchesPrice(p, region, options, minPrice, maxPrice)) {
        return false;
      }
      return true;
    });
  }

  const vs = parseVsQuery(query);
  let compareAction: SearchPageData["compareAction"];
  if (vs?.a && vs?.b) {
    const products = working.filter((h) => h.type === "product");
    const aToken = vs.a.toLowerCase().split(/\s+/).slice(-2).join(" ");
    const bToken = vs.b.toLowerCase().split(/\s+/).slice(-2).join(" ");
    const a = products.find((p) => p.title.toLowerCase().includes(aToken));
    const b = products.find(
      (p) => p.id !== a?.id && p.title.toLowerCase().includes(bToken),
    );
    const curated = working.find((h) => h.type === "comparison");
    if (!curated && a && b) {
      compareAction = {
        label: "Compare these products",
        href: `/compare?ids=${encodeURIComponent(a.id)},${encodeURIComponent(b.id)}`,
      };
    }
  }

  const buckets = new Map<SearchGroupKey, SearchHit[]>();
  const multiToken = query.trim().split(/\s+/).length >= 2;
  const hasDominantCategory = Boolean(dominantCategoryId);
  for (const hit of working) {
    const key = mapHitToGroup(hit);
    if (!key) continue;
    // Drop weak lexical noise from overview (e.g. single-token "shoes" category hits)
    let minScore = 0;
    if (filter === "all") {
      if (key === "category" && multiToken) minScore = 350;
      else if (key === "tool") minScore = 200;
      else if (key === "product" && hasDominantCategory && multiToken) {
        // Prefer products in/near the dominant category — cull weak scrapes
        minScore = 320;
      } else if (key === "product" && multiToken) {
        minScore = 200;
      }
    }
    if (minScore > 0 && hit.score < minScore) continue;
    const list = buckets.get(key) ?? [];
    list.push(hit);
    buckets.set(key, list);
  }

  // Always fold setups into Guides for overview (avoid tiny/duplicate groups)
  const setups = buckets.get("setup") ?? [];
  if (setups.length > 0) {
    const guides = buckets.get("guide") ?? [];
    buckets.set("guide", [...guides, ...setups]);
    buckets.delete("setup");
  }

  const brandCounts = new Map<
    string,
    { name: string; slug: string; count: number }
  >();
  for (const hit of working.filter((h) => h.type === "product")) {
    const p = getProductById(hit.id, options);
    if (!p) continue;
    const brand = getBrandById(p.brandId, options);
    if (!brand) continue;
    const cur = brandCounts.get(brand.id) ?? {
      name: brand.name,
      slug: brand.slug,
      count: 0,
    };
    cur.count += 1;
    brandCounts.set(brand.id, cur);
  }
  const brandFacets = [...brandCounts.entries()]
    .map(([id, v]) => ({
      id,
      label: v.name,
      value: v.slug,
      count: v.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Prefer brands represented in Product hits for overview (avoid unrelated brand text matches)
  if (brandCounts.size > 0 && buckets.has("brand")) {
    const brandHits = buckets.get("brand") ?? [];
    const filteredBrands = brandHits.filter((h) => brandCounts.has(h.id));
    if (filteredBrands.length) buckets.set("brand", filteredBrands);
  }

  const categoryCounts = new Map<
    string,
    { name: string; slug: string; count: number }
  >();
  for (const hit of working.filter((h) => h.type === "product")) {
    const p = getProductById(hit.id, options);
    if (!p) continue;
    const cat = getCategoryById(p.categoryId, options);
    if (!cat) continue;
    const cur = categoryCounts.get(cat.id) ?? {
      name: cat.name,
      slug: cat.slug,
      count: 0,
    };
    cur.count += 1;
    categoryCounts.set(cat.id, cur);
  }
  const categoryFacets = [...categoryCounts.entries()]
    .map(([id, v]) => ({
      id,
      label: v.name,
      value: v.slug,
      count: v.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const sportCounts = new Map<
    string,
    { name: string; slug: string; count: number }
  >();
  for (const hit of working.filter((h) => h.type === "product")) {
    const p = getProductById(hit.id, options);
    if (!p) continue;
    for (const sid of p.sportIds) {
      const sport = getSportById(sid, options);
      if (!sport) continue;
      const cur = sportCounts.get(sport.id) ?? {
        name: sport.name,
        slug: sport.slug,
        count: 0,
      };
      cur.count += 1;
      sportCounts.set(sport.id, cur);
    }
  }
  const sportFacets = [...sportCounts.entries()]
    .map(([id, v]) => ({
      id,
      label: v.name,
      value: v.slug,
      count: v.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const order = groupOrderForIntent(intent);
  const groups: SearchPageData["groups"] = [];
  const productPreview = filter === "products" ? 100 : 8;

  for (const key of order) {
    const list = buckets.get(key);
    if (!list?.length) continue;
    const total = list.length;
    const viewAllHref = `/search?q=${encodeURIComponent(query)}&type=${typeFacetValue(key)}`;

    if (key === "product") {
      const items = list
        .slice(0, productPreview)
        .map((hit) => productMediaCard(hit, region, options))
        .filter((x): x is SearchPageProductCard => Boolean(x));
      if (!items.length) continue;
      groups.push({
        key,
        label: "Products",
        total,
        viewAllHref,
        products: items,
      });
    } else if (key === "category") {
      const items = list.slice(0, 5).map((hit) => {
        const cat = getCategoryById(hit.id, options);
        const count = cat
          ? getProductsByCategory(cat.id, options).length
          : 0;
        const imageSrc =
          (cat && CATEGORY_IMAGES[cat.slug]) ||
          (hit.title.toLowerCase().includes("trail")
            ? "/images/running/category/hero-trail.jpg"
            : hit.title.toLowerCase().includes("race")
              ? "/images/running/category/use-race.jpg"
              : "/images/running/category/use-daily.jpg");
        return {
          id: hit.id,
          href: cat
            ? categoryHref(cat.slug, hit.href)
            : hit.href,
          title: hit.title,
          productCount: count,
          image: { src: imageSrc, alt: hit.title },
        };
      });
      groups.push({
        key,
        label: "Categories",
        total,
        viewAllHref,
        categories: items,
      });
    } else if (key === "brand") {
      const productBrandIds = new Set(brandCounts.keys());
      const preferred = list.filter((h) => productBrandIds.has(h.id));
      const brandList = preferred.length ? preferred : list;
      const items = brandList
        .slice()
        .sort((a, b) => {
          const ca = brandCounts.get(a.id)?.count ?? 0;
          const cb = brandCounts.get(b.id)?.count ?? 0;
          return cb - ca || b.score - a.score;
        })
        .slice(0, 5)
        .map((hit) => {
          const brand = getBrandById(hit.id, options);
          return {
            id: hit.id,
            href: hit.href,
            name: hit.title,
            productCount: brand
              ? getProductsByBrand(brand.id, options).length
              : brandCounts.get(hit.id)?.count ?? 0,
            logo: brand?.logo,
          };
        });
      groups.push({
        key,
        label: "Brands",
        total: brandList.length,
        viewAllHref,
        brands: items,
      });
    } else if (key === "guide" || key === "setup") {
      const items = list.slice(0, 5).map((hit) => {
        const slug = hit.href.split("/").pop() ?? "";
        return {
          id: hit.id,
          href: hit.href,
          title: hit.title,
          description: hit.subtitle ?? "",
          eyebrow:
            hit.type === "best-guide"
              ? "Best Guide"
              : hit.type === "setup"
                ? "Gear Setup"
                : "Buying Guide",
          imageSrc: resolveGuideImageSrc({
            slug,
            title: hit.title,
            type: hit.type,
          }),
        };
      });
      groups.push({
        key: "guide",
        label: "Guides",
        total,
        viewAllHref: `/search?q=${encodeURIComponent(query)}&type=guides`,
        guides: items,
      });
    } else if (key === "comparison") {
      const items = list.slice(0, 4).map((hit) => {
        const slug = hit.href.replace("/compare/", "");
        const cmp = getComparisonBySlug(slug, options);
        const card: SearchPageComparisonCard = {
          id: hit.id,
          href: hit.href,
          title: hit.title,
        };
        if (cmp?.productIds?.length) {
          const [idA, idB] = cmp.productIds;
          const pA = idA ? getProductById(idA, options) : undefined;
          const pB = idB ? getProductById(idB, options) : undefined;
          if (pA) {
            const media =
              canFeatureProduct(pA) ? getPrimaryProductMedia(pA) : undefined;
            card.productA = {
              name: pA.name,
              image: media
                ? { src: media.src, alt: media.alt }
                : undefined,
            };
          }
          if (pB) {
            const media =
              canFeatureProduct(pB) ? getPrimaryProductMedia(pB) : undefined;
            card.productB = {
              name: pB.name,
              image: media
                ? { src: media.src, alt: media.alt }
                : undefined,
            };
          }
        } else {
          const parts = hit.title.split(/\s+vs\.?\s+/i);
          if (parts[0]) card.productA = { name: parts[0].trim() };
          if (parts[1]) card.productB = { name: parts[1].trim() };
        }
        return card;
      });
      groups.push({
        key,
        label: "Comparisons",
        total,
        viewAllHref,
        comparisons: items,
      });
    } else if (key === "tool") {
      const items = list
        .slice(0, 5)
        .map((hit) => {
          const toolSlug = hit.href.replace(/^\/tools\//, "").split("?")[0]!;
          const tool = getToolBySlug(toolSlug, options);
          if (tool && tool.available === false) return null;
          return {
            id: hit.id,
            href: hit.href,
            name: hit.title,
            description: hit.subtitle ?? "",
            icon: hit.icon ?? tool?.icon ?? "Wrench",
          };
        })
        .filter((t): t is SearchPageToolCard => Boolean(t));
      if (!items.length) continue;
      groups.push({
        key,
        label: "Tools",
        total,
        viewAllHref,
        tools: items,
      });
    } else if (key === "review" && intent !== "general") {
      // Reviews only on overview for product/entity intents — omit for broad shoe queries
      continue;
    }
  }

  const seen = new Set<string>();
  const uniqueGroups = groups.filter((g) => {
    if (seen.has(g.key)) return false;
    seen.add(g.key);
    return true;
  });

  // Count entities that survive overview relevance threshold (not raw token scrapes)
  const total = [...buckets.values()].reduce((n, list) => n + list.length, 0);

  // Rebuild type facets from buckets (post-threshold) so counts match total
  const refinedTypeFacets: SearchFacetOption[] = [];
  for (const [key, list] of buckets) {
    if (!list.length) continue;
    const value = typeFacetValue(key);
    const existing = refinedTypeFacets.find((f) => f.value === value);
    if (existing) existing.count += list.length;
    else
      refinedTypeFacets.push({
        id: value,
        label: typeFacetLabel(key),
        value,
        count: list.length,
      });
  }

  const TYPE_ORDER = [
    "products",
    "categories",
    "brands",
    "guides",
    "comparisons",
    "tools",
    "reviews",
  ];
  refinedTypeFacets.sort(
    (a, b) => TYPE_ORDER.indexOf(a.value) - TYPE_ORDER.indexOf(b.value),
  );

  const typeParts = refinedTypeFacets.map((f) => f.label.toLowerCase());
  let typeLabel = "results";
  if (typeParts.length === 1) typeLabel = typeParts[0]!;
  else if (typeParts.length === 2)
    typeLabel = `${typeParts[0]} and ${typeParts[1]}`;
  else if (typeParts.length > 2)
    typeLabel = `${typeParts.slice(0, -1).join(", ")} and ${typeParts[typeParts.length - 1]}`;

  return {
    query,
    intent,
    total,
    typeLabel,
    filter,
    brandFilter: input.brand,
    minPrice,
    maxPrice,
    activeFeatures,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Search" },
    ],
    typeFacets: refinedTypeFacets,
    brandFacets,
    categoryFacets,
    sportFacets,
    featureFacets,
    priceFacet,
    pricesUpdating,
    dominantCategoryId,
    groups: uniqueGroups,
    relatedSearches: relatedSearchesForQuery(query),
    finderCta: contextualFinderForQuery(query),
    guidesCtaHref: `/search?q=${encodeURIComponent(query)}&type=guides`,
    compareAction,
    region,
  };
}
