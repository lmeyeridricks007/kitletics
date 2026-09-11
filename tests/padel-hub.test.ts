import { describe, expect, it } from "vitest";
import { getSportHubData, hasMockupSportHub } from "@/lib/sport-hub";
import { getSportBySlug, getBestGuideBySlug, getProductsBySport } from "@/repositories";

describe("Padel Sport Hub", () => {
  it("registers mockup hub config for padel", () => {
    expect(hasMockupSportHub("padel")).toBe(true);
  });

  it("assembles padel hub without promoting held Best, finders, or editorial", () => {
    const data = getSportHubData({ sportSlug: "padel", region: "NL" });
    expect(data).toBeTruthy();
    expect(data!.sportSlug).toBe("padel");
    expect(data!.bestSection).toBeUndefined();
    expect(data!.comparisons.items).toHaveLength(0);
    expect(data!.guides.items).toHaveLength(0);
    expect(data!.starterKit).toBeUndefined();
    expect(data!.finder.ctaHref).toBe("/tools?sport=padel");
    expect(
      data!.quickActions.every((a) => !a.href.includes("/tools/padel-racket-finder")),
    ).toBe(true);
    expect(data!.brands.items.length).toBeGreaterThan(0);
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
