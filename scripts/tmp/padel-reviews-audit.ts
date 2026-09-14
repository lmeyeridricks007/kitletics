/**
 * Padel review estate inventory → stdout JSON for PADEL-REVIEWS-AUDIT.md
 */
import { existsSync } from "node:fs";
import path from "node:path";
import {
  getAuthorById,
  getBrandById,
  getEvidenceForIds,
  getProductById,
  getProducts,
  getReviews,
} from "@/repositories";
import { canPublishReview } from "@/lib/review/can-publish";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import { getPrimaryProductMedia } from "@/lib/product/media";
import { isReportOrJunkVoice } from "@/lib/review/review-voice";
import { countWords } from "@/lib/review/review-longform";
import { padelEstateReviews } from "@/content/padel/reviews";
import { isLegacyPadelBackfillReview } from "@/content/padel/reviews/legacy";
import { reviewsBackfill } from "@/content/reviews-backfill";

const padelCats = new Set([
  "cat-padel-rackets",
  "cat-padel-shoes",
  "cat-padel-grips",
  "cat-padel-balls",
  "cat-padel-bags",
  "cat-padel-accessories",
  "cat-padel-clothing",
]);

function heroOk(product: ReturnType<typeof getProductById>): boolean {
  if (!product) return false;
  const hero = getPrimaryProductMedia(product);
  if (!hero?.src) return false;
  if (hero.src.includes("/fallbacks/") || hero.src.endsWith(".svg")) return false;
  const abs = path.join(process.cwd(), "public", hero.src.replace(/^\//, ""));
  return existsSync(abs);
}

function sectionImageCount(slug: string): number {
  const dir = path.join(
    process.cwd(),
    "public",
    "images",
    "padel",
    "products",
    slug,
    "sections",
  );
  if (!existsSync(dir)) return 0;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readdirSync } = require("node:fs") as typeof import("node:fs");
  return readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).length;
}

const products = getProducts({ isDev: true }).filter((p) =>
  padelCats.has(p.categoryId),
);
const reviews = getReviews({ isDev: true }).filter((r) => {
  const p = getProductById(r.productId, { isDev: true });
  return p && padelCats.has(p.categoryId);
});

const estateIds = new Set(padelEstateReviews.map((r) => r.id));
const quarantined = reviewsBackfill.filter(isLegacyPadelBackfillReview);

type Row = {
  reviewId: string;
  slug: string;
  productId: string;
  category: string;
  status: string;
  lifecycle: string;
  reviewType: string;
  estate: boolean;
  ready: boolean;
  blockedReasons: string[];
  words: number;
  thin: boolean;
  missingEvidence: boolean;
  missingImages: boolean;
  firstHandVoice: boolean;
};

const rows: Row[] = [];

for (const review of reviews) {
  const product = getProductById(review.productId, { isDev: true });
  if (!product) continue;
  const brand = getBrandById(product.brandId);
  const evidence = getEvidenceForIds(review.evidenceIds ?? []);
  const author = review.reviewerId ? getAuthorById(review.reviewerId) : null;
  const gate = canPublishReview({
    review,
    product,
    author,
    evidence,
  });
  const enriched = enrichReviewForPage(review, product, { brand });
  const decisionText = [
    enriched.summary,
    enriched.verdict,
    ...enriched.sections
      .filter((s) => !/method|sources/i.test(`${s.id} ${s.heading}`))
      .map((s) => s.body),
  ].join("\n");
  const text = [
    enriched.summary,
    enriched.verdict,
    ...enriched.sections.map((s) => s.body),
  ].join("\n");
  const words = countWords(text);
  const missingEvidence = evidence.length === 0;
  const images = sectionImageCount(product.slug);
  const missingImages = images < 6 || !heroOk(product);
  const thin = words < 2500 || (review.sections?.length ?? 0) < 8;
  const junkVoice = isReportOrJunkVoice(decisionText);
  const blockedReasons: string[] = [];
  if (!gate.ok) blockedReasons.push(...gate.issues.map((i) => i.code));
  if (missingEvidence) blockedReasons.push("missing-evidence");
  if (!heroOk(product)) blockedReasons.push("missing-hero");
  if (missingImages) blockedReasons.push("missing-section-images");
  if (product.status !== "published") blockedReasons.push("product-not-published");
  if (junkVoice) blockedReasons.push("junk-voice");
  if (thin) blockedReasons.push("thin");

  const ready =
    estateIds.has(review.id) &&
    review.reviewType === "expert-research" &&
    gate.ok &&
    !missingEvidence &&
    heroOk(product) &&
    product.status === "published" &&
    !junkVoice;

  rows.push({
    reviewId: review.id,
    slug: review.slug,
    productId: review.productId,
    category: product.categoryId,
    status: `${review.status}/${product.status}`,
    lifecycle: product.lifecycleStatus,
    reviewType: review.reviewType,
    estate: estateIds.has(review.id),
    ready,
    blockedReasons,
    words,
    thin,
    missingEvidence,
    missingImages,
    firstHandVoice: /we tested|I hit with|on-court test we ran/i.test(text),
  });
}

const byType = {
  "first-hand-test": reviews.filter((r) => r.reviewType === "first-hand-test").length,
  "expert-research": reviews.filter((r) => r.reviewType === "expert-research").length,
  hybrid: reviews.filter((r) => r.reviewType === "hybrid").length,
};

const out = {
  catalogPadelProducts: products.length,
  publishedPadelProducts: products.filter((p) => p.status === "published").length,
  livePadelReviews: reviews.length,
  estateReviews: padelEstateReviews.length,
  quarantinedBackfill: quarantined.length,
  ready: rows.filter((r) => r.ready).length,
  blocked: rows.filter((r) => !r.ready).length,
  byType,
  missingEvidence: rows.filter((r) => r.missingEvidence).length,
  missingImages: rows.filter((r) => r.missingImages).length,
  thinReviews: rows.filter((r) => r.thin).length,
  rows,
};

console.log(JSON.stringify(out, null, 2));
