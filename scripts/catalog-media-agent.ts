#!/usr/bin/env tsx
/**
 * Catalog Media Agent — site-wide product image audit and fix orchestration.
 *
 * npm run media:agent -- --mode=audit
 * npm run media:agent -- --mode=audit --category=training-shoes
 * npm run media:agent -- --mode=audit --brand=salming --write
 * npm run media:agent -- --mode=fetch-training --dry-run
 * npm run media:agent -- --mode=full --category=training-shoes --limit=10
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import {
  runCatalogMediaAudit,
  writeCatalogMediaReport,
  listPublicMastersOverError,
  type CatalogMediaAuditReport,
} from "./lib/catalog-media-audit";

type AgentMode = "audit" | "fetch-training" | "fetch-running" | "full";

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
  console.log(`Catalog Media Agent

Audits every published product for an authentic primary hero image
(getPrimaryProductMedia + on-disk file check). Writes JSON + Markdown
reports under data/staging/.

Usage:
  npm run media:agent -- --mode=<audit|fetch-training|fetch-running|full> [filters]

Modes:
  audit            Report gaps only (default)
  fetch-training   Run scripts/fetch-training-shoes-media.mjs then re-audit
  fetch-running    Run scripts/batch-fetch-running-media.mjs then re-audit
  full             fetch for category vertical + audit remaining gaps

Filters:
  --category=<slug>   e.g. training-shoes, running-shoes, padel-rackets
  --brand=<slug>      e.g. salming, adidas
  --sport=<slug>      partial sport id match, e.g. training
  --limit=N           Cap gap rows printed to console
  --write             Write JSON + Markdown report (default on audit)
  --fail              Exit 1 when any P0 gaps or identity mismatches remain
  --identity          Force OCR on all filtered products (CI / full identity)
  --no-identity       Skip shared-hash + OCR (faster)

Identity (default unless --no-identity):
  - Shared-hash for all published authentic heroes (duplicate packshots)
  - OCR for shoes, GPS watches/HRMs, adjustable dumbbells
  - --identity expands OCR to every filtered product

Examples:
  npm run media:agent -- --mode=audit --category=training-shoes --fail
  npm run media:agent -- --mode=audit --category=gps-watches --write
  npm run media:ci
  npm run media:agent -- --mode=full --category=training-shoes
`);
}

function runScript(rel: string, dryRun: boolean): void {
  if (dryRun) {
    console.log(`[dry-run] would run: node ${rel}`);
    return;
  }
  const script = path.join(process.cwd(), rel);
  const res = spawnSync("node", [script], {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  });
  if (res.status !== 0) {
    console.error(`Script failed: ${rel} (exit ${res.status})`);
    process.exit(res.status ?? 1);
  }
}

function printGapSummary(report: CatalogMediaAuditReport, limit: number): void {
  const p0 = report.gaps.filter(
    (g) =>
      g.reason !== "missing-provenance" &&
      (g.lifecycleStatus === "current" || g.lifecycleStatus === "unknown"),
  );
  console.log("\n=== Catalog Media Agent ===");
  console.log(`Coverage: ${report.totals.coveragePct}% (${report.totals.withAuthenticPrimary}/${report.totals.published})`);
  console.log(`P0 gaps (current, no authentic hero): ${p0.length}`);
  console.log(`Broken files: ${report.totals.broken}`);
  console.log("\nLowest coverage categories:");
  for (const c of report.byCategory.filter((x) => x.published > 0).slice(0, 8)) {
    console.log(
      `  ${c.coveragePct}%  ${c.categoryName} (${c.withAuthenticPrimary}/${c.published})`,
    );
  }
  console.log("\nSample gaps:");
  for (const g of p0.slice(0, limit)) {
    console.log(`  [${g.reason}] ${g.slug} — ${g.fullName}`);
  }
  if (p0.length > limit) {
    console.log(`  … ${p0.length - limit} more in report`);
  }
}

async function main(): Promise<void> {
  if (flag("help") || flag("h")) {
    printHelp();
    return;
  }

  const mode = (arg("mode") ?? "audit") as AgentMode;
  const dryRun = flag("dry-run");
  const shouldWrite = flag("write") || mode === "audit" || mode === "full";
  const limit = Number(arg("limit") ?? "40");
  const category = arg("category");
  const brand = arg("brand");
  const sport = arg("sport");

  if (mode === "fetch-training") {
    runScript("scripts/fetch-training-shoes-media.mjs", dryRun);
  } else if (mode === "fetch-running") {
    runScript("scripts/batch-fetch-running-media.mjs", dryRun);
  } else if (mode === "full" && !dryRun) {
    if (!category || category.includes("train")) {
      runScript("scripts/fetch-training-shoes-media.mjs", false);
    }
    if (!category || category.includes("running")) {
      runScript("scripts/batch-fetch-running-media.mjs", false);
    }
    if (!category || category.includes("padel") || category.includes("tennis")) {
      runScript("scripts/batch-fetch-p1-catalog-media.mjs", false);
    }
    runScript("scripts/apply-p1-catalog-media.mjs", false);
  }

  const report = await runCatalogMediaAudit({
    categorySlug: category,
    brandSlug: brand,
    sportSlug: sport,
    missingOnly: true,
    checkIdentity: flag("no-identity") ? false : flag("identity") ? true : undefined,
  });

  printGapSummary(report, limit);

  if (shouldWrite && !dryRun) {
    const { jsonPath, mdPath, denylistAdded } = writeCatalogMediaReport(report);
    console.log(`\nWrote ${jsonPath}`);
    console.log(`Wrote ${mdPath}`);
    if (denylistAdded.length) {
      console.log(
        `Updated logo denylist (+${denylistAdded.length}): ${denylistAdded.join(", ")}`,
      );
    }
  }

  const identityCount = report.gaps.filter(
    (g) => g.reason === "wrong-product" || g.reason === "shared-hero",
  ).length;
  if (identityCount > 0) {
    console.log(`\nIdentity mismatches: ${identityCount}`);
    for (const g of report.gaps.filter(
      (x) => x.reason === "wrong-product" || x.reason === "shared-hero",
    ).slice(0, limit)) {
      console.log(`  [${g.reason}] ${g.slug} — ${g.detail ?? ""}`);
    }
  }

  const logoCount = report.gaps.filter((g) => g.reason === "logo-placeholder").length;
  if (logoCount > 0) {
    console.log(`\nLogo / wordmark placeholders: ${logoCount}`);
  }

  const ingestErrors = listPublicMastersOverError();
  console.log(
    `\nIngest ERROR masters (>5MB in public/images, excluding /qa/): ${ingestErrors.length}`,
  );
  for (const row of ingestErrors.slice(0, 10)) {
    console.log(`  ${(row.bytes / 1024 / 1024).toFixed(2)}MB  ${row.src}`);
  }

  const p0Count = report.gaps.filter(
    (g) =>
      g.reason !== "missing-provenance" &&
      g.lifecycleStatus === "current",
  ).length;

  if (flag("fail") && (p0Count > 0 || identityCount > 0)) {
    console.error(
      `\nmedia:agent FAILED — ${p0Count} P0 gaps, ${identityCount} identity mismatches`,
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
