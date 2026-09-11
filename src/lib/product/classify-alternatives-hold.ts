/**
 * Fix 65 — explicit Alternatives hold vs READY vs unexplained thin.
 * Fix 74 — same-job (non-INVALID) peer count, not a lumped regex cluster.
 */
import type { Product } from "@/domain/products/types";
import type { ProductRelationship } from "@/domain/relationships/types";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { scoreAlternativePair } from "@/lib/decision-graph/semantic-quality";
import {
  ALTERNATIVES_HOLD_DUPLICATE_INTENT,
  ALTERNATIVES_HOLD_INSUFFICIENT_MARKET,
  ALTERNATIVES_HOLD_OBSOLETE_SOURCE,
  alternativeMarketCluster,
  type AlternativesHoldClass,
} from "@/content/alternatives-p65-completion";

export type { AlternativesHoldClass };

export const EXPLAINED_ALTERNATIVES_HOLDS = [
  "HOLD_INSUFFICIENT_ALTERNATIVE_MARKET",
  "HOLD_DUPLICATE_INTENT",
  "HOLD_OBSOLETE_SOURCE",
] as const;

export type ExplainedAlternativesHold = (typeof EXPLAINED_ALTERNATIVES_HOLDS)[number];

export function classifyAlternativesHold(
  product: Product,
  relationships: ProductRelationship[],
  catalog: Product[],
): AlternativesHoldClass {
  const gate = canPublishAlternativesPage(product, relationships);
  if (gate.ok) return "READY";
  if (ALTERNATIVES_HOLD_DUPLICATE_INTENT.has(product.slug)) {
    return "HOLD_DUPLICATE_INTENT";
  }
  if (ALTERNATIVES_HOLD_OBSOLETE_SOURCE.has(product.slug)) {
    return "HOLD_OBSOLETE_SOURCE";
  }
  if (ALTERNATIVES_HOLD_INSUFFICIENT_MARKET.has(product.slug)) {
    return "HOLD_INSUFFICIENT_ALTERNATIVE_MARKET";
  }

  const cluster = alternativeMarketCluster(product);
  const g =
    product.slug.endsWith("-women")
      ? "women"
      : product.slug.endsWith("-men")
        ? "men"
        : "uni";
  const peers = catalog.filter((p) => {
    if (p.id === product.id) return false;
    if (p.status !== "published" || p.noindex) return false;
    if (p.categoryId !== product.categoryId) return false;
    if (alternativeMarketCluster(p) !== cluster) return false;
    const pg = p.slug.endsWith("-women")
      ? "women"
      : p.slug.endsWith("-men")
        ? "men"
        : "uni";
    if (g !== "uni" && pg !== "uni" && pg !== g) return false;
    return true;
  });
  if (peers.length < 3) return "HOLD_INSUFFICIENT_ALTERNATIVE_MARKET";

  const sameJob = peers.filter(
    (p) => scoreAlternativePair(product, p).cls !== "INVALID",
  );
  if (sameJob.length < 3) return "HOLD_INSUFFICIENT_ALTERNATIVE_MARKET";

  return "THIN_UNEXPLAINED";
}
