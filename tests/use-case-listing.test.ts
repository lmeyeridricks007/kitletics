import { describe, expect, it } from "vitest";
import {
  getUseCaseListingConfig,
  getUseCaseListingConfigs,
  getUseCaseListingPageData,
} from "@/lib/use-case-listing";

describe("Product use-case listing pages", () => {
  it("exposes daily-trainers, race, stability, trail and heavy-runners configs", () => {
    const configs = getUseCaseListingConfigs();
    expect(configs.map((c) => c.slug).sort()).toEqual([
      "daily-trainers",
      "heavy-runners",
      "race",
      "stability",
      "trail",
    ]);
  });

  it("assembles Race Shoes listing with locked race eligibility", () => {
    const data = getUseCaseListingPageData({
      sportSlug: "running",
      categoryPathSegment: "shoes",
      listingSlug: "race",
    });
    expect(data).toBeTruthy();
    expect(data!.lockedType).toEqual(["race"]);
    expect(data!.productCount).toBeGreaterThan(0);
    expect(data!.filters.type).toContain("race");
    expect(data!.config.eyebrow).toBe("USE CASE");
    expect(data!.breadcrumbs.map((b) => b.label)).toEqual([
      "Home",
      "Running",
      "Running Shoes",
      "Race Shoes",
    ]);
    expect(data!.config.education.factors).toHaveLength(4);
    expect(data!.relatedGuides.length).toBeGreaterThan(0);
    const typeFacet = data!.facets.find((f) => f.key === "type");
    expect(typeFacet?.label).toBe("Shoe Type");
    expect(typeFacet?.options.every((o) =>
      ["race", "carbon-plate", "tempo"].includes(o.value),
    )).toBe(true);
    expect(typeFacet?.options.some((o) => o.value === "race")).toBe(true);
    const distanceFacet = data!.facets.find(
      (f) => f.key === "recommendedDistance",
    );
    expect(distanceFacet?.label).toBe("Distance");
  });

  it("keeps race constraint when clearing would otherwise widen the catalog", () => {
    const data = getUseCaseListingPageData({
      sportSlug: "running",
      categoryPathSegment: "shoes",
      listingSlug: "race",
      searchParams: { brand: "nike", distance: "marathon" },
    });
    expect(data!.filters.type).toContain("race");
    expect(data!.filters.brand).toContain("nike");
    expect(data!.activeFilters.some((c) => c.group === "type")).toBe(false);
  });

  it("supports daily-trainers, stability, trail and heavy-runners smoke assemblies", () => {
    for (const slug of [
      "daily-trainers",
      "stability",
      "trail",
      "heavy-runners",
    ] as const) {
      const cfg = getUseCaseListingConfig("running", "shoes", slug);
      expect(cfg).toBeTruthy();
      const data = getUseCaseListingPageData({
        sportSlug: "running",
        categoryPathSegment: "shoes",
        listingSlug: slug,
      });
      expect(data).toBeTruthy();
      expect(data!.productCount).toBeGreaterThan(0);
      expect(data!.config.education.factors.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("uses authentic media on featured comparison thumbs when available", () => {
    const data = getUseCaseListingPageData({
      sportSlug: "running",
      categoryPathSegment: "shoes",
      listingSlug: "race",
    });
    for (const row of data!.featuredComparisons) {
      for (const side of [row.productA, row.productB]) {
        if (!side.image) continue;
        expect(side.image.src.includes("/fallbacks/")).toBe(false);
        expect(side.image.src.endsWith(".svg")).toBe(false);
      }
    }
  });

  it("does not place placeholder imagery on Race Shoes listing cards", () => {
    const data = getUseCaseListingPageData({
      sportSlug: "running",
      categoryPathSegment: "shoes",
      listingSlug: "race",
    });
    expect(data!.products.length).toBeGreaterThan(0);
    for (const row of data!.products) {
      expect(row.image).toBeTruthy();
      expect(row.image!.src.includes("/fallbacks/")).toBe(false);
    }
  });
});
