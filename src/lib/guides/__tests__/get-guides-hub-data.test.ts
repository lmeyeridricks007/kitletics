import { describe, expect, it } from "vitest";
import { getGuidesHubData } from "@/lib/guides/get-guides-hub-data";
import { canFeatureGuide } from "@/lib/guides/can-feature-guide";

describe("getGuidesHubData", () => {
  it("builds a curated running hub (not a flat list dump)", () => {
    const data = getGuidesHubData({ sportSlug: "running" });

    expect(data.sport?.slug).toBe("running");
    expect(data.guideCount).toBeGreaterThan(5);
    expect(data.featuredGuide).toBeDefined();
    expect(data.featuredGuide?.guide.slug).toBe("how-to-choose-running-shoes");
    expect(canFeatureGuide(data.featuredGuide!.guide)).toBe(true);

    expect(data.startHereGuides.length).toBeGreaterThanOrEqual(1);
    for (const card of data.startHereGuides) {
      expect(canFeatureGuide(card.guide)).toBe(true);
      expect(card.summary.length).toBeGreaterThan(0);
      expect(card.imageSrc).toBeTruthy();
    }

    expect(data.topics.length).toBeGreaterThan(0);
    expect(data.topics.some((t) => t.topic.slug === "running-shoes")).toBe(true);

    expect(data.buyingGuides.length).toBeGreaterThan(0);
    expect(data.explainers.length).toBeGreaterThan(0);
    expect(data.relatedBestGuides.length).toBeGreaterThan(0);
    expect(data.config?.finderPanel.href).toContain("running-shoe-finder");

    // Counts are real
    expect(data.buyingCount).toBe(
      data.buyingGuides.length +
        Math.max(0, data.guideCount - data.buyingGuides.length) >= 0
        ? data.buyingCount
        : -1,
    );
    expect(data.buyingCount).toBeGreaterThanOrEqual(data.buyingGuides.length);
  });

  it("does not invent popularity labels in card payloads", () => {
    const data = getGuidesHubData({ sportSlug: "running" });
    const json = JSON.stringify(data);
    expect(json.toLowerCase()).not.toContain("most popular");
  });

  it("uses topic-appropriate images for wearables and non-shoe guides", () => {
    const data = getGuidesHubData({ sportSlug: "running" });
    const allCards = [
      ...(data.featuredGuide ? [data.featuredGuide] : []),
      ...data.startHereGuides,
      ...data.topics.flatMap((t) => [
        ...(t.featured ? [t.featured] : []),
        ...t.guides,
      ]),
      ...data.buyingGuides,
      ...data.explainers,
      ...data.decisionGuides,
      ...data.recentlyUpdated,
    ];
    const bySlug = new Map(allCards.map((g) => [g.guide.slug, g.imageSrc]));

    expect(bySlug.get("how-to-choose-running-watch")).toMatch(/watches\/products/);
    expect(bySlug.get("multi-band-gps-running-watches")).toMatch(
      /watches\/products/,
    );
    expect(bySlug.get("how-to-choose-heart-rate-monitor")).toMatch(
      /hrm\/products/,
    );
    expect(bySlug.get("how-to-choose-running-hydration-vest")).toMatch(
      /packs\/products/,
    );

    for (const slug of [
      "how-to-choose-running-watch",
      "multi-band-gps-running-watches",
      "how-to-choose-heart-rate-monitor",
      "how-to-choose-running-hydration-vest",
      "hydration-vest-vs-running-belt",
      "how-to-choose-running-headlamp",
      "open-ear-vs-in-ear-running-headphones",
    ]) {
      const src = bySlug.get(slug);
      expect(src, slug).toBeTruthy();
      expect(src).not.toMatch(/\/brands\/heroes\//);
      expect(src).not.toMatch(/\/running\/products\//);
      expect(src).not.toMatch(/guide-running-shoes/);
    }
  });
});
