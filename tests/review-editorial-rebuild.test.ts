import { describe, expect, it } from "vitest";
import { publishedMeta } from "@/content/config";
import {
  selectWinnerForSlug,
  type RankedReviewCandidate,
} from "@/content/review-source-precedence";
import { reviewMergeDecisions } from "@/content/reviews";
import { synthesizeUniqueExpertResearch } from "@/domain/review-agent/unique-expert-research";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch";
import { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
import {
  assessConsumerCopyQuality,
  containsMachineTemplateCopy,
} from "@/lib/review/consumer-copy-quality";
import { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";
import { getProductBySlug } from "@/repositories";
import type { Review } from "@/domain/editorial/types";

const PROD = { isDev: false as const };

function reviewFixture(
  partial: Partial<Review> & Pick<Review, "id" | "slug" | "productId">,
): Review {
  return {
    title: `${partial.slug} Review`,
    reviewType: "expert-research",
    verdict:
      "A daily trainer for easy miles when that is the weekly job, with a clear trade-off versus a race shoe.",
    summary:
      "Shortlist this when easy miles are the job. Pause when you need a different specialist.",
    score: 82,
    reviewerId: "author-kitletics-editorial",
    testingContext:
      "How we assessed it: Expert Research from published specs and similar products. We have not personally tested this product.",
    sections: [
      {
        id: "sec-overview",
        heading: "What it is",
        body: "This is a neutral daily trainer for easy and long road miles. I'd shortlist it when soft cushioning is the weekly job. I'd pause when you need a guidance shoe or a dedicated race plate instead of stretching this last into every session.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        id: "sec-ride",
        heading: "Ride",
        body: "The ride is aimed at daily trainer sessions, not a universal score. Soft cushioning should keep easy miles comfortable rather than dead-flat. The drop is a familiar road geometry if you already train in that range, and a closer specialist is the better compare if you wanted more snap.",
        evidenceIds: ["ev-catalog-editorial"],
      },
      {
        id: "sec-stability",
        heading: "Stability",
        body: "This is a neutral daily trainer. That is a support story, not a medical claim, and it will not replace a guidance shoe if you need support most days. Open a dedicated stability option before stretching this last into every easy mile.",
        evidenceIds: ["ev-catalog-editorial"],
      },
    ],
    pros: ["Soft daily ride", "Light enough for easy miles", "Familiar drop"],
    cons: ["Not a stability shoe", "Not a race-day plate shoe"],
    whoShouldBuy: [
      "You're looking for a soft, energetic daily trainer.",
      "You want enough cushioning for long runs without a heavy ride.",
      "You prefer a neutral shoe with a lively rocker.",
    ],
    whoShouldAvoid: [
      "You need added stability or guidance.",
      "You're primarily looking for the lightest race-day option.",
      "You prefer a firm, highly responsive ride.",
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

describe("consumer copy quality", () => {
  it("flags uniqueness-era templates and not consumer Buy If lines", () => {
    expect(
      containsMachineTemplateCopy(
        "Buy the ASICS Novablast 6 when its main job matches most of your week — not as a default for every session.",
      ),
    ).toBe(true);
    expect(
      containsMachineTemplateCopy(
        "You're looking for a soft, energetic daily trainer.",
      ),
    ).toBe(false);
    expect(
      containsMachineTemplateCopy("The drop is 8 mm and the ride is soft."),
    ).toBe(false);
  });

  it("accepts a consumer editorial fixture", () => {
    const review = reviewFixture({
      id: "review-fixture",
      slug: "fixture-daily",
      productId: "prod-novablast-6",
    });
    expect(assessConsumerCopyQuality(review).ok).toBe(true);
  });

  it("blocks machine-template reviews from indexability", () => {
    const review = reviewFixture({
      id: "review-machine",
      slug: "machine-template",
      productId: "prod-novablast-6",
      verdict:
        "Buy the shoe when its main job matches most of your week — not as a default for every session.",
    });
    expect(assessReviewLaunchQuality(review, PROD).quality).toBe("BLOCKED");
    expect(assessReviewLaunchQuality(review, PROD).reasons).toContain(
      "MACHINE_TEMPLATE_COPY",
    );
  });
});

describe("unique expert research consumer synthesis", () => {
  it("synthesizes Novablast 6 without stamps or machine templates", () => {
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
    expect(containsMachineTemplateCopy(result)).toBe(false);
    const qa = assessConsumerCopyQuality(result as Review);
    expect(qa.ok).toBe(true);
    const review = result as Review;
    expect(review.verdict.toLowerCase()).not.toContain("main job matches");
    expect(review.whoShouldBuy[0]?.startsWith("You're looking")).toBe(true);
    expect(review.testingContext).toMatch(/Expert Research/i);
    expect(review.testingContext).not.toMatch(/we tested/i);
  });
});

describe("editorial rebuild merge precedence", () => {
  it("lets a clean rebuild beat unusable handwritten copy", () => {
    const handwritten = reviewFixture({
      id: "review-old",
      slug: "rebuild-slug",
      productId: "prod-novablast-6",
      verdict:
        "Buy it when its main job matches most of your week — not as a default for every session.",
    });
    const rebuild = reviewFixture({
      id: "review-new",
      slug: "rebuild-slug",
      productId: "prod-novablast-6",
    });
    const candidates: RankedReviewCandidate[] = [
      { review: handwritten, source: "handwritten" },
      { review: rebuild, source: "editorial_rebuild" },
    ];
    const winner = selectWinnerForSlug(candidates);
    expect(winner.source).toBe("editorial_rebuild");
    expect(containsMachineTemplateCopy(winner.review)).toBe(false);
  });
});

describe("public reviews after editorial rebuild", () => {
  it("keeps public/indexable machine-template reviews at zero", () => {
    const indexableMachine = reviewMergeDecisions.filter((d) => {
      if (containsMachineTemplateCopy(d.review) === false) return false;
      return isIndexableEligibility(
        getLaunchEligibility({ kind: "review", entity: d.review }, PROD),
      );
    });
    expect(indexableMachine).toEqual([]);
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

  it("serves consumer-ready Novablast 6 copy", () => {
    const decision = reviewMergeDecisions.find(
      (d) => d.review.slug === "asics-novablast-6",
    );
    expect(decision).toBeTruthy();
    expect(containsPublicContentCorruption(decision!.review)).toBe(false);
    expect(containsMachineTemplateCopy(decision!.review)).toBe(false);
    expect(assessConsumerCopyQuality(decision!.review).ok).toBe(true);
  });
});
