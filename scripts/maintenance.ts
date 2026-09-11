#!/usr/bin/env tsx
/**
 * Kitletics catalog maintenance CLI (Prompt 20).
 *
 * Examples:
 *   npm run freshness:scan -- --sport=running --dry-run
 *   npm run brands:monitor -- --brand=asics --dry-run
 *   npm run maintenance:run -- --job=full --sport=running --dry-run
 */
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { productFamilies } from "@/content/families";
import { getOffers } from "@/repositories/commerce";
import { getBestGuides, getComparisons, getReviews } from "@/repositories/editorial";
import { getRecommendations, getEvidence, getAlternatives } from "@/repositories/recommendations";
import {
  runMaintenance,
  DEFAULT_MAINTENANCE_SCHEDULES,
  type MaintenanceJobType,
  FIXTURE_BRAND_LINEUPS,
  FIXTURE_PADEL_LINEUP,
  getOpenMaintenanceTasks,
  queueCounts,
  renderMaintenanceReport,
} from "@/domain/freshness";

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function buildCatalog() {
  return {
    products,
    brands,
    families: productFamilies,
    recommendations: getRecommendations(),
    guides: getBestGuides({ isDev: true }),
    comparisons: getComparisons({ isDev: true }),
    alternatives: getAlternatives(),
    offers: getOffers(),
    reviews: getReviews({ isDev: true }),
    evidence: getEvidence(),
  };
}

function resolveJob(cmd: string): MaintenanceJobType {
  const map: Record<string, MaintenanceJobType> = {
    "freshness:scan": "freshness-scan",
    "products:stale": "product-stale",
    "brands:monitor": "brand-monitor",
    "offers:refresh": "offers-refresh",
    "evidence:check": "evidence-check",
    "media:check": "media-check",
    "guides:review-due": "guides-review-due",
    "review-maintenance": "review-maintenance",
    "reviews:maintenance": "review-maintenance",
    "content:freshness": "content-freshness",
    "content:claims": "content-claims",
    "commerce:freshness": "commerce-freshness",
    "maintenance:run": (arg("job") as MaintenanceJobType) || "full",
    "maintenance:qa": "qa",
  };
  return map[cmd] ?? ((arg("job") as MaintenanceJobType) || "full");
}

async function main() {
  const cmd = process.argv[2] ?? "maintenance:run";

  if (cmd === "queue" || cmd === "maintenance:queue") {
    const open = getOpenMaintenanceTasks();
    console.log("=== Maintenance queue ===");
    console.log(queueCounts(open));
    for (const t of open.slice(0, 30)) {
      console.log(`[${t.priority}] ${t.type} ${t.title}`);
    }
    return;
  }

  if (cmd === "schedules") {
    console.log(JSON.stringify(DEFAULT_MAINTENANCE_SCHEDULES, null, 2));
    return;
  }

  const jobType = resolveJob(cmd);
  const dryRun = hasFlag("dry-run") || !hasFlag("write");
  const catalog = buildCatalog();

  const brandLineups = { ...FIXTURE_BRAND_LINEUPS };
  if (arg("brand")?.toLowerCase().includes("bull") || arg("sport") === "padel") {
    brandLineups["brand-bullpadel"] = FIXTURE_PADEL_LINEUP;
  }

  const contentTargets =
    jobType === "content-freshness" ||
    jobType === "content-claims" ||
    jobType === "full" ||
    jobType === "qa"
      ? catalog.guides.map((g) => ({
          id: g.id,
          entityType: "best-guide" as const,
          title: g.title,
          body: [g.subtitle, g.shortDescription, g.title].filter(Boolean).join("\n"),
        }))
      : undefined;

  const result = runMaintenance(catalog, {
    jobType,
    dryRun,
    scope: {
      sport: arg("sport"),
      category: arg("category"),
      brand: arg("brand"),
      product: arg("product"),
      region: arg("region"),
      limit: arg("limit") ? Number(arg("limit")) : undefined,
    },
    brandLineups,
    contentTargets,
  });

  console.log(renderMaintenanceReport(result));
  if (result.reportPath) {
    console.log(`Report: ${result.reportPath}`);
  }
  console.log(
    dryRun
      ? "Dry run (default). Pass --write to persist queue."
      : "Queue persisted under data/staging/maintenance/",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
