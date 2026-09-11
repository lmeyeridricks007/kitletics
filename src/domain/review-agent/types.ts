/**
 * Product Review Agent — domain types.
 * INTERNAL ONLY readiness/priority — never expose on public Product UI.
 */

import type { EntityId } from "@/domain/shared/types";
import type { ReviewType, ScoreBreakdownItem, ContentSection } from "@/domain/editorial/types";

export const PRODUCT_REVIEW_AGENT_VERSION = "1.0.0";

export type ReviewAgentMode =
  | "audit"
  | "research"
  | "generate"
  | "refresh"
  | "repair"
  | "full";

export type ReviewCoverageStatus =
  | "complete"
  | "needs-refresh"
  | "needs-research"
  | "needs-editorial-review"
  | "blocked"
  | "not-required";

/** Internal priority — never shown publicly */
export type ReviewPriority = "P0" | "P1" | "P2" | "P3";

export type ReviewAgentSessionStatus =
  | "created"
  | "auditing"
  | "researching"
  | "synthesizing"
  | "needs-review"
  | "blocked"
  | "staged"
  | "failed";

export interface ReviewReadinessDimensions {
  identity: boolean;
  specEvidence: boolean;
  independentEvidence: boolean;
  verdict: boolean;
  pros: boolean;
  compromises: boolean;
  useCases: boolean;
  sections: boolean;
  alternatives: boolean;
  comparisons: boolean;
  guides: boolean;
  media: boolean;
  freshness: boolean;
  typeCorrect: boolean;
  noInternalWording: boolean;
  noFakeFirstHand: boolean;
}

export interface ReviewReadiness {
  /** 0–100 internal score */
  score: number;
  dimensions: ReviewReadinessDimensions;
  blockers: string[];
  warnings: string[];
}

export interface ReviewCategoryCriteriaDef {
  key: string;
  label: string;
}

export interface ReviewAgentCategoryConfig {
  categoryId: string;
  criteria: ReviewCategoryCriteriaDef[];
  sectionTypes: string[];
  /** Evidence types preferred for subjective claims */
  requiredEvidenceTypes: string[];
  /** Minimum independent/editorial sources for generate */
  minIndependentSources: number;
  /** If false, products in this category default to not-required until catalog depth justifies */
  reviewRecommended: boolean;
}

export interface ProductReviewAuditRow {
  productId: EntityId;
  productSlug: string;
  productName: string;
  brandId: EntityId;
  categoryId: EntityId;
  sportIds: EntityId[];
  lifecycleStatus: string;
  priority: ReviewPriority;
  coverage: ReviewCoverageStatus;
  reviewId?: EntityId;
  reviewSlug?: string;
  reviewType?: ReviewType;
  reviewStatus?: string;
  readiness?: ReviewReadiness;
  evidenceCount: number;
  hasManufacturerEvidence: boolean;
  hasIndependentEvidence: boolean;
  hasPersonalTest: boolean;
  reasons: string[];
}

export interface StagedReviewDraft {
  id: EntityId;
  slug: string;
  productId: EntityId;
  reviewType: ReviewType;
  title: string;
  subtitle?: string;
  bottomLine: string;
  verdict: string;
  summary: string;
  score: number;
  pros: string[];
  cons: string[];
  whoShouldBuy: string[];
  whoShouldAvoid: string[];
  scoreBreakdown: ScoreBreakdownItem[];
  sections: ContentSection[];
  evidenceIds: EntityId[];
  alternativeProductIds: EntityId[];
  comparisonIds: EntityId[];
  testingContext: string;
  editorialDisclosure: string;
  reviewerId: EntityId;
  /** Proposed content status — agent never auto-publishes */
  proposedStatus: "draft" | "needs-review";
  readiness: ReviewReadiness;
  /** Diff notes when refreshing an existing review */
  changeSummary?: string[];
  preservedManualFields?: string[];
}

export interface ReviewAgentLogEntry {
  at: string;
  stage: string;
  level: "info" | "warn" | "error";
  message: string;
  productId?: EntityId;
}

export interface ReviewAgentReport {
  mode: ReviewAgentMode;
  dryRun: boolean;
  agentVersion: string;
  startedAt: string;
  finishedAt: string;
  scanned: number;
  byCoverage: Record<ReviewCoverageStatus, number>;
  byPriority: Record<ReviewPriority, number>;
  byReviewType: Record<string, number>;
  created: number;
  refreshed: number;
  repaired: number;
  needsResearch: number;
  needsEditorialReview: number;
  blocked: number;
  notRequired: number;
  failures: Array<{ productId: string; error: string }>;
  rows: ProductReviewAuditRow[];
  stagedReviewIds: EntityId[];
}

export interface ReviewAgentSession {
  id: EntityId;
  mode: ReviewAgentMode;
  dryRun: boolean;
  status: ReviewAgentSessionStatus;
  filters: ReviewAgentFilters;
  createdAt: string;
  updatedAt: string;
  report: ReviewAgentReport;
  stagedReviews: StagedReviewDraft[];
  logs: ReviewAgentLogEntry[];
}

export interface ReviewAgentFilters {
  productSlug?: string;
  productId?: string;
  brandSlug?: string;
  brandId?: string;
  categorySlug?: string;
  categoryId?: string;
  sportSlug?: string;
  sportId?: string;
  missingOnly?: boolean;
  staleOnly?: boolean;
  all?: boolean;
  limit?: number;
  priorities?: ReviewPriority[];
}

/** Marker for human-curated fields the agent must not overwrite */
export interface ReviewEditorialLock {
  reviewId: EntityId;
  lockedFields: string[];
  note?: string;
}

/** Catalog snapshot passed into the orchestrator */
export interface ReviewAgentCatalogSnapshot {
  bestGuideProductIds: string[];
  comparisonProductIds: string[];
  gearSetupProductIds: string[];
  featuredHubProductIds: string[];
  finderCandidateIds: string[];
  comparisonIdsByProductId: Map<string, string[]>;
}
