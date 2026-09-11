/**
 * Fix 82 — shared Alternatives content-quality bar.
 *
 * reasonGroupCount must count unique reasonIds on the ranked page
 * (including relationship types that fall outside category config tabs).
 */
import { ALTERNATIVES_INDEXABLE_CATEGORIES } from "@/lib/product/alternative-decision-copy";
import { ALTERNATIVES_UNIQUENESS_HOLD_SLUGS } from "@/content/alternatives-uniqueness-holds";

export interface AlternativesQualitySignals {
  alternativeCount: number;
  substantiveCount: number;
  /** Unique reasonId count on the ranked page (not config-only). */
  reasonGroupCount: number;
  distinctCopy: boolean;
  canPublish: boolean;
  categoryIndexable: boolean;
  uniquenessHold: boolean;
}

export interface AlternativesContentIndexabilityInput {
  canPublish: boolean;
  categoryId: string;
  productSlug: string;
  substantiveCount: number;
  reasonGroupCount: number;
  distinctCopy: boolean;
}

/** Content bar only — parent product / editorial gates live in the assessor. */
export function evaluateAlternativesContentIndexable(
  input: AlternativesContentIndexabilityInput,
): { indexable: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const categoryIndexable = ALTERNATIVES_INDEXABLE_CATEGORIES.has(
    input.categoryId,
  );
  const uniquenessHold = ALTERNATIVES_UNIQUENESS_HOLD_SLUGS.has(
    input.productSlug,
  );

  if (!input.canPublish) {
    reasons.push("canPublishAlternativesPage failed");
  }
  if (!categoryIndexable) {
    reasons.push("alternatives_category_noindex");
  }
  if (uniquenessHold) {
    reasons.push("alternatives_uniqueness_hold");
  }
  if (input.substantiveCount < 3) {
    reasons.push(
      `need ≥3 substantive decision alts (have ${input.substantiveCount})`,
    );
  }
  if (input.reasonGroupCount < 2) {
    reasons.push(
      `need ≥2 reason groups on ranked list (have ${input.reasonGroupCount})`,
    );
  }
  if (!input.distinctCopy) {
    reasons.push("need distinct pair-specific decision copy across alts");
  }

  return {
    indexable: reasons.length === 0,
    reasons,
  };
}

export function signalsFromPageParts(input: {
  productSlug: string;
  categoryId: string;
  canPublish: boolean;
  alternativeCount: number;
  substantiveCount: number;
  reasonGroupCount: number;
  distinctCopy: boolean;
}): AlternativesQualitySignals {
  return {
    alternativeCount: input.alternativeCount,
    substantiveCount: input.substantiveCount,
    reasonGroupCount: input.reasonGroupCount,
    distinctCopy: input.distinctCopy,
    canPublish: input.canPublish,
    categoryIndexable: ALTERNATIVES_INDEXABLE_CATEGORIES.has(input.categoryId),
    uniquenessHold: ALTERNATIVES_UNIQUENESS_HOLD_SLUGS.has(input.productSlug),
  };
}

/** Count unique decision reason groups from ranked alternatives. */
export function countRankedReasonGroups(
  alternatives: { reasonId: string }[],
): number {
  return new Set(alternatives.map((a) => a.reasonId)).size;
}

export function countSubstantiveAlternatives(
  alternatives: {
    betterAt: string[];
    worseAt: string[];
    whoShouldSwitch: string;
    whoShouldStay: string;
  }[],
): number {
  return alternatives.filter(
    (a) =>
      a.betterAt.length >= 1 &&
      a.worseAt.length >= 1 &&
      a.whoShouldSwitch.length > 40 &&
      a.whoShouldStay.length > 40,
  ).length;
}
