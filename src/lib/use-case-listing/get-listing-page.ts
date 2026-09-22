import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  parseCatalogSearchParams,
  type CatalogFilterState,
} from "@/lib/catalog";
import { getCatalogProducts } from "@/lib/catalog/query";
import type {
  ActiveFilterChip,
  CatalogFacet,
  CatalogProductRow,
  CatalogSort,
} from "@/lib/catalog/types";
import { toPublicSpecKeyList, publicSpecRowKey } from "@/lib/specs/public-label";
import { toPublicCatalogFilterState } from "@/lib/specs/public-payload";
import {
  getBestGuideBySlug,
  getBrandById,
  getBuyingGuideBySlug,
  getCategoryByPathSegment,
  getComparisons,
  getProductById,
  getSportBySlug,
  getSubcategoryById,
  getUseCaseById,
} from "@/repositories";
import { getAwardLabel } from "@/lib/best/awards";
import { getPrimaryProductMedia, canFeatureProduct } from "@/lib/product/media";
import {
  getUseCaseListingConfig,
} from "@/lib/use-case-listing/config";
import type { ProductUseCaseListingConfig } from "@/lib/use-case-listing/types";

export interface ListingComparisonRow {
  id: string;
  href: string;
  productA: { name: string; image?: { src: string; alt: string } };
  productB: { name: string; image?: { src: string; alt: string } };
}

export interface ListingGuideCard {
  id: string;
  title: string;
  description: string;
  href: string;
  imageSrc?: string;
}

export interface UseCaseListingPageData {
  config: ProductUseCaseListingConfig;
  sportName: string;
  categoryName: string;
  categorySlug: string;
  basePath: string;
  breadcrumbs: { label: string; href?: string }[];
  productCount: number;
  verifiedLabel?: string;
  filters: CatalogFilterState;
  /** Types / use-cases that cannot be cleared */
  lockedType: string[];
  lockedUseCase: string[];
  facets: CatalogFacet[];
  activeFilters: ActiveFilterChip[];
  products: CatalogProductRow[];
  total: number;
  page?: number;
  totalPages?: number;
  availableSorts: { value: CatalogSort; label: string }[];
  /** productId → award badge for limited editorial labels */
  awardByProductId: Record<string, string>;
  educationGuideHref?: string;
  featuredComparisons: ListingComparisonRow[];
  relatedGuides: ListingGuideCard[];
  region: RegionCode;
}

function applyLockedEligibility(
  parsed: CatalogFilterState,
  config: ProductUseCaseListingConfig,
): {
  filters: CatalogFilterState;
  lockedType: string[];
  lockedUseCase: string[];
} {
  const lockedType = config.subcategorySlug ? [config.subcategorySlug] : [];
  const lockedUseCase = config.useCaseSlug ? [config.useCaseSlug] : [];

  const type = [
    ...new Set([...lockedType, ...parsed.type.filter((t) => !lockedType.includes(t))]),
  ];
  const useCase = [
    ...new Set([
      ...lockedUseCase,
      ...parsed.useCase.filter((u) => !lockedUseCase.includes(u)),
    ]),
  ];

  const specs: Record<string, string[]> = { ...parsed.specs };
  for (const [key, values] of Object.entries(config.defaultSpecs ?? {})) {
    if (!values.length) continue;
    // URL param wins when the user already refined this facet
    if ((specs[key] ?? []).length === 0) {
      specs[key] = [...values];
    }
  }

  return {
    filters: { ...parsed, type, useCase, specs },
    lockedType,
    lockedUseCase,
  };
}

export function getUseCaseListingPageData(input: {
  sportSlug: string;
  categoryPathSegment: string;
  listingSlug: string;
  searchParams?: Record<string, string | string[] | undefined>;
  region?: RegionCode;
  preview?: boolean;
}): UseCaseListingPageData | null {
  const config = getUseCaseListingConfig(
    input.sportSlug,
    input.categoryPathSegment,
    input.listingSlug,
  );
  if (!config) return null;

  const options: PublishResolverOptions | undefined = input.preview
    ? { isDev: true }
    : undefined;
  const region = input.region ?? DEFAULT_REGION;

  const sport = getSportBySlug(config.sportSlug, options);
  if (!sport) return null;
  const category = getCategoryByPathSegment(
    sport.id,
    config.categoryPathSegment,
    options,
  );
  if (!category || category.id !== config.categoryId) return null;

  const parsed = parseCatalogSearchParams(
    input.searchParams ?? {},
    config.defaultSort ?? "recommended",
  );
  const { filters, lockedType, lockedUseCase } = applyLockedEligibility(
    parsed,
    config,
  );

  const catalog = getCatalogProducts(
    {
      sportId: sport.id,
      categoryId: category.id,
      filters,
      region,
      unpaginated: true,
    },
    options,
  );

  // Strip locked values from active chips so Clear all UX is about refinements
  const activeFilters = catalog.activeFilters.filter((chip) => {
    if (chip.group === "type" && lockedType.includes(chip.value)) return false;
    if (chip.group === "usecase" && lockedUseCase.includes(chip.value))
      return false;
    return true;
  });

  const bestGuide = config.bestGuideSlug
    ? getBestGuideBySlug(config.bestGuideSlug, options)
    : undefined;

  const awardByProductId: Record<string, string> = {};
  for (const rec of bestGuide?.recommendations ?? []) {
    const label = getAwardLabel(rec.awardType, rec.badge);
    if (label) awardByProductId[rec.productId] = label.toUpperCase();
  }

  // Enrich product badges: prefer award for best-guide picks; keep factual tags otherwise
  // Only surface products with authentic primary media on listing cards (no placeholders).
  const products: CatalogProductRow[] = catalog.products
    .map((row) => {
      const award = awardByProductId[row.id];
      if (!award) return row;
      const rest = row.badges.filter((b) => !/best|editor/i.test(b));
      return {
        ...row,
        badges: [award, ...rest].slice(0, 2),
      };
    })
    .filter((row) => Boolean(row.image));

  const total = products.length;

  const verifiedAt =
    bestGuide?.lastVerifiedAt ??
    category.updatedAt ??
    products[0]?.updatedAt;
  const verifiedLabel = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : undefined;

  const subcategory = config.subcategoryId
    ? getSubcategoryById(config.subcategoryId)
    : undefined;
  const useCase = config.useCaseId
    ? getUseCaseById(config.useCaseId)
    : undefined;

  const listingName =
    subcategory?.name ?? useCase?.name ?? config.title;

  const basePath = `/${config.sportSlug}/${config.categoryPathSegment}/${config.slug}`;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: sport.name, href: `/${sport.slug}` },
    {
      label: category.name,
      href: `/${sport.slug}/${category.pathSegment}`,
    },
    { label: listingName },
  ];

  const productIds = new Set(products.map((p) => p.id));
  const featuredComparisons = getComparisons(options)
    .filter((c) => c.productIds.every((id) => productIds.has(id)))
    .slice(0, config.comparisonLimit ?? 4)
    .map((c) => {
      const a = getProductById(c.productIds[0], options);
      const b = getProductById(c.productIds[1], options);
      const mediaA = a && canFeatureProduct(a) ? getPrimaryProductMedia(a) : undefined;
      const mediaB = b && canFeatureProduct(b) ? getPrimaryProductMedia(b) : undefined;
      return {
        id: c.id,
        href: `/compare/${c.slug}`,
        productA: {
          name: a?.name ?? "Product A",
          image: mediaA ? { src: mediaA.src, alt: mediaA.alt } : undefined,
        },
        productB: {
          name: b?.name ?? "Product B",
          image: mediaB ? { src: mediaB.src, alt: mediaB.alt } : undefined,
        },
      };
    });

  // If too few comparisons fully within listing, widen to comparisons involving ≥1 listing product
  const comparisons =
    featuredComparisons.length >= 2
      ? featuredComparisons
      : getComparisons(options)
          .filter((c) => c.productIds.some((id) => productIds.has(id)))
          .slice(0, config.comparisonLimit ?? 4)
          .map((c) => {
            const a = getProductById(c.productIds[0], options);
            const b = getProductById(c.productIds[1], options);
            const mediaA =
              a && canFeatureProduct(a) ? getPrimaryProductMedia(a) : undefined;
            const mediaB =
              b && canFeatureProduct(b) ? getPrimaryProductMedia(b) : undefined;
            return {
              id: c.id,
              href: `/compare/${c.slug}`,
              productA: {
                name: a?.name ?? "Product A",
                image: mediaA
                  ? { src: mediaA.src, alt: mediaA.alt }
                  : undefined,
              },
              productB: {
                name: b?.name ?? "Product B",
                image: mediaB
                  ? { src: mediaB.src, alt: mediaB.alt }
                  : undefined,
              },
            };
          });

  const relatedGuides: ListingGuideCard[] = config.relatedGuideSlugs
    .map((slug): ListingGuideCard | null => {
      const guide = getBuyingGuideBySlug(slug, options);
      if (!guide) return null;
      return {
        id: guide.id,
        title: guide.title,
        description: guide.shortDescription ?? guide.subtitle ?? "",
        href: `/guides/${guide.slug}`,
        imageSrc: "/images/home/guide-running-shoes.jpg",
      };
    })
    .filter((g): g is ListingGuideCard => g !== null);

  const educationGuide = config.education.guideSlug
    ? getBuyingGuideBySlug(config.education.guideSlug, options)
    : undefined;

  const facets = shapeListingFacets({
    facets: catalog.availableFilters,
    primaryFilterKeys: config.primaryFilterKeys,
    lockedType,
    typeFacetSlugs: config.typeFacetSlugs,
    listingProducts: products,
  });

  return {
    config: {
      ...config,
      primaryFilterKeys: toPublicSpecKeyList(config.primaryFilterKeys),
      defaultSpecs: config.defaultSpecs
        ? Object.fromEntries(
            Object.entries(config.defaultSpecs).map(([k, v]) => [
              publicSpecRowKey(k),
              v,
            ]),
          )
        : config.defaultSpecs,
    },
    sportName: sport.name,
    categoryName: category.name,
    categorySlug: category.slug,
    basePath,
    breadcrumbs,
    productCount: total,
    verifiedLabel,
    filters: toPublicCatalogFilterState(filters),
    lockedType,
    lockedUseCase,
    facets,
    activeFilters,
    products,
    total,
    page: catalog.page,
    totalPages: catalog.totalPages,
    availableSorts: catalog.availableSorts,
    awardByProductId,
    educationGuideHref: educationGuide
      ? `/guides/${educationGuide.slug}`
      : undefined,
    featuredComparisons: comparisons,
    relatedGuides,
    region,
  };
}

export function listingBrandName(
  brandId: string,
  options?: PublishResolverOptions,
): string {
  return getBrandById(brandId, options)?.name ?? "";
}

const LISTING_FACET_LABELS: Record<string, string> = {
  type: "Shoe Type",
  recommendedDistance: "Distance",
  "recommended-distance": "Distance",
  cushionLevel: "Cushioning",
  cushioning: "Cushioning",
  drop: "Drop (mm)",
  weight: "Weight (g)",
  brand: "Brand",
  price: "Price",
  widthOptions: "Width",
  "available-widths": "Width",
  stability: "Stability",
  terrain: "Terrain",
  fit: "Fit",
  "minimum-weight": "Minimum weight",
  weightMin: "Minimum weight",
};

function shapeListingFacets(input: {
  facets: CatalogFacet[];
  primaryFilterKeys: string[];
  lockedType: string[];
  typeFacetSlugs?: string[];
  listingProducts: CatalogProductRow[];
}): CatalogFacet[] {
  const {
    facets,
    primaryFilterKeys,
    lockedType,
    typeFacetSlugs,
    listingProducts,
  } = input;

  const allowType =
    typeFacetSlugs && typeFacetSlugs.length > 0
      ? new Set([...lockedType, ...typeFacetSlugs])
      : lockedType.length > 0
        ? new Set(lockedType)
        : null;

  const shaped = facets.map((facet) => {
    const label = LISTING_FACET_LABELS[facet.key] ?? facet.label;

    if (facet.key === "type" && allowType) {
      const options = facet.options
        .filter((o) => allowType.has(o.value))
        .filter((o) => o.count > 0 || lockedType.includes(o.value))
        .sort((a, b) => {
          const ai = typeFacetSlugs?.indexOf(a.value) ?? 0;
          const bi = typeFacetSlugs?.indexOf(b.value) ?? 0;
          return ai - bi;
        });
      return { ...facet, label, options };
    }

    if (
      facet.key === "brand" ||
      facet.key === "recommendedDistance" ||
      facet.key === "recommended-distance" ||
      facet.key === "cushionLevel" ||
      facet.key === "cushioning" ||
      facet.key === "terrain" ||
      facet.key === "stability" ||
      facet.key === "widthOptions" ||
      facet.key === "available-widths"
    ) {
      const options = facet.options.filter((o) => o.count > 0);
      return { ...facet, label, options };
    }

    return { ...facet, label };
  });

  void listingProducts;

  if (primaryFilterKeys.length === 0) return shaped;
  // Facet keys are public-safe; config primaryFilterKeys may still be canonical.
  const publicPrimary = toPublicSpecKeyList(primaryFilterKeys);
  const rank = new Map(publicPrimary.map((k, i) => [k, i]));
  return shaped
    .filter((f) => rank.has(f.key) || f.key === "price")
    .sort(
      (a, b) =>
        (rank.get(a.key) ?? 99) - (rank.get(b.key) ?? 99),
    );
}
