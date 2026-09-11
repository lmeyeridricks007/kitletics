/**
 * Fix 87 — rank indexable Running products for gallery depth priority.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  getProducts,
  getBestGuides,
  getReviews,
  getComparisons,
  getTools,
  getCategoryById,
  getBrandById,
} from "@/repositories";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import { PRODUCT_GALLERY_MEDIA } from "@/content/product-gallery-media";
import { getPrimaryProductMedia } from "@/lib/product/media";

const PROD = { isDev: false as const };
const OUT = join(process.cwd(), "docs/prelaunch/data/rc-87");
mkdirSync(OUT, { recursive: true });

const RUNNING = "sport-running";

const products = getProducts(PROD).filter((p) => {
  if (!p.sportIds.includes(RUNNING)) return false;
  return isIndexableEligibility(
    getLaunchEligibility({ kind: "product", entity: p }, PROD),
  );
});

const best = getBestGuides(PROD);
const reviews = getReviews(PROD);
const comparisons = getComparisons(PROD);
const tools = getTools(PROD);

const bestCount = new Map<string, number>();
const reviewBoost = new Map<string, number>();
const compareCount = new Map<string, number>();
const finderCount = new Map<string, number>();

for (const g of best) {
  const indexable = isIndexableEligibility(
    getLaunchEligibility({ kind: "best-guide", entity: g }, PROD),
  );
  const weight = indexable ? 3 : 1;
  for (const r of g.recommendations ?? []) {
    bestCount.set(r.productId, (bestCount.get(r.productId) ?? 0) + weight);
  }
  for (const c of g.consideredProducts ?? []) {
    bestCount.set(c.productId, (bestCount.get(c.productId) ?? 0) + 0.5 * weight);
  }
}

for (const r of reviews) {
  const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  reviewBoost.set(r.productId, (reviewBoost.get(r.productId) ?? 0) + 5);
}

for (const c of comparisons) {
  const elig = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
  const weight = isIndexableEligibility(elig) ? 2 : 0.5;
  for (const id of c.productIds ?? []) {
    compareCount.set(id, (compareCount.get(id) ?? 0) + weight);
  }
}

// Finder tools: count product appearances in recommendation graphs if present
for (const t of tools) {
  const recs = (t as { recommendedProductIds?: string[] }).recommendedProductIds;
  if (!Array.isArray(recs)) continue;
  for (const id of recs) {
    finderCount.set(id, (finderCount.get(id) ?? 0) + 1);
  }
}

const CATEGORY_WEIGHT: Record<string, number> = {
  "running-shoes": 5,
  "gps-watches": 4,
  hrm: 3,
  "running-packs": 3,
  "running-vests": 3,
  "hydration-packs": 2.5,
  "trail-shoes": 4,
  "racing-shoes": 4,
};

function categoryImportance(categoryId: string): number {
  const cat = getCategoryById(categoryId, PROD);
  const slug = cat?.slug ?? categoryId;
  for (const [k, w] of Object.entries(CATEGORY_WEIGHT)) {
    if (slug.includes(k) || categoryId.includes(k)) return w;
  }
  if (slug.includes("shoe")) return 4;
  if (slug.includes("watch")) return 3.5;
  if (slug.includes("pack") || slug.includes("vest")) return 3;
  return 1;
}

type Row = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  categorySlug: string;
  score: number;
  best: number;
  review: number;
  compare: number;
  finder: number;
  categoryW: number;
  commercial: number;
  galleryCount: number;
  hasGallery: boolean;
  heroSrc?: string;
  heroSourceUrl?: string;
  tier: "P1" | "P2" | "P3";
};

const rows: Row[] = products.map((p) => {
  const brand = getBrandById(p.brandId, PROD);
  const cat = getCategoryById(p.categoryId, PROD);
  const bestS = bestCount.get(p.id) ?? 0;
  const reviewS = reviewBoost.get(p.id) ?? 0;
  const compareS = compareCount.get(p.id) ?? 0;
  const finderS = finderCount.get(p.id) ?? 0;
  const categoryW = categoryImportance(p.categoryId);
  // commercial demand proxy: recommendationScore + offer presence
  const commercial =
    (p.recommendationScore ?? 0) / 20 +
    ((p as { offerIds?: string[] }).offerIds?.length ? 1 : 0);
  const score =
    bestS * 4 +
    reviewS * 3 +
    compareS * 2.5 +
    finderS * 2 +
    categoryW +
    commercial;

  const gallery = PRODUCT_GALLERY_MEDIA[p.id] ?? [];
  const primary = getPrimaryProductMedia(p);
  return {
    productId: p.id,
    slug: p.slug,
    name: p.fullName ?? p.name,
    brand: brand?.name ?? p.brandId,
    categoryId: p.categoryId,
    categorySlug: cat?.slug ?? "",
    score: Math.round(score * 100) / 100,
    best: bestS,
    review: reviewS,
    compare: compareS,
    finder: finderS,
    categoryW,
    commercial: Math.round(commercial * 100) / 100,
    galleryCount: gallery.length,
    hasGallery: gallery.length > 0,
    heroSrc: primary?.src,
    heroSourceUrl: primary?.sourceUrl,
    tier: "P3",
  };
});

rows.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));
rows.forEach((r, i) => {
  if (i < 50) r.tier = "P1";
  else if (i < 150) r.tier = "P2";
  else r.tier = "P3";
});

const summary = {
  runningIndexable: rows.length,
  withGallery: rows.filter((r) => r.hasGallery).length,
  heroOnly: rows.filter((r) => !r.hasGallery).length,
  p1: rows.filter((r) => r.tier === "P1").length,
  p1WithGallery: rows.filter((r) => r.tier === "P1" && r.hasGallery).length,
  p1HeroOnly: rows.filter((r) => r.tier === "P1" && !r.hasGallery).length,
  p2: rows.filter((r) => r.tier === "P2").length,
  p3: rows.filter((r) => r.tier === "P3").length,
};

writeFileSync(join(OUT, "running-priority.json"), JSON.stringify({ summary, rows }, null, 2));
writeFileSync(
  join(OUT, "p1-top-50.json"),
  JSON.stringify(
    rows.filter((r) => r.tier === "P1"),
    null,
    2,
  ),
);

console.log(JSON.stringify(summary, null, 2));
console.log("\nP1 sample:");
for (const r of rows.slice(0, 15)) {
  console.log(
    `${r.tier} ${r.score.toFixed(1)} gal=${r.galleryCount} ${r.slug} [${r.categorySlug}] ${r.brand}`,
  );
}
