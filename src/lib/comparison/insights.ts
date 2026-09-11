import type { CompareProductsResult, SpecDiffRow } from "@/lib/comparison/engine";
import type { Product } from "@/domain/products/types";

export type ComparisonInsightType =
  | "numeric-difference"
  | "boolean-difference"
  | "shared-value"
  | "unique-capability"
  | "price-difference"
  | "use-case-score-difference";

export interface ComparisonInsight {
  type: ComparisonInsightType;
  text: string;
  sourceKeys: string[];
  productIds?: string[];
}

function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/**
 * Safe, factual insights only — no subjective feel claims.
 */
export function getComparisonInsights(input: {
  products: Product[];
  differences: CompareProductsResult;
  productLabels: Record<string, string>;
}): ComparisonInsight[] {
  const { products, differences, productLabels } = input;
  const insights: ComparisonInsight[] = [];
  if (products.length < 2) return insights;

  // Shared high-priority specs
  for (const row of differences.sharedSpecs.slice(0, 4)) {
    if (row.importance < 50) continue;
    const value = row.valuesByProduct[products[0].id];
    if (!value || value === "—" || value === "Unknown") continue;
    insights.push({
      type: "shared-value",
      text: `Both products share ${row.label.toLowerCase()}: ${value}${row.unit ? ` ${row.unit}` : ""}.`,
      sourceKeys: [row.key],
      productIds: products.map((p) => p.id),
    });
  }

  // Numeric differences (factual delta only)
  for (const row of differences.importantDifferences) {
    const numericInsight = numericDiffInsight(row, products, productLabels);
    if (numericInsight) insights.push(numericInsight);

    const boolInsight = booleanDiffInsight(row, products, productLabels);
    if (boolInsight) insights.push(boolInsight);
  }

  // Price difference (same currency only)
  const prices = differences.priceDifferences.filter(
    (p) => p.available && typeof p.price === "number" && p.currency,
  );
  if (prices.length >= 2) {
    const currencies = new Set(prices.map((p) => p.currency));
    if (currencies.size === 1) {
      const sorted = [...prices].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      const cheap = sorted[0];
      const expensive = sorted[sorted.length - 1];
      const delta = (expensive.price ?? 0) - (cheap.price ?? 0);
      if (delta > 0) {
        insights.push({
          type: "price-difference",
          text: `${productLabels[cheap.productId]} is currently ${cheap.currency === "EUR" ? "€" : ""}${formatNum(delta)}${cheap.currency !== "EUR" ? ` ${cheap.currency}` : ""} cheaper than ${productLabels[expensive.productId]} in this region.`,
          sourceKeys: ["price"],
          productIds: [cheap.productId, expensive.productId],
        });
      }
    }
  }

  // Use-case score gaps
  for (const uc of differences.useCaseDifferences.slice(0, 4)) {
    if (uc.state !== "winner" || !uc.winnerProductId) continue;
    const scores = products
      .map((p) => ({ id: p.id, score: uc.scoresByProduct[p.id] }))
      .filter((s): s is { id: string; score: number } => typeof s.score === "number")
      .sort((a, b) => b.score - a.score);
    if (scores.length < 2) continue;
    const gap = scores[0].score - scores[1].score;
    if (gap < differences.config.winnerDifferenceThreshold) continue;
    insights.push({
      type: "use-case-score-difference",
      text: `${productLabels[scores[0].id]} leads for ${uc.label} (${scores[0].score} vs ${scores[1].score}).`,
      sourceKeys: [uc.useCaseId],
      productIds: [scores[0].id, scores[1].id],
    });
  }

  return insights.slice(0, 8);
}

function numericDiffInsight(
  row: SpecDiffRow,
  products: Product[],
  labels: Record<string, string>,
): ComparisonInsight | undefined {
  if (products.length !== 2) return undefined;
  const [a, b] = products;
  const rawA = row.rawByProduct[a.id];
  const rawB = row.rawByProduct[b.id];
  if (typeof rawA !== "number" || typeof rawB !== "number") return undefined;
  const delta = Math.abs(rawA - rawB);
  if (delta === 0) return undefined;
  const lower = rawA < rawB ? a : b;
  const higher = rawA > rawB ? a : b;
  const unit = row.unit ? ` ${row.unit}` : "";

  // Factual phrasing only — not "better"
  if (row.key.toLowerCase().includes("weight") || row.key === "weight") {
    return {
      type: "numeric-difference",
      text: `${labels[lower.id]} is ${formatNum(delta)}${unit} lighter than ${labels[higher.id]}.`,
      sourceKeys: [row.key],
      productIds: [lower.id, higher.id],
    };
  }

  return {
    type: "numeric-difference",
    text: `${row.label}: ${labels[a.id]} ${formatNum(rawA)}${unit}, ${labels[b.id]} ${formatNum(rawB)}${unit} (${formatNum(delta)}${unit} difference).`,
    sourceKeys: [row.key],
    productIds: [a.id, b.id],
  };
}

function booleanDiffInsight(
  row: SpecDiffRow,
  products: Product[],
  labels: Record<string, string>,
): ComparisonInsight | undefined {
  const truths = products.filter((p) => row.rawByProduct[p.id] === true);
  const falses = products.filter((p) => row.rawByProduct[p.id] === false);
  if (truths.length === 0 || falses.length === 0) return undefined;
  if (truths.length === 1) {
    return {
      type: "unique-capability",
      text: `Only ${labels[truths[0].id]} lists ${row.label.toLowerCase()} as Yes.`,
      sourceKeys: [row.key],
      productIds: [truths[0].id],
    };
  }
  return {
    type: "boolean-difference",
    text: `${row.label} differs across selected products.`,
    sourceKeys: [row.key],
  };
}
