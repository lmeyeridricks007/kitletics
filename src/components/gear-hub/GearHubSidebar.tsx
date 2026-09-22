"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModalFocus } from "@/lib/a11y/use-modal-focus";
import type { GearHubPageData } from "@/lib/gear-hub/types";

function buildHref(
  pathname: string,
  current: URLSearchParams,
  patch: Record<string, string | undefined>,
) {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (!value) next.delete(key);
    else next.set(key, value);
  }
  const q = next.toString();
  return q ? `${pathname}?${q}` : pathname;
}

export function GearHubSidebar({
  browse,
  facets,
  filters,
  className,
}: {
  browse: GearHubPageData["browse"];
  facets: GearHubPageData["facets"];
  filters: GearHubPageData["filters"];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [brandQuery, setBrandQuery] = useState("");

  const navigate = (patch: Record<string, string | undefined>) => {
    const href = buildHref(pathname, searchParams, patch);
    startTransition(() => router.push(href));
  };

  const brands = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    if (!q) return facets.brands;
    return facets.brands.filter((b) => b.label.toLowerCase().includes(q));
  }, [brandQuery, facets.brands]);

  return (
    <div className={cn("space-y-6", pending && "opacity-70", className)}>
      <section>
        <h2 className="text-[12px] font-bold tracking-[0.1em] text-foreground uppercase">
          Browse gear
        </h2>
        <ul className="mt-3 space-y-0.5">
          {browse.map((item) => {
            const sport = searchParams.get("sport");
            const isActive = item.sportFilter
              ? item.sportFilter === sport
              : !sport;
            return (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={cn(
                    "block rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-accent/25 text-foreground"
                      : "text-muted hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-[12px] font-bold tracking-[0.1em] text-foreground uppercase">
          Filters
        </h2>

        {facets.bestFor.length > 0 && (
          <fieldset className="mt-4">
            <legend className="text-[12px] font-semibold text-foreground">
              Best for
            </legend>
            <ul className="mt-2 space-y-1.5">
              {facets.bestFor.map((opt) => {
                const checked = filters.usecase === opt.value;
                return (
                  <li key={opt.id}>
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
                      <input
                        type="checkbox"
                        className="size-3.5 rounded border-border accent-[var(--accent)]"
                        checked={checked}
                        onChange={() =>
                          navigate({
                            usecase: checked ? undefined : opt.value,
                          })
                        }
                      />
                      <span className="flex-1">{opt.label}</span>
                      <span className="text-[11px] text-muted">{opt.count}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        )}

        <fieldset className="mt-5">
          <legend className="text-[12px] font-semibold text-foreground">
            Price range
          </legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => navigate({ maxPrice: undefined })}
              className={cn(
                "rounded-md border px-2 py-1 text-[11px] font-medium",
                !filters.maxPrice
                  ? "border-accent bg-accent/20 text-foreground"
                  : "border-border text-muted hover:border-foreground/30",
              )}
            >
              Any
            </button>
            {facets.priceStops.map((stop) => {
              const active = filters.maxPrice === stop;
              return (
                <button
                  key={stop}
                  type="button"
                  onClick={() =>
                    navigate({ maxPrice: active ? undefined : String(stop) })
                  }
                  className={cn(
                    "rounded-md border px-2 py-1 text-[11px] font-medium",
                    active
                      ? "border-accent bg-accent/20 text-foreground"
                      : "border-border text-muted hover:border-foreground/30",
                  )}
                >
                  ≤ €{stop}
                </button>
              );
            })}
          </div>
        </fieldset>

        {facets.brands.length > 0 && (
          <fieldset className="mt-5">
            <legend className="text-[12px] font-semibold text-foreground">
              Brand
            </legend>
            <label className="sr-only" htmlFor="gear-brand-search">
              Search brands
            </label>
            <input
              id="gear-brand-search"
              type="search"
              value={brandQuery}
              onChange={(e) => setBrandQuery(e.target.value)}
              placeholder="Search brands"
              className="mt-2 h-8 w-full rounded-md border border-border bg-white px-2 text-[12px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
            <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto">
              {brands.map((opt) => {
                const checked = filters.brand === opt.value;
                return (
                  <li key={opt.id}>
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
                      <input
                        type="checkbox"
                        className="size-3.5 rounded border-border accent-[var(--accent)]"
                        checked={checked}
                        onChange={() =>
                          navigate({
                            brand: checked ? undefined : opt.value,
                          })
                        }
                      />
                      <span className="flex-1 truncate">{opt.label}</span>
                      <span className="text-[11px] text-muted">{opt.count}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        )}

        {(filters.sport ||
          filters.usecase ||
          filters.brand ||
          filters.maxPrice) && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="mt-5 text-[12px] font-medium text-link hover:underline"
          >
            Clear filters
          </button>
        )}
      </section>
    </div>
  );
}

export function GearHubMobileFilters({
  browse,
  facets,
  filters,
}: {
  browse: GearHubPageData["browse"];
  facets: GearHubPageData["facets"];
  filters: GearHubPageData["filters"];
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useModalFocus(open, panelRef, close);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center rounded-md border border-border bg-white px-3 text-[13px] font-semibold text-foreground"
      >
        Browse & filter
      </button>
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
            aria-label="Browse and filter gear"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-[min(100%,320px)] flex-col bg-white shadow-xl outline-none"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-[13px] font-bold tracking-[0.06em] uppercase">
                Browse & filter
              </p>
              <button
                type="button"
                onClick={close}
                className="rounded-md p-1 text-muted hover:text-foreground"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <GearHubSidebar
                browse={browse}
                facets={facets}
                filters={filters}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
