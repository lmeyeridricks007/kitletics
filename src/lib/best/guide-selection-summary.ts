/**
 * Helpers for the consumer-facing “How we narrowed the field” summary.
 */

import type { BestGuide, BestGuideRecommendation } from "@/domain/editorial/types";
import type { GuideCandidateEvaluation } from "@/lib/best/guide-coverage";
import { getAwardLabel } from "@/lib/best/awards";

const GENERIC_REASON_PATTERNS = [
  /^guide recommendation$/i,
  /^stronger pick available$/i,
  /^lower score$/i,
  /^not selected$/i,
  /^overlapping role$/i,
  /survived screening/i,
  /overlapping role with a stronger pick/i,
];

export function isGenericPublicReason(reason?: string): boolean {
  if (!reason?.trim()) return true;
  const t = reason.trim();
  return GENERIC_REASON_PATTERNS.some((p) => p.test(t));
}

export function selectNotableRunnerUps(
  evaluations: GuideCandidateEvaluation[],
  limit = 5,
): GuideCandidateEvaluation[] {
  return evaluations
    .filter((e) => e.status === "shortlisted" && e.product)
    .slice(0, limit);
}

export function guideRoleCoverageChips(
  recommendations: BestGuideRecommendation[],
): string[] {
  const chips: string[] = [];
  const seen = new Set<string>();
  for (const r of recommendations) {
    const label =
      getAwardLabel(r.awardType, r.badge) ??
      r.decisionRole ??
      r.summary;
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    chips.push(label);
  }
  return chips.slice(0, 8);
}

export function narrowingNarrative(input: {
  guide: BestGuide;
  consideredCount: number;
  shortlistedCount: number;
  recommendedCount: number;
  productNoun: string;
  useCaseLabel?: string;
}): string {
  const noun = input.productNoun.toLowerCase();
  const use =
    input.useCaseLabel?.toLowerCase() ??
    "this use case";
  return `We started with ${input.consideredCount} current ${noun} that match ${use} in our catalog. ${input.shortlistedCount} were strong enough to make the shortlist. ${input.recommendedCount} ultimately earned a place in this guide because they cover meaningfully different needs — not simply the highest overall scores.`;
}

export function diversityNarrative(
  recommendations: BestGuideRecommendation[],
): string | undefined {
  const chips = guideRoleCoverageChips(recommendations);
  if (chips.length < 2) return undefined;
  const list =
    chips.length <= 3
      ? chips.join(", ")
      : `${chips.slice(0, -1).join(", ")} and ${chips[chips.length - 1]}`;
  return `Our final recommendations deliberately include different roles — ${list} — rather than several near-identical options with the highest scores.`;
}

export function compareHrefForRunnerUp(input: {
  runnerUpSlug: string;
  closestRecommendedSlug?: string;
  categorySlug: string;
}): string {
  const products = [input.runnerUpSlug, input.closestRecommendedSlug]
    .filter(Boolean)
    .join(",");
  return `/compare?category=${input.categorySlug}&products=${products}`;
}
