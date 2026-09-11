#!/usr/bin/env tsx
/**
 * SiteQualityAgent CLI
 *
 * npm run site:audit
 * npm run site:audit -- --mode=seo --dry-run
 * npm run site:audit -- --mode=full --fix
 * npm run site:audit -- --mode=launch
 */
import {
  runSiteQualityAgent,
  SITE_QUALITY_MODES,
  type SiteQualityMode,
} from "@/domain/site-quality";

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function printHelp(): void {
  console.log(`SiteQualityAgent — Kitletics site quality, SEO, performance & growth

Usage:
  npm run site:audit -- --mode=<${SITE_QUALITY_MODES.join("|")}> [--dry-run] [--fix]

Reports always written to:
  docs/site-quality-audit.md
  docs/site-quality-audit.json
`);
}

async function main(): Promise<void> {
  if (flag("help") || flag("h")) {
    printHelp();
    return;
  }

  const mode = (arg("mode") ?? "audit") as SiteQualityMode;
  if (!SITE_QUALITY_MODES.includes(mode)) {
    console.error(`Invalid mode: ${mode}`);
    process.exit(1);
  }

  const dryRun = flag("dry-run");
  const applyFixes =
    !dryRun && (flag("fix") || mode === "fix" || mode === "full");

  console.log(
    `SiteQualityAgent · mode=${mode}${dryRun ? " · dry-run" : ""}${applyFixes ? " · apply-fixes" : ""}`,
  );

  const report = await runSiteQualityAgent({
    mode,
    dryRun,
    applyFixes,
    baseUrl: arg("base-url"),
  });

  console.log(`\nOverall: ${report.launchStatus}`);
  console.log(
    `Open — BLOCKER ${report.counts.BLOCKER} · HIGH ${report.counts.HIGH} · MEDIUM ${report.counts.MEDIUM} · LOW ${report.counts.LOW} · INFO ${report.counts.INFO}`,
  );
  console.log(`Routes: ${report.routeCount}`);
  console.log(`Auto-fixes proposed/applied: ${report.autoFixes.length}`);
  console.log(`\nNEXT ACTIONS:`);
  for (const [i, a] of report.nextActions.entries()) {
    console.log(`  ${i + 1}. ${a}`);
  }
  console.log(`\nWrote docs/site-quality-audit.md + docs/site-quality-audit.json`);

  if (report.counts.BLOCKER > 0) process.exitCode = 1;
  if (mode === "launch" && report.launchStatus === "NOT READY") {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
