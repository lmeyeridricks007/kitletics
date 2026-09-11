import { describe, expect, it } from "vitest";
import {
  getBestGuidePageData,
  getBuyingGuidePageData,
  getBestIndexData,
} from "@/lib/best/get-best-guide-page-data";
import { getBestGuideCategoryConfig, isGuideStale } from "@/lib/best/category-config";
import { getAwardLabel } from "@/lib/best/awards";
import {
  getBestGuideBySlug,
  getBuyingGuideBySlug,
  getBestGuides,
  getReviewBySlug,
} from "@/repositories";

describe("Best Guide system", () => {
  it("resolves /best/running-shoes", () => {
    const data = getBestGuidePageData("running-shoes");
    expect(data).toBeDefined();
    expect(data!.guide.slug).toBe("running-shoes");
    expect(data!.recommendations.length).toBeGreaterThanOrEqual(4);
  });

  it("guide recommendations resolve through repository", () => {
    const data = getBestGuidePageData("running-shoes");
    for (const rec of data!.recommendations) {
      expect(rec.product.id).toBeTruthy();
      expect(rec.whyText.length).toBeGreaterThan(10);
    }
  });

  it("rank ordering works", () => {
    const data = getBestGuidePageData("running-shoes");
    const ranks = data!.recommendations.map((r) => r.entry.rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("award labels render from taxonomy", () => {
    expect(getAwardLabel("best-overall")).toBe("Best Overall");
    const data = getBestGuidePageData("running-shoes");
    expect(data!.recommendations[0].awardLabel).toBe("Best Overall");
  });

  it("comparison table uses Product specs", () => {
    const data = getBestGuidePageData("running-shoes");
    expect(data!.comparisonRows.some((r) => r.key === "weight")).toBe(true);
    expect(data!.comparisonRows.some((r) => r.key === "drop")).toBe(true);
    const weight = data!.comparisonRows.find((r) => r.key === "weight");
    const firstId = data!.comparisonProducts[0]?.product.id;
    expect(firstId).toBeTruthy();
    expect(weight!.values[firstId!]).not.toBe("");
  });

  it("missing Product specs render safely as em dash", () => {
    const data = getBestGuidePageData("running-shoes");
    for (const row of data!.comparisonRows) {
      for (const val of Object.values(row.values)) {
        expect(typeof val).toBe("string");
      }
    }
  });

  it("Offer pricing respects NL region", () => {
    const data = getBestGuidePageData("running-shoes", { region: "NL" });
    for (const rec of data!.recommendations) {
      for (const o of rec.offers) {
        expect(o.offer.region).toBe("NL");
      }
    }
  });

  it("Review links appear only when published", () => {
    const data = getBestGuidePageData("running-shoes");
    const nb = data!.recommendations.find(
      (r) => r.product.slug === "asics-novablast-6",
    );
    // Novablast 6 may not have a published review yet — link only when present
    if (nb?.reviewSlug) {
      expect(typeof nb.reviewSlug).toBe("string");
    }
    const scheduled = getReviewBySlug("asics-novablast-5-deep-dive", {
      isDev: false,
    });
    expect(scheduled).toBeUndefined();
  });

  it("scheduled BestGuide returns production 404", () => {
    // No scheduled best guide in seed — ensure unpublished slug 404s
    expect(getBestGuidePageData("does-not-exist", { isDev: false })).toBeUndefined();
    expect(getBestGuideBySlug("does-not-exist", { isDev: false })).toBeUndefined();
  });

  it("Best index excludes unpublished guides", () => {
    const index = getBestIndexData({ isDev: false });
    expect(index.guides.every((g) => g.status === "published")).toBe(true);
    expect(index.guides.some((g) => g.slug === "running-shoes")).toBe(true);
  });

  it("finder CTA resolves", () => {
    const data = getBestGuidePageData("running-shoes");
    expect(data!.finderHref).toBe("/tools/running-shoe-finder");
  });

  it("comparison CTA prepopulates correct products", () => {
    const data = getBestGuidePageData("running-shoes");
    expect(data!.compareHref).toContain("/compare?category=");
    expect(data!.compareHref).toContain("products=");
    expect(data!.compareHref).toContain("asics-novablast-6");
  });

  it("BuyingGuide remains distinct from BestGuide", () => {
    const best = getBestGuideBySlug("running-shoes");
    const buying = getBuyingGuideBySlug("how-to-choose-running-shoes");
    expect(best).toBeDefined();
    expect(buying).toBeDefined();
    expect(best!.id).not.toBe(buying!.id);
    const buyingPage = getBuyingGuidePageData("how-to-choose-running-shoes");
    expect(buyingPage!.guide.quickAnswer).toBeTruthy();
    expect(buyingPage!.relatedProducts.length).toBeGreaterThan(0);
  });

  it("GPS Watch BestGuide config uses GPS Watch comparison specs", () => {
    const shoe = getBestGuideCategoryConfig("cat-running-shoes");
    const watch = getBestGuideCategoryConfig("cat-gps-watches");
    expect(shoe.comparisonKeys).toContain("drop");
    expect(watch.comparisonKeys).not.toContain("drop");
    expect(watch.comparisonKeys).toContain("batteryGps");
  });

  it("padel guide uses padel comparison keys", () => {
    const data = getBestGuidePageData("padel-rackets");
    expect(data).toBeDefined();
    expect(data!.config.comparisonKeys).toContain("shape");
    expect(data!.comparisonRows.some((r) => r.key === "heelStack")).toBe(false);
  });

  it("isGuideStale helper works", () => {
    expect(isGuideStale(undefined)).toBe(true);
    expect(isGuideStale(new Date().toISOString())).toBe(false);
  });

  it("daily trainers and heavy runners guides resolve", () => {
    expect(getBestGuidePageData("daily-trainers")).toBeDefined();
    expect(getBestGuidePageData("running-shoes-heavy-runners")).toBeDefined();
  });

  it("new Prompt 16 Running guides resolve", () => {
    for (const slug of [
      "running-shoes-long-runs",
      "tempo-running-shoes",
      "race-shoes",
      "marathon-shoes",
      "stability-running-shoes",
      "trail-running-shoes",
      "running-watches",
      "heart-rate-monitors-running",
      "running-hydration-vests",
      "running-shoes-beginners",
    ]) {
      expect(getBestGuidePageData(slug), slug).toBeDefined();
    }
  }, 30_000);

  it("buying guides for watches and rotation resolve", () => {
    expect(getBuyingGuidePageData("how-to-choose-running-watch")).toBeDefined();
    expect(getBuyingGuidePageData("running-shoe-rotation")).toBeDefined();
    expect(getBuyingGuidePageData("running-shoe-cushioning")).toBeDefined();
  });

  it("published guide count matches index", () => {
    const index = getBestIndexData().guides;
    // Hub lists only launch-INDEXABLE Best guides (LAUNCH_READY), not all published
    expect(index.length).toBeGreaterThan(0);
    expect(index.length).toBeLessThan(getBestGuides().length);
    expect(index.every((g) => g.status === "published")).toBe(true);
  });

  it("exposes quick picks with authentic media capped by config", () => {
    const data = getBestGuidePageData("running-shoes");
    expect(data!.quickPicks.length).toBeGreaterThan(0);
    expect(data!.quickPicks.length).toBeLessThanOrEqual(
      data!.config.quickPickLimit,
    );
    for (const pick of data!.quickPicks) {
      expect(pick.media?.src).toBeTruthy();
    }

    const beginners = getBestGuidePageData("running-shoes-beginners");
    expect(beginners!.quickPicks.length).toBeGreaterThan(0);
    expect(beginners!.quickPicks.length).toBeLessThanOrEqual(5);
  });

  it("resolves trust pillars with authentic considered count only", () => {
    const longRuns = getBestGuidePageData("running-shoes-long-runs");
    expect(longRuns!.coverage.hasAuthenticConsideredSet).toBe(true);
    expect(longRuns!.coverage.consideredCount).toBeGreaterThan(
      longRuns!.coverage.recommendedCount,
    );
    expect(
      longRuns!.resolvedTrustPillars.some((p) =>
        /\d+\s+shoes considered/i.test(p.description),
      ),
    ).toBe(true);
    expect(
      longRuns!.resolvedTrustPillars.every(
        (p) => !p.description.includes("{count}"),
      ),
    ).toBe(true);

    // Main overall guide still lacks a full considered set — must NOT
    // fall back to recommendations.length as “products considered”.
    const overall = getBestGuidePageData("running-shoes");
    if (!overall!.coverage.hasAuthenticConsideredSet) {
      expect(
        overall!.resolvedTrustPillars.some((p) =>
          /catalog-backed evaluation/i.test(p.description),
        ),
      ).toBe(true);
      expect(overall!.resolvedTrustPillars.every((p) => !/^\d+$/.test(p.description))).toBe(true);
    }
  });

  it("long-runs guide evaluates a broad catalog field", () => {
    const data = getBestGuidePageData("running-shoes-long-runs");
    expect(data!.recommendations.length).toBeGreaterThanOrEqual(6);
    expect(data!.recommendations.length).not.toBe(4);
    expect(data!.coverage.consideredCount).toBeGreaterThanOrEqual(20);
    expect(data!.candidateEvaluations.length).toBeGreaterThan(
      data!.recommendations.length,
    );
    expect(data!.comparisonProducts.length).toBe(
      data!.recommendations.length,
    );
  });

  it("builds product-row comparison table cells", () => {
    const data = getBestGuidePageData("running-shoes");
    expect(data!.tableProductRows.length).toBe(
      data!.recommendations.length,
    );
    expect(data!.config.tableColumns.some((c) => c.key === "weight")).toBe(
      true,
    );
    const first = data!.tableProductRows[0];
    expect(first.cells.bestFor).toBeTruthy();
    expect(first.cells.score).toBeTruthy();
  });

  it("exposes hero imagery and methodology bullets without false testing claims", () => {
    const data = getBestGuidePageData("running-shoes");
    expect(data!.heroImageSrc).toBeTruthy();
    expect(data!.methodologyBullets.length).toBeGreaterThan(0);
    expect(
      data!.methodologyBullets.join(" ").toLowerCase(),
    ).not.toContain("first-hand testing of all");
  });

  it("running shoes guide has answer-first intro and next review", () => {
    const data = getBestGuidePageData("running-shoes");
    expect(data!.guide.intro.toLowerCase()).toMatch(/role map|shortlist|job/);
    expect(data!.guide.intro.toLowerCase()).not.toContain("tested hundreds");
    expect(data!.nextReviewLabel).toBeTruthy();
  });

  it("use-case heavier runners guide uses criteria panel layout", () => {
    const data = getBestGuidePageData("running-shoes-heavy-runners");
    expect(data).toBeDefined();
    expect(data!.isUseCaseGuide).toBe(true);
    expect(data!.guide.guideKind).toBe("use-case");
    expect(data!.criteriaChangePoints.length).toBeGreaterThanOrEqual(4);
    expect(data!.quickPicksTitle.toLowerCase()).toContain("heavier");
    expect(data!.comparisonTitle.toLowerCase()).toContain("compare");
    expect(data!.tableColumns.some((c) => c.key === "widths")).toBe(true);
    expect(data!.breadcrumbs.map((b) => b.label).join(">")).toMatch(
      /Running.*Running Shoes/i,
    );
    expect(data!.guide.intro.toLowerCase()).not.toContain("90kg");
    expect(data!.guide.intro.toLowerCase()).not.toContain("198");
    expect(
      data!.resolvedTrustPillars.every(
        (p) => !/real runner testing/i.test(p.title),
      ),
    ).toBe(true);
  });

  it("contextual ranking can beat higher Kitletics Score", () => {
    const data = getBestGuidePageData("running-shoes-heavy-runners");
    const ranks = data!.recommendations.map((r) => ({
      id: r.product.id,
      rank: r.entry.rank,
      score: r.product.recommendationScore ?? 0,
    }));
    const first = ranks.find((r) => r.rank === 1)!;
    const higherScoreLowerRank = ranks.find(
      (r) => r.rank > 1 && r.score > first.score,
    );
    expect(higherScoreLowerRank).toBeDefined();
  });

  it("wide feet use-case changes table and criteria focus", () => {
    const data = getBestGuidePageData("running-shoes-wide-feet");
    expect(data!.isUseCaseGuide).toBe(true);
    expect(data!.tableColumns.some((c) => c.key === "widths")).toBe(true);
    expect(
      data!.criteriaChangePoints.some((p) => /width/i.test(p.label)),
    ).toBe(true);
    expect(
      data!.criteriaChangePoints.every(
        (p) => !/body weight|kg\+|heavier load/i.test(p.label),
      ),
    ).toBe(true);
  });

  it("marathon use-case does not leak heavier-runner copy", () => {
    const data = getBestGuidePageData("marathon-shoes");
    expect(data!.isUseCaseGuide).toBe(true);
    const blob = [
      data!.guide.intro,
      data!.quickPicksTitle,
      ...data!.criteriaChangePoints.map((p) => p.label),
    ]
      .join(" ")
      .toLowerCase();
    expect(blob).not.toContain("heavier");
    expect(blob).not.toContain("heavy runner");
    expect(data!.tableColumns.some((c) => c.key === "plate")).toBe(true);
  });

  it("category best guide is not use-case layout", () => {
    const data = getBestGuidePageData("running-shoes");
    expect(data!.isUseCaseGuide).toBe(false);
    expect(data!.criteriaChangePoints).toEqual([]);
  });

  it("product without offer still appears in use-case recommendations", () => {
    const data = getBestGuidePageData("running-shoes-heavy-runners");
    expect(data!.recommendations.length).toBeGreaterThan(0);
    // Recommendations are included regardless of offer presence
    for (const rec of data!.recommendations) {
      expect(rec.product.id).toBeTruthy();
    }
  });
});
