"use client";

import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  DATABASE_SORT_OPTIONS,
  buildActiveDatabaseChips,
  queryPadelRacketDatabase,
  removeDatabaseFilterValue,
  suggestRestrictiveFilters,
} from "@/lib/padel-racket-database/query";
import {
  PRICE_BUCKETS,
  SCORE_BUCKETS,
  WEIGHT_BUCKETS,
  countActiveDatabaseFilters,
  databaseHref,
  parseDatabaseSearchParams,
  DEFAULT_DATABASE_FILTERS,
} from "@/lib/padel-racket-database/params";
import type {
  PadelRacketDatabaseFilters,
  PadelRacketDatabasePageData,
  PadelRacketDatabaseSort,
} from "@/lib/padel-racket-database/types";
import {
  DatabaseCompareSticky,
  PadelRacketDatabaseCard,
} from "@/components/padel-racket-database/PadelRacketDatabaseCard";
import { useModalFocus } from "@/lib/a11y/use-modal-focus";
import { trackDatabaseFilterChange } from "@/lib/padel-racket-database/analytics";
import { cn } from "@/lib/utils";

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function ChipToggle({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-white"
          : "border-border bg-white text-foreground hover:border-foreground/40",
      )}
    >
      {label}
      {typeof count === "number" && (
        <span
          className={cn(
            "tabular-nums",
            active ? "text-white/70" : "text-muted",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
        {title}
      </p>
      <div className="mt-2 flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function FilterPanel({
  data,
  filters,
  onChange,
}: {
  data: PadelRacketDatabasePageData;
  filters: PadelRacketDatabaseFilters;
  onChange: (next: PadelRacketDatabaseFilters) => void;
}) {
  const setList = (
    key: keyof PadelRacketDatabaseFilters,
    value: string,
  ) => {
    const current = filters[key];
    if (!Array.isArray(current)) return;
    onChange({
      ...filters,
      [key]: toggleValue(current as string[], value),
    });
  };

  return (
    <div className="space-y-6">
      <label className="block">
        <span className="text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
          Search
        </span>
        <input
          type="search"
          value={filters.q ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              q: e.target.value.trim() ? e.target.value : undefined,
            })
          }
          placeholder="Brand or model"
          className="mt-1.5 w-full border border-border bg-white px-3 py-2 text-[14px] outline-none focus:border-foreground"
        />
      </label>

      <FilterSection title="Brand">
        {data.facets.brands.map((o) => (
          <ChipToggle
            key={o.value}
            active={filters.brand.includes(o.value)}
            label={o.label}
            count={o.count}
            onClick={() => setList("brand", o.value)}
          />
        ))}
      </FilterSection>

      {data.facets.shapes.length > 0 && (
        <FilterSection title="Shape">
          {data.facets.shapes.map((o) => (
            <ChipToggle
              key={o.value}
              active={filters.shape.includes(o.value)}
              label={o.label}
              count={o.count}
              onClick={() => setList("shape", o.value)}
            />
          ))}
        </FilterSection>
      )}

      {data.facets.balances.length > 0 && (
        <FilterSection title="Balance">
          {data.facets.balances.map((o) => (
            <ChipToggle
              key={o.value}
              active={filters.balance.includes(o.value)}
              label={o.label}
              count={o.count}
              onClick={() => setList("balance", o.value)}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Weight (min)">
        {WEIGHT_BUCKETS.map((b) => (
          <ChipToggle
            key={b.id}
            active={filters.weightBuckets.includes(b.id)}
            label={b.label}
            onClick={() => setList("weightBuckets", b.id)}
          />
        ))}
      </FilterSection>

      {data.facets.playStyles.length > 0 && (
        <FilterSection title="Play style">
          {data.facets.playStyles.map((o) => (
            <ChipToggle
              key={o.value}
              active={filters.playStyle.includes(o.value)}
              label={o.label}
              count={o.count}
              onClick={() => setList("playStyle", o.value)}
            />
          ))}
        </FilterSection>
      )}

      {data.facets.faceMaterials.length > 0 && (
        <FilterSection title="Face material">
          {data.facets.faceMaterials.map((o) => (
            <ChipToggle
              key={o.value}
              active={filters.faceMaterial.includes(o.value)}
              label={o.label}
              count={o.count}
              onClick={() => setList("faceMaterial", o.value)}
            />
          ))}
        </FilterSection>
      )}

      {data.facets.surfaces.length > 0 && (
        <FilterSection title="Surface">
          {data.facets.surfaces.map((o) => (
            <ChipToggle
              key={o.value}
              active={filters.surface.includes(o.value)}
              label={o.label}
              count={o.count}
              onClick={() => setList("surface", o.value)}
            />
          ))}
        </FilterSection>
      )}

      {data.facets.cores.length > 0 && (
        <FilterSection title="Core">
          {data.facets.cores.map((o) => (
            <ChipToggle
              key={o.value}
              active={filters.core.includes(o.value)}
              label={o.label}
              count={o.count}
              onClick={() => setList("core", o.value)}
            />
          ))}
        </FilterSection>
      )}

      {data.facets.feels.length > 0 && (
        <FilterSection title="Feel">
          {data.facets.feels.map((o) => (
            <ChipToggle
              key={o.value}
              active={filters.feel.includes(o.value)}
              label={o.label}
              count={o.count}
              onClick={() => setList("feel", o.value)}
            />
          ))}
        </FilterSection>
      )}

      {data.facets.playerLevels.length > 0 && (
        <FilterSection title="Player level">
          {data.facets.playerLevels.map((o) => (
            <ChipToggle
              key={o.value}
              active={filters.playerLevel.includes(o.value)}
              label={o.label}
              count={o.count}
              onClick={() => setList("playerLevel", o.value)}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection title="Power score">
        {SCORE_BUCKETS.map((b) => (
          <ChipToggle
            key={b.id}
            active={filters.powerBuckets.includes(b.id)}
            label={b.label}
            onClick={() => setList("powerBuckets", b.id)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Control score">
        {SCORE_BUCKETS.map((b) => (
          <ChipToggle
            key={b.id}
            active={filters.controlBuckets.includes(b.id)}
            label={b.label}
            onClick={() => setList("controlBuckets", b.id)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Price">
        {PRICE_BUCKETS.map((b) => (
          <ChipToggle
            key={b.id}
            active={filters.priceBuckets.includes(b.id)}
            label={b.label}
            onClick={() => setList("priceBuckets", b.id)}
          />
        ))}
      </FilterSection>

      {data.softGatedFacets.length > 0 && (
        <p className="text-[12px] text-muted">
          Soft-gated until coverage improves:{" "}
          {data.softGatedFacets.join(", ")}.
        </p>
      )}
    </div>
  );
}

export function PadelRacketDatabaseExplorer({
  data,
}: {
  data: PadelRacketDatabasePageData;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const titleId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  useModalFocus(drawerOpen, drawerRef, () => setDrawerOpen(false));

  const filters = useMemo(
    () =>
      parseDatabaseSearchParams(
        Object.fromEntries(searchParams.entries()),
      ),
    [searchParams],
  );

  const prevFilters = useRef(filters);
  const results = useMemo(
    () => queryPadelRacketDatabase(data.records, filters),
    [data.records, filters],
  );

  useEffect(() => {
    if (prevFilters.current !== filters) {
      trackDatabaseFilterChange(prevFilters.current, filters, results.length);
      prevFilters.current = filters;
    }
  }, [filters, results.length]);

  const brandLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const b of data.facets.brands) map[b.value] = b.label;
    return map;
  }, [data.facets.brands]);

  const playStyleLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const b of data.facets.playStyles) map[b.value] = b.label;
    return map;
  }, [data.facets.playStyles]);

  const chips = useMemo(
    () =>
      buildActiveDatabaseChips(filters, {
        brand: brandLabels,
        playStyle: playStyleLabels,
      }),
    [filters, brandLabels, playStyleLabels],
  );

  const activeCount = countActiveDatabaseFilters(filters);
  const restrictive = suggestRestrictiveFilters(filters, chips);

  const pushFilters = useCallback(
    (next: PadelRacketDatabaseFilters) => {
      const href = databaseHref(next, pathname);
      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    },
    [pathname, router],
  );

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <div
        className={cn(
          "grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]",
          isPending && "opacity-80",
        )}
      >
        <aside className="hidden lg:block">
          <div className="sticky top-24 border border-border bg-[#f5f6f7] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                Filters
              </p>
              {activeCount > 0 && (
                <button
                  type="button"
                  className="text-[12px] font-semibold text-link hover:text-link-hover"
                  onClick={() => pushFilters(DEFAULT_DATABASE_FILTERS)}
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="mt-4">
              <FilterPanel
                data={data}
                filters={filters}
                onChange={pushFilters}
              />
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                Results
              </p>
              <p className="mt-1 font-display text-2xl font-bold tracking-tight tabular-nums">
                {results.length}
                <span className="ml-2 text-base font-medium text-muted">
                  of {data.total} rackets
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 border border-border bg-white px-3 text-[12px] font-semibold lg:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-haspopup="dialog"
              >
                <SlidersHorizontal className="size-4" aria-hidden />
                Filters
                {activeCount > 0 ? ` (${activeCount})` : ""}
              </button>
              <label className="flex items-center gap-2 text-[13px]">
                <span className="text-muted">Sort</span>
                <select
                  value={filters.sort}
                  onChange={(e) =>
                    pushFilters({
                      ...filters,
                      sort: e.target.value as PadelRacketDatabaseSort,
                    })
                  }
                  className="h-10 border border-border bg-white px-2.5 text-[13px] font-medium outline-none focus:border-foreground"
                >
                  {DATABASE_SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() =>
                    pushFilters(removeDatabaseFilterValue(filters, chip))
                  }
                  className="inline-flex items-center gap-1.5 border border-foreground/20 bg-[#f5f6f7] px-2 py-1 text-[12px] font-medium"
                >
                  {chip.label}
                  <X className="size-3.5" aria-hidden />
                  <span className="sr-only">Remove {chip.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-3 pb-24 sm:pb-8">
            {results.length === 0 ? (
              <div className="border border-dashed border-border px-6 py-14">
                <p className="font-display text-xl font-bold tracking-tight">
                  No rackets match all these filters.
                </p>
                <p className="mt-2 max-w-lg text-[14px] text-muted">
                  Try clearing the most restrictive filters.
                </p>
                {restrictive.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {restrictive.map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        className="border border-border bg-white px-2.5 py-1.5 text-[12px] font-medium"
                        onClick={() =>
                          pushFilters(
                            removeDatabaseFilterValue(filters, chip),
                          )
                        }
                      >
                        Remove {chip.label}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className="mt-5 text-[13px] font-semibold text-link"
                  onClick={() => pushFilters(DEFAULT_DATABASE_FILTERS)}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              results.map((record, index) => (
                <PadelRacketDatabaseCard
                  key={record.id}
                  record={record}
                  resultPosition={index + 1}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close filters"
            onClick={closeDrawer}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto border-t border-border bg-white px-4 pb-8 pt-4 shadow-lg outline-none"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id={titleId} className="font-display text-lg font-bold">
                Filters
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex size-9 items-center justify-center border border-border"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <FilterPanel
              data={data}
              filters={filters}
              onChange={pushFilters}
            />
            <button
              type="button"
              className="sticky bottom-0 mt-6 h-11 w-full bg-accent text-[12px] font-bold tracking-[0.06em] text-accent-foreground uppercase"
              onClick={closeDrawer}
            >
              Show {results.length} rackets
            </button>
          </div>
        </div>
      )}

      <DatabaseCompareSticky />
    </>
  );
}
