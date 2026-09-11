/**
 * Unified Guide quality assessment — used by QA scripts, hub featureability, and backfill.
 * Internal only; do not show public quality scores.
 */

import type { BuyingGuide } from "@/domain/editorial/types";
import { getFaqsByIds } from "@/repositories";
import { getLongFormGuideConfig } from "@/lib/guides/long-form-config";
import type { ExplainerBlock } from "@/lib/guides/explainer-blocks";
import {
  getGuideDepthTier,
  getGuideEditorialPriority,
  minBlocksForTier,
  minFaqsForTier,
  minProductExamplesForTier,
  type GuideDepthTier,
  type GuideEditorialPriority,
} from "@/lib/guides/guide-depth";
import { mergeGuideFaqIds } from "@/lib/guides/guide-backfill-faqs";

export type GuideQualityStatus =
  | "complete"
  | "thin"
  | "needs-research"
  | "stale"
  | "blocked"
  | "needs-editorial-review";

export interface GuideBlockCoverage {
  quickAnswer: boolean;
  decisionFramework: boolean;
  visualExplainer: boolean;
  productExamples: boolean;
  finderCta: boolean;
  bestGuideCta: boolean;
  compareLink: boolean;
  faq: boolean;
  relatedGuides: boolean;
  evidenceNote: boolean;
}

export interface GuideQualityAssessment {
  slug: string;
  title: string;
  sportId: string;
  guideType: string;
  depthTier: GuideDepthTier;
  priority: GuideEditorialPriority;
  status: GuideQualityStatus;
  recommendedAction: string;
  issues: string[];
  sectionCount: number;
  structuredBlockCount: number;
  wordEstimate: number;
  productExampleCount: number;
  faqCount: number;
  toolLinks: number;
  relatedBestGuides: number;
  hasDecisionFramework: boolean;
  hasQuickAnswer: boolean;
  blockCoverage: GuideBlockCoverage;
  decisionCompleteness: "high" | "medium" | "low";
  /** Internal diagnostic 0–100 — never show publicly */
  internalScore: number;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateGuideWords(guide: BuyingGuide): number {
  let n = wordCount(guide.title);
  if (guide.subtitle) n += wordCount(guide.subtitle);
  if (guide.shortDescription) n += wordCount(guide.shortDescription);
  if (guide.quickAnswer) n += wordCount(guide.quickAnswer);
  for (const s of guide.sections) {
    n += wordCount(s.heading) + wordCount(s.body);
  }
  return n;
}

function countExplainerWords(blocks: ExplainerBlock[]): number {
  let n = 0;
  for (const block of blocks) {
    n += wordCount(block.title);
    if ("paragraphs" in block && Array.isArray(block.paragraphs)) {
      for (const p of block.paragraphs) n += wordCount(p);
    }
    if ("body" in block && typeof block.body === "string") {
      n += wordCount(block.body);
    }
    if ("intro" in block && typeof block.intro === "string") {
      n += wordCount(block.intro);
    }
    if ("cards" in block && Array.isArray(block.cards)) {
      for (const c of block.cards as Record<string, string>[]) {
        for (const v of Object.values(c)) {
          if (typeof v === "string") n += wordCount(v);
        }
      }
    }
    if ("examples" in block && Array.isArray(block.examples)) {
      for (const ex of block.examples as Record<string, unknown>[]) {
        if (typeof ex.whyIllustrates === "string") n += wordCount(ex.whyIllustrates);
        if (typeof ex.tradeoff === "string") n += wordCount(ex.tradeoff);
      }
    }
    if ("mistakes" in block && Array.isArray(block.mistakes)) {
      for (const m of block.mistakes as { title?: string; body?: string }[]) {
        n += wordCount(m.title ?? "") + wordCount(m.body ?? "");
      }
    }
    if ("steps" in block && Array.isArray(block.steps)) {
      for (const s of block.steps as { title?: string; body?: string }[]) {
        n += wordCount(s.title ?? "") + wordCount(s.body ?? "");
      }
    }
  }
  return n;
}

function thinSections(guide: BuyingGuide): boolean {
  if (guide.sections.length === 0) return true;
  const thin = guide.sections.filter(
    (s) => wordCount(s.body) < 40,
  ).length;
  return thin >= Math.ceil(guide.sections.length * 0.6);
}

function analyzeBlocks(blocks: ExplainerBlock[]): {
  hasDecision: boolean;
  hasVisual: boolean;
  hasProducts: boolean;
  hasFinder: boolean;
  hasBest: boolean;
  hasCompare: boolean;
  productCount: number;
} {
  let hasDecision = false;
  let hasVisual = false;
  let hasProducts = false;
  let hasFinder = false;
  let hasBest = false;
  let hasCompare = false;
  let productCount = 0;

  for (const b of blocks) {
    if (b.type === "decision-flow") hasDecision = true;
    if (
      b.type === "diagram" ||
      b.type === "spectrum" ||
      b.type === "matrix" ||
      b.type === "comparison-table" ||
      b.type === "factor-cards"
    ) {
      hasVisual = true;
    }
    if (b.type === "product-examples") {
      hasProducts = true;
      productCount = Math.max(productCount, b.examples.length);
    }
    if (b.type === "product-comparison") {
      hasCompare = true;
      productCount = Math.max(productCount, b.productIds.length);
      if (b.bestGuideHref) hasBest = true;
      if (b.compareHref) hasCompare = true;
    }
    if (b.type === "cta") {
      if (b.variant === "finder") hasFinder = true;
      if (b.variant === "best-guide") hasBest = true;
      if (b.variant === "compare") hasCompare = true;
    }
  }

  return {
    hasDecision,
    hasVisual,
    hasProducts,
    hasFinder,
    hasBest,
    hasCompare,
    productCount,
  };
}

export function assessGuideQuality(guide: BuyingGuide): GuideQualityAssessment {
  const config = getLongFormGuideConfig(guide.slug);
  const faqIds = mergeGuideFaqIds(guide.faqIds, guide.slug);
  const faqs = getFaqsByIds(faqIds);
  const depthTier = getGuideDepthTier(guide.slug);
  const priority = getGuideEditorialPriority(guide.slug);
  const issues: string[] = [];

  let structuredBlockCount = 0;
  let wordEstimate = estimateGuideWords(guide);
  let blockAnalysis = {
    hasDecision: false,
    hasVisual: false,
    hasProducts: false,
    hasFinder: false,
    hasBest: false,
    hasCompare: false,
    productCount: 0,
  };

  if (config?.layout === "explainer" && config.explainer) {
    structuredBlockCount = config.explainer.blocks.length;
    wordEstimate += countExplainerWords(config.explainer.blocks);
    for (const b of config.explainer.quickAnswerBullets) {
      wordEstimate += wordCount(b);
    }
    blockAnalysis = analyzeBlocks(config.explainer.blocks);
  } else if (config) {
    structuredBlockCount =
      config.needs.length +
      config.factors.length +
      config.fit.length +
      (config.anatomy ? 1 : 0) +
      config.glossaryTerms.length;
    if (config.deck) wordEstimate += wordCount(config.deck);
    for (const n of config.needs) {
      wordEstimate += wordCount(n.title) + wordCount(n.description);
    }
    for (const f of config.factors) {
      wordEstimate += wordCount(f.label);
      for (const b of f.bullets) wordEstimate += wordCount(b);
      for (const level of f.levels ?? []) {
        wordEstimate += wordCount(level.label) + wordCount(level.description);
      }
    }
    for (const f of config.fit) {
      wordEstimate += wordCount(f.title) + wordCount(f.description);
    }
    for (const g of config.glossaryTerms) {
      wordEstimate += wordCount(g.term) + wordCount(g.definition);
    }
    blockAnalysis.hasDecision = Boolean(config.finder);
    blockAnalysis.hasVisual = Boolean(config.anatomy);
    blockAnalysis.hasFinder = Boolean(config.finder);
    blockAnalysis.hasBest = (config.decisionLinks?.length ?? 0) > 0;
    blockAnalysis.hasCompare = (config.decisionLinks ?? []).some((l) =>
      l.href.includes("/compare"),
    );
    blockAnalysis.productCount = config.productExampleRoles.length;
    blockAnalysis.hasProducts = blockAnalysis.productCount > 0;
  }

  const productExampleCount = Math.max(
    blockAnalysis.productCount,
    guide.relatedProductIds.length,
  );

  const hasDecisionFramework =
    blockAnalysis.hasDecision ||
    Boolean(config?.finder) ||
    guide.sections.some((s) =>
      /how to choose|decision|when to|trade-?off/i.test(s.heading + s.body),
    );

  const hasQuickAnswer = Boolean(
    guide.quickAnswer ||
      (config?.explainer?.quickAnswerBullets?.length ?? 0) >= 3,
  );

  const guideType =
    guide.guideType ??
    (config?.layout === "explainer"
      ? "explainer"
      : config
        ? "buying"
        : "buying");

  const blockCoverage: GuideBlockCoverage = {
    quickAnswer: hasQuickAnswer,
    decisionFramework: hasDecisionFramework,
    visualExplainer: blockAnalysis.hasVisual,
    productExamples: productExampleCount >= 2,
    finderCta: blockAnalysis.hasFinder || (guide.relatedToolSlugs?.length ?? 0) > 0,
    bestGuideCta:
      blockAnalysis.hasBest || (guide.relatedBestGuideIds?.length ?? 0) > 0,
    compareLink: blockAnalysis.hasCompare,
    faq: faqs.length >= 2,
    relatedGuides: (guide.relatedBestGuideIds?.length ?? 0) > 0,
    evidenceNote: Boolean(config?.explainer?.methodologyNote),
  };

  // Thin detection
  const isThinContent =
    (!config &&
      (guide.sections.length < 4 ||
        thinSections(guide) ||
        wordEstimate < 500)) ||
    (config?.layout === "explainer" &&
      structuredBlockCount < 6 &&
      wordEstimate < 800);

  const missingDecision =
    !hasDecisionFramework &&
    productExampleCount < 2 &&
    structuredBlockCount === 0;

  if (guide.sections.length < 4 && !config) issues.push("few-sections");
  if (thinSections(guide) && !config) issues.push("thin-sections");
  if (faqs.length < minFaqsForTier(depthTier) && priority === "P0") {
    issues.push("thin-faq");
  }
  if (productExampleCount < minProductExamplesForTier(depthTier)) {
    issues.push("few-products");
  }
  if (
    (guide.relatedToolSlugs?.length ?? 0) < 1 &&
    !blockAnalysis.hasFinder &&
    priority === "P0"
  ) {
    issues.push("missing-tool-path");
  }
  if (!hasDecisionFramework && priority !== "P3") {
    issues.push("missing-decision-framework");
  }
  if (config?.layout === "explainer" && !blockAnalysis.hasVisual) {
    issues.push("missing-visuals");
  }
  if (
    config?.layout === "explainer" &&
    structuredBlockCount < minBlocksForTier(depthTier)
  ) {
    issues.push("below-tier-block-count");
  }

  // Decision completeness heuristic (before status) — prefer this over word count
  let coverageHits = 0;
  const keys = Object.keys(blockCoverage) as (keyof GuideBlockCoverage)[];
  for (const k of keys) {
    if (blockCoverage[k]) coverageHits += 1;
  }
  const decisionCompleteness: GuideQualityAssessment["decisionCompleteness"] =
    coverageHits >= 7 ? "high" : coverageHits >= 4 ? "medium" : "low";

  let status: GuideQualityStatus;
  let recommendedAction: string;

  const frameworkComplete =
    Boolean(config) &&
    config?.layout !== "explainer" &&
    (config?.needs.length ?? 0) >= 3 &&
    (config?.factors.length ?? 0) >= 3 &&
    productExampleCount >= 3 &&
    hasDecisionFramework &&
    faqs.length >= 4 &&
    hasQuickAnswer;

  /** Decision-complete explainer — not SEO word-count driven */
  const explainerComplete =
    Boolean(config?.layout === "explainer") &&
    structuredBlockCount >= minBlocksForTier(depthTier) &&
    faqs.length >= Math.max(3, minFaqsForTier(depthTier) - 1) &&
    productExampleCount >= Math.max(2, minProductExamplesForTier(depthTier) - 1) &&
    hasDecisionFramework &&
    hasQuickAnswer &&
    blockCoverage.visualExplainer &&
    decisionCompleteness !== "low" &&
    wordEstimate >= 450;

  if (isThinContent || missingDecision) {
    status = "thin";
    recommendedAction =
      priority === "P0"
        ? "Rebuild with explainer/framework long-form config"
        : "Expand sections + add decision/product/tool paths";
  } else if (frameworkComplete || explainerComplete) {
    status = "complete";
    recommendedAction = "Maintain; refresh when catalog models change";
  } else if (config || (guide.sections.length >= 4 && wordEstimate >= 400)) {
    status = "needs-research";
    recommendedAction =
      "Audit decision usefulness, visuals, FAQ depth and product context";
  } else {
    status = "thin";
    recommendedAction = "Expand sections + add decision/product/tool paths";
  }

  if (status === "complete" && decisionCompleteness === "low") {
    status = "needs-research";
    recommendedAction = "Improve decision pathways and next-step CTAs";
  }

  // Internal score (diagnostic)
  let score = 0;
  score += Math.min(25, Math.round(wordEstimate / 80));
  score += Math.min(20, structuredBlockCount * 1.5);
  score += Math.min(15, faqs.length * 3);
  score += Math.min(15, productExampleCount * 3);
  score += hasDecisionFramework ? 10 : 0;
  score += blockCoverage.visualExplainer ? 5 : 0;
  score += blockCoverage.finderCta ? 5 : 0;
  score += blockCoverage.bestGuideCta ? 5 : 0;
  score = Math.min(100, Math.round(score));

  return {
    slug: guide.slug,
    title: guide.title,
    sportId: guide.sportId,
    guideType,
    depthTier,
    priority,
    status,
    recommendedAction,
    issues,
    sectionCount: guide.sections.length,
    structuredBlockCount,
    wordEstimate,
    productExampleCount,
    faqCount: faqs.length,
    toolLinks: guide.relatedToolSlugs?.length ?? 0,
    relatedBestGuides: guide.relatedBestGuideIds?.length ?? 0,
    hasDecisionFramework,
    hasQuickAnswer,
    blockCoverage,
    decisionCompleteness,
    internalScore: score,
  };
}

/** Featured / Start Here — complete quality only (stronger than publish bar). */
export function canFeatureGuideByQuality(guide: BuyingGuide): boolean {
  if (guide.status !== "published") return false;
  const q = assessGuideQuality(guide);
  if (q.status !== "complete") return false;
  const hasSummary = Boolean(
    guide.shortDescription?.trim() ||
      guide.quickAnswer?.trim() ||
      guide.sections[0]?.body?.trim(),
  );
  if (!hasSummary) return false;
  const config = getLongFormGuideConfig(guide.slug);
  const hasMedia = Boolean(guide.hubImageSrc || config?.heroImageSrc);
  return hasMedia;
}

export function canPublishGuide(guide: BuyingGuide): boolean {
  if (guide.status !== "published" && guide.status !== "draft") return false;
  // Publish bar is lower than feature bar — thin guides may remain public.
  return Boolean(guide.title && guide.slug && guide.sections.length >= 1);
}
