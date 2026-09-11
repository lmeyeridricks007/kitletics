/**
 * Review-article audit agent — industry best-practice findings for Kitletics reviews.
 *
 * Usage:
 *   npm run reviews:article-audit
 *   npm run reviews:article-audit -- --slug=nike-vomero-18
 *   npm run reviews:article-audit -- --limit=20 --fail
 *
 * Writes:
 *   reports/review-article-audit-YYYY-MM-DD.md
 *   reports/review-article-audit-YYYY-MM-DD.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getReviews } from "@/repositories";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import {
  assessReviewArticle,
  type ReviewArticleAssessment,
} from "@/lib/review/assess-review-article-quality";

function argValue(flag: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`${flag}=`));
  return hit?.slice(flag.length + 1);
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function renderMarkdown(
  rows: ReviewArticleAssessment[],
  meta: { generatedAt: string; scope: string },
): string {
  const p0 = rows.filter((r) => r.findings.some((f) => f.severity === "P0"));
  const p1 = rows.filter((r) =>
    r.findings.some((f) => f.severity === "P1" && !r.findings.some((x) => x.severity === "P0")),
  );
  const byGrade = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const r of rows) byGrade[r.grade] += 1;
  const avgScore =
    rows.length === 0
      ? 0
      : Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length);
  const avgWords =
    rows.length === 0
      ? 0
      : Math.round(rows.reduce((s, r) => s + r.wordCount, 0) / rows.length);

  const topIssues = new Map<string, number>();
  for (const r of rows) {
    for (const f of r.findings) {
      if (f.severity === "info") continue;
      topIssues.set(f.code, (topIssues.get(f.code) ?? 0) + 1);
    }
  }
  const issueRank = [...topIssues.entries()].sort((a, b) => b[1] - a[1]);

  const lines: string[] = [
    `# Review article audit — ${meta.generatedAt}`,
    ``,
    `Industry best-practice check for Kitletics product reviews (verdict, audience, length, voice, scores, alternatives, disclosure, media, first-hand honesty).`,
    ``,
    `**Scope:** ${meta.scope}`,
    `**Reviews assessed:** ${rows.length}`,
    `**Average score:** ${avgScore}/100`,
    `**Average words:** ~${avgWords}`,
    `**Grade mix:** A ${byGrade.A} · B ${byGrade.B} · C ${byGrade.C} · D ${byGrade.D} · F ${byGrade.F}`,
    `**With P0 findings:** ${p0.length}`,
    `**With P1-only findings:** ${p1.length}`,
    ``,
    `## Checklist (what “good” means)`,
    ``,
    `| Practice | Pass when |`,
    `| --- | --- |`,
    `| Verdict up front | bottomLine or verdict present |`,
    `| Audience | whoShouldBuy + whoShouldAvoid |`,
    `| Honest trade-offs | specific pros (≥2) + cons (≥1) |`,
    `| Transparent scores | ≥3 criteria in scoreBreakdown |`,
    `| Long-form depth | 3,000–5,500 words on the enriched page |`,
    `| Scannable structure | ≥6 substantive sections |`,
    `| Guide voice | no research-paper / Expert Research jargon |`,
    `| First-hand honesty | no “we tested” claims without personal-test evidence |`,
    `| Alternatives | alternatives or comparison peers |`,
    `| Disclosure | testingContext or editorialDisclosure |`,
    `| Media | authentic product hero |`,
    ``,
    `## Top recurring issues`,
    ``,
  ];

  if (issueRank.length === 0) {
    lines.push(`_No recurring issues — strong set._`, ``);
  } else {
    lines.push(`| Code | Count |`, `| --- | ---: |`);
    for (const [code, n] of issueRank.slice(0, 15)) {
      lines.push(`| \`${code}\` | ${n} |`);
    }
    lines.push(``);
  }

  lines.push(`## Priority findings (P0)`, ``);
  if (p0.length === 0) {
    lines.push(`_None._`, ``);
  } else {
    for (const r of p0.sort((a, b) => a.score - b.score)) {
      lines.push(`### ${r.title} (\`${r.slug}\`) — grade ${r.grade} · ${r.score}/100 · ~${r.wordCount} words`);
      for (const f of r.findings.filter((x) => x.severity === "P0")) {
        lines.push(`- **${f.code}:** ${f.message}`);
        lines.push(`  - Fix: ${f.recommendation}`);
      }
      lines.push(``);
    }
  }

  lines.push(`## All reviews (sorted worst → best)`, ``);
  lines.push(
    `| Grade | Score | Words | Sections | Slug | P0 | P1 |`,
    `| :---: | ---: | ---: | ---: | --- | ---: | ---: |`,
  );
  for (const r of [...rows].sort((a, b) => a.score - b.score || a.slug.localeCompare(b.slug))) {
    const p0n = r.findings.filter((f) => f.severity === "P0").length;
    const p1n = r.findings.filter((f) => f.severity === "P1").length;
    lines.push(
      `| ${r.grade} | ${r.score} | ${r.wordCount} | ${r.sectionCount} | [\`${r.slug}\`](/reviews/${r.slug}) | ${p0n} | ${p1n} |`,
    );
  }
  lines.push(``);

  lines.push(`## Per-review detail`, ``);
  for (const r of [...rows].sort((a, b) => a.score - b.score || a.slug.localeCompare(b.slug))) {
    lines.push(`### ${r.title}`);
    lines.push(``);
    lines.push(
      `- **Slug:** \`${r.slug}\` · **Product:** ${r.productName}`,
      `- **Type:** ${r.reviewType} · **Status:** ${r.status}`,
      `- **Grade:** ${r.grade} (${r.score}/100) · **Words:** ${r.wordCount} · **Sections:** ${r.sectionCount}`,
    );
    if (r.strengths.length) {
      lines.push(`- **Strengths:** ${r.strengths.join("; ")}`);
    }
    if (r.findings.length === 0) {
      lines.push(`- **Findings:** none`);
    } else {
      lines.push(`- **Findings:**`);
      for (const f of r.findings) {
        lines.push(
          `  - \`[${f.severity}]\` **${f.code}** — ${f.message} → ${f.recommendation}`,
        );
      }
    }
    lines.push(``);
  }

  lines.push(`---`, ``, `_Generated by \`npm run reviews:article-audit\`._`, ``);
  return lines.join("\n");
}

function main() {
  const slugFilter = argValue("--slug");
  const limit = Number(argValue("--limit") ?? "0") || 0;
  const failOnP0 = hasFlag("--fail");
  const includeDrafts = hasFlag("--all-statuses");

  let reviews = getReviews({ isDev: true }).filter((r) =>
    includeDrafts ? true : r.status === "published",
  );
  if (slugFilter) {
    reviews = reviews.filter((r) => r.slug === slugFilter);
  }
  reviews = reviews.sort((a, b) => a.slug.localeCompare(b.slug));
  if (limit > 0) reviews = reviews.slice(0, limit);

  const rows: ReviewArticleAssessment[] = [];
  const skipped: string[] = [];

  for (const review of reviews) {
    const data = getReviewPageData(review.slug, { isDev: true });
    if (!data) {
      skipped.push(review.slug);
      continue;
    }
    rows.push(assessReviewArticle(data));
  }

  const generatedAt = today();
  const scope = slugFilter
    ? `slug=${slugFilter}`
    : limit
      ? `published (limit ${limit})`
      : includeDrafts
        ? "all statuses"
        : "published";

  const reportDir = join(process.cwd(), "reports");
  mkdirSync(reportDir, { recursive: true });
  const base = `review-article-audit-${generatedAt}`;
  const mdPath = join(reportDir, `${base}.md`);
  const jsonPath = join(reportDir, `${base}.json`);

  const md = renderMarkdown(rows, { generatedAt, scope });
  writeFileSync(mdPath, md, "utf8");
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generatedAt,
        scope,
        skipped,
        summary: {
          count: rows.length,
          avgScore:
            rows.length === 0
              ? 0
              : Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length),
          p0Count: rows.filter((r) => r.findings.some((f) => f.severity === "P0"))
            .length,
        },
        reviews: rows,
      },
      null,
      2,
    ),
    "utf8",
  );

  const p0Count = rows.filter((r) => r.findings.some((f) => f.severity === "P0"))
    .length;
  console.log(`Assessed ${rows.length} reviews (${skipped.length} skipped).`);
  console.log(`P0 reviews: ${p0Count}`);
  console.log(`Wrote ${mdPath}`);
  console.log(`Wrote ${jsonPath}`);

  if (failOnP0 && p0Count > 0) {
    process.exitCode = 1;
  }
}

main();
