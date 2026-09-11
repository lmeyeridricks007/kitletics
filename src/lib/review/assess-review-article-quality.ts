/**
 * Review-article quality assessment against industry best practices
 * (Wirecutter / Runner’s World / RTINGS-style buying guides).
 * Internal only — do not show scores on the public site.
 */

import type { Review } from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";
import type { ReviewPageData } from "@/lib/review/get-review-page-data";
import { canPublishReview } from "@/lib/review/can-publish";
import { getEvidenceForIds } from "@/repositories";
import { isReportOrJunkVoice } from "@/lib/review/review-voice";
import {
  reviewDecisionCopyText,
  type ReviewArticleSeverityLabel,
} from "@/lib/review/quality-contract";

export type ReviewArticleSeverity = ReviewArticleSeverityLabel;

export type ReviewArticleFinding = {
  code: string;
  severity: ReviewArticleSeverity;
  message: string;
  recommendation: string;
};

export type ReviewArticleGrade = "A" | "B" | "C" | "D" | "F";

export type ReviewArticleAssessment = {
  slug: string;
  title: string;
  productName: string;
  categoryId?: string;
  reviewType: string;
  status: string;
  grade: ReviewArticleGrade;
  /** Internal 0–100 */
  score: number;
  wordCount: number;
  sectionCount: number;
  findings: ReviewArticleFinding[];
  strengths: string[];
  checklist: Record<string, boolean>;
};

/**
 * Formal/report jargon in **decision copy** (not disclosure).
 * Disclosure may legitimately say “Expert Research Review…” / “we have not personally tested”.
 * Those phrases are covered by REPORT_OR_JUNK_VOICE when they appear in body/lead.
 */
const FORMAL_VOICE_DECISION =
  /least ambiguous|design facts we treat as anchors|lab certificate|structured catalog|Subjective feel|wear-logged|methodology detail|Published measurements are the least|verified product specifications|stands out in-catalog|How to read this section/i;

const GENERIC_PRO =
  /^(good quality|great performance|comfortable|well designed|high quality|nice|excellent)$/i;

const FIRST_HAND_CLAIM =
  /\b(we tested|our test|after \d+\s*km|during our testing|we measured|personally tested|I ran|I wore)\b/i;

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Full page text including disclosure — used for length / you-count only. */
function reviewPublicText(data: ReviewPageData): string {
  const r = data.review;
  return [
    reviewDecisionCopyText(r),
    r.testingContext,
    r.editorialDisclosure,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Decision copy only — publication voice / first-hand honesty surface. */
function reviewDecisionText(data: ReviewPageData): string {
  return reviewDecisionCopyText(data.review);
}

function hasTopic(sections: Review["sections"], re: RegExp): boolean {
  return sections.some((s) => re.test(`${s.id} ${s.heading}`));
}

function gradeFromScore(score: number): ReviewArticleGrade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 55) return "D";
  return "F";
}

/**
 * Assess one enriched review page against product-review best practices.
 */
export function assessReviewArticle(
  data: ReviewPageData,
): ReviewArticleAssessment {
  const { review, product, author, evidence } = data;
  const text = reviewPublicText(data);
  const decisionText = reviewDecisionText(data);
  const wordCount = words(text);
  const findings: ReviewArticleFinding[] = [];
  const strengths: string[] = [];

  const checklist = {
    bottomLineUpFront: Boolean(
      (review.bottomLine ?? review.verdict)?.trim().length,
    ),
    whoShouldBuy: (review.whoShouldBuy?.length ?? 0) >= 1,
    whoShouldAvoid: (review.whoShouldAvoid?.length ?? 0) >= 1,
    specificPros: (review.pros ?? []).filter((p) => !GENERIC_PRO.test(p.trim()))
      .length >= 2,
    specificCons: (review.cons?.length ?? 0) >= 1,
    scoreBreakdown: (review.scoreBreakdown?.length ?? 0) >= 3,
    longFormLength: wordCount >= 2500,
    idealLength: wordCount >= 3000 && wordCount <= 5500,
    fitSection:
      !product.categoryId.includes("shoe") ||
      hasTopic(review.sections, /fit|comfort|sizing/i),
    performanceSection: hasTopic(
      review.sections,
      /ride|cushion|performance|tech|grip|stabil|construction|setup|build|feel|use/i,
    ),
    valueSection: hasTopic(review.sections, /value|price/i),
    alternatives: data.alternatives.length >= 1 || data.comparisonTable.length > 1,
    disclosure: Boolean(review.testingContext?.trim() || review.editorialDisclosure),
    // Fix 85: voice on decision copy only — disclosure may say Expert Research.
    readableVoice:
      !FORMAL_VOICE_DECISION.test(decisionText) &&
      !isReportOrJunkVoice(decisionText),
    noFalseFirstHand:
      !FIRST_HAND_CLAIM.test(decisionText) ||
      evidence.some((e) => e.type === "personal-test"),
    evidencePresent: evidence.length >= 1,
    authorPresent: Boolean(author || review.reviewerId),
    mediaOk: Boolean(
      product.images.some(
        (img) => Boolean(img.src) && !img.src.includes("/fallbacks/"),
      ),
    ),
    sectionImagesOk: (() => {
      const skip =
        /buying checklist|before you buy|decision guide|who should/i;
      const major = review.sections.filter(
        (s) => !skip.test(`${s.id} ${s.heading}`),
      );
      if (major.length < 4) return true;
      const srcs = major
        .map((s) => s.image?.src)
        .filter((src): src is string => Boolean(src));
      const unique = new Set(srcs);
      const productOwned = srcs.filter((src) =>
        src.includes(`/products/${product.slug}/sections/`),
      );
      // Prefer dedicated section files; require coverage + no duplicates.
      return (
        unique.size === srcs.length &&
        productOwned.length >= Math.min(major.length, 6) &&
        srcs.length >= Math.min(major.length, 6)
      );
    })(),
    scannableSections: review.sections.filter((s) => s.body.trim().length > 80)
      .length >= 6,
  };

  // --- Findings from checklist + deeper checks ---

  if (!checklist.bottomLineUpFront) {
    findings.push({
      code: "verdict",
      severity: "P0",
      message: "Missing clear bottom line / verdict up front.",
      recommendation:
        "Add a one-sentence bottomLine that tells the reader whether to buy and for what job.",
    });
  } else {
    strengths.push("Clear verdict / bottom line");
  }

  if (!checklist.whoShouldBuy || !checklist.whoShouldAvoid) {
    findings.push({
      code: "audience",
      severity: "P0",
      message: "Incomplete audience guidance (best for / not ideal for).",
      recommendation:
        "Spell out who should buy and who should look elsewhere — industry guides always do both.",
    });
  } else {
    strengths.push("Who it's for and who should skip");
  }

  if (!checklist.specificPros) {
    findings.push({
      code: "pros",
      severity: "P1",
      message: "Pros are missing or too generic.",
      recommendation:
        "Use product-specific pros (foam, role, fit) — avoid “comfortable / high quality”.",
    });
  } else {
    strengths.push("Specific pros");
  }

  if (!checklist.specificCons) {
    findings.push({
      code: "cons",
      severity: "P1",
      message: "No honest cons / trade-offs listed.",
      recommendation:
        "Add at least one real trade-off; trust drops when reviews only praise.",
    });
  } else {
    strengths.push("Honest cons");
  }

  if (!checklist.scoreBreakdown) {
    findings.push({
      code: "scores",
      severity: "P1",
      message: "Fewer than 3 scored criteria.",
      recommendation:
        "Expose category criteria (cushioning, fit, ride, value, etc.) so scores feel transparent.",
    });
  } else {
    strengths.push("Transparent criteria scores");
  }

  if (wordCount < 1500) {
    findings.push({
      code: "length-critical",
      severity: "P0",
      message: `Only ~${wordCount} words — far below a useful long-form review.`,
      recommendation:
        "Target 3,000–5,500 words (floor 2,500) with fit, performance, value and trade-offs — product substance only, no meta padding.",
    });
  } else if (wordCount < 2500) {
    findings.push({
      code: "length",
      severity: "P1",
      message: `About ${wordCount} words — under the 2,500-word floor.`,
      recommendation:
        "Expand thin sections with concrete product advice; never pad with how-to-read-this meta.",
    });
  } else if (wordCount < 3000) {
    findings.push({
      code: "length-ideal",
      severity: "P2",
      message: `About ${wordCount} words — clears the floor but under the 3,000–5,500 ideal band.`,
      recommendation:
        "Deepen fit, performance, value and trade-offs so the page sits in the ideal long-form band.",
    });
  } else if (wordCount > 5500) {
    findings.push({
      code: "length-long",
      severity: "P2",
      message: `About ${wordCount} words — above the 3,000–5,500 ideal band.`,
      recommendation:
        "Trim repetitive padding; keep scannable sections with one job each.",
    });
  } else {
    strengths.push(`Solid length (~${wordCount} words)`);
  }

  if (!checklist.fitSection && product.categoryId.includes("shoe")) {
    findings.push({
      code: "fit",
      severity: "P1",
      message: "No dedicated fit / comfort section for a shoe review.",
      recommendation: "Add Fit & Comfort with sizing, width and try-on advice.",
    });
  }

  if (!checklist.performanceSection) {
    findings.push({
      code: "performance",
      severity: "P1",
      message: "Weak performance coverage (ride / cushion / tech).",
      recommendation:
        "Cover how it feels in use for the intended sessions, in plain language.",
    });
  } else {
    strengths.push("Performance coverage present");
  }

  if (!checklist.valueSection) {
    findings.push({
      code: "value",
      severity: "P2",
      message: "No value / price section.",
      recommendation:
        "Explain when the street price is worth it versus cheaper peers.",
    });
  } else {
    strengths.push("Value guidance");
  }

  if (!checklist.alternatives) {
    findings.push({
      code: "alternatives",
      severity: "P1",
      message: "No alternatives or comparison table peers.",
      recommendation:
        "Link 2–3 alternatives for neighbouring jobs — best-practice review pages always compare.",
    });
  } else {
    strengths.push("Alternatives / comparisons");
  }

  if (!checklist.disclosure) {
    findings.push({
      code: "disclosure",
      severity: "P0",
      message: "Missing testing / affiliate disclosure.",
      recommendation:
        "State how the guide was written and that affiliate links don’t change scores.",
    });
  } else {
    strengths.push("Method / affiliate disclosure");
  }

  if (!checklist.readableVoice) {
    findings.push({
      code: "voice",
      severity: "P0",
      message:
        "Decision copy (lead/sections/pros-cons) still reads like a research paper or uses banned jargon.",
      recommendation:
        "Rewrite decision copy as an expert buying guide; leave methodology disclosure alone — do not treat honest “Expert Research / we have not personally tested” disclosure as junk.",
    });
  } else {
    strengths.push("Readable guide voice");
  }

  if (!checklist.noFalseFirstHand) {
    findings.push({
      code: "first-hand-claim",
      severity: "P0",
      message: "Implies personal testing without personal-test evidence.",
      recommendation:
        "Remove first-hand claims or attach personal-test evidence and testing details.",
    });
  }

  if (!checklist.evidencePresent) {
    findings.push({
      code: "evidence",
      severity: "P1",
      message: "No evidence records attached.",
      recommendation: "Attach manufacturer and independent/editorial evidence IDs.",
    });
  }

  if (!checklist.authorPresent) {
    findings.push({
      code: "author",
      severity: "P1",
      message: "No reviewer / author attributed.",
      recommendation: "Set reviewerId so trust and bylines resolve.",
    });
  }

  if (!checklist.mediaOk) {
    findings.push({
      code: "media",
      severity: "P0",
      message: "Product lacks authentic hero media.",
      recommendation: "Register a real product hero before featuring the review.",
    });
  } else {
    strengths.push("Authentic product media");
  }

  if (!checklist.sectionImagesOk) {
    findings.push({
      code: "section-images",
      severity: "P1",
      message:
        "Major review sections lack unique product-only images (or reuse the same src).",
      recommendation:
        "Generate unique section images from the hero into public/images/<sport>/products/<slug>/sections/<topic>.png — one src per section, never stamp the hero.",
    });
  } else {
    strengths.push("Unique product section images");
  }

  if (!checklist.scannableSections) {
    findings.push({
      code: "structure",
      severity: "P1",
      message: `Only ${review.sections.length} thin sections — hard to scan.`,
      recommendation:
        "Use 8–13 titled sections (overview, specs, fit, ride, value, who it’s for, etc.).",
    });
  } else {
    strengths.push(`Scannable structure (${review.sections.length} sections)`);
  }

  // Second-person / helpful tone signal
  const youHits = (text.match(/\byou\b/gi) ?? []).length;
  if (youHits < 8 && wordCount > 800) {
    findings.push({
      code: "second-person",
      severity: "P2",
      message: "Little second-person address — may feel impersonal.",
      recommendation: "Talk to the reader (“your week”, “I’d shortlist it if…”).",
    });
  }

  // Publication gate
  const gate = canPublishReview({
    review,
    product,
    author,
    evidence: getEvidenceForIds(review.evidenceIds),
  });
  if (!gate.ok && review.status === "published") {
    findings.push({
      code: "publish-gate",
      severity: "P0",
      message: `Publication gate failing: ${gate.issues.map((i) => i.code).join(", ")}.`,
      recommendation: "Fix canPublishReview issues before relying on this page.",
    });
  }

  // Score
  let score = 100;
  for (const f of findings) {
    if (f.severity === "P0") score -= 12;
    else if (f.severity === "P1") score -= 6;
    else if (f.severity === "P2") score -= 3;
  }
  // Soft bonuses
  if (checklist.longFormLength) score += 2;
  if (checklist.readableVoice) score += 2;
  if (checklist.alternatives) score += 1;
  score = Math.max(0, Math.min(100, score));

  return {
    slug: review.slug,
    title: review.title,
    productName: product.fullName,
    categoryId: product.categoryId,
    reviewType: review.reviewType,
    status: review.status,
    grade: gradeFromScore(score),
    score,
    wordCount,
    sectionCount: review.sections.length,
    findings: findings.sort((a, b) => {
      const order = { P0: 0, P1: 1, P2: 2, info: 3 };
      return order[a.severity] - order[b.severity];
    }),
    strengths,
    checklist,
  };
}

export function assessReviewArticleFromParts(input: {
  review: Review;
  product: Product;
  data: ReviewPageData;
}): ReviewArticleAssessment {
  return assessReviewArticle(input.data);
}
