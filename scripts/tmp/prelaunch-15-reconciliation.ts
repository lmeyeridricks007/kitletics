/**
 * Fix 15 — URL-level reconciliation of sitemap vs launch eligibility.
 * Writes docs/prelaunch/data/15-day1-url-reconciliation.csv
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
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

const PROD = { isDev: false as const };
const OUT = join(process.cwd(), "docs/prelaunch/data");
mkdirSync(OUT, { recursive: true });

type Row = {
  url: string;
  pageType: string;
  sport: string;
  publicationStatus: string;
  qualityStatus: string;
  launchEligibility: string;
  robots: string;
  canonical: string;
  inSitemap: string;
  inboundLinks: string;
  reason: string;
};

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function sportFromPath(path: string): string {
  const m = path.match(
    /^\/(running|fitness|padel|tennis|racket|hyrox|gear)(?:\/|$)/,
  );
  return m?.[1] ?? "";
}

function robotsFor(elig: LaunchEligibility | null): string {
  if (!elig) return "index,follow";
  if (elig.disposition === "INDEXABLE") return "index,follow";
  if (elig.disposition === "PUBLIC_NOINDEX") return "noindex,follow";
  return "noindex,nofollow";
}

const sitemapPaths = new Set<string>();
const rows: Row[] = [];

function pushSitemap(
  path: string,
  pageType: string,
  elig: LaunchEligibility | null,
  meta: Partial<Row> = {},
) {
  if (sitemapPaths.has(path)) return;
  if (elig && !isIndexableEligibility(elig)) return;
  sitemapPaths.add(path);
  rows.push({
    url: path,
    pageType,
    sport: meta.sport ?? sportFromPath(path),
    publicationStatus: meta.publicationStatus ?? "published",
    qualityStatus: meta.qualityStatus ?? elig?.quality ?? "N/A",
    launchEligibility: elig?.disposition ?? "INDEXABLE",
    robots: robotsFor(elig),
    canonical: meta.canonical ?? path,
    inSitemap: "yes",
    inboundLinks: meta.inboundLinks ?? "",
    reason:
      meta.reason ??
      (elig?.reasons.map((r) => r.detail ? `${r.code}:${r.detail}` : r.code).join("|") ||
        "sitemap_static_or_discipline"),
  });
}

// Mirror sitemap.ts INDEXABLE surface
pushSitemap("/", "Home", null, { reason: "static_home" });

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
  pushSitemap(p, "Static", null, { reason: "static_trust_or_hub" });
}

for (const sport of getSports()) {
  const elig = getLaunchEligibility({ kind: "sport", entity: sport }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  pushSitemap(`/${sport.slug}`, "Sport", elig, { sport: sport.slug });

  for (const disc of getDisciplines().filter((d) => d.sportId === sport.id)) {
    if (resolveChildSportRedirect(sport, disc.slug)) continue;
    // Disciplines inherit parent sport INDEXABLE (taxonomy, not separate eligibility kind)
    pushSitemap(`/${sport.slug}/${disc.slug}`, "SportDiscipline", elig, {
      sport: sport.slug,
      reason: "discipline_under_indexable_sport_hub",
      qualityStatus: "N/A",
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
    pushSitemap(canonical, "Category", elig, {
      sport: sport.slug,
      reason: "category_under_indexable_sport",
      qualityStatus: "N/A",
    });
  }
}

for (const listing of getUseCaseListingConfigs()) {
  const path = `/${listing.sportSlug}/${listing.categoryPathSegment}/${listing.slug}`;
  // Listings are in sitemap when sport is indexable (mirror sitemap)
  const sport = getSports().find((s) => s.slug === listing.sportSlug);
  if (!sport) continue;
  const elig = getLaunchEligibility({ kind: "sport", entity: sport }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  pushSitemap(path, "Subcategory", elig, {
    sport: listing.sportSlug,
    reason: "use_case_listing",
    qualityStatus: "N/A",
  });
}

for (const product of getProducts(PROD)) {
  const elig = getLaunchEligibility({ kind: "product", entity: product }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  pushSitemap(`/products/${product.slug}`, "Product", elig, {
    sport: product.sportIds.join(","),
    publicationStatus: product.status,
  });

  const gate = canPublishAlternativesPage(
    product,
    getAllProductRelationships(),
  );
  if (!gate.ok) continue;
  const altElig = getLaunchEligibility(
    { kind: "alternatives", entity: product },
    PROD,
  );
  if (!isIndexableEligibility(altElig)) continue;
  pushSitemap(`/products/${product.slug}/alternatives`, "Alternatives", altElig, {
    sport: product.sportIds.join(","),
  });
}

for (const brand of getBrands(PROD)) {
  const elig = getLaunchEligibility({ kind: "brand", entity: brand }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  pushSitemap(`/brands/${brand.slug}`, "Brand", elig);
}

for (const review of getReviews(PROD)) {
  const elig = getLaunchEligibility({ kind: "review", entity: review }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  const product = getProductById(review.productId, PROD);
  pushSitemap(`/reviews/${review.slug}`, "Review", elig, {
    sport: product?.sportIds.join(",") ?? "",
    publicationStatus: review.status,
  });
}

for (const author of getAuthors()) {
  const elig = getLaunchEligibility({ kind: "author", entity: author }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  pushSitemap(`/authors/${author.slug}`, "Author", elig);
}

for (const guide of getBestGuides(PROD)) {
  const elig = getLaunchEligibility({ kind: "best-guide", entity: guide }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  pushSitemap(`/best/${guide.slug}`, "Best", elig, {
    sport: guide.sportId ?? "",
    publicationStatus: guide.status,
  });
}

for (const c of getComparisons(PROD)) {
  const elig = getLaunchEligibility({ kind: "comparison", entity: c }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  pushSitemap(`/compare/${c.slug}`, "Comparison", elig, {
    publicationStatus: c.status,
  });
}

for (const g of getBuyingGuides(PROD)) {
  const elig = getLaunchEligibility({ kind: "buying-guide", entity: g }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  pushSitemap(`/guides/${g.slug}`, "Guide", elig, {
    sport: g.sportId ?? "",
    publicationStatus: g.status,
  });
}

for (const s of getGearSetups(PROD)) {
  const elig = getLaunchEligibility({ kind: "setup", entity: s }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  pushSitemap(`/setups/${s.slug}`, "Setup", elig, {
    sport: s.sportId ?? "",
  });
}

for (const tool of getTools(PROD)) {
  const elig = getLaunchEligibility({ kind: "tool", entity: tool }, PROD);
  if (!isIndexableEligibility(elig)) continue;
  const href = getToolHref(tool);
  const pageType =
    tool.type === "finder"
      ? "Finder"
      : tool.type === "calculator"
        ? "Calculator"
        : "Tool";
  pushSitemap(href, pageType, elig, {
    sport: tool.sportIds?.join(",") ?? "",
  });
}

const header = [
  "url",
  "pageType",
  "sport",
  "publicationStatus",
  "qualityStatus",
  "launchEligibility",
  "robots",
  "canonical",
  "inSitemap",
  "inboundLinks",
  "reason",
];

const csv = [
  header.join(","),
  ...rows.map((r) =>
    header.map((h) => csvEscape(String(r[h as keyof Row] ?? ""))).join(","),
  ),
].join("\n");

writeFileSync(join(OUT, "15-day1-url-reconciliation.csv"), csv + "\n");

const byType = new Map<string, number>();
for (const r of rows) byType.set(r.pageType, (byType.get(r.pageType) ?? 0) + 1);
const running = rows.filter(
  (r) =>
    r.sport.includes("running") ||
    r.url.startsWith("/running") ||
    r.url.includes("sport-running"),
).length;

const sim = simulateDay1LaunchCounts();
const summary = {
  asOf: new Date().toISOString(),
  sitemapUrlCount: rows.length,
  siteConfigUrl: siteConfig.url,
  byPageType: Object.fromEntries([...byType.entries()].sort()),
  runningRelatedApprox: running,
  eligibilitySimulation: sim,
  gapNote:
    "Sitemap URL count exceeds entity INDEXABLE totals because sitemap includes static hubs, sport disciplines, categories, use-case listings, and alternatives — entities not all counted in simulateDay1LaunchCounts().",
};

writeFileSync(
  join(OUT, "15-day1-recalibration-summary.json"),
  JSON.stringify(summary, null, 2),
);

console.log(
  JSON.stringify(
    {
      sitemapUrls: rows.length,
      byPageType: summary.byPageType,
      eligibilityINDEXABLE: sim.totals.INDEXABLE,
      gap: rows.length - sim.totals.INDEXABLE,
    },
    null,
    2,
  ),
);
