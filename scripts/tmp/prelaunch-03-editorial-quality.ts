/**
 * READ-ONLY pre-launch audit 03 — Editorial content quality.
 * Does not generate, enrich-to-disk, or change publication status.
 *
 * tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-03-editorial-quality.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { authors as rawAuthors } from "@/content/authors";
import { bestGuides as rawBestGuides } from "@/content/best-guides";
import {
  buyingGuides as rawBuyingGuides,
  comparisons as rawComparisons,
  gearSetups as rawGearSetups,
} from "@/content/editorial";
import { evidence as rawEvidence } from "@/content/evidence";
import { products as rawProducts } from "@/content/products";
import { reviews as rawReviews } from "@/content/reviews";
import { tools as rawTools } from "@/content/tools";
import { categories as rawCategories } from "@/content/taxonomy/categories";
import { sports as rawSports } from "@/content/taxonomy/sports";
import {
  findIntentCollisions,
  runningContentIntentMap,
} from "@/content/running/intent-map";
import type {
  BestGuide,
  Comparison,
  Review,
} from "@/domain/editorial/types";
import type { Tool } from "@/domain/tools/types";
import type { Evidence } from "@/domain/recommendations/types";
import { getAllFinderDefinitions } from "@/domain/finders/repository";
import { getAllCalculatorDefinitions } from "@/domain/calculators/registry";
import {
  canPublishAlternativesPage,
} from "@/domain/relationships/eligibility";
import { getAllProductRelationships } from "@/repositories/relationships";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import { getGuideDepthTier } from "@/lib/guides/guide-depth";
import { getLongFormGuideConfig } from "@/lib/guides/long-form-config";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import { applyProductSpecFill } from "@/content/specs/product-spec-fill";
import { applyRunningAudienceVariants } from "@/content/running/audience-variants";
import { resolveRunningCatalogImages } from "@/content/running/media";
import { canonicalProductPairKey } from "@/lib/comparison/engine";

const OUT_DIR = join(process.cwd(), "docs/prelaunch");
const DATA_DIR = join(OUT_DIR, "data");
const AUDIT_NOW = new Date("2026-09-06T12:00:00.000Z");
const PROD = { isDev: false as const, now: AUDIT_NOW };

type ReviewClass =
  | "LAUNCH_READY"
  | "NEEDS_MINOR_WORK"
  | "THIN"
  | "DUPLICATIVE"
  | "BLOCKED";

type GuideClass =
  | "COMPLETE"
  | "THIN"
  | "NEEDS_RESEARCH"
  | "STALE"
  | "BLOCKED";

type BestQuality =
  | "LAUNCH_READY"
  | "NEEDS_MINOR_WORK"
  | "THIN"
  | "BLOCKED";

const FIRST_HAND_RE =
  /\b(we tested|our test(?:ing)?|hands-?on|I wore|we wore|I ran|we ran|personally tested|after \d+\s*(?:km|miles?)|during our testing|we measured|\d+\s*(?:km|miles?)\s+(?:tested|in testing|on (?:our|the) (?:feet|watch|strap)))\b/i;

const FIRST_HAND_LOOSE =
  /\b((?:we|I|our)\s+(?:tested|wore|used|ran|logged)|tested\s+(?:for|over|across)\s+\d+|miles?\s+tested|km\s+tested|hands-?on\s+(?:time|with|test))\b/i;

const FIRST_HAND_NEGATION =
  /\b(no|not|never|without|haven'?t|have not|did not|didn'?t)\b[^.!?\n]{0,40}\b(personal(?:ly)?\s+)?(wear-?test|tested|hands-?on|wore|ran)\b/i;

function hasFirstHandClaim(text: string): boolean {
  if (!FIRST_HAND_RE.test(text) && !FIRST_HAND_LOOSE.test(text)) return false;
  // Strip negated disclaimers before matching (e.g. "No Kitletics personal wear-test yet")
  const stripped = text.replace(FIRST_HAND_NEGATION, " ");
  return FIRST_HAND_RE.test(stripped) || FIRST_HAND_LOOSE.test(stripped);
}

function pct(n: number, d: number): number {
  if (!d) return 0;
  return Math.round((n / d) * 1000) / 10;
}

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function exposed(meta: {
  status: string;
  publishedAt?: string;
  scheduledFor?: string;
  noindex?: boolean;
}): boolean {
  return isPubliclyVisible(meta as never, PROD) && !meta.noindex;
}

function statusBucket(status: string): string {
  if (
    status === "published" ||
    status === "draft" ||
    status === "scheduled" ||
    status === "review" ||
    status === "archived"
  ) {
    return status;
  }
  return "unknown";
}

function normalizeCopy(text: string): string {
  return text
    .toLowerCase()
    .replace(/\b(asics|nike|brooks|hoka|garmin|coros|salomon|adidas|saucony|altra|on|polar|suunto)\b/g, "BRAND")
    .replace(/\b\d+(\.\d+)?\b/g, "#")
    .replace(/[^a-z\s#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function esc(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

// ── Catalog helpers ─────────────────────────────────────────────────────────
const filled = applyProductSpecFill(rawProducts);
const { products: withAudience } = applyRunningAudienceVariants(filled);
const allProducts = resolveRunningCatalogImages(withAudience);
const productById = new Map(allProducts.map((p) => [p.id, p]));
const sportById = new Map(rawSports.map((s) => [s.id, s]));
const categoryById = new Map(rawCategories.map((c) => [c.id, c]));
const evidenceById = new Map(rawEvidence.map((e) => [e.id, e]));
const authorById = new Map(rawAuthors.map((a) => [a.id, a]));
const allRels = getAllProductRelationships();

function evidenceFor(ids: string[] | undefined): Evidence[] {
  return (ids ?? []).map((id) => evidenceById.get(id)).filter(Boolean) as Evidence[];
}

function hasPersonalTest(ids: string[] | undefined): boolean {
  return evidenceFor(ids).some((e) => e.type === "personal-test");
}

function reviewPublicText(r: Review): string {
  return [
    r.summary,
    r.verdict,
    r.bottomLine,
    r.testingContext,
    ...(r.pros ?? []),
    ...(r.cons ?? []),
    ...(r.whoShouldBuy ?? []),
    ...(r.whoShouldAvoid ?? []),
    ...(r.sections ?? []).map((s) => `${s.heading}\n${s.body}`),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function countByStatus<T extends { status: string }>(items: T[]) {
  const out: Record<string, number> = {};
  for (const i of items) {
    const b = statusBucket(i.status);
    out[b] = (out[b] ?? 0) + 1;
  }
  return out;
}

function countBySport<T extends { sportId?: string; sportIds?: string[] }>(
  items: T[],
) {
  const out: Record<string, number> = {};
  for (const i of items) {
    const ids = i.sportIds?.length
      ? i.sportIds
      : i.sportId
        ? [i.sportId]
        : ["(none)"];
    for (const id of ids) {
      const name = sportById.get(id)?.name ?? id;
      out[name] = (out[name] ?? 0) + 1;
    }
  }
  return out;
}

function countByCategory<T extends { categoryId?: string; categoryIds?: string[] }>(
  items: T[],
) {
  const out: Record<string, number> = {};
  for (const i of items) {
    const ids = i.categoryIds?.length
      ? i.categoryIds
      : i.categoryId
        ? [i.categoryId]
        : ["(none)"];
    for (const id of ids) {
      const name = categoryById.get(id)?.name ?? id;
      out[name] = (out[name] ?? 0) + 1;
    }
  }
  return out;
}

// ── Inventory ───────────────────────────────────────────────────────────────
const useCaseBest = rawBestGuides.filter((g) => g.guideKind === "use-case");
const categoryBest = rawBestGuides.filter((g) => g.guideKind !== "use-case");

const explainerSlugs = new Set(
  rawBuyingGuides
    .filter((g) => getLongFormGuideConfig(g.slug)?.layout === "explainer")
    .map((g) => g.slug),
);
const longFormSlugs = new Set(
  rawBuyingGuides
    .filter((g) => {
      const c = getLongFormGuideConfig(g.slug);
      return Boolean(c) && c?.layout !== "explainer";
    })
    .map((g) => g.slug),
);

const finderDefs = getAllFinderDefinitions();
const calculatorDefs = getAllCalculatorDefinitions();

// Alternatives pages (eligibility-based, not a separate content type seed)
const alternativesEligible = allProducts.filter((p) => {
  const elig = canPublishAlternativesPage(p, allRels);
  return elig.ok && exposed(p);
}).length;
const alternativesPossible = allProducts.filter((p) => p.status === "published").length;

const inventory = {
  reviews: {
    total: rawReviews.length,
    byStatus: countByStatus(rawReviews),
    bySport: (() => {
      const out: Record<string, number> = {};
      for (const r of rawReviews) {
        const p = productById.get(r.productId);
        for (const sid of p?.sportIds ?? ["(orphan-product)"]) {
          const name = sportById.get(sid)?.name ?? sid;
          out[name] = (out[name] ?? 0) + 1;
        }
      }
      return out;
    })(),
    byCategory: (() => {
      const out: Record<string, number> = {};
      for (const r of rawReviews) {
        const p = productById.get(r.productId);
        const name = categoryById.get(p?.categoryId ?? "")?.name ?? p?.categoryId ?? "(orphan)";
        out[name] = (out[name] ?? 0) + 1;
      }
      return out;
    })(),
  },
  bestGuides: {
    total: rawBestGuides.length,
    categoryGuides: categoryBest.length,
    useCaseGuides: useCaseBest.length,
    byStatus: countByStatus(rawBestGuides),
    bySport: countBySport(rawBestGuides),
    byCategory: countByCategory(rawBestGuides),
  },
  buyingGuides: {
    total: rawBuyingGuides.length,
    explainers: explainerSlugs.size,
    longFormConfigured: longFormSlugs.size,
    byStatus: countByStatus(rawBuyingGuides),
    bySport: countBySport(rawBuyingGuides),
    byCategory: countByCategory(rawBuyingGuides),
    byGuideType: (() => {
      const out: Record<string, number> = {};
      for (const g of rawBuyingGuides) {
        const t = g.guideType ?? "buying-guide";
        out[t] = (out[t] ?? 0) + 1;
      }
      return out;
    })(),
  },
  comparisons: {
    total: rawComparisons.length,
    byStatus: countByStatus(rawComparisons),
    byCategory: countByCategory(rawComparisons),
  },
  gearSetups: {
    total: rawGearSetups.length,
    byStatus: countByStatus(rawGearSetups),
    bySport: countBySport(rawGearSetups),
  },
  tools: {
    total: rawTools.length,
    byType: (() => {
      const out: Record<string, number> = {};
      for (const t of rawTools) {
        out[t.type] = (out[t.type] ?? 0) + 1;
      }
      return out;
    })(),
    byStatus: countByStatus(rawTools),
    bySport: countBySport(rawTools),
  },
  finders: {
    toolRecords: rawTools.filter((t) => t.type === "finder").length,
    definitions: finderDefs.length,
  },
  calculators: {
    toolRecords: rawTools.filter((t) => t.type === "calculator").length,
    registryEntries: calculatorDefs.length,
  },
  alternativesPages: {
    publishedProducts: alternativesPossible,
    eligibleIndexable: alternativesEligible,
    note: "Alternatives pages are generated per product when relationship eligibility passes; not a separate editorial seed entity.",
  },
  authors: { total: rawAuthors.length },
};

// ── Reviews evaluation ──────────────────────────────────────────────────────
console.log("Evaluating reviews...");

interface ReviewEval {
  id: string;
  slug: string;
  route: string;
  title: string;
  productId: string;
  productName: string;
  categoryId?: string;
  sportIds: string[];
  reviewType: string;
  publicationStatus: string;
  productionExposed: boolean;
  classification: ReviewClass;
  reasons: string[];
  firstHandClaimWithoutEvidence: boolean;
  firstHandClaimExcerpts: string[];
  dimensions: Record<string, boolean | string>;
  wordCount: number;
  sectionCount: number;
  decisionScore: number;
  duplicativeOf?: string;
}

const reviewEvals: ReviewEval[] = [];
const reviewNormBodies = new Map<string, string[]>(); // normalized -> review ids

for (const raw of rawReviews) {
  const product = productById.get(raw.productId);
  // Page-time enrichment (in-memory only — does not write content)
  const review = product
    ? enrichReviewForPage(raw, product, {
        brand: undefined,
      })
    : raw;

  const text = reviewPublicText(review);
  const ev = evidenceFor(review.evidenceIds);
  const personal = hasPersonalTest(review.evidenceIds);
  const claimHit = hasFirstHandClaim(text);
  const falseFirstHand = claimHit && !personal;

  const excerpts: string[] = [];
  if (falseFirstHand || claimHit) {
    for (const re of [FIRST_HAND_RE, FIRST_HAND_LOOSE]) {
      const m = text.match(re);
      if (m?.index != null) {
        excerpts.push(text.slice(Math.max(0, m.index - 30), m.index + 90));
      }
    }
  }

  const dims = {
    substantiveVerdict: Boolean(
      (review.verdict ?? review.bottomLine)?.trim() &&
        words(review.verdict ?? review.bottomLine ?? "") >= 20,
    ),
    pros: (review.pros?.length ?? 0) >= 2,
    cons: (review.cons?.length ?? 0) >= 2,
    bestFor: (review.whoShouldBuy?.length ?? 0) >= 2,
    skipIf: (review.whoShouldAvoid?.length ?? 0) >= 2,
    specAnalysis: (review.sections ?? []).some((s) =>
      /spec|geometry|stack|drop|weight|cushion|foam|plate|display|battery/i.test(
        `${s.id} ${s.heading}`,
      ),
    ),
    useCaseAnalysis: (review.sections ?? []).some((s) =>
      /use case|best for|who should|training|race|daily|long run/i.test(
        `${s.id} ${s.heading} ${s.body.slice(0, 200)}`,
      ),
    ),
    fit: (review.sections ?? []).some((s) =>
      /fit|sizing|comfort|width/i.test(`${s.id} ${s.heading}`),
    ),
    performance: (review.sections ?? []).some((s) =>
      /ride|performance|cushion|grip|stabil|feel|tech|sensor|gps/i.test(
        `${s.id} ${s.heading}`,
      ),
    ),
    alternatives: (review.alternativeProductIds?.length ?? 0) >= 1,
    comparisonContext: (review.comparisonIds?.length ?? 0) >= 1,
    evidence: ev.length >= 1,
    author: Boolean(review.reviewerId && authorById.has(review.reviewerId)),
    methodology: Boolean(review.testingContext?.trim()),
    productSourceDisclosure: Boolean(
      review.productSource ||
        review.testingDetails?.productSource ||
        /affiliate|brand-supplied|not personally|research/i.test(
          `${review.testingContext ?? ""} ${review.editorialDisclosure ?? ""}`,
        ),
    ),
    reviewType: review.reviewType ?? "unknown",
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
  const sectionCount = review.sections?.length ?? 0;

  const norm = normalizeCopy(
    `${review.summary}\n${(review.sections ?? []).map((s) => s.body).join("\n")}`.slice(0, 4000),
  );
  const peers = reviewNormBodies.get(norm) ?? [];
  peers.push(review.id);
  reviewNormBodies.set(norm, peers);

  const productionExposed = exposed(review);
  const reasons: string[] = [];
  let classification: ReviewClass;

  if (falseFirstHand) {
    classification = "BLOCKED";
    reasons.push("FIRST_HAND_CLAIM_WITHOUT_PERSONAL_TEST_EVIDENCE");
  } else if (!productionExposed || review.status === "archived" || review.noindex) {
    classification = "BLOCKED";
    if (!productionExposed) reasons.push("not_production_exposed");
    if (review.noindex) reasons.push("noindex");
    if (review.status !== "published") reasons.push(`status=${review.status}`);
  } else if (!product) {
    classification = "BLOCKED";
    reasons.push("orphan_product");
  } else if (
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
    classification = "LAUNCH_READY";
    reasons.push(`decisionScore=${decisionScore}`, `words=${wc}`);
  } else if (
    dims.substantiveVerdict &&
    (dims.pros || dims.bestFor) &&
    sectionCount >= 3 &&
    wc >= 350 &&
    decisionScore >= 50
  ) {
    classification = "NEEDS_MINOR_WORK";
    const missing = Object.entries(dims)
      .filter(([, v]) => v === false)
      .map(([k]) => k);
    reasons.push(...missing.slice(0, 8), `decisionScore=${decisionScore}`);
  } else {
    classification = "THIN";
    reasons.push(`decisionScore=${decisionScore}`, `words=${wc}`, `sections=${sectionCount}`);
  }

  reviewEvals.push({
    id: review.id,
    slug: review.slug,
    route: `/reviews/${review.slug}`,
    title: review.title,
    productId: review.productId,
    productName: product?.fullName ?? "(missing product)",
    categoryId: product?.categoryId,
    sportIds: product?.sportIds ?? [],
    reviewType: review.reviewType ?? "unknown",
    publicationStatus: review.status,
    productionExposed,
    classification,
    reasons,
    firstHandClaimWithoutEvidence: falseFirstHand,
    firstHandClaimExcerpts: [...new Set(excerpts)].slice(0, 3),
    dimensions: dims,
    wordCount: wc,
    sectionCount,
    decisionScore,
  });
}

// Mark duplicative (identical normalized body among published reviews)
for (const [, ids] of reviewNormBodies) {
  if (ids.length < 2) continue;
  const evals = reviewEvals.filter((r) => ids.includes(r.id));
  // Keep the first as primary; mark others DUPLICATIVE unless already BLOCKED
  const sorted = evals.sort((a, b) => a.slug.localeCompare(b.slug));
  for (const dup of sorted.slice(1)) {
    if (dup.classification === "BLOCKED") continue;
    dup.classification = "DUPLICATIVE";
    dup.duplicativeOf = sorted[0].slug;
    dup.reasons.unshift(`duplicative_of=${sorted[0].slug}`);
  }
}

const reviewTypeCounts = {
  total: rawReviews.length,
  "first-hand-test": rawReviews.filter((r) => r.reviewType === "first-hand-test").length,
  "expert-research": rawReviews.filter((r) => r.reviewType === "expert-research").length,
  hybrid: rawReviews.filter((r) => r.reviewType === "hybrid").length,
  unknown: rawReviews.filter((r) => !r.reviewType).length,
};

const reviewClassCounts = {
  LAUNCH_READY: reviewEvals.filter((r) => r.classification === "LAUNCH_READY").length,
  NEEDS_MINOR_WORK: reviewEvals.filter((r) => r.classification === "NEEDS_MINOR_WORK").length,
  THIN: reviewEvals.filter((r) => r.classification === "THIN").length,
  DUPLICATIVE: reviewEvals.filter((r) => r.classification === "DUPLICATIVE").length,
  BLOCKED: reviewEvals.filter((r) => r.classification === "BLOCKED").length,
};

const firstHandBlockers = reviewEvals.filter((r) => r.firstHandClaimWithoutEvidence);
const reviewsNotReady = reviewEvals
  .filter((r) => r.classification !== "LAUNCH_READY")
  .sort((a, b) => a.classification.localeCompare(b.classification) || a.slug.localeCompare(b.slug));

// ── Best guides ─────────────────────────────────────────────────────────────
console.log("Evaluating best guides...");

function assessBestGuide(g: BestGuide) {
  const route = `/best/${g.slug}`;
  const recs = g.recommendations ?? [];
  const withFit = recs.filter((r) => (r.whyItFits?.length ?? 0) >= 1 || words(r.whyRecommended ?? r.rationale ?? "") >= 25);
  const withTradeoffs = recs.filter(
    (r) => (r.tradeoffs?.length ?? 0) + (r.compromises?.length ?? 0) >= 1,
  );
  const withBestFor = recs.filter(
    (r) =>
      (r.bestForProfiles?.length ?? 0) +
        (r.worksWellFor?.length ?? 0) +
        (r.useCaseStrengths?.length ?? 0) >=
      1,
  );
  const withAvoid = recs.filter(
    (r) =>
      (r.notIdealFor?.length ?? 0) +
        (r.whoShouldAvoid?.length ?? 0) +
        (r.lessSuitedTo?.length ?? 0) >=
      1,
  );
  const withChooseInstead = recs.filter(
    (r) => (r.chooseInsteadWhen?.length ?? 0) >= 1 || (r.considerInsteadProductIds?.length ?? 0) >= 1,
  );
  const considered = g.consideredProductIds?.length ?? g.consideredProducts?.length ?? 0;
  const shortlisted = g.shortlistedProductIds?.length ?? 0;
  const introWords = words(`${g.intro} ${g.whatMattersIntro ?? ""} ${g.buyingAdvice ?? ""}`);
  const methodology = Boolean(g.selectionMethodology?.trim() || g.methodologySummary?.trim());
  const evidence = (g.evidenceIds?.length ?? 0) > 0;
  const comparison = (g.comparisonProductIds?.length ?? 0) >= 2;
  const criteria = (g.selectionCriteria?.length ?? 0) >= 2;
  const whatWeLookFor = (g.whatWeLookFor?.length ?? 0) >= 2;

  const thinCardShelf =
    introWords < 120 &&
    withFit.length === 0 &&
    withTradeoffs.length === 0 &&
    withChooseInstead.length === 0 &&
    !whatWeLookFor &&
    recs.length <= 6;

  const contextualDepth =
    withFit.length >= Math.ceil(recs.length * 0.6) &&
    withTradeoffs.length >= Math.ceil(recs.length * 0.4)
      ? "high"
      : withFit.length >= 1 || withTradeoffs.length >= 1
        ? "medium"
        : "low";

  const productionExposed = exposed(g);
  let qualityStatus: BestQuality;
  const reasons: string[] = [];

  if (!productionExposed) {
    qualityStatus = "BLOCKED";
    reasons.push("not_production_exposed", `status=${g.status}`);
  } else if (thinCardShelf) {
    qualityStatus = "THIN";
    reasons.push("title_intro_cards_faq_pattern");
  } else if (
    contextualDepth === "high" &&
    methodology &&
    criteria &&
    withBestFor.length >= 1 &&
    withAvoid.length >= 1 &&
    (comparison || withChooseInstead.length >= 1) &&
    introWords >= 100
  ) {
    qualityStatus = "LAUNCH_READY";
    reasons.push(`contextualDepth=${contextualDepth}`);
    if (!evidence) reasons.push("no_evidence_ids_but_methodology_present");
  } else if (
    contextualDepth === "medium" &&
    methodology &&
    criteria &&
    withTradeoffs.length >= Math.ceil(recs.length * 0.5) &&
    withChooseInstead.length >= 1 &&
    introWords >= 40
  ) {
    qualityStatus = "NEEDS_MINOR_WORK";
    if (introWords < 100) reasons.push("intro_thin");
    if (!withAvoid.length) reasons.push("missing_who_should_avoid_on_picks");
    if (!withBestFor.length) reasons.push("missing_best_for_profiles_on_picks");
    if (!evidence) reasons.push("no_evidence_ids");
  } else if (recs.length >= 3 && (methodology || criteria) && introWords >= 30) {
    qualityStatus = "NEEDS_MINOR_WORK";
    if (contextualDepth === "low") reasons.push("low_contextual_reasoning");
    if (!withChooseInstead.length) reasons.push("missing_choose_instead");
    if (!withAvoid.length) reasons.push("missing_who_should_avoid_on_picks");
    if (!evidence) reasons.push("no_evidence_ids");
    if (!comparison) reasons.push("no_comparison_table_products");
    if (introWords < 80) reasons.push("intro_thin");
  } else {
    qualityStatus = "THIN";
    reasons.push(`contextualDepth=${contextualDepth}`, `introWords=${introWords}`);
  }

  return {
    id: g.id,
    slug: g.slug,
    route,
    title: g.title,
    intent: g.guideKind === "use-case" ? "use-case" : "category",
    sportId: g.sportId,
    categoryId: g.categoryId,
    publicationStatus: g.status,
    productionExposed,
    consideredProducts: considered,
    shortlisted,
    recommended: recs.length,
    contextualReasoningDepth: contextualDepth,
    picksWithTradeoffs: withTradeoffs.length,
    picksWithBestFor: withBestFor.length,
    picksWithAvoid: withAvoid.length,
    picksWithChooseInstead: withChooseInstead.length,
    hasComparison: comparison,
    hasMethodology: methodology,
    hasEvidence: evidence,
    hasCriteria: criteria,
    hasWhatWeLookFor: whatWeLookFor,
    introWords,
    thinCardShelf,
    qualityStatus,
    reasons,
    decisionScore:
      (contextualDepth === "high" ? 40 : contextualDepth === "medium" ? 20 : 0) +
      (methodology ? 10 : 0) +
      (criteria ? 10 : 0) +
      (withChooseInstead.length ? 10 : 0) +
      (withAvoid.length ? 10 : 0) +
      (comparison ? 10 : 0) +
      (evidence ? 10 : 0),
  };
}

const bestEvals = rawBestGuides.map(assessBestGuide);
const thinBestGuides = bestEvals.filter((b) => b.thinCardShelf || b.qualityStatus === "THIN");

// ── Buying / long-form guides ───────────────────────────────────────────────
console.log("Evaluating buying guides...");

const guideEvals = rawBuyingGuides.map((g) => {
  const assessment = assessGuideQuality(g);
  const depthTier = getGuideDepthTier(g.slug);
  const config = getLongFormGuideConfig(g.slug);
  const productionExposed = exposed(g);

  // Map assessGuideQuality status → requested enum (uppercase)
  let status: GuideClass;
  if (!productionExposed || assessment.status === "blocked") status = "BLOCKED";
  else if (assessment.status === "complete") status = "COMPLETE";
  else if (assessment.status === "thin") status = "THIN";
  else if (assessment.status === "needs-research" || assessment.status === "needs-editorial-review") {
    status = "NEEDS_RESEARCH";
  } else if (assessment.status === "stale") status = "STALE";
  else status = "NEEDS_RESEARCH";

  const typeLabel =
    config?.layout === "explainer"
      ? "explainer"
      : g.guideType ?? "buying-guide";

  return {
    id: g.id,
    slug: g.slug,
    route: `/guides/${g.slug}`,
    title: g.title,
    type: typeLabel,
    sportId: g.sportId,
    categoryId: g.categoryId,
    publicationStatus: g.status,
    productionExposed,
    depthTier,
    substantiveSections: g.sections?.length ?? 0,
    questionCoverage: assessment.blockCoverage,
    decisionCompleteness: assessment.decisionCompleteness,
    visuals: assessment.blockCoverage.visualExplainer,
    productExamples: assessment.productExampleCount,
    evidence: assessment.blockCoverage.evidenceNote,
    finderLink: assessment.blockCoverage.finderCta,
    bestLink: assessment.blockCoverage.bestGuideCta,
    compareLink: assessment.blockCoverage.compareLink,
    faq: assessment.blockCoverage.faq,
    relatedGuides: assessment.blockCoverage.relatedGuides,
    status,
    internalScore: assessment.internalScore,
    issues: assessment.issues,
    wordEstimate: assessment.wordEstimate,
    structuredBlockCount: assessment.structuredBlockCount,
  };
});

// ── Comparisons ─────────────────────────────────────────────────────────────
function assessComparison(c: Comparison) {
  const productionExposed = exposed(c);
  const summaryWords = words(c.summary ?? "");
  const hasCriteria = (c.criteria?.length ?? 0) >= 2;
  const hasUseCase = (c.recommendationsByUseCase?.length ?? 0) >= 1;
  const hasDiffs = (c.keyDifferences?.length ?? 0) >= 1;
  const meaningful =
    (hasCriteria && hasUseCase && hasDiffs) ||
    (summaryWords >= 25 && hasCriteria && (hasUseCase || hasDiffs)) ||
    (summaryWords >= 40 && hasCriteria);
  const thin = !meaningful && productionExposed;
  return {
    id: c.id,
    slug: c.slug,
    route: `/compare/${c.slug}`,
    title: c.title,
    productIds: c.productIds,
    categoryId: c.categoryId,
    publicationStatus: c.status,
    productionExposed,
    meaningful,
    thin,
    summaryWords,
    criteriaCount: c.criteria?.length ?? 0,
    useCaseRecs: c.recommendationsByUseCase?.length ?? 0,
    keyDifferences: c.keyDifferences?.length ?? 0,
  };
}

const comparisonEvals = rawComparisons.map(assessComparison);

// Detect reverse duplicates
const pairGroups = new Map<string, string[]>();
for (const c of rawComparisons) {
  if (c.productIds.length < 2) continue;
  const key = canonicalProductPairKey(c.productIds);
  const list = pairGroups.get(key) ?? [];
  list.push(c.slug);
  pairGroups.set(key, list);
}
const reverseDuplicates = [...pairGroups.entries()]
  .filter(([, slugs]) => slugs.length > 1)
  .map(([key, slugs]) => ({ pairKey: key, slugs }));

// Combinatorial capacity (not generated as indexable pages)
const shoeProducts = allProducts.filter(
  (p) => p.categoryId === "cat-running-shoes" && p.status === "published" && !p.noindex,
);
const possibleShoePairs = (shoeProducts.length * (shoeProducts.length - 1)) / 2;
const editorialShoeComparisons = rawComparisons.filter(
  (c) => c.categoryId === "cat-running-shoes",
).length;

const comparisonsReport = {
  editorialTotal: rawComparisons.length,
  published: rawComparisons.filter((c) => c.status === "published").length,
  productionExposed: comparisonEvals.filter((c) => c.productionExposed).length,
  meaningful: comparisonEvals.filter((c) => c.meaningful).length,
  thin: comparisonEvals.filter((c) => c.thin).length,
  reverseDuplicateGroups: reverseDuplicates.length,
  reverseDuplicates,
  combinatorial: {
    systemCreatesCombinatorialIndexablePages: false,
    note: "generateStaticParams uses getComparisons() editorial seeds only. Dynamic /compare? or pair URLs via getDynamicComparisonData are explicitly noindex; editorial pairs redirect to canonical slug.",
    publishedRunningShoes: shoeProducts.length,
    theoreticalShoePairs: possibleShoePairs,
    editorialShoeComparisons,
  },
  items: comparisonEvals,
};

// ── Tools / finders / calculators ───────────────────────────────────────────
function assessTool(t: Tool) {
  const finder = finderDefs.find((f) => f.slug === t.slug);
  const productionExposed = exposed(t) && t.available;
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    route: t.href ?? `/tools/${t.slug}`,
    type: t.type,
    available: t.available,
    publicationStatus: t.status,
    productionExposed,
    functional: t.available && (t.type !== "finder" || Boolean(finder)),
    indexableLanding: productionExposed && !t.noindex,
    resultsPagesIndexable: false, // hard-coded noindex in results page metadata
    requiresJS: true,
    hasExplanatoryLanding: Boolean(
      (t.shortDescription ?? t.description)?.trim() &&
        words(t.shortDescription ?? t.description) >= 12,
    ),
    uniqueValue: Boolean(t.featured || (t.goalTags?.length ?? 0) >= 2),
    hasFinderDefinition: Boolean(finder),
    sportIds: t.sportIds,
  };
}

const toolEvals = rawTools.map(assessTool);

// ── Duplicate intent ────────────────────────────────────────────────────────
const intentCollisions = findIntentCollisions();

// Heuristic cannibalization: best vs guides similar titles/slugs
const cannibalization: { kind: string; routes: string[]; reason: string }[] = [];

for (const best of rawBestGuides) {
  for (const guide of rawBuyingGuides) {
    const b = best.slug.replace(/^(best-)?/, "");
    const g = guide.slug.replace(/^(how-to-choose-|what-is-a-)/, "");
    if (b && g && (b.includes(g) || g.includes(b)) && b.length > 6) {
      cannibalization.push({
        kind: "best_vs_guide",
        routes: [`/best/${best.slug}`, `/guides/${guide.slug}`],
        reason: `slug overlap: ${best.slug} ↔ ${guide.slug}`,
      });
    }
  }
}

// Best vs category path from intent map supportingPaths
for (const e of runningContentIntentMap) {
  if (e.pageType === "best-guide" && e.supportingPaths?.some((p) => p.startsWith("/running/"))) {
    cannibalization.push({
      kind: "best_vs_category",
      routes: [e.canonicalPath, ...(e.supportingPaths ?? [])],
      reason: `intent map topic "${e.topic}" lists best + category/supporting paths`,
    });
  }
}

// Men/Women near-duplicates in best/guides titles
const genderPairs: { routes: string[]; titles: string[] }[] = [];
const titleItems = [
  ...rawBestGuides.map((g) => ({ route: `/best/${g.slug}`, title: g.title })),
  ...rawBuyingGuides.map((g) => ({ route: `/guides/${g.slug}`, title: g.title })),
];
for (let i = 0; i < titleItems.length; i++) {
  for (let j = i + 1; j < titleItems.length; j++) {
    const a = titleItems[i].title.toLowerCase();
    const b = titleItems[j].title.toLowerCase();
    const baseA = a.replace(/\b(men'?s|women'?s|mens|womens)\b/g, "").replace(/\s+/g, " ").trim();
    const baseB = b.replace(/\b(men'?s|women'?s|mens|womens)\b/g, "").replace(/\s+/g, " ").trim();
    if (
      baseA === baseB &&
      baseA.length > 8 &&
      (/men|women/i.test(a) || /men|women/i.test(b))
    ) {
      genderPairs.push({
        routes: [titleItems[i].route, titleItems[j].route],
        titles: [titleItems[i].title, titleItems[j].title],
      });
    }
  }
}

// Comparison vs product review cannibalization signal: comparison slug contains product slugs that also have reviews
for (const c of rawComparisons.slice(0, 200)) {
  const parts = c.slug.split("-vs-");
  if (parts.length !== 2) continue;
  const reviewsFor = rawReviews.filter(
    (r) => {
      const p = productById.get(r.productId);
      return p && (p.slug === parts[0] || p.slug === parts[1]);
    },
  );
  if (reviewsFor.length >= 2) {
    cannibalization.push({
      kind: "comparison_vs_product_reviews",
      routes: [
        `/compare/${c.slug}`,
        ...reviewsFor.map((r) => `/reviews/${r.slug}`),
      ],
      reason: "Editorial comparison exists alongside individual product reviews for both SKUs",
    });
  }
}

const duplicateIntent = {
  intentMapCollisions: intentCollisions,
  cannibalizationGroups: cannibalization.slice(0, 80),
  cannibalizationGroupCount: cannibalization.length,
  menWomenNearDuplicates: genderPairs,
};

// ── Content similarity (template) ───────────────────────────────────────────
function templateGroups(
  kind: string,
  items: { id: string; route: string; text: string }[],
) {
  const map = new Map<string, { id: string; route: string; text: string }[]>();
  for (const it of items) {
    const n = normalizeCopy(it.text);
    if (n.length < 40) continue;
    const list = map.get(n) ?? [];
    list.push(it);
    map.set(n, list);
  }
  return [...map.entries()]
    .filter(([, list]) => new Set(list.map((x) => x.id)).size >= 3)
    .map(([normalized, list]) => ({
      kind,
      count: new Set(list.map((x) => x.id)).size,
      normalized: normalized.slice(0, 160),
      examples: [...new Map(list.map((x) => [x.id, x])).values()]
        .slice(0, 4)
        .map((x) => ({ route: x.route, excerpt: x.text.slice(0, 120) })),
    }))
    .sort((a, b) => b.count - a.count);
}

const similarity = {
  reviewSummaries: templateGroups(
    "review.summary",
    rawReviews.map((r) => ({
      id: r.id,
      route: `/reviews/${r.slug}`,
      text: r.summary,
    })),
  ).slice(0, 15),
  reviewPros: templateGroups(
    "review.pros",
    rawReviews.flatMap((r) =>
      (r.pros ?? []).map((p, i) => ({
        id: `${r.id}-pro-${i}`,
        route: `/reviews/${r.slug}`,
        text: p,
      })),
    ),
  ).slice(0, 15),
  bestIntros: templateGroups(
    "best.intro",
    rawBestGuides.map((g) => ({
      id: g.id,
      route: `/best/${g.slug}`,
      text: g.intro,
    })),
  ).slice(0, 10),
  guideSections: templateGroups(
    "guide.section",
    rawBuyingGuides.flatMap((g) =>
      (g.sections ?? []).map((s) => ({
        id: `${g.id}-${s.id}`,
        route: `/guides/${g.slug}`,
        text: s.body,
      })),
    ),
  ).slice(0, 10),
};

// ── Authors / trust ─────────────────────────────────────────────────────────
const reviewsWithAuthor = rawReviews.filter((r) => r.reviewerId && authorById.has(r.reviewerId));
const reviewsWithMethodology = rawReviews.filter((r) => r.testingContext?.trim());
const reviewsWithDisclosure = rawReviews.filter(
  (r) =>
    r.editorialDisclosure?.trim() ||
    /affiliate|disclosure|not personally/i.test(r.testingContext ?? ""),
);
const trust = {
  authors: rawAuthors.map((a) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    route: `/authors/${a.slug}`,
    hasBio: Boolean(a.bio?.trim()),
    hasDisclosure: Boolean(a.disclosure?.trim()),
    reviewCount: rawReviews.filter((r) => r.reviewerId === a.id).length,
  })),
  siteTrustPages: [
    { route: "/methodology", purpose: "scoring / recommendation methodology" },
    { route: "/how-we-review", purpose: "review methodology" },
    { route: "/affiliate-disclosure", purpose: "affiliate disclosure" },
  ],
  reviewAuthorCoveragePct: pct(reviewsWithAuthor.length, rawReviews.length),
  reviewMethodologyCoveragePct: pct(reviewsWithMethodology.length, rawReviews.length),
  reviewDisclosureCoveragePct: pct(reviewsWithDisclosure.length, rawReviews.length),
  testingDisclosureNote:
    "Personal testing must be backed by Evidence type=personal-test; false first-hand claims listed as BLOCKERs.",
};

// ── Publication rollup ──────────────────────────────────────────────────────
function pubRollup<T extends { status: string; publishedAt?: string; scheduledFor?: string; noindex?: boolean }>(
  items: T[],
) {
  const byStatus = countByStatus(items);
  const productionExposed = items.filter((i) => exposed(i)).length;
  const future = items.filter(
    (i) =>
      i.status === "scheduled" ||
      (i.scheduledFor && new Date(i.scheduledFor).getTime() > AUDIT_NOW.getTime()),
  ).length;
  const blocked = items.filter((i) => i.status === "archived" || i.noindex).length;
  return { ...byStatus, future, blocked, productionExposed, total: items.length };
}

const publicationData = {
  reviews: pubRollup(rawReviews),
  bestGuides: pubRollup(rawBestGuides),
  buyingGuides: pubRollup(rawBuyingGuides),
  comparisons: pubRollup(rawComparisons),
  gearSetups: pubRollup(rawGearSetups),
  tools: pubRollup(rawTools),
};

// ── Strongest / weakest ─────────────────────────────────────────────────────
const strongestReviews = [...reviewEvals]
  .filter((r) => r.classification === "LAUNCH_READY" || r.decisionScore >= 70)
  .sort((a, b) => b.decisionScore - a.decisionScore || b.wordCount - a.wordCount)
  .slice(0, 10)
  .map((r) => ({
    route: r.route,
    title: r.title,
    classification: r.classification,
    reason: `decisionScore=${r.decisionScore}, words=${r.wordCount}, sections=${r.sectionCount}, type=${r.reviewType}`,
  }));

const weakestReviews = [...reviewEvals]
  .sort((a, b) => {
    const rank = (c: ReviewClass) =>
      ({ BLOCKED: 0, THIN: 1, DUPLICATIVE: 2, NEEDS_MINOR_WORK: 3, LAUNCH_READY: 4 })[c];
    return rank(a.classification) - rank(b.classification) || a.decisionScore - b.decisionScore;
  })
  .slice(0, 10)
  .map((r) => ({
    route: r.route,
    title: r.title,
    classification: r.classification,
    reason: r.reasons.slice(0, 4).join("; "),
  }));

const strongestBest = [...bestEvals]
  .sort((a, b) => b.decisionScore - a.decisionScore)
  .slice(0, 10)
  .map((b) => ({
    route: b.route,
    title: rawBestGuides.find((g) => g.id === b.id)?.title ?? b.slug,
    status: b.qualityStatus,
    reason: `depth=${b.contextualReasoningDepth}, score=${b.decisionScore}, recs=${b.recommended}, chooseInstead=${b.picksWithChooseInstead}`,
  }));

const weakestBest = [...bestEvals]
  .sort((a, b) => a.decisionScore - b.decisionScore)
  .slice(0, 10)
  .map((b) => ({
    route: b.route,
    title: rawBestGuides.find((g) => g.id === b.id)?.title ?? b.slug,
    status: b.qualityStatus,
    reason: b.reasons.slice(0, 4).join("; "),
  }));

const strongestGuides = [...guideEvals]
  .sort((a, b) => b.internalScore - a.internalScore)
  .slice(0, 10)
  .map((g) => ({
    route: g.route,
    title: g.title,
    status: g.status,
    reason: `score=${g.internalScore}, depth=${g.depthTier}, decision=${g.decisionCompleteness}, blocks=${g.structuredBlockCount}`,
  }));

const weakestGuides = [...guideEvals]
  .sort((a, b) => a.internalScore - b.internalScore)
  .slice(0, 10)
  .map((g) => ({
    route: g.route,
    title: g.title,
    status: g.status,
    reason: g.issues.slice(0, 4).join("; ") || `score=${g.internalScore}`,
  }));

const mostUsefulTools = toolEvals
  .filter((t) => t.functional && t.productionExposed)
  .sort((a, b) => Number(b.uniqueValue) - Number(a.uniqueValue) || a.name.localeCompare(b.name))
  .slice(0, 10)
  .map((t) => ({
    route: t.route,
    name: t.name,
    type: t.type,
    reason: `functional=${t.functional}, landing=${t.hasExplanatoryLanding}, resultsIndexable=${t.resultsPagesIndexable}`,
  }));

const weakestTools = toolEvals
  .filter((t) => !t.functional || !t.productionExposed || !t.hasExplanatoryLanding)
  .slice(0, 10)
  .map((t) => ({
    route: t.route,
    name: t.name,
    type: t.type,
    reason: `available=${t.available}, functional=${t.functional}, exposed=${t.productionExposed}`,
  }));

// ── Day-1 evidence (no decision) ────────────────────────────────────────────
const day1Evidence = {
  note: "Evidence only — external reviewer chooses Day-1 set vs schedule later vs noindex.",
  reviewsLaunchReadyExposed: reviewEvals.filter(
    (r) => r.classification === "LAUNCH_READY" && r.productionExposed,
  ).length,
  reviewsBlockedFirstHand: firstHandBlockers.length,
  bestLaunchReadyExposed: bestEvals.filter(
    (b) => b.qualityStatus === "LAUNCH_READY" && b.productionExposed,
  ).length,
  bestThin: thinBestGuides.length,
  guidesCompleteExposed: guideEvals.filter(
    (g) => g.status === "COMPLETE" && g.productionExposed,
  ).length,
  guidesThin: guideEvals.filter((g) => g.status === "THIN").length,
  comparisonsMeaningfulExposed: comparisonEvals.filter(
    (c) => c.meaningful && c.productionExposed,
  ).length,
  toolsFunctionalExposed: toolEvals.filter((t) => t.functional && t.productionExposed)
    .length,
  launchReadyReviewRoutes: reviewEvals
    .filter((r) => r.classification === "LAUNCH_READY" && r.productionExposed)
    .map((r) => r.route),
  launchReadyBestRoutes: bestEvals
    .filter((b) => b.qualityStatus === "LAUNCH_READY" && b.productionExposed)
    .map((b) => b.route),
  completeGuideRoutes: guideEvals
    .filter((g) => g.status === "COMPLETE" && g.productionExposed)
    .map((g) => g.route),
};

const classificationRules = {
  reviews: {
    LAUNCH_READY: [
      "productionExposed",
      "substantive verdict (≥20 words)",
      "≥2 pros, ≥2 cons, ≥2 Best For, ≥2 Skip If",
      "≥4 sections, ≥600 words",
      "evidence + methodology present",
      "decisionScore ≥ 70",
      "no false first-hand claims",
    ],
    NEEDS_MINOR_WORK: [
      "productionExposed",
      "verdict + some audience signals",
      "≥3 sections, ≥350 words",
      "decisionScore ≥ 50",
    ],
    THIN: ["Below NEEDS_MINOR_WORK thresholds while still a review record"],
    DUPLICATIVE: ["Near-identical normalized body to another review"],
    BLOCKED: [
      "not productionExposed / archived / noindex",
      "OR orphan product",
      "OR first-hand claim without personal-test Evidence (CRITICAL BLOCKER)",
    ],
  },
  bestGuides: {
    LAUNCH_READY: [
      "productionExposed",
      "high contextual reasoning on majority of picks",
      "methodology + criteria",
      "who suits / who avoids on picks",
      "comparison table OR choose-instead",
      "intro depth ≥100 words",
      "evidenceIds preferred but not required when methodology present",
    ],
    THIN: ["Essentially title + intro + product cards (+FAQ) without real decision analysis"],
    NEEDS_MINOR_WORK: [
      "Has structure (methodology/criteria + picks) but missing choose-instead / avoid / best-for profiles / intro depth / evidence",
      "OR medium contextual depth with trade-offs + choose-instead",
    ],
    BLOCKED: ["not productionExposed"],
  },
  guides: {
    source: "assessGuideQuality() + Guide Depth Standard (guide-depth.ts)",
    COMPLETE: "assessment.status === complete && productionExposed",
    THIN: "assessment.status === thin",
    NEEDS_RESEARCH: "needs-research or needs-editorial-review",
    STALE: "assessment.status === stale",
    BLOCKED: "not productionExposed or assessment blocked",
  },
};

const report = {
  meta: {
    auditId: "03-editorial-quality",
    title: "Kitletics Pre-Launch Audit 03 — Editorial Content Quality",
    generatedAt: new Date().toISOString(),
    auditClock: AUDIT_NOW.toISOString(),
    mode: "read-only-forensic",
    notes: [
      "Review page-time enrichment (enrichReviewForPage) evaluated in-memory only — content files unchanged.",
      "No publication status changes.",
      "No new content generated.",
    ],
  },
  classificationRules,
  inventory,
  reviews: {
    typeCounts: reviewTypeCounts,
    classCounts: reviewClassCounts,
    dimensionPassRates: (() => {
      const keys = [
        "substantiveVerdict",
        "pros",
        "cons",
        "bestFor",
        "skipIf",
        "specAnalysis",
        "useCaseAnalysis",
        "fit",
        "performance",
        "alternatives",
        "comparisonContext",
        "evidence",
        "author",
        "methodology",
        "productSourceDisclosure",
      ] as const;
      const out: Record<string, { pass: number; pct: number }> = {};
      for (const k of keys) {
        const pass = reviewEvals.filter((r) => r.dimensions[k] === true).length;
        out[k] = { pass, pct: pct(pass, reviewEvals.length) };
      }
      return out;
    })(),
    firstHandBlockers: firstHandBlockers.map((r) => ({
      route: r.route,
      title: r.title,
      reviewType: r.reviewType,
      excerpts: r.firstHandClaimExcerpts,
      evidenceIds: rawReviews.find((x) => x.id === r.id)?.evidenceIds ?? [],
    })),
    notLaunchReady: reviewsNotReady.map((r) => ({
      route: r.route,
      title: r.title,
      classification: r.classification,
      reviewType: r.reviewType,
      reasons: r.reasons,
      wordCount: r.wordCount,
      productionExposed: r.productionExposed,
    })),
    all: reviewEvals,
  },
  bestGuides: {
    evaluations: bestEvals,
    thinGuides: thinBestGuides,
    classCounts: {
      LAUNCH_READY: bestEvals.filter((b) => b.qualityStatus === "LAUNCH_READY").length,
      NEEDS_MINOR_WORK: bestEvals.filter((b) => b.qualityStatus === "NEEDS_MINOR_WORK").length,
      THIN: bestEvals.filter((b) => b.qualityStatus === "THIN").length,
      BLOCKED: bestEvals.filter((b) => b.qualityStatus === "BLOCKED").length,
    },
  },
  guides: {
    evaluations: guideEvals,
    classCounts: {
      COMPLETE: guideEvals.filter((g) => g.status === "COMPLETE").length,
      THIN: guideEvals.filter((g) => g.status === "THIN").length,
      NEEDS_RESEARCH: guideEvals.filter((g) => g.status === "NEEDS_RESEARCH").length,
      STALE: guideEvals.filter((g) => g.status === "STALE").length,
      BLOCKED: guideEvals.filter((g) => g.status === "BLOCKED").length,
    },
  },
  comparisons: comparisonsReport,
  tools: {
    evaluations: toolEvals,
    finderDefinitions: finderDefs.map((f) => ({
      slug: f.slug,
      name: f.name ?? f.slug,
      questionCount: Array.isArray((f as { questions?: unknown[] }).questions)
        ? ((f as { questions: unknown[] }).questions.length)
        : Array.isArray((f as { steps?: unknown[] }).steps)
          ? ((f as { steps: unknown[] }).steps.length)
          : 0,
    })),
  },
  gearSetups: rawGearSetups.map((s) => ({
    id: s.id,
    slug: s.slug,
    route: `/setups/${s.slug}`,
    title: s.title,
    sportId: s.sportId,
    publicationStatus: s.status,
    productionExposed: exposed(s),
    itemCount: s.items?.length ?? 0,
  })),
  duplicateIntent,
  contentSimilarity: similarity,
  trust,
  publicationData,
  strongest: {
    reviews: strongestReviews,
    bestGuides: strongestBest,
    guides: strongestGuides,
    tools: mostUsefulTools,
  },
  weakest: {
    reviews: weakestReviews,
    bestGuides: weakestBest,
    guides: weakestGuides,
    tools: weakestTools,
  },
  day1Evidence,
};

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(join(DATA_DIR, "03-editorial-quality.json"), JSON.stringify(report, null, 2));

// ── Markdown ────────────────────────────────────────────────────────────────
const lines: string[] = [];
const push = (...xs: string[]) => lines.push(...xs);

push(
  `# Kitletics Pre-Launch Audit 03 — Editorial Content Quality`,
  ``,
  `**Mode:** READ-ONLY forensic`,
  `**Generated:** ${report.meta.generatedAt}`,
  `**Audit clock:** ${report.meta.auditClock}`,
  `**Machine-readable:** [\`data/03-editorial-quality.json\`](./data/03-editorial-quality.json)`,
  ``,
  `> No content generated, enriched to disk, or publication-status changes. Page-time review enrichment assessed in-memory only.`,
  ``,
  `---`,
  ``,
  `## Classification rules`,
  ``,
  `### Reviews`,
  ``,
);
for (const [k, rules] of Object.entries(classificationRules.reviews)) {
  push(`**${k}**`);
  for (const r of rules) push(`- ${r}`);
  push(``);
}
push(`### Best Guides`, ``);
for (const [k, rules] of Object.entries(classificationRules.bestGuides)) {
  push(`**${k}**`);
  for (const r of rules) push(`- ${r}`);
  push(``);
}
push(
  `### Guides`,
  ``,
  `- Source: \`${classificationRules.guides.source}\``,
  `- COMPLETE / THIN / NEEDS_RESEARCH / STALE / BLOCKED mapped from assessGuideQuality + production exposure`,
  ``,
  `---`,
  ``,
  `## 1. Inventory`,
  ``,
  `| Type | Count |`,
  `|---|---:|`,
  `| Reviews | ${inventory.reviews.total} |`,
  `| Best Guides (all) | ${inventory.bestGuides.total} |`,
  `| Best Guides — category | ${inventory.bestGuides.categoryGuides} |`,
  `| Best Guides — use-case | ${inventory.bestGuides.useCaseGuides} |`,
  `| Buying / long-form Guides | ${inventory.buyingGuides.total} |`,
  `| Explainers (long-form layout) | ${inventory.buyingGuides.explainers} |`,
  `| Comparisons (editorial) | ${inventory.comparisons.total} |`,
  `| Gear Setups | ${inventory.gearSetups.total} |`,
  `| Tools (records) | ${inventory.tools.total} |`,
  `| Finder definitions | ${inventory.finders.definitions} |`,
  `| Calculator tool records | ${inventory.calculators.toolRecords} |`,
  `| Alternatives pages eligible | ${inventory.alternativesPages.eligibleIndexable} |`,
  `| Authors | ${inventory.authors.total} |`,
  ``,
  `### Reviews by status`,
  ``,
  `| Status | Count |`,
  `|---|---:|`,
);
for (const [k, v] of Object.entries(inventory.reviews.byStatus)) push(`| ${k} | ${v} |`);

push(``, `### Reviews by sport (product tagging)`, ``, `| Sport | Count |`, `|---|---:|`);
for (const [k, v] of Object.entries(inventory.reviews.bySport).sort((a, b) => b[1] - a[1])) {
  push(`| ${esc(k)} | ${v} |`);
}

push(``, `### Best Guides by status`, ``, `| Status | Count |`, `|---|---:|`);
for (const [k, v] of Object.entries(inventory.bestGuides.byStatus)) push(`| ${k} | ${v} |`);

push(``, `### Buying Guides by status`, ``, `| Status | Count |`, `|---|---:|`);
for (const [k, v] of Object.entries(inventory.buyingGuides.byStatus)) push(`| ${k} | ${v} |`);

push(
  ``,
  `---`,
  ``,
  `## 2–3. Reviews`,
  ``,
  `| Review type | Count |`,
  `|---|---:|`,
  `| total | ${reviewTypeCounts.total} |`,
  `| first-hand-test | ${reviewTypeCounts["first-hand-test"]} |`,
  `| expert-research | ${reviewTypeCounts["expert-research"]} |`,
  `| hybrid | ${reviewTypeCounts.hybrid} |`,
  `| unknown | ${reviewTypeCounts.unknown} |`,
  ``,
  `| Classification | Count |`,
  `|---|---:|`,
);
for (const [k, v] of Object.entries(reviewClassCounts)) push(`| ${k} | ${v} |`);

push(``, `### Dimension pass rates`, ``, `| Dimension | Pass | % |`, `|---|---:|---:|`);
for (const [k, v] of Object.entries(report.reviews.dimensionPassRates)) {
  push(`| ${k} | ${v.pass} | ${v.pct} |`);
}

push(
  ``,
  `### Every non-LAUNCH_READY Review`,
  ``,
  `Count: **${reviewsNotReady.length}**`,
  ``,
  `| Route | Classification | Type | Exposed | Reasons |`,
  `|---|---|---|---|---|`,
);
for (const r of reviewsNotReady) {
  push(
    `| ${r.route} | ${r.classification} | ${r.reviewType} | ${r.productionExposed ? "yes" : "no"} | ${esc(r.reasons.slice(0, 5).join("; "))} |`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## 4. First-hand claim audit (CRITICAL)`,
  ``,
  `Blockers (claim language without \`personal-test\` Evidence): **${firstHandBlockers.length}**`,
  ``,
);
if (!firstHandBlockers.length) {
  push(`_None detected under configured patterns._`, ``);
} else {
  push(`| Route | Type | Excerpt |`, `|---|---|---|`);
  for (const r of firstHandBlockers) {
    push(
      `| ${r.route} | ${r.reviewType} | ${esc(r.firstHandClaimExcerpts[0] ?? "—")} |`,
    );
  }
  push(``);
}

push(
  `---`,
  ``,
  `## 5–6. Best Guides`,
  ``,
  `| Status | Count |`,
  `|---|---:|`,
  `| LAUNCH_READY | ${report.bestGuides.classCounts.LAUNCH_READY} |`,
  `| NEEDS_MINOR_WORK | ${report.bestGuides.classCounts.NEEDS_MINOR_WORK} |`,
  `| THIN | ${report.bestGuides.classCounts.THIN} |`,
  `| BLOCKED | ${report.bestGuides.classCounts.BLOCKED} |`,
  ``,
  `### Per Best Guide`,
  ``,
  `| Route | Intent | Considered | Shortlisted | Recs | Depth | Trade-offs | Avoid | Choose-instead | Comparison | Methodology | Evidence | Status |`,
  `|---|---|---:|---:|---:|---|---:|---:|---:|---|---|---|---|`,
);
for (const b of bestEvals.sort((a, b) => a.slug.localeCompare(b.slug))) {
  push(
    `| ${b.route} | ${b.intent} | ${b.consideredProducts} | ${b.shortlisted} | ${b.recommended} | ${b.contextualReasoningDepth} | ${b.picksWithTradeoffs} | ${b.picksWithAvoid} | ${b.picksWithChooseInstead} | ${b.hasComparison ? "yes" : "no"} | ${b.hasMethodology ? "yes" : "no"} | ${b.hasEvidence ? "yes" : "no"} | ${b.qualityStatus} |`,
  );
}

push(
  ``,
  `### Thin Best Guides (card-shelf / low analysis)`,
  ``,
  `Count: **${thinBestGuides.length}**`,
  ``,
);
for (const b of thinBestGuides) {
  push(`- ${b.route} — ${b.reasons.join("; ")}`);
}

push(
  ``,
  `---`,
  ``,
  `## 7–8. Guides (Guide Depth Standard)`,
  ``,
  `| Status | Count |`,
  `|---|---:|`,
);
for (const [k, v] of Object.entries(report.guides.classCounts)) push(`| ${k} | ${v} |`);

push(
  ``,
  `| Route | Type | Depth tier | Sections | Decision | Visuals | Products | Finder | Best | Compare | FAQ | Related | Status |`,
  `|---|---|---|---:|---|---|---:|---|---|---|---|---|---|`,
);
for (const g of guideEvals.sort((a, b) => a.slug.localeCompare(b.slug))) {
  push(
    `| ${g.route} | ${g.type} | ${g.depthTier} | ${g.substantiveSections} | ${g.decisionCompleteness} | ${g.visuals ? "yes" : "no"} | ${g.productExamples} | ${g.finderLink ? "yes" : "no"} | ${g.bestLink ? "yes" : "no"} | ${g.compareLink ? "yes" : "no"} | ${g.faq ? "yes" : "no"} | ${g.relatedGuides ? "yes" : "no"} | ${g.status} |`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## 9. Duplicate intent / cannibalization`,
  ``,
  `### Intent-map collisions`,
  ``,
);
if (!intentCollisions.length) push(`_None._`, ``);
else for (const c of intentCollisions) push(`- **${esc(c.topic)}**: ${c.paths.join(", ")}`);

push(``, `### Detected route groups (sample)`, ``);
for (const g of cannibalization.slice(0, 25)) {
  push(`- **${g.kind}**: ${g.routes.join(" · ")} — ${esc(g.reason)}`);
}
push(`_Total cannibalization group signals: ${cannibalization.length}_`, ``);

push(``, `### Men/Women near-duplicates`, ``);
if (!genderPairs.length) push(`_None._`, ``);
else for (const g of genderPairs) push(`- ${g.routes.join(" ↔ ")} (${g.titles.join(" / ")})`);

push(
  ``,
  `---`,
  ``,
  `## 10. Content similarity (template repetition)`,
  ``,
);
for (const [label, groups] of Object.entries(similarity)) {
  push(`### ${label}`, ``);
  if (!groups.length) {
    push(`_No ≥3-product identical normalized groups._`, ``);
    continue;
  }
  for (const g of groups.slice(0, 5)) {
    push(`- ×${g.count}: \`${esc(g.normalized)}\``);
    for (const ex of g.examples.slice(0, 2)) {
      push(`  - ${ex.route}: “${esc(ex.excerpt)}”`);
    }
  }
  push(``);
}

push(
  `---`,
  ``,
  `## 11. Comparisons`,
  ``,
  `| Metric | Count |`,
  `|---|---:|`,
  `| Editorial comparisons | ${comparisonsReport.editorialTotal} |`,
  `| Published | ${comparisonsReport.published} |`,
  `| Production-exposed | ${comparisonsReport.productionExposed} |`,
  `| Meaningful | ${comparisonsReport.meaningful} |`,
  `| Thin | ${comparisonsReport.thin} |`,
  `| Reverse-duplicate groups | ${comparisonsReport.reverseDuplicateGroups} |`,
  `| Theoretical shoe pairs (published shoes) | ${comparisonsReport.combinatorial.theoreticalShoePairs} |`,
  `| Editorial shoe comparisons | ${comparisonsReport.combinatorial.editorialShoeComparisons} |`,
  ``,
  `**Combinatorial indexable pages?** **${comparisonsReport.combinatorial.systemCreatesCombinatorialIndexablePages ? "YES" : "NO"}**`,
  ``,
  `${comparisonsReport.combinatorial.note}`,
  ``,
);

if (reverseDuplicates.length) {
  push(`### Reverse duplicates`, ``);
  for (const d of reverseDuplicates.slice(0, 20)) {
    push(`- ${d.slugs.join(" ↔ ")}`);
  }
  push(``);
}

push(
  `---`,
  ``,
  `## 12. Tools / Finders / Calculators`,
  ``,
  `| Name | Route | Type | Functional | Landing indexable | Results indexable | Requires JS | Explanatory landing |`,
  `|---|---|---|---|---|---|---|---|`,
);
for (const t of toolEvals) {
  push(
    `| ${esc(t.name)} | ${t.route} | ${t.type} | ${t.functional ? "yes" : "no"} | ${t.indexableLanding ? "yes" : "no"} | ${t.resultsPagesIndexable ? "yes" : "no"} | ${t.requiresJS ? "yes" : "no"} | ${t.hasExplanatoryLanding ? "yes" : "no"} |`,
  );
}

push(
  ``,
  `Finder definitions registered: **${finderDefs.length}** (${finderDefs.map((f) => f.slug).join(", ")})`,
  ``,
  `---`,
  ``,
  `## 13. Authors / trust`,
  ``,
  `| Author | Route | Reviews | Bio | Disclosure |`,
  `|---|---|---:|---|---|`,
);
for (const a of trust.authors) {
  push(
    `| ${esc(a.name)} | ${a.route} | ${a.reviewCount} | ${a.hasBio ? "yes" : "no"} | ${a.hasDisclosure ? "yes" : "no"} |`,
  );
}
push(
  ``,
  `| Trust coverage | % |`,
  `|---|---:|`,
  `| Reviews with author | ${trust.reviewAuthorCoveragePct} |`,
  `| Reviews with methodology/testingContext | ${trust.reviewMethodologyCoveragePct} |`,
  `| Reviews with disclosure language | ${trust.reviewDisclosureCoveragePct} |`,
  ``,
  `Site pages: ${trust.siteTrustPages.map((p) => p.route).join(", ")}`,
  ``,
  `---`,
  ``,
  `## 14. Strongest content`,
  ``,
  `### Reviews`,
  ``,
);
for (const r of strongestReviews) push(`- ${r.route} — ${esc(r.reason)}`);
push(``, `### Best Guides`, ``);
for (const r of strongestBest) push(`- ${r.route} — ${esc(r.reason)}`);
push(``, `### Guides`, ``);
for (const r of strongestGuides) push(`- ${r.route} — ${esc(r.reason)}`);
push(``, `### Tools`, ``);
for (const r of mostUsefulTools) push(`- ${r.route} — ${esc(r.reason)}`);

push(``, `---`, ``, `## 15. Weakest content`, ``, `### Reviews`, ``);
for (const r of weakestReviews) push(`- ${r.route} — ${r.classification}: ${esc(r.reason)}`);
push(``, `### Best Guides`, ``);
for (const r of weakestBest) push(`- ${r.route} — ${r.status}: ${esc(r.reason)}`);
push(``, `### Guides`, ``);
for (const r of weakestGuides) push(`- ${r.route} — ${r.status}: ${esc(r.reason)}`);
push(``, `### Tools`, ``);
for (const r of weakestTools) push(`- ${r.route} — ${esc(r.reason)}`);

push(
  ``,
  `---`,
  ``,
  `## 16. Publication data`,
  ``,
);
for (const [label, data] of Object.entries(publicationData)) {
  push(`### ${label}`, ``, `| Field | Count |`, `|---|---:|`);
  for (const [k, v] of Object.entries(data)) push(`| ${k} | ${v} |`);
  push(``);
}

push(
  `---`,
  ``,
  `## 17. Day-1 evidence (no scheduling decision)`,
  ``,
  `This audit does **not** choose the Day-1 editorial set. Evidence:`,
  ``,
  `| Evidence | Count |`,
  `|---|---:|`,
  `| Reviews LAUNCH_READY + exposed | ${day1Evidence.reviewsLaunchReadyExposed} |`,
  `| Reviews BLOCKED for false first-hand | ${day1Evidence.reviewsBlockedFirstHand} |`,
  `| Best Guides LAUNCH_READY + exposed | ${day1Evidence.bestLaunchReadyExposed} |`,
  `| Best Guides THIN | ${day1Evidence.bestThin} |`,
  `| Guides COMPLETE + exposed | ${day1Evidence.guidesCompleteExposed} |`,
  `| Guides THIN | ${day1Evidence.guidesThin} |`,
  `| Comparisons meaningful + exposed | ${day1Evidence.comparisonsMeaningfulExposed} |`,
  `| Tools functional + exposed | ${day1Evidence.toolsFunctionalExposed} |`,
  ``,
  `Questions for the external reviewer:`,
  ``,
  `1. Which routes form the Day-1 editorial set?`,
  `2. What should be scheduled later?`,
  `3. What should remain noindex / draft until quality gates pass?`,
  ``,
  `Candidate LAUNCH_READY / COMPLETE route lists are in JSON \`day1Evidence.*Routes\`.`,
  ``,
  `---`,
  ``,
  `## Gear setups inventory`,
  ``,
  `| Route | Status | Exposed | Items |`,
  `|---|---|---|---:|`,
);
for (const s of report.gearSetups) {
  push(
    `| ${s.route} | ${s.publicationStatus} | ${s.productionExposed ? "yes" : "no"} | ${s.itemCount} |`,
  );
}

push(``, `## End of baseline`, ``, `Measurement only. No editorial decisions applied.`, ``);

writeFileSync(join(OUT_DIR, "03-editorial-quality.md"), lines.join("\n"));
console.log("Wrote", join(OUT_DIR, "03-editorial-quality.md"));
console.log("Wrote", join(DATA_DIR, "03-editorial-quality.json"));
console.log(
  JSON.stringify(
    {
      reviews: reviewClassCounts,
      firstHandBlockers: firstHandBlockers.length,
      best: report.bestGuides.classCounts,
      guides: report.guides.classCounts,
      comparisons: {
        total: comparisonsReport.editorialTotal,
        meaningful: comparisonsReport.meaningful,
        combinatorial: comparisonsReport.combinatorial.systemCreatesCombinatorialIndexablePages,
      },
    },
    null,
    2,
  ),
);
