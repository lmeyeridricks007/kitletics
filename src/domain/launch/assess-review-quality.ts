import type { Review } from "@/domain/editorial/types";
import type { ReviewLaunchQuality } from "@/domain/launch/types";
import { getProductById, getAuthorById, getBrandById } from "@/repositories";
import { getEvidenceForIds } from "@/repositories";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import { isContentUniquenessReviewHeld } from "@/content/launch/content-uniqueness-holds";
import { isBlockedEvidenceReview } from "@/content/launch/blocked-evidence-reviews";

export interface ReviewQualityAssessment {
  quality: ReviewLaunchQuality;
  reasons: string[];
  decisionScore: number;
  wordCount: number;
}

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const FIRST_HAND_CLAIM =
  /\b(we tested|our test|after \d+\s*km|during our testing|we measured|personally tested|I ran|I wore)\b/i;

/**
 * Review launch quality — mirrors prelaunch-03 editorial gates.
 * Assesses the page-time enriched review (same surface readers/crawlers see).
 */
export function assessReviewLaunchQuality(
  review: Review,
  options?: PublishResolverOptions,
): ReviewQualityAssessment {
  const reasons: string[] = [];
  const product = getProductById(review.productId, options);
  const productionExposed =
    isPubliclyVisible(review, options) && !review.noindex;

  const brand = product ? getBrandById(product.brandId, options) : undefined;
  const assessedReview = product
    ? enrichReviewForPage(review, product, { brand })
    : review;

  const text = [
    assessedReview.summary,
    assessedReview.verdict,
    assessedReview.bottomLine,
    assessedReview.testingContext,
    ...(assessedReview.pros ?? []),
    ...(assessedReview.cons ?? []),
    ...(assessedReview.whoShouldBuy ?? []),
    ...(assessedReview.whoShouldAvoid ?? []),
    ...(assessedReview.sections ?? []).map((s) => `${s.heading}\n${s.body}`),
  ]
    .filter(Boolean)
    .join("\n\n");

  const falseFirstHand =
    FIRST_HAND_CLAIM.test(text) &&
    !(assessedReview.evidenceIds?.length) &&
    !/not personally|research|editorial desk/i.test(
      `${assessedReview.testingContext ?? ""} ${assessedReview.editorialDisclosure ?? ""}`,
    );

  if (falseFirstHand) {
    return {
      quality: "BLOCKED",
      reasons: ["FIRST_HAND_CLAIM_WITHOUT_PERSONAL_TEST_EVIDENCE"],
      decisionScore: 0,
      wordCount: words(text),
    };
  }

  if (isBlockedEvidenceReview(assessedReview.slug)) {
    return {
      quality: "BLOCKED",
      reasons: ["BLOCKED_EVIDENCE"],
      decisionScore: 0,
      wordCount: words(text),
    };
  }

  if (!productionExposed || assessedReview.status === "archived") {
    return {
      quality: "BLOCKED",
      reasons: [
        !productionExposed ? "not_production_exposed" : "",
        assessedReview.noindex ? "noindex" : "",
        `status=${assessedReview.status}`,
      ].filter(Boolean),
      decisionScore: 0,
      wordCount: words(text),
    };
  }

  if (!product) {
    return {
      quality: "BLOCKED",
      reasons: ["orphan_product"],
      decisionScore: 0,
      wordCount: words(text),
    };
  }

  const ev = getEvidenceForIds(assessedReview.evidenceIds ?? []);
  const author = assessedReview.reviewerId
    ? getAuthorById(assessedReview.reviewerId)
    : undefined;

  const dims = {
    substantiveVerdict: words(
      assessedReview.verdict ?? assessedReview.bottomLine ?? "",
    ) >= 20,
    pros: (assessedReview.pros?.length ?? 0) >= 2,
    cons: (assessedReview.cons?.length ?? 0) >= 2,
    bestFor: (assessedReview.whoShouldBuy?.length ?? 0) >= 2,
    skipIf: (assessedReview.whoShouldAvoid?.length ?? 0) >= 2,
    specAnalysis: (assessedReview.sections ?? []).some((s) =>
      /spec|geometry|stack|drop|weight|cushion|foam|plate|display|battery/i.test(
        `${s.id} ${s.heading}`,
      ),
    ),
    useCaseAnalysis: (assessedReview.sections ?? []).some((s) =>
      /use case|best for|who should|training|race|daily|long run/i.test(
        `${s.id} ${s.heading} ${s.body.slice(0, 200)}`,
      ),
    ),
    performance: (assessedReview.sections ?? []).some((s) =>
      /ride|performance|cushion|grip|stabil|feel|tech|sensor|gps/i.test(
        `${s.id} ${s.heading}`,
      ),
    ),
    alternatives: (assessedReview.alternativeProductIds?.length ?? 0) >= 1,
    comparisonContext: (assessedReview.comparisonIds?.length ?? 0) >= 1,
    evidence: ev.length >= 1,
    author: Boolean(assessedReview.reviewerId && author),
    methodology: Boolean(assessedReview.testingContext?.trim()),
  };

  const decisionBits = [
    dims.substantiveVerdict,
    dims.pros,
    dims.cons,
    dims.bestFor,
    dims.skipIf,
    dims.specAnalysis || dims.performance,
    dims.useCaseAnalysis || dims.bestFor,
    dims.alternatives || dims.comparisonContext,
    dims.evidence,
    dims.methodology,
  ];
  const decisionScore = decisionBits.filter(Boolean).length * 10;
  const wc = words(text);
  const sectionCount = assessedReview.sections?.length ?? 0;

  if (
    dims.substantiveVerdict &&
    dims.pros &&
    dims.cons &&
    dims.bestFor &&
    dims.skipIf &&
    dims.evidence &&
    dims.methodology &&
    sectionCount >= 4 &&
    wc >= 600 &&
    decisionScore >= 70
  ) {
    // Fix 25 — template / name-swap clusters stay out of Day-1 index
    if (isContentUniquenessReviewHeld(assessedReview.slug)) {
      return {
        quality: "DUPLICATIVE",
        reasons: [
          "content_uniqueness_hold",
          `decisionScore=${decisionScore}`,
          `words=${wc}`,
        ],
        decisionScore,
        wordCount: wc,
      };
    }
    return {
      quality: "LAUNCH_READY",
      reasons: [`decisionScore=${decisionScore}`, `words=${wc}`],
      decisionScore,
      wordCount: wc,
    };
  }

  if (
    dims.substantiveVerdict &&
    (dims.pros || dims.bestFor) &&
    sectionCount >= 3 &&
    wc >= 350 &&
    decisionScore >= 50
  ) {
    if (isContentUniquenessReviewHeld(assessedReview.slug)) {
      return {
        quality: "DUPLICATIVE",
        reasons: ["content_uniqueness_hold", `decisionScore=${decisionScore}`],
        decisionScore,
        wordCount: wc,
      };
    }
    const missing = Object.entries(dims)
      .filter(([, v]) => v === false)
      .map(([k]) => k);
    return {
      quality: "NEEDS_MINOR_WORK",
      reasons: [...missing.slice(0, 8), `decisionScore=${decisionScore}`],
      decisionScore,
      wordCount: wc,
    };
  }

  return {
    quality: "THIN",
    reasons: [
      `decisionScore=${decisionScore}`,
      `words=${wc}`,
      `sections=${sectionCount}`,
      ...reasons,
    ],
    decisionScore,
    wordCount: wc,
  };
}
