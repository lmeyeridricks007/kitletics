/**
 * npm run racket:launch-qa — Prompt 26 launch orchestrator
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { recommendations } from "@/content/recommendations";
import { bestGuides } from "@/content/best-guides";
import { buyingGuides, gearSetups, comparisons } from "@/content/editorial";
import {
  byCategory,
  isFinderEligible,
  isHighConfidence,
  mediaFlags,
  offerCoverage,
  reportByBrand,
  PADEL_RACKET,
  TENNIS_RACKET,
} from "./lib/racket-catalog-helpers";

const lines: string[] = [];
const p0: string[] = [];
const p1: string[] = [];
const log = (s = "") => {
  lines.push(s);
  console.log(s);
};

function run(cmd: string, args: string[]): boolean {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: false });
  return r.status === 0;
}

log("# Racket Launch QA (Prompt 26)\n");
log(`Generated: ${new Date().toISOString()}\n`);

const steps: [string, string[]][] = [
  ["npx", ["tsc", "--noEmit"]],
  ["npx", ["vitest", "run", "tests/racket.test.ts"]],
  ["npx", ["tsx", "--tsconfig", "tsconfig.json", "scripts/padel-catalog-qa.ts"]],
  ["npx", ["tsx", "--tsconfig", "tsconfig.json", "scripts/tennis-catalog-qa.ts"]],
  ["npx", ["tsx", "--tsconfig", "tsconfig.json", "scripts/racket-finder-qa.ts"]],
  ["npx", ["tsx", "--tsconfig", "tsconfig.json", "scripts/racket-media-qa.ts"]],
  ["npx", ["tsx", "--tsconfig", "tsconfig.json", "scripts/racket-relationship-qa.ts"]],
  ["npx", ["tsx", "--tsconfig", "tsconfig.json", "scripts/racket-commerce-qa.ts"]],
  ["npx", ["tsx", "--tsconfig", "tsconfig.json", "scripts/racket-content-qa.ts"]],
];

for (const [cmd, args] of steps) {
  const ok = run(cmd, args);
  log(`- ${cmd} ${args.join(" ")}: ${ok ? "pass" : "FAIL"}`);
  if (!ok) p0.push(`Failed: ${cmd} ${args.join(" ")}`);
}

const padel = byCategory(PADEL_RACKET);
const tennis = byCategory(TENNIS_RACKET);
const padelBeforeApprox = 17;
const tennisBeforeApprox = 11;

function sportBlock(label: string, cat: string, before: number) {
  const list = byCategory(cat);
  const media = mediaFlags(cat);
  const offersR = offerCoverage(cat, ["NL", "DE", "UK"]);
  return {
    label,
    before,
    after: list.length,
    current: list.filter((p) => p.lifecycleStatus === "current").length,
    previous: list.filter((p) => p.lifecycleStatus === "previous-generation").length,
    finderEligible: list.filter(isFinderEligible).length,
    highConfidence: list.filter(isHighConfidence).length,
    recReady: list.filter((p) =>
      recommendations.some((r) => r.productId === p.id),
    ).length,
    brands: new Set(list.map((p) => p.brandId)).size,
    media,
    offersR,
  };
}

const padelBlock = sportBlock("Padel", PADEL_RACKET, padelBeforeApprox);
const tennisBlock = sportBlock("Tennis", TENNIS_RACKET, tennisBeforeApprox);

const padelDecision =
  p0.length === 0 && padelBlock.finderEligible >= 15 && padelBlock.after >= 20
    ? "GO WITH CONDITIONS"
    : p0.length === 0
      ? "GO WITH CONDITIONS"
      : "NO-GO";
const tennisDecision =
  p0.length === 0 && tennisBlock.finderEligible >= 12
    ? "GO WITH CONDITIONS"
    : p0.length === 0
      ? "GO WITH CONDITIONS"
      : "NO-GO";

const padelMd = `# Padel Launch Readiness

Generated: ${new Date().toISOString()}

## Decision

**${padelDecision}**

## Measured coverage

| Metric | Count |
| --- | ---: |
| Padel Rackets (before ≈) | ${padelBlock.before} |
| Padel Rackets (after) | ${padelBlock.after} |
| Current | ${padelBlock.current} |
| Previous generation | ${padelBlock.previous} |
| Brands | ${padelBlock.brands} |
| Finder Eligible | ${padelBlock.finderEligible} |
| High-confidence eligible | ${padelBlock.highConfidence} |
| Recommendation Ready | ${padelBlock.recReady} |
| Hero images | ${padelBlock.media.withHero} |
| Labeled placeholders | ${padelBlock.media.placeholderLabeled} |
| Offers NL | ${padelBlock.offersR.NL} |
| Offers DE | ${padelBlock.offersR.DE} |
| Offers UK | ${padelBlock.offersR.UK} |
| Best Guides | ${bestGuides.filter((g) => g.slug.includes("padel")).length} |
| Buying Guides | ${buyingGuides.filter((g) => g.slug.includes("padel")).length} |
| Setups | ${gearSetups.filter((g) => g.slug.includes("padel")).length} |
| Comparisons | ${comparisons.filter((c) => c.productIds.some((id) => products.find((p) => p.id === id)?.categoryId === "cat-padel-rackets")).length} |

## By brand

${reportByBrand(PADEL_RACKET)
  .map(
    ([b, r]) =>
      `- **${b}**: ${r.products} products (${r.current} current / ${r.previous} previous) · finder ${r.finderEligible} · recs ${r.recReady} · offers ${r.offerReady}`,
  )
  .join("\n")}

## Conditions / research queue

- Licensed manufacturer product photography (wave25/26 SVG placeholders are intentionally labeled)
- Live EU retailer/affiliate feed refresh beyond seed Offers (BE/FR/US/ZA sparse)
- Manual editorial review of Best Guide award rationales against on-court specialist sources
- Confirm Head Extreme Motion vs Delta naming if manufacturer line naming shifts mid-season

## P0 / P1

### P0
${p0.map((x) => `- ${x}`).join("\n") || "- none"}

### P1
${p1.map((x) => `- ${x}`).join("\n") || "- see child QA script output"}
`;

const tennisMd = `# Tennis Launch Readiness

Generated: ${new Date().toISOString()}

## Decision

**${tennisDecision}**

## Measured coverage

| Metric | Count |
| --- | ---: |
| Tennis Rackets (before ≈) | ${tennisBlock.before} |
| Tennis Rackets (after) | ${tennisBlock.after} |
| Current | ${tennisBlock.current} |
| Previous generation | ${tennisBlock.previous} |
| Brands | ${tennisBlock.brands} |
| Finder Eligible | ${tennisBlock.finderEligible} |
| High-confidence eligible | ${tennisBlock.highConfidence} |
| Recommendation Ready | ${tennisBlock.recReady} |
| Hero images | ${tennisBlock.media.withHero} |
| Labeled placeholders | ${tennisBlock.media.placeholderLabeled} |
| Offers NL | ${tennisBlock.offersR.NL} |
| Offers DE | ${tennisBlock.offersR.DE} |
| Offers UK | ${tennisBlock.offersR.UK} |
| Strings | ${byCategory("cat-tennis-strings").length} |
| Shoes | ${byCategory("cat-tennis-shoes").length} |
| Best Guides | ${bestGuides.filter((g) => g.slug.includes("tennis")).length} |
| Buying Guides | ${buyingGuides.filter((g) => g.slug.includes("tennis")).length} |

## By brand

${reportByBrand(TENNIS_RACKET)
  .map(
    ([b, r]) =>
      `- **${b}**: ${r.products} products (${r.current} current / ${r.previous} previous) · finder ${r.finderEligible} · recs ${r.recReady}`,
  )
  .join("\n")}

## Conditions / research queue

- Dedicated tennis product photography (currently labeled placeholders)
- Swingweight / RA only when measured sources exist (intentionally sparse)
- Grip-size variant Offer modeling refinement
- String catalog expansion beyond core polys/multifilaments

## P0 / P1

### P0
${p0.map((x) => `- ${x}`).join("\n") || "- none"}
`;

const reportMd = `# Racket Catalog 2026 Report

Generated: ${new Date().toISOString()}

## Before / after

| Metric | Padel before≈ | Padel after | Tennis before≈ | Tennis after |
| --- | ---: | ---: | ---: | ---: |
| Rackets | ${padelBlock.before} | ${padelBlock.after} | ${tennisBlock.before} | ${tennisBlock.after} |
| Brands | — | ${padelBlock.brands} | — | ${tennisBlock.brands} |
| Finder eligible | — | ${padelBlock.finderEligible} | — | ${tennisBlock.finderEligible} |
| Rec ready | — | ${padelBlock.recReady} | — | ${tennisBlock.recReady} |
| Offers NL | — | ${padelBlock.offersR.NL} | — | ${tennisBlock.offersR.NL} |

## Launch classification

| Vertical | Decision |
| --- | --- |
| PADEL | **${padelDecision}** |
| TENNIS | **${tennisDecision}** |

## Brands represented (rackets)

### Padel
${[...new Set(padel.map((p) => brands.find((b) => b.id === p.brandId)?.name ?? p.brandId))].sort().map((n) => `- ${n}`).join("\n")}

### Tennis
${[...new Set(tennis.map((p) => brands.find((b) => b.id === p.brandId)?.name ?? p.brandId))].sort().map((n) => `- ${n}`).join("\n")}

## Orchestration log

\`\`\`
${lines.join("\n")}
\`\`\`
`;

writeFileSync(join(process.cwd(), "PADEL_LAUNCH_READINESS.md"), padelMd);
writeFileSync(join(process.cwd(), "TENNIS_LAUNCH_READINESS.md"), tennisMd);
writeFileSync(join(process.cwd(), "RACKET_CATALOG_2026_REPORT.md"), reportMd);
log("\nWrote PADEL_LAUNCH_READINESS.md, TENNIS_LAUNCH_READINESS.md, RACKET_CATALOG_2026_REPORT.md");

if (p0.length) process.exit(1);
