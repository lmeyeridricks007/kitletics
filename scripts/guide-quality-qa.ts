/**
 * Buying / long-form guide quality audit.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/guide-quality-qa.ts
 * Also wired into npm run guides:qa
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getBuyingGuides, getSportById } from "@/repositories";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import type { GuideQualityAssessment } from "@/lib/guides/assess-guide-quality";

function audit(): GuideQualityAssessment[] {
  return getBuyingGuides()
    .filter((g) => g.status === "published")
    .map((g) => assessGuideQuality(g))
    .sort((a, b) => {
      const order: Record<string, number> = {
        thin: 0,
        blocked: 1,
        "needs-research": 2,
        "needs-editorial-review": 3,
        stale: 4,
        complete: 5,
      };
      return (
        (order[a.status] ?? 9) - (order[b.status] ?? 9) ||
        a.priority.localeCompare(b.priority) ||
        a.slug.localeCompare(b.slug)
      );
    });
}

function countBy<T extends string>(
  rows: GuideQualityAssessment[],
  key: (r: GuideQualityAssessment) => T,
): Record<T, number> {
  const out = {} as Record<T, number>;
  for (const r of rows) {
    const k = key(r);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

function main() {
  const rows = audit();
  const reportDir = join(process.cwd(), "reports");
  mkdirSync(reportDir, { recursive: true });

  const complete = rows.filter((r) => r.status === "complete");
  const thin = rows.filter((r) => r.status === "thin");
  const needsResearch = rows.filter((r) => r.status === "needs-research");
  const stale = rows.filter((r) => r.status === "stale");
  const blocked = rows.filter((r) => r.status === "blocked");
  const p0Incomplete = rows.filter(
    (r) => r.priority === "P0" && r.status !== "complete",
  );

  const bySport = new Map<
    string,
    { total: number; complete: number; thin: number; needs: number; stale: number }
  >();
  for (const r of rows) {
    const sport = getSportById(r.sportId)?.name ?? r.sportId;
    const cur = bySport.get(sport) ?? {
      total: 0,
      complete: 0,
      thin: 0,
      needs: 0,
      stale: 0,
    };
    cur.total += 1;
    if (r.status === "complete") cur.complete += 1;
    if (r.status === "thin") cur.thin += 1;
    if (r.status === "needs-research") cur.needs += 1;
    if (r.status === "stale") cur.stale += 1;
    bySport.set(sport, cur);
  }

  const byType = countBy(rows, (r) => r.guideType);

  const coverage = {
    quickAnswer: rows.filter((r) => r.blockCoverage.quickAnswer).length,
    decisionFramework: rows.filter((r) => r.blockCoverage.decisionFramework).length,
    visualExplainer: rows.filter((r) => r.blockCoverage.visualExplainer).length,
    productExamples: rows.filter((r) => r.blockCoverage.productExamples).length,
    finderCta: rows.filter((r) => r.blockCoverage.finderCta).length,
    bestGuideCta: rows.filter((r) => r.blockCoverage.bestGuideCta).length,
    compareLink: rows.filter((r) => r.blockCoverage.compareLink).length,
    faq: rows.filter((r) => r.blockCoverage.faq).length,
    relatedGuides: rows.filter((r) => r.blockCoverage.relatedGuides).length,
    evidenceNote: rows.filter((r) => r.blockCoverage.evidenceNote).length,
  };

  const md = [
    "# Guide quality report",
    "",
    "Buying / long-form guides — decision completeness (not SEO word count alone).",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `| Metric | Count |`,
    `| --- | ---: |`,
    `| Audited | ${rows.length} |`,
    `| Complete | ${complete.length} |`,
    `| Thin | ${thin.length} |`,
    `| Needs research | ${needsResearch.length} |`,
    `| Stale | ${stale.length} |`,
    `| Blocked | ${blocked.length} |`,
    `| P0 incomplete | ${p0Incomplete.length} |`,
    "",
    "## By sport",
    "",
    "| Sport | Guides | Complete | Thin | Needs research | Stale |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...[...bySport.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(
        ([sport, s]) =>
          `| ${sport} | ${s.total} | ${s.complete} | ${s.thin} | ${s.needs} | ${s.stale} |`,
      ),
    "",
    "## By guide type",
    "",
    "| Guide type | Count | Complete | Complete % |",
    "| --- | ---: | ---: | ---: |",
    ...Object.keys(byType)
      .sort()
      .map((type) => {
        const typeRows = rows.filter((r) => r.guideType === type);
        const c = typeRows.filter((r) => r.status === "complete").length;
        const pct = typeRows.length
          ? Math.round((c / typeRows.length) * 100)
          : 0;
        return `| ${type} | ${typeRows.length} | ${c} | ${pct}% |`;
      }),
    "",
    "## P0 gap list",
    "",
    p0Incomplete.length === 0
      ? "_All P0 guides are complete._"
      : [
          "| Guide | Status | Action |",
          "| --- | --- | --- |",
          ...p0Incomplete.map(
            (r) => `| ${r.slug} | ${r.status} | ${r.recommendedAction} |`,
          ),
        ].join("\n"),
    "",
    "## Content block coverage (diagnostic)",
    "",
    "Not every Guide must have every block — use as a gap signal.",
    "",
    "| Block | Guides with block |",
    "| --- | ---: |",
    ...Object.entries(coverage).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "## Full inventory",
    "",
    "| Guide | Type | Depth | Pri | Blocks | Products | FAQ | Tools | Best | Decision | Status | Action |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |",
    ...rows.map((r) => {
      return `| ${r.slug} | ${r.guideType} | ${r.depthTier} | ${r.priority} | ${r.structuredBlockCount} | ${r.productExampleCount} | ${r.faqCount} | ${r.toolLinks} | ${r.relatedBestGuides} | ${r.decisionCompleteness} | ${r.status} | ${r.recommendedAction} |`;
    }),
    "",
  ].join("\n");

  writeFileSync(join(reportDir, "guide-quality.md"), md);
  writeFileSync(
    join(reportDir, "guide-quality.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        summary: {
          audited: rows.length,
          complete: complete.length,
          thin: thin.length,
          needsResearch: needsResearch.length,
          stale: stale.length,
          blocked: blocked.length,
          p0Incomplete: p0Incomplete.map((r) => r.slug),
        },
        coverage,
        bySport: Object.fromEntries(bySport),
        rows,
      },
      null,
      2,
    ),
  );

  const hardFails: string[] = [];
  const stability = rows.find((r) => r.slug === "stability-shoes-explained");
  if (!stability || stability.status !== "complete") {
    hardFails.push("stability-shoes-explained must remain complete");
  }
  if (stability && stability.structuredBlockCount < 10) {
    hardFails.push("stability-shoes-explained missing explainer blocks");
  }

  const enrichedP0 = [
    "running-shoe-drop",
    "running-shoe-cushioning",
    "carbon-vs-nylon-plates",
    "running-shoe-rotation",
    "what-is-a-daily-trainer",
  ];
  for (const slug of enrichedP0) {
    const row = rows.find((r) => r.slug === slug);
    if (!row || row.status === "thin") {
      hardFails.push(`${slug} still thin after backfill`);
    }
  }

  console.log(md);
  console.log(`\nWrote reports/guide-quality.md (${rows.length} guides)`);

  if (hardFails.length > 0) {
    console.error("\nHard failures:");
    for (const f of hardFails) console.error(` - ${f}`);
    process.exit(1);
  }
}

main();
