/**
 * FINAL RELEASE CANDIDATE V3 — live eligibility scorecard + HELD buckets.
 * READ-ONLY. Does not change content, eligibility, or thresholds.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-rc-v3-export.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import sitemapFn from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import {
  getCategories,
  getProducts,
  getBrands,
  getReviews,
  getBestGuides,
  getComparisons,
  getBuyingGuides,
  getTools,
  getProductById,
} from "@/repositories";
import { getCategoryHref, isSoftGatedCategory } from "@/lib/navigation/category-href";
import {
  getLaunchEligibility,
  isIndexableEligibility,
  assessEditorialReadiness,
  assessProductLaunchQuality,
  assessReviewLaunchQuality,
  assessBestGuideLaunchQuality,
  assessComparisonLaunchQuality,
  type LaunchEligibility,
} from "@/domain/launch";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { getAllProductRelationships } from "@/repositories/relationships";
import { isAlternativeType } from "@/domain/relationships/types";
import { getCategoryPageConfig } from "@/lib/catalog/running-shoes";
import { COMPARISON_BROKEN_PEER_SLUGS } from "@/content/comparisons-p41-completion";
import { classifyBrandHubHold } from "@/lib/brand-hub/classify-hold";
import { classifyAlternativesHold } from "@/lib/product/classify-alternatives-hold";
import { getSportById } from "@/repositories";
import { resolveEntityVerticalPolicy } from "@/content/launch/vertical-strategy";

const AUDIT_NOW = new Date("2026-09-10T11:30:00.000Z");
const PROD = { isDev: false as const, now: AUDIT_NOW };
const OUT = join(process.cwd(), "docs/prelaunch/data");
const RC = join(OUT, "rc-v3");
mkdirSync(RC, { recursive: true });

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

function primaryReason(elig: LaunchEligibility | null): string {
  if (!elig) return "none";
  const r = elig.reasons[0];
  if (!r) return elig.disposition;
  return r.detail ? `${r.code}:${r.detail}` : r.code;
}

function bucketReason(elig: LaunchEligibility | null, extras: string[] = []): string {
  const codes = [
    ...extras,
    ...(elig?.reasons ?? []).map((r) => r.code),
  ];
  if (codes.includes("vertical_hold")) return "vertical_hold";
  if (codes.includes("soft_gated_category")) return "soft_gated_category";
  if (codes.includes("not_production_exposed")) return "draft_or_hidden";
  if (codes.includes("noindex")) return "explicit_noindex";
  if (codes.includes("quality_not_launch_ready")) return "quality_not_launch_ready";
  if (codes.includes("minor_work_held")) return "minor_work_held";
  if (codes.includes("tool_unavailable_or_hidden")) return "tool_unavailable_or_hidden";
  if (codes.includes("sport_not_live")) return "sport_not_live";
  if (codes.some((c) => /uniqueness|duplicative|needs_diff/i.test(c)))
    return "uniqueness";
  if (codes.some((c) => /thin|incomplete|blocked/i.test(c))) return "quality";
  return codes[0] ?? elig?.disposition ?? "other";
}

function bump(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}

function sportSlug(ids: string[] | undefined): string {
  if (!ids?.length) return "";
  return resolveEntityVerticalPolicy(ids).slug;
}

type Card = {
  total: number;
  ready: number;
  indexable: number;
  held: number;
  heldBuckets: Record<string, number>;
};

function emptyCard(): Card {
  return { total: 0, ready: 0, indexable: 0, held: 0, heldBuckets: {} };
}

function tally(
  card: Card,
  ready: boolean,
  indexable: boolean,
  holdKey: string,
) {
  card.total++;
  if (ready) card.ready++;
  if (indexable) card.indexable++;
  else {
    card.held++;
    bump(card.heldBuckets, holdKey);
  }
}

function main() {
  const sitemapPaths = new Set(
    sitemapFn().map((e) => {
      const u = e.url;
      if (u === siteConfig.url || u === `${siteConfig.url}/`) return "/";
      return u.replace(siteConfig.url, "") || "/";
    }),
  );

  const products = emptyCard();
  const reviews = emptyCard();
  const best = emptyCard();
  const guides = emptyCard();
  const comparisons = emptyCard();
  const alternatives = emptyCard();
  const brands = emptyCard();
  const categories = emptyCard();
  const tools = emptyCard();
  const categoryEditorial = emptyCard();

  const heldRows: string[][] = [];
  const day1Rows: string[][] = [];

  for (const p of getProducts(PROD)) {
    const elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
    const q = assessProductLaunchQuality(p, PROD);
    const indexable = isIndexableEligibility(elig);
    const ready = q.quality === "LAUNCH_READY";
    const hold = bucketReason(elig, [q.quality]);
    tally(products, ready, indexable, hold);
    const row = [
      `/products/${p.slug}`,
      "product",
      sportSlug(p.sportIds),
      q.quality,
      indexable ? "yes" : "no",
      ready ? "yes" : "no",
      p.status,
      primaryReason(elig),
      hold,
    ];
    if (indexable) day1Rows.push(row);
    else heldRows.push(row);
  }

  const rels = getAllProductRelationships();
  for (const product of getProducts(PROD)) {
    const alts = rels.filter(
      (r) =>
        r.sourceProductId === product.id &&
        r.status === "approved" &&
        isAlternativeType(r.type),
    );
    if (alts.length === 0) continue;
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
    const altHold = classifyAlternativesHold(product, rels, getProducts(PROD));
    let hold = bucketReason(elig);
    if (!indexable && altHold !== "READY") hold = altHold;
    else if (!indexable && editorial.ready) hold = "alt_category_or_vertical_hold";
    tally(alternatives, editorial.ready, indexable, hold);
    const row = [
      `/products/${product.slug}/alternatives`,
      "alternatives",
      sportSlug(product.sportIds),
      gate.ok ? "substantive" : altHold === "THIN_UNEXPLAINED" ? "thin" : altHold,
      indexable ? "yes" : "no",
      editorial.ready ? "yes" : "no",
      product.status,
      primaryReason(elig),
      hold,
    ];
    if (indexable) day1Rows.push(row);
    else heldRows.push(row);
  }

  for (const r of getReviews(PROD)) {
    const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
    const q = assessReviewLaunchQuality(r, PROD);
    const ed = assessEditorialReadiness({ kind: "review", entity: r }, PROD);
    const indexable = isIndexableEligibility(elig);
    tally(reviews, ed.ready, indexable, bucketReason(elig, [q.quality]));
    const row = [
      `/reviews/${r.slug}`,
      "review",
      sportSlug(r.sportIds),
      q.quality,
      indexable ? "yes" : "no",
      ed.ready ? "yes" : "no",
      r.status,
      primaryReason(elig),
      bucketReason(elig, [q.quality]),
    ];
    if (indexable) day1Rows.push(row);
    else heldRows.push(row);
  }

  for (const g of getBestGuides(PROD)) {
    const elig = getLaunchEligibility({ kind: "best-guide", entity: g }, PROD);
    const q = assessBestGuideLaunchQuality(g, PROD);
    const ed = assessEditorialReadiness({ kind: "best-guide", entity: g }, PROD);
    const indexable = isIndexableEligibility(elig);
    tally(best, ed.ready, indexable, bucketReason(elig, [q.quality]));
    const row = [
      `/best/${g.slug}`,
      "best",
      sportSlug(g.sportIds),
      q.quality,
      indexable ? "yes" : "no",
      ed.ready ? "yes" : "no",
      g.status,
      primaryReason(elig),
      bucketReason(elig, [q.quality]),
    ];
    if (indexable) day1Rows.push(row);
    else heldRows.push(row);
  }

  for (const g of getBuyingGuides(PROD)) {
    const elig = getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD);
    const ed = assessEditorialReadiness(
      { kind: "buying-guide", entity: g },
      PROD,
    );
    const indexable = isIndexableEligibility(elig);
    tally(guides, ed.ready, indexable, bucketReason(elig));
    const row = [
      `/guides/${g.slug}`,
      "guide",
      sportSlug(g.sportIds),
      ed.workState,
      indexable ? "yes" : "no",
      ed.ready ? "yes" : "no",
      g.status,
      primaryReason(elig),
      bucketReason(elig),
    ];
    if (indexable) day1Rows.push(row);
    else heldRows.push(row);
  }

  const brokenSet = new Set(COMPARISON_BROKEN_PEER_SLUGS);
  let indexableBrokenCmp = 0;
  let listedBroken = 0;
  for (const c of getComparisons(PROD)) {
    const elig = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
    const q = assessComparisonLaunchQuality(c, PROD);
    const ed = assessEditorialReadiness(
      { kind: "comparison", entity: c },
      PROD,
    );
    const indexable = isIndexableEligibility(elig);
    tally(comparisons, ed.ready, indexable, bucketReason(elig, [q.quality]));
    if (brokenSet.has(c.slug)) listedBroken++;
    if (indexable) {
      const missing = (c.productIds ?? []).filter((id) => !getProductById(id, PROD));
      if (missing.length) indexableBrokenCmp++;
    }
    const row = [
      `/compare/${c.slug}`,
      "comparison",
      sportSlug(c.sportIds),
      q.quality,
      indexable ? "yes" : "no",
      ed.ready ? "yes" : "no",
      c.status,
      primaryReason(elig),
      bucketReason(elig, [q.quality]),
    ];
    if (indexable) day1Rows.push(row);
    else heldRows.push(row);
  }

  const brandClass: Record<string, number> = {};
  for (const b of getBrands(PROD)) {
    const elig = getLaunchEligibility({ kind: "brand", entity: b }, PROD);
    const klass = classifyBrandHubHold(b, PROD);
    bump(brandClass, klass);
    const indexable = isIndexableEligibility(elig);
    const ready = klass === "READY";
    const hold = klass === "READY" ? bucketReason(elig) : klass;
    tally(brands, ready, indexable, hold);
    const row = [
      `/brands/${b.slug}`,
      "brand",
      sportSlug(b.sportIds),
      klass,
      indexable ? "yes" : "no",
      ready ? "yes" : "no",
      b.status,
      primaryReason(elig),
      hold,
    ];
    if (indexable) day1Rows.push(row);
    else heldRows.push(row);
  }

  for (const c of getCategories(PROD)) {
    const href = getCategoryHref(c);
    const sport = getSportById(c.sportIds[0] ?? "", PROD);
    const sportElig = sport
      ? getLaunchEligibility({ kind: "sport", entity: sport }, PROD)
      : null;
    const soft = isSoftGatedCategory(c);
    const inSm = Boolean(href && sitemapPaths.has(href));
    const cfg = getCategoryPageConfig(sport?.slug ?? "running", c.slug);
    const editorialReady = Boolean(cfg?.decision) && !soft;
    let hold = "other";
    if (!inSm) {
      if (soft) hold = "soft_gated_category";
      else if (sportElig && !isIndexableEligibility(sportElig))
        hold = "vertical_hold";
      else if (!href) hold = "no_public_href";
      else hold = "not_in_sitemap";
    }
    tally(categories, editorialReady || inSm, inSm, hold);
    const row = [
      href ?? `(no-href)/${c.slug}`,
      "category",
      sportSlug(c.sportIds),
      cfg ? "has_config" : "no_config",
      inSm ? "yes" : "no",
      editorialReady ? "yes" : "no",
      "published",
      soft ? "soft_gated" : primaryReason(sportElig),
      hold,
    ];
    if (inSm) day1Rows.push(row);
    else heldRows.push(row);
  }

  for (const c of getCategories(PROD)) {
    const sportSlugVal = getSportById(c.sportIds[0] ?? "")?.slug ?? "running";
    const cfg = getCategoryPageConfig(sportSlugVal, c.slug);
    if (!cfg) continue;
    const href = getCategoryHref(c) ?? "";
    const soft = isSoftGatedCategory(c);
    const inSm = href ? sitemapPaths.has(href) : false;
    const ready = Boolean(cfg.decision) && !soft;
    tally(
      categoryEditorial,
      ready,
      inSm,
      soft ? "soft_gated_category" : "vertical_or_no_sitemap",
    );
  }

  for (const t of getTools(PROD)) {
    const elig = getLaunchEligibility({ kind: "tool", entity: t }, PROD);
    const indexable = isIndexableEligibility(elig);
    const ready = Boolean(t.available);
    tally(tools, ready, indexable, bucketReason(elig));
    const path = t.href ?? `/tools/${t.slug}`;
    const row = [
      path,
      "tool",
      sportSlug(t.sportIds),
      t.available ? "available" : "unavailable",
      indexable ? "yes" : "no",
      ready ? "yes" : "no",
      t.status ?? "published",
      primaryReason(elig),
      bucketReason(elig),
    ];
    if (indexable) day1Rows.push(row);
    else heldRows.push(row);
  }

  let indexableThinBest = 0;
  for (const g of getBestGuides(PROD)) {
    const elig = getLaunchEligibility({ kind: "best-guide", entity: g }, PROD);
    if (!isIndexableEligibility(elig)) continue;
    if (assessBestGuideLaunchQuality(g, PROD).quality === "THIN")
      indexableThinBest++;
  }

  let facetLeakage = 0;
  let draftPathLeak = 0;
  for (const p of sitemapPaths) {
    if (/[?&](gender|width|size|color|sort|filter|q)=/i.test(p)) facetLeakage++;
    if (/\/(preview|draft|staging)\b/i.test(p)) draftPathLeak++;
  }

  let futureDraftIndexable = 0;
  for (const p of getProducts(PROD)) {
    const elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
    if (!isIndexableEligibility(elig)) continue;
    if (p.status && p.status !== "published") futureDraftIndexable++;
    if (p.publishedAt && new Date(p.publishedAt).getTime() > AUDIT_NOW.getTime())
      futureDraftIndexable++;
  }

  let fakeAggregate = 0;
  for (const r of getReviews(PROD)) {
    const any = r as unknown as Record<string, unknown>;
    if (any.aggregateRating || any.ratingValue) {
      const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
      if (isIndexableEligibility(elig)) fakeAggregate++;
    }
  }

  const listedBrokenInSitemap = [...brokenSet].filter((s) =>
    sitemapPaths.has(`/compare/${s}`),
  );

  writeCsv(
    join(OUT, "FINAL-DAY1-URLS-V3.csv"),
    [
      "url",
      "type",
      "sport",
      "quality",
      "indexable",
      "ready",
      "publicationState",
      "primaryReason",
      "holdBucket",
    ],
    day1Rows.sort((a, b) => a[0]!.localeCompare(b[0]!)),
  );
  writeCsv(
    join(OUT, "FINAL-HELD-URLS-V3.csv"),
    [
      "url",
      "type",
      "sport",
      "quality",
      "indexable",
      "ready",
      "publicationState",
      "primaryReason",
      "holdBucket",
    ],
    heldRows.sort((a, b) => a[0]!.localeCompare(b[0]!)),
  );

  const summary = {
    auditClock: AUDIT_NOW.toISOString(),
    sitemapCount: sitemapPaths.size,
    scorecard: {
      products,
      reviews,
      best,
      guides,
      comparisons,
      alternatives,
      brands,
      categories,
      tools,
      categoryEditorial,
    },
    brandClass,
    gatesLive: {
      indexableThinBest,
      indexableBrokenCmp,
      listedBroken,
      listedBrokenInSitemap,
      facetLeakage,
      draftPathLeak,
      futureDraftIndexable,
      fakeAggregate,
    },
  };
  writeFileSync(join(RC, "scorecard.json"), JSON.stringify(summary, null, 2));
  console.log(
    JSON.stringify(
      {
        sitemapCount: sitemapPaths.size,
        scorecard: summary.scorecard,
        brandClass,
        gatesLive: summary.gatesLive,
      },
      null,
      2,
    ),
  );
}

main();
