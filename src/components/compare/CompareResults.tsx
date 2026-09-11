"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, ChevronDown, Info, X } from "lucide-react";
import { CompareBuilderSectionNav } from "@/components/compare/CompareBuilderSectionNav";
import { CompareHelpCards } from "@/components/compare/CompareHelpCards";
import type { ComparisonPageData } from "@/lib/comparison/get-comparison-page-data";
import type { SpecDiffRow } from "@/lib/comparison/engine";
import { trackCompareEvent } from "@/lib/comparison/analytics";
import { getScoreBand } from "@/lib/product/score";
import { formatPrice, cn } from "@/lib/utils";
import { buildOfferClickHref } from "@/lib/commerce/offer-click-href";
import {
  CompareFitSizingBanner,
  comparisonNeedsFitSizingBanner,
} from "@/components/compare/CompareFitSizingBanner";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";
import { ScrollableTableRegion } from "@/components/ui/ScrollableTableRegion";

const SCROLL =
  "scroll-mt-[calc(var(--site-chrome-height,4rem)+3.5rem)]";

interface CompareResultsProps {
  data: ComparisonPageData;
  onRemove: (slug: string) => void;
  shareUrl: string;
  showOnlyDifferences: boolean;
  sortBy: string;
  hiddenGroupIds: string[];
}

function displayScore(score: number): string {
  return (score / 10).toFixed(1);
}

function specValue(
  rows: SpecDiffRow[],
  key: string,
  productId: string,
): string {
  const row = rows.find((r) => r.key === key);
  return row?.valuesByProduct[productId] ?? "—";
}

function combineStack(rows: SpecDiffRow[], productId: string): string {
  const heel = displayCell(specValue(rows, "heelStack", productId));
  const fore = displayCell(specValue(rows, "forefootStack", productId));
  if (heel === "—" && fore === "—") return "—";
  if (heel !== "—" && fore !== "—") return `${heel} / ${fore}`;
  return heel !== "—" ? heel : fore;
}

function displayCell(value: string): string {
  if (!value || value === "Unknown" || value.toLowerCase() === "unknown") {
    return "—";
  }
  return value;
}

function filterDiffRows(
  rows: SpecDiffRow[],
  showOnlyDifferences: boolean,
): SpecDiffRow[] {
  if (!showOnlyDifferences) return rows;
  return rows.filter((r) => r.state === "different" || r.state === "missing");
}

function resolveTabGroups(
  tabId: string,
  groupedSpecs: ComparisonPageData["groupedSpecs"],
  allSpecs: SpecDiffRow[],
): { id: string; label: string; rows: SpecDiffRow[] }[] {
  const byId = new Map(groupedSpecs.map((g) => [g.id, g]));

  if (tabId === "comfort") {
    const fit = byId.get("fit");
    return fit ? [fit] : [];
  }
  if (tabId === "ride") {
    const ride = byId.get("ride");
    return ride ? [ride] : [];
  }
  if (tabId === "outsole") {
    const rows = allSpecs.filter(
      (r) =>
        r.key.toLowerCase().includes("outsole") ||
        r.label.toLowerCase().includes("outsole"),
    );
    return rows.length > 0
      ? [{ id: "outsole", label: "Outsole", rows }]
      : [];
  }
  if (tabId === "durability") {
    const rows = allSpecs.filter(
      (r) =>
        r.key.toLowerCase().includes("durab") ||
        r.label.toLowerCase().includes("durab") ||
        r.key === "outsole",
    );
    return rows.length > 0
      ? [{ id: "durability", label: "Durability", rows }]
      : [];
  }
  if (tabId === "specs") {
    return groupedSpecs.filter(
      (g) => !["fit", "ride"].includes(g.id),
    );
  }

  // Battery / shape / etc. — match group id or label keywords
  const direct = byId.get(tabId);
  if (direct) return [direct];

  const fuzzy = groupedSpecs.filter(
    (g) =>
      g.id.includes(tabId) ||
      g.label.toLowerCase().includes(tabId.replace(/-/g, " ")),
  );
  if (fuzzy.length > 0) return fuzzy;

  const keyRows = allSpecs.filter(
    (r) =>
      r.key.toLowerCase().includes(tabId) ||
      r.label.toLowerCase().includes(tabId.replace(/-/g, " ")),
  );
  return keyRows.length > 0
    ? [{ id: tabId, label: tabId, rows: keyRows }]
    : [];
}

function SpecTable({
  rows,
  productIds,
  productLabels,
  caption,
}: {
  rows: SpecDiffRow[];
  productIds: string[];
  productLabels: Record<string, string>;
  caption: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted">No differing values in this section.</p>
    );
  }

  return (
    <ScrollableTableRegion
      label={caption}
      className="mt-3 border border-border"
    >
      <table className="w-full min-w-[32rem] text-left text-[13px]">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-surface-muted">
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 bg-surface-muted px-3 py-2.5 font-semibold"
            >
              Metric
            </th>
            {productIds.map((id) => (
              <th key={id} scope="col" className="px-3 py-2.5 font-semibold">
                {productLabels[id]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.key}
              className={cn(
                i % 2 === 0 ? "bg-white" : "bg-surface-muted/40",
                row.state === "different" && "bg-accent/5",
              )}
            >
              <th
                scope="row"
                className={cn(
                  "sticky left-0 z-10 px-3 py-2.5 font-normal text-muted",
                  i % 2 === 0 ? "bg-white" : "bg-surface-muted/40",
                  row.state === "different" && "bg-accent/5",
                )}
              >
                {row.label}
                {row.unit ? (
                  <span className="text-subtle"> ({row.unit})</span>
                ) : null}
                {row.state === "different" ? (
                  <span className="sr-only"> (differs)</span>
                ) : null}
              </th>
              {productIds.map((id) => (
                <td
                  key={id}
                  className={cn(
                    "px-3 py-2.5 tabular-nums",
                    row.state === "different" && "font-medium",
                  )}
                >
                  {displayCell(row.valuesByProduct[id])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollableTableRegion>
  );
}

export function CompareResults({
  data,
  onRemove,
  shareUrl,
  showOnlyDifferences,
  sortBy,
  hiddenGroupIds,
}: CompareResultsProps) {
  const {
    products,
    differences,
    category,
    editorialSlug,
    groupedSpecs,
    keyDifferencesEditorial,
    config,
    finderHref,
    finderCtaLabel,
    regionLabel,
    pricesLastChecked,
  } = data;

  const [showAllDiffs, setShowAllDiffs] = useState(false);
  const [headerCondensed, setHeaderCondensed] = useState(false);

  const nounPlural =
    config.productNounPlural ?? category?.name?.toLowerCase() ?? "products";

  const productLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const b of products) labels[b.product.id] = b.product.name;
    return labels;
  }, [products]);

  const orderedProducts = useMemo(() => {
    const list = [...products];
    if (!sortBy) return list;

    if (sortBy === "__score") {
      return list.sort(
        (a, b) =>
          (b.product.recommendationScore ?? -1) -
          (a.product.recommendationScore ?? -1),
      );
    }
    if (sortBy === "__price") {
      return list.sort((a, b) => {
        const pa = a.lowestPrice?.price ?? Number.POSITIVE_INFINITY;
        const pb = b.lowestPrice?.price ?? Number.POSITIVE_INFINITY;
        return pa - pb;
      });
    }
    if (sortBy === "__weight") {
      const weightRow = differences.allSpecs.find((r) => r.key === "weight");
      return list.sort((a, b) => {
        const wa = weightRow?.rawByProduct[a.product.id];
        const wb = weightRow?.rawByProduct[b.product.id];
        const na = typeof wa === "number" ? wa : Number.POSITIVE_INFINITY;
        const nb = typeof wb === "number" ? wb : Number.POSITIVE_INFINITY;
        return na - nb;
      });
    }

    const uc = differences.useCaseDifferences.find(
      (u) => u.useCaseId === sortBy,
    );
    if (!uc) return list;
    return list.sort((a, b) => {
      const sa = uc.scoresByProduct[a.product.id] ?? -1;
      const sb = uc.scoresByProduct[b.product.id] ?? -1;
      return sb - sa;
    });
  }, [products, differences, sortBy]);

  const orderedIds = orderedProducts.map((p) => p.product.id);

  const sortLabel = useMemo(() => {
    if (!sortBy) return null;
    if (sortBy === "__score") return "Kitletics Score";
    if (sortBy === "__price") return "Price";
    if (sortBy === "__weight") return "Weight";
    const uc = differences.useCaseDifferences.find(
      (u) => u.useCaseId === sortBy,
    );
    return uc?.label ?? null;
  }, [sortBy, differences.useCaseDifferences]);

  const tabs = useMemo(() => {
    const base =
      config.builderSectionTabs ??
      [
        { id: "overview", label: "Overview" },
        { id: "use-cases", label: "Use-Case Scores" },
        { id: "specs", label: "Specs" },
        { id: "prices", label: "Prices" },
        { id: "reviews", label: "Reviews" },
      ];
    return base.filter((t) => {
      if (t.id === "overview" || t.id === "prices" || t.id === "reviews") {
        return true;
      }
      if (t.id === "use-cases") {
        return differences.useCaseDifferences.length > 0;
      }
      if (hiddenGroupIds.includes(t.id)) return false;
      if (t.id === "specs") {
        return !hiddenGroupIds.some((id) =>
          groupedSpecs.some((g) => g.id === id),
        );
      }
      return true;
    });
  }, [
    config.builderSectionTabs,
    differences.useCaseDifferences.length,
    hiddenGroupIds,
    groupedSpecs,
  ]);

  const visibleGroupedSpecs = useMemo(
    () => groupedSpecs.filter((g) => !hiddenGroupIds.includes(g.id)),
    [groupedSpecs, hiddenGroupIds],
  );

  useEffect(() => {
    const el = document.getElementById("compare-product-header");
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeaderCondensed(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [orderedProducts.length]);

  const overviewRows = useMemo(() => {
    const rows: {
      key: string;
      label: string;
      values: Record<string, string>;
      same: boolean;
    }[] = [];

    const bestFor: Record<string, string> = {};
    for (const b of orderedProducts) {
      const names = (b.product.strengths ?? []).slice(0, 3);
      bestFor[b.product.id] = names.length > 0 ? names.join(", ") : "—";
    }
    rows.push({
      key: "best-for",
      label: "Best for",
      values: bestFor,
      same: new Set(Object.values(bestFor)).size <= 1,
    });

    const surface: Record<string, string> = {};
    for (const b of orderedProducts) {
      surface[b.product.id] = specValue(
        differences.allSpecs,
        "terrain",
        b.product.id,
      );
    }
    rows.push({
      key: "surface",
      label: "Surface",
      values: surface,
      same: new Set(Object.values(surface)).size <= 1,
    });

    const runnerType: Record<string, string> = {};
    for (const b of orderedProducts) {
      const stability = specValue(
        differences.allSpecs,
        "stability",
        b.product.id,
      );
      runnerType[b.product.id] =
        stability !== "—"
          ? stability
          : specValue(differences.allSpecs, "support", b.product.id);
    }
    if (Object.values(runnerType).some((v) => v !== "—")) {
      rows.splice(1, 0, {
        key: "runner-type",
        label: "Runner type",
        values: runnerType,
        same: new Set(Object.values(runnerType)).size <= 1,
      });
    }

    const release: Record<string, string> = {};
    for (const b of orderedProducts) {
      release[b.product.id] = b.product.releaseDate
        ? new Date(b.product.releaseDate).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
          })
        : "—";
    }
    rows.push({
      key: "release",
      label: "Release date",
      values: release,
      same: new Set(Object.values(release)).size <= 1,
    });

    for (const key of ["weight", "drop"] as const) {
      const values: Record<string, string> = {};
      for (const b of orderedProducts) {
        values[b.product.id] = specValue(
          differences.allSpecs,
          key,
          b.product.id,
        );
      }
      const label =
        key === "weight"
          ? differences.allSpecs.find((r) => r.key === "weight")?.unit
            ? `Weight (${differences.allSpecs.find((r) => r.key === "weight")!.unit})`
            : "Weight"
          : "Drop";
      rows.push({
        key,
        label,
        values,
        same: new Set(Object.values(values)).size <= 1,
      });
    }

    const stack: Record<string, string> = {};
    for (const b of orderedProducts) {
      stack[b.product.id] = combineStack(differences.allSpecs, b.product.id);
    }
    rows.push({
      key: "stack",
      label: "Stack height (heel/forefoot)",
      values: stack,
      same: new Set(Object.values(stack)).size <= 1,
    });

    const widths: Record<string, string> = {};
    for (const b of orderedProducts) {
      widths[b.product.id] = specValue(
        differences.allSpecs,
        "widthOptions",
        b.product.id,
      );
    }
    rows.push({
      key: "widths",
      label: "Widths",
      values: widths,
      same: new Set(Object.values(widths)).size <= 1,
    });

    const scores: Record<string, string> = {};
    for (const b of orderedProducts) {
      const score = b.product.recommendationScore;
      if (typeof score === "number") {
        const band = getScoreBand(score);
        scores[b.product.id] = `${displayScore(score)} · ${band.label}`;
      } else {
        scores[b.product.id] = "—";
      }
    }
    rows.push({
      key: "score",
      label: "Kitletics Score",
      values: scores,
      same: new Set(Object.values(scores)).size <= 1,
    });

    return showOnlyDifferences ? rows.filter((r) => !r.same) : rows;
  }, [orderedProducts, differences.allSpecs, showOnlyDifferences]);

  const importantDiffs = filterDiffRows(
    differences.importantDifferences,
    showOnlyDifferences,
  );
  const allDiffSpecs = differences.differingSpecs;
  const expandedDiffs = showAllDiffs
    ? filterDiffRows(allDiffSpecs, showOnlyDifferences)
    : importantDiffs;
  const hiddenDiffCount = Math.max(
    0,
    allDiffSpecs.length - importantDiffs.length,
  );

  const action = config.builderProductAction;

  return (
    <div className="space-y-0">
      {/* Condensed sticky product strip */}
      {headerCondensed && (
        <div className="sticky top-[var(--site-chrome-height,var(--header-height,3.5rem))] z-40 -mx-1 mb-2 border-b border-border bg-white/95 px-1 py-2 backdrop-blur-sm">
          <div className="flex gap-3 overflow-x-auto">
            {orderedProducts.map((b) => {
              const media = data.productMedia[b.product.id];
              const score = b.product.recommendationScore;
              return (
                <div
                  key={b.product.id}
                  className="flex min-w-[9rem] flex-1 items-center gap-2"
                >
                  <div className="relative size-8 shrink-0 overflow-hidden bg-surface-muted">
                    {media ? (
                      <Image
                        src={media.src}
                        alt=""
                        fill
                        className="object-contain"
                        sizes="32px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold">
                      {b.product.name}
                    </p>
                    {typeof score === "number" && (
                      <p className="text-[11px] tabular-nums text-muted">
                        {displayScore(score)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editorialSlug && products.length === 2 && (
        <p className="mb-4 text-[13px] text-muted">
          Expert comparison available —{" "}
          <Link
            href={`/compare/${editorialSlug}`}
            className="font-medium text-link hover:underline"
            onClick={() =>
              trackCompareEvent("compare_editorial_opened", {
                categoryId: category?.id,
                productCount: 2,
                productIds: products.map((p) => p.product.slug),
              })
            }
          >
            Read full comparison →
          </Link>
        </p>
      )}

      {/* Product header row */}
      <div
        id="compare-product-header"
        className="mb-4 flex gap-3 overflow-x-auto pb-2 lg:grid lg:overflow-visible"
        style={
          {
            gridTemplateColumns: `repeat(${orderedProducts.length}, minmax(0, 1fr))`,
          } satisfies CSSProperties
        }
      >
        {orderedProducts.map((b) => {
          const media = data.productMedia[b.product.id];
          const score = b.product.recommendationScore;
          const band =
            typeof score === "number" ? getScoreBand(score) : undefined;
          const secondaryHref =
            action?.kind === "rotation"
              ? `${action.href ?? "/tools/shoe-rotation-planner"}?owned=${b.product.slug}`
              : `/products/${b.product.slug}`;
          const secondaryLabel =
            action?.kind === "rotation"
              ? action.label
              : action?.label ?? "View product";

          return (
            <article
              key={b.product.id}
              className="relative w-[min(70vw,16rem)] shrink-0 border border-border bg-white p-3 sm:w-auto lg:min-w-0"
            >
              <button
                type="button"
                aria-label={`Remove ${b.product.name}`}
                onClick={() => onRemove(b.product.slug)}
                className="absolute top-2 right-2 z-10 rounded p-1 text-muted hover:bg-surface-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>

              <div className="relative aspect-[5/3] w-full overflow-hidden bg-surface-muted">
                {media ? (
                  <Image
                    src={media.src}
                    alt={
                      media.alt ??
                      `${b.brand?.name ?? ""} ${b.product.name}`
                    }
                    fill
                    className="object-contain p-2"
                    sizes={IMAGE_SIZES.compareSelectedCard}
                    quality={IMAGE_QUALITY.card}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[12px] text-subtle">
                    Image unavailable
                  </div>
                )}
              </div>

              <p className="mt-3 text-[10px] font-bold tracking-[0.12em] text-subtle uppercase">
                {b.brand?.name}
              </p>
              <h3 className="font-display text-[17px] font-bold leading-tight tracking-tight">
                <Link
                  href={`/products/${b.product.slug}`}
                  className="hover:text-accent-ink"
                >
                  {b.product.name}
                </Link>
              </h3>

              {typeof score === "number" && band && (
                <div className="mt-2">
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-[4px] bg-score px-2 text-[12px] font-bold text-score-foreground tabular-nums">
                    {displayScore(score)}
                    <span className="font-semibold opacity-95">
                      {band.label}
                    </span>
                  </span>
                </div>
              )}

              <p className="mt-2 text-[13px] tabular-nums">
                {b.lowestPrice ? (
                  <>
                    From{" "}
                    <span className="font-semibold">
                      {formatPrice(
                        b.lowestPrice.price,
                        b.lowestPrice.currency,
                      )}
                    </span>
                  </>
                ) : (
                  <span className="text-subtle">Check prices</span>
                )}
              </p>

              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href={`/products/${b.product.slug}#offers`}
                  className="inline-flex h-9 items-center justify-center rounded-[4px] bg-accent px-3 text-[11px] font-bold tracking-[0.04em] text-accent-foreground uppercase hover:bg-accent-hover"
                >
                  View prices
                  {b.offers.length > 0 ? ` (${b.offers.length})` : ""}
                </Link>
                <Link
                  href={secondaryHref}
                  className="inline-flex items-center justify-center gap-1.5 text-[12px] font-medium text-link hover:underline"
                >
                  {action?.kind === "rotation" && (
                    <Bookmark className="size-3.5" aria-hidden />
                  )}
                  {secondaryLabel}
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <CompareBuilderSectionNav tabs={tabs} />

      <CompareFitSizingBanner
        show={comparisonNeedsFitSizingBanner(
          data.category?.id,
          data.category?.slug,
        )}
        className="mb-6 rounded-lg border border-border bg-surface-muted/60 px-4 py-3 text-[13px] leading-relaxed text-muted"
      />

      {/* Overview */}
      <section id="overview" className={cn(SCROLL, "border-b border-border py-8")}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-[11px] font-bold tracking-[0.14em] text-foreground uppercase">
            Overview
          </h2>
          {sortLabel && (
            <p className="text-[12px] text-muted">
              (sorted by {sortLabel.toLowerCase()} ↓)
            </p>
          )}
        </div>
        <ScrollableTableRegion
          label="Overview comparison"
          className="mt-3 border border-border"
        >
          <table className="w-full min-w-[32rem] text-left text-[13px]">
            <caption className="sr-only">Overview comparison</caption>
            <thead className="bg-surface-muted">
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-surface-muted px-3 py-2.5 font-semibold"
                >
                  Metric
                </th>
                {orderedIds.map((id) => (
                  <th key={id} scope="col" className="px-3 py-2.5 font-semibold">
                    {productLabels[id]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overviewRows.map((row, i) => (
                <tr
                  key={row.key}
                  className={i % 2 === 0 ? "bg-white" : "bg-surface-muted/40"}
                >
                  <th
                    scope="row"
                    className={cn(
                      "sticky left-0 z-10 px-3 py-2.5 font-normal text-muted",
                      i % 2 === 0 ? "bg-white" : "bg-surface-muted/40",
                    )}
                  >
                    {row.label}
                  </th>
                  {orderedIds.map((id) => (
                    <td key={id} className="px-3 py-2.5">
                      {displayCell(row.values[id])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollableTableRegion>
      </section>

      {/* Key differences */}
      <section className="border-b border-border py-8">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[11px] font-bold tracking-[0.14em] text-foreground uppercase">
            Key differences
          </h2>
          {showOnlyDifferences && (
            <span className="inline-flex items-center gap-1 text-[12px] text-muted">
              <Info className="size-3.5" aria-hidden />
              Only showing values that differ
            </span>
          )}
        </div>

        {keyDifferencesEditorial.length > 0 && (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {keyDifferencesEditorial.map((kd, i) => (
              <li key={kd.key ?? i} className="py-3.5">
                <h3 className="text-[14px] font-bold">{kd.label}</h3>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                  {kd.productImpacts.map((pi) => (
                    <span key={pi.productId}>
                      <span className="text-muted">
                        {productLabels[pi.productId] ?? pi.productId}:{" "}
                      </span>
                      <span className="font-medium">{pi.impact}</span>
                    </span>
                  ))}
                </div>
                {kd.explanation && (
                  <p className="mt-1.5 text-[13px] text-muted">{kd.explanation}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        {expandedDiffs.length === 0 &&
        keyDifferencesEditorial.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Limited comparison data — few high-priority specs differ.
          </p>
        ) : (
          <SpecTable
            rows={expandedDiffs}
            productIds={orderedIds}
            productLabels={productLabels}
            caption="Key specification differences"
          />
        )}

        {!showAllDiffs && hiddenDiffCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAllDiffs(true)}
            className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-link hover:underline"
          >
            Show all differences ({allDiffSpecs.length})
            <ChevronDown className="size-3.5" aria-hidden />
          </button>
        )}
      </section>

      {/* Use cases */}
      {differences.useCaseDifferences.length > 0 &&
        !hiddenGroupIds.includes("use-cases") && (
          <section
            id="use-cases"
            className={cn(SCROLL, "border-b border-border py-8")}
          >
            <h2 className="text-[11px] font-bold tracking-[0.14em] text-foreground uppercase">
              Use-case scores
            </h2>
            <ScrollableTableRegion
              label="Use-case score comparison"
              className="mt-3 border border-border"
            >
              <table className="w-full min-w-[32rem] text-left text-[13px]">
                <caption className="sr-only">Use-case score comparison</caption>
                <thead className="bg-surface-muted">
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 z-10 bg-surface-muted px-3 py-2.5 font-semibold"
                    >
                      Use case
                    </th>
                    {orderedIds.map((id) => (
                      <th
                        key={id}
                        scope="col"
                        className="px-3 py-2.5 font-semibold"
                      >
                        {productLabels[id]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {differences.useCaseDifferences.map((uc, i) => (
                    <tr
                      key={uc.useCaseId}
                      className={
                        i % 2 === 0 ? "bg-white" : "bg-surface-muted/40"
                      }
                    >
                      <th
                        scope="row"
                        className={cn(
                          "sticky left-0 z-10 px-3 py-2.5 font-normal text-muted",
                          i % 2 === 0 ? "bg-white" : "bg-surface-muted/40",
                        )}
                      >
                        {uc.label}
                      </th>
                      {orderedIds.map((id) => {
                        const score = uc.scoresByProduct[id];
                        const isWinner =
                          uc.state === "winner" && uc.winnerProductId === id;
                        return (
                          <td
                            key={id}
                            className={cn(
                              "px-3 py-2.5 tabular-nums",
                              isWinner && "font-bold text-accent-ink",
                            )}
                          >
                            {typeof score === "number" ? score : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollableTableRegion>
          </section>
        )}

      {/* Specs + mapped tab sections */}
      {tabs
        .filter((t) =>
          ["specs", "comfort", "outsole", "ride", "durability", "battery", "gps", "training", "navigation", "smart", "shape", "control", "construction"].includes(
            t.id,
          ),
        )
        .map((tab) => {
          const groups = resolveTabGroups(
            tab.id,
            visibleGroupedSpecs,
            differences.allSpecs,
          ).map((g) => ({
            ...g,
            rows: filterDiffRows(g.rows, showOnlyDifferences),
          }));
          const rows = groups.flatMap((g) => g.rows);
          if (tab.id !== "specs" && rows.length === 0 && groups.length === 0) {
            return null;
          }
          return (
            <section
              key={tab.id}
              id={tab.id}
              className={cn(SCROLL, "border-b border-border py-8")}
            >
              <h2 className="text-[11px] font-bold tracking-[0.14em] text-foreground uppercase">
                {tab.label}
              </h2>
              {tab.id === "specs" ? (
                groups.map((g) => (
                  <div key={g.id} className="mt-4">
                    <h3 className="text-[12px] font-semibold text-muted">
                      {g.label}
                    </h3>
                    <SpecTable
                      rows={g.rows}
                      productIds={orderedIds}
                      productLabels={productLabels}
                      caption={g.label}
                    />
                  </div>
                ))
              ) : (
                <SpecTable
                  rows={rows}
                  productIds={orderedIds}
                  productLabels={productLabels}
                  caption={tab.label}
                />
              )}
            </section>
          );
        })}

      {/* Prices */}
      <section id="prices" className={cn(SCROLL, "border-b border-border py-8")}>
        <h2 className="text-[11px] font-bold tracking-[0.14em] text-foreground uppercase">
          Prices
        </h2>
        <p className="mt-1 text-[12px] text-subtle">Region: {regionLabel}</p>
        <div
          className={cn(
            "mt-4 grid gap-3",
            orderedProducts.length === 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {orderedProducts.map((b) => (
            <div key={b.product.id} className="border border-border bg-white p-4">
              <h3 className="text-[14px] font-bold">{b.product.name}</h3>
              {b.lowestPrice ? (
                <p className="mt-2 font-display text-xl font-bold tabular-nums">
                  From{" "}
                  {formatPrice(b.lowestPrice.price, b.lowestPrice.currency)}
                </p>
              ) : (
                <p className="mt-2 text-sm text-subtle">Check prices</p>
              )}
              {b.offers.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-[13px] text-muted">
                  {b.offers.slice(0, 4).map(({ offer, retailer }) => (
                    <li key={offer.id} className="flex justify-between gap-2">
                      <span>{retailer?.name ?? "Retailer"}</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {formatPrice(offer.price, offer.currency)}
                        {offer.url ? (
                          <>
                            {" · "}
                            <a
                              href={buildOfferClickHref(offer.id, "comparison")}
                              rel="noopener noreferrer sponsored nofollow"
                              className="text-link hover:underline"
                              onClick={() =>
                                trackCompareEvent("compare_offer_clicked", {
                                  categoryId: category?.id,
                                  productIds: [b.product.slug],
                                })
                              }
                            >
                              Check
                            </a>
                          </>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        {pricesLastChecked && (
          <p className="mt-3 text-[11px] text-subtle">
            Prices last checked:{" "}
            {new Date(pricesLastChecked).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        )}
      </section>

      {/* Reviews */}
      <section id="reviews" className={cn(SCROLL, "border-b border-border py-8")}>
        <h2 className="text-[11px] font-bold tracking-[0.14em] text-foreground uppercase">
          Reviews
        </h2>
        <div
          className={cn(
            "mt-4 grid gap-3",
            orderedProducts.length === 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {orderedProducts.map((b) => (
            <div key={b.product.id} className="border border-border bg-white p-4">
              <h3 className="text-[14px] font-bold">{b.product.name}</h3>
              {b.review ? (
                <>
                  <p className="mt-2 line-clamp-3 text-[13px] text-muted">
                    {b.review.summary ?? b.review.verdict ?? "Kitletics review available."}
                  </p>
                  <Link
                    href={`/reviews/${b.review.slug}`}
                    className="mt-3 inline-block text-[13px] font-medium text-link hover:underline"
                  >
                    Read review →
                  </Link>
                </>
              ) : (
                <p className="mt-2 text-[13px] text-subtle">
                  No Kitletics review yet.{" "}
                  <Link
                    href={`/products/${b.product.slug}`}
                    className="font-medium text-link hover:underline"
                  >
                    View product →
                  </Link>
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <CompareHelpCards
        productNounPlural={nounPlural}
        shareUrl={shareUrl}
        finderHref={finderHref}
        finderCtaLabel={finderCtaLabel}
      />
    </div>
  );
}
