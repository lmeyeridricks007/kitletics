"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  buildDataExplorerPanels,
  filterExplorerRows,
} from "@/lib/running-shoe-database/charts/build-explorer-data";
import type {
  ChartBarPoint,
  DataExplorerPanel,
  RunningShoeDataExplorerPayload,
} from "@/lib/running-shoe-database/charts/types";
import {
  AccessibleBarList,
  CompositionBar,
} from "@/components/running-shoe-database/charts/ChartPrimitives";
import { trackShoeDatabaseEvent } from "@/lib/running-shoe-database/analytics";
import { cn } from "@/lib/utils";

function ChartBody({
  panel,
  highlightedId,
  onActivate,
}: {
  panel: DataExplorerPanel;
  highlightedId: string | null;
  onActivate: (point: ChartBarPoint) => void;
}) {
  const chart = panel.chart;

  if (chart.kind === "composition") {
    const summary = chart.points
      .map((p) => `${p.label}: ${p.count}`)
      .join(". ");
    return (
      <CompositionBar
        points={chart.points}
        highlightedId={highlightedId}
        onActivate={onActivate}
        ariaLabel={panel.headline}
        summary={summary}
      />
    );
  }

  if (chart.kind === "distribution") {
    const summary = `${panel.headline}. Median ${chart.median ?? "n/a"} ${chart.unit}. ${chart.points
      .map((p) => `${p.label}: ${p.count}`)
      .join(", ")}.`;
    return (
      <AccessibleBarList
        points={chart.points}
        highlightedId={highlightedId}
        onActivate={onActivate}
        ariaLabel={`${panel.headline} distribution`}
        summary={summary}
        mode="count"
        valueSuffix="shoes"
      />
    );
  }

  if (chart.kind === "brand-bars") {
    const summary = chart.points
      .map((p) => `${p.label}: ${p.count} ${chart.unit} (${p.secondary ?? ""})`)
      .join(". ");
    return (
      <AccessibleBarList
        points={chart.points}
        highlightedId={highlightedId}
        onActivate={onActivate}
        ariaLabel={`${panel.headline} by brand`}
        summary={summary}
        mode="count"
        formatValue={(p) =>
          chart.unit === "EUR" ? `€${p.count} avg` : `${p.count} ${chart.unit} avg`
        }
      />
    );
  }

  // use-counts
  const summary = chart.points
    .map((p) => `${p.label}: ${p.count}`)
    .join(". ");
  return (
    <AccessibleBarList
      points={chart.points}
      highlightedId={highlightedId}
      onActivate={onActivate}
      ariaLabel={panel.headline}
      summary={summary}
      mode="count"
      valueSuffix="models"
    />
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-white"
          : "border-border bg-white hover:border-foreground/40",
      )}
    >
      {label}
    </button>
  );
}

export function RunningShoeDataExplorer({
  payload,
}: {
  payload: RunningShoeDataExplorerPayload;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [use, setUse] = useState<string[]>([]);
  const [gender, setGender] = useState<string[]>([]);
  const [surface, setSurface] = useState<string[]>([]);
  const [brand, setBrand] = useState<string[]>([]);
  const [highlight, setHighlight] = useState<string | null>(null);

  const toggle = (
    list: string[],
    set: (v: string[]) => void,
    value: string,
  ) => {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const filteredRows = useMemo(
    () => filterExplorerRows(payload.rows, { use, gender, surface, brand }),
    [payload.rows, use, gender, surface, brand],
  );

  const panels = useMemo(
    () => buildDataExplorerPanels(filteredRows),
    [filteredRows],
  );

  const activate = (point: ChartBarPoint) => {
    setHighlight(point.id);
    trackShoeDatabaseEvent("shoe_database_filter", {
      filter_type: "chart_segment",
      filter_value: point.id.slice(0, 80),
    });
    startTransition(() => {
      router.push(point.href, { scroll: false });
    });
  };

  const clearChartFilters = () => {
    setUse([]);
    setGender([]);
    setSurface([]);
    setBrand([]);
    setHighlight(null);
  };

  const activeFilterCount =
    use.length + gender.length + surface.length + brand.length;

  return (
    <section
      id="data-explorer"
      className="scroll-mt-24 border-b border-border bg-white"
      aria-labelledby="data-explorer-heading"
    >
      <div className="mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
            Data explorer
          </p>
          <h2
            id="data-explorer-heading"
            className="mt-1 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tight"
          >
            How the current running shoe market is structured
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Charts are calculated from {payload.eligibleCount} eligible product
            models in the Kitletics Running Shoe Database. Select a bar to open
            the matching filtered set — snapshot only, not a historical trend.
          </p>
        </div>

        <div className="mt-8 space-y-4 border border-border bg-[#f5f6f7] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
              Chart filters
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                className="text-[12px] font-semibold text-link"
                onClick={clearChartFilters}
              >
                Clear chart filters
              </button>
            )}
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold text-muted">Use</p>
            <div className="flex flex-wrap gap-1.5">
              {payload.filterOptions.use.map((opt) => (
                <FilterChip
                  key={opt.value}
                  active={use.includes(opt.value)}
                  label={opt.label}
                  onClick={() => toggle(use, setUse, opt.value)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold text-muted">
              Gender / fit
            </p>
            <div className="flex flex-wrap gap-1.5">
              {payload.filterOptions.gender.map((opt) => (
                <FilterChip
                  key={opt.value}
                  active={gender.includes(opt.value)}
                  label={opt.label}
                  onClick={() => toggle(gender, setGender, opt.value)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold text-muted">Surface</p>
            <div className="flex flex-wrap gap-1.5">
              {payload.filterOptions.surface.map((opt) => (
                <FilterChip
                  key={opt.value}
                  active={surface.includes(opt.value)}
                  label={opt.label}
                  onClick={() => toggle(surface, setSurface, opt.value)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold text-muted">
              Highlight brand
            </p>
            <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
              {payload.filterOptions.brand.map((opt) => (
                <FilterChip
                  key={opt.value}
                  active={brand.includes(opt.value)}
                  label={opt.label}
                  onClick={() => toggle(brand, setBrand, opt.value)}
                />
              ))}
            </div>
          </div>
          <p className="text-[12px] text-muted" aria-live="polite">
            Showing charts for {filteredRows.length} of {payload.eligibleCount}{" "}
            models
            {activeFilterCount > 0 ? " after chart filters" : ""}.
          </p>
        </div>

        <div className="mt-10 space-y-12">
          {panels.length === 0 ? (
            <p className="border border-dashed border-border px-4 py-10 text-sm text-muted">
              No chartable sample under the current chart filters. Clear filters
              to restore the full explorer.
            </p>
          ) : (
            panels.map((panel) => (
              <article
                key={panel.id}
                className="grid gap-6 border-t border-border pt-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]"
              >
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight">
                    {panel.headline}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted">
                    {panel.interpretation}
                  </p>
                  <p className="mt-4 text-[11px] leading-relaxed text-muted">
                    {panel.sampleNote}
                  </p>
                </div>
                <div className="min-w-0 border border-border bg-[#fafbfb] p-4 sm:p-5">
                  <ChartBody
                    panel={panel}
                    highlightedId={highlight}
                    onActivate={activate}
                  />
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
