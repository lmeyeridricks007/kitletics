import { describe, expect, it } from "vitest";
import type { Review } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";
import {
  selectWinnerForSlug,
  selectWinningReviews,
  type RankedReviewCandidate,
} from "@/content/review-source-precedence";
import {
  reviewMergeDecisions,
  rankedReviewCandidates,
} from "@/content/reviews";
import { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch";
import { canPublishReview } from "@/lib/review/can-publish";
import { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getProductReviewSummary } from "@/lib/product/get-product-review-summary";
import { getReviewBySlug, getAuthorById, getProductById, getEvidenceForIds, getProductBySlug } from "@/repositories";
import { synthesizeUniqueExpertResearch } from "@/domain/review-agent/unique-expert-research";

const PROD = { isDev: false as const };

function reviewFixture(
  partial: Partial<Review> & Pick<Review, "id" | "slug" | "productId">,
): Review {
  return {
    title: `${partial.slug} Review`,
    reviewType: "expert-research",
    verdict: "A catalogued daily trainer for easy miles when that is the weekly job.",
    summary:
      "Shortlist this tool when easy miles are the job. Walk when you need a different specialist.",
    score: 82,
    reviewerId: "author-kitletics-editorial",
    testingContext:
      "We put this guide together from published specs. We have not personally tested this product.",
    sections: [
      {
        id: "sec-overview",
        heading: "What it is",
        body: "A substantive overview paragraph about the product role, who should buy it, and which peer to open instead.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    pros: ["Clear daily-trainer role", "Published spec sheet for the job"],
    cons: ["Not a race-day plate shoe", "Wrong if you need stability"],
    whoShouldBuy: [
      "Buy it when easy road miles are most of the week.",
      "Keep it when the catalogued foam story matches your sessions.",
    ],
    whoShouldAvoid: [
      "Skip it when you need a stability last most days.",
      "Skip it when race-day snap is the actual job.",
    ],
    scoreBreakdown: [{ key: "ride", label: "Ride", score: 80, max: 100 }],
    evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial"],
    alternativeProductIds: [],
    comparisonIds: [],
    faqIds: [],
    ...publishedMeta(),
    ...partial,
  };
}

const p54StampBody =
  "skuslugasicsnovablast6 skuidprodnovablast6 255gweightasicsnovablast6 41mmheelstackasicsnovablast6 255gweight is the concatenated weight token for ASICS Novablast 6 (255g).";

describe("containsPublicContentCorruption", () => {
  it("detects skuslug, skuid, concatenated-token explanations, and compact spec stamps", () => {
    expect(containsPublicContentCorruption(p54StampBody)).toBe(true);
    expect(containsPublicContentCorruption("skuslug asics-novablast-6")).toBe(
      true,
    );
    expect(containsPublicContentCorruption("skuId prod-novablast-6")).toBe(
      true,
    );
    expect(
      containsPublicContentCorruption(
        "energeticcushionfeelasicsnovablast6 ridecharacterhigh",
      ),
    ).toBe(true);
    expect(containsPublicContentCorruption("[object Object]")).toBe(true);
    expect(containsPublicContentCorruption("score is undefined for this SKU")).toBe(
      true,
    );
    expect(containsPublicContentCorruption("drop is NaN mm")).toBe(true);
    expect(containsPublicContentCorruption("stack is : null in the feed")).toBe(
      true,
    );
    expect(
      containsPublicContentCorruption("Listed thickness is NOT_PUBLISHED mm"),
    ).toBe(true);
    expect(
      containsPublicContentCorruption("Named systems: NOT_PUBLISHED"),
    ).toBe(true);
    expect(containsPublicContentCorruption("Status UNKNOWN")).toBe(true);
    expect(
      containsPublicContentCorruption(
        "Adidas Adipower Weightlifting 2 is a lifting shoe.",
      ),
    ).toBe(false);
    expect(
      containsPublicContentCorruption(
        "We leave batteryGps null rather than guess.",
      ),
    ).toBe(false);
  });

  it("does not flag clean handwritten editorial", () => {
    const clean =
      "High-cushion neutral daily trainer with FF BLAST MAX. I'd shortlist it for soft energetic daily miles and pause if you need a stability shoe.";
    expect(containsPublicContentCorruption(clean)).toBe(false);
  });
});

const handwritten = reviewFixture({
  id: "review-novablast-6",
  slug: "asics-novablast-6",
  productId: "prod-novablast-6",
  title: "ASICS Novablast 6 Review",
  subtitle: "A bouncier daily trainer",
});
const p54 = reviewFixture({
  id: "review-p54-novablast-6",
  slug: "asics-novablast-6",
  productId: "prod-novablast-6",
  verdict: p54StampBody,
  summary: p54StampBody,
  testingContext: p54StampBody,
  sections: [
    {
      id: "sec-overview",
      heading: "What it is",
      body: p54StampBody,
      evidenceIds: ["ev-catalog-editorial"],
    },
  ],
});
const p53 = reviewFixture({
  id: "review-p53-novablast-6",
  slug: "asics-novablast-6",
  productId: "prod-novablast-6",
  verdict: "skuslugasicsnovablast6 concatenated drop token",
  summary: "asicsnovablast6drop8 is the concatenated drop token for Novablast 6.",
});
const noFallback = reviewFixture({
  id: "review-p54-only",
  slug: "unique-corrupt-only",
  productId: "prod-missing-clean",
  verdict: p54StampBody,
  summary: p54StampBody,
  testingContext: p54StampBody,
});

describe("review source precedence", () => {
  it("lets a clean handwritten review win over P54/P53 overlays", () => {
    const candidates: RankedReviewCandidate[] = [
      { review: p54, source: "uniqueness_overlay" },
      { review: p53, source: "uniqueness_overlay" },
      { review: handwritten, source: "handwritten" },
    ];
    const decision = selectWinnerForSlug(candidates);
    expect(decision.review.id).toBe("review-novablast-6");
    expect(decision.source).toBe("handwritten");
    expect(decision.corrupted).toBe(false);
    expect(decision.classification).toBe("A");
    expect(containsPublicContentCorruption(decision.review)).toBe(false);
  });

  it("does not let a uniqueness overlay win when a clean source exists", () => {
    const winners = selectWinningReviews([
      { review: p54, source: "uniqueness_overlay" },
      { review: handwritten, source: "handwritten" },
    ]);
    expect(winners).toHaveLength(1);
    expect(winners[0]!.id).toBe("review-novablast-6");
  });

  it("marks reviews with no clean fallback as class C without stripping tokens", () => {
    const decision = selectWinnerForSlug([
      { review: noFallback, source: "uniqueness_overlay" },
    ]);
    expect(decision.corrupted).toBe(true);
    expect(decision.classification).toBe("C");
    expect(decision.review.verdict).toContain("skuslug");
  });
});

describe("canonical catalog after precedence", () => {
  it("restores the genuine Novablast 6 handwritten review", () => {
    const review = getReviewBySlug("asics-novablast-6", PROD);
    expect(review).toBeTruthy();
    expect(review!.id).toBe("review-novablast-6");
    expect(containsPublicContentCorruption(review)).toBe(false);
    const decision = reviewMergeDecisions.find(
      (d) => d.review.slug === "asics-novablast-6",
    );
    expect(decision?.source).toBe("handwritten");
  });

  it("does not let P54/P53 overlays win for Novablast 6", () => {
    const overlays = rankedReviewCandidates.filter(
      (c) =>
        c.review.slug === "asics-novablast-6" &&
        c.source === "uniqueness_overlay",
    );
    expect(overlays.length).toBeGreaterThan(0);
    expect(
      overlays.every((c) => containsPublicContentCorruption(c.review)),
    ).toBe(true);
    expect(getReviewBySlug("asics-novablast-6", PROD)!.id).toBe(
      "review-novablast-6",
    );
  });

  it("blocks publication of a corrupted review even when it is the only candidate", () => {
    const assessed = assessReviewLaunchQuality(p54, PROD);
    expect(assessed.quality).toBe("BLOCKED");
    expect(assessed.reasons).toContain("PUBLIC_CONTENT_CORRUPTION");
    const elig = getLaunchEligibility(
      { kind: "review", entity: p54 },
      PROD,
    );
    expect(elig.disposition).toBe("HIDDEN_404");
    expect(isIndexableEligibility(elig)).toBe(false);

    const product = getProductById(p54.productId, PROD);
    const author = getAuthorById("author-kitletics-editorial");
    const evidence = getEvidenceForIds(p54.evidenceIds);
    const gate = canPublishReview({
      review: p54,
      product,
      author,
      evidence,
    });
    expect(gate.ok).toBe(false);
    expect(gate.issues.some((i) => i.code === "public-content-corruption")).toBe(
      true,
    );
  });

  it("does not assemble a review page from a corrupted catalog winner", () => {
    const held = reviewMergeDecisions.find(
      (d) => d.classification === "C" && d.corrupted,
    );
    if (!held) return;
    expect(getReviewPageData(held.review.slug, PROD)).toBeUndefined();
    const product = getProductById(held.review.productId, PROD);
    if (!product) return;
    const page = getProductPageData(product.slug, PROD);
    if (page?.review) {
      expect(containsPublicContentCorruption(page.review)).toBe(false);
    }
    expect(
      getProductReviewSummary({ productSlug: product.slug }),
    ).toBeUndefined();
  });

  it("keeps public/indexable corrupted reviews at zero", () => {
    const indexableCorrupt = reviewMergeDecisions.filter((d) => {
      if (containsPublicContentCorruption(d.review) === false) return false;
      return isIndexableEligibility(
        getLaunchEligibility({ kind: "review", entity: d.review }, PROD),
      );
    });
    expect(indexableCorrupt).toEqual([]);
  });
});

describe("unique expert research generator", () => {
  it("does not emit uniqueness stamps on a synthesized Novablast 6 review", () => {
    const product = getProductBySlug("asics-novablast-6", PROD);
    expect(product).toBeTruthy();
    const result = synthesizeUniqueExpertResearch(product!, {
      brandName: "ASICS",
      alternatives: [],
      evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial"],
      allowThinCatalog: true,
    });
    expect("status" in result && result.status === "NEEDS_RESEARCH").toBe(
      false,
    );
    expect(containsPublicContentCorruption(result)).toBe(false);
  });
});

describe("Novablast 6 public surfaces", () => {
  it("serves the clean review on the review page and PDP", () => {
    const page = getReviewPageData("asics-novablast-6", PROD);
    expect(page).toBeTruthy();
    expect(containsPublicContentCorruption(page!.review)).toBe(false);
    expect(page!.review.id).toBe("review-novablast-6");

    const pdp = getProductPageData("asics-novablast-6", PROD);
    expect(pdp?.review?.id).toBe("review-novablast-6");
    expect(containsPublicContentCorruption(page!.review)).toBe(false);

    const summary = getProductReviewSummary({
      productSlug: "asics-novablast-6",
    });
    expect(summary).toBeTruthy();
    expect(containsPublicContentCorruption(summary!.verdict)).toBe(false);
  });
});
