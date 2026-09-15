#!/usr/bin/env npx tsx
/** Snapshot for PADEL-REVIEW-PARITY-REMEDIATION.md */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getReviews, getProductById, getBrandById } from "@/repositories";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";

const padel = getReviews({ isDev: true }).filter((r) => {
  const p = getProductById(r.productId, { isDev: true });
  return p?.categoryId?.startsWith("cat-padel-");
});

const remediatingIds = [
  "review-adidas-courtquick",
  "review-hesacore-padel",
  "review-bullpadel-hac-overgrip",
  "review-nox-at10-team-bag",
  "review-bullpadel-pascal-box",
  "review-adidas-crazyquick-boost-m",
  "review-joma-t-slam",
  "review-nox-at10-lux",
  "review-head-sprint-pro-4-padel",
  "review-head-padel-pro-s",
];

const rows = padel.map((r) => {
  const p = getProductById(r.productId, { isDev: true })!;
  const brand = getBrandById(p.brandId, { isDev: true });
  const hero = getPrimaryProductMedia(p);
  const enriched = enrichReviewForPage(r, p, { brand, productHero: hero });
  const skip =
    /buying checklist|before you buy|decision guide|methodology|sources|who should/i;
  const major = enriched.sections.filter(
    (s) => !skip.test(`${s.id} ${s.heading}`),
  );
  const imaged = major.filter((s) => s.image?.src);
  const srcs = imaged.map((s) => s.image!.src);
  return {
    reviewId: r.id,
    slug: r.slug,
    category: p.categoryId.replace("cat-padel-", ""),
    reviewType: r.reviewType,
    hasExactHero: Boolean(hero),
    majorSections: major.length,
    sectionImages: imaged.length,
    uniqueSrcs: new Set(srcs).size,
    buyIf: r.whoShouldBuy?.length ?? 0,
    skipIf: r.whoShouldAvoid?.length ?? 0,
    remediating: remediatingIds.includes(r.id),
    parityReady:
      Boolean(hero) &&
      imaged.length >= 6 &&
      new Set(srcs).size === srcs.length &&
      r.reviewType === "expert-research" &&
      (r.whoShouldBuy?.length ?? 0) >= 2,
  };
});

const out = {
  asOf: "2026-09-14",
  reviewsTotal: rows.length,
  rewrittenSoftBlueprints: [
    "review-head-padel-pro-s",
    "review-nox-at10-team-bag",
    "review-bullpadel-pascal-box",
  ],
  heroesFixed: [
    "review-adidas-crazyquick-boost-m",
    "review-joma-t-slam",
    "review-nox-at10-lux",
    "review-head-sprint-pro-4-padel",
    "review-adidas-courtquick",
  ],
  sectionImagesGeneratedFor: [
    "adidas-courtquick-padel",
    "hesacore-padel-grip",
    "bullpadel-hac-overgrip",
    "nox-at10-team-paletero",
    "bullpadel-pascal-box-3b",
    "head-padel-pro-s",
  ],
  comparisonVisualsAdded: 0,
  noteComparisonVisuals:
    "Running reviews use product-card alternatives/comparisons, not separate comparison stock images. Same pattern.",
  parityReady: rows.filter((r) => r.parityReady).length,
  stillBlocked: rows.filter((r) => !r.parityReady).map((r) => r.reviewId),
  rows,
};

writeFileSync(
  join(
    process.cwd(),
    "docs/padel/data/PADEL-REVIEW-PARITY-REMEDIATION-COUNTS.json",
  ),
  JSON.stringify(out, null, 2),
);
console.log(
  JSON.stringify(
    {
      reviewsTotal: out.reviewsTotal,
      parityReady: out.parityReady,
      stillBlocked: out.stillBlocked,
      remediating: rows.filter((r) => r.remediating).length,
    },
    null,
    2,
  ),
);
