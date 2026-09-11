"use client";

import Image from "next/image";
import { Check, Settings2, X } from "lucide-react";
import { ProductSearchSelector } from "@/components/compare/ProductSearchSelector";
import type {
  CompareCategoryOption,
  CompareProductIndexItem,
} from "@/lib/comparison/product-index";
import { COMPARE_MAX_PRODUCTS } from "@/lib/comparison/selection";
import { getScoreBand } from "@/lib/product/score";
import { cn } from "@/lib/utils";
import { IMAGE_QUALITY, IMAGE_SIZES } from "@/lib/media/image-delivery";

export interface SidebarScoreInfo {
  score?: number;
  mediaSrc?: string;
  mediaAlt?: string;
}

interface CompareSelectionSidebarProps {
  selectedItems: CompareProductIndexItem[];
  category?: CompareCategoryOption;
  categories: CompareCategoryOption[];
  categorySlug: string;
  onCategoryChange: (slug: string) => void;
  index: CompareProductIndexItem[];
  scoresBySlug: Record<string, SidebarScoreInfo>;
  nounSingular: string;
  nounPlural: string;
  showOnlyDifferences: boolean;
  onShowOnlyDifferencesChange: (value: boolean) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOptions: { value: string; label: string }[];
  onCustomizeOpen: () => void;
  onRemove: (slug: string) => void;
  onSelect: (item: CompareProductIndexItem, replaceSlug?: string) => void;
  adding: boolean;
  onAddingChange: (value: boolean) => void;
  changingSlug: string | null;
  onChangingSlugChange: (slug: string | null) => void;
  className?: string;
}

function displayScore(score: number): string {
  return (score / 10).toFixed(1);
}

export function CompareSelectionSidebar({
  selectedItems,
  category,
  categories,
  categorySlug,
  onCategoryChange,
  index,
  scoresBySlug,
  nounSingular,
  nounPlural,
  showOnlyDifferences,
  onShowOnlyDifferencesChange,
  sortBy,
  onSortByChange,
  sortOptions,
  onCustomizeOpen,
  onRemove,
  onSelect,
  adding,
  onAddingChange,
  changingSlug,
  onChangingSlugChange,
  className,
}: CompareSelectionSidebarProps) {
  const count = selectedItems.length;
  const atMax = count >= COMPARE_MAX_PRODUCTS;
  const selectedSlugs = selectedItems.map((i) => i.slug);
  const showAddSearch =
    adding || count < 2
      ? count < COMPARE_MAX_PRODUCTS && Boolean(category?.ready)
      : false;

  const howTo = [
    `Add 2–4 ${nounPlural} to compare`,
    "Use filters to focus on what matters",
    "Click headers to sort",
    "Tap any value for more details",
  ];

  return (
    <div className={cn("space-y-8", className)}>
      <section>
        <h2 className="text-[11px] font-bold tracking-[0.12em] text-foreground uppercase">
          Select {nounPlural} ({count}/{COMPARE_MAX_PRODUCTS})
        </h2>

        <ul className="mt-3 space-y-2">
          {selectedItems.map((item) => {
            if (changingSlug === item.slug) {
              return (
                <li key={`change-${item.slug}`}>
                  <ProductSearchSelector
                    index={index}
                    categoryId={category?.id}
                    excludeSlugs={selectedSlugs.filter((s) => s !== item.slug)}
                    label={`Replace ${nounSingular}`}
                    selected={null}
                    autoFocus
                    onSelect={(next) => onSelect(next, item.slug)}
                    onClear={() => onChangingSlugChange(null)}
                  />
                </li>
              );
            }

            const info = scoresBySlug[item.slug];
            const band =
              typeof info?.score === "number"
                ? getScoreBand(info.score)
                : undefined;
            const thumb = info?.mediaSrc ?? item.thumbnailSrc;

            return (
              <li
                key={item.slug}
                className="flex items-start gap-2.5 border border-border bg-white p-2"
              >
                <div className="relative size-12 shrink-0 overflow-hidden bg-surface-muted">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={info?.mediaAlt ?? item.fullName}
                      fill
                      className="object-contain p-0.5"
                      sizes={IMAGE_SIZES.altThumb}
                      quality={IMAGE_QUALITY.thumb}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[9px] text-subtle">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold tracking-wide text-subtle uppercase">
                    {item.brandName}
                  </p>
                  <p className="truncate text-[13px] font-semibold leading-tight">
                    {item.name}
                  </p>
                  {band && typeof info?.score === "number" && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-[3px] bg-score px-1.5 py-0.5 text-[10px] font-semibold text-score-foreground tabular-nums">
                      {displayScore(info.score)}{" "}
                      <span className="font-medium opacity-90">
                        {band.label}
                      </span>
                    </span>
                  )}
                  <button
                    type="button"
                    className="mt-1 block text-[11px] text-link hover:underline"
                    onClick={() => onChangingSlugChange(item.slug)}
                  >
                    Change
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => onRemove(item.slug)}
                  className="rounded p-1 text-muted hover:bg-surface-muted hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>

        {showAddSearch && category?.ready && (
          <div className="mt-3">
            <ProductSearchSelector
              index={index}
              categoryId={category.id}
              excludeSlugs={selectedSlugs}
              label={`${nounSingular} ${count + 1}`}
              autoFocus={adding}
              selected={null}
              onSelect={(item) => onSelect(item)}
            />
          </div>
        )}

        {!showAddSearch && (
          <button
            type="button"
            disabled={atMax || !category?.ready}
            onClick={() => onAddingChange(true)}
            className={cn(
              "mt-3 w-full border border-dashed border-border px-3 py-2.5 text-left text-[13px] font-medium",
              atMax || !category?.ready
                ? "cursor-not-allowed text-subtle"
                : "text-muted hover:border-accent hover:text-accent",
            )}
          >
            + Add another {nounSingular}
          </button>
        )}
      </section>

      <section>
        <h2 className="text-[11px] font-bold tracking-[0.12em] text-foreground uppercase">
          Quick filters
        </h2>
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-foreground">
              Show only differences
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={showOnlyDifferences}
              aria-label="Show only differences"
              onClick={() =>
                onShowOnlyDifferencesChange(!showOnlyDifferences)
              }
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                showOnlyDifferences ? "bg-accent" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
                  showOnlyDifferences && "translate-x-5",
                )}
              />
            </button>
          </div>

          <label className="block space-y-1">
            <span className="text-[12px] text-muted">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="h-10 w-full border border-border bg-white px-2.5 text-sm"
            >
              <option value="">Selection order</option>
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onCustomizeOpen}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-link hover:underline"
          >
            <Settings2 className="size-3.5" aria-hidden />
            Customize categories &amp; metrics
          </button>
        </div>
      </section>

      <section className="border border-border bg-surface-muted/30 p-3.5">
        <h2 className="text-[11px] font-bold tracking-[0.12em] text-foreground uppercase">
          How to use
        </h2>
        <ul className="mt-3 space-y-2">
          {howTo.map((line) => (
            <li
              key={line}
              className="flex items-start gap-2 text-[13px] leading-snug text-muted"
            >
              <Check
                className="mt-0.5 size-3.5 shrink-0 text-accent"
                strokeWidth={2.5}
                aria-hidden
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
            Category
          </span>
          <select
            value={categorySlug}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-10 w-full border border-border bg-white px-2.5 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.slug} disabled={!c.ready}>
                {c.name}
                {!c.ready ? " (Coming soon)" : ""}
              </option>
            ))}
          </select>
        </label>
      </section>
    </div>
  );
}
