import { describe, expect, it } from "vitest";
import { padelEstateReviews } from "@/content/padel/reviews";
import { PADEL_GUIDE_TEACHING_POOLS } from "@/lib/guides/enrich-explainer-visuals";
import {
  classifyTeachingVisualKind,
  evaluatePadelEditorialParityGates,
  evaluateReviewTemplateGlue,
  evaluateTeachingMediaCoverage,
  isEducationalTeachingMedia,
  MAJOR_PADEL_GUIDE_TEACHING_CONCEPTS,
} from "@/lib/padel/parity-gates";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import { getProductById } from "@/repositories/products";

describe("evaluateReviewTemplateGlue", () => {
  it("FAILs PADEL_REVIEW_PARITY on known deepen stems regardless of word count", () => {
    const longFiller = Array.from({ length: 200 }, () => "court").join(" ");
    const result = evaluateReviewTemplateGlue([
      {
        productSlug: "bullpadel-vertex-05-2026",
        sectionId: "sec-power",
        body: `I'd only keep the Bullpadel Vertex when power is what you keep choosing. ${longFiller}`,
        entityNames: ["Bullpadel Vertex 05 2026", "Vertex"],
      },
    ]);
    expect(result.failPadelReviewParity).toBe(true);
    expect(result.totalWords).toBeGreaterThan(150);
    expect(result.hits.some((h) => h.reason === "known_stem")).toBe(true);
  });

  it("FAILs when the same scrubbed paragraph appears across unrelated products", () => {
    const shared =
      "Control on padel is placement off the glass and bandeja height when you already time the ball cleanly enough to keep the rally.";
    const result = evaluateReviewTemplateGlue([
      {
        productSlug: "bullpadel-vertex-05-2026",
        sectionId: "sec-control",
        body: shared,
        entityNames: ["Vertex"],
      },
      {
        productSlug: "kuikma-pr-comfort-soft",
        sectionId: "sec-control",
        body: shared,
        entityNames: ["Kuikma", "Comfort Soft"],
      },
      {
        productSlug: "bullpadel-hack-04-2026",
        sectionId: "sec-control",
        body: shared,
        entityNames: ["Hack"],
      },
    ]);
    expect(result.failPadelReviewParity).toBe(true);
    expect(result.hits.some((h) => h.reason === "cross_product_reuse")).toBe(
      true,
    );
  });

  it("does not FAIL product-specific paragraphs that only share domain words", () => {
    const result = evaluateReviewTemplateGlue([
      {
        productSlug: "bullpadel-vertex-05-2026",
        sectionId: "sec-power",
        body: "The Vertex 05 is a finishing-first diamond with X-Tend Carbon 12K and Multieva for players who already time overheads.",
        entityNames: ["Vertex 05", "Bullpadel Vertex 05 2026"],
      },
      {
        productSlug: "kuikma-pr-comfort-soft",
        sectionId: "sec-power",
        body: "PR Comfort Soft stays comfort-biased with Soft EVA and fiberglass for easy output at club intensity rather than smash geometry.",
        entityNames: ["PR Comfort Soft", "Kuikma"],
      },
    ]);
    expect(result.failPadelReviewParity).toBe(false);
  });

  it("allows shared structural methodology lines", () => {
    const result = evaluateReviewTemplateGlue([
      {
        productSlug: "a",
        sectionId: "sec-methodology",
        body: "Affiliate links do not change the verdict on this model.",
      },
      {
        productSlug: "b",
        sectionId: "sec-methodology",
        body: "Affiliate links do not change the verdict on this model.",
      },
    ]);
    expect(result.failPadelReviewParity).toBe(false);
  });
});

describe("evaluateTeachingMediaCoverage", () => {
  it("does not let product packshots satisfy teaching concepts", () => {
    const result = evaluateTeachingMediaCoverage({
      guideSlug: "how-to-choose-a-padel-racket",
      totalImgCount: 40,
      visuals: [
        {
          id: "/images/padel/products/bullpadel-vertex-05-2026/bullpadel-vertex-05-hero.jpg",
          kind: "product-packshot",
        },
        {
          id: "/images/padel/products/kuikma-pr-comfort-soft/hero.jpg",
          kind: "product-card",
        },
      ],
    });
    expect(result.totalImgCount).toBe(40);
    expect(result.failTeachingMediaParity).toBe(true);
    expect(result.missingConcepts.length).toBeGreaterThan(0);
    expect(result.coveredConcepts).toEqual([]);
  });

  it("PASSes when required concepts have educational diagrams even if img count is low", () => {
    const result = evaluateTeachingMediaCoverage({
      guideSlug: "how-to-choose-a-padel-racket",
      totalImgCount: 6,
      visuals: [
        { id: "padel-racket-shapes", kind: "educational-diagram" },
        { id: "padel-racket-balance", kind: "educational-diagram" },
        { id: "padel-sweet-spot", kind: "educational-diagram" },
        { id: "padel-power-control", kind: "educational-diagram" },
        { id: "padel-core-feel", kind: "educational-diagram" },
        { id: "padel-racket-weight", kind: "educational-diagram" },
        { id: "padel-decision-steps", kind: "educational-diagram" },
      ],
    });
    expect(result.failTeachingMediaParity).toBe(false);
    expect(result.missingConcepts).toEqual([]);
    expect(result.teachingVisualCount).toBe(7);
  });

  it("classifies education paths as teaching media", () => {
    expect(
      isEducationalTeachingMedia(
        classifyTeachingVisualKind(
          "/images/padel/education/padel-racket-shapes.svg",
        ),
      ),
    ).toBe(true);
    expect(
      isEducationalTeachingMedia(
        classifyTeachingVisualKind(
          "/images/padel/products/foo/hero.jpg",
        ),
      ),
    ).toBe(false);
  });
});

describe("evaluatePadelEditorialParityGates", () => {
  it("wires FAIL review parity from glue and FAIL guide/media from missing teaching concepts", () => {
    const verdict = evaluatePadelEditorialParityGates({
      reviewSamples: [
        {
          productSlug: "x",
          sectionId: "sec-a",
          body: "If this section still feels generic, compare a peer.",
        },
      ],
      guides: [
        {
          guideSlug: "padel-grips-overgrips-explained",
          totalImgCount: 12,
          visuals: [
            {
              id: "/images/padel/products/wilson-overgrip/hero.jpg",
              kind: "product-packshot",
            },
          ],
        },
      ],
    });
    expect(verdict.PADEL_REVIEW_PARITY).toBe("FAIL");
    expect(verdict.PADEL_GUIDE_PARITY).toBe("FAIL");
    expect(verdict.PADEL_MEDIA_PARITY).toBe("FAIL");
  });
});

describe("live padel estate editorial gates", () => {
  it("FAILs PADEL_REVIEW_PARITY automatically when template-glue is systematic — estate must be clean", () => {
    const samples = [];
    for (const review of padelEstateReviews) {
      const product = getProductById(review.productId);
      if (!product) continue;
      const enriched = enrichReviewForPage(review, product);
      const entityNames = [product.fullName, product.name].filter(Boolean);
      for (const section of enriched.sections ?? []) {
        samples.push({
          productSlug: review.slug,
          sectionId: section.id,
          body: section.body,
          entityNames,
        });
      }
    }
    expect(samples.length).toBeGreaterThan(50);
    const glue = evaluateReviewTemplateGlue(samples);
    // Word count is informational only — never clears FAIL.
    expect(glue.totalWords).toBeGreaterThan(0);
    expect(glue.hits).toEqual([]);
    expect(glue.failPadelReviewParity).toBe(false);
  });

  it("evaluates teaching-media by concept coverage from wired pools — not <img> totals", () => {
    const guides = Object.keys(MAJOR_PADEL_GUIDE_TEACHING_CONCEPTS).map(
      (guideSlug) => ({
        guideSlug,
        // Packshots intentionally inflate img count; they must not satisfy concepts.
        totalImgCount: 40,
        visuals: [
          {
            id: "/images/padel/products/bullpadel-vertex-05-2026/hero.jpg",
            kind: "product-packshot" as const,
          },
          ...(PADEL_GUIDE_TEACHING_POOLS[guideSlug] ?? []).map((id) => ({
            id,
            kind: "educational-diagram" as const,
          })),
        ],
      }),
    );
    const verdict = evaluatePadelEditorialParityGates({
      reviewSamples: [],
      guides,
    });
    expect(verdict.PADEL_GUIDE_PARITY).toBe("PASS");
    expect(verdict.PADEL_MEDIA_PARITY).toBe("PASS");
    for (const row of verdict.teaching) {
      expect(row.missingConcepts).toEqual([]);
      expect(row.productCardOrPackshotCount).toBeGreaterThan(0);
      expect(row.totalImgCount).toBe(40);
    }
  });
});
