import { describe, expect, it } from "vitest";
import { getProductBySlug } from "@/repositories/products";
import { getBestGuides } from "@/repositories";
import {
  scoreAlternativePair,
  scoreComparisonPair,
  scoreProductInBest,
  bestGuideContext,
} from "@/lib/decision-graph/semantic-quality";

const PROD = { isDev: false as const };

describe("Fix 70 decision-graph semantic quality", () => {
  it("treats Superblast 2 and Novablast 6 as substitutable max-cushion trainers", () => {
    const a = getProductBySlug("asics-superblast-2", PROD)!;
    const b = getProductBySlug("asics-novablast-6", PROD)!;
    const s = scoreAlternativePair(a, b);
    expect(s.cls === "STRONG" || s.cls === "VALID").toBe(true);
  });

  it("treats Sense Ride 5 vs Peregrine 15 as a trail substitute, not invalid", () => {
    const a = getProductBySlug("salomon-sense-ride-5", PROD)!;
    const b = getProductBySlug("saucony-peregrine-15", PROD)!;
    expect(scoreAlternativePair(a, b).cls).not.toBe("INVALID");
  });

  it("does not treat Miler vs Capilene as tee vs headwear", () => {
    const a = getProductBySlug("nike-dri-fit-miler-men", PROD)!;
    const b = getProductBySlug("patagonia-capilene-cool-daily-men", PROD)!;
    const s = scoreComparisonPair(a, b);
    expect(s.cls).not.toBe("INVALID");
  });

  it("rejects GOCap vs Notch beanie as a substitute, not a Capilene false positive", () => {
    const cap = getProductBySlug("ciele-gocap-athletics", PROD)!;
    const beanie = getProductBySlug("brooks-notch-thermal-beanie", PROD)!;
    expect(scoreAlternativePair(cap, beanie).cls).toBe("INVALID");
    const miler = getProductBySlug("nike-dri-fit-miler-men", PROD)!;
    const capilene = getProductBySlug("patagonia-capilene-cool-daily-men", PROD)!;
    expect(scoreAlternativePair(miler, capilene).cls).not.toBe("INVALID");
  });

  it("rejects Horizon T202 vs Woodway Curve as an alternatives substitute", () => {
    const a = getProductBySlug("horizon-t202-treadmill", PROD)!;
    const b = getProductBySlug("woodway-curve-trainer", PROD)!;
    expect(scoreAlternativePair(a, b).cls).toBe("INVALID");
    expect(scoreComparisonPair(a, b).cls).not.toBe("INVALID");
  });

  it("rejects Torin 8 as a Best Trail Running Shoes recommendation", () => {
    const guide = getBestGuides(PROD).find((g) => g.slug === "trail-running-shoes")!;
    expect(guide.recommendations.some((r) => r.productId === "prod-torin-8")).toBe(
      false,
    );
    const torin = getProductBySlug("altra-torin-8", PROD)!;
    const ctx = bestGuideContext(guide.slug, guide.title);
    expect(scoreProductInBest(torin, ctx, guide.categoryId).cls).toBe("INVALID");
  });
});
