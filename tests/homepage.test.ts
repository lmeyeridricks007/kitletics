import { describe, expect, it } from "vitest";
import { getHomepageData } from "@/lib/home/get-homepage-data";

describe("homepage data", () => {
  it("surfaces multiple best strips beyond running shoes", () => {
    const data = getHomepageData({ region: "NL" });
    expect(data.bestSections.length).toBeGreaterThanOrEqual(4);

    const eyebrows = data.bestSections.map((s) => s.eyebrow);
    expect(eyebrows).toEqual(
      expect.arrayContaining(["Running", "GPS watches", "Trail", "Running gear"]),
    );

    for (const section of data.bestSections) {
      expect(section.products.length).toBeGreaterThanOrEqual(3);
      expect(section.href.startsWith("/best/")).toBe(true);
    }

    expect(data.finder.ctaHref).toBe("/tools/running-shoe-finder");
    expect(data.featuredGuide?.href).toMatch(/^\/guides\/how-to-choose-running-/);
    expect(data.comparisons.items.length).toBeGreaterThanOrEqual(2);
    expect(
      data.comparisons.items.some((c) => !c.slug.includes("novablast")),
    ).toBe(true);
  });

  it("uses topic-correct unique images for latest guides and journal", () => {
    const data = getHomepageData({ region: "NL" });
    expect(data.latestGuides.length).toBe(3);

    const bySlug = new Map(data.latestGuides.map((g) => [g.slug, g.imageSrc]));
    expect(bySlug.get("how-to-choose-running-watch")).toMatch(/watches\//);
    expect(bySlug.get("how-to-choose-running-shoes")).toMatch(
      /running\/(products|shoes)|guide-running-shoes/,
    );
    expect(bySlug.get("open-ear-vs-in-ear-running-headphones")).toMatch(
      /headphones\//,
    );

    const guideSrcs = data.latestGuides.map((g) => g.imageSrc);
    expect(new Set(guideSrcs).size).toBe(guideSrcs.length);

    for (const g of data.latestGuides) {
      expect(g.imageSrc).not.toMatch(
        /guide-how-to-choose|guide-tennis|guide-home-gym/,
      );
    }

    // Journal must reuse the same topic image — never a positional filler list
    expect(data.journalItems.length).toBe(data.latestGuides.length);
    for (let i = 0; i < data.latestGuides.length; i++) {
      expect(data.journalItems[i]?.imageSrc).toBe(data.latestGuides[i]?.imageSrc);
      expect(data.journalItems[i]?.href).toBe(data.latestGuides[i]?.href);
    }

    expect(data.featuredGuide?.imageSrc).not.toMatch(
      /guide-how-to-choose|guide-tennis/,
    );
  });
});
