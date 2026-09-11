import { describe, expect, it } from "vitest";
import { getBestGuidePageData } from "@/lib/best/get-best-guide-page-data";
import {
  enrichGuideRecommendation,
  __enrichGuideTest,
} from "@/lib/best/enrich-guide-recommendation";
import type { BestGuideRecommendation } from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";

describe("enrichGuideRecommendation", () => {
  it("detects clinical beginners Recommendation copy as thin", () => {
    expect(
      __enrichGuideTest.isThinWhyText(
        "Strong beginners Recommendation and excellent width availability.",
      ),
    ).toBe(true);
  });

  it("builds readable whyItFits for thin Ghost beginners entry", () => {
    const product = {
      id: "prod-ghost-18",
      name: "Ghost 18",
      strengths: ["Beginner-friendly", "Excellent width range"],
      weaknesses: ["Higher drop", "Less energetic than Novablast-class shoes"],
      specifications: {
        widthOptions: ["narrow", "standard", "wide", "extra-wide"],
        cushionLevel: "high",
        cushionFeel: "soft",
        rideCharacter: "smooth",
        midsole: "DNA LOFT v3",
        stability: "neutral",
      },
    } as unknown as Product;

    const entry: BestGuideRecommendation = {
      productId: "prod-ghost-18",
      rank: 1,
      rationale: "Best beginner daily.",
      whyRecommended:
        "Strong beginners Recommendation and excellent width availability.",
    };

    const enriched = enrichGuideRecommendation({
      guide: {
        slug: "running-shoes-beginners",
        title: "Best Running Shoes for Beginners",
        useCaseIds: ["uc-beginners"],
        intro: "Beginners benefit from forgiving dailies.",
      },
      entry,
      product,
      brand: { name: "Brooks" } as never,
      peers: [
        {
          product: { id: "prod-pegasus-42", name: "Pegasus 42" } as Product,
          entry: {
            productId: "prod-pegasus-42",
            rank: 2,
            rationale: "x",
            summary: "Versatile Nike daily",
          },
        },
      ],
      isTopPick: true,
    });

    expect(enriched.whyItFits?.length).toBeGreaterThanOrEqual(2);
    expect(enriched.whyItFits!.join(" ")).not.toMatch(/Recommendation/i);
    expect(enriched.whyItFits!.join(" ")).toMatch(/beginner|easy|width/i);
    expect(enriched.whyItWon).toBeTruthy();
    expect(enriched.whyItWon!).not.toMatch(/Recommendation/i);
  });
});

describe("best guide page enrichment", () => {
  it("beginners guide Ghost pick explains why it fits", () => {
    const data = getBestGuidePageData("running-shoes-beginners");
    expect(data).toBeDefined();
    const top = data!.recommendations[0]!;
    expect(top.product.name).toMatch(/Ghost/i);
    expect(top.entry.whyItFits?.length).toBeGreaterThanOrEqual(2);
    expect(top.entry.whyItFits!.join(" ").length).toBeGreaterThan(200);
    expect(top.entry.whyItFits!.join(" ")).not.toMatch(
      /Strong beginners Recommendation/i,
    );
    expect(top.entry.whyItWon).toBeTruthy();
  });

  it("beginners comparison table has a key trade-off for every pick", () => {
    const data = getBestGuidePageData("running-shoes-beginners");
    expect(data).toBeDefined();
    const tradeCol = data!.contextComparisonRows.find(
      (c) => c.key === "tradeoff" || /trade/i.test(c.label),
    );
    expect(tradeCol).toBeDefined();
    for (const rec of data!.recommendations) {
      const cell = tradeCol!.values[rec.product.id];
      expect(cell, rec.product.slug).toBeTruthy();
      expect(cell, rec.product.slug).not.toBe("—");
      expect(cell!.length, rec.product.slug).toBeGreaterThan(10);
    }
  });

  it("enriches thin picks across other guides without clinical Recommendation labels", () => {
    for (const slug of [
      "running-shoes-heavy-runners",
      "daily-trainers",
      "max-cushion-running-shoes",
      "trail-running-shoes",
    ]) {
      const data = getBestGuidePageData(slug);
      expect(data, slug).toBeDefined();
      for (const rec of data!.recommendations) {
        const why = rec.entry.whyItFits?.join(" ") || rec.whyText || "";
        expect(why.length, `${slug}:${rec.product.slug}`).toBeGreaterThan(80);
        expect(why, `${slug}:${rec.product.slug}`).not.toMatch(
          /\bRecommendation\b/,
        );
      }
    }
  });
});
