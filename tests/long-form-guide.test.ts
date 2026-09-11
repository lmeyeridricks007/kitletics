import { describe, expect, it } from "vitest";
import { getLongFormGuidePageData } from "@/lib/guides/get-long-form-guide-page-data";
import { getLongFormGuideConfig } from "@/lib/guides/long-form-config";
import { isAuthenticProductMedia } from "@/lib/product/media";

describe("Long-form buying guide", () => {
  it("loads how-to-choose-running-shoes with rich config", () => {
    const data = getLongFormGuidePageData("how-to-choose-running-shoes", {
      isDev: false,
    });
    expect(data).toBeDefined();
    expect(data!.config?.guideSlug).toBe("how-to-choose-running-shoes");
    expect(data!.config?.toc.length).toBe(8);
    expect(data!.readingMinutes).toBeGreaterThanOrEqual(5);
    expect(data!.productExamples.length).toBeGreaterThanOrEqual(3);
  });

  it("uses authentic product example media when available", () => {
    const data = getLongFormGuidePageData("how-to-choose-running-shoes", {
      isDev: false,
    });
    const withMedia = data!.productExamples.filter((p) => p.media);
    expect(withMedia.length).toBeGreaterThan(0);
    for (const p of withMedia) {
      expect(isAuthenticProductMedia(p.media)).toBe(true);
    }
  });

  it("exposes finder and glossary from config", () => {
    const config = getLongFormGuideConfig("how-to-choose-running-shoes");
    expect(config?.finder?.toolSlug).toBe("running-shoe-finder");
    expect(config?.glossaryTerms.length).toBeGreaterThanOrEqual(4);
    expect(config?.needs.length).toBe(5);
    expect(config?.factors.length).toBeGreaterThanOrEqual(4);
  });

  it("loads running-shoe-drop as a deep explainer", () => {
    const data = getLongFormGuidePageData("running-shoe-drop", {
      isDev: false,
    });
    expect(data).toBeDefined();
    expect(data!.config?.layout).toBe("explainer");
    expect(data!.config?.explainer?.blocks.length).toBeGreaterThanOrEqual(12);
    expect(data!.productExamples.length).toBeGreaterThanOrEqual(3);
    expect(data!.faqs.length).toBeGreaterThanOrEqual(4);
  });

  it("still resolves previously thin guides with rich config after backfill", () => {
    const data = getLongFormGuidePageData("how-to-choose-running-headlamp", {
      isDev: false,
    });
    expect(data).toBeDefined();
    expect(data!.config?.layout).toBe("explainer");
    expect(data!.config?.explainer?.blocks.length).toBeGreaterThanOrEqual(10);
    expect(data!.guide.sections.length).toBeGreaterThan(0);
  });

  it("builds breadcrumbs with category when available", () => {
    const data = getLongFormGuidePageData("how-to-choose-running-shoes", {
      isDev: false,
    });
    const labels = data!.breadcrumbs.map((b) => b.label);
    expect(labels[0]).toBe("Home");
    expect(labels).toContain("Guides");
    expect(labels).toContain("Running Shoes");
  });

  it("loads stability-shoes-explained as explainer decision guide", () => {
    const data = getLongFormGuidePageData("stability-shoes-explained", {
      isDev: false,
    });
    expect(data).toBeDefined();
    expect(data!.config?.layout).toBe("explainer");
    expect(data!.config?.explainer?.blocks.length).toBeGreaterThanOrEqual(10);
    expect(data!.config?.explainer?.quickAnswerBullets.length).toBeGreaterThanOrEqual(3);
    expect(data!.productExamples.length).toBeGreaterThanOrEqual(4);
    expect(data!.readingMinutes).toBeGreaterThanOrEqual(8);
    expect(data!.faqs.length).toBeGreaterThanOrEqual(5);
  });
});
