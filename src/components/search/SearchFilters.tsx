"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useModalFocus } from "@/lib/a11y/use-modal-focus";
import type {
  SearchFacetOption,
} from "@/lib/search/get-search-page-data";
import type {
  SearchFeatureFacet,
  SearchPriceFacet,
} from "@/lib/search/facets";
import type { SearchFilter } from "@/lib/search/types";

interface SearchFiltersProps {
  query: string;
  filter: SearchFilter;
  brandFilter?: string;
  typeFacets: SearchFacetOption[];
  sportFacets: SearchFacetOption[];
  categoryFacets: SearchFacetOption[];
  brandFacets: SearchFacetOption[];
  featureFacets: SearchFeatureFacet[];
  priceFacet?: SearchPriceFacet;
  pricesUpdating?: boolean;
  activeFeatures: string[];
  showProductFacets: boolean;
}

function buildHref(
  query: string,
  opts: {
    type?: string;
    brand?: string;
    features?: string[];
    minPrice?: number;
    maxPrice?: number;
    clear?: boolean;
  },
): string {
  if (opts.clear) {
    return `/search?q=${encodeURIComponent(query)}`;
  }
  const params = new URLSearchParams();
  params.set("q", query);
  if (opts.type && opts.type !== "all") params.set("type", opts.type);
  if (opts.brand) params.set("brand", opts.brand);
  if (opts.minPrice != null) params.set("minPrice", String(opts.minPrice));
  if (opts.maxPrice != null) params.set("maxPrice", String(opts.maxPrice));
  for (const f of opts.features ?? []) {
    params.append("feature", f);
  }
  return `/search?${params.toString()}`;
}

function FacetCheckbox({
  checked,
  label,
  count,
  href,
}: {
  checked: boolean;
  label: string;
  count: number;
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-start gap-2 py-1 text-[13px] text-foreground hover:text-link"
        aria-current={checked ? "true" : undefined}
      >
        <span
          className={cn(
            "mt-0.5 flex size-3.5 shrink-0 items-center justify-center border",
            checked
              ? "border-accent bg-accent text-[#0b1220]"
              : "border-border bg-white",
          )}
          aria-hidden
        >
          {checked && (
            <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
              <path
                d="M2.5 6.2L4.8 8.5L9.5 3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="min-w-0 flex-1 leading-snug">
          {label}{" "}
          <span className="text-muted">({count})</span>
        </span>
      </Link>
    </li>
  );
}

function PriceRangeControl({
  priceFacet,
  query,
  filter,
  brandFilter,
  activeFeatures,
}: {
  priceFacet: SearchPriceFacet;
  query: string;
  filter: SearchFilter;
  brandFilter?: string;
  activeFeatures: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const selectedMax =
    priceFacet.selectedMax ?? priceFacet.max;
  const [value, setValue] = useState(selectedMax);

  function commit(nextMax: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", query);
    if (filter !== "all") params.set("type", filter);
    else params.delete("type");
    if (brandFilter) params.set("brand", brandFilter);
    else params.delete("brand");
    params.delete("feature");
    for (const f of activeFeatures) params.append("feature", f);
    // Range: min stays at catalog floor unless user set minPrice; slider sets max
    params.set("minPrice", String(priceFacet.min));
    if (nextMax >= priceFacet.max) {
      params.delete("maxPrice");
      params.delete("minPrice");
    } else {
      params.set("maxPrice", String(nextMax));
    }
    const href = `${pathname}?${params.toString()}`;
    startTransition(() => router.push(href));
  }

  return (
    <fieldset>
      <legend className="mb-2 text-[12px] font-bold text-foreground">
        Price range
      </legend>
      <div className="space-y-2">
        <input
          type="range"
          min={priceFacet.min}
          max={priceFacet.max}
          step={1}
          value={value}
          aria-label="Maximum price"
          onChange={(e) => setValue(Number(e.target.value))}
          onMouseUp={() => commit(value)}
          onTouchEnd={() => commit(value)}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === "ArrowLeft" || e.key === "ArrowRight")
              commit(value);
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-[var(--color-accent,#c8f135)]"
        />
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>{formatPrice(priceFacet.min, priceFacet.currency)}</span>
          <span>
            Up to {formatPrice(value, priceFacet.currency)}
            {value >= priceFacet.max ? "+" : ""}
          </span>
        </div>
      </div>
    </fieldset>
  );
}

export function SearchFilters({
  query,
  filter,
  brandFilter,
  typeFacets,
  sportFacets,
  categoryFacets,
  brandFacets,
  featureFacets,
  priceFacet,
  pricesUpdating,
  activeFeatures,
  showProductFacets,
}: SearchFiltersProps) {
  const [open, setOpen] = useState(false);
  const [brandExpanded, setBrandExpanded] = useState(false);
  const [categoryExpanded, setCategoryExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useModalFocus(open, panelRef, close);
  const visibleBrands = brandExpanded ? brandFacets : brandFacets.slice(0, 5);
  const visibleCategories = categoryExpanded
    ? categoryFacets
    : categoryFacets.slice(0, 5);

  const hasActive =
    filter !== "all" ||
    Boolean(brandFilter) ||
    activeFeatures.length > 0 ||
    priceFacet?.selectedMin != null ||
    priceFacet?.selectedMax != null;

  const baseOpts = useMemo(
    () => ({
      type: filter === "all" ? undefined : filter,
      brand: brandFilter,
      features: activeFeatures,
      minPrice: priceFacet?.selectedMin,
      maxPrice: priceFacet?.selectedMax,
    }),
    [
      filter,
      brandFilter,
      activeFeatures,
      priceFacet?.selectedMin,
      priceFacet?.selectedMax,
    ],
  );

  const body = useMemo(
    () => (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[12px] font-bold tracking-[0.08em] text-foreground uppercase">
            Refine results
          </h2>
          {hasActive && (
            <Link
              href={buildHref(query, { clear: true })}
              className="text-[12px] font-semibold text-link hover:underline"
            >
              Clear all
            </Link>
          )}
        </div>

        {typeFacets.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-[12px] font-bold text-foreground">
              Type
            </legend>
            <ul className="space-y-0.5">
              {typeFacets.map((f) => {
                const active = filter === f.value;
                return (
                  <FacetCheckbox
                    key={f.id}
                    checked={active}
                    label={f.label}
                    count={f.count}
                    href={buildHref(query, {
                      ...baseOpts,
                      type: active ? "all" : f.value,
                    })}
                  />
                );
              })}
            </ul>
          </fieldset>
        )}

        {showProductFacets && sportFacets.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-[12px] font-bold text-foreground">
              Sport
            </legend>
            <ul className="space-y-0.5">
              {sportFacets.map((f) => (
                <FacetCheckbox
                  key={f.id}
                  checked={false}
                  label={f.label}
                  count={f.count}
                  href={`/search?q=${encodeURIComponent(f.label)}`}
                />
              ))}
            </ul>
          </fieldset>
        )}

        {showProductFacets && categoryFacets.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-[12px] font-bold text-foreground">
              Category
            </legend>
            <ul className="space-y-0.5">
              {visibleCategories.map((f) => (
                <FacetCheckbox
                  key={f.id}
                  checked={false}
                  label={f.label}
                  count={f.count}
                  href={`/search?q=${encodeURIComponent(f.label)}`}
                />
              ))}
            </ul>
            {categoryFacets.length > 5 && (
              <button
                type="button"
                onClick={() => setCategoryExpanded((v) => !v)}
                className="mt-2 text-[12px] font-semibold text-link hover:underline"
              >
                {categoryExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </fieldset>
        )}

        {showProductFacets && brandFacets.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-[12px] font-bold text-foreground">
              Brand
            </legend>
            <ul className="space-y-0.5">
              {visibleBrands.map((f) => {
                const active = brandFilter === f.value;
                return (
                  <FacetCheckbox
                    key={f.id}
                    checked={active}
                    label={f.label}
                    count={f.count}
                    href={buildHref(query, {
                      ...baseOpts,
                      brand: active ? undefined : f.value,
                    })}
                  />
                );
              })}
            </ul>
            {brandFacets.length > 5 && (
              <button
                type="button"
                onClick={() => setBrandExpanded((v) => !v)}
                className="mt-2 text-[12px] font-semibold text-link hover:underline"
              >
                {brandExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </fieldset>
        )}

        {showProductFacets && priceFacet && (
          <PriceRangeControl
            priceFacet={priceFacet}
            query={query}
            filter={filter}
            brandFilter={brandFilter}
            activeFeatures={activeFeatures}
          />
        )}

        {showProductFacets && !priceFacet && pricesUpdating && (
          <div>
            <p className="mb-1 text-[12px] font-bold text-foreground">Price</p>
            <p className="text-[12px] text-muted">Prices updating</p>
          </div>
        )}

        {showProductFacets && featureFacets.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-[12px] font-bold text-foreground">
              Features
            </legend>
            <ul className="space-y-0.5">
              {featureFacets.map((f) => {
                const active = activeFeatures.includes(f.value);
                const nextFeatures = active
                  ? activeFeatures.filter((x) => x !== f.value)
                  : [...activeFeatures, f.value];
                return (
                  <FacetCheckbox
                    key={f.id}
                    checked={active}
                    label={f.label}
                    count={f.count}
                    href={buildHref(query, {
                      ...baseOpts,
                      features: nextFeatures,
                    })}
                  />
                );
              })}
            </ul>
          </fieldset>
        )}
      </div>
    ),
    [
      query,
      filter,
      brandFilter,
      typeFacets,
      sportFacets,
      categoryFacets,
      brandFacets,
      featureFacets,
      priceFacet,
      pricesUpdating,
      activeFeatures,
      showProductFacets,
      hasActive,
      visibleBrands,
      visibleCategories,
      brandExpanded,
      categoryExpanded,
      baseOpts,
    ],
  );

  return (
    <>
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 items-center rounded-md border border-border bg-white px-3 text-[13px] font-semibold text-foreground"
        >
          Filters
        </button>
      </div>

      <aside className="hidden w-[200px] shrink-0 lg:block">{body}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close filters"
            onClick={close}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Refine results"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-[min(100%,320px)] flex-col bg-white shadow-lg outline-none"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-[13px] font-bold uppercase">Filters</p>
              <button
                type="button"
                onClick={close}
                className="inline-flex size-8 items-center justify-center"
                aria-label="Close filters"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">{body}</div>
          </div>
        </div>
      )}
    </>
  );
}
