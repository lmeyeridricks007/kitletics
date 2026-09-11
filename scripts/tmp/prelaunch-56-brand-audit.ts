/**
 * Fix 56 — audit every Brand hub: READY/INDEXABLE vs HELD classification.
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
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch/get-launch-eligibility";
import { canPublishBrandHub } from "@/lib/brand-hub/config";
import { canRenderBrandHub } from "@/lib/seo/brand-indexability";
import { BRAND_HUB_UNIQUENESS_HOLD_SLUGS } from "@/content/brand-hub-uniqueness-holds";
import { getBrandHubPageData } from "@/lib/brand-hub";

const PROD = { isDev: false as const };
const OUT = join(process.cwd(), "docs/prelaunch/data");
mkdirSync(OUT, { recursive: true });

function main() {
  const brands = getBrands(PROD);
  const products = getProducts(PROD);
  const families = getProductFamilies();
  const reviews = getReviews(PROD);
  const bestGuides = getBestGuides(PROD);
  const buyingGuides = getBuyingGuides(PROD);
  const comparisons = getComparisons(PROD);

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

  const rows = brands.map((brand) => {
    const brandProducts = products.filter((p) => p.brandId === brand.id);
    const fams = families.filter((f) => f.brandId === brand.id);
    const cats = [...new Set(brandProducts.map((p) => p.categoryId))];
    const strengths = brandProducts.filter((p) => (p.strengths?.length ?? 0) > 0).length;
    const current = brandProducts.filter((p) => p.lifecycleStatus === "current").length;
    const reviewCount = brandProducts.reduce(
      (n, p) => n + (reviewByProduct.get(p.id) ?? 0),
      0,
    );
    const comparisonCount = brandProducts.reduce(
      (n, p) => n + (compareByProduct.get(p.id) ?? 0),
      0,
    );
    const bestSlugs = new Set<string>();
    for (const p of brandProducts) {
      for (const slug of bestByProduct.get(p.id) ?? []) bestSlugs.add(slug);
    }
    const guideMentions = buyingGuides.filter((g) =>
      (g.relatedProductIds ?? []).some((id) => brandProducts.some((p) => p.id === id)),
    ).length;
    const evidenceIds = new Set(
      brandProducts.flatMap((p) => p.evidenceIds ?? []),
    );
    const depthOk = canPublishBrandHub({
      productCount: brandProducts.length,
      categoryCount: cats.length,
      familyCount: fams.length,
      strengthSignalCount: strengths,
    });
    const elig = getLaunchEligibility({ kind: "brand", entity: brand }, PROD);
    const uniquenessHold = BRAND_HUB_UNIQUENESS_HOLD_SLUGS.has(brand.slug);
    const indexable = isIndexableEligibility(elig);
    const renderable = canRenderBrandHub(brand, PROD);

    let holdClass:
      | "READY"
      | "UNIQUENESS_HOLD"
      | "HOLD_INSUFFICIENT_DEPTH"
      | "HOLD_NO_PRODUCTS"
      | "HOLD_DEPTH_GATE"
      | "PROMOTE_CANDIDATE"
      | "OTHER" = "READY";

    if (indexable) {
      holdClass = "READY";
    } else if (brandProducts.length === 0) {
      holdClass = "HOLD_NO_PRODUCTS";
    } else if (brandProducts.length <= 2) {
      holdClass = "HOLD_INSUFFICIENT_DEPTH";
    } else if (uniquenessHold) {
      holdClass = "UNIQUENESS_HOLD";
    } else if (!depthOk) {
      holdClass =
        reviewCount >= 2 || bestSlugs.size >= 2 || comparisonCount >= 2
          ? "PROMOTE_CANDIDATE"
          : "HOLD_DEPTH_GATE";
    } else if (uniquenessHold) {
      holdClass = "UNIQUENESS_HOLD";
    } else {
      holdClass = "OTHER";
    }

    return {
      slug: brand.slug,
      name: brand.name,
      id: brand.id,
      products: brandProducts.length,
      categories: cats.length,
      families: fams.length,
      familyNames: fams.map((f) => f.name),
      strengths,
      current,
      reviews: reviewCount,
      comparisons: comparisonCount,
      bestAppearances: bestSlugs.size,
      guideRefs: guideMentions,
      evidence: evidenceIds.size,
      depthOk,
      renderable,
      uniquenessHold,
      indexable,
      disposition: elig.disposition,
      reasons: elig.reasons.map((r) => r.code),
      holdClass,
      productNames: brandProducts.map((p) => p.name).slice(0, 8),
    };
  });

  const byClass: Record<string, number> = {};
  for (const r of rows) {
    byClass[r.holdClass] = (byClass[r.holdClass] ?? 0) + 1;
  }

  const held = rows.filter((r) => !r.indexable);
  const ready = rows.filter((r) => r.indexable);

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      brands: brands.length,
      ready: ready.length,
      indexable: rows.filter((r) => r.indexable).length,
      held: held.length,
      byClass,
    },
    ready: ready.map((r) => ({
      slug: r.slug,
      products: r.products,
      families: r.families,
      reviews: r.reviews,
    })),
    held: held
      .sort((a, b) => b.products - a.products || b.reviews - a.reviews)
      .map((r) => ({
        slug: r.slug,
        class: r.holdClass,
        products: r.products,
        cats: r.categories,
        families: r.families,
        familyNames: r.familyNames,
        strengths: r.strengths,
        reviews: r.reviews,
        comparisons: r.comparisons,
        best: r.bestAppearances,
        guides: r.guideRefs,
        evidence: r.evidence,
        uniquenessHold: r.uniquenessHold,
        depthOk: r.depthOk,
        renderable: r.renderable,
        disposition: r.disposition,
        productsSample: r.productNames,
      })),
    uniquenessHolds: rows.filter((r) => r.uniquenessHold),
    promoteCandidates: rows.filter((r) => r.holdClass === "PROMOTE_CANDIDATE"),
    depthGateHeld3plus: rows.filter(
      (r) => r.holdClass === "HOLD_DEPTH_GATE" && r.products >= 3,
    ),
    insufficient: held.filter((r) => r.holdClass === "HOLD_INSUFFICIENT_DEPTH"),
    noProducts: held.filter((r) => r.holdClass === "HOLD_NO_PRODUCTS"),
  };

  writeFileSync(join(OUT, "56-brand-audit.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.totals, null, 2));
  console.log("uniqueness", report.uniquenessHolds.map((r) => r.slug));
  console.log("promote", report.promoteCandidates.map((r) => r.slug));
  console.log(
    "depth3+",
    report.depthGateHeld3plus.map((r) => ({
      slug: r.slug,
      products: r.products,
      cats: r.categories,
      fam: r.families,
      str: r.strengths,
      reviews: r.reviews,
    })),
  );
  console.log("insufficient count", report.insufficient.length);
  console.log("no products", report.noProducts.length);

  const pageBuiltIndexable = ready.filter((r) =>
    Boolean(getBrandHubPageData({ brandSlug: r.slug })),
  ).length;
  console.log("indexable pages built", pageBuiltIndexable, "/", ready.length);
}

main();
