import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { assembleIndexableUrl } from "./assemble";
import { enumerateIndexableUrls } from "./enumerate";
import { gateTokenLeak } from "./gates/token-leak";
import { gateDecisionCopy } from "./gates/decision-copy";
import { gateContentSanity } from "./gates/content-sanity";
import { gateImageSemantics } from "./gates/image-semantics";
import { gateUniqueness } from "./gates/uniqueness";
import { gateCrossSurface, rootCausesFrom } from "./gates/cross-surface";
import type {
  RenderedIssue,
  RenderedQualityReport,
  RenderedSeverity,
  UrlQualityRow,
  VisiblePage,
} from "./types";

const VISUAL_CANDIDATES = [
  "docs/quality/data/visual-semantic-status.json",
  "docs/remediation/data/image-semantic-visual/summary.json",
];

function rankSeverity(a: RenderedSeverity | "CLEAN"): number {
  const order: Record<string, number> = {
    BLOCKER: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
    CLEAN: 4,
  };
  return order[a] ?? 4;
}

function maxSeverity(issues: RenderedIssue[]): RenderedSeverity | "CLEAN" {
  let max: RenderedSeverity | "CLEAN" = "CLEAN";
  for (const i of issues) {
    if (rankSeverity(i.severity) < rankSeverity(max)) max = i.severity;
  }
  return max;
}

function loadVisualReport(): RenderedQualityReport["visualReport"] {
  const root = process.cwd();
  for (const rel of VISUAL_CANDIDATES) {
    const abs = join(root, rel);
    if (!existsSync(abs)) continue;
    try {
      const raw = JSON.parse(readFileSync(abs, "utf8")) as unknown;
      const rows = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as { rows?: unknown }).rows)
          ? (raw as { rows: unknown[] }).rows
          : [];
      const banned = rows.filter((r) => {
        const row = r as { banned?: unknown[] };
        return Array.isArray(row.banned) && row.banned.length > 0;
      });
      return {
        requiredForRelease: true,
        path: rel,
        present: true,
        blockerCount: banned.length,
        status: banned.length ? "FAIL" : "PASS",
      };
    } catch {
      continue;
    }
  }
  return {
    requiredForRelease: true,
    path: VISUAL_CANDIDATES[0]!,
    present: false,
    blockerCount: 0,
    status: "MISSING",
  };
}

export function inspectPages(pages: VisiblePage[]): RenderedIssue[] {
  const token = gateTokenLeak(pages, 0);
  const decision = gateDecisionCopy(pages, token.length);
  const sanity = gateContentSanity(pages, token.length + decision.length);
  const images = gateImageSemantics(
    pages,
    token.length + decision.length + sanity.length,
  );
  const uniqueness = gateUniqueness(
    pages,
    token.length + decision.length + sanity.length + images.length,
  );
  const raw = [...token, ...decision, ...sanity, ...images, ...uniqueness];
  return gateCrossSurface(pages, raw);
}

export function runRenderedQualityGate(opts?: {
  pages?: VisiblePage[];
}): { pages: VisiblePage[]; issues: RenderedIssue[]; report: RenderedQualityReport } {
  const urls = opts?.pages ? [] : enumerateIndexableUrls();
  const pages: VisiblePage[] = opts?.pages ?? [];
  if (!opts?.pages) {
    console.log(`  ${urls.length} indexable URLs`);
    const started = Date.now();
    for (let i = 0; i < urls.length; i++) {
      pages.push(assembleIndexableUrl(urls[i]!));
      if ((i + 1) % 100 === 0) {
        process.stdout.write(
          `  assembled ${i + 1}/${urls.length} (${Date.now() - started}ms)\n`,
        );
      }
    }
  }

  const assembleIssues: RenderedIssue[] = [];
  let n = 90000;
  for (const page of pages) {
    if (page.assembled) continue;
    assembleIssues.push({
      id: `RQ-${String(++n)}`,
      severity: "HIGH",
      gate: "token-leak",
      issueClass: "ASSEMBLE",
      issue: "assemble_failed",
      component: "page",
      url: page.url,
      template: page.template,
      entity: page.entity,
      rootCause: `Indexable URL ${page.path} has no production page-data assembler`,
      excerpt: page.path,
    });
  }

  const issues = [...inspectPages(pages.filter((p) => p.assembled)), ...assembleIssues];
  const byUrl = new Map<string, RenderedIssue[]>();
  for (const issue of issues) {
    const urls = issue.placements?.length ? issue.placements : [issue.url];
    for (const url of urls) {
      const list = byUrl.get(url) ?? [];
      list.push(issue);
      byUrl.set(url, list);
    }
  }

  const urlRows: UrlQualityRow[] = pages.map((p) => {
    const list = byUrl.get(p.url) ?? [];
    return {
      url: p.url,
      path: p.path,
      template: p.template,
      entityKind: p.entity.kind,
      entitySlug: p.entity.slug,
      assembled: p.assembled,
      maxSeverity: maxSeverity(list),
      tokenLeak: list.some((i) => i.issueClass === "TOKEN_LEAK"),
      decisionCopyFail: list.some((i) => i.issueClass === "DECISION_COPY"),
      contentCorruption: list.some(
        (i) => i.issueClass === "TOKEN_LEAK" || i.issueClass === "CONTENT_SANITY",
      ),
      imageSemanticFail: list.some((i) => i.issueClass === "IMAGE_SEMANTIC"),
    };
  });

  const visualReport = loadVisualReport();
  const blockerUrls = urlRows.filter((u) => u.maxSeverity === "BLOCKER").length;
  const highUrls = urlRows.filter((u) => u.maxSeverity === "HIGH").length;
  const releaseReady = blockerUrls === 0 && visualReport.status !== "FAIL";
  const releaseReason = !releaseReady
    ? blockerUrls > 0
      ? `${blockerUrls} BLOCKER rendered-quality URLs`
      : visualReport.status === "MISSING"
        ? "Visual semantic report required for release"
        : `Visual semantic report FAIL (${visualReport.blockerCount})`
    : visualReport.status === "MISSING"
      ? "Deterministic gates clean; visual report still required for release sign-off"
      : "No BLOCKER rendered-quality findings";

  const report: RenderedQualityReport = {
    generatedAt: new Date().toISOString(),
    principle: "QUALITY = WHAT THE USER RECEIVES",
    indexableUrls: pages.length,
    assembledUrls: pages.filter((p) => p.assembled).length,
    unassembledUrls: pages.filter((p) => !p.assembled).length,
    cleanUrls: urlRows.filter((u) => u.maxSeverity === "CLEAN").length,
    blockerUrls,
    highUrls,
    contentCorruption: urlRows.filter((u) => u.contentCorruption).length,
    decisionCopyFailures: urlRows.filter((u) => u.decisionCopyFail).length,
    imageSemanticFailures: urlRows.filter((u) => u.imageSemanticFail).length,
    uniquenessFailures: issues.filter((i) => i.issueClass === "UNIQUENESS").length,
    releaseReady: releaseReady && visualReport.status === "PASS",
    releaseReason:
      visualReport.status === "MISSING"
        ? "Deterministic gates have 0 BLOCKERs; visual semantic report still required for release"
        : releaseReason,
    urls: urlRows,
    issues,
    rootCauses: rootCausesFrom(issues),
    visualReport,
  };

  if (blockerUrls > 0) {
    report.releaseReady = false;
    report.releaseReason = `${blockerUrls} BLOCKER rendered-quality URLs`;
  }

  return { pages, issues, report };
}
