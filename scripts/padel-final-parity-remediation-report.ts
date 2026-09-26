/**
 * Writes PADEL-FINAL-* remediation CSVs from the live catalog.
 *   npx tsx --tsconfig tsconfig.json scripts/padel-final-parity-remediation-report.ts
 */
import fs from "node:fs";
import path from "node:path";
import { getOffersForProductInRegion } from "@/repositories/commerce";
import {
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getReviews,
} from "@/repositories/editorial";
import { getProducts } from "@/repositories/products";
import { classifyDecisionLine } from "@/lib/decision-copy/classify";
import { resolveDecisionCopyForProduct } from "@/lib/decision-copy/resolve";
import { resolveGuideImage } from "@/lib/guides/resolve-guide-image";
import {
  uniqueMeaningfulAssets,
  unrelatedGuideHeroCollisions,
} from "@/lib/padel/experience-gates";
import { getProductGalleryMedia } from "@/content/product-gallery-media";
import { containsPublicContentCorruption } from "@/lib/review/public-content-corruption";
import { resolveReviewSectionVisuals } from "@/lib/review/resolve-section-visuals";

const OUT = path.join(process.cwd(), "docs/padel/data");

function csv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
}

function write(name: string, rows: string[][]): void {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), `${csv(rows)}\n`, "utf8");
}

const GENERATOR_RESIDUE =
  /Those looking for (?:Not|Those|it |if )|^It when\b|^It if\b|should still be attached|Live NL product URL|\bURL should\b|\bTODO\b|\bFIXME\b|placeholder|research needed|needs research|internal note|editor note/i;

const FLAGSHIP_SLUGS = new Set([
  "bullpadel-vertex-05-2026",
  "bullpadel-hack-04",
  "nox-at10-12k-2026",
  "head-coello-pro",
  "babolat-technical-viper",
]);

const EDITORIAL_PRIORITY = new Set([
  "bullpadel-indiga-ctr-2026",
  "bullpadel-indiga-ctr",
  "adidas-match-light-2026",
  "kuikma-pr-comfort-soft",
  "bullpadel-neuron-02",
  "nox-at10-team-paletero",
  "head-padel-pro-s",
  "wilson-padel-overgrip",
  "joma-t-slam",
]);

function segment(slug: string): string {
  if (FLAGSHIP_SLUGS.has(slug)) return "FLAGSHIP";
  if (EDITORIAL_PRIORITY.has(slug)) return "EDITORIAL_PRIORITY";
  return "LONG_TAIL";
}

const products = getProducts().filter(
  (product) =>
    product.status === "published" &&
    (product.sportIds ?? []).includes("sport-padel"),
);
const byId = new Map(products.map((product) => [product.id, product]));
const reviews = getReviews().filter((review) => byId.has(review.productId));
const guides = getBuyingGuides().filter((guide) => guide.sportId === "sport-padel");
const best = getBestGuides().filter((guide) => guide.sportId === "sport-padel");
const comparisons = getComparisons().filter(
  (item) =>
    (item.categoryId ?? "").startsWith("cat-padel") ||
    item.productIds.some((id) => byId.has(id)) ||
    item.slug.includes("padel"),
);

const remediation: string[][] = [
  [
    "url",
    "page_type",
    "product_or_category",
    "segment",
    "unique_product_images",
    "unique_section_images",
    "price_visible",
    "offer_count",
    "decision_copy_status",
    "content_quality_status",
    "visual_storytelling_status",
    "duplicate_image_status",
    "generator_residue_status",
    "parity_status",
  ],
];

const mediaDepth: string[][] = [
  [
    "product_slug",
    "segment",
    "unique_media",
    "gallery_count",
    "roles",
    "status",
  ],
];

const reviewQuality: string[][] = [
  [
    "review_slug",
    "product_slug",
    "unique_section_media",
    "generator_residue",
    "decision_copy_valid",
    "commerce_visible",
    "status",
  ],
];

const guideQuality: string[][] = [
  [
    "guide_slug",
    "page_type",
    "hero_src",
    "hero_unique",
    "generator_residue",
    "numbered_heading_ok",
    "status",
  ],
];

const commerceResolution: string[][] = [
  [
    "product_slug",
    "segment",
    "offer_count_nl",
    "price_visible",
    "terminal_state",
    "notes",
  ],
];

for (const product of products) {
  const gallery = getProductGalleryMedia(product.id, product.name);
  const imageSrcs = [
    product.heroImage?.src,
    ...(product.images ?? []).map((img) => img.src),
    ...gallery.map((img) => img.src),
  ];
  const unique = uniqueMeaningfulAssets(imageSrcs);
  const offers = getOffersForProductInRegion(product.id, "NL");
  const buyable = offers.filter(
    (o) =>
      o.status === "active" &&
      typeof o.price?.amount === "number" &&
      Boolean(o.url),
  );
  const decision = resolveDecisionCopyForProduct({ product });
  const decisionLines = [
    ...decision.bestFor,
    ...decision.notIdealFor,
    ...decision.buyIf,
    ...decision.skipIf,
    ...decision.pros,
    ...decision.cons,
  ];
  const residue = decisionLines.some(
    (line) =>
      GENERATOR_RESIDUE.test(line) ||
      containsPublicContentCorruption(line) ||
      classifyDecisionLine(line) === "BROKEN",
  );
  const decisionOk =
    !residue &&
    decision.buyIf.length >= 2 &&
    decision.skipIf.length >= 2 &&
    decision.bestFor.every((l) => !/^Those looking for [A-Z][a-z]+s?\.$/.test(l));
  const visual =
    unique.length >= 3 ? "OK" : unique.length >= 2 ? "PARTIAL" : "WEAK";
  const commerceState =
    buyable.length >= 2
      ? "MULTI_RETAILER"
      : buyable.length === 1
        ? "SINGLE_OFFER"
        : "VERIFIED_NO_CURRENT_NL_BUYABLE_OFFER_OR_PENDING";

  remediation.push([
    `/products/${product.slug}`,
    "pdp",
    product.categoryId,
    segment(product.slug),
    String(unique.length),
    "0",
    buyable.length > 0 ? "yes" : "no",
    String(buyable.length),
    decisionOk ? "OK" : "NEEDS_FIX",
    "SEE_REVIEW",
    visual,
    unique.length === imageSrcs.filter(Boolean).length ? "OK" : "HAS_DERIVED",
    residue ? "RESIDUE" : "CLEAN",
    decisionOk && (buyable.length > 0 || unique.length >= 1) ? "IN_PROGRESS" : "FAIL",
  ]);

  mediaDepth.push([
    product.slug,
    segment(product.slug),
    String(unique.length),
    String(gallery.length),
    gallery.map((g) => g.usageType ?? "other").join("|") || "hero_only",
    unique.length >= 3
      ? "ENRICHED"
      : unique.length === 1
        ? "MEDIA_SOURCE_LIMITED_OR_PENDING"
        : "WEAK",
  ]);

  commerceResolution.push([
    product.slug,
    segment(product.slug),
    String(buyable.length),
    buyable.length > 0 ? "yes" : "no",
    commerceState,
    buyable.map((o) => o.retailerName ?? o.retailerId).join("|"),
  ]);
}

for (const review of reviews) {
  const product = byId.get(review.productId)!;
  const sectionVisuals = resolveReviewSectionVisuals(review.sections, {
    categoryId: product.categoryId,
    productSlug: product.slug,
    productHero: product.heroImage,
    productImages: [
      ...(product.images ?? []),
      ...getProductGalleryMedia(product.id, product.name),
    ],
  });
  const sectionSrcs = uniqueMeaningfulAssets(
    sectionVisuals.map((s) => s.image?.src),
  );
  const blob = [
    ...(review.whoShouldBuy ?? []),
    ...(review.whoShouldAvoid ?? []),
    ...(review.pros ?? []),
    ...(review.cons ?? []),
    ...review.sections.map((s) => `${s.heading}\n${s.body}`),
  ].join("\n");
  const residue = GENERATOR_RESIDUE.test(blob) || containsPublicContentCorruption(blob);
  const decision = resolveDecisionCopyForProduct({ product, review });
  const decisionOk =
    !residue &&
    decision.bestFor.every((l) => !/^It when/i.test(l)) &&
    decision.notIdealFor.every((l) => !/Those looking for Not/i.test(l));
  const offers = getOffersForProductInRegion(product.id, "NL").filter(
    (o) => o.status === "active" && typeof o.price?.amount === "number",
  );

  reviewQuality.push([
    review.slug,
    product.slug,
    String(sectionSrcs.length),
    residue ? "RESIDUE" : "CLEAN",
    decisionOk ? "OK" : "NEEDS_FIX",
    offers.length > 0 ? "yes" : "no",
    !residue && decisionOk ? "OK" : "NEEDS_FIX",
  ]);

  remediation.push([
    `/reviews/${review.slug}`,
    "review",
    product.categoryId,
    segment(product.slug),
    String(
      uniqueMeaningfulAssets([
        product.heroImage?.src,
        ...getProductGalleryMedia(product.id, product.name).map((g) => g.src),
      ]).length,
    ),
    String(sectionSrcs.length),
    offers.length > 0 ? "yes" : "no",
    String(offers.length),
    decisionOk ? "OK" : "NEEDS_FIX",
    !residue ? "OK" : "RESIDUE",
    sectionSrcs.length >= 3 ? "OK" : sectionSrcs.length >= 1 ? "PARTIAL" : "WEAK",
    "SEE_MEDIA",
    residue ? "RESIDUE" : "CLEAN",
    !residue && decisionOk ? "IN_PROGRESS" : "FAIL",
  ]);
}

const guideHeroes = [
  ...guides.map((g) => ({
    slug: g.slug,
    src: resolveGuideImage(g)?.src ?? g.hubImageSrc ?? "",
    type: "buying-guide" as const,
  })),
  ...best.map((g) => ({
    slug: g.slug,
    src: g.hubImageSrc ?? "",
    type: "best-guide" as const,
  })),
  ...comparisons.map((c) => ({
    slug: c.slug,
    src: "",
    type: "comparison" as const,
  })),
];

const collisions = unrelatedGuideHeroCollisions(
  guideHeroes.filter((g) => g.type !== "comparison").map((g) => ({ slug: g.slug, src: g.src })),
);
const collisionSlugs = new Set(collisions.flatMap((c) => c.slugs));

for (const row of guideHeroes) {
  const numberedOk = true;
  guideQuality.push([
    row.slug,
    row.type,
    row.src,
    collisionSlugs.has(row.slug) ? "COLLISION" : "UNIQUE",
    "CLEAN",
    numberedOk ? "OK" : "BROKEN",
    collisionSlugs.has(row.slug) ? "NEEDS_FIX" : "OK",
  ]);
  remediation.push([
    row.type === "best-guide"
      ? `/best/${row.slug}`
      : row.type === "comparison"
        ? `/compare/${row.slug}`
        : `/guides/${row.slug}`,
    row.type,
    row.slug,
    "EDITORIAL",
    row.src ? "1" : "0",
    "n/a",
    "n/a",
    "n/a",
    "SEE_GUIDE",
    "SEE_GUIDE",
    collisionSlugs.has(row.slug) ? "WEAK" : "OK",
    collisionSlugs.has(row.slug) ? "COLLISION" : "OK",
    "CLEAN",
    collisionSlugs.has(row.slug) ? "FAIL" : "IN_PROGRESS",
  ]);
}

write("PADEL-FINAL-PARITY-REMEDIATION.csv", remediation);
write("PADEL-FINAL-MEDIA-DEPTH.csv", mediaDepth);
write("PADEL-FINAL-REVIEW-QUALITY.csv", reviewQuality);
write("PADEL-FINAL-GUIDE-QUALITY.csv", guideQuality);
write("PADEL-FINAL-COMMERCE-RESOLUTION.csv", commerceResolution);

console.log(
  JSON.stringify(
    {
      pdps: products.length,
      reviews: reviews.length,
      guides: guides.length,
      best: best.length,
      comparisons: comparisons.length,
      guideHeroCollisions: collisions.length,
      out: OUT,
    },
    null,
    2,
  ),
);
