/**
 * Writes Padel experience-parity CSVs from the live catalog.
 *   npx tsx --tsconfig tsconfig.json scripts/padel-experience-parity-report.ts
 */
import fs from "node:fs";
import path from "node:path";
import { getOffersForProductInRegion } from "@/repositories/commerce";
import { getBestGuides, getBuyingGuides, getComparisons, getReviews } from "@/repositories/editorial";
import { getProducts } from "@/repositories/products";
import { resolveGuideImage } from "@/lib/guides/resolve-guide-image";
import { isDerivedHeroCrop } from "@/lib/media/semantic-role";
import {
  duplicateReviewBodies,
  presentSpecKeys,
  RACKET_SPEC_KEYS,
  uniqueMeaningfulAssets,
  unrelatedGuideHeroCollisions,
} from "@/lib/padel/experience-gates";
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

function money(amount: number | undefined, currency: string | undefined): string {
  if (amount == null) return "";
  return `${currency ?? ""} ${amount}`.trim();
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

const pdpRows: string[][] = [[
  "slug",
  "category",
  "unique_meaningful_media",
  "gallery_beyond_hero",
  "spec_present",
  "spec_missing",
  "has_verdict",
  "strengths",
  "weaknesses",
  "nl_offers",
  "from_price",
]];

const mediaRows: string[][] = [[
  "surface",
  "slug",
  "asset",
  "role",
  "used_in",
  "duplicate_within_surface",
]];

for (const product of products) {
  const assets = uniqueMeaningfulAssets((product.images ?? []).map((img) => img.src));
  const specRecord = product.specifications as Record<string, unknown>;
  const specs =
    product.categoryId === "cat-padel-rackets"
      ? presentSpecKeys(specRecord, RACKET_SPEC_KEYS)
      : presentSpecKeys(specRecord, Object.keys(specRecord ?? {}));
  const offers = getOffersForProductInRegion(product.id, "NL");
  const priced = offers
    .map((offer) => offer.price?.amount)
    .filter((amount): amount is number => typeof amount === "number");
  const from = priced.length ? Math.min(...priced) : undefined;
  pdpRows.push([
    product.slug,
    product.categoryId,
    String(assets.length),
    String(Math.max(0, assets.length - 1)),
    specs.present.join("|"),
    specs.missing.join("|"),
    product.verdict ? "yes" : "no",
    String(product.strengths?.length ?? 0),
    String(product.weaknesses?.length ?? 0),
    String(offers.length),
    money(from, offers[0]?.price?.currency),
  ]);
  const counts = new Map<string, number>();
  for (const img of product.images ?? []) {
    const src = img.src;
    counts.set(src, (counts.get(src) ?? 0) + 1);
  }
  for (const img of product.images ?? []) {
    mediaRows.push([
      "pdp",
      product.slug,
      img.src,
      isDerivedHeroCrop(img.src) ? "DERIVED_HERO_CROP" : (img.usageType ?? "PRODUCT_HERO"),
      "gallery",
      (counts.get(img.src) ?? 0) > 1 ? "yes" : "no",
    ]);
  }
}

const reviewRows: string[][] = [[
  "slug",
  "review_type",
  "unique_section_images",
  "duplicate_bodies",
  "buy_lines",
  "skip_lines",
  "score_keys",
  "nl_offers",
]];

for (const review of reviews) {
  const product = byId.get(review.productId);
  const visuals = resolveReviewSectionVisuals(review.sections, {
    categoryId: product?.categoryId,
    productSlug: product?.slug,
    productHero: product?.images?.[0],
    productImages: product?.images,
    reviewId: review.id,
  });
  const unique = uniqueMeaningfulAssets(visuals.map((section) => section.image?.src));
  const dupes = duplicateReviewBodies(visuals.map((section) => section.body));
  const offers = product ? getOffersForProductInRegion(product.id, "NL") : [];
  reviewRows.push([
    review.slug,
    review.reviewType,
    String(unique.length),
    String(dupes.length),
    String(review.whoShouldBuy.length),
    String(review.whoShouldAvoid.length),
    review.scoreBreakdown.map((item) => item.key).join("|"),
    String(offers.length),
  ]);
  const used = new Map<string, string[]>();
  for (const section of visuals) {
    if (!section.image?.src) continue;
    const list = used.get(section.image.src) ?? [];
    list.push(section.id);
    used.set(section.image.src, list);
  }
  for (const [asset, sections] of used) {
    mediaRows.push([
      "review",
      review.slug,
      asset,
      isDerivedHeroCrop(asset) ? "DERIVED_HERO_CROP" : "PRODUCT_ANGLE",
      sections.join("|"),
      sections.length > 1 ? "yes" : "no",
    ]);
  }
}

const guideAssignments = [
  ...guides.map((guide) => ({
    slug: guide.slug,
    kind: "buying",
    src: resolveGuideImage(guide).src,
  })),
  ...best.map((guide) => ({
    slug: guide.slug,
    kind: "best",
    src: guide.hubImageSrc ?? "",
  })),
  ...comparisons.map((item) => {
    const heroes = item.productIds
      .slice(0, 2)
      .map((id) => byId.get(id)?.images?.[0]?.src)
      .filter((src): src is string => Boolean(src));
    return {
      slug: item.slug,
      kind: "comparison",
      src: heroes.join(" | "),
    };
  }),
];
const SAME_LEAD_BEST_GUIDES = new Set([
  "padel-bags",
  "padel-bags-with-shoe-compartments",
]);
const withinKind = (kind: string) =>
  unrelatedGuideHeroCollisions(guideAssignments.filter((row) => row.kind === kind));
const buyingCollisions = withinKind("buying");
const bestCollisions = withinKind("best").filter(
  (group) =>
    !(
      group.slugs.length === 2 &&
      group.slugs.every((slug) => SAME_LEAD_BEST_GUIDES.has(slug))
    ),
);
const collisionSlugs = new Set(
  [...buyingCollisions, ...bestCollisions].flatMap((row) => row.slugs),
);
const semanticSameLead = new Set(SAME_LEAD_BEST_GUIDES);

const guideRows: string[][] = [[
  "kind",
  "slug",
  "hero",
  "shared_with_unrelated_guide",
]];
for (const row of guideAssignments) {
  guideRows.push([
    row.kind,
    row.slug,
    row.src,
    collisionSlugs.has(row.slug)
      ? "yes"
      : semanticSameLead.has(row.slug)
        ? "semantic-same-lead"
        : "no",
  ]);
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "PADEL-PDP-PARITY.csv"), `${csv(pdpRows)}\n`);
fs.writeFileSync(path.join(OUT, "PADEL-REVIEW-PARITY.csv"), `${csv(reviewRows)}\n`);
fs.writeFileSync(path.join(OUT, "PADEL-GUIDE-PARITY.csv"), `${csv(guideRows)}\n`);
fs.writeFileSync(path.join(OUT, "PADEL-MEDIA-UNIQUENESS.csv"), `${csv(mediaRows)}\n`);

  const multiPhoto = pdpRows.slice(1).filter((row) => Number(row[3]) >= 1).length;
  const withOffers = pdpRows.slice(1).filter((row) => Number(row[9]) >= 1).length;
console.log(
  JSON.stringify(
    {
      products: products.length,
      pdpsWithExtraPhoto: multiPhoto,
      pdpsWithNlOffer: withOffers,
      reviews: reviews.length,
      reviewsWithDuplicateBodies: reviewRows.slice(1).filter((row) => Number(row[3]) > 0).length,
      buyingGuides: guides.length,
      guideHeroCollisions: buyingCollisions.length + bestCollisions.length,
    },
    null,
    2,
  ),
);
