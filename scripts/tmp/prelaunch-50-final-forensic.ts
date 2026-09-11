/**
 * Editorial Completion 50 — FINAL forensic audit (READ-ONLY).
 * Does not mutate holds, content, or eligibility.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-50-final-forensic.ts
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
import { canPublishGearSetup } from "@/lib/setups/can-publish-gear-setup";
import { canPublishBrandHub } from "@/lib/brand-hub/config";
import { isBrandHubIndexable } from "@/lib/seo/brand-indexability";
import { getCategoryPageConfig } from "@/lib/catalog/running-shoes";
import { isSoftGatedCategory } from "@/lib/navigation/category-href";
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
  getGearSetups,
  getProductById,
  getProducts,
  getReviews,
} from "@/repositories";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";

const PROD = { isDev: false as const, now: new Date("2026-09-09T12:00:00.000Z") };
const OUT_DIR = join(process.cwd(), "docs/prelaunch");
const DATA_DIR = join(OUT_DIR, "data");
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

function main() {
  console.error("p50: forensic start");

  // ─── 1. REVIEWS ─────────────────────────────────────────────────────────
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
    runningIndexable: 0,
  };

  type RevCluster = {
    slug: string;
    text: string;
    names: string[];
    categoryId: string;
    class?: string;
    maxPeer?: number;
    peer?: string;
  };
  const revClusterItems: RevCluster[] = [];

  for (const review of getReviews(PROD)) {
    reviewStats.total++;
    const product = getProductById(review.productId, PROD);
    const sport = resolveEntityVerticalPolicy(product?.sportIds ?? []).slug;
    const quality = assessReviewLaunchQuality(review, PROD);
    const editorial = assessEditorialReadiness(
      { kind: "review", entity: review },
      PROD,
    );
    const elig = getLaunchEligibility({ kind: "review", entity: review }, PROD);
    const indexable = isIndexableEligibility(elig);
    const held = isContentUniquenessReviewHeld(review.slug);

    let uniquenessLabel = "OK";
    if (quality.quality === "DUPLICATIVE" || held) {
      uniquenessLabel = "DUPLICATIVE";
      reviewStats.DUPLICATIVE++;
    }

    if (editorial.ready) reviewStats.READY++;
    if (indexable) {
      reviewStats.INDEXABLE++;
      if (sport === "running") reviewStats.runningIndexable++;
    }
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

  // Peer uniqueness within category (reviews) — NEEDS_DIFF detection
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
      items[i]!.class = cls;
      items[i]!.maxPeer = max;
      items[i]!.peer = peer;
      if (max >= 0.55 && peer) {
        topClusters.push({
          a: items[i]!.slug,
          b: peer,
          score: Number(max.toFixed(3)),
          categoryId,
        });
      }
      if (cls === "NEEDS_DIFFERENTIATION") {
        reviewStats.NEEDS_DIFF++;
        const path = `/reviews/${items[i]!.slug}`;
        const url = urlRows.find((u) => u.path === path);
        if (url && url.uniqueness === "OK") url.uniqueness = "NEEDS_DIFF";
        if (url?.indexable === "yes") {
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

  console.error("p50: reviews done", reviewStats);

  // ─── 2. BEST ────────────────────────────────────────────────────────────
  const bestStats = {
    total: 0,
    LAUNCH_READY: 0,
    NMW: 0,
    THIN: 0,
    BLOCKED: 0,
    INDEXABLE: 0,
    READY_editorial: 0,
    runningIndexable: 0,
    indexableNmwOrThin: 0,
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

    if (q.quality === "LAUNCH_READY") bestStats.LAUNCH_READY++;
    if (q.quality === "NEEDS_MINOR_WORK") bestStats.NMW++;
    if (q.quality === "THIN") bestStats.THIN++;
    if (q.quality === "BLOCKED") bestStats.BLOCKED++;
    if (editorial.ready) bestStats.READY_editorial++;
    if (indexable) {
      bestStats.INDEXABLE++;
      if (sport === "running") bestStats.runningIndexable++;
      if (q.quality === "NEEDS_MINOR_WORK" || q.quality === "THIN") {
        bestStats.indexableNmwOrThin++;
        issues.push({
          severity: "critical",
          area: "best",
          path: `/best/${guide.slug}`,
          code: "indexable_incomplete_best",
          detail: q.quality,
        });
      }
    }

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

  // ─── 3. GUIDES ──────────────────────────────────────────────────────────
  const guideStats = {
    total: 0,
    COMPLETE: 0,
    unique: 0,
    evidenceSafe: 0,
    intentConflicts: 0,
    INDEXABLE: 0,
    READY_editorial: 0,
    thinOrResearch: 0,
  };
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
    else guideStats.thinOrResearch++;
    if (!intentHold) guideStats.unique++;
    else {
      guideStats.intentConflicts++;
      issues.push({
        severity: "major",
        area: "guide",
        path,
        code: "intent_hold",
        detail: "EDITORIAL_INTENT_HOLD_PATHS",
      });
    }
    if (editorial.dimensions.evidenceSafety.ok) guideStats.evidenceSafe++;
    if (editorial.ready) guideStats.READY_editorial++;
    if (indexable) guideStats.INDEXABLE++;

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

  // ─── 4. COMPARISONS ─────────────────────────────────────────────────────
  const cmpStats = {
    total: 0,
    unique: 0,
    NEEDS_DIFF: 0,
    brokenRefs: 0,
    INDEXABLE: 0,
    MEANINGFUL: 0,
    THIN: 0,
    READY_editorial: 0,
  };
  const cmpItems: {
    slug: string;
    text: string;
    categoryId: string;
  }[] = [];
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
      issues.push({
        severity: "critical",
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
    if (editorial.ready) cmpStats.READY_editorial++;
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

  // Comparison peer uniqueness
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
      if (cls === "NEEDS_DIFFERENTIATION" || cls === "DUPLICATIVE") {
        cmpStats.NEEDS_DIFF++;
        if (url) url.uniqueness = "NEEDS_DIFF";
        if (url?.indexable === "yes") {
          issues.push({
            severity: "major",
            area: "comparison",
            path,
            code: "needs_diff",
            detail: `sim=${max.toFixed(3)} vs ${peer}`,
          });
        }
      } else {
        cmpStats.unique++;
        if (url && url.uniqueness === "pending") url.uniqueness = "OK";
      }
    }
  }

  // ─── 5. ALTERNATIVES ────────────────────────────────────────────────────
  const altStats = {
    totalCandidates: 0,
    substantive: 0,
    thin: 0,
    READY: 0,
    INDEXABLE: 0,
  };
  const rels = getAllProductRelationships();
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
    altStats.totalCandidates++;
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
    if (gate.ok) altStats.substantive++;
    else altStats.thin++;
    if (editorial.ready) altStats.READY++;
    if (indexable) altStats.INDEXABLE++;

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

  // ─── 6. BRAND / CATEGORY / SETUP ────────────────────────────────────────
  const brandStats = { total: 0, publishable: 0, indexable: 0, shallow: 0 };
  for (const brand of getBrands(PROD)) {
    const products = getProducts(PROD).filter((p) => p.brandId === brand.id);
    if (products.length === 0) continue;
    brandStats.total++;
    const byCat = new Set(products.map((p) => p.categoryId));
    const pub = canPublishBrandHub({
      productCount: products.length,
      categoryCount: byCat.size,
      familyCount: 0,
      strengthSignalCount: products.filter((p) => (p.strengths?.length ?? 0) > 0)
        .length,
    });
    const indexable = isBrandHubIndexable(brand);
    if (pub) brandStats.publishable++;
    else brandStats.shallow++;
    if (indexable) brandStats.indexable++;
    urlRows.push({
      path: `/brands/${brand.slug}`,
      type: "brand",
      sport: "multi",
      status: pub ? "READY" : "NEEDS_RESEARCH",
      ready: pub ? "yes" : "no",
      indexable: indexable ? "yes" : "no",
      quality: pub ? "hub_ok" : "shallow",
      uniqueness: "OK",
      notes: `products=${products.length}`,
    });
  }

  const categoryStats = {
    total: 0,
    running: 0,
    softGated: 0,
    withConfig: 0,
  };
  for (const cat of getCategories(PROD)) {
    categoryStats.total++;
    const soft = isSoftGatedCategory(cat);
    if (soft) categoryStats.softGated++;
    // Categories lack sportId on entity — treat Running via path configs
    const cfg = getCategoryPageConfig("running", cat.slug);
    if (cfg) {
      categoryStats.running++;
      categoryStats.withConfig++;
    }
    urlRows.push({
      path: cat.pathSegment
        ? `/running/${cat.pathSegment}`
        : `/gear/${cat.slug}`,
      type: "category",
      sport: cfg ? "running" : "other",
      status: soft ? "SOFT_GATED" : cfg ? "READY" : "PARTIAL",
      ready: soft ? "no" : cfg ? "yes" : "partial",
      indexable: soft ? "no" : "unknown",
      quality: soft ? "soft_gated" : cfg ? "decision_config" : "default",
      uniqueness: "OK",
      notes: cat.slug,
    });
  }

  const setupStats = { total: 0, publishable: 0, indexable: 0 };
  for (const setup of getGearSetups(PROD)) {
    setupStats.total++;
    const pub = canPublishGearSetup(setup);
    const elig = getLaunchEligibility({ kind: "setup", entity: setup }, PROD);
    const indexable = isIndexableEligibility(elig);
    if (pub.ok) setupStats.publishable++;
    if (indexable) setupStats.indexable++;
    urlRows.push({
      path: `/setups/${setup.slug}`,
      type: "setup",
      sport: resolveEntityVerticalPolicy(
        setup.sportId ? [setup.sportId] : [],
      ).slug,
      status: pub.ok ? "READY" : "NEEDS_RESEARCH",
      ready: pub.ok ? "yes" : "no",
      indexable: indexable ? "yes" : "no",
      quality: pub.ok ? "publishable" : pub.reasons[0] ?? "fail",
      uniqueness: "OK",
      notes: pub.reasons.slice(0, 2).join("|"),
    });
  }

  // ─── 8. FIRST-HAND (already counted) ────────────────────────────────────
  // ─── 9. EVIDENCE — thin evidence on INDEXABLE reviews ────────────────────
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

  // ─── 10. CANNIBALIZATION — load Fix 46 audit if present ─────────────────
  const cannibalization = {
    collisions: 0,
    unresolvedMaterial: 0,
    hardMerges: 0,
    note: "from Fix 46 audit",
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
    // Material unresolved = non-KEEP actions that aren't soft-gate holds
    const actions = intent.totals?.actions ?? {};
    cannibalization.unresolvedMaterial =
      (actions.redirect ?? 0) + (actions.merge ?? 0) + (actions.hold ?? 0);
  }

  // ─── 11. ORPHANS — inbound from products / best / guides / comparisons ─
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
    const products = getProducts(PROD).filter((p) => p.brandId === brand.id);
    if (products.length === 0) continue;
    bump(`/brands/${brand.slug}`);
    for (const p of products.slice(0, 24)) {
      bump(`/products/${p.slug}`);
      const revSlug = reviewByProduct.get(p.id);
      if (revSlug) bump(`/reviews/${revSlug}`);
    }
  }

  const editorialOrphans = urlRows.filter((u) => {
    if (u.indexable !== "yes") return false;
    if (!["review", "best", "guide", "comparison", "brand"].includes(u.type)) {
      return false;
    }
    // Brands/categories are entry points when they have outbound catalog links
    if (u.type === "brand") return false;
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

  // ─── STATUS ─────────────────────────────────────────────────────────────
  const completedReviewDup = reviewStats.indexableDuplicative;
  const completedReviewNeedsDiff = reviewStats.indexableNeedsDiff;
  const completedBestBad = bestStats.indexableNmwOrThin;
  const completedCmpBroken = urlRows.filter(
    (u) =>
      u.type === "comparison" &&
      u.indexable === "yes" &&
      (u.uniqueness === "BROKEN" || u.notes.includes("broken")),
  ).length;
  const completedCmpNeedsDiff = urlRows.filter(
    (u) =>
      u.type === "comparison" &&
      u.indexable === "yes" &&
      u.uniqueness === "NEEDS_DIFF",
  ).length;

  const criticalIssues = issues.filter((i) => i.severity === "critical").length;
  const majorIssues = issues.filter((i) => i.severity === "major").length;

  let editorialStatus: "READY" | "READY WITH MINOR ISSUES" | "NOT READY" =
    "READY";
  if (
    completedReviewDup > 0 ||
    reviewStats.fakeFirstHand > 0 ||
    unsupportedEvidence > 0 ||
    completedCmpBroken > 0 ||
    completedBestBad > 0 ||
    criticalIssues > 0
  ) {
    editorialStatus = "NOT READY";
  } else if (
    completedReviewNeedsDiff > 0 ||
    completedCmpNeedsDiff > 0 ||
    majorIssues > 0 ||
    editorialOrphans.length > 0 ||
    reviewStats.DUPLICATIVE > 0 // estate still has held dups (expected)
  ) {
    // Estate still has DUPLICATIVE holds for unfinished reviews — that is expected.
    // Day-1 INDEXABLE corpus is the "completed" bar.
    if (
      completedReviewNeedsDiff > 0 ||
      completedCmpNeedsDiff > 0 ||
      editorialOrphans.length > 0 ||
      majorIssues > 5
    ) {
      editorialStatus = "READY WITH MINOR ISSUES";
    } else {
      editorialStatus = "READY";
    }
  }

  // Refine: unfinished estate DUPLICATIVE is OK if not INDEXABLE
  if (
    editorialStatus === "READY WITH MINOR ISSUES" &&
    completedReviewNeedsDiff === 0 &&
    completedCmpNeedsDiff === 0 &&
    editorialOrphans.length === 0 &&
    criticalIssues === 0
  ) {
    editorialStatus = "READY";
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    editorialStatus,
    readOnly: true,
    reviews: reviewStats,
    best: bestStats,
    guides: guideStats,
    comparisons: cmpStats,
    alternatives: altStats,
    brands: brandStats,
    categories: categoryStats,
    setups: setupStats,
    firstHandUnsupported: reviewStats.fakeFirstHand,
    evidenceUnsupportedOnIndexable: unsupportedEvidence,
    cannibalization,
    editorialOrphans: editorialOrphans.length,
    orphanSample: editorialOrphans.slice(0, 20).map((o) => o.path),
    topSimilarityClusters: uniqueClusters,
    issueCounts: {
      critical: criticalIssues,
      major: majorIssues,
      total: issues.length,
    },
    completedCorpusTargets: {
      reviewIndexableDuplicative: completedReviewDup,
      reviewIndexableNeedsDiff: completedReviewNeedsDiff,
      bestIndexableNmwOrThin: completedBestBad,
      comparisonIndexableBroken: completedCmpBroken,
      comparisonIndexableNeedsDiff: completedCmpNeedsDiff,
      firstHandUnsupported: reviewStats.fakeFirstHand,
      orphansIndexable: editorialOrphans.length,
    },
  };

  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(
    join(DATA_DIR, "FINAL-EDITORIAL-AUDIT.json"),
    JSON.stringify(summary, null, 2),
  );
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

function brandName(brandId?: string): string {
  if (!brandId) return "";
  return getBrandById(brandId, PROD)?.name ?? "";
}

main();
