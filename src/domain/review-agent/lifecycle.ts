/**
 * Review lifecycle hooks for onboarding + freshness.
 * Never invents first-hand testing. Never mutates Best Guide rankings.
 */
import type { Product, Brand } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import type { Evidence, Recommendation } from "@/domain/recommendations/types";
import type {
  ReviewPriority,
  ReviewCoverageStatus,
  ReviewReadiness,
  StagedReviewDraft,
} from "@/domain/review-agent/types";
import { computeReviewReadiness } from "@/domain/review-agent/readiness";
import { determineCoverageStatus } from "@/domain/review-agent/coverage";
import { classifyEvidence } from "@/domain/review-agent/evidence";
import {
  synthesizeExpertResearchDraft,
  stagedDraftToReviewShape,
} from "@/domain/review-agent/synthesize";
import {
  evaluateReviewFreshness,
  REVIEW_CLAIM_SENSITIVE_FIELDS,
} from "@/domain/review-agent/staleness";
import {
  reviewRequiredForPublication,
  assessFeatureReadiness,
} from "@/domain/catalog/featureability";
import { canPublishReview } from "@/lib/review/can-publish";
import type { EditorialOpportunityDraft, ContentImpactItem } from "@/domain/onboarding/types";

export type ReviewLifecycleAction =
  | "none"
  | "stage-review"
  | "research-task"
  | "refresh-task"
  | "repair-task"
  | "type-transition-proposed"
  | "blocked";

export interface ReviewLifecycleAssessment {
  coverage: ReviewCoverageStatus;
  readiness: ReviewReadiness;
  priority: ReviewPriority;
  action: ReviewLifecycleAction;
  reasons: string[];
  canSynthesizeExpertResearch: boolean;
  reviewRequiredForPublish: boolean;
  featureOkProminent: boolean;
  stagedDraft?: StagedReviewDraft | null;
  editorialOpportunity?: EditorialOpportunityDraft;
  contentImpact: ContentImpactItem[];
  proposedReviewTypeTransition?: {
    from: string;
    to: "hybrid" | "first-hand-test";
    requiresHumanApproval: true;
  };
}

function nid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Assess Review readiness for a Product during onboarding or maintenance.
 */
export function assessProductReviewLifecycle(input: {
  product: Product;
  brand: Brand;
  review?: Review | null;
  evidence: Evidence[];
  recommendations: Recommendation[];
  priority: ReviewPriority;
  alternativeProductIds?: string[];
  comparisonIds?: string[];
  sessionId?: string;
}): ReviewLifecycleAssessment {
  const {
    product,
    brand,
    review,
    evidence,
    recommendations,
    priority,
    alternativeProductIds = [],
    comparisonIds = [],
  } = input;

  const readiness = computeReviewReadiness({ product, review, evidence });
  const { status: coverage, reasons } = determineCoverageStatus({
    product,
    review,
    evidence,
    priority,
    readiness,
  });
  const ev = classifyEvidence(evidence);
  const reviewRequired = reviewRequiredForPublication(product, priority);

  const feature = assessFeatureReadiness({
    product: { ...product, status: product.status === "draft" ? "published" : product.status },
    review,
    evidence,
    recommendations,
    priority,
    surface: "best-guide",
    hasAlternatives: alternativeProductIds.length > 0,
  });

  const contentImpact: ContentImpactItem[] = [];
  let action: ReviewLifecycleAction = "none";
  let stagedDraft: StagedReviewDraft | null = null;
  let editorialOpportunity: EditorialOpportunityDraft | undefined;

  const canSynthesize =
    (ev.independent || evidence.length > 0 || product.evidenceIds.length > 0) &&
    (product.strengths.length >= 1 ||
      Boolean(product.shortDescription) ||
      Object.keys(product.specifications).length >= 3);

  if (!review || coverage === "needs-research") {
    if (canSynthesize) {
      stagedDraft = synthesizeExpertResearchDraft({
        product,
        brand,
        evidence:
          evidence.length > 0
            ? evidence
            : ([
                {
                  id: "ev-catalog-editorial",
                  type: "editorial-research",
                  source: "Kitletics editorial analysis",
                  summary: "Structured catalog assessment",
                  verifiedAt: new Date().toISOString(),
                  confidence: "medium",
                },
              ] as Evidence[]),
        recommendations,
        alternativeProductIds,
        comparisonIds,
        existing: review,
        priority,
      });
      if (stagedDraft) {
        action = "stage-review";
        editorialOpportunity = {
          id: nid("ed-rev"),
          kind: "review",
          productIds: [product.id],
          title: stagedDraft.title,
          reason: "Sufficient evidence to stage Expert Research Review",
          priority: priority === "P0" || priority === "P1" ? "HIGH" : "MEDIUM",
          suggestedAction:
            "Human-review staged Review (needs-review). Do not auto-publish. Never invent first-hand.",
          status: "candidate",
        };
      } else {
        action = "research-task";
      }
    } else {
      action = "research-task";
      editorialOpportunity = {
        id: nid("ed-rev"),
        kind: "review",
        productIds: [product.id],
        title: `Research Review evidence: ${product.fullName}`,
        reason: "Insufficient independent/product substance for Expert Research Review",
        priority: reviewRequired ? "HIGH" : "MEDIUM",
        suggestedAction:
          "Collect manufacturer + independent sources; re-run ProductReviewAgent generate",
        status: "candidate",
      };
    }
  } else if (coverage === "needs-refresh" || coverage === "needs-editorial-review") {
    action = coverage === "needs-refresh" ? "refresh-task" : "repair-task";
    editorialOpportunity = {
      id: nid("ed-rev"),
      kind: "review",
      productIds: [product.id],
      title: `Maintain Review: ${product.fullName}`,
      reason: reasons.join("; ") || coverage,
      priority: "MEDIUM",
      suggestedAction: `Run reviews:agent --mode=${coverage === "needs-refresh" ? "refresh" : "repair"} --product=${product.slug}`,
      status: "candidate",
    };
  } else if (coverage === "blocked") {
    action = "blocked";
  }

  // First-hand transition detection (proposal only)
  let proposedReviewTypeTransition: ReviewLifecycleAssessment["proposedReviewTypeTransition"];
  if (
    review &&
    review.reviewType === "expert-research" &&
    ev.personalTest
  ) {
    const personal = evidence.find((e) => e.type === "personal-test");
    if (
      personal &&
      (personal.distanceKm != null ||
        personal.durationHours != null ||
        (personal.activities?.length ?? 0) > 0)
    ) {
      action = "type-transition-proposed";
      proposedReviewTypeTransition = {
        from: "expert-research",
        to: "hybrid",
        requiresHumanApproval: true,
      };
      contentImpact.push({
        contentId: review.id,
        contentType: "review-type-transition",
        reason: "personal-test Evidence detected — propose hybrid (human approval required)",
        severity: "HIGH",
        suggestedAction:
          "Validate testingDetails/productSource then manually upgrade reviewType — never auto-upgrade",
      });
    }
  }

  if (action === "stage-review" || action === "research-task") {
    contentImpact.push({
      contentId: `review-${product.slug}`,
      contentType: "review-readiness",
      reason: `Review coverage=${coverage}; action=${action}`,
      severity: reviewRequired ? "HIGH" : "MEDIUM",
      suggestedAction:
        action === "stage-review"
          ? "Stage Expert Research Review for editorial approval"
          : "Queue Review research before strategic featuring",
    });
  }

  return {
    coverage,
    readiness,
    priority,
    action,
    reasons,
    canSynthesizeExpertResearch: Boolean(stagedDraft) || canSynthesize,
    reviewRequiredForPublish: reviewRequired,
    featureOkProminent: feature.ok,
    stagedDraft,
    editorialOpportunity,
    contentImpact,
    proposedReviewTypeTransition,
  };
}

/**
 * Spec / lifecycle change → Review dependency impact (does not rewrite Review).
 * Price changes are ignored — offers update separately.
 */
export function assessReviewImpactFromProductChange(input: {
  product: Product;
  review?: Review | null;
  field: string;
  previousValue?: unknown;
  nextValue?: unknown;
}): {
  impactsReview: boolean;
  classification: "none" | "informational" | "revalidate-claims" | "generation-maintenance";
  reasons: string[];
  suggestedAction: string;
} {
  const { product, review, field } = input;
  if (field === "price" || field.startsWith("offer")) {
    return {
      impactsReview: false,
      classification: "none",
      reasons: ["Price/offer changes do not invalidate Review editorial copy"],
      suggestedAction: "Update Offer component only",
    };
  }

  if (field === "generation" || field === "lifecycleStatus") {
    return {
      impactsReview: true,
      classification: "generation-maintenance",
      reasons: [`${field} changed — generation/lifecycle maintenance required`],
      suggestedAction:
        "Create tasks: review current generation, assess previous, check comparisons/alternatives/Best Guides — do not copy Review to successor",
    };
  }

  if (!REVIEW_CLAIM_SENSITIVE_FIELDS.has(field)) {
    return {
      impactsReview: false,
      classification: "informational",
      reasons: [`Field ${field} is low impact for Review claims`],
      suggestedAction: "No Review refresh required unless editorial copy cites this field",
    };
  }

  const claimHits: string[] = [];
  if (review) {
    const blob = [
      review.summary,
      review.verdict,
      review.bottomLine,
      ...(review.pros ?? []),
      ...(review.cons ?? []),
      ...review.sections.map((s) => s.body),
    ]
      .join("\n")
      .toLowerCase();
    if (field === "weight" && /heav|light|weight|gram/.test(blob)) {
      claimHits.push("weight-related claims in Review copy");
    }
    if (field.includes("battery") && /battery/.test(blob)) {
      claimHits.push("battery claims in Review copy");
    }
    if ((field === "stability" || field === "cushionLevel") && blob.includes(field.replace(/([A-Z])/g, " $1").toLowerCase().trim())) {
      claimHits.push(`${field} mentioned in Review`);
    }
  }

  return {
    impactsReview: true,
    classification: "revalidate-claims",
    reasons: claimHits.length
      ? claimHits
      : [`Sensitive field ${field} changed for ${product.slug}`],
    suggestedAction:
      "Queue review-refresh; revalidate claim provenance — do not auto-rewrite approved copy without diff",
  };
}

export function proposeFirstHandTransition(input: {
  review: Review;
  evidence: Evidence[];
}): {
  ok: boolean;
  to?: "hybrid" | "first-hand-test";
  issues: string[];
} {
  const personal = input.evidence.filter((e) => e.type === "personal-test");
  if (!personal.length) {
    return { ok: false, issues: ["No personal-test Evidence"] };
  }
  const issues: string[] = [];
  for (const e of personal) {
    if (
      e.distanceKm == null &&
      e.durationHours == null &&
      !(e.activities?.length) &&
      !(e.surfaces?.length)
    ) {
      issues.push(`${e.id}: missing structured test fields`);
    }
    if (!e.productSource) {
      issues.push(`${e.id}: missing productSource`);
    }
  }
  if (issues.length) return { ok: false, issues };
  const to =
    input.review.reviewType === "expert-research" ? "hybrid" : "first-hand-test";
  // Validate via gate shape without mutating
  const draft = {
    ...input.review,
    reviewType: to,
    testingDetails: {
      distanceKm: personal[0]?.distanceKm,
      durationHours: personal[0]?.durationHours,
      activities: personal[0]?.activities,
      surfaces: personal[0]?.surfaces,
      productSource: personal[0]?.productSource,
    },
    productSource: personal[0]?.productSource,
  } as Review;
  const gate = canPublishReview({
    review: draft,
    product: null,
    author: null,
    evidence: input.evidence,
  });
  const typeIssues = gate.issues.filter((i) =>
    ["first-hand-evidence", "testing-summary", "product-source"].includes(i.code),
  );
  if (typeIssues.length) {
    return { ok: false, issues: typeIssues.map((i) => i.message) };
  }
  return { ok: true, to, issues: [] };
}

export { stagedDraftToReviewShape, evaluateReviewFreshness };
