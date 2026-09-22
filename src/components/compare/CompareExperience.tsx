"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { CompareBuilderHeader } from "@/components/compare/CompareBuilderHeader";
import { CompareResults } from "@/components/compare/CompareResults";
import { CompareSelectionSidebar } from "@/components/compare/CompareSelectionSidebar";
import { CompareShareActions } from "@/components/compare/CompareShareActions";
import { FeaturedComparisons } from "@/components/compare/FeaturedComparisons";
import { useCompareTray } from "@/components/compare/CompareTrayProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useModalFocus } from "@/lib/a11y/use-modal-focus";
import type {
  CompareCategoryOption,
  CompareProductIndexItem,
} from "@/lib/comparison/product-index-types";
import { findIndexItemsBySlugs } from "@/lib/comparison/product-index-search";
import {
  buildCompareHref,
  COMPARE_MAX_PRODUCTS,
  COMPARE_MIN_PRODUCTS,
} from "@/lib/comparison/selection";
import { loadDynamicComparisonAction } from "@/lib/comparison/compare-action";
import type { ComparisonPageData } from "@/lib/comparison/get-comparison-page-data";
import type { FeaturedCompareGroup } from "@/lib/comparison/compare-index-shared";
import { trackCompareEvent } from "@/lib/comparison/analytics";
import { getComparisonCategoryConfig } from "@/lib/comparison/category-config";
import type { BreadcrumbItem } from "@/components/layout/Breadcrumbs";

export interface CompareExperienceProps {
  index: CompareProductIndexItem[];
  categories: CompareCategoryOption[];
  featured: FeaturedCompareGroup[];
  initialCategorySlug?: string;
  initialProductSlugs: string[];
  /** Server-resolved comparison when URL has ≥2 valid products */
  initialComparison?: ComparisonPageData | null;
  crossCategoryError?: boolean;
  invalidSlugs?: string[];
}

export function CompareExperience({
  index,
  categories,
  featured,
  initialCategorySlug,
  initialProductSlugs,
  initialComparison = null,
  crossCategoryError = false,
  invalidSlugs = [],
}: CompareExperienceProps) {
  const router = useRouter();
  const tray = useCompareTray();

  const initialCategory =
    categories.find((c) => c.slug === initialCategorySlug) ??
    categories.find((c) => c.ready) ??
    categories[0];

  const [categorySlug, setCategorySlug] = useState(
    initialCategory?.slug ?? "",
  );
  const category = categories.find((c) => c.slug === categorySlug);

  const { items: resolvedInitial } = useMemo(
    () => findIndexItemsBySlugs(index, initialProductSlugs),
    [index, initialProductSlugs],
  );

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(
    resolvedInitial.map((i) => i.slug),
  );
  const [changingSlug, setChangingSlug] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [comparison, setComparison] = useState<ComparisonPageData | null>(
    initialComparison,
  );
  const [loading, setLoading] = useState(false);
  const [announce, setAnnounce] = useState("");

  const [showOnlyDifferences, setShowOnlyDifferences] = useState(true);
  const [sortBy, setSortBy] = useState("");
  const [hiddenGroupIds, setHiddenGroupIds] = useState<string[]>([]);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [mobileOptionsOpen, setMobileOptionsOpen] = useState(false);
  const mobileOptionsRef = useRef<HTMLDivElement>(null);
  const customizeRef = useRef<HTMLDivElement>(null);
  const closeMobileOptions = useCallback(() => setMobileOptionsOpen(false), []);
  const closeCustomize = useCallback(() => setCustomizeOpen(false), []);
  useModalFocus(mobileOptionsOpen, mobileOptionsRef, closeMobileOptions);
  useModalFocus(customizeOpen, customizeRef, closeCustomize);

  // Sync from URL when browser back/forward changes searchParams via remount —
  // parent passes new initial props; sync when they change.
  useEffect(() => {
    setSelectedSlugs(resolvedInitial.map((i) => i.slug));
    setComparison(initialComparison);
    if (initialCategorySlug) setCategorySlug(initialCategorySlug);
  }, [resolvedInitial, initialComparison, initialCategorySlug]);

  // Sync tray from builder selection (URL wins)
  useEffect(() => {
    if (!tray.hydrated || !category) return;
    if (selectedSlugs.length === 0) return;
    const items = findIndexItemsBySlugs(index, selectedSlugs).items.map(
      (i) => ({
        slug: i.slug,
        name: i.name,
        brandName: i.brandName,
        categoryId: i.categoryId,
        categorySlug: i.categorySlug,
      }),
    );
    if (items.length === 0) return;
    tray.setFromSlugs({
      categoryId: category.id,
      categorySlug: category.slug,
      items,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync when selection/category changes
  }, [selectedSlugs, category?.id, tray.hydrated]);

  const selectedItems = useMemo(
    () => findIndexItemsBySlugs(index, selectedSlugs).items,
    [index, selectedSlugs],
  );

  const syncUrl = useCallback(
    (slugs: string[], catSlug: string) => {
      const href = buildCompareHref({
        categorySlug: catSlug,
        productSlugs: slugs,
      });
      router.replace(href, { scroll: false });
    },
    [router],
  );

  const recompute = useCallback((slugs: string[]) => {
    if (slugs.length < COMPARE_MIN_PRODUCTS) {
      setComparison(null);
      return;
    }
    setLoading(true);
    void loadDynamicComparisonAction(slugs).then((data) => {
      setComparison(data);
      setLoading(false);
      if (!data) {
        setAnnounce("These products cannot be compared together.");
      } else {
        setAnnounce(`Comparing ${slugs.length} products.`);
      }
    });
  }, []);

  useEffect(() => {
    if (initialComparison) return;
    if (crossCategoryError) return;
    if (resolvedInitial.length < COMPARE_MIN_PRODUCTS) return;
    recompute(resolvedInitial.map((i) => i.slug));
  }, [initialComparison, crossCategoryError, resolvedInitial, recompute]);

  function onCategoryChange(slug: string) {
    const next = categories.find((c) => c.slug === slug);
    if (!next) return;
    if (selectedSlugs.length > 0 && category && next.id !== category.id) {
      const ok = window.confirm(
        `Starting a ${next.name} comparison will clear your current selection.`,
      );
      if (!ok) return;
    }
    setCategorySlug(slug);
    setSelectedSlugs([]);
    setComparison(null);
    setChangingSlug(null);
    setAdding(false);
    setHiddenGroupIds([]);
    setSortBy("");
    tray.clear("category-switch");
    syncUrl([], slug);
    trackCompareEvent("compare_category_changed", {
      categoryId: next.id,
      source: "builder",
    });
  }

  function selectAtSlot(item: CompareProductIndexItem, replaceSlug?: string) {
    if (!category || item.categoryId !== category.id) return;
    let next: string[];
    if (replaceSlug) {
      next = selectedSlugs.map((s) => (s === replaceSlug ? item.slug : s));
      if (!next.includes(item.slug)) {
        next = [...selectedSlugs.filter((s) => s !== item.slug), item.slug].slice(
          0,
          COMPARE_MAX_PRODUCTS,
        );
      }
      next = [...new Set(next)];
    } else {
      if (selectedSlugs.includes(item.slug)) return;
      if (selectedSlugs.length >= COMPARE_MAX_PRODUCTS) return;
      next = [...selectedSlugs, item.slug];
    }
    setSelectedSlugs(next);
    setChangingSlug(null);
    setAdding(false);
    syncUrl(next, category.slug);
    recompute(next);
    trackCompareEvent(
      replaceSlug ? "compare_product_replaced" : "compare_product_added",
      {
        categoryId: category.id,
        productCount: next.length,
        productIds: next,
        source: "builder",
      },
    );
  }

  function removeSlug(slug: string) {
    const next = selectedSlugs.filter((s) => s !== slug);
    setSelectedSlugs(next);
    syncUrl(next, categorySlug);
    recompute(next);
    trackCompareEvent("compare_product_removed", {
      categoryId: category?.id,
      productCount: next.length,
      productIds: next,
      source: "builder",
    });
  }

  function clearAll() {
    setSelectedSlugs([]);
    setComparison(null);
    setAdding(false);
    setChangingSlug(null);
    syncUrl([], categorySlug);
    tray.clear("builder");
  }

  const shareUrl = buildCompareHref({
    categorySlug,
    productSlugs: selectedSlugs,
  });

  const categoryConfig = useMemo(
    () =>
      category
        ? getComparisonCategoryConfig(category.id)
        : undefined,
    [category],
  );

  const nounSingular =
    categoryConfig?.productNounSingular ?? "product";
  const nounPlural =
    categoryConfig?.productNounPlural ?? "products";

  const sidebarScores = useMemo(() => {
    const map: Record<
      string,
      { score?: number; mediaSrc?: string; mediaAlt?: string }
    > = {};
    if (!comparison) return map;
    for (const b of comparison.products) {
      const media = comparison.productMedia[b.product.id];
      map[b.product.slug] = {
        score:
          typeof b.product.recommendationScore === "number"
            ? b.product.recommendationScore
            : undefined,
        mediaSrc: media?.src,
        mediaAlt: media?.alt,
      };
    }
    return map;
  }, [comparison]);

  const sortOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [
      { value: "__score", label: "Kitletics Score" },
    ];
    const daily = comparison?.differences.useCaseDifferences.find(
      (u) =>
        u.useCaseId.includes("daily") ||
        u.label.toLowerCase().includes("daily"),
    );
    if (daily) {
      opts.push({ value: daily.useCaseId, label: daily.label });
    }
    for (const uc of comparison?.differences.useCaseDifferences ?? []) {
      if (daily && uc.useCaseId === daily.useCaseId) continue;
      opts.push({ value: uc.useCaseId, label: uc.label });
    }
    opts.push({ value: "__price", label: "Price" });
    const hasWeight = comparison?.differences.allSpecs.some(
      (r) => r.key === "weight",
    );
    if (hasWeight) {
      opts.push({ value: "__weight", label: "Weight" });
    }
    return opts;
  }, [comparison]);

  const customizeGroups = useMemo(() => {
    if (comparison?.groupedSpecs.length) {
      return comparison.groupedSpecs.map((g) => ({
        id: g.id,
        label: g.label,
      }));
    }
    return (categoryConfig?.specificationGroups ?? []).map((g) => ({
      id: g.id,
      label: g.label,
    }));
  }, [comparison, categoryConfig]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Compare", href: "/compare" },
    ...(category?.name ? [{ label: category.name }] : []),
  ];

  const hasResults =
    Boolean(comparison) &&
    selectedSlugs.length >= 2 &&
    !crossCategoryError;

  const sidebar = (
    <CompareSelectionSidebar
      selectedItems={selectedItems}
      category={category}
      categories={categories}
      categorySlug={categorySlug}
      onCategoryChange={onCategoryChange}
      index={index}
      scoresBySlug={sidebarScores}
      nounSingular={nounSingular}
      nounPlural={nounPlural}
      showOnlyDifferences={showOnlyDifferences}
      onShowOnlyDifferencesChange={setShowOnlyDifferences}
      sortBy={sortBy}
      onSortByChange={setSortBy}
      sortOptions={sortOptions}
      onCustomizeOpen={() => setCustomizeOpen(true)}
      onRemove={removeSlug}
      onSelect={selectAtSlot}
      adding={adding}
      onAddingChange={setAdding}
      changingSlug={changingSlug}
      onChangingSlugChange={setChangingSlug}
    />
  );

  return (
    <>
      <CompareBuilderHeader
        breadcrumbs={breadcrumbs}
        title={`Compare ${category?.name ?? "gear"}`}
        description={`Add up to ${COMPARE_MAX_PRODUCTS} ${nounPlural} to compare side by side.`}
        actions={
          <CompareShareActions
            url={shareUrl}
            onClear={clearAll}
            disabled={selectedSlugs.length === 0}
          />
        }
      />

      <div className="sr-only" aria-live="polite">
        {announce}
      </div>

      <div className="border-b border-border bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOptionsOpen(true)}
          className="inline-flex h-10 items-center gap-2 border border-border bg-surface px-3.5 text-sm font-medium"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Compare options
          {selectedSlugs.length > 0 && (
            <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
              {selectedSlugs.length}
            </span>
          )}
        </button>
      </div>

      {invalidSlugs.length > 0 && (
        <div className="mx-auto max-w-[var(--container)] px-4 pt-4 sm:px-6 lg:px-8">
          <p className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm text-muted">
            One selected product could not be loaded
            {invalidSlugs.length > 1 ? "s" : ""}.
          </p>
        </div>
      )}

      {crossCategoryError && (
        <div className="mx-auto max-w-[var(--container)] px-4 pt-6 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="font-medium">
              These products cannot be compared together.
            </p>
            <p className="mt-1 text-sm text-muted">
              Compare Builder only allows products from the same category.
            </p>
            <Button
              type="button"
              className="mt-3"
              size="sm"
              onClick={clearAll}
            >
              Start a new comparison
            </Button>
          </div>
        </div>
      )}

      <Container
        className={cn(
          "grid gap-10 py-6 pb-16 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14",
        )}
      >
        <aside className="hidden lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:block lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          {sidebar}
        </aside>
        <div>
          {loading && (
            <p className="text-sm text-muted" role="status">
              Updating comparison…
            </p>
          )}

          {hasResults && comparison ? (
            <CompareResults
              data={comparison}
              onRemove={removeSlug}
              shareUrl={shareUrl}
              showOnlyDifferences={showOnlyDifferences}
              sortBy={sortBy}
              hiddenGroupIds={hiddenGroupIds}
            />
          ) : (
            <div className="space-y-8">
              {selectedSlugs.length === 1 && (
                <p className="text-sm text-muted">
                  Add one more {nounSingular} to compare.
                </p>
              )}
              {selectedSlugs.length === 0 && (
                <p className="text-sm text-muted">
                  Select {nounPlural} from the sidebar to start a comparison.
                </p>
              )}

              <Section
                className="!px-0"
                eyebrow="Featured"
                title="Featured comparisons"
                description="Curated editorial comparisons — not auto-generated pairs."
              >
                <FeaturedComparisons
                  groups={featured}
                  index={index}
                  categoryId={category?.id}
                  nounPlural={nounPlural}
                />
              </Section>
            </div>
          )}
        </div>
      </Container>

      {/* Mobile options drawer */}
      {mobileOptionsOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal-950/50"
            aria-label="Close compare options"
            onClick={closeMobileOptions}
          />
          <div
            ref={mobileOptionsRef}
            role="dialog"
            aria-modal="true"
            aria-label="Compare options"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-xl outline-none"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="font-display text-lg font-semibold">
                Compare options
              </h2>
              <button
                type="button"
                onClick={closeMobileOptions}
                className="rounded-lg p-2 hover:bg-surface-muted"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{sidebar}</div>
            <div className="border-t border-border p-4">
              <Button
                className="w-full"
                onClick={closeMobileOptions}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customize metrics dialog */}
      {customizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal-950/50"
            aria-label="Close customize dialog"
            onClick={closeCustomize}
          />
          <div
            ref={customizeRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="customize-title"
            tabIndex={-1}
            className="relative z-10 w-full max-w-md border border-border bg-white p-5 shadow-xl outline-none"
          >
            <div className="flex items-start justify-between gap-3">
              <h2
                id="customize-title"
                className="font-display text-lg font-semibold"
              >
                Customize categories &amp; metrics
              </h2>
              <button
                type="button"
                onClick={closeCustomize}
                className="rounded p-1 hover:bg-surface-muted"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-muted">
              Hide sections you do not need for this comparison.
            </p>
            <ul className="mt-4 space-y-2">
              {customizeGroups.map((g) => {
                const hidden = hiddenGroupIds.includes(g.id);
                return (
                  <li key={g.id}>
                    <label className="flex cursor-pointer items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={!hidden}
                        onChange={() => {
                          setHiddenGroupIds((prev) =>
                            hidden
                              ? prev.filter((id) => id !== g.id)
                              : [...prev, g.id],
                          );
                        }}
                        className="size-4 accent-[var(--color-accent,#a3e635)]"
                      />
                      <span>{g.label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex justify-end">
              <Button size="sm" onClick={closeCustomize}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
