/**
 * npm run padel:catalog-qa
 */
import {
  byCategory,
  reportByBrand,
  isFinderEligible,
  isHighConfidence,
  specCoverage,
  offerCoverage,
  mediaFlags,
  PADEL_RACKET,
} from "./lib/racket-catalog-helpers";
import { recommendations } from "@/content/recommendations";
import { products } from "@/content/products";

const p0: string[] = [];
const p1: string[] = [];
const lines: string[] = [];
const log = (s = "") => {
  lines.push(s);
  console.log(s);
};

const rackets = byCategory(PADEL_RACKET);
const shoes = byCategory("cat-padel-shoes");
const eligible = rackets.filter(isFinderEligible);
const high = rackets.filter(isHighConfidence);
const current = rackets.filter((p) => p.lifecycleStatus === "current");
const previous = rackets.filter((p) => p.lifecycleStatus === "previous-generation");

log("# Padel Catalog QA\n");
log(`Generated: ${new Date().toISOString()}\n`);
log(`## Totals\n`);
log(`- Published rackets: ${rackets.length}`);
log(`- Current: ${current.length}`);
log(`- Previous generation: ${previous.length}`);
log(`- Finder eligible: ${eligible.length}`);
log(`- High-confidence Finder eligible: ${high.length}`);
log(`- Padel shoes: ${shoes.length}`);
log(
  `- Rackets with ≥1 recommendation: ${rackets.filter((p) => recommendations.some((r) => r.productId === p.id)).length}`,
);

log(`\n## By brand\n`);
log(
  `| Brand | Products | Current | Previous | Finder | Recs | Image | Offers |`,
);
log(`| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |`);
for (const [brand, row] of reportByBrand(PADEL_RACKET)) {
  log(
    `| ${brand} | ${row.products} | ${row.current} | ${row.previous} | ${row.finderEligible} | ${row.recReady} | ${row.imageReady} | ${row.offerReady} |`,
  );
}

log(`\n## Spec coverage (rackets)\n`);
const specs = specCoverage(PADEL_RACKET, [
  "shape",
  "weightMin",
  "balance",
  "core",
  "face",
  "powerPositioning",
  "controlPositioning",
  "sweetSpot",
]);
for (const [k, v] of Object.entries(specs)) {
  log(`- ${k}: ${v.n}/${rackets.length} (${v.pct}%)`);
  if (["shape", "weightMin", "balance"].includes(k) && v.pct < 90) {
    p1.push(`Spec ${k} coverage ${v.pct}%`);
  }
}

log(`\n## Offers\n`);
const offers = offerCoverage(PADEL_RACKET, ["NL", "DE", "BE", "FR", "UK", "US", "ZA"]);
for (const [r, n] of Object.entries(offers)) log(`- ${r}: ${n}`);

log(`\n## Media\n`);
const media = mediaFlags(PADEL_RACKET);
log(`- Hero: ${media.withHero}/${media.total}`);
log(`- Labeled placeholders: ${media.placeholderLabeled}`);
log(`- Missing: ${media.missing}`);
if (media.missing > 0) p0.push(`${media.missing} padel rackets missing images`);

log(`\n## Generation sanity\n`);
const vertex05 = products.find((p) => p.id === "prod-bullpadel-vertex-05");
const vertex04 = products.find((p) => p.id === "prod-bullpadel-vertex-04");
const at10 = products.find((p) => p.id === "prod-nox-at10-12k-2026");
const at1018 = products.find((p) => p.id === "prod-nox-at10-18k-2026");
log(`- Vertex 05 present: ${Boolean(vertex05)}`);
log(`- Vertex 04 previous: ${vertex04?.lifecycleStatus}`);
log(`- AT10 12K present: ${Boolean(at10)}`);
log(`- AT10 18K shape: ${String(at1018?.specifications.shape)}`);
if (!vertex05) p0.push("Missing Bullpadel Vertex 05 2026");
if (vertex04?.lifecycleStatus !== "previous-generation") {
  p1.push("Vertex 04 should be previous-generation");
}
if (at1018?.specifications.shape !== "diamond") {
  p0.push("AT10 18K must be diamond (not teardrop) per 2026 research");
}

if (rackets.length < 20) p1.push(`Padel racket catalog thin (${rackets.length})`);
if (eligible.length < 15) p1.push(`Finder eligible thin (${eligible.length})`);
if (shoes.length < 4) p1.push(`Padel shoes thin (${shoes.length})`);

log(`\n## Severity\n`);
log(`P0: ${p0.length}`);
p0.forEach((x) => log(`- ${x}`));
log(`P1: ${p1.length}`);
p1.forEach((x) => log(`- ${x}`));

if (p0.length) process.exit(1);
