/**
 * Review QA — first-hand badge consistency, publication gate, media provenance.
 * Run: npm run reviews:qa
 */
import { getReviews, getProductById, getAuthorById, getEvidenceForIds } from "@/repositories";
import { canPublishReview } from "@/lib/review/can-publish";
import { resolveVisibleReviewType } from "@/lib/review/visible-type";
import { getReviewPageData } from "@/lib/review/get-review-page-data";
import { getPrimaryProductMedia } from "@/lib/product/media";

const FIRST_HAND_CLAIM =
  /\b(we tested|our test|after \d+\s*km|during our testing|we measured|personally tested)\b/i;

let failed = 0;

function fail(msg: string) {
  failed += 1;
  console.error(`FAIL: ${msg}`);
}

function ok(msg: string) {
  console.log(`OK: ${msg}`);
}

function main() {
  const reviews = getReviews({ isDev: true });
  console.log(`Checking ${reviews.length} reviews (dev resolver)…`);

  for (const review of reviews) {
    if (review.status === "scheduled" || review.status === "draft") continue;

    const product = getProductById(review.productId, { isDev: true });
    const author = review.reviewerId
      ? getAuthorById(review.reviewerId)
      : undefined;
    const evidence = getEvidenceForIds(review.evidenceIds);
    const gate = canPublishReview({ review, product, author, evidence });
    if (!gate.ok && review.status === "published") {
      fail(
        `${review.slug}: publication gate — ${gate.issues.map((i) => i.code).join(", ")}`,
      );
    }

    const visible = resolveVisibleReviewType(review, evidence);
    const hasPersonal = evidence.some((e) => e.type === "personal-test");

    if (
      (visible === "first-hand-test" || visible === "hybrid") &&
      !hasPersonal
    ) {
      fail(`${review.slug}: visible first-hand without personal-test evidence`);
    }

    const page = getReviewPageData(review.slug, { isDev: true });
    if (!page) {
      fail(`${review.slug}: getReviewPageData returned undefined`);
      continue;
    }

    if (
      page.visibleTypeMeta.eyebrow.toLowerCase().includes("first-hand") &&
      !page.hasPersonalTest
    ) {
      fail(`${review.slug}: UI eyebrow first-hand without evidence`);
    }

    if (page.showTestingModule && !page.hasPersonalTest) {
      fail(`${review.slug}: testing module without personal-test`);
    }

    const claimBlob = [
      review.summary,
      review.verdict,
      review.bottomLine,
      ...review.sections.map((s) => s.body),
    ].join(" ");
    if (
      FIRST_HAND_CLAIM.test(claimBlob) &&
      !hasPersonal &&
      review.reviewType === "expert-research"
    ) {
      // Soft: warn if language implies personal test
      console.warn(
        `WARN: ${review.slug}: expert-research copy may imply personal testing`,
      );
    }

    const media = getPrimaryProductMedia(product!);
    if (!media) {
      console.warn(`WARN: ${review.slug}: no authentic product hero media`);
    }

    ok(`${review.slug} (${page.visibleReviewType})`);
  }

  // Golden expert-research: Novablast 6
  const nb6 = getReviewPageData("asics-novablast-6", { isDev: false });
  if (!nb6) fail("asics-novablast-6 missing in production resolver");
  else {
    if (nb6.visibleReviewType !== "expert-research")
      fail("NB6 must be expert-research");
    if (nb6.showTestingModule) fail("NB6 must not show testing module");
    if (!nb6.heroImage) fail("NB6 missing hero image");
    ok("Golden expert-research: asics-novablast-6");
  }

  if (failed > 0) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
  }
  console.log("\nAll review QA checks passed.");
}

main();
