/**
 * Fix 54 post-pass: review-only READY / uniqueness / eligibility recount.
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-54-recount.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  assessEditorialReadiness,
  assessReviewLaunchQuality,
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import { isContentUniquenessReviewHeld } from "@/content/launch/content-uniqueness-holds";
import { isBlockedEvidenceReview } from "@/content/launch/blocked-evidence-reviews";
import { resolveEntityVerticalPolicy } from "@/content/launch/vertical-strategy";
import { getProductById, getReviews } from "@/repositories";
import {
  classifyUniqueness,
  normalizeText,
  scrubEntityNames,
  jaccard,
  tokenize,
  shingles,
  scaffoldHitCount,
} from "@/domain/content-uniqueness/text";
import { getBrandById } from "@/repositories";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";

const PROD = { isDev: false as const };

function reviewText(review: ReturnType<typeof getReviews>[0]): string {
  const product = getProductById(review.productId, PROD);
  const brand = product ? getBrandById(product.brandId, PROD) : undefined;
  const r = product ? enrichReviewForPage(review, product, { brand }) : review;
  return [
    r.summary,
    r.verdict,
    r.bottomLine,
    r.testingContext,
    ...(r.pros ?? []),
    ...(r.cons ?? []),
    ...(r.whoShouldBuy ?? []),
    ...(r.whoShouldAvoid ?? []),
    ...(r.sections ?? []).map((s) => `${s.heading}\n${s.body}`),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function namesFor(review: ReturnType<typeof getReviews>[0]): string[] {
  const product = getProductById(review.productId, PROD);
  const brand = product ? getBrandById(product.brandId, PROD) : undefined;
  return [product?.name, product?.fullName, brand?.name].filter(
    Boolean,
  ) as string[];
}

function verticalBucket(product: ReturnType<typeof getProductById>): string {
  const sports = product?.sportIds ?? [];
  if (sports.includes("sport-padel")) return "Padel";
  if (sports.includes("sport-tennis")) return "Tennis";
  if (sports.includes("sport-racket")) return "Racket";
  if (sports.includes("sport-hyrox")) return "HYROX";
  if (sports.includes("sport-training") || sports.includes("sport-calisthenics")) {
    return "Fitness";
  }
  const cat = product?.categoryId ?? "";
  if (/cycl/i.test(cat)) return "Cycling";
  if (/recover/i.test(cat)) return "Recovery";
  if (resolveEntityVerticalPolicy(sports).slug === "running") return "Running";
  if (/fitness|gym|strength|hyrox|rower|bike|erg/i.test(cat)) return "Fitness";
  if (/padel/i.test(cat)) return "Padel";
  if (/tennis/i.test(cat)) return "Tennis";
  if (/racket|racquet/i.test(cat)) return "Racket";
  return "Other";
}

async function main(): Promise<void> {
  const reviews = getReviews(PROD);
  const items = reviews.map((review) => {
    const product = getProductById(review.productId, PROD);
    const text = normalizeText(
      scrubEntityNames(reviewText(review), namesFor(review)),
    );
    const toks = tokenize(text);
    return {
      review,
      product,
      text,
      toks: new Set(toks),
      shingles: shingles(toks, 3),
      categoryId: product?.categoryId ?? "unknown",
    };
  });

  const byCat = new Map<string, typeof items>();
  for (const it of items) {
    const list = byCat.get(it.categoryId) ?? [];
    list.push(it);
    byCat.set(it.categoryId, list);
  }

  type Row = {
    slug: string;
    ready: boolean;
    indexable: boolean;
    quality: string;
    clusterClass: string;
    maxPeer: number;
    peer: string;
    vertical: string;
    categoryId: string;
    eligReasons: string;
    workState?: string;
    gaps: string;
    held: boolean;
    blockedEvidence: boolean;
  };
  const rows: Row[] = [];

  for (const it of items) {
    let max = 0;
    let peer = "";
    const catItems = byCat.get(it.categoryId) ?? [];
    for (const other of catItems) {
      if (other.review.slug === it.review.slug) continue;
      const s = Math.max(
        jaccard(it.toks, other.toks),
        jaccard(it.shingles, other.shingles),
      );
      if (s > max) {
        max = s;
        peer = other.review.slug;
      }
    }
    const cls = classifyUniqueness({
      maxPeerSimilarity: max,
      scaffoldHits: scaffoldHitCount(it.text),
      uniqueSignalRatio: 0.5,
    });
    const quality = assessReviewLaunchQuality(it.review, PROD);
    const editorial = assessEditorialReadiness(
      { kind: "review", entity: it.review },
      PROD,
    );
    const elig = getLaunchEligibility({ kind: "review", entity: it.review }, PROD);
    rows.push({
      slug: it.review.slug,
      ready: editorial.ready,
      indexable: isIndexableEligibility(elig),
      quality: quality.quality,
      clusterClass: cls,
      maxPeer: max,
      peer,
      vertical: verticalBucket(it.product),
      categoryId: it.categoryId,
      eligReasons: elig.reasons.map((r) => r.code).join("|"),
      workState: editorial.workState,
      gaps: editorial.gaps.join(";"),
      held: isContentUniquenessReviewHeld(it.review.slug),
      blockedEvidence: isBlockedEvidenceReview(it.review.slug),
    });
  }

  const stats = {
    total: rows.length,
    READY: rows.filter((r) => r.ready).length,
    INDEXABLE: rows.filter((r) => r.indexable).length,
    HELD: rows.filter((r) => !r.indexable).length,
    DUPLICATIVE_quality: rows.filter((r) => r.quality === "DUPLICATIVE").length,
    THIN: rows.filter((r) => r.quality === "THIN").length,
    BLOCKED: rows.filter((r) => r.quality === "BLOCKED").length,
    LAUNCH_READY: rows.filter((r) => r.quality === "LAUNCH_READY").length,
    clusterNeedsDiff: rows.filter((r) => r.clusterClass === "NEEDS_DIFFERENTIATION").length,
    clusterDuplicative: rows.filter((r) => r.clusterClass === "DUPLICATIVE").length,
    indexableNeedsDiff: rows.filter(
      (r) => r.indexable && r.clusterClass === "NEEDS_DIFFERENTIATION",
    ).length,
    indexableDuplicative: rows.filter(
      (r) => r.indexable && r.clusterClass === "DUPLICATIVE",
    ).length,
    uniquenessHolds: rows.filter((r) => r.held).length,
    blockedEvidence: rows.filter((r) => r.blockedEvidence).length,
    notReady: rows.filter((r) => !r.ready),
    verticalHoldReady: rows.filter(
      (r) => r.ready && !r.indexable && r.eligReasons.includes("vertical_hold"),
    ).length,
    readyByVertical: {} as Record<string, number>,
    heldByVertical: {} as Record<string, number>,
  };

  for (const r of rows) {
    if (r.ready) stats.readyByVertical[r.vertical] = (stats.readyByVertical[r.vertical] ?? 0) + 1;
    if (!r.indexable) stats.heldByVertical[r.vertical] = (stats.heldByVertical[r.vertical] ?? 0) + 1;
  }

  mkdirSync(join(process.cwd(), "docs/prelaunch/data"), { recursive: true });
  writeFileSync(
    join(process.cwd(), "docs/prelaunch/data/54-recount.json"),
    JSON.stringify(stats, null, 2),
  );
  console.log(JSON.stringify({ ...stats, notReady: stats.notReady.map((r) => ({
    slug: r.slug,
    quality: r.quality,
    clusterClass: r.clusterClass,
    gaps: r.gaps,
    eligReasons: r.eligReasons,
    vertical: r.vertical,
  })) }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
