/**
 * npm run racket:relationship-qa
 */
import { getAllProductRelationships } from "@/repositories/relationships";
import { products } from "@/content/products";
import { byCategory, PADEL_RACKET, TENNIS_RACKET } from "./lib/racket-catalog-helpers";

const p0: string[] = [];
const p1: string[] = [];
const log = (s = "") => console.log(s);

const rels = getAllProductRelationships();
const racketIds = new Set(
  [...byCategory(PADEL_RACKET), ...byCategory(TENNIS_RACKET)].map((p) => p.id),
);
const racketRels = rels.filter(
  (r) => racketIds.has(r.sourceProductId) || racketIds.has(r.targetProductId),
);

log("# Racket Relationship QA\n");
log(`- Total graph edges touching racket catalogs: ${racketRels.length}`);

const gens = racketRels.filter(
  (r) =>
    r.type === "previous-generation" ||
    r.type === "next-generation",
);
log(`- Generation edges: ${gens.length}`);

const missingEndpoint = racketRels.filter(
  (r) =>
    !products.some((p) => p.id === r.sourceProductId) ||
    !products.some((p) => p.id === r.targetProductId),
);
if (missingEndpoint.length) {
  p0.push(`${missingEndpoint.length} relationships point at missing products`);
}

// Orphans: current flagship rackets with zero relationships
const orphans = [...racketIds].filter((id) => {
  const p = products.find((x) => x.id === id);
  if (!p || p.lifecycleStatus !== "current") return false;
  if (!p.categoryId.includes("racket") && !p.categoryId.includes("paddle")) {
    return false;
  }
  return !racketRels.some(
    (r) => r.sourceProductId === id || r.targetProductId === id,
  );
});
log(`- Current rackets with no graph edges: ${orphans.length}`);
if (orphans.length > 8) {
  p1.push(`${orphans.length} current rackets lack relationship edges`);
}

const vertex = gens.filter(
  (r) =>
    r.sourceProductId.includes("vertex") ||
    r.targetProductId.includes("vertex"),
);
log(`- Vertex generation edges: ${vertex.length}`);
if (vertex.length === 0) p1.push("Missing Vertex 04↔05 generation edges");

log(`\nP0: ${p0.length}`);
p0.forEach((x) => log(`- ${x}`));
log(`P1: ${p1.length}`);
p1.forEach((x) => log(`- ${x}`));
if (p0.length) process.exit(1);
