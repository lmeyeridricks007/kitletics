export type {
  EditorialSurfaceKind,
  EditorialWorkState,
  EditorialDimension,
  EditorialDimensionResult,
  EditorialReadinessAssessment,
} from "@/domain/editorial-readiness/types";

export {
  assessEditorialReadiness,
  assessReviewEditorialReadiness,
  assessBestGuideEditorialReadiness,
  assessBuyingGuideEditorialReadiness,
  assessComparisonEditorialReadiness,
  assessAlternativesEditorialReadiness,
  isEditorialReady,
} from "@/domain/editorial-readiness/assess";
export type { EditorialReadinessInput } from "@/domain/editorial-readiness/assess";
