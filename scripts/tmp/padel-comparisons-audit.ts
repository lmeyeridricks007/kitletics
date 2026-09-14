/**
 * Audit padel comparisons + flagship alternatives quality.
 */
import fs from "node:fs";
import path from "node:path";
import { getComparisons } from "@/repositories/editorial";
import { getProductById } from "@/repositories/products";
import { isMeaningfulComparison } from "@/domain/launch/assess-comparison-quality";
import { getLaunchEligibility } from "@/domain/launch/get-launch-eligibility";
import { computeAlternativesQualitySignals } from "@/lib/product/compute-alternatives-quality-signals";
import { evaluateAlternativesContentIndexable } from "@/lib/product/alternatives-quality-signals";
import { PADEL_COMPARISON_RETIRED } from "@/content/padel/comparisons";

const FLAGSHIPS = [
  "prod-bullpadel-vertex-05",
  "prod-bullpadel-hack-04",
  "prod-nox-at10-12k-2026",
  "prod-nox-at10-18k-2026",
  "prod-adidas-metalbone-3-5-2026",
  "prod-babolat-technical-viper",
  "prod-head-coello-pro",
  "prod-nox-ml10-pro-cup",
  "prod-bullpadel-indiga-ctr",
  "prod-babolat-counter-viper",
];

const padelComps = getComparisons().filter(
  (c) => c.categoryId === "cat-padel-rackets",
);

const rows = padelComps.map((c) => {
  const missing = c.productIds.filter((id) => !getProductById(id));
  const winners = {
    power: c.criteria.find((x) => x.key === "power")?.winnerProductId ?? null,
    control: c.criteria.find((x) => x.key === "control")?.winnerProductId ?? null,
    comfort: c.criteria.find((x) => x.key === "comfort")?.winnerProductId ?? null,
    maneuverability:
      c.criteria.find((x) => x.key === "maneuverability")?.winnerProductId ??
      null,
  };
  const eligibility = getLaunchEligibility({
    kind: "comparison",
    entity: c,
  });
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    products: c.productIds,
    missing,
    meaningful: isMeaningfulComparison(c),
    eligibility: eligibility.status,
    criteria: c.criteria.length,
    keyDifferences: c.keyDifferences?.length ?? 0,
    chooseReasons: c.chooseProductReasons?.length ?? 0,
    useCases: c.recommendationsByUseCase.length,
    summaryWords: (c.summary ?? "").trim().split(/\s+/).filter(Boolean).length,
    isGeneration: Boolean(c.isGenerationComparison),
    dimKeys: c.criteria.map((x) => x.key),
    winners,
    hasBiggestDiff: (c.keyDifferences ?? []).some(
      (k) =>
        k.key === "biggest-difference" ||
        /^Biggest difference/i.test(k.label),
    ),
  };
});

const altRows = FLAGSHIPS.map((id) => {
  const p = getProductById(id);
  if (!p) return { id, missing: true as const };
  const signals = computeAlternativesQualitySignals(p);
  const content = evaluateAlternativesContentIndexable({
    canPublish: signals.canPublish,
    categoryId: p.categoryId,
    productSlug: p.slug,
    substantiveCount: signals.substantiveCount,
    reasonGroupCount: signals.reasonGroupCount,
    distinctCopy: signals.distinctCopy,
  });
  return {
    id,
    name: p.name,
    missing: false as const,
    altCount: signals.alternativeCount,
    substantiveCount: signals.substantiveCount,
    reasonGroups: signals.reasonGroupCount,
    distinctCopy: signals.distinctCopy,
    canPublish: signals.canPublish,
    contentIndexable: content.indexable,
    contentReasons: content.reasons,
  };
});

const out = {
  generatedAt: new Date().toISOString(),
  comparisons: {
    total: rows.length,
    meaningful: rows.filter((r) => r.meaningful).length,
    thin: rows.filter((r) => !r.meaningful).length,
    missingProducts: rows.filter((r) => r.missing.length > 0),
    retired: [...PADEL_COMPARISON_RETIRED],
    rows: rows.sort((a, b) => a.slug.localeCompare(b.slug)),
  },
  alternatives: { flagships: altRows },
};

const outPath = path.join(
  process.cwd(),
  "data/staging/padel-comparisons-quality.json",
);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

console.log(
  JSON.stringify(
    {
      comps: out.comparisons.total,
      meaningful: out.comparisons.meaningful,
      thin: out.comparisons.thin,
      alts: altRows.map((a) =>
        a.missing
          ? `MISSING ${a.id}`
          : `${a.name}: alts=${a.altCount} substantive=${a.substantiveCount} contentIndexable=${a.contentIndexable}`,
      ),
    },
    null,
    2,
  ),
);
