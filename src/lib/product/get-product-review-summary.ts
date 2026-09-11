import type { RegionCode } from "@/domain/shared/types";
import { DEFAULT_REGION } from "@/domain/shared/types";
import {
  getLaunchEligibility,
  shouldPromotePublicly,
} from "@/domain/launch";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";
import type { ProductPageData } from "@/lib/product/get-product-page-data";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getScoreBand } from "@/lib/product/score";
import { resolveVisibleReviewType } from "@/lib/review/visible-type";
import { canPublishReview } from "@/lib/review/can-publish";
import { getAuthorById, getComparisonById, getProductById, getBrandById, getEvidenceForIds, getLowestOfferPrice } from "@/repositories";
import { getPublicEvidenceCard } from "@/lib/evidence/public-presentation";
import { getPrimaryProductMedia } from "@/lib/product/media";
import type { ScoreBreakdownItem } from "@/domain/editorial/types";

export interface ProductReviewAltCard {
  productId: string;
  slug: string;
  name: string;
  fullName: string;
  brandName: string;
  why: string;
  score?: number;
  scoreLabel?: string;
  price?: { amount: number; currency: string };
  imageSrc?: string;
  imageAlt?: string;
  compareHref: string;
}

export interface ProductReviewCompareCard {
  id: string;
  title: string;
  href: string;
  isPublished: boolean;
}

export interface ProductReviewKeySpec {
  key: string;
  label: string;
  value: string;
  unit?: string;
  whyItMatters?: string;
}

export interface ProductReviewSummaryData {
  productId: string;
  productName: string;
  fullName: string;
  reviewSlug: string;
  reviewType: ReturnType<typeof resolveVisibleReviewType>;
  score: number;
  scoreLabel: string;
  displayScore: string;
  verdict: string;
  summary: string;
  bottomLine?: string;
  lastReviewed?: string;
  methodology: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  notIdealFor: string[];
  criteria: ScoreBreakdownItem[];
  sections: { id: string; heading: string; body: string }[];
  keySpecs: ProductReviewKeySpec[];
  alternatives: ProductReviewAltCard[];
  comparisons: ProductReviewCompareCard[];
  relatedGuides: { title: string; href: string }[];
  featuredIn: { title: string; href: string }[];
  evidenceCards: ReturnType<typeof getPublicEvidenceCard>[];
  /** Present only when the linked review is INDEXABLE / publicly promotable. */
  fullReviewHref?: string;
  /** Full editorial review vs held scaffold shown as product analysis only. */
  presentation: "full-review" | "product-analysis";
  hasPersonalTest: boolean;
}

const SPEC_WHY: Record<string, string> = {
  weight: "Affects how lively or protective the shoe feels on easy miles.",
  drop: "Influences stance and load distribution — preference, not a quality score.",
  heelStack: "Contributes to cushion depth under the heel on landings.",
  forefootStack: "Affects forefoot protection and how the toe-off feels.",
  cushionLevel: "Signals intended plushness versus firmer daily platforms.",
  stability: "Indicates guidance geometry versus a pure neutral ride.",
  terrain: "Defines primary surface suitability (road, trail, mixed).",
  plate: "Structured plates change stiffness and race/workout character.",
  widthOptions: "Official widths available — separate from subjective toe-box feel.",
};

function excerptBody(body: string, max = 280): string {
  const t = body.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" "));
  const slice = (last > 80 ? cut.slice(0, last + 1) : cut).trim();
  return `${slice.replace(/[.]+$/, "")}.…`;
}

function displayScore10(score100: number): string {
  return (Math.round(score100) / 10).toFixed(1);
}

/**
 * Aggregates Product + Review + graph data for the PDP Review experience.
 * Returns undefined when no publishable Review exists.
 */
export function getProductReviewSummary(input: {
  productSlug: string;
  region?: RegionCode;
  preview?: boolean;
  /** Optional preloaded page data to avoid double fetch */
  pageData?: ProductPageData;
}): ProductReviewSummaryData | undefined {
  const region = input.region ?? DEFAULT_REGION;
  const options: PublishResolverOptions | undefined = input.preview
    ? { isDev: true }
    : undefined;

  const page =
    input.pageData ??
    getProductPageData(input.productSlug, {
      ...options,
      region,
    });
  if (!page?.review) return undefined;

  const { product, review, evidence, alternatives, comparisons, bestGuides, buyingGuides } =
    page;
  const reviewEvidence = getEvidenceForIds(review.evidenceIds);
  const author = review.reviewerId ? getAuthorById(review.reviewerId) : undefined;
  const gate = canPublishReview({
    review,
    product,
    author,
    evidence: reviewEvidence.length ? reviewEvidence : evidence,
  });
  if (!gate.ok && !input.preview) return undefined;

  const visibleType = resolveVisibleReviewType(
    review,
    reviewEvidence.length ? reviewEvidence : evidence,
  );
  const score = product.recommendationScore ?? review.score;
  const band = getScoreBand(score);
  const hasPersonalTest = (reviewEvidence.length ? reviewEvidence : evidence).some(
    (e) => e.type === "personal-test",
  );

  const keySpecKeys = ["weight", "drop", "heelStack", "forefootStack", "stability", "terrain", "widthOptions"];
  const keySpecs: ProductReviewKeySpec[] = [];
  for (const key of keySpecKeys) {
    const row =
      page.featuredSpecs.find((s) => s.key === key) ??
      page.specGroups.flatMap((g) => g.rows).find((s) => s.key === key);
    if (!row) continue;
    keySpecs.push({
      key,
      label: row.label,
      value: row.value,
      unit: row.unit,
      whyItMatters: SPEC_WHY[key],
    });
  }

  const altCards: ProductReviewAltCard[] = [];
  const seen = new Set<string>();
  const preferIds = [
    ...review.alternativeProductIds,
    ...alternatives.map((a) => a.product.id),
    ...product.alternativeProductIds,
  ];
  for (const id of preferIds) {
    if (seen.has(id) || id === product.id) continue;
    const alt = getProductById(id, options);
    if (!alt) continue;
    seen.add(id);
    const brand = getBrandById(alt.brandId, options);
    const rel = alternatives.find((a) => a.product.id === id);
    const media = getPrimaryProductMedia(alt);
    const price = getLowestOfferPrice(alt.id, region, options);
    const altScore = alt.recommendationScore;
    altCards.push({
      productId: alt.id,
      slug: alt.slug,
      name: alt.name,
      fullName: alt.fullName,
      brandName: brand?.name ?? "",
      why:
        rel?.reasonLabel ??
        alt.strengths[0] ??
        alt.shortDescription.slice(0, 80),
      score: altScore,
      scoreLabel: altScore !== undefined ? getScoreBand(altScore).label : undefined,
      price: price
        ? { amount: price.price, currency: price.currency }
        : undefined,
      imageSrc: media?.src,
      imageAlt: media?.alt || alt.fullName,
      compareHref: `/compare?ids=${encodeURIComponent(product.id)},${encodeURIComponent(alt.id)}`,
    });
    if (altCards.length >= 3) break;
  }

  const compareCards: ProductReviewCompareCard[] = [];
  const cmpIds = [
    ...review.comparisonIds,
    ...comparisons.map((c) => c.id),
  ];
  const seenCmp = new Set<string>();
  for (const id of cmpIds) {
    if (seenCmp.has(id)) continue;
    const cmp = getComparisonById(id, options) ?? comparisons.find((c) => c.id === id);
    if (!cmp) continue;
    seenCmp.add(id);
    compareCards.push({
      id: cmp.id,
      title: cmp.title,
      href: `/compare/${cmp.slug}`,
      isPublished: cmp.status === "published",
    });
    if (compareCards.length >= 3) break;
  }

  const relatedGuides = buyingGuides.slice(0, 5).map((g) => ({
    title: g.title,
    href: `/guides/${g.slug}`,
  }));
  const featuredIn = bestGuides.slice(0, 5).map((g) => ({
    title: g.title,
    href: `/best/${g.slug}`,
  }));

  const evidenceSource = reviewEvidence.length ? reviewEvidence : evidence;
  const evidenceCards = evidenceSource.map(getPublicEvidenceCard);

  const reviewElig = getLaunchEligibility(
    { kind: "review", entity: review },
    options,
  );
  const promoteFullReview = shouldPromotePublicly(reviewElig);
  const presentation = promoteFullReview ? "full-review" : "product-analysis";

  return {
    productId: product.id,
    productName: product.name,
    fullName: product.fullName,
    reviewSlug: review.slug,
    reviewType: visibleType,
    score,
    scoreLabel: band.label,
    displayScore: displayScore10(score),
    verdict: review.verdict || review.bottomLine || review.summary,
    summary: review.summary,
    bottomLine: review.bottomLine,
    lastReviewed: review.lastVerifiedAt ?? review.updatedAt ?? review.publishedAt,
    methodology:
      review.testingContext?.trim() ||
      (presentation === "product-analysis"
        ? "Structured product analysis from verified specs and catalog comparison data — not a published Kitletics editorial review."
        : visibleType === "expert-research"
          ? "This review combines verified product specifications with independent expert coverage and Kitletics structured comparison data. We have not personally tested this product."
          : "See the full review for testing context."),
    pros: review.pros,
    cons: review.cons,
    bestFor: review.whoShouldBuy,
    notIdealFor: review.whoShouldAvoid,
    criteria: review.scoreBreakdown,
    sections: review.sections
      .filter((s) => s.body.trim().length >= 40)
      .slice(0, promoteFullReview ? 4 : 6)
      .map((s) => ({
        id: s.id,
        heading: s.heading,
        body: excerptBody(s.body),
      })),
    keySpecs,
    alternatives: altCards,
    comparisons: compareCards,
    relatedGuides,
    featuredIn,
    evidenceCards,
    fullReviewHref: promoteFullReview
      ? `/reviews/${review.slug}`
      : undefined,
    presentation,
    hasPersonalTest,
  };
}
