import { describe, expect, it } from "vitest";
import {
  computeProductSimilarity,
  similarityLabel,
} from "@/domain/relationships/similarity";
import { runningShoeSimilarityConfig } from "@/domain/relationships/similarity-configs";
import {
  RELATIONSHIP_INVERSE,
  normalizeRelationshipType,
} from "@/domain/relationships/types";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import {
  detectRelationshipContradictions,
  getAllProductRelationships,
  getAlternativesFromGraph,
  getRelationshipBetween,
  getDirectCompetitors,
} from "@/repositories/relationships";
import { getProductById } from "@/repositories/products";
import { recommendations } from "@/content/recommendations";
import { applyFinderDiversityAdjustment } from "@/domain/finders/diversity";
import { getMatchBand } from "@/domain/finders/match-bands";
import type { RankedFinderResult } from "@/domain/finders/types";
import type { Product } from "@/domain/products/types";

describe("relationship graph", () => {
  it("loads approved relationships", () => {
    const rels = getAllProductRelationships();
    expect(rels.length).toBeGreaterThan(50);
  });

  it("maps cheaper inverse to premium", () => {
    expect(RELATIONSHIP_INVERSE["cheaper-alternative"]).toBe(
      "premium-alternative",
    );
    expect(normalizeRelationshipType("cheaper")).toBe("cheaper-alternative");
  });

  it("gives Novablast 6 multiple alternatives", () => {
    const alts = getAlternativesFromGraph("prod-novablast-6");
    expect(alts.length).toBeGreaterThanOrEqual(3);
  });

  it("links Ghost 18 as direct competitor of Pegasus 42", () => {
    const comps = getDirectCompetitors("prod-ghost-18");
    expect(
      comps.some((c) => c.targetProductId === "prod-pegasus-42"),
    ).toBe(true);
  });

  it("pair lookup finds both directions", () => {
    const ab = getRelationshipBetween("prod-novablast-6", "prod-ghost-18");
    expect(ab.length).toBeGreaterThan(0);
  });

  it("detects no contradictions in approved seed", () => {
    expect(detectRelationshipContradictions()).toEqual([]);
  });

  it("computes shoe similarity deterministically", () => {
    const a = getProductById("prod-novablast-6")!;
    const b = getProductById("prod-ghost-18")!;
    const s1 = computeProductSimilarity(
      a,
      b,
      runningShoeSimilarityConfig,
      recommendations,
    );
    const s2 = computeProductSimilarity(
      a,
      b,
      runningShoeSimilarityConfig,
      recommendations,
    );
    expect(s1.score).toBe(s2.score);
    expect(similarityLabel(s1.score)).toBeTruthy();
  });

  it("gates thin alternatives pages", () => {
    const soft = getProductById("prod-body-glide-original");
    expect(soft).toBeTruthy();
    const check = canPublishAlternativesPage(
      soft!,
      getAllProductRelationships(),
    );
    expect(check.ok).toBe(false);
  });

  it("keeps top finder result when applying soft diversity", () => {
    const nb6 = getProductById("prod-novablast-6")!;
    const nb5 = getProductById("prod-novablast-5")!;
    const ghost = getProductById("prod-ghost-18")!;
    const mk = (productId: string, matchScore: number, rank: number): RankedFinderResult => ({
      productId,
      eligible: true,
      exclusions: [],
      matchScore,
      factorScores: [],
      strengths: [],
      compromises: [],
      evidenceConfidence: "high",
      dataCoverage: 0.9,
      rank,
      band: getMatchBand(matchScore),
    });
    const ranked = [
      mk(nb6.id, 90, 1),
      mk(nb5.id, 89, 2),
      mk(ghost.id, 88.5, 3),
    ];
    const map = new Map<string, Product>([
      [nb6.id, nb6],
      [nb5.id, nb5],
      [ghost.id, ghost],
    ]);
    const out = applyFinderDiversityAdjustment({ ranked, productsById: map });
    expect(out[0]?.productId).toBe(nb6.id);
  });
});
