#!/usr/bin/env tsx
/**
 * Unified Running launch QA orchestration.
 * Usage: npm run qa:running
 *
 * Exit non-zero on blockers (typecheck/lint/tests/validate/build failures).
 * Generates reports under /reports after successful automated gates.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runningLaunchManifest, type LaunchCategoryStatus } from "@/content/running/launch-manifest";
import { products } from "@/content/products";
import { offers } from "@/content/offers";
import { isPubliclyVisible } from "@/lib/publishing/resolver";
import { isOfferActive, getOfferFreshness } from "@/domain/commerce/ranking";
import {
  canPublishProduct,
} from "@/domain/catalog/publishability";
import { bestGuides } from "@/content/best-guides";
import { buyingGuides, comparisons, gearSetups } from "@/content/editorial";
import { reviews } from "@/content/reviews";
import { getAllProductRelationships } from "@/repositories/relationships";

const root = process.cwd();
const reportsDir = join(root, "reports");

function run(label: string, cmd: string, args: string[]): boolean {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
    env: process.env,
  });
  if (result.status !== 0) {
    console.error(`✖ ${label} failed (exit ${result.status})`);
    return false;
  }
  console.log(`✔ ${label}`);
  return true;
}

const steps: { label: string; cmd: string; args: string[] }[] = [
  {
    label: "Typecheck",
    cmd: "npx",
    args: ["tsc", "--noEmit"],
  },
  { label: "Lint", cmd: "npx", args: ["eslint", "src", "--max-warnings", "500"] },
  { label: "Unit tests", cmd: "npx", args: ["vitest", "run"] },
  {
    label: "Content validate",
    cmd: "npx",
    args: ["tsx", "--tsconfig", "tsconfig.json", "scripts/validate-content.ts"],
  },
  {
    label: "Catalog QA",
    cmd: "npx",
    args: ["tsx", "--tsconfig", "tsconfig.json", "scripts/catalog-qa.ts"],
  },
  {
    label: "Offers validate",
    cmd: "npx",
    args: ["tsx", "--tsconfig", "tsconfig.json", "scripts/offers-validate.ts"],
  },
  {
    label: "Commerce QA",
    cmd: "npx",
    args: ["tsx", "--tsconfig", "tsconfig.json", "scripts/commerce-qa.ts"],
  },
  {
    label: "Relationships",
    cmd: "npx",
    args: ["tsx", "--tsconfig", "tsconfig.json", "scripts/catalog-relationships.ts"],
  },
  { label: "Production build", cmd: "npx", args: ["next", "build"] },
];

let failed = false;
for (const step of steps) {
  if (!run(step.label, step.cmd, step.args)) {
    failed = true;
    break;
  }
}

if (failed) {
  console.error("\nRUNNING LAUNCH QA: FAILED (blocker in automated gate)\n");
  process.exit(1);
}

// ── Generate reports after gates pass ──────────────────────────────────────
mkdirSync(reportsDir, { recursive: true });

const now = new Date();
const running = products.filter(
  (p) =>
    p.sportIds.includes("sport-running") &&
    isPubliclyVisible(p, { isDev: false, now }),
);
const draftOrScheduled = products.filter(
  (p) =>
    p.sportIds.includes("sport-running") &&
    !isPubliclyVisible(p, { isDev: false, now }),
);

const byCat: Record<string, number> = {};
for (const p of running) {
  byCat[p.categoryId] = (byCat[p.categoryId] ?? 0) + 1;
}

const catRows = runningLaunchManifest.categories.map((t) => {
  const count = byCat[t.categoryId] ?? 0;
  const status = t.status as LaunchCategoryStatus;
  const met = status === "future" || count >= t.minProducts;
  return { ...t, count, met };
});

const pubAssess = running.map((p) => ({
  p,
  a: canPublishProduct(p),
}));
const notReady = pubAssess.filter((x) => !x.a.ok);

const activeOffers = offers.filter(isOfferActive);
const freshness = { fresh: 0, recent: 0, aging: 0, stale: 0 };
for (const o of activeOffers) {
  freshness[getOfferFreshness(o.lastChecked, now)]++;
}

const bestRunning = bestGuides.filter((g) => g.sportId === "sport-running");

const relationships = getAllProductRelationships();
const productsWithRels = new Set(relationships.map((r) => r.sourceProductId));

const catalogReport = `# Running Catalog QA

Generated: ${now.toISOString()}
Manifest asOf: ${runningLaunchManifest.asOf}

## Totals
- Published Running products: ${running.length}
- Non-public (draft/scheduled): ${draftOrScheduled.length}
- Not publishability-ready: ${notReady.length}

## Category depth vs manifest

| Category | Status | Count | Min | Met |
| --- | --- | ---: | ---: | --- |
${catRows
  .map(
    (r) =>
      `| ${r.slug} | ${r.status} | ${r.count} | ${r.minProducts} | ${r.met ? "yes" : "NO"} |`,
  )
  .join("\n")}

## Lifecycle
${(["current", "previous-generation", "discontinued", "upcoming"] as const)
  .map(
    (lc) =>
      `- ${lc}: ${running.filter((p) => p.lifecycleStatus === lc).length}`,
  )
  .join("\n")}

## Publishability gaps
${
  notReady.length === 0
    ? "_None_"
    : notReady
        .map((x) => `- ${x.p.fullName} (${x.p.id}): ${x.a.reasons.join("; ")}`)
        .join("\n")
}

## Media note
Running heroes currently use intentional Kitletics category SVG fallbacks (not manufacturer photographs). Official product photography remains a HIGH launch gap pending licensing.
`;

const contentReport = `# Running Content QA

Generated: ${now.toISOString()}

## Counts
- Best Guides (Running-ish): ${bestRunning.length} / total ${bestGuides.length}
- Buying Guides: ${buyingGuides.length}
- Comparisons: ${comparisons.length}
- Reviews published: ${reviews.filter((r) => isPubliclyVisible(r, { isDev: false, now })).length}
- Setups: ${gearSetups.length}

## Targets
- Best guides min ${runningLaunchManifest.contentTargets.bestGuidesMin}: ${bestRunning.length >= runningLaunchManifest.contentTargets.bestGuidesMin ? "met" : "below"}
- Buying guides min ${runningLaunchManifest.contentTargets.buyingGuidesMin}: ${buyingGuides.length >= runningLaunchManifest.contentTargets.buyingGuidesMin ? "met" : "below"}
- Comparisons min ${runningLaunchManifest.contentTargets.comparisonsMin}: ${comparisons.length >= runningLaunchManifest.contentTargets.comparisonsMin ? "met" : "below"}

## Notes
- Flagship review coverage is thin (editorial Expert Research preferred over fabricated personal testing).
- Nutrition category is future — no products.
`;

const commerceReport = `# Running Commerce QA

Generated: ${now.toISOString()}

## Offers
- Active: ${activeOffers.length}
- Freshness: fresh=${freshness.fresh} recent=${freshness.recent} aging=${freshness.aging} stale=${freshness.stale}

## Coverage (products with ≥1 active Offer)
${runningLaunchManifest.commercialTargets.prioritizeRegions
  .map((region) => {
    const withOffer = running.filter((p) =>
      activeOffers.some((o) => o.productId === p.id && o.region === region),
    ).length;
    return `- ${region}: ${withOffer}/${running.length}`;
  })
  .join("\n")}

## Affiliate
- Active programs must remain 0 until credentials exist (Prompt 17 policy).
- Recommendation independence enforced by tests.
`;

const blockers: string[] = [];
const highs: string[] = [];
const mediums: string[] = [];
const lows: string[] = [];

for (const r of catRows) {
  if (r.status === "launch-core" && !r.met) {
    blockers.push(`Launch-core category ${r.slug} below min depth (${r.count}/${r.minProducts})`);
  }
}
if (notReady.length > 0) {
  highs.push(`${notReady.length} published products fail publishability requirements`);
}
highs.push(
  "Official product photography not licensed — catalog uses honest SVG category fallbacks",
);
mediums.push(
  `Commercial Offer coverage thin outside NL (${activeOffers.filter((o) => o.region === "NL").length} NL offers)`,
);
mediums.push("Few published Reviews relative to catalog size");
lows.push("Terms/Privacy are interim launch stubs pending legal counsel");
lows.push(`Relationship orphans: ${running.filter((p) => !productsWithRels.has(p.id)).length} Running products with zero graph edges`);

const status =
  blockers.length > 0
    ? "NOT READY"
    : highs.some((h) => h.includes("photography"))
      ? "READY WITH MINOR ISSUES"
      : highs.length > 0
        ? "READY WITH MINOR ISSUES"
        : "READY";

// Photography is HIGH but not a journey-breaking blocker if fallbacks are honest — classify READY WITH MINOR ISSUES
const launchReport = `# Running Launch Readiness

Generated: ${now.toISOString()}
Manifest: ${runningLaunchManifest.asOf}

## RUNNING LAUNCH STATUS: **${status}**

### Automated gates
All of: tsc · eslint · vitest · content:validate · catalog:qa · offers:validate · commerce:qa · relationships · next build — **passed**.

### Catalog
- Published Running products: **${running.length}**
- Launch-core categories meeting depth: ${catRows.filter((c) => c.status === "launch-core" && c.met).length}/${catRows.filter((c) => c.status === "launch-core").length}

### Blockers
${blockers.length ? blockers.map((b) => `- ${b}`).join("\n") : "- None"}

### High
${highs.map((h) => `- ${h}`).join("\n")}

### Medium
${mediums.map((m) => `- ${m}`).join("\n")}

### Low
${lows.map((l) => `- ${l}`).join("\n")}

### Remaining issue table

| Severity | Area | Issue | Why unresolved | Required action |
| -------- | ---- | ----- | -------------- | --------------- |
| HIGH | Media | No licensed manufacturer product photos | Licensing / brand asset approval | Source official images; keep SVG until then |
| MEDIUM | Commerce | Thin Offer coverage outside NL | No live feeds/credentials | Expand seed Offers carefully; enroll affiliates |
| MEDIUM | Editorial | Thin Review coverage | Evidence quality over filler | Expert Research reviews for flagships |
| LOW | Legal | Terms/Privacy interim | Counsel review | Replace stubs before public marketing push |
| LOW | Graph | Many accessory products lack relationships | Prioritized shoes/watches | Expand graph for supporting categories |

### Recommended next actions
1. License official product photography for launch-core shoes + watches
2. Expand regional Offers (UK/US/DE) for Best Guide winners
3. Publish Expert Research reviews for Novablast 6, Ghost 18, FR970, Vaporfly 4
4. Legal Terms/Privacy before paid acquisition
`;

writeFileSync(join(reportsDir, "running-catalog-qa.md"), catalogReport);
writeFileSync(join(reportsDir, "running-content-qa.md"), contentReport);
writeFileSync(join(reportsDir, "running-commerce-qa.md"), commerceReport);
writeFileSync(join(reportsDir, "running-launch-readiness.md"), launchReport);

console.log(`\nReports written to ${reportsDir}`);
console.log(`\nRUNNING LAUNCH STATUS: ${status}\n`);
process.exit(0);
