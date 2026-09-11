import { describe, expect, it } from "vitest";
import type { FinderResponses } from "@/domain/finders/types";
import { getFinderResultsData } from "@/lib/finder/get-finder-results-data";
import { getProductBySlug, getReviewBySlug, getBestGuideBySlug } from "@/repositories";
import { runningLaunchManifest } from "@/content/running/launch-manifest";
import { products } from "@/content/products";
import { canPublishProduct } from "@/domain/catalog/publishability";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import { launchCoreCategoryIds } from "@/content/running/launch-manifest";

/** Neutral Finder scenario suite — asserts eligibility & constraints, not winners. */
const scenarios: { id: string; responses: FinderResponses }[] = [
  {
    id: "beginner-road",
    responses: {
      terrain: "road",
      primaryUse: "daily-training",
      distances: ["5k", "10k"],
      cushioning: "cushioned",
      stability: "not-sure",
      width: "standard",
      experience: "beginner",
      priorities: ["comfort", "durability"],
      budget: "100-150",
    },
  },
  {
    id: "experienced-daily",
    responses: {
      terrain: "road",
      primaryUse: "daily-training",
      distances: ["half"],
      cushioning: "cushioned",
      stability: "neutral",
      width: "standard",
      experience: "advanced",
      priorities: ["versatility", "responsiveness"],
      budget: "150-200",
    },
  },
  {
    id: "long-run",
    responses: {
      terrain: "road",
      primaryUse: "long-run",
      distances: ["marathon"],
      cushioning: "max",
      stability: "neutral",
      width: "standard",
      experience: "intermediate",
      priorities: ["cushioning", "comfort"],
      budget: "150-200",
    },
  },
  {
    id: "marathon-racer",
    responses: {
      terrain: "road",
      primaryUse: "racing",
      distances: ["marathon"],
      cushioning: "not-sure",
      stability: "neutral",
      width: "standard",
      experience: "advanced",
      priorities: ["racing", "light-weight"],
      budget: "200-plus",
    },
  },
  {
    id: "wide-foot",
    responses: {
      terrain: "road",
      primaryUse: "daily-training",
      distances: ["10k"],
      cushioning: "cushioned",
      stability: "not-sure",
      width: "wide",
      experience: "intermediate",
      priorities: ["comfort", "fit"],
      budget: "150-200",
    },
  },
  {
    id: "stability",
    responses: {
      terrain: "road",
      primaryUse: "daily-training",
      distances: ["half"],
      cushioning: "cushioned",
      stability: "stability",
      width: "standard",
      experience: "intermediate",
      priorities: ["stability", "comfort"],
      budget: "150-200",
    },
  },
  {
    id: "max-cushion",
    responses: {
      terrain: "road",
      primaryUse: "easy-running",
      distances: ["long"],
      cushioning: "max",
      stability: "neutral",
      width: "standard",
      experience: "intermediate",
      priorities: ["cushioning", "comfort"],
      budget: "150-200",
    },
  },
  {
    id: "tempo",
    responses: {
      terrain: "road",
      primaryUse: "tempo",
      distances: ["10k"],
      cushioning: "firm",
      stability: "neutral",
      width: "standard",
      experience: "advanced",
      priorities: ["responsiveness", "speed"],
      budget: "150-200",
    },
  },
  {
    id: "budget",
    responses: {
      terrain: "road",
      primaryUse: "daily-training",
      distances: ["5k"],
      cushioning: "cushioned",
      stability: "not-sure",
      width: "standard",
      experience: "beginner",
      priorities: ["value", "durability"],
      budget: "under-100",
    },
  },
  {
    id: "trail",
    responses: {
      terrain: "trail",
      primaryUse: "trail",
      distances: ["half"],
      cushioning: "cushioned",
      stability: "not-sure",
      width: "standard",
      experience: "intermediate",
      priorities: ["traction", "protection"],
      budget: "150-200",
    },
  },
  {
    id: "heavy",
    responses: {
      terrain: "road",
      primaryUse: "daily-training",
      distances: ["half"],
      cushioning: "max",
      stability: "stability",
      width: "standard",
      experience: "intermediate",
      priorities: ["cushioning", "durability"],
      budget: "150-200",
      weight: { value: 95, unit: "kg" },
    },
  },
  {
    id: "treadmill",
    responses: {
      terrain: "treadmill",
      primaryUse: "daily-training",
      distances: ["10k"],
      cushioning: "cushioned",
      stability: "neutral",
      width: "standard",
      experience: "intermediate",
      priorities: ["comfort", "versatility"],
      budget: "100-150",
    },
  },
];

describe("Running launch Finder scenarios", () => {
  it("manifest lists all scenario ids", () => {
    expect([...runningLaunchManifest.finderScenarios].sort()).toEqual(
      scenarios.map((s) => s.id).sort(),
    );
  });

  for (const scenario of scenarios) {
    it(`scenario ${scenario.id}: returns structured results without crashing`, () => {
      const data = getFinderResultsData({
        finderSlug: "running-shoe-finder",
        responses: scenario.responses,
        region: "NL",
        options: { isDev: false },
      });
      expect(data).toBeTruthy();
      // Soft: may be empty for hard constraints — still must expose limiting criteria
      if (!data!.rows.length) {
        expect(data!.run).toBeTruthy();
      } else {
        for (const row of data!.rows.slice(0, 5)) {
          expect(row.product.status).toBe("published");
          expect(row.evaluation.matchScore).toBeGreaterThanOrEqual(0);
          expect(row.evaluation.matchScore).toBeLessThanOrEqual(100);
        }
      }
    });
  }

  it("wide hard constraint does not return known narrow-only winners without wide fit", () => {
    const data = getFinderResultsData({
      finderSlug: "running-shoe-finder",
      responses: scenarios.find((s) => s.id === "wide-foot")!.responses,
      region: "NL",
      options: { isDev: false },
    });
    expect(data).toBeTruthy();
    for (const row of data!.rows) {
      const width = row.product.specifications.width;
      const fit = row.product.specifications.fit;
      // If width/fit known, must not be explicitly narrow-only
      if (width === "narrow" || fit === "narrow") {
        expect.fail(`${row.product.id} violates wide constraint`);
      }
    }
  });

  it("trail hard constraint prefers trail terrain products when matches exist", () => {
    const data = getFinderResultsData({
      finderSlug: "running-shoe-finder",
      responses: scenarios.find((s) => s.id === "trail")!.responses,
      region: "NL",
      options: { isDev: false },
    });
    expect(data).toBeTruthy();
    if (data!.rows.length > 0) {
      const top = data!.rows[0].product;
      const terrain = top.specifications.terrain;
      const terrains = Array.isArray(terrain) ? terrain : [terrain];
      expect(
        terrains.some(
          (t) => t === "trail" || t === "mixed" || t === "road-to-trail",
        ),
      ).toBe(true);
    }
  });
});

describe("Running launch publication security", () => {
  it("draft product is not publicly visible", () => {
    const draft = products.find((p) => p.status === "draft");
    expect(draft).toBeTruthy();
    expect(isPubliclyVisible(draft!, { isDev: false })).toBe(false);
    expect(getProductBySlug(draft!.slug, { isDev: false })).toBeUndefined();
  });

  it("scheduled review is not publicly visible", () => {
    const scheduled = getReviewBySlug("asics-novablast-5-deep-dive", {
      isDev: false,
    });
    expect(scheduled).toBeUndefined();
  });

  it("launch-core published shoes meet publishability gate", () => {
    const shoeIds = launchCoreCategoryIds();
    expect(shoeIds).toContain("cat-running-shoes");
    const shoes = products.filter(
      (p) =>
        p.categoryId === "cat-running-shoes" &&
        isPubliclyVisible(p, { isDev: false }),
    );
    const failing = shoes.filter((p) => !canPublishProduct(p).ok);
    expect(failing.map((p) => p.id)).toEqual([]);
  });

  it("running lights are publishable after lumen fill", () => {
    const lights = products.filter(
      (p) =>
        p.categoryId === "cat-running-lights" &&
        isPubliclyVisible(p, { isDev: false }),
    );
    expect(lights.length).toBeGreaterThanOrEqual(2);
    for (const p of lights) {
      expect(canPublishProduct(p).ok, p.id).toBe(true);
    }
  });
});

describe("Running launch manifest", () => {
  it("treats nutrition as launch-supporting after editorial 44 decision content", () => {
    const nutrition = runningLaunchManifest.categories.find(
      (c) => c.categoryId === "cat-nutrition",
    );
    expect(nutrition?.status).toBe("launch-supporting");
  });

  it("treats accessories as launch-supporting after Fix 58 anti-chafe decision content", () => {
    expect(
      runningLaunchManifest.categories.find((c) => c.categoryId === "cat-accessories")
        ?.status,
    ).toBe("launch-supporting");
    expect(
      runningLaunchManifest.categories.find(
        (c) => c.categoryId === "cat-running-clothing",
      )?.status,
    ).toBe("launch-supporting");
    expect(
      runningLaunchManifest.categories.find((c) => c.categoryId === "cat-sunglasses")
        ?.status,
    ).toBe("launch-supporting");
  });

  it("exposes Best Guide for running shoes", () => {
    const guide = getBestGuideBySlug("running-shoes", { isDev: false });
    expect(guide).toBeTruthy();
  });
});
