/**
 * GuideRecommendationAnalyst — structured helper for contextual Best Guide copy.
 *
 * Does NOT auto-publish unsupported claims. Editorial agents should call
 * `buildAnalystInput` / `assertRecommendationAnalysis` before publishing.
 */

import type {
  BestGuide,
  BestGuideRecommendation,
  GuideChooseInsteadWhen,
  Review,
} from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";
import type { Recommendation } from "@/domain/recommendations/types";
import { resolveGuideContextConfig } from "@/lib/best/guide-context-config";

export interface GuideRecommendationAnalystInput {
  guide: Pick<BestGuide, "id" | "slug" | "title" | "useCaseIds" | "intro">;
  product: Product;
  entry: BestGuideRecommendation;
  recommendation?: Recommendation;
  review?: Review;
  shortlistedCompetitors: {
    product: Product;
    entry?: BestGuideRecommendation;
    recommendation?: Recommendation;
  }[];
  evidenceIds: string[];
}

export interface GuideRecommendationAnalystOutput {
  whyItFits: string[];
  whyItWon?: string;
  useCaseStrengths: string[];
  tradeoffs: string[];
  bestForProfiles: string[];
  notIdealFor: string[];
  chooseInsteadWhen: GuideChooseInsteadWhen[];
  decisionRole?: string;
  paceCharacter?: string;
  worksWellFor?: string[];
  lessSuitedTo?: string[];
}

export function buildAnalystInput(
  input: GuideRecommendationAnalystInput,
): GuideRecommendationAnalystInput & {
  contextConfigId: string;
  importantFactorKeys: string[];
} {
  const cfg = resolveGuideContextConfig({
    useCaseIds: input.guide.useCaseIds,
    slug: input.guide.slug,
  });
  return {
    ...input,
    contextConfigId: cfg.id,
    importantFactorKeys: cfg.factors
      .filter((f) => f.importance === "high")
      .map((f) => f.key),
  };
}

/** Completeness gate before publish — does not invent copy. */
export function assertRecommendationAnalysis(
  entry: BestGuideRecommendation,
  options?: { requireWhyItWon?: boolean },
): string[] {
  const gaps: string[] = [];
  if (!entry.whyItFits?.length) gaps.push("whyItFits");
  if (!entry.tradeoffs?.length && !entry.compromises?.length) {
    gaps.push("tradeoffs");
  }
  if (!entry.bestForProfiles?.length) gaps.push("bestForProfiles");
  if (!entry.notIdealFor?.length && !entry.whoShouldAvoid?.length) {
    gaps.push("notIdealFor");
  }
  if (
    !entry.chooseInsteadWhen?.length &&
    !entry.considerInsteadProductIds?.length
  ) {
    gaps.push("chooseInsteadWhen");
  }
  if (options?.requireWhyItWon && !entry.whyItWon?.trim()) {
    gaps.push("whyItWon");
  }
  return gaps;
}

/**
 * Merge analyst output into an existing recommendation without overwriting
 * stronger editorial fields already present.
 */
export function mergeAnalystOutput(
  entry: BestGuideRecommendation,
  output: GuideRecommendationAnalystOutput,
): BestGuideRecommendation {
  return {
    ...entry,
    whyItFits: entry.whyItFits?.length ? entry.whyItFits : output.whyItFits,
    whyItWon: entry.whyItWon?.trim() ? entry.whyItWon : output.whyItWon,
    useCaseStrengths: entry.useCaseStrengths?.length
      ? entry.useCaseStrengths
      : output.useCaseStrengths,
    tradeoffs: entry.tradeoffs?.length ? entry.tradeoffs : output.tradeoffs,
    bestForProfiles: entry.bestForProfiles?.length
      ? entry.bestForProfiles
      : output.bestForProfiles,
    notIdealFor: entry.notIdealFor?.length
      ? entry.notIdealFor
      : output.notIdealFor,
    chooseInsteadWhen: entry.chooseInsteadWhen?.length
      ? entry.chooseInsteadWhen
      : output.chooseInsteadWhen,
    decisionRole: entry.decisionRole ?? output.decisionRole,
    paceCharacter: entry.paceCharacter ?? output.paceCharacter,
    worksWellFor: entry.worksWellFor?.length
      ? entry.worksWellFor
      : output.worksWellFor,
    lessSuitedTo: entry.lessSuitedTo?.length
      ? entry.lessSuitedTo
      : output.lessSuitedTo,
  };
}
