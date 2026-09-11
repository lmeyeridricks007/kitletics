import { describe, expect, it } from "vitest";
import {
  getDisciplineHubData,
  hasMockupDisciplineHub,
} from "@/lib/discipline-hub";
import { getDisciplineBySlug, getBestGuideBySlug } from "@/repositories";

describe("Discipline Hub", () => {
  it("registers mockup hubs for road, trail, and racing", () => {
    expect(hasMockupDisciplineHub("running", "road")).toBe(true);
    expect(hasMockupDisciplineHub("running", "trail")).toBe(true);
    expect(hasMockupDisciplineHub("running", "racing")).toBe(true);
    expect(hasMockupDisciplineHub("padel", "road")).toBe(false);
  });

  it("assembles road running hub with real BestGuide products and truthful fallbacks", () => {
    const data = getDisciplineHubData({
      sportSlug: "running",
      disciplineSlug: "road",
      region: "NL",
    });
    expect(data).toBeTruthy();
    expect(data!.disciplineSlug).toBe("road");
    expect(data!.hero.title).toBe("Road Running");
    expect(data!.eyebrow).toBe("RUNNING DISCIPLINE");
    expect(data!.focusCard.mode).toBe("factual");
    expect(data!.goals.title).toMatch(/common/i);
    expect(data!.tools.title).not.toMatch(/top/i);
    expect(data!.tools.items.length).toBeGreaterThanOrEqual(3);
    expect(data!.tools.items.every((t) => t.available)).toBe(true);
    expect(
      data!.tools.items.some((t) => t.slug === "training-plan-builder"),
    ).toBe(false);
    expect(data!.products?.items.length).toBe(5);
    expect(data!.products?.title).toContain("BEST SHOES FOR ROAD RUNNING");
    expect(data!.guides.items.length).toBeGreaterThanOrEqual(3);
    expect(data!.atAGlance.metrics.some((m) => /injury/i.test(m.label))).toBe(
      false,
    );
    expect(data!.raceDay.title).toMatch(/race-day/i);
    expect(data!.related.items.length).toBeGreaterThan(0);
    expect(data!.pillars).toHaveLength(3);
    expect(data!.localNav[0]?.label).toBe("Overview");
  });

  it("uses authentic product media and offer-backed prices", () => {
    const data = getDisciplineHubData({
      sportSlug: "running",
      disciplineSlug: "road",
      region: "NL",
    });
    const product = data!.products!.items[0]!;
    expect(product.fullName.length).toBeGreaterThan(0);
    expect(product.role.length).toBeGreaterThan(0);
    expect(product.image?.src).toBeTruthy();
    expect(product.score).toBeGreaterThan(0);
  });

  it("renders trail without road-specific hero copy", () => {
    const data = getDisciplineHubData({
      sportSlug: "running",
      disciplineSlug: "trail",
      region: "NL",
    });
    expect(data!.hero.title).toBe("Trail Running");
    expect(data!.hero.description.toLowerCase()).toContain("trail");
    expect(data!.hero.description.toLowerCase()).not.toContain("tarmac");
    expect(data!.why.title.toLowerCase()).toContain("trail");
  });

  it("renders racing with race-oriented tools and products", () => {
    const data = getDisciplineHubData({
      sportSlug: "running",
      disciplineSlug: "racing",
      region: "NL",
    });
    expect(data!.hero.title).toMatch(/rac/i);
    expect(data!.tools.items.some((t) => t.slug === "race-time-predictor")).toBe(
      true,
    );
    expect(data!.products?.title.toLowerCase()).toContain("race");
  });

  it("exposes running road discipline in repositories", () => {
    const discipline = getDisciplineBySlug("running", "road", { isDev: false });
    expect(discipline?.id).toBe("disc-running-road");
    expect(getBestGuideBySlug("running-shoes", { isDev: false })).toBeTruthy();
  });
});
