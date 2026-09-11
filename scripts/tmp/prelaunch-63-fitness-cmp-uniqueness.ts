/**
 * Fix 63 — Fitness comparison uniqueness dump.
 * Same method as V3 / prelaunch-59: category-peer Jaccard after name-scrub
 * on summary + verdict + keyDifferences.join.
 */
import { getComparisons, getProductById } from "@/repositories";
import {
  assessComparisonLaunchQuality,
  assessEditorialReadiness,
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import {
  classifyUniqueness,
  normalizeText,
  scrubEntityNames,
  textSimilarity,
  tokenize,
} from "@/domain/content-uniqueness/text";

const PROD = { isDev: false as const, now: new Date("2026-09-10T08:00:00.000Z") };
const comparisons = getComparisons(PROD);
const TARGETS = new Set([
  "nike-romaleos-5-vs-adidas-adipower-3",
  "adidas-powerlift-5-vs-nike-romaleos-5",
]);

function uniquenessBlob(c: (typeof comparisons)[number], names: string[]) {
  return normalizeText(
    scrubEntityNames(
      `${c.summary ?? ""} ${c.verdict ?? ""} ${(c.keyDifferences ?? []).join(" ")}`,
      names,
    ),
  );
}

const cmpItems = comparisons.map((comparison) => {
  const products = comparison.productIds.map((id) => getProductById(id, PROD));
  const names = products.filter(Boolean).flatMap((p) => [p!.name, p!.fullName ?? ""]);
  const elig = getLaunchEligibility({ kind: "comparison", entity: comparison }, PROD);
  return {
    slug: comparison.slug,
    categoryId: comparison.categoryId ?? "unknown",
    sportIds: [...new Set(products.filter(Boolean).flatMap((p) => p!.sportIds))],
    text: uniquenessBlob(comparison, names),
    names,
    indexable: isIndexableEligibility(elig),
    disposition: elig.disposition,
    summary: comparison.summary,
    verdict: comparison.verdict,
    productIds: comparison.productIds,
    productNames: products.filter(Boolean).map((p) => p!.fullName ?? p!.name),
  };
});

const byCat = new Map<string, typeof cmpItems>();
for (const it of cmpItems) {
  const list = byCat.get(it.categoryId) ?? [];
  list.push(it);
  byCat.set(it.categoryId, list);
}

const fitnessCmp = cmpItems.filter((it) =>
  it.sportIds.includes("sport-training") || it.sportIds.includes("sport-hyrox"),
);

const needs: { slug: string; peer: string; sim: number; cls: string; indexable: boolean; disposition: string }[] = [];

for (const items of byCat.values()) {
  for (let i = 0; i < items.length; i++) {
    let max = 0;
    let peer = "";
    const scores: { slug: string; sim: number }[] = [];
    for (let j = 0; j < items.length; j++) {
      if (i === j) continue;
      const s = textSimilarity(items[i]!.text, items[j]!.text);
      scores.push({ slug: items[j]!.slug, sim: s });
      if (s > max) {
        max = s;
        peer = items[j]!.slug;
      }
    }
    scores.sort((a, b) => b.sim - a.sim);
    const cls = classifyUniqueness({
      maxPeerSimilarity: max,
      scaffoldHits: 0,
      uniqueSignalRatio: 0.5,
    });
    if (cls === "NEEDS_DIFFERENTIATION" || cls === "DUPLICATIVE" || TARGETS.has(items[i]!.slug)) {
      needs.push({
        slug: items[i]!.slug,
        peer,
        sim: Number(max.toFixed(3)),
        cls,
        indexable: items[i]!.indexable,
        disposition: items[i]!.disposition,
      });
    }
    if (TARGETS.has(items[i]!.slug)) {
      const aTok = new Set(tokenize(items[i]!.text));
      const b = items.find((x) => x.slug === peer);
      const bTok = new Set(tokenize(b?.text ?? ""));
      const overlap = [...aTok].filter((t) => bTok.has(t)).sort();
      console.log(
        JSON.stringify(
          {
            slug: items[i]!.slug,
            url: `/compare/${items[i]!.slug}`,
            products: items[i]!.productNames,
            categoryId: items[i]!.categoryId,
            indexable: items[i]!.indexable,
            disposition: items[i]!.disposition,
            uniqueness: cls,
            maxSim: Number(max.toFixed(3)),
            nearestPeer: peer,
            topPeers: scores.slice(0, 5).map((s) => ({
              slug: s.slug,
              sim: Number(s.sim.toFixed(3)),
            })),
            overlappingTokens: overlap,
            summary: items[i]!.summary,
            verdict: items[i]!.verdict,
            blobPreview: items[i]!.text.slice(0, 500),
          },
          null,
          2,
        ),
      );
    }
  }
}

const fitnessNeeds = needs.filter(
  (n) =>
    fitnessCmp.some((c) => c.slug === n.slug) &&
    (n.cls === "NEEDS_DIFFERENTIATION" || n.cls === "DUPLICATIVE"),
);

const allCmpNeeds = needs.filter(
  (n) => n.cls === "NEEDS_DIFFERENTIATION" || n.cls === "DUPLICATIVE",
);

const fitnessByClass = { NEEDS_DIFF: 0, DUPLICATIVE: 0, other: 0 };
for (const it of fitnessCmp) {
  const items = byCat.get(it.categoryId) ?? [];
  let max = 0;
  for (const other of items) {
    if (other.slug === it.slug) continue;
    max = Math.max(max, textSimilarity(it.text, other.text));
  }
  const cls = classifyUniqueness({
    maxPeerSimilarity: max,
    scaffoldHits: 0,
    uniqueSignalRatio: 0.5,
  });
  if (cls === "NEEDS_DIFFERENTIATION") fitnessByClass.NEEDS_DIFF++;
  else if (cls === "DUPLICATIVE") fitnessByClass.DUPLICATIVE++;
  else fitnessByClass.other++;
}

console.log(
  JSON.stringify(
    {
      fitnessComparisons: fitnessCmp.length,
      fitnessByClass,
      fitnessNeedsDiffSlugs: fitnessNeeds.map((n) => n.slug),
      allCmpNeedsDiff: allCmpNeeds.filter((n) => n.cls === "NEEDS_DIFFERENTIATION").length,
      allCmpDuplicative: allCmpNeeds.filter((n) => n.cls === "DUPLICATIVE").length,
    },
    null,
    2,
  ),
);

const GENERIC =
  /both are excellent|depends on (your )?preference|pick on fit and platform preference/i;
for (const slug of TARGETS) {
  const c = comparisons.find((x) => x.slug === slug);
  if (!c) continue;
  const q = assessComparisonLaunchQuality(c, PROD);
  const ed = assessEditorialReadiness({ kind: "comparison", entity: c }, PROD);
  const el = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
  console.log(
    JSON.stringify(
      {
        slug,
        quality: q.quality,
        meaningful: q.meaningful,
        editorialReady: ed.ready,
        gaps: ed.gaps,
        disposition: el.disposition,
        indexable: isIndexableEligibility(el),
        reasons: el.reasons,
        genericVerdict: GENERIC.test(`${c.summary} ${c.verdict}`),
      },
      null,
      2,
    ),
  );
}
