import { describe, expect, it } from "vitest";
import { sports } from "@/content/taxonomy/sports";
import { disciplines } from "@/content/taxonomy/disciplines";
import { categories } from "@/content/taxonomy/categories";
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { hasSportHub, assembleSportHubData } from "@/lib/hubs";
import { getFinderDefinition } from "@/domain/finders/repository";
import { runFinder } from "@/domain/finders/engine";
import { runHomeGymBuilder } from "@/domain/builders/home-gym";
import {
  estimateOneRepMax,
  calculatePlatesPerSide,
} from "@/domain/calculators/strength";
import { offers } from "@/content/offers";
import { getProducts } from "@/repositories/products";

describe("Fitness taxonomy", () => {
  it("exposes Fitness & Training as live sport at /fitness", () => {
    const fitness = sports.find((s) => s.id === "sport-training");
    expect(fitness?.slug).toBe("fitness");
    expect(fitness?.available).toBe(true);
    expect(fitness?.contentStatus).toBe("live");
    expect(hasSportHub("fitness")).toBe(true);
  });

  it("has core fitness disciplines under sport-training", () => {
    const ids = disciplines
      .filter((d) => d.sportId === "sport-training")
      .map((d) => d.slug);
    for (const slug of [
      "gym",
      "strength",
      "functional-fitness",
      "hyrox",
      "calisthenics",
      "home-gym",
      "conditioning",
      "recovery",
    ]) {
      expect(ids).toContain(slug);
    }
  });

  it("registers fitness product categories", () => {
    const slugs = categories.map((c) => c.slug);
    expect(slugs).toContain("training-shoes");
    expect(slugs).toContain("power-racks");
    expect(slugs).toContain("adjustable-dumbbells");
    expect(slugs).toContain("rowing-machines");
    expect(slugs).toContain("pull-up-bars");
  });
});

describe("Fitness catalog", () => {
  it("publishes fitness products without duplicating Garmin", () => {
    const fitnessProducts = products.filter((p) =>
      p.sportIds.includes("sport-training"),
    );
    expect(fitnessProducts.length).toBeGreaterThan(40);
    const garminDup = fitnessProducts.filter((p) =>
      p.fullName.toLowerCase().includes("forerunner"),
    );
    expect(garminDup).toHaveLength(0);
  });

  it("reuses shared brands without inventing RunningProduct types", () => {
    expect(brands.some((b) => b.id === "brand-nike")).toBe(true);
    expect(brands.some((b) => b.id === "brand-rogue")).toBe(true);
    const shoe = products.find((p) => p.id === "prod-nike-metcon-9");
    expect(shoe?.categoryId).toBe("cat-training-shoes");
    expect(shoe?.sportIds).toContain("sport-training");
  });

  it("cross-links HYROX without duplicate product entities", () => {
    const hyroxCapable = products.filter(
      (p) =>
        p.sportIds.includes("sport-hyrox") ||
        p.disciplineIds.includes("disc-training-hyrox") ||
        p.useCaseIds.includes("uc-hyrox-training") ||
        p.useCaseIds.includes("uc-hyrox-race"),
    );
    expect(hyroxCapable.length).toBeGreaterThan(0);
  });
});

describe("Fitness hub", () => {
  it("assembles fitness hub data", () => {
    const data = assembleSportHubData("fitness", { isDev: true });
    expect(data).toBeTruthy();
    expect(data!.sport.slug).toBe("fitness");
    expect(data!.config.hero.primaryCta.href).toContain("/gear?sport=fitness");
    expect(data!.disciplines.length).toBeGreaterThanOrEqual(6);
  });
});

describe("Fitness finders", () => {
  it("registers HYROX and training shoe finders", () => {
    expect(getFinderDefinition("hyrox-shoe-finder")?.categoryIds).toContain(
      "cat-running-shoes",
    );
    expect(getFinderDefinition("training-shoe-finder")?.categoryId).toBe(
      "cat-training-shoes",
    );
    expect(getFinderDefinition("power-rack-finder")).toBeTruthy();
    expect(getFinderDefinition("pull-up-bar-finder")).toBeTruthy();
    expect(getFinderDefinition("adjustable-dumbbell-finder")).toBeTruthy();
    expect(getFinderDefinition("fitness-watch-finder")?.categoryId).toBe(
      "cat-gps-watches",
    );
  });

  it("excludes racks taller than ceiling", () => {
    const definition = getFinderDefinition("power-rack-finder")!;
    const published = getProducts({ isDev: true }).filter(
      (p) => p.categoryId === "cat-power-racks",
    );
    const lowestByProduct: Record<
      string,
      { price: number; currency: string } | undefined
    > = {};
    for (const p of published) {
      const prices = offers
        .filter((o) => o.productId === p.id && typeof o.price === "number")
        .map((o) => o.price);
      lowestByProduct[p.id] = prices.length
        ? { price: Math.min(...prices), currency: "EUR" }
        : undefined;
    }
    const result = runFinder({
      definition,
      products: published,
      responses: {
        ceilingHeightCm: 220,
        primaryUse: "strength",
        wallMount: "yes",
        priorities: ["value"],
        budget: "under-800",
      },
      region: "NL",
      lowestByProduct,
      recommendations: [],
    });
    for (const r of result.rankedResults) {
      const p = published.find((x) => x.id === r.productId)!;
      const h = p.specifications.heightMm;
      if (typeof h === "number") {
        expect(h / 10 + 5).toBeLessThanOrEqual(220);
      }
    }
  });
});

describe("Home Gym Builder", () => {
  it("golden: small room stays compact", () => {
    const result = runHomeGymBuilder({
      profile: {
        room: {
          lengthM: 2.5,
          widthM: 2.5,
          heightM: 2.3,
          wallMountAllowed: true,
          floorMountAllowed: false,
          noiseSensitive: false,
        },
        budgetEur: 1000,
        budgetMode: "strict",
        goals: ["strength", "calisthenics"],
        experience: "beginner",
        ownedCategories: [],
        unitSystem: "metric",
      },
      products,
      offers,
    });
    for (const item of result.items) {
      expect(item.fit).not.toBe("does-not-fit");
    }
    expect(["excellent", "strong", "good", "limited"]).toContain(result.band);
  });

  it("golden: apartment noise avoids forced cardio", () => {
    const result = runHomeGymBuilder({
      profile: {
        room: {
          lengthM: 3,
          widthM: 3,
          heightM: 2.4,
          wallMountAllowed: false,
          floorMountAllowed: false,
          noiseSensitive: true,
        },
        budgetEur: 800,
        budgetMode: "strict",
        goals: ["general-fitness"],
        experience: "beginner",
        ownedCategories: [],
        unitSystem: "metric",
      },
      products,
      offers,
    });
    expect(
      result.skippedRoles.some((s) => s.role === "conditioning") ||
        !result.items.some((i) => i.role === "conditioning"),
    ).toBe(true);
  });

  it("does not treat missing price as zero", () => {
    const result = runHomeGymBuilder({
      profile: {
        room: {
          lengthM: 5,
          widthM: 4,
          heightM: 2.6,
          wallMountAllowed: true,
          floorMountAllowed: true,
          noiseSensitive: false,
        },
        budgetEur: 3000,
        budgetMode: "flexible",
        goals: ["strength", "powerlifting"],
        experience: "intermediate",
        ownedCategories: [],
        unitSystem: "metric",
      },
      products,
      offers,
    });
    expect(result.totalEstimated).toBeGreaterThanOrEqual(0);
    if (result.confidenceNotes.some((n) => /no reliable regional price/i.test(n))) {
      expect(result.totalEstimated).not.toBe(0);
    }
  });
});

describe("Strength calculators", () => {
  it("estimates 1RM without claiming exact physiology", () => {
    const epley = estimateOneRepMax(100, 5, "epley");
    expect(epley).toBeGreaterThan(100);
  });

  it("loads plates per side", () => {
    const r = calculatePlatesPerSide({
      targetWeight: 140,
      barWeight: 20,
      unit: "kg",
    });
    expect(r.perSide.some((p) => p.plate === 25)).toBe(true);
    expect(r.loadable).toBe(140);
  });
});

describe("Fitness compatibility & cross-sport", () => {
  it("models rack ecosystems without duplicating Product entities", async () => {
    const { getAllCompatibilities, areEcosystemsCompatible } = await import(
      "@/domain/compatibility"
    );
    const all = getAllCompatibilities();
    expect(all.length).toBeGreaterThanOrEqual(5);
    expect(
      all.some((c) => c.compatibilityType === "ecosystem-compatible"),
    ).toBe(true);
    expect(areEcosystemsCompatible("prod-rogue-rml-390f", "prod-rogue-ohio")).toBe(
      true,
    );
  });

  it("reuses Garmin products without a FitnessProduct duplicate", () => {
    const garmin = products.filter((p) => p.brandId === "brand-garmin");
    const ids = garmin.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(garmin.some((p) => p.sportIds.includes("sport-running"))).toBe(true);
  });
});
