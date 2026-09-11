/**
 * Fix 70 — semantic decision-graph quality audit.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getProducts } from "@/repositories/products";
import { getAllProductRelationships } from "@/repositories/relationships";
import { getReviews, getBestGuides, getBuyingGuides, getComparisons } from "@/repositories";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch/get-launch-eligibility";
import { isAlternativeType } from "@/domain/relationships/types";
import {
  scoreAlternativePair,
  scoreComparisonPair,
  scoreProductInBest,
  scoreProductInGuide,
  scoreReviewAlternative,
  scoreBestComparisonLink,
  bestGuideContext,
  type GraphQualityClass,
} from "@/lib/decision-graph/semantic-quality";

const PROD = { isDev: false as const };
const OUT = join(
  process.cwd(),
  process.env.GRAPH_AUDIT_OUT ?? "docs/prelaunch/data/rc-v3",
);

function bump(map: Record<GraphQualityClass, number>, cls: GraphQualityClass) {
  map[cls] += 1;
}

function empty(): Record<GraphQualityClass, number> {
  return { STRONG: 0, VALID: 0, WEAK: 0, INVALID: 0 };
}

function main() {
  mkdirSync(OUT, { recursive: true });
  const products = getProducts(PROD);
  const byId = new Map(products.map((p) => [p.id, p]));
  const indexableIds = new Set<string>();
  for (const p of products) {
    const elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
    if (isIndexableEligibility(elig)) indexableIds.add(p.id);
  }
  const runningIndexable = products.filter(
    (p) => indexableIds.has(p.id) && p.sportIds.includes("sport-running"),
  );
  const runningSet = new Set(runningIndexable.map((p) => p.id));

  const rels = getAllProductRelationships().filter((r) => r.status === "approved");
  const comparisons = getComparisons(PROD);
  const bests = getBestGuides(PROD);
  const guides = getBuyingGuides(PROD);
  const reviews = getReviews(PROD);

  const altCounts = empty();
  const altInvalid: object[] = [];
  const altWeak: object[] = [];
  const seenAlt = new Set<string>();

  for (const p of products) {
    for (const id of p.alternativeProductIds ?? []) {
      const t = byId.get(id);
      if (!t) {
        bump(altCounts, "INVALID");
        altInvalid.push({ source: p.slug, target: id, reasons: ["missing target"] });
        continue;
      }
      const key = `${p.id}|${id}`;
      if (seenAlt.has(key)) continue;
      seenAlt.add(key);
      const rel = rels.find(
        (r) =>
          r.sourceProductId === p.id &&
          r.targetProductId === id &&
          isAlternativeType(r.type),
      );
      const s = scoreAlternativePair(p, t, rel?.type);
      bump(altCounts, s.cls);
      const row = {
        source: p.slug,
        target: t.slug,
        type: rel?.type,
        ...s,
        runningIndexable: runningSet.has(p.id),
      };
      if (s.cls === "INVALID") altInvalid.push(row);
      if (s.cls === "WEAK") altWeak.push(row);
    }
  }

  const cmpCounts = empty();
  const cmpInvalid: object[] = [];
  const cmpWeak: object[] = [];
  for (const c of comparisons) {
    const a = byId.get(c.productIds[0] ?? "");
    const b = byId.get(c.productIds[1] ?? "");
    if (!a || !b) {
      bump(cmpCounts, "INVALID");
      cmpInvalid.push({ slug: c.slug, reasons: ["unresolved product"] });
      continue;
    }
    const s = scoreComparisonPair(a, b);
    bump(cmpCounts, s.cls);
    const row = { slug: c.slug, a: a.slug, b: b.slug, ...s };
    if (s.cls === "INVALID") cmpInvalid.push(row);
    if (s.cls === "WEAK") cmpWeak.push(row);
  }

  const bestCounts = empty();
  const bestInvalid: object[] = [];
  const bestWeak: object[] = [];
  for (const g of bests) {
    const ctx = bestGuideContext(g.slug, g.title);
    for (const rec of g.recommendations) {
      const p = byId.get(rec.productId);
      if (!p) {
        bump(bestCounts, "INVALID");
        bestInvalid.push({ guide: g.slug, product: rec.productId, reasons: ["missing"] });
        continue;
      }
      const s = scoreProductInBest(p, ctx, g.categoryId);
      bump(bestCounts, s.cls);
      const row = { guide: g.slug, product: p.slug, ...s };
      if (s.cls === "INVALID") bestInvalid.push(row);
      if (s.cls === "WEAK") bestWeak.push(row);
    }
  }

  const guideCounts = empty();
  const guideInvalid: object[] = [];
  const guideWeak: object[] = [];
  for (const g of guides) {
    for (const id of g.relatedProductIds ?? []) {
      const p = byId.get(id);
      if (!p) {
        bump(guideCounts, "INVALID");
        guideInvalid.push({ guide: g.slug, product: id, reasons: ["missing"] });
        continue;
      }
      const s = scoreProductInGuide(p, g.slug, g.categoryId);
      bump(guideCounts, s.cls);
      const row = { guide: g.slug, product: p.slug, ...s };
      if (s.cls === "INVALID") guideInvalid.push(row);
      if (s.cls === "WEAK") guideWeak.push(row);
    }
  }

  const reviewCounts = empty();
  const reviewInvalid: object[] = [];
  const reviewWeak: object[] = [];
  for (const r of reviews) {
    const p = byId.get(r.productId);
    if (!p) continue;
    const text = [
      r.verdict,
      r.summary,
      ...(r.cons ?? []),
      ...(r.whoShouldAvoid ?? []),
    ].join(" ");
    for (const id of r.alternativeProductIds ?? []) {
      const t = byId.get(id);
      if (!t) {
        bump(reviewCounts, "INVALID");
        reviewInvalid.push({ review: r.slug, target: id, reasons: ["missing"] });
        continue;
      }
      const s = scoreReviewAlternative(p, t, text);
      bump(reviewCounts, s.cls);
      const row = { review: r.slug, source: p.slug, target: t.slug, ...s };
      if (s.cls === "INVALID") reviewInvalid.push(row);
      if (s.cls === "WEAK") reviewWeak.push(row);
    }
  }

  const bestCmpCounts = empty();
  const bestCmpInvalid: object[] = [];
  const bestCmpWeak: object[] = [];
  const cmpById = new Map(comparisons.map((c) => [c.id, c]));
  for (const g of bests) {
    const recIds = g.recommendations.map((r) => r.productId);
    const recProducts = recIds
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    for (const id of g.relatedComparisonIds ?? []) {
      const c = cmpById.get(id);
      if (!c) {
        bump(bestCmpCounts, "INVALID");
        bestCmpInvalid.push({ guide: g.slug, cmp: id, reasons: ["missing comparison"] });
        continue;
      }
      const s = scoreBestComparisonLink(recIds, c.productIds, recProducts);
      bump(bestCmpCounts, s.cls);
      const row = { guide: g.slug, cmp: c.slug, ...s };
      if (s.cls === "INVALID") bestCmpInvalid.push(row);
      if (s.cls === "WEAK") bestCmpWeak.push(row);
    }
  }

  const runningAlt = { invalid: 0, weak: 0 };
  for (const row of altInvalid as { runningIndexable?: boolean }[]) {
    if (row.runningIndexable) runningAlt.invalid += 1;
  }
  for (const row of altWeak as { runningIndexable?: boolean }[]) {
    if (row.runningIndexable) runningAlt.weak += 1;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    products: products.length,
    indexable: indexableIds.size,
    runningIndexable: runningIndexable.length,
    relationshipsApproved: rels.length,
    scores: {
      productAlternative: altCounts,
      productComparison: cmpCounts,
      productBest: bestCounts,
      productGuide: guideCounts,
      reviewAlternative: reviewCounts,
      bestComparison: bestCmpCounts,
    },
    runningIndexableAlts: runningAlt,
  };

  writeFileSync(join(OUT, "graph-audit.json"), JSON.stringify({
    ...report,
    productAlternativeInvalid: altInvalid,
    productAlternativeWeak: altWeak,
    comparisonInvalid: cmpInvalid,
    comparisonWeak: cmpWeak,
    bestInvalid,
    bestWeak,
    guideInvalid,
    guideWeak,
    reviewInvalid,
    reviewWeak,
    bestComparisonInvalid: bestCmpInvalid,
    bestComparisonWeak: bestCmpWeak,
  }, null, 2));
  writeFileSync(join(OUT, "graph-audit-summary.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  console.log("invalid alts", altInvalid.length, "weak alts", altWeak.length);
  console.log("cmp invalid", cmpInvalid.length, "weak", cmpWeak.length);
  console.log("best invalid", bestInvalid.length, "weak", bestWeak.length);
  console.log("guide invalid", guideInvalid.length, "weak", guideWeak.length);
  console.log("review invalid", reviewInvalid.length, "weak", reviewWeak.length);
  console.log("best-cmp invalid", bestCmpInvalid.length, "weak", bestCmpWeak.length);
}

main();
