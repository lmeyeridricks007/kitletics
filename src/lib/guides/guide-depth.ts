/**
 * Guide depth tiers, editorial priority, and question maps (internal QA only).
 */

export type GuideDepthTier = "essential" | "standard" | "deep";

export type GuideEditorialPriority = "P0" | "P1" | "P2" | "P3";

export type GuideQuestionImportance = "primary" | "secondary" | "decision" | "misconception" | "next-step";

export type GuideAnswerCoverage =
  | "answered"
  | "partial"
  | "missing"
  | "out-of-scope";

export interface GuideQuestion {
  id: string;
  question: string;
  importance: GuideQuestionImportance;
  answerCoverage: GuideAnswerCoverage;
  sectionId?: string;
}

export interface GuideQuestionMap {
  guideSlug: string;
  primaryQuestion: string;
  questions: GuideQuestion[];
}

/** Expected depth by editorial role — not public labels. */
export const GUIDE_DEPTH_BY_SLUG: Record<string, GuideDepthTier> = {
  "how-to-choose-running-shoes": "deep",
  "stability-shoes-explained": "deep",
  "running-shoe-cushioning": "deep",
  "running-shoe-drop": "deep",
  "running-shoe-rotation": "deep",
  "carbon-vs-nylon-plates": "deep",
  "what-is-a-daily-trainer": "standard",
  "running-shoe-terminology": "standard",
  "road-vs-trail-running-shoes": "standard",
  "how-to-choose-running-watch": "deep",
  "how-to-choose-running-hydration-vest": "standard",
  "how-to-choose-a-power-rack": "standard",
  "how-to-build-a-home-gym": "standard",
  "how-to-choose-a-padel-racket": "deep",
  "how-to-choose-padel-shoes": "deep",
  "beginner-padel-gear-guide": "deep",
  "complete-padel-gear-checklist": "deep",
  "padel-racket-shapes-explained": "deep",
  "round-vs-teardrop-vs-diamond-padel-rackets": "deep",
  "padel-grips-overgrips-explained": "standard",
  "how-to-choose-a-padel-bag": "standard",
  "how-to-choose-padel-balls": "standard",
};

export const GUIDE_PRIORITY_BY_SLUG: Record<string, GuideEditorialPriority> = {
  "how-to-choose-running-shoes": "P0",
  "stability-shoes-explained": "P0",
  "running-shoe-cushioning": "P0",
  "running-shoe-drop": "P0",
  "carbon-vs-nylon-plates": "P0",
  "what-is-a-daily-trainer": "P0",
  "running-shoe-rotation": "P0",
  "how-to-choose-running-watch": "P0",
  "running-shoe-terminology": "P1",
  "road-vs-trail-running-shoes": "P1",
  "how-to-choose-running-hydration-vest": "P1",
  "how-to-choose-heart-rate-monitor": "P1",
};

export function getGuideDepthTier(slug: string): GuideDepthTier {
  return GUIDE_DEPTH_BY_SLUG[slug] ?? "standard";
}

export function getGuideEditorialPriority(slug: string): GuideEditorialPriority {
  return GUIDE_PRIORITY_BY_SLUG[slug] ?? "P2";
}

/** Minimum structured blocks for long-form complete status by tier. */
export function minBlocksForTier(tier: GuideDepthTier): number {
  switch (tier) {
    case "essential":
      return 6;
    case "standard":
      return 10;
    case "deep":
      return 12;
  }
}

export function minFaqsForTier(tier: GuideDepthTier): number {
  switch (tier) {
    case "essential":
      return 3;
    case "standard":
      return 4;
    case "deep":
      return 5;
  }
}

export function minProductExamplesForTier(tier: GuideDepthTier): number {
  switch (tier) {
    case "essential":
      return 2;
    case "standard":
      return 3;
    case "deep":
      return 4;
  }
}
