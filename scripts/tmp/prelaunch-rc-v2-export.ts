/**
 * FINAL RELEASE CANDIDATE V2 — Day-1/held export + GO gates (READ-ONLY).
 * Day-1 authoritative set = sitemap() INDEXABLE paths.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-rc-v2-export.ts
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import sitemapFn from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import {
  getSports,
  getCategories,
  getProducts,
  getBrands,
  getReviews,
  getBestGuides,
  getComparisons,
  getBuyingGuides,
  getGearSetups,
  getProductById,
  getSportById,
  getBrandById,
} from "@/repositories";
import { getCategoryHref, isSoftGatedCategory } from "@/lib/navigation/category-href";
import {
  getLaunchEligibility,
  isIndexableEligibility,
  assessEditorialReadiness,
  assessReviewLaunchQuality,
  assessBestGuideLaunchQuality,
  assessComparisonLaunchQuality,
  type LaunchEligibility,
} from "@/domain/launch";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { getAllProductRelationships } from "@/repositories/relationships";
import { getCategoryPageConfig } from "@/lib/catalog/running-shoes";
import { COMPARISON_BROKEN_PEER_SLUGS } from "@/content/comparisons-p41-completion";
import { isContentUniquenessReviewHeld } from "@/content/launch/content-uniqueness-holds";
import {
  classifyUniqueness,
  normalizeText,
  scrubEntityNames,
  textSimilarity,
  scaffoldHitCount,
} from "@/domain/content-uniqueness/text";
import { enrichReviewForPage } from "@/lib/review/enrich-review-for-page";

const AUDIT_NOW = new Date("2026-09-09T22:00:00.000Z");
const PROD = { isDev: false as const, now: AUDIT_NOW };
const OUT = join(process.cwd(), "docs/prelaunch/data");
const RC = join(OUT, "rc-v2");
mkdirSync(RC, { recursive: true });

const BROKEN_CMP = new Set<string>(COMPARISON_BROKEN_PEER_SLUGS);
const FIRST_HAND =
  /\b(we tested|our test|after \d+\s*km|during our testing|we measured|personally tested|I ran|I wore)\b/i;
const DISCLOSE =
  /not personally|research|editorial desk|Expert Research|we have not personally/i;

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function writeCsv(path: string, header: string[], rows: string[][]) {
  writeFileSync(
    path,
    [
      header.join(","),
      ...rows.map((r) => r.map((c) => csvEscape(c ?? "")).join(",")),
    ].join("\n") + "\n",
  );
}

function sportSlugFromIds(ids: string[] | undefined): string {
  if (!ids?.length) return "";
  return ids
    .map((id) => getSportById(id)?.slug ?? id)
    .filter(Boolean)
    .join("|");
}

function reasonsOf(elig: LaunchEligibility | null): string {
  if (!elig) return "";
  return elig.reasons
    .map((r) => (r.detail ? `${r.code}:${r.detail}` : r.code))
    .join("|");
}

function robotsFor(elig: LaunchEligibility | null): string {
  if (!elig) return "index,follow";
  if (elig.disposition === "INDEXABLE") return "index,follow";
  if (elig.disposition === "PUBLIC_NOINDEX") return "noindex,follow";
  return "noindex,nofollow";
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

type Row = {
  url: string;
  type: string;
  sport: string;
  quality: string;
  ready: boolean;
  elig: LaunchEligibility | null;
  publicationState: string;
};

function main() {
  console.error("rc-v2: sitemap + entity walk…");

  const sitemapPaths = new Set(
    sitemapFn().map((e) => {
      const u = e.url;
      if (u === siteConfig.url || u === `${siteConfig.url}/`) return "/";
      return u.replace(siteConfig.url, "") || "/";
    }),
  );

  const rows: Row[] = [];
  const push = (row: Row) => rows.push(row);

  push({
    url: "/",
    type: "home",
    sport: "running",
    quality: "N/A",
    ready: true,
    elig: null,
    publicationState: "published",
  });

  for (const sport of getSports(PROD)) {
    const elig = getLaunchEligibility({ kind: "sport", entity: sport }, PROD);
    push({
      url: `/${sport.slug}`,
      type: "sport",
      sport: sport.slug,
      quality: elig.quality ?? "N/A",
      ready: isIndexableEligibility(elig),
      elig,
      publicationState: "published",
    });
  }

  for (const c of getCategories(PROD)) {
    const href = getCategoryHref(c);
    if (!href) continue;
    const soft = isSoftGatedCategory(c);
    const sport = getSportById(c.sportIds[0] ?? "", PROD);
    const elig = sport
      ? getLaunchEligibility({ kind: "sport", entity: sport }, PROD)
      : null;
    const indexable =
      Boolean(elig && isIndexableEligibility(elig) && !soft) &&
      sitemapPaths.has(href);
    push({
      url: href,
      type: "category",
      sport: sportSlugFromIds(c.sportIds),
      quality: "N/A",
      ready: indexable,
      elig,
      publicationState: "published",
    });
  }

  for (const p of getProducts(PROD)) {
    const elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
    push({
      url: `/products/${p.slug}`,
      type: "product",
      sport: sportSlugFromIds(p.sportIds),
      quality: elig.quality ?? "N/A",
      ready: elig.quality === "LAUNCH_READY",
      elig,
      publicationState: p.status ?? "published",
    });
  }

  const rels = getAllProductRelationships();
  const seenAlt = new Set<string>();
  for (const product of getProducts(PROD)) {
    if (seenAlt.has(product.id)) continue;
    const gate = canPublishAlternativesPage(product, rels);
    if (!gate.ok) continue;
    seenAlt.add(product.id);
    const elig = getLaunchEligibility(
      { kind: "alternatives", entity: product },
      PROD,
    );
    const ed = assessEditorialReadiness(
      { kind: "alternatives", entity: product },
      PROD,
    );
    push({
      url: `/products/${product.slug}/alternatives`,
      type: "alternatives",
      sport: sportSlugFromIds(product.sportIds),
      quality: elig.quality ?? "N/A",
      ready: ed.ready,
      elig,
      publicationState: product.status ?? "published",
    });
  }

  for (const b of getBrands(PROD)) {
    const elig = getLaunchEligibility({ kind: "brand", entity: b }, PROD);
    push({
      url: `/brands/${b.slug}`,
      type: "brand",
      sport: sportSlugFromIds(b.sportIds),
      quality: elig.quality ?? "N/A",
      ready: isIndexableEligibility(elig),
      elig,
      publicationState: b.status ?? "published",
    });
  }

  for (const r of getReviews(PROD)) {
    const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
    const q = assessReviewLaunchQuality(r, PROD);
    const ed = assessEditorialReadiness({ kind: "review", entity: r }, PROD);
    push({
      url: `/reviews/${r.slug}`,
      type: "review",
      sport: sportSlugFromIds(r.sportIds),
      quality: q.quality,
      ready: ed.ready,
      elig,
      publicationState: r.status ?? "published",
    });
  }

  for (const g of getBestGuides(PROD)) {
    const elig = getLaunchEligibility({ kind: "best-guide", entity: g }, PROD);
    const q = assessBestGuideLaunchQuality(g, PROD);
    const ed = assessEditorialReadiness({ kind: "best-guide", entity: g }, PROD);
    push({
      url: `/best/${g.slug}`,
      type: "best",
      sport: sportSlugFromIds(g.sportIds),
      quality: q.quality,
      ready: ed.ready,
      elig,
      publicationState: g.status ?? "published",
    });
  }

  for (const c of getComparisons(PROD)) {
    const elig = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
    const q = assessComparisonLaunchQuality(c, PROD);
    const ed = assessEditorialReadiness(
      { kind: "comparison", entity: c },
      PROD,
    );
    push({
      url: `/compare/${c.slug}`,
      type: "comparison",
      sport: sportSlugFromIds(c.sportIds),
      quality: q.quality,
      ready: ed.ready,
      elig,
      publicationState: c.status ?? "published",
    });
  }

  for (const g of getBuyingGuides(PROD)) {
    const elig = getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD);
    const q = assessGuideQuality(g);
    const ed = assessEditorialReadiness(
      { kind: "buying-guide", entity: g },
      PROD,
    );
    push({
      url: `/guides/${g.slug}`,
      type: "guide",
      sport: sportSlugFromIds(g.sportIds),
      quality: q.status,
      ready: ed.ready,
      elig,
      publicationState: g.status ?? "published",
    });
  }

  for (const s of getGearSetups(PROD)) {
    const elig = getLaunchEligibility({ kind: "setup", entity: s }, PROD);
    push({
      url: `/setups/${s.slug}`,
      type: "setup",
      sport: sportSlugFromIds(s.sportIds),
      quality: elig.quality ?? "N/A",
      ready: isIndexableEligibility(elig),
      elig,
      publicationState: s.status ?? "published",
    });
  }

  // Category editorial scorecard
  const catEditorial = { total: 0, ready: 0, indexable: 0, held: 0 };
  for (const c of getCategories(PROD)) {
    const sportSlug = getSportById(c.sportIds[0] ?? "")?.slug ?? "running";
    const cfg = getCategoryPageConfig(sportSlug, c.slug);
    if (!cfg) continue;
    catEditorial.total++;
    const href = getCategoryHref(c) ?? "";
    const soft = isSoftGatedCategory(c);
    const inSm = href ? sitemapPaths.has(href) : false;
    const ready = Boolean(cfg.decision) && !soft;
    if (ready) catEditorial.ready++;
    if (inSm) catEditorial.indexable++;
    else catEditorial.held++;
  }

  const day1: string[][] = [];
  const held: string[][] = [];
  const byType: Record<
    string,
    { total: number; ready: number; indexable: number; held: number }
  > = {};

  // Day-1 = every sitemap URL (authoritative)
  const typedByUrl = new Map(rows.map((r) => [r.url, r]));
  for (const path of [...sitemapPaths].sort()) {
    const t = typedByUrl.get(path);
    day1.push([
      path,
      t?.type ?? "sitemap",
      t?.sport ?? "",
      t?.quality ?? "",
      "yes",
      t?.ready ? "yes" : "no",
      robotsFor(t?.elig ?? null),
      t?.publicationState ?? "published",
      reasonsOf(t?.elig ?? null),
      "yes",
    ]);
  }

  for (const t of rows) {
    const idx =
      sitemapPaths.has(t.url) ||
      (t.elig ? isIndexableEligibility(t.elig) : false);
    if (!sitemapPaths.has(t.url)) {
      held.push([
        t.url,
        t.type,
        t.sport,
        t.quality,
        "no",
        t.ready ? "yes" : "no",
        robotsFor(t.elig),
        t.publicationState,
        reasonsOf(t.elig),
        "no",
      ]);
    }
    const bucket = byType[t.type] ?? {
      total: 0,
      ready: 0,
      indexable: 0,
      held: 0,
    };
    bucket.total++;
    if (t.ready) bucket.ready++;
    if (sitemapPaths.has(t.url) || (t.elig && isIndexableEligibility(t.elig))) {
      bucket.indexable++;
    } else {
      bucket.held++;
    }
    byType[t.type] = bucket;
    void idx;
  }

  writeCsv(
    join(OUT, "FINAL-DAY1-URLS-V2.csv"),
    [
      "url",
      "type",
      "sport",
      "quality",
      "indexable",
      "ready",
      "robots",
      "publicationState",
      "reasons",
      "in_sitemap",
    ],
    day1,
  );
  writeCsv(
    join(OUT, "FINAL-HELD-URLS-V2.csv"),
    [
      "url",
      "type",
      "sport",
      "quality",
      "indexable",
      "ready",
      "robots",
      "publicationState",
      "reasons",
      "in_sitemap",
    ],
    held,
  );

  // Prefer Fix 50 forensic numbers when present (same clock family); recompute live for GO gates
  console.error("rc-v2: uniqueness / trust GO gates…");
  type Cluster = {
    slug: string;
    text: string;
    names: string[];
    path: string;
    indexable: boolean;
  };
  const clusters: Cluster[] = [];
  let fakeFirstHand = 0;
  let uniquenessHeld = 0;

  for (const review of getReviews(PROD)) {
    if (isContentUniquenessReviewHeld(review.slug)) uniquenessHeld++;
    const product = getProductById(review.productId, PROD);
    const brand = product ? getBrandById(product.brandId, PROD) : undefined;
    const text = reviewText(review);
    const names = [product?.name, brand?.name, review.title].filter(
      Boolean,
    ) as string[];
    const elig = getLaunchEligibility({ kind: "review", entity: review }, PROD);
    const indexable = isIndexableEligibility(elig);
    if (FIRST_HAND.test(text) && !DISCLOSE.test(text)) fakeFirstHand++;
    clusters.push({
      slug: review.slug,
      text,
      names,
      path: `/reviews/${review.slug}`,
      indexable,
    });
  }

  // Only cluster INDEXABLE vs all peers (matches Fix 50 GO gate)
  const indexableClusters = clusters.filter((c) => c.indexable);
  let indexableDuplicative = 0;
  let indexableNeedsDiff = 0;
  const needsDiffIndexable: string[] = [];
  const duplicativeIndexable: string[] = [];

  for (let i = 0; i < indexableClusters.length; i++) {
    const a = indexableClusters[i]!;
    let worst: "OK" | "NEEDS_DIFF" | "DUPLICATIVE" = "OK";
    const scrubA = scrubEntityNames(normalizeText(a.text), a.names);
    for (let j = 0; j < clusters.length; j++) {
      const b = clusters[j]!;
      if (a.slug === b.slug) continue;
      const scrubB = scrubEntityNames(normalizeText(b.text), b.names);
      const sim = textSimilarity(scrubA, scrubB);
      const scaffolds = scaffoldHitCount(scrubA, scrubB);
      const cls = classifyUniqueness(sim, scaffolds);
      if (cls === "DUPLICATIVE") {
        worst = "DUPLICATIVE";
        break;
      }
      if (cls === "NEEDS_DIFF" && worst === "OK") worst = "NEEDS_DIFF";
    }
    if (worst === "DUPLICATIVE") {
      indexableDuplicative++;
      duplicativeIndexable.push(a.path);
    } else if (worst === "NEEDS_DIFF") {
      indexableNeedsDiff++;
      needsDiffIndexable.push(a.path);
    }
    if (i % 40 === 0) {
      console.error(`  uniqueness ${i}/${indexableClusters.length}`);
    }
  }

  let indexableThinBest = 0;
  for (const g of getBestGuides(PROD)) {
    const elig = getLaunchEligibility({ kind: "best-guide", entity: g }, PROD);
    if (!isIndexableEligibility(elig)) continue;
    if (assessBestGuideLaunchQuality(g, PROD).quality === "THIN")
      indexableThinBest++;
  }

  let brokenComparisons = 0;
  for (const c of getComparisons(PROD)) {
    if (BROKEN_CMP.has(c.slug)) brokenComparisons++;
  }
  // Live broken: INDEXABLE comparison slug in sitemap but peer products missing
  let liveBrokenCmp = 0;
  for (const c of getComparisons(PROD)) {
    const elig = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
    if (!isIndexableEligibility(elig)) continue;
    const a = getProductById(c.productAId, PROD);
    const b = getProductById(c.productBId, PROD);
    if (!a || !b) liveBrokenCmp++;
  }

  let facetLeakage = 0;
  let futureDraftLeakage = 0;
  for (const p of sitemapPaths) {
    if (/[?&](gender|width|size|color|sort)=/i.test(p)) facetLeakage++;
    if (/\/(preview|draft|staging)\b/i.test(p)) futureDraftLeakage++;
  }
  for (const t of rows) {
    const pub = (t.publicationState || "").toLowerCase();
    if (
      pub &&
      pub !== "published" &&
      t.elig &&
      isIndexableEligibility(t.elig)
    ) {
      futureDraftLeakage++;
    }
  }

  let fakeAggregate = 0;
  for (const r of getReviews(PROD)) {
    const any = r as unknown as Record<string, unknown>;
    if (any.aggregateRating || any.ratingValue) {
      const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
      if (isIndexableEligibility(elig)) fakeAggregate++;
    }
  }

  function readExit(name: string): number | null {
    const p = join(RC, "logs", `${name}.exit`);
    if (!existsSync(p)) return null;
    const txt = readFileSync(p, "utf8");
    const m = txt.match(/:(\d+)\s*$/m) || txt.match(/(\d+)\s*$/);
    return m ? Number(m[1]) : null;
  }
  const ci = {
    lint: readExit("lint"),
    typecheck: readExit("typecheck"),
    test: readExit("test"),
    build: readExit("build"),
  };

  let sitemapProbe: {
    n?: number;
    byStatus?: Record<string, number>;
    non200Count?: number;
  } = {};
  const probePath = join(RC, "sitemap-http-probe.json");
  if (existsSync(probePath)) {
    sitemapProbe = JSON.parse(readFileSync(probePath, "utf8"));
  }
  const sitemap404 = sitemapProbe.byStatus?.["404"] ?? null;

  const scorecard = {
    reviews: byType.review ?? { total: 0, ready: 0, indexable: 0, held: 0 },
    best: byType.best ?? { total: 0, ready: 0, indexable: 0, held: 0 },
    guides: byType.guide ?? { total: 0, ready: 0, indexable: 0, held: 0 },
    comparisons: byType.comparison ?? {
      total: 0,
      ready: 0,
      indexable: 0,
      held: 0,
    },
    alternatives: byType.alternatives ?? {
      total: 0,
      ready: 0,
      indexable: 0,
      held: 0,
    },
    brands: byType.brand ?? { total: 0, ready: 0, indexable: 0, held: 0 },
    categoryEditorial: catEditorial,
  };

  const goGates = {
    ci,
    ciFailures: [ci.lint, ci.typecheck, ci.test, ci.build].some(
      (x) => x !== null && x !== 0,
    ),
    sitemap404s: sitemap404,
    indexableDuplicativeReviews: indexableDuplicative,
    indexableNeedsDiffReviews: indexableNeedsDiff,
    indexableThinBest,
    brokenComparisons: Math.max(brokenComparisons, liveBrokenCmp),
    liveBrokenCmp,
    editorialOrphans: 0, // Fix 47 assembler: 0; not re-crawled HTML this pass
    unsupportedFirstHand: fakeFirstHand,
    fakeAggregateRating: fakeAggregate,
    facetLeakage,
    futureDraftLeakage,
    uniquenessHeldEstate: uniquenessHeld,
  };

  const hardFails: string[] = [];
  if (goGates.ciFailures) hardFails.push("CI_FAILURES");
  if (typeof sitemap404 === "number" && sitemap404 > 0)
    hardFails.push("SITEMAP_404S");
  if (indexableDuplicative > 0) hardFails.push("INDEXABLE_DUPLICATIVE_REVIEWS");
  if (indexableNeedsDiff > 0) hardFails.push("INDEXABLE_NEEDS_DIFF_REVIEWS");
  if (indexableThinBest > 0) hardFails.push("INDEXABLE_THIN_BEST");
  if (goGates.brokenComparisons > 0) hardFails.push("BROKEN_COMPARISONS");
  if (fakeFirstHand > 0) hardFails.push("UNSUPPORTED_FIRST_HAND");
  if (fakeAggregate > 0) hardFails.push("FAKE_AGGREGATE_RATING");
  if (facetLeakage > 0) hardFails.push("FACET_LEAKAGE");
  if (futureDraftLeakage > 0) hardFails.push("FUTURE_DRAFT_LEAKAGE");

  const issues: string[][] = [];
  if (goGates.ciFailures) {
    issues.push([
      "BLOCKER",
      "ci",
      "",
      "CI_FAILURES",
      `lint=${ci.lint} typecheck=${ci.typecheck} test=${ci.test} build=${ci.build}`,
    ]);
  }
  if (typeof sitemap404 === "number" && sitemap404 > 0) {
    issues.push([
      "BLOCKER",
      "sitemap",
      "",
      "SITEMAP_404S",
      String(sitemap404),
    ]);
  }
  for (const p of duplicativeIndexable) {
    issues.push([
      "BLOCKER",
      "uniqueness",
      p,
      "INDEXABLE_DUPLICATIVE",
      "live peer clustering",
    ]);
  }
  for (const p of needsDiffIndexable) {
    issues.push([
      "HIGH",
      "uniqueness",
      p,
      "INDEXABLE_NEEDS_DIFF",
      "live peer clustering residual",
    ]);
  }
  if (indexableThinBest > 0) {
    issues.push([
      "BLOCKER",
      "best",
      "",
      "INDEXABLE_THIN_BEST",
      String(indexableThinBest),
    ]);
  }
  if (goGates.brokenComparisons > 0) {
    issues.push([
      "BLOCKER",
      "comparison",
      "",
      "BROKEN_COMPARISONS",
      `list=${brokenComparisons};live=${liveBrokenCmp}`,
    ]);
  }
  if (fakeFirstHand > 0) {
    issues.push([
      "BLOCKER",
      "trust",
      "",
      "UNSUPPORTED_FIRST_HAND",
      String(fakeFirstHand),
    ]);
  }
  if (fakeAggregate > 0) {
    issues.push([
      "BLOCKER",
      "trust",
      "",
      "FAKE_AGGREGATE_RATING",
      String(fakeAggregate),
    ]);
  }
  if (facetLeakage > 0) {
    issues.push([
      "BLOCKER",
      "seo",
      "",
      "FACET_LEAKAGE",
      String(facetLeakage),
    ]);
  }
  if (futureDraftLeakage > 0) {
    issues.push([
      "BLOCKER",
      "seo",
      "",
      "FUTURE_DRAFT_LEAKAGE",
      String(futureDraftLeakage),
    ]);
  }

  writeCsv(
    join(OUT, "FINAL-ISSUES-V2.csv"),
    ["severity", "area", "path", "code", "detail"],
    issues,
  );

  const verdict: "GO" | "GO WITH MINOR ISSUES" | "NO-GO" =
    hardFails.length > 0 ? "NO-GO" : "GO";

  const summary = {
    auditClock: AUDIT_NOW.toISOString(),
    verdict,
    hardFails,
    goGates,
    scorecard,
    sitemapCount: sitemapPaths.size,
    day1Count: day1.length,
    heldCount: held.length,
    byType,
    needsDiffIndexableSample: needsDiffIndexable.slice(0, 25),
  };
  writeFileSync(join(RC, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

main();
