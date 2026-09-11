import { describe, expect, it } from "vitest";
import { resolveNavigationContext } from "@/lib/navigation/contextual-nav";

describe("resolveNavigationContext", () => {
  it("shows Running Overview on /running", () => {
    const ctx = resolveNavigationContext({
      pathname: "/running",
      contentFlags: {
        best: true,
        reviews: true,
        guides: true,
        tools: true,
        setups: true,
      },
    });
    expect(ctx.showContextualNav).toBe(true);
    expect(ctx.secondaryContextKey).toBe("running");
    expect(ctx.primaryNavKey).toBe("running");
    expect(ctx.activeItemId).toBe("overview");
    expect(ctx.visibleItems.map((i) => i.label)).toEqual([
      "Overview",
      "Shoes / Gear",
      "Best",
      "Reviews",
      "Guides",
      "Compare",
      "Finders",
      "Tools",
      "Gear Sets",
    ]);
  });

  it("uses Shoes context on /running/shoes with Shoes primary", () => {
    const ctx = resolveNavigationContext({ pathname: "/running/shoes" });
    expect(ctx.showContextualNav).toBe(true);
    expect(ctx.secondaryContextKey).toBe("shoes");
    expect(ctx.primaryNavKey).toBe("shoes");
    expect(ctx.activeItemId).toBe("running-shoes");
  });

  it("activates Best on /best?sport=running", () => {
    const ctx = resolveNavigationContext({
      pathname: "/best",
      searchParams: { sport: "running" },
    });
    expect(ctx.showContextualNav).toBe(true);
    expect(ctx.secondaryContextKey).toBe("running");
    expect(ctx.primaryNavKey).toBe("running");
    expect(ctx.activeItemId).toBe("best");
  });

  it("keeps Shoes context on /reviews?domain=shoes", () => {
    const ctx = resolveNavigationContext({
      pathname: "/reviews",
      searchParams: { domain: "shoes" },
    });
    expect(ctx.showContextualNav).toBe(true);
    expect(ctx.secondaryContextKey).toBe("shoes");
    expect(ctx.primaryNavKey).toBe("shoes");
    expect(ctx.activeItemId).toBe("reviews");
  });

  it("keeps Shoes context on /guides?domain=shoes", () => {
    const ctx = resolveNavigationContext({
      pathname: "/guides",
      searchParams: { domain: "shoes" },
    });
    expect(ctx.showContextualNav).toBe(true);
    expect(ctx.secondaryContextKey).toBe("shoes");
    expect(ctx.primaryNavKey).toBe("shoes");
    expect(ctx.activeItemId).toBe("guides");
  });

  it("keeps Shoes context on /brands?domain=shoes", () => {
    const ctx = resolveNavigationContext({
      pathname: "/brands",
      searchParams: { domain: "shoes" },
    });
    expect(ctx.showContextualNav).toBe(true);
    expect(ctx.secondaryContextKey).toBe("shoes");
    expect(ctx.primaryNavKey).toBe("shoes");
    expect(ctx.activeItemId).toBe("brands");
  });

  it("keeps Shoes context on /tools?domain=shoes&type=finder", () => {
    const ctx = resolveNavigationContext({
      pathname: "/tools",
      searchParams: { domain: "shoes", type: "finder" },
    });
    expect(ctx.showContextualNav).toBe(true);
    expect(ctx.secondaryContextKey).toBe("shoes");
    expect(ctx.primaryNavKey).toBe("shoes");
    expect(ctx.activeItemId).toBe("finders");
  });

  it("keeps Shoes context on /compare?domain=shoes&category=running-shoes", () => {
    const ctx = resolveNavigationContext({
      pathname: "/compare",
      searchParams: { domain: "shoes", category: "running-shoes" },
    });
    expect(ctx.showContextualNav).toBe(true);
    expect(ctx.secondaryContextKey).toBe("shoes");
    expect(ctx.primaryNavKey).toBe("shoes");
    expect(ctx.activeItemId).toBe("compare");
  });

  it("keeps Running context on /compare?sport=running&category=running-shoes", () => {
    const ctx = resolveNavigationContext({
      pathname: "/compare",
      searchParams: { sport: "running", category: "running-shoes" },
    });
    expect(ctx.showContextualNav).toBe(true);
    expect(ctx.secondaryContextKey).toBe("running");
    expect(ctx.primaryNavKey).toBe("running");
    expect(ctx.activeItemId).toBe("compare");
  });

  it("keeps Running Finders without remapping to Shoes", () => {
    const ctx = resolveNavigationContext({
      pathname: "/tools",
      searchParams: { sport: "running", type: "finder" },
    });
    expect(ctx.showContextualNav).toBe(true);
    expect(ctx.secondaryContextKey).toBe("running");
    expect(ctx.primaryNavKey).toBe("running");
    expect(ctx.activeItemId).toBe("finders");
  });

  it("uses Running context on /reviews?sport=running", () => {
    const ctx = resolveNavigationContext({
      pathname: "/reviews",
      searchParams: { sport: "running" },
    });
    expect(ctx.secondaryContextKey).toBe("running");
    expect(ctx.primaryNavKey).toBe("running");
    expect(ctx.activeItemId).toBe("reviews");
  });

  it("uses Running context on /reviews?sport=running", () => {
    const ctx = resolveNavigationContext({
      pathname: "/reviews",
      searchParams: { sport: "running" },
    });
    expect(ctx.secondaryContextKey).toBe("running");
    expect(ctx.primaryNavKey).toBe("running");
    expect(ctx.activeItemId).toBe("reviews");
  });

  it("does not remap Shoes Best hub to Running when domain=shoes", () => {
    const ctx = resolveNavigationContext({
      pathname: "/best",
      searchParams: { domain: "shoes", sport: "running" },
    });
    expect(ctx.secondaryContextKey).toBe("shoes");
    expect(ctx.primaryNavKey).toBe("shoes");
    expect(ctx.activeItemId).toBe("best");
  });

  it("suppresses contextual on product detail", () => {
    const ctx = resolveNavigationContext({
      pathname: "/products/brooks-adrenaline-gts-25",
    });
    expect(ctx.showContextualNav).toBe(false);
    expect(ctx.localNavMode).toBe("product");
  });

  it("suppresses contextual on discipline hubs", () => {
    const ctx = resolveNavigationContext({ pathname: "/running/road" });
    expect(ctx.showContextualNav).toBe(false);
    expect(ctx.localNavMode).toBe("discipline");
    expect(ctx.primaryNavKey).toBe("running");
  });

  it("suppresses contextual on brand detail", () => {
    const ctx = resolveNavigationContext({ pathname: "/brands/asics" });
    expect(ctx.showContextualNav).toBe(false);
    expect(ctx.localNavMode).toBe("brand");
  });

  it("suppresses contextual on best guide detail", () => {
    const ctx = resolveNavigationContext({
      pathname: "/best/running-shoes-long-runs",
    });
    expect(ctx.showContextualNav).toBe(false);
    expect(ctx.localNavMode).toBe("detail");
  });

  it("suppresses contextual on home and search", () => {
    expect(
      resolveNavigationContext({ pathname: "/" }).showContextualNav,
    ).toBe(false);
    expect(
      resolveNavigationContext({ pathname: "/search" }).showContextualNav,
    ).toBe(false);
  });

  it("prefers Finders over Tools when type=finder", () => {
    const ctx = resolveNavigationContext({
      pathname: "/tools",
      searchParams: { sport: "running", type: "finder" },
    });
    // Scoped tools hubs keep the secondary rail
    expect(ctx.showContextualNav).toBe(true);
    expect(ctx.secondaryContextKey).toBe("running");
    expect(ctx.activeItemId).toBe("finders");
  });

  it("still suppresses bare /tools hub without sport or domain", () => {
    const ctx = resolveNavigationContext({ pathname: "/tools" });
    expect(ctx.showContextualNav).toBe(false);
    expect(ctx.localNavMode).toBe("hub-suppress");
  });

  it("keeps Shoes context with Running Shoes active on /running/shoes filters", () => {
    const ctx = resolveNavigationContext({
      pathname: "/running/shoes",
      searchParams: { type: "daily-trainers" },
    });
    expect(ctx.secondaryContextKey).toBe("shoes");
    expect(ctx.primaryNavKey).toBe("shoes");
    expect(ctx.activeItemId).toBe("running-shoes");
  });
});
