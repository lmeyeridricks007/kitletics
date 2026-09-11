import type { SpecValue } from "@/domain/products/types";
import type { Product } from "@/domain/products/types";
import type { Recommendation } from "@/domain/recommendations/types";
import type {
  ProductSimilarityConfig,
  SimilarityFieldConfig,
  SimilarityResult,
} from "@/domain/relationships/types";

function asArray(value: SpecValue | undefined): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
}

function asNumber(value: SpecValue | undefined): number | undefined {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return undefined;
}

const CUSHION_ORDER = ["minimal", "low", "medium", "high", "maximum"];
const STABILITY_ORDER = [
  "neutral",
  "mild-stability",
  "stability",
  "maximum-stability",
];

function enumDistance(
  a: string | undefined,
  b: string | undefined,
  order: string[],
): number {
  if (!a || !b) return 0.5;
  const ia = order.indexOf(a);
  const ib = order.indexOf(b);
  if (ia < 0 || ib < 0) return a === b ? 1 : 0.3;
  const dist = Math.abs(ia - ib);
  return Math.max(0, 1 - dist / Math.max(1, order.length - 1));
}

function fieldSimilarity(
  a: SpecValue | undefined,
  b: SpecValue | undefined,
  field: SimilarityFieldConfig,
): number {
  if (a === undefined || a === null || b === undefined || b === null) return 0.4;

  switch (field.comparisonType) {
    case "exact":
      return String(a) === String(b) ? 1 : 0;
    case "boolean":
      return Boolean(a) === Boolean(b) ? 1 : 0;
    case "multi-overlap": {
      const aa = asArray(a);
      const bb = asArray(b);
      if (!aa.length || !bb.length) return 0.4;
      const setB = new Set(bb);
      const overlap = aa.filter((x) => setB.has(x)).length;
      const union = new Set([...aa, ...bb]).size;
      return union ? overlap / union : 0;
    }
    case "numeric-band": {
      const na = asNumber(a);
      const nb = asNumber(b);
      if (na === undefined || nb === undefined) return 0.4;
      const band = field.bandSize ?? 10;
      const dist = Math.abs(na - nb);
      return Math.max(0, 1 - dist / (band * 3));
    }
    case "enum-distance": {
      const sa = String(a);
      const sb = String(b);
      if (field.key === "cushionLevel") return enumDistance(sa, sb, CUSHION_ORDER);
      if (field.key === "stability") return enumDistance(sa, sb, STABILITY_ORDER);
      return sa === sb ? 1 : 0.25;
    }
    default:
      return String(a) === String(b) ? 1 : 0.2;
  }
}

function recommendationProfileSimilarity(
  productAId: string,
  productBId: string,
  contexts: string[],
  recommendations: Recommendation[],
): number {
  if (!contexts.length) return 0.5;
  let sum = 0;
  let n = 0;
  for (const uc of contexts) {
    const ra = recommendations.find(
      (r) => r.productId === productAId && r.useCaseId === uc,
    );
    const rb = recommendations.find(
      (r) => r.productId === productBId && r.useCaseId === uc,
    );
    if (!ra && !rb) continue;
    n++;
    if (!ra || !rb) {
      sum += 0.35;
      continue;
    }
    const dist = Math.abs(ra.score - rb.score);
    sum += Math.max(0, 1 - dist / 40);
  }
  return n ? sum / n : 0.5;
}

export function similarityLabel(score: number): SimilarityResult["label"] {
  if (score >= 0.82) return "very-similar";
  if (score >= 0.65) return "similar";
  if (score >= 0.45) return "different-emphasis";
  return "dissimilar";
}

/**
 * Deterministic structured similarity — not embeddings.
 * Missing data → soft neutral contribution, never hard 0 for unknown alone.
 */
export function computeProductSimilarity(
  productA: Product,
  productB: Product,
  config: ProductSimilarityConfig,
  recommendations: Recommendation[] = [],
): SimilarityResult {
  if (productA.categoryId !== productB.categoryId) {
    return { score: 0, label: "dissimilar", fieldHits: [] };
  }

  let weighted = 0;
  let weightSum = 0;
  const fieldHits: SimilarityResult["fieldHits"] = [];

  for (const field of config.fields) {
    const contrib = fieldSimilarity(
      productA.specifications[field.key],
      productB.specifications[field.key],
      field,
    );
    weighted += contrib * field.weight;
    weightSum += field.weight;
    fieldHits.push({ key: field.key, contribution: contrib * field.weight });
  }

  if (config.recommendationWeight > 0 && config.recommendationContexts.length) {
    const rSim = recommendationProfileSimilarity(
      productA.id,
      productB.id,
      config.recommendationContexts,
      recommendations,
    );
    weighted += rSim * config.recommendationWeight;
    weightSum += config.recommendationWeight;
    fieldHits.push({
      key: "recommendation-profile",
      contribution: rSim * config.recommendationWeight,
    });
  }

  // Shared subcategory bonus
  const subA = new Set(productA.subcategoryIds);
  const subOverlap = productB.subcategoryIds.filter((id) => subA.has(id)).length;
  if (subOverlap > 0) {
    const bonus = Math.min(0.08, subOverlap * 0.03);
    weighted += bonus;
    weightSum += bonus;
  }

  const score = weightSum > 0 ? weighted / weightSum : 0;
  return { score, label: similarityLabel(score), fieldHits };
}
