import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import {
  resolvePublished,
  resolvePublishedById,
  resolvePublishedBySlug,
} from "@/lib/publishing/resolver";
import { evidence as rawEvidence } from "@/content/evidence";
import {
  alternatives as rawAlternatives,
  recommendations as rawRecommendations,
} from "@/content/recommendations";
import type {
  AlternativeRelationship,
  Evidence,
  Recommendation,
} from "@/domain/recommendations/types";
import {
  getAllProductRelationships,
  getAlternativesFromGraph,
  toLegacyAlternative,
} from "@/repositories/relationships";
import { isAlternativeType } from "@/domain/relationships/types";

export function getEvidence(): Evidence[] {
  return [...rawEvidence];
}

export function getEvidenceById(id: string): Evidence | undefined {
  return rawEvidence.find((e) => e.id === id);
}

export function getEvidenceForIds(ids: string[]): Evidence[] {
  return ids
    .map((id) => getEvidenceById(id))
    .filter((e): e is Evidence => Boolean(e));
}

export function getRecommendations(): Recommendation[] {
  return [...rawRecommendations];
}

export function getRecommendationById(
  id: string,
): Recommendation | undefined {
  return rawRecommendations.find((r) => r.id === id);
}

export function getRecommendationsForProduct(
  productId: string,
): Recommendation[] {
  return rawRecommendations.filter((r) => r.productId === productId);
}

export function getRecommendationsForUseCase(
  useCaseId: string,
): Recommendation[] {
  return rawRecommendations
    .filter((r) => r.useCaseId === useCaseId)
    .sort((a, b) => b.score - a.score);
}

export function getRecommendationForProductUseCase(
  productId: string,
  useCaseId: string,
): Recommendation | undefined {
  return rawRecommendations.find(
    (r) => r.productId === productId && r.useCaseId === useCaseId,
  );
}

/**
 * Alternatives for Product pages / Finder.
 * Priority: approved graph edges (ALTERNATIVE + direct-competitor), then legacy.
 */
export function getAlternatives(): AlternativeRelationship[] {
  const fromGraph = getAllProductRelationships()
    .filter((r) => r.status === "approved" && isAlternativeType(r.type))
    .map(toLegacyAlternative);

  const seen = new Set(
    fromGraph.map(
      (a) => `${a.sourceProductId}|${a.alternativeProductId}|${a.relationshipType}`,
    ),
  );
  const merged = [...fromGraph];
  for (const alt of rawAlternatives) {
    const key = `${alt.sourceProductId}|${alt.alternativeProductId}|${alt.relationshipType}`;
    if (!seen.has(key)) merged.push(alt);
  }
  return merged;
}

export function getAlternativesForProduct(
  productId: string,
): AlternativeRelationship[] {
  const graph = getAlternativesFromGraph(productId).map(toLegacyAlternative);
  const seen = new Set(
    graph.map((a) => `${a.alternativeProductId}|${a.relationshipType}`),
  );
  const extras = rawAlternatives.filter((a) => {
    if (a.sourceProductId !== productId) return false;
    return !seen.has(`${a.alternativeProductId}|${a.relationshipType}`);
  });
  return [...graph, ...extras].sort(
    (a, b) => b.similarityScore - a.similarityScore,
  );
}

export type { PublishResolverOptions };
export {
  resolvePublished,
  resolvePublishedById,
  resolvePublishedBySlug,
};
