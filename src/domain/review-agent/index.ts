export type {
  ReviewAgentMode,
  ReviewCoverageStatus,
  ReviewPriority,
  ReviewReadiness,
  ReviewReadinessDimensions,
  ReviewAgentCategoryConfig,
  ProductReviewAuditRow,
  StagedReviewDraft,
  ReviewAgentReport,
  ReviewAgentSession,
  ReviewAgentFilters,
  ReviewEditorialLock,
  ReviewAgentCatalogSnapshot,
} from "@/domain/review-agent/types";
export { PRODUCT_REVIEW_AGENT_VERSION } from "@/domain/review-agent/types";

export {
  getReviewAgentCategoryConfig,
  hasExplicitReviewCategoryConfig,
  EXPERT_RESEARCH_METHODOLOGY,
  EDITORIAL_DISCLOSURE,
} from "@/domain/review-agent/category-config";
export { computeReviewPriority, buildPriorityIndex } from "@/domain/review-agent/priority";
export { determineCoverageStatus } from "@/domain/review-agent/coverage";
export { computeReviewReadiness } from "@/domain/review-agent/readiness";
export { classifyEvidence } from "@/domain/review-agent/evidence";
export {
  synthesizeExpertResearchDraft,
  stagedDraftToReviewShape,
  qualitativeLabel,
} from "@/domain/review-agent/synthesize";
export {
  buildProductQuestionMap,
  type ProductQuestionMap,
  type ProductQuestionCompetitor,
} from "@/domain/review-agent/product-question-map";
export {
  synthesizeUniqueExpertResearch,
  isUniqueExpertResearchEligible,
  type UniqueExpertResearchResult,
  type SynthesizeUniqueExpertResearchOpts,
} from "@/domain/review-agent/unique-expert-research";
export {
  assessProductReviewLifecycle,
  assessReviewImpactFromProductChange,
  proposeFirstHandTransition,
} from "@/domain/review-agent/lifecycle";
export {
  getReviewStalenessPolicy,
  evaluateReviewFreshness,
  REVIEW_CLAIM_SENSITIVE_FIELDS,
} from "@/domain/review-agent/staleness";
export { writeReviewBacklog } from "@/domain/review-agent/backlog";
export type { ReviewBacklogItem } from "@/domain/review-agent/backlog";
export {
  runProductReviewAgent,
  type ReviewAgentCatalog,
} from "@/domain/review-agent/orchestrator";
export { buildReviewAgentCatalog } from "@/domain/review-agent/catalog";
export {
  ensureReviewStagingDirs,
  saveReviewAgentSession,
  loadReviewAgentSession,
  listReviewAgentSessions,
  renderReviewAgentReportMarkdown,
} from "@/domain/review-agent/staging";
export {
  containsInternalTerminology,
  filterSpecificPros,
  isGenericPro,
} from "@/domain/review-agent/validate";
export { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";
export {
  canFeatureProduct,
  assessFeatureReadiness,
  canFeatureProductStrategically,
  reviewRequiredForPublication,
} from "@/domain/catalog/featureability";
export type {
  FeatureSurface,
  FeatureReadinessResult,
} from "@/domain/catalog/featureability";
