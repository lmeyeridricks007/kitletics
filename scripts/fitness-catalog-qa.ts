/**
 * Fitness Catalog QA — `npm run catalog:qa:fitness`
 * Prompt 21 coverage report for the Fitness & Training vertical.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { offers } from "@/content/offers";
import { evidence } from "@/content/evidence";
import { recommendations } from "@/content/recommendations";
import { categories } from "@/content/taxonomy/categories";
import { disciplines } from "@/content/taxonomy/disciplines";
import { sports } from "@/content/taxonomy/sports";
import { useCases } from "@/content/taxonomy/use-cases";
import { bestGuides } from "@/content/best-guides";
import { buyingGuides, comparisons, gearSetups } from "@/content/editorial";
import { tools } from "@/content/tools";
import { fitnessSpecificationDefinitions } from "@/content/fitness";
import { getAllCompatibilities } from "@/domain/compatibility";
import { getFinderDefinition } from "@/domain/finders/repository";
import { assembleSportHubData } from "@/lib/hubs/assemble";
import {
  runHomeGymBuilder,
  type HomeGymBuilderInput,
} from "@/domain/builders/home-gym";

const FITNESS_SPORT_ID = "sport-training";

const fitnessCats = categories.filter((c) =>
  c.sportIds.includes(FITNESS_SPORT_ID),
);
const fitnessCatIds = new Set(fitnessCats.map((c) => c.id));
const fitnessProducts = products.filter((p) => fitnessCatIds.has(p.categoryId));
const published = fitnessProducts.filter((p) => p.status === "published");
const brandName = new Map(brands.map((b) => [b.id, b.name]));

function pct(n: number, d: number): string {
  if (!d) return "0%";
  return `${Math.round((n / d) * 100)}%`;
}

const lines: string[] = [];
function log(s = "") {
  lines.push(s);
  console.log(s);
}

log("\n=== Kitletics Catalog QA (Fitness & Training) ===\n");
log(`Generated: ${new Date().toISOString().slice(0, 10)}`);

const sport = sports.find((s) => s.id === FITNESS_SPORT_ID);
log(`\n## Sport\n`);
log(`- ${sport?.name} (\`${sport?.slug}\`) — available=${sport?.available}`);

const discs = disciplines.filter((d) => d.sportId === FITNESS_SPORT_ID);
log(`\n## Disciplines (${discs.length})\n`);
for (const d of discs) log(`- ${d.name} (\`${d.slug}\`)`);

log(`\n## Categories & products\n`);
log(`| Category | Products | Brands | With offers | Specs avg |`);
log(`| --- | ---: | ---: | ---: | ---: |`);
for (const c of fitnessCats) {
  const ps = published.filter((p) => p.categoryId === c.id);
  if (!ps.length && !c.id.startsWith("cat-")) continue;
  const brandSet = new Set(ps.map((p) => p.brandId));
  const withOffers = ps.filter((p) =>
    offers.some((o) => o.productId === p.id),
  ).length;
  const avgSpecs =
    ps.length === 0
      ? 0
      : Math.round(
          ps.reduce(
            (s, p) => s + Object.keys(p.specifications ?? {}).length,
            0,
          ) / ps.length,
        );
  log(
    `| ${c.name} | ${ps.length} | ${brandSet.size} | ${withOffers} | ${avgSpecs} |`,
  );
}
log(`\n**Total products in fitness-tagged categories:** ${published.length}`);

const pureFitness = published.filter((p) =>
  p.sportIds?.includes(FITNESS_SPORT_ID),
);
log(`**Products with sportIds including fitness:** ${pureFitness.length}`);

log(`\n## Cross-sport reuse\n`);
const cross = published.filter(
  (p) =>
    p.sportIds?.includes(FITNESS_SPORT_ID) &&
    p.sportIds.some((id) => id !== FITNESS_SPORT_ID),
);
log(`- Products also tagged other sports: ${cross.length}`);
const garmin = products.filter((p) => p.brandId === "brand-garmin");
log(
  `- Garmin products (single entities, multi-sport via category/sportIds): ${garmin.length}`,
);

log(`\n## Brands (top)\n`);
const byBrand = new Map<string, number>();
for (const p of published) {
  byBrand.set(p.brandId, (byBrand.get(p.brandId) ?? 0) + 1);
}
for (const [id, n] of [...byBrand.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
  log(`- ${(brandName.get(id) ?? id).padEnd(24)} ${n}`);
}

log(`\n## Specifications\n`);
log(`- Fitness SpecificationDefinitions: ${fitnessSpecificationDefinitions.length}`);
const withHeight = published.filter(
  (p) => p.specifications && "heightMm" in p.specifications,
);
log(`- Products with heightMm (space-critical): ${withHeight.length}`);

log(`\n## Evidence\n`);
const evIds = new Set(evidence.map((e) => e.id));
const productsWithEv = published.filter((p) =>
  (p.evidenceIds ?? []).some((id) => evIds.has(id)),
);
log(`- Shared evidence records: ${evidence.length}`);
log(
  `- Products referencing evidence: ${productsWithEv.length} (${pct(productsWithEv.length, published.length)})`,
);
log(
  `- Gap: most Fitness products share generic manufacturer/editorial evidence — product-level manufacturer URLs still needed.`,
);

log(`\n## Media\n`);
const withHero = published.filter((p) => (p.images ?? []).length > 0);
const fallbackOnly = published.filter((p) =>
  (p.images ?? []).every((img) =>
    String(img.src ?? "").includes("/fallbacks/"),
  ),
);
log(`- Products with images array: ${withHero.length}`);
log(`- Using category SVG fallbacks only: ${fallbackOnly.length}`);
log(
  `- **Gap (HIGH):** official product photography pending licensing — fallbacks are honest (alt states unavailable), not fake product photos.`,
);

log(`\n## Recommendations\n`);
const fitnessRecs = recommendations.filter((r) =>
  published.some((p) => p.id === r.productId),
);
log(`- Recommendation rows on fitness-category products: ${fitnessRecs.length}`);
const contexts = new Set(fitnessRecs.map((r) => r.useCaseId));
log(`- Use-case contexts covered: ${[...contexts].join(", ") || "(none)"}`);

log(`\n## Compatibility\n`);
const comps = getAllCompatibilities();
log(`- ProductCompatibility records: ${comps.length}`);
for (const c of comps) {
  log(
    `  - ${c.compatibilityType}: ${c.sourceProductId}${c.targetProductId ? ` → ${c.targetProductId}` : ""} (${c.status})`,
  );
}

log(`\n## Offers\n`);
const fitnessOffers = offers.filter((o) =>
  published.some((p) => p.id === o.productId),
);
const regions = new Map<string, number>();
for (const o of fitnessOffers) {
  regions.set(o.region, (regions.get(o.region) ?? 0) + 1);
}
log(`- Offer rows: ${fitnessOffers.length}`);
for (const [r, n] of [...regions.entries()].sort()) log(`  - ${r}: ${n}`);

log(`\n## Editorial\n`);
const bg = bestGuides.filter(
  (g) =>
    g.sportId === FITNESS_SPORT_ID ||
    fitnessCatIds.has(g.categoryId ?? ""),
);
const buy = buyingGuides.filter(
  (g) =>
    g.sportId === FITNESS_SPORT_ID ||
    /home-gym|dumbbell|rack|hyrox|pull-up|barbell|bench|power-rack/i.test(
      g.slug,
    ),
);
const setups = gearSetups.filter(
  (s) =>
    s.sportId === FITNESS_SPORT_ID ||
    /home-gym|hyrox|calisthenics|apartment|garage/i.test(s.slug),
);
const cmps = comparisons.filter((c) =>
  /nuobell|powerblock|metcon|nano|rowerg|rml|pr-4000/i.test(c.slug),
);
log(`- Best guides: ${bg.map((g) => g.slug).join(", ")}`);
log(`- Buying guides: ${buy.map((g) => g.slug).join(", ")}`);
log(`- Gear setups: ${setups.map((s) => s.slug).join(", ")}`);
log(`- Comparisons: ${cmps.map((c) => c.slug).join(", ")}`);

log(`\n## Tools & finders\n`);
const fitnessTools = tools.filter((t) =>
  t.sportIds.includes(FITNESS_SPORT_ID),
);
log(`- Tools: ${fitnessTools.map((t) => t.slug).join(", ")}`);
for (const slug of [
  "hyrox-shoe-finder",
  "training-shoe-finder",
  "adjustable-dumbbell-finder",
  "power-rack-finder",
  "pull-up-bar-finder",
]) {
  log(`- Finder \`${slug}\`: ${getFinderDefinition(slug) ? "ready" : "MISSING"}`);
}

const hub = assembleSportHubData("fitness", { isDev: true });
log(`\n## Hub\n`);
log(
  hub
    ? `- /fitness hub OK — ${hub.disciplines.length} disciplines`
    : `- /fitness hub MISSING`,
);

log(`\n## Home Gym Builder — golden scenarios\n`);

function runScenario(name: string, profile: HomeGymBuilderInput) {
  const result = runHomeGymBuilder({
    profile,
    products: published,
    offers: fitnessOffers,
  });
  log(`\n### ${name}`);
  log(`- Band: ${result.band}`);
  log(`- Items: ${result.items.map((i) => `${i.role}=${i.productName}`).join("; ") || "(none)"}`);
  log(`- Est. total: €${Math.round(result.totalEstimated)}`);
  log(`- Skipped: ${result.skippedRoles.map((s) => s.role).join(", ") || "—"}`);
  const tallRack = result.items.find((i) => i.role === "primary-strength-station");
  if (tallRack && profile.room.heightM <= 2.35) {
    log(`- Low-ceiling check: selected rack fit=${tallRack.fit}`);
  }
}

runScenario("Small room €1k strength+calisthenics", {
  room: {
    lengthM: 2.5,
    widthM: 2.5,
    heightM: 2.3,
    wallMountAllowed: true,
    floorMountAllowed: false,
    noiseSensitive: false,
  },
  budgetEur: 1000,
  budgetMode: "strict",
  goals: ["strength", "calisthenics"],
  experience: "beginner",
  ownedCategories: [],
  unitSystem: "metric",
});

runScenario("Garage strength €3k", {
  room: {
    lengthM: 5,
    widthM: 4,
    heightM: 2.6,
    wallMountAllowed: true,
    floorMountAllowed: true,
    noiseSensitive: false,
  },
  budgetEur: 3000,
  budgetMode: "flexible",
  goals: ["strength", "powerlifting"],
  experience: "intermediate",
  ownedCategories: [],
  unitSystem: "metric",
});

runScenario("HYROX conditioning €2.5k", {
  room: {
    lengthM: 4,
    widthM: 4,
    heightM: 2.5,
    wallMountAllowed: true,
    floorMountAllowed: true,
    noiseSensitive: false,
  },
  budgetEur: 2500,
  budgetMode: "flexible",
  goals: ["hyrox", "conditioning"],
  experience: "intermediate",
  ownedCategories: [],
  unitSystem: "metric",
});

runScenario("Apartment quiet €800", {
  room: {
    lengthM: 3,
    widthM: 3,
    heightM: 2.4,
    wallMountAllowed: false,
    floorMountAllowed: false,
    noiseSensitive: true,
  },
  budgetEur: 800,
  budgetMode: "strict",
  goals: ["general-fitness"],
  experience: "beginner",
  ownedCategories: [],
  unitSystem: "metric",
});

log(`\n## Use cases\n`);
const uc = useCases.filter((u) => u.sportId === FITNESS_SPORT_ID);
log(`- Fitness use cases: ${uc.length}`);

log(`\n## Remaining gaps\n`);
log(`1. Official product photography (currently honest SVG category fallbacks)`);
log(`2. Product-level manufacturer evidence URLs (shared evidence stubs today)`);
log(`3. Recommendation coverage sparse vs product count — expand per category`);
log(`4. Cardio Machine Finder / Barbell Finder / Bench Finder not launched`);
log(`5. Regional offer depth uneven (large equipment shipping gaps)`);
log(`6. ProductCompatibility seed is starter-only (expand rack ecosystems)`);
log(`7. Catalog depth below indicative targets for plates, ski ergs, recovery`);
log(`8. HYROX official competition specs need ongoing evidence refresh`);

mkdirSync(join(process.cwd(), "reports"), { recursive: true });
const out = join(process.cwd(), "reports", "fitness-catalog-qa.md");
writeFileSync(out, lines.join("\n") + "\n", "utf8");
console.log(`\nWrote ${out}`);
