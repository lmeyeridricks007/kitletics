/**
 * Review lifecycle CI gate.
 * Fail on published invalid Reviews / first-hand without evidence / internal wording / broken routes.
 * Warn on stale, missing alts, weak coverage.
 *
 * npm run reviews:ci
 */
import { getReviews, getAuthorById } from "@/repositories/editorial";
import { getProductById } from "@/repositories/products";
import { getEvidenceForIds } from "@/repositories/recommendations";
import { canPublishReview } from "@/lib/review/can-publish";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { containsInternalTerminology } from "@/domain/review-agent/validate";
import { getPublicEvidenceCard } from "@/lib/evidence/public-presentation";
import { getEvidence } from "@/repositories/recommendations";
import { evaluateReviewFreshness } from "@/domain/review-agent/staleness";
import { buildReviewAgentCatalog } from "@/domain/review-agent/catalog";
import {
  computeReviewPriority,
  buildPriorityIndex,
} from "@/domain/review-agent/priority";
import { determineCoverageStatus } from "@/domain/review-agent/coverage";
import { computeReviewReadiness } from "@/domain/review-agent/readiness";
import { writeReviewBacklog } from "@/domain/review-agent/backlog";

let failed = 0;
let warned = 0;

function fail(msg: string) {
  failed += 1;
  console.error(`FAIL: ${msg}`);
}
function warn(msg: string) {
  warned += 1;
  console.warn(`WARN: ${msg}`);
}

function main() {
  const reviews = getReviews({ isDev: true });
  console.log(`Review CI — checking ${reviews.length} reviews…`);

  for (const review of reviews) {
    if (review.status === "scheduled" || review.status === "draft") continue;

    const product = getProductById(review.productId, { isDev: true });
    if (review.status === "published" && !product) {
      fail(`${review.slug}: published Review with invalid/missing Product`);
      continue;
    }

    const evidence = getEvidenceForIds(review.evidenceIds);
    const author = review.reviewerId
      ? getAuthorById(review.reviewerId)
      : undefined;

    if (review.status === "published") {
      const gate = canPublishReview({ review, product, author, evidence });
      if (!gate.ok) {
        fail(
          `${review.slug}: publication gate — ${gate.issues.map((i) => i.code).join(", ")}`,
        );
      }
    }

    if (
      (review.reviewType === "first-hand-test" || review.reviewType === "hybrid") &&
      !evidence.some((e) => e.type === "personal-test")
    ) {
      fail(`${review.slug}: first-hand/hybrid without personal-test evidence`);
    }

    const publicBlob = [
      review.summary,
      review.verdict,
      review.bottomLine,
      review.testingContext,
      ...(review.pros ?? []),
      ...(review.cons ?? []),
      ...review.sections.map((s) => s.body),
    ].join("\n");
    if (containsInternalTerminology(publicBlob)) {
      fail(`${review.slug}: internal Prompt/Agent terminology in public copy`);
    }

    // Future product reference leak (generation not yet released)
    if (
      product?.lifecycleStatus === "upcoming" &&
      review.status === "published" &&
      /available now|buy today|in stores now/i.test(publicBlob)
    ) {
      fail(`${review.slug}: upcoming Product Review claims current availability`);
    }

    if (review.status === "published") {
      const page = getReviewPageData(review.slug, { isDev: false });
      if (!page) {
        fail(`${review.slug}: broken Review route (getReviewPageData undefined in prod)`);
      }
      if ((review.alternativeProductIds?.length ?? 0) < 1) {
        warn(`${review.slug}: missing alternatives`);
      }
      if (product) {
        const fresh = evaluateReviewFreshness({
          categoryId: product.categoryId,
          lastVerifiedAt: review.lastVerifiedAt,
          updatedAt: review.updatedAt,
        });
        if (fresh.band === "stale") warn(`${review.slug}: stale Review`);
      }
    }
  }

  for (const e of getEvidence()) {
    const card = getPublicEvidenceCard(e);
    if (containsInternalTerminology(`${card.title}\n${card.body}`)) {
      fail(`evidence ${e.id}: internal wording visible publicly`);
    }
  }

  // Coverage / backlog
  const catalog = buildReviewAgentCatalog();
  const signalsFor = buildPriorityIndex({
    bestGuideProductIds: catalog.bestGuideProductIds,
    comparisonProductIds: catalog.comparisonProductIds,
    gearSetupProductIds: catalog.gearSetupProductIds,
    featuredHubProductIds: catalog.featuredHubProductIds,
    finderCandidateIds: catalog.finderCandidateIds,
    majorFamilyProductIds: catalog.families
      .filter((f) => f.productIds.length >= 2)
      .flatMap((f) => f.productIds.slice(0, 1)),
  });

  let p0 = 0;
  let p0Ready = 0;
  const backlogItems = [];
  for (const product of catalog.products) {
    if (product.status !== "published") continue;
    const priority = computeReviewPriority(product, signalsFor(product.id));
    if (priority !== "P0") continue;
    p0 += 1;
    const review = catalog.reviews.find(
      (r) => r.productId === product.id && r.status === "published",
    );
    const evidence = getEvidenceForIds(
      review?.evidenceIds ?? product.evidenceIds,
    );
    const readiness = computeReviewReadiness({ product, review, evidence });
    const { status, reasons } = determineCoverageStatus({
      product,
      review,
      evidence,
      priority,
      readiness,
    });
    if (status === "complete" && review) p0Ready += 1;
    else if (status !== "not-required") {
      backlogItems.push({
        productId: product.id,
        productSlug: product.slug,
        productName: product.fullName,
        brandId: product.brandId,
        categoryId: product.categoryId,
        priority,
        status,
        reason: reasons.join("; "),
        requiredAction: `reviews:agent --mode=full --product=${product.slug}`,
        reviewId: review?.id,
      });
    }
  }

  writeReviewBacklog(backlogItems);
  const coveragePct = p0 ? Math.round((p0Ready / p0) * 100) : 100;
  console.log(`P0 Review coverage: ${p0Ready}/${p0} (${coveragePct}%)`);
  if (coveragePct < 40) {
    warn(`Low P0 Review coverage (${coveragePct}%)`);
  }

  console.log(`\n${failed} failure(s), ${warned} warning(s)`);
  if (failed > 0) process.exit(1);
}

main();
