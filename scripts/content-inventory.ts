/**
 * `npm run content:inventory`
 * Inventory of editorial decision content (Prompt 16).
 */

import { bestGuides } from "@/content/best-guides";
import { buyingGuides, gearSetups, comparisons } from "@/content/editorial";
import { reviews } from "@/content/reviews";
import { products } from "@/content/products";
import { offers } from "@/content/offers";
import { recommendations } from "@/content/recommendations";
import {
  runningContentIntentMap,
  findIntentCollisions,
} from "@/content/running/intent-map";
import { categories } from "@/content/taxonomy/categories";

const productById = new Map(products.map((p) => [p.id, p]));
const recById = new Map(recommendations.map((r) => [r.id, r]));
const offerProductIds = new Set(offers.map((o) => o.productId));

type Row = {
  type: string;
  id: string;
  url: string;
  status: string;
  sport?: string;
  category?: string;
  products: number;
  lastVerified?: string;
  nextReview?: string;
  priority?: string;
};

const priorityByPath = new Map(
  runningContentIntentMap.map((e) => [e.canonicalPath, e.priority]),
);

const rows: Row[] = [];

for (const g of bestGuides) {
  rows.push({
    type: "best-guide",
    id: g.id,
    url: `/best/${g.slug}`,
    status: g.status,
    sport: g.sportId,
    category: g.categoryId,
    products: g.recommendations.length,
    lastVerified: g.lastVerifiedAt,
    nextReview: g.nextReviewAt,
    priority: priorityByPath.get(`/best/${g.slug}`),
  });
}
for (const g of buyingGuides) {
  rows.push({
    type: "buying-guide",
    id: g.id,
    url: `/guides/${g.slug}`,
    status: g.status,
    sport: g.sportId,
    category: g.categoryId,
    products: g.relatedProductIds.length,
    lastVerified: g.lastVerifiedAt,
    priority: priorityByPath.get(`/guides/${g.slug}`),
  });
}
for (const s of gearSetups) {
  rows.push({
    type: "setup",
    id: s.id,
    url: `/setups/${s.slug}`,
    status: s.status,
    sport: s.sportId,
    products: s.items.length,
    lastVerified: s.lastVerifiedAt,
    priority: priorityByPath.get(`/setups/${s.slug}`),
  });
}
for (const c of comparisons) {
  rows.push({
    type: "comparison",
    id: c.id,
    url: `/compare/${c.slug}`,
    status: c.status,
    category: c.categoryId,
    products: c.productIds.length,
    lastVerified: c.lastVerifiedAt,
  });
}
for (const r of reviews) {
  rows.push({
    type: "review",
    id: r.id,
    url: `/reviews/${r.slug}`,
    status: r.status,
    products: 1,
    lastVerified: r.lastVerifiedAt,
  });
}

console.log("\n=== Kitletics Content Inventory ===\n");
const byType = new Map<string, number>();
for (const r of rows) byType.set(r.type, (byType.get(r.type) ?? 0) + 1);
for (const [t, n] of [...byType.entries()].sort()) {
  console.log(`  ${t.padEnd(16)} ${n}`);
}

const runningBest = bestGuides.filter((g) => g.sportId === "sport-running");
const runningBuying = buyingGuides.filter((g) => g.sportId === "sport-running");
const runningSetups = gearSetups.filter((g) => g.sportId === "sport-running");
console.log(`\nRunning Best Guides:   ${runningBest.length}`);
console.log(`Running Buying Guides: ${runningBuying.length}`);
console.log(`Running Setups:        ${runningSetups.length}`);

console.log("\n— Priority (from intent map) —");
for (const p of ["P0", "P1", "P2", "P3"] as const) {
  const n = rows.filter((r) => r.priority === p).length;
  console.log(`  ${p}: ${n}`);
}

console.log("\n— Discontinued primary picks —");
let disc = 0;
for (const g of runningBest) {
  for (const rec of g.recommendations) {
    const p = productById.get(rec.productId);
    if (p?.lifecycleStatus === "discontinued") {
      console.log(`  ⚠ ${g.slug} → ${p.fullName}`);
      disc++;
    }
  }
}
if (!disc) console.log("  none");

console.log("\n— Previous-generation as primary current pick —");
let prev = 0;
for (const g of runningBest) {
  for (const rec of g.recommendations.slice(0, 3)) {
    const p = productById.get(rec.productId);
    if (p?.lifecycleStatus === "previous-generation") {
      console.log(`  ⚠ ${g.slug} #${rec.rank} → ${p.fullName}`);
      prev++;
    }
  }
}
if (!prev) console.log("  none in top-3 awards");

console.log("\n— Offer coverage (Running Best Guide recs) —");
let withOffer = 0;
let withoutOffer = 0;
for (const g of runningBest) {
  for (const rec of g.recommendations) {
    if (offerProductIds.has(rec.productId)) withOffer++;
    else withoutOffer++;
  }
}
console.log(`  with Offer: ${withOffer}`);
console.log(`  without Offer: ${withoutOffer}`);

console.log("\n— Recommendation ID coverage —");
let withRec = 0;
let withoutRec = 0;
for (const g of runningBest) {
  for (const rec of g.recommendations) {
    if (rec.recommendationId && recById.has(rec.recommendationId)) withRec++;
    else withoutRec++;
  }
}
console.log(`  linked Recommendation: ${withRec}`);
console.log(`  missing Recommendation: ${withoutRec}`);

console.log("\n— Category coverage (Running) —");
const runningCats = categories.filter((c) =>
  c.sportIds.includes("sport-running"),
);
for (const cat of runningCats) {
  const hasBest = runningBest.some((g) => g.categoryId === cat.id);
  const hasBuying = runningBuying.some((g) => g.categoryId === cat.id);
  const hasProducts = products.some(
    (p) => p.categoryId === cat.id && p.status === "published",
  );
  console.log(
    `  ${cat.name.padEnd(28)} Best:${hasBest ? "✓" : "–"} Buy:${hasBuying ? "✓" : "–"} Products:${hasProducts ? "✓" : "–"}`,
  );
}

const collisions = findIntentCollisions();
console.log(`\nIntent collisions: ${collisions.length}`);
for (const c of collisions) {
  console.log(`  ${c.topic}: ${c.paths.join(" , ")}`);
}

console.log("\n=== End inventory ===\n");
