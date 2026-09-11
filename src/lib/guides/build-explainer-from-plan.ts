/**
 * Compact plan → LongFormGuideConfig factory.
 * Produces STANDARD/DEEP explainer depth without copy-pasting identical outlines.
 */

import type { ExplainerBlock } from "@/lib/guides/explainer-blocks";
import { tocFromExplainer } from "@/lib/guides/explainer-blocks";
import type {
  GuideGlossaryTerm,
  GuideProductExampleRole,
  LongFormGuideConfig,
} from "@/lib/guides/long-form-config";

export interface CompactExplainerPlan {
  slug: string;
  displayTitle: string;
  deck: string;
  eyebrow?: LongFormGuideConfig["eyebrow"];
  heroImageSrc: string;
  heroImageAlt: string;
  quickAnswerBullets: string[];
  medicalNote?: string;
  methodologyNote?: string;
  finder?: LongFormGuideConfig["finder"];
  decisionLinks?: { label: string; href: string }[];
  glossaryTerms?: GuideGlossaryTerm[];
  glossaryHref?: string;
  definition: {
    id?: string;
    title: string;
    intro?: string;
    paragraphs: string[];
  };
  whyItMatters?: {
    id?: string;
    title: string;
    paragraphs: string[];
  };
  factors?: {
    id?: string;
    title: string;
    intro?: string;
    cards: {
      id: string;
      title: string;
      whatItIs: string;
      howItChanges: string;
      whatYouNotice: string;
    }[];
  };
  comparison?: {
    id?: string;
    title: string;
    columns: string[];
    rows: { label: string; values: string[] }[];
    footnote?: string;
  };
  tradeoffs?: {
    id?: string;
    title: string;
    gains: string[];
    giveUps: string[];
    footnote?: string;
  };
  callouts?: {
    id: string;
    title: string;
    body: string;
    tone?: "neutral" | "accent" | "caution";
  }[];
  extraProse?: {
    id: string;
    title: string;
    paragraphs: string[];
  }[];
  decision?: {
    id?: string;
    title: string;
    steps: { id: string; title: string; body: string }[];
    branches?: {
      question: string;
      options: { label: string; result: string }[];
    };
  };
  examples: {
    id?: string;
    title: string;
    disclaimer: string;
    items: {
      productId: string;
      approachLabel: string;
      whyIllustrates: string;
      bestFor: string[];
      tradeoff: string;
    }[];
  };
  compareProductIds?: string[];
  bestGuideHref?: string;
  bestGuideLabel?: string;
  compareHref?: string;
  mistakes: { id: string; title: string; body: string }[];
  ctaFinder?: {
    title: string;
    body: string;
    ctaLabel: string;
    href: string;
  };
  ctaBest?: {
    title: string;
    body: string;
    ctaLabel: string;
    href: string;
  };
  productExampleRoles: GuideProductExampleRole[];
  productRailTitle: string;
  productRailBrowseHref?: string;
  productRailBrowseLabel?: string;
}

export function buildExplainerFromPlan(
  plan: CompactExplainerPlan,
): LongFormGuideConfig {
  const blocks: ExplainerBlock[] = [];

  blocks.push({
    id: plan.definition.id ?? "definition",
    type: "prose",
    title: plan.definition.title,
    intro: plan.definition.intro,
    paragraphs: plan.definition.paragraphs,
  });

  if (plan.whyItMatters) {
    blocks.push({
      id: plan.whyItMatters.id ?? "why-it-matters",
      type: "prose",
      title: plan.whyItMatters.title,
      paragraphs: plan.whyItMatters.paragraphs,
    });
  }

  if (plan.factors && plan.factors.cards.length > 0) {
    blocks.push({
      id: plan.factors.id ?? "factors",
      type: "factor-cards",
      title: plan.factors.title,
      intro: plan.factors.intro,
      cards: plan.factors.cards,
    });
  }

  if (plan.comparison) {
    blocks.push({
      id: plan.comparison.id ?? "comparison",
      type: "comparison-table",
      title: plan.comparison.title,
      columns: plan.comparison.columns,
      rows: plan.comparison.rows,
      footnote: plan.comparison.footnote,
    });
  }

  if (plan.tradeoffs) {
    blocks.push({
      id: plan.tradeoffs.id ?? "tradeoffs",
      type: "pros-tradeoffs",
      title: plan.tradeoffs.title,
      gains: plan.tradeoffs.gains,
      giveUps: plan.tradeoffs.giveUps,
      footnote: plan.tradeoffs.footnote,
    });
  }

  for (const c of plan.callouts ?? []) {
    blocks.push({
      id: c.id,
      type: "callout",
      title: c.title,
      tone: c.tone ?? "neutral",
      body: c.body,
    });
  }

  for (const p of plan.extraProse ?? []) {
    blocks.push({
      id: p.id,
      type: "prose",
      title: p.title,
      paragraphs: p.paragraphs,
    });
  }

  if (plan.ctaFinder) {
    blocks.push({
      id: "finder-cta",
      type: "cta",
      variant: "finder",
      title: plan.ctaFinder.title,
      body: plan.ctaFinder.body,
      ctaLabel: plan.ctaFinder.ctaLabel,
      href: plan.ctaFinder.href,
    });
  }

  // Product visuals mid-guide — before decision steps so readers see gear early
  blocks.push({
    id: plan.examples.id ?? "examples",
    type: "product-examples",
    title: plan.examples.title,
    disclaimer: plan.examples.disclaimer,
    examples: plan.examples.items,
  });

  if (plan.compareProductIds && plan.compareProductIds.length >= 2) {
    blocks.push({
      id: "product-comparison",
      type: "product-comparison",
      title: "How current options differ",
      productIds: plan.compareProductIds,
      bestGuideHref: plan.bestGuideHref,
      bestGuideLabel: plan.bestGuideLabel,
      compareHref: plan.compareHref,
    });
  }

  if (plan.decision) {
    blocks.push({
      id: plan.decision.id ?? "decision",
      type: "decision-flow",
      title: plan.decision.title,
      steps: plan.decision.steps,
      branches: plan.decision.branches,
    });
  }

  blocks.push({
    id: "mistakes",
    type: "mistakes",
    title: "Common mistakes",
    mistakes: plan.mistakes,
  });

  if (plan.ctaBest) {
    blocks.push({
      id: "best-cta",
      type: "cta",
      variant: "best-guide",
      title: plan.ctaBest.title,
      body: plan.ctaBest.body,
      ctaLabel: plan.ctaBest.ctaLabel,
      href: plan.ctaBest.href,
    });
  }

  return {
    guideSlug: plan.slug,
    layout: "explainer",
    eyebrow: plan.eyebrow ?? "Explainer",
    displayTitle: plan.displayTitle,
    deck: plan.deck,
    heroImageSrc: plan.heroImageSrc,
    heroImageAlt: plan.heroImageAlt,
    finder: plan.finder,
    decisionLinks: plan.decisionLinks,
    glossaryHref: plan.glossaryHref,
    glossaryTerms: plan.glossaryTerms ?? [],
    needs: [],
    factors: [],
    fit: [],
    toc: tocFromExplainer(blocks),
    productExampleRoles: plan.productExampleRoles,
    productRailTitle: plan.productRailTitle,
    productRailBrowseHref: plan.productRailBrowseHref,
    productRailBrowseLabel: plan.productRailBrowseLabel,
    explainer: {
      layout: "explainer",
      quickAnswerBullets: plan.quickAnswerBullets,
      medicalNote: plan.medicalNote,
      methodologyNote:
        plan.methodologyNote ??
        "This guide combines manufacturer specifications, catalog product data and independent specialist coverage. Product examples render from live catalog data.",
      blocks,
    },
  };
}
