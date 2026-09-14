import type {
  ContactRole,
  ContactStatus,
  OpportunityType,
  ProspectCategory,
} from "./types";

export type ProspectMix =
  | "publication"
  | "coach"
  | "club"
  | "research"
  | "journalist"
  | "newsletter"
  | "podcast"
  | "mainstream"
  | "brand"
  | "retailer";

export interface SeedSpec {
  id: string;
  name: string;
  domain: string;
  homepageUrl: string;
  category: ProspectCategory;
  mix: ProspectMix;
  country: string;
  language: string;
  market: string;
  whyRelevant: string;
  competitor?: boolean;
  type: OpportunityType;
  /** Specific page that already shows citation / resource intent. */
  url: string;
  topic: string;
  subtopic?: string;
  relevance: number;
  authority: number;
  likelihood: number;
  editorial: number;
  relationship: number;
  evidence: string;
  campaignId: string;
  recommendedAssetId: string;
  whyTheyMightLink: string;
  pitchOverride: string;
  subjectLine: string;
  publicContactRoute: string;
  contactName?: string;
  contactRole?: ContactRole;
  contactEmail?: string;
  contactSource?: string;
  contactStatus?: ContactStatus;
  competitorGap?: string;
  /** True for competitor-import or brand-PR rows that must not enter the first-contact list. */
  doNotSend?: boolean;
}
