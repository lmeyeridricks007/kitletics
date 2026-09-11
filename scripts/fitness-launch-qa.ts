/**
 * Fitness + HYROX launch QA orchestrator.
 * Exits non-zero on P0 blockers.
 *
 * npm run fitness:launch-qa
 */

import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { products } from "@/content/products";
import { recommendations } from "@/content/recommendations";
import { offers } from "@/content/offers";
import { bestGuides } from "@/content/best-guides";
import { buyingGuides, gearSetups, comparisons } from "@/content/editorial";
import { tools } from "@/content/tools";
import { getFinderDefinition } from "@/domain/finders/repository";
import { PLANNING_DIMENSIONS } from "@/domain/room-planner/product-geometry";
import { searchKitletics } from "@/lib/search/engine";

const lines: string[] = [];
const p0: string[] = [];
const p1: string[] = [];

function log(s = "") {
  lines.push(s);
  console.log(s);
}

function run(cmd: string, args: string[]): boolean {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: false });
  return r.status === 0;
}

const FITNESS_CATS = new Set([
  "cat-power-racks",
  "cat-weight-benches",
  "cat-barbells",
  "cat-weight-plates",
  "cat-adjustable-dumbbells",
  "cat-training-shoes",
  "cat-treadmills",
  "cat-rowing-machines",
  "cat-air-bikes",
  "cat-ski-ergs",
  "cat-pull-up-bars",
  "cat-kettlebells",
  "cat-functional-fitness",
  "cat-parallettes",
  "cat-gymnastic-rings",
  "cat-weighted-vests",
]);

const fitnessProducts = products.filter((p) => FITNESS_CATS.has(p.categoryId));

log("# Fitness / HYROX Launch QA\n");
log(`Generated: ${new Date().toISOString()}\n`);

// —— Counts ——
const byCat = new Map<string, number>();
for (const p of fitnessProducts) {
  byCat.set(p.categoryId, (byCat.get(p.categoryId) ?? 0) + 1);
}

log("## Category coverage\n");
for (const [id, n] of [...byCat.entries()].sort((a, b) => b[1] - a[1])) {
  const thin = n < 5 ? " THIN" : "";
  log(`- ${id}: ${n}${thin}`);
  if (
    [
      "cat-weight-plates",
      "cat-treadmills",
      "cat-rowing-machines",
      "cat-air-bikes",
      "cat-ski-ergs",
    ].includes(id) &&
    n < 5
  ) {
    p1.push(`${id} still under 5 products (${n})`);
  }
}

// —— Finders ——
log("\n## Finders\n");
for (const slug of [
  "power-rack-finder",
  "treadmill-finder",
  "hyrox-shoe-finder",
  "home-gym-builder",
  "adjustable-dumbbell-finder",
]) {
  const f = getFinderDefinition(slug);
  const t = tools.find((x) => x.slug === slug);
  log(`- ${slug}: finder=${f ? "yes" : "no"} tool=${t ? "yes" : "no"}`);
  if (!f && slug !== "home-gym-builder") p0.push(`Missing finder: ${slug}`);
  if (!t) p0.push(`Missing tool: ${slug}`);
}

// —— HYROX ——
const hyroxRecs = recommendations.filter((r) => r.sportId === "sport-hyrox");
log(`\n## HYROX recommendations: ${hyroxRecs.length}`);
if (hyroxRecs.length < 8) p1.push("HYROX recommendations sparse");

// —— Planner ——
const plannerReady = fitnessProducts.filter((p) => PLANNING_DIMENSIONS[p.id]);
log(
  `\n## Planner overlay: ${plannerReady.length}/${fitnessProducts.length} fitness products`,
);

// —— Offers ——
const withOffers = fitnessProducts.filter((p) =>
  offers.some((o) => o.productId === p.id),
);
log(`## Offers: ${withOffers.length}/${fitnessProducts.length}`);

// —— Editorial ——
log(
  `\n## Editorial: best=${bestGuides.filter((g) => g.sportId === "sport-training" || g.sportId === "sport-hyrox").length} guides=${buyingGuides.filter((g) => g.sportId === "sport-training" || g.sportId === "sport-hyrox").length} setups=${gearSetups.filter((s) => /home|hyrox|calisthenics|budget/i.test(s.slug)).length} comparisons=${comparisons.length}`,
);

// —— Search intents ——
log("\n## Search smoke\n");
const queries: [string, string][] = [
  ["hyrox shoes", "/tools/hyrox-shoe-finder"],
  ["power rack", "power"],
  ["rowing machine", "row"],
];
for (const [q, expect] of queries) {
  const hits = searchKitletics(q, { limit: 5 });
  const ok = hits.some(
    (h) =>
      h.href.includes(expect) ||
      h.title.toLowerCase().includes(expect.replace("/", "")),
  );
  log(`- "${q}": ${ok ? "ok" : "WEAK"} (top=${hits[0]?.href ?? "none"})`);
  if (!ok) p1.push(`Search weak for "${q}"`);
}

// —— Dummy leak ——
const dummy = fitnessProducts.filter((p) =>
  /lorem|placeholder|sample product|test dumbbell|example rack/i.test(
    `${p.name} ${p.fullName} ${p.shortDescription}`,
  ),
);
if (dummy.length) p0.push(`Dummy products published: ${dummy.map((p) => p.id).join(", ")}`);

// —— Subprocess checks ——
log("\n## Subprocess\n");
const unitOk = run("npx", ["vitest", "run", "tests/hyrox.test.ts", "tests/fitness.test.ts", "tests/room-planner.test.ts"]);
if (!unitOk) p0.push("Unit tests failed");

const tscOk = run("npx", ["tsc", "--noEmit"]);
if (!tscOk) p0.push("Typecheck failed");

log("\n## Severity\n");
log(`P0: ${p0.length}`);
for (const x of p0) log(`- ${x}`);
log(`\nP1: ${p1.length}`);
for (const x of p1) log(`- ${x}`);

const decision =
  p0.length === 0
    ? p1.filter((x) => /image|manufacturer|licensed/i.test(x)).length === p1.length ||
      p1.length <= 4
      ? "GO WITH CONDITIONS"
      : "GO WITH CONDITIONS"
    : "NO-GO";

log(`\n## Launch decision: ${decision}\n`);

mkdirSync(join(process.cwd(), "reports"), { recursive: true });
const out = join(process.cwd(), "reports", "fitness-launch-qa.md");
writeFileSync(out, lines.join("\n") + "\n");
console.log(`Wrote ${out}`);

if (p0.length > 0) process.exit(1);
