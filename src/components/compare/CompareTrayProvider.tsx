"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  COMPARE_MAX_PRODUCTS,
  clearPersistedCompareState,
  readPersistedCompareState,
  writePersistedCompareState,
  buildCompareHref,
  type PersistedCompareState,
} from "@/lib/comparison/selection";
import { trackCompareEvent } from "@/lib/comparison/analytics";

export interface CompareTrayItem {
  slug: string;
  name: string;
  brandName?: string;
  categoryId: string;
  categorySlug: string;
}

type AddResult =
  | { ok: true }
  | {
      ok: false;
      reason: "full" | "duplicate" | "category-conflict";
      message: string;
    };

interface CompareTrayContextValue {
  categoryId: string | null;
  categorySlug: string | null;
  items: CompareTrayItem[];
  productSlugs: string[];
  count: number;
  max: number;
  canAdd: boolean;
  hydrated: boolean;
  compareHref: string;
  addProduct: (
    item: CompareTrayItem,
    opts?: { source?: string; forceCategoryReset?: boolean },
  ) => AddResult;
  removeProduct: (slug: string, source?: string) => void;
  replaceProduct: (fromSlug: string, to: CompareTrayItem) => void;
  clear: (source?: string) => void;
  setFromSlugs: (input: {
    categoryId: string;
    categorySlug: string;
    items: CompareTrayItem[];
  }) => void;
  isSelected: (slug: string) => boolean;
}

const CompareTrayContext = createContext<CompareTrayContextValue | null>(null);

export function CompareTrayProvider({ children }: { children: ReactNode }) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [items, setItems] = useState<CompareTrayItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persisted = readPersistedCompareState();
    if (persisted?.productSlugs.length) {
      setCategoryId(persisted.categoryId);
      setCategorySlug(persisted.categorySlug);
      setItems(
        persisted.productSlugs.map((slug) => ({
          slug,
          name: slug.replace(/-/g, " "),
          categoryId: persisted.categoryId ?? "",
          categorySlug: persisted.categorySlug ?? "",
        })),
      );
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: PersistedCompareState = {
      categoryId,
      categorySlug,
      productSlugs: items.map((i) => i.slug),
      updatedAt: new Date().toISOString(),
    };
    writePersistedCompareState(state.productSlugs.length ? state : null);
  }, [items, categoryId, categorySlug, hydrated]);

  const addProduct = useCallback(
    (
      item: CompareTrayItem,
      opts?: { source?: string; forceCategoryReset?: boolean },
    ): AddResult => {
      const source = opts?.source ?? "unknown";

      if (items.some((i) => i.slug === item.slug)) {
        return {
          ok: false,
          reason: "duplicate",
          message: "This product is already in your comparison.",
        };
      }

      if (
        categoryId &&
        item.categoryId !== categoryId &&
        !opts?.forceCategoryReset
      ) {
        return {
          ok: false,
          reason: "category-conflict",
          message: `Starting a new category comparison will clear your current selection.`,
        };
      }

      if (opts?.forceCategoryReset || !categoryId) {
        setCategoryId(item.categoryId);
        setCategorySlug(item.categorySlug);
        setItems([item]);
        trackCompareEvent("compare_started", {
          categoryId: item.categoryId,
          productCount: 1,
          productIds: [item.slug],
          source,
        });
        return { ok: true };
      }

      if (items.length >= COMPARE_MAX_PRODUCTS) {
        return {
          ok: false,
          reason: "full",
          message: "You can compare up to 4 products.",
        };
      }

      const next = [...items, item];
      setItems(next);
      trackCompareEvent("compare_product_added", {
        categoryId: item.categoryId,
        productCount: next.length,
        productIds: next.map((i) => i.slug),
        source,
      });
      return { ok: true };
    },
    [items, categoryId],
  );

  const removeProduct = useCallback(
    (slug: string, source = "unknown") => {
      setItems((prev) => {
        const next = prev.filter((i) => i.slug !== slug);
        trackCompareEvent("compare_product_removed", {
          categoryId: categoryId ?? undefined,
          productCount: next.length,
          productIds: next.map((i) => i.slug),
          source,
        });
        if (next.length === 0) {
          setCategoryId(null);
          setCategorySlug(null);
          clearPersistedCompareState();
        }
        return next;
      });
    },
    [categoryId],
  );

  const replaceProduct = useCallback(
    (fromSlug: string, to: CompareTrayItem) => {
      if (categoryId && to.categoryId !== categoryId) return;
      setItems((prev) => {
        const withoutTarget = prev.filter((p) => p.slug !== to.slug);
        const next = withoutTarget.map((p) =>
          p.slug === fromSlug ? to : p,
        );
        if (!next.some((p) => p.slug === to.slug)) {
          // fromSlug missing — no-op
          return prev;
        }
        trackCompareEvent("compare_product_replaced", {
          categoryId: categoryId ?? undefined,
          productCount: next.length,
          productIds: next.map((i) => i.slug),
        });
        return next;
      });
    },
    [categoryId],
  );

  const clear = useCallback((source = "unknown") => {
    trackCompareEvent("compare_cleared", {
      categoryId: categoryId ?? undefined,
      productCount: 0,
      source,
    });
    setItems([]);
    setCategoryId(null);
    setCategorySlug(null);
    clearPersistedCompareState();
  }, [categoryId]);

  const setFromSlugs = useCallback(
    (input: {
      categoryId: string;
      categorySlug: string;
      items: CompareTrayItem[];
    }) => {
      setCategoryId(input.categoryId);
      setCategorySlug(input.categorySlug);
      setItems(input.items.slice(0, COMPARE_MAX_PRODUCTS));
    },
    [],
  );

  const productSlugs = items.map((i) => i.slug);
  const compareHref = buildCompareHref({
    categorySlug,
    productSlugs,
  });

  const value = useMemo<CompareTrayContextValue>(
    () => ({
      categoryId,
      categorySlug,
      items,
      productSlugs,
      count: items.length,
      max: COMPARE_MAX_PRODUCTS,
      canAdd: items.length < COMPARE_MAX_PRODUCTS,
      hydrated,
      compareHref,
      addProduct,
      removeProduct,
      replaceProduct,
      clear,
      setFromSlugs,
      isSelected: (slug: string) => items.some((i) => i.slug === slug),
    }),
    [
      categoryId,
      categorySlug,
      items,
      productSlugs,
      hydrated,
      compareHref,
      addProduct,
      removeProduct,
      replaceProduct,
      clear,
      setFromSlugs,
    ],
  );

  return (
    <CompareTrayContext.Provider value={value}>
      {children}
    </CompareTrayContext.Provider>
  );
}

export function useCompareTray(): CompareTrayContextValue {
  const ctx = useContext(CompareTrayContext);
  if (!ctx) {
    throw new Error("useCompareTray must be used within CompareTrayProvider");
  }
  return ctx;
}

export function useCompareTrayOptional(): CompareTrayContextValue | null {
  return useContext(CompareTrayContext);
}
