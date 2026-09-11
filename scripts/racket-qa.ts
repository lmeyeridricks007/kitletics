/**
 * Racket Sports / Padel launch QA orchestrator.
 * Exits non-zero on P0 blockers.
 *
 * npm run racket:qa
 */

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { recommendations } from "@/content/recommendations";
import { offers } from "@/content/offers";
import { bestGuides } from "@/content/best-guides";
import { buyingGuides, gearSetups, comparisons } from "@/content/editorial";
import { tools } from "@/content/tools";
import { evidence } from "@/content/evidence";
import { getFinderDefinition } from "@/domain/finders/repository";
import { canPublishFinder } from "@/domain/finders/configs/racket-finders";
import { searchKitletics } from "@/lib/search/engine";

const lines: string[] = [];
const p0: string[] = [];
const p1: string[] = [];
const p2: string[] = [];

function log(s = "") {
  lines.push(s);
  console.log(s);
}

function run(cmd: string, args: string[]): boolean {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: false });
  return r.status === 0;
}

function countByCat(cat: string) {
  return products.filter((p) => p.categoryId === cat).length;
}

function reportSport(label: string, sportId: string, catId: string) {
  const sportProducts = products.filter((p) => p.sportIds.includes(sportId));
  const catProducts = products.filter((p) => p.categoryId === catId);
  const brandIds = new Set(catProducts.map((p) => p.brandId));
  const withHero = catProducts.filter((p) => p.images[0]?.src).length;
  const withRecs = catProducts.filter((p) =>
    recommendations.some((r) => r.productId === p.id),
  ).length;
  const withOffersNl = catProducts.filter((p) =>
    offers.some((o) => o.productId === p.id && o.region === "NL"),
  ).length;
  const withOffersDe = catProducts.filter((p) =>
    offers.some((o) => o.productId === p.id && o.region === "DE"),
  ).length;
  const withOffersUk = catProducts.filter((p) =>
    offers.some((o) => o.productId === p.id && o.region === "UK"),
  ).length;
  const finderEligible = catProducts.filter(
    (p) =>
      p.lifecycleStatus === "current" &&
      Object.keys(p.specifications).length >= 2 &&
      p.images.length > 0,
  ).length;

  log(`## ${label}\n`);
  log(`- Sport products: ${sportProducts.length}`);
  log(`- Category (${catId}) published: ${catProducts.length}`);
  log(`- Brands in category: ${brandIds.size}`);
  log(`- Finder eligible: ${finderEligible}`);
  log(`- Recommendation complete: ${withRecs}`);
  log(`- Hero image: ${withHero}`);
  log(`- Offers NL: ${withOffersNl}`);
  log(`- Offers DE: ${withOffersDe}`);
  log(`- Offers UK: ${withOffersUk}`);
  log();

  return { catProducts, brandIds, finderEligible, withRecs };
}

log("# Racket Sports QA\n");
log(`Generated: ${new Date().toISOString()}\n`);

const padel = reportSport("Padel", "sport-padel", "cat-padel-rackets");
const tennis = reportSport("Tennis", "sport-tennis", "cat-tennis-rackets");
reportSport("Pickleball", "sport-pickleball", "cat-pickleball-paddles");
reportSport("Badminton", "sport-badminton", "cat-badminton-rackets");
reportSport("Squash", "sport-squash", "cat-squash-rackets");

log("## Finders\n");
const padelFinder = getFinderDefinition("padel-racket-finder");
const tennisFinder = getFinderDefinition("tennis-racket-finder");
log(`- padel-racket-finder registered: ${Boolean(padelFinder)}`);
log(`- tennis-racket-finder registered: ${Boolean(tennisFinder)}`);
log(
  `- padel tool available: ${tools.find((t) => t.slug === "padel-racket-finder")?.available}`,
);
log(
  `- tennis tool available: ${tools.find((t) => t.slug === "tennis-racket-finder")?.available}`,
);

const padelCan = canPublishFinder({
  candidateCount: padel.finderEligible,
  brandCount: padel.brandIds.size,
  recommendationCount: padel.withRecs,
});
const tennisCan = canPublishFinder({
  candidateCount: tennis.finderEligible,
  brandCount: tennis.brandIds.size,
  recommendationCount: tennis.withRecs,
});
log(`- canPublishFinder(padel): ${padelCan}`);
log(`- canPublishFinder(tennis): ${tennisCan}`);
log();

if (!padelFinder) p0.push("Padel Racket Finder definition missing");
if (!padelCan) p0.push("Padel Finder fails readiness gate");
if (padel.catProducts.length < 12) p0.push(`Padel catalog too thin (${padel.catProducts.length})`);
if (!tennisFinder) p1.push("Tennis Racket Finder definition missing");
if (!tennisCan) p1.push("Tennis Finder fails readiness gate");

log("## Editorial\n");
const padelBest = bestGuides.filter((g) => g.slug.includes("padel"));
const tennisBest = bestGuides.filter((g) => g.slug.includes("tennis"));
const padelGuides = buyingGuides.filter((g) => g.slug.includes("padel"));
const tennisGuides = buyingGuides.filter((g) => g.slug.includes("tennis"));
const padelSetups = gearSetups.filter((g) => g.slug.includes("padel"));
const padelComps = comparisons.filter((c) =>
  c.productIds.some((id) =>
    products.find((p) => p.id === id)?.categoryId === "cat-padel-rackets",
  ),
);
log(`- Best Padel guides: ${padelBest.length}`);
log(`- Best Tennis guides: ${tennisBest.length}`);
log(`- Padel buying guides: ${padelGuides.length}`);
log(`- Tennis buying guides: ${tennisGuides.length}`);
log(`- Padel setups: ${padelSetups.length}`);
log(`- Padel comparisons: ${padelComps.length}`);
log(`- Evidence items (padel/racket wave): ${evidence.filter((e) => e.id.includes("padel") || e.id.includes("wave25") || e.id.includes("racket")).length}`);
log();

if (padelBest.length === 0) p0.push("Missing Best Padel Rackets guide");
if (padelGuides.length === 0) p0.push("Missing padel buying guide");
if (padelSetups.length === 0) p1.push("Missing padel starter kit");

log("## Search smoke\n");
for (const q of ["padel racket", "tennis racquet", "pickleball paddle"]) {
  const res = searchKitletics(q);
  log(`- "${q}": ${res.length} hits`);
  if (res.length === 0) p1.push(`Search empty for ${q}`);
}
log();

log("## Orchestration\n");
const typecheck = run("npx", ["tsc", "--noEmit"]);
log(`- typecheck: ${typecheck ? "pass" : "FAIL"}`);
if (!typecheck) p0.push("Typecheck failed");

const lint = run("npx", ["eslint", "src/domain/finders", "src/content/padel", "src/content/racket", "--max-warnings", "0"]);
log(`- lint (racket paths): ${lint ? "pass" : "FAIL"}`);
if (!lint) p2.push("Lint warnings/errors on racket paths");

const tests = run("npx", ["vitest", "run", "tests/racket.test.ts"]);
log(`- racket tests: ${tests ? "pass" : "FAIL"}`);
if (!tests) p0.push("Racket tests failed");

log("\n## Severity summary\n");
log(`- P0: ${p0.length}`);
for (const x of p0) log(`  - ${x}`);
log(`- P1: ${p1.length}`);
for (const x of p1) log(`  - ${x}`);
log(`- P2: ${p2.length}`);
for (const x of p2) log(`  - ${x}`);

const padelMd = `# Padel Launch Readiness

Generated: ${new Date().toISOString()}

## Measured coverage

| Metric | Count |
| --- | ---: |
| Padel Rackets Published | ${padel.catProducts.length} |
| Finder Eligible | ${padel.finderEligible} |
| Recommendation Complete | ${padel.withRecs} |
| Brands | ${padel.brandIds.size} |
| Hero Image | ${padel.catProducts.filter((p) => p.images[0]).length} |
| Offers NL | ${padel.catProducts.filter((p) => offers.some((o) => o.productId === p.id && o.region === "NL")).length} |
| Offers DE | ${padel.catProducts.filter((p) => offers.some((o) => o.productId === p.id && o.region === "DE")).length} |
| Offers UK | ${padel.catProducts.filter((p) => offers.some((o) => o.productId === p.id && o.region === "UK")).length} |
| Best Guides | ${padelBest.length} |
| Buying Guides | ${padelGuides.length} |
| Setups | ${padelSetups.length} |
| Comparisons | ${padelComps.length} |

## Launch gates

| Gate | Status |
| --- | --- |
| 0 P0 | ${p0.length === 0 ? "PASS" : "FAIL"} |
| Credible catalog depth | ${padel.catProducts.length >= 12 ? "PASS" : "FAIL"} |
| Finder quality / readiness | ${padelCan ? "PASS" : "FAIL"} |
| Best Guide | ${padelBest.length > 0 ? "PASS" : "FAIL"} |
| Buying Guide | ${padelGuides.length > 0 ? "PASS" : "FAIL"} |
| Typecheck + racket tests | ${typecheck && tests ? "PASS" : "FAIL"} |

## Decision

**${p0.length === 0 ? "GO WITH CONDITIONS" : "NO-GO"}**

### Remaining conditions / backlog

${[...p1, ...p2].map((x) => `- ${x}`).join("\n") || "- None flagged"}

### Research queue

- Licensed product photography for wave25 SVG placeholders
- Live EU affiliate / retailer feed refresh beyond seed Offers
- Optional padel shoe finder once court-shoe catalog deepens
`;

const racketMd = `# Racket Sports Readiness

Generated: ${new Date().toISOString()}

## Platform

- Shared Product / Recommendation / Offer architecture reused (no parallel Product schema)
- Shared \`runFinder\` engine with category configs in \`racket-finders.ts\`
- Routes: \`/racket\` (family hub), \`/padel\`, \`/tennis\`, \`/pickleball\`, \`/badminton\`, \`/squash\`

## Coverage by sport

| Sport | Primary category count |
| --- | ---: |
| Padel rackets | ${countByCat("cat-padel-rackets")} |
| Tennis rackets | ${countByCat("cat-tennis-rackets")} |
| Pickleball paddles | ${countByCat("cat-pickleball-paddles")} |
| Badminton rackets | ${countByCat("cat-badminton-rackets")} |
| Squash rackets | ${countByCat("cat-squash-rackets")} |

## Finder platform

| Finder | Registered | Publish gate |
| --- | --- | --- |
| Padel | ${Boolean(padelFinder)} | ${padelCan} |
| Tennis | ${Boolean(tennisFinder)} | ${tennisCan} |
| Pickleball | config-ready (tool unavailable until gate) | n/a |
| Badminton | config-ready | n/a |
| Squash | config-ready | n/a |

## Brands (unique across racket catalogs)

${[...new Set(products.filter((p) => ["cat-padel-rackets","cat-tennis-rackets","cat-pickleball-paddles","cat-badminton-rackets","cat-squash-rackets"].includes(p.categoryId)).map((p) => p.brandId))].map((id) => brands.find((b) => b.id === id)?.name ?? id).sort().map((n) => `- ${n}`).join("\n")}

## P0 / P1 / P2

### P0
${p0.map((x) => `- ${x}`).join("\n") || "- none"}

### P1
${p1.map((x) => `- ${x}`).join("\n") || "- none"}

### P2
${p2.map((x) => `- ${x}`).join("\n") || "- none"}

## Decision

**${p0.length === 0 ? "PLATFORM GO — Padel launchable; Tennis substantial; secondary sports catalog-ready" : "PLATFORM BLOCKED"}**
`;

writeFileSync(join(process.cwd(), "PADEL_LAUNCH_READINESS.md"), padelMd);
writeFileSync(join(process.cwd(), "RACKET_SPORTS_READINESS.md"), racketMd);
writeFileSync(join(process.cwd(), "docs/racket-qa-last-run.md"), lines.join("\n"));

log("\nWrote PADEL_LAUNCH_READINESS.md and RACKET_SPORTS_READINESS.md");

if (p0.length > 0) process.exit(1);
