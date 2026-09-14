/**
 * Padel comparison builder — strong decision pages only.
 * Winners are optional: omit when evidence is insufficient.
 */

import type {
  Comparison,
  ComparisonChooseReason,
  ComparisonCriterion,
  ComparisonKeyDifference,
  ComparisonUseCasePick,
} from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();

export type PadelDimKey =
  | "shape"
  | "balance"
  | "weight"
  | "surface"
  | "frame"
  | "core"
  | "feel"
  | "power"
  | "control"
  | "forgiveness"
  | "maneuverability"
  | "comfort"
  | "stability"
  | "spin"
  | "player-level"
  | "play-style"
  | "price";

const DIM_LABELS: Record<PadelDimKey, string> = {
  shape: "Shape",
  balance: "Balance",
  weight: "Weight",
  surface: "Surface / face",
  frame: "Frame",
  core: "Core",
  feel: "Feel",
  power: "Power",
  control: "Control",
  forgiveness: "Forgiveness",
  maneuverability: "Maneuverability",
  comfort: "Comfort",
  stability: "Stability",
  spin: "Spin",
  "player-level": "Player level",
  "play-style": "Play style",
  price: "Price / offers",
};

const SPEC_KEYS: Partial<Record<PadelDimKey, string>> = {
  shape: "shape",
  balance: "balance",
  weight: "weightMin",
  surface: "faceMaterial",
  frame: "frame",
  core: "core",
  feel: "feel",
  "player-level": "playerLevel",
  "play-style": "playStyle",
};

export function dim(
  key: PadelDimKey,
  winnerProductId?: string,
  notes?: string,
): ComparisonCriterion {
  return {
    key,
    label: DIM_LABELS[key],
    specKey: SPEC_KEYS[key],
    winnerProductId,
    notes,
  };
}

export function choose(
  productId: string,
  reason: string,
  context?: string,
): ComparisonChooseReason {
  return { productId, reason, context };
}

/** Named pickForUseCase — avoid `useCase` which trips react-hooks lint. */
export function pickForUseCase(
  useCaseId: string,
  productId: string,
  rationale: string,
): ComparisonUseCasePick {
  return { useCaseId, productId, rationale };
}

export function biggestDiff(
  label: string,
  a: { productId: string; impact: string },
  b: { productId: string; impact: string },
  explanation: string,
): ComparisonKeyDifference {
  return {
    key: "biggest-difference",
    label: `Biggest difference: ${label}`,
    productImpacts: [a, b],
    explanation,
  };
}

export function keyDiff(
  key: string,
  label: string,
  a: { productId: string; impact: string },
  b: { productId: string; impact: string },
  explanation: string,
): ComparisonKeyDifference {
  return {
    key,
    label,
    productImpacts: [a, b],
    explanation,
  };
}

type StrongPadelComparisonInput = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  productIds: [string, string];
  summary: string;
  verdict: string;
  criteria: ComparisonCriterion[];
  recommendationsByUseCase: ComparisonUseCasePick[];
  keyDifferences: ComparisonKeyDifference[];
  chooseProductReasons: ComparisonChooseReason[];
  isGenerationComparison?: boolean;
  upgradeAdvice?: Comparison["upgradeAdvice"];
  seoTitle?: string;
  seoDescription?: string;
  winnerReason?: string;
};

/** Requires choose A/B, ≥1 key difference, ≥2 criteria, ≥1 use-case pick. */
export function strongPadelComparison(
  input: StrongPadelComparisonInput,
): Comparison {
  if (input.chooseProductReasons.length < 2) {
    throw new Error(`${input.id}: need Choose A + Choose B reasons`);
  }
  if (input.keyDifferences.length < 1) {
    throw new Error(`${input.id}: need at least one key difference`);
  }
  if (input.criteria.length < 2) {
    throw new Error(`${input.id}: need ≥2 criteria`);
  }
  if (input.recommendationsByUseCase.length < 1) {
    throw new Error(`${input.id}: need ≥1 use-case recommendation`);
  }
  const summaryWords = input.summary.trim().split(/\s+/).filter(Boolean).length;
  if (summaryWords < 25) {
    throw new Error(`${input.id}: summary must be ≥25 words (have ${summaryWords})`);
  }

  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    shortDescription: input.shortDescription,
    productIds: input.productIds,
    categoryId: "cat-padel-rackets",
    comparisonType: "editorial",
    summary: input.summary,
    verdict: input.verdict,
    winnerProductId: undefined,
    winnerReason:
      input.winnerReason ??
      "Context-dependent — pick by the dimension winners and choose-if guidance, not a universal score.",
    criteria: input.criteria,
    recommendationsByUseCase: input.recommendationsByUseCase,
    keyDifferences: input.keyDifferences,
    chooseProductReasons: input.chooseProductReasons,
    isGenerationComparison: input.isGenerationComparison,
    upgradeAdvice: input.upgradeAdvice,
    evidenceIds: ["ev-wave26-editorial"],
    faqIds: [],
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    ...pub,
  };
}
