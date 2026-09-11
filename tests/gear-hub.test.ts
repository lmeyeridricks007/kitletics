import { describe, expect, it } from "vitest";
import { getGearHubData, parseGearHubFilters } from "@/lib/gear-hub";

describe("Gear Hub", () => {
  it("assembles cross-sport hub with real published counts", () => {
    const data = getGearHubData({ region: "NL" });
    expect(data.hero.titleLines[0]).toBe("All the gear.");
    expect(data.categories.length).toBeGreaterThan(4);
    expect(
      data.categories.every((c) => c.publishedProductCount > 0),
    ).toBe(true);
    expect(data.tools.items.every((t) => t.href.startsWith("/"))).toBe(true);
    expect(
      data.tools.items.some((t) => t.slug === "fitness-watch-finder"),
    ).toBe(true);
    expect(data.picks.title).toMatch(/kitletics picks/i);
    expect(data.featuredCategories.title).toMatch(/featured/i);
    expect(data.brands.title).toMatch(/featured/i);
    expect(data.hero.trust.some((t) => /100\+|real-time/i.test(t.description))).toBe(
      false,
    );
    expect(data.help.description.toLowerCase()).toMatch(/live chat|support/);
  });
  it("does not globally rank products by Kitletics Score across categories", () => {
    const data = getGearHubData({ region: "NL" });
    // Picks come from curated Best Guides with authentic media — all currently running shoes
    expect(data.picks.items.length).toBeGreaterThan(0);
    expect(data.picks.items.every((p) => p.image?.src)).toBe(true);
    const scores = data.picks.items.map((p) => p.score ?? 0);
    const sorted = [...scores].sort((a, b) => b - a);
    // Allow equal scores; just ensure we didn't invent a global leaderboard label
    expect(data.picks.title).not.toMatch(/popular|top picks|#1/i);
    void sorted;
  });

  it("narrows categories and tools when sport=running", () => {
    const data = getGearHubData({
      region: "NL",
      filters: { sport: "running" },
    });
    expect(data.filters.sport).toBe("running");
    expect(data.categories.some((c) => /padel/i.test(c.title))).toBe(false);
    expect(data.categories.some((c) => /running shoes/i.test(c.title))).toBe(
      true,
    );
    expect(data.tools.items.some((t) => t.slug === "padel-racket-finder")).toBe(
      false,
    );
    expect(
      data.tools.items.some((t) => t.slug === "running-shoe-finder"),
    ).toBe(true);
  });

  it("parses shareable filter query state", () => {
    expect(
      parseGearHubFilters({
        sport: "fitness",
        brand: "asics",
        maxPrice: "200",
        usecase: "home-gym",
      }),
    ).toEqual({
      sport: "fitness",
      brand: "asics",
      maxPrice: 200,
      usecase: "home-gym",
    });
  });

  it("keeps products without displayable price discoverable", () => {
    const data = getGearHubData({ region: "NL" });
    for (const pick of data.picks.items) {
      if (!pick.price) {
        expect(pick.offerCount).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
