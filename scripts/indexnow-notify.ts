#!/usr/bin/env tsx
/**
 * Submit changed canonical URLs to IndexNow.
 *
 * Do NOT use this to dump the entire sitemap after enabling IndexNow.
 * Only submit URLs that were genuinely published, updated, or removed.
 *
 * Usage:
 *   npm run indexnow:notify -- --dry-run --reviews=slug-a,slug-b
 *   npm run indexnow:notify -- --products=slug-a --include-alternatives
 *   npm run indexnow:notify -- --urls=/reviews/foo,https://kitletics.com/best/bar
 *   npm run indexnow:notify -- --mode=removal --urls=/products/old-slug
 *   npm run indexnow:notify -- --best=slug --guides=slug --comparisons=slug
 */
import {
  notifyIndexNow,
  type IndexNowEntityRef,
} from "@/lib/seo/indexnow";

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

function csv(name: string): string[] {
  const raw = arg(name);
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function logger(message: string, meta?: Record<string, unknown>): void {
  if (meta) console.log(`[indexnow] ${message}`, meta);
  else console.log(`[indexnow] ${message}`);
}

async function main(): Promise<void> {
  if (flag("from-sitemap")) {
    console.error(
      "Refusing --from-sitemap. IndexNow must not bulk-submit the full catalog on enablement.\n" +
        "Pass only the URLs/entities that changed.",
    );
    process.exit(2);
  }

  const mode = arg("mode") === "removal" ? "removal" : "upsert";
  const dryRun = flag("dry-run");
  const includeAlternatives = flag("include-alternatives");

  const entities: IndexNowEntityRef[] = [];
  for (const slug of csv("products")) {
    entities.push({ kind: "product", slug });
    if (includeAlternatives) {
      entities.push({ kind: "alternatives", slug });
    }
  }
  for (const slug of csv("reviews")) {
    entities.push({ kind: "review", slug });
  }
  for (const slug of csv("best")) {
    entities.push({ kind: "best", slug });
  }
  for (const slug of csv("guides")) {
    entities.push({ kind: "guide", slug });
  }
  for (const slug of csv("comparisons")) {
    entities.push({ kind: "comparison", slug });
  }
  for (const slug of csv("alternatives")) {
    entities.push({ kind: "alternatives", slug });
  }

  const urls = csv("urls");

  if (!entities.length && !urls.length) {
    console.error(
      "Nothing to submit. Example:\n" +
        "  npm run indexnow:notify -- --dry-run --reviews=nike-vomero-18",
    );
    process.exit(2);
  }

  const result = await notifyIndexNow({
    entities,
    urls,
    mode,
    dryRun,
    logger,
  });

  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        skipped: result.skipped,
        reason: result.reason,
        mode,
        submitted: result.submitted,
        batches: result.batches,
        rejectedCount: result.rejectedCount,
        urls: result.urls,
        errors: result.errors,
      },
      null,
      2,
    ),
  );

  if (!result.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
