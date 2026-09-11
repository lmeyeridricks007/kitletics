import type { AlternativeRelationship } from "@/domain/recommendations/types";
import type {
  ProductRelationship,
  ProductRelationshipType,
} from "@/domain/relationships/types";
import {
  RELATIONSHIP_INVERSE,
  isAlternativeType,
  normalizeRelationshipType,
} from "@/domain/relationships/types";
import { productRelationships as rawRelationships } from "@/content/running/relationships";
import {
  getSyncedAlternativeRelationships,
  buildSyncedAltReasons,
} from "@/content/running/decision-graph-alt-sync";
import { racketProductRelationships } from "@/content/racket";
import { alternatives as legacyAlternatives } from "@/content/recommendations";
import { SEED_DATES } from "@/content/config";
import { products } from "@/content/products";
import {
  alternativeReasonsNeedEnrichment,
  ensureDiverseAlternativeTypes,
} from "@/content/alternatives-p65-completion";

function legacyToRelationship(alt: AlternativeRelationship): ProductRelationship {
  const type = normalizeRelationshipType(
    alt.relationshipType as ProductRelationshipType,
  );
  return {
    id: alt.id,
    sourceProductId: alt.sourceProductId,
    targetProductId: alt.alternativeProductId,
    type,
    strength: alt.similarityScore,
    reasons: alt.reasons,
    directional: type !== "similar" && type !== "direct-competitor",
    status: "approved",
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
    lastVerifiedAt: SEED_DATES.verified,
  };
}

/** Approved graph edges: Prompt 15 store + synced catalog alts + migrated legacy alternatives (deduped). */
let allProductRelationshipsCache: ProductRelationship[] | undefined;

function finalizeAlternativeGraph(
  rels: ProductRelationship[],
): ProductRelationship[] {
  const byProduct = new Map(products.map((p) => [p.id, p]));
  const enriched = rels.map((r) => {
    if (r.status !== "approved" || !isAlternativeType(r.type)) return r;
    if (!alternativeReasonsNeedEnrichment(r.reasons)) return r;
    return {
      ...r,
      reasons: buildSyncedAltReasons(r.sourceProductId, r.targetProductId, r.type),
    };
  });

  const rest: ProductRelationship[] = [];
  const bySource = new Map<string, ProductRelationship[]>();
  for (const r of enriched) {
    if (r.status === "approved" && isAlternativeType(r.type)) {
      const list = bySource.get(r.sourceProductId) ?? [];
      list.push(r);
      bySource.set(r.sourceProductId, list);
    } else {
      rest.push(r);
    }
  }

  const out: ProductRelationship[] = [...rest];
  for (const [sourceId, list] of bySource) {
    const source = byProduct.get(sourceId);
    const types = new Set(list.map((r) => r.type));
    if (!source || types.size >= 2) {
      out.push(...list);
      continue;
    }
    const peers = list
      .map((r) => byProduct.get(r.targetProductId))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    if (peers.length !== list.length) {
      out.push(...list);
      continue;
    }
    const nextTypes = ensureDiverseAlternativeTypes(
      source,
      peers,
      list.map((r) => r.type),
    );
    list.forEach((r, i) => {
      const type = nextTypes[i]!;
      if (type === r.type) {
        out.push(r);
        return;
      }
      const target = byProduct.get(r.targetProductId)!;
      out.push({
        ...r,
        type,
        reasons: buildSyncedAltReasons(source.id, target.id, type),
      });
    });
  }
  return out;
}

export function getAllProductRelationships(): ProductRelationship[] {
  if (allProductRelationshipsCache) return allProductRelationshipsCache;

  const byKey = new Map<string, ProductRelationship>();
  for (const r of [
    ...rawRelationships,
    ...racketProductRelationships,
    ...getSyncedAlternativeRelationships(),
  ]) {
    if (r.status === "deprecated") continue;
    byKey.set(`${r.sourceProductId}|${r.targetProductId}|${r.type}`, r);
  }
  for (const alt of legacyAlternatives) {
    const r = legacyToRelationship(alt);
    const key = `${r.sourceProductId}|${r.targetProductId}|${r.type}`;
    if (!byKey.has(key)) byKey.set(key, r);
  }
  allProductRelationshipsCache = finalizeAlternativeGraph([...byKey.values()]);
  return allProductRelationshipsCache;
}

export function getProductRelationships(
  productId: string,
): ProductRelationship[] {
  return getAllProductRelationships().filter(
    (r) => r.sourceProductId === productId || r.targetProductId === productId,
  );
}

export function getRelatedProducts(
  productId: string,
  types?: ProductRelationshipType[],
): ProductRelationship[] {
  return getAllProductRelationships().filter((r) => {
    if (r.sourceProductId !== productId) return false;
    if (types && !types.includes(r.type)) return false;
    return r.status === "approved";
  });
}

export function getAlternativesFromGraph(
  productId: string,
): ProductRelationship[] {
  return getRelatedProducts(productId).filter((r) => isAlternativeType(r.type));
}

export function getDirectCompetitors(
  productId: string,
): ProductRelationship[] {
  return getRelatedProducts(productId, ["direct-competitor"]);
}

export function getGenerationRelationships(
  productId: string,
): ProductRelationship[] {
  return getRelatedProducts(productId, [
    "previous-generation",
    "next-generation",
  ]);
}

export function getComparisonCandidateRelationships(
  productId: string,
): ProductRelationship[] {
  return getRelatedProducts(productId, [
    "comparison-candidate",
    "direct-competitor",
  ]);
}

export function getRotationComplements(
  productId: string,
): ProductRelationship[] {
  return getRelatedProducts(productId, [
    "rotation-complement",
    "complements",
  ]);
}

export function getCompatibleProducts(
  productId: string,
): ProductRelationship[] {
  return getRelatedProducts(productId, ["compatible-with"]);
}

export function getRelationshipBetween(
  productAId: string,
  productBId: string,
): ProductRelationship[] {
  return getAllProductRelationships().filter(
    (r) =>
      (r.sourceProductId === productAId && r.targetProductId === productBId) ||
      (r.sourceProductId === productBId && r.targetProductId === productAId),
  );
}

/** Map graph alternatives to legacy AlternativeRelationship shape for existing UI. */
export function toLegacyAlternative(
  r: ProductRelationship,
): AlternativeRelationship {
  const typeMap: Record<string, AlternativeRelationship["relationshipType"]> = {
    "cheaper-alternative": "cheaper",
    "premium-alternative": "premium",
    "lighter-alternative": "lighter",
    "trail-alternative": "trail-capable",
    faster: "faster",
    "more-responsive": "faster",
    "more-cushioned": "more-cushioned",
    "more-stable": "more-stable",
    "better-value": "better-value",
    "beginner-friendly": "beginner-friendly",
    similar: "better-value",
    "direct-competitor": "better-value",
    "daily-training-alternative": "better-value",
    "long-run-alternative": "more-cushioned",
    "race-focused-alternative": "faster",
    "previous-generation": "better-value",
    "next-generation": "premium",
  };
  return {
    id: r.id,
    sourceProductId: r.sourceProductId,
    alternativeProductId: r.targetProductId,
    similarityScore: r.strength ?? 70,
    reasons: r.reasons,
    relationshipType: typeMap[r.type] ?? "better-value",
  };
}

export function detectRelationshipContradictions(
  relationships: ProductRelationship[] = getAllProductRelationships(),
): string[] {
  const issues: string[] = [];
  const byPair = new Map<string, ProductRelationship[]>();
  for (const r of relationships) {
    if (r.status !== "approved") continue;
    const key = `${r.sourceProductId}|${r.targetProductId}`;
    const list = byPair.get(key) ?? [];
    list.push(r);
    byPair.set(key, list);
  }
  for (const [key, list] of byPair) {
    const types = new Set(list.map((r) => normalizeRelationshipType(r.type)));
    if (types.has("cheaper-alternative") && types.has("premium-alternative")) {
      issues.push(`${key}: cheaper and premium both present`);
    }
    if (types.has("more-cushioned")) {
      const [a, b] = key.split("|");
      const reverse = relationships.find(
        (r) =>
          r.sourceProductId === b &&
          r.targetProductId === a &&
          normalizeRelationshipType(r.type) === "more-cushioned" &&
          r.status === "approved",
      );
      if (reverse) issues.push(`${key}: mutual more-cushioned`);
    }
  }
  return issues;
}

export function expectedInverse(
  type: ProductRelationshipType,
): ProductRelationshipType | undefined {
  return RELATIONSHIP_INVERSE[normalizeRelationshipType(type)];
}
