/**
 * `npm run content:intents`
 * Report canonical intent map + collisions.
 */

import {
  runningContentIntentMap,
  findIntentCollisions,
} from "@/content/running/intent-map";
import { bestGuides } from "@/content/best-guides";
import { buyingGuides } from "@/content/editorial";

console.log("\n=== Running Content Intent Map ===\n");

for (const p of ["P0", "P1", "P2", "P3"] as const) {
  const entries = runningContentIntentMap.filter((e) => e.priority === p);
  if (!entries.length) continue;
  console.log(`— ${p} —`);
  for (const e of entries) {
    console.log(`  ${e.topic}`);
    console.log(`    → ${e.pageType} ${e.canonicalPath}`);
    if (e.supportingPaths?.length) {
      console.log(`    + ${e.supportingPaths.join(", ")}`);
    }
  }
  console.log("");
}

const collisions = findIntentCollisions();
console.log(`Collisions (same topic → multiple canonicals): ${collisions.length}`);
for (const c of collisions) {
  console.log(`  ⚠ ${c.topic}: ${c.paths.join(" | ")}`);
}

// Soft collision: Best Guide slug overlapping Buying Guide slug intent
console.log("\n— Soft checks (best vs guides slug overlap) —");
const bestSlugs = new Set(bestGuides.map((g) => g.slug));
for (const g of buyingGuides) {
  if (bestSlugs.has(g.slug)) {
    console.log(`  ⚠ Identical slug in best and guides: ${g.slug}`);
  }
  if (g.slug.startsWith("best-")) {
    console.log(`  ⚠ Buying guide slug looks like Best intent: ${g.slug}`);
  }
}

console.log("\n=== End intents ===\n");
