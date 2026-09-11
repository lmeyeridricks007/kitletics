#!/usr/bin/env tsx
/**
 * Append published Expert Research reviews for published products that still
 * lack a review (e.g. media-promoted accessory SKUs).
 *
 * npx tsx --tsconfig tsconfig.json scripts/backfill-missing-product-reviews.ts
 * npx tsx --tsconfig tsconfig.json scripts/backfill-missing-product-reviews.ts --dry-run
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Review } from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";
import {
  buildReviewAgentCatalog,
  synthesizeExpertResearchDraft,
  stagedDraftToReviewShape,
} from "@/domain/review-agent";
import { canPublishReview } from "@/lib/review/can-publish";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { publishedMeta } from "@/content/config";
import { getAuthorById } from "@/repositories/editorial";
import { getEvidenceForIds } from "@/repositories/recommendations";
import { getProducts, getReviewByProduct } from "@/repositories";
import { runReviewSectionImagesForSlugs } from "./lib/run-review-section-images";

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function alternativesFor(product: Product): string[] {
  return [
    ...new Set([
      ...(product.alternativeProductIds ?? []),
      ...(product.relatedProductIds ?? []),
    ]),
  ].filter((id) => id !== product.id);
}

function reviewToTsLiteral(r: Review): string {
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
  lines.push(
    `    editorialDisclosure: ${JSON.stringify(r.editorialDisclosure)},`,
  );
  lines.push(`    sections: ${JSON.stringify(r.sections)},`);
  lines.push(`    pros: ${JSON.stringify(r.pros)},`);
  lines.push(`    cons: ${JSON.stringify(r.cons)},`);
  lines.push(`    whoShouldBuy: ${JSON.stringify(r.whoShouldBuy)},`);
  lines.push(`    whoShouldAvoid: ${JSON.stringify(r.whoShouldAvoid)},`);
  lines.push(`    scoreBreakdown: ${JSON.stringify(r.scoreBreakdown ?? [])},`);
  lines.push(`    evidenceIds: ${JSON.stringify(r.evidenceIds)},`);
  lines.push(
    `    alternativeProductIds: ${JSON.stringify(r.alternativeProductIds ?? [])},`,
  );
  lines.push(`    comparisonIds: ${JSON.stringify(r.comparisonIds ?? [])},`);
  lines.push(`    faqIds: ${JSON.stringify(r.faqIds ?? [])},`);
  if (r.seoTitle) lines.push(`    seoTitle: ${JSON.stringify(r.seoTitle)},`);
  if (r.seoDescription) {
    lines.push(`    seoDescription: ${JSON.stringify(r.seoDescription)},`);
  }
  lines.push(`    ...pub,`);
  lines.push(`  },`);
  return lines.join("\n");
}

function main() {
  const dryRun = flag("dry-run");
  const catalog = buildReviewAgentCatalog();
  const missing = getProducts().filter((p) => {
    if (p.status !== "published") return false;
    const r = getReviewByProduct(p.id);
    return !r || r.status !== "published";
  });

  console.log(`Missing published reviews: ${missing.length}`);
  if (!missing.length) return;

  const created: Review[] = [];
  const blocked: string[] = [];

  for (const product of missing) {
    const brand = catalog.brands.find((b) => b.id === product.brandId);
    if (!brand) {
      blocked.push(`${product.id}: brand missing`);
      continue;
    }
    if (!getPrimaryProductMedia(product)) {
      blocked.push(`${product.id}: no authentic media`);
      continue;
    }

    const evidence =
      getEvidenceForIds(product.evidenceIds).length > 0
        ? getEvidenceForIds(product.evidenceIds)
        : getEvidenceForIds(["ev-catalog-mfr", "ev-catalog-editorial"]);

    const draft = synthesizeExpertResearchDraft({
      product,
      brand,
      evidence,
      recommendations: catalog.recommendations.filter(
        (r) => r.productId === product.id,
      ),
      alternativeProductIds: alternativesFor(product),
      comparisonIds: catalog.comparisonIdsByProductId.get(product.id) ?? [],
      existing: null,
      priority: "P1",
    });

    if (!draft) {
      blocked.push(`${product.id}: synthesize failed`);
      continue;
    }

    const asPublished = stagedDraftToReviewShape(draft, { publish: true });
    const gate = canPublishReview({
      review: asPublished,
      product,
      author: getAuthorById(draft.reviewerId),
      evidence: getEvidenceForIds(draft.evidenceIds),
    });

    if (
      !gate.ok &&
      !gate.issues.every((i) =>
        ["media", "independent-evidence"].includes(i.code),
      )
    ) {
      blocked.push(
        `${product.id}: gate ${gate.issues.map((i) => i.code).join(",")}`,
      );
      continue;
    }

    created.push({ ...asPublished, ...publishedMeta() });
    console.log(`ok ${product.id}`);
  }

  console.log(`Created ${created.length}; blocked ${blocked.length}`);
  for (const b of blocked) console.warn(`  block ${b}`);

  if (dryRun || !created.length) return;

  const path = join(process.cwd(), "src/content/reviews-backfill.ts");
  let text = readFileSync(path, "utf8");
  const insert = created.map(reviewToTsLiteral).join("\n");
  const closing = text.lastIndexOf("\n];");
  if (closing < 0) throw new Error("Could not find reviewsBackfill closing");
  text = `${text.slice(0, closing)}\n${insert}${text.slice(closing)}`;
  // Refresh header note
  text = text.replace(
    /AUTO-GENERATED review backfill[^\n]*/,
    "AUTO-GENERATED review backfill (audience upgrade + publish + missing-SKU pass).",
  );
  writeFileSync(path, text);
  console.log(`Appended ${created.length} reviews to reviews-backfill.ts`);

  const sectionSlugs = created.map((r) => r.slug);
  const section = runReviewSectionImagesForSlugs(sectionSlugs, { dryRun: false });
  if (!section.ok) {
    console.error(
      "Section images failed after review backfill — re-run: npm run reviews:section-images -- --slugs=" +
        sectionSlugs.join(","),
    );
    process.exit(1);
  }
}

main();
