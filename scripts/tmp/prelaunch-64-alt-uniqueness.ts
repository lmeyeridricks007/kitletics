/**
 * Fix 64 — dump Alternatives uniqueness (same blob as V3 / prelaunch-59).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  getAllProductRelationships,
  getAlternativesForProduct,
  getProducts,
  getCategoryById,
} from "@/repositories";
import {
  assessEditorialReadiness,
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import { isAlternativeType } from "@/domain/relationships/types";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";
import { resolveEntityVerticalPolicy } from "@/content/launch/vertical-strategy";
import {
  classifyUniqueness,
  normalizeText,
  scrubEntityNames,
  textSimilarity,
  scaffoldHitCount,
} from "@/domain/content-uniqueness/text";

const PROD = { isDev: false as const, now: new Date("2026-09-10T08:00:00.000Z") };

const V3_NEEDS = [
  "salomon-adv-skin-5",
  "nathan-vaporair-4",
  "osprey-duro-lt",
  "uswe-pace-8",
  "compressport-ultrun-s-pack",
  "nnormal-race-vest",
  "hydrapak-softflask-speed-500",
  "oakley-radar-ev-path",
  "oakley-sutro-lite",
  "smith-attack-mag",
  "julbo-ultimate",
  "tifosi-rail",
  "tifosi-vogel",
  "goodr-circle-gs",
  "ledlenser-neo9r",
  "biolite-headlamp-800-pro",
  "sis-beta-fuel-gel",
  "precision-pf30-gel",
  "neversecond-c30-gel",
  "clif-bar-original",
  "naak-ultra-energy-bar",
  "powerbar-energize",
  "precision-pf30-drink-mix",
  "neversecond-c30-sports-drink",
  "nike-dri-fit-miler-men",
  "janji-run-tee-men",
  "patagonia-capilene-cool-daily-men",
  "salomon-soft-flask-500",
  "oakley-encoder",
  "petzl-swift-rl",
];

function blobOf(data: NonNullable<ReturnType<typeof getAlternativesPageData>>) {
  return [
    data.source.intro,
    ...data.alternatives.map(
      (a) =>
        `${a.whyAlternative} ${a.betterAt.join(" ")} ${a.worseAt.join(" ")} ${a.whoShouldSwitch} ${a.whoShouldStay}`,
    ),
  ].join("\n");
}

function main() {
  const rels = getAllProductRelationships();
  const altTexts: {
    slug: string;
    text: string;
    names: string[];
    categoryId: string;
    ready: boolean;
    indexable: boolean;
    disposition: string;
    reasons: string[];
  }[] = [];

  const rows = [];

  for (const product of getProducts(PROD)) {
    const alts = rels.filter(
      (r) =>
        r.sourceProductId === product.id &&
        r.status === "approved" &&
        isAlternativeType(r.type),
    );
    if (alts.length === 0 && getAlternativesForProduct(product.id).length === 0) {
      continue;
    }
    const editorial = assessEditorialReadiness(
      { kind: "alternatives", entity: product },
      PROD,
    );
    const elig = getLaunchEligibility(
      { kind: "alternatives", entity: product },
      PROD,
    );
    const indexable = isIndexableEligibility(elig);
    if (!editorial.ready && !indexable) continue;

    const data = getAlternativesPageData(product.slug, PROD);
    if (!data) continue;
    const names = [
      product.fullName,
      product.name,
      ...data.alternatives.flatMap((a) => [a.product.fullName, a.product.name]),
    ];
    altTexts.push({
      slug: product.slug,
      text: blobOf(data),
      names,
      categoryId: product.categoryId,
      ready: editorial.ready,
      indexable,
      disposition: elig.disposition,
      reasons: elig.reasons.map((r) => `${r.code}${r.detail ? `:${r.detail}` : ""}`),
    });

    if (V3_NEEDS.includes(product.slug)) {
      rows.push({
        slug: product.slug,
        path: `/products/${product.slug}/alternatives`,
        name: product.fullName,
        categoryId: product.categoryId,
        category: getCategoryById(product.categoryId, PROD)?.name ?? product.categoryId,
        vertical: resolveEntityVerticalPolicy(product.sportIds).slug,
        holdReasons: elig.reasons.map((r) => `${r.code}${r.detail ? `:${r.detail}` : ""}`),
        disposition: elig.disposition,
        indexable,
        ready: editorial.ready,
        strengths: product.strengths,
        weaknesses: product.weaknesses,
        shortDescription: product.shortDescription,
        specs: product.specifications,
        valueScore: product.valueScore,
        recommendationScore: product.recommendationScore,
        alternatives: data.alternatives.map((a) => ({
          slug: a.product.slug,
          name: a.product.fullName,
          type: a.relationship.type,
          badge: a.badgeLabel,
          why: a.whyAlternative,
          better: a.betterAt,
          worse: a.worseAt,
          switch: a.whoShouldSwitch,
          stay: a.whoShouldStay,
          peerStrengths: a.product.strengths,
          peerWeaknesses: a.product.weaknesses,
          peerSpecs: a.product.specifications,
        })),
      });
    }
  }

  const scrubbed = altTexts.map((it) => ({
    slug: it.slug,
    text: normalizeText(scrubEntityNames(it.text, it.names)),
    categoryId: it.categoryId,
    indexable: it.indexable,
    ready: it.ready,
  }));

  const classCounts: Record<string, number> = {};
  const needs: {
    slug: string;
    cls: string;
    max: number;
    peer: string;
    peerCategory?: string;
    indexable: boolean;
  }[] = [];

  for (let i = 0; i < scrubbed.length; i++) {
    let max = 0;
    let peer = "";
    for (let j = 0; j < scrubbed.length; j++) {
      if (i === j) continue;
      const s = textSimilarity(scrubbed[i]!.text, scrubbed[j]!.text);
      if (s > max) {
        max = s;
        peer = scrubbed[j]!.slug;
      }
    }
    const cls = classifyUniqueness({
      maxPeerSimilarity: max,
      scaffoldHits: scaffoldHitCount(scrubbed[i]!.text),
      uniqueSignalRatio: 0.5,
    });
    classCounts[cls] = (classCounts[cls] ?? 0) + 1;
    if (cls === "NEEDS_DIFFERENTIATION" || cls === "DUPLICATIVE" || V3_NEEDS.includes(scrubbed[i]!.slug)) {
      needs.push({
        slug: scrubbed[i]!.slug,
        cls,
        max: Number(max.toFixed(3)),
        peer,
        peerCategory: altTexts.find((t) => t.slug === peer)?.categoryId,
        indexable: scrubbed[i]!.indexable,
      });
    }
  }

  for (const row of rows) {
    const n = needs.find((x) => x.slug === row.slug);
    (row as Record<string, unknown>).uniqueness = n?.cls;
    (row as Record<string, unknown>).maxSim = n?.max;
    (row as Record<string, unknown>).nearestPeer = n?.peer;
  }

  const out = {
    readyPagesInCluster: altTexts.length,
    classCounts,
    needsDiff: needs.filter((n) => n.cls === "NEEDS_DIFFERENTIATION").length,
    duplicative: needs.filter((n) => n.cls === "DUPLICATIVE").length,
    v3NeedsAfter: needs.filter((n) => V3_NEEDS.includes(n.slug) && n.cls === "NEEDS_DIFFERENTIATION").length,
    pages: rows,
    needsAll: needs.filter((n) => n.cls === "NEEDS_DIFFERENTIATION" || n.cls === "DUPLICATIVE"),
  };

  mkdirSync(join(process.cwd(), "docs/prelaunch/data"), { recursive: true });
  writeFileSync(
    join(process.cwd(), "docs/prelaunch/data/64-alt-dump.json"),
    JSON.stringify(out, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        readyPagesInCluster: out.readyPagesInCluster,
        classCounts,
        needsDiff: out.needsDiff,
        duplicative: out.duplicative,
        v3NeedsAfter: out.v3NeedsAfter,
        v3Rows: rows.map((r) => ({
          slug: (r as { slug: string }).slug,
          category: (r as { category: string }).category,
          uniqueness: (r as { uniqueness?: string }).uniqueness,
          maxSim: (r as { maxSim?: number }).maxSim,
          nearestPeer: (r as { nearestPeer?: string }).nearestPeer,
          indexable: (r as { indexable: boolean }).indexable,
          disposition: (r as { disposition: string }).disposition,
          altCount: (r as { alternatives: unknown[] }).alternatives.length,
        })),
      },
      null,
      2,
    ),
  );
}

main();
