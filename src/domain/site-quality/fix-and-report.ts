import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SEED_DATES } from "@/content/config";
import type { SiteIssue, SiteQualityReport } from "./types";

export interface AutoFixResult {
  id: string;
  description: string;
  files: string[];
  applied: boolean;
}

/** Deterministic, high-confidence, reversible fixes only. */
export function applySafeFixes(
  issues: SiteIssue[],
  dryRun: boolean,
): { fixes: AutoFixResult[]; updatedIssues: SiteIssue[] } {
  const fixes: AutoFixResult[] = [];
  const updated = issues.map((i) => ({ ...i }));

  const mark = (id: string, description: string, files: string[], applied: boolean) => {
    fixes.push({ id, description, files, applied });
    // match by related pattern
    for (const item of updated) {
      if (!item.canAutoFix) continue;
      if (item.relatedFiles?.some((f) => files.includes(f)) && item.status === "open") {
        if (
          (files.includes("src/app/layout.tsx") && /metadataBase/i.test(item.evidence)) ||
          (files.includes("src/app/sitemap.ts") && /lastModified:\s*now/i.test(item.evidence)) ||
          (files.includes("src/app/robots.ts") && /disallow/i.test(item.evidence))
        ) {
          item.status = applied ? "auto-fixed" : "staged";
          item.recheckResult = applied ? "fix applied" : "dry-run proposed";
        }
      }
    }
  };

  // Fix metadataBase
  const layoutPath = join(process.cwd(), "src/app/layout.tsx");
  if (existsSync(layoutPath)) {
    let layout = readFileSync(layoutPath, "utf8");
    if (!/metadataBase/.test(layout)) {
      const next = layout.replace(
        /export const metadata: Metadata = \{/,
        `export const metadata: Metadata = {\n  metadataBase: new URL(siteConfig.url),`,
      );
      if (next !== layout) {
        if (!dryRun) writeFileSync(layoutPath, next);
        mark("SEO-metadataBase", "Add metadataBase to root layout", ["src/app/layout.tsx"], !dryRun);
        layout = next;
      }
    }
  }

  // Fix sitemap lastModified: now → SEED_DATES.updated
  const sitemapPath = join(process.cwd(), "src/app/sitemap.ts");
  if (existsSync(sitemapPath)) {
    let src = readFileSync(sitemapPath, "utf8");
    if (/lastModified:\s*now/.test(src)) {
      if (!src.includes("SEED_DATES")) {
        src = src.replace(
          'import { siteConfig } from "@/content/config";',
          'import { siteConfig, SEED_DATES } from "@/content/config";',
        );
      }
      const next = src.replace(/lastModified:\s*now/g, "lastModified: new Date(SEED_DATES.updated)");
      // Remove unused `now` if no longer referenced
      let cleaned = next;
      if (!/[^A-Za-z]now[^A-Za-z]/.test(cleaned.replace(/lastModified: new Date\(SEED_DATES\.updated\)/g, ""))) {
        cleaned = cleaned.replace(/\s*const now = new Date\(\);\n/, "\n");
      }
      if (!dryRun) writeFileSync(sitemapPath, cleaned);
      mark(
        "SEO-sitemap-lastmod",
        `Replace sitemap lastModified: now with SEED_DATES.updated (${SEED_DATES.updated})`,
        ["src/app/sitemap.ts"],
        !dryRun,
      );
    }
  }

  // Ensure robots disallow list completeness
  const robotsPath = join(process.cwd(), "src/app/robots.ts");
  if (existsSync(robotsPath)) {
    let src = readFileSync(robotsPath, "utf8");
    const needed = ['"/go/"', '"/api/"', '"/admin/"', '"/preview/"'];
    let changed = false;
    for (const d of needed) {
      if (!src.includes(d)) {
        src = src.replace(
          /disallow:\s*\[([^\]]*)\]/,
          (_m, inner: string) => {
            const parts = inner
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
            if (!parts.includes(d)) parts.push(d);
            return `disallow: [${parts.join(", ")}]`;
          },
        );
        changed = true;
      }
    }
    if (changed) {
      if (!dryRun) writeFileSync(robotsPath, src);
      mark("SEO-robots-disallow", "Ensure robots disallow /go /api /admin /preview", ["src/app/robots.ts"], !dryRun);
    }
  }

  return { fixes, updatedIssues: updated };
}

export function writeReports(report: SiteQualityReport): { md: string; json: string; archive?: string } {
  const docsDir = join(process.cwd(), "docs");
  mkdirSync(docsDir, { recursive: true });
  const mdPath = join(docsDir, "site-quality-audit.md");
  const jsonPath = join(docsDir, "site-quality-audit.json");
  const md = renderMarkdown(report);
  writeFileSync(mdPath, md);
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  const day = report.generatedAt.slice(0, 10);
  const archiveDir = join(docsDir, "audits", day);
  mkdirSync(archiveDir, { recursive: true });
  const archivePath = join(archiveDir, `site-quality-audit.json`);
  writeFileSync(archivePath, JSON.stringify(report, null, 2));

  // Supporting docs are maintained separately; touch backlink section timestamp note in staging
  const staging = join(process.cwd(), "data/staging/site-quality");
  mkdirSync(staging, { recursive: true });
  writeFileSync(join(staging, "last-run.json"), JSON.stringify({ at: report.generatedAt, mode: report.mode }, null, 2));

  return { md: mdPath, json: jsonPath, archive: archivePath };
}

function renderMarkdown(report: SiteQualityReport): string {
  const open = report.issues.filter((i) => i.status === "open" || i.status === "staged");
  const bySev = report.counts;
  const lines: string[] = [];
  lines.push(`# Kitletics Site Quality Audit`);
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push(`Scope: ${report.mode}${report.dryRun ? " (dry-run)" : ""}`);
  lines.push("");
  lines.push(`Overall status: **${report.launchStatus}**`);
  lines.push("");
  if (report.diagnosticScore != null) {
    lines.push(`Overall score: ${report.diagnosticScore} _(internal diagnostic only — not an SEO authority metric)_`);
    lines.push("");
  }
  lines.push(`Routes inventoried: ${report.routeCount}`);
  lines.push("");
  lines.push(`## Executive Summary`);
  lines.push("");
  lines.push(
    `Open issues — BLOCKER ${bySev.BLOCKER}, HIGH ${bySev.HIGH}, MEDIUM ${bySev.MEDIUM}, LOW ${bySev.LOW}, INFO ${bySev.INFO}.`,
  );
  lines.push("");
  lines.push(`## NEXT 10 ACTIONS`);
  lines.push("");
  for (const [i, a] of report.nextActions.slice(0, 10).entries()) {
    lines.push(`${i + 1}. ${a}`);
  }
  lines.push("");
  lines.push(`## Critical Findings`);
  lines.push("");
  const critical = open.filter((i) => i.severity === "BLOCKER" || i.severity === "HIGH");
  if (!critical.length) lines.push("None.");
  for (const i of critical.slice(0, 25)) {
    lines.push(formatIssue(i));
  }
  lines.push("");

  const sections: Array<[string, string[]]> = [
    ["SEO", ["seo", "technical-seo"]],
    ["Technical SEO", ["technical-seo"]],
    ["Crawl & Indexation", ["crawl", "indexation"]],
    ["Site Architecture", ["architecture"]],
    ["Internal Linking", ["internal-links"]],
    ["Content Quality", ["content"]],
    ["Product Quality", ["product"]],
    ["Guide Quality", ["guide"]],
    ["Review Quality", ["review"]],
    ["Best Guide Quality", ["best-guide"]],
    ["Search", ["search"]],
    ["Performance", ["performance"]],
    ["Core Web Vitals", ["cwv"]],
    ["Accessibility", ["accessibility"]],
    ["Structured Data", ["structured-data"]],
    ["Media / Images", ["media"]],
    ["Backlinks & Authority", ["backlinks"]],
    ["Commercial / Affiliate", ["commercial"]],
    ["Trust / Methodology", ["trust"]],
    ["Security / Privacy Basics", ["security", "privacy"]],
    ["Broken Links / Redirects", ["redirects"]],
    ["Freshness", ["freshness"]],
  ];

  for (const [title, areas] of sections) {
    lines.push(`## ${title}`);
    lines.push("");
    const items = open.filter((i) => areas.includes(i.area));
    if (!items.length) lines.push("_No open issues in this section for this run._");
    for (const i of items.slice(0, 40)) lines.push(formatIssue(i));
    lines.push("");
  }

  lines.push(`## Recommended Actions`);
  lines.push("");
  for (const a of report.nextActions) lines.push(`- ${a}`);
  lines.push("");
  lines.push(`## Remaining Manual Work`);
  lines.push("");
  for (const a of report.remainingManual) lines.push(`- ${a}`);
  lines.push("");
  lines.push(`## Auto-fixes`);
  lines.push("");
  if (!report.autoFixes.length) lines.push("None this run.");
  for (const f of report.autoFixes) {
    lines.push(`- **${f.id}**: ${f.description} (${f.files.join(", ")})`);
  }
  lines.push("");
  lines.push(`## Supporting docs`);
  lines.push("");
  lines.push(`- [SEO architecture](./seo-architecture.md)`);
  lines.push(`- [Go-live SEO checklist](./go-live-seo.md)`);
  lines.push(`- [Performance standards](./performance-standards.md)`);
  lines.push(`- [Backlink opportunities](./backlink-opportunities.md)`);
  lines.push(`- Machine-readable: [site-quality-audit.json](./site-quality-audit.json)`);
  lines.push("");
  lines.push(`## QA / Build Status`);
  lines.push("");
  lines.push(report.sections.build ?? "Not measured this run — run `npm run build` separately for production compile status.");
  lines.push("");
  return lines.join("\n");
}

function formatIssue(i: SiteIssue): string {
  return [
    `### ${i.id} · ${i.severity} · ${i.area}`,
    "",
    `- **Page:** ${i.route ?? "—"}`,
    `- **Evidence:** ${i.evidence}`,
    `- **Why it matters:** ${i.whyItMatters}`,
    `- **Fix:** ${i.recommendedFix}`,
    `- **Auto-fix:** ${i.canAutoFix ? "yes" : "no"}`,
    `- **Status:** ${i.status}`,
    `- **Owner:** ${i.owner}`,
    i.relatedFiles?.length ? `- **Files:** ${i.relatedFiles.join(", ")}` : "",
    i.recheckResult ? `- **Recheck:** ${i.recheckResult}` : "",
    "",
  ]
    .filter(Boolean)
    .join("\n");
}
