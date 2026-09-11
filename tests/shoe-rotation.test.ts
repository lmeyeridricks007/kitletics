import { describe, expect, it } from "vitest";
import { SEED_DATES } from "@/content/config";
import type { Product } from "@/domain/products/types";
import type { Recommendation } from "@/domain/recommendations/types";
import { normalizeRotationResponses } from "@/domain/shoe-rotation/normalization";
import { runRotationPlanner, AFFILIATE_NEUTRALITY } from "@/domain/shoe-rotation/engine";
import {
  encodeRotationShareState,
  decodeRotationShareState,
} from "@/domain/shoe-rotation/share-state";
import { computeRoleCoverage, weightedCoverageScore } from "@/domain/shoe-rotation/coverage";
import { buildProductRoleProfile } from "@/domain/shoe-rotation/suitability";
import { getToolBySlug } from "@/repositories";
import { getRotationResultsData } from "@/lib/rotation/get-rotation-results-data";
import type { RotationProfile } from "@/domain/shoe-rotation/types";

function miniShoe(
  id: string,
  extras: Partial<Product> = {},
): Product {
  return {
    id,
    slug: id,
    brandId: "brand-asics",
    name: id,
    fullName: id,
    shortDescription: "",
    lifecycleStatus: "current",
    sportIds: ["sport-running"],
    disciplineIds: [],
    categoryId: "cat-running-shoes",
    subcategoryIds: [],
    useCaseIds: [],
    specifications: { terrain: ["road"] },
    strengths: [],
    weaknesses: [],
    experienceLevels: [],
    images: [],
    videos: [],
    offerIds: [],
    evidenceIds: [],
    relatedProductIds: [],
    alternativeProductIds: [],
    status: "published",
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
    publishedAt: SEED_DATES.published,
    ...extras,
  };
}

function rec(productId: string, useCaseId: string, score: number): Recommendation {
  return {
    id: `rec-${productId}-${useCaseId}`,
    productId,
    sportId: "sport-running",
    useCaseId,
    score,
    factors: [],
    strengths: [],
    compromises: [],
    explanation: "",
    evidenceIds: [],
  };
}

const baseProfile = (): RotationProfile =>
  normalizeRotationResponses({
    mode: "from-scratch",
    trainingTypes: ["daily-mileage", "long-runs", "racing"],
    priorities: ["versatility"],
    desiredSize: 2,
    budgetBandId: "no-limit",
    ownedProductIds: [],
    manualShoes: [],
    terrain: "road",
  });

describe("Rotation complementarity (non-negotiable)", () => {
  it("prefers A+C over A+B for Daily+Long+Race two-shoe rotation", () => {
    const productA = miniShoe("product-a");
    const productB = miniShoe("product-b");
    const productC = miniShoe("product-c");

    const recommendations = [
      rec("product-a", "uc-daily-training", 95),
      rec("product-a", "uc-long-runs", 94),
      rec("product-a", "uc-marathon", 60),
      rec("product-b", "uc-daily-training", 94),
      rec("product-b", "uc-long-runs", 93),
      rec("product-b", "uc-marathon", 62),
      rec("product-c", "uc-daily-training", 80),
      rec("product-c", "uc-long-runs", 78),
      rec("product-c", "uc-marathon", 96),
    ];

    const result = runRotationPlanner({
      profile: baseProfile(),
      products: [productA, productB, productC],
      recommendations,
      lowestByProduct: {
        "product-a": { price: 150, currency: "EUR" },
        "product-b": { price: 150, currency: "EUR" },
        "product-c": { price: 160, currency: "EUR" },
      },
    });

    const ids = new Set(result.recommendedProductIds);
    expect(ids.has("product-a")).toBe(true);
    expect(ids.has("product-c")).toBe(true);
    expect(ids.has("product-b")).toBe(false);
    expect(AFFILIATE_NEUTRALITY).toContain("never");
  });

  it("recommends race complement when owning a daily shoe", () => {
    const productA = miniShoe("owned-daily");
    const productB = miniShoe("similar-daily");
    const productC = miniShoe("race-shoe");

    const recommendations = [
      rec("owned-daily", "uc-daily-training", 95),
      rec("owned-daily", "uc-long-runs", 94),
      rec("owned-daily", "uc-marathon", 60),
      rec("similar-daily", "uc-daily-training", 94),
      rec("similar-daily", "uc-long-runs", 93),
      rec("similar-daily", "uc-marathon", 62),
      rec("race-shoe", "uc-daily-training", 80),
      rec("race-shoe", "uc-long-runs", 78),
      rec("race-shoe", "uc-marathon", 96),
    ];

    const profile = normalizeRotationResponses({
      mode: "improve",
      trainingTypes: ["daily-mileage", "long-runs", "racing"],
      priorities: ["race-performance"],
      maxAdditions: 1,
      budgetBandId: "no-limit",
      ownedProductIds: ["owned-daily"],
      manualShoes: [],
      terrain: "road",
    });

    const result = runRotationPlanner({
      profile,
      products: [productA, productB, productC],
      recommendations,
      lowestByProduct: {},
    });

    expect(result.additions[0]?.productId).toBe("race-shoe");
  });
});

describe("Rotation size & coverage", () => {
  it("returns 1-shoe when one product covers all roles and minimal preferred", () => {
    const versatile = miniShoe("versatile-one");
    const recommendations = [
      rec("versatile-one", "uc-daily-training", 94),
      rec("versatile-one", "uc-long-runs", 92),
      rec("versatile-one", "uc-marathon", 88),
    ];

    const profile = normalizeRotationResponses({
      mode: "from-scratch",
      trainingTypes: ["daily-mileage", "long-runs", "racing"],
      priorities: ["minimal-shoes", "versatility"],
      desiredSize: "recommend",
      budgetBandId: "no-limit",
      ownedProductIds: [],
      manualShoes: [],
      terrain: "road",
    });

    const result = runRotationPlanner({
      profile,
      products: [versatile, miniShoe("other")],
      recommendations: [
        ...recommendations,
        rec("other", "uc-daily-training", 70),
        rec("other", "uc-long-runs", 70),
        rec("other", "uc-marathon", 70),
      ],
      lowestByProduct: {},
    });

    expect(result.recommendedSize).toBe(1);
    expect(result.recommendedProductIds).toEqual(["versatile-one"]);
  });

  it("does not treat missing prices as zero", () => {
    const a = miniShoe("priced");
    const b = miniShoe("unpriced");
    const recommendations = [
      rec("priced", "uc-daily-training", 90),
      rec("priced", "uc-long-runs", 88),
      rec("unpriced", "uc-daily-training", 91),
      rec("unpriced", "uc-long-runs", 89),
    ];
    const profile = normalizeRotationResponses({
      mode: "from-scratch",
      trainingTypes: ["daily-mileage", "long-runs"],
      priorities: ["value"],
      desiredSize: 1,
      budgetBandId: "under-150",
      ownedProductIds: [],
      manualShoes: [],
      terrain: "road",
    });

    const result = runRotationPlanner({
      profile,
      products: [a, b],
      recommendations,
      lowestByProduct: {
        priced: { price: 140, currency: "EUR" },
      },
    });

    const unpricedSet = result.primarySet;
    // If unpriced wins on coverage alone, missingPriceCount must be tracked
    if (result.recommendedProductIds.includes("unpriced")) {
      expect(unpricedSet.missingPriceCount).toBeGreaterThan(0);
      expect(unpricedSet.estimatedCost).toBeUndefined();
    } else {
      expect(result.recommendedProductIds).toContain("priced");
    }
  });
});

describe("Trail & share state", () => {
  it("requires trail coverage for trail terrain", () => {
    const road = miniShoe("road-shoe", {
      specifications: { terrain: ["road"] },
    });
    const trail = miniShoe("trail-shoe", {
      specifications: { terrain: ["trail"] },
    });
    const recommendations = [
      rec("road-shoe", "uc-daily-training", 95),
      rec("road-shoe", "uc-trail-training", 18),
      rec("trail-shoe", "uc-daily-training", 70),
      rec("trail-shoe", "uc-trail-training", 94),
    ];
    const profile = normalizeRotationResponses({
      mode: "from-scratch",
      trainingTypes: ["daily-mileage", "trail"],
      priorities: ["versatility"],
      desiredSize: 2,
      budgetBandId: "no-limit",
      ownedProductIds: [],
      manualShoes: [],
      terrain: "both",
    });

    const result = runRotationPlanner({
      profile,
      products: [road, trail],
      recommendations,
      lowestByProduct: {},
    });

    expect(result.recommendedProductIds).toContain("trail-shoe");
    const trailCov = result.primarySet.roleCoverage.find(
      (c) => c.roleId === "trail",
    );
    expect(trailCov?.bestCoverage).toBeGreaterThanOrEqual(80);
  });

  it("encodes and decodes share state", () => {
    const encoded = encodeRotationShareState({
      mode: "improve",
      trainingTypes: ["daily-mileage", "racing"],
      priorities: ["race-performance"],
      ownedProductIds: ["prod-novablast-5"],
      manualShoes: [],
      desiredSize: 2,
      budgetBandId: "150-250",
      terrain: "road",
    });
    const decoded = decodeRotationShareState(encoded);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.responses.mode).toBe("improve");
    expect(decoded.responses.ownedProductIds).toContain("prod-novablast-5");
  });
});

describe("Coverage helpers", () => {
  it("uses max suitability per role (not sum)", () => {
    const profile = baseProfile();
    const a = buildProductRoleProfile(
      miniShoe("a"),
      [rec("a", "uc-daily-training", 90), rec("a", "uc-long-runs", 85)],
      profile,
    );
    const b = buildProductRoleProfile(
      miniShoe("b"),
      [rec("b", "uc-daily-training", 88), rec("b", "uc-long-runs", 80)],
      profile,
    );
    const coverage = computeRoleCoverage([a, b], profile);
    const daily = coverage.find((c) => c.roleId === "daily");
    expect(daily?.bestCoverage).toBe(90);
    expect(weightedCoverageScore(coverage)).toBeGreaterThan(0);
  });
});

describe("Publication & catalog integration", () => {
  it("publishes the rotation planner tool", () => {
    const tool = getToolBySlug("shoe-rotation-planner", { isDev: false });
    expect(tool?.available).toBe(true);
    expect(tool?.type).toBe("planner");
  });

  it("returns results from catalog for a from-scratch flow", () => {
    const data = getRotationResultsData({
      responses: {
        mode: "from-scratch",
        trainingTypes: ["daily-mileage", "long-runs"],
        priorities: ["comfort", "versatility"],
        desiredSize: 2,
        budgetBandId: "no-limit",
        ownedProductIds: [],
        manualShoes: [],
        terrain: "road",
      },
      region: "NL",
      options: { isDev: false },
    });
    expect(data).toBeDefined();
    expect(data!.recommendedCards.length).toBeGreaterThan(0);
    expect(
      data!.recommendedCards.every((c) => c.product.status === "published"),
    ).toBe(true);
  });
});
