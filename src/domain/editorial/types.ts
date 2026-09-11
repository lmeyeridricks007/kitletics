import type {
  EntityId,
  MediaAsset,
  PublishFields,
  SeoFields,
} from "@/domain/shared/types";

export interface ContentSection {
  id: string;
  heading: string;
  body: string;
  /** Internal provenance — not every sentence is footnoted in UI */
  evidenceIds?: EntityId[];
  /** Optional section visual — unique per review page when resolved */
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
}

export type ReviewType = "first-hand-test" | "expert-research" | "hybrid";

export type ProductSource =
  | "purchased-by-kitletics"
  | "purchased-by-reviewer"
  | "provided-by-brand"
  | "loaned-by-brand"
  | "retailer-sample"
  | "other";

/** Structured first-hand testing context — only when personal-test evidence exists */
export interface ReviewTestingContext {
  distanceKm?: number;
  durationDays?: number;
  durationHours?: number;
  surfaces?: string[];
  activities?: string[];
  conditions?: string[];
  runnerProfile?: string;
  comparisonShoes?: string[];
  productSource?: ProductSource;
  notes?: string;
}

export interface Author {
  id: EntityId;
  name: string;
  slug: string;
  title?: string;
  bio: string;
  sportIds: EntityId[];
  expertise: string[];
  image?: MediaAsset;
  socialLinks?: { label: string; url: string }[];
  disclosure?: string;
}

export interface ReviewCriteriaDefinition {
  id: EntityId;
  categoryId: EntityId;
  key: string;
  label: string;
  description: string;
  weight?: number;
}

export interface FAQ {
  id: EntityId;
  question: string;
  answer: string;
  /** Optional entity links for contextual FAQs */
  productId?: EntityId;
  categoryId?: EntityId;
  sportId?: EntityId;
}

export interface ScoreBreakdownItem {
  key: string;
  label: string;
  score: number;
  max?: number;
  note?: string;
}

export interface Review extends PublishFields, SeoFields {
  id: EntityId;
  slug: string;
  productId: EntityId;
  title: string;
  subtitle?: string;
  reviewType: ReviewType;
  verdict: string;
  /** Concise callout under summary — falls back to verdict when omitted */
  bottomLine?: string;
  /**
   * Editorial score 0–100. Prefer aligning with Product.recommendationScore.
   * Display uses product score when present to avoid contradictory numbers.
   */
  score: number;
  summary: string;
  reviewerId?: EntityId;
  /** Free-text assessment method note (research reviews) */
  testingContext?: string;
  /** Structured personal-test fields — only with personal-test Evidence */
  testingDetails?: ReviewTestingContext;
  productSource?: ProductSource;
  editorialDisclosure?: string;
  sections: ContentSection[];
  pros: string[];
  cons: string[];
  whoShouldBuy: string[];
  whoShouldAvoid: string[];
  scoreBreakdown: ScoreBreakdownItem[];
  evidenceIds: EntityId[];
  alternativeProductIds: EntityId[];
  comparisonIds: EntityId[];
  /** Buying guides that teach the decision behind this review's category/job */
  relatedBuyingGuideIds?: EntityId[];
  faqIds: EntityId[];
}

export type AwardType =
  | "best-overall"
  | "best-value"
  | "best-premium"
  | "best-beginner"
  | "best-daily"
  | "best-long-run"
  | "best-race"
  | "best-cushioned"
  | "best-stability"
  | "best-trail"
  | "best-tempo"
  | "best-lightweight"
  | "best-durable"
  | "best-fit"
  | "editors-pick";

export type BestGuideRankingMode = "ranked" | "category-picks";

/** Category shortlist vs focused use-case recommendation page */
export type BestGuideKind = "category" | "use-case";

export interface SelectionCriterion {
  key: string;
  label: string;
  description: string;
  weight?: number;
}

export interface ConsideredProductNote {
  productId: EntityId;
  /** Consumer-facing reason (public). Prefer specific editorial language. */
  reason: string;
  /**
   * Evaluation status for public “Products considered” surfaces.
   * `considered` = evaluated; `shortlisted` = survived screening;
   * `recommended` = guide pick (optional — also implied by recommendations[]);
   * `rejected` / `removed` = evaluated but not selected (consumer-safe reason).
   */
  kind?:
    | "considered"
    | "shortlisted"
    | "recommended"
    | "honorable-mention"
    | "previous-pick"
    | "removed"
    | "rejected";
  /** Internal controlled reason code — never show raw to consumers */
  reasonCode?:
    | "overlap"
    | "previous-generation"
    | "context-mismatch"
    | "niche"
    | "lower-context-fit"
    | "insufficient-evidence"
    | "availability"
    | "value"
    | "redundant-role";
  /** When the product may still be a sensible choice */
  stillConsiderIf?: string;
  /** Closest recommended product for compare / “vs our pick” */
  closestRecommendedProductId?: EntityId;
}

export interface GuideChooseInsteadWhen {
  /** Condition under which another product is better */
  when: string;
  /** Preferred alternative product in this guide (or catalog) */
  productId?: EntityId;
  /** Display hint when productId resolves */
  label?: string;
}

export interface GuideLookForFactor {
  key: string;
  label: string;
  whyItMatters: string;
  importance?: "high" | "medium" | "low";
}

export interface GuideDecisionShortcut {
  /** “If you want…” */
  need: string;
  productId: EntityId;
  reason?: string;
}

export interface BestGuideRecommendation {
  productId: EntityId;
  rank: number;
  /** Controlled award taxonomy key — preferred over free-text badge */
  awardType?: AwardType;
  /** Legacy / display override label when awardType absent */
  badge?: string;
  /** Short blurb for quick picks */
  summary?: string;
  /** Why recommended in this guide context (legacy single prose) */
  whyRecommended?: string;
  /** Legacy alias — used when whyRecommended absent */
  rationale: string;
  /**
   * Guide-specific analysis paragraphs: why this product fits THIS use case.
   * Prefer over generic Product Review pros.
   */
  whyItFits?: string[];
  /** Why this award/rank over close competitors in this guide */
  whyItWon?: string;
  /** Contextual strengths for this use case (not generic review pros) */
  useCaseStrengths?: string[];
  strengths?: string[];
  /** Context-specific trade-offs */
  tradeoffs?: string[];
  compromises?: string[];
  /** Who / which long-run type this pick suits */
  bestForProfiles?: string[];
  /** When this pick is a poor fit for the guide context */
  notIdealFor?: string[];
  whoShouldAvoid?: string[];
  /** Explicit routing to alternatives */
  chooseInsteadWhen?: GuideChooseInsteadWhen[];
  /** Compact decision-table note (e.g. “Easy–steady · Soft · Neutral”) */
  decisionRole?: string;
  /** Relative pace description where safe: easy / steady / tempo / mixed */
  paceCharacter?: string;
  /** Surface / condition notes supported by data */
  worksWellFor?: string[];
  lessSuitedTo?: string[];
  useCaseIds?: EntityId[];
  recommendationId?: EntityId;
  evidenceIds?: EntityId[];
  /** Compact alternative product IDs for "Consider instead" */
  considerInsteadProductIds?: EntityId[];
}

export interface BestGuide extends PublishFields, SeoFields {
  id: EntityId;
  slug: string;
  title: string;
  subtitle?: string;
  shortDescription?: string;
  sportId: EntityId;
  categoryId: EntityId;
  /** Optional multi-sport — defaults to [sportId] when absent */
  sportIds?: EntityId[];
  categoryIds?: EntityId[];
  useCaseIds: EntityId[];
  disciplineIds?: EntityId[];
  rankingMode: BestGuideRankingMode;
  /**
   * `use-case` drives the Use-Case Recommendation layout (criteria panel hero).
   * Defaults to `category` when omitted.
   */
  guideKind?: BestGuideKind;
  intro: string;
  /** Teaching intro: what matters for this decision (before products) */
  whatMattersIntro?: string;
  /** Factor cards: what we look for */
  whatWeLookFor?: GuideLookForFactor[];
  /** Quick take bullets under the hero */
  quickTake?: string[];
  /** “Which should you choose?” shortcuts */
  decisionShortcuts?: GuideDecisionShortcut[];
  methodologySummary?: string;
  selectionMethodology: string;
  selectionCriteria: SelectionCriterion[];
  /**
   * Explicit “Why the criteria change” bullets for use-case guides.
   * Falls back to selectionCriteria labels/descriptions when omitted.
   */
  criteriaChangePoints?: { label: string; explanation: string }[];
  recommendations: BestGuideRecommendation[];
  /**
   * Products genuinely evaluated for this guide’s intent.
   * Required for mature guides — never infer from recommendations.length.
   */
  consideredProductIds?: EntityId[];
  /**
   * Products that survived relevance / data-quality / editorial screening.
   * Should be a subset of consideredProductIds when both are present.
   */
  shortlistedProductIds?: EntityId[];
  /** Annotated notes for considered / shortlisted / rejected products */
  consideredProducts?: ConsideredProductNote[];
  /** Product IDs for comparison table — specs loaded via repository */
  comparisonProductIds: EntityId[];
  /**
   * When true, a small recommendation set is intentional (narrow intent).
   * Suppresses thin-guide QA density warnings.
   */
  intentionallyNarrow?: boolean;
  buyingAdvice: string;
  howToChooseSections?: ContentSection[];
  faqIds: EntityId[];
  authorId?: EntityId;
  evidenceIds?: EntityId[];
  relatedGuideIds?: EntityId[];
  relatedBuyingGuideIds?: EntityId[];
  relatedToolSlugs?: string[];
  /** Editorial /compare/{slug} pages worth linking from this Best Guide */
  relatedComparisonIds?: EntityId[];
  /** Use-case shortcuts → published guides or category filters */
  useCaseShortcuts?: {
    useCaseId: EntityId;
    label: string;
    href: string;
  }[];
  /** Optional dedicated hub card image (path under /public) */
  hubImageSrc?: string;
  hubImageAlt?: string;
  nextReviewAt?: string;
}

export interface ComparisonCriterion {
  key: string;
  label: string;
  /** Spec key or custom criterion */
  specKey?: string;
  winnerProductId?: EntityId;
  notes?: string;
}

export interface ComparisonUseCasePick {
  useCaseId: EntityId;
  productId: EntityId;
  rationale: string;
}

export type ComparisonType = "editorial" | "generated" | "hybrid";

export interface ComparisonKeyDifference {
  key?: string;
  label: string;
  /** Per-product short impact labels, keyed by productId */
  productImpacts: { productId: EntityId; impact: string }[];
  explanation: string;
  evidenceIds?: EntityId[];
}

export interface ComparisonChooseReason {
  productId: EntityId;
  context?: string;
  reason: string;
  evidenceIds?: EntityId[];
}

export interface Comparison extends PublishFields, SeoFields {
  id: EntityId;
  slug: string;
  title: string;
  shortDescription?: string;
  productIds: EntityId[];
  categoryId?: EntityId;
  comparisonType: ComparisonType;
  summary: string;
  verdict: string;
  winnerProductId?: EntityId;
  winnerReason?: string;
  criteria: ComparisonCriterion[];
  /** Prefer this name; aliases recommendationsByUseCase historically */
  recommendationsByUseCase: ComparisonUseCasePick[];
  keyDifferences?: ComparisonKeyDifference[];
  chooseProductReasons?: ComparisonChooseReason[];
  editorialSections?: ContentSection[];
  evidenceIds?: EntityId[];
  faqIds: EntityId[];
  /** Same-family generation comparison */
  isGenerationComparison?: boolean;
  upgradeAdvice?: {
    upgradeIf: string[];
    keepOlderIf: string[];
  };
}

export interface BuyingGuide extends PublishFields, SeoFields {
  id: EntityId;
  slug: string;
  title: string;
  subtitle?: string;
  shortDescription?: string;
  sportId: EntityId;
  categoryId?: EntityId;
  relatedProductIds: EntityId[];
  relatedUseCaseIds: EntityId[];
  sections: ContentSection[];
  quickAnswer?: string;
  faqIds: EntityId[];
  authorId?: EntityId;
  relatedBestGuideIds?: EntityId[];
  relatedToolSlugs?: string[];
  /** Editorial comparisons that continue this guide’s decision flow */
  relatedComparisonIds?: EntityId[];
  /** Peer buying guides (same topic family) — deepen understanding, not rankings */
  relatedGuideIds?: EntityId[];
  /**
   * Editorial classification for Guides Hub grouping.
   * Prefer over inferring from title.
   */
  guideType?:
    | "buying"
    | "explainer"
    | "comparison"
    | "setup"
    | "decision"
    | "technical";
  /** Normalized GuideTopic ids */
  topicIds?: EntityId[];
  /** Eligible for hub featured slot when quality gate passes */
  featured?: boolean;
  /** Eligible for Start Here when quality gate passes */
  startHere?: boolean;
  /** Lower = higher editorial priority on hubs */
  priority?: number;
  /** Optional dedicated hub card image (path under /public) */
  hubImageSrc?: string;
  hubImageAlt?: string;
}

/** Role importance in a gear setup — not a product quality ranking. */
export type GearSetupItemImportance =
  | "required"
  | "recommended"
  | "optional"
  | "future-addition";

export interface GearSetupItem {
  productId: EntityId;
  /** Consumer-facing role label, e.g. "Race shoes" */
  role: string;
  /** Uppercase kit-row label, e.g. "RACE SHOES" */
  roleLabel?: string;
  importance?: GearSetupItemImportance;
  /** Why this product is in this setup */
  rationale?: string;
  /** 2–4 short inclusion reasons for the kit row */
  strengths?: string[];
  notes?: string;
  /** @deprecated Prefer importance — kept for existing content */
  optional?: boolean;
  alternativeProductIds?: EntityId[];
  evidenceIds?: EntityId[];
  /** System explanation — why this component exists in the kit */
  whyNeeded?: string;
  /** What job it does relative to other kit components */
  systemRole?: string;
  /** Honest trade-offs for this pick in this scenario */
  tradeOffs?: string;
  /** When this component can be left out */
  canOmit?: string;
  /** Cheaper path that still covers the role (product or plain note) */
  cheaperAlternative?: string;
  cheaperAlternativeProductId?: EntityId;
  /** Sensible upgrade when budget/priority grows */
  upgradePath?: string;
  /** Pairing / fit constraints with other kit items */
  compatibilityNotes?: string;
}

export interface GearSetupBudgetTier {
  label: string;
  note: string;
  /** Approximate ceiling only when live offers support the claim */
  approxMax?: number;
  currency?: string;
}

export interface GearSetupNextItem {
  productId: EntityId;
  role: string;
  roleLabel?: string;
  notes?: string;
  /** e.g. training / recovery add-on */
  contextLabel?: string;
}

export type GearSetupEditorialType = "editorial" | "generated" | "hybrid";

export interface GearSetup extends PublishFields, SeoFields {
  id: EntityId;
  slug: string;
  /** Extra path slugs that redirect to this setup */
  slugAliases?: string[];
  sportId: EntityId;
  disciplineId?: EntityId;
  title: string;
  description: string;
  /**
   * Concrete scenario this kit is for (e.g. first marathon training block).
   * Required for READY editorial kits — not a generic affiliate collection.
   */
  scenario?: string;
  useCaseIds: EntityId[];
  budgetRange?: { min?: number; max?: number; currency: string };
  /** Value tiers only when product + pricing evidence supports them */
  budgetTiers?: GearSetupBudgetTier[];
  /** Kit-level pairing / sizing / protocol constraints */
  compatibilityNotes?: string[];
  items: GearSetupItem[];
  nextItems?: GearSetupNextItem[];
  /** Related GearSetup ids for "Make it your own" */
  variantSetupIds?: EntityId[];
  relatedGuideIds?: EntityId[];
  relatedBestGuideIds?: EntityId[];
  finderToolSlug?: string;
  builderToolSlug?: string;
  howWeChooseHref?: string;
  eyebrow?: string;
  heroImageSrc?: string;
  whyTitle?: string;
  whyReasons?: string[];
  summaryFocus?: { title: string; detail: string }[];
  curatedBy?: string;
  nextReviewAt?: string;
  checklist?: string[];
  setupType?: GearSetupEditorialType;
  experienceLevel?: string;
  goalLabel?: string;
}
