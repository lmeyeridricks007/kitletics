#!/usr/bin/env tsx
/**
 * Rendered quality gate — inspects production-like output for every
 * indexable URL. Fails on BLOCKER findings.
 *
 * npm run quality:rendered
 */
import {
  runRenderedQualityGate,
  writeRenderedQualityDashboard,
} from "@/lib/rendered-quality";

function main(): void {
  console.log("Rendered quality gate — enumerating indexable URLs…");
  const { report } = runRenderedQualityGate();
  const paths = writeRenderedQualityDashboard(report);

  console.log(
    `Indexable ${report.indexableUrls} · assembled ${report.assembledUrls} · clean ${report.cleanUrls}`,
  );
  console.log(
    `BLOCKER URLs ${report.blockerUrls} · HIGH URLs ${report.highUrls}`,
  );
  console.log(
    `Corruption ${report.contentCorruption} · decision-copy ${report.decisionCopyFailures} · image-semantic ${report.imageSemanticFailures}`,
  );
  console.log(`Visual report: ${report.visualReport.status} (${report.visualReport.path})`);
  console.log(`Release ready: ${report.releaseReady ? "YES" : "NO"} — ${report.releaseReason}`);
  console.log(`Wrote ${paths.md}`);
  console.log(`Wrote ${paths.json}`);

  if (report.blockerUrls > 0) {
    console.error(
      `\nFAIL: ${report.blockerUrls} BLOCKER rendered-quality URL(s). A release cannot be READY.`,
    );
    process.exit(1);
  }
}

main();
