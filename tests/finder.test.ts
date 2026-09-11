import { describe, expect, it } from "vitest";
import { SEED_DATES } from "@/content/config";
import type { Product } from "@/domain/products/types";
import type { Recommendation } from "@/domain/recommendations/types";
import type { FinderResponses } from "@/domain/finders/types";
import { runFinder } from "@/domain/finders/engine";
import { evaluateEligibility } from "@/domain/finders/eligibility";
import { normalizeFinderResponses } from "@/domain/finders/normalization";
import {
  encodeFinderShareState,
  decodeFinderShareState,
} from "@/domain/finders/share-state";
import {
  runningShoeFinderDefinition,
  withRegionalBudgetOptions,
} from "@/domain/finders/configs/running-shoe-finder";
import { getFinderDefinition } from "@/domain/finders/repository";
import { getFinderResultsData } from "@/lib/finder/get-finder-results-data";
import { getToolBySlug, getProductsByCategory } from "@/repositories";
import { AFFILIATE_NEUTRALITY } from "@/domain/finders/scoring";

function miniShoe(
  id: string,
  specs: Product["specifications"],
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
    specifications: specs,
    strengths: [],
    weaknesses: [],
    experienceLevels: ["beginner", "intermediate"],
    images: [],
    videos: [],
    offerIds: [],
    evidenceIds: [],
    relatedProductIds: [],
    alternativeProductIds: [],
    status: "published",
    recommendationScore: extras.recommendationScore ?? 50,
    valueScore: extras.valueScore,
    createdAt: SEED_DATES.created,
    updatedAt: SEED_DATES.updated,
    publishedAt: SEED_DATES.published,
    ...extras,
  };
}

const definition = withRegionalBudgetOptions(
  runningShoeFinderDefinition,
  "NL",
);

const baseResponses: FinderResponses = {
  terrain: "road",
  primaryUse: "daily-training",
  distances: ["half"],
  cushioning: "cushioned",
  stability: "not-sure",
  width: "standard",
  experience: "intermediate",
  priorities: ["comfort", "versatility"],
  budget: "150-200",
};

function rec(
  productId: string,
  useCaseId: string,
  score: number,
): Recommendation {
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

describe("Finder personalization ranking", () => {
  it("ranks personalized match above higher generic Kitletics Score", () => {
    // Product A: high overall score, weak daily-training / high-cushion fit
    const productA = miniShoe(
      "product-a-generic-high",
      {
        terrain: ["road"],
        cushionLevel: "minimal",
        stability: "neutral",
        widthOptions: ["standard"],
      },
      { recommendationScore: 94, valueScore: 90 },
    );
    // Product B: lower overall score, strong daily + cushion match
    const productB = miniShoe(
      "product-b-personal-fit",
      {
        terrain: ["road"],
        cushionLevel: "high",
        stability: "neutral",
        widthOptions: ["standard"],
      },
      { recommendationScore: 82, valueScore: 70 },
    );

    const recommendations = [
      rec("product-a-generic-high", "uc-daily-training", 55),
      rec("product-a-generic-high", "uc-half", 50),
      rec("product-b-personal-fit", "uc-daily-training", 95),
      rec("product-b-personal-fit", "uc-half", 92),
    ];

    const result = runFinder({
      definition,
      responses: baseResponses,
      products: [productA, productB],
      recommendations,
      lowestByProduct: {
        "product-a-generic-high": { price: 160, currency: "EUR" },
        "product-b-personal-fit": { price: 155, currency: "EUR" },
      },
      region: "NL",
    });

    expect(result.rankedResults[0]?.productId).toBe("product-b-personal-fit");
    expect(result.rankedResults[0]!.matchScore).toBeGreaterThan(
      result.rankedResults[1]!.matchScore,
    );
    expect(AFFILIATE_NEUTRALITY).toContain("never");
  });

  it("changes ranking when comfort vs speed priorities differ", () => {
    const plush = miniShoe("plush-shoe", {
      terrain: ["road"],
      cushionLevel: "maximum",
      widthOptions: ["standard"],
      stability: "neutral",
    });
    const speedy = miniShoe("speedy-shoe", {
      terrain: ["road"],
      cushionLevel: "minimal",
      widthOptions: ["standard"],
      stability: "neutral",
    });
    const recommendations = [
      rec("plush-shoe", "uc-daily-training", 88),
      rec("plush-shoe", "uc-tempo-runs", 55),
      rec("speedy-shoe", "uc-daily-training", 60),
      rec("speedy-shoe", "uc-tempo-runs", 95),
    ];
    const prices = {
      "plush-shoe": { price: 160, currency: "EUR" },
      "speedy-shoe": { price: 160, currency: "EUR" },
    };

    const comfortRun = runFinder({
      definition,
      responses: {
        ...baseResponses,
        primaryUse: "daily-training",
        cushioning: "maximum",
        priorities: ["comfort", "cushioning"],
      },
      products: [plush, speedy],
      recommendations,
      lowestByProduct: prices,
    });

    const speedRun = runFinder({
      definition,
      responses: {
        ...baseResponses,
        primaryUse: "tempo",
        cushioning: "minimal",
        priorities: ["speed"],
      },
      products: [plush, speedy],
      recommendations,
      lowestByProduct: prices,
    });

    expect(comfortRun.rankedResults[0]?.productId).toBe("plush-shoe");
    expect(speedRun.rankedResults[0]?.productId).toBe("speedy-shoe");
  });
});

describe("Finder eligibility", () => {
  it("excludes road-only shoe for trail requirement", () => {
    const road = miniShoe("road-only", {
      terrain: ["road"],
      widthOptions: ["standard"],
    });
    const profile = normalizeFinderResponses(
      definition,
      { ...baseResponses, terrain: "trail" },
      "NL",
    );
    const result = evaluateEligibility(road, profile);
    expect(result.eligible).toBe(false);
    expect(result.exclusions.some((e) => e.ruleId === "terrain-trail")).toBe(
      true,
    );
  });

  it("excludes known incompatible width when extra-wide required", () => {
    const narrowOnly = miniShoe("narrow-fit", {
      terrain: ["road"],
      widthOptions: ["standard"],
    });
    const profile = normalizeFinderResponses(
      definition,
      { ...baseResponses, width: "extra-wide" },
      "NL",
    );
    const result = evaluateEligibility(narrowOnly, profile);
    expect(result.eligible).toBe(false);
    expect(result.exclusions.some((e) => e.ruleId === "width-required")).toBe(
      true,
    );
  });

  it("does not hard-exclude unknown width", () => {
    const unknownWidth = miniShoe("unknown-width", {
      terrain: ["road"],
    });
    const profile = normalizeFinderResponses(
      definition,
      { ...baseResponses, width: "extra-wide" },
      "NL",
    );
    expect(evaluateEligibility(unknownWidth, profile).eligible).toBe(true);
  });

  it("excludes unpublished and discontinued products", () => {
    const unpublished = miniShoe(
      "draft",
      { terrain: ["road"], widthOptions: ["standard"] },
      { status: "draft" },
    );
    const discontinued = miniShoe(
      "dead",
      { terrain: ["road"], widthOptions: ["standard"] },
      { lifecycleStatus: "discontinued" },
    );
    const profile = normalizeFinderResponses(definition, baseResponses, "NL");
    expect(evaluateEligibility(unpublished, profile).eligible).toBe(false);
    expect(evaluateEligibility(discontinued, profile).eligible).toBe(false);
  });

  it("excludes upcoming products", () => {
    const upcoming = miniShoe(
      "soon",
      { terrain: ["road"], widthOptions: ["standard"] },
      { lifecycleStatus: "upcoming" },
    );
    const profile = normalizeFinderResponses(definition, baseResponses, "NL");
    expect(evaluateEligibility(upcoming, profile).eligible).toBe(false);
  });
});

describe("Finder missing data", () => {
  it("does not treat missing cushion as score 0", () => {
    const sparse = miniShoe("sparse", {
      terrain: ["road"],
      widthOptions: ["standard"],
    });
    const result = runFinder({
      definition,
      responses: baseResponses,
      products: [sparse],
      recommendations: [rec("sparse", "uc-daily-training", 80)],
      lowestByProduct: {
        sparse: { price: 150, currency: "EUR" },
      },
    });
    const cushion = result.rankedResults[0]?.factorScores.find(
      (f) => f.factor === "cushioning",
    );
    expect(cushion).toBeDefined();
    expect(cushion!.score).toBeGreaterThan(0);
    expect(cushion!.confidence).toBe("unknown");
  });

  it("keeps products without offers eligible with uncertain budget score", () => {
    const noOffer = miniShoe("no-offer", {
      terrain: ["road"],
      cushionLevel: "high",
      widthOptions: ["standard"],
    });
    const result = runFinder({
      definition,
      responses: baseResponses,
      products: [noOffer],
      recommendations: [rec("no-offer", "uc-daily-training", 90)],
      lowestByProduct: {},
    });
    expect(result.rankedResults[0]?.eligible).toBe(true);
    const budget = result.rankedResults[0]?.factorScores.find(
      (f) => f.factor === "budget",
    );
    expect(budget?.confidence).toBe("unknown");
    expect(budget!.score).toBeGreaterThan(0);
  });
});

describe("Finder budget scoring", () => {
  it("scores within / slight over / far over differently", () => {
    const shoe = miniShoe("priced", {
      terrain: ["road"],
      cushionLevel: "high",
      widthOptions: ["standard"],
    });
    const recs = [rec("priced", "uc-daily-training", 90)];

    const within = runFinder({
      definition,
      responses: { ...baseResponses, budget: "150-200" },
      products: [shoe],
      recommendations: recs,
      lowestByProduct: { priced: { price: 160, currency: "EUR" } },
    });
    const slight = runFinder({
      definition,
      responses: { ...baseResponses, budget: "100-150" },
      products: [shoe],
      recommendations: recs,
      lowestByProduct: { priced: { price: 165, currency: "EUR" } },
    });
    const far = runFinder({
      definition,
      responses: { ...baseResponses, budget: "under-100" },
      products: [shoe],
      recommendations: recs,
      lowestByProduct: { priced: { price: 180, currency: "EUR" } },
    });

    const bWithin = within.rankedResults[0]!.factorScores.find(
      (f) => f.factor === "budget",
    )!.score;
    const bSlight = slight.rankedResults[0]!.factorScores.find(
      (f) => f.factor === "budget",
    )!.score;
    const bFar = far.rankedResults[0]!.factorScores.find(
      (f) => f.factor === "budget",
    )!.score;

    expect(bWithin).toBeGreaterThan(bSlight);
    expect(bSlight).toBeGreaterThan(bFar);
  });

  it("does not compare mismatched currencies", () => {
    const shoe = miniShoe("fx", {
      terrain: ["road"],
      cushionLevel: "high",
      widthOptions: ["standard"],
    });
    const result = runFinder({
      definition,
      responses: baseResponses,
      products: [shoe],
      recommendations: [rec("fx", "uc-daily-training", 90)],
      lowestByProduct: { fx: { price: 140, currency: "USD" } },
      region: "NL",
    });
    const budget = result.rankedResults[0]!.factorScores.find(
      (f) => f.factor === "budget",
    )!;
    expect(budget.confidence).toBe("unknown");
  });
});

describe("Finder share state", () => {
  it("encodes and decodes round-trip without weight", () => {
    const encoded = encodeFinderShareState(definition, {
      ...baseResponses,
      weight: { value: 89, unit: "kg" },
    });
    const decoded = decodeFinderShareState(encoded, "running-shoe-finder");
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.responses.terrain).toBe("road");
    expect(decoded.responses.weight).toBeUndefined();
    expect(decoded.state.v).toBe("v1");
  });

  it("rejects invalid payloads", () => {
    expect(decodeFinderShareState("not-valid!!!").ok).toBe(false);
  });

  it("rejects wrong finder slug", () => {
    const encoded = encodeFinderShareState(definition, baseResponses);
    const decoded = decodeFinderShareState(encoded, "padel-racket-finder");
    expect(decoded.ok).toBe(false);
  });

  it("strips tampered weight from decoded state", () => {
    const json = JSON.stringify({
      v: "v1",
      f: "running-shoe-finder",
      r: { terrain: "road", weight: 99 },
    });
    const encoded = Buffer.from(json, "utf8").toString("base64url");
    const decoded = decodeFinderShareState(encoded, "running-shoe-finder");
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.responses.weight).toBeUndefined();
  });
});

describe("Finder golden catalog scenarios", () => {
  it("road beginner comfort daily training returns strong road matches", () => {
    const data = getFinderResultsData({
      finderSlug: "running-shoe-finder",
      responses: {
        terrain: "road",
        primaryUse: "daily-training",
        distances: ["5k", "10k"],
        cushioning: "cushioned",
        stability: "not-sure",
        width: "standard",
        experience: "beginner",
        priorities: ["comfort", "value"],
        budget: "no-limit",
      },
      region: "NL",
      options: { isDev: false },
    });
    expect(data).toBeDefined();
    expect(data!.rows.length).toBeGreaterThan(0);
    for (const row of data!.rows) {
      const terrains = row.product.specifications.terrain;
      const list = Array.isArray(terrains) ? terrains : [terrains];
      expect(list.some((t) => t === "road" || t === "treadmill" || t === "mixed")).toBe(
        true,
      );
    }
  });

  it("trail requirement only keeps trail-capable shoes", () => {
    const data = getFinderResultsData({
      finderSlug: "running-shoe-finder",
      responses: {
        ...baseResponses,
        terrain: "trail",
        primaryUse: "long-runs",
        priorities: ["grip", "durability"],
        budget: "no-limit",
      },
      region: "NL",
      options: { isDev: false },
    });
    expect(data).toBeDefined();
    for (const row of data!.rows) {
      const terrains = row.product.specifications.terrain as string[] | string;
      const list = Array.isArray(terrains) ? terrains : [String(terrains)];
      expect(list.some((t) => t === "trail" || t === "mixed")).toBe(true);
    }
  });

  it("extra-wide requirement only keeps compatible widths when known", () => {
    const data = getFinderResultsData({
      finderSlug: "running-shoe-finder",
      responses: {
        ...baseResponses,
        width: "extra-wide",
        budget: "no-limit",
      },
      region: "NL",
      options: { isDev: false },
    });
    expect(data).toBeDefined();
    for (const row of data!.rows) {
      const widths = row.product.specifications.widthOptions;
      if (!widths) continue;
      const list = Array.isArray(widths) ? widths.map(String) : [String(widths)];
      expect(list.includes("extra-wide")).toBe(true);
    }
  });

  it("is deterministic for same answers", () => {
    const responses = { ...baseResponses };
    const a = getFinderResultsData({
      finderSlug: "running-shoe-finder",
      responses,
      region: "NL",
    });
    const b = getFinderResultsData({
      finderSlug: "running-shoe-finder",
      responses,
      region: "NL",
    });
    expect(a!.rows.map((r) => r.product.id)).toEqual(
      b!.rows.map((r) => r.product.id),
    );
    expect(a!.rows.map((r) => r.evaluation.matchScore)).toEqual(
      b!.rows.map((r) => r.evaluation.matchScore),
    );
  });
});

describe("Finder publication & integration", () => {
  it("publishes the Running Shoe Finder tool", () => {
    const tool = getToolBySlug("running-shoe-finder", { isDev: false });
    expect(tool?.status).toBe("published");
    expect(tool?.available).toBe(true);
    expect(getFinderDefinition("running-shoe-finder")).toBeDefined();
  });

  it("does not return unpublished products in results", () => {
    const products = getProductsByCategory("cat-running-shoes", {
      isDev: false,
    });
    expect(products.every((p) => p.status === "published")).toBe(true);
  });

  it("normalizes profile without exposing weight in share encoding", () => {
    const profile = normalizeFinderResponses(
      definition,
      { ...baseResponses, weight: { value: 200, unit: "lb" } },
      "NL",
    );
    expect(profile.weightKg).toBeGreaterThan(80);
    const encoded = encodeFinderShareState(definition, {
      ...baseResponses,
      weight: { value: 200, unit: "lb" },
    });
    expect(encoded.includes("200")).toBe(false);
  });
});
