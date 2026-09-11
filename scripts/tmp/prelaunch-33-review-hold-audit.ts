/**
 * Fix 33 — review uniqueness hold leakage audit + enrichment queue.
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import {
  getLaunchEligibility,
  isIndexableEligibility,
  shouldPromotePublicly,
} from "../../src/domain/launch";
import { assessReviewLaunchQuality } from "../../src/domain/launch/assess-review-quality";
import { getReviews } from "../../src/repositories/editorial";
import {
  getProductById,
  getBrandById,
} from "../../src/repositories/products";
import {
  getBestGuides,
  getComparisons,
} from "../../src/repositories/editorial";
import sitemapMod from "../../src/app/sitemap";
import { siteConfig } from "../../src/content/config";
import { searchKitletics } from "../../src/lib/search/engine";
import { getReviewsIndexData } from "../../src/lib/review/get-review-page-data";
import { getProductReviewSummary } from "../../src/lib/product/get-product-review-summary";
import { getBestGuidePageData } from "../../src/lib/best/get-best-guide-page-data";

const PROD = { isDev: false as const };
const OUT = "docs/prelaunch/data/rc-final";
mkdirSync(OUT, { recursive: true });
mkdirSync(join(OUT, "logs"), { recursive: true });

const sitemapFn =
  typeof sitemapMod === "function"
    ? sitemapMod
    : (sitemapMod as { default: typeof sitemapMod }).default;

const sitemapPaths = new Set(
  sitemapFn().map((e) => e.url.replace(siteConfig.url, "") || "/"),
);

const reviews = getReviews(PROD);
const byQuality: Record<string, number> = {};
const byDisposition: Record<string, number> = {};
const duplicative: typeof reviews = [];

for (const r of reviews) {
  const assessed = assessReviewLaunchQuality(r, PROD);
  const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
  byQuality[assessed.quality] = (byQuality[assessed.quality] || 0) + 1;
  byDisposition[elig.disposition] = (byDisposition[elig.disposition] || 0) + 1;
  if (assessed.quality === "DUPLICATIVE") duplicative.push(r);
}

const leaks = {
  duplicativeInSitemap: [] as string[],
  duplicativeIndexable: [] as string[],
  duplicativePromotable: [] as string[],
  duplicativePublicNoindex: [] as string[],
  pdpFullReviewCta: [] as string[],
  reviewsIndexIncludesHeld: [] as string[],
  bestGuideReviewLinks: [] as { guide: string; review: string }[],
  searchHitsHeld: [] as string[],
};

for (const r of duplicative) {
  const path = `/reviews/${r.slug}`;
  const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
  if (sitemapPaths.has(path)) leaks.duplicativeInSitemap.push(r.slug);
  if (isIndexableEligibility(elig)) leaks.duplicativeIndexable.push(r.slug);
  if (shouldPromotePublicly(elig)) leaks.duplicativePromotable.push(r.slug);
  if (elig.disposition === "PUBLIC_NOINDEX") {
    leaks.duplicativePublicNoindex.push(r.slug);
  }
}

for (const r of duplicative.slice(0, 120)) {
  const product = getProductById(r.productId, PROD);
  if (!product) continue;
  const summary = getProductReviewSummary({
    productSlug: product.slug,
  });
  if (summary?.fullReviewHref?.includes(`/reviews/${r.slug}`)) {
    leaks.pdpFullReviewCta.push(product.slug);
  }
}

const index = getReviewsIndexData(PROD);
for (const item of index.items) {
  const elig = getLaunchEligibility(
    { kind: "review", entity: item.review },
    PROD,
  );
  if (!shouldPromotePublicly(elig)) {
    leaks.reviewsIndexIncludesHeld.push(item.review.slug);
  }
}

for (const g of getBestGuides(PROD)) {
  const data = getBestGuidePageData(g.slug, PROD);
  if (!data) continue;
  for (const rec of data.recommendations) {
    if (!rec.reviewSlug) continue;
    const review = reviews.find((r) => r.slug === rec.reviewSlug);
    if (!review) continue;
    const elig = getLaunchEligibility({ kind: "review", entity: review }, PROD);
    if (!shouldPromotePublicly(elig)) {
      leaks.bestGuideReviewLinks.push({
        guide: g.slug,
        review: rec.reviewSlug,
      });
    }
  }
}

const sampleHeld = duplicative[0];
if (sampleHeld) {
  const product = getProductById(sampleHeld.productId, PROD);
  if (product) {
    const query = product.name.split(" ").slice(0, 2).join(" ");
    const results = searchKitletics(query, { isDev: false });
    for (const hit of results.filter((h) => h.type === "review")) {
      const slug = hit.href.replace("/reviews/", "");
      const review = reviews.find((r) => r.slug === slug);
      if (!review) continue;
      const elig = getLaunchEligibility({ kind: "review", entity: review }, PROD);
      if (!shouldPromotePublicly(elig)) leaks.searchHitsHeld.push(slug);
    }
  }
}

const bestProductIds = new Set<string>();
for (const g of getBestGuides(PROD)) {
  for (const rec of g.recommendations ?? []) {
    bestProductIds.add(rec.productId);
  }
}
const compareProductIds = new Set<string>();
for (const c of getComparisons(PROD)) {
  for (const id of c.productIds) compareProductIds.add(id);
}

type QueueRow = {
  slug: string;
  productSlug: string;
  brand: string;
  categoryId: string;
  quality: string;
  disposition: string;
  score: number;
  reasons: string[];
  inBest: boolean;
  inComparison: boolean;
  running: boolean;
  recommendationScore?: number;
};

const queue: QueueRow[] = [];
for (const r of reviews) {
  const assessed = assessReviewLaunchQuality(r, PROD);
  if (assessed.quality === "LAUNCH_READY") continue;
  const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
  if (isIndexableEligibility(elig)) continue;
  const product = getProductById(r.productId, PROD);
  if (!product || product.status !== "published") continue;
  const brand = getBrandById(product.brandId, PROD);
  const running = product.sportIds.includes("sport-running");
  const inBest = bestProductIds.has(product.id);
  const inComparison = compareProductIds.has(product.id);
  let score = 0;
  if (running) score += 40;
  if (inBest) score += 30;
  if (inComparison) score += 15;
  if (typeof product.recommendationScore === "number") {
    score += Math.round(product.recommendationScore / 10);
  }
  if (assessed.quality === "DUPLICATIVE") score += 5;
  if (assessed.quality === "NEEDS_MINOR_WORK") score += 10;
  queue.push({
    slug: r.slug,
    productSlug: product.slug,
    brand: brand?.name ?? "",
    categoryId: product.categoryId,
    quality: assessed.quality,
    disposition: elig.disposition,
    score,
    reasons: [
      running ? "running" : "non-running",
      inBest ? "best-guide" : "",
      inComparison ? "comparison" : "",
      assessed.quality,
    ].filter(Boolean),
    inBest,
    inComparison,
    running,
    recommendationScore: product.recommendationScore,
  });
}
queue.sort((a, b) => b.score - a.score);

const report = {
  measuredAt: new Date().toISOString(),
  totals: {
    publishedReviews: reviews.length,
    byQuality,
    byDisposition,
    duplicative: duplicative.length,
    indexable: reviews.filter((r) =>
      isIndexableEligibility(
        getLaunchEligibility({ kind: "review", entity: r }, PROD),
      ),
    ).length,
  },
  leaks,
  leakCount: Object.values(leaks).reduce(
    (a, v) => a + (Array.isArray(v) ? v.length : 0),
    0,
  ),
  queueTop50: queue.slice(0, 50),
  queueTotal: queue.length,
};

writeFileSync(
  join(OUT, "33-review-hold-audit.json"),
  JSON.stringify(report, null, 2),
);
writeFileSync(
  join(OUT, "33-review-enrichment-queue.json"),
  JSON.stringify(
    {
      generatedAt: report.measuredAt,
      total: queue.length,
      scoring:
        "running(+40) + best-guide(+30) + comparison(+15) + recommendationScore/10 + quality bump",
      items: queue,
    },
    null,
    2,
  ),
);

const mdLines = [
  "# Post-launch review enrichment queue",
  "",
  `Generated: ${report.measuredAt}`,
  "",
  `Total held / non-indexable reviews queued: **${queue.length}**`,
  "",
  "## Scoring",
  "",
  "- Running sport: +40",
  "- Included in a Best guide: +30",
  "- Appears in a comparison: +15",
  "- Product recommendationScore / 10",
  "- DUPLICATIVE +5 / NEEDS_MINOR_WORK +10",
  "",
  "## Top 40",
  "",
  "| Rank | Review | Product | Brand | Score | Drivers |",
  "| ---: | --- | --- | --- | ---: | --- |",
];
queue.slice(0, 40).forEach((q, i) => {
  mdLines.push(
    `| ${i + 1} | \`${q.slug}\` | \`${q.productSlug}\` | ${q.brand} | ${q.score} | ${q.reasons.join(", ")} |`,
  );
});
mdLines.push("");
mdLines.push(
  `Full JSON: \`docs/prelaunch/data/rc-final/33-review-enrichment-queue.json\``,
);
writeFileSync(
  join(OUT, "33-review-enrichment-queue.md"),
  mdLines.join("\n"),
);

console.log(
  JSON.stringify(
    {
      totals: report.totals,
      leakCount: report.leakCount,
      leaks: {
        sitemap: leaks.duplicativeInSitemap.length,
        indexable: leaks.duplicativeIndexable.length,
        promotable: leaks.duplicativePromotable.length,
        publicNoindex: leaks.duplicativePublicNoindex.length,
        pdpCta: leaks.pdpFullReviewCta.length,
        reviewsIndex: leaks.reviewsIndexIncludesHeld.length,
        bestLinks: leaks.bestGuideReviewLinks.length,
        search: leaks.searchHitsHeld.length,
      },
      queueTop5: queue.slice(0, 5).map((q) => ({
        slug: q.slug,
        score: q.score,
        reasons: q.reasons,
      })),
    },
    null,
    2,
  ),
);
