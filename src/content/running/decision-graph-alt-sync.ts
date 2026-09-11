/**
 * Pre-launch 09 / Editorial 42 — sync Product.alternativeProductIds into the relationship graph.
 * Pair-specific reasons + typed edges when evidence supports; no cross-category arbitrary pairs.
 */

import type { ProductRelationship } from "@/domain/relationships/types";
import { SEED_DATES } from "@/content/config";
import { products } from "@/content/products";
import {
  buildAlternativeDecisionCopy,
  inferAlternativeRelationshipType,
} from "@/lib/product/alternative-decision-copy";
import { ensureDiverseAlternativeTypes } from "@/content/alternatives-p65-completion";

const meta = {
  status: "approved" as const,
  createdAt: SEED_DATES.created,
  updatedAt: SEED_DATES.updated,
  lastVerifiedAt: SEED_DATES.verified,
};

const byId = new Map(products.map((p) => [p.id, p]));

export function buildSyncedAltReasons(
  sourceId: string,
  targetId: string,
  type: ProductRelationship["type"],
): string[] {
  const source = byId.get(sourceId);
  const target = byId.get(targetId);
  if (!source || !target) {
    return [`Catalog peer alternative for ${sourceId} → ${targetId}.`];
  }
  const copy = buildAlternativeDecisionCopy({
    source,
    alternative: target,
    relationship: {
      id: "tmp",
      sourceProductId: sourceId,
      targetProductId: targetId,
      type,
      reasons: [],
      directional: true,
      status: "approved",
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
    },
  });
  return [
    copy.whyAlternative,
    copy.betterAt[0]!,
    copy.worseAt[0]!,
    copy.whoShouldSwitch,
    copy.whoShouldStay,
  ].filter(Boolean);
}

/**
 * Bidirectional alternative edges derived from catalog alternativeProductIds.
 * Same category only; typed when specs/use-cases support it.
 */
let syncedAlternativeRelationships: ProductRelationship[] | undefined;

const SYNCABLE_SPORTS = new Set([
  "sport-running",
  "sport-padel",
  "sport-tennis",
]);

export function getSyncedAlternativeRelationships(): ProductRelationship[] {
  if (syncedAlternativeRelationships) return syncedAlternativeRelationships;

  const edges: ProductRelationship[] = [];
  const seen = new Set<string>();

  for (const product of products) {
    if (product.status !== "published" || product.noindex) continue;
    if (!product.sportIds.some((id) => SYNCABLE_SPORTS.has(id))) continue;
    const alts = (product.alternativeProductIds ?? []).filter((id) => {
      if (!id || id === product.id) return false;
      const peer = byId.get(id);
      if (!peer || peer.status !== "published") return false;
      // No arbitrary cross-category edges
      if (peer.categoryId !== product.categoryId) return false;
      // Need at least one side with a buying signal
      const hasSignal =
        (peer.strengths?.length ?? 0) > 0 ||
        (product.strengths?.length ?? 0) > 0 ||
        (peer.shortDescription?.trim().length ?? 0) > 20;
      return hasSignal;
    });

    const peerProducts = alts.map((id) => byId.get(id)!);
    const forwardInferred = peerProducts.map((peer) =>
      inferAlternativeRelationshipType(product, peer),
    );
    const forwardTypes = ensureDiverseAlternativeTypes(
      product,
      peerProducts,
      forwardInferred,
    );

    for (const [i, altId] of alts.entries()) {
      const key = [product.id, altId].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      const peer = peerProducts[i]!;
      const forwardType = forwardTypes[i]!;
      const reverseType = inferAlternativeRelationshipType(peer, product);

      edges.push({
        id: `rel-sync-alt-${product.id}-${altId}`,
        sourceProductId: product.id,
        targetProductId: altId,
        type: forwardType,
        categoryId: product.categoryId,
        strength: 78,
        reasons: buildSyncedAltReasons(product.id, altId, forwardType),
        evidenceIds: ["ev-catalog-editorial"],
        directional: forwardType !== reverseType,
        ...meta,
      });
      edges.push({
        id: `rel-sync-alt-${altId}-${product.id}`,
        sourceProductId: altId,
        targetProductId: product.id,
        type: reverseType,
        categoryId: peer.categoryId,
        strength: 78,
        reasons: buildSyncedAltReasons(altId, product.id, reverseType),
        evidenceIds: ["ev-catalog-editorial"],
        directional: forwardType !== reverseType,
        ...meta,
      });
    }
  }

  syncedAlternativeRelationships = edges;
  return edges;
}
