/**
 * Fix 58 — category editorial readiness (V2 formula + accessories completeness).
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { getCategories, getBestGuides, getBuyingGuides } from "@/repositories";
import { getProductsByCategory } from "@/repositories";
import { getCategoryPageConfig } from "@/lib/catalog/running-shoes";
import { isSoftGatedCategory } from "@/lib/navigation/category-href";
import { assembleCategoryPage } from "@/lib/catalog/assemble";
import { getSportById } from "@/repositories";
import { assessBestGuideLaunchQuality } from "@/domain/launch/assess-best-guide-quality";
import { assessBuyingGuideEditorialReadiness } from "@/domain/editorial-readiness/assess";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";

const PROD = { isDev: false as const };
const OUT = join(process.cwd(), "docs/prelaunch/data");
mkdirSync(OUT, { recursive: true });

function decisionComplete(
  d: NonNullable<ReturnType<typeof getCategoryPageConfig>>["decision"],
): boolean {
  if (!d) return false;
  return (
    d.whatItIs.length >= 40 &&
    d.productTypes.length >= 2 &&
    d.whatMatters.length >= 3 &&
    d.specsThatMatter.length >= 2 &&
    d.tradeOffs.length >= 1 &&
    d.useCaseShifts.length >= 2 &&
    d.beginnerStart.length >= 40 &&
    Boolean(d.relatedBestHref || d.relatedFinderHref)
  );
}

const cats = getCategories(PROD);

const v2Rows: Array<Record<string, unknown>> = [];
let v2Total = 0;
let v2Ready = 0;
for (const c of cats) {
  const sportSlug = getSportById(c.sportIds[0] ?? "")?.slug ?? "running";
  const cfg = getCategoryPageConfig(sportSlug, c.slug);
  if (!cfg) continue;
  v2Total++;
  const soft = isSoftGatedCategory(c);
  const ready = Boolean(cfg.decision) && !soft;
  if (ready) v2Ready++;
  v2Rows.push({
    slug: c.slug,
    sportSlug,
    soft,
    hasDecision: Boolean(cfg.decision),
    ready,
    best: cfg.decision?.relatedBestHref,
    guide: cfg.decision?.relatedGuideHref,
    finder: cfg.decision?.relatedFinderHref ?? cfg.finder?.toolSlug,
    education: cfg.educationFactors.length,
    types: cfg.decision?.productTypes?.length,
    matters: cfg.decision?.whatMatters?.length,
    specs: cfg.decision?.specsThatMatter?.length,
    trades: cfg.decision?.tradeOffs?.length,
    shifts: cfg.decision?.useCaseShifts?.length,
  });
}

const runningRows: Array<Record<string, unknown>> = [];
for (const c of cats) {
  const cfg = getCategoryPageConfig("running", c.slug);
  if (!cfg) continue;
  const products = getProductsByCategory(c.id, PROD);
  const soft = isSoftGatedCategory(c);
  const assembled = assembleCategoryPage({
    sportSlug: "running",
    pathSegment: c.pathSegment,
    options: PROD,
  });
  const dOk = decisionComplete(cfg.decision);
  const educationOk = (cfg.educationFactors?.length ?? 0) >= 3;
  const finderOk = Boolean(cfg.finder || cfg.decision?.relatedFinderHref);
  const bestOk =
    (assembled?.bestGuides?.length ?? 0) >= 1 ||
    Boolean(cfg.decision?.relatedBestHref);
  const productOk = products.length >= 8;
  const gaps: string[] = [];
  if (!dOk) gaps.push("incomplete_decision");
  if (!educationOk) gaps.push("education_lt_3");
  if (!finderOk) gaps.push("no_finder");
  if (!bestOk) gaps.push("no_best");
  if (!productOk) gaps.push(`thin_${products.length}`);
  if (soft) gaps.push("soft_gated");
  if (!cfg.decision?.relatedGuideHref) gaps.push("no_guide_link");
  runningRows.push({
    slug: c.slug,
    n: products.length,
    edu: cfg.educationFactors.length,
    best: assembled?.bestGuides?.length ?? 0,
    guides: assembled?.buyingGuides?.length ?? 0,
    finder: assembled?.tools?.length ?? 0,
    picks: assembled?.picks?.length ?? 0,
    gaps,
    v2Ready: Boolean(cfg.decision) && !soft,
  });
}

const accCat = cats.find((x) => x.slug === "accessories")!;
const accPub = getProductsByCategory(accCat.id, PROD);
const accAll = getProductsByCategory(accCat.id, { isDev: true });
const best = getBestGuides(PROD).find((g) => g.slug === "running-anti-chafe");
const guide = getBuyingGuides(PROD).find((g) => g.slug === "anti-chafe-for-runners");
const bestQ = best ? assessBestGuideLaunchQuality(best, PROD) : null;
const guideEd = guide ? assessBuyingGuideEditorialReadiness(guide, PROD) : null;
const guideQ = guide ? assessGuideQuality(guide) : null;

const report = {
  generatedAt: new Date().toISOString(),
  v2: { total: v2Total, ready: v2Ready, notReady: v2Rows.filter((r) => !r.ready) },
  runningConfigs: runningRows,
  accessories: {
    published: accPub.map((p) => p.slug),
    drafts: accAll
      .filter((p) => p.status !== "published")
      .map((p) => `${p.slug}:${p.status}`),
    best: best
      ? { id: best.id, quality: bestQ?.quality, reasons: bestQ?.reasons }
      : null,
    guide: guide
      ? {
          id: guide.id,
          editorial: guideEd?.workState,
          quality: guideQ?.status,
          words: guideQ?.wordEstimate,
        }
      : null,
  },
};

writeFileSync(
  join(OUT, "58-category-readiness.json"),
  JSON.stringify(report, null, 2),
);

console.log("V2", { v2Total, v2Ready });
for (const r of v2Rows.filter((r) => !r.ready)) {
  console.log("V2 NOT READY", r);
}
for (const r of runningRows) {
  const gaps = (r.gaps as string[]).join(",") || "ok";
  console.log(
    `${r.v2Ready ? "V2" : "  "} ${String(r.slug).padEnd(22)} n=${String(r.n).padStart(2)} best=${r.best} guides=${r.guides} tools=${r.finder} picks=${r.picks} ${gaps}`,
  );
}
console.log("accessories pub", accPub.map((p) => p.slug));
console.log("best", bestQ);
console.log("guide", guideEd?.workState, guideQ?.status, guideQ?.wordEstimate);
