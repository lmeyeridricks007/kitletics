/**
 * Kitletics domain barrel.
 * Prefer importing from domain/<module>/types for tree-shaking clarity.
 */

export type {
  EntityId,
  PublishStatus,
  PublishFields,
  SeoFields,
  MediaAsset,
  RegionCode,
  RegionContext,
} from "@/domain/shared/types";

export type {
  Sport,
  Discipline,
  Activity,
  ProductCategory,
  ProductSubcategory,
  UseCase,
} from "@/domain/sports/types";

export type {
  ProductLifecycleStatus,
  ExperienceLevel,
  SpecValueType,
  SpecificationDefinition,
  SpecValue,
  Brand,
  ProductFamily,
  ProductVariant,
  Product,
} from "@/domain/products/types";

export type {
  RecommendationFactor,
  Recommendation,
  EvidenceType,
  EvidenceConfidence,
  PersonalTestEvidenceFields,
  Evidence,
  AlternativeRelationshipType,
  AlternativeRelationship,
} from "@/domain/recommendations/types";

export type {
  AffiliateNetwork,
  Retailer,
  OfferAvailability,
  Offer,
} from "@/domain/commerce/types";

export type {
  ContentSection,
  FAQ,
  ScoreBreakdownItem,
  ReviewType,
  ProductSource,
  ReviewTestingContext,
  Author,
  ReviewCriteriaDefinition,
  Review,
  AwardType,
  BestGuideRankingMode,
  SelectionCriterion,
  ConsideredProductNote,
  BestGuideRecommendation,
  BestGuide,
  ComparisonCriterion,
  ComparisonUseCasePick,
  ComparisonType,
  ComparisonKeyDifference,
  ComparisonChooseReason,
  Comparison,
  BuyingGuide,
  GearSetupItem,
  GearSetupItemImportance,
  GearSetupNextItem,
  GearSetupEditorialType,
  GearSetup,
} from "@/domain/editorial/types";

export type { ToolType, Tool } from "@/domain/tools/types";
