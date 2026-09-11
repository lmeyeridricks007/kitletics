import type { Product } from "@/domain/products/types";
import type { Review } from "@/domain/editorial/types";
import type { Evidence } from "@/domain/recommendations/types";
import type {
  ReviewReadiness,
  ReviewReadinessDimensions,
} from "@/domain/review-agent/types";
import { getReviewAgentCategoryConfig } from "@/domain/review-agent/category-config";
import { classifyEvidence } from "@/domain/review-agent/evidence";
import { containsInternalTerminology } from "@/domain/review-agent/validate";

const GENERIC_PRO_PATTERNS = [
  /^good quality$/i,
  /^great performance$/i,
  /^comfortable$/i,
  /^well designed$/i,
  /^high quality$/i,
  /^excellent performance$/i,
];

function hasSpecificPros(pros: string[]): boolean {
  if (pros.length < 2) return false;
  const specific = pros.filter(
    (p) => p.trim().length >= 12 && !GENERIC_PRO_PATTERNS.some((re) => re.test(p.trim())),
  );
  return specific.length >= 2;
}

function hasSubstantiveSections(review: Review): boolean {
  return review.sections.some((s) => (s.body?.trim().length ?? 0) >= 80);
}

function hasValidMedia(product: Product): boolean {
  return product.images.some(
    (img) =>
      Boolean(img.src) &&
      !img.src.includes("fallback") &&
      img.src !== "/images/catalog/fallbacks/shoe.svg",
  );
}

/**
 * Internal ReviewReadiness — never display score publicly.
 */
export function computeReviewReadiness(input: {
  product: Product;
  review?: Review | null;
  evidence: Evidence[];
}): ReviewReadiness {
  const { product, review, evidence } = input;
  const cat = getReviewAgentCategoryConfig(product.categoryId);
  const ev = classifyEvidence(evidence);
  const blockers: string[] = [];
  const warnings: string[] = [];

  const dims: ReviewReadinessDimensions = {
    identity: Boolean(product.id && product.slug && product.fullName),
    specEvidence: ev.manufacturer || Object.keys(product.specifications).length >= 3,
    independentEvidence:
      ev.independent || cat.minIndependentSources === 0,
    verdict: false,
    pros: false,
    compromises: false,
    useCases: false,
    sections: false,
    alternatives: false,
    comparisons: false,
    guides: false,
    media: hasValidMedia(product),
    freshness: false,
    typeCorrect: true,
    noInternalWording: true,
    noFakeFirstHand: true,
  };

  if (!dims.identity) blockers.push("Product identity incomplete");
  if (!dims.media) blockers.push("Product lacks authentic media");
  if (!dims.specEvidence) warnings.push("Limited specification evidence");
  if (!dims.independentEvidence) {
    warnings.push("Missing independent evidence for subjective claims");
  }

  if (!review) {
    blockers.push("No Review entity");
    return { score: scoreFromDims(dims, blockers), dimensions: dims, blockers, warnings };
  }

  dims.verdict = Boolean(
    (review.bottomLine?.trim().length ?? 0) >= 40 ||
      (review.summary?.trim().length ?? 0) >= 60,
  );
  dims.pros = hasSpecificPros(review.pros ?? []);
  dims.compromises = (review.cons?.length ?? 0) >= 1;
  dims.useCases =
    (review.whoShouldBuy?.length ?? 0) >= 1 &&
    (review.whoShouldAvoid?.length ?? 0) >= 1;
  dims.sections = hasSubstantiveSections(review);
  dims.alternatives = (review.alternativeProductIds?.length ?? 0) >= 1;
  dims.comparisons = (review.comparisonIds?.length ?? 0) >= 0; // optional
  dims.guides = true; // derived at page layer; not blocking
  dims.freshness = Boolean(review.updatedAt || review.lastVerifiedAt);
  dims.typeCorrect = !(
    (review.reviewType === "first-hand-test" || review.reviewType === "hybrid") &&
    !ev.personalTest
  );
  dims.noFakeFirstHand = dims.typeCorrect;
  const textBlob = [
    review.summary,
    review.verdict,
    review.bottomLine,
    ...(review.pros ?? []),
    ...(review.cons ?? []),
    ...review.sections.map((s) => s.body),
  ].join("\n");
  dims.noInternalWording = !containsInternalTerminology(textBlob);

  if (!dims.verdict) blockers.push("Missing substantive short verdict");
  if (!dims.pros) blockers.push("Pros missing or too generic");
  if (!dims.compromises) warnings.push("No contextual trade-offs recorded");
  if (!dims.useCases) blockers.push("Best For / Not Ideal incomplete");
  if (!dims.sections) blockers.push("Sections lack substantive depth");
  if (!dims.alternatives) warnings.push("No alternatives linked");
  if (!dims.typeCorrect) blockers.push("First-hand type without personal-test evidence");
  if (!dims.noInternalWording) blockers.push("Internal AI/agent wording in public copy");
  if (
    review.reviewType === "expert-research" &&
    /personally tested|we tested|hands-on wear/i.test(textBlob) &&
    !ev.personalTest
  ) {
    dims.noFakeFirstHand = false;
    blockers.push("Expert Research copy implies first-hand testing");
  }

  return {
    score: scoreFromDims(dims, blockers),
    dimensions: dims,
    blockers,
    warnings,
  };
}

function scoreFromDims(
  dims: ReviewReadinessDimensions,
  blockers: string[],
): number {
  const entries = Object.entries(dims) as [keyof ReviewReadinessDimensions, boolean][];
  const passed = entries.filter(([, v]) => v).length;
  let score = Math.round((passed / entries.length) * 100);
  score = Math.max(0, score - blockers.length * 8);
  return Math.min(100, score);
}
