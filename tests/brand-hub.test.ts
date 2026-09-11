import { describe, expect, it } from "vitest";
import { getBrandHubPageData, canPublishBrandHub } from "@/lib/brand-hub";

describe("Brand Hub", () => {
  it("renders ASICS with factual overview (no brand score)", () => {
    const data = getBrandHubPageData({ brandSlug: "asics", region: "NL" });
    expect(data).toBeTruthy();
    expect(data!.overview.mode).toBe("factual");
    expect(data!.brand.logoSrc).toContain("asics");
    expect(data!.heroProduct?.image?.src).toBeTruthy();
    expect(data!.publishedProductCount).toBeGreaterThan(0);
    expect(data!.categories.items.every((c) => c.count > 0)).toBe(true);
    expect(
      data!.categories.items.some((c) => /gps watch/i.test(c.name)),
    ).toBe(false);
    expect(data!.products.title).toMatch(/kitletics picks/i);
    expect(data!.brand.summary.toLowerCase()).not.toContain(
      "sound mind, sound body",
    );
    expect(
      data!.pillars.some((p) => /science-backed|trusted by athletes/i.test(p.title)),
    ).toBe(false);
    expect(data!.officialSite?.href).toContain("asics.com");
  });

  it("does not invent user reviews or aggregate ratings", () => {
    const data = getBrandHubPageData({ brandSlug: "asics", region: "NL" });
    // Editorial reviews only — no fake verified purchase copy in data model
    for (const r of data!.reviews.items) {
      expect(r.href).toMatch(/^\/reviews\//);
      expect(r.verdict.length).toBeGreaterThan(0);
    }
  });

  it("adapts Garmin without ASICS footwear leakage", () => {
    const data = getBrandHubPageData({ brandSlug: "garmin", region: "NL" });
    expect(data).toBeTruthy();
    expect(data!.brand.name).toBe("Garmin");
    expect(data!.categories.items.some((c) => /running shoes/i.test(c.name))).toBe(
      false,
    );
    expect(
      data!.technologies.items.every(
        (t) => !/gel|ff blast|ahar/i.test(t.name),
      ),
    ).toBe(true);
    expect(data!.products.items.every((p) => p.image?.src)).toBe(true);
  });

  it("renders Nike with authentic featured products", () => {
    const data = getBrandHubPageData({ brandSlug: "nike", region: "NL" });
    expect(data).toBeTruthy();
    expect(data!.products.items.length).toBeGreaterThan(0);
    expect(data!.products.items.every((p) => p.image?.src)).toBe(true);
  });

  it("renders Rogue as non-footwear brand", () => {
    const data = getBrandHubPageData({ brandSlug: "rogue", region: "NL" });
    expect(data).toBeTruthy();
    expect(data!.categories.items.length).toBeGreaterThan(1);
    expect(data!.categories.items.some((c) => /rack|barbell|plate/i.test(c.name))).toBe(
      true,
    );
  });

  it("gates thin brands", () => {
    expect(canPublishBrandHub({ productCount: 1, categoryCount: 1 })).toBe(
      false,
    );
    expect(canPublishBrandHub({ productCount: 2, categoryCount: 2 })).toBe(
      false,
    );
    expect(
      canPublishBrandHub({
        productCount: 5,
        categoryCount: 1,
        strengthSignalCount: 2,
      }),
    ).toBe(true);
    expect(
      canPublishBrandHub({
        productCount: 3,
        categoryCount: 2,
      }),
    ).toBe(true);
  });

  it("builds decision copy without manufacturer microsite boilerplate", () => {
    const data = getBrandHubPageData({ brandSlug: "asics", region: "NL" });
    expect(data!.overview.blurb.toLowerCase()).not.toContain(
      "not a manufacturer microsite",
    );
    expect(data!.about.howLinesDiffer?.length ?? 0).toBeGreaterThan(40);
    expect(data!.knownFor.items.length).toBeGreaterThan(0);
    expect(data!.guides.items.length).toBeGreaterThan(0);
  });
});
