/**
 * Editorial 41 — compare completion verify (readonly).
 * Usage: npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-41-comparisons-verify.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getComparisons, getProducts } from "@/repositories";
import { assessComparisonLaunchQuality } from "@/domain/launch/assess-comparison-quality";
import { getLaunchEligibility, isIndexableEligibility } from "@/domain/launch/get-launch-eligibility";
import {
  classifyUniqueness,
  normalizeText,
  scaffoldHitCount,
  scrubEntityNames,
  textSimilarity,
} from "@/domain/content-uniqueness/text";
import { COMPARISON_BROKEN_PEER_SLUGS } from "@/content/comparisons-p41-completion";
import {
  canonicalProductPairKey,
  reverseComparisonSlug,
} from "@/lib/comparison/engine";

const OUT = join(process.cwd(), "docs/prelaunch/editorial/data");
mkdirSync(OUT, { recursive: true });

const prod = { isDev: false as const };
const allRaw = getComparisons({ isDev: true });
const published = getComparisons(prod);
const products = getProducts({ isDev: true });
const productById = new Map(products.map((p) => [p.id, p]));

function uniqueSignalRatio(text: string, names: string[]): number {
  const scrubbed = scrubEntityNames(text, names);
  const toks = normalizeText(scrubbed).split(" ").filter((t) => t.length > 2);
  if (!toks.length) return 0;
  return new Set(toks).size / toks.length;
}

type Row = {
  slug: string;
  status: string;
  class: string;
  maxPeerSimilarity: number;
  peerSlug?: string;
  scaffoldHits: number;
  uniqueSignalRatio: number;
  reasons: string[];
  launchQuality?: string;
  eligibility?: string;
  brokenPeerHold?: boolean;
};

const needsDiffTargets = [
  "nox-at10-genius-18k-2026-vs-bullpadel-vertex-04-2026",
  "babolat-technical-viper-2026-vs-wilson-bela-pro-v2-2026",
  "nox-at10-genius-18k-2026-vs-babolat-technical-viper-2026",
  "babolat-pure-drive-2025-vs-wilson-clash-100-v2",
  "yonex-ezone-100-2025-vs-wilson-clash-100-v3",
  "concept2-rowerg-vs-mirafit-magnetic-rower",
  "concept2-rowerg-vs-hydrow-wave",
];

const cmpItems: {
  key: string;
  text: string;
  names: string[];
  meta: Row;
}[] = [];

for (const cmp of published) {
  const productNames = (cmp.productIds ?? [])
    .map((id) => productById.get(id))
    .filter(Boolean)
    .flatMap((p) => [p!.fullName, p!.name]);
  const names = [...productNames, cmp.title];
  const text = [
    cmp.summary,
    cmp.verdict,
    cmp.winnerReason,
    ...(cmp.keyDifferences ?? []).map(
      (d) =>
        `${d.label} ${d.explanation} ${(d.productImpacts ?? [])
          .map((p) => p.impact)
          .join(" ")}`,
    ),
    ...(cmp.chooseProductReasons ?? []).map(
      (c) => `${c.context ?? ""} ${c.reason}`,
    ),
    ...(cmp.recommendationsByUseCase ?? []).map(
      (u) => `${u.useCaseId} ${u.rationale}`,
    ),
  ]
    .filter(Boolean)
    .join("\n\n");

  const shortNames = (cmp.productIds ?? [])
    .map((id) => productById.get(id)?.name)
    .filter(Boolean) as string[];
  const hay = normalizeText(
    [cmp.summary, cmp.verdict, cmp.winnerReason, text].filter(Boolean).join(" "),
  );
  const namedHits = shortNames.filter((n) =>
    hay.includes(normalizeText(n).slice(0, Math.min(10, n.length))),
  ).length;
  const pairSpecific =
    shortNames.length >= 2 &&
    namedHits >= Math.min(2, shortNames.length) &&
    ((cmp.keyDifferences?.length ?? 0) > 0 ||
      (cmp.chooseProductReasons?.length ?? 0) > 0 ||
      (cmp.recommendationsByUseCase?.length ?? 0) > 0);

  const launch = assessComparisonLaunchQuality(cmp, prod);
  const elig = getLaunchEligibility(
    { kind: "comparison", entity: cmp },
    prod,
  );

  cmpItems.push({
    key: cmp.slug,
    text,
    names,
    meta: {
      slug: cmp.slug,
      status: cmp.status,
      class: "GENUINELY_UNIQUE",
      maxPeerSimilarity: 0,
      scaffoldHits: scaffoldHitCount(text),
      uniqueSignalRatio: Number(uniqueSignalRatio(text, names).toFixed(3)),
      reasons: pairSpecific ? [] : ["weak_pair_specific_reasoning"],
      launchQuality: launch.quality,
      eligibility: elig.disposition,
    },
  });
}

// pairwise
for (let i = 0; i < cmpItems.length; i++) {
  for (let j = i + 1; j < cmpItems.length; j++) {
    const a = cmpItems[i]!;
    const b = cmpItems[j]!;
    const scrubA = scrubEntityNames(a.text, a.names);
    const scrubB = scrubEntityNames(b.text, b.names);
    const score = textSimilarity(scrubA, scrubB);
    if (score > a.meta.maxPeerSimilarity) {
      a.meta.maxPeerSimilarity = score;
      a.meta.peerSlug = b.key;
    }
    if (score > b.meta.maxPeerSimilarity) {
      b.meta.maxPeerSimilarity = score;
      b.meta.peerSlug = a.key;
    }
  }
}

for (const it of cmpItems) {
  it.meta.maxPeerSimilarity = Number(it.meta.maxPeerSimilarity.toFixed(3));
  let cls = classifyUniqueness({
    maxPeerSimilarity: it.meta.maxPeerSimilarity,
    scaffoldHits: it.meta.scaffoldHits,
    uniqueSignalRatio: it.meta.uniqueSignalRatio,
  });
  if (
    it.meta.reasons.includes("weak_pair_specific_reasoning") &&
    cls === "GENUINELY_UNIQUE" &&
    (it.meta.scaffoldHits >= 2 || it.meta.maxPeerSimilarity >= 0.45)
  ) {
    cls = "NEEDS_DIFFERENTIATION";
  }
  it.meta.class = cls;
}

const byClass: Record<string, number> = {};
for (const it of cmpItems) {
  byClass[it.meta.class] = (byClass[it.meta.class] ?? 0) + 1;
}

const heldBroken = COMPARISON_BROKEN_PEER_SLUGS.map((slug) => {
  const cmp = allRaw.find((c) => c.slug === slug);
  const peers = (cmp?.productIds ?? []).map((id) => {
    const p = productById.get(id);
    return {
      id,
      status: p?.status ?? "MISSING",
      slug: p?.slug,
    };
  });
  return {
    slug,
    comparisonStatus: cmp?.status ?? "MISSING",
    noindex: cmp?.noindex ?? null,
    peers,
    stillInPublished: published.some((c) => c.slug === slug),
  };
});

// Broken peers still published?
const brokenStillPublished = heldBroken.filter((h) => h.stillInPublished);

// Canonical duplicates: same pair key, multiple published
const pairMap = new Map<string, string[]>();
for (const cmp of published) {
  const key = canonicalProductPairKey(cmp.productIds);
  const list = pairMap.get(key) ?? [];
  list.push(cmp.slug);
  pairMap.set(key, list);
}
const duplicatePairs = [...pairMap.entries()].filter(([, slugs]) => slugs.length > 1);

// Reverse slug coverage
let reverseOk = 0;
let reverseMissing = 0;
for (const cmp of published) {
  const rev = reverseComparisonSlug(cmp.slug);
  if (!rev) continue;
  // reverse should not be a second published record with different id
  const revCmp = published.find((c) => c.slug === rev);
  if (revCmp && revCmp.id !== cmp.id) reverseMissing++;
  else reverseOk++;
}

const needsDiffRows = cmpItems
  .filter((c) => c.meta.class === "NEEDS_DIFFERENTIATION")
  .map((c) => c.meta);
const duplicativeRows = cmpItems
  .filter((c) => c.meta.class === "DUPLICATIVE")
  .map((c) => c.meta);

const targetAfter = needsDiffTargets.map((slug) => {
  const it = cmpItems.find((c) => c.key === slug);
  return it?.meta ?? { slug, class: "NOT_IN_PUBLISHED", maxPeerSimilarity: 0 };
});

const indexable = published.filter((cmp) => {
  const elig = getLaunchEligibility(
    { kind: "comparison", entity: cmp },
    prod,
  );
  return isIndexableEligibility(elig);
});

const meaningful = published.filter(
  (c) => assessComparisonLaunchQuality(c, prod).quality === "MEANINGFUL",
);

const report = {
  generatedAt: new Date().toISOString(),
  totals: {
    rawWithDrafts: allRaw.length,
    published: published.length,
    meaningful: meaningful.length,
    indexableEligibility: indexable.length,
    byUniquenessClass: byClass,
    needsDiff: needsDiffRows.length,
    duplicative: duplicativeRows.length,
    brokenPeerHolds: heldBroken.length,
    brokenStillPublished: brokenStillPublished.length,
    duplicateCanonicalPairs: duplicatePairs.length,
  },
  heldBroken,
  brokenStillPublished,
  needsDiffRows,
  duplicativeRows,
  formerNeedsDiffTargets: targetAfter,
  duplicatePairs: duplicatePairs.map(([key, slugs]) => ({ key, slugs })),
  reverseSlugCheck: { reverseOk, reverseConflicts: reverseMissing },
};

writeFileSync(
  join(OUT, "41-comparisons-completion.json"),
  JSON.stringify(report, null, 2),
);

console.log(JSON.stringify(report.totals, null, 2));
console.log("\nFormer NEEDS_DIFF targets:");
for (const t of targetAfter) {
  console.log(
    `  ${t.slug}: ${t.class} peer=${"maxPeerSimilarity" in t ? t.maxPeerSimilarity : "?"}`,
  );
}
if (needsDiffRows.length) {
  console.log("\nRemaining NEEDS_DIFF:");
  for (const r of needsDiffRows) {
    console.log(`  ${r.slug} peer=${r.maxPeerSimilarity} vs ${r.peerSlug}`);
  }
}
if (brokenStillPublished.length) {
  console.log("\nBROKEN STILL PUBLISHED:", brokenStillPublished.map((b) => b.slug));
}
console.log(`\nWrote ${join(OUT, "41-comparisons-completion.json")}`);
