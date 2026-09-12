import { describe, expect, it } from "vitest";
import {
  buildDropDistribution,
  buildOfferPriceDistribution,
  buildPlatedComposition,
  buildRunningShoeDataExplorer,
  buildStackDistribution,
  buildUseCounts,
  buildWeightDistribution,
  filterExplorerRows,
  toDataExplorerRows,
} from "@/lib/running-shoe-database/charts/build-explorer-data";
import type { RunningShoeDatabaseRecord } from "@/lib/running-shoe-database/types";
import { getRunningShoeDatabasePageData } from "@/lib/running-shoe-database/get-page-data";

function shoe(
  partial: Partial<RunningShoeDatabaseRecord> &
    Pick<
      RunningShoeDatabaseRecord,
      "id" | "slug" | "name" | "brandId" | "brandSlug" | "brandName"
    >,
): RunningShoeDatabaseRecord {
  return {
    fullName: `${partial.brandName} ${partial.name}`,
    categoryId: "cat-running-shoes",
    categorySlug: "running-shoes",
    typeSlugs: ["daily-trainers"],
    typeLabels: ["Daily Trainers"],
    useCaseSlugs: ["daily-training"],
    useCaseLabels: ["Daily Training"],
    primaryUseSlug: "daily-training",
    primaryUseLabel: "Daily Training",
    audiences: ["unisex"],
    genderFit: ["unisex"],
    carbonPlated: false,
    terrain: ["road"],
    surface: ["asphalt"],
    recommendedDistance: [],
    trainingTypes: [],
    widthOptions: [],
    hasAlternatives: false,
    inComparison: false,
    productHref: `/products/${partial.slug}`,
    ...partial,
  };
}

const fixtures: RunningShoeDatabaseRecord[] = [
  shoe({
    id: "1",
    slug: "a",
    name: "A",
    brandId: "b1",
    brandSlug: "alpha",
    brandName: "Alpha",
    weightG: 200,
    dropMm: 4,
    heelStackMm: 32,
    plate: false,
    price: { amount: 110, currency: "EUR" },
    genderFit: ["men"],
  }),
  shoe({
    id: "2",
    slug: "b",
    name: "B",
    brandId: "b1",
    brandSlug: "alpha",
    brandName: "Alpha",
    weightG: 250,
    dropMm: 8,
    heelStackMm: 38,
    plate: false,
    price: { amount: 140, currency: "EUR" },
    useCaseSlugs: ["long-runs", "daily-training"],
    useCaseLabels: ["Long Runs", "Daily Training"],
    primaryUseSlug: "long-runs",
    primaryUseLabel: "Long Runs",
    genderFit: ["women"],
    surface: ["trail"],
  }),
  shoe({
    id: "3",
    slug: "c",
    name: "C",
    brandId: "b2",
    brandSlug: "beta",
    brandName: "Beta",
    weightG: 300,
    dropMm: 10,
    heelStackMm: 42,
    plate: true,
    plateMaterial: "carbon",
    carbonPlated: true,
    price: { amount: 220, currency: "EUR" },
  }),
];

describe("data explorer chart builders", () => {
  it("builds weight / drop / stack distributions with sample coverage", () => {
    const rows = toDataExplorerRows(fixtures);
    const weight = buildWeightDistribution(rows);
    expect(weight.kind).toBe("distribution");
    expect(weight.sampleSize).toBe(3);
    expect(weight.median).toBe(250);
    expect(weight.points.reduce((n, p) => n + p.count, 0)).toBe(3);

    const drop = buildDropDistribution(rows);
    expect(drop.points.find((p) => p.id === "1-4")?.count).toBe(1);

    const stack = buildStackDistribution(rows);
    expect(stack.points.find((p) => p.id === "41+")?.count).toBe(1);
    expect(stack.median).toBe(38);
  });

  it("labels offer-price charts as offers not launch price", () => {
    const price = buildOfferPriceDistribution(toDataExplorerRows(fixtures));
    expect(price.metric).toBe("offerPrice");

    // Distribution panels require n≥5; pad so the editorial panel is emitted.
    const priced = Array.from({ length: 5 }, (_, i) =>
      shoe({
        id: `p${i}`,
        slug: `priced-${i}`,
        name: `Priced ${i}`,
        brandId: "b1",
        brandSlug: "alpha",
        brandName: "Alpha",
        weightG: 220 + i * 10,
        dropMm: 8,
        heelStackMm: 34,
        price: { amount: 100 + i * 20, currency: "EUR" },
      }),
    );
    const explorer = buildRunningShoeDataExplorer(priced);
    const panel = explorer.panels.find((p) => p.id === "offer-price-spread");
    expect(panel).toBeTruthy();
    expect(panel!.interpretation.toLowerCase()).toContain("offer");
    expect(panel!.interpretation.toLowerCase()).toContain("not launch");
    expect(panel!.sampleNote.toLowerCase()).toContain("offer");
  });

  it("filters rows by use / gender / surface / brand", () => {
    const rows = toDataExplorerRows(fixtures);
    expect(filterExplorerRows(rows, { gender: ["women"] })).toHaveLength(1);
    expect(filterExplorerRows(rows, { surface: ["trail"] })).toHaveLength(1);
    expect(filterExplorerRows(rows, { brand: ["beta"] })).toHaveLength(1);
    expect(filterExplorerRows(rows, { use: ["long-runs"] })).toHaveLength(1);
  });

  it("builds use counts and plated composition", () => {
    const rows = toDataExplorerRows(fixtures);
    const uses = buildUseCounts(rows);
    expect(uses.points.some((p) => p.id === "daily-training" && p.count >= 1)).toBe(
      true,
    );
    const plated = buildPlatedComposition(rows);
    expect(plated.points.find((p) => p.id === "plated")?.count).toBe(1);
    expect(plated.points.find((p) => p.id === "non-plated")?.count).toBe(2);
  });

  it("chart segment hrefs deep-link into database filters", () => {
    const weight = buildWeightDistribution(toDataExplorerRows(fixtures));
    for (const p of weight.points) {
      expect(p.href.startsWith("/running/shoes/database")).toBe(true);
    }
  });

  it("page data includes dataExplorer payload", () => {
    const page = getRunningShoeDatabasePageData({ options: { isDev: false } });
    expect(page.dataExplorer.eligibleCount).toBe(page.total);
    expect(page.dataExplorer.panels.length).toBeGreaterThan(3);
    expect(page.dataExplorer.rows.length).toBe(page.total);
  });
});
