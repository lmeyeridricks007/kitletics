/**
 * Apply field-level spec enrichment patches onto Product.specifications.
 * Provenance stays in the sidecar store — not embedded in SpecValue.
 */

import type { Product, SpecValue } from "@/domain/products/types";
import type { ProductSpecEnrichment } from "@/content/padel/spec-enrichment/types";
import { hasMeaningfulSpecValue } from "@/content/padel/spec-enrichment/types";
import { padelSpecEnrichmentStore } from "@/content/padel/spec-enrichment/store";

export function applySpecEnrichmentToProduct(
  product: Product,
  enrichment?: ProductSpecEnrichment,
): Product {
  const record = enrichment ?? padelSpecEnrichmentStore[product.id];
  if (!record || !record.fields) return product;

  const next: Record<string, SpecValue> = { ...product.specifications };
  for (const [key, field] of Object.entries(record.fields)) {
    // Never overwrite a richer curated value with NOT_PUBLISHED / UNKNOWN
    if (
      hasMeaningfulSpecValue(next[key]) &&
      !hasMeaningfulSpecValue(field.value)
    ) {
      continue;
    }
    // Prefer existing meaningful value unless enrichment is VERIFIED and different
    if (
      hasMeaningfulSpecValue(next[key]) &&
      field.state === "VERIFIED" &&
      JSON.stringify(next[key]) !== JSON.stringify(field.value)
    ) {
      // Keep existing; conflict is recorded in provenance store only
      continue;
    }
    if (!hasMeaningfulSpecValue(next[key]) || field.state === "VERIFIED") {
      next[key] = field.value;
    }
  }
  return { ...product, specifications: next };
}

export function applySpecEnrichmentToProducts(products: Product[]): Product[] {
  return products.map((p) => applySpecEnrichmentToProduct(p));
}

export function getSpecEnrichment(
  productId: string,
): ProductSpecEnrichment | undefined {
  return padelSpecEnrichmentStore[productId];
}
