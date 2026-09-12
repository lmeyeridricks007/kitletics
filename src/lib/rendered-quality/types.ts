/**
 * Rendered quality — quality is what the user receives.
 * Scores of stored fields, word counts, and HTTP 200s are not quality.
 */

import type { CanonicalDecisionCopy } from "@/lib/decision-copy/types";
import type { PageType as SitePageType } from "@/domain/site-quality/types";

export type RenderedSeverity = "BLOCKER" | "HIGH" | "MEDIUM" | "LOW";

export type RenderedGateId =
  | "token-leak"
  | "decision-copy"
  | "content-sanity"
  | "image-semantics"
  | "cross-surface"
  | "uniqueness";

export type RenderedIssueClass =
  | "TOKEN_LEAK"
  | "DECISION_COPY"
  | "CONTENT_SANITY"
  | "IMAGE_SEMANTIC"
  | "CROSS_SURFACE"
  | "UNIQUENESS"
  | "ASSEMBLE";

export type RenderedTemplate =
  | SitePageType
  | "buying-guide"
  | "data-product"
  | "author"
  | "static";

export type MediaAuthenticity = "AUTHENTIC" | "PLACEHOLDER" | "UNKNOWN";
export type MediaSemanticCorrectness =
  | "CORRECT"
  | "LIKELY_CORRECT"
  | "GENERIC_BUT_RELEVANT"
  | "WRONG_SPORT"
  | "WRONG_CONTENT_TYPE"
  | "WRONG_PRODUCT"
  | "WRONG_BRAND"
  | "DUPLICATE_PLACEHOLDER"
  | "UNKNOWN";

export type VisibleImage = {
  src: string;
  alt?: string;
  component: string;
  placement: "hero" | "card" | "methodology" | "related" | "primary" | "section";
};

export type VisibleComponent = {
  id: string;
  text: string;
};

export type SourceEntity = {
  kind: "review" | "product" | "guide" | "best-guide" | "brand" | "page";
  id: string;
  slug: string;
};

export type VisiblePage = {
  path: string;
  url: string;
  template: RenderedTemplate;
  entity: SourceEntity;
  /** Upstream entity that this page derives copy from, when different. */
  source?: SourceEntity;
  components: VisibleComponent[];
  images: VisibleImage[];
  decision?: CanonicalDecisionCopy;
  assembled: boolean;
};

export type RenderedIssue = {
  id: string;
  severity: RenderedSeverity;
  gate: RenderedGateId;
  issueClass: RenderedIssueClass;
  issue: string;
  component: string;
  url: string;
  template: RenderedTemplate;
  entity: SourceEntity;
  rootCause: string;
  excerpt: string;
  placements?: string[];
};

export type UrlQualityRow = {
  url: string;
  path: string;
  template: RenderedTemplate;
  entityKind: string;
  entitySlug: string;
  assembled: boolean;
  maxSeverity: RenderedSeverity | "CLEAN";
  tokenLeak: boolean;
  decisionCopyFail: boolean;
  contentCorruption: boolean;
  imageSemanticFail: boolean;
};

export type RenderedQualityReport = {
  generatedAt: string;
  principle: "QUALITY = WHAT THE USER RECEIVES";
  indexableUrls: number;
  assembledUrls: number;
  unassembledUrls: number;
  cleanUrls: number;
  blockerUrls: number;
  highUrls: number;
  contentCorruption: number;
  decisionCopyFailures: number;
  imageSemanticFailures: number;
  uniquenessFailures: number;
  releaseReady: boolean;
  releaseReason: string;
  urls: UrlQualityRow[];
  issues: RenderedIssue[];
  rootCauses: Array<{
    rootCause: string;
    severity: RenderedSeverity;
    issue: string;
    placements: string[];
  }>;
  visualReport: {
    requiredForRelease: true;
    path: string;
    present: boolean;
    blockerCount: number;
    status: "PASS" | "FAIL" | "MISSING";
  };
};

export const PROD_CTX = { isDev: false as const };

export const SITE_ORIGIN = "https://kitletics.com";
