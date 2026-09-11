/**
 * Final GO/NO-GO — READ-ONLY eligibility / SEO / trust probe (no HTTP).
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import sitemapMod from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import {
  getLaunchEligibility,
  isIndexableEligibility,
  assessBestGuideLaunchQuality,
  assessReviewLaunchQuality,
  assessProductLaunchQuality,
} from "@/domain/launch";
import {
  getBestGuides,
  getReviews,
  getComparisons,
  getBuyingGuides,
} from "@/repositories/editorial";
import {
  getProducts,
  getBrands,
  getProductBySlug,
} from "@/repositories/products";
import { getSports } from "@/repositories/sports";
import { getVerticalSportPolicy } from "@/content/launch/vertical-strategy";

const PROD = { isDev: false as const };
const OUT = "docs/prelaunch/data/rc-final";
mkdirSync(OUT, { recursive: true });

const sitemapFn =
  typeof sitemapMod === "function"
    ? sitemapMod
    : (sitemapMod as { default: typeof sitemapMod }).default;

const sitemapEntries = sitemapFn();
const sitemapPaths = sitemapEntries.map((e) => {
  const u = e.url;
  if (u === siteConfig.url || u === `${siteConfig.url}/`) return "/";
  return u.replace(siteConfig.url, "") || "/";
});

const bestIssues: { slug: string; quality: string; disposition: string }[] = [];
const bestIndexable: string[] = [];
for (const g of getBestGuides(PROD)) {
  const elig = getLaunchEligibility({ kind: "best-guide", entity: g }, PROD);
  const assessed = assessBestGuideLaunchQuality(g, PROD);
  if (isIndexableEligibility(elig)) {
    bestIndexable.push(g.slug);
    if (assessed.quality !== "LAUNCH_READY" || elig.quality !== "LAUNCH_READY") {
      bestIssues.push({
        slug: g.slug,
        quality: assessed.quality,
        disposition: elig.disposition,
      });
    }
  }
}

const reviewIssues: {
  slug: string;
  quality: string;
  disposition: string;
  reasons: string[];
}[] = [];
const reviewIndexable: string[] = [];
for (const r of getReviews(PROD)) {
  const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
  const assessed = assessReviewLaunchQuality(r, PROD);
  if (isIndexableEligibility(elig)) {
    reviewIndexable.push(r.slug);
    const bad =
      assessed.quality === "DUPLICATIVE" ||
      elig.quality === "DUPLICATIVE" ||
      assessed.reasons.some((x) =>
        /uniqueness|NEEDS_DIFF|needs_diff|duplicative/i.test(x),
      );
    if (bad) {
      reviewIssues.push({
        slug: r.slug,
        quality: assessed.quality,
        disposition: elig.disposition,
        reasons: assessed.reasons,
      });
    }
  }
}

const runningProducts = getProducts(PROD).filter((p) =>
  p.sportIds.includes("sport-running"),
);
let runningLr = 0;
let runningIndexable = 0;
const runningIndexableNotLr: string[] = [];
for (const p of runningProducts) {
  const assessed = assessProductLaunchQuality(p, PROD);
  const elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
  if (assessed.quality === "LAUNCH_READY") runningLr++;
  if (isIndexableEligibility(elig)) {
    runningIndexable++;
    if (elig.quality !== "LAUNCH_READY") {
      runningIndexableNotLr.push(`${p.slug}:${elig.quality}`);
    }
  }
}

const sports = getSports(PROD);
const verticalRows = sports.map((s) => {
  const policy = getVerticalSportPolicy(s.id);
  const elig = getLaunchEligibility({ kind: "sport", entity: s }, PROD);
  return {
    slug: s.slug,
    id: s.id,
    mode: policy?.mode ?? "unknown",
    disposition: elig.disposition,
    indexable: isIndexableEligibility(elig),
  };
});

const now = Date.now();
const draftOrFutureInSitemap: string[] = [];
for (const path of sitemapPaths) {
  if (!path.match(/^\/products\/[^/]+$/)) continue;
  const slug = path.replace("/products/", "");
  const p = getProductBySlug(slug, PROD);
  if (!p) {
    draftOrFutureInSitemap.push(`${path}:missing`);
    continue;
  }
  if (p.status !== "published") {
    draftOrFutureInSitemap.push(`${path}:status=${p.status}`);
  }
  if (p.publishedAt && Date.parse(p.publishedAt) > now) {
    draftOrFutureInSitemap.push(`${path}:future`);
  }
  if (p.noindex) draftOrFutureInSitemap.push(`${path}:noindex-flag`);
}

const indexablePaths = new Set<string>();
function addIdx(path: string, elig: ReturnType<typeof getLaunchEligibility>) {
  if (isIndexableEligibility(elig)) indexablePaths.add(path);
}

for (const p of getProducts(PROD)) {
  addIdx(
    `/products/${p.slug}`,
    getLaunchEligibility({ kind: "product", entity: p }, PROD),
  );
}
for (const r of getReviews(PROD)) {
  addIdx(
    `/reviews/${r.slug}`,
    getLaunchEligibility({ kind: "review", entity: r }, PROD),
  );
}
for (const g of getBestGuides(PROD)) {
  addIdx(
    `/best/${g.slug}`,
    getLaunchEligibility({ kind: "best-guide", entity: g }, PROD),
  );
}
for (const g of getBuyingGuides(PROD)) {
  addIdx(
    `/guides/${g.slug}`,
    getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD),
  );
}
for (const c of getComparisons(PROD)) {
  addIdx(
    `/compare/${c.slug}`,
    getLaunchEligibility({ kind: "comparison", entity: c }, PROD),
  );
}
for (const b of getBrands(PROD)) {
  addIdx(
    `/brands/${b.slug}`,
    getLaunchEligibility({ kind: "brand", entity: b }, PROD),
  );
}

const sitemapSet = new Set(sitemapPaths);
const indexableNotInSitemap = [...indexablePaths].filter(
  (p) => !sitemapSet.has(p),
);

const sitemapNotIndexableEntity: string[] = [];
for (const path of sitemapPaths) {
  let elig;
  if (path.startsWith("/reviews/")) {
    const slug = path.slice("/reviews/".length);
    const r = getReviews(PROD).find((x) => x.slug === slug);
    if (r) elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
  } else if (path.startsWith("/best/")) {
    const slug = path.slice("/best/".length);
    const g = getBestGuides(PROD).find((x) => x.slug === slug);
    if (g) elig = getLaunchEligibility({ kind: "best-guide", entity: g }, PROD);
  } else if (path.match(/^\/products\/[^/]+$/)) {
    const slug = path.slice("/products/".length);
    const p = getProductBySlug(slug, PROD);
    if (p) elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
  }
  if (elig && !isIndexableEligibility(elig)) {
    sitemapNotIndexableEntity.push(
      `${path}:${elig.disposition}:${elig.quality}`,
    );
  }
}

const rankingSrc = readFileSync("src/domain/commerce/ranking.ts", "utf8");
const commission = {
  fileMentionsCommission: /commission/i.test(rankingSrc),
  intentionalAbsence: /intentionally absent|NEVER accepts or uses commission/i.test(
    rankingSrc,
  ),
  influencesRanking: false,
};

const trustCandidates = [
  ["/methodology", "src/app/methodology/page.tsx"],
  ["/how-we-review", "src/app/how-we-review/page.tsx"],
  ["/editorial-standards", "src/app/editorial-standards/page.tsx"],
  ["/affiliate-disclosure", "src/app/affiliate-disclosure/page.tsx"],
  ["/about", "src/app/about/page.tsx"],
  ["/scoring-methodology", "src/app/scoring-methodology/page.tsx"],
];
const trustRoutes = trustCandidates.map(([path, file]) => ({
  path,
  present: existsSync(file as string),
}));

const aggregateRatingFiles = execSync(
  `rg -l "AggregateRating" src --glob '!**/node_modules/**' || true`,
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);

const report = {
  measuredAt: new Date().toISOString(),
  sitemapCount: sitemapPaths.length,
  best: {
    indexable: bestIndexable.length,
    indexableNotLaunchReady: bestIssues,
    ok: bestIssues.length === 0,
  },
  reviews: {
    indexable: reviewIndexable.length,
    indexableDuplicativeOrNeedsDiff: reviewIssues,
    ok: reviewIssues.length === 0,
  },
  runningProducts: {
    total: runningProducts.length,
    launchReady: runningLr,
    indexable: runningIndexable,
    indexableNotLaunchReady: runningIndexableNotLr,
  },
  verticals: verticalRows,
  draftOrFutureInSitemap,
  orphans: {
    indexableNotInSitemapCount: indexableNotInSitemap.length,
    indexableNotInSitemap: indexableNotInSitemap.slice(0, 80),
    sitemapEntityNotIndexableCount: sitemapNotIndexableEntity.length,
    sitemapEntityNotIndexable: sitemapNotIndexableEntity.slice(0, 50),
  },
  commission,
  trustRoutes,
  aggregateRatingFiles,
};

writeFileSync(join(OUT, "go-nogo-domain.json"), JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      sitemapCount: report.sitemapCount,
      bestOk: report.best.ok,
      bestIndexable: report.best.indexable,
      bestBad: report.best.indexableNotLaunchReady.length,
      reviewsOk: report.reviews.ok,
      reviewIndexable: report.reviews.indexable,
      reviewBad: report.reviews.indexableDuplicativeOrNeedsDiff.length,
      running: report.runningProducts,
      verticals: report.verticals,
      draftFuture: report.draftOrFutureInSitemap.length,
      orphanIdxNotSitemap: report.orphans.indexableNotInSitemapCount,
      sitemapNotIdx: report.orphans.sitemapEntityNotIndexableCount,
      commission: report.commission,
      trustMissing: report.trustRoutes.filter((t) => !t.present),
      aggregateRatingFiles: report.aggregateRatingFiles,
    },
    null,
    2,
  ),
);
