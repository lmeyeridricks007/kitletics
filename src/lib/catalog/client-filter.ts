import type {
  ActiveFilterChip,
  CatalogFacet,
  CatalogFilterState,
  CatalogProductRow,
  CatalogSort,
} from "@/lib/catalog/types";
import { publicSpecRowKey, resolveCanonicalSpecKey } from "@/lib/specs/public-label";

export const CATALOG_PAGE_SIZE = 24;

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function mergeLockedCatalogFilters(
  filters: CatalogFilterState,
  lockedTypes: string[],
  lockedUseCases: string[],
): CatalogFilterState {
  return {
    ...filters,
    type: unique([...filters.type, ...lockedTypes]),
    useCase: unique([...filters.useCase, ...lockedUseCases]),
  };
}

export function catalogRowMatches(
  row: CatalogProductRow,
  filters: CatalogFilterState,
  regionalPrice?: number,
): boolean {
  const tokens = row.filterTokens;
  if (!tokens) return true;

  if (filters.type.length > 0) {
    if (!filters.type.some((t) => tokens.typeSlugs.includes(t))) return false;
  }
  if (filters.brand.length > 0) {
    if (!tokens.brandSlug || !filters.brand.includes(tokens.brandSlug)) {
      return false;
    }
  }
  if (filters.useCase.length > 0) {
    if (!filters.useCase.some((u) => tokens.useCaseSlugs.includes(u))) {
      return false;
    }
  }

  for (const [key, values] of Object.entries(filters.specs)) {
    if (!values.length) continue;
    const canonical = resolveCanonicalSpecKey(key);
    const pub = publicSpecRowKey(key);
    const held =
      tokens.specs[key] ??
      tokens.specs[pub] ??
      tokens.specs[canonical] ??
      [];
    if (
      !values.some(
        (v) => held.includes(v) || held.includes(publicSpecRowKey(v)),
      )
    ) {
      return false;
    }
  }

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    const price = regionalPrice ?? row.price?.price;
    if (price === undefined) return false;
    if (filters.priceMin !== undefined && price < filters.priceMin) {
      return false;
    }
    if (filters.priceMax !== undefined && price > filters.priceMax) {
      return false;
    }
  }

  return true;
}

export function sortCatalogRows(
  rows: CatalogProductRow[],
  sort: CatalogSort,
  priceBySlug: Record<string, number | undefined>,
): CatalogProductRow[] {
  const copy = [...rows];
  const priceOf = (row: CatalogProductRow) =>
    priceBySlug[row.slug] ?? row.price?.price;
  switch (sort) {
    case "score":
      return copy.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    case "price-asc":
      return copy.sort((a, b) => {
        const ap = priceOf(a);
        const bp = priceOf(b);
        if (ap === undefined && bp === undefined) return 0;
        if (ap === undefined) return 1;
        if (bp === undefined) return -1;
        return ap - bp;
      });
    case "price-desc":
      return copy.sort((a, b) => {
        const ap = priceOf(a);
        const bp = priceOf(b);
        if (ap === undefined && bp === undefined) return 0;
        if (ap === undefined) return 1;
        if (bp === undefined) return -1;
        return bp - ap;
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
      return copy.sort(
        (a, b) =>
          (b.filterTokens?.cushionRank ?? -1) -
          (a.filterTokens?.cushionRank ?? -1),
      );
    case "recommended":
    default:
      return copy.sort((a, b) => {
        const scoreDiff = (b.score ?? -1) - (a.score ?? -1);
        if (scoreDiff !== 0) return scoreDiff;
        const ad = a.releaseDate ?? a.updatedAt ?? "";
        const bd = b.releaseDate ?? b.updatedAt ?? "";
        const dateDiff = new Date(bd).getTime() - new Date(ad).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.fullName.localeCompare(b.fullName);
      });
  }
}

export function filterAndSortCatalogRows(
  rows: CatalogProductRow[],
  filters: CatalogFilterState,
  priceBySlug: Record<string, number | undefined>,
): CatalogProductRow[] {
  const matched = rows.filter((row) =>
    catalogRowMatches(row, filters, priceBySlug[row.slug]),
  );
  return sortCatalogRows(matched, filters.sort, priceBySlug);
}

export function paginateCatalogRows(
  rows: CatalogProductRow[],
  page: number,
  pageSize = CATALOG_PAGE_SIZE,
): {
  page: number;
  totalPages: number;
  products: CatalogProductRow[];
} {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize) || 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages,
    products: rows.slice(start, start + pageSize),
  };
}

export function chipsFromCatalogFilters(
  filters: CatalogFilterState,
  facets: CatalogFacet[],
  lockedTypes: string[],
  lockedUseCases: string[],
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  const labelFor = (key: string, value: string) => {
    const facet = facets.find((f) => f.key === key || f.id === key);
    return facet?.options.find((o) => o.value === value)?.label ?? value;
  };

  for (const value of filters.type) {
    if (lockedTypes.includes(value)) continue;
    chips.push({
      id: `type:${value}`,
      group: "type",
      value,
      label: labelFor("type", value),
    });
  }
  for (const value of filters.brand) {
    chips.push({
      id: `brand:${value}`,
      group: "brand",
      value,
      label: labelFor("brand", value),
    });
  }
  for (const value of filters.useCase) {
    if (lockedUseCases.includes(value)) continue;
    chips.push({
      id: `usecase:${value}`,
      group: "usecase",
      value,
      label: labelFor("usecase", value),
    });
  }
  for (const [key, values] of Object.entries(filters.specs)) {
    for (const value of values) {
      chips.push({
        id: `${key}:${value}`,
        group: key,
        value,
        label: `${labelFor(key, value)}`,
      });
    }
  }
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    chips.push({
      id: "price",
      group: "price",
      value: `${filters.priceMin ?? ""}-${filters.priceMax ?? ""}`,
      label: `Price ${filters.priceMin ?? "…"}–${filters.priceMax ?? "…"}`,
    });
  }
  return chips;
}

export function recountFacets(
  facets: CatalogFacet[],
  rows: CatalogProductRow[],
  filters: CatalogFilterState,
  priceBySlug: Record<string, number | undefined>,
): CatalogFacet[] {
  return facets.map((facet) => {
    if (!facet.options.length) return facet;
    const without: CatalogFilterState = {
      ...filters,
      type: facet.key === "type" ? [] : filters.type,
      brand: facet.key === "brand" ? [] : filters.brand,
      useCase:
        facet.key === "usecase" || facet.key === "useCase"
          ? []
          : filters.useCase,
      specs:
        facet.key === "type" ||
        facet.key === "brand" ||
        facet.key === "usecase" ||
        facet.key === "price"
          ? filters.specs
          : Object.fromEntries(
              Object.entries(filters.specs).filter(([key]) => key !== facet.key),
            ),
      priceMin: facet.key === "price" ? undefined : filters.priceMin,
      priceMax: facet.key === "price" ? undefined : filters.priceMax,
    };
    return {
      ...facet,
      options: facet.options.map((option) => {
        const probe: CatalogFilterState = {
          ...without,
          type:
            facet.key === "type" ? [option.value] : without.type,
          brand:
            facet.key === "brand" ? [option.value] : without.brand,
          useCase:
            facet.key === "usecase" || facet.key === "useCase"
              ? [option.value]
              : without.useCase,
          specs:
            facet.key === "type" ||
            facet.key === "brand" ||
            facet.key === "usecase" ||
            facet.key === "price"
              ? without.specs
              : {
                  ...without.specs,
                  [facet.key]: [option.value],
                },
        };
        const count = rows.filter((row) =>
          catalogRowMatches(row, probe, priceBySlug[row.slug]),
        ).length;
        return { ...option, count };
      }),
    };
  });
}
