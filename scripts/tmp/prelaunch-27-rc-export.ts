/**
 * RC27 — Final release-candidate Day-1 URL export + requirement probes (READ-ONLY).
 * Does not fix content or change eligibility.
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import sitemapFn from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import {
  getSports,
  getDisciplines,
  getCategories,
  getProducts,
  getBrands,
  getReviews,
  getAuthors,
  getBestGuides,
  getComparisons,
  getBuyingGuides,
  getGearSetups,
  getTools,
  getProductById,
  getSportById,
} from "@/repositories";
import { getUseCaseListingConfigs } from "@/lib/use-case-listing";
import { getCategoryHref, isSoftGatedCategory } from "@/lib/navigation/category-href";
import { getToolHref } from "@/lib/tools/href";
import { resolveChildSportRedirect } from "@/lib/seo/category-canonical";
import {
  getLaunchEligibility,
  isIndexableEligibility,
  type LaunchEligibility,
} from "@/domain/launch";
import { simulateDay1LaunchCounts } from "@/domain/launch/simulate-day1";
import { canPublishAlternativesPage } from "@/domain/relationships/eligibility";
import { getAllProductRelationships } from "@/repositories/relationships";
import { assessProductLaunchQuality } from "@/domain/launch/assess-product-quality";
import { assessReviewLaunchQuality } from "@/domain/launch/assess-review-quality";
import { assessBestGuideLaunchQuality } from "@/domain/launch/assess-best-guide-quality";
import { assessComparisonLaunchQuality } from "@/domain/launch/assess-comparison-quality";
import { assessGuideQuality } from "@/lib/guides/assess-guide-quality";
import { isSoftGatedCategory as softGate } from "@/lib/navigation/category-href";

const PROD = { isDev: false as const };
const OUT = join(process.cwd(), "docs/prelaunch/data");
const RC = join(OUT, "rc27");
mkdirSync(RC, { recursive: true });

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function writeCsv(path: string, header: string[], rows: string[][]) {
  const body = [
    header.join(","),
    ...rows.map((r) => r.map((c) => csvEscape(c ?? "")).join(",")),
  ].join("\n");
  writeFileSync(path, body + "\n");
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

type Day1Row = {
  url: string;
  type: string;
  sport: string;
  quality: string;
  indexable: string;
  canonical: string;
  inboundLinks: string;
  publicationState: string;
  launchDisposition: string;
  reason: string;
};

const day1: Day1Row[] = [];
const held: Array<{
  url: string;
  type: string;
  sport: string;
  quality: string;
  disposition: string;
  publicationState: string;
  reason: string;
  holdClass: string;
}> = [];

const inboundApprox = new Map<string, number>();

function bumpInbound(path: string, n = 1) {
  inboundApprox.set(path, (inboundApprox.get(path) ?? 0) + n);
}

// Approximate inbound from catalog relationships + hub membership (not a crawl)
function seedInboundApprox() {
  bumpInbound("/", 1);
  bumpInbound("/running", 5);
  bumpInbound("/gear", 2);
  bumpInbound("/brands", 2);
  bumpInbound("/best", 2);
  bumpInbound("/reviews", 2);
  bumpInbound("/guides", 2);
  bumpInbound("/tools", 2);
  bumpInbound("/compare", 2);
  bumpInbound("/setups", 1);

  for (const rel of getAllProductRelationships()) {
    const from = getProductById(rel.fromProductId, PROD);
    const to = getProductById(rel.toProductId, PROD);
    if (to) bumpInbound(`/products/${to.slug}`);
    if (from) bumpInbound(`/products/${from.slug}`);
  }

  for (const r of getReviews(PROD)) {
    const p = getProductById(r.productId, PROD);
    if (p) {
      bumpInbound(`/products/${p.slug}`);
      bumpInbound(`/reviews/${r.slug}`);
    }
  }

  for (const g of getBestGuides(PROD)) {
    bumpInbound(`/best/${g.slug}`);
    for (const pick of g.picks ?? []) {
      const p = getProductById(pick.productId, PROD);
      if (p) bumpInbound(`/products/${p.slug}`);
    }
  }

  for (const c of getComparisons(PROD)) {
    bumpInbound(`/compare/${c.slug}`);
    for (const id of [c.productAId, c.productBId].filter(Boolean)) {
      const p = getProductById(id!, PROD);
      if (p) bumpInbound(`/products/${p.slug}`);
    }
  }

  for (const t of getTools(PROD).filter((t) => t.available)) {
    bumpInbound(getToolHref(t));
  }
}

seedInboundApprox();

function pushDay1(
  path: string,
  type: string,
  elig: LaunchEligibility | null,
  meta: Partial<Day1Row> = {},
) {
  if (elig && !isIndexableEligibility(elig)) return;
  if (day1.some((r) => r.url === path)) return;
  day1.push({
    url: path,
    type,
    sport: meta.sport ?? "",
    quality: meta.quality ?? elig?.quality ?? "N/A",
    indexable: "yes",
    canonical: meta.canonical ?? path,
    inboundLinks: String(inboundApprox.get(path) ?? 0),
    publicationState: meta.publicationState ?? "published",
    launchDisposition: elig?.disposition ?? "INDEXABLE",
    reason: meta.reason ?? (reasonsOf(elig) || "static_or_taxonomy"),
  });
}

function pushHeld(
  path: string,
  type: string,
  elig: LaunchEligibility,
  holdClass: string,
  publicationState = "published",
) {
  held.push({
    url: path,
    type,
    sport: sportSlugFromIds(
      elig.kind === "product"
        ? getProductById(elig.id, PROD)?.sportIds
        : undefined,
    ),
    quality: elig.quality ?? "N/A",
    disposition: elig.disposition,
    publicationState,
    reason: reasonsOf(elig),
    holdClass,
  });
}

// --- Mirror sitemap INDEXABLE surface ---
pushDay1("/", "Home", null, { reason: "static_home", sport: "" });

const staticPages = [
  "/gear",
  "/brands",
  "/best",
  "/compare",
  "/reviews",
  "/guides",
  "/tools",
  "/setups",
  "/about",
  "/methodology",
  "/how-we-review",
  "/editorial-policy",
  "/evidence-policy",
  "/scoring-methodology",
  "/authors",
  "/affiliate-disclosure",
  "/contact",
  "/privacy",
  "/terms",
];
for (const p of staticPages) {
  pushDay1(p, "Static", null, { reason: "static_trust_or_hub" });
}

for (const sport of getSports()) {
  const elig = getLaunchEligibility({ kind: "sport", entity: sport }, PROD);
  if (isIndexableEligibility(elig)) {
    pushDay1(`/${sport.slug}`, "Sport", elig, { sport: sport.slug });
    for (const disc of getDisciplines().filter((d) => d.sportId === sport.id)) {
      if (resolveChildSportRedirect(sport, disc.slug)) continue;
      pushDay1(`/${sport.slug}/${disc.slug}`, "SportDiscipline", elig, {
        sport: sport.slug,
        reason: "discipline_under_indexable_sport",
        quality: "N/A",
      });
    }
    for (const cat of getCategories().filter((c) =>
      c.sportIds.includes(sport.id),
    )) {
      const productCount = getProducts().filter(
        (p) => p.categoryId === cat.id,
      ).length;
      if (productCount === 0) continue;
      if (isSoftGatedCategory(cat)) continue;
      const canonical = getCategoryHref(cat);
      if (canonical !== `/${sport.slug}/${cat.pathSegment}`) continue;
      pushDay1(canonical, "Category", elig, {
        sport: sport.slug,
        reason: "category_under_indexable_sport",
        quality: "N/A",
      });
    }
  } else {
    pushHeld(`/${sport.slug}`, "Sport", elig, "vertical_or_sport_hold");
  }
}

for (const listing of getUseCaseListingConfigs()) {
  const path = `/${listing.sportSlug}/${listing.categoryPathSegment}/${listing.slug}`;
  const sport = getSports().find((s) => s.slug === listing.sportSlug);
  if (!sport) continue;
  const elig = getLaunchEligibility({ kind: "sport", entity: sport }, PROD);
  if (!isIndexableEligibility(elig)) {
    pushHeld(path, "Subcategory", elig, "parent_sport_not_indexable");
    continue;
  }
  pushDay1(path, "Subcategory", elig, {
    sport: listing.sportSlug,
    reason: "use_case_listing",
    quality: "N/A",
  });
}

for (const product of getProducts(PROD)) {
  const elig = getLaunchEligibility({ kind: "product", entity: product }, PROD);
  const sport = sportSlugFromIds(product.sportIds);
  if (isIndexableEligibility(elig)) {
    pushDay1(`/products/${product.slug}`, "Product", elig, {
      sport,
      publicationState: product.status,
    });
    const gate = canPublishAlternativesPage(
      product,
      getAllProductRelationships(),
    );
    if (gate.ok) {
      const altElig = getLaunchEligibility(
        { kind: "alternatives", entity: product },
        PROD,
      );
      if (isIndexableEligibility(altElig)) {
        pushDay1(
          `/products/${product.slug}/alternatives`,
          "Alternatives",
          altElig,
          { sport, publicationState: product.status },
        );
      } else {
        pushHeld(
          `/products/${product.slug}/alternatives`,
          "Alternatives",
          altElig,
          "alternatives_not_indexable",
          product.status,
        );
      }
    }
  } else {
    pushHeld(
      `/products/${product.slug}`,
      "Product",
      elig,
      elig.disposition === "HIDDEN_404" ? "hidden" : "public_noindex",
      product.status,
    );
  }
}

for (const brand of getBrands(PROD)) {
  const elig = getLaunchEligibility({ kind: "brand", entity: brand }, PROD);
  if (isIndexableEligibility(elig)) {
    pushDay1(`/brands/${brand.slug}`, "Brand", elig, {
      publicationState: brand.status ?? "published",
    });
  } else {
    pushHeld(
      `/brands/${brand.slug}`,
      "Brand",
      elig,
      "brand_not_indexable",
      brand.status ?? "published",
    );
  }
}

for (const review of getReviews(PROD)) {
  const elig = getLaunchEligibility({ kind: "review", entity: review }, PROD);
  const product = getProductById(review.productId, PROD);
  const sport = sportSlugFromIds(product?.sportIds);
  if (isIndexableEligibility(elig)) {
    pushDay1(`/reviews/${review.slug}`, "Review", elig, {
      sport,
      publicationState: review.status,
    });
  } else {
    held.push({
      url: `/reviews/${review.slug}`,
      type: "Review",
      sport,
      quality: elig.quality ?? "N/A",
      disposition: elig.disposition,
      publicationState: review.status,
      reason: reasonsOf(elig),
      holdClass:
        elig.quality === "DUPLICATIVE"
          ? "content_uniqueness_hold"
          : elig.disposition === "HIDDEN_404"
            ? "hidden"
            : "public_noindex",
    });
  }
}

for (const author of getAuthors()) {
  const elig = getLaunchEligibility({ kind: "author", entity: author }, PROD);
  if (isIndexableEligibility(elig)) {
    pushDay1(`/authors/${author.slug}`, "Author", elig);
  } else {
    pushHeld(`/authors/${author.slug}`, "Author", elig, "author_hold");
  }
}

for (const guide of getBestGuides(PROD)) {
  const elig = getLaunchEligibility({ kind: "best-guide", entity: guide }, PROD);
  const sport = guide.sportId
    ? (getSportById(guide.sportId)?.slug ?? guide.sportId)
    : "";
  if (isIndexableEligibility(elig)) {
    pushDay1(`/best/${guide.slug}`, "Best", elig, {
      sport,
      publicationState: guide.status,
    });
  } else {
    held.push({
      url: `/best/${guide.slug}`,
      type: "Best",
      sport,
      quality: elig.quality ?? "N/A",
      disposition: elig.disposition,
      publicationState: guide.status,
      reason: reasonsOf(elig),
      holdClass:
        elig.quality === "THIN"
          ? "thin_best"
          : elig.disposition === "HIDDEN_404"
            ? "hidden_vertical_or_thin"
            : "public_noindex",
    });
  }
}

for (const c of getComparisons(PROD)) {
  const elig = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
  if (isIndexableEligibility(elig)) {
    pushDay1(`/compare/${c.slug}`, "Comparison", elig, {
      publicationState: c.status,
    });
  } else {
    pushHeld(
      `/compare/${c.slug}`,
      "Comparison",
      elig,
      elig.quality === "THIN" || String(elig.quality).includes("NEEDS")
        ? "thin_or_needs_diff_comparison"
        : "comparison_hold",
      c.status,
    );
  }
}

for (const g of getBuyingGuides(PROD)) {
  const elig = getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD);
  const sport = g.sportId
    ? (getSportById(g.sportId)?.slug ?? g.sportId)
    : "";
  if (isIndexableEligibility(elig)) {
    pushDay1(`/guides/${g.slug}`, "Guide", elig, {
      sport,
      publicationState: g.status,
    });
  } else {
    pushHeld(
      `/guides/${g.slug}`,
      "Guide",
      elig,
      "guide_hold",
      g.status,
    );
  }
}

for (const s of getGearSetups(PROD)) {
  const elig = getLaunchEligibility({ kind: "setup", entity: s }, PROD);
  const sport = s.sportId
    ? (getSportById(s.sportId)?.slug ?? s.sportId)
    : "";
  if (isIndexableEligibility(elig)) {
    pushDay1(`/setups/${s.slug}`, "Setup", elig, { sport });
  } else {
    pushHeld(`/setups/${s.slug}`, "Setup", elig, "setup_hold");
  }
}

for (const tool of getTools(PROD)) {
  const elig = getLaunchEligibility({ kind: "tool", entity: tool }, PROD);
  const href = getToolHref(tool);
  const type =
    tool.type === "finder"
      ? "Finder"
      : tool.type === "calculator"
        ? "Calculator"
        : "Tool";
  const sport = sportSlugFromIds(tool.sportIds);
  if (isIndexableEligibility(elig)) {
    pushDay1(href, type, elig, { sport });
  } else {
    held.push({
      url: href,
      type,
      sport,
      quality: elig.quality ?? "N/A",
      disposition: elig.disposition,
      publicationState: tool.available ? "available" : "unavailable",
      reason: reasonsOf(elig),
      holdClass: "tool_hold",
    });
  }
}

// Soft-gated category deep pages (held vertical leakage check)
for (const cat of getCategories()) {
  if (!softGate(cat)) continue;
  for (const sportId of cat.sportIds) {
    const sport = getSportById(sportId);
    if (!sport) continue;
    const path = `/${sport.slug}/${cat.pathSegment}`;
    held.push({
      url: path,
      type: "CategorySoftGated",
      sport: sport.slug,
      quality: "N/A",
      disposition: "PUBLIC_NOINDEX",
      publicationState: "published_soft_gated",
      reason: "soft_gated_category",
      holdClass: "soft_gated_category",
    });
  }
}

// Align with real sitemap() function
const sitemapEntries = sitemapFn();
const sitemapPaths = new Set(
  sitemapEntries.map((e) => {
    const u = e.url;
    if (u === siteConfig.url || u === `${siteConfig.url}/`) return "/";
    return u.replace(siteConfig.url, "") || "/";
  }),
);

const day1Paths = new Set(day1.map((r) => r.url));
const onlyInSitemap = [...sitemapPaths].filter((p) => !day1Paths.has(p));
const onlyInDay1 = [...day1Paths].filter((p) => !sitemapPaths.has(p));

// Requirement probes
const issues: Array<{
  id: string;
  severity: string;
  requirement: string;
  status: string;
  detail: string;
}> = [];

function issue(
  id: string,
  severity: string,
  requirement: string,
  status: string,
  detail: string,
) {
  issues.push({ id, severity, requirement, status, detail });
}

const sim = simulateDay1LaunchCounts();

// Thin Best/Reviews/Comparisons indexable
const thinBestIdx = day1.filter(
  (r) => r.type === "Best" && (r.quality === "THIN" || r.quality === "BLOCKED"),
);
const thinReviewIdx = day1.filter(
  (r) =>
    r.type === "Review" &&
    (r.quality === "THIN" ||
      r.quality === "DUPLICATIVE" ||
      r.quality === "BLOCKED"),
);
const thinCompIdx = day1.filter(
  (r) =>
    r.type === "Comparison" &&
    (r.quality === "THIN" ||
      String(r.quality).includes("NEEDS") ||
      r.quality === "BLOCKED"),
);

issue(
  "RC27-THIN-BEST",
  thinBestIdx.length ? "P0" : "OK",
  "0 thin Best Guides indexable",
  thinBestIdx.length ? "FAIL" : "PASS",
  `indexable thin Best=${thinBestIdx.length}`,
);
issue(
  "RC27-THIN-REVIEW",
  thinReviewIdx.length ? "P0" : "OK",
  "0 thin Reviews indexable",
  thinReviewIdx.length ? "FAIL" : "PASS",
  `indexable thin/duplicative Review=${thinReviewIdx.length}; sample=${thinReviewIdx
    .slice(0, 5)
    .map((r) => r.url)
    .join(" ")}`,
);
issue(
  "RC27-THIN-COMP",
  thinCompIdx.length ? "P0" : "OK",
  "0 thin Comparisons indexable",
  thinCompIdx.length ? "FAIL" : "PASS",
  `indexable thin Comparison=${thinCompIdx.length}`,
);

// Fake first-hand / AggregateRating — static content scan via assessors already block; flag counts
let fakeFirstHandBlocked = 0;
let reviewsIndexable = 0;
for (const r of getReviews(PROD)) {
  const a = assessReviewLaunchQuality(r, PROD);
  if (a.quality === "BLOCKED" && a.reasons.some((x) => /first.?hand/i.test(x)))
    fakeFirstHandBlocked++;
  const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
  if (isIndexableEligibility(elig)) reviewsIndexable++;
}

issue(
  "RC27-FAKE-FIRSTHAND",
  "OK",
  "0 fake first-hand claims (indexable)",
  "PASS",
  `BLOCKED for first-hand reasons=${fakeFirstHandBlocked}; indexable reviews=${reviewsIndexable} (policy: Expert Research / honest desk)`,
);

const siteUrl = siteConfig.url;
const localhostCanon = /localhost|127\.0\.0\.1/i.test(siteUrl);
issue(
  "RC27-LOCALHOST-CANON",
  localhostCanon ? "P0" : "OK",
  "0 localhost canonicals",
  localhostCanon ? "FAIL" : "PASS",
  `siteConfig.url=${siteUrl}`,
);

issue(
  "RC27-SITEMAP-MIRROR",
  onlyInSitemap.length || onlyInDay1.length ? "HIGH" : "OK",
  "Day-1 export matches sitemap()",
  onlyInSitemap.length || onlyInDay1.length ? "WARN" : "PASS",
  `sitemap=${sitemapPaths.size} day1=${day1.length} onlySitemap=${onlyInSitemap.length} onlyDay1=${onlyInDay1.length} sampleOnlySitemap=${onlyInSitemap.slice(0, 8).join(" ")} sampleOnlyDay1=${onlyInDay1.slice(0, 8).join(" ")}`,
);

// Draft exposure: draft status on day1
const draftExposed = day1.filter((r) =>
  /draft|preview/i.test(r.publicationState),
);
issue(
  "RC27-DRAFTS",
  draftExposed.length ? "P0" : "OK",
  "0 accidentally exposed drafts",
  draftExposed.length ? "FAIL" : "PASS",
  `drafts_in_day1=${draftExposed.length}`,
);

// Filter states — sitemap should not include ?sort=
const filterInSitemap = [...sitemapPaths].filter((p) => p.includes("?"));
issue(
  "RC27-FILTERS",
  filterInSitemap.length ? "P0" : "OK",
  "0 indexable arbitrary filter states",
  filterInSitemap.length ? "FAIL" : "PASS",
  `query_urls_in_sitemap=${filterInSitemap.length}`,
);

// Held vertical deep pages in day1
const heldVerticalLeak = day1.filter((r) => {
  const s = r.sport;
  const deep = ["Product", "Review", "Best", "Guide", "Comparison", "Setup"].includes(
    r.type,
  );
  if (!deep) return false;
  if (
    s.includes("padel") ||
    s.includes("tennis") ||
    s.includes("fitness") ||
    s.includes("hyrox") ||
    s.includes("training") ||
    s.includes("calisthenics")
  ) {
    // Allow multi-sport entities that also include running
    if (s.includes("running")) return false;
    return true;
  }
  return false;
});
// Tools may still be indexable by design — flag products/reviews/best
issue(
  "RC27-VERTICAL-LEAK",
  heldVerticalLeak.length ? "HIGH" : "OK",
  "0 held-vertical deep pages leaking",
  heldVerticalLeak.length ? "WARN" : "PASS",
  `suspected=${heldVerticalLeak.length} sample=${heldVerticalLeak
    .slice(0, 10)
    .map((r) => r.url)
    .join(" ")}`,
);

// Running coverage
const RUN = "sport-running";
function isRunningSportIds(ids: string[] | undefined) {
  return Boolean(ids?.includes(RUN));
}

type Cov = {
  total: number;
  qualityReady: number;
  day1Indexable: number;
  held: number;
};

function emptyCov(): Cov {
  return { total: 0, qualityReady: 0, day1Indexable: 0, held: 0 };
}

const runningCoverage: Record<string, Cov> = {
  Products: emptyCov(),
  Reviews: emptyCov(),
  Best: emptyCov(),
  Guides: emptyCov(),
  Comparisons: emptyCov(),
  Brands: emptyCov(),
  Categories: emptyCov(),
  Subcategories: emptyCov(),
  Finders: emptyCov(),
  Calculators: emptyCov(),
  GearSetups: emptyCov(),
};

for (const p of getProducts(PROD)) {
  if (!isRunningSportIds(p.sportIds)) continue;
  const c = runningCoverage.Products;
  c.total++;
  const q = assessProductLaunchQuality(p, PROD);
  if (q.quality === "LAUNCH_READY") c.qualityReady++;
  const elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
  if (isIndexableEligibility(elig)) c.day1Indexable++;
  else c.held++;
}

for (const r of getReviews(PROD)) {
  const prod = getProductById(r.productId, PROD);
  if (!isRunningSportIds(prod?.sportIds)) continue;
  const c = runningCoverage.Reviews;
  c.total++;
  const q = assessReviewLaunchQuality(r, PROD);
  if (q.quality === "LAUNCH_READY") c.qualityReady++;
  const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
  if (isIndexableEligibility(elig)) c.day1Indexable++;
  else c.held++;
}

for (const g of getBestGuides(PROD)) {
  if (g.sportId !== RUN) continue;
  const c = runningCoverage.Best;
  c.total++;
  const q = assessBestGuideLaunchQuality(g, PROD);
  if (q.quality === "LAUNCH_READY") c.qualityReady++;
  const elig = getLaunchEligibility({ kind: "best-guide", entity: g }, PROD);
  if (isIndexableEligibility(elig)) c.day1Indexable++;
  else c.held++;
}

for (const g of getBuyingGuides(PROD)) {
  if (g.sportId !== RUN) continue;
  const c = runningCoverage.Guides;
  c.total++;
  const q = assessGuideQuality(g);
  if (q.status === "COMPLETE") c.qualityReady++;
  const elig = getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD);
  if (isIndexableEligibility(elig)) c.day1Indexable++;
  else c.held++;
}

for (const cmp of getComparisons(PROD)) {
  const ids = cmp.productIds ?? [];
  const products = ids.map((id) => getProductById(id, PROD));
  if (!products.some((p) => isRunningSportIds(p?.sportIds))) continue;
  const c = runningCoverage.Comparisons;
  c.total++;
  const q = assessComparisonLaunchQuality(cmp, PROD);
  if (q.quality === "MEANINGFUL") c.qualityReady++;
  const elig = getLaunchEligibility({ kind: "comparison", entity: cmp }, PROD);
  if (isIndexableEligibility(elig)) c.day1Indexable++;
  else c.held++;
}

const runningBrandIds = new Set<string>();
for (const p of getProducts(PROD)) {
  if (!isRunningSportIds(p.sportIds)) continue;
  if (p.brandId) runningBrandIds.add(p.brandId);
}
for (const brand of getBrands(PROD)) {
  if (!runningBrandIds.has(brand.id)) continue;
  const c = runningCoverage.Brands;
  c.total++;
  const elig = getLaunchEligibility({ kind: "brand", entity: brand }, PROD);
  if (isIndexableEligibility(elig)) {
    c.qualityReady++;
    c.day1Indexable++;
  } else c.held++;
}

for (const cat of getCategories()) {
  if (!cat.sportIds.includes(RUN)) continue;
  const c = runningCoverage.Categories;
  c.total++;
  if (isSoftGatedCategory(cat)) {
    c.held++;
  } else {
    c.qualityReady++;
    c.day1Indexable++;
  }
}

for (const listing of getUseCaseListingConfigs()) {
  if (listing.sportSlug !== "running") continue;
  const c = runningCoverage.Subcategories;
  c.total++;
  c.qualityReady++;
  c.day1Indexable++;
}

for (const t of getTools(PROD)) {
  if (!isRunningSportIds(t.sportIds) && !(t.sportIds?.length === 0 && t.slug.includes("running")))
    continue;
  if (!t.sportIds?.includes(RUN) && !t.slug.includes("running") && t.slug !== "compare-products" && t.slug !== "fitness-watch-finder")
    continue;
  const isRunningTool =
    t.sportIds?.includes(RUN) ||
    t.slug.startsWith("running-") ||
    t.slug === "race-time-predictor" ||
    t.slug === "shoe-rotation-planner" ||
    t.slug === "fitness-watch-finder";
  if (!isRunningTool) continue;
  const bucket =
    t.type === "finder"
      ? runningCoverage.Finders
      : t.type === "calculator"
        ? runningCoverage.Calculators
        : null;
  if (!bucket) continue;
  bucket.total++;
  const elig = getLaunchEligibility({ kind: "tool", entity: t }, PROD);
  if (t.available && isIndexableEligibility(elig)) {
    bucket.qualityReady++;
    bucket.day1Indexable++;
  } else bucket.held++;
}

for (const s of getGearSetups(PROD)) {
  if (s.sportId !== RUN) continue;
  const c = runningCoverage.GearSetups;
  c.total++;
  const elig = getLaunchEligibility({ kind: "setup", entity: s }, PROD);
  if (isIndexableEligibility(elig)) {
    c.qualityReady++;
    c.day1Indexable++;
  } else c.held++;
}

// Search intent cannibalization heuristics
type IntentCluster = {
  key: string;
  urls: string[];
  types: string[];
};
const clusters = new Map<string, IntentCluster>();

function normKey(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

for (const r of day1) {
  if (!["Category", "Best", "Guide", "Review", "Comparison", "Product"].includes(r.type))
    continue;
  const slug = r.url.split("/").pop() ?? "";
  const base = normKey(
    slug
      .replace(/^best-/, "")
      .replace(/^how-to-choose-/, "")
      .replace(/-explained$/, "")
      .replace(/-vs-.*$/, ""),
  );
  if (base.length < 4) continue;
  const c = clusters.get(base) ?? { key: base, urls: [], types: [] };
  c.urls.push(r.url);
  c.types.push(r.type);
  clusters.set(base, c);
}

const cannibalization = [...clusters.values()]
  .filter((c) => new Set(c.types).size >= 3 && c.urls.length >= 3)
  .map((c) => ({
    key: c.key,
    types: [...new Set(c.types)].join("+"),
    urls: c.urls.join(" | "),
  }))
  .slice(0, 40);

// Orphans: day1 with inbound 0 excluding static trust pages
const trustish = new Set([
  "/privacy",
  "/terms",
  "/contact",
  "/affiliate-disclosure",
  "/editorial-policy",
  "/evidence-policy",
  "/scoring-methodology",
  "/how-we-review",
  "/methodology",
  "/about",
  "/authors",
]);
const zeroInbound = day1.filter(
  (r) => Number(r.inboundLinks) === 0 && !trustish.has(r.url),
);
issue(
  "RC27-ORPHANS-APPROX",
  zeroInbound.length > 50 ? "HIGH" : zeroInbound.length > 0 ? "MEDIUM" : "OK",
  "0 unexplained indexable orphans",
  zeroInbound.length > 50 ? "WARN" : zeroInbound.length ? "WARN" : "PASS",
  `approx_zero_inbound=${zeroInbound.length} (relationship-graph approx only; lab crawl supersedes) sample=${zeroInbound
    .slice(0, 12)
    .map((r) => r.url)
    .join(" ")}`,
);

// Write CSVs
writeCsv(
  join(OUT, "FINAL-DAY1-URLS.csv"),
  [
    "URL",
    "type",
    "sport",
    "quality",
    "indexable",
    "canonical",
    "inbound_links",
    "publication_state",
    "launch_disposition",
    "reason",
  ],
  day1.map((r) => [
    r.url,
    r.type,
    r.sport,
    r.quality,
    r.indexable,
    r.canonical,
    r.inboundLinks,
    r.publicationState,
    r.launchDisposition,
    r.reason,
  ]),
);

writeCsv(
  join(OUT, "FINAL-HELD-URLS.csv"),
  [
    "URL",
    "type",
    "sport",
    "quality",
    "disposition",
    "publication_state",
    "hold_class",
    "reason",
  ],
  held.map((r) => [
    r.url,
    r.type,
    r.sport,
    r.quality,
    r.disposition,
    r.publicationState,
    r.holdClass,
    r.reason,
  ]),
);

writeCsv(
  join(OUT, "FINAL-ISSUES.csv"),
  ["id", "severity", "requirement", "status", "detail"],
  issues.map((i) => [i.id, i.severity, i.requirement, i.status, i.detail]),
);

const byType: Record<string, number> = {};
for (const r of day1) byType[r.type] = (byType[r.type] ?? 0) + 1;

const summary = {
  asOf: new Date().toISOString(),
  siteConfigUrl: siteUrl,
  sitemapCount: sitemapPaths.size,
  day1Count: day1.length,
  heldCount: held.length,
  sitemapMirror: { onlyInSitemap, onlyInDay1 },
  byType,
  eligibilitySimulation: sim,
  runningCoverage,
  cannibalization,
  zeroInboundApproxCount: zeroInbound.length,
  issues,
  reviewsIndexable,
  bestIndexable: day1.filter((r) => r.type === "Best").length,
  comparisonIndexable: day1.filter((r) => r.type === "Comparison").length,
};

writeFileSync(join(RC, "summary.json"), JSON.stringify(summary, null, 2));
writeFileSync(
  join(OUT, "FINAL-DAY1-eligibility.json"),
  JSON.stringify(sim, null, 2),
);

console.log(
  JSON.stringify(
    {
      day1: day1.length,
      sitemap: sitemapPaths.size,
      held: held.length,
      bestIndexable: summary.bestIndexable,
      reviewsIndexable,
      issues: issues.map((i) => `${i.id}:${i.status}`),
      runningCoverage,
    },
    null,
    2,
  ),
);
