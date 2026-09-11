import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import type { Product, SpecValue } from "@/domain/products/types";
import type {
  ActiveFilterChip,
  CatalogFacet,
  CatalogFilterState,
  CatalogProductRow,
  CatalogQueryInput,
  CatalogQueryResult,
  CatalogSort,
  FacetOption,
} from "@/lib/catalog/types";
import {
  getProductsByCategory,
  getBrandById,
  getLowestOfferPrice,
  getSpecificationDefinitions,
  getSubcategoriesByCategory,
  getUseCaseById,
  getVariantsForProduct,
} from "@/repositories";
import { canFeatureProduct, getPrimaryProductMedia } from "@/lib/product/media";
import { getLaunchEligibility, isLaunchListable } from "@/domain/launch";
import {
  formatAudienceAvailability,
  getProductAudiences,
  type AudienceFit,
  variantDisplayWeight,
} from "@/lib/product/audience";

const CUSHION_RANK: Record<string, number> = {
  minimal: 1,
  low: 2,
  medium: 3,
  high: 4,
  maximum: 5,
};

const DEFAULT_DROP_BUCKETS = [
  { id: "0", label: "0 mm", min: 0, max: 0 },
  { id: "1-4", label: "1–4 mm", min: 1, max: 4 },
  { id: "5-8", label: "5–8 mm", min: 5, max: 8 },
  { id: "9+", label: "9+ mm", min: 9, max: undefined },
];

const DEFAULT_WEIGHT_BUCKETS = [
  { id: "under-220", label: "Under 220 g", min: undefined, max: 219 },
  { id: "220-260", label: "220–260 g", min: 220, max: 260 },
  { id: "260-300", label: "260–300 g", min: 260, max: 300 },
  { id: "300+", label: "300 g+", min: 300, max: undefined },
];

function asNumber(value: SpecValue | undefined): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function asString(value: SpecValue | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asStringList(value: SpecValue | undefined): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  if (typeof value === "string") return [value];
  return [];
}

function asBoolean(value: SpecValue | undefined): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function inBucket(
  value: number | undefined,
  bucket: { min?: number; max?: number },
): boolean {
  if (value === undefined) return false;
  if (bucket.min !== undefined && value < bucket.min) return false;
  if (bucket.max !== undefined && value > bucket.max) return false;
  return true;
}

function matchesSpecFilter(
  product: Product,
  key: string,
  selected: string[],
  buckets?: { id: string; label: string; min?: number; max?: number }[],
): boolean {
  if (selected.length === 0) return true;
  const raw = product.specifications[key];

  if (buckets && buckets.length > 0) {
    const num = asNumber(raw);
    return selected.some((id) => {
      const bucket = buckets.find((b) => b.id === id);
      return bucket ? inBucket(num, bucket) : false;
    });
  }

  if (typeof raw === "boolean") {
    return selected.some((v) => (v === "true") === raw);
  }

  const list = asStringList(raw);
  if (list.length > 0) {
    // Exact audience match only — unisex no longer satisfies Men/Women filters.
    if (key === "genderFit") {
      return selected.some((v) => list.includes(v));
    }
    return selected.some((v) => list.includes(v));
  }

  const single = asString(raw);
  if (single) {
    if (key === "genderFit") {
      return selected.some((v) => v === single);
    }
    return selected.includes(single);
  }

  return false;
}

function productMatchesFilters(
  product: Product,
  filters: CatalogFilterState,
  options: {
    brandSlugById: Record<string, string>;
    useCaseSlugById: Record<string, string>;
    subcategorySlugById: Record<string, string>;
    buckets: Record<string, { id: string; label: string; min?: number; max?: number }[]>;
    price?: number;
  },
): boolean {
  if (filters.type.length > 0) {
    const slugs = product.subcategoryIds
      .map((id) => options.subcategorySlugById[id])
      .filter(Boolean);
    if (!filters.type.some((t) => slugs.includes(t))) return false;
  }

  if (filters.brand.length > 0) {
    const slug = options.brandSlugById[product.brandId];
    if (!slug || !filters.brand.includes(slug)) return false;
  }

  if (filters.useCase.length > 0) {
    const slugs = product.useCaseIds
      .map((id) => options.useCaseSlugById[id])
      .filter(Boolean);
    if (!filters.useCase.some((u) => slugs.includes(u))) return false;
  }

  for (const [key, values] of Object.entries(filters.specs)) {
    if (!matchesSpecFilter(product, key, values, options.buckets[key])) {
      return false;
    }
  }

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    if (options.price === undefined) return false;
    if (filters.priceMin !== undefined && options.price < filters.priceMin) {
      return false;
    }
    if (filters.priceMax !== undefined && options.price > filters.priceMax) {
      return false;
    }
  }

  return true;
}

function buildBadges(
  product: Product,
  subcategoryLabels: string[],
): string[] {
  const badges: string[] = [];
  for (const label of subcategoryLabels.slice(0, 2)) {
    badges.push(label.replace(/ Shoes$/i, ""));
  }
  if (asBoolean(product.specifications.plate)) {
    const material = asString(product.specifications.plateMaterial);
    if (material === "carbon") badges.push("Carbon Plate");
    else if (material === "nylon") badges.push("Nylon Plate");
    else badges.push("Plated");
  }
  const widths = asStringList(product.specifications.widthOptions);
  if (widths.includes("wide") || widths.includes("extra-wide")) {
    badges.push("Wide Available");
  }
  return [...new Set(badges)].slice(0, 3);
}

function sortProducts(
  rows: CatalogProductRow[],
  sort: CatalogSort,
): CatalogProductRow[] {
  const copy = [...rows];
  switch (sort) {
    case "score":
      return copy.sort(
        (a, b) => (b.score ?? -1) - (a.score ?? -1),
      );
    case "price-asc":
      return copy.sort((a, b) => {
        if (a.price === undefined && b.price === undefined) return 0;
        if (a.price === undefined) return 1;
        if (b.price === undefined) return -1;
        return a.price.price - b.price.price;
      });
    case "price-desc":
      return copy.sort((a, b) => {
        if (a.price === undefined && b.price === undefined) return 0;
        if (a.price === undefined) return 1;
        if (b.price === undefined) return -1;
        return b.price.price - a.price.price;
      });
    case "newest":
      return copy.sort((a, b) => {
        const ad = a.releaseDate ?? a.updatedAt ?? "";
        const bd = b.releaseDate ?? b.updatedAt ?? "";
        return new Date(bd).getTime() - new Date(ad).getTime();
      });
    case "lightest":
      return copy.sort((a, b) => {
        if (a.weight === undefined && b.weight === undefined) return 0;
        if (a.weight === undefined) return 1;
        if (b.weight === undefined) return -1;
        return a.weight - b.weight;
      });
    case "most-cushioned":
      return copy.sort((a, b) => {
        const ar = CUSHION_RANK[a.cushionLevel ?? ""] ?? -1;
        const br = CUSHION_RANK[b.cushionLevel ?? ""] ?? -1;
        return br - ar;
      });
    case "recommended":
    default:
      // Deterministic: Kitletics score, then newest release, then name
      return copy.sort((a, b) => {
        const scoreDiff = (b.score ?? -1) - (a.score ?? -1);
        if (scoreDiff !== 0) return scoreDiff;
        const ad = a.releaseDate ?? "";
        const bd = b.releaseDate ?? "";
        if (ad !== bd) return bd.localeCompare(ad);
        return a.name.localeCompare(b.name);
      });
  }
}

function labelForValue(value: string): string {
  if (value === "true") return "Yes";
  if (value === "false") return "No";
  if (value === "men") return "Men's";
  if (value === "women") return "Women's";
  if (value === "unisex") return "Unisex";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Reusable catalog query for any sport × category.
 * Facet counts use “other filters applied” semantics (exclude own facet).
 */
export function getCatalogProducts(
  input: CatalogQueryInput,
  options?: PublishResolverOptions,
): CatalogQueryResult {
  const region: RegionCode = input.region ?? DEFAULT_REGION;
  const filters: CatalogFilterState = {
    type: input.filters?.type ?? [],
    brand: input.filters?.brand ?? [],
    specs: input.filters?.specs ?? {},
    useCase: input.filters?.useCase ?? [],
    priceMin: input.filters?.priceMin,
    priceMax: input.filters?.priceMax,
    sort: input.filters?.sort ?? "recommended",
  };

  const products = getProductsByCategory(input.categoryId, options).filter(
    (p) =>
      p.sportIds.includes(input.sportId) &&
      canFeatureProduct(p) &&
      isLaunchListable(
        getLaunchEligibility({ kind: "product", entity: p }, options),
      ),
  );

  const subcategories =
    input.subcategories ?? getSubcategoriesByCategory(input.categoryId);
  const specDefs =
    input.specDefs ??
    getSpecificationDefinitions(input.categoryId).filter((d) => d.filterable);

  const subcategorySlugById = Object.fromEntries(
    subcategories.map((s) => [s.id, s.slug]),
  );
  const subcategoryBySlug = Object.fromEntries(
    subcategories.map((s) => [s.slug, s]),
  );
  const subcategoryNameById = Object.fromEntries(
    subcategories.map((s) => [s.id, s.name]),
  );

  const brandSlugById: Record<string, string> = {};
  const brandNameById: Record<string, string> = {};
  for (const p of products) {
    const brand = getBrandById(p.brandId, options);
    if (brand) {
      brandSlugById[p.brandId] = brand.slug;
      brandNameById[p.brandId] = brand.name;
    }
  }

  const useCaseSlugById: Record<string, string> = {};
  const useCaseNameBySlug: Record<string, string> = {};
  for (const p of products) {
    for (const id of p.useCaseIds) {
      const uc = getUseCaseById(id);
      if (uc) {
        useCaseSlugById[id] = uc.slug;
        useCaseNameBySlug[uc.slug] = uc.name;
      }
    }
  }

  const buckets: Record<
    string,
    { id: string; label: string; min?: number; max?: number }[]
  > = {
    drop: DEFAULT_DROP_BUCKETS,
    weight: DEFAULT_WEIGHT_BUCKETS,
  };

  const priceByProductId: Record<string, { price: number; currency: string }> =
    {};
  for (const p of products) {
    const price = getLowestOfferPrice(p.id, region, options);
    if (price) priceByProductId[p.id] = price;
  }

  const matchOptions = {
    brandSlugById,
    useCaseSlugById,
    subcategorySlugById,
    buckets,
  };

  const matched = products.filter((p) =>
    productMatchesFilters(p, filters, {
      ...matchOptions,
      price: priceByProductId[p.id]?.price,
    }),
  );

  const activeGender = filters.specs.genderFit ?? [];
  const activeAudience: AudienceFit | undefined =
    activeGender.length === 1 &&
    (activeGender[0] === "men" ||
      activeGender[0] === "women" ||
      activeGender[0] === "unisex")
      ? activeGender[0]
      : undefined;

  const rows: CatalogProductRow[] = matched.map((product) => {
    const brand = getBrandById(product.brandId, options);
    const subcategoryLabels = product.subcategoryIds
      .map((id) => subcategoryNameById[id])
      .filter(Boolean);
    const variants = getVariantsForProduct(product.id);
    const audiences = getProductAudiences(product, variants);
    const variant = activeAudience
      ? variants.find((v) => v.audience === activeAudience)
      : variants.find((v) => v.audience === "men") ?? variants[0];
    const weightInfo = variantDisplayWeight(
      product,
      variant,
      activeAudience,
    );
    const audienceLabel = activeAudience
      ? activeAudience === "unisex"
        ? "Unisex sizing"
        : `${activeAudience === "men" ? "Men's" : "Women's"} sizing`
      : formatAudienceAvailability(audiences);
    const media = getPrimaryProductMedia(product);
    const bestForRaw = product.strengths[0];

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      fullName: product.fullName,
      brandName: brand?.name,
      categoryId: product.categoryId,
      image: media ? { src: media.src, alt: media.alt } : undefined,
      score: product.recommendationScore,
      bestFor: bestForRaw,
      subcategoryLabels,
      badges: buildBadges(product, subcategoryLabels),
      weight: weightInfo.grams,
      weightContext: weightInfo.label,
      drop: asNumber(product.specifications.drop),
      stability: asString(product.specifications.stability),
      cushionLevel: asString(product.specifications.cushionLevel),
      price: priceByProductId[product.id],
      audiences,
      activeAudience,
      audienceLabel,
      releaseDate: product.releaseDate,
      updatedAt: product.updatedAt,
    };
  });

  const sorted = sortProducts(rows, filters.sort);
  const pageSize = input.unpaginated
    ? sorted.length
    : Math.max(1, Math.min(input.pageSize ?? 24, 96));
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize) || 1);
  const page = input.unpaginated
    ? 1
    : Math.min(Math.max(input.page ?? 1, 1), totalPages);
  const paged = input.unpaginated
    ? sorted
    : sorted.slice((page - 1) * pageSize, page * pageSize);

  // Facets — count against products matching all filters except the facet itself
  const availableFilters: CatalogFacet[] = [];

  // Type / subcategory
  const typeOptions: FacetOption[] = subcategories
    .map((sub) => {
      const count = products.filter((p) => {
        const withoutType = { ...filters, type: [] };
        if (
          !productMatchesFilters(p, withoutType, {
            ...matchOptions,
            price: priceByProductId[p.id]?.price,
          })
        ) {
          return false;
        }
        return p.subcategoryIds.includes(sub.id);
      }).length;
      return { value: sub.slug, label: sub.name, count };
    })
    .filter((o) => o.count > 0);
  if (typeOptions.length > 0) {
    availableFilters.push({
      id: "type",
      key: "type",
      label: "Type",
      control: "multi-select",
      options: typeOptions,
    });
  }

  // Brand
  const brandSlugs = [...new Set(Object.values(brandSlugById))];
  const brandOptions: FacetOption[] = brandSlugs
    .map((slug) => {
      const name =
        Object.entries(brandSlugById).find(([, s]) => s === slug)?.[0];
      const label = name ? brandNameById[name] : slug;
      const count = products.filter((p) => {
        const without = { ...filters, brand: [] };
        if (
          !productMatchesFilters(p, without, {
            ...matchOptions,
            price: priceByProductId[p.id]?.price,
          })
        ) {
          return false;
        }
        return brandSlugById[p.brandId] === slug;
      }).length;
      return { value: slug, label, count };
    })
    .filter((o) => o.count > 0)
    .sort((a, b) => a.label.localeCompare(b.label));
  if (brandOptions.length > 0) {
    availableFilters.push({
      id: "brand",
      key: "brand",
      label: "Brand",
      control: "multi-select",
      options: brandOptions,
    });
  }

  // Use-case facet (entry intents + runner profiles)
  const useCaseSlugs = [...new Set(Object.values(useCaseSlugById))];
  const useCaseOptions: FacetOption[] = useCaseSlugs
    .map((slug) => {
      const count = products.filter((p) => {
        const without = { ...filters, useCase: [] };
        if (
          !productMatchesFilters(p, without, {
            ...matchOptions,
            price: priceByProductId[p.id]?.price,
          })
        ) {
          return false;
        }
        return p.useCaseIds.some((id) => useCaseSlugById[id] === slug);
      }).length;
      return {
        value: slug,
        label: useCaseNameBySlug[slug] ?? labelForValue(slug),
        count,
      };
    })
    .filter((o) => o.count > 0)
    .sort((a, b) => a.label.localeCompare(b.label));
  if (useCaseOptions.length > 0) {
    availableFilters.push({
      id: "usecase",
      key: "usecase",
      label: "Use case",
      control: "multi-select",
      options: useCaseOptions,
    });
  }

  // Spec facets
  for (const def of specDefs) {
    if (buckets[def.key]) {
      const options: FacetOption[] = buckets[def.key]
        .map((bucket) => {
          const count = products.filter((p) => {
            const specs = { ...filters.specs };
            delete specs[def.key];
            const without = { ...filters, specs };
            if (
              !productMatchesFilters(p, without, {
                ...matchOptions,
                price: priceByProductId[p.id]?.price,
              })
            ) {
              return false;
            }
            return matchesSpecFilter(p, def.key, [bucket.id], buckets[def.key]);
          }).length;
          return { value: bucket.id, label: bucket.label, count };
        })
        .filter((o) => o.count > 0);
      if (options.length > 0) {
        availableFilters.push({
          id: def.key,
          key: def.key,
          label: def.label,
          control: "multi-select",
          options,
          unit: def.unit,
        });
      }
      continue;
    }

    if (def.type === "boolean") {
      const options: FacetOption[] = ["true", "false"]
        .map((value) => {
          const count = products.filter((p) => {
            const specs = { ...filters.specs };
            delete specs[def.key];
            const without = { ...filters, specs };
            if (
              !productMatchesFilters(p, without, {
                ...matchOptions,
                price: priceByProductId[p.id]?.price,
              })
            ) {
              return false;
            }
            return matchesSpecFilter(p, def.key, [value]);
          }).length;
          return {
            value,
            label: value === "true" ? "Yes" : "No",
            count,
          };
        })
        .filter((o) => o.count > 0);
      if (options.length > 0) {
        availableFilters.push({
          id: def.key,
          key: def.key,
          label: def.label,
          control: "boolean",
          options,
        });
      }
      continue;
    }

    if (
      def.type === "enum" ||
      def.type === "multi-enum" ||
      def.type === "string"
    ) {
      const values = new Set<string>();
      for (const p of products) {
        for (const v of asStringList(p.specifications[def.key])) values.add(v);
        const s = asString(p.specifications[def.key]);
        if (s) values.add(s);
      }
      // Gender should always offer Men / Women / Unisex when the category
      // supports it — unisex lasts still match Men/Women filters.
      const ordered =
        def.key === "genderFit" && def.enumValues
          ? [...def.enumValues]
          : (def.enumValues ?? [...values]).filter((v) => values.has(v));
      const options: FacetOption[] = ordered
        .map((value) => {
          const count = products.filter((p) => {
            const specs = { ...filters.specs };
            delete specs[def.key];
            const without = { ...filters, specs };
            if (
              !productMatchesFilters(p, without, {
                ...matchOptions,
                price: priceByProductId[p.id]?.price,
              })
            ) {
              return false;
            }
            return matchesSpecFilter(p, def.key, [value]);
          }).length;
          return {
            value,
            label: labelForValue(value),
            count,
          };
        })
        .filter((o) => (def.key === "genderFit" ? o.count > 0 : o.count > 0));
      if (options.length > 0) {
        availableFilters.push({
          id: def.key,
          key: def.key,
          label: def.label,
          control: "multi-select",
          options,
        });
      }
    }
  }

  // Price facet (range summary)
  const prices = Object.values(priceByProductId).map((p) => p.price);
  if (prices.length > 0) {
    availableFilters.push({
      id: "price",
      key: "price",
      label: "Price",
      control: "numeric-range",
      options: [],
      min: Math.min(...prices),
      max: Math.max(...prices),
      unit: priceByProductId[Object.keys(priceByProductId)[0]]?.currency,
    });
  }

  // Active chips
  const activeFilters: ActiveFilterChip[] = [];
  for (const t of filters.type) {
    activeFilters.push({
      id: `type:${t}`,
      group: "type",
      value: t,
      label: subcategoryBySlug[t]?.name ?? t,
    });
  }
  for (const b of filters.brand) {
    const brandId = Object.entries(brandSlugById).find(([, s]) => s === b)?.[0];
    activeFilters.push({
      id: `brand:${b}`,
      group: "brand",
      value: b,
      label: brandId ? brandNameById[brandId] : b,
    });
  }
  for (const u of filters.useCase) {
    activeFilters.push({
      id: `usecase:${u}`,
      group: "usecase",
      value: u,
      label: useCaseNameBySlug[u] ?? u,
    });
  }
  for (const [key, values] of Object.entries(filters.specs)) {
    for (const value of values) {
      const bucket = buckets[key]?.find((b) => b.id === value);
      const facet = availableFilters.find((f) => f.key === key);
      const optionLabel =
        bucket?.label ??
        facet?.options.find((o) => o.value === value)?.label ??
        labelForValue(value);
      activeFilters.push({
        id: `${key}:${value}`,
        group: key,
        value,
        label: `${facet?.label ?? key}: ${optionLabel}`,
      });
    }
  }
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    activeFilters.push({
      id: "price",
      group: "price",
      value: `${filters.priceMin ?? ""}-${filters.priceMax ?? ""}`,
      label: `Price ${filters.priceMin ?? "…"}–${filters.priceMax ?? "…"}`,
    });
  }

  const hasPrices = rows.some((r) => r.price !== undefined);
  const hasWeights = rows.some((r) => r.weight !== undefined);
  const hasCushion = rows.some((r) => r.cushionLevel !== undefined);
  const hasScores = rows.some((r) => r.score !== undefined);

  const availableSorts: { value: CatalogSort; label: string }[] = [
    { value: "recommended", label: "Recommended" },
  ];
  if (hasScores) {
    availableSorts.push({
      value: "score",
      label: "Highest Kitletics Score",
    });
  }
  if (hasPrices) {
    availableSorts.push(
      { value: "price-asc", label: "Price: Low to High" },
      { value: "price-desc", label: "Price: High to Low" },
    );
  }
  availableSorts.push({ value: "newest", label: "Newest" });
  if (hasWeights) {
    availableSorts.push({ value: "lightest", label: "Lightest" });
  }
  if (hasCushion) {
    availableSorts.push({ value: "most-cushioned", label: "Most Cushioned" });
  }

  return {
    products: paged,
    total: sorted.length,
    availableFilters,
    activeFilters,
    sort: filters.sort,
    availableSorts,
    region,
    page,
    pageSize,
    totalPages,
  };
}
