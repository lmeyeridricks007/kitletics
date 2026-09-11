/**
 * One-off Day-1 exclusion audit for remediation 15.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  getProducts,
  getReviews,
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getTools,
  getProductById,
} from "@/repositories";
import { getLaunchEligibility } from "@/domain/launch";
import { assessProductLaunchQuality } from "@/domain/launch/assess-product-quality";
import { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
import { assessBestGuideLaunchQuality } from "@/domain/launch/assess-best-guide-quality";
import { isSoftGatedCategory } from "@/lib/navigation/category-href";
import { getCategoryById } from "@/repositories/sports";

const PROD = { isDev: false as const };
const RUNNING = "sport-running";
const OUT = join(process.cwd(), "docs/prelaunch/data");
mkdirSync(OUT, { recursive: true });

type Row = {
  slug: string;
  disposition: string;
  quality: string;
  reasons: string;
  softGated: boolean;
  sports: string;
  categoryId?: string;
};

const products = getProducts(PROD);
const runningProducts = products.filter((p) => p.sportIds.includes(RUNNING));

const excludedRunning: Row[] = [];
let runningIndexable = 0;
let runningLrDomain = 0;
let runningLrExcluded = 0;
const dispositionByQuality = new Map<string, number>();

for (const p of runningProducts) {
  const elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
  const q = assessProductLaunchQuality(p, PROD);
  const cat = getCategoryById(p.categoryId, PROD);
  const soft = cat ? isSoftGatedCategory(cat) : false;
  const key = `${q.quality}->${elig.disposition}`;
  dispositionByQuality.set(key, (dispositionByQuality.get(key) ?? 0) + 1);
  if (q.quality === "LAUNCH_READY") runningLrDomain++;
  if (elig.disposition === "INDEXABLE") runningIndexable++;
  if (q.quality === "LAUNCH_READY" && elig.disposition !== "INDEXABLE") {
    runningLrExcluded++;
    excludedRunning.push({
      slug: p.slug,
      disposition: elig.disposition,
      quality: q.quality,
      reasons: elig.reasons
        .map((r) => (r.detail ? `${r.code}:${r.detail}` : r.code))
        .join("|"),
      softGated: soft,
      sports: p.sportIds.join(","),
      categoryId: p.categoryId,
    });
  }
}

const reviews = getReviews(PROD);
let revRun = 0;
let revRunIdx = 0;
let revRunLr = 0;
let revRunLrEx = 0;
const revEx: Row[] = [];
const revDisp = new Map<string, number>();

for (const r of reviews) {
  const prod = getProductById(r.productId, PROD);
  if (!prod?.sportIds.includes(RUNNING)) continue;
  revRun++;
  const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
  const q = assessReviewLaunchQuality(r, PROD);
  const key = `${q.quality}->${elig.disposition}`;
  revDisp.set(key, (revDisp.get(key) ?? 0) + 1);
  if (q.quality === "LAUNCH_READY") revRunLr++;
  if (elig.disposition === "INDEXABLE") revRunIdx++;
  if (q.quality === "LAUNCH_READY" && elig.disposition !== "INDEXABLE") {
    revRunLrEx++;
    revEx.push({
      slug: r.slug,
      disposition: elig.disposition,
      quality: q.quality,
      reasons: elig.reasons.map((x) => x.code).join("|"),
      softGated: false,
      sports: (prod?.sportIds ?? []).join(","),
      categoryId: prod?.categoryId,
    });
  }
}

const bestRows = getBestGuides(PROD).map((g) => {
  const elig = getLaunchEligibility({ kind: "best-guide", entity: g }, PROD);
  const q = assessBestGuideLaunchQuality(g, PROD);
  return {
    slug: g.slug,
    sportId: g.sportId,
    elig: elig.disposition,
    quality: q.quality,
    reasons: elig.reasons.map((r) => r.code).join("|"),
  };
});

const guideRows = getBuyingGuides(PROD)
  .filter((g) => g.sportId === RUNNING)
  .map((g) => {
    const elig = getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD);
    return {
      slug: g.slug,
      elig: elig.disposition,
      quality: elig.quality,
      reasons: elig.reasons.map((r) => r.code).join("|"),
    };
  });

const compRows = getComparisons(PROD).map((c) => {
  const productsFor = c.productIds
    .map((id) => getProductById(id, PROD))
    .filter(Boolean);
  const running = productsFor.some((p) => p!.sportIds.includes(RUNNING));
  const elig = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
  return {
    slug: c.slug,
    running,
    elig: elig.disposition,
    quality: elig.quality,
    reasons: elig.reasons.map((r) => r.code).join("|"),
  };
});

const toolRows = getTools(PROD)
  .filter((t) => t.available)
  .map((t) => {
    const elig = getLaunchEligibility({ kind: "tool", entity: t }, PROD);
    return {
      slug: t.slug,
      sportIds: t.sportIds,
      elig: elig.disposition,
      reasons: elig.reasons.map((r) => r.code).join("|"),
    };
  });

const report = {
  products: {
    runningTotal: runningProducts.length,
    runningIndexable,
    runningLrDomain,
    runningLrExcluded,
    dispositionByQuality: Object.fromEntries(dispositionByQuality),
    excludedRunning,
  },
  reviews: {
    revRun,
    revRunIdx,
    revRunLr,
    revRunLrEx,
    dispositionByQuality: Object.fromEntries(revDisp),
    excluded: revEx,
  },
  best: bestRows,
  runningGuides: guideRows,
  comparisons: {
    running: compRows.filter((c) => c.running),
    nonRunning: compRows.filter((c) => !c.running),
  },
  tools: toolRows,
};

writeFileSync(join(OUT, "15-exclusion-audit.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  products: report.products.dispositionByQuality,
  runningLrExcluded,
  sampleExcluded: excludedRunning.slice(0, 12),
  reviews: report.reviews.dispositionByQuality,
  revRunLrEx,
  sampleRevEx: revEx.slice(0, 8),
  bestIndexable: bestRows.filter((b) => b.elig === "INDEXABLE"),
  bestLr: bestRows.filter((b) => b.quality === "LAUNCH_READY"),
  guidesExcluded: guideRows.filter((g) => g.elig !== "INDEXABLE"),
  runningCompsExcluded: compRows.filter((c) => c.running && c.elig !== "INDEXABLE").length,
  toolsIndexableHeld: toolRows.filter((t) => t.elig === "INDEXABLE" && !t.sportIds.includes(RUNNING)),
}, null, 2));
