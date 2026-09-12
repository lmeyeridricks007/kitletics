/**
 * Running Shoe Database quality / freshness guard.
 *
 * Usage: npm run shoe-database:qa
 * Also invoked from catalog:qa and qa:running.
 *
 * Writes:
 * - docs/data-products/RUNNING-SHOE-DATABASE-QUALITY.md
 * - docs/data-products/data/running-shoe-database-quality.json
 *
 * Exit 1 when any eligible record is INVALID (gate).
 * SUSPECT is reported but does not fail CI by default.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getRunningShoeDatabaseRecords } from "@/lib/running-shoe-database/build-records";
import {
  buildRunningShoeDatabaseQualityReport,
  formatRunningShoeDatabaseQualityMarkdown,
  toRunningShoeDatabaseQualityCiPayload,
} from "@/lib/running-shoe-database/quality";

function main() {
  const records = getRunningShoeDatabaseRecords();
  const report = buildRunningShoeDatabaseQualityReport(records);
  const md = formatRunningShoeDatabaseQualityMarkdown(report);
  const json = toRunningShoeDatabaseQualityCiPayload(report);

  const docsDir = join(process.cwd(), "docs/data-products");
  const dataDir = join(docsDir, "data");
  mkdirSync(dataDir, { recursive: true });

  const mdPath = join(docsDir, "RUNNING-SHOE-DATABASE-QUALITY.md");
  const jsonPath = join(dataDir, "running-shoe-database-quality.json");
  writeFileSync(mdPath, md, "utf8");
  writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");

  console.log("\n=== Running Shoe Database Quality ===\n");
  console.log(`Eligible shoes: ${report.populationSize}`);
  console.log(
    `VALID ${report.statusCounts.VALID} · PARTIAL ${report.statusCounts.PARTIAL} · SUSPECT ${report.statusCounts.SUSPECT} · INVALID ${report.statusCounts.INVALID}`,
  );
  console.log(`Wrote ${mdPath}`);
  console.log(`Wrote ${jsonPath}`);

  if (report.invalidRecords.length > 0) {
    console.error("\nINVALID records:");
    for (const r of report.invalidRecords) {
      console.error(`  - ${r.slug} (${r.brandSlug}): ${r.codes.join(", ")}`);
    }
  }
  if (report.suspectRecords.length > 0) {
    console.warn("\nSUSPECT records (excluded from stats for flagged metrics):");
    for (const r of report.suspectRecords.slice(0, 20)) {
      console.warn(`  - ${r.slug} (${r.brandSlug}): ${r.codes.join(", ")}`);
    }
    if (report.suspectRecords.length > 20) {
      console.warn(`  … +${report.suspectRecords.length - 20} more`);
    }
  }

  if (report.statusCounts.INVALID > 0) {
    console.error("\n✖ shoe-database:qa GATE FAIL — INVALID > 0\n");
    process.exit(1);
  }

  console.log("\n✔ shoe-database:qa passed (no INVALID records)\n");
}

main();
