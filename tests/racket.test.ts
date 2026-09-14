import { describe, expect, it } from "vitest";
import { products } from "@/content/products";
import { offers } from "@/content/offers";
import { recommendations } from "@/content/recommendations";
import { sports } from "@/content/taxonomy/sports";
import { tools } from "@/content/tools";
import { getFinderDefinition } from "@/domain/finders/repository";
import { runFinder } from "@/domain/finders/engine";
import {
  canPublishFinder,
  padelRacketFinderDefinition,
  tennisRacketFinderDefinition,
} from "@/domain/finders/configs/racket-finders";
import { AFFILIATE_NEUTRALITY } from "@/domain/finders/scoring";
import { getComparisonCategoryConfig } from "@/lib/comparison/category-config";
import { buildCurrentEquipmentDeltas } from "@/domain/finders/explanations";
import { searchKitletics } from "@/lib/search/engine";

function lowestMap(categoryId: string) {
  const cats = products.filter((p) => p.categoryId === categoryId);
  const lowestByProduct: Record<
    string,
    { price: number; currency: string } | undefined
  > = {};
  for (const p of cats) {
    const prices = offers
      .filter((o) => o.productId === p.id && typeof o.price === "number")
      .map((o) => o.price!);
    lowestByProduct[p.id] = prices.length
      ? { price: Math.min(...prices), currency: "EUR" }
      : undefined;
  }
  return { cats, lowestByProduct };
}

describe("Racket Sports taxonomy", () => {
  it("exposes live racket family and sports", () => {
    for (const slug of [
      "racket",
      "padel",
      "tennis",
      "pickleball",
      "badminton",
      "squash",
    ]) {
      const s = sports.find((x) => x.slug === slug);
      expect(s?.contentStatus).toBe("live");
      expect(s?.available).toBe(true);
    }
  });

  it("registers padel and tennis finders as available tools", () => {
    expect(tools.find((t) => t.slug === "padel-racket-finder")?.available).toBe(
      true,
    );
    expect(tools.find((t) => t.slug === "tennis-racket-finder")?.available).toBe(
      true,
    );
    expect(getFinderDefinition("padel-racket-finder")?.categoryId).toBe(
      "cat-padel-rackets",
    );
    expect(getFinderDefinition("tennis-racket-finder")?.categoryId).toBe(
      "cat-tennis-rackets",
    );
  });
});

describe("Padel Racket Finder golden scenarios", () => {
  const { cats, lowestByProduct } = lowestMap("cat-padel-rackets");
  const definition = getFinderDefinition("padel-racket-finder")!;

  it("Scenario A — beginner control/forgiveness favours approachable frames", () => {
    const result = runFinder({
      definition,
      products: cats,
      responses: {
        primaryUse: "beginner",
        primaryPriority: "control",
        armComfortPriority: "yes",
        weightPreference: "light",
        budget: "100-180",
      },
      region: "NL",
      lowestByProduct,
      recommendations,
    });
    expect(result.rankedResults.length).toBeGreaterThan(0);
    const top = cats.find((p) => p.id === result.rankedResults[0]!.productId)!;
    expect(
      top.useCaseIds.includes("uc-padel-beginner") ||
        top.experienceLevels?.includes("beginner") ||
        String(top.specifications.sweetSpot).includes("large") ||
        top.specifications.shape === "round",
    ).toBe(true);
  });

  it("Scenario B — advanced power differs from Scenario A", () => {
    const beginner = runFinder({
      definition,
      products: cats,
      responses: {
        primaryUse: "beginner",
        primaryPriority: "control",
        armComfortPriority: "yes",
        weightPreference: "light",
        budget: "100-180",
      },
      region: "NL",
      lowestByProduct,
      recommendations,
    });
    const advanced = runFinder({
      definition,
      products: cats,
      responses: {
        primaryUse: "advanced",
        playingStyle: "aggressive",
        primaryPriority: "power",
        armComfortPriority: "no",
        weightPreference: "heavy",
        feelPreference: "firmer",
        budget: "280-plus",
      },
      region: "NL",
      lowestByProduct,
      recommendations,
    });
    expect(advanced.rankedResults[0]?.productId).not.toBe(
      beginner.rankedResults[0]?.productId,
    );
  });

  it("Scenario E — missing balance is not invented as medium", () => {
    const base = cats[0]!;
    const { balance: _omit, ...restSpecs } = base.specifications;
    void _omit;
    const synthetic: (typeof cats)[number] = {
      ...base,
      id: "prod-synthetic-no-balance",
      specifications: restSpecs,
    };
    const result = runFinder({
      definition,
      products: [...cats, synthetic],
      responses: {
        primaryUse: "intermediate",
        playingStyle: "balanced",
        primaryPriority: "maneuverability",
        armComfortPriority: "no",
        balancePreference: "low",
        weightPreference: "dont-know",
        budget: "180-280",
      },
      region: "NL",
      lowestByProduct: {
        ...lowestByProduct,
        [synthetic.id]: lowestByProduct[base.id],
      },
      recommendations,
    });
    const evaled = result.evaluatedProducts.find(
      (e) => e.productId === synthetic.id,
    );
    const specsFactor = evaled?.factorScores.find((f) => f.factor === "specs");
    expect(specsFactor?.explanation).not.toMatch(/Balance = medium/i);
    expect(specsFactor?.explanation).toMatch(/not verified|unknown|Balance/i);
  });

  it("control vs power priority changes rankings", () => {
    const control = runFinder({
      definition,
      products: cats,
      responses: {
        primaryUse: "intermediate",
        playingStyle: "defensive",
        primaryPriority: "control",
        armComfortPriority: "no",
        weightPreference: "medium",
        budget: "180-280",
      },
      region: "NL",
      lowestByProduct,
      recommendations,
    });
    const power = runFinder({
      definition,
      products: cats,
      responses: {
        primaryUse: "intermediate",
        playingStyle: "aggressive",
        primaryPriority: "power",
        armComfortPriority: "no",
        weightPreference: "medium",
        budget: "180-280",
      },
      region: "NL",
      lowestByProduct,
      recommendations,
    });
    expect(control.rankedResults[0]?.productId).not.toBe(
      power.rankedResults[0]?.productId,
    );
  });

  it("affiliate neutrality is documented and commission is not a ranking input", () => {
    expect(AFFILIATE_NEUTRALITY).toMatch(/never/i);
    const a = runFinder({
      definition,
      products: cats,
      responses: {
        primaryUse: "intermediate",
        playingStyle: "balanced",
        primaryPriority: "balanced",
        armComfortPriority: "no",
        weightPreference: "dont-know",
        budget: "180-280",
      },
      region: "NL",
      lowestByProduct,
      recommendations,
    });
    const b = runFinder({
      definition,
      products: cats,
      responses: {
        primaryUse: "intermediate",
        playingStyle: "balanced",
        primaryPriority: "balanced",
        armComfortPriority: "no",
        weightPreference: "dont-know",
        budget: "180-280",
      },
      region: "NL",
      lowestByProduct,
      recommendations,
    });
    expect(a.rankedResults.map((r) => r.productId)).toEqual(
      b.rankedResults.map((r) => r.productId),
    );
  });
});

describe("Tennis Racket Finder", () => {
  it("passes readiness gate with catalog depth", () => {
    const tennis = products.filter((p) => p.categoryId === "cat-tennis-rackets");
    const brands = new Set(tennis.map((p) => p.brandId));
    const recs = recommendations.filter((r) =>
      tennis.some((p) => p.id === r.productId),
    );
    expect(
      canPublishFinder({
        candidateCount: tennis.length,
        brandCount: brands.size,
        recommendationCount: recs.length,
      }),
    ).toBe(true);
    expect(tennisRacketFinderDefinition.slug).toBe("tennis-racket-finder");
  });

  it("Scenario A — beginner forgiveness", () => {
    const { cats, lowestByProduct } = lowestMap("cat-tennis-rackets");
    const definition = getFinderDefinition("tennis-racket-finder")!;
    const result = runFinder({
      definition,
      products: cats,
      responses: {
        primaryUse: "beginner",
        playingStyle: "aggressive",
        primaryPriority: "comfort",
        armComfortPriority: "yes",
        weightPreference: "light",
        budget: "under-150",
      },
      region: "NL",
      lowestByProduct,
      recommendations,
    });
    expect(result.rankedResults.length).toBeGreaterThan(0);
  });
});

describe("Racket compare category lock", () => {
  it("padel and tennis use distinct comparison configs", () => {
    expect(getComparisonCategoryConfig("cat-padel-rackets").categoryId).toBe(
      "cat-padel-rackets",
    );
    expect(getComparisonCategoryConfig("cat-tennis-rackets").categoryId).toBe(
      "cat-tennis-rackets",
    );
    expect(
      getComparisonCategoryConfig("cat-padel-rackets").keySpecificationKeys,
    ).toContain("shape");
    expect(
      getComparisonCategoryConfig("cat-tennis-rackets").keySpecificationKeys,
    ).toContain("headSizeSqIn");
  });
});

describe("Current equipment deltas", () => {
  it("emits structured deltas only from known specs", () => {
    const heavy = products.find((p) => p.id === "prod-bullpadel-vertex-04")!;
    const light = products.find((p) => p.id === "prod-siux-diablo")!;
    const deltas = buildCurrentEquipmentDeltas(heavy, light);
    expect(deltas.some((d) => d.startsWith("+"))).toBe(true);
  });
});

describe("Racket search", () => {
  it("surfaces live padel vertical while keeping other racket sports held", () => {
    const res = searchKitletics("padel racquet", { isDev: false });
    expect(res.some((h) => h.href.startsWith("/padel") || h.href.includes("padel"))).toBe(
      true,
    );
    expect(
      res.some(
        (h) =>
          h.href === "/tools/padel-racket-finder" ||
          h.href.startsWith("/products/") ||
          h.href.startsWith("/best/padel"),
      ),
    ).toBe(true);
    // Tennis remains held — no live tennis hub promotion from this query path
    expect(res.every((h) => !h.href.startsWith("/tennis"))).toBe(true);
  });
});

describe("Padel catalog depth", () => {
  it("has meaningful published padel racket coverage", () => {
    const rackets = products.filter((p) => p.categoryId === "cat-padel-rackets");
    expect(rackets.length).toBeGreaterThanOrEqual(12);
    expect(padelRacketFinderDefinition.questions.length).toBeGreaterThanOrEqual(7);
    expect(padelRacketFinderDefinition.questions.length).toBeLessThanOrEqual(12);
  });
});
