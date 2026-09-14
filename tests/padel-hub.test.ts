import { describe, expect, it } from "vitest";
import { getSportHubData, hasMockupSportHub } from "@/lib/sport-hub";
import { getSportBySlug, getBestGuideBySlug, getProductsBySport } from "@/repositories";
import { resolveNavigationContext } from "@/lib/navigation/contextual-nav";

describe("Padel Sport Hub", () => {
  it("registers mockup hub config for padel", () => {
    expect(hasMockupSportHub("padel")).toBe(true);
  });

  it("assembles a live padel hub with Best, guides, finder, and reviews", () => {
    const data = getSportHubData({ sportSlug: "padel", region: "NL" });
    expect(data).toBeTruthy();
    expect(data!.sportSlug).toBe("padel");
    expect(data!.hero.imageSrc).toContain("/images/padel/");
    expect(data!.bestSection?.products.length).toBeGreaterThanOrEqual(4);
    expect(data!.moreBestSections.length).toBeGreaterThanOrEqual(4);
    expect(data!.guides.items.length).toBeGreaterThanOrEqual(3);
    expect(data!.comparisons.items.length).toBeGreaterThan(0);
    expect(data!.reviews?.items.length).toBeGreaterThan(0);
    expect(data!.finder.ctaHref).toBe("/tools/padel-racket-finder");
    expect(
      data!.quickActions.some((a) => a.href === "/tools/padel-racket-finder"),
    ).toBe(true);
    expect(
      data!.quickActions.some((a) => a.href === "/padel/rackets/database"),
    ).toBe(true);
    expect(data!.brands.items.length).toBeGreaterThan(0);
    expect(data!.shopCategories.some((c) => c.href === "/padel/rackets")).toBe(
      true,
    );
  });

  it("exposes live padel sport and catalog via repositories", () => {
    const sport = getSportBySlug("padel", { isDev: false });
    expect(sport?.contentStatus).toBe("live");
    expect(getProductsBySport("sport-padel", { isDev: false }).length).toBeGreaterThan(
      5,
    );
    expect(getBestGuideBySlug("padel-rackets", { isDev: false })).toBeTruthy();
  });
});

describe("Padel contextual navigation", () => {
  it("uses dedicated Padel rail on /padel with soft goods primary and tools in overflow", () => {
    const ctx = resolveNavigationContext({ pathname: "/padel" });
    expect(ctx.showContextualNav).toBe(true);
    expect(ctx.secondaryContextKey).toBe("padel");
    expect(ctx.primaryNavKey).toBe("racket");
    expect(ctx.activeItemId).toBe("overview");

    const visible = ctx.visibleItems.map((i) => i.label);
    const overflow = ctx.overflowItems.map((i) => i.label);
    const all = [...visible, ...overflow];

    // Primary rail prioritises category shopping; soft goods stay visible.
    expect(visible).toEqual(
      expect.arrayContaining([
        "Padel",
        "Rackets",
        "Shoes",
        "Balls",
        "Bags",
        "Grips",
        "Accessories",
        "Best",
        "Reviews",
        "Compare",
      ]),
    );
    // Finder / Guides / Database remain discoverable via overflow (or visible
    // when active). Do not re-add them to the primary rail just for the test.
    expect(all).toEqual(
      expect.arrayContaining(["Finder", "Guides", "Database"]),
    );
    expect(overflow.length).toBeGreaterThan(0);

    const byId = Object.fromEntries(
      [...ctx.visibleItems, ...ctx.overflowItems].map((i) => [i.id, i.href]),
    );
    expect(byId.finder).toBe("/tools/padel-racket-finder");
    expect(byId.guides).toContain("/guides");
    expect(byId.database).toBe("/padel/rackets/database");
    expect(byId.accessories).toBe("/padel/accessories");
  });

  it("exposes Finder/Guides/Database on mobile overflow when primary is full", () => {
    const ctx = resolveNavigationContext({ pathname: "/padel" });
    const mobileLabels = [
      ...ctx.visibleItems.map((i) => i.label),
      ...ctx.overflowItems.map((i) => i.label),
    ];
    for (const label of ["Finder", "Guides", "Database", "Accessories"]) {
      expect(mobileLabels).toContain(label);
    }
  });

  it("highlights Database on /padel/rackets/database", () => {
    const ctx = resolveNavigationContext({
      pathname: "/padel/rackets/database",
    });
    expect(ctx.secondaryContextKey).toBe("padel");
    expect(ctx.activeItemId).toBe("database");
  });

  it("keeps umbrella Racket rail on /tennis", () => {
    const ctx = resolveNavigationContext({ pathname: "/tennis" });
    expect(ctx.secondaryContextKey).toBe("racket");
    expect(ctx.primaryNavKey).toBe("racket");
  });
});

describe("Running Sport Hub (mockup)", () => {
  it("registers mockup hub config for running", () => {
    expect(hasMockupSportHub("running")).toBe(true);
  });

  it("assembles running hub with dark-hero mockup shape", () => {
    const data = getSportHubData({ sportSlug: "running", region: "NL" });
    expect(data).toBeTruthy();
    expect(data!.sportSlug).toBe("running");
    expect(data!.hero.title).toBe("RUNNING GEAR");
    expect(data!.hero.imageSrc).toContain("running-urban");
    expect(data!.finder.title).toMatch(/RUNNING SHOES/i);
    expect(data!.finder.ctaLabel).toMatch(/FIND MY SHOES/i);
    expect(data!.bestSection?.products.length).toBeGreaterThan(0);
    expect(data!.bestSection?.products.every((p) => p.image?.src)).toBe(true);
    expect(data!.shopCategories.some((c) => c.href === "/running/shoes")).toBe(
      true,
    );
    expect(data!.brands.items.length).toBeGreaterThan(0);
    expect(data!.guides.title).toMatch(/RUNNING/i);
  });
});
