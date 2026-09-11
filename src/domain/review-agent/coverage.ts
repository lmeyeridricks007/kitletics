import type { Product } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import type { Evidence } from "@/domain/recommendations/types";
import type {
  ReviewCoverageStatus,
  ReviewPriority,
  ReviewReadiness,
} from "@/domain/review-agent/types";
import { getReviewAgentCategoryConfig } from "@/domain/review-agent/category-config";
import { classifyEvidence } from "@/domain/review-agent/evidence";
import { computeReviewReadiness } from "@/domain/review-agent/readiness";

const STALE_DAYS = 180;

function daysSince(iso?: string): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return (Date.now() - t) / (1000 * 60 * 60 * 24);
}

export function determineCoverageStatus(input: {
  product: Product;
  review?: Review | null;
  evidence: Evidence[];
  priority: ReviewPriority;
  readiness?: ReviewReadiness;
}): { status: ReviewCoverageStatus; reasons: string[] } {
  const { product, review, evidence, priority } = input;
  const reasons: string[] = [];
  const cat = getReviewAgentCategoryConfig(product.categoryId);
  const ev = classifyEvidence(evidence);

  if (!cat.reviewRecommended && priority === "P3") {
    return {
      status: "not-required",
      reasons: [
        "Category does not currently warrant a full editorial Review for long-tail products",
      ],
    };
  }

  if (!review) {
    if (!ev.independent && cat.minIndependentSources > 0) {
      reasons.push("No independent evidence available for Expert Research Review");
      return { status: "needs-research", reasons };
    }
    if (!ev.manufacturer && evidence.length === 0) {
      reasons.push("No product evidence linked");
      return { status: "needs-research", reasons };
    }
    if (priority === "P3" && !cat.reviewRecommended) {
      return { status: "not-required", reasons: ["Low-priority accessory / soft goods"] };
    }
    reasons.push("No Review entity linked");
    return { status: "needs-research", reasons };
  }

  if (
    (review.reviewType === "first-hand-test" || review.reviewType === "hybrid") &&
    !ev.personalTest
  ) {
    reasons.push("Review type claims first-hand without personal-test evidence");
    return { status: "blocked", reasons };
  }

  const readiness =
    input.readiness ??
    computeReviewReadiness({ product, review, evidence });

  if (readiness.blockers.length > 0) {
    reasons.push(...readiness.blockers);
    if (
      readiness.blockers.some(
        (b) =>
          b.includes("first-hand") ||
          b.includes("internal wording") ||
          b.includes("media"),
      )
    ) {
      return { status: "blocked", reasons };
    }
    return { status: "needs-editorial-review", reasons };
  }

  if (review.status === "draft" || review.status === "review") {
    reasons.push(`Review status is ${review.status}`);
    return { status: "needs-editorial-review", reasons };
  }

  const age =
    daysSince(review.lastVerifiedAt) ??
    daysSince(review.updatedAt) ??
    daysSince(review.publishedAt);
  if (age != null && age > STALE_DAYS) {
    reasons.push(`Review last verified ${Math.round(age)} days ago`);
    return { status: "needs-refresh", reasons };
  }

  if (readiness.score < 70) {
    reasons.push(`Readiness score ${readiness.score} below complete threshold`);
    return { status: "needs-editorial-review", reasons };
  }

  if (readiness.warnings.some((w) => w.includes("independent"))) {
    reasons.push(...readiness.warnings.filter((w) => w.includes("independent")));
    return { status: "needs-research", reasons };
  }

  return { status: "complete", reasons: ["Review meets completeness gates"] };
}
