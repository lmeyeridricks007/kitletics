import { getAllProductRelationships, getProducts } from "@/repositories";
import { isAlternativeType } from "@/domain/relationships/types";
import { classifyAlternativesHold } from "@/lib/product/classify-alternatives-hold";
import { alternativeMarketCluster } from "@/content/alternatives-p65-completion";

const PROD = { isDev: false as const, now: new Date("2026-09-10T08:00:00.000Z") };
const rels = getAllProductRelationships();
const catalog = getProducts(PROD);
const counts: Record<string, number> = {};
const unexplained: string[] = [];
const holds: Record<string, string[]> = {};
let withGraph = 0;
for (const p of catalog) {
  const alts = rels.filter(
    (r) =>
      r.sourceProductId === p.id &&
      r.status === "approved" &&
      isAlternativeType(r.type),
  );
  if (alts.length === 0) continue;
  withGraph++;
  const hold = classifyAlternativesHold(p, rels, catalog);
  counts[hold] = (counts[hold] ?? 0) + 1;
  if (hold !== "READY") {
    (holds[hold] ??= []).push(
      `${p.slug} cluster=${alternativeMarketCluster(p)} n=${alts.length} types=${new Set(alts.map((r) => r.type)).size}`,
    );
    if (hold === "THIN_UNEXPLAINED") unexplained.push(p.slug);
  }
}
console.log(JSON.stringify({ withGraph, counts, unexplained, holds }, null, 2));
