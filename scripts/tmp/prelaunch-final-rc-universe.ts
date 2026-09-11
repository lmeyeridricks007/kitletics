/**
 * Final RC universe — Day-1 / held / reconciliation / Running matrix (READ-ONLY).
 * Fixed audit clock. Does not mutate product/src content or eligibility.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-final-rc-universe.ts
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
import { getOffersForProduct } from "@/repositories/commerce";
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
import { getPrimaryProductMedia } from "@/lib/product/media";

const AUDIT_NOW = new Date("2026-09-06T23:00:00.000Z");
const PROD = { isDev: false as const, now: AUDIT_NOW };
const RUN = "sport-running";
const SHOE_CAT = "cat-running-shoes";

const OUT = join(process.cwd(), "docs/prelaunch/data");
const RC = join(OUT, "rc-final");
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

function robotsFor(elig: LaunchEligibility | null): string {
  if (!elig) return "index,follow";
  if (elig.disposition === "INDEXABLE") return "index,follow";
  if (elig.disposition === "PUBLIC_NOINDEX") return "noindex,follow";
  return "noindex,nofollow";
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

type HeldRow = {
  url: string;
  type: string;
  sport: string;
  quality: string;
  disposition: string;
  publicationState: string;
  holdClass: string;
  reason: string;
};

type ReconRow = {
  url: string;
  pageType: string;
  sport: string;
  publicationStatus: string;
  qualityStatus: string;
  launchEligibility: string;
  robots: string;
  canonical: string;
  httpStatus: string;
  inSitemap: string;
  inboundInternalLinks: string;
  reason: string;
};

const day1: Day1Row[] = [];
const held: HeldRow[] = [];
const reconByUrl = new Map<string, ReconRow>();
const inboundApprox = new Map<string, number>();

function bumpInbound(path: string, n = 1) {
  inboundApprox.set(path, (inboundApprox.get(path) ?? 0) + n);
}

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
    for (const pick of g.recommendations ?? []) {
      const p = getProductById(pick.productId, PROD);
      if (p) bumpInbound(`/products/${p.slug}`);
    }
  }

  for (const c of getComparisons(PROD)) {
    bumpInbound(`/compare/${c.slug}`);
    for (const id of c.productIds ?? []) {
      const p = getProductById(id, PROD);
      if (p) bumpInbound(`/products/${p.slug}`);
    }
  }

  for (const t of getTools(PROD).filter((t) => t.available)) {
    bumpInbound(getToolHref(t));
  }
}

seedInboundApprox();

function upsertRecon(
  path: string,
  pageType: string,
  elig: LaunchEligibility | null,
  meta: Partial<ReconRow> = {},
) {
  const existing = reconByUrl.get(path);
  const row: ReconRow = {
    url: path,
    pageType: meta.pageType ?? existing?.pageType ?? pageType,
    sport: meta.sport ?? existing?.sport ?? "",
    publicationStatus:
      meta.publicationStatus ?? existing?.publicationStatus ?? "published",
    qualityStatus:
      meta.qualityStatus ?? existing?.qualityStatus ?? elig?.quality ?? "N/A",
    launchEligibility:
      meta.launchEligibility ??
      existing?.launchEligibility ??
      elig?.disposition ??
      "INDEXABLE",
    robots: meta.robots ?? existing?.robots ?? robotsFor(elig),
    canonical: meta.canonical ?? existing?.canonical ?? path,
    httpStatus: "",
    inSitemap: meta.inSitemap ?? existing?.inSitemap ?? "no",
    inboundInternalLinks: String(inboundApprox.get(path) ?? 0),
    reason:
      meta.reason ??
      existing?.reason ??
      (reasonsOf(elig) || "static_or_taxonomy"),
  };
  reconByUrl.set(path, row);
}

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
  upsertRecon(path, type, elig, {
    sport: meta.sport ?? "",
    publicationStatus: meta.publicationState ?? "published",
    qualityStatus: meta.quality ?? elig?.quality ?? "N/A",
    launchEligibility: elig?.disposition ?? "INDEXABLE",
    canonical: meta.canonical ?? path,
    reason: meta.reason ?? (reasonsOf(elig) || "static_or_taxonomy"),
  });
}

function pushHeld(
  path: string,
  type: string,
  elig: LaunchEligibility,
  holdClass: string,
  publicationState = "published",
  sportOverride?: string,
) {
  const sport =
    sportOverride ??
    sportSlugFromIds(
      elig.kind === "product"
        ? getProductById(elig.id!, PROD)?.sportIds
        : undefined,
    );
  held.push({
    url: path,
    type,
    sport,
    quality: elig.quality ?? "N/A",
    disposition: elig.disposition,
    publicationState,
    reason: reasonsOf(elig),
    holdClass,
  });
  upsertRecon(path, type, elig, {
    sport,
    publicationStatus: publicationState,
    qualityStatus: elig.quality ?? "N/A",
    launchEligibility: elig.disposition,
    reason: reasonsOf(elig),
  });
}

// --- Independent INDEXABLE walk (mirrors sitemap surface + holds) ---
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
      const productCount = getProducts(PROD).filter(
        (p) => p.categoryId === cat.id,
      ).length;
      if (productCount === 0) continue;
      if (isSoftGatedCategory(cat)) continue;
      const canonical = getCategoryHref(cat, PROD);
      if (canonical !== `/${sport.slug}/${cat.pathSegment}`) continue;
      pushDay1(canonical, "Category", elig, {
        sport: sport.slug,
        reason: "category_under_indexable_sport",
        quality: "N/A",
      });
    }
  } else {
    pushHeld(`/${sport.slug}`, "Sport", elig, "vertical_or_sport_hold", "published", sport.slug);
  }
}

for (const listing of getUseCaseListingConfigs()) {
  const path = `/${listing.sportSlug}/${listing.categoryPathSegment}/${listing.slug}`;
  const sport = getSports().find((s) => s.slug === listing.sportSlug);
  if (!sport) continue;
  const elig = getLaunchEligibility({ kind: "sport", entity: sport }, PROD);
  if (!isIndexableEligibility(elig)) {
    pushHeld(path, "Subcategory", elig, "parent_sport_not_indexable", "published", listing.sportSlug);
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
          sport,
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
      sport,
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
    upsertRecon(`/reviews/${review.slug}`, "Review", elig, {
      sport,
      publicationStatus: review.status,
      qualityStatus: elig.quality ?? "N/A",
      launchEligibility: elig.disposition,
      reason: reasonsOf(elig),
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
    upsertRecon(`/best/${guide.slug}`, "Best", elig, {
      sport,
      publicationStatus: guide.status,
      qualityStatus: elig.quality ?? "N/A",
      launchEligibility: elig.disposition,
      reason: reasonsOf(elig),
    });
  }
}

for (const c of getComparisons(PROD)) {
  const elig = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
  const products = (c.productIds ?? []).map((id) => getProductById(id, PROD));
  const sport = sportSlugFromIds(
    products.flatMap((p) => p?.sportIds ?? []),
  );
  if (isIndexableEligibility(elig)) {
    pushDay1(`/compare/${c.slug}`, "Comparison", elig, {
      sport,
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
      sport,
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
    pushHeld(`/guides/${g.slug}`, "Guide", elig, "guide_hold", g.status, sport);
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
    pushHeld(`/setups/${s.slug}`, "Setup", elig, "setup_hold", "published", sport);
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
    upsertRecon(href, type, elig, {
      sport,
      publicationStatus: tool.available ? "available" : "unavailable",
      qualityStatus: elig.quality ?? "N/A",
      launchEligibility: elig.disposition,
      reason: reasonsOf(elig),
    });
  }
}

const softGatedCategoryPaths: string[] = [];
for (const cat of getCategories()) {
  if (!isSoftGatedCategory(cat)) continue;
  for (const sportId of cat.sportIds) {
    const sport = getSportById(sportId);
    if (!sport) continue;
    const path = `/${sport.slug}/${cat.pathSegment}`;
    softGatedCategoryPaths.push(path);
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
    upsertRecon(path, "CategorySoftGated", null, {
      sport: sport.slug,
      publicationStatus: "published_soft_gated",
      qualityStatus: "N/A",
      launchEligibility: "PUBLIC_NOINDEX",
      robots: "noindex,follow",
      reason: "soft_gated_category",
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

for (const path of sitemapPaths) {
  const row = reconByUrl.get(path);
  if (row) {
    row.inSitemap = "yes";
  } else {
    upsertRecon(path, "SitemapOnly", null, {
      inSitemap: "yes",
      reason: "present_in_sitemap_not_in_eligibility_walk",
    });
  }
}

for (const row of reconByUrl.values()) {
  if (!row.inSitemap) row.inSitemap = sitemapPaths.has(row.url) ? "yes" : "no";
  if (sitemapPaths.has(row.url)) row.inSitemap = "yes";
}

const day1Paths = new Set(day1.map((r) => r.url));
const onlyInSitemap = [...sitemapPaths].filter((p) => !day1Paths.has(p));
const onlyInDay1 = [...day1Paths].filter((p) => !sitemapPaths.has(p));

const sim = simulateDay1LaunchCounts();

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
  if (q.status === "complete") c.qualityReady++;
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

// --- Shoes ---
const shoes = getProducts(PROD).filter((p) => p.categoryId === SHOE_CAT);
const shoeStats = {
  total: shoes.length,
  publishedVisible: 0,
  launchReady: 0,
  indexable: 0,
  blocked: 0,
  nonLaunchReadySlugs: [] as string[],
};
for (const p of shoes) {
  shoeStats.publishedVisible++;
  const q = assessProductLaunchQuality(p, PROD);
  if (q.quality === "LAUNCH_READY") shoeStats.launchReady++;
  else {
    shoeStats.nonLaunchReadySlugs.push(p.slug);
    if (q.quality === "BLOCKED") shoeStats.blocked++;
  }
  const elig = getLaunchEligibility({ kind: "product", entity: p }, PROD);
  if (isIndexableEligibility(elig)) shoeStats.indexable++;
}

// --- Best INDEXABLE not LAUNCH_READY ---
const bestIndexableNotLaunchReady: Array<{
  slug: string;
  quality: string;
  disposition: string;
}> = [];
for (const g of getBestGuides(PROD)) {
  const elig = getLaunchEligibility({ kind: "best-guide", entity: g }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  const q = assessBestGuideLaunchQuality(g, PROD);
  if (q.quality !== "LAUNCH_READY") {
    bestIndexableNotLaunchReady.push({
      slug: g.slug,
      quality: q.quality,
      disposition: elig.disposition,
    });
  }
}

// --- Review LR vs INDEXABLE mismatch ---
let reviewLaunchReady = 0;
let reviewIndexable = 0;
const reviewLrNotIndexable: Array<{
  slug: string;
  quality: string;
  disposition: string;
  reasons: string;
}> = [];
const reviewHoldByQuality: Record<string, number> = {};
const reviewHoldByReasonCode: Record<string, number> = {};
for (const r of getReviews(PROD)) {
  const q = assessReviewLaunchQuality(r, PROD);
  const elig = getLaunchEligibility({ kind: "review", entity: r }, PROD);
  if (q.quality === "LAUNCH_READY") reviewLaunchReady++;
  if (isIndexableEligibility(elig)) reviewIndexable++;
  else {
    const qKey = elig.quality ?? q.quality ?? "UNKNOWN";
    reviewHoldByQuality[qKey] = (reviewHoldByQuality[qKey] ?? 0) + 1;
    for (const reason of elig.reasons) {
      reviewHoldByReasonCode[reason.code] =
        (reviewHoldByReasonCode[reason.code] ?? 0) + 1;
    }
    if (q.quality === "LAUNCH_READY") {
      reviewLrNotIndexable.push({
        slug: r.slug,
        quality: elig.quality ?? q.quality,
        disposition: elig.disposition,
        reasons: reasonsOf(elig),
      });
    }
  }
}

const comparisonIndexable = day1.filter((r) => r.type === "Comparison").length;

const toolsIndexable = day1
  .filter((r) => ["Finder", "Calculator", "Tool"].includes(r.type))
  .map((r) => r.url)
  .sort();

// --- Running matrix (one row per Running category) ---
const runningCategories = getCategories().filter((c) =>
  c.sportIds.includes(RUN),
);
const matrixRows: string[][] = [];

for (const cat of runningCategories) {
  const products = getProducts(PROD).filter(
    (p) => p.categoryId === cat.id && isRunningSportIds(p.sportIds),
  );
  let productsLr = 0;
  let withMedia = 0;
  let withOffer = 0;
  for (const p of products) {
    if (assessProductLaunchQuality(p, PROD).quality === "LAUNCH_READY")
      productsLr++;
    if (getPrimaryProductMedia(p)) withMedia++;
    if (getOffersForProduct(p.id).length > 0) withOffer++;
  }

  const productIds = new Set(products.map((p) => p.id));
  const reviews = getReviews(PROD).filter((r) => productIds.has(r.productId));
  let reviewsLr = 0;
  let reviewsIndexable = 0;
  for (const r of reviews) {
    if (assessReviewLaunchQuality(r, PROD).quality === "LAUNCH_READY")
      reviewsLr++;
    if (
      isIndexableEligibility(
        getLaunchEligibility({ kind: "review", entity: r }, PROD),
      )
    )
      reviewsIndexable++;
  }

  const bests = getBestGuides(PROD).filter(
    (g) =>
      g.sportId === RUN &&
      (g.categoryId === cat.id || g.categoryIds?.includes(cat.id)),
  );
  let bestLr = 0;
  let bestIndexable = 0;
  for (const g of bests) {
    if (assessBestGuideLaunchQuality(g, PROD).quality === "LAUNCH_READY")
      bestLr++;
    if (
      isIndexableEligibility(
        getLaunchEligibility({ kind: "best-guide", entity: g }, PROD),
      )
    )
      bestIndexable++;
  }

  const guides = getBuyingGuides(PROD).filter(
    (g) => g.sportId === RUN && g.categoryId === cat.id,
  );
  let guidesComplete = 0;
  let guidesIndexable = 0;
  for (const g of guides) {
    if (assessGuideQuality(g).status === "complete") guidesComplete++;
    if (
      isIndexableEligibility(
        getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD),
      )
    )
      guidesIndexable++;
  }

  const comparisons = getComparisons(PROD).filter((c) => {
    if (c.categoryId === cat.id) return true;
    return (c.productIds ?? []).some((id) => productIds.has(id));
  });
  let comparisonsIndexable = 0;
  for (const c of comparisons) {
    if (
      isIndexableEligibility(
        getLaunchEligibility({ kind: "comparison", entity: c }, PROD),
      )
    )
      comparisonsIndexable++;
  }

  const findersTools = getTools(PROD).filter(
    (t) =>
      t.available &&
      (t.categoryIds?.includes(cat.id) ||
        (t.type === "finder" && t.categoryIds?.includes(cat.id))),
  ).length;

  const soft = isSoftGatedCategory(cat);
  const mediaPct =
    products.length === 0
      ? 100
      : Math.round((withMedia / products.length) * 100);
  const offerPct =
    products.length === 0
      ? 100
      : Math.round((withOffer / products.length) * 100);

  const indexableUrlsApprox =
    (soft ? 0 : products.length > 0 ? 1 : 0) +
    products.filter((p) =>
      isIndexableEligibility(
        getLaunchEligibility({ kind: "product", entity: p }, PROD),
      ),
    ).length +
    reviewsIndexable +
    bestIndexable +
    guidesIndexable +
    comparisonsIndexable +
    findersTools;

  let status: "READY" | "READY_WITH_MINOR_ISSUES" | "HOLD" = "READY";
  if (soft) status = "HOLD";
  else if (
    products.length === 0 ||
    productsLr < products.length ||
    mediaPct < 90 ||
    offerPct < 70 ||
    (bests.length > 0 && bestIndexable < bests.length)
  ) {
    status = "READY_WITH_MINOR_ISSUES";
  }

  matrixRows.push([
    cat.slug,
    String(products.length),
    String(productsLr),
    String(reviews.length),
    String(reviewsLr),
    String(reviewsIndexable),
    String(bests.length),
    String(bestLr),
    String(bestIndexable),
    String(guidesComplete),
    String(guidesIndexable),
    String(comparisons.length),
    String(comparisonsIndexable),
    String(findersTools),
    `${withMedia}/${products.length} primary media (${mediaPct}%)`,
    `${withOffer}/${products.length} with offers (${offerPct}%)`,
    String(indexableUrlsApprox),
    status,
  ]);
}

// --- Writes ---
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

const reconRows = [...reconByUrl.values()].sort((a, b) =>
  a.url.localeCompare(b.url),
);
writeCsv(
  join(OUT, "FINAL-URL-RECONCILIATION.csv"),
  [
    "URL",
    "page_type",
    "sport",
    "publication_status",
    "quality_status",
    "launch_eligibility",
    "robots",
    "canonical",
    "HTTP_status",
    "in_sitemap",
    "inbound_internal_links",
    "reason",
  ],
  reconRows.map((r) => [
    r.url,
    r.pageType,
    r.sport,
    r.publicationStatus,
    r.qualityStatus,
    r.launchEligibility,
    r.robots,
    r.canonical,
    r.httpStatus,
    r.inSitemap,
    r.inboundInternalLinks,
    r.reason,
  ]),
);

writeCsv(
  join(OUT, "FINAL-RUNNING-MATRIX.csv"),
  [
    "category_slug",
    "products_total",
    "products_LR",
    "reviews_total",
    "reviews_LR",
    "reviews_indexable",
    "best_total",
    "best_LR",
    "best_indexable",
    "guides_complete",
    "guides_indexable",
    "comparisons_total",
    "comparisons_indexable",
    "finders_tools",
    "media_coverage_note",
    "offer_coverage_note",
    "indexable_urls_approx",
    "status",
  ],
  matrixRows,
);

const byType: Record<string, number> = {};
for (const r of day1) byType[r.type] = (byType[r.type] ?? 0) + 1;

const summary = {
  asOf: AUDIT_NOW.toISOString(),
  auditClock: AUDIT_NOW.toISOString(),
  siteConfigUrl: siteConfig.url,
  sitemapCount: sitemapPaths.size,
  day1Count: day1.length,
  heldCount: held.length,
  sitemapMirror: { onlyInSitemap, onlyInDay1 },
  byType,
  eligibilitySimulation: sim,
  runningCoverage,
  shoes: shoeStats,
  bestIndexableNotLaunchReady,
  reviewLrVsIndexable: {
    launchReady: reviewLaunchReady,
    indexable: reviewIndexable,
    mismatch: reviewLaunchReady - reviewIndexable,
    lrButNotIndexableCount: reviewLrNotIndexable.length,
    lrButNotIndexable: reviewLrNotIndexable.slice(0, 40),
    holdByQuality: reviewHoldByQuality,
    holdByReasonCode: reviewHoldByReasonCode,
    duplicativeHolds: reviewHoldByQuality.DUPLICATIVE ?? 0,
  },
  comparisonIndexable,
  softGatedCategoryPaths: [...new Set(softGatedCategoryPaths)].sort(),
  toolsIndexable,
};

const summaryPath = join(RC, "universe-summary.json");
writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

console.log(
  JSON.stringify(
    {
      summaryPath: "docs/prelaunch/data/rc-final/universe-summary.json",
      sitemapCount: summary.sitemapCount,
      day1Count: summary.day1Count,
      heldCount: summary.heldCount,
      byType,
      shoes: {
        total: shoeStats.total,
        launchReady: shoeStats.launchReady,
        indexable: shoeStats.indexable,
        blocked: shoeStats.blocked,
        nonLr: shoeStats.nonLaunchReadySlugs.length,
      },
      reviewLrVsIndexable: {
        launchReady: reviewLaunchReady,
        indexable: reviewIndexable,
        duplicativeHolds: reviewHoldByQuality.DUPLICATIVE ?? 0,
      },
      bestIndexableNotLaunchReady: bestIndexableNotLaunchReady.length,
      comparisonIndexable,
      toolsIndexable: toolsIndexable.length,
      guidesQualityReady: runningCoverage.Guides.qualityReady,
      sitemapMirror: {
        onlyInSitemap: onlyInSitemap.length,
        onlyInDay1: onlyInDay1.length,
      },
    },
    null,
    2,
  ),
);
