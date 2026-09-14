export type {
  CommerceAvailabilityClass,
  CommerceConflict,
  CommerceConflictType,
  CommerceOfferPresence,
  CommerceResearchState,
  ProductCommerceEnrichment,
} from "@/content/padel/commerce-enrichment/types";

export { padelCommerceEnrichmentStore } from "@/content/padel/commerce-enrichment/store";

import { padelCommerceEnrichmentStore } from "@/content/padel/commerce-enrichment/store";
import type { ProductCommerceEnrichment } from "@/content/padel/commerce-enrichment/types";

export function getCommerceEnrichment(
  productId: string,
): ProductCommerceEnrichment | undefined {
  return padelCommerceEnrichmentStore[productId];
}
