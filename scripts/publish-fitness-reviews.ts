#!/usr/bin/env tsx
/**
 * Publish fitness reviews stuck in status: "review" when the product is already published.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/publish-fitness-reviews.ts
 *   npx tsx --tsconfig tsconfig.json scripts/publish-fitness-reviews.ts --dry-run
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Review } from "@/domain/editorial/types";
import { reviewsBackfill } from "@/content/reviews-backfill";
import { publishedMeta } from "@/content/config";
import { getProductById } from "@/repositories";
import { runReviewSectionImagesForSlugs } from "./lib/run-review-section-images";

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function reviewToTsLiteral(r: Review): string {
  const pub = r.status === "published";
  const lines: string[] = [];
  lines.push(`  {`);
  lines.push(`    id: ${JSON.stringify(r.id)},`);
  lines.push(`    slug: ${JSON.stringify(r.slug)},`);
  lines.push(`    productId: ${JSON.stringify(r.productId)},`);
  lines.push(`    title: ${JSON.stringify(r.title)},`);
  if (r.subtitle) lines.push(`    subtitle: ${JSON.stringify(r.subtitle)},`);
  lines.push(`    reviewType: ${JSON.stringify(r.reviewType)},`);
  lines.push(`    bottomLine: ${JSON.stringify(r.bottomLine)},`);
  lines.push(`    verdict: ${JSON.stringify(r.verdict)},`);
  lines.push(`    score: ${r.score},`);
  lines.push(`    summary: ${JSON.stringify(r.summary)},`);
  lines.push(`    reviewerId: ${JSON.stringify(r.reviewerId)},`);
  lines.push(`    testingContext: ${JSON.stringify(r.testingContext)},`);
  lines.push(`    editorialDisclosure: ${JSON.stringify(r.editorialDisclosure)},`);
  lines.push(`    sections: ${JSON.stringify(r.sections)},`);
  lines.push(`    pros: ${JSON.stringify(r.pros)},`);
  lines.push(`    cons: ${JSON.stringify(r.cons)},`);
  lines.push(`    whoShouldBuy: ${JSON.stringify(r.whoShouldBuy)},`);
  lines.push(`    whoShouldAvoid: ${JSON.stringify(r.whoShouldAvoid)},`);
  lines.push(`    scoreBreakdown: ${JSON.stringify(r.scoreBreakdown)},`);
  lines.push(`    evidenceIds: ${JSON.stringify(r.evidenceIds)},`);
  lines.push(`    alternativeProductIds: ${JSON.stringify(r.alternativeProductIds)},`);
  lines.push(`    comparisonIds: ${JSON.stringify(r.comparisonIds)},`);
  lines.push(`    faqIds: [],`);
  if (r.seoTitle) lines.push(`    seoTitle: ${JSON.stringify(r.seoTitle)},`);
  if (r.seoDescription) lines.push(`    seoDescription: ${JSON.stringify(r.seoDescription)},`);
  if (pub) {
    lines.push(`    ...pub,`);
  } else {
    lines.push(`    status: ${JSON.stringify(r.status)},`);
    lines.push(`    createdAt: pub.createdAt,`);
    lines.push(`    updatedAt: pub.updatedAt,`);
    lines.push(`    lastVerifiedAt: pub.lastVerifiedAt,`);
  }
  lines.push(`  }`);
  return lines.join("\n");
}

function writeBackfillFile(reviews: Review[]): string {
  const path = join(process.cwd(), "src/content/reviews-backfill.ts");
  const header = `/**
 * AUTO-GENERATED review backfill (audience upgrade + publish pass).
 * Re-run audience: npm run reviews:upgrade-audience -- --write
 * Re-run publish: npx tsx --tsconfig tsconfig.json scripts/publish-fitness-reviews.ts
 */
import type { Review } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();

export const reviewsBackfill: Review[] = [
`;
  const body = reviews.map(reviewToTsLiteral).join(",\n");
  const file = `${header}${body}\n];\n`;
  writeFileSync(path, file, "utf8");
  return path;
}

function main(): void {
  void publishedMeta;
  const dryRun = flag("dry-run");
  const publishedIds: string[] = [];
  const skipped: string[] = [];

  const next = reviewsBackfill.map((review) => {
    if (review.status !== "review") return review;
    const product = getProductById(review.productId, { isDev: true });
    if (!product || product.status !== "published") {
      skipped.push(review.slug);
      return review;
    }
    publishedIds.push(review.slug);
    return {
      ...review,
      status: "published" as const,
      publishedAt: publishedMeta().publishedAt,
      createdAt: publishedMeta().createdAt,
      updatedAt: publishedMeta().updatedAt,
      lastVerifiedAt: publishedMeta().lastVerifiedAt,
    };
  });

  if (!dryRun) writeBackfillFile(next);

  console.log(
    `${dryRun ? "Dry-run" : "Published"} ${publishedIds.length} fitness reviews (left in review: ${skipped.length})`,
  );
  if (skipped.length) console.log("Skipped (product not published):", skipped.join(", "));

  if (publishedIds.length) {
    const section = runReviewSectionImagesForSlugs(publishedIds, { dryRun });
    if (!section.ok) process.exit(1);
  }
}

main();
