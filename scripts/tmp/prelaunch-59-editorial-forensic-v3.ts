/**
 * Fix 59 — FINAL editorial forensic V3 (READ-ONLY).
 * After Fixes 53–58. Does not mutate content, holds, or eligibility.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-59-editorial-forensic-v3.ts
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  assessEditorialReadiness,
  assessReviewLaunchQuality,
  assessBestGuideLaunchQuality,
  assessComparisonLaunchQuality,
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import { isContentUniquenessReviewHeld } from "@/content/launch/content-uniqueness-holds";
import { COMPARISON_BROKEN_PEER_SLUGS } from "@/content/comparisons-p41-completion";
import { EDITORIAL_INTENT_HOLD_PATHS } from "@/content/best-guides-p46-intent-roles";
import { resolveEntityVerticalPolicy } from "@/content/launch/vertical-strategy";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { getCategoryPageConfig } from "@/lib/catalog/running-shoes";
import { isSoftGatedCategory } from "@/lib/navigation/category-href";
import { classifyBrandHubHold } from "@/lib/brand-hub/classify-hold";
import { classifyAlternativesHold } from "@/lib/product/classify-alternatives-hold";
import {
  classifyUniqueness,
  normalizeText,
  scrubEntityNames,
  textSimilarity,
  scaffoldHitCount,
} from "@/domain/content-uniqueness/text";
import { isAlternativeType } from "@/domain/relationships/types";
import {
  getAllProductRelationships,
  getAlternativesForProduct,
  getBestGuides,
  getBrandById,
  getBrands,
  getBuyingGuides,
  getCategories,
  getComparisons,
  getProductById,
  getProducts,
  getReviews,
  getSportById,
} from "@/repositories";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";
import { isBlockedEvidenceReview } from "@/content/launch/blocked-evidence-reviews";
import { getAlternativesPageData } from "@/lib/product/get-alternatives-page-data";

const PROD = { isDev: false as const, now: new Date("2026-09-10T08:00:00.000Z") };
const OUT_DIR = join(process.cwd(), "docs/prelaunch");
const DATA_DIR = join(OUT_DIR, "data", "v3");
const BROKEN_CMP = new Set<string>(COMPARISON_BROKEN_PEER_SLUGS);

const FIRST_HAND =
  /\b(we tested|our test|after \d+\s*km|during our testing|we measured|personally tested|I ran|I wore)\b/i;
const DISCLOSE =
  /not personally|research|editorial desk|Expert Research|we have not personally/i;

type UrlRow = {
  path: string;
  type: string;
  sport: string;
  status: string;
  ready: string;
  indexable: string;
  quality: string;
  uniqueness: string;
  notes: string;
};

type IssueRow = {
  severity: string;
  area: string;
  path: string;
  code: string;
  detail: string;
};

const urlRows: UrlRow[] = [];
const issues: IssueRow[] = [];

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function toCsv(headers: string[], rows: Record<string, string>[]): string {
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(headers.map((h) => csvEscape(r[h] ?? "")).join(","));
  }
  return lines.join("\n") + "\n";
}

function brandName(brandId?: string): string {
  if (!brandId) return "";
  return getBrandById(brandId, PROD)?.name ?? "";
}

function reviewText(review: ReturnType<typeof getReviews>[0]): string {
  const product = getProductById(review.productId, PROD);
  const brand = product ? getBrandById(product.brandId, PROD) : undefined;
  const r = product
    ? enrichReviewForPage(review, product, { brand })
    : review;
  return [
    r.summary,
    r.verdict,
    r.bottomLine,
    r.testingContext,
    ...(r.pros ?? []),
    ...(r.cons ?? []),
    ...(r.whoShouldBuy ?? []),
    ...(r.whoShouldAvoid ?? []),
    ...(r.sections ?? []).map((s) => `${s.heading}\n${s.body}`),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function clusterClass(
  items: { slug: string; text: string }[],
): Map<string, { cls: string; max: number; peer: string }> {
  const out = new Map<string, { cls: string; max: number; peer: string }>();
  for (let i = 0; i < items.length; i++) {
    let max = 0;
    let peer = "";
    for (let j = 0; j < items.length; j++) {
      if (i === j) continue;
      const s = textSimilarity(items[i]!.text, items[j]!.text);
      if (s > max) {
        max = s;
        peer = items[j]!.slug;
      }
    }
    const cls = classifyUniqueness({
      maxPeerSimilarity: max,
      scaffoldHits: scaffoldHitCount(items[i]!.text),
      uniqueSignalRatio: 0.5,
    });
    out.set(items[i]!.slug, { cls, max, peer });
  }
  return out;
}

function main() {
  console.error("p59: forensic V3 start");

  const reviewStats = {
    total: 0,
    READY: 0,
    DUPLICATIVE: 0,
    NEEDS_DIFF: 0,
    NEEDS_RESEARCH: 0,
    BLOCKED: 0,
    INDEXABLE: 0,
    LAUNCH_READY_quality: 0,
    NMW_quality: 0,
    THIN_quality: 0,
    fakeFirstHand: 0,
    indexableDuplicative: 0,
    indexableNeedsDiff: 0,
    uniquenessHold: 0,
    blockedEvidence: 0,
    missingProduct: 0,
  };

  type RevCluster = {
    slug: string;
    text: string;
    names: string[];
    categoryId: string;
    indexable: boolean;
  };
  const revClusterItems: RevCluster[] = [];

  for (const review of getReviews(PROD)) {
    reviewStats.total++;
    const product = getProductById(review.productId, PROD);
    if (!product) reviewStats.missingProduct++;
    const sport = resolveEntityVerticalPolicy(product?.sportIds ?? []).slug;
    const quality = assessReviewLaunchQuality(review, PROD);
    const editorial = assessEditorialReadiness(
      { kind: "review", entity: review },
      PROD,
    );
    const elig = getLaunchEligibility({ kind: "review", entity: review }, PROD);
    const indexable = isIndexableEligibility(elig);
    const held = isContentUniquenessReviewHeld(review.slug);

    if (held) reviewStats.uniquenessHold++;
    if (isBlockedEvidenceReview(review.slug)) reviewStats.blockedEvidence++;

    let uniquenessLabel = "OK";
    if (quality.quality === "DUPLICATIVE" || held) {
      uniquenessLabel = "DUPLICATIVE";
      reviewStats.DUPLICATIVE++;
    }

    if (editorial.ready) reviewStats.READY++;
    if (indexable) reviewStats.INDEXABLE++;
    if (quality.quality === "LAUNCH_READY") reviewStats.LAUNCH_READY_quality++;
    if (quality.quality === "NEEDS_MINOR_WORK") reviewStats.NMW_quality++;
    if (quality.quality === "THIN") {
      reviewStats.THIN_quality++;
      reviewStats.NEEDS_RESEARCH++;
    }
    if (quality.quality === "BLOCKED") reviewStats.BLOCKED++;

    const text = reviewText(review);
    const hasFh = FIRST_HAND.test(text);
    const disclosed = DISCLOSE.test(
      `${review.testingContext ?? ""} ${review.editorialDisclosure ?? ""} ${text.slice(0, 500)}`,
    );
    if (
      quality.reasons.includes("FIRST_HAND_CLAIM_WITHOUT_PERSONAL_TEST_EVIDENCE") ||
      (hasFh && !disclosed && !(review.evidenceIds?.length))
    ) {
      reviewStats.fakeFirstHand++;
      issues.push({
        severity: "critical",
        area: "first-hand",
        path: `/reviews/${review.slug}`,
        code: "unsupported_first_hand",
        detail: "First-hand claim without personal-test evidence",
      });
    }

    const names = [
      product?.name,
      product?.fullName,
      brandName(product?.brandId),
    ].filter(Boolean) as string[];

    revClusterItems.push({
      slug: review.slug,
      text: normalizeText(scrubEntityNames(text, names)),
      names,
      categoryId: product?.categoryId ?? "unknown",
      indexable,
    });

    let workState = editorial.workState;
    if (uniquenessLabel === "DUPLICATIVE") workState = "NEEDS_UNIQUE_REWRITE";
    else if (quality.quality === "THIN") workState = "NEEDS_RESEARCH";
    else if (quality.quality === "BLOCKED") workState = "BLOCKED_INTENTIONALLY";

    urlRows.push({
      path: `/reviews/${review.slug}`,
      type: "review",
      sport,
      status: workState,
      ready: editorial.ready ? "yes" : "no",
      indexable: indexable ? "yes" : "no",
      quality: quality.quality,
      uniqueness: uniquenessLabel,
      notes: editorial.gaps.slice(0, 3).join("|"),
    });

    if (indexable && uniquenessLabel === "DUPLICATIVE") {
      reviewStats.indexableDuplicative++;
      issues.push({
        severity: "critical",
        area: "review",
        path: `/reviews/${review.slug}`,
        code: "indexable_duplicative",
        detail: "INDEXABLE review still classified DUPLICATIVE",
      });
    }
  }

  const byCat = new Map<string, RevCluster[]>();
  for (const it of revClusterItems) {
    const list = byCat.get(it.categoryId) ?? [];
    list.push(it);
    byCat.set(it.categoryId, list);
  }
  const topClusters: { a: string; b: string; score: number; categoryId: string }[] =
    [];
  for (const [categoryId, items] of byCat) {
    for (let i = 0; i < items.length; i++) {
      let max = 0;
      let peer = "";
      for (let j = 0; j < items.length; j++) {
        if (i === j) continue;
        const s = textSimilarity(items[i]!.text, items[j]!.text);
        if (s > max) {
          max = s;
          peer = items[j]!.slug;
        }
      }
      const scaffold = scaffoldHitCount(items[i]!.text);
      const cls = classifyUniqueness({
        maxPeerSimilarity: max,
        scaffoldHits: scaffold,
        uniqueSignalRatio: 0.5,
      });
      if (max >= 0.55 && peer) {
        topClusters.push({
          a: items[i]!.slug,
          b: peer,
          score: Number(max.toFixed(3)),
          categoryId,
        });
      }
      if (cls === "NEEDS_DIFFERENTIATION" || cls === "DUPLICATIVE") {
        const path = `/reviews/${items[i]!.slug}`;
        const url = urlRows.find((u) => u.path === path);
        const alreadyDup = url?.uniqueness === "DUPLICATIVE";
        if (cls === "NEEDS_DIFFERENTIATION") reviewStats.NEEDS_DIFF++;
        if (cls === "DUPLICATIVE" && !alreadyDup) {
          if (url) url.uniqueness = "DUPLICATIVE";
          reviewStats.DUPLICATIVE++;
        }
        if (cls === "NEEDS_DIFFERENTIATION" && url && url.uniqueness === "OK") {
          url.uniqueness = "NEEDS_DIFF";
        }
        if (url?.indexable === "yes") {
          if (cls === "DUPLICATIVE" && !alreadyDup) {
            reviewStats.indexableDuplicative++;
            issues.push({
              severity: "critical",
              area: "review",
              path,
              code: "indexable_duplicative",
              detail: `Peer similarity ${max.toFixed(3)} vs ${peer}`,
            });
          } else if (cls === "NEEDS_DIFFERENTIATION") {
            reviewStats.indexableNeedsDiff++;
            issues.push({
              severity: "major",
              area: "review",
              path,
              code: "indexable_needs_diff",
              detail: `Peer similarity ${max.toFixed(3)} vs ${peer}`,
            });
          }
        }
      }
    }
  }
  topClusters.sort((a, b) => b.score - a.score);
  const uniqueClusters = [];
  const seenPair = new Set<string>();
  for (const c of topClusters) {
    const key = [c.a, c.b].sort().join("|");
    if (seenPair.has(key)) continue;
    seenPair.add(key);
    uniqueClusters.push(c);
    if (uniqueClusters.length >= 25) break;
  }

  console.error("p59: reviews done", reviewStats);

  const bestStats = {
    total: 0,
    READY: 0,
    LAUNCH_READY: 0,
    NMW: 0,
    THIN: 0,
    BLOCKED: 0,
    INDEXABLE: 0,
    brokenRecs: 0,
  };
  for (const guide of getBestGuides(PROD)) {
    bestStats.total++;
    const q = assessBestGuideLaunchQuality(guide, PROD);
    const editorial = assessEditorialReadiness(
      { kind: "best-guide", entity: guide },
      PROD,
    );
    const elig = getLaunchEligibility(
      { kind: "best-guide", entity: guide },
      PROD,
    );
    const indexable = isIndexableEligibility(elig);
    const sport = resolveEntityVerticalPolicy(
      guide.sportId ? [guide.sportId] : [],
    ).slug;

    const missingRecs = (guide.recommendations ?? []).filter(
      (r) => !getProductById(r.productId, PROD),
    );
    if (missingRecs.length) {
      bestStats.brokenRecs += missingRecs.length;
      issues.push({
        severity: "critical",
        area: "relationships",
        path: `/best/${guide.slug}`,
        code: "broken_best_product",
        detail: missingRecs.map((r) => r.productId).join("|"),
      });
    }

    if (q.quality === "LAUNCH_READY") bestStats.LAUNCH_READY++;
    if (q.quality === "NEEDS_MINOR_WORK") bestStats.NMW++;
    if (q.quality === "THIN") bestStats.THIN++;
    if (q.quality === "BLOCKED") bestStats.BLOCKED++;
    if (editorial.ready) bestStats.READY++;
    if (indexable) bestStats.INDEXABLE++;

    urlRows.push({
      path: `/best/${guide.slug}`,
      type: "best",
      sport,
      status: editorial.workState,
      ready: editorial.ready ? "yes" : "no",
      indexable: indexable ? "yes" : "no",
      quality: q.quality,
      uniqueness: EDITORIAL_INTENT_HOLD_PATHS.has(`/best/${guide.slug}`)
        ? "INTENT_HOLD"
        : "OK",
      notes: q.reasons.slice(0, 3).join("|"),
    });
  }

  console.error("p59: best done", bestStats);

  const guideStats = {
    total: 0,
    READY: 0,
    COMPLETE: 0,
    uniquenessIssues: 0,
    intentConflicts: 0,
    INDEXABLE: 0,
    unfinished: 0,
    brokenProducts: 0,
  };
  const guideItems: { slug: string; text: string }[] = [];
  for (const guide of getBuyingGuides(PROD)) {
    guideStats.total++;
    const q = assessGuideQuality(guide);
    const editorial = assessEditorialReadiness(
      { kind: "buying-guide", entity: guide },
      PROD,
    );
    const elig = getLaunchEligibility(
      { kind: "buying-guide", entity: guide },
      PROD,
    );
    const indexable = isIndexableEligibility(elig);
    const sport = resolveEntityVerticalPolicy(
      guide.sportId ? [guide.sportId] : [],
    ).slug;
    const path = `/guides/${guide.slug}`;
    const intentHold = EDITORIAL_INTENT_HOLD_PATHS.has(path);

    if (q.status === "complete") guideStats.COMPLETE++;
    else guideStats.unfinished++;
    if (intentHold) {
      guideStats.intentConflicts++;
      issues.push({
        severity: "major",
        area: "guide",
        path,
        code: "intent_hold",
        detail: "EDITORIAL_INTENT_HOLD_PATHS",
      });
    }
    if (editorial.ready) guideStats.READY++;
    if (indexable) guideStats.INDEXABLE++;

    const missing = (guide.relatedProductIds ?? []).filter(
      (id) => !getProductById(id, PROD),
    );
    if (missing.length) {
      guideStats.brokenProducts += missing.length;
      issues.push({
        severity: "critical",
        area: "relationships",
        path,
        code: "broken_guide_product",
        detail: missing.join("|"),
      });
    }

    const blob = [
      guide.quickAnswer,
      ...guide.sections.map((s) => s.body),
    ]
      .filter(Boolean)
      .join("\n");
    guideItems.push({
      slug: guide.slug,
      text: normalizeText(scrubEntityNames(blob, [])),
    });

    urlRows.push({
      path,
      type: "guide",
      sport,
      status: editorial.workState,
      ready: editorial.ready ? "yes" : "no",
      indexable: indexable ? "yes" : "no",
      quality: q.status,
      uniqueness: intentHold ? "INTENT_HOLD" : "OK",
      notes: `decision=${q.decisionCompleteness}`,
    });
  }

  const guideCluster = clusterClass(guideItems);
  for (const [slug, row] of guideCluster) {
    if (row.cls === "NEEDS_DIFFERENTIATION" || row.cls === "DUPLICATIVE") {
      guideStats.uniquenessIssues++;
      const path = `/guides/${slug}`;
      const url = urlRows.find((u) => u.path === path);
      if (url && url.uniqueness === "OK") url.uniqueness = row.cls;
      issues.push({
        severity: "major",
        area: "guide",
        path,
        code: "guide_uniqueness",
        detail: `${row.cls} sim=${row.max.toFixed(3)} vs ${row.peer}`,
      });
    }
  }

  console.error("p59: guides done", guideStats);

  const cmpStats = {
    total: 0,
    READY: 0,
    DUPLICATIVE: 0,
    NEEDS_DIFF: 0,
    brokenRefs: 0,
    INDEXABLE: 0,
    MEANINGFUL: 0,
    THIN: 0,
    indexableNeedsDiff: 0,
    indexableDuplicative: 0,
    indexableBroken: 0,
  };
  const cmpItems: { slug: string; text: string; categoryId: string }[] = [];
  for (const comparison of getComparisons(PROD)) {
    cmpStats.total++;
    const q = assessComparisonLaunchQuality(comparison, PROD);
    const editorial = assessEditorialReadiness(
      { kind: "comparison", entity: comparison },
      PROD,
    );
    const elig = getLaunchEligibility(
      { kind: "comparison", entity: comparison },
      PROD,
    );
    const indexable = isIndexableEligibility(elig);
    const products = comparison.productIds.map((id) =>
      getProductById(id, PROD),
    );
    const missing = products.filter((p) => !p).length;
    const sportIds = [
      ...new Set(products.filter(Boolean).flatMap((p) => p!.sportIds)),
    ];
    const sport = resolveEntityVerticalPolicy(sportIds).slug;
    const broken =
      BROKEN_CMP.has(comparison.slug) ||
      missing > 0 ||
      comparison.productIds.length < 2;

    if (broken) {
      cmpStats.brokenRefs++;
      if (indexable) cmpStats.indexableBroken++;
      issues.push({
        severity: indexable ? "critical" : "major",
        area: "comparison",
        path: `/compare/${comparison.slug}`,
        code: "broken_refs",
        detail: missing
          ? `missing_products=${missing}`
          : BROKEN_CMP.has(comparison.slug)
            ? "broken_peer_slug_hold"
            : "incomplete_pair",
      });
    }
    if (q.meaningful) cmpStats.MEANINGFUL++;
    if (q.quality === "THIN") cmpStats.THIN++;
    if (editorial.ready) cmpStats.READY++;
    if (indexable) cmpStats.INDEXABLE++;

    const text = normalizeText(
      scrubEntityNames(
        `${comparison.summary ?? ""} ${comparison.verdict ?? ""} ${(comparison.keyDifferences ?? []).join(" ")}`,
        products.filter(Boolean).flatMap((p) => [p!.name, p!.fullName ?? ""]),
      ),
    );
    cmpItems.push({
      slug: comparison.slug,
      text,
      categoryId: comparison.categoryId ?? "unknown",
    });

    urlRows.push({
      path: `/compare/${comparison.slug}`,
      type: "comparison",
      sport,
      status: editorial.workState,
      ready: editorial.ready ? "yes" : "no",
      indexable: indexable ? "yes" : "no",
      quality: q.quality,
      uniqueness: broken ? "BROKEN" : "pending",
      notes: editorial.gaps.slice(0, 2).join("|"),
    });
  }

  const cmpByCat = new Map<string, typeof cmpItems>();
  for (const it of cmpItems) {
    const list = cmpByCat.get(it.categoryId) ?? [];
    list.push(it);
    cmpByCat.set(it.categoryId, list);
  }
  for (const items of cmpByCat.values()) {
    for (let i = 0; i < items.length; i++) {
      let max = 0;
      let peer = "";
      for (let j = 0; j < items.length; j++) {
        if (i === j) continue;
        const s = textSimilarity(items[i]!.text, items[j]!.text);
        if (s > max) {
          max = s;
          peer = items[j]!.slug;
        }
      }
      const cls = classifyUniqueness({
        maxPeerSimilarity: max,
        scaffoldHits: 0,
        uniqueSignalRatio: 0.5,
      });
      const path = `/compare/${items[i]!.slug}`;
      const url = urlRows.find((u) => u.path === path);
      if (cls === "DUPLICATIVE") {
        cmpStats.DUPLICATIVE++;
        if (url && url.uniqueness !== "BROKEN") url.uniqueness = "DUPLICATIVE";
        if (url?.indexable === "yes") {
          cmpStats.indexableDuplicative++;
          issues.push({
            severity: "critical",
            area: "comparison",
            path,
            code: "duplicative",
            detail: `sim=${max.toFixed(3)} vs ${peer}`,
          });
        }
      } else if (cls === "NEEDS_DIFFERENTIATION") {
        cmpStats.NEEDS_DIFF++;
        if (url && url.uniqueness === "pending") url.uniqueness = "NEEDS_DIFF";
        if (url?.indexable === "yes") {
          cmpStats.indexableNeedsDiff++;
          issues.push({
            severity: "major",
            area: "comparison",
            path,
            code: "needs_diff",
            detail: `sim=${max.toFixed(3)} vs ${peer}`,
          });
        }
      } else if (url && url.uniqueness === "pending") {
        url.uniqueness = "OK";
      }
    }
  }

  console.error("p59: comparisons done", cmpStats);

  const altStats = {
    total: 0,
    READY: 0,
    DUPLICATIVE: 0,
    NEEDS_DIFF: 0,
    INDEXABLE: 0,
    thin: 0,
    HOLD_INSUFFICIENT_ALTERNATIVE_MARKET: 0,
    HOLD_DUPLICATE_INTENT: 0,
    HOLD_OBSOLETE_SOURCE: 0,
    brokenTargets: 0,
    indexableDuplicative: 0,
    indexableNeedsDiff: 0,
  };
  const rels = getAllProductRelationships();
  const altTexts: { slug: string; text: string; names: string[] }[] = [];
  const altReadySlugs = new Set<string>();
  const altIndexableSlugs = new Set<string>();

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
    altStats.total++;
    const unresolved = alts.filter((r) => !getProductById(r.targetProductId, PROD));
    altStats.brokenTargets += unresolved.length;
    if (unresolved.length) {
      issues.push({
        severity: "major",
        area: "relationships",
        path: `/products/${product.slug}/alternatives`,
        code: "broken_alt_target",
        detail: unresolved.map((r) => r.targetProductId).join("|"),
      });
    }

    const gate = canPublishAlternativesPage(product, rels);
    const editorial = assessEditorialReadiness(
      { kind: "alternatives", entity: product },
      PROD,
    );
    const elig = getLaunchEligibility(
      { kind: "alternatives", entity: product },
      PROD,
    );
    const indexable = isIndexableEligibility(elig);
    const sport = resolveEntityVerticalPolicy(product.sportIds).slug;
    if (!gate.ok) {
      const hold = classifyAlternativesHold(product, rels, getProducts(PROD));
      if (hold === "THIN_UNEXPLAINED") altStats.thin++;
      else if (hold === "HOLD_INSUFFICIENT_ALTERNATIVE_MARKET")
        altStats.HOLD_INSUFFICIENT_ALTERNATIVE_MARKET++;
      else if (hold === "HOLD_DUPLICATE_INTENT") altStats.HOLD_DUPLICATE_INTENT++;
      else if (hold === "HOLD_OBSOLETE_SOURCE") altStats.HOLD_OBSOLETE_SOURCE++;
    }
    if (editorial.ready) {
      altStats.READY++;
      altReadySlugs.add(product.slug);
    }
    if (indexable) altIndexableSlugs.add(product.slug);
    if (indexable) altStats.INDEXABLE++;

    if (indexable || editorial.ready) {
      const data = getAlternativesPageData(product.slug, PROD);
      if (data) {
        const blob = [
          data.source.intro,
          ...data.alternatives.map(
            (a) =>
              `${a.whyAlternative} ${a.betterAt.join(" ")} ${a.worseAt.join(" ")} ${a.whoShouldSwitch} ${a.whoShouldStay}`,
          ),
        ].join("\n");
        altTexts.push({
          slug: product.slug,
          text: blob,
          names: [
            product.fullName,
            product.name,
            ...data.alternatives.flatMap((a) => [
              a.product.fullName,
              a.product.name,
            ]),
          ],
        });
      }
    }

    urlRows.push({
      path: `/products/${product.slug}/alternatives`,
      type: "alternatives",
      sport,
      status: editorial.workState,
      ready: editorial.ready ? "yes" : "no",
      indexable: indexable ? "yes" : "no",
      quality: gate.ok ? "substantive" : "thin",
      uniqueness: editorial.dimensions.uniqueness.ok ? "OK" : "HOLD",
      notes: gate.reasons.slice(0, 2).join("|"),
    });
  }

  const altScrubbed = altTexts.map((it) => ({
    slug: it.slug,
    text: normalizeText(scrubEntityNames(it.text, it.names)),
  }));
  const altCluster = clusterClass(altScrubbed);
  for (const [slug, row] of altCluster) {
    const path = `/products/${slug}/alternatives`;
    const url = urlRows.find((u) => u.path === path);
    if (row.cls === "DUPLICATIVE" || row.cls === "NEEDS_DIFFERENTIATION") {
      if (row.cls === "DUPLICATIVE") altStats.DUPLICATIVE++;
      else altStats.NEEDS_DIFF++;
      if (url && (url.uniqueness === "OK" || url.uniqueness === "HOLD")) {
        url.uniqueness = row.cls === "DUPLICATIVE" ? "DUPLICATIVE" : "NEEDS_DIFF";
      }
      if (altIndexableSlugs.has(slug)) {
        if (row.cls === "DUPLICATIVE") {
          altStats.indexableDuplicative++;
          issues.push({
            severity: "critical",
            area: "alternatives",
            path,
            code: "indexable_duplicative",
            detail: `sim=${row.max.toFixed(3)} vs ${row.peer}`,
          });
        } else {
          altStats.indexableNeedsDiff++;
          issues.push({
            severity: "major",
            area: "alternatives",
            path,
            code: "indexable_needs_diff",
            detail: `sim=${row.max.toFixed(3)} vs ${row.peer}`,
          });
        }
      }
    }
  }

  console.error("p59: alternatives done", altStats);

  const brandStats = {
    total: 0,
    READY: 0,
    HOLD_INSUFFICIENT_DEPTH: 0,
    HOLD_NO_PRODUCTS: 0,
    HOLD_DEPTH_GATE: 0,
    UNIQUENESS_HOLD: 0,
  };
  for (const brand of getBrands(PROD)) {
    brandStats.total++;
    const cls = classifyBrandHubHold(brand, PROD);
    if (cls === "READY") brandStats.READY++;
    if (cls === "HOLD_INSUFFICIENT_DEPTH") brandStats.HOLD_INSUFFICIENT_DEPTH++;
    if (cls === "HOLD_NO_PRODUCTS") brandStats.HOLD_NO_PRODUCTS++;
    if (cls === "HOLD_DEPTH_GATE") brandStats.HOLD_DEPTH_GATE++;
    if (cls === "UNIQUENESS_HOLD") brandStats.UNIQUENESS_HOLD++;
  }

  const catEditorial = { total: 0, READY: 0, notReady: [] as string[] };
  for (const c of getCategories(PROD)) {
    const sportSlug = getSportById(c.sportIds[0] ?? "")?.slug ?? "running";
    const cfg = getCategoryPageConfig(sportSlug, c.slug);
    if (!cfg) continue;
    catEditorial.total++;
    const ready = Boolean(cfg.decision) && !isSoftGatedCategory(c);
    if (ready) catEditorial.READY++;
    else catEditorial.notReady.push(c.slug);
  }

  console.error("p59: brands/cats done", brandStats, catEditorial);

  let unsupportedEvidence = 0;
  for (const review of getReviews(PROD)) {
    const elig = getLaunchEligibility({ kind: "review", entity: review }, PROD);
    if (!isIndexableEligibility(elig)) continue;
    if ((review.evidenceIds?.length ?? 0) < 1) {
      unsupportedEvidence++;
      issues.push({
        severity: "critical",
        area: "evidence",
        path: `/reviews/${review.slug}`,
        code: "indexable_missing_evidence",
        detail: "INDEXABLE review has no evidenceIds",
      });
    }
  }

  const cannibalization = {
    collisions: 0,
    unresolvedMaterial: 0,
    hardMerges: 0,
    intentHolds: EDITORIAL_INTENT_HOLD_PATHS.size,
    note: "Fix 46 audit + live EDITORIAL_INTENT_HOLD_PATHS",
  };
  const intentPath = join(
    process.cwd(),
    "docs/prelaunch/editorial/data/46-editorial-intent-audit.json",
  );
  if (existsSync(intentPath)) {
    const intent = JSON.parse(readFileSync(intentPath, "utf8")) as {
      totals?: {
        collisions?: number;
        actions?: Record<string, number>;
      };
    };
    cannibalization.collisions = intent.totals?.collisions ?? 0;
    cannibalization.hardMerges = intent.totals?.actions?.merge ?? 0;
    const actions = intent.totals?.actions ?? {};
    cannibalization.unresolvedMaterial =
      (actions.redirect ?? 0) + (actions.merge ?? 0);
  }

  const inbound = new Map<string, number>();
  function bump(to: string) {
    if (!to) return;
    inbound.set(to, (inbound.get(to) ?? 0) + 1);
  }
  const reviewByProduct = new Map<string, string>();
  for (const r of getReviews(PROD)) reviewByProduct.set(r.productId, r.slug);

  for (const p of getProducts(PROD)) {
    const revSlug = reviewByProduct.get(p.id);
    if (revSlug) {
      bump(`/reviews/${revSlug}`);
      bump(`/products/${p.slug}`);
    }
  }
  for (const g of getBestGuides(PROD)) {
    bump(`/best/${g.slug}`);
    for (const rec of g.recommendations ?? []) {
      const p = getProductById(rec.productId, PROD);
      if (p) bump(`/products/${p.slug}`);
      const revSlug = reviewByProduct.get(rec.productId);
      if (revSlug) bump(`/reviews/${revSlug}`);
    }
  }
  for (const g of getBuyingGuides(PROD)) {
    bump(`/guides/${g.slug}`);
    for (const id of g.relatedBestGuideIds ?? []) {
      const bg = getBestGuides(PROD).find((x) => x.id === id);
      if (bg) bump(`/best/${bg.slug}`);
    }
    for (const id of g.relatedProductIds ?? []) {
      const p = getProductById(id, PROD);
      if (p) bump(`/products/${p.slug}`);
    }
  }
  for (const c of getComparisons(PROD)) {
    bump(`/compare/${c.slug}`);
    for (const id of c.productIds) {
      const p = getProductById(id, PROD);
      if (p) {
        bump(`/products/${p.slug}`);
        bump(`/products/${p.slug}/alternatives`);
      }
      const revSlug = reviewByProduct.get(id);
      if (revSlug) bump(`/reviews/${revSlug}`);
    }
  }
  for (const brand of getBrands(PROD)) {
    bump(`/brands/${brand.slug}`);
  }

  const editorialOrphans = urlRows.filter((u) => {
    if (u.indexable !== "yes") return false;
    if (!["review", "best", "guide", "comparison"].includes(u.type)) {
      return false;
    }
    return (inbound.get(u.path) ?? 0) === 0;
  });
  for (const o of editorialOrphans) {
    issues.push({
      severity: "major",
      area: "links",
      path: o.path,
      code: "editorial_orphan",
      detail: "INDEXABLE editorial URL with 0 inbound graph edges",
    });
  }

  const criticalIssues = issues.filter((i) => i.severity === "critical").length;
  const majorIssues = issues.filter((i) => i.severity === "major").length;

  const goals = {
    duplicativeCompletedReviews: reviewStats.DUPLICATIVE,
    needsDiffCompletedReviews: reviewStats.NEEDS_DIFF,
    indexableDuplicativeReviews: reviewStats.indexableDuplicative,
    indexableNeedsDiffReviews: reviewStats.indexableNeedsDiff,
    thinBest: bestStats.THIN,
    unfinishedGuides: guideStats.unfinished + (guideStats.total - guideStats.READY),
    brokenComparisons: cmpStats.brokenRefs,
    editorialOrphans: editorialOrphans.length,
  };

  let editorialStatus: "READY" | "READY WITH MINOR ISSUES" | "NOT READY" =
    "READY";
  if (
    reviewStats.indexableDuplicative > 0 ||
    reviewStats.fakeFirstHand > 0 ||
    unsupportedEvidence > 0 ||
    cmpStats.indexableBroken > 0 ||
    bestStats.THIN > 0 ||
    criticalIssues > 0
  ) {
    editorialStatus = "NOT READY";
  } else if (
    reviewStats.indexableNeedsDiff > 0 ||
    cmpStats.indexableNeedsDiff > 0 ||
    altStats.indexableNeedsDiff > 0 ||
    altStats.indexableDuplicative > 0 ||
    editorialOrphans.length > 0 ||
    guideStats.unfinished > 0 ||
    guideStats.READY < guideStats.total ||
    majorIssues > 0
  ) {
    editorialStatus = "READY WITH MINOR ISSUES";
  }
  if (
    reviewStats.DUPLICATIVE === 0 &&
    reviewStats.NEEDS_DIFF === 0 &&
    bestStats.THIN === 0 &&
    guideStats.unfinished === 0 &&
    guideStats.READY === guideStats.total &&
    cmpStats.brokenRefs === 0 &&
    editorialOrphans.length === 0 &&
    reviewStats.fakeFirstHand === 0 &&
    unsupportedEvidence === 0 &&
    criticalIssues === 0
  ) {
    editorialStatus =
      majorIssues > 0 ? "READY WITH MINOR ISSUES" : "READY";
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    editorialStatus,
    readOnly: true,
    afterFixes: "53-58",
    reviews: reviewStats,
    best: bestStats,
    guides: guideStats,
    comparisons: cmpStats,
    alternatives: altStats,
    brands: brandStats,
    categoryEditorial: catEditorial,
    firstHandUnsupported: reviewStats.fakeFirstHand,
    evidenceUnsupportedOnIndexable: unsupportedEvidence,
    blockedEvidenceReviews: reviewStats.blockedEvidence,
    cannibalization,
    editorialOrphans: editorialOrphans.length,
    orphanSample: editorialOrphans.slice(0, 20).map((o) => o.path),
    topSimilarityClusters: uniqueClusters,
    issueCounts: {
      critical: criticalIssues,
      major: majorIssues,
      total: issues.length,
    },
    goals,
  };

  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(join(DATA_DIR, "FINAL-EDITORIAL-AUDIT.json"), JSON.stringify(summary, null, 2));
  writeFileSync(
    join(DATA_DIR, "FINAL-EDITORIAL-ISSUES.csv"),
    toCsv(
      ["severity", "area", "path", "code", "detail"],
      issues.map((i) => ({ ...i })),
    ),
  );
  writeFileSync(
    join(DATA_DIR, "FINAL-EDITORIAL-URLS.csv"),
    toCsv(
      [
        "path",
        "type",
        "sport",
        "status",
        "ready",
        "indexable",
        "quality",
        "uniqueness",
        "notes",
      ],
      urlRows,
    ),
  );

  console.log(JSON.stringify(summary, null, 2));
}

main();
