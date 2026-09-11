/**
 * Fix 69 — Brand depth opportunity audit.
 * Fresh production-equivalent catalog + draft overlay.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  getBrands,
  getProducts,
  getProductFamilies,
  getReviews,
  getBestGuides,
  getBuyingGuides,
  getComparisons,
} from "@/repositories";
import { getCategories } from "@/repositories/sports";
import { classifyBrandHubHold } from "@/lib/brand-hub/classify-hold";
import { canPublishBrandHub } from "@/lib/brand-hub/config";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch/get-launch-eligibility";
import { products as rawProducts } from "@/content/products";
import { brands as rawBrands } from "@/content/brands";
import { runningCatalogBrands } from "@/content/running/brands";
import { padelAllBrands } from "@/content/padel";
import { fitnessBrands } from "@/content/fitness";
import { racketBrands } from "@/content/racket";

const PROD = { isDev: false as const };
const DEV = { isDev: true as const };
const OUT = join(process.cwd(), "docs/prelaunch/data/rc-69");
mkdirSync(OUT, { recursive: true });

const RUNNING_BRAND_IDS = new Set(runningCatalogBrands.map((b) => b.id));
const PADEL_BRAND_IDS = new Set(padelAllBrands.map((b) => b.id));
const FITNESS_BRAND_IDS = new Set(fitnessBrands.map((b) => b.id));
const RACKET_BRAND_IDS = new Set(racketBrands.map((b) => b.id));

function sourceFile(id: string): "core" | "running" | "padel" | "fitness" | "racket" {
  if (RUNNING_BRAND_IDS.has(id)) return "running";
  if (PADEL_BRAND_IDS.has(id)) return "padel";
  if (FITNESS_BRAND_IDS.has(id)) return "fitness";
  if (RACKET_BRAND_IDS.has(id)) return "racket";
  return "core";
}

function main() {
  const brands = getBrands(PROD);
  const liveProducts = getProducts(PROD);
  const draftProducts = getProducts(DEV);
  const families = getProductFamilies();
  const reviews = getReviews(PROD);
  const bestGuides = getBestGuides(PROD);
  const buyingGuides = getBuyingGuides(PROD);
  const comparisons = getComparisons(PROD);
  const categories = getCategories();
  const catById = new Map(categories.map((c) => [c.id, c]));

  const reviewByProduct = new Map<string, number>();
  for (const r of reviews) {
    reviewByProduct.set(r.productId, (reviewByProduct.get(r.productId) ?? 0) + 1);
  }
  const compareByProduct = new Map<string, number>();
  for (const c of comparisons) {
    for (const id of c.productIds ?? []) {
      compareByProduct.set(id, (compareByProduct.get(id) ?? 0) + 1);
    }
  }
  const bestByProduct = new Map<string, Set<string>>();
  for (const g of bestGuides) {
    for (const rec of g.recommendations ?? []) {
      const set = bestByProduct.get(rec.productId) ?? new Set();
      set.add(g.slug);
      bestByProduct.set(rec.productId, set);
    }
  }

  const rawByBrand = new Map<string, typeof rawProducts>();
  for (const p of rawProducts) {
    const list = rawByBrand.get(p.brandId) ?? [];
    list.push(p);
    rawByBrand.set(p.brandId, list);
  }

  const rows = brands.map((brand) => {
    const live = liveProducts.filter((p) => p.brandId === brand.id);
    const all = draftProducts.filter((p) => p.brandId === brand.id);
    const raw = rawByBrand.get(brand.id) ?? [];
    const fams = families.filter((f) => f.brandId === brand.id);
    const cats = [...new Set(live.map((p) => p.categoryId))];
    const sports = [...new Set(live.flatMap((p) => p.sportIds))];
    const draftSports = [...new Set(all.flatMap((p) => p.sportIds))];
    const strengths = live.filter((p) => (p.strengths?.length ?? 0) > 0).length;
    const holdClass = classifyBrandHubHold(brand, PROD);
    const elig = getLaunchEligibility({ kind: "brand", entity: brand }, PROD);

    const bestSlugs = new Set<string>();
    for (const p of live) {
      for (const slug of bestByProduct.get(p.id) ?? []) bestSlugs.add(slug);
    }
    const liveIds = new Set(live.map((p) => p.id));
    const guideMentions = buyingGuides.filter((g) =>
      (g.relatedProductIds ?? []).some((id) => liveIds.has(id)),
    ).length;

    const runningLive = live.filter((p) => p.sportIds.includes("sport-running"));
    const runningShoes = live.filter((p) => p.categoryId === "cat-running-shoes");
    const gpsWatches = live.filter((p) => p.categoryId === "cat-gps-watches");

    return {
      slug: brand.slug,
      name: brand.name,
      id: brand.id,
      source: sourceFile(brand.id),
      holdClass,
      indexable: isIndexableEligibility(elig),
      disposition: elig.disposition,
      liveProducts: live.length,
      allVisibleDev: all.length,
      rawCount: raw.length,
      draftOrGated: raw
        .filter((p) => p.status !== "published")
        .map((p) => ({
          slug: p.slug,
          name: p.name,
          status: p.status,
          categoryId: p.categoryId,
          sports: p.sportIds,
          lifecycle: p.lifecycleStatus,
        })),
      archived: raw.filter((p) => p.status === "archived").map((p) => p.slug),
      current: live.filter((p) => p.lifecycleStatus === "current").length,
      categories: cats.map((id) => catById.get(id)?.slug ?? id),
      sports,
      draftSports,
      families: fams.map((f) => f.name),
      strengths,
      reviews: live.reduce((n, p) => n + (reviewByProduct.get(p.id) ?? 0), 0),
      comparisons: live.reduce(
        (n, p) => n + (compareByProduct.get(p.id) ?? 0),
        0,
      ),
      best: [...bestSlugs],
      guides: guideMentions,
      runningLive: runningLive.length,
      runningShoes: runningShoes.length,
      gpsWatches: gpsWatches.length,
      products: live.map((p) => ({
        slug: p.slug,
        name: p.name,
        category: catById.get(p.categoryId)?.slug ?? p.categoryId,
        sports: p.sportIds,
        lifecycle: p.lifecycleStatus,
        strengths: p.strengths?.length ?? 0,
        status: p.status,
      })),
      depthWouldPassIf3:
        live.length >= 3
          ? canPublishBrandHub({
              productCount: live.length,
              categoryCount: cats.length,
              familyCount: fams.length,
              strengthSignalCount: strengths,
            })
          : canPublishBrandHub({
              productCount: 3,
              categoryCount: Math.max(cats.length, 1),
              familyCount: fams.length,
              strengthSignalCount: Math.max(strengths, 3),
            }),
    };
  });

  const insufficient = rows.filter((r) => r.holdClass === "HOLD_INSUFFICIENT_DEPTH");
  const noProducts = rows.filter((r) => r.holdClass === "HOLD_NO_PRODUCTS");
  const ready = rows.filter((r) => r.holdClass === "READY");

  const runningHeldShoes = insufficient.filter(
    (r) => r.runningShoes > 0 || r.source === "running",
  );

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      brands: brands.length,
      rawBrands: rawBrands.length,
      ready: ready.length,
      insufficient: insufficient.length,
      noProducts: noProducts.length,
      otherHeld: rows.filter(
        (r) =>
          r.holdClass !== "READY" &&
          r.holdClass !== "HOLD_INSUFFICIENT_DEPTH" &&
          r.holdClass !== "HOLD_NO_PRODUCTS",
      ).length,
    },
    readySlugs: ready.map((r) => r.slug),
    insufficient,
    noProducts,
    runningHeld: runningHeldShoes.map((r) => ({
      slug: r.slug,
      products: r.liveProducts,
      cats: r.categories,
      runningShoes: r.runningShoes,
      gps: r.gpsWatches,
      names: r.products.map((p) => p.name),
      drafts: r.draftOrGated,
    })),
  };

  writeFileSync(join(OUT, "brand-audit.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.totals, null, 2));
  console.log("\n--- HOLD_INSUFFICIENT_DEPTH running-sourced ---");
  for (const r of runningHeldShoes) {
    console.log(
      `${r.slug}\t${r.liveProducts}\t${r.categories.join(",")}\t${r.products.map((p) => p.name).join(" | ")}`,
    );
  }
  console.log("\n--- HOLD_NO_PRODUCTS ---");
  for (const r of noProducts) {
    console.log(
      `${r.slug}\t${r.source}\traw=${r.rawCount}\tdrafts=${r.draftOrGated.length}\t${r.draftOrGated.map((d) => d.slug).join(",")}`,
    );
  }
}

main();
