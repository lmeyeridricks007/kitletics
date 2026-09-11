#!/usr/bin/env tsx
/**
 * Product Review Agent CLI
 *
 * npm run reviews:agent -- --mode=audit --missing
 * npm run reviews:agent -- --mode=audit --product=brooks-adrenaline-gts-25
 * npm run reviews:agent -- --mode=generate --brand=brooks --dry-run
 * npm run reviews:agent -- --mode=full --category=running-shoes --limit=10
 * npm run reviews:agent -- --mode=refresh --stale --dry-run
 * npm run reviews:agent -- --mode=audit --all
 */
import {
  buildReviewAgentCatalog,
  ensureReviewStagingDirs,
  renderReviewAgentReportMarkdown,
  runProductReviewAgent,
  type ReviewAgentFilters,
  type ReviewAgentMode,
  type ReviewPriority,
} from "@/domain/review-agent";

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
  console.log(`Product Review Agent

Usage:
  npm run reviews:agent -- --mode=<audit|research|generate|refresh|repair|full> [filters]

Filters:
  --product=<slug>     Single product slug
  --brand=<slug>       Brand slug
  --category=<slug>    Category slug (e.g. running-shoes)
  --sport=<slug>       Sport slug (e.g. running)
  --missing            Products missing / needing research
  --stale              Stale reviews only
  --all                Full catalog (within other filters)
  --limit=N            Cap products processed
  --priority=P0,P1     Internal priorities only
  --dry-run            Report without staging writes of drafts
  --batch-size=N       Bulk safety batch size (default 50)
  --resume=<sessionId> Resume from checkpoint

Default mode: audit
Default output status for generated drafts: needs-review (never auto-publish)
`);
}

async function main(): Promise<void> {
  if (flag("help") || flag("h")) {
    printHelp();
    return;
  }

  ensureReviewStagingDirs();

  const mode = (arg("mode") ?? "audit") as ReviewAgentMode;
  const allowed: ReviewAgentMode[] = [
    "audit",
    "research",
    "generate",
    "refresh",
    "repair",
    "full",
  ];
  if (!allowed.includes(mode)) {
    console.error(`Invalid mode: ${mode}`);
    process.exit(1);
  }

  const filters: ReviewAgentFilters = {
    productSlug: arg("product"),
    brandSlug: arg("brand"),
    categorySlug: arg("category"),
    sportSlug: arg("sport"),
    missingOnly: flag("missing"),
    staleOnly: flag("stale"),
    all: flag("all"),
    limit: arg("limit") ? Number(arg("limit")) : undefined,
  };

  const priorityRaw = arg("priority");
  if (priorityRaw) {
    filters.priorities = priorityRaw
      .split(",")
      .map((p) => p.trim().toUpperCase()) as ReviewPriority[];
  }

  // Require at least one scope for write modes unless --all/--missing/--stale
  if (
    (mode === "generate" || mode === "full" || mode === "refresh" || mode === "repair") &&
    !filters.productSlug &&
    !filters.brandSlug &&
    !filters.categorySlug &&
    !filters.sportSlug &&
    !filters.missingOnly &&
    !filters.staleOnly &&
    !filters.all &&
    !filters.limit
  ) {
    console.error(
      "Write modes require a scope: --product, --brand, --category, --sport, --missing, --stale, --all, or --limit",
    );
    process.exit(1);
  }

  const catalog = buildReviewAgentCatalog();
  const session = runProductReviewAgent({
    mode,
    filters,
    dryRun: flag("dry-run"),
    batchSize: arg("batch-size") ? Number(arg("batch-size")) : 50,
    resumeSessionId: arg("resume"),
    catalog,
  });

  console.log(renderReviewAgentReportMarkdown(session.report, session));
  console.log(`\nSession: ${session.id} → ${session.status}`);
  console.log(`Staging: data/staging/reviews/`);
  if (flag("dry-run")) {
    console.log(
      `Dry-run: would create/update ${session.report.stagedReviewIds.length} review(s); research required=${session.report.needsResearch}; blocked=${session.report.blocked}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
