/**
 * Patch RC V2 summary/issues after corrected comparison + Fix 50 uniqueness import.
 * READ-ONLY relative to product code.
 */
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { getComparisons, getProductById } from "@/repositories";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch";
import { COMPARISON_BROKEN_PEER_SLUGS } from "@/content/comparisons-p41-completion";

const PROD = { isDev: false as const, now: new Date("2026-09-09T22:00:00.000Z") };
const BROKEN = new Set(COMPARISON_BROKEN_PEER_SLUGS);

let listBroken = 0;
let liveBroken = 0;
const liveBrokenSlugs: string[] = [];
for (const c of getComparisons(PROD)) {
  if (BROKEN.has(c.slug)) listBroken++;
  const elig = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  const ids = c.productIds ?? [];
  const missing = ids.filter((id) => !getProductById(id, PROD));
  if (ids.length < 2 || missing.length) {
    liveBroken++;
    liveBrokenSlugs.push(c.slug);
  }
}

const audit = JSON.parse(
  readFileSync("docs/prelaunch/data/FINAL-EDITORIAL-AUDIT.json", "utf8"),
);
const needsDiff = Number(audit.reviews.indexableNeedsDiff);
const duplicative = Number(audit.reviews.indexableDuplicative);

const RC = "docs/prelaunch/data/rc-v2";
const summary = JSON.parse(readFileSync(join(RC, "summary.json"), "utf8"));

summary.goGates.brokenComparisons = Math.max(listBroken, liveBroken);
summary.goGates.liveBrokenCmp = liveBroken;
summary.goGates.listBrokenCmp = listBroken;
summary.goGates.indexableNeedsDiffReviews = needsDiff;
summary.goGates.indexableDuplicativeReviews = duplicative;
summary.goGates.liveReclusterNeedsDiff = 0;
summary.goGates.needsDiffSource =
  "FINAL-EDITORIAL-AUDIT.json (Fix 50 forensic category-peer clustering)";
summary.notes = {
  uniqueness:
    "Fix 50 forensic is authoritative for GO gate (indexableNeedsDiff=114). V2 all-peer recluster returned 0 (different peer scope / not category-scoped).",
  brokenComparisons: `Corrected to productIds; listBroken=${listBroken}; liveBroken=${liveBroken}`,
  sitemapHttpProbe:
    "NOT RUN — npm run build FAILED (eslint react-hooks on alternative-decision-copy)",
  runtimeSmoke: "NOT RUN — no production server without successful build",
  performance:
    "Not re-measured V2. Prior RC: P0 routes mostly OK; /compare and daily-trainers image-weight fails remain historical.",
};

const ci = summary.goGates.ci;
const hardFails: string[] = [];
if ([ci.lint, ci.typecheck, ci.test, ci.build].some((x: number | null) => x !== null && x !== 0))
  hardFails.push("CI_FAILURES");
if (typeof summary.goGates.sitemap404s === "number" && summary.goGates.sitemap404s > 0)
  hardFails.push("SITEMAP_404S");
if (duplicative > 0) hardFails.push("INDEXABLE_DUPLICATIVE_REVIEWS");
if (needsDiff > 0) hardFails.push("INDEXABLE_NEEDS_DIFF_REVIEWS");
if (summary.goGates.indexableThinBest > 0) hardFails.push("INDEXABLE_THIN_BEST");
if (Math.max(listBroken, liveBroken) > 0) hardFails.push("BROKEN_COMPARISONS");
if (summary.goGates.unsupportedFirstHand > 0) hardFails.push("UNSUPPORTED_FIRST_HAND");
if (summary.goGates.fakeAggregateRating > 0) hardFails.push("FAKE_AGGREGATE_RATING");
if (summary.goGates.facetLeakage > 0) hardFails.push("FACET_LEAKAGE");
if (summary.goGates.futureDraftLeakage > 0) hardFails.push("FUTURE_DRAFT_LEAKAGE");
// Sitemap probe not run — treat as unresolved required gate
hardFails.push("SITEMAP_HTTP_PROBE_NOT_RUN");

summary.hardFails = hardFails;
summary.verdict = "NO-GO";
summary.liveBrokenSlugs = liveBrokenSlugs.slice(0, 20);
writeFileSync(join(RC, "summary.json"), JSON.stringify(summary, null, 2));

const esc = (v: string) =>
  /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
const issues: string[][] = [
  [
    "BLOCKER",
    "ci",
    "",
    "CI_FAILURES",
    `lint=${ci.lint} typecheck=${ci.typecheck} test=${ci.test} build=${ci.build}`,
  ],
  [
    "BLOCKER",
    "sitemap",
    "",
    "SITEMAP_HTTP_PROBE_NOT_RUN",
    "build failed; cannot prove 0 sitemap 404s this clock",
  ],
  [
    "HIGH",
    "uniqueness",
    "",
    "INDEXABLE_NEEDS_DIFF",
    `count=${needsDiff} from Fix 50 forensic (REQUIRED FOR GO = 0)`,
  ],
];

// Import editorial issue paths when present
const edPath = "docs/prelaunch/data/FINAL-EDITORIAL-ISSUES.csv";
try {
  const lines = readFileSync(edPath, "utf8").split("\n").slice(1);
  let n = 0;
  for (const line of lines) {
    if (!line.includes("NEEDS_DIFF") && !line.includes("needs-diff")) continue;
    const m = line.match(/\/reviews\/[a-z0-9-]+/);
    if (!m) continue;
    issues.push([
      "HIGH",
      "uniqueness",
      m[0],
      "INDEXABLE_NEEDS_DIFF",
      "Fix 50 forensic peer clustering",
    ]);
    n++;
    if (n >= 150) break;
  }
} catch {
  /* optional */
}

if (Math.max(listBroken, liveBroken) > 0) {
  issues.push([
    "BLOCKER",
    "comparison",
    "",
    "BROKEN_COMPARISONS",
    `list=${listBroken};live=${liveBroken}`,
  ]);
}

writeFileSync(
  "docs/prelaunch/data/FINAL-ISSUES-V2.csv",
  ["severity,area,path,code,detail", ...issues.map((r) => r.map(esc).join(","))].join(
    "\n",
  ) + "\n",
);

console.log(
  JSON.stringify(
    {
      verdict: summary.verdict,
      hardFails,
      listBroken,
      liveBroken,
      needsDiff,
      duplicative,
      issueRows: issues.length,
    },
    null,
    2,
  ),
);
