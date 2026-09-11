/**
 * `npm run catalog:relationships`
 * Analyse catalog → propose relationship candidates (does NOT overwrite approved edges).
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { products } from "@/content/products";
import { productFamilies } from "@/content/families";
import { recommendations } from "@/content/recommendations";
import { generateRelationshipCandidates } from "@/domain/relationships/candidates";
import {
  detectRelationshipContradictions,
  getAllProductRelationships,
} from "@/repositories/relationships";
import { isHighValueProduct } from "@/domain/relationships/catalog-priority";

const published = products.filter((p) => p.status === "published");

const candidates = generateRelationshipCandidates({
  products: published,
  recommendations,
  families: productFamilies,
  maxPerSource: 6,
});

const approved = getAllProductRelationships().filter((r) => r.status === "approved");
const approvedKeys = new Set(
  approved.map((r) => `${r.sourceProductId}|${r.targetProductId}|${r.type}`),
);

const novel = candidates.filter(
  (c) => !approvedKeys.has(`${c.sourceProductId}|${c.targetProductId}|${c.proposedType}`),
);

const high = novel.filter((c) => c.comparisonPriority === "HIGH");
const medium = novel.filter((c) => c.comparisonPriority === "MEDIUM");

console.log("\n=== Kitletics relationship candidate generation ===\n");
console.log(`Approved relationships: ${approved.length}`);
console.log(`Generated candidates:   ${candidates.length}`);
console.log(`Novel (not approved):   ${novel.length}`);
console.log(`  HIGH priority:   ${high.length}`);
console.log(`  MEDIUM priority: ${medium.length}`);

const contradictions = detectRelationshipContradictions(approved);
if (contradictions.length) {
  console.log("\nContradictions:");
  for (const c of contradictions) console.log(`  ⚠ ${c}`);
} else {
  console.log("\nNo approved-edge contradictions detected.");
}

console.log("\n— HIGH PRIORITY novel candidates (sample) —");
for (const c of high.slice(0, 25)) {
  console.log(
    `  ${c.sourceProductId} → ${c.targetProductId} [${c.proposedType}] conf=${c.confidence.toFixed(2)}`,
  );
  for (const r of c.reasons.slice(0, 2)) console.log(`     • ${r}`);
}

const orphans = published.filter((p) => {
  if (!isHighValueProduct(p.id) && p.categoryId !== "cat-running-shoes") return false;
  return !approved.some(
    (r) => r.sourceProductId === p.id || r.targetProductId === p.id,
  );
});
console.log(`\nHigh-value / shoe orphans: ${orphans.length}`);
for (const p of orphans.slice(0, 15)) console.log(`  ${p.fullName}`);

const outDir = join(process.cwd(), "data/staging/relationships");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "candidates.json");
writeFileSync(
  outPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      novelCandidateCount: novel.length,
      candidates: novel.slice(0, 500),
    },
    null,
    2,
  ),
);
console.log(`\nWrote staging candidates → ${outPath}`);
console.log("Review before promoting to approved productRelationships.\n");
