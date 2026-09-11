/**
 * Fix 74 — live classification dump for the final four + related clusters.
 */
import { getAllProductRelationships, getProducts } from "@/repositories";
import { isAlternativeType } from "@/domain/relationships/types";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { classifyAlternativesHold } from "@/lib/product/classify-alternatives-hold";
import { alternativeMarketCluster } from "@/content/alternatives-p65-completion";
import { scoreAlternativePair } from "@/lib/decision-graph/semantic-quality";

const PROD = { isDev: false as const, now: new Date("2026-09-10T08:00:00.000Z") };
const rels = getAllProductRelationships();
const catalog = getProducts(PROD);

const counts: Record<string, number> = {};
const unexplained: string[] = [];
const marketHolds: string[] = [];
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
  if (hold === "THIN_UNEXPLAINED") unexplained.push(p.slug);
  if (hold === "HOLD_INSUFFICIENT_ALTERNATIVE_MARKET") marketHolds.push(p.slug);
}

const focus = [
  "ciele-gocap-athletics",
  "brooks-notch-thermal-beanie",
  "nike-aerobill-cap",
  "horizon-t202-treadmill",
  "woodway-curve-trainer",
  "sole-f80-treadmill",
  "mirafit-folding-treadmill",
  "assaultrunner-pro",
  "assaultrunner-elite",
  "brooks-sherpa-7-men",
];

const rows = focus.map((slug) => {
  const p = catalog.find((x) => x.slug === slug);
  if (!p) return { slug, missing: true };
  const alts = rels.filter(
    (r) =>
      r.sourceProductId === p.id &&
      r.status === "approved" &&
      isAlternativeType(r.type),
  );
  const peers = catalog.filter(
    (x) =>
      x.status === "published" &&
      !x.noindex &&
      x.id !== p.id &&
      x.categoryId === p.categoryId &&
      alternativeMarketCluster(x) === alternativeMarketCluster(p),
  );
  return {
    slug,
    cluster: alternativeMarketCluster(p),
    hold: classifyAlternativesHold(p, rels, catalog),
    gate: canPublishAlternativesPage(p, rels),
    altIds: p.alternativeProductIds ?? [],
    graphN: alts.length,
    peerSlugs: peers.map((x) => x.slug),
    sameJob: peers
      .filter((x) => scoreAlternativePair(p, x).cls !== "INVALID")
      .map((x) => x.slug),
  };
});

console.log(JSON.stringify({ withGraph, counts, unexplained, marketHolds, rows }, null, 2));
