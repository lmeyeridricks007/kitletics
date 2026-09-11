import type { Product } from "@/domain/products/types";
import type { ProductRelationship } from "@/domain/relationships/types";
import { isAlternativeType } from "@/domain/relationships/types";

export interface AlternativesPageEligibility {
  ok: boolean;
  reasons: string[];
  alternativeCount: number;
  uniqueTypes: number;
}

/**
 * Index only when the page has enough unique decision value.
 */
export function canPublishAlternativesPage(
  product: Product,
  relationships: ProductRelationship[],
): AlternativesPageEligibility {
  const reasons: string[] = [];
  if (product.status !== "published") reasons.push("source product not published");

  const alts = relationships.filter(
    (r) =>
      r.sourceProductId === product.id &&
      r.status === "approved" &&
      isAlternativeType(r.type),
  );
  const types = new Set(alts.map((r) => r.type));

  if (alts.length < 3) reasons.push(`need ≥3 alternatives (have ${alts.length})`);
  if (types.size < 2) reasons.push("need ≥2 distinct alternative types");

  const isTemplateReason = (x: string) =>
    /same-category alternative when you want a peer/i.test(x);

  const withReasons = alts.filter((r) =>
    r.reasons.some(
      (x) => x.trim().length > 24 && !isTemplateReason(x),
    ),
  );
  if (withReasons.length < 3) {
    reasons.push("need meaningful unique reasons on ≥3 alts");
  }

  const withDecisionShape = alts.filter((r) => {
    const blob = r.reasons.join(" ").toLowerCase();
    const hasSwitch = /switch|choose|better when|when you want|prefer|move to/.test(blob);
    const hasTrade =
      /trade-?off|give up|stay with|keep |limit|worse|accept/.test(blob);
    return hasSwitch && hasTrade && r.reasons.length >= 2;
  });
  if (withDecisionShape.length < 2) {
    reasons.push("need switch/trade-off decision shape on ≥2 alts");
  }

  return {
    ok: reasons.length === 0,
    reasons,
    alternativeCount: alts.length,
    uniqueTypes: types.size,
  };
}

export interface ComparisonPublishCheck {
  ok: boolean;
  reasons: string[];
}

export function canPublishComparison(input: {
  productIds: string[];
  products: Product[];
  keyDifferencesCount: number;
  hasSummary: boolean;
  comparisonType: string;
}): ComparisonPublishCheck {
  const reasons: string[] = [];
  if (input.productIds.length < 2) reasons.push("need ≥2 products");
  const published = input.products.filter((p) => p.status === "published");
  if (published.length < 2) reasons.push("both products must be published");
  if (!input.hasSummary) reasons.push("missing summary");
  if (input.keyDifferencesCount < 2 && input.comparisonType !== "editorial") {
    reasons.push("need ≥2 key differences for generated/hybrid");
  }
  const cats = new Set(input.products.map((p) => p.categoryId));
  if (cats.size > 1) reasons.push("cross-category comparisons not eligible");
  return { ok: reasons.length === 0, reasons };
}
