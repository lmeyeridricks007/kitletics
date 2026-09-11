import type { EntityId, RegionCode } from "@/domain/shared/types";
import type { ProductLifecycleStatus, SpecValue } from "@/domain/products/types";

export type OnboardingMode = "explicit" | "brand-discovery" | "market-discovery" | "refresh";

export type OnboardingSessionStatus =
  | "created"
  | "researching"
  | "needs-review"
  | "blocked"
  | "ready"
  | "approved"
  | "published"
  | "rejected";

export type StagingEntityStatus =
  | "candidate"
  | "needs-review"
  | "blocked"
  | "approved"
  | "rejected";

export type ResearchFindingStatus =
  | "candidate"
  | "verified"
  | "conflicting"
  | "rejected";

export type SourceType =
  | "manufacturer"
  | "manufacturer-documentation"
  | "manufacturer-news"
  | "retailer"
  | "independent-review"
  | "lab"
  | "editorial"
  | "other";

export type AuthorityLevel = "primary" | "secondary" | "supporting" | "untrusted";

export type ConfidenceLevel = "high" | "medium" | "low";

export type IdentityMatchKind =
  | "exact"
  | "probable"
  | "ambiguous"
  | "new";

export type OnboardingErrorClass =
  | "TRANSIENT"
  | "VALIDATION"
  | "SOURCE_CONFLICT"
  | "MISSING_DATA"
  | "AMBIGUOUS_IDENTITY"
  | "POLICY"
  | "MANUAL_REVIEW_REQUIRED";

export type DiscoveryPriority = "HIGH" | "MEDIUM" | "LOW";

export interface ResearchSource {
  id: EntityId;
  url: string;
  domain: string;
  sourceType: SourceType;
  title?: string;
  publisher?: string;
  publishedAt?: string;
  retrievedAt: string;
  authorityLevel: AuthorityLevel;
  productIds: EntityId[];
  status: "active" | "rejected" | "stale";
}

export interface ResearchFinding {
  id: EntityId;
  onboardingSessionId: EntityId;
  productId?: EntityId;
  field: string;
  rawValue: string | number | boolean | null;
  normalizedValue?: SpecValue;
  unit?: string;
  sourceId: EntityId;
  confidence: ConfidenceLevel;
  context?: string;
  notes?: string;
  status: ResearchFindingStatus;
}

export interface SourceConflict {
  id: EntityId;
  onboardingSessionId: EntityId;
  field: string;
  values: Array<{
    value: SpecValue;
    sourceId: EntityId;
    context?: string;
  }>;
  contextDifference?: string;
  recommendedResolution?: string;
  status: "open" | "resolved" | "accepted-context" | "rejected";
}

export interface ProductIdentityCandidate {
  brandName: string;
  brandId?: EntityId;
  modelName: string;
  fullName: string;
  familyName?: string;
  familyId?: EntityId;
  generation?: string;
  categoryId?: EntityId;
  categorySlug?: string;
  sportId?: EntityId;
  aliases: string[];
  officialUrl?: string;
  lifecycleHint?: ProductLifecycleStatus;
  externalIds?: {
    gtin?: string;
    ean?: string;
    upc?: string;
    mpn?: string;
    asin?: string;
  };
}

export interface IdentityResolution {
  kind: IdentityMatchKind;
  existingProductId?: EntityId;
  existingSlug?: string;
  confidence: ConfidenceLevel;
  reasons: string[];
  candidate: ProductIdentityCandidate;
}

export interface StagedProductDraft {
  id: EntityId;
  slug: string;
  brandId: EntityId;
  familyId?: EntityId;
  generation?: string;
  name: string;
  fullName: string;
  shortDescription: string;
  lifecycleStatus: ProductLifecycleStatus;
  sportIds: EntityId[];
  disciplineIds: EntityId[];
  categoryId: EntityId;
  subcategoryIds: EntityId[];
  useCaseIds: EntityId[];
  specifications: Record<string, SpecValue>;
  strengths: string[];
  weaknesses: string[];
  experienceLevels: string[];
  evidenceIds: EntityId[];
  aliases: string[];
  officialUrl?: string;
  releaseDate?: string;
  announcementDate?: string;
  externalIds?: ProductIdentityCandidate["externalIds"];
  status: StagingEntityStatus;
}

export interface StagedEvidenceDraft {
  id: EntityId;
  type: string;
  title: string;
  summary: string;
  sourceUrl?: string;
  sourceId?: EntityId;
  productId?: EntityId;
  confidence: ConfidenceLevel;
  status: StagingEntityStatus;
}

export interface StagedMediaDraft {
  id: EntityId;
  productId: EntityId;
  src: string;
  alt: string;
  sourceUrl?: string;
  source?: string;
  usageType: "hero" | "side" | "detail" | "other";
  width?: number;
  height?: number;
  licence?: string;
  verifiedAt?: string;
  status: StagingEntityStatus;
  rejectionReason?: string;
  /** Fix 77 — ingest hygiene; never rejects licensed photography by itself. */
  ingestLevel?: "ok" | "warn" | "error";
  ingestReasons?: string[];
}

export interface RecommendationCandidateDraft {
  id: EntityId;
  productId: EntityId;
  useCaseId: EntityId;
  score?: number;
  confidence: ConfidenceLevel;
  explanation: string;
  strengths: string[];
  compromises: string[];
  evidenceIds: EntityId[];
  status: StagingEntityStatus;
  outlierFlags: string[];
}

export interface RelationshipCandidateDraft {
  id: EntityId;
  sourceProductId: EntityId;
  targetProductId: EntityId;
  type: string;
  reason: string;
  priority: DiscoveryPriority;
  status: StagingEntityStatus;
}

export interface CommercialCandidateDraft {
  id: EntityId;
  productId: EntityId;
  retailerId?: EntityId;
  retailerName: string;
  region: RegionCode;
  url: string;
  price?: number;
  currency?: string;
  availability?: string;
  externalProductId?: string;
  status: StagingEntityStatus;
}

export interface EditorialOpportunityDraft {
  id: EntityId;
  kind:
    | "review"
    | "comparison"
    | "best-guide-review"
    | "buying-guide"
    | "alternatives"
    | "family-update";
  productIds: EntityId[];
  title: string;
  reason: string;
  priority: DiscoveryPriority;
  suggestedAction: string;
  status: StagingEntityStatus;
}

export interface ContentImpactItem {
  contentId: string;
  contentType: string;
  reason: string;
  severity: DiscoveryPriority;
  suggestedAction: string;
}

export interface SpecificationDefinitionCandidate {
  id: EntityId;
  categoryId: EntityId;
  proposedKey: string;
  label: string;
  rationale: string;
  exampleValues: string[];
  status: StagingEntityStatus;
}

export interface OnboardingQuality {
  identity: ConfidenceLevel;
  specsVerified: number;
  specsUnknown: number;
  specsConflicting: number;
  evidenceCount: number;
  mediaAccepted: number;
  mediaFlagged: number;
  recommendationCandidates: number;
  relationshipCandidates: number;
  commercialCandidates: number;
  /** Review lifecycle (Prompt 19 ↔ ProductReviewAgent) */
  reviewCoverage?: string;
  reviewReadinessScore?: number;
  reviewAction?: string;
  reviewRequiredForPublish?: boolean;
  blockers: string[];
  reviewReasons: string[];
}

export interface OnboardingLogEntry {
  at: string;
  stage: string;
  level: "info" | "warn" | "error";
  message: string;
  errorClass?: OnboardingErrorClass;
}

export interface ProductOnboardingSession {
  id: EntityId;
  mode: OnboardingMode;
  agentVersion: string;
  promptVersion: string;

  requestedBrand?: string;
  requestedModel?: string;
  requestedSport?: string;
  requestedCategory?: string;
  requestedProductId?: EntityId;

  dryRun: boolean;
  limit?: number;

  identity?: IdentityResolution;
  candidateProduct?: StagedProductDraft;

  sources: ResearchSource[];
  findings: ResearchFinding[];
  conflicts: SourceConflict[];

  evidence: StagedEvidenceDraft[];
  media: StagedMediaDraft[];
  recommendations: RecommendationCandidateDraft[];
  relationships: RelationshipCandidateDraft[];
  commercial: CommercialCandidateDraft[];
  editorialOpportunities: EditorialOpportunityDraft[];
  specDefinitionCandidates: SpecificationDefinitionCandidate[];
  contentImpact: ContentImpactItem[];

  discoveryCandidates?: DiscoveryCandidate[];

  quality: OnboardingQuality;
  status: OnboardingSessionStatus;
  logs: OnboardingLogEntry[];

  createdAt: string;
  updatedAt: string;
}

export interface DiscoveryCandidate {
  brandName: string;
  modelName: string;
  fullName: string;
  familyName?: string;
  generation?: string;
  categorySlug?: string;
  officialUrl?: string;
  priority: DiscoveryPriority;
  reason: string;
  existingProductId?: EntityId;
  kind: "new" | "new-generation" | "possibly-superseded" | "ambiguous" | "existing";
}

export interface ProductResearchConfig {
  categoryId: EntityId;
  categorySlug: string;
  sportId: EntityId;
  identityFields: string[];
  requiredSpecs: string[];
  importantSpecs: string[];
  optionalSpecs: string[];
  recommendationContexts: string[];
  mediaRequirements: Array<"hero" | "side" | "detail">;
  trustedSourcePatterns: string[];
  /** Soft numeric bounds for outlier detection — not hard physical laws */
  outlierBounds?: Record<string, { min?: number; max?: number; unit?: string }>;
}

/** Provider supplies researched facts — never invents verified Product data */
export interface ResearchProviderInput {
  brand: string;
  model: string;
  categorySlug?: string;
  officialUrl?: string;
}

export interface ResearchProviderResult {
  sources: Omit<ResearchSource, "id" | "productIds" | "status">[];
  facts: Array<{
    field: string;
    rawValue: string | number | boolean | null;
    unit?: string;
    sourceUrl: string;
    confidence: ConfidenceLevel;
    context?: string;
    notes?: string;
  }>;
  media: Array<{
    src: string;
    alt: string;
    sourceUrl?: string;
    usageType: "hero" | "side" | "detail" | "other";
    width?: number;
    height?: number;
    generationHint?: string;
  }>;
  identityHints?: Partial<ProductIdentityCandidate>;
}

export interface ResearchProvider {
  id: string;
  research(input: ResearchProviderInput): Promise<ResearchProviderResult>;
}

export const ONBOARDING_AGENT_VERSION = "1.0.0";
export const ONBOARDING_PROMPT_VERSION = "19.0.0";
