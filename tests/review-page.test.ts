import { describe, expect, it } from "vitest";
import {
  getReviewPageData,
  getReviewsIndexData,
  REVIEW_TYPE_META,
} from "@/lib/review/get-review-page-data";
import {
  getReviewBySlug,
  getProductBySlug,
  getAuthorBySlug,
  getReviews,
  getProductGraph,
} from "@/repositories";
import { getReviewPageCategoryConfig } from "@/lib/review/category-config";
import {
  getLaunchEligibility,
  shouldPromotePublicly,
} from "@/domain/launch";

describe("Review page system", () => {
  it("resolves flagship Novablast 5 review from slug", () => {
    const data = getReviewPageData("asics-novablast-5");
    expect(data).toBeDefined();
    expect(data!.review.slug).toBe("asics-novablast-5");
    expect(data!.product.slug).toBe("asics-novablast-5");
  });

  it("keeps Product and Review as separate entities/URLs", () => {
    const review = getReviewBySlug("asics-novablast-5");
    const product = getProductBySlug("asics-novablast-5");
    expect(review).toBeDefined();
    expect(product).toBeDefined();
    expect(review!.id).not.toBe(product!.id);
    expect(`/reviews/${review!.slug}`).not.toBe(`/products/${product!.slug}`);
  });

  it("renders expert-research type correctly without Personally Tested", () => {
    const data = getReviewPageData("asics-novablast-5");
    expect(data!.review.reviewType).toBe("expert-research");
    expect(data!.typeMeta.label).toBe("Expert Research Review");
    expect(data!.hasPersonalTest).toBe(false);
    expect(data!.typeMeta.shortLabel).not.toMatch(/Personally Tested/i);
  });

  it("first-hand review type meta exists for future personal tests", () => {
    expect(REVIEW_TYPE_META["first-hand-test"].label).toBe("First-Hand Tested");
  });

  it("testing context module data only when structured details + personal test", () => {
    const data = getReviewPageData("asics-novablast-5");
    expect(data!.review.testingDetails).toBeUndefined();
    expect(data!.hasPersonalTest).toBe(false);
  });

  it("unpublished / scheduled review returns production 404", () => {
    const prod = getReviewBySlug("asics-novablast-5-deep-dive", {
      isDev: false,
    });
    expect(prod).toBeUndefined();
    const page = getReviewPageData("asics-novablast-5-deep-dive", {
      isDev: false,
    });
    expect(page).toBeUndefined();
  });

  it("scheduled review does not leak via product graph in production", () => {
    const graph = getProductGraph("prod-novablast-5", { isDev: false });
    expect(graph?.review?.slug).toBe("asics-novablast-5");
    expect(graph?.review?.slug).not.toBe("asics-novablast-5-deep-dive");
  });

  it("score breakdown is category-driven for running shoes", () => {
    const data = getReviewPageData("asics-novablast-5");
    const config = getReviewPageCategoryConfig("cat-running-shoes");
    for (const item of data!.scoreBreakdown) {
      expect(config.scoreCriteriaKeys).toContain(item.key);
    }
  });

  it("GPS watch review config does not use running shoe sections", () => {
    const shoe = getReviewPageCategoryConfig("cat-running-shoes");
    const watch = getReviewPageCategoryConfig("cat-gps-watches");
    expect(shoe.defaultSectionKeys).toContain("outsole");
    expect(shoe.defaultSectionKeys).toContain("ride");
    expect(watch.defaultSectionKeys).not.toContain("outsole");
    expect(watch.defaultSectionKeys).not.toContain("midsole");
    expect(watch.scoreCriteriaKeys).toContain("gps-accuracy");
    expect(watch.scoreCriteriaKeys).not.toContain("cushioning");
  });

  it("resolves Novablast 6 Editor's Guide review without first-hand badge", () => {
    const data = getReviewPageData("asics-novablast-6");
    expect(data).toBeDefined();
    expect(data!.review.reviewType).toBe("expert-research");
    expect(data!.visibleReviewType).toBe("expert-research");
    expect(data!.visibleTypeMeta.eyebrow).toMatch(/Expert Research/i);
    expect(data!.hasPersonalTest).toBe(false);
    expect(data!.showTestingModule).toBe(false);
    expect(data!.heroImage?.src).toMatch(/novablast-6/);
    expect(data!.heroCriteria.length).toBeGreaterThan(0);
    expect(data!.comparisonTable.length).toBeGreaterThan(1);
  });

  it("offers use shared regional offer logic", () => {
    const data = getReviewPageData("asics-novablast-5");
    expect(data!.offers.every((o) => o.offer.region === "NL")).toBe(true);
    if (data!.offers.length >= 2) {
      const prices = data!.offers.map((o) => o.offer.price);
      // in-stock first then lowest — first should be among cheapest available
      expect(prices[0]).toBeLessThanOrEqual(Math.max(...prices));
    }
  });

  it("alternatives resolve correctly", () => {
    const data = getReviewPageData("asics-novablast-5");
    expect(data!.alternatives.length).toBeGreaterThan(0);
    expect(
      data!.alternatives.every((a) => a.product.id !== data!.product.id),
    ).toBe(true);
  });

  it("comparisons resolve from review.comparisonIds", () => {
    const data = getReviewPageData("asics-novablast-5");
    expect(data!.comparisons.length).toBeGreaterThan(0);
  });

  it("reviewer profile resolves", () => {
    const author = getAuthorBySlug("kitletics-editorial");
    expect(author).toBeDefined();
    expect(author!.name).toBe("Kitletics Editorial");
    const data = getReviewPageData("asics-novablast-5");
    expect(data!.author?.id).toBe(author!.id);
  });

  it("missing review returns undefined (404)", () => {
    expect(getReviewPageData("does-not-exist")).toBeUndefined();
  });

  it("display score aligns with product recommendation score", () => {
    const data = getReviewPageData("asics-novablast-5");
    expect(data!.displayScore).toBe(data!.product.recommendationScore);
  });

  it("reviews index organises by category and filters by type", () => {
    const all = getReviewsIndexData({ typeFilter: "all" });
    const published = getReviews();
    expect(all.items.length).toBeGreaterThan(0);
    expect(all.items.length).toBeLessThanOrEqual(published.length);
    expect(
      all.items.every((i) =>
        shouldPromotePublicly(
          getLaunchEligibility(
            { kind: "review", entity: i.review },
            { isDev: false },
          ),
        ),
      ),
    ).toBe(true);
    expect(all.byCategory.length).toBeGreaterThan(0);
    const research = getReviewsIndexData({ typeFilter: "expert-research" });
    expect(
      research.items.every((i) => i.review.reviewType === "expert-research"),
    ).toBe(true);
    const tested = getReviewsIndexData({ typeFilter: "first-hand-test" });
    expect(tested.items.length).toBe(0);
  });

  it("evidence is present on flagship research review", () => {
    const data = getReviewPageData("asics-novablast-5");
    expect(data!.evidence.length).toBeGreaterThanOrEqual(2);
    expect(data!.evidence.every((e) => e.type !== "personal-test")).toBe(true);
  });

  it("flagship reviews enrich to long-form length (3k+ words)", () => {
    for (const slug of ["nike-vomero-18", "asics-novablast-5", "brooks-ghost-18"]) {
      const data = getReviewPageData(slug);
      expect(data).toBeDefined();
      const text = [
        data!.review.summary,
        data!.review.verdict,
        data!.review.bottomLine,
        data!.review.testingContext,
        ...data!.review.pros,
        ...data!.review.cons,
        ...data!.review.whoShouldBuy,
        ...data!.review.whoShouldAvoid,
        ...data!.review.sections.map((s) => `${s.heading} ${s.body}`),
      ]
        .filter(Boolean)
        .join(" ");
      const words = text.trim().split(/\s+/).length;
      expect(words, slug).toBeGreaterThanOrEqual(3000);
      expect(data!.review.sections.length, slug).toBeGreaterThanOrEqual(10);
    }
  });
});
