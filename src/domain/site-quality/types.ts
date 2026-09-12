/**
 * SiteQualityAgent — types
 * SEO is one slice of broader site quality / growth readiness.
 */

export type SiteQualityMode =
  | "audit"
  | "fix"
  | "full"
  | "seo"
  | "performance"
  | "content"
  | "links"
  | "schema"
  | "backlinks"
  | "accessibility"
  | "launch";

export type IssueSeverity = "BLOCKER" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type IssueArea =
  | "seo"
  | "technical-seo"
  | "crawl"
  | "indexation"
  | "architecture"
  | "internal-links"
  | "content"
  | "product"
  | "guide"
  | "review"
  | "best-guide"
  | "search"
  | "performance"
  | "cwv"
  | "accessibility"
  | "structured-data"
  | "media"
  | "backlinks"
  | "commercial"
  | "trust"
  | "security"
  | "privacy"
  | "redirects"
  | "freshness"
  | "launch"
  | "rendered-quality";

export type IssueOwner =
  | "Engineering"
  | "Content"
  | "SEO"
  | "Commercial"
  | "Editorial"
  | "Manual research";

export type IssueStatus =
  | "open"
  | "auto-fixed"
  | "staged"
  | "resolved"
  | "wontfix"
  | "manual";

export type Effort = "XS" | "S" | "M" | "L" | "XL";
export type Impact = "Critical" | "High" | "Medium" | "Low";

export type PageType =
  | "homepage"
  | "sport-hub"
  | "discipline-hub"
  | "gear-hub"
  | "category"
  | "subcategory"
  | "brand-hub"
  | "product"
  | "review"
  | "best-guide"
  | "buying-guide"
  | "long-form-guide"
  | "comparison"
  | "compare-builder"
  | "alternatives"
  | "setup"
  | "tools-hub"
  | "tool"
  | "finder"
  | "finder-results"
  | "calculator"
  | "search"
  | "trust"
  | "other";

export interface SiteIssue {
  id: string;
  severity: IssueSeverity;
  area: IssueArea;
  pageType?: PageType;
  route?: string;
  evidence: string;
  whyItMatters: string;
  recommendedFix: string;
  canAutoFix: boolean;
  status: IssueStatus;
  owner: IssueOwner;
  relatedFiles?: string[];
  effort?: Effort;
  impact?: Impact;
  recheckResult?: string;
}

export interface DiscoveredRoute {
  path: string;
  absoluteUrl: string;
  pageType: PageType;
  indexable: boolean;
  lastModified?: string;
  source: "sitemap" | "static" | "entity" | "trust";
}

export interface SiteQualityRunOptions {
  mode: SiteQualityMode;
  dryRun?: boolean;
  applyFixes?: boolean;
  baseUrl?: string;
  liveCrawl?: boolean;
  limit?: number;
}

export type LaunchStatus = "READY" | "READY WITH ISSUES" | "NOT READY";

export interface SiteQualityReport {
  generatedAt: string;
  mode: SiteQualityMode;
  dryRun: boolean;
  launchStatus: LaunchStatus;
  /** Internal diagnostic only — not an authoritative SEO score */
  diagnosticScore?: number;
  routeCount: number;
  issues: SiteIssue[];
  counts: Record<IssueSeverity, number>;
  sections: Record<string, string>;
  autoFixes: Array<{ id: string; description: string; files: string[] }>;
  nextActions: string[];
  remainingManual: string[];
  baselines?: {
    previousRunAt?: string;
    regressions?: string[];
  };
}

export const SITE_QUALITY_MODES: SiteQualityMode[] = [
  "audit",
  "fix",
  "full",
  "seo",
  "performance",
  "content",
  "links",
  "schema",
  "backlinks",
  "accessibility",
  "launch",
];
