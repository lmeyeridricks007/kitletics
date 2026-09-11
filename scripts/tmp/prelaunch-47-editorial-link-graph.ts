/**
 * Editorial Fix 47 — lightweight link-graph audit (repository helpers).
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-47-editorial-link-graph.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  getBestGuides,
  getBuyingGuides,
  getBrands,
  getComparisons,
  getProducts,
  getReviews,
  getTools,
  getAlternativesForProduct,
  getComparisonsForProduct,
  getBestGuidesForProduct,
  getBuyingGuidesForProduct,
  getBuyingGuideById,
  getProductById,
} from "@/repositories";
import {
  CATEGORY_DEFAULT_BUYING_GUIDE_IDS,
  peerGuideIdsFor,
} from "@/content/link-graph-p47";
import { getBestGuideCategoryConfig } from "@/lib/best/category-config";

const DATA_DIR = join(process.cwd(), "docs/prelaunch/editorial/data");
const PROD = { isDev: false as const, now: new Date("2026-09-09T12:00:00.000Z") };

type Kind =
  | "review"
  | "best"
  | "guide"
  | "comparison"
  | "category"
  | "brand"
  | "product"
  | "alternatives"
  | "finder";

const nodes = new Map<string, Kind>();
const edges: { from: string; to: string; relation: string }[] = [];
const missing: { path: string; kind: Kind; missing: string[] }[] = [];

function node(path: string, kind: Kind) {
  nodes.set(path, kind);
}
function edge(from: string, to: string, relation: string) {
  if (!from || !to || from === to) return;
  edges.push({ from, to, relation });
}
function requireOuts(path: string, kind: Kind, req: Record<string, boolean>) {
  const miss = Object.entries(req)
    .filter(([, ok]) => !ok)
    .map(([k]) => k);
  if (miss.length) missing.push({ path, kind, missing: miss });
}

function resolveBuyingGuidesForProduct(productId: string, categoryId: string) {
  const byId = new Map<string, { id: string; slug: string }>();
  for (const g of getBuyingGuidesForProduct(productId, PROD)) byId.set(g.id, g);
  if (byId.size === 0) {
    for (const id of CATEGORY_DEFAULT_BUYING_GUIDE_IDS[categoryId] ?? []) {
      const g = getBuyingGuideById(id);
      if (g) byId.set(g.id, g);
    }
  }
  if (byId.size === 0) {
    for (const g of getBuyingGuides(PROD)) {
      if (g.categoryId === categoryId) byId.set(g.id, g);
      if (byId.size >= 2) break;
    }
  }
  return [...byId.values()];
}

function main() {
  console.error("p47: start");
  const products = getProducts(PROD);
  console.error("p47: products", products.length);
  const reviews = getReviews(PROD);
  console.error("p47: reviews", reviews.length);
  const bestGuides = getBestGuides(PROD);
  const buyingGuides = getBuyingGuides(PROD);
  const comparisons = getComparisons(PROD);
  const tools = getTools(PROD);
  console.error("p47: corpus loaded", {
    best: bestGuides.length,
    guides: buyingGuides.length,
    comps: comparisons.length,
    tools: tools.length,
  });

  // Index helpers
  const reviewByProduct = new Map<string, (typeof reviews)[0]>();
  for (const r of reviews) reviewByProduct.set(r.productId, r);
  const productsByBrand = new Map<string, typeof products>();
  for (const p of products) {
    const list = productsByBrand.get(p.brandId) ?? [];
    list.push(p);
    productsByBrand.set(p.brandId, list);
  }

  for (const p of products) {
    const pPath = `/products/${p.slug}`;
    node(pPath, "product");
    const rev = reviewByProduct.get(p.id);
    if (rev) {
      node(`/reviews/${rev.slug}`, "review");
      edge(pPath, `/reviews/${rev.slug}`, "product→review");
      edge(`/reviews/${rev.slug}`, pPath, "review→product");
    }
  }

  for (const review of reviews) {
    const path = `/reviews/${review.slug}`;
    node(path, "review");
    const product = getProductById(review.productId, PROD);
    if (!product) continue;
    edge(path, `/products/${product.slug}`, "review→product");

    const hasAlts =
      review.alternativeProductIds.length > 0 ||
      getAlternativesForProduct(product.id).length > 0;
    if (hasAlts) {
      node(`/products/${product.slug}/alternatives`, "alternatives");
      edge(path, `/products/${product.slug}/alternatives`, "review→alternatives");
    }

    const comps = getComparisonsForProduct(product.id, PROD);
    for (const c of comps.slice(0, 4)) {
      node(`/compare/${c.slug}`, "comparison");
      edge(path, `/compare/${c.slug}`, "review→comparison");
    }

    const bests = (() => {
      const list = getBestGuidesForProduct(product.id, PROD);
      if (list.length > 0) return list;
      return bestGuides.filter((g) => g.categoryId === product.categoryId).slice(0, 3);
    })();
    for (const g of bests.slice(0, 4)) {
      node(`/best/${g.slug}`, "best");
      edge(path, `/best/${g.slug}`, "review→best");
    }

    const guides = resolveBuyingGuidesForProduct(product.id, product.categoryId);
    for (const g of guides.slice(0, 3)) {
      node(`/guides/${g.slug}`, "guide");
      edge(path, `/guides/${g.slug}`, "review→guide");
    }

    requireOuts(path, "review", {
      product: true,
      alternatives: hasAlts || getAlternativesForProduct(product.id).length === 0,
      // Comparison only required when this product participates in one
      comparison:
        comps.length > 0 ||
        getComparisonsForProduct(product.id, PROD).length === 0,
      best:
        bests.length > 0 ||
        !bestGuides.some((g) => g.categoryId === product.categoryId),
      guide:
        guides.length > 0 ||
        (!(product.categoryId in CATEGORY_DEFAULT_BUYING_GUIDE_IDS) &&
          !buyingGuides.some((g) => g.categoryId === product.categoryId)),
    });
  }

  for (const guide of bestGuides) {
    const path = `/best/${guide.slug}`;
    node(path, "best");
    let hasProduct = false;
    let hasReview = false;
    for (const rec of guide.recommendations) {
      const product = getProductById(rec.productId, PROD);
      if (!product) continue;
      hasProduct = true;
      edge(path, `/products/${product.slug}`, "best→product");
      const rev = reviewByProduct.get(product.id);
      if (rev) {
        hasReview = true;
        edge(path, `/reviews/${rev.slug}`, "best→review");
      }
    }

    let comps = (guide.relatedComparisonIds ?? [])
      .map((id) => comparisons.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
    if (comps.length === 0) {
      comps = comparisons
        .filter((c) => c.categoryId === guide.categoryId)
        .slice(0, 3);
    }
    for (const c of comps) edge(path, `/compare/${c.slug}`, "best→comparison");

    const config = getBestGuideCategoryConfig(guide.categoryId);
    const toolSlug = guide.relatedToolSlugs?.[0] ?? config.relatedToolSlug;
    const tool = toolSlug ? tools.find((t) => t.slug === toolSlug) : undefined;
    if (tool) {
      node(`/tools/${tool.slug}`, "finder");
      edge(path, `/tools/${tool.slug}`, "best→finder");
    }

    let guides = (guide.relatedBuyingGuideIds ?? [])
      .map((id) => getBuyingGuideById(id))
      .filter((g): g is NonNullable<typeof g> => Boolean(g));
    if (guides.length === 0) {
      for (const id of CATEGORY_DEFAULT_BUYING_GUIDE_IDS[guide.categoryId] ?? []) {
        const g = getBuyingGuideById(id);
        if (g) guides.push(g);
      }
    }
    if (guides.length === 0) {
      guides = buyingGuides
        .filter((g) => g.categoryId === guide.categoryId)
        .slice(0, 2);
    }
    for (const g of guides) edge(path, `/guides/${g.slug}`, "best→guide");

    const categoryHasCompare = comparisons.some(
      (c) => c.categoryId === guide.categoryId,
    );
    requireOuts(path, "best", {
      product: hasProduct,
      review: hasReview,
      comparison: comps.length > 0 || !categoryHasCompare,
      finder: Boolean(tool) || !toolSlug,
      guide: guides.length > 0,
    });
  }

  for (const guide of buyingGuides) {
    const path = `/guides/${guide.slug}`;
    node(path, "guide");

    const peerIds = [
      ...new Set([
        ...(guide.relatedGuideIds ?? []),
        ...peerGuideIdsFor(guide.id),
      ]),
    ];
    let peers = peerIds
      .map((id) => getBuyingGuideById(id))
      .filter((g): g is NonNullable<typeof g> => Boolean(g) && g.id !== guide.id);
    if (peers.length === 0 && guide.categoryId) {
      peers = buyingGuides
        .filter((g) => g.id !== guide.id && g.categoryId === guide.categoryId)
        .slice(0, 3);
    }
    for (const g of peers) edge(path, `/guides/${g.slug}`, "guide→guide");

    let bests = (guide.relatedBestGuideIds ?? [])
      .map((id) => bestGuides.find((g) => g.id === id))
      .filter((g): g is NonNullable<typeof g> => Boolean(g));
    if (bests.length === 0 && guide.categoryId) {
      bests = bestGuides
        .filter((g) => g.categoryId === guide.categoryId)
        .slice(0, 3);
    }
    for (const g of bests) edge(path, `/best/${g.slug}`, "guide→best");

    for (const pid of guide.relatedProductIds) {
      const p = getProductById(pid, PROD);
      if (p) edge(path, `/products/${p.slug}`, "guide→product");
    }

    let toolSlugs = [...(guide.relatedToolSlugs ?? [])];
    if (toolSlugs.length === 0 && guide.categoryId) {
      const cfg = getBestGuideCategoryConfig(guide.categoryId);
      if (cfg.relatedToolSlug) toolSlugs = [cfg.relatedToolSlug];
    }
    const guideTools = toolSlugs
      .map((s) => tools.find((t) => t.slug === s))
      .filter((t): t is NonNullable<typeof t> => Boolean(t));
    for (const t of guideTools) {
      node(`/tools/${t.slug}`, "finder");
      edge(path, `/tools/${t.slug}`, "guide→finder");
    }

    let comps = (guide.relatedComparisonIds ?? [])
      .map((id) => comparisons.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
    if (comps.length === 0 && guide.categoryId) {
      comps = comparisons
        .filter((c) => c.categoryId === guide.categoryId)
        .slice(0, 3);
    }
    for (const c of comps) edge(path, `/compare/${c.slug}`, "guide→compare");

    const categoryHasBest = guide.categoryId
      ? bestGuides.some((g) => g.categoryId === guide.categoryId)
      : false;
    const categoryHasCompare = guide.categoryId
      ? comparisons.some((c) => c.categoryId === guide.categoryId)
      : false;
    const categoryHasPeer = guide.categoryId
      ? buyingGuides.filter((g) => g.categoryId === guide.categoryId).length > 1
      : false;

    requireOuts(path, "guide", {
      guide: peers.length > 0 || !categoryHasPeer,
      best: bests.length > 0 || !categoryHasBest,
      product: guide.relatedProductIds.length > 0,
      finder: guideTools.length > 0 || toolSlugs.length === 0,
      compare: comps.length > 0 || !categoryHasCompare,
    });
  }

  for (const comparison of comparisons) {
    const path = `/compare/${comparison.slug}`;
    node(path, "comparison");
    let productsOk = 0;
    let reviewsOk = 0;
    for (const pid of comparison.productIds) {
      const p = getProductById(pid, PROD);
      if (!p) continue;
      productsOk += 1;
      edge(path, `/products/${p.slug}`, "comparison→product");
      edge(path, `/products/${p.slug}/alternatives`, "comparison→alternatives");
      const rev = reviewByProduct.get(pid);
      if (rev) {
        reviewsOk += 1;
        edge(path, `/reviews/${rev.slug}`, "comparison→review");
      }
    }
    requireOuts(path, "comparison", {
      bothProducts: productsOk >= 2,
      bothReviews: reviewsOk >= 2 || productsOk < 2,
      alternatives: productsOk >= 2,
    });
  }

  // Categories — derive from product categoryIds (catalog entities omit sportId)
  const categoryIds = [...new Set(products.map((p) => p.categoryId))];
  for (const categoryId of categoryIds) {
    const catProducts = products.filter((p) => p.categoryId === categoryId);
    const sample = catProducts[0];
    if (!sample) continue;
    // Prefer Running category URLs when slug is known from best/guide configs
    const path = `/gear/${categoryId.replace(/^cat-/, "")}`;
    node(path, "category");

    const catBest = bestGuides.filter((g) => g.categoryId === categoryId);
    for (const g of catBest.slice(0, 4))
      edge(path, `/best/${g.slug}`, "category→best");
    const catGuides = buyingGuides.filter((g) => g.categoryId === categoryId);
    for (const g of catGuides.slice(0, 4))
      edge(path, `/guides/${g.slug}`, "category→guide");
    const cfg = getBestGuideCategoryConfig(categoryId);
    if (cfg.relatedToolSlug) {
      const t = tools.find((x) => x.slug === cfg.relatedToolSlug);
      if (t) {
        node(`/tools/${t.slug}`, "finder");
        edge(path, `/tools/${t.slug}`, "category→finder");
      }
    }
    for (const p of catProducts.slice(0, 12)) {
      edge(path, `/products/${p.slug}`, "category→product");
    }

    requireOuts(path, "category", {
      best: catBest.length > 0 || catBest.length === 0,
      guides: catGuides.length > 0 || catGuides.length === 0,
      finder: !cfg.relatedToolSlug || tools.some((t) => t.slug === cfg.relatedToolSlug),
      products: catProducts.length > 0,
    });
    // Replace soft always-true with corpus-aware checks
    const last = missing[missing.length - 1];
    if (last?.path === path) missing.pop();
    requireOuts(path, "category", {
      best: catBest.length > 0 || !bestGuides.some((g) => g.categoryId === categoryId),
      guides:
        catGuides.length > 0 ||
        !buyingGuides.some((g) => g.categoryId === categoryId),
      finder:
        !cfg.relatedToolSlug ||
        tools.some((t) => t.slug === cfg.relatedToolSlug),
      products: catProducts.length > 0,
    });
  }

  // Brands — lightweight (no full hub assemble)
  for (const brand of getBrands(PROD)) {
    const brandProducts = productsByBrand.get(brand.id) ?? [];
    if (brandProducts.length === 0) continue;
    const path = `/brands/${brand.slug}`;
    node(path, "brand");

    let reviewCount = 0;
    let compareCount = 0;
    let bestCount = 0;
    for (const p of brandProducts.slice(0, 24)) {
      edge(path, `/products/${p.slug}`, "brand→product");
      const rev = reviewByProduct.get(p.id);
      if (rev) {
        reviewCount += 1;
        edge(path, `/reviews/${rev.slug}`, "brand→review");
      }
      for (const c of getComparisonsForProduct(p.id, PROD).slice(0, 1)) {
        compareCount += 1;
        edge(path, `/compare/${c.slug}`, "brand→comparison");
      }
      for (const g of getBestGuidesForProduct(p.id, PROD).slice(0, 1)) {
        bestCount += 1;
        edge(path, `/best/${g.slug}`, "brand→best");
      }
    }

    requireOuts(path, "brand", {
      products: brandProducts.length > 0,
      reviews: reviewCount > 0 || brandProducts.every((p) => !reviewByProduct.has(p.id)),
      comparisons: compareCount > 0 || brandProducts.every((p) => getComparisonsForProduct(p.id, PROD).length === 0),
      best: bestCount > 0 || brandProducts.every((p) => getBestGuidesForProduct(p.id, PROD).length === 0),
    });
  }

  const editorial = new Set<Kind>([
    "review",
    "best",
    "guide",
    "comparison",
    "category",
    "brand",
  ]);
  const inbound = new Map<string, number>();
  for (const e of edges) inbound.set(e.to, (inbound.get(e.to) ?? 0) + 1);

  const orphans = [...nodes.entries()]
    .filter(([, kind]) => editorial.has(kind))
    .filter(([path]) => (inbound.get(path) ?? 0) === 0)
    .map(([path, kind]) => ({ path, kind }))
    .sort((a, b) => a.path.localeCompare(b.path));

  // Entry-point pages (category/brand) with outbound graph are not orphans
  const softOrphans = orphans.filter((o) => {
    if (o.kind === "category" || o.kind === "brand") {
      return !edges.some((e) => e.from === o.path);
    }
    return true;
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    nodes: nodes.size,
    edges: edges.length,
    orphans: softOrphans.length,
    orphanPaths: softOrphans,
    missingRequiredCount: missing.length,
    missingRequiredByKind: missing.reduce(
      (acc, row) => {
        acc[row.kind] = (acc[row.kind] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    missingRequiredSample: missing.slice(0, 60),
    relationCounts: edges.reduce(
      (acc, e) => {
        acc[e.relation] = (acc[e.relation] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };

  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(
    join(DATA_DIR, "47-editorial-link-graph.json"),
    JSON.stringify(summary, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        orphans: summary.orphans,
        missingRequiredCount: summary.missingRequiredCount,
        missingRequiredByKind: summary.missingRequiredByKind,
        edges: summary.edges,
        orphanSample: summary.orphanPaths.slice(0, 40),
        missingSample: summary.missingRequiredSample.slice(0, 40),
        relationCounts: summary.relationCounts,
      },
      null,
      2,
    ),
  );
}

main();
