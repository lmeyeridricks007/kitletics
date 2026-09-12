import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { RenderedQualityReport } from "./types";

export const RENDERED_QUALITY_JSON = "docs/quality/data/rendered-quality-last-run.json";
export const RENDERED_QUALITY_MD = "docs/quality/RENDERED-QUALITY-DASHBOARD.md";

/** Last full-estate run. SiteQualityAgent consumes this — it does not re-assemble. */
export function loadRenderedQualityLastRun(): RenderedQualityReport | null {
  const abs = join(process.cwd(), RENDERED_QUALITY_JSON);
  if (!existsSync(abs)) return null;
  try {
    return JSON.parse(readFileSync(abs, "utf8")) as RenderedQualityReport;
  } catch {
    return null;
  }
}

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function writeRenderedQualityDashboard(report: RenderedQualityReport): {
  json: string;
  md: string;
  csv: string;
} {
  const dir = join(process.cwd(), "docs/quality/data");
  mkdirSync(dir, { recursive: true });
  const json = join(process.cwd(), RENDERED_QUALITY_JSON);
  writeFileSync(json, `${JSON.stringify(report, null, 2)}\n`);

  const csv = join(dir, "rendered-quality-issues.csv");
  const cols = [
    "id",
    "severity",
    "gate",
    "url",
    "template",
    "entity",
    "component",
    "issue",
    "rootCause",
  ];
  const lines = [cols.join(",")];
  for (const i of report.issues) {
    lines.push(
      [
        i.id,
        i.severity,
        i.gate,
        i.url,
        i.template,
        `${i.entity.kind}:${i.entity.slug}`,
        i.component,
        i.issue,
        i.rootCause,
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  writeFileSync(csv, `${lines.join("\n")}\n`);

  const md = join(process.cwd(), RENDERED_QUALITY_MD);
  const mdBody = `# Rendered quality dashboard

QUALITY = WHAT THE USER RECEIVES.

Generated: ${report.generatedAt}

| Metric | Count |
| --- | ---: |
| Indexable URLs | ${report.indexableUrls} |
| Assembled | ${report.assembledUrls} |
| Clean URLs | ${report.cleanUrls} |
| BLOCKER URLs | ${report.blockerUrls} |
| HIGH URLs | ${report.highUrls} |
| Content corruption | ${report.contentCorruption} |
| Decision-copy failures | ${report.decisionCopyFailures} |
| Image-semantic failures | ${report.imageSemanticFailures} |
| Uniqueness failures | ${report.uniquenessFailures} |

**Release ready:** ${report.releaseReady ? "YES" : "NO"} — ${report.releaseReason}

Visual report (\`${report.visualReport.path}\`): ${report.visualReport.status}

## Root causes

${report.rootCauses
  .slice(0, 40)
  .map(
    (r) =>
      `- **${r.severity}** ${r.issue} — ${r.rootCause} (${r.placements.length} placement${r.placements.length === 1 ? "" : "s"})`,
  )
  .join("\n") || "_None._"}

See \`${RENDERED_QUALITY_JSON}\` for the full machine-readable report.
`;
  writeFileSync(md, mdBody);
  return { json, md, csv };
}
