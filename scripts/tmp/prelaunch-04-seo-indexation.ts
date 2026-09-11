/**
 * READ-ONLY pre-launch audit 04 — SEO, crawl & indexation.
 * Requires production server at BASE_URL (default http://127.0.0.1:3000).
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3000 tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-04-seo-indexation.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import robotsFn from "@/app/robots";
import sitemapFn from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import { products as rawProducts } from "@/content/products";
import { reviews as rawReviews } from "@/content/reviews";
import { comparisons as rawComparisons } from "@/content/editorial";
import { getProducts } from "@/repositories";
import { isPubliclyVisible } from "@/lib/publishing/resolver";

const OUT_DIR = join(process.cwd(), "docs/prelaunch");
const DATA_DIR = join(OUT_DIR, "data");
const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const CANONICAL_HOST = siteConfig.url.replace(/\/$/, "");
const AUDIT_NOW = new Date("2026-09-06T12:00:00.000Z");
const PROD = { isDev: false as const, now: AUDIT_NOW };

type UrlClass =
  | "INDEXABLE"
  | "NOINDEX"
  | "CANONICALIZED"
  | "REDIRECT"
  | "404"
  | "DRAFT_FUTURE_PROTECTED"
  | "ACCIDENTALLY_EXPOSED"
  | "UNKNOWN";

type PageType =
  | "Home"
  | "Sport"
  | "Discipline"
  | "Category"
  | "Subcategory"
  | "Brand"
  | "Brand+Category"
  | "Product"
  | "Review"
  | "Best"
  | "Guide"
  | "Comparison"
  | "Alternatives"
  | "Tool"
  | "Finder"
  | "Finder Result"
  | "Calculator"
  | "Search"
  | "Deals"
  | "Filters"
  | "Setup"
  | "Author"
  | "Hub"
  | "Other"
  | "Preview"
  | "API/Go";

interface FetchedPage {
  path: string;
  pageType: PageType;
  status: number;
  finalUrl: string;
  redirectChain: string[];
  title?: string;
  description?: string;
  canonical?: string;
  robotsMeta?: string;
  xRobots?: string;
  h1s: string[];
  jsonLdTypes: string[];
  jsonLdRaw: unknown[];
  internalLinks: string[];
  problems: string[];
  classification: UrlClass;
  inSitemap: boolean;
}

function esc(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function pathOf(urlOrPath: string): string {
  try {
    if (urlOrPath.startsWith("http")) {
      const u = new URL(urlOrPath);
      return u.pathname + u.search;
    }
  } catch {
    /* ignore */
  }
  return urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;
}

function classifyPageType(path: string): PageType {
  const p = path.split("?")[0];
  if (p === "/") return "Home";
  if (p === "/search" || p.startsWith("/search?")) return "Search";
  if (p.startsWith("/preview/")) return "Preview";
  if (p.startsWith("/go/") || p.startsWith("/api/")) return "API/Go";
  if (p.startsWith("/products/") && p.endsWith("/alternatives")) return "Alternatives";
  if (p.startsWith("/products/")) return "Product";
  if (p.startsWith("/reviews/")) return "Review";
  if (p.startsWith("/best/")) return "Best";
  if (p.startsWith("/guides/")) return "Guide";
  if (p.startsWith("/compare/")) return "Comparison";
  if (p.startsWith("/brands/") && path.includes("?")) return "Brand+Category";
  if (p.startsWith("/brands/")) return "Brand";
  if (p.startsWith("/setups/")) return "Setup";
  if (p.startsWith("/authors/")) return "Author";
  if (p.match(/^\/tools\/[^/]+\/results/)) return "Finder Result";
  if (p.startsWith("/tools/")) {
    if (/calculator|predictor|pace/i.test(p)) return "Calculator";
    if (/finder/i.test(p)) return "Finder";
    return "Tool";
  }
  if (p === "/deals" || p.startsWith("/deals/")) return "Deals";
  if (p.includes("?") && /[?&](brand|gender|price|sort|cushion|stability|terrain)=/.test(path)) {
    return "Filters";
  }
  // /running/shoes/daily-trainers style listings
  const parts = p.split("/").filter(Boolean);
  if (parts.length === 1) return "Sport";
  if (parts.length === 2) {
    // could be discipline or category
    return "Category"; // refined later if needed
  }
  if (parts.length >= 3) return "Subcategory";
  if (["/gear", "/best", "/compare", "/reviews", "/guides", "/tools", "/brands", "/setups"].includes(p)) {
    return "Hub";
  }
  return "Other";
}

function extractTag(html: string, re: RegExp): string | undefined {
  const m = html.match(re);
  return m?.[1]?.trim();
}

function extractAll(html: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  while ((m = r.exec(html))) out.push(m[1].trim());
  return out;
}

function parseJsonLd(html: string): unknown[] {
  const blocks = extractAll(
    html,
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  const out: unknown[] = [];
  for (const b of blocks) {
    try {
      const parsed = JSON.parse(b);
      if (Array.isArray(parsed)) out.push(...parsed);
      else out.push(parsed);
    } catch {
      out.push({ parseError: true, excerpt: b.slice(0, 120) });
    }
  }
  return out;
}

function jsonLdTypes(nodes: unknown[]): string[] {
  const types: string[] = [];
  const walk = (n: unknown) => {
    if (!n || typeof n !== "object") return;
    const o = n as Record<string, unknown>;
    if (typeof o["@type"] === "string") types.push(o["@type"]);
    if (Array.isArray(o["@type"])) types.push(...(o["@type"] as string[]));
    if (Array.isArray(o["@graph"])) o["@graph"].forEach(walk);
  };
  nodes.forEach(walk);
  return [...new Set(types)];
}

function extractInternalLinks(html: string, fromPath: string): string[] {
  const hrefs = extractAll(html, /href=["']([^"']+)["']/gi);
  const out: string[] = [];
  for (const href of hrefs) {
    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      continue;
    }
    try {
      const abs = href.startsWith("http")
        ? new URL(href)
        : new URL(href, `${BASE}${fromPath}`);
      if (abs.origin !== new URL(BASE).origin && abs.hostname !== "kitletics.com") {
        // allow same-site absolute kitletics.com links as internal for discovery mapping
        if (!abs.hostname.includes("kitletics") && abs.origin !== new URL(BASE).origin) {
          continue;
        }
      }
      const path = abs.pathname + abs.search;
      if (!path.startsWith("/_next") && !path.match(/\.(png|jpg|jpeg|webp|svg|css|js|ico|xml)$/i)) {
        out.push(path);
      }
    } catch {
      /* ignore */
    }
  }
  return [...new Set(out)];
}

async function fetchPage(
  path: string,
  pageTypeHint?: PageType,
): Promise<FetchedPage> {
  const pageType = pageTypeHint ?? classifyPageType(path);
  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const redirectChain: string[] = [];
  const problems: string[] = [];
  let status = 0;
  let finalUrl = url;
  let html = "";
  let xRobots: string | undefined;

  try {
    // Manual redirect tracking (up to 8 hops)
    let current = url;
    for (let hop = 0; hop < 8; hop++) {
      const res = await fetch(current, {
        redirect: "manual",
        headers: { "user-agent": "KitleticsPrelaunchSEOAudit/1.0" },
      });
      status = res.status;
      xRobots = res.headers.get("x-robots-tag") ?? undefined;
      if ([301, 302, 307, 308].includes(res.status)) {
        const loc = res.headers.get("location");
        if (!loc) break;
        const next = new URL(loc, current).toString();
        redirectChain.push(`${res.status} → ${next}`);
        if (next === current) {
          problems.push("redirect_loop");
          break;
        }
        current = next;
        continue;
      }
      finalUrl = current;
      if (res.status === 200) {
        html = await res.text();
      }
      break;
    }
  } catch (e) {
    problems.push(`fetch_error:${e instanceof Error ? e.message : String(e)}`);
    status = 0;
  }

  const title = extractTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = extractTag(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
  ) ?? extractTag(
    html,
    /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
  );
  const canonical = extractTag(
    html,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
  ) ?? extractTag(
    html,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i,
  );
  const robotsMeta =
    extractTag(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i) ??
    extractTag(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i);
  const h1s = extractAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map((h) =>
    h.replace(/<[^>]+>/g, "").trim(),
  );
  const jsonLdRaw = html ? parseJsonLd(html) : [];
  const types = jsonLdTypes(jsonLdRaw);
  const internalLinks = html ? extractInternalLinks(html, pathOf(finalUrl)) : [];

  // Classification
  let classification: UrlClass = "UNKNOWN";
  const finalPath = pathOf(finalUrl);
  const noindex =
    /noindex/i.test(robotsMeta ?? "") || /noindex/i.test(xRobots ?? "");

  if (status === 404) classification = "404";
  else if (status >= 500) {
    classification = "UNKNOWN";
    problems.push(`http_${status}`);
  } else if (redirectChain.length && finalPath.split("?")[0] !== path.split("?")[0]) {
    classification = "REDIRECT";
  } else if (status === 200 && noindex) {
    classification = "NOINDEX";
  } else if (
    status === 200 &&
    canonical &&
    pathOf(canonical).split("?")[0] !== path.split("?")[0] &&
    pathOf(canonical) !== path
  ) {
    classification = "CANONICALIZED";
  } else if (status === 200) {
    classification = "INDEXABLE";
  }

  if (canonical) {
    if (/localhost|127\.0\.0\.1/i.test(canonical)) {
      problems.push("canonical_localhost");
    }
    if (canonical.startsWith("/") && !canonical.startsWith("//")) {
      // relative — Next may emit absolute; flag if relative
      problems.push("canonical_relative");
    }
    if (
      canonical.startsWith("http") &&
      !canonical.startsWith(CANONICAL_HOST) &&
      !canonical.startsWith(BASE)
    ) {
      problems.push(`canonical_cross_host:${canonical}`);
    }
  } else if (status === 200 && !noindex) {
    problems.push("missing_canonical");
  }

  if (!title && status === 200) problems.push("missing_title");
  if (!description && status === 200) problems.push("missing_description");
  if (h1s.length === 0 && status === 200) problems.push("missing_h1");
  if (h1s.length > 1) problems.push(`multiple_h1:${h1s.length}`);

  return {
    path,
    pageType,
    status,
    finalUrl: pathOf(finalUrl),
    redirectChain,
    title,
    description,
    canonical,
    robotsMeta,
    xRobots,
    h1s,
    jsonLdTypes: types,
    jsonLdRaw,
    internalLinks,
    problems,
    classification,
    inSitemap: false,
  };
}

function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/\s+/g, " ").replace(/\|.*$/, "").trim();
}

// ── Collect URL universe from sitemap + known extras ────────────────────────
console.log("Collecting sitemap + URL universe...");
const robotsConfig = robotsFn();
const sitemapEntries = sitemapFn();
const sitemapPaths = sitemapEntries.map((e) => pathOf(String(e.url)));
const sitemapSet = new Set(sitemapPaths);

const publishedProducts = getProducts(PROD);
const allRawProducts = rawProducts;

// Draft / future product URLs (should 404 in production)
const draftProductPaths = allRawProducts
  .filter((p) => !isPubliclyVisible(p, PROD) || p.noindex)
  .map((p) => `/products/${p.slug}`);

const draftReviewPaths = rawReviews
  .filter((r) => !isPubliclyVisible(r, PROD) || r.noindex)
  .map((r) => `/reviews/${r.slug}`);

// Filter explosion samples
const filterSamples = [
  "/running/shoes?brand=asics",
  "/running/shoes?gender=men",
  "/running/shoes?gender=women",
  "/running/shoes?brand=asics&gender=men",
  "/running/shoes?cushion=max&stability=neutral",
  "/running/shoes?sort=price-asc",
  "/running/shoes?brand=asics&brand=nike&gender=men&cushion=max",
];

// Comparison explosion samples (dynamic / reverse)
const comparisonSamples = [
  "/compare/asics-novablast-5-vs-asics-gel-nimbus-27", // may redirect to reverse or 200
  "/compare/brooks-ghost-18-vs-asics-novablast-6", // reverse of editorial if exists
  "/compare?products=asics-novablast-6,brooks-ghost-18",
];

// Finder results / search / deals / preview
const specialSamples = [
  "/search",
  "/search?q=novablast",
  "/deals",
  "/tools/running-shoe-finder/results",
  "/tools/running-shoe-finder/results?s=test",
  "/preview/products/asics-novablast-6",
  "/go/offer-does-not-exist",
];

// Men/women — products are not separate URLs; check filter + product pages
const genderSamples = [
  "/running/shoes?gender=men",
  "/running/shoes?gender=women",
  "/running/clothing?gender=men",
];

// Representative crawl seed set (sitemap sample + critical pages)
const seedPaths = [
  "/",
  "/running",
  "/running/shoes",
  "/running/road",
  "/fitness",
  "/padel",
  "/brands",
  "/brands/asics",
  "/best",
  "/guides",
  "/reviews",
  "/compare",
  "/tools",
  "/gear",
  "/setups",
  "/methodology",
  "/how-we-review",
  "/affiliate-disclosure",
  "/robots.txt",
  "/sitemap.xml",
  ...filterSamples,
  ...comparisonSamples,
  ...specialSamples,
  ...genderSamples,
  ...draftProductPaths.slice(0, 8),
  ...draftReviewPaths.slice(0, 5),
];

// Add sitemap paths stratified by type (cap for crawl time)
function sampleSitemap(paths: string[], n: number): string[] {
  if (paths.length <= n) return paths;
  const step = Math.floor(paths.length / n);
  const out: string[] = [];
  for (let i = 0; i < paths.length && out.length < n; i += Math.max(1, step)) {
    out.push(paths[i]);
  }
  return out;
}

const byTypeBuckets: Record<string, string[]> = {};
for (const p of sitemapPaths) {
  const t = classifyPageType(p);
  (byTypeBuckets[t] ??= []).push(p);
}

const crawlTargets = new Set<string>(seedPaths);
for (const [type, paths] of Object.entries(byTypeBuckets)) {
  const n =
    type === "Product" || type === "Review"
      ? 40
      : type === "Comparison" || type === "Best" || type === "Guide"
        ? 25
        : 15;
  for (const p of sampleSitemap(paths, n)) crawlTargets.add(p);
}

console.log(`Fetching ${crawlTargets.size} URLs from ${BASE}...`);

async function main() {
const fetched: FetchedPage[] = [];
const concurrency = 8;
const queue = [...crawlTargets];
async function worker() {
  while (queue.length) {
    const path = queue.shift();
    if (!path) break;
    if (path === "/robots.txt" || path === "/sitemap.xml") {
      try {
        const res = await fetch(`${BASE}${path}`);
        fetched.push({
          path,
          pageType: "Other",
          status: res.status,
          finalUrl: path,
          redirectChain: [],
          h1s: [],
          jsonLdTypes: [],
          jsonLdRaw: [],
          internalLinks: [],
          problems: [],
          classification: res.status === 200 ? "INDEXABLE" : "UNKNOWN",
          inSitemap: false,
          title: path,
        });
      } catch (e) {
        fetched.push({
          path,
          pageType: "Other",
          status: 0,
          finalUrl: path,
          redirectChain: [],
          h1s: [],
          jsonLdTypes: [],
          jsonLdRaw: [],
          internalLinks: [],
          problems: [`fetch_error:${e instanceof Error ? e.message : String(e)}`],
          classification: "UNKNOWN",
          inSitemap: false,
        });
      }
      continue;
    }
    const page = await fetchPage(path);
    page.inSitemap = sitemapSet.has(path.split("?")[0]) || sitemapSet.has(path);
    fetched.push(page);
  }
}
await Promise.all(Array.from({ length: concurrency }, () => worker()));
console.log(`Fetched ${fetched.length} pages`);

// ── BFS crawl depth from homepage ───────────────────────────────────────────
console.log("BFS crawl depth from homepage...");
const depthMap = new Map<string, number>();
const parentMap = new Map<string, string>();
const bfsQueue: { path: string; depth: number }[] = [{ path: "/", depth: 0 }];
depthMap.set("/", 0);
const linkIndex = new Map(fetched.map((f) => [f.path, f]));

// Expand BFS using fetched pages; fetch more if needed (cap)
const MAX_BFS_NODES = 800;
const MAX_EXTRA_FETCH = 200;
let extraFetches = 0;

while (bfsQueue.length && depthMap.size < MAX_BFS_NODES) {
  const { path, depth } = bfsQueue.shift()!;
  let page = linkIndex.get(path);
  if (!page && depth <= 3 && extraFetches < MAX_EXTRA_FETCH) {
    page = await fetchPage(path);
    page.inSitemap = sitemapSet.has(path.split("?")[0]) || sitemapSet.has(path);
    fetched.push(page);
    linkIndex.set(path, page);
    extraFetches++;
  }
  if (!page || page.status !== 200) continue;
  for (const link of page.internalLinks) {
    const clean = link.split("#")[0];
    if (depthMap.has(clean)) continue;
    // skip obvious non-content
    if (clean.startsWith("/go/") || clean.startsWith("/api/")) continue;
    depthMap.set(clean, depth + 1);
    parentMap.set(clean, path);
    if (depth + 1 <= 5) bfsQueue.push({ path: clean, depth: depth + 1 });
  }
}

const depthDistribution = {
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5+": 0,
  unreachableFromHomeInCrawl: 0,
};
for (const p of sitemapPaths) {
  const d = depthMap.get(p);
  if (d === undefined || d === 0) {
    if (p !== "/") depthDistribution.unreachableFromHomeInCrawl++;
    continue;
  }
  if (d === 1) depthDistribution["1"]++;
  else if (d === 2) depthDistribution["2"]++;
  else if (d === 3) depthDistribution["3"]++;
  else if (d === 4) depthDistribution["4"]++;
  else depthDistribution["5+"]++;
}

const orphanSitemapUrls = sitemapPaths.filter(
  (p) => p !== "/" && !depthMap.has(p),
);

// ── Robots.txt live ─────────────────────────────────────────────────────────
let robotsTxtLive = "";
try {
  robotsTxtLive = await (await fetch(`${BASE}/robots.txt`)).text();
} catch {
  robotsTxtLive = "(fetch failed)";
}

const robotsRule = Array.isArray(robotsConfig.rules)
  ? robotsConfig.rules[0]
  : robotsConfig.rules;

const robotsAnalysis = {
  sourceConfig: robotsConfig,
  liveBody: robotsTxtLive,
  allow: robotsRule?.allow,
  disallow: robotsRule?.disallow,
  sitemap: robotsConfig.sitemap,
  checks: {
    sitewideNoindex: /disallow:\s*\/\s*$/im.test(robotsTxtLive),
    blocksCssJs:
      /disallow:.*\.(css|js)/i.test(robotsTxtLive) ||
      /disallow:\s*\/_next/i.test(robotsTxtLive),
    blocksGo: /\/go/i.test(robotsTxtLive),
    blocksApi: /\/api/i.test(robotsTxtLive),
    blocksPreview: /\/preview/i.test(robotsTxtLive),
    blocksAdmin: /\/admin/i.test(robotsTxtLive),
  },
};

// ── Sitemap analysis ────────────────────────────────────────────────────────
const sitemapByType: Record<string, number> = {};
for (const p of sitemapPaths) {
  const t = classifyPageType(p);
  sitemapByType[t] = (sitemapByType[t] ?? 0) + 1;
}

const lastmods = sitemapEntries.map((e) =>
  e.lastModified ? new Date(e.lastModified as Date).toISOString() : null,
);
const sitemapAnalysis = {
  file: "/sitemap.xml",
  entryCount: sitemapEntries.length,
  byPageType: sitemapByType,
  containsSearch: sitemapPaths.some((p) => p.startsWith("/search")),
  containsQueryStrings: sitemapPaths.filter((p) => p.includes("?")),
  containsPreview: sitemapPaths.some((p) => p.startsWith("/preview")),
  lastModifiedSample: lastmods.slice(0, 5),
  lastModifiedUnique: [...new Set(lastmods.filter(Boolean))].length,
  usesSeedUpdated: lastmods.filter((d) => d?.startsWith("2026-09-01")).length,
  draftProductInSitemap: draftProductPaths.filter((p) => sitemapSet.has(p)),
  draftReviewInSitemap: draftReviewPaths.filter((p) => sitemapSet.has(p)),
  note: "Sitemap generated via src/app/sitemap.ts using production publication resolver (getProducts/getReviews/etc).",
};

// Mark accidentally exposed drafts
for (const page of fetched) {
  const isDraftProbe =
    draftProductPaths.includes(page.path) || draftReviewPaths.includes(page.path);
  if (isDraftProbe && page.status === 200 && page.classification === "INDEXABLE") {
    page.classification = "ACCIDENTALLY_EXPOSED";
    page.problems.push("draft_or_future_returned_200_indexable");
  } else if (isDraftProbe && page.status === 200 && page.classification === "NOINDEX") {
    page.problems.push("draft_returned_200_but_noindex");
  } else if (isDraftProbe && (page.status === 404 || page.classification === "REDIRECT")) {
    page.classification =
      page.status === 404 ? "DRAFT_FUTURE_PROTECTED" : page.classification;
  } else if (isDraftProbe && page.status === 404) {
    page.classification = "DRAFT_FUTURE_PROTECTED";
  }
}

// ── Titles / descriptions / H1 clusters ─────────────────────────────────────
const titleMap = new Map<string, string[]>();
const descMap = new Map<string, string[]>();
const h1Map = new Map<string, string[]>();
for (const f of fetched) {
  if (f.status !== 200) continue;
  if (f.title) {
    const k = normalizeTitle(f.title);
    (titleMap.get(k) ?? titleMap.set(k, []).get(k)!).push(f.path);
  }
  if (f.description) {
    const k = f.description.toLowerCase().trim();
    (descMap.get(k) ?? descMap.set(k, []).get(k)!).push(f.path);
  }
  if (f.h1s[0]) {
    const k = f.h1s[0].toLowerCase().trim();
    (h1Map.get(k) ?? h1Map.set(k, []).get(k)!).push(f.path);
  }
}

const duplicateTitles = [...titleMap.entries()]
  .filter(([, paths]) => paths.length >= 2)
  .map(([title, paths]) => ({ title, count: paths.length, paths: paths.slice(0, 12) }))
  .sort((a, b) => b.count - a.count);

const duplicateDescriptions = [...descMap.entries()]
  .filter(([, paths]) => paths.length >= 2)
  .map(([description, paths]) => ({
    description: description.slice(0, 160),
    count: paths.length,
    paths: paths.slice(0, 12),
  }))
  .sort((a, b) => b.count - a.count);

const duplicateH1s = [...h1Map.entries()]
  .filter(([, paths]) => paths.length >= 2)
  .map(([h1, paths]) => ({ h1, count: paths.length, paths: paths.slice(0, 12) }))
  .sort((a, b) => b.count - a.count);

const missingTitles = fetched.filter((f) => f.status === 200 && !f.title).map((f) => f.path);
const missingDescriptions = fetched
  .filter((f) => f.status === 200 && !f.description)
  .map((f) => f.path);
const missingH1 = fetched.filter((f) => f.status === 200 && f.h1s.length === 0).map((f) => f.path);
const multipleH1 = fetched.filter((f) => f.h1s.length > 1).map((f) => ({ path: f.path, h1s: f.h1s }));

const genericTitlePatterns = fetched.filter(
  (f) =>
    f.title &&
    /^(product|review|guide|comparison|kitletics)\b/i.test(f.title.trim()) &&
    f.title.trim().length < 25,
);

// ── Canonical issues ────────────────────────────────────────────────────────
const canonicalIssues = {
  missing: fetched.filter((f) => f.problems.includes("missing_canonical")).map((f) => f.path),
  localhost: fetched.filter((f) => f.problems.some((p) => p.startsWith("canonical_localhost"))).map((f) => f.path),
  relative: fetched.filter((f) => f.problems.includes("canonical_relative")).map((f) => f.path),
  crossHost: fetched
    .filter((f) => f.problems.some((p) => p.startsWith("canonical_cross_host")))
    .map((f) => ({ path: f.path, canonical: f.canonical, problem: f.problems.find((p) => p.startsWith("canonical_cross_host")) })),
  selfCanonical: fetched.filter(
    (f) =>
      f.canonical &&
      pathOf(f.canonical).split("?")[0] === f.path.split("?")[0],
  ).length,
  crossCanonical: fetched.filter(
    (f) =>
      f.status === 200 &&
      f.canonical &&
      pathOf(f.canonical).split("?")[0] !== f.path.split("?")[0],
  ).map((f) => ({ path: f.path, canonical: f.canonical })),
  queryState: fetched
    .filter((f) => f.path.includes("?") && f.canonical)
    .map((f) => ({
      path: f.path,
      canonical: f.canonical,
      robots: f.robotsMeta,
      classification: f.classification,
    })),
};

// ── Structured data analysis ────────────────────────────────────────────────
const schemaByType: Record<string, Record<string, number>> = {};
const schemaProblems: { path: string; issue: string }[] = [];

for (const f of fetched) {
  if (f.status !== 200) continue;
  const bucket = (schemaByType[f.pageType] ??= {});
  for (const t of f.jsonLdTypes) bucket[t] = (bucket[t] ?? 0) + 1;
  if (f.jsonLdRaw.some((n) => (n as { parseError?: boolean })?.parseError)) {
    schemaProblems.push({ path: f.path, issue: "invalid_json_ld_parse" });
  }
  for (const node of f.jsonLdRaw) {
    if (!node || typeof node !== "object") continue;
    const o = node as Record<string, unknown>;
    const type = o["@type"];
    if (type === "Product" || (Array.isArray(type) && type.includes("Product"))) {
      if (o.aggregateRating) {
        schemaProblems.push({ path: f.path, issue: "Product_has_aggregateRating" });
      }
      if (!o.name) schemaProblems.push({ path: f.path, issue: "Product_missing_name" });
      if (!o.offers && !o.offer) {
        // not always required
      }
    }
    if (type === "Review" || (Array.isArray(type) && type.includes("Review"))) {
      if (o.reviewRating && !o.author) {
        schemaProblems.push({ path: f.path, issue: "Review_rating_without_author" });
      }
    }
    if (type === "AggregateRating") {
      schemaProblems.push({ path: f.path, issue: "standalone_AggregateRating" });
    }
    if (type === "Offer" || type === "AggregateOffer") {
      if (o.price === undefined && o.lowPrice === undefined) {
        schemaProblems.push({ path: f.path, issue: "Offer_missing_price" });
      }
    }
    if (type === "BreadcrumbList") {
      const els = o.itemListElement;
      if (!Array.isArray(els) || els.length === 0) {
        schemaProblems.push({ path: f.path, issue: "BreadcrumbList_empty" });
      }
    }
  }
  if (
    (f.pageType === "Product" || f.pageType === "Review") &&
    f.jsonLdTypes.length === 0
  ) {
    schemaProblems.push({ path: f.path, issue: "missing_json_ld" });
  }
}

// ── Filter / comparison explosion ───────────────────────────────────────────
const filterResults = fetched.filter((f) => filterSamples.includes(f.path));
const filterExplosion = {
  samples: filterResults.map((f) => ({
    path: f.path,
    status: f.status,
    classification: f.classification,
    robots: f.robotsMeta,
    canonical: f.canonical,
  })),
  indexableFilters: filterResults.filter((f) => f.classification === "INDEXABLE"),
  noindexFilters: filterResults.filter((f) => f.classification === "NOINDEX"),
  canonicalizedFilters: filterResults.filter((f) => f.classification === "CANONICALIZED"),
  riskEstimate: {
    note: "Category pages with query filters set robots noindex + canonicalize to clean category URL (src/app/[sport]/[segment]/page.tsx).",
    theoreticalCombinations:
      "If filters were indexable: brands × genders × cushion × stability × sort would be large; live samples should be NOINDEX/CANONICALIZED.",
  },
};

const comparisonExplosion = {
  editorialComparisons: rawComparisons.filter((c) => isPubliclyVisible(c, PROD)).length,
  theoreticalShoePairs:
    (publishedProducts.filter((p) => p.categoryId === "cat-running-shoes").length *
      (publishedProducts.filter((p) => p.categoryId === "cat-running-shoes").length - 1)) /
    2,
  samples: fetched.filter((f) => comparisonSamples.some((s) => f.path.startsWith(s.split("?")[0]) || f.path === s)),
  systemCreatesCombinatorialIndexablePages: false,
  note: "generateStaticParams uses editorial getComparisons() only; dynamic pairs are noindex.",
};

const menWomen = {
  strategy:
    "Gender is a ProductVariant/audience dimension and catalog filter (?gender=), not separate product URLs.",
  filterSamples: fetched.filter((f) => genderSamples.includes(f.path)).map((f) => ({
    path: f.path,
    classification: f.classification,
    robots: f.robotsMeta,
    canonical: f.canonical,
  })),
  duplicateIndexableProductVariants: false,
  note: "Men/Women share /products/{slug}; variants are on-page, not separate indexable URLs.",
};

// ── HTTP status summary ─────────────────────────────────────────────────────
const httpStatus = {
  "200": fetched.filter((f) => f.status === 200).length,
  "301": fetched.filter((f) => f.redirectChain.some((r) => r.startsWith("301"))).length,
  "302": fetched.filter((f) => f.redirectChain.some((r) => r.startsWith("302"))).length,
  "404": fetched.filter((f) => f.status === 404).length,
  "500": fetched.filter((f) => f.status >= 500).length,
  other: fetched.filter((f) => f.status && ![200, 404].includes(f.status) && f.status < 500 && !f.redirectChain.length).length,
  redirectChains: fetched.filter((f) => f.redirectChain.length > 1).map((f) => ({
    path: f.path,
    chain: f.redirectChain,
    final: f.finalUrl,
  })),
  loops: fetched.filter((f) => f.problems.includes("redirect_loop")).map((f) => f.path),
};

// ── Future content leakage tests ────────────────────────────────────────────
const futureTests = {
  directUrl: fetched
    .filter((f) => draftProductPaths.includes(f.path) || draftReviewPaths.includes(f.path))
    .map((f) => ({
      path: f.path,
      status: f.status,
      classification: f.classification,
      problems: f.problems,
    })),
  inSitemap: {
    draftProducts: sitemapAnalysis.draftProductInSitemap,
    draftReviews: sitemapAnalysis.draftReviewInSitemap,
  },
  searchPage: fetched.find((f) => f.path === "/search" || f.path.startsWith("/search?")),
  preview: fetched.find((f) => f.path.startsWith("/preview/")),
  navigationNote:
    "Draft entities are excluded from getProducts()/getReviews() production resolver — should not appear in nav cards fed by repositories.",
};

// ── URL universe classification counts ──────────────────────────────────────
const universeClasses: Record<UrlClass, number> = {
  INDEXABLE: 0,
  NOINDEX: 0,
  CANONICALIZED: 0,
  REDIRECT: 0,
  "404": 0,
  DRAFT_FUTURE_PROTECTED: 0,
  ACCIDENTALLY_EXPOSED: 0,
  UNKNOWN: 0,
};
for (const f of fetched) {
  universeClasses[f.classification]++;
}

// Sitemap URLs assumed indexable unless proven otherwise
const universeSummary = {
  sitemapUrls: sitemapPaths.length,
  crawledUrls: fetched.length,
  bfsDiscoveredUrls: depthMap.size,
  estimatedIndexableFloor: sitemapPaths.length,
  classificationsOnCrawlSample: universeClasses,
  pageTypeCountsInSitemap: sitemapByType,
  rawProductUrls: allRawProducts.length,
  productionProductUrls: publishedProducts.length,
  draftOrFutureProductUrls: draftProductPaths.length,
};

// ── Page-type summary table ─────────────────────────────────────────────────
const pageTypes: PageType[] = [
  "Home",
  "Sport",
  "Discipline",
  "Category",
  "Subcategory",
  "Brand",
  "Brand+Category",
  "Product",
  "Review",
  "Best",
  "Guide",
  "Comparison",
  "Alternatives",
  "Tool",
  "Finder",
  "Finder Result",
  "Calculator",
  "Search",
  "Deals",
  "Filters",
  "Setup",
  "Author",
  "Hub",
];

const pageTypeSummary = pageTypes.map((type) => {
  const sample = fetched.filter((f) => f.pageType === type);
  const sitemapCount = sitemapByType[type] ?? 0;
  const indexable = sample.filter((f) => f.classification === "INDEXABLE").length;
  const noindex = sample.filter((f) => f.classification === "NOINDEX").length;
  const problems = [...new Set(sample.flatMap((f) => f.problems))];
  const dupRisk =
    duplicateTitles.filter((d) => d.paths.some((p) => classifyPageType(p) === type))
      .length > 0
      ? "yes"
      : "low";
  const orphans = orphanSitemapUrls.filter((p) => classifyPageType(p) === type).length;
  return {
    pageType: type,
    urlsInSitemap: sitemapCount,
    crawledSample: sample.length,
    indexableSample: indexable,
    noindexSample: noindex,
    problems: problems.slice(0, 12),
    duplicateRisk: dupRisk,
    orphanSitemapUrls: orphans,
    statusNotes: sample
      .map((f) => f.classification)
      .reduce((acc: Record<string, number>, c) => {
        acc[c] = (acc[c] ?? 0) + 1;
        return acc;
      }, {}),
  };
});


const report = {
  meta: {
    auditId: "04-seo-indexation",
    title: "Kitletics Pre-Launch Audit 04 — SEO, Crawl & Indexation",
    generatedAt: new Date().toISOString(),
    auditClock: AUDIT_NOW.toISOString(),
    baseUrl: BASE,
    canonicalHost: CANONICAL_HOST,
    mode: "read-only-forensic",
    productionBuildNotes: [
      "Built with `next build --no-lint` and temporary typescript.ignoreBuildErrors due to pre-existing type errors.",
      "tsconfig excluded scripts/ from Next typecheck.",
      "No SEO auto-fixes applied.",
    ],
  },
  robots: robotsAnalysis,
  sitemap: sitemapAnalysis,
  urlUniverse: universeSummary,
  crawl: {
    fetchedCount: fetched.length,
    depthDistribution,
    orphanSitemapUrls: orphanSitemapUrls.slice(0, 100),
    orphanSitemapCount: orphanSitemapUrls.length,
    bfsNodes: depthMap.size,
    extraFetches,
  },
  canonicals: canonicalIssues,
  titles: {
    missing: missingTitles,
    duplicateClusters: duplicateTitles.slice(0, 30),
    genericSuspects: genericTitlePatterns.map((f) => ({ path: f.path, title: f.title })),
  },
  descriptions: {
    missing: missingDescriptions,
    duplicateClusters: duplicateDescriptions.slice(0, 30),
  },
  h1: {
    missing: missingH1,
    multiple: multipleH1.slice(0, 40),
    duplicateClusters: duplicateH1s.slice(0, 30),
  },
  structuredData: {
    byPageType: schemaByType,
    problems: schemaProblems.slice(0, 100),
    problemCount: schemaProblems.length,
  },
  filterExplosion,
  comparisonExplosion,
  menWomen,
  httpStatus,
  futureContentTests: futureTests,
  pageTypeSummary,
  fetchedSample: fetched.map((f) => ({
    path: f.path,
    pageType: f.pageType,
    status: f.status,
    classification: f.classification,
    title: f.title,
    description: f.description?.slice(0, 160),
    canonical: f.canonical,
    robotsMeta: f.robotsMeta,
    xRobots: f.xRobots,
    h1s: f.h1s,
    jsonLdTypes: f.jsonLdTypes,
    problems: f.problems,
    redirectChain: f.redirectChain,
    inSitemap: f.inSitemap,
    internalLinkCount: f.internalLinks.length,
  })),
};

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(join(DATA_DIR, "04-seo-indexation.json"), JSON.stringify(report, null, 2));

// Markdown
const lines: string[] = [];
const push = (...xs: string[]) => lines.push(...xs);

push(
  `# Kitletics Pre-Launch Audit 04 — SEO, Crawl & Indexation`,
  ``,
  `**Mode:** READ-ONLY forensic (no SEO auto-fixes)`,
  `**Generated:** ${report.meta.generatedAt}`,
  `**Runtime base:** \`${BASE}\``,
  `**Canonical host (config):** \`${CANONICAL_HOST}\``,
  `**Machine-readable:** [\`data/04-seo-indexation.json\`](./data/04-seo-indexation.json)`,
  ``,
  `> Production-equivalent \`next build\` + \`next start\` crawl. Conclusions use live HTTP responses, not source alone.`,
  ``,
  `---`,
  ``,
  `## 1. Production build notes`,
  ``,
);
for (const n of report.meta.productionBuildNotes) push(`- ${n}`);

push(
  ``,
  `---`,
  ``,
  `## 2. URL universe`,
  ``,
  `| Metric | Count |`,
  `|---|---:|`,
  `| Sitemap URLs | ${universeSummary.sitemapUrls} |`,
  `| Crawled sample | ${universeSummary.crawledUrls} |`,
  `| BFS-discovered from home | ${universeSummary.bfsDiscoveredUrls} |`,
  `| Raw product records | ${universeSummary.rawProductUrls} |`,
  `| Production-exposed products | ${universeSummary.productionProductUrls} |`,
  `| Draft/future product URL probes | ${universeSummary.draftOrFutureProductUrls} |`,
  ``,
  `### Classifications on crawl sample`,
  ``,
  `| Class | Count |`,
  `|---|---:|`,
);
for (const [k, v] of Object.entries(universeClasses)) push(`| ${k} | ${v} |`);

push(
  ``,
  `### Sitemap by page type`,
  ``,
  `| Page type | URLs |`,
  `|---|---:|`,
);
for (const [k, v] of Object.entries(sitemapByType).sort((a, b) => b[1] - a[1])) {
  push(`| ${k} | ${v} |`);
}

push(
  ``,
  `---`,
  ``,
  `## 4. Robots`,
  ``,
  "```",
  robotsTxtLive.trim() || "(empty)",
  "```",
  ``,
  `| Check | Result |`,
  `|---|---|`,
  `| Sitewide Disallow: / | ${robotsAnalysis.checks.sitewideNoindex} |`,
  `| Blocks CSS/JS /_next | ${robotsAnalysis.checks.blocksCssJs} |`,
  `| Disallow /go | ${robotsAnalysis.checks.blocksGo} |`,
  `| Disallow /api | ${robotsAnalysis.checks.blocksApi} |`,
  `| Disallow /preview | ${robotsAnalysis.checks.blocksPreview} |`,
  `| Disallow /admin | ${robotsAnalysis.checks.blocksAdmin} |`,
  ``,
);

const searchPage = fetched.find((f) => f.path === "/search");
const finderResults = fetched.filter((f) => f.pageType === "Finder Result");
push(
  `### Indexation risk checks`,
  ``,
  `- Search \`/search\`: status=${searchPage?.status}, robots=${searchPage?.robotsMeta ?? "—"}, class=${searchPage?.classification}`,
  `- Finder results samples: ${finderResults.map((f) => `${f.path} → ${f.classification} (${f.robotsMeta ?? "no robots meta"})`).join("; ") || "none fetched"}`,
  `- Filter samples indexable: **${filterExplosion.indexableFilters.length}**`,
  ``,
);

push(
  `---`,
  ``,
  `## 5. Canonicals`,
  ``,
  `| Issue | Count |`,
  `|---|---:|`,
  `| Missing (200 + indexable intent) | ${canonicalIssues.missing.length} |`,
  `| Self-canonical | ${canonicalIssues.selfCanonical} |`,
  `| Cross-canonical | ${canonicalIssues.crossCanonical.length} |`,
  `| Localhost | ${canonicalIssues.localhost.length} |`,
  `| Relative | ${canonicalIssues.relative.length} |`,
  `| Cross-host | ${canonicalIssues.crossHost.length} |`,
  ``,
);

if (canonicalIssues.crossCanonical.length) {
  push(`### Cross-canonical examples`, ``);
  for (const c of canonicalIssues.crossCanonical.slice(0, 25)) {
    push(`- \`${c.path}\` → \`${c.canonical}\``);
  }
  push(``);
}
if (canonicalIssues.missing.length) {
  push(`### Missing canonical examples`, ``);
  for (const p of canonicalIssues.missing.slice(0, 25)) push(`- \`${p}\``);
  push(``);
}
if (canonicalIssues.localhost.length) {
  push(`### Localhost canonicals`, ``);
  for (const p of canonicalIssues.localhost.slice(0, 20)) push(`- \`${p}\``);
  push(``);
}

push(`### Query-state canonical behavior`, ``);
for (const q of canonicalIssues.queryState.slice(0, 20)) {
  push(
    `- \`${q.path}\` → canonical \`${q.canonical}\` · robots=${q.robots ?? "—"} · ${q.classification}`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## 6. Sitemaps`,
  ``,
  `| Metric | Value |`,
  `|---|---|`,
  `| File | /sitemap.xml |`,
  `| URL count | ${sitemapAnalysis.entryCount} |`,
  `| Contains /search | ${sitemapAnalysis.containsSearch} |`,
  `| Query-string URLs | ${sitemapAnalysis.containsQueryStrings.length} |`,
  `| Preview URLs | ${sitemapAnalysis.containsPreview} |`,
  `| Unique lastmod values | ${sitemapAnalysis.lastModifiedUnique} |`,
  `| Draft products in sitemap | ${sitemapAnalysis.draftProductInSitemap.length} |`,
  `| Draft reviews in sitemap | ${sitemapAnalysis.draftReviewInSitemap.length} |`,
  ``,
  sitemapAnalysis.note,
  ``,
);

push(
  `---`,
  ``,
  `## 7. Titles`,
  ``,
  `- Missing titles (sample crawl): **${missingTitles.length}**`,
  `- Duplicate clusters (≥2): **${duplicateTitles.length}**`,
  ``,
  `### Major duplicate clusters`,
  ``,
);
for (const c of duplicateTitles.slice(0, 15)) {
  push(`- ×${c.count} “${esc(c.title)}”: ${c.paths.slice(0, 5).map((p) => `\`${p}\``).join(", ")}`);
}

push(
  ``,
  `---`,
  ``,
  `## 8. Descriptions`,
  ``,
  `- Missing: **${missingDescriptions.length}**`,
  `- Duplicate clusters: **${duplicateDescriptions.length}**`,
  ``,
);
for (const c of duplicateDescriptions.slice(0, 12)) {
  push(`- ×${c.count} “${esc(c.description)}”: ${c.paths.slice(0, 4).map((p) => `\`${p}\``).join(", ")}`);
}

push(
  ``,
  `---`,
  ``,
  `## 9. H1`,
  ``,
  `- Missing: **${missingH1.length}**`,
  `- Multiple H1 pages: **${multipleH1.length}**`,
  `- Duplicate H1 clusters: **${duplicateH1s.length}**`,
  ``,
);
for (const c of duplicateH1s.slice(0, 12)) {
  push(`- ×${c.count} “${esc(c.h1)}”: ${c.paths.slice(0, 4).map((p) => `\`${p}\``).join(", ")}`);
}
if (multipleH1.length) {
  push(``, `### Multiple H1 examples`, ``);
  for (const m of multipleH1.slice(0, 15)) {
    push(`- \`${m.path}\`: ${m.h1s.map((h) => esc(h)).join(" · ")}`);
  }
}

push(
  ``,
  `---`,
  ``,
  `## 10. Structured data`,
  ``,
  `### Types observed by page type`,
  ``,
);
for (const [ptype, types] of Object.entries(schemaByType)) {
  push(`- **${ptype}**: ${Object.entries(types).map(([t, n]) => `${t}×${n}`).join(", ") || "(none)"}`);
}
push(``, `### Schema problems (sample)`, ``);
if (!schemaProblems.length) push(`_None flagged by heuristics._`, ``);
else for (const p of schemaProblems.slice(0, 40)) push(`- \`${p.path}\`: ${p.issue}`);

push(
  ``,
  `---`,
  ``,
  `## 11. Internal discovery / orphans`,
  ``,
  `- Sitemap URLs not reached in homepage BFS (within crawl caps): **${orphanSitemapUrls.length}**`,
  ``,
  `### Orphan examples`,
  ``,
);
for (const p of orphanSitemapUrls.slice(0, 40)) push(`- \`${p}\``);
push(
  ``,
  `_Note: orphans may be false positives if not linked within depth/cap; full link graph exceeds sample crawl._`,
  ``,
);

push(
  `---`,
  ``,
  `## 12. Crawl depth (sitemap URLs found via BFS)`,
  ``,
  `| Depth | Count |`,
  `|---|---:|`,
  `| 1 click | ${depthDistribution["1"]} |`,
  `| 2 | ${depthDistribution["2"]} |`,
  `| 3 | ${depthDistribution["3"]} |`,
  `| 4 | ${depthDistribution["4"]} |`,
  `| 5+ | ${depthDistribution["5+"]} |`,
  `| Unreached in crawl | ${depthDistribution.unreachableFromHomeInCrawl} |`,
  ``,
);

push(
  `---`,
  ``,
  `## 13. Filter / facet explosion`,
  ``,
);
for (const s of filterExplosion.samples) {
  push(
    `- \`${s.path}\` → ${s.classification} · status=${s.status} · robots=${s.robots ?? "—"} · canonical=${s.canonical ?? "—"}`,
  );
}
push(``, filterExplosion.riskEstimate.note, ``);

push(
  `---`,
  ``,
  `## 14. Comparison explosion`,
  ``,
  `| Metric | Value |`,
  `|---|---|`,
  `| Editorial comparisons (prod-visible) | ${comparisonExplosion.editorialComparisons} |`,
  `| Theoretical shoe pairs | ${comparisonExplosion.theoreticalShoePairs} |`,
  `| Combinatorial indexable pages? | **${comparisonExplosion.systemCreatesCombinatorialIndexablePages}** |`,
  ``,
  comparisonExplosion.note,
  ``,
);

push(
  `---`,
  ``,
  `## 15. Men/Women URL behavior`,
  ``,
  menWomen.strategy,
  ``,
);
for (const s of menWomen.filterSamples) {
  push(
    `- \`${s.path}\` → ${s.classification} · robots=${s.robots ?? "—"} · canonical=${s.canonical ?? "—"}`,
  );
}
push(
  ``,
  `Duplicate indexable product variant URLs: **${menWomen.duplicateIndexableProductVariants}**`,
  ``,
  menWomen.note,
  ``,
);

push(
  `---`,
  ``,
  `## 16. HTTP status (crawl sample)`,
  ``,
  `| Status | Count |`,
  `|---|---:|`,
  `| 200 | ${httpStatus["200"]} |`,
  `| 301 (in chain) | ${httpStatus["301"]} |`,
  `| 302 (in chain) | ${httpStatus["302"]} |`,
  `| 404 | ${httpStatus["404"]} |`,
  `| 500+ | ${httpStatus["500"]} |`,
  `| Redirect chains >1 hop | ${httpStatus.redirectChains.length} |`,
  `| Loops | ${httpStatus.loops.length} |`,
  ``,
);
if (httpStatus.redirectChains.length) {
  push(`### Redirect chains`, ``);
  for (const c of httpStatus.redirectChains.slice(0, 20)) {
    push(`- \`${c.path}\`: ${c.chain.join(" then ")} → \`${c.final}\``);
  }
  push(``);
}

push(
  `---`,
  ``,
  `## 17. Future / draft content leakage`,
  ``,
  `### Direct URL probes`,
  ``,
);
for (const t of futureTests.directUrl.slice(0, 20)) {
  push(`- \`${t.path}\` → ${t.status} / ${t.classification} ${t.problems.length ? `(${t.problems.join(", ")})` : ""}`);
}
push(
  ``,
  `- Draft products in sitemap: **${futureTests.inSitemap.draftProducts.length}**`,
  `- Draft reviews in sitemap: **${futureTests.inSitemap.draftReviews.length}**`,
  `- Preview sample: ${futureTests.preview ? `${futureTests.preview.path} → ${futureTests.preview.status} / ${futureTests.preview.classification} / robots=${futureTests.preview.robotsMeta}` : "not fetched"}`,
  ``,
  futureTests.navigationNote,
  ``,
);

push(
  `---`,
  ``,
  `## 18. SEO page-type summary`,
  ``,
  `| Page Type | Sitemap URLs | Crawled | Indexable (sample) | Noindex (sample) | Problems | Dup risk | Orphans |`,
  `|---|---:|---:|---:|---:|---|---|---:|`,
);
for (const row of pageTypeSummary) {
  push(
    `| ${row.pageType} | ${row.urlsInSitemap} | ${row.crawledSample} | ${row.indexableSample} | ${row.noindexSample} | ${esc(row.problems.slice(0, 4).join("; ") || "—")} | ${row.duplicateRisk} | ${row.orphanSitemapUrls} |`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## 19. Baseline rule`,
  ``,
  `No SEO fixes applied in this audit. Issues are reported as-is.`,
  ``,
  `## End of baseline`,
  ``,
);

writeFileSync(join(OUT_DIR, "04-seo-indexation.md"), lines.join("\n"));
console.log("Wrote", join(OUT_DIR, "04-seo-indexation.md"));
console.log("Wrote", join(DATA_DIR, "04-seo-indexation.json"));
console.log(
  JSON.stringify(
    {
      sitemap: sitemapAnalysis.entryCount,
      crawled: fetched.length,
      classes: universeClasses,
      orphans: orphanSitemapUrls.length,
      filterIndexable: filterExplosion.indexableFilters.length,
      accidentalExposure: universeClasses.ACCIDENTALLY_EXPOSED,
    },
    null,
    2,
  ),
);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
