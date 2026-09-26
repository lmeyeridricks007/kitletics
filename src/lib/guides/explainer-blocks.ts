/**
 * Structured blocks for technical / educational buying guides (explainers).
 * Framework guides (how-to-choose) keep the existing needs→factors layout.
 */

import type { EntityId } from "@/domain/shared/types";

export type ExplainerBlock =
  | ExplainerProseBlock
  | ExplainerCalloutBlock
  | ExplainerComparisonTableBlock
  | ExplainerFactorCardsBlock
  | ExplainerLookForBlock
  | ExplainerTimelineBlock
  | ExplainerSpectrumBlock
  | ExplainerMatrixBlock
  | ExplainerUseCaseCardsBlock
  | ExplainerProsTradeoffsBlock
  | ExplainerDecisionFlowBlock
  | ExplainerProductExamplesBlock
  | ExplainerProductComparisonBlock
  | ExplainerMistakesBlock
  | ExplainerDiagramBlock
  | ExplainerCtaBlock;

export interface ExplainerSectionDiagram {
  variant: ExplainerDiagramVariant;
  caption: string;
}

interface ExplainerBlockBase {
  id: string;
  title: string;
  intro?: string;
  /** Educational visual that explains this section */
  diagram?: ExplainerSectionDiagram;
}

export interface ExplainerProseBlock extends ExplainerBlockBase {
  type: "prose";
  paragraphs: string[];
  /** Optional “what to look for” checklist panels */
  lookFor?: {
    id: string;
    title: string;
    checks: string[];
  }[];
}

export interface ExplainerCalloutBlock extends ExplainerBlockBase {
  type: "callout";
  tone?: "neutral" | "accent" | "caution";
  body: string;
}

export interface ExplainerComparisonTableBlock extends ExplainerBlockBase {
  type: "comparison-table";
  columns: string[];
  rows: { label: string; values: string[] }[];
  footnote?: string;
  lookFor?: {
    id: string;
    title: string;
    checks: string[];
  }[];
}

export interface ExplainerFactorCardsBlock extends ExplainerBlockBase {
  type: "factor-cards";
  cards: {
    id: string;
    title: string;
    whatItIs: string;
    howItChanges: string;
    whatYouNotice: string;
  }[];
}

export interface ExplainerLookForBlock extends ExplainerBlockBase {
  type: "look-for";
  panels: {
    id: string;
    title: string;
    checks: string[];
  }[];
}

export interface ExplainerTimelineBlock extends ExplainerBlockBase {
  type: "timeline";
  stages: {
    id: string;
    label: string;
    description: string;
    traits: string[];
  }[];
}

export interface ExplainerSpectrumBlock extends ExplainerBlockBase {
  type: "spectrum";
  lowLabel: string;
  highLabel: string;
  markers: {
    productId: EntityId;
    position: number;
    label: string;
  }[];
  note?: string;
}

export interface ExplainerMatrixBlock extends ExplainerBlockBase {
  type: "matrix";
  xLow: string;
  xHigh: string;
  yLow: string;
  yHigh: string;
  cells: {
    id: string;
    x: "low" | "mid" | "high";
    y: "low" | "mid" | "high";
    label: string;
    productId?: EntityId;
    description: string;
  }[];
  note?: string;
}

export interface ExplainerUseCaseCardsBlock extends ExplainerBlockBase {
  type: "use-case-cards";
  cards: {
    id: string;
    title: string;
    description: string;
    href?: string;
  }[];
}

export interface ExplainerProsTradeoffsBlock extends ExplainerBlockBase {
  type: "pros-tradeoffs";
  gains: string[];
  giveUps: string[];
  footnote?: string;
}

export interface ExplainerDecisionFlowBlock extends ExplainerBlockBase {
  type: "decision-flow";
  steps: {
    id: string;
    title: string;
    body: string;
  }[];
  branches?: {
    question: string;
    options: { label: string; result: string }[];
  };
}

export interface ExplainerProductExamplesBlock extends ExplainerBlockBase {
  type: "product-examples";
  disclaimer: string;
  examples: {
    productId: EntityId;
    approachLabel: string;
    whyIllustrates: string;
    bestFor: string[];
    tradeoff: string;
  }[];
}

export interface ExplainerProductComparisonBlock extends ExplainerBlockBase {
  type: "product-comparison";
  productIds: EntityId[];
  bestGuideHref?: string;
  bestGuideLabel?: string;
  compareHref?: string;
}

export interface ExplainerMistakesBlock extends ExplainerBlockBase {
  type: "mistakes";
  mistakes: { id: string; title: string; body: string }[];
}

export interface ExplainerDiagramBlock extends ExplainerBlockBase {
  type: "diagram";
  variant: ExplainerDiagramVariant;
  caption: string;
}

export type ExplainerDiagramVariant =
  | "neutral-vs-stability"
  | "platform-width"
  | "road-vs-trail"
  | "amoled-vs-mip"
  | "breadcrumb-vs-maps"
  | "gps-signal"
  | "phone-vs-watch"
  | "heel-to-toe-drop"
  | "cushion-stack"
  | "carbon-vs-nylon"
  | "rocker-geometry"
  | "shoe-rotation"
  | "daily-trainer"
  | "road-trail-surfaces"
  | "open-ear-vs-inear"
  | "hrm-chest-vs-wrist"
  | "cross-training-shoe"
  | "gps-watch-run"
  | "vest-vs-belt"
  | "hydration-vest"
  | "running-belt"
  | "soft-flask"
  | "handheld-bottle"
  | "running-headlamp"
  | "running-socks"
  | "running-jacket"
  | "fuel-gels"
  | "massage-gun"
  | "recovery-sandal"
  | "drop-buckets"
  | "drop-feel"
  | "drop-factors"
  | "drop-geometry-matrix"
  | "drop-tradeoffs"
  | "drop-transition"
  | "drop-decision"
  | "drop-mistakes"
  | "foam-compression"
  | "stack-measurement"
  | "foam-soft-vs-firm"
  | "plate-stiffness"
  | "plate-flex"
  | "rotation-week"
  | "easy-miles"
  | "tempo-session"
  | "trail-lugs"
  | "road-outsole"
  | "base-width"
  | "stability-guidance"
  | "comparing-shoes"
  | "decision-steps"
  | "mistakes-notes"
  | "product-shortlist"
  | "padel-racket-shapes"
  | "padel-racket-balance"
  | "padel-racket-weight"
  | "padel-bag-forms"
  | "padel-grip-vs-overgrip"
  | "padel-ball-types"
  | "padel-pressurizer"
  | "padel-decision-steps"
  | "padel-shoe-outsole"
  | "padel-sweet-spot"
  | "padel-power-control"
  | "padel-core-feel"
  | "padel-shoe-support"
  | "padel-bag-anatomy"
  | "padel-grip-layers"
  | "padel-beginner-kit";

export interface ExplainerCtaBlock extends ExplainerBlockBase {
  type: "cta";
  variant: "finder" | "best-guide" | "compare";
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
}

export interface ExplainerGuideExtras {
  layout: "explainer";
  quickAnswerBullets: string[];
  medicalNote?: string;
  methodologyNote?: string;
  blocks: ExplainerBlock[];
}

export function tocFromExplainer(
  blocks: ExplainerBlock[],
  includeFaq = true,
): { id: string; title: string }[] {
  const items = blocks
    .filter((b) => b.type !== "callout" && b.type !== "cta")
    .map((b) => ({ id: b.id, title: b.title }));
  if (includeFaq) items.push({ id: "faq", title: "Frequently asked questions" });
  items.push({ id: "methodology", title: "How we research" });
  return items;
}
