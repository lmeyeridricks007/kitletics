import { describe, expect, it } from "vitest";
import { getRunningShoesCategoryPage } from "@/lib/catalog/get-running-shoes-category-page";

describe("Running Shoes Product Category mockup page", () => {
  it("assembles mockup data with hero products and modules", () => {
    const data = getRunningShoesCategoryPage({});
    expect(data).toBeTruthy();
    expect(data!.mockup).toBe(true);
    expect(data!.heroProducts.length).toBeGreaterThanOrEqual(1);
    expect(data!.typeNav.items.length).toBeGreaterThanOrEqual(6);
    expect(data!.howYouRun.items).toHaveLength(6);
    expect(data!.howYouRun.chips.length).toBeGreaterThanOrEqual(6);
    expect(data!.finder.fields).toHaveLength(4);
    expect(data!.finder.ctaHref).toContain("running-shoe-finder");
    expect(data!.toolsSection.items.length).toBeGreaterThanOrEqual(2);
    expect(data!.brandStrip.items.length).toBeGreaterThan(0);
    expect(data!.productCount).toBeGreaterThan(0);
    expect(data!.config.hero.title).toBe("Running Shoes");
  });

  it("features only authentic-media products in best rail", () => {
    const data = getRunningShoesCategoryPage({});
    const products = data!.bestSection?.products ?? [];
    for (const p of products) {
      expect(p.image?.src).toBeTruthy();
      expect(p.image!.src.includes("/fallbacks/")).toBe(false);
      expect(p.image!.src.endsWith(".svg")).toBe(false);
    }
  });
});
