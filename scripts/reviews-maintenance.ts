#!/usr/bin/env tsx
/**
 * Product Review maintenance — scans stale/missing/blocked Reviews,
 * creates maintenance tasks, optionally runs safe refresh audits, writes backlog.
 *
 * npm run reviews:maintenance
 * npm run reviews:maintenance -- --dry-run
 * npm run reviews:maintenance -- --refresh-safe
 */
import {
  runMaintenance,
  renderMaintenanceReport,
  getOpenMaintenanceTasks,
} from "@/domain/freshness";
import { buildReviewAgentCatalog } from "@/domain/review-agent/catalog";
import {
  computeReviewPriority,
  buildPriorityIndex,
} from "@/domain/review-agent/priority";
import { determineCoverageStatus } from "@/domain/review-agent/coverage";
import { computeReviewReadiness } from "@/domain/review-agent/readiness";
import { evaluateReviewFreshness } from "@/domain/review-agent/staleness";
import { writeReviewBacklog, type ReviewBacklogItem } from "@/domain/review-agent/backlog";
import { runProductReviewAgent } from "@/domain/review-agent/orchestrator";
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { productFamilies } from "@/content/families";
import { getOffers } from "@/repositories/commerce";
import { getBestGuides, getComparisons, getReviews } from "@/repositories/editorial";
import {
  getRecommendations,
  getEvidence,
  getAlternatives,
  getEvidenceForIds,
} from "@/repositories/recommendations";

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function main() {
  const dryRun = flag("dry-run");
  const catalog = {
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

  const result = runMaintenance(catalog, {
    jobType: "review-maintenance",
    dryRun,
  });
  console.log(renderMaintenanceReport(result));

  const reviewCatalog = buildReviewAgentCatalog();
  const signalsFor = buildPriorityIndex({
    bestGuideProductIds: reviewCatalog.bestGuideProductIds,
    comparisonProductIds: reviewCatalog.comparisonProductIds,
    gearSetupProductIds: reviewCatalog.gearSetupProductIds,
    featuredHubProductIds: reviewCatalog.featuredHubProductIds,
    finderCandidateIds: reviewCatalog.finderCandidateIds,
    majorFamilyProductIds: reviewCatalog.families
      .filter((f) => f.productIds.length >= 2)
      .flatMap((f) => f.productIds.slice(0, 1)),
  });

  const backlog: ReviewBacklogItem[] = [];
  for (const product of reviewCatalog.products) {
    if (product.status === "draft" || product.slug.includes("example")) continue;
    const review = reviewCatalog.reviews.find((r) => r.productId === product.id);
    const evidence = getEvidenceForIds(
      review?.evidenceIds?.length ? review.evidenceIds : product.evidenceIds,
    );
    const priority = computeReviewPriority(product, signalsFor(product.id));
    const readiness = computeReviewReadiness({ product, review, evidence });
    const { status, reasons } = determineCoverageStatus({
      product,
      review,
      evidence,
      priority,
      readiness,
    });

    if (status === "complete") {
      if (review) {
        const fresh = evaluateReviewFreshness({
          categoryId: product.categoryId,
          lastVerifiedAt: review.lastVerifiedAt,
          updatedAt: review.updatedAt,
        });
        if (fresh.band === "fresh") continue;
      } else continue;
    }

    if (status === "not-required") continue;

    let statusOut: ReviewBacklogItem["status"] = status;
    let action = `npm run reviews:agent -- --mode=full --product=${product.slug}`;
    if (review?.status === "review") {
      statusOut = "media-blocked";
      action = "Supply authentic product media, then publish Review";
    } else if (status === "needs-research") {
      statusOut = "research-task";
      action = `Research independent evidence; then reviews:agent --mode=generate --product=${product.slug}`;
    } else if (status === "needs-refresh") {
      action = `npm run reviews:agent -- --mode=refresh --product=${product.slug}`;
    }

    backlog.push({
      productId: product.id,
      productSlug: product.slug,
      productName: product.fullName,
      brandId: product.brandId,
      categoryId: product.categoryId,
      priority,
      status: statusOut,
      reason: reasons.join("; ") || status,
      requiredAction: action,
      reviewId: review?.id,
    });
  }

  const paths = writeReviewBacklog(backlog);
  console.log(`\nBacklog: ${backlog.length} items`);
  console.log(`→ ${paths.jsonPath}`);
  console.log(`→ ${paths.mdPath}`);

  if (flag("refresh-safe") && !dryRun) {
    // Safe: audit + refresh only stale published Reviews (no inventing first-hand)
    const session = runProductReviewAgent({
      mode: "refresh",
      filters: { staleOnly: true, limit: 25 },
      dryRun: false,
      batchSize: 25,
      catalog: reviewCatalog,
    });
    console.log(
      `\nSafe refresh session ${session.id}: refreshed=${session.report.refreshed} created=${session.report.created}`,
    );
  }

  const open = getOpenMaintenanceTasks().filter((t) => t.type === "review-refresh");
  console.log(`Open review-refresh maintenance tasks: ${open.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
