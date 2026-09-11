export type {
  LaunchDisposition,
  LaunchEligibility,
  LaunchEligibilityContext,
  LaunchEligibilityReason,
  LaunchEntityKind,
  LaunchQualityClass,
  ProductLaunchQuality,
  ReviewLaunchQuality,
  BestGuideLaunchQuality,
  GuideLaunchQuality,
  ComparisonLaunchQuality,
} from "@/domain/launch/types";

export {
  getLaunchEligibility,
  isLaunchPreviewContext,
  isIndexableEligibility,
  shouldRenderPublicly,
  shouldNoindex,
  shouldPromotePublicly,
  promotableReviewSlug,
  isLaunchListable,
} from "@/domain/launch/get-launch-eligibility";

export { assessProductLaunchQuality } from "@/domain/launch/assess-product-quality";
export type {
  ProductDecisionFlags,
  ProductQualityAssessment,
} from "@/domain/launch/assess-product-quality";
export {
  PRODUCT_WHAT_IS_THIS_MIN_CHARS,
  PRODUCT_DESCRIPTION_THIN_CHARS,
  buildProductDecisionFlags,
  decisionScoreFromFlags,
} from "@/domain/launch/assess-product-quality";
export { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
export { assessBestGuideLaunchQuality } from "@/domain/launch/assess-best-guide-quality";
export {
  assessComparisonLaunchQuality,
  isMeaningfulComparison,
} from "@/domain/launch/assess-comparison-quality";
export { assessAlternativesIndexability } from "@/domain/launch/assess-alternatives-indexability";
export type { AlternativesIndexabilityAssessment } from "@/domain/launch/assess-alternatives-indexability";

// Re-export unified editorial readiness (Fix 48)
export {
  assessEditorialReadiness,
  isEditorialReady,
} from "@/domain/editorial-readiness";
export type {
  EditorialReadinessAssessment,
  EditorialSurfaceKind,
  EditorialWorkState,
} from "@/domain/editorial-readiness";
