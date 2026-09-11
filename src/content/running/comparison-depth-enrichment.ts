/**
 * Pre-launch 09 — deepen thin editorial comparisons to meaningful decision pages.
 * Does not invent combinatorial pairs. Holds nothing here — only enriches existing seeds.
 */

import type { Comparison } from "@/domain/editorial/types";
import { products } from "@/content/products";

const byId = new Map(products.map((p) => [p.id, p]));

function nameOf(id: string): string {
  return byId.get(id)?.fullName ?? byId.get(id)?.name ?? id;
}

function words(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function isThin(c: Comparison): boolean {
  const summaryWords = words(c.summary ?? "");
  const hasCriteria = (c.criteria?.length ?? 0) >= 2;
  const hasUseCase = (c.recommendationsByUseCase?.length ?? 0) >= 1;
  const hasDiffs = (c.keyDifferences?.length ?? 0) >= 1;
  const meaningful =
    (hasCriteria && hasUseCase && hasDiffs) ||
    (summaryWords >= 25 && hasCriteria && (hasUseCase || hasDiffs)) ||
    (summaryWords >= 40 && hasCriteria);
  return !meaningful;
}

function deepen(c: Comparison): Comparison {
  if (!isThin(c) || c.productIds.length < 2) return c;
  const [aId, bId] = c.productIds;
  const a = byId.get(aId!);
  const b = byId.get(bId!);
  if (!a || !b) return c;

  const aName = nameOf(aId!);
  const bName = nameOf(bId!);
  const aStrength = a.strengths?.[0] ?? "its primary strengths";
  const bStrength = b.strengths?.[0] ?? "its primary strengths";
  const aWeak = a.weaknesses?.[0] ?? "a different specialty need";
  const bWeak = b.weaknesses?.[0] ?? "a different specialty need";

  const summary =
    words(c.summary) >= 40
      ? c.summary
      : `${aName} and ${bName} split on weekly job, not a blended score. ${aName} is the pick when ${aStrength.toLowerCase()}; ${bName} when ${bStrength.toLowerCase()}. The real trade is ${aWeak.toLowerCase()} versus ${bWeak.toLowerCase()} — buy the job that shows up most weeks.`;

  const criteria =
    (c.criteria?.length ?? 0) >= 2
      ? c.criteria
      : [
          { key: "role", label: "Primary role", notes: `${aName} vs ${bName} job fit` },
          { key: "value", label: "Value context", notes: "Street price vs capability for the intended use" },
          {
            key: "tradeoff",
            label: "Main trade-off",
            notes: `${aWeak} vs ${bWeak}`,
          },
        ];

  const recommendationsByUseCase =
    (c.recommendationsByUseCase?.length ?? 0) >= 1
      ? c.recommendationsByUseCase
      : [
          {
            useCaseId: a.useCaseIds[0] ?? "uc-daily-training",
            productId: aId!,
            rationale: `Choose ${aName} when ${aStrength.toLowerCase()} is the weekly priority.`,
          },
          {
            useCaseId: b.useCaseIds[0] ?? a.useCaseIds[1] ?? "uc-easy-runs",
            productId: bId!,
            rationale: `Choose ${bName} when ${bStrength.toLowerCase()} matters more than ${aName}'s trade-offs.`,
          },
        ];

  const keyDifferences =
    (c.keyDifferences?.length ?? 0) >= 1
      ? c.keyDifferences
      : [
          {
            key: "main-difference",
            label: "Main difference",
            productImpacts: [
              { productId: aId!, impact: aStrength },
              { productId: bId!, impact: bStrength },
            ],
            explanation: `The clearest split is role: ${aName} for ${aStrength.toLowerCase()}; ${bName} for ${bStrength.toLowerCase()}.`,
            evidenceIds: ["ev-catalog-editorial"],
          },
          {
            key: "trade-offs",
            label: "Key trade-offs",
            productImpacts: [
              { productId: aId!, impact: aWeak },
              { productId: bId!, impact: bWeak },
            ],
            explanation: `Accept ${aName}'s limits (${aWeak.toLowerCase()}) or ${bName}'s (${bWeak.toLowerCase()}) based on what you refuse to compromise.`,
            evidenceIds: ["ev-catalog-editorial"],
          },
        ];

  const chooseProductReasons =
    (c.chooseProductReasons?.length ?? 0) >= 2
      ? c.chooseProductReasons
      : [
          {
            productId: aId!,
            reason: `Choose ${aName} if ${aStrength.toLowerCase()} matches most of your week.`,
          },
          {
            productId: bId!,
            reason: `Choose ${bName} if ${bStrength.toLowerCase()} matters more, or if you need to avoid ${aWeak.toLowerCase()}.`,
          },
        ];

  const verdict =
    words(c.verdict) >= 20
      ? c.verdict
      : `No universal winner. Choose ${aName} when you want ${aStrength.toLowerCase()}; choose ${bName} when you want ${bStrength.toLowerCase()}. Skip forcing a compromise if your week clearly matches only one side.`;

  return {
    ...c,
    summary,
    verdict,
    criteria,
    recommendationsByUseCase,
    keyDifferences,
    chooseProductReasons,
    evidenceIds: [
      ...new Set([...(c.evidenceIds ?? []), "ev-catalog-editorial"]),
    ],
  };
}

export function applyComparisonDepthEnrichment(
  comparisons: Comparison[],
): Comparison[] {
  return comparisons.map(deepen);
}
