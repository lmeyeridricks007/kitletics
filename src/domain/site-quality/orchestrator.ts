import { discoverRoutes } from "./discover";
import { countBySeverity, resetIssueCounters } from "./issues";
import { auditTechnicalSeo } from "./audits/technical-seo";
import { auditContentQuality } from "./audits/content";
import { auditMedia, auditSchemaPresence } from "./audits/media-schema";
import {
  auditInternalLinks,
  auditTrustAndCommercial,
  auditBacklinkOpportunities,
  auditPerformanceStatic,
  auditAccessibilityStatic,
  auditSecurityBasics,
} from "./audits/links-trust-perf";
import { auditVariantUxCoverage } from "./audits/variant-ux";
import { auditRenderedQuality } from "./audits/rendered-quality";
import { applySafeFixes, writeReports } from "./fix-and-report";
import type {
  LaunchStatus,
  SiteIssue,
  SiteQualityMode,
  SiteQualityReport,
  SiteQualityRunOptions,
} from "./types";
import { siteConfig } from "@/content/config";

function modeIncludes(mode: SiteQualityMode, area: string): boolean {
  if (mode === "audit" || mode === "full" || mode === "fix" || mode === "launch") {
    return true;
  }
  const map: Record<string, string[]> = {
    seo: ["seo", "technical-seo", "crawl", "indexation", "schema", "structured-data"],
    performance: ["performance", "cwv", "media"],
    content: ["content", "guide", "review", "best-guide", "product"],
    links: ["internal-links", "architecture", "redirects", "crawl"],
    schema: ["structured-data", "schema"],
    backlinks: ["backlinks"],
    accessibility: ["accessibility"],
  };
  return (map[mode] ?? []).includes(area);
}

function launchStatus(issues: SiteIssue[]): LaunchStatus {
  const open = issues.filter((i) => i.status === "open" || i.status === "staged");
  if (open.some((i) => i.severity === "BLOCKER")) return "NOT READY";
  if (open.some((i) => i.severity === "HIGH")) return "READY WITH ISSUES";
  if (open.some((i) => i.severity === "MEDIUM")) return "READY WITH ISSUES";
  return "READY";
}

function diagnosticScore(issues: SiteIssue[]): number {
  let score = 100;
  for (const i of issues.filter((x) => x.status === "open" || x.status === "staged")) {
    if (i.severity === "BLOCKER") score -= 20;
    else if (i.severity === "HIGH") score -= 8;
    else if (i.severity === "MEDIUM") score -= 3;
    else if (i.severity === "LOW") score -= 1;
  }
  return Math.max(0, Math.min(100, score));
}

function prioritize(issues: SiteIssue[]): string[] {
  const open = issues
    .filter((i) => i.status === "open" || i.status === "staged")
    .sort((a, b) => {
      const order = { BLOCKER: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
      return order[a.severity] - order[b.severity];
    });
  return open.slice(0, 10).map((i) => `${i.id} (${i.severity}): ${i.recommendedFix}`);
}

export async function runSiteQualityAgent(
  options: SiteQualityRunOptions,
): Promise<SiteQualityReport> {
  resetIssueCounters();
  const mode = options.mode;
  const dryRun = Boolean(options.dryRun);
  const applyFixes =
    Boolean(options.applyFixes) || mode === "fix" || mode === "full";

  const routes = discoverRoutes(options.baseUrl ?? siteConfig.url);
  let issues: SiteIssue[] = [];

  const collect = (batch: SiteIssue[]) => {
    for (const i of batch) {
      if (modeIncludes(mode, i.area) || modeIncludes(mode, i.area.replace(/-/g, ""))) {
        issues.push(i);
      } else if (mode === "seo" && (i.area === "seo" || i.area === "technical-seo" || i.area === "indexation" || i.area === "crawl" || i.area === "structured-data")) {
        issues.push(i);
      } else if (modeIncludes(mode, i.area)) {
        issues.push(i);
      }
    }
  };

  // Simpler: filter after collect all for full modes; for focused modes filter by area groups
  const allBatches: SiteIssue[][] = [];
  allBatches.push(auditTechnicalSeo(routes));
  allBatches.push(auditContentQuality());
  allBatches.push(auditMedia());
  allBatches.push(auditSchemaPresence());
  allBatches.push(auditInternalLinks(routes));
  allBatches.push(auditTrustAndCommercial());
  allBatches.push(auditBacklinkOpportunities());
  allBatches.push(auditPerformanceStatic());
  allBatches.push(auditAccessibilityStatic());
  allBatches.push(auditSecurityBasics());
  allBatches.push(auditVariantUxCoverage());
  allBatches.push(auditRenderedQuality());

  const flat = allBatches.flat();
  if (mode === "audit" || mode === "full" || mode === "fix" || mode === "launch") {
    issues = flat;
  } else {
    issues = flat.filter((i) => {
      if (mode === "seo") {
        return ["seo", "technical-seo", "crawl", "indexation", "structured-data"].includes(i.area);
      }
      if (mode === "performance") return ["performance", "cwv", "media"].includes(i.area);
      if (mode === "content") {
        return ["content", "guide", "review", "best-guide", "product", "search", "rendered-quality"].includes(i.area);
      }
      if (mode === "links") {
        return ["internal-links", "architecture", "redirects", "crawl"].includes(i.area);
      }
      if (mode === "schema") return i.area === "structured-data";
      if (mode === "backlinks") return i.area === "backlinks";
      if (mode === "accessibility") return i.area === "accessibility";
      return true;
    });
  }

  void collect;

  let autoFixes: SiteQualityReport["autoFixes"] = [];
  if (applyFixes || dryRun) {
    const { fixes, updatedIssues } = applySafeFixes(
      issues,
      dryRun || !applyFixes,
    );
    issues = updatedIssues;
    autoFixes = fixes.map((f) => ({
      id: f.id,
      description: f.description,
      files: f.files,
    }));

    if (applyFixes && !dryRun && fixes.some((f) => f.applied)) {
      resetIssueCounters();
      const routes2 = discoverRoutes(options.baseUrl ?? siteConfig.url);
      const reTech = auditTechnicalSeo(routes2);
      const reSchema = auditSchemaPresence();
      const kept = issues.filter(
        (i) =>
          i.area !== "technical-seo" &&
          i.area !== "indexation" &&
          i.area !== "crawl" &&
          i.area !== "structured-data",
      );
      // Preserve auto-fixed markers from previous pass where still relevant
      issues = [...kept, ...reTech, ...reSchema];
    }
  }

  const counts = countBySeverity(
    issues.filter((i) => i.status === "open" || i.status === "staged"),
  );
  const status = launchStatus(issues);
  const report: SiteQualityReport = {
    generatedAt: new Date().toISOString(),
    mode,
    dryRun,
    launchStatus: status,
    diagnosticScore: diagnosticScore(issues),
    routeCount: routes.length,
    issues,
    counts,
    sections: {
      build: "Not run inside agent — execute `npm run build` for compile verification.",
    },
    autoFixes,
    nextActions: prioritize(issues),
    remainingManual: issues
      .filter((i) => (i.status === "open" || i.status === "staged") && !i.canAutoFix)
      .slice(0, 20)
      .map((i) => `${i.id}: ${i.recommendedFix}`),
  };

  writeReports(report);
  return report;
}
