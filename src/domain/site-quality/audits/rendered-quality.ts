import {
  loadRenderedQualityLastRun,
  type RenderedQualityReport,
} from "@/lib/rendered-quality";
import type { SiteIssue } from "../types";
import { issue } from "../issues";

function countBlockers(
  report: RenderedQualityReport,
  issueClass: RenderedQualityReport["issues"][number]["issueClass"],
): number {
  return report.issues.filter(
    (i) => i.issueClass === issueClass && i.severity === "BLOCKER",
  ).length;
}

/**
 * Map a rendered-quality report onto SiteQualityAgent issues.
 *
 * HIGH findings stay HIGH (READY WITH ISSUES). Only BLOCKER rendered
 * findings — or a missing report — make launch NOT READY.
 *
 * Does not re-assemble the estate. `npm run quality:rendered` owns that.
 */
export function issuesFromRenderedReport(
  report: RenderedQualityReport | null,
): SiteIssue[] {
  const issues: SiteIssue[] = [];

  if (!report) {
    issues.push(
      issue("RENDERED", "BLOCKER", "rendered-quality", {
        idSuffix: "ESTATE",
        route: "/",
        evidence: "docs/quality/data/rendered-quality-last-run.json is missing",
        whyItMatters:
          "A release cannot be READY without a full-estate rendered-quality report. Sampling 15 pages previously declared READY while production was garbage",
        recommendedFix: "npm run quality:rendered",
        canAutoFix: false,
        owner: "Editorial",
        effort: "L",
        impact: "Critical",
      }),
    );
    return issues;
  }

  issues.push(
    issue("RENDERED", report.blockerUrls > 0 ? "BLOCKER" : "INFO", "rendered-quality", {
      idSuffix: "ESTATE",
      route: "/",
      evidence: `${report.cleanUrls}/${report.indexableUrls} indexable URLs clean; BLOCKER ${report.blockerUrls}; HIGH ${report.highUrls}; assembled ${report.assembledUrls}/${report.indexableUrls}`,
      whyItMatters:
        "Quality is what the user receives on every indexable URL — not a 15-page sample, word count, or HTTP 200",
      recommendedFix: "npm run quality:rendered — fix BLOCKER token leaks, decision copy, and image-semantic fails",
      canAutoFix: false,
      owner: "Editorial",
      effort: "L",
      impact: "Critical",
      status: report.blockerUrls > 0 ? "open" : "resolved",
    }),
  );

  const corruptionBlockers =
    countBlockers(report, "TOKEN_LEAK") + countBlockers(report, "CONTENT_SANITY");
  if (corruptionBlockers > 0) {
    issues.push(
      issue("RENDERED", "BLOCKER", "rendered-quality", {
        idSuffix: "CORRUPTION",
        evidence: `${corruptionBlockers} BLOCKER token-leak / content-sanity issues; ${report.contentCorruption} URLs have any corruption including HIGH`,
        whyItMatters: "Internal tokens and garbage copy must never ship",
        recommendedFix: "See docs/quality/RENDERED-QUALITY-DASHBOARD.md",
        canAutoFix: false,
        owner: "Editorial",
        impact: "Critical",
      }),
    );
  } else if (report.contentCorruption > 0) {
    issues.push(
      issue("RENDERED", "HIGH", "rendered-quality", {
        idSuffix: "CORRUPTION",
        evidence: `${report.contentCorruption} URLs have HIGH/MEDIUM content-sanity findings (no BLOCKER leaks)`,
        whyItMatters: "Duplicate paragraphs and stuffing are still public quality debt",
        recommendedFix: "See docs/quality/RENDERED-QUALITY-DASHBOARD.md",
        canAutoFix: false,
        owner: "Editorial",
        impact: "High",
      }),
    );
  }

  if (report.decisionCopyFailures > 0) {
    const blockerDecision = report.issues.some(
      (i) => i.issueClass === "DECISION_COPY" && i.severity === "BLOCKER",
    );
    issues.push(
      issue(
        "RENDERED",
        blockerDecision ? "BLOCKER" : "HIGH",
        "rendered-quality",
        {
          idSuffix: "DECISION",
          evidence: `${report.decisionCopyFailures} URLs fail decision-copy classification`,
          whyItMatters: "Best For / Buy If / Skip If are buyer-facing",
          recommendedFix: "See rendered-quality dashboard decision-copy rows",
          canAutoFix: false,
          owner: "Editorial",
          impact: "Critical",
        },
      ),
    );
  }

  const imageBlockers = countBlockers(report, "IMAGE_SEMANTIC");
  if (imageBlockers > 0) {
    issues.push(
      issue("RENDERED", "BLOCKER", "rendered-quality", {
        idSuffix: "IMAGE",
        evidence: `${imageBlockers} BLOCKER image-semantic issues across ${report.imageSemanticFailures} URLs (authenticity is still media:ci)`,
        whyItMatters: "Authentic padel photography on a running-watch guide is still wrong",
        recommendedFix: "Fix semantic resolver placements; do not replace media:ci",
        canAutoFix: false,
        owner: "Editorial",
        impact: "Critical",
      }),
    );
  } else if (report.imageSemanticFailures > 0) {
    issues.push(
      issue("RENDERED", "HIGH", "rendered-quality", {
        idSuffix: "IMAGE",
        evidence: `${report.imageSemanticFailures} URLs fail image semantic correctness at HIGH (no BLOCKER fillers)`,
        whyItMatters: "Semantic mismatches that are not known hard-fail fillers still ship the wrong subject",
        recommendedFix: "Fix semantic resolver placements; do not replace media:ci",
        canAutoFix: false,
        owner: "Editorial",
        impact: "High",
      }),
    );
  }

  if (report.visualReport.status === "FAIL") {
    issues.push(
      issue("RENDERED", "BLOCKER", "rendered-quality", {
        idSuffix: "VISUAL",
        evidence: `Visual semantic report FAIL (${report.visualReport.blockerCount}) at ${report.visualReport.path}`,
        whyItMatters: "Release requires the expensive visual/semantic report, not just filename checks",
        recommendedFix: "Re-run visual QA and clear banned filler leaks",
        canAutoFix: false,
        owner: "Editorial",
        impact: "Critical",
      }),
    );
  } else if (report.visualReport.status === "MISSING") {
    issues.push(
      issue("RENDERED", "HIGH", "rendered-quality", {
        idSuffix: "VISUAL",
        evidence: `Visual semantic report missing (${report.visualReport.path})`,
        whyItMatters: "Filename classification is not a substitute for the visual report at release",
        recommendedFix: "Produce docs/quality/data/visual-semantic-status.json (or keep the image-semantic visual summary)",
        canAutoFix: false,
        owner: "Editorial",
        impact: "High",
      }),
    );
  } else {
    issues.push(
      issue("RENDERED", "INFO", "rendered-quality", {
        idSuffix: "VISUAL",
        evidence: `Visual semantic report PASS (${report.visualReport.path})`,
        whyItMatters: "Release requires the visual/semantic report alongside deterministic gates",
        recommendedFix: "Keep visual QA in the release process",
        canAutoFix: false,
        owner: "Editorial",
        status: "resolved",
      }),
    );
  }

  return issues;
}

/**
 * Full-estate rendered quality. Never samples. BLOCKER findings make
 * launchStatus NOT READY. Consumes `npm run quality:rendered` output.
 */
export function auditRenderedQuality(): SiteIssue[] {
  return issuesFromRenderedReport(loadRenderedQualityLastRun());
}
