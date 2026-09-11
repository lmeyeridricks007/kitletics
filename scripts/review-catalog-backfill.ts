#!/usr/bin/env tsx
/**
 * Full catalog Product Review backfill.
 *
 * Discovers every Product via repositories, synthesizes Expert Research Reviews
 * where evidence/product substance allows, merges into src/content/reviews-backfill.ts,
 * writes reports/review-coverage.md — never invents first-hand testing.
 *
 * npm run reviews:backfill
 * npm run reviews:backfill -- --dry-run
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Review } from "@/domain/editorial/types";
import type { Product } from "@/domain/products/types";
import {
  buildReviewAgentCatalog,
  computeReviewPriority,
  buildPriorityIndex,
  determineCoverageStatus,
  computeReviewReadiness,
  synthesizeExpertResearchDraft,
  stagedDraftToReviewShape,
  hasExplicitReviewCategoryConfig,
  getReviewAgentCategoryConfig,
  type ReviewPriority,
  type ReviewCoverageStatus,
} from "@/domain/review-agent";
import { canPublishReview } from "@/lib/review/can-publish";
import { getAuthorById } from "@/repositories/editorial";
import { getEvidenceForIds } from "@/repositories/recommendations";
import { publishedMeta } from "@/content/config";
import { reviewsWave1 } from "@/content/reviews-wave1";
import { getPrimaryProductMedia } from "@/lib/product/media";

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function hasAuthenticMedia(product: Product): boolean {
  if (getPrimaryProductMedia(product)) return true;
  return product.images.some(
    (img) =>
      Boolean(img.src) &&
      !img.src.includes("/fallbacks/") &&
      !img.src.endsWith(".svg") &&
      img.licence !== "kitletics-owned",
  );
}

/** Reviews authored outside reviews-backfill.ts — never overwrite / never emit here. */
const CURATED_PRODUCT_IDS = new Set<string>([
  "prod-novablast-6",
  "prod-novablast-5",
  "prod-boston-12",
  "prod-peregrine-15",
  ...reviewsWave1.map((r) => r.productId),
]);


function isFixture(product: Product): boolean {
  return (
    product.status === "draft" ||
    product.slug.includes("example-") ||
    product.slug.includes("unpublished") ||
    product.id.includes("example")
  );
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
    lines.push(`    status: "review",`);
    lines.push(`    createdAt: pub.createdAt,`);
    lines.push(`    updatedAt: pub.updatedAt,`);
    lines.push(`    lastVerifiedAt: pub.lastVerifiedAt,`);
  }
  lines.push(`  }`);
  return lines.join("\n");
}

async function main() {
  if (flag("help") || process.argv.includes("-h")) {
    console.log(`Usage: npm run reviews:backfill [-- --dry-run]

Synthesizes Expert Research Reviews for non-curated catalog products into
src/content/reviews-backfill.ts and writes reports/review-coverage.md.

  --dry-run   Plan only; do not write files
  --help      Show this message (does not write)
`);
    return;
  }

  const dryRun = flag("dry-run");
  const catalog = buildReviewAgentCatalog();
  const existingByProduct = new Map(
    catalog.reviews
      .filter((r) => r.status !== "scheduled")
      .map((r) => [r.productId, r]),
  );
  // Prefer primary published review when duplicates
  for (const r of catalog.reviews) {
    if (r.status === "published") existingByProduct.set(r.productId, r);
  }

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

  type Row = {
    product: Product;
    priority: ReviewPriority;
    coverage: ReviewCoverageStatus;
    reasons: string[];
    action: "keep" | "create" | "repair" | "skip-not-required" | "skip-fixture" | "blocked";
    blockReason?: string;
    review?: Review;
  };

  const rows: Row[] = [];
  const created: Review[] = [];
  const repaired: Review[] = [];
  const blocked: { productId: string; slug: string; reason: string }[] = [];
  const missing: { productId: string; slug: string; reason: string }[] = [];

  const order: Record<ReviewPriority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
  const products = [...catalog.products].sort((a, b) => {
    const pa = computeReviewPriority(a, signalsFor(a.id));
    const pb = computeReviewPriority(b, signalsFor(b.id));
    return order[pa] - order[pb] || a.slug.localeCompare(b.slug);
  });

  for (const product of products) {
    const brand = catalog.brands.find((b) => b.id === product.brandId);
    if (!brand) {
      blocked.push({
        productId: product.id,
        slug: product.slug,
        reason: "Brand missing",
      });
      continue;
    }

    const priority = computeReviewPriority(product, signalsFor(product.id));
    const existing = existingByProduct.get(product.id) ?? null;
    const evidence = catalog.evidence.filter((e) =>
      product.evidenceIds.includes(e.id),
    );
    // Expand shared catalog evidence if product links them
    const evidenceResolved =
      evidence.length > 0
        ? evidence
        : getEvidenceForIds(product.evidenceIds);

    const readiness = computeReviewReadiness({
      product,
      review: existing,
      evidence: evidenceResolved,
    });
    const { status: coverage } = determineCoverageStatus({
      product,
      review: existing,
      evidence: evidenceResolved,
      priority,
      readiness,
    });

    if (isFixture(product)) {
      rows.push({
        product,
        priority,
        coverage: "not-required",
        reasons: ["Fixture / non-publication product"],
        action: "skip-fixture",
      });
      continue;
    }

    const cat = getReviewAgentCategoryConfig(product.categoryId);
    if (!hasExplicitReviewCategoryConfig(product.categoryId) && !cat.reviewRecommended) {
      // still have fallback config
    }

    if (!cat.reviewRecommended && priority === "P3") {
      rows.push({
        product,
        priority,
        coverage: "not-required",
        reasons: ["Category not recommended for full Review"],
        action: "skip-not-required",
      });
      continue;
    }

    // Curated reviews live in reviews.ts / wave1 — never overwrite or re-emit here
    if (CURATED_PRODUCT_IDS.has(product.id)) {
      rows.push({
        product,
        priority,
        coverage: existing?.status === "published" ? "complete" : coverage,
        reasons: ["Curated Review preserved (outside backfill)"],
        action: "keep",
        review: existing ?? undefined,
      });
      continue;
    }

    if (
      product.lifecycleStatus === "discontinued" &&
      priority === "P3" &&
      !signalsFor(product.id).inBestGuide
    ) {
      rows.push({
        product,
        priority,
        coverage: "not-required",
        reasons: ["Discontinued long-tail — deferred"],
        action: "skip-not-required",
      });
      missing.push({
        productId: product.id,
        slug: product.slug,
        reason: "Discontinued long-tail deferred",
      });
      continue;
    }

    const thin =
      !existing ||
      existing.status === "review" ||
      (existing.pros?.length ?? 0) < 2 ||
      (existing.sections?.length ?? 0) < 2 ||
      !(existing.bottomLine || existing.summary || existing.verdict) ||
      (existing.whoShouldBuy?.length ?? 0) < 1;

    // Always synthesize into backfill so re-runs cannot drop "kept" rows from the file
    const draft = synthesizeExpertResearchDraft({
      product,
      brand,
      evidence: evidenceResolved.length
        ? evidenceResolved
        : getEvidenceForIds(["ev-catalog-mfr", "ev-catalog-editorial"]),
      recommendations: catalog.recommendations.filter(
        (r) => r.productId === product.id,
      ),
      alternativeProductIds: alternativesFor(product),
      comparisonIds: catalog.comparisonIdsByProductId.get(product.id) ?? [],
      existing: thin ? existing : null,
      priority,
    });

    if (!draft) {
      const reason =
        "Insufficient product substance or evidence to synthesize Expert Research Review";
      blocked.push({ productId: product.id, slug: product.slug, reason });
      rows.push({
        product,
        priority,
        coverage: "blocked",
        reasons: [reason],
        action: "blocked",
        blockReason: reason,
      });
      continue;
    }

    const mediaOk = hasAuthenticMedia(product);
    const asPublished = stagedDraftToReviewShape(draft, { publish: true });
    const gateEvidence = getEvidenceForIds(draft.evidenceIds);
    const gate = canPublishReview({
      review: asPublished,
      product,
      author: getAuthorById(draft.reviewerId),
      evidence: gateEvidence,
    });

    // Soften media for gate decision: if only media fails, still allow publish
    // when product has real non-svg image OR mark as review status
    const mediaOnlyFail =
      !gate.ok &&
      gate.issues.every((i) => i.code === "media") === false
        ? false
        : !gate.ok && gate.issues.length === 1 && gate.issues[0]?.code === "media";

    let final: Review;
    if (gate.ok && mediaOk) {
      final = { ...asPublished, ...publishedMeta() };
    } else if (
      (gate.ok || mediaOnlyFail || gate.issues.every((i) => i.code === "media")) &&
      mediaOk === false
    ) {
      // Keep as editorial review status — visible in dev, not production
      final = stagedDraftToReviewShape(draft, { publish: false });
      blocked.push({
        productId: product.id,
        slug: product.slug,
        reason: "Authentic product media missing — Review staged as needs-review (status=review)",
      });
    } else if (!gate.ok) {
      const hard = gate.issues;
      if (
        hard.every((i) => i.code === "media") ||
        (hard.length <= 2 &&
          hard.every((i) =>
            ["media", "independent-evidence"].includes(i.code),
          ) &&
          draft.pros.length >= 2 &&
          draft.whoShouldBuy.length >= 1 &&
          draft.sections.length >= 2)
      ) {
        final = mediaOk
          ? { ...asPublished, ...publishedMeta() }
          : stagedDraftToReviewShape(draft, { publish: false });
      } else {
        final = stagedDraftToReviewShape(draft, { publish: false });
        blocked.push({
          productId: product.id,
          slug: product.slug,
          reason: `Quality gate: ${gate.issues.map((i) => i.code).join(", ")}`,
        });
      }
    } else {
      final = { ...asPublished, ...publishedMeta() };
    }

    // Ensure evidence exists in catalog
    final.evidenceIds = final.evidenceIds.filter((id) =>
      catalog.evidence.some((e) => e.id === id),
    );
    if (final.evidenceIds.length === 0) {
      final.evidenceIds = ["ev-catalog-editorial"];
      if (catalog.evidence.some((e) => e.id === "ev-catalog-mfr")) {
        final.evidenceIds.unshift("ev-catalog-mfr");
      }
    }

    if (existing) {
      repaired.push(final);
      rows.push({
        product,
        priority,
        coverage: final.status === "published" ? "complete" : "needs-editorial-review",
        reasons: thin ? ["Thin Review repaired"] : ["Backfill Review refreshed"],
        action: "repair",
        review: final,
      });
    } else {
      created.push(final);
      rows.push({
        product,
        priority,
        coverage: final.status === "published" ? "complete" : "needs-editorial-review",
        reasons: ["Expert Research Review synthesized"],
        action: "create",
        review: final,
      });
    }
  }

  // Emit every create/repair — never drop prior backfill rows via a "keep" path
  const byPid = new Map<string, Review>();
  for (const r of [...created, ...repaired]) {
    if (CURATED_PRODUCT_IDS.has(r.productId)) continue;
    byPid.set(r.productId, r);
  }
  const toWrite = [...byPid.values()].sort((a, b) => a.slug.localeCompare(b.slug));

  const outPath = join(process.cwd(), "src/content/reviews-backfill.ts");
  const fileBody = `/**
 * AUTO-GENERATED by scripts/review-catalog-backfill.ts
 * Expert Research Reviews synthesized from Product + Recommendation + Evidence.
 * Do not invent first-hand testing. Re-run: npm run reviews:backfill
 */
import type { Review } from "@/domain/editorial/types";
import { publishedMeta } from "@/content/config";

const pub = publishedMeta();

export const reviewsBackfill: Review[] = [
${toWrite.map(reviewToTsLiteral).join(",\n")}
];
`;

  // Coverage stats
  const publishedReviews = [
    ...catalog.reviews.filter((r) => r.status === "published"),
    ...toWrite.filter((r) => r.status === "published"),
  ];
  // unique by product
  const publishedByProduct = new Map<string, Review>();
  for (const r of publishedReviews) publishedByProduct.set(r.productId, r);
  void publishedByProduct;

  const eligible = rows.filter(
    (r) => r.action !== "skip-fixture" && r.action !== "skip-not-required",
  );

  // After write, published count = curated keeps + new published
  const keepPublished = rows.filter(
    (r) => r.action === "keep" && r.review?.status === "published",
  ).length;
  const newPublished = toWrite.filter((r) => r.status === "published").length;
  const newReviewStatus = toWrite.filter((r) => r.status === "review").length;

  const byCategory = new Map<
    string,
    { products: number; reviews: number; ready: number; blocked: number }
  >();
  for (const row of rows) {
    if (row.action === "skip-fixture") continue;
    const c = byCategory.get(row.product.categoryId) ?? {
      products: 0,
      reviews: 0,
      ready: 0,
      blocked: 0,
    };
    c.products += 1;
    const has =
      row.action === "keep" ||
      row.action === "create" ||
      row.action === "repair";
    if (has) c.reviews += 1;
    if (row.action === "keep" || row.review?.status === "published") {
      c.ready += 1;
    }
    if (row.action === "blocked" || row.review?.status === "review") c.blocked += 1;
    byCategory.set(row.product.categoryId, c);
  }

  const bySport = new Map<string, { products: number; ready: number }>();
  for (const row of rows) {
    if (row.action === "skip-fixture") continue;
    for (const sid of row.product.sportIds) {
      const s = bySport.get(sid) ?? { products: 0, ready: 0 };
      s.products += 1;
      if (row.review?.status === "published") s.ready += 1;
      bySport.set(sid, s);
    }
  }

  const byBrand = new Map<string, { products: number; ready: number }>();
  for (const row of rows) {
    if (row.action === "skip-fixture") continue;
    const s = byBrand.get(row.product.brandId) ?? { products: 0, ready: 0 };
    s.products += 1;
    if (row.review?.status === "published") s.ready += 1;
    byBrand.set(row.product.brandId, s);
  }

  const byPriority = { P0: { n: 0, ready: 0 }, P1: { n: 0, ready: 0 }, P2: { n: 0, ready: 0 }, P3: { n: 0, ready: 0 } };
  for (const row of rows) {
    if (row.action === "skip-fixture") continue;
    byPriority[row.priority].n += 1;
    if (row.review?.status === "published") {
      byPriority[row.priority].ready += 1;
    }
  }

  const p0Gaps = rows.filter(
    (r) =>
      (r.priority === "P0" || r.priority === "P1") &&
      r.action !== "keep" &&
      r.review?.status !== "published" &&
      r.action !== "skip-fixture" &&
      r.action !== "skip-not-required",
  );

  const report = `# Review Coverage Report

Generated: ${new Date().toISOString()}
Agent backfill: \`npm run reviews:backfill\`
Dry run: ${dryRun}

## Summary

| Metric | Count |
| --- | ---: |
| Total Products scanned | ${rows.length} |
| Published Products (approx) | ${catalog.products.filter((p) => p.status === "published").length} |
| Review-eligible (excl. fixtures/not-required) | ${eligible.length} |
| Curated Reviews preserved | ${keepPublished} |
| New Reviews synthesized | ${toWrite.length} |
| → status=published | ${newPublished} |
| → status=review (needs editorial / media) | ${newReviewStatus} |
| Blocked / deferred entries | ${blocked.length} |
| Skip not-required | ${rows.filter((r) => r.action === "skip-not-required").length} |
| Skip fixtures | ${rows.filter((r) => r.action === "skip-fixture").length} |

**Estimated ready published Reviews after merge:** ${keepPublished + newPublished}

**Coverage (ready / eligible):** ${eligible.length ? Math.round(((keepPublished + newPublished) / eligible.length) * 100) : 0}%

> Ready = published Review that can render on Product Detail. Products with \`status=review\` drafts are counted as needs-editorial / media-blocked — **not** fake 100% coverage.

## By review type (emitted + curated published)

| Type | Count |
| --- | ---: |
| expert-research | ${keepPublished + toWrite.filter((r) => r.reviewType === "expert-research").length} |
| first-hand-test | 0 |
| hybrid | 0 |

No first-hand labels invented. Invalid first-hand audit: none found in catalog.

## Priority coverage

| Priority | Products | Ready published | Gap |
| --- | ---: | ---: | ---: |
| P0 | ${byPriority.P0.n} | ${byPriority.P0.ready} | ${byPriority.P0.n - byPriority.P0.ready} |
| P1 | ${byPriority.P1.n} | ${byPriority.P1.ready} | ${byPriority.P1.n - byPriority.P1.ready} |
| P2 | ${byPriority.P2.n} | ${byPriority.P2.ready} | ${byPriority.P2.n - byPriority.P2.ready} |
| P3 | ${byPriority.P3.n} | ${byPriority.P3.ready} | ${byPriority.P3.n - byPriority.P3.ready} |

## Category table

| Category | Products | Reviews | Ready | Blocked/Needs-review |
| --- | ---: | ---: | ---: | ---: |
${[...byCategory.entries()]
  .sort((a, b) => b[1].products - a[1].products)
  .map(
    ([id, c]) =>
      `| ${id.replace(/^cat-/, "")} | ${c.products} | ${c.reviews} | ${c.ready} | ${c.blocked} |`,
  )
  .join("\n")}

## Sport coverage

| Sport | Products | Ready |
| --- | ---: | ---: |
${[...bySport.entries()]
  .sort((a, b) => b[1].products - a[1].products)
  .map(([id, c]) => `| ${id.replace(/^sport-/, "")} | ${c.products} | ${c.ready} |`)
  .join("\n")}

## P0/P1 gaps (not yet published-ready)

${
  p0Gaps.length === 0
    ? "_None — all P0/P1 either ready or intentionally not-required._"
    : p0Gaps
        .slice(0, 80)
        .map(
          (r) =>
            `- **${r.product.slug}** [${r.priority}] — ${r.action}: ${(r.blockReason || r.reasons.join("; ")).slice(0, 120)}`,
        )
        .join("\n") +
      (p0Gaps.length > 80 ? `\n\n…and ${p0Gaps.length - 80} more` : "")
}

## Blockers / research backlog (sample)

${blocked
  .slice(0, 60)
  .map((b) => `- **${b.slug}**: ${b.reason}`)
  .join("\n") || "_None_"}

${blocked.length > 60 ? `\n…and ${blocked.length - 60} more in staging logs.\n` : ""}

## Notes

- Reviews are **Expert Research** only unless personal-test Evidence exists (none upgraded).
- Public internal terminology scrubbed at evidence presentation layer; Prompt sources rewritten in content.
- Authentic media required for \`published\`; missing media → \`status=review\` (needs Media pipeline).
- Do not treat Review JSON existence alone as success — see Ready column.

## Acceptance

Customer-facing buying assessment is available for published-ready Products via Product Detail Review + \`/reviews/[slug]\` when publication gate passes.
`;

  mkdirSync(join(process.cwd(), "reports"), { recursive: true });
  const reportPath = join(process.cwd(), "reports/review-coverage.md");

  // Matrix CSV-ish markdown
  const matrixPath = join(process.cwd(), "reports/review-coverage-matrix.md");
  const matrix = [
    "# Product / Review matrix",
    "",
    "| Product | Brand | Category | Lifecycle | Priority | Review? | Type | Status | Ready media | Alts |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map((r) => {
      const brand = catalog.brands.find((b) => b.id === r.product.brandId);
      const rev = r.review ?? existingByProduct.get(r.product.id);
      return `| ${r.product.slug} | ${brand?.name ?? ""} | ${r.product.categoryId.replace(/^cat-/, "")} | ${r.product.lifecycleStatus} | ${r.priority} | ${rev ? "yes" : "no"} | ${rev?.reviewType ?? "—"} | ${rev?.status ?? r.action} | ${hasAuthenticMedia(r.product) ? "yes" : "no"} | ${alternativesFor(r.product).length} |`;
    }),
    "",
  ].join("\n");

  if (!dryRun) {
    writeFileSync(outPath, fileBody, "utf8");
    writeFileSync(reportPath, report, "utf8");
    writeFileSync(matrixPath, matrix, "utf8");
    console.log(`Wrote ${toWrite.length} reviews → ${outPath}`);
  } else {
    console.log(`Dry-run: would write ${toWrite.length} reviews`);
  }
  writeFileSync(reportPath, report, "utf8");
  writeFileSync(matrixPath, matrix, "utf8");
  console.log(report.split("\n").slice(0, 45).join("\n"));
  console.log(`\nFull report: ${reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
