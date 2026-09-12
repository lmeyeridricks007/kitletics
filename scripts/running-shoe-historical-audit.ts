/**
 * Historical dimension coverage for running shoes.
 * Run: npx tsx --tsconfig tsconfig.json scripts/running-shoe-historical-audit.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { auditRunningShoeHistoricalCoverage } from "@/lib/running-shoe-database/historical";

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function main() {
  const audit = auditRunningShoeHistoricalCoverage({ isDev: false });
  const outDir = join(process.cwd(), "docs/prelaunch/data");
  mkdirSync(outDir, { recursive: true });
  const jsonPath = join(outDir, "running-shoe-historical-coverage.json");
  writeFileSync(jsonPath, JSON.stringify(audit, null, 2));

  console.log(`Eligible cohort: ${audit.populationSize}`);
  console.log("Field coverage:");
  for (const d of audit.fields) {
    console.log(
      `  ${d.field.padEnd(22)} ${String(d.present).padStart(3)}/${audit.populationSize} (${pct(d.coverage)}) — ${d.notes}`,
    );
  }
  console.log(
    `Distinct release years: ${audit.readiness.distinctReleaseYears}`,
  );
  console.log(
    `Multi-member families: ${audit.families.multiMember} (multi-year: ${audit.families.multiMemberWithMultipleYears})`,
  );
  console.log(
    `Previous/next-gen relationships among shoes: ${audit.generationRelationshipsAmongShoes}`,
  );
  console.log(
    `Public historical insights evidenceReady: ${audit.readiness.evidenceReady}`,
  );
  console.log(`Status: ${audit.readiness.publicStatus.headline}`);
  if (audit.readiness.publicStatus.kind === "not-ready") {
    console.log(`Summary: ${audit.readiness.publicStatus.summary}`);
  }
  console.log(`Wrote ${jsonPath}`);
}

main();
