import { describe, expect, it } from "vitest";
import type { Product, Brand } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import type { Evidence } from "@/domain/recommendations/types";
import {
  assessProductReviewLifecycle,
  assessReviewImpactFromProductChange,
  proposeFirstHandTransition,
} from "@/domain/review-agent/lifecycle";
import {
  assessFeatureReadiness,
  reviewRequiredForPublication,
  canFeatureProduct,
} from "@/domain/catalog/featureability";
import { publishedMeta } from "@/content/config";

const brand: Brand = {
  id: "brand-test",
  name: "TestBrand",
  slug: "testbrand",
  country: "US",
  description: "Test",
  ...publishedMeta(),
};

function product(partial: Partial<Product> & Pick<Product, "id" | "slug" | "name">): Product {
  return {
    brandId: brand.id,
    fullName: `TestBrand ${partial.name}`,
    shortDescription: "A specific test product for unit simulation.",
    lifecycleStatus: "current",
    sportIds: ["sport-running"],
    disciplineIds: [],
    categoryId: "cat-running-shoes",
    subcategoryIds: [],
    useCaseIds: [],
    specifications: {
      weight: 250,
      drop: 8,
      cushionLevel: "high",
      stability: "neutral",
      terrain: "road",
    },
    strengths: ["Soft daily cushioning", "Reliable road grip"],
    weaknesses: ["Not a race plate shoe"],
    experienceLevels: ["intermediate"],
    images: [
      {
        id: "img-1",
        src: "/images/running/products/test-hero.jpg",
        alt: "Test",
        type: "image",
        usageType: "hero",
        licence: "manufacturer-marketing",
        sourceUrl: "https://example.com",
      },
    ],
    videos: [],
    offerIds: [],
    evidenceIds: ["ev-catalog-mfr", "ev-catalog-editorial"],
    relatedProductIds: [],
    alternativeProductIds: ["prod-other"],
    recommendationScore: 88,
    ...publishedMeta(),
    ...partial,
  };
}

const mfrEvidence: Evidence = {
  id: "ev-mfr-only",
  type: "manufacturer",
  source: "Official specs",
  summary: "Weight and stack from manufacturer.",
  verifiedAt: "2026-01-01",
  confidence: "high",
};

const editorialEvidence: Evidence = {
  id: "ev-ed",
  type: "editorial-research",
  source: "Independent expert reviews & Kitletics editorial analysis",
  summary: "Category placement from specialist coverage.",
  verifiedAt: "2026-01-01",
  confidence: "medium",
};

describe("Review lifecycle integration", () => {
  it("A: new Product with strong evidence → stage Expert Research", () => {
    const p = product({ id: "prod-a", slug: "test-a", name: "Alpha" });
    const assessment = assessProductReviewLifecycle({
      product: p,
      brand,
      evidence: [mfrEvidence, editorialEvidence],
      recommendations: [],
      priority: "P1",
    });
    expect(assessment.canSynthesizeExpertResearch).toBe(true);
    expect(assessment.action).toBe("stage-review");
    expect(assessment.stagedDraft?.reviewType).toBe("expert-research");
    expect(assessment.stagedDraft?.proposedStatus).toBe("needs-review");
  });

  it("B: manufacturer-only evidence → research task or careful stage", () => {
    const p = product({
      id: "prod-b",
      slug: "test-b",
      name: "Beta",
      evidenceIds: ["ev-mfr-only"],
      strengths: [],
      shortDescription: "",
      specifications: {},
    });
    const assessment = assessProductReviewLifecycle({
      product: p,
      brand,
      evidence: [mfrEvidence],
      recommendations: [],
      priority: "P2",
    });
    expect(["research-task", "blocked", "stage-review"]).toContain(assessment.action);
    if (assessment.action === "stage-review") {
      expect(assessment.stagedDraft?.reviewType).toBe("expert-research");
    }
  });

  it("C: successor launch → generation maintenance impact", () => {
    const impact = assessReviewImpactFromProductChange({
      product: product({ id: "prod-c", slug: "test-c", name: "Gamma" }),
      field: "generation",
      previousValue: "5",
      nextValue: "6",
    });
    expect(impact.impactsReview).toBe(true);
    expect(impact.classification).toBe("generation-maintenance");
    expect(impact.suggestedAction.toLowerCase()).toContain("not copy");
  });

  it("D: weight change → revalidate claims", () => {
    const review = {
      id: "review-d",
      slug: "test-d",
      productId: "prod-d",
      title: "Test",
      reviewType: "expert-research",
      verdict: "A heavy daily trainer.",
      summary: "Feels heavy on easy miles.",
      score: 80,
      sections: [],
      pros: [],
      cons: ["Heavy compared with tempo shoes"],
      whoShouldBuy: [],
      whoShouldAvoid: [],
      scoreBreakdown: [],
      evidenceIds: [],
      alternativeProductIds: [],
      comparisonIds: [],
      faqIds: [],
      ...publishedMeta(),
    } as Review;
    const impact = assessReviewImpactFromProductChange({
      product: product({ id: "prod-d", slug: "test-d", name: "Delta" }),
      review,
      field: "weight",
      previousValue: 280,
      nextValue: 250,
    });
    expect(impact.impactsReview).toBe(true);
    expect(impact.classification).toBe("revalidate-claims");
  });

  it("E: price change does not invalidate Review", () => {
    const impact = assessReviewImpactFromProductChange({
      product: product({ id: "prod-e", slug: "test-e", name: "Echo" }),
      field: "price",
      nextValue: 99,
    });
    expect(impact.impactsReview).toBe(false);
    expect(impact.classification).toBe("none");
  });

  it("F: genuine first-hand Evidence proposes hybrid transition (not auto)", () => {
    const review = {
      id: "review-f",
      slug: "test-f",
      productId: "prod-f",
      title: "Test",
      reviewType: "expert-research",
      verdict: "Good",
      summary: "Summary text long enough for tests.",
      score: 80,
      sections: [],
      pros: [],
      cons: [],
      whoShouldBuy: [],
      whoShouldAvoid: [],
      scoreBreakdown: [],
      evidenceIds: ["ev-personal"],
      alternativeProductIds: [],
      comparisonIds: [],
      faqIds: [],
      ...publishedMeta(),
    } as Review;
    const personal: Evidence = {
      id: "ev-personal",
      type: "personal-test",
      source: "Kitletics wear test",
      summary: "Logged road miles",
      verifiedAt: "2026-06-01",
      confidence: "high",
      distanceKm: 120,
      surfaces: ["road"],
      activities: ["easy"],
      productSource: "purchased-by-kitletics",
    };
    const proposed = proposeFirstHandTransition({
      review,
      evidence: [personal, editorialEvidence],
    });
    expect(proposed.ok).toBe(true);
    expect(proposed.to).toBe("hybrid");

    const assessment = assessProductReviewLifecycle({
      product: product({ id: "prod-f", slug: "test-f", name: "Foxtrot" }),
      brand,
      review,
      evidence: [personal, editorialEvidence],
      recommendations: [],
      priority: "P0",
    });
    expect(assessment.action).toBe("type-transition-proposed");
    expect(assessment.proposedReviewTypeTransition?.requiresHumanApproval).toBe(true);
  });

  it("G: P0 prominence requires Review readiness", () => {
    const p = product({
      id: "prod-g",
      slug: "test-g",
      name: "Golf",
      recommendationScore: 92,
    });
    expect(reviewRequiredForPublication(p, "P0")).toBe(true);
    const feature = assessFeatureReadiness({
      product: p,
      review: null,
      evidence: [mfrEvidence, editorialEvidence],
      recommendations: [],
      priority: "P0",
      surface: "finder-top-match",
    });
    expect(feature.ok).toBe(false);
    expect(feature.issues.some((i) => /Review/i.test(i))).toBe(true);

    // Finder candidate may still be allowed without full Review
    const candidate = assessFeatureReadiness({
      product: p,
      review: null,
      evidence: [editorialEvidence],
      recommendations: [
        {
          id: "rec-1",
          productId: p.id,
          sportId: "sport-running",
          score: 90,
          factors: [],
          strengths: ["daily"],
          compromises: [],
          explanation: "Strong daily trainer.",
          evidenceIds: [],
        },
      ],
      priority: "P0",
      surface: "finder-candidate",
    });
    expect(candidate.ok).toBe(true);
  });

  it("H: unpublished Product cannot be featured", () => {
    const p = product({
      id: "prod-h",
      slug: "test-h",
      name: "Hotel",
      status: "draft",
    });
    expect(canFeatureProduct(p)).toBe(false);
    const feature = assessFeatureReadiness({
      product: p,
      evidence: [],
      recommendations: [],
      priority: "P2",
      surface: "listing",
    });
    expect(feature.ok).toBe(false);
  });
});
