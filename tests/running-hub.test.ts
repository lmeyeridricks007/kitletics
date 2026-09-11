import { describe, expect, it } from "vitest";
import {
  hasDeclarativeSportHub,
  getSportHubData,
  hasAssembleSportHub,
  assembleSportHubData,
} from "@/lib/sport-hubs";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import {
  getCategoriesBySport,
  getSportBySlug,
  getProductsBySport,
  getToolsBySport,
} from "@/repositories";
import { products } from "@/content/products";
import { isPubliclyVisible } from "@/lib/publishing/resolver";

describe("Running hub (declarative sport-hub)", () => {
  it("uses declarative hub, not the assemble path", () => {
    expect(hasDeclarativeSportHub("running")).toBe(true);
    expect(hasAssembleSportHub("running")).toBe(false);
    expect(hasDeclarativeSportHub("padel")).toBe(true);
    expect(hasAssembleSportHub("fitness")).toBe(true);
  });

  it("assembles live Running data via getSportHubData", () => {
    const hub = getSportHubData({ sportSlug: "running", region: "NL" });
    expect(hub).toBeTruthy();
    expect(hub!.sportSlug).toBe("running");
    expect(hub!.shopCategories.length).toBeGreaterThan(0);
    expect(hub!.bestSection?.products.length).toBeGreaterThan(0);
    expect(hub!.finder.ctaHref).toContain("running-shoe-finder");
  });

  it("resolves Running categories through repositories", () => {
    const sport = getSportBySlug("running");
    expect(sport).toBeTruthy();
    const cats = getCategoriesBySport(sport!.id, { isDev: false });
    expect(cats.some((c) => c.slug === "running-shoes")).toBe(true);
    expect(cats.some((c) => c.slug === "gps-watches")).toBe(true);
  });

  it("excludes unpublished products from featured lists", () => {
    const draft = products.find((p) => p.status === "draft");
    expect(draft).toBeTruthy();
    expect(isPubliclyVisible(draft!, { isDev: false })).toBe(false);

    const hub = getSportHubData({ sportSlug: "running", region: "NL" });
    expect(
      hub!.bestSection?.products.every((p) => p.id !== draft!.id),
    ).toBe(true);
    expect(
      getProductsBySport("sport-running", { isDev: false }).every(
        (p) => p.id !== draft!.id,
      ),
    ).toBe(true);
  });

  it("features Running-relevant tools in footer", () => {
    const hub = getSportHubData({ sportSlug: "running", region: "NL" });
    expect(
      hub!.footer.tools.some((t) => /shoe finder/i.test(t.label)),
    ).toBe(true);
    const repoTools = getToolsBySport("sport-running", { isDev: false });
    expect(repoTools.some((t) => t.slug === "running-shoe-finder")).toBe(true);
  });

  it("resolves Running breadcrumbs correctly", () => {
    const crumbs = resolveBreadcrumbs({ type: "sport", sportSlug: "running" });
    expect(crumbs.map((c) => c.label)).toEqual(["Home", "Running"]);
  });

  it("keeps fitness on the assemble hub path", () => {
    const hub = assembleSportHubData("fitness", { isDev: true });
    expect(hub).toBeTruthy();
    expect(hub!.sport.slug).toBe("fitness");
  });
});
