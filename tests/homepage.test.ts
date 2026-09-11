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
});
