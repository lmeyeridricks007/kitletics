import type { CatalogPriority } from "@/domain/relationships/types";

/**
 * Internal enrichment priority — not shown to users.
 * Drives which Products get deep alternatives / comparisons first.
 */
export const CATALOG_PRIORITY: Record<string, CatalogPriority> = {
  "prod-novablast-6": "flagship",
  "prod-novablast-5": "major",
  "prod-ghost-18": "flagship",
  "prod-ghost-16": "major",
  "prod-pegasus-42": "flagship",
  "prod-pegasus-41": "standard",
  "prod-clifton-10": "flagship",
  "prod-clifton-9": "standard",
  "prod-bondi-9": "major",
  "prod-nimbus-27": "flagship",
  "prod-endorphin-speed-5": "flagship",
  "prod-endorphin-speed-4": "major",
  "prod-boston-12": "major",
  "prod-vaporfly-4": "flagship",
  "prod-alphafly-3": "major",
  "prod-kayano-32": "major",
  "prod-adrenaline-gts-25": "major",
  "prod-speedgoat-6": "major",
  "prod-peregrine-15": "major",
  "prod-forerunner-970": "flagship",
  "prod-forerunner-965": "major",
  "prod-forerunner-570": "major",
  "prod-coros-pace-pro": "major",
  "prod-coros-pace-3": "major",
  "prod-hrm-pro-plus": "major",
  "prod-hrm-600": "major",
  "prod-adv-skin-12": "major",
  "prod-shokz-openrun-pro-2": "major",
};

export function getCatalogPriority(productId: string): CatalogPriority {
  return CATALOG_PRIORITY[productId] ?? "standard";
}

export function isHighValueProduct(productId: string): boolean {
  const p = getCatalogPriority(productId);
  return p === "flagship" || p === "major";
}
