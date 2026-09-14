"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { List, SlidersHorizontal, X } from "lucide-react";
import type {
  ActiveFilterChip,
  CatalogFacet,
  CatalogFilterState,
  CatalogProductRow,
  CatalogSort,
} from "@/lib/catalog/types";
import {
  catalogHref,
  clearCatalogFilters,
  removeFilterValue,
} from "@/lib/catalog/params";
import { CatalogProductCard } from "@/components/catalog/CatalogProductCard";
import { ShopByFitChips } from "@/components/catalog/ShopByFitChips";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useCompareTray } from "@/components/compare/CompareTrayProvider";
import type { AudienceFit } from "@/lib/product/audience";
import { AUDIENCE_LABELS } from "@/lib/product/audience";
import { useModalFocus } from "@/lib/a11y/use-modal-focus";
import { track } from "@/lib/analytics";

interface CatalogInteractiveProps {
  basePath: string;
  categoryName: string;
  filters: CatalogFilterState;
  facets: CatalogFacet[];
  activeFilters: ActiveFilterChip[];
  products: CatalogProductRow[];
  total: number;
  availableSorts: { value: CatalogSort; label: string }[];
  primaryFilterKeys: string[];
  finderHref?: string;
  compareCategorySlug: string;
  compact?: boolean;
  /** Product Category mockup chrome (filters title, sort/compare header). */
  mockupLayout?: boolean;
  /** Use-case / subcategory listing: denser grid + locked eligibility. */
  listingLayout?: boolean;
  lockedTypes?: string[];
  lockedUseCases?: string[];
  page?: number;
  totalPages?: number;
}

export function CatalogInteractive({
  basePath,
  categoryName,
  filters,
  facets,
  activeFilters,
  products,
  total,
  availableSorts,
  primaryFilterKeys,
  finderHref,
  compareCategorySlug,
  compact,
  mockupLayout,
  listingLayout,
  lockedTypes = [],
  lockedUseCases = [],
  page = 1,
  totalPages = 1,
}: CatalogInteractiveProps) {
  const router = useRouter();
  const tray = useCompareTray();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const titleId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const pushState = useCallback(
    (next: CatalogFilterState) => {
      const forUrl: CatalogFilterState = {
        ...next,
        type: next.type.filter((t) => !lockedTypes.includes(t)),
        useCase: next.useCase.filter((u) => !lockedUseCases.includes(u)),
      };
      const filterCount =
        forUrl.type.length +
        forUrl.brand.length +
        forUrl.useCase.length +
        Object.values(forUrl.specs).reduce((n, v) => n + v.length, 0);
      track("filter_use", {
        filter_count: filterCount,
        filter_key: "facet",
      });
      track("category_filter", {
        filter_count: filterCount,
        filter_key: "facet",
      });
      // Keep locked eligibility in navigation state by merging back on parse server-side;
      // URL only carries user refinements for listing pages.
      if (lockedTypes.length === 0 && lockedUseCases.length === 0) {
        router.push(catalogHref(basePath, next), { scroll: false });
      } else {
        router.push(catalogHref(basePath, forUrl), { scroll: false });
      }
    },
    [router, basePath, lockedTypes, lockedUseCases],
  );

  function toggleFacetValue(facetKey: string, value: string) {
    const next: CatalogFilterState = {
      ...filters,
      type: [...filters.type],
      brand: [...filters.brand],
      useCase: [...filters.useCase],
      specs: { ...filters.specs },
    };

    if (facetKey === "type") {
      if (lockedTypes.includes(value)) return;
      next.type = toggleInList(next.type, value);
      for (const locked of lockedTypes) {
        if (!next.type.includes(locked)) next.type.push(locked);
      }
    } else if (facetKey === "brand") {
      next.brand = toggleInList(next.brand, value);
    } else if (facetKey === "usecase") {
      if (lockedUseCases.includes(value)) return;
      next.useCase = toggleInList(next.useCase, value);
      for (const locked of lockedUseCases) {
        if (!next.useCase.includes(locked)) next.useCase.push(locked);
      }
    } else {
      const current = next.specs[facetKey] ?? [];
      next.specs[facetKey] = toggleInList(current, value);
      if (next.specs[facetKey].length === 0) delete next.specs[facetKey];
    }
    pushState(next);
  }

  function isSelected(facetKey: string, value: string): boolean {
    if (facetKey === "type") return filters.type.includes(value);
    if (facetKey === "brand") return filters.brand.includes(value);
    if (facetKey === "usecase") return filters.useCase.includes(value);
    return (filters.specs[facetKey] ?? []).includes(value);
  }

  function onSort(sort: CatalogSort) {
    pushState({ ...filters, sort });
  }

  function onToggleCompare(productId: string) {
    const row = products.find((r) => r.id === productId);
    if (!row) return;
    const item = {
      slug: row.slug,
      name: row.name,
      brandName: row.brandName,
      categoryId: row.categoryId,
      categorySlug: compareCategorySlug,
    };
    if (tray.isSelected(row.slug)) {
      tray.removeProduct(row.slug, "catalog");
      return;
    }
    const result = tray.addProduct(item, { source: "catalog" });
    if (!result.ok && result.reason === "category-conflict") {
      const ok = window.confirm(result.message);
      if (ok) {
        tray.addProduct(item, { source: "catalog", forceCategoryReset: true });
      }
    }
  }

  const orderedFacets = useMemo(() => {
    const list = facets ?? [];
    if (primaryFilterKeys.length === 0) return list;
    const rank = new Map(primaryFilterKeys.map((k, i) => [k, i]));
    return [...list].sort((a, b) => {
      const ar = rank.get(a.key) ?? 1000;
      const br = rank.get(b.key) ?? 1000;
      return ar - br;
    });
  }, [facets, primaryFilterKeys]);

  useModalFocus(drawerOpen, drawerRef, closeDrawer);

  function clearRefinements() {
    const cleared = clearCatalogFilters(filters);
    pushState({
      ...cleared,
      type: [...lockedTypes],
      useCase: [...lockedUseCases],
      sort: filters.sort,
    });
  }

  const filterPanel = (
    <FilterPanel
      facets={orderedFacets}
      isSelected={isSelected}
      onToggle={toggleFacetValue}
      onClear={clearRefinements}
      hasActive={activeFilters.length > 0}
      mockupLayout={mockupLayout}
      listingLayout={listingLayout}
      lockedTypes={lockedTypes}
      lockedUseCases={lockedUseCases}
      priceMin={filters.priceMin}
      priceMax={filters.priceMax}
      onPriceBucket={(min, max) => {
        const same =
          filters.priceMin === min && filters.priceMax === max;
        pushState({
          ...filters,
          priceMin: same ? undefined : min,
          priceMax: same ? undefined : max,
        });
      }}
    />
  );

  const genderFacet = facets.find((f) => f.key === "genderFit" || f.key === "fit");
  const activeGender = (filters.specs.genderFit?.[0] ?? filters.specs.fit?.[0]) as AudienceFit | undefined;
  const fitOptions = genderFacet
    ? [
        {
          value: "all" as const,
          label: "All shoes",
          count: undefined,
        },
        ...genderFacet.options
          .filter(
            (o): o is { value: AudienceFit; label: string; count: number } =>
              o.value === "men" || o.value === "women" || o.value === "unisex",
          )
          .map((o) => ({
            value: o.value,
            label: AUDIENCE_LABELS[o.value],
            count: o.count,
          })),
      ]
    : undefined;

  const countLabel = (() => {
    if (activeGender && AUDIENCE_LABELS[activeGender]) {
      return `${total} models available in ${AUDIENCE_LABELS[activeGender]} sizing`;
    }
    if (activeFilters.length > 0) {
      return `${total} ${total === 1 ? "match" : "matches"}`;
    }
    if (listingLayout) return `${total} ${categoryName}`;
    if (mockupLayout) return `${total} running shoes`;
    return `${total} ${categoryName}`;
  })();

  return (
    <div className="relative">
      {fitOptions && fitOptions.length > 1 && (
        <ShopByFitChips
          basePath={basePath}
          options={fitOptions}
          className="mb-5 border-t-0 pt-0"
        />
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-3.5 text-sm font-medium"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters
          {activeFilters.length > 0 && (
            <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">
              {activeFilters.length}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <SortSelect
            value={filters.sort}
            options={availableSorts}
            onChange={onSort}
            mockupLayout={mockupLayout}
          />
          {mockupLayout && (
            <CompareButton count={tray.count} />
          )}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() =>
                pushState(removeFilterValue(filters, chip.group, chip.value))
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground hover:border-accent"
            >
              {chip.label}
              <X className="size-3.5 text-subtle" aria-hidden />
              <span className="sr-only">Remove {chip.label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={clearRefinements}
            className="text-xs font-medium text-link hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="mb-4 hidden items-center justify-between gap-4 lg:flex">
        <p
          className="text-[13px] font-bold tracking-[0.06em] text-foreground uppercase"
          aria-live="polite"
        >
          {countLabel}
        </p>
        <div className="flex items-center gap-3">
          <SortSelect
            value={filters.sort}
            options={availableSorts}
            onChange={onSort}
            mockupLayout={mockupLayout}
          />
          {mockupLayout && <CompareButton count={tray.count} />}
        </div>
      </div>

      {!mockupLayout && (
        <div className="mb-4 flex items-end justify-between gap-4 lg:hidden">
          <p className="text-sm text-muted" aria-live="polite">
            {countLabel}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside
          className={
            compact || mockupLayout
              ? "hidden lg:block lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
              : "hidden lg:block"
          }
        >
          {filterPanel}
        </aside>

        <div>
          {products.length === 0 ? (
            <EmptyFilterState
              activeFilters={activeFilters}
              onRemove={(group, value) =>
                pushState(removeFilterValue(filters, group, value))
              }
              onClear={clearRefinements}
              finderHref={finderHref}
            />
          ) : (
            <div
              className={
                listingLayout
                  ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : compact || mockupLayout
                    ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              }
            >
              {products.map((row, index) => (
                <CatalogProductCard
                  key={row.id}
                  row={row}
                  selected={tray.isSelected(row.slug)}
                  onToggleCompare={onToggleCompare}
                  compareDisabled={
                    !tray.canAdd && !tray.isSelected(row.slug)
                  }
                  compact={compact || mockupLayout}
                  hideBestFor={listingLayout}
                  priority={index < 2}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6"
              aria-label="Catalog pagination"
            >
              <p className="text-sm text-muted">
                Page {page} of {totalPages} · {total}{" "}
                {total === 1 ? "product" : "products"}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <ButtonLink
                    href={catalogHref(basePath, filters, page - 1)}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </ButtonLink>
                ) : null}
                {page < totalPages ? (
                  <ButtonLink
                    href={catalogHref(basePath, filters, page + 1)}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </ButtonLink>
                ) : null}
              </div>
            </nav>
          )}
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal-950/50"
            aria-label="Close filters"
            onClick={closeDrawer}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface-elevated shadow-xl outline-none"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 id={titleId} className="font-display text-lg font-semibold">
                Filters
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg p-2 hover:bg-surface-muted"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{filterPanel}</div>
            <div className="border-t border-border p-4">
              <Button className="w-full" onClick={closeDrawer}>
                Show {total} results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function CompareButton({ count }: { count: number }) {
  return (
    <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-[12px] font-medium text-foreground">
      <List className="size-3.5 text-muted" strokeWidth={1.75} aria-hidden />
      Compare ({count})
    </span>
  );
}

function SortSelect({
  value,
  options,
  onChange,
  mockupLayout,
}: {
  value: CatalogSort;
  options: { value: CatalogSort; label: string }[];
  onChange: (value: CatalogSort) => void;
  mockupLayout?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-subtle">{mockupLayout ? "Sort by" : "Sort"}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CatalogSort)}
        className={
          mockupLayout
            ? "h-9 rounded-md border border-border bg-white px-2.5 text-[13px]"
            : "h-11 rounded-xl border border-border bg-surface px-3 text-sm"
        }
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterPanel({
  facets,
  isSelected,
  onToggle,
  onClear,
  hasActive,
  mockupLayout,
  listingLayout,
  lockedTypes = [],
  lockedUseCases = [],
  priceMin,
  priceMax,
  onPriceBucket,
}: {
  facets: CatalogFacet[];
  isSelected: (key: string, value: string) => boolean;
  onToggle: (key: string, value: string) => void;
  onClear: () => void;
  hasActive: boolean;
  mockupLayout?: boolean;
  listingLayout?: boolean;
  lockedTypes?: string[];
  lockedUseCases?: string[];
  priceMin?: number;
  priceMax?: number;
  onPriceBucket?: (min?: number, max?: number) => void;
}) {
  return (
    <div className={mockupLayout || listingLayout ? "space-y-4" : "space-y-5"}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold tracking-[0.14em] text-foreground uppercase">
          Filters
        </p>
        {hasActive || listingLayout ? (
          <button
            type="button"
            onClick={onClear}
            disabled={!hasActive}
            className="text-[12px] font-medium text-link hover:underline disabled:cursor-default disabled:opacity-40"
          >
            Clear all
          </button>
        ) : null}
      </div>
      {facets
        .filter(
          (f) =>
            f.key !== "price" || f.options.length > 0 || f.min !== undefined,
        )
        .map((facet) => {
          if (facet.key === "price" && facet.options.length === 0) {
            if (listingLayout && onPriceBucket) {
              const currency = facet.unit ?? "EUR";
              const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
              const buckets: { label: string; min?: number; max?: number }[] = [
                { label: `Under ${symbol}100`, max: 100 },
                { label: `${symbol}100–${symbol}150`, min: 100, max: 150 },
                { label: `${symbol}150–${symbol}200`, min: 150, max: 200 },
                { label: `Over ${symbol}200`, min: 200 },
              ];
              return (
                <fieldset
                  key={facet.id}
                  className="space-y-1.5 border-t border-border pt-3"
                >
                  <legend className="text-[11px] font-bold tracking-[0.08em] text-foreground uppercase">
                    {facet.label}
                  </legend>
                  <ul className="space-y-0.5">
                    {buckets.map((b) => {
                      const checked =
                        priceMin === b.min && priceMax === b.max;
                      return (
                        <li key={b.label}>
                          <label className="flex cursor-pointer items-center gap-2 rounded-md px-0.5 py-1 text-[13px] hover:bg-surface-muted">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => onPriceBucket(b.min, b.max)}
                              className="size-3.5 rounded border-border accent-accent"
                            />
                            {b.label}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              );
            }
            return (
              <fieldset
                key={facet.id}
                className="space-y-2 border-t border-border pt-3"
              >
                <legend className="text-[11px] font-bold tracking-[0.08em] text-foreground uppercase">
                  {facet.label}
                </legend>
                <p className="text-xs text-muted">
                  From {facet.min}
                  {facet.unit ? ` ${facet.unit}` : ""} – {facet.max}
                  {facet.unit ? ` ${facet.unit}` : ""}
                </p>
              </fieldset>
            );
          }
          if (facet.options.length === 0) return null;
          // Keep selected/locked options in the first visible chunk so deep
          // filters (e.g. Type → Trail Shoes) are not buried under "Show more".
          const pinned = new Set(
            facet.options
              .filter(
                (o) =>
                  isSelected(facet.key, o.value) ||
                  (facet.key === "type" && lockedTypes.includes(o.value)) ||
                  (facet.key === "usecase" && lockedUseCases.includes(o.value)),
              )
              .map((o) => o.value),
          );
          const ordered = [
            ...facet.options.filter((o) => pinned.has(o.value)),
            ...facet.options.filter((o) => !pinned.has(o.value)),
          ];
          const visible = ordered.slice(0, Math.max(6, pinned.size));
          const rest = ordered.slice(visible.length);
          return (
            <FacetGroup
              key={facet.id}
              facet={{ ...facet, options: ordered }}
              visible={visible}
              rest={rest}
              isSelected={isSelected}
              onToggle={onToggle}
              lockedValues={
                facet.key === "type"
                  ? lockedTypes
                  : facet.key === "usecase"
                    ? lockedUseCases
                    : []
              }
              enableBrandSearch={listingLayout && facet.key === "brand"}
              initiallyExpanded={pinned.size > 0 && rest.some((o) => pinned.has(o.value))}
            />
          );
        })}
    </div>
  );
}

function FacetGroup({
  facet,
  visible,
  rest,
  isSelected,
  onToggle,
  lockedValues = [],
  enableBrandSearch,
  initiallyExpanded = false,
}: {
  facet: CatalogFacet;
  visible: CatalogFacet["options"];
  rest: CatalogFacet["options"];
  isSelected: (key: string, value: string) => boolean;
  onToggle: (key: string, value: string) => void;
  lockedValues?: string[];
  enableBrandSearch?: boolean;
  initiallyExpanded?: boolean;
}) {
  const [showMore, setShowMore] = useState(initiallyExpanded);
  const [brandQuery, setBrandQuery] = useState("");
  const all = [...visible, ...rest];
  const filtered = enableBrandSearch && brandQuery.trim()
    ? all.filter((o) =>
        o.label.toLowerCase().includes(brandQuery.trim().toLowerCase()),
      )
    : showMore
      ? all
      : visible;

  return (
    <fieldset className="space-y-1.5 border-t border-border pt-3">
      <legend className="text-[11px] font-bold tracking-[0.08em] text-foreground uppercase">
        {facet.label}
      </legend>
      {enableBrandSearch && (
        <label className="block">
          <span className="sr-only">Search brands</span>
          <input
            type="search"
            value={brandQuery}
            onChange={(e) => setBrandQuery(e.target.value)}
            placeholder="Search brands..."
            className="mb-1.5 h-8 w-full rounded-md border border-border bg-white px-2.5 text-[12px]"
          />
        </label>
      )}
      <ul className="space-y-0.5">
        {filtered.map((option) => {
          const locked = lockedValues.includes(option.value);
          return (
            <li key={option.value}>
              <label
                className={`flex items-center justify-between gap-2 rounded-md px-0.5 py-1 text-[13px] hover:bg-surface-muted ${locked ? "cursor-default" : "cursor-pointer"}`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected(facet.key, option.value) || locked}
                    disabled={locked}
                    onChange={() => onToggle(facet.key, option.value)}
                    className="size-3.5 rounded border-border accent-accent disabled:opacity-80"
                  />
                  <span className="truncate">{option.label}</span>
                </span>
                <span className="shrink-0 text-[11px] text-subtle tabular-nums">
                  ({option.count})
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {!brandQuery && rest.length > 0 && (
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="mt-1 text-[12px] font-medium text-link hover:underline"
        >
          {showMore ? "Show less" : "Show more"}
        </button>
      )}
    </fieldset>
  );
}

function EmptyFilterState({
  activeFilters,
  onRemove,
  onClear,
  finderHref,
}: {
  activeFilters: ActiveFilterChip[];
  onRemove: (group: string, value: string) => void;
  onClear: () => void;
  finderHref?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 px-6 py-12 text-center">
      <p className="font-display text-lg font-semibold text-foreground">
        No products match all these filters.
      </p>
      <p className="mt-2 text-sm text-muted">Try removing:</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {activeFilters.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onRemove(chip.group, chip.value)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium"
          >
            {chip.label}
            <X className="size-3.5" aria-hidden />
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={onClear}>
          Clear Filters
        </Button>
        {finderHref && <ButtonLink href={finderHref}>Use Finder</ButtonLink>}
      </div>
    </div>
  );
}
