/**
 * Fix 57 — Comparisons + Alternatives final validation.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  getComparisons,
  getProducts,
  getProductById,
} from "@/repositories";
import { getAllProductRelationships } from "@/repositories/relationships";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { isAlternativeType } from "@/domain/relationships/types";
import {
  assessComparisonEditorialReadiness,
  assessAlternativesEditorialReadiness,
} from "@/domain/editorial-readiness/assess";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch/get-launch-eligibility";
import { assessComparisonLaunchQuality } from "@/domain/launch/assess-comparison-quality";
import { getComparisonPageData } from "@/lib/comparison/get-comparison-page-data";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";
import {
  canonicalProductPairKey,
  reverseComparisonSlug,
} from "@/lib/comparison/engine";
import { COMPARISON_BROKEN_PEER_SLUGS } from "@/content/comparisons-p41-completion";
import { ALTERNATIVES_UNIQUENESS_HOLD_SLUGS } from "@/content/alternatives-uniqueness-holds";
import {
  classifyUniqueness,
  normalizeText,
  scaffoldHitCount,
  scrubEntityNames,
  textSimilarity,
} from "@/domain/content-uniqueness/text";

const PROD = { isDev: false as const };
const OUT = join(process.cwd(), "docs/prelaunch/data");
mkdirSync(OUT, { recursive: true });

const GENERIC_VERDICT = [
  "same buying lane",
  "both are excellent",
  "both are great",
  "it depends on your needs",
  "depends on your preferences",
  "choose whichever you prefer",
  "there is no wrong answer",
];

function uniqueSignalRatio(text: string, names: string[]): number {
  const scrubbed = scrubEntityNames(text, names);
  const toks = normalizeText(scrubbed).split(" ").filter((t) => t.length > 2);
  if (!toks.length) return 0;
  return new Set(toks).size / toks.length;
}

function productNameInText(
  name: string,
  hay: string,
): boolean {
  const n = normalizeText(name);
  if (n.length < 4) return hay.includes(n);
  return hay.includes(n.slice(0, Math.min(12, n.length)));
}

function main() {
  const publishedCmp = getComparisons(PROD);
  const allCmp = getComparisons({ isDev: true });
  const products = getProducts(PROD);
  const allProductsDev = getProducts({ isDev: true });
  const productById = new Map(allProductsDev.map((p) => [p.id, p]));
  const rels = getAllProductRelationships();

  /* ── Comparisons ── */
  const cmpRows = [];
  const cmpTexts: { slug: string; text: string; names: string[] }[] = [];

  for (const cmp of publishedCmp) {
    const editorial = assessComparisonEditorialReadiness(cmp, PROD);
    const launch = assessComparisonLaunchQuality(cmp, PROD);
    const elig = getLaunchEligibility({ kind: "comparison", entity: cmp }, PROD);
    const page = getComparisonPageData(cmp.slug, PROD);
    const peers = (cmp.productIds ?? []).map((id) => {
      const p = getProductById(id, PROD);
      return {
        id,
        ok: Boolean(p),
        status: p?.status,
        slug: p?.slug,
        name: p?.name,
      };
    });
    const missing = peers.filter((p) => !p.ok).map((p) => p.id);
    const hay = normalizeText(
      [cmp.summary, cmp.verdict, cmp.winnerReason].filter(Boolean).join(" "),
    );
    const names = peers.flatMap((p) => [p.name ?? "", p.slug ?? ""]);
    const namedHits = peers.filter(
      (p) => p.name && productNameInText(p.name, hay),
    ).length;
    const pairSpecific =
      peers.length >= 2 &&
      namedHits >= 1 &&
      ((cmp.keyDifferences?.length ?? 0) > 0 ||
        (cmp.chooseProductReasons?.length ?? 0) > 0);
    const genericVerdict = GENERIC_VERDICT.some((g) => hay.includes(g));
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
    ]
      .filter(Boolean)
      .join("\n\n");

    const row = {
      slug: cmp.slug,
      ready: editorial.ready,
      workState: editorial.workState,
      gaps: editorial.gaps,
      quality: launch.quality,
      disposition: elig.disposition,
      indexable: isIndexableEligibility(elig),
      pageOk: Boolean(page),
      missing,
      pairSpecific,
      genericVerdict,
      namedHits,
      criteria: cmp.criteria?.length ?? 0,
      diffs: cmp.keyDifferences?.length ?? 0,
    };
    cmpRows.push(row);
    if (editorial.ready) {
      cmpTexts.push({
        slug: cmp.slug,
        text,
        names: [...names, cmp.title],
      });
    }
  }

  for (let i = 0; i < cmpTexts.length; i++) {
    for (let j = i + 1; j < cmpTexts.length; j++) {
      const score = textSimilarity(
        scrubEntityNames(cmpTexts[i]!.text, cmpTexts[i]!.names),
        scrubEntityNames(cmpTexts[j]!.text, cmpTexts[j]!.names),
      );
      const a = cmpRows.find((r) => r.slug === cmpTexts[i]!.slug);
      const b = cmpRows.find((r) => r.slug === cmpTexts[j]!.slug);
      if (a && score > ((a as { maxSim?: number }).maxSim ?? 0)) {
        (a as { maxSim?: number; peer?: string }).maxSim = score;
        (a as { peer?: string }).peer = cmpTexts[j]!.slug;
      }
      if (b && score > ((b as { maxSim?: number }).maxSim ?? 0)) {
        (b as { maxSim?: number; peer?: string }).maxSim = score;
        (b as { peer?: string }).peer = cmpTexts[i]!.slug;
      }
    }
  }

  const cmpClass: Record<string, number> = {};
  const cmpNeedsDiff = [];
  const cmpDup = [];
  for (const it of cmpTexts) {
    const row = cmpRows.find((r) => r.slug === it.slug)!;
    const maxSim = Number(((row as { maxSim?: number }).maxSim ?? 0).toFixed(3));
    (row as { maxSim?: number }).maxSim = maxSim;
    const cls = classifyUniqueness({
      maxPeerSimilarity: maxSim,
      scaffoldHits: scaffoldHitCount(it.text),
      uniqueSignalRatio: uniqueSignalRatio(it.text, it.names),
    });
    (row as { uniqueness?: string }).uniqueness = cls;
    cmpClass[cls] = (cmpClass[cls] ?? 0) + 1;
    if (cls === "NEEDS_DIFFERENTIATION") cmpNeedsDiff.push(row);
    if (cls === "DUPLICATIVE") cmpDup.push(row);
  }

  const pairMap = new Map<string, string[]>();
  for (const cmp of publishedCmp) {
    const key = canonicalProductPairKey(cmp.productIds);
    const list = pairMap.get(key) ?? [];
    list.push(cmp.slug);
    pairMap.set(key, list);
  }
  const duplicatePairs = [...pairMap.entries()].filter(([, slugs]) => slugs.length > 1);

  let reverseConflicts = 0;
  for (const cmp of publishedCmp) {
    const rev = reverseComparisonSlug(cmp.slug);
    if (!rev) continue;
    const revCmp = publishedCmp.find((c) => c.slug === rev);
    if (revCmp && revCmp.id !== cmp.id) reverseConflicts++;
  }

  const brokenHolds = COMPARISON_BROKEN_PEER_SLUGS.map((slug) => {
    const cmp = allCmp.find((c) => c.slug === slug);
    const peers = (cmp?.productIds ?? []).map((id) => {
      const pub = getProductById(id, PROD);
      const any = productById.get(id);
      return {
        id,
        published: Boolean(pub),
        status: pub?.status ?? any?.status ?? "MISSING",
        slug: pub?.slug ?? any?.slug,
      };
    });
    return {
      slug,
      comparisonStatus: cmp?.status,
      noindex: cmp?.noindex,
      stillPublished: publishedCmp.some((c) => c.slug === slug),
      bothPublished: peers.every((p) => p.published),
      peers,
    };
  });

  const sitemapCmp404 = cmpRows.filter((r) => r.indexable && !r.pageOk);
  const brokenPeersLive = cmpRows.filter((r) => r.missing.length > 0);

  /* ── Alternatives ── */
  const altRels = rels.filter(
    (r) => r.status === "approved" && isAlternativeType(r.type),
  );
  let syncTemplateHits = 0;
  for (const r of altRels) {
    for (const reason of r.reasons) {
      if (/same-category alternative when you want a peer/i.test(reason)) {
        syncTemplateHits++;
      }
    }
  }

  const altRows = [];
  const altTexts: { slug: string; text: string; names: string[] }[] = [];
  let pagesWithAlts = 0;
  let brokenAltTargets = 0;

  for (const p of products) {
    const gate = canPublishAlternativesPage(p, rels);
    const editorial = assessAlternativesEditorialReadiness(p, PROD);
    const elig = getLaunchEligibility({ kind: "alternatives", entity: p }, PROD);
    const data = getAlternativesPageData(p.slug, PROD);
    if (data && data.alternatives.length > 0) pagesWithAlts++;

    const sourceAlts = rels.filter(
      (r) =>
        r.sourceProductId === p.id &&
        r.status === "approved" &&
        isAlternativeType(r.type),
    );
    const unresolved = sourceAlts.filter(
      (r) => !getProductById(r.targetProductId, PROD),
    );
    brokenAltTargets += unresolved.length;

    const indexable = isIndexableEligibility(elig);
    if (!editorial.ready && !indexable && !gate.ok) continue;

    const decisionOk = data
      ? data.alternatives.every(
          (a) =>
            a.whyAlternative.length > 20 &&
            a.betterAt.length > 0 &&
            a.worseAt.length > 0 &&
            /switch|choose|move to/i.test(a.whoShouldSwitch) &&
            /stay|keep /i.test(a.whoShouldStay),
        )
      : false;
    const genericRepeat = data
      ? data.alternatives.some((a) =>
          GENERIC_VERDICT.some((g) =>
            normalizeText(
              `${a.whyAlternative} ${a.whoShouldSwitch} ${a.whoShouldStay}`,
            ).includes(g),
          ),
        )
      : false;

    const row = {
      slug: p.slug,
      ready: editorial.ready,
      workState: editorial.workState,
      gaps: editorial.gaps,
      gateOk: gate.ok,
      disposition: elig.disposition,
      indexable,
      pageOk: Boolean(data),
      altCount: data?.alternatives.length ?? 0,
      decisionOk,
      genericRepeat,
      uniquenessHold: ALTERNATIVES_UNIQUENESS_HOLD_SLUGS.has(p.slug),
      unresolvedTargets: unresolved.map((r) => r.targetProductId),
    };
    altRows.push(row);

    if (indexable && data) {
      const blob = [
        data.source.intro,
        ...data.alternatives.map(
          (a) =>
            `${a.whyAlternative}\n${a.betterAt.join(" ")}\n${a.worseAt.join(" ")}\n${a.whoShouldSwitch}\n${a.whoShouldStay}`,
        ),
      ].join("\n\n");
      altTexts.push({
        slug: p.slug,
        text: blob,
        names: [
          p.fullName,
          p.name,
          ...data.alternatives.flatMap((a) => [
            a.product.fullName,
            a.product.name,
          ]),
        ],
      });
    }
  }

  const altReady = altRows.filter((r) => r.ready);
  const altIndexable = altRows.filter((r) => r.indexable);

  for (let i = 0; i < altTexts.length; i++) {
    for (let j = i + 1; j < altTexts.length; j++) {
      const score = textSimilarity(
        scrubEntityNames(altTexts[i]!.text, altTexts[i]!.names),
        scrubEntityNames(altTexts[j]!.text, altTexts[j]!.names),
      );
      const a = altIndexable.find((r) => r.slug === altTexts[i]!.slug);
      const b = altIndexable.find((r) => r.slug === altTexts[j]!.slug);
      if (a && score > ((a as { maxSim?: number }).maxSim ?? 0)) {
        (a as { maxSim?: number; peer?: string }).maxSim = score;
        (a as { peer?: string }).peer = altTexts[j]!.slug;
      }
      if (b && score > ((b as { maxSim?: number }).maxSim ?? 0)) {
        (b as { maxSim?: number; peer?: string }).maxSim = score;
        (b as { peer?: string }).peer = altTexts[i]!.slug;
      }
    }
  }

  const altClass: Record<string, number> = {};
  const altNeedsDiff = [];
  const altDup = [];
  for (const it of altTexts) {
    const row = altIndexable.find((r) => r.slug === it.slug)!;
    const maxSim = Number(((row as { maxSim?: number }).maxSim ?? 0).toFixed(3));
    (row as { maxSim?: number }).maxSim = maxSim;
    const cls = classifyUniqueness({
      maxPeerSimilarity: maxSim,
      scaffoldHits: 0,
      uniqueSignalRatio: 0.45,
    });
    (row as { uniqueness?: string }).uniqueness = cls;
    altClass[cls] = (altClass[cls] ?? 0) + 1;
    if (cls === "NEEDS_DIFFERENTIATION") altNeedsDiff.push(row);
    if (cls === "DUPLICATIVE") altDup.push(row);
  }

  const sitemapAlt404 = altIndexable.filter((r) => !r.pageOk);
  const altIndexableNotReady = altIndexable.filter((r) => !r.ready);
  const altIndexableNoDecision = altIndexable.filter((r) => !r.decisionOk);

  const report = {
    generatedAt: new Date().toISOString(),
    comparisons: {
      totalPublished: publishedCmp.length,
      ready: cmpRows.filter((r) => r.ready).length,
      indexable: cmpRows.filter((r) => r.indexable).length,
      notReady: cmpRows.filter((r) => !r.ready).map((r) => ({
        slug: r.slug,
        workState: r.workState,
        gaps: r.gaps,
      })),
      byUniquenessClass: cmpClass,
      needsDiff: cmpNeedsDiff.length,
      duplicative: cmpDup.length,
      needsDiffRows: cmpNeedsDiff,
      duplicativeRows: cmpDup,
      genericVerdicts: cmpRows.filter((r) => r.genericVerdict).map((r) => r.slug),
      weakPairSpecific: cmpRows.filter((r) => !r.pairSpecific).map((r) => r.slug),
      duplicateCanonicalPairs: duplicatePairs.map(([key, slugs]) => ({
        key,
        slugs,
      })),
      reverseConflicts,
      brokenPeerHolds: brokenHolds,
      brokenStillPublished: brokenHolds.filter((h) => h.stillPublished),
      liftCandidates: brokenHolds.filter((h) => h.bothPublished),
      liveMissingProducts: brokenPeersLive,
      sitemap404: sitemapCmp404,
    },
    alternatives: {
      publishedProducts: products.length,
      pagesWithAlts,
      ready: altReady.length,
      indexable: altIndexable.length,
      notReadyButCounted: altRows.filter((r) => !r.ready).length,
      syncTemplateHits: syncTemplateHits,
      uniquenessHolds: ALTERNATIVES_UNIQUENESS_HOLD_SLUGS.size,
      byUniquenessClass: altClass,
      needsDiff: altNeedsDiff.length,
      duplicative: altDup.length,
      needsDiffRows: altNeedsDiff,
      duplicativeRows: altDup,
      indexableNotReady: altIndexableNotReady,
      indexableNoDecision: altIndexableNoDecision.map((r) => r.slug),
      genericRepeat: altRows.filter((r) => r.genericRepeat).map((r) => r.slug),
      brokenAltTargets,
      sitemap404: sitemapAlt404,
      worstPeers: [...altIndexable]
        .sort(
          (a, b) =>
            ((b as { maxSim?: number }).maxSim ?? 0) -
            ((a as { maxSim?: number }).maxSim ?? 0),
        )
        .slice(0, 20)
        .map((r) => ({
          slug: r.slug,
          peer: (r as { peer?: string }).peer,
          sim: (r as { maxSim?: number }).maxSim,
          uniqueness: (r as { uniqueness?: string }).uniqueness,
        })),
    },
  };

  writeFileSync(join(OUT, "57-cmp-alt-validation.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    comparisons: {
      total: report.comparisons.totalPublished,
      ready: report.comparisons.ready,
      indexable: report.comparisons.indexable,
      needsDiff: report.comparisons.needsDiff,
      duplicative: report.comparisons.duplicative,
      generic: report.comparisons.genericVerdicts.length,
      weakPair: report.comparisons.weakPairSpecific.length,
      reverseConflicts: report.comparisons.reverseConflicts,
      dupPairs: report.comparisons.duplicateCanonicalPairs.length,
      brokenStillPublished: report.comparisons.brokenStillPublished.length,
      liftCandidates: report.comparisons.liftCandidates.length,
      liveMissing: report.comparisons.liveMissingProducts.length,
      sitemap404: report.comparisons.sitemap404.length,
      notReady: report.comparisons.notReady,
    },
    alternatives: {
      pagesWithAlts: report.alternatives.pagesWithAlts,
      ready: report.alternatives.ready,
      indexable: report.alternatives.indexable,
      needsDiff: report.alternatives.needsDiff,
      duplicative: report.alternatives.duplicative,
      syncTemplate: report.alternatives.syncTemplateHits,
      uniquenessHolds: report.alternatives.uniquenessHolds,
      indexableNotReady: report.alternatives.indexableNotReady.length,
      indexableNoDecision: report.alternatives.indexableNoDecision.length,
      brokenTargets: report.alternatives.brokenAltTargets,
      sitemap404: report.alternatives.sitemap404.length,
      worst: report.alternatives.worstPeers.slice(0, 6),
    },
  }, null, 2));
}

main();
