import { describe, expect, it } from "vitest";
import { searchKitletics } from "@/lib/search/engine";
import { expandQueryWithSynonyms } from "@/lib/search/synonyms";
import { resolveBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import { getSportBySlug, getCategories, getBrandBySlug, getBrandGraph } from "@/repositories";
import { reviews } from "@/content/reviews";

describe("search", () => {
  it("ranks exact product match first", () => {
    const hits = searchKitletics("ASICS Novablast 5", { isDev: false });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].type).toBe("product");
    expect(hits[0].title.toLowerCase()).toContain("novablast");
  });

  it("excludes unpublished content in production mode", () => {
    const scheduled = reviews.find((r) => r.status === "scheduled");
    expect(scheduled).toBeTruthy();
    expect(
      isPubliclyVisible(scheduled!, { isDev: false }),
    ).toBe(false);

    const hits = searchKitletics("deep dive", { isDev: false });
    expect(hits.every((h) => h.id !== scheduled!.id)).toBe(true);
  });

  it("resolves synonyms for gps watch", () => {
    const expansions = expandQueryWithSynonyms("gps watch");
    expect(expansions.some((e) => e.includes("running watch"))).toBe(true);
    const hits = searchKitletics("sports watch", { isDev: false });
    expect(hits.some((h) => h.type === "category" || h.type === "product")).toBe(
      true,
    );
  });

  it("resolves trainers to running shoes", () => {
    const hits = searchKitletics("trainers", { isDev: false });
    expect(
      hits.some(
        (h) =>
          h.type === "category" ||
          h.title.toLowerCase().includes("shoe") ||
          h.title.toLowerCase().includes("novablast") ||
          h.title.toLowerCase().includes("ghost"),
      ),
    ).toBe(true);
  });
});

describe("breadcrumbs", () => {
  it("resolves sport → category path", () => {
    const crumbs = resolveBreadcrumbs({
      type: "sport-segment",
      sportSlug: "running",
      segment: "shoes",
    });
    expect(crumbs.map((c) => c.label)).toEqual([
      "Home",
      "Running",
      "Running Shoes",
    ]);
  });

  it("resolves product breadcrumbs", () => {
    const crumbs = resolveBreadcrumbs({
      type: "product",
      productSlug: "asics-novablast-5",
    });
    expect(crumbs[0].label).toBe("Home");
    expect(crumbs[crumbs.length - 1].label).toContain("Novablast");
  });

  it("resolves tool breadcrumbs", () => {
    const crumbs = resolveBreadcrumbs({
      type: "tool",
      toolSlug: "running-shoe-finder",
    });
    expect(crumbs.map((c) => c.label)).toEqual([
      "Home",
      "Tools",
      "Running Shoe Finder",
    ]);
  });
});

describe("sports & gear discovery", () => {
  it("future sports render as non-live", () => {
    const cycling = getSportBySlug("cycling");
    expect(cycling).toBeTruthy();
    expect(cycling!.contentStatus).not.toBe("live");
  });

  it("running is live", () => {
    const running = getSportBySlug("running");
    expect(running?.contentStatus).toBe("live");
  });

  it("gear categories come from repository", () => {
    const categories = getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some((c) => c.slug === "running-shoes")).toBe(true);
  });

  it("brand page graph retrieves products", () => {
    const brand = getBrandBySlug("asics");
    expect(brand).toBeTruthy();
    const graph = getBrandGraph(brand!.id);
    expect(graph?.products.length).toBeGreaterThan(0);
  });
});

describe("empty section helpers", () => {
  it("search returns empty array for blank query", () => {
    expect(searchKitletics("")).toEqual([]);
  });
});
