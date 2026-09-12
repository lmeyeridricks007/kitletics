import type { ContentSection, Review } from "@/domain/editorial/types";
import type { Brand, Product } from "@/domain/products/types";
import type { MediaAsset } from "@/domain/shared/types";
import {
  enrichReviewSectionBodies,
  enrichReviewSummary,
  enrichTestingContext,
} from "@/lib/review/enrich-review-content";
import { enrichReviewSubstance } from "@/lib/review/enrich-review-substance";
import { sanitizePublicReview } from "@/lib/review/rewrite-uniqueness-era-skip";
import { resolveReviewSectionVisuals } from "@/lib/review/resolve-section-visuals";
import { REVIEW_MAX_WORDS, countWords } from "@/lib/review/review-longform";

function reviewWords(review: Review): number {
  return countWords(
    [
      review.summary,
      review.verdict,
      review.bottomLine ?? "",
      review.testingContext ?? "",
      ...review.pros,
      ...review.cons,
      ...review.whoShouldBuy,
      ...review.whoShouldAvoid,
      ...review.sections.map((s) => `${s.heading} ${s.body}`),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

/** Peel trailing paragraphs after all enrichment so the final page stays in band. */
function trimEnrichedReview(review: Review): Review {
  if (reviewWords(review) <= REVIEW_MAX_WORDS) return review;

  let sections: ContentSection[] = review.sections.filter(
    (s) => s.id !== "sec-decision-guide" && s.id !== "sec-buying-checklist",
  );
  let next: Review = { ...review, sections };

  let guard = 0;
  while (reviewWords(next) > REVIEW_MAX_WORDS && guard < 100) {
    guard += 1;
    let longestIdx = -1;
    let longestWords = 0;
    for (let i = 0; i < sections.length; i++) {
      const w = countWords(sections[i]!.body);
      if (w > longestWords) {
        longestWords = w;
        longestIdx = i;
      }
    }
    if (longestIdx < 0) break;
    const section = sections[longestIdx]!;
    const paras = section.body
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (paras.length <= 2) break;
    sections = sections.map((s, i) =>
      i === longestIdx ? { ...s, body: paras.slice(0, -1).join("\n\n") } : s,
    );
    next = { ...next, sections };
  }

  return next;
}

/**
 * Page-time enrichment for every review:
 * - Fill missing scores, cons and alternatives
 * - Expand thin template sections from product facts
 * - Attach unique section visuals from the shared editorial pool
 * - Cap final length inside the readable long-form band
 */
export function enrichReviewForPage(
  review: Review,
  product: Product,
  options?: {
    brand?: Brand;
    productHero?: MediaAsset;
  },
): Review {
  const substantiated = enrichReviewSubstance(review, product, options?.brand);
  const sections = resolveReviewSectionVisuals(
    enrichReviewSectionBodies(substantiated, product, options?.brand),
    {
      productHero: options?.productHero ?? product.images?.[0],
      productImages: product.images ?? [],
      productSlug: product.slug,
      categoryId: product.categoryId,
      reviewId: substantiated.id,
    },
  );

  const enriched: Review = {
    ...substantiated,
    summary: enrichReviewSummary(substantiated, product),
    testingContext: enrichTestingContext(substantiated, product),
    sections,
  };

  return sanitizePublicReview(trimEnrichedReview(enriched));
}
