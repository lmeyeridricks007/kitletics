import { describe, expect, it } from "vitest";
import {
  countListableCategoryProducts,
  sportHasPublicCatalog,
  isHeldSportHub,
} from "@/lib/catalog/listable-products";
import { assembleCategoryPage } from "@/lib/catalog/assemble";
import { getSportHubData } from "@/lib/sport-hub/get-sport-hub-data";

describe("Racket public catalog gating", () => {
  it("padel has a public catalog and listable rackets", () => {
    expect(sportHasPublicCatalog("padel")).toBe(true);
    expect(isHeldSportHub("padel")).toBe(false);
    expect(
      countListableCategoryProducts("cat-padel-rackets", "sport-padel"),
    ).toBeGreaterThan(0);

    const page = assembleCategoryPage({
      sportSlug: "padel",
      pathSegment: "rackets",
      options: { isDev: false },
    });
    expect(page!.productCount).toBe(page!.catalog.total);
    expect(page!.catalog.total).toBeGreaterThan(0);

    const hub = getSportHubData({ sportSlug: "padel" });
    expect(hub?.bestSection?.products.length).toBeGreaterThan(0);
    expect(
      hub?.shopCategories.find((c) => c.label === "Rackets")?.productCount,
    ).toBeGreaterThan(0);
  });

  it("held racket sports have zero listable catalog products", () => {
    for (const slug of ["tennis", "badminton", "pickleball", "squash"] as const) {
      expect(isHeldSportHub(slug)).toBe(true);
      expect(sportHasPublicCatalog(slug)).toBe(false);
    }

    const tennis = assembleCategoryPage({
      sportSlug: "tennis",
      pathSegment: "rackets",
      options: { isDev: false },
    });
    expect(tennis!.productCount).toBe(0);
    expect(tennis!.catalog.total).toBe(0);
  });
});
