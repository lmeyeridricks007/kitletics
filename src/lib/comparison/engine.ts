import type {
  SpecValue,
  SpecificationDefinition,
  Product,
} from "@/domain/products/types";
import type { Recommendation } from "@/domain/recommendations/types";
import {
  getComparisonCategoryConfig,
  type ComparisonCategoryConfig,
} from "@/lib/comparison/category-config";

export type SpecDiffState =
  | "same"
  | "different"
  | "missing"
  | "not-applicable";

export interface SpecDiffRow {
  key: string;
  label: string;
  unit?: string;
  valuesByProduct: Record<string, string>;
  rawByProduct: Record<string, SpecValue | undefined>;
  state: SpecDiffState;
  importance: number;
  directionality: "higher-better" | "lower-better" | "contextual" | "neutral";
}

export type UseCaseWinnerState = "winner" | "tie" | "insufficient";

export interface UseCaseDiffRow {
  useCaseId: string;
  label: string;
  scoresByProduct: Record<string, number | undefined>;
  winnerProductId?: string;
  state: UseCaseWinnerState;
  margin: number;
  factorsByProduct: Record<
    string,
    { key: string; score: number; explanation: string }[]
  >;
  editorialRationale?: string;
}

export interface PriceDiffRow {
  productId: string;
  price?: number;
  currency?: string;
  available: boolean;
}

export interface CompareProductsResult {
  categoryId: string;
  config: ComparisonCategoryConfig;
  sharedSpecs: SpecDiffRow[];
  differingSpecs: SpecDiffRow[];
  importantDifferences: SpecDiffRow[];
  allSpecs: SpecDiffRow[];
  useCaseDifferences: UseCaseDiffRow[];
  priceDifferences: PriceDiffRow[];
  recommendationDifferences: UseCaseDiffRow[];
}

function formatValue(
  value: SpecValue | undefined,
  def?: SpecificationDefinition,
): string {
  if (value === null) return "—";
  if (value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    return def?.unit ? `${value}` : String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value
      .map((v) =>
        typeof v === "string"
          ? v
              .split("-")
              .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
              .join(" ")
          : String(v),
      )
      .join(", ");
  }
  if (typeof value === "object" && value !== null && "min" in value) {
    const r = value as { min?: number; max?: number };
    return [r.min, r.max].filter((v) => v !== undefined).join("–") || "—";
  }
  if (typeof value === "string") {
    return value
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }
  return String(value);
}

/** Normalize for equality — distinguish null (unknown) from false */
function normalizeForEquality(
  value: SpecValue | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return [...value].map(String).sort().join("|");
  }
  if (typeof value === "object" && value !== null && "min" in value) {
    const r = value as { min?: number; max?: number };
    return `${r.min ?? ""}-${r.max ?? ""}`;
  }
  return String(value).toLowerCase();
}

function classifyState(
  values: (SpecValue | undefined)[],
): SpecDiffState {
  const norms = values.map(normalizeForEquality);
  const allMissing = norms.every((v) => v === undefined);
  if (allMissing) return "not-applicable";

  const present = norms.filter((v) => v !== undefined);
  if (present.length < values.length) {
    // Some missing — if present ones equal, still "missing" (incomplete)
    const uniquePresent = new Set(present.map((v) => String(v)));
    if (uniquePresent.size <= 1 && present.length < values.length) {
      return "missing";
    }
    return "different";
  }

  // Distinguish null (unknown) from false — already in normalize
  const unique = new Set(present.map((v) => String(v)));
  if (unique.size === 1) return "same";
  return "different";
}

export function buildSpecDiffs(
  products: Product[],
  defs: SpecificationDefinition[],
): SpecDiffRow[] {
  const keys = new Set<string>();
  for (const def of defs) keys.add(def.key);
  for (const p of products) {
    for (const k of Object.keys(p.specifications)) keys.add(k);
  }

  const defByKey = new Map(defs.map((d) => [d.key, d]));
  const rows: SpecDiffRow[] = [];

  for (const key of keys) {
    const def = defByKey.get(key);
    const rawByProduct: Record<string, SpecValue | undefined> = {};
    const valuesByProduct: Record<string, string> = {};
    const raws: (SpecValue | undefined)[] = [];

    for (const p of products) {
      const raw = p.specifications[key] as SpecValue | undefined;
      rawByProduct[p.id] = raw;
      valuesByProduct[p.id] = formatValue(raw, def);
      raws.push(raw);
    }

    const state = classifyState(raws);
    rows.push({
      key,
      label: def?.label ?? key,
      unit: def?.unit,
      valuesByProduct,
      rawByProduct,
      state,
      importance: def?.comparisonPriority ?? 0,
      directionality: def?.directionality ?? "neutral",
    });
  }

  return rows.sort((a, b) => b.importance - a.importance);
}

export function buildUseCaseDiffs(input: {
  products: Product[];
  recommendations: Recommendation[];
  useCaseLabels: Record<string, string>;
  primaryUseCaseIds: string[];
  threshold: number;
  editorialPicks?: { useCaseId: string; productId: string; rationale: string }[];
}): UseCaseDiffRow[] {
  const { products, recommendations, useCaseLabels, primaryUseCaseIds, threshold, editorialPicks } =
    input;

  const useCaseIds = new Set<string>([
    ...primaryUseCaseIds,
    ...recommendations.map((r) => r.useCaseId).filter(Boolean) as string[],
    ...(editorialPicks?.map((p) => p.useCaseId) ?? []),
  ]);

  const rows: UseCaseDiffRow[] = [];

  for (const useCaseId of useCaseIds) {
    const scoresByProduct: Record<string, number | undefined> = {};
    const factorsByProduct: UseCaseDiffRow["factorsByProduct"] = {};

    for (const p of products) {
      const rec = recommendations.find(
        (r) => r.productId === p.id && r.useCaseId === useCaseId,
      );
      scoresByProduct[p.id] = rec?.score;
      factorsByProduct[p.id] =
        rec?.factors.map((f) => ({
          key: f.key,
          score: f.score,
          explanation: f.explanation ?? "",
        })) ?? [];
    }

    const scored = products
      .map((p) => ({ id: p.id, score: scoresByProduct[p.id] }))
      .filter((s): s is { id: string; score: number } => typeof s.score === "number");

    let state: UseCaseWinnerState = "insufficient";
    let winnerProductId: string | undefined;
    let margin = 0;

    if (scored.length >= 2) {
      const sorted = [...scored].sort((a, b) => b.score - a.score);
      margin = sorted[0].score - sorted[1].score;
      if (margin < threshold) {
        state = "tie";
      } else {
        state = "winner";
        winnerProductId = sorted[0].id;
      }
    } else if (scored.length === 1 && products.length === 1) {
      state = "winner";
      winnerProductId = scored[0].id;
    }

    const editorial = editorialPicks?.find((p) => p.useCaseId === useCaseId);

    // Editorial/hybrid: attach rationale. When scores tie or are insufficient,
    // editorial may declare a contextual winner. Clear score winners may also
    // be overridden by hybrid editorial picks. Pure generated ties stay TIE.
    if (editorial) {
      if (state === "insufficient" || state === "tie") {
        winnerProductId = editorial.productId;
        state = "winner";
      } else if (state === "winner") {
        winnerProductId = editorial.productId;
      }
    }

    rows.push({
      useCaseId,
      label: useCaseLabels[useCaseId] ?? useCaseId,
      scoresByProduct,
      winnerProductId: state === "tie" ? undefined : winnerProductId,
      state,
      margin,
      factorsByProduct,
      editorialRationale: editorial?.rationale,
    });
  }

  // Prefer primary order, then others
  const order = new Map(primaryUseCaseIds.map((id, i) => [id, i]));
  return rows
    .filter((r) =>
      Object.values(r.scoresByProduct).some((s) => typeof s === "number"),
    )
    .sort((a, b) => {
      const ai = order.has(a.useCaseId) ? order.get(a.useCaseId)! : 999;
      const bi = order.has(b.useCaseId) ? order.get(b.useCaseId)! : 999;
      return ai - bi;
    });
}

export function buildPriceDiffs(
  products: Product[],
  lowestByProduct: Record<string, { price: number; currency: string } | undefined>,
): PriceDiffRow[] {
  return products.map((p) => {
    const low = lowestByProduct[p.id];
    return {
      productId: p.id,
      price: low?.price,
      currency: low?.currency,
      available: Boolean(low),
    };
  });
}

/**
 * Core comparison engine — category-neutral, supports 2–4 products.
 * Does NOT invent editorial winners from overall Product.recommendationScore.
 */
export function compareProducts(input: {
  products: Product[];
  defs: SpecificationDefinition[];
  recommendations: Recommendation[];
  useCaseLabels: Record<string, string>;
  lowestByProduct: Record<string, { price: number; currency: string } | undefined>;
  editorialPicks?: { useCaseId: string; productId: string; rationale: string }[];
  categoryId?: string;
}): CompareProductsResult {
  const categoryId =
    input.categoryId ?? input.products[0]?.categoryId ?? "";
  const config = getComparisonCategoryConfig(categoryId);
  const allSpecs = buildSpecDiffs(input.products, input.defs);

  const keySet = new Set(config.keySpecificationKeys);
  const importantDifferences = allSpecs.filter(
    (r) =>
      r.state === "different" &&
      (keySet.has(r.key) || r.importance >= 70),
  );
  const differingSpecs = allSpecs.filter((r) => r.state === "different");
  const sharedSpecs = allSpecs.filter((r) => r.state === "same");

  const useCaseDifferences = buildUseCaseDiffs({
    products: input.products,
    recommendations: input.recommendations,
    useCaseLabels: input.useCaseLabels,
    primaryUseCaseIds: config.primaryUseCaseIds,
    threshold: config.winnerDifferenceThreshold,
    editorialPicks: input.editorialPicks,
  });

  return {
    categoryId,
    config,
    sharedSpecs,
    differingSpecs,
    importantDifferences,
    allSpecs,
    useCaseDifferences,
    recommendationDifferences: useCaseDifferences,
    priceDifferences: buildPriceDiffs(input.products, input.lowestByProduct),
  };
}

/** Canonical pair key for detecting duplicate A-vs-B / B-vs-A comparisons */
export function canonicalProductPairKey(productIds: string[]): string {
  return [...productIds].sort().join("|");
}

/** Build reverse slug candidates for redirect (two-product only) */
export function reverseComparisonSlug(slug: string): string | undefined {
  const parts = slug.split("-vs-");
  if (parts.length !== 2) return undefined;
  return `${parts[1]}-vs-${parts[0]}`;
}

export function findEditorialComparisonForProducts(
  comparisons: { id: string; slug: string; productIds: string[] }[],
  productIds: string[],
): { id: string; slug: string } | undefined {
  const key = canonicalProductPairKey(productIds);
  return comparisons.find(
    (c) => canonicalProductPairKey(c.productIds) === key,
  );
}

/** Alias used by Compare Builder hand-off */
export const findPublishedComparisonForProducts =
  findEditorialComparisonForProducts;
