#!/usr/bin/env tsx
/**
 * Publish path for newly media-promoted SKUs:
 * 1. Backfill missing published reviews (when products already have heroes)
 * 2. Generate unique review section images (idempotent)
 *
 *   npm run reviews:publish-path
 *   npm run reviews:publish-path -- --dry-run
 *   npm run reviews:publish-path -- --section-images-only
 *   npm run reviews:publish-path -- --slugs=foo,bar
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { runReviewSectionImagesForSlugs } from "./lib/run-review-section-images";

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

function runTsx(relScript: string, extraArgs: string[] = []): number {
  const script = path.join(process.cwd(), relScript);
  const res = spawnSync(
    "npx",
    ["tsx", "--tsconfig", "tsconfig.json", script, ...extraArgs],
    { stdio: "inherit", cwd: process.cwd(), env: process.env },
  );
  return res.status ?? 1;
}

function main(): void {
  const dryRun = flag("dry-run");
  const sectionOnly = flag("section-images-only");
  const slugsArg = arg("slugs");

  if (slugsArg) {
    const slugs = slugsArg.split(",").map((s) => s.trim()).filter(Boolean);
    const { ok } = runReviewSectionImagesForSlugs(slugs, { dryRun });
    process.exit(ok ? 0 : 1);
  }

  if (!sectionOnly) {
    console.log("Publish path step 1: backfill missing product reviews…");
    if (dryRun) {
      console.log("[dry-run] would run backfill-missing-product-reviews");
    } else {
      const code = runTsx("scripts/backfill-missing-product-reviews.ts");
      if (code !== 0) {
        console.error("backfill-missing-product-reviews failed");
        process.exit(code);
      }
    }
  }

  // Fresh child process so newly appended reviews are visible.
  console.log(
    "Publish path step 2: reviews:section-images (idempotent; skips existing)…",
  );
  if (dryRun) {
    console.log("[dry-run] would run reviews:section-images");
    process.exit(0);
  }
  const code = runTsx("scripts/generate-review-section-images.ts");
  process.exit(code);
}

main();
