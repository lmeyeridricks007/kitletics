import type { Brand, Product, SpecValue } from "@/domain/products/types";
import type { Review, ScoreBreakdownItem, ContentSection } from "@/domain/editorial/types";
import type { Evidence, Recommendation } from "@/domain/recommendations/types";
import type { StagedReviewDraft, ReviewEditorialLock } from "@/domain/review-agent/types";
import {
  EDITORIAL_DISCLOSURE,
  EXPERT_RESEARCH_METHODOLOGY,
  getReviewAgentCategoryConfig,
} from "@/domain/review-agent/category-config";
import { classifyEvidence } from "@/domain/review-agent/evidence";
import { computeReviewReadiness } from "@/domain/review-agent/readiness";
import {
  filterContextualCompromises,
  filterSpecificPros,
} from "@/domain/review-agent/validate";
import {
  buildLongformSectionBody,
  ensureCanonicalSections,
  topicFromSection,
  type LongformTopic,
} from "@/lib/review/review-longform";
import { skipSentenceFromLimitation } from "@/lib/review/rewrite-uniqueness-era-skip";
import { softList } from "@/lib/review/review-voice";

const DEFAULT_REVIEWER = "author-kitletics-editorial";

function stableReviewId(productId: string): string {
  const slug = productId.replace(/^prod-/, "");
  return `review-${slug}`;
}

function stableReviewSlug(product: Product): string {
  return product.slug;
}

function titleFor(brand: Brand, product: Product): string {
  const base = product.fullName?.trim() || `${brand.name} ${product.name}`;
  return base.endsWith(" Review") ? base : `${base} Review`;
}

function fmtSpec(v: SpecValue | undefined): string | null {
  if (v == null) return null;
  if (typeof v === "object" && !Array.isArray(v)) {
    const r = v as { min?: number; max?: number };
    if (r.min != null && r.max != null) return `${r.min}–${r.max}`;
    if (r.min != null) return String(r.min);
    if (r.max != null) return String(r.max);
    return null;
  }
  if (Array.isArray(v)) return v.filter(Boolean).join(", ") || null;
  if (typeof v === "boolean") return v ? "yes" : "no";
  return String(v);
}

export function qualitativeLabel(score?: number): string {
  if (score == null || Number.isNaN(score)) return "Mixed";
  if (score >= 92) return "Exceptional";
  if (score >= 85) return "Excellent";
  if (score >= 78) return "Very Good";
  if (score >= 70) return "Good";
  return "Mixed";
}

/** Internal depth — never expose publicly */
export type ReviewDepthTier = "flagship" | "standard" | "light";

export function resolveReviewDepth(
  product: Product,
  priority: "P0" | "P1" | "P2" | "P3",
): ReviewDepthTier {
  if (priority === "P0" && (product.recommendationScore ?? 0) >= 85) return "flagship";
  const cat = getReviewAgentCategoryConfig(product.categoryId);
  if (!cat.reviewRecommended) return "light";
  if (priority === "P3" || product.lifecycleStatus !== "current") return "light";
  return "standard";
}

function buildShortVerdict(input: {
  brand: Brand;
  product: Product;
  recommendations: Recommendation[];
}): string {
  const { brand, product } = input;
  const what =
    product.shortDescription?.trim().replace(/\.$/, "") ||
    `${brand.name} ${product.name}`;
  const strength = product.strengths[0];
  const trade = product.weaknesses[0];
  const parts = [
    `${what}.`,
    strength
      ? `I'd shortlist it when you want ${strength.charAt(0).toLowerCase()}${strength.slice(1)}.`
      : null,
    trade
      ? skipSentenceFromLimitation(trade)
      : null,
  ].filter(Boolean);
  return parts.join(" ");
}

function buildFullVerdict(input: {
  brand: Brand;
  product: Product;
  shortVerdict: string;
  recommendations: Recommendation[];
}): string {
  const { brand, product, shortVerdict, recommendations } = input;
  const parts: string[] = [];

  if (product.verdict?.trim()) {
    parts.push(product.verdict.trim());
  } else {
    parts.push(
      `Buy the ${product.fullName || `${brand.name} ${product.name}`} when this role is most of your week.`,
    );
  }

  const high = recommendations.filter((r) => r.score >= 75).slice(0, 2);
  if (high.length && product.strengths[0]) {
    parts.push(`It earns a look for ${softList(product.strengths, 2)}.`);
  }

  if (product.weaknesses[0]) {
    parts.push(skipSentenceFromLimitation(product.weaknesses[0]));
  }

  const full = parts.join(" ").replace(/\s+/g, " ").trim();
  if (full === shortVerdict) {
    return `${full} Compare the linked alternatives before you buy on brand name alone.`;
  }
  return full;
}

function enrichPros(product: Product, brand: Brand): string[] {
  const out: string[] = [];
  for (const s of product.strengths) {
    if (s.trim().length >= 8) out.push(s.trim());
  }
  const weight = fmtSpec(product.specifications.weight);
  if (weight && /light|weight/i.test(product.strengths.join(" ")) === false) {
    // only add if strength mentions lightness or we have a distinctive weight claim in short desc
  }
  const cushion = fmtSpec(product.specifications.cushionLevel);
  if (cushion && !out.some((p) => /cushion/i.test(p))) {
    out.push(`${cushion} cushioning for the sessions it was built for`);
  }
  const stability = fmtSpec(product.specifications.stability);
  if (stability && /stabil/i.test(stability) && !out.some((p) => /stabil/i.test(p))) {
    out.push(`${stability} platform when you need guidance`);
  }
  const shape =
    fmtSpec(product.specifications.shape) || fmtSpec(product.specifications.balance);
  if (
    shape &&
    (product.categoryId.includes("racket") ||
      product.categoryId.includes("padel") ||
      product.categoryId.includes("pickle") ||
      product.categoryId.includes("badminton") ||
      product.categoryId.includes("squash"))
  ) {
    out.push(`${shape} shape/balance suited to its intended play style`);
  }
  const width = fmtSpec(product.specifications.widthOptions);
  if (width && /wide|2E|4E/i.test(width) && !out.some((p) => /wide|width/i.test(p))) {
    out.push(`Width options include ${width}`);
  }
  // Ensure brand+model specificity in at least one pro when thin
  if (out.length < 3 && product.shortDescription) {
    const clip = product.shortDescription.trim().replace(/\.$/, "");
    if (clip.length >= 20 && !out.includes(clip)) out.push(clip);
  }
  if (out.length < 2) {
    out.push(
      `Clear ${brand.name} role for ${product.name}`,
      product.shortDescription?.trim() || `Built for a specific job, not every session`,
    );
  }
  return filterSpecificPros(out, 5);
}

function enrichCons(product: Product): string[] {
  const out = [...(product.weaknesses ?? [])];
  const terrain = fmtSpec(product.specifications.terrain);
  if (terrain === "road" && !out.some((c) => /trail/i.test(c))) {
    out.push("Not designed for technical trail terrain");
  }
  const plate = fmtSpec(product.specifications.plate);
  if (plate === "none" || plate === "false" || plate === "no") {
    // don't invent
  }
  return filterContextualCompromises(out, 4);
}

function buildSections(input: {
  brand: Brand;
  product: Product;
  evidenceIds: string[];
  recommendations: Recommendation[];
  depth: ReviewDepthTier;
  pros: string[];
  cons: string[];
  whoShouldBuy: string[];
  whoShouldAvoid: string[];
  bottomLine: string;
  verdict: string;
  scoreBreakdown: ScoreBreakdownItem[];
  score: number;
}): ContentSection[] {
  const {
    brand,
    product,
    evidenceIds,
    depth,
    pros,
    cons,
    whoShouldBuy,
    whoShouldAvoid,
    bottomLine,
    verdict,
    scoreBreakdown,
    score,
  } = input;

  const stub: Review = {
    id: `review-draft-${product.id}`,
    slug: product.slug,
    productId: product.id,
    title: `${product.fullName || product.name} Review`,
    reviewType: "expert-research",
    verdict,
    bottomLine,
    score,
    summary: bottomLine,
    sections: [],
    pros,
    cons,
    whoShouldBuy,
    whoShouldAvoid,
    scoreBreakdown,
    evidenceIds,
    alternativeProductIds: [],
    comparisonIds: [],
    faqIds: [],
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let sections = ensureCanonicalSections(stub, product).map((section) => {
    const topic = topicFromSection(section.id, section.heading) as LongformTopic;
    return {
      ...section,
      body: buildLongformSectionBody(topic, product, stub, brand.name),
      evidenceIds,
    };
  });

  if (depth === "light") {
    const keep =
      /overview|what it is|strength|trade|who it is|value|key specs|verified/i;
    sections = sections
      .filter((s) => keep.test(`${s.id} ${s.heading}`))
      .slice(0, 6);
  } else if (depth === "standard") {
    sections = sections.slice(0, 10);
  }

  return sections.filter((s) => s.body.trim().length >= 40);
}

function buildScoreBreakdown(
  recommendations: Recommendation[],
  categoryId: string,
): ScoreBreakdownItem[] {
  const cat = getReviewAgentCategoryConfig(categoryId);
  const factors = new Map<string, { score: number; label?: string }>();
  for (const rec of recommendations) {
    for (const f of rec.factors) {
      const prev = factors.get(f.key);
      if (!prev || f.score > prev.score) {
        factors.set(f.key, { score: f.score, label: f.label });
      }
    }
  }
  if (factors.size === 0) return [];
  const items: ScoreBreakdownItem[] = [];
  for (const criterion of cat.criteria) {
    const f = factors.get(criterion.key);
    if (!f) continue;
    items.push({
      key: criterion.key,
      label: criterion.label,
      score: Math.round(f.score),
      max: 100,
      note: qualitativeLabel(f.score),
    });
  }
  return items.slice(0, 8);
}

function deriveWhoShouldBuy(
  product: Product,
  recommendations: Recommendation[],
): string[] {
  const fromRec = recommendations
    .filter((r) => r.score >= 72)
    .flatMap((r) =>
      r.strengths.length ? r.strengths : [r.explanation.split(".")[0] || ""],
    )
    .filter((s) => s && s.length >= 8);
  const strengths = [...product.strengths, ...fromRec]
    .map((s) => s.trim())
    .filter(Boolean);
  const unique = [...new Set(strengths)].slice(0, 3);
  if (!unique.length) {
    return [
      `Your week matches what ${product.name} does best — treat it as a defined role, not a universal tool`,
      `You want the strengths this model is known for more than a do-everything compromise`,
    ];
  }
  const peerHint = recommendations[0]?.explanation?.split(".")[0]?.trim();
  return unique.map((s, i) => {
    const lead = s.charAt(0).match(/[A-Z]/)
      ? s.charAt(0).toLowerCase() + s.slice(1)
      : s;
    if (i === 0) {
      return `You want ${lead} as a weekly priority — that is the ${product.name}'s main job${peerHint && peerHint.length < 60 ? ` (${peerHint})` : ""}`;
    }
    return `Most of your sessions line up with ${lead} more than an adjacent specialty role`;
  });
}

function deriveWhoShouldAvoid(
  product: Product,
  recommendations: Recommendation[],
): string[] {
  const low = recommendations
    .filter((r) => r.score < 55)
    .flatMap((r) => r.compromises);
  const merged = [...product.weaknesses, ...low]
    .map((s) => s.trim())
    .filter(Boolean);
  const unique = [...new Set(merged)].slice(0, 3);
  if (!unique.length) {
    return [
      `You want one product for every session and pace — the ${product.name} is a defined role, not a universal tool`,
      `Your must-haves sit outside this model's trade-offs — pick a clearer specialist instead`,
    ];
  }
  return unique.map((s, i) => {
    const lead = /runners|buyers|athletes|players|anyone/i.test(s)
      ? s
      : `you need to avoid ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
    if (i === 0) {
      return `${lead.charAt(0).toUpperCase()}${lead.slice(1)} — forcing the ${product.name} into that job usually disappoints`;
    }
    return `${lead.charAt(0).toUpperCase()}${lead.slice(1)} on this model`;
  });
}

export interface SynthesizeInput {
  product: Product;
  brand: Brand;
  evidence: Evidence[];
  recommendations: Recommendation[];
  alternativeProductIds: string[];
  comparisonIds: string[];
  existing?: Review | null;
  lock?: ReviewEditorialLock | null;
  priority?: "P0" | "P1" | "P2" | "P3";
}

/**
 * Deterministic Expert Research draft from Product + Recommendation + Evidence.
 * Never upgrades to first-hand. Never invents personal testing.
 */
export function synthesizeExpertResearchDraft(
  input: SynthesizeInput,
): StagedReviewDraft | null {
  const {
    product,
    brand,
    evidence,
    recommendations,
    alternativeProductIds,
    comparisonIds,
    existing,
    lock,
    priority = "P2",
  } = input;

  const ev = classifyEvidence(evidence);
  const cat = getReviewAgentCategoryConfig(product.categoryId);
  const depth = resolveReviewDepth(product, priority);

  const reviewType =
    existing?.reviewType === "first-hand-test" || existing?.reviewType === "hybrid"
      ? existing.reviewType
      : "expert-research";

  if (
    (reviewType === "first-hand-test" || reviewType === "hybrid") &&
    !ev.personalTest
  ) {
    return null;
  }

  // Need some product substance
  if (
    !product.strengths.length &&
    !product.shortDescription &&
    Object.keys(product.specifications).length < 2
  ) {
    return null;
  }

  if (
    reviewType === "expert-research" &&
    cat.minIndependentSources > 0 &&
    !ev.independent &&
    evidence.length === 0 &&
    !product.evidenceIds.length
  ) {
    return null;
  }

  const evidenceIds =
    evidence.length > 0
      ? evidence.map((e) => e.id)
      : product.evidenceIds.length
        ? [...product.evidenceIds]
        : ["ev-catalog-mfr", "ev-catalog-editorial"];

  // Ensure editorial evidence for subjective synthesis when only manufacturer linked
  const hasEditorialOrIndependent = evidence.some(
    (e) =>
      e.type === "editorial-research" ||
      e.type === "independent-review" ||
      e.type === "lab-test",
  );
  if (!hasEditorialOrIndependent) {
    if (!evidenceIds.includes("ev-catalog-editorial")) {
      evidenceIds.push("ev-catalog-editorial");
    }
    if (
      product.categoryId.includes("power") ||
      product.categoryId.includes("dumbbell") ||
      product.categoryId.includes("bench") ||
      product.categoryId.includes("barbell") ||
      product.categoryId.includes("plate") ||
      product.categoryId.includes("training-shoe") ||
      product.categoryId.includes("rower") ||
      product.categoryId.includes("treadmill") ||
      product.categoryId.includes("bike") ||
      product.categoryId.includes("erg") ||
      product.categoryId.includes("kettle") ||
      product.categoryId.includes("pull-up") ||
      product.categoryId.includes("functional") ||
      product.categoryId.includes("parallel") ||
      product.categoryId.includes("ring") ||
      product.categoryId.includes("vest")
    ) {
      if (!evidenceIds.includes("ev-fitness-editorial")) {
        evidenceIds.push("ev-fitness-editorial");
      }
    }
  }

  const locked = new Set(lock?.lockedFields ?? []);
  const shortVerdict =
    locked.has("bottomLine") && existing?.bottomLine
      ? existing.bottomLine
      : buildShortVerdict({ brand, product, recommendations });

  const verdict =
    locked.has("verdict") && existing?.verdict
      ? existing.verdict
      : buildFullVerdict({ brand, product, shortVerdict, recommendations });

  const pros =
    locked.has("pros") && existing?.pros?.length
      ? existing.pros
      : enrichPros(product, brand);

  const cons =
    locked.has("cons") && existing?.cons?.length
      ? existing.cons
      : enrichCons(product);

  const whoShouldBuy =
    locked.has("whoShouldBuy") && existing?.whoShouldBuy?.length
      ? existing.whoShouldBuy
      : deriveWhoShouldBuy(product, recommendations);

  const whoShouldAvoid =
    locked.has("whoShouldAvoid") && existing?.whoShouldAvoid?.length
      ? existing.whoShouldAvoid
      : deriveWhoShouldAvoid(product, recommendations);

  const scoreBreakdown =
    locked.has("scoreBreakdown") && existing?.scoreBreakdown?.length
      ? existing.scoreBreakdown
      : buildScoreBreakdown(recommendations, product.categoryId);

  const score =
    product.recommendationScore ??
    existing?.score ??
    (recommendations[0]?.score != null
      ? Math.round(recommendations[0].score)
      : 75);
  const resolvedScore = score > 0 ? score : 75;

  const sections =
    locked.has("sections") && existing?.sections?.length
      ? existing.sections
      : buildSections({
          brand,
          product,
          evidenceIds,
          recommendations,
          depth,
          pros,
          cons,
          whoShouldBuy,
          whoShouldAvoid,
          bottomLine: shortVerdict,
          verdict,
          scoreBreakdown,
          score: resolvedScore,
        });

  const id = existing?.id ?? stableReviewId(product.id);
  const slug = existing?.slug ?? stableReviewSlug(product);
  const title =
    locked.has("title") && existing?.title
      ? existing.title
      : titleFor(brand, product);

  const changeSummary: string[] = [];
  if (existing) {
    if (existing.bottomLine !== shortVerdict && !locked.has("bottomLine")) {
      changeSummary.push("Updated short verdict from product/recommendation data");
    }
    if ((existing.pros ?? []).join("|") !== pros.join("|") && !locked.has("pros")) {
      changeSummary.push("Refreshed pros from product strengths/specs");
    }
    if (!locked.has("sections")) {
      changeSummary.push("Rewrote sections in expert buying-guide voice");
    }
  }

  const draft: StagedReviewDraft = {
    id,
    slug,
    productId: product.id,
    reviewType: "expert-research",
    title,
    subtitle: existing?.subtitle,
    bottomLine: shortVerdict,
    verdict,
    summary: shortVerdict,
    score: resolvedScore,
    pros,
    cons,
    whoShouldBuy,
    whoShouldAvoid,
    scoreBreakdown,
    sections,
    evidenceIds: [...new Set(evidenceIds)],
    alternativeProductIds: alternativeProductIds.slice(0, 4),
    comparisonIds: comparisonIds.slice(0, 3),
    testingContext: EXPERT_RESEARCH_METHODOLOGY,
    editorialDisclosure: EDITORIAL_DISCLOSURE,
    reviewerId: existing?.reviewerId ?? DEFAULT_REVIEWER,
    proposedStatus: "needs-review",
    readiness: computeReviewReadiness({ product, review: null, evidence }),
    changeSummary: changeSummary.length ? changeSummary : undefined,
    preservedManualFields: locked.size ? [...locked] : undefined,
  };

  draft.readiness = computeReviewReadiness({
    product,
    review: stagedDraftToReviewShape(draft),
    evidence,
  });

  return draft;
}

export function stagedDraftToReviewShape(
  draft: StagedReviewDraft,
  opts?: { publish?: boolean },
): Review {
  const now = new Date().toISOString();
  return {
    id: draft.id,
    slug: draft.slug,
    productId: draft.productId,
    title: draft.title,
    subtitle: draft.subtitle,
    reviewType: draft.reviewType,
    verdict: draft.verdict,
    bottomLine: draft.bottomLine,
    score: draft.score,
    summary: draft.summary,
    reviewerId: draft.reviewerId,
    testingContext: draft.testingContext,
    editorialDisclosure: draft.editorialDisclosure,
    sections: draft.sections,
    pros: draft.pros,
    cons: draft.cons,
    whoShouldBuy: draft.whoShouldBuy,
    whoShouldAvoid: draft.whoShouldAvoid,
    scoreBreakdown: draft.scoreBreakdown,
    evidenceIds: draft.evidenceIds,
    alternativeProductIds: draft.alternativeProductIds,
    comparisonIds: draft.comparisonIds,
    faqIds: [],
    seoTitle: `${draft.title}: Verdict, Pros & Alternatives | Kitletics`,
    seoDescription: `Expert research review of ${draft.title.replace(/ Review$/, "")} — who it's for, trade-offs, performance notes and alternatives.`,
    status: opts?.publish ? "published" : "review",
    publishedAt: opts?.publish ? now : undefined,
    createdAt: now,
    updatedAt: now,
    lastVerifiedAt: now,
  };
}
