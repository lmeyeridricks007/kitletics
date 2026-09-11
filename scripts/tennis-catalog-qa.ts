/**
 * npm run tennis:catalog-qa
 */
import {
  byCategory,
  reportByBrand,
  isFinderEligible,
  isHighConfidence,
  specCoverage,
  offerCoverage,
  mediaFlags,
  TENNIS_RACKET,
} from "./lib/racket-catalog-helpers";
import { recommendations } from "@/content/recommendations";
import { products } from "@/content/products";

const p0: string[] = [];
const p1: string[] = [];
const log = (s = "") => console.log(s);

const rackets = byCategory(TENNIS_RACKET);
const shoes = byCategory("cat-tennis-shoes");
const strings = byCategory("cat-tennis-strings");
const eligible = rackets.filter(isFinderEligible);
const high = rackets.filter(isHighConfidence);

log("# Tennis Catalog QA\n");
log(`Generated: ${new Date().toISOString()}\n`);
log(`- Published rackets: ${rackets.length}`);
log(`- Current: ${rackets.filter((p) => p.lifecycleStatus === "current").length}`);
log(`- Previous: ${rackets.filter((p) => p.lifecycleStatus === "previous-generation").length}`);
log(`- Finder eligible: ${eligible.length}`);
log(`- High-confidence: ${high.length}`);
log(`- Shoes: ${shoes.length}`);
log(`- Strings: ${strings.length}`);
log(
  `- With recommendations: ${rackets.filter((p) => recommendations.some((r) => r.productId === p.id)).length}`,
);

log(`\n## By brand\n`);
for (const [brand, row] of reportByBrand(TENNIS_RACKET)) {
  log(
    `- ${brand}: ${row.products} (current ${row.current}, prev ${row.previous}, finder ${row.finderEligible}, rec ${row.recReady})`,
  );
}

log(`\n## Spec coverage\n`);
const specs = specCoverage(TENNIS_RACKET, [
  "headSizeSqIn",
  "strungWeightG",
  "unstrungWeightG",
  "balance",
  "stringPattern",
  "swingweight",
  "beamWidthMm",
  "stiffnessRa",
  "powerPositioning",
]);
for (const [k, v] of Object.entries(specs)) {
  log(`- ${k}: ${v.n}/${rackets.length} (${v.pct}%)`);
}

log(`\n## Offers\n`);
const offers = offerCoverage(TENNIS_RACKET, ["NL", "DE", "UK", "US"]);
for (const [r, n] of Object.entries(offers)) log(`- ${r}: ${n}`);

log(`\n## Media\n`);
const media = mediaFlags(TENNIS_RACKET);
log(JSON.stringify(media, null, 2));
if (media.missing > 0) p0.push(`${media.missing} tennis rackets missing images`);

log(`\n## Current-generation checks\n`);
const must = [
  "prod-wilson-blade-98-v9",
  "prod-wilson-clash-100-v3",
  "prod-babolat-pure-drive-gen11",
  "prod-babolat-pure-aero-2026",
  "prod-head-speed-mp-2026",
  "prod-yonex-ezone-100-2025",
];
for (const id of must) {
  const p = products.find((x) => x.id === id);
  log(`- ${id}: ${p ? p.lifecycleStatus : "MISSING"}`);
  if (!p) p0.push(`Missing ${id}`);
  else if (p.lifecycleStatus !== "current") p1.push(`${id} not current`);
}

const prev = [
  "prod-wilson-blade-98-v8",
  "prod-wilson-clash-100-v2",
  "prod-babolat-pure-drive-2025",
];
for (const id of prev) {
  const p = products.find((x) => x.id === id);
  if (p && p.lifecycleStatus !== "previous-generation") {
    p1.push(`${id} should be previous-generation (is ${p.lifecycleStatus})`);
  }
}

if (rackets.length < 15) p1.push(`Tennis racket catalog thin (${rackets.length})`);
if (eligible.length < 12) p1.push(`Tennis Finder eligible thin (${eligible.length})`);
if (strings.length < 3) p1.push(`Tennis strings thin (${strings.length})`);
if (shoes.length < 4) p1.push(`Tennis shoes thin (${shoes.length})`);

log(`\n## Severity\n`);
log(`P0: ${p0.length}`);
p0.forEach((x) => log(`- ${x}`));
log(`P1: ${p1.length}`);
p1.forEach((x) => log(`- ${x}`));

if (p0.length) process.exit(1);
