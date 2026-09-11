/**
 * Compare selection helpers and persistence.
 *
 * Precedence (documented):
 * 1. URL state (when present on /compare)
 * 2. persisted session/local storage (tray across navigation)
 * 3. empty / default
 *
 * URL wins when opening a shared link.
 */

export const COMPARE_MAX_PRODUCTS = 4;
export const COMPARE_MIN_PRODUCTS = 2;
export const COMPARE_STORAGE_KEY = "kitletics.compare.v1";

export interface PersistedCompareState {
  categoryId: string | null;
  categorySlug: string | null;
  /** Product slugs in user-visible column order */
  productSlugs: string[];
  updatedAt: string;
}

export function parseCompareProductsParam(
  productsParam: string | null | undefined,
): string[] {
  if (!productsParam) return [];
  return [
    ...new Set(
      productsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ].slice(0, COMPARE_MAX_PRODUCTS);
}

export function buildCompareHref(input: {
  categorySlug?: string | null;
  productSlugs: string[];
  /** When true, stay on builder even with <2 products */
  edit?: boolean;
}): string {
  const parts: string[] = [];
  if (input.categorySlug) {
    parts.push(`category=${encodeURIComponent(input.categorySlug)}`);
  }
  if (input.productSlugs.length > 0) {
    // Keep commas readable/shareable (not %2C)
    const products = input.productSlugs
      .map((s) => encodeURIComponent(s))
      .join(",");
    parts.push(`products=${products}`);
  }
  if (input.edit) parts.push("edit=1");
  return parts.length ? `/compare?${parts.join("&")}` : "/compare";
}

export function readPersistedCompareState(): PersistedCompareState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedCompareState;
    if (!Array.isArray(parsed.productSlugs)) return null;
    return {
      categoryId: parsed.categoryId ?? null,
      categorySlug: parsed.categorySlug ?? null,
      productSlugs: parsed.productSlugs.slice(0, COMPARE_MAX_PRODUCTS),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writePersistedCompareState(
  state: PersistedCompareState | null,
): void {
  if (typeof window === "undefined") return;
  try {
    if (!state || state.productSlugs.length === 0) {
      window.localStorage.removeItem(COMPARE_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      COMPARE_STORAGE_KEY,
      JSON.stringify({
        ...state,
        productSlugs: state.productSlugs.slice(0, COMPARE_MAX_PRODUCTS),
        updatedAt: new Date().toISOString(),
      } satisfies PersistedCompareState),
    );
  } catch {
    // storage full / private mode — ignore
  }
}

export function clearPersistedCompareState(): void {
  writePersistedCompareState(null);
}

/** Add slug if under max and not duplicate */
export function addProductSlug(
  current: string[],
  slug: string,
): string[] {
  if (current.includes(slug)) return current;
  if (current.length >= COMPARE_MAX_PRODUCTS) return current;
  return [...current, slug];
}

export function removeProductSlug(current: string[], slug: string): string[] {
  return current.filter((s) => s !== slug);
}

export function replaceProductSlug(
  current: string[],
  fromSlug: string,
  toSlug: string,
): string[] {
  if (fromSlug === toSlug) return current;
  if (current.includes(toSlug)) {
    // swap if target already present
    return current.map((s) => (s === fromSlug ? toSlug : s === toSlug ? fromSlug : s));
  }
  return current.map((s) => (s === fromSlug ? toSlug : s));
}
