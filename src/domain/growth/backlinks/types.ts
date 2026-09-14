/**
 * Internal backlink / digital-PR opportunity model.
 * Authority fields that come from Ahrefs/Semrush/Moz/Majestic MUST set metricSource.
 * Never invent DA/DR or contact emails.
 */

export const OPPORTUNITY_TYPES = [
  "JOURNALIST_SOURCE_REQUEST",
  "DIGITAL_PR",
  "RESOURCE_PAGE",
  "DATA_CITATION",
  "BROKEN_LINK_REPLACEMENT",
  "COMPETITOR_LINK_GAP",
  "ROUNDUP_INCLUSION",
  "EXPERT_QUOTE",
  "REVIEW_CITATION",
  "TOOL_CITATION",
  "DATABASE_CITATION",
  "RESEARCH_CITATION",
  "RUNNING_CLUB",
  "COACH_RESOURCE",
  "UNIVERSITY_RESEARCH",
  "BRAND_PR",
  "RETAILER_RESOURCE",
  "NEWSLETTER",
  "PODCAST",
  "COMMUNITY_RESOURCE",
  "GUEST_CONTRIBUTION",
  "FORUM_THREAD",
  "REDDIT_THREAD",
  "Q_AND_A_THREAD",
  "COMMUNITY_DISCUSSION",
  "UNLINKED_MENTION",
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const PROSPECT_CATEGORIES = [
  "RUNNING_MEDIA",
  "FITNESS_MEDIA",
  "HYROX",
  "MAINSTREAM_MEDIA",
  "DATA_RESEARCH",
  "COMMUNITY",
  "BRANDS",
  "RETAILERS",
  "NEWSLETTERS",
  "PODCASTS",
] as const;

export type ProspectCategory = (typeof PROSPECT_CATEGORIES)[number];

export const CONTACT_ROLES = [
  "editor",
  "gear_editor",
  "running_editor",
  "commerce_editor",
  "sports_editor",
  "data_journalist",
  "freelance_writer",
  "newsletter_editor",
  "site_owner",
  "coach",
  "pr_contact",
  "unknown",
] as const;

export type ContactRole = (typeof CONTACT_ROLES)[number];

export const CONTACT_STATUSES = [
  "CONFIRMED",
  "CONTACT_UNKNOWN",
  "UNAVAILABLE",
] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_METHODS = [
  "PUBLIC_EMAIL",
  "CONTACT_FORM",
  "EDITORIAL_FORM",
  "SUBMISSION_FORM",
  "SOURCE_REQUEST",
  "LINKEDIN_PROFILE",
  "PUBLIC_SOCIAL_DM",
  "AUTHOR_CONTACT_PAGE",
  "NEWSLETTER_REPLY",
  "REDDIT_THREAD",
  "FORUM_THREAD",
  "COMMUNITY_POST",
  "PODCAST_GUEST_FORM",
  "TIP_FORM",
  "UNKNOWN",
  "CONTACT_NOT_EDITORIAL",
] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const ACTION_STATUSES = [
  "DISCOVERED",
  "CONTACT_RESEARCH",
  "CONTACT_FOUND",
  "MESSAGE_READY",
  "READY_TO_CONTACT",
  "CONTACTED",
  "FOLLOW_UP_DUE",
  "RESPONDED",
  "LINK_EARNED",
  "DECLINED",
  "NOT_ACTIONABLE",
] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];

export const FORUM_URGENCY = ["RESPOND_TODAY", "RESPOND_THIS_WEEK", "MONITOR", "SKIP"] as const;
export type ForumUrgency = (typeof FORUM_URGENCY)[number];

export const OPPORTUNITY_STATUSES = [
  "CANDIDATE",
  "APPROVED",
  "DEFERRED",
  "REJECTED",
] as const;

export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export const PRIORITIES = ["MUST_PURSUE", "HIGH", "MEDIUM", "LOW"] as const;
export type PriorityBand = (typeof PRIORITIES)[number];

export const FORUM_OPPORTUNITY_TYPES = [
  "FORUM_THREAD",
  "REDDIT_THREAD",
  "Q_AND_A_THREAD",
  "COMMUNITY_DISCUSSION",
] as const;
export type ForumOpportunityType = (typeof FORUM_OPPORTUNITY_TYPES)[number];

export const LINK_RECOMMENDATIONS = [
  "LINK_RECOMMENDED",
  "LINK_OPTIONAL",
  "NO_LINK",
] as const;
export type LinkRecommendation = (typeof LINK_RECOMMENDATIONS)[number];

export const COMMUNITY_RULES_STATUSES = ["KNOWN", "RULES_UNKNOWN"] as const;
export type CommunityRulesStatus = (typeof COMMUNITY_RULES_STATUSES)[number];

export const SELF_PROMOTION_POLICIES = [
  "UNKNOWN",
  "FORBIDDEN",
  "RESOURCE_OK",
  "DISCLOSURE_REQUIRED",
  "ALLOWED",
] as const;
export type SelfPromotionPolicy = (typeof SELF_PROMOTION_POLICIES)[number];

export const COMMUNITY_PLATFORMS = [
  "reddit",
  "forum",
  "facebook",
  "discord",
  "qa",
  "other",
] as const;
export type CommunityPlatform = (typeof COMMUNITY_PLATFORMS)[number];

export const OUTREACH_STATUSES = [
  "not_contacted",
  "draft_ready",
  "contacted",
  "follow_up_due",
  "responded",
  "interested",
  "declined",
  "link_earned",
  "mention_earned",
  "no_response",
] as const;

export type OutreachStatus = (typeof OUTREACH_STATUSES)[number];

export const RESPONSE_STATUSES = [
  "none",
  "replied",
  "interested",
  "declined",
  "ooo",
] as const;

export type ResponseStatus = (typeof RESPONSE_STATUSES)[number];

export const RISK_BANDS = ["SAFE", "REVIEW", "AVOID"] as const;
export type RiskBand = (typeof RISK_BANDS)[number];

export const LINK_TYPES = [
  "editorial",
  "resource",
  "mention",
  "image",
  "redirect",
  "unknown",
] as const;
export type LinkType = (typeof LINK_TYPES)[number];

export const EARNED_LINK_STATUSES = [
  "LIVE",
  "REMOVED",
  "CHANGED",
  "REDIRECTED",
  "UNVERIFIED",
] as const;
export type EarnedLinkStatus = (typeof EARNED_LINK_STATUSES)[number];

export const ASSET_TYPES = [
  "database",
  "tool",
  "best_guide",
  "buying_guide",
  "comparison",
  "review",
  "brand_hub",
  "category_hub",
  "research",
  "methodology",
] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const ASSET_STATUSES = ["live", "planned"] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const METRIC_SOURCES = [
  "editorial_judgment",
  "ahrefs",
  "semrush",
  "moz",
  "majestic",
  "manual_import",
  "unknown",
] as const;
export type MetricSource = (typeof METRIC_SOURCES)[number];

export const COMPETITOR_INTENTS = [
  "review_citation",
  "resource_page",
  "data_citation",
  "comparison",
  "best_guide",
  "tool",
  "statistics",
  "expert_quote",
  "news_coverage",
  "brand_mention",
  "roundup",
  "unknown",
] as const;
export type CompetitorIntent = (typeof COMPETITOR_INTENTS)[number];

export const SOURCE_REQUEST_PLATFORMS = [
  "HARO",
  "Qwoted",
  "Featured",
  "SourceBottle",
  "SourceOfSources",
  "manual",
  "other",
] as const;
export type SourceRequestPlatform = (typeof SOURCE_REQUEST_PLATFORMS)[number];

export const CAMPAIGN_STATUSES = [
  "draft",
  "active",
  "paused",
  "planned",
  "complete",
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const RESEARCH_IDEA_STATUSES = [
  "idea",
  "needs_data",
  "computable",
  "ready_to_pitch",
  "published",
  "parked",
] as const;
export type ResearchIdeaStatus = (typeof RESEARCH_IDEA_STATUSES)[number];

export interface ScoreWeights {
  relevance: number;
  authority: number;
  assetFit: number;
  likelihood: number;
  editorialQuality: number;
  relationship: number;
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  relevance: 0.3,
  authority: 0.2,
  assetFit: 0.2,
  likelihood: 0.15,
  editorialQuality: 0.1,
  relationship: 0.05,
};

/** Outreach-agent / forum scoring. Does not replace DEFAULT_SCORE_WEIGHTS (seed CRM). */
export interface OutreachScoreWeights {
  relevance: number;
  assetFit: number;
  likelihood: number;
  authority: number;
  helpfulness: number;
  relationship: number;
}

export const DEFAULT_OUTREACH_SCORE_WEIGHTS: OutreachScoreWeights = {
  relevance: 0.25,
  assetFit: 0.2,
  likelihood: 0.15,
  authority: 0.15,
  helpfulness: 0.15,
  relationship: 0.1,
};

export const ENGAGEMENT_GATES = {
  minHelpfulness: 70,
  minCommunityFit: 70,
  maxSpamRisk: 40,
} as const;

/** Fraction of spamRisk subtracted from the weighted outreach score. */
export const OUTREACH_SPAM_PENALTY = 0.4;

export interface ScoreBreakdown {
  relevance: number;
  authority: number;
  assetFit: number;
  likelihood: number;
  editorialQuality: number;
  relationship: number;
  overall: number;
  band: PriorityBand;
  reasons: string[];
}

export interface OutreachScoreBreakdown extends ScoreBreakdown {
  helpfulness: number;
  spamRisk: number;
  communityFit: number;
  linkNecessity: number;
  responseUrgency: number;
}

export interface LinkableAsset {
  assetId: string;
  title: string;
  url: string;
  assetType: AssetType;
  topics: string[];
  sport: string;
  audience: string[];
  linkabilityScore: number;
  dataDriven: boolean;
  journalistFriendly: boolean;
  consumerFriendly: boolean;
  researchFriendly: boolean;
  bestPitchAngles: string[];
  markets: string[];
  languages: string[];
  status: AssetStatus;
  commercialValue: number;
  organicOpportunity: number;
  journalistFit: number;
  communityFit: number;
  promoteRank: number;
}

export interface CommunityPolicy {
  id: string;
  community: string;
  url: string;
  rulesUrl?: string;
  platform: CommunityPlatform;
  selfPromotionPolicy: SelfPromotionPolicy;
  linkPolicy: string;
  accountAgeRequirements: string;
  karmaRequirements: string;
  commercialDisclosureRules: string;
  rulesStatus: CommunityRulesStatus;
  notes: string;
}

export interface CommunityEngagement {
  id: string;
  communityId: string;
  threadUrl?: string;
  opportunityId?: string;
  at: string;
  outcome: "drafted" | "posted_human" | "rejected" | "earned_mention" | "removed";
  notes?: string;
}

export interface ForumThreadRecord {
  communityId: string;
  community: string;
  url: string;
  thread?: string;
  subreddit?: string;
  threadAgeHours?: number;
  threadDate?: string;
  upvotes?: number;
  commentCount?: number;
  questionIntent: string;
  existingAnswers?: string;
  selfPromoRisk: number;
  linkPolicy: string;
  suggestedResponse: string;
  recommendedAssetId: string;
  forumUrgency?: ForumUrgency;
}

export interface BacklinkProspect {
  id: string;
  name: string;
  domain: string;
  homepageUrl: string;
  category: ProspectCategory;
  country: string;
  language: string;
  market: string;
  whyRelevant: string;
  contactStatus: ContactStatus;
  contactName?: string;
  contactRole: ContactRole;
  contactEmail?: string;
  contactUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
  contactSource?: string;
  notes?: string;
  competitor?: boolean;
}

export interface BacklinkOpportunity {
  id: string;
  prospectId: string;
  siteName: string;
  domain: string;
  url: string;
  opportunityType: OpportunityType;
  contactName?: string;
  contactRole: ContactRole;
  contactEmail?: string;
  contactUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
  country: string;
  language: string;
  market: string;
  topic: string;
  sport: string;
  subtopic?: string;
  authorityScore: number;
  trafficEstimate?: number;
  relevanceScore: number;
  likelihoodScore: number;
  assetFitScore: number;
  relationshipScore: number;
  editorialQualityScore: number;
  overallScore: number;
  scoreReasons: string[];
  targetAssetId: string;
  targetUrl: string;
  recommendedAnchorContext: string;
  pitchAngle: string;
  whyTheyMightLink: string;
  whyThisSite: string;
  whyThisAsset: string;
  whyThisAngle: string;
  evidence: string;
  risk: RiskBand;
  riskReasons: string[];
  sourceType:
    | "seed"
    | "manual"
    | "csv_import"
    | "competitor_gap"
    | "query_research"
    | "source_request"
    | "research_idea"
    | "weekly_page"
    | "weekly_request"
    | "outreach_agent"
    | "forum_thread"
    | "unlinked_mention";
  helpfulnessScore?: number;
  linkNecessityScore?: number;
  spamRiskScore?: number;
  communityFitScore?: number;
  responseUrgencyScore?: number;
  linkRecommendation?: LinkRecommendation;
  linkRecommendationReason?: string;
  communityId?: string;
  communityRulesStatus?: CommunityRulesStatus;
  forumThread?: ForumThreadRecord;
  suggestedResponse?: string;
  nextAction?: string;
  contactMethod?: ContactMethod;
  contactSourceUrl?: string;
  contactVerifiedAt?: string;
  publicAssetUrl?: string;
  suggestedPlacement?: string;
  outreachSubject?: string;
  outreachMessage?: string;
  followUpMessage?: string;
  actionStatus?: ActionStatus;
  applicationUrl?: string;
  applicationType?: string;
  applicationRequirements?: string;
  applicationDeadline?: string;
  applicationCost?: string;
  accountRequired?: boolean;
  editorialFit?: "editorial" | "not_editorial" | "unknown";
  sourceUrl?: string;
  discoveredAt: string;
  lastCheckedAt?: string;
  status: OpportunityStatus;
  priority: PriorityBand;
  owner?: string;
  notes?: string;
  outreachStatus: OutreachStatus;
  firstContactedAt?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  followUpCount?: number;
  responseStatus: ResponseStatus;
  campaignId?: string;
  competitorTargetUrl?: string;
  competitorIntent?: CompetitorIntent;
  importedAuthority?: number;
  metricSource: MetricSource;
  earnedLinkUrl?: string;
  earnedLinkTarget?: string;
  earnedAnchor?: string;
  linkType?: LinkType;
  nofollow?: boolean;
  sponsored?: boolean;
  ugc?: boolean;
}

export interface JournalistRecord {
  id: string;
  name: string;
  publication: string;
  domain?: string;
  role: ContactRole;
  topics: string[];
  recentCoverage?: string;
  country: string;
  language: string;
  contactStatus: ContactStatus;
  contactMethod?: string;
  contactEmail?: string;
  contactSource?: string;
  relevantAssetIds: string[];
  lastContactedAt?: string;
  relationshipStatus: "none" | "warm" | "active" | "cold";
  notes?: string;
}

export interface SourceRequest {
  id: string;
  platform: SourceRequestPlatform;
  requestTitle: string;
  journalist?: string;
  publication?: string;
  deadline?: string;
  topic: string;
  requirements: string;
  opportunityScore: number;
  recommendedAssetId?: string;
  suggestedResponseAngle: string;
  supportingData?: string;
  suggestedResponse?: string;
  status: "new" | "drafting" | "submitted" | "won" | "passed" | "expired";
  sourceUrl?: string;
}

export interface OutreachCampaign {
  id: string;
  name: string;
  assetId: string;
  angle: string;
  audience: string;
  market: string;
  startDate?: string;
  endDate?: string;
  prospectIds: string[];
  opportunityIds: string[];
  status: CampaignStatus;
}

export interface EarnedLink {
  id: string;
  sourceDomain: string;
  sourceUrl: string;
  targetUrl: string;
  anchor?: string;
  firstSeen: string;
  lastChecked?: string;
  linkType: LinkType;
  nofollow: boolean;
  sponsored: boolean;
  ugc: boolean;
  status: EarnedLinkStatus;
  opportunityId?: string;
  notes?: string;
}

export interface ResearchIdea {
  id: string;
  headline: string;
  datasetRequired: string;
  coverage?: string;
  newsworthiness: number;
  seasonality?: string;
  targetPublications: string[];
  targetJournalistIds: string[];
  targetAssetId: string;
  status: ResearchIdeaStatus;
  findingSummary?: string;
  findingProven: boolean;
}

export interface DiscoveryQuery {
  id: string;
  query: string;
  intent: string;
  recommendedAssetId?: string;
}

export interface OutreachDraft {
  subject: string;
  opening: string;
  whyRelevant: string;
  assetPitch: string;
  evidence: string;
  cta: string;
  body: string;
  followUp?: string;
}

export interface GrowthSettings {
  scoreWeights: ScoreWeights;
  outreachScoreWeights?: OutreachScoreWeights;
  competitorDomains: string[];
  followUpDays: number;
  maxFollowUps: number;
}

export interface WeeklyIngestCounts {
  competitor: number;
  requests: number;
  pages: number;
  skippedDuplicates: number;
}

export interface WeeklyLearningBucket {
  key: string;
  contacted: number;
  responses: number;
  earned: number;
  declined: number;
  /** Present only when contacted >= LEARNING_MIN_SAMPLE. */
  responseRate?: number;
  earnedRate?: number;
}

export interface WeeklyRunRecord {
  id: string;
  ranAt: string;
  since: string;
  ingested: WeeklyIngestCounts;
  newMustPursueIds: string[];
  newHighIds: string[];
  followUpDueIds: string[];
  earnedIds: string[];
  lostIds: string[];
  liveAssetIds: string[];
  newLiveAssetIds: string[];
  forumToRespondIds?: string[];
  journalistDeadlineIds?: string[];
  mentionIds?: string[];
  notes: string[];
}

export interface BacklinkWorkspace {
  version: 1;
  updatedAt: string;
  settings: GrowthSettings;
  prospects: BacklinkProspect[];
  opportunities: BacklinkOpportunity[];
  journalists: JournalistRecord[];
  sourceRequests: SourceRequest[];
  campaigns: OutreachCampaign[];
  earnedLinks: EarnedLink[];
  researchIdeas: ResearchIdea[];
  discoveryQueries: DiscoveryQuery[];
  weeklyRuns?: WeeklyRunRecord[];
  communities?: CommunityPolicy[];
  communityHistory?: CommunityEngagement[];
}
