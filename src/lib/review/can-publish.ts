import type { Review } from "@/domain/editorial/types";
import type { Evidence } from "@/domain/recommendations/types";
import type { Product } from "@/domain/products/types";
import type { Author } from "@/domain/editorial/types";
import { containsInternalTerminology } from "@/domain/review-agent/validate";

export type PublishReviewIssue = {
  code: string;
  message: string;
};

const GENERIC_PRO = [
  /^good quality$/i,
  /^great performance$/i,
  /^comfortable$/i,
  /^well designed$/i,
  /^high quality$/i,
];

/**
 * Publication gate for Review pages — factual completeness, not visual chrome.
 * Agent drafts default to needs-review; this gate must pass before status=published.
 */
export function canPublishReview(input: {
  review: Review;
  product?: Product | null;
  author?: Author | null;
  evidence: Evidence[];
}): { ok: boolean; issues: PublishReviewIssue[] } {
  const { review, product, author, evidence } = input;
  const issues: PublishReviewIssue[] = [];

  if (!product) issues.push({ code: "product", message: "Missing product" });
  if (!author && !review.reviewerId) {
    issues.push({ code: "author", message: "Missing reviewer" });
  } else if (review.reviewerId && !author) {
    issues.push({ code: "author", message: "Reviewer id does not resolve" });
  }
  if (!review.reviewType) {
    issues.push({ code: "type", message: "Missing review type" });
  }
  if (!review.summary?.trim()) {
    issues.push({ code: "summary", message: "Missing summary" });
  }
  if (!review.verdict?.trim() && !review.bottomLine?.trim()) {
    issues.push({ code: "verdict", message: "Missing verdict / bottom line" });
  }
  if (!review.evidenceIds?.length || evidence.length === 0) {
    issues.push({ code: "evidence", message: "Missing evidence" });
  }
  const hasCriteria = review.scoreBreakdown?.length > 0;
  const hasSections = review.sections?.some((s) => s.body.trim().length > 40);
  if (!hasCriteria && !hasSections) {
    issues.push({
      code: "substance",
      message: "Need criteria scores or substantive editorial sections",
    });
  }
  if (!review.publishedAt && review.status === "published") {
    issues.push({ code: "dates", message: "Published review needs publishedAt" });
  }

  // Pros / use-cases
  if (!review.pros?.length || review.pros.length < 2) {
    issues.push({ code: "pros", message: "Need at least 2 product-specific pros" });
  } else if (
    review.pros.filter((p) => !GENERIC_PRO.some((re) => re.test(p.trim()))).length < 2
  ) {
    issues.push({ code: "pros-generic", message: "Pros are too generic" });
  }
  if (!review.whoShouldBuy?.length) {
    issues.push({ code: "best-for", message: "Missing whoShouldBuy / Best For" });
  }
  if (!review.whoShouldAvoid?.length) {
    issues.push({
      code: "not-ideal",
      message: "Missing whoShouldAvoid / Not Ideal For",
    });
  }

  // Media
  if (
    product &&
    !product.images.some(
      (img) => Boolean(img.src) && !img.src.includes("/fallbacks/"),
    )
  ) {
    issues.push({ code: "media", message: "Product lacks authentic media" });
  }

  // Internal terminology must never ship
  const publicText = [
    review.summary,
    review.verdict,
    review.bottomLine,
    ...(review.pros ?? []),
    ...(review.cons ?? []),
    ...review.sections.map((s) => `${s.heading} ${s.body}`),
    review.testingContext ?? "",
  ].join("\n");
  if (containsInternalTerminology(publicText)) {
    issues.push({
      code: "internal-wording",
      message: "Public copy contains internal agent/prompt terminology",
    });
  }

  const hasPersonalTest = evidence.some((e) => e.type === "personal-test");
  const hasIndependent = evidence.some(
    (e) =>
      e.type === "independent-review" ||
      e.type === "lab-test" ||
      e.type === "editorial-research",
  );

  if (
    review.reviewType === "first-hand-test" ||
    review.reviewType === "hybrid"
  ) {
    if (!hasPersonalTest) {
      issues.push({
        code: "first-hand-evidence",
        message: "First-hand/hybrid requires personal-test evidence",
      });
    }
    if (!review.testingDetails) {
      issues.push({
        code: "testing-summary",
        message: "First-hand/hybrid requires testingDetails",
      });
    }
    if (!review.productSource && !review.testingDetails?.productSource) {
      issues.push({
        code: "product-source",
        message: "First-hand/hybrid requires product source",
      });
    }
  }
  if (review.reviewType === "expert-research") {
    const reviewEvidenceIsPersonal = evidence.some(
      (e) =>
        e.type === "personal-test" && review.evidenceIds.includes(e.id),
    );
    if (reviewEvidenceIsPersonal) {
      issues.push({
        code: "type-mismatch",
        message: "Expert-research must not attach personal-test evidence",
      });
    }
    if (
      /\b(we|I|kitletics)\s+(personally\s+)?tested\b/i.test(publicText) ||
      /\bhands-on wear-test\b/i.test(publicText) ||
      /\bafter testing this product\b/i.test(publicText)
    ) {
      // Allow explicit negations in methodology
      const negated =
        /has not been personally tested|we have not personally tested|not been personally tested by kitletics/i.test(
          publicText,
        );
      if (!negated || /\bwe tested this\b/i.test(publicText)) {
        if (!hasPersonalTest) {
          issues.push({
            code: "fake-first-hand",
            message: "Expert Research copy must not imply first-hand testing",
          });
        }
      }
    }
    if (!hasIndependent && evidence.length > 0) {
      // Soft: allow manufacturer + editorial-research only catalogs, but flag
      const onlyMfr = evidence.every(
        (e) => e.type === "manufacturer" || e.type === "retailer",
      );
      if (onlyMfr) {
        issues.push({
          code: "independent-evidence",
          message:
            "Expert Research needs independent/editorial evidence beyond manufacturer copy",
        });
      }
    }
  }

  return { ok: issues.length === 0, issues };
}
