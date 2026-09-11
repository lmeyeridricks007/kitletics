import type { Product } from "@/domain/products/types";
import { getComparisonCategoryConfig } from "@/lib/comparison/category-config";

/** Category-aware highlight fields for Product cards */
export function getProductCardSpecHighlights(
  product: Product,
): { label: string; value: string }[] {
  const config = getComparisonCategoryConfig(product.categoryId);
  const keys = config.keySpecificationKeys.slice(0, 3);
  const out: { label: string; value: string }[] = [];
  for (const key of keys) {
    const raw = product.specifications[key];
    if (raw === undefined || raw === null || raw === "") continue;
    const label = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase())
      .replace("Mm", " (mm)")
      .replace("Min", " min")
      .replace("Max", " max");
    const value = Array.isArray(raw) ? raw.join(", ") : String(raw);
    out.push({ label, value });
  }
  return out;
}
