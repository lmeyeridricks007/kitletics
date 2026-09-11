import type { BestGuide } from "@/domain/editorial/types";
import type { BestGuideLaunchQuality } from "@/domain/launch/types";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import type { PublishResolverOptions } from "@/lib/publishing/resolver";

export interface BestGuideQualityAssessment {
  quality: BestGuideLaunchQuality;
  reasons: string[];
}

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Best guide launch quality — mirrors prelaunch-03 assessBestGuide.
 * Day-1 policy: only LAUNCH_READY is INDEXABLE.
 */
export function assessBestGuideLaunchQuality(
  guide: BestGuide,
  options?: PublishResolverOptions,
): BestGuideQualityAssessment {
  const productionExposed =
    isPubliclyVisible(guide, options) && !guide.noindex;
  const reasons: string[] = [];
  const recs = guide.recommendations ?? [];

  if (!productionExposed) {
    return {
      quality: "BLOCKED",
      reasons: ["not_production_exposed", `status=${guide.status}`],
    };
  }

  const withFit = recs.filter(
    (r) =>
      (r.whyItFits?.length ?? 0) >= 1 ||
      words(r.whyRecommended ?? r.rationale ?? "") >= 25,
  );
  const withTradeoffs = recs.filter(
    (r) => (r.tradeoffs?.length ?? 0) + (r.compromises?.length ?? 0) >= 1,
  );
  const withBestFor = recs.filter(
    (r) =>
      (r.bestForProfiles?.length ?? 0) +
        (r.worksWellFor?.length ?? 0) +
        (r.useCaseStrengths?.length ?? 0) >=
      1,
  );
  const withAvoid = recs.filter(
    (r) =>
      (r.notIdealFor?.length ?? 0) +
        (r.whoShouldAvoid?.length ?? 0) +
        (r.lessSuitedTo?.length ?? 0) >=
      1,
  );
  const withChooseInstead = recs.filter(
    (r) =>
      (r.chooseInsteadWhen?.length ?? 0) >= 1 ||
      (r.considerInsteadProductIds?.length ?? 0) >= 1,
  );
  const introWords = words(
    `${guide.intro} ${guide.whatMattersIntro ?? ""} ${guide.buyingAdvice ?? ""}`,
  );
  const methodology = Boolean(
    guide.selectionMethodology?.trim() || guide.methodologySummary?.trim(),
  );
  const evidence = (guide.evidenceIds?.length ?? 0) > 0;
  const comparison = (guide.comparisonProductIds?.length ?? 0) >= 2;
  const criteria = (guide.selectionCriteria?.length ?? 0) >= 2;
  const whatWeLookFor = (guide.whatWeLookFor?.length ?? 0) >= 2;

  const thinCardShelf =
    introWords < 120 &&
    withFit.length === 0 &&
    withTradeoffs.length === 0 &&
    withChooseInstead.length === 0 &&
    !whatWeLookFor &&
    recs.length <= 6;

  const contextualDepth =
    withFit.length >= Math.ceil(Math.max(recs.length, 1) * 0.6) &&
    withTradeoffs.length >= Math.ceil(Math.max(recs.length, 1) * 0.4)
      ? "high"
      : withFit.length >= 1 || withTradeoffs.length >= 1
        ? "medium"
        : "low";

  if (thinCardShelf) {
    return {
      quality: "THIN",
      reasons: ["title_intro_cards_faq_pattern"],
    };
  }

  // Require evidenceIds — methodology alone is not enough (matches editorial audit).
  if (
    contextualDepth === "high" &&
    methodology &&
    criteria &&
    evidence &&
    withBestFor.length >= 1 &&
    withAvoid.length >= 1 &&
    (comparison || withChooseInstead.length >= 1) &&
    introWords >= 100
  ) {
    return {
      quality: "LAUNCH_READY",
      reasons: [`contextualDepth=${contextualDepth}`],
    };
  }

  if (
    contextualDepth === "medium" &&
    methodology &&
    criteria &&
    withTradeoffs.length >= Math.ceil(Math.max(recs.length, 1) * 0.5) &&
    withChooseInstead.length >= 1 &&
    introWords >= 40
  ) {
    if (introWords < 100) reasons.push("intro_thin");
    if (!withAvoid.length) reasons.push("missing_who_should_avoid_on_picks");
    if (!withBestFor.length) reasons.push("missing_best_for_profiles_on_picks");
    if (!evidence) reasons.push("no_evidence_ids");
    return { quality: "NEEDS_MINOR_WORK", reasons };
  }

  if (recs.length >= 3 && (methodology || criteria) && introWords >= 30) {
    if (contextualDepth === "low") reasons.push("low_contextual_reasoning");
    if (!withChooseInstead.length) reasons.push("missing_choose_instead");
    if (!withAvoid.length) reasons.push("missing_who_should_avoid_on_picks");
    if (!evidence) reasons.push("no_evidence_ids");
    if (!comparison) reasons.push("no_comparison_table_products");
    if (introWords < 80) reasons.push("intro_thin");
    return { quality: "NEEDS_MINOR_WORK", reasons };
  }

  return {
    quality: "THIN",
    reasons: [
      `contextualDepth=${contextualDepth}`,
      `introWords=${introWords}`,
    ],
  };
}
