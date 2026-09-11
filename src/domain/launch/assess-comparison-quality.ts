import type { Comparison } from "@/domain/editorial/types";
import type { ComparisonLaunchQuality } from "@/domain/launch/types";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";

export interface ComparisonQualityAssessment {
  quality: ComparisonLaunchQuality;
  reasons: string[];
  meaningful: boolean;
}

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Meaningful vs thin — same heuristic as prelaunch-03 / comparison-depth-enrichment. */
export function isMeaningfulComparison(comparison: Comparison): boolean {
  const summaryWords = words(comparison.summary ?? "");
  const hasCriteria = (comparison.criteria?.length ?? 0) >= 2;
  const hasUseCase = (comparison.recommendationsByUseCase?.length ?? 0) >= 1;
  const hasDiffs = (comparison.keyDifferences?.length ?? 0) >= 1;
  return (
    (hasCriteria && hasUseCase && hasDiffs) ||
    (summaryWords >= 25 && hasCriteria && (hasUseCase || hasDiffs)) ||
    (summaryWords >= 40 && hasCriteria)
  );
}

export function assessComparisonLaunchQuality(
  comparison: Comparison,
  options?: PublishResolverOptions,
): ComparisonQualityAssessment {
  const productionExposed =
    isPubliclyVisible(comparison, options) && !comparison.noindex;

  if (!productionExposed) {
    return {
      quality: "BLOCKED",
      reasons: ["not_production_exposed", `status=${comparison.status}`],
      meaningful: false,
    };
  }

  const meaningful = isMeaningfulComparison(comparison);
  if (meaningful) {
    return {
      quality: "MEANINGFUL",
      reasons: ["meaningful_decision_page"],
      meaningful: true,
    };
  }

  return {
    quality: "THIN",
    reasons: [
      `summaryWords=${words(comparison.summary ?? "")}`,
      `criteria=${comparison.criteria?.length ?? 0}`,
    ],
    meaningful: false,
  };
}
