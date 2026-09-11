import type { EntityId } from "@/domain/shared/types";

export type FreshnessStatus =
  | "fresh"
  | "review-soon"
  | "stale"
  | "unknown"
  | "conflicting";

export type MaintenancePriority = "P0" | "P1" | "P2" | "P3";

export type MaintenanceTaskStatus =
  | "open"
  | "researching"
  | "needs-review"
  | "blocked"
  | "resolved"
  | "dismissed";

export type MaintenanceOwnership =
  | "catalog"
  | "editorial"
  | "commercial"
  | "engineering";

export type ChangeClassification =
  | "informational"
  | "low-impact"
  | "recommendation-impacting"
  | "editorial-impacting"
  | "commercial-impacting"
  | "critical";

export type MaintenanceEventType =
  | "NEW_PRODUCT_DISCOVERED"
  | "NEW_GENERATION_DISCOVERED"
  | "MANUFACTURER_PAGE_CHANGED"
  | "PRODUCT_STATUS_CHANGED"
  | "SPECIFICATION_CHANGED"
  | "SOURCE_REMOVED"
  | "SOURCE_CONFLICT"
  | "MEDIA_BROKEN"
  | "OFFER_STALE"
  | "OFFER_CHANGED"
  | "NEW_EVIDENCE"
  | "RECOMMENDATION_DEPENDENCY_CHANGED"
  | "RELATIONSHIP_CHANGED"
  | "GUIDE_DEPENDENCY_CHANGED"
  | "YEAR_ROLLOVER_REVIEW"
  | "SUPERLATIVE_CLAIM"
  | "HARDCODED_PRICE"
  | "FRAGMENT_LIFECYCLE_LANGUAGE"
  | "TAXONOMY_REVIEW"
  | "NO_MATERIAL_CHANGE";

export type MaintenanceTaskType =
  | "product-refresh"
  | "lifecycle-review"
  | "spec-change-review"
  | "source-conflict"
  | "media-repair"
  | "offer-refresh"
  | "guide-review"
  | "review-refresh"
  | "comparison-review"
  | "relationship-review"
  | "recommendation-review"
  | "product-onboarding"
  | "finder-regression"
  | "content-claim-review"
  | "taxonomy-review"
  | "evidence-health"
  | "search-index-refresh";

export type MonitoringTier = "tier-1" | "tier-2" | "tier-3";

export type EntityTypeForMaintenance =
  | "product"
  | "evidence"
  | "media"
  | "offer"
  | "recommendation"
  | "best-guide"
  | "review"
  | "comparison"
  | "relationship"
  | "brand"
  | "family"
  | "content";

export interface FieldVerification {
  entityId: EntityId;
  field: string;
  evidenceIds: EntityId[];
  lastVerifiedAt: string;
  nextReviewAt?: string;
  confidence: "high" | "medium" | "low";
  status: FreshnessStatus;
}

export interface FreshnessPolicy {
  id: string;
  entityType: EntityTypeForMaintenance;
  categoryId?: string;
  field?: string;
  /** Days until still considered fresh */
  freshForDays: number;
  /** Days after which status becomes review-soon */
  reviewSoonAfterDays: number;
  /** Days after which status becomes stale */
  staleAfterDays: number;
  triggers: MaintenanceEventType[];
  description?: string;
}

export interface FreshnessEvaluation {
  status: FreshnessStatus;
  lastVerifiedAt?: string;
  nextReviewAt?: string;
  reasons: string[];
  priority: MaintenancePriority;
  policyId: string;
  /** Age in days (undefined if unknown) */
  ageDays?: number;
}

export interface MaintenanceEvent {
  id: EntityId;
  type: MaintenanceEventType;
  entityType: EntityTypeForMaintenance;
  entityId?: EntityId;
  source?: string;
  detectedAt: string;
  details: Record<string, unknown>;
  confidence: "high" | "medium" | "low";
  status: "open" | "acknowledged" | "resolved" | "suppressed";
  /** Deterministic key for idempotent event creation */
  dedupeKey: string;
}

export interface MaintenanceTask {
  id: EntityId;
  type: MaintenanceTaskType;
  priority: MaintenancePriority;
  entityType: EntityTypeForMaintenance;
  entityId: EntityId;
  title: string;
  reason: string;
  evidenceIds?: EntityId[];
  eventIds: EntityId[];
  suggestedAction: string;
  status: MaintenanceTaskStatus;
  ownership: MaintenanceOwnership;
  createdAt: string;
  dueAt?: string;
  assignedAgent?: string;
  affectedEntityIds: EntityId[];
  /** Deterministic key for queue deduplication */
  dedupeKey: string;
  changeClassification?: ChangeClassification;
  dryRunProposed?: boolean;
  metadata?: Record<string, unknown>;
}

export interface GuideReviewCandidate {
  guideId: EntityId;
  triggers: string[];
  affectedRecommendations: EntityId[];
  newProductCandidates: EntityId[];
  staleEvidence: EntityId[];
  suggestedActions: string[];
  priority: MaintenancePriority;
}

export interface DiscoverySuppression {
  id: EntityId;
  brandId?: EntityId;
  modelKey: string;
  reason: string;
  createdAt: string;
  expiresAt?: string;
  status: "active" | "expired";
}

export interface MaintenanceChange {
  id: EntityId;
  entityType: EntityTypeForMaintenance;
  entityId: EntityId;
  field?: string;
  before: unknown;
  after: unknown;
  reason: string;
  evidenceIds: EntityId[];
  appliedBy: "automation" | "human" | "dry-run";
  appliedAt: string;
  reversible: boolean;
}

export interface MaintenanceSchedule {
  id: string;
  taskType: string;
  scope: string;
  cadence: "hourly" | "daily" | "weekly" | "monthly" | "quarterly" | "event";
  enabled: boolean;
  priority: MaintenancePriority;
  lastRunAt?: string;
  nextRunAt?: string;
  description?: string;
}

export interface EntityImpact {
  entityId: EntityId;
  recommendations: EntityId[];
  guides: EntityId[];
  comparisons: EntityId[];
  alternatives: EntityId[];
  relationships: EntityId[];
  offers: EntityId[];
  reviews: EntityId[];
  finderRelevant: boolean;
  rotationRelevant: boolean;
  searchRelevant: boolean;
  severity: ChangeClassification;
}

export interface SpecChangeCandidate {
  productId: EntityId;
  field: string;
  currentValue: unknown;
  reportedValue: unknown;
  source?: string;
  contextHint?: string;
  classification: ChangeClassification;
  action: string;
}

export interface BrandMonitorResult {
  brandId: EntityId;
  brandName: string;
  sportId?: string;
  newProducts: Array<{ model: string; generation?: string; priority: string }>;
  unchanged: Array<{ productId: EntityId; name: string }>;
  possibleLifecycleChange: Array<{ productId: EntityId; reason: string }>;
  missingOfficialPage: Array<{ productId: EntityId; reason: string }>;
  noAction: Array<{ productId: EntityId }>;
  suppressed: Array<{ model: string; reason: string }>;
}

export interface FreshnessSummary {
  sportId?: string;
  products: Record<FreshnessStatus, number>;
  guides: { current: number; reviewRequired: number };
  comparisons: { current: number; reviewRequired: number };
  offers: { fresh: number; stale: number };
  media: { broken: number };
  recommendations: { fresh: number; stale: number };
  evidence: { fresh: number; stale: number };
  newProductCandidates: number;
  openTasks: Record<MaintenancePriority, number>;
}

export interface MaintenanceJobResult {
  jobId: string;
  jobType: string;
  startedAt: string;
  finishedAt: string;
  dryRun: boolean;
  scope: MaintenanceRunScope;
  entitiesChecked: number;
  events: MaintenanceEvent[];
  tasks: MaintenanceTask[];
  changes: MaintenanceChange[];
  summary: FreshnessSummary;
  reportPath?: string;
  logs: string[];
  materialChanges: boolean;
}

export interface MaintenanceRunScope {
  sport?: string;
  category?: string;
  brand?: string;
  product?: string;
  region?: string;
  limit?: number;
}

export type MaintenanceJobType =
  | "freshness-scan"
  | "brand-monitor"
  | "product-stale"
  | "offers-refresh"
  | "evidence-check"
  | "media-check"
  | "guides-review-due"
  | "content-freshness"
  | "content-claims"
  | "commerce-freshness"
  | "review-maintenance"
  | "full"
  | "qa";

export const FRESHNESS_AGENT_VERSION = "20.0.0";

/** Safe auto-apply change kinds (low risk) */
export const SAFE_AUTO_APPLY_FIELDS = new Set([
  "officialUrl",
  "sourceUrl",
  "media.src",
  "offer.lastChecked",
  "searchIndex",
]);

/** High-impact fields requiring human review */
export const HIGH_IMPACT_FIELDS = new Set([
  "weight",
  "heelStack",
  "forefootStack",
  "drop",
  "lifecycleStatus",
  "plateMaterial",
  "raceLegality",
  "battery",
  "generation",
  "categoryId",
  "stability",
  "terrain",
  "cushionLevel",
]);

/** Recommendation-dependency field → factor hints (category-agnostic keys) */
export const RECOMMENDATION_FIELD_DEPENDENCIES: Record<string, string[]> = {
  weight: ["responsiveness", "tempo", "race"],
  terrain: ["trail", "road"],
  stability: ["stability"],
  drop: ["race", "tempo"],
  heelStack: ["cushioning", "long-run"],
  cushionLevel: ["cushioning", "recovery"],
  plateMaterial: ["race", "tempo"],
};
