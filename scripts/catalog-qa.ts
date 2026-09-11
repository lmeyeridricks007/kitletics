/**
 * Catalog QA — `npm run catalog:qa`
 * Internal developer report for Prompt 14 Running catalog health.
 */

import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { offers } from "@/content/offers";
import { evidence } from "@/content/evidence";
import { recommendations } from "@/content/recommendations";
import { categories } from "@/content/taxonomy/categories";
import { comparisons as allComparisons } from "@/content/editorial";
import { productGenerationChanges } from "@/content/generation-changes";
import { REGIONS } from "@/domain/shared/types";
import {
  canPublishProduct,
  coreSpecCoverage,
} from "@/domain/catalog/publishability";
import { ROTATION_ROLES } from "@/domain/shoe-rotation/roles";
import {
  detectRelationshipContradictions,
  getAllProductRelationships,
  getAlternativesFromGraph,
  getDirectCompetitors,
  getRotationComplements,
  getCompatibleProducts,
} from "@/repositories/relationships";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import {
  RELATIONSHIP_GROUPS,
  normalizeRelationshipType,
  type ProductRelationshipType,
} from "@/domain/relationships/types";
import { isHighValueProduct } from "@/domain/relationships/catalog-priority";
import { buildReviewAgentCatalog } from "@/domain/review-agent/catalog";
import {
  computeReviewPriority,
  buildPriorityIndex,
} from "@/domain/review-agent/priority";
import { determineCoverageStatus } from "@/domain/review-agent/coverage";
import { computeReviewReadiness } from "@/domain/review-agent/readiness";
import { getEvidenceForIds as getEvidenceForIdsRepo } from "@/repositories/recommendations";

const runningCategoryIds = new Set(
  categories
    .filter((c) => c.sportIds.includes("sport-running"))
    .map((c) => c.id),
);

/** Hard gate: duplicate entity IDs break routing, offers, and recommendations. */
function assertUniqueIds(label: string, ids: string[]): string[] {
  const counts = new Map<string, number>();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  const dupes: string[] = [];
  for (const [id, n] of counts) {
    if (n > 1) dupes.push(`${label} "${id}" ×${n}`);
  }
  return dupes;
}

const idGateFailures = [
  ...assertUniqueIds("product", products.map((p) => p.id)),
  ...assertUniqueIds("brand", brands.map((b) => b.id)),
  ...assertUniqueIds("product-slug", products.map((p) => p.slug)),
  ...assertUniqueIds("brand-slug", brands.map((b) => b.slug)),
];
if (idGateFailures.length > 0) {
  console.error("\n=== Catalog QA GATE FAIL: duplicate IDs ===\n");
  for (const msg of idGateFailures) console.error(`  ${msg}`);
  console.error("");
  process.exit(1);
}

const published = products.filter((p) => p.status === "published");
const running = published.filter((p) => runningCategoryIds.has(p.categoryId));

function pct(n: number, d: number): string {
  if (!d) return "0%";
  return `${Math.round((n / d) * 100)}%`;
}

console.log("\n=== Kitletics Catalog QA (Running focus) ===\n");

// 1. Counts by category
console.log("— Products by category (published Running) —");
const byCat = new Map<string, number>();
for (const p of running) {
  byCat.set(p.categoryId, (byCat.get(p.categoryId) ?? 0) + 1);
}
for (const c of categories.filter((x) => runningCategoryIds.has(x.id))) {
  console.log(`  ${c.name.padEnd(28)} ${byCat.get(c.id) ?? 0}`);
}
console.log(`  TOTAL Running published: ${running.length}`);
console.log(`  TOTAL published (all sports): ${published.length}`);

// 2. Lifecycle
console.log("\n— Lifecycle (Running published) —");
const byLife = new Map<string, number>();
for (const p of running) {
  byLife.set(p.lifecycleStatus, (byLife.get(p.lifecycleStatus) ?? 0) + 1);
}
for (const [k, v] of [...byLife.entries()].sort()) console.log(`  ${k}: ${v}`);

// 3. Brands
console.log("\n— Brand counts (Running published) —");
const brandName = new Map(brands.map((b) => [b.id, b.name]));
const byBrand = new Map<string, number>();
for (const p of running) {
  byBrand.set(p.brandId, (byBrand.get(p.brandId) ?? 0) + 1);
}
for (const [id, n] of [...byBrand.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${(brandName.get(id) ?? id).padEnd(24)} ${n}`);
}

// 4. Spec completeness — shoes
const shoes = running.filter((p) => p.categoryId === "cat-running-shoes");
const shoeKeys = [
  "weight",
  "drop",
  "heelStack",
  "forefootStack",
  "cushionLevel",
  "stability",
  "terrain",
  "widthOptions",
  "plateMaterial",
];
console.log("\n— Running Shoes spec coverage —");
const shoeCov = coreSpecCoverage(running, "cat-running-shoes", shoeKeys);
for (const k of shoeKeys) console.log(`  ${k.padEnd(16)} ${shoeCov[k]}%`);

console.log("\n— GPS Watches spec coverage —");
const watchCov = coreSpecCoverage(running, "cat-gps-watches", [
  "displayType",
  "batterySmartwatch",
  "batteryGps",
  "multiBandGps",
  "maps",
  "weight",
]);
for (const [k, v] of Object.entries(watchCov)) console.log(`  ${k.padEnd(20)} ${v}%`);

// 5. Images / evidence
const withHero = running.filter((p) => p.images.length > 0).length;
const withEvidence = running.filter((p) => p.evidenceIds.length > 0).length;
console.log("\n— Media & Evidence —");
console.log(`  Hero/fallback image: ${pct(withHero, running.length)} (${withHero}/${running.length})`);
console.log(`  Has Evidence:        ${pct(withEvidence, running.length)} (${withEvidence}/${running.length})`);
console.log(`  Evidence records:    ${evidence.length}`);

// 6. Offers by region
console.log("\n— Offer coverage by region (Running products with ≥1 offer) —");
const runningIds = new Set(running.map((p) => p.id));
for (const region of REGIONS) {
  const withOffer = new Set(
    offers
      .filter((o) => o.region === region && runningIds.has(o.productId))
      .map((o) => o.productId),
  );
  console.log(`  ${region}: ${pct(withOffer.size, running.length)} (${withOffer.size}/${running.length})`);
}

// 7. Recommendations
console.log("\n— Recommendation coverage (Running shoes) —");
const shoeIds = new Set(shoes.map((s) => s.id));
const recContexts = [
  "uc-daily-training",
  "uc-easy-runs",
  "uc-recovery-runs",
  "uc-long-runs",
  "uc-tempo-runs",
  "uc-intervals",
  "uc-5k",
  "uc-10k",
  "uc-half",
  "uc-marathon",
  "uc-trail-training",
  "uc-treadmill",
];
for (const uc of recContexts) {
  const n = new Set(
    recommendations
      .filter((r) => r.useCaseId === uc && shoeIds.has(r.productId))
      .map((r) => r.productId),
  ).size;
  const flag = n <= 1 ? " ⚠" : "";
  console.log(`  ${uc.padEnd(22)} ${n} products${flag}`);
}

const shoesWithAnyRec = new Set(
  recommendations.filter((r) => shoeIds.has(r.productId)).map((r) => r.productId),
).size;
console.log(`  Shoes with ≥1 Recommendation: ${shoesWithAnyRec}/${shoes.length}`);

// 8. Publishability / Finder / Rotation
console.log("\n— Publishability (Running shoes) —");
let ok = 0;
const tierCount = { complete: 0, usable: 0, partial: 0, insufficient: 0 };
for (const p of shoes) {
  const check = canPublishProduct(p);
  if (check.ok) ok++;
  tierCount[check.tier]++;
}
console.log(`  canPublishProduct ok: ${ok}/${shoes.length}`);
console.log(`  tiers:`, tierCount);

const finderEligible = shoes.filter((p) => {
  if (p.lifecycleStatus === "upcoming" || p.lifecycleStatus === "discontinued") return false;
  const terrain = p.specifications.terrain;
  const cushion = p.specifications.cushionLevel;
  const stability = p.specifications.stability;
  return terrain != null && cushion != null && stability != null;
});
console.log(`\n— Running Shoe Finder eligible: ${finderEligible.length}/${shoes.length}`);

console.log("\n— Rotation role coverage (products with rec or useCase overlap) —");
for (const role of ROTATION_ROLES) {
  let n = 0;
  for (const p of shoes) {
    const hasRec = recommendations.some(
      (r) =>
        r.productId === p.id &&
        !!r.useCaseId &&
        role.useCaseIds.includes(r.useCaseId),
    );
    const hasUc = role.useCaseIds.some((id) => p.useCaseIds.includes(id));
    if (hasRec || hasUc) n++;
  }
  const flag = n <= 1 ? " ⚠" : "";
  console.log(`  ${role.id.padEnd(12)} ${n}${flag}`);
}

// 9. Comparison readiness
console.log("\n— Comparison readiness (≥2 complete/usable publishable products) —");
for (const c of categories.filter((x) => runningCategoryIds.has(x.id))) {
  const list = running.filter((p) => p.categoryId === c.id);
  const ready = list.filter((p) => canPublishProduct(p).ok).length;
  const status = ready >= 2 ? "ready" : "not ready";
  console.log(`  ${c.name.padEnd(28)} ${ready}/${list.length} publishable — ${status}`);
}

// 10. Missing data backlog sample
console.log("\n— Sample gaps (shoes missing weight) —");
const missingWeight = shoes.filter((p) => p.specifications.weight == null).slice(0, 12);
for (const p of missingWeight) console.log(`  ${p.fullName}`);
if (shoes.filter((p) => p.specifications.weight == null).length > 12) {
  console.log(
    `  … +${shoes.filter((p) => p.specifications.weight == null).length - 12} more`,
  );
}

// 11. Relationship graph
const rels = getAllProductRelationships().filter((r) => r.status === "approved");
console.log("\n— RUNNING RELATIONSHIP GRAPH —");
console.log(`  Approved relationships: ${rels.length}`);
const byType = new Map<string, number>();
for (const r of rels) {
  const t = normalizeRelationshipType(r.type);
  byType.set(t, (byType.get(t) ?? 0) + 1);
}
for (const [t, n] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
  const group =
    RELATIONSHIP_GROUPS[t as ProductRelationshipType] ?? "?";
  console.log(`  ${t.padEnd(28)} ${n}  [${group}]`);
}

const withRel = new Set<string>();
for (const r of rels) {
  withRel.add(r.sourceProductId);
  withRel.add(r.targetProductId);
}
const zeroRel = running.filter((p) => !withRel.has(p.id));
console.log(`  Products with zero relationships: ${zeroRel.length}`);
const overConnected = running.filter(
  (p) => rels.filter((r) => r.sourceProductId === p.id).length > 20,
);
console.log(`  Products with >20 outbound relationships: ${overConnected.length}`);
console.log(
  `  Avg outbound per Running product: ${(
    rels.filter((r) => runningIds.has(r.sourceProductId)).length /
    Math.max(1, running.length)
  ).toFixed(2)}`,
);

const contradictions = detectRelationshipContradictions(rels);
console.log(`  Contradictions: ${contradictions.length}`);
for (const c of contradictions.slice(0, 8)) console.log(`    ⚠ ${c}`);

let altEligible = 0;
for (const p of running) {
  if (canPublishAlternativesPage(p, rels).ok) altEligible++;
}
console.log(`  Alternatives pages eligible: ${altEligible}`);

const publishedCmp = allComparisons.filter((c) => c.status === "published");
const byCmpType = new Map<string, number>();
for (const c of publishedCmp) {
  byCmpType.set(c.comparisonType, (byCmpType.get(c.comparisonType) ?? 0) + 1);
}
console.log(`  Published comparisons: ${publishedCmp.length}`);
for (const [t, n] of byCmpType) console.log(`    ${t}: ${n}`);
console.log(`  Generation-change records: ${productGenerationChanges.length}`);

console.log("\n— High-value product graph coverage —");
for (const p of running.filter((x) => isHighValueProduct(x.id)).slice(0, 20)) {
  const alts = getAlternativesFromGraph(p.id).length;
  const comps = getDirectCompetitors(p.id).length;
  const rot = getRotationComplements(p.id).length;
  const compat = getCompatibleProducts(p.id).length;
  const flag = alts < 3 || comps < 1 ? " ⚠" : "";
  console.log(
    `  ${p.fullName.padEnd(42)} alts=${alts} competitors=${comps} complements=${rot} compat=${compat}${flag}`,
  );
}

const stale = rels.filter((r) => {
  if (!r.lastVerifiedAt) return true;
  const age = Date.now() - Date.parse(r.lastVerifiedAt);
  return age > 1000 * 60 * 60 * 24 * 200;
});
console.log(`\n  Stale relationships (>200d or missing verified): ${stale.length}`);

// --- Review coverage (lifecycle) ---
console.log("\n— Review coverage —");
{
  const rc = buildReviewAgentCatalog();
  const signalsFor = buildPriorityIndex({
    bestGuideProductIds: rc.bestGuideProductIds,
    comparisonProductIds: rc.comparisonProductIds,
    gearSetupProductIds: rc.gearSetupProductIds,
    featuredHubProductIds: rc.featuredHubProductIds,
    finderCandidateIds: rc.finderCandidateIds,
    majorFamilyProductIds: rc.families
      .filter((f) => f.productIds.length >= 2)
      .flatMap((f) => f.productIds.slice(0, 1)),
  });

  const counts = {
    products: 0,
    complete: 0,
    p0: 0,
    p0Ready: 0,
    p1: 0,
    p1Ready: 0,
    expert: 0,
    firstHand: 0,
    hybrid: 0,
    stale: 0,
    blocked: 0,
  };
  for (const p of rc.products.filter((x) => x.status === "published")) {
    counts.products += 1;
    const priority = computeReviewPriority(p, signalsFor(p.id));
    const review = rc.reviews.find((r) => r.productId === p.id);
    const evidence = getEvidenceForIdsRepo(review?.evidenceIds ?? p.evidenceIds);
    const readiness = computeReviewReadiness({ product: p, review, evidence });
    const { status } = determineCoverageStatus({
      product: p,
      review,
      evidence,
      priority,
      readiness,
    });
    if (status === "complete") counts.complete += 1;
    if (status === "blocked") counts.blocked += 1;
    if (status === "needs-refresh") counts.stale += 1;
    if (priority === "P0") {
      counts.p0 += 1;
      if (status === "complete") counts.p0Ready += 1;
    }
    if (priority === "P1") {
      counts.p1 += 1;
      if (status === "complete") counts.p1Ready += 1;
    }
    if (review?.reviewType === "expert-research") counts.expert += 1;
    if (review?.reviewType === "first-hand-test") counts.firstHand += 1;
    if (review?.reviewType === "hybrid") counts.hybrid += 1;
  }
  console.log(`  Products: ${counts.products}`);
  console.log(
    `  Review coverage (complete): ${counts.complete} (${pct(counts.complete, counts.products)})`,
  );
  console.log(`  P0 coverage: ${counts.p0Ready}/${counts.p0}`);
  console.log(`  P1 coverage: ${counts.p1Ready}/${counts.p1}`);
  console.log(
    `  Expert Research: ${counts.expert} · First-Hand: ${counts.firstHand} · Hybrid: ${counts.hybrid}`,
  );
  console.log(`  Stale: ${counts.stale} · Blocked: ${counts.blocked}`);
}

console.log("\n=== End catalog QA ===\n");
