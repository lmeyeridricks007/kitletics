import { describe, expect, it } from "vitest";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";
import { getAlternativesPageConfig } from "@/lib/product/alternatives-config";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { getAllProductRelationships } from "@/repositories/relationships";
import { getProductBySlug } from "@/repositories";
import { isAuthenticProductMedia } from "@/lib/product/media";

describe("Product Alternatives page data", () => {
  it("builds Novablast 6 alternatives with diverse reasons", () => {
    const data = getAlternativesPageData("asics-novablast-6", { isDev: false });
    expect(data).toBeDefined();
    expect(data!.alternatives.length).toBeGreaterThanOrEqual(4);
    expect(data!.indexable).toBe(true);
    expect(data!.source.media).toBeDefined();
    expect(isAuthenticProductMedia(data!.source.media)).toBe(true);

    const reasonIds = new Set(data!.alternatives.map((a) => a.reasonId));
    expect(reasonIds.has("more-cushioned")).toBe(true);
    expect(reasonIds.has("previous-generation")).toBe(true);
    expect(data!.reasonGroups.length).toBeGreaterThanOrEqual(4);
  });

  it("keeps previous generation as previous-generation not better-value", () => {
    const data = getAlternativesPageData("asics-novablast-6", { isDev: false });
    const nb5 = data!.alternatives.find(
      (a) => a.product.slug === "asics-novablast-5",
    );
    expect(nb5?.reasonId).toBe("previous-generation");
  });

  it("does not reverse more-cushioned direction", () => {
    const clifton = getAlternativesPageData("hoka-clifton-10", { isDev: false });
    const nb6AsMoreCushioned = clifton?.alternatives.find(
      (a) =>
        a.product.slug === "asics-novablast-6" &&
        a.reasonId === "more-cushioned",
    );
    expect(nb6AsMoreCushioned).toBeUndefined();
  });

  it("includes source row in comparison table", () => {
    const data = getAlternativesPageData("asics-novablast-6", { isDev: false });
    expect(data!.comparisonRows[0]?.isSource).toBe(true);
    expect(data!.comparisonRows.length).toBeGreaterThan(2);
  });

  it("uses authentic media for alternatives when available", () => {
    const data = getAlternativesPageData("asics-novablast-6", { isDev: false });
    const withMedia = data!.alternatives.filter((a) => a.media);
    expect(withMedia.length).toBeGreaterThan(0);
    for (const a of withMedia) {
      expect(isAuthenticProductMedia(a.media)).toBe(true);
    }
  });

  it("exposes decision better/worse/switch/stay copy", () => {
    const data = getAlternativesPageData("asics-novablast-6", { isDev: false });
    expect(data).toBeDefined();
    expect(data!.source.intro.length).toBeGreaterThan(80);
    for (const alt of data!.alternatives.slice(0, 3)) {
      expect(alt.whyAlternative.length).toBeGreaterThan(40);
      expect(alt.betterAt.length).toBeGreaterThanOrEqual(1);
      expect(alt.worseAt.length).toBeGreaterThanOrEqual(1);
      expect(alt.whoShouldSwitch.toLowerCase()).toMatch(
        /switch|choose|move to/,
      );
      expect(alt.whoShouldStay.toLowerCase()).toMatch(/stay|keep/);
    }
  });

  it("exposes category-aware configs without running leakage for padel", () => {
    const padel = getAlternativesPageConfig("cat-padel-rackets");
    expect(padel.reasons.some((r) => r.title.includes("Control"))).toBe(true);
    expect(padel.reasons.some((r) => r.title.includes("Cushioning"))).toBe(
      false,
    );
  });

  it("eligibility fails for thin products", () => {
    const product = getProductBySlug("asics-novablast-6")!;
    // Use empty relationship set
    const result = canPublishAlternativesPage(product, []);
    expect(result.ok).toBe(false);
  });

  it("loads relationship graph without crash", () => {
    expect(getAllProductRelationships().length).toBeGreaterThan(20);
  });
});
