/**
 * READ-ONLY pre-launch audit 05 — site architecture, internal links & topical coverage.
 * Requires production server at BASE_URL (default http://127.0.0.1:3010).
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3010 tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-05-architecture-links.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import sitemapFn from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import {
  getProducts,
  getSports,
  getCategories,
  getReviews,
  getBestGuides,
  getComparisons,
  getBuyingGuides,
  getTools,
  getAllProductRelationships,
} from "@/repositories";
import { isAlternativeType } from "@/domain/relationships/types";

const OUT_DIR = join(process.cwd(), "docs/prelaunch");
const DATA_DIR = join(OUT_DIR, "data");
const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(/\/$/, "");
const CANONICAL_HOST = siteConfig.url.replace(/\/$/, "");
const AUDIT_NOW = new Date("2026-09-06T12:00:00.000Z");
const PROD = { isDev: false as const, now: AUDIT_NOW };
const CONCURRENCY = 16;

type PageType =
  | "Home"
  | "Sport"
  | "Category"
  | "Subcategory"
  | "Brand"
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
  | "Setup"
  | "Author"
  | "Hub"
  | "Gear"
  | "Other"
  | "Legal"
  | "Filters";

interface Edge {
  from: string;
  to: string;
  anchor: string;
  contextual: boolean;
}

interface NodeMeta {
  path: string;
  pageType: PageType;
  status: number;
  robotsMeta?: string;
  indexable: boolean;
  inSitemap: boolean;
  title?: string;
  outbound: number;
  inbound: number;
  inboundContextual: number;
  depthFromHome?: number | null;
  isRunningCluster: boolean;
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

function normalizePath(p: string): string {
  const noHash = p.split("#")[0];
  if (!noHash || noHash === "/") return "/";
  // strip trailing slash except root
  return noHash.length > 1 && noHash.endsWith("/") ? noHash.slice(0, -1) : noHash;
}

function classifyPageType(path: string): PageType {
  const raw = normalizePath(path);
  const p = raw.split("?")[0];
  if (p === "/") return "Home";
  if (p === "/search" || p.startsWith("/search?")) return "Search";
  if (["/privacy", "/terms", "/affiliate-disclosure", "/contact", "/about", "/methodology", "/how-we-review"].includes(p))
    return "Legal";
  if (p.startsWith("/products/") && p.endsWith("/alternatives")) return "Alternatives";
  if (p.startsWith("/products/")) return "Product";
  if (p.startsWith("/reviews/") && p !== "/reviews") return "Review";
  if (p === "/reviews") return "Hub";
  if (p.startsWith("/best/") && p !== "/best") return "Best";
  if (p === "/best") return "Hub";
  if (p.startsWith("/guides/") && p !== "/guides") return "Guide";
  if (p === "/guides") return "Hub";
  if (p.startsWith("/compare/") && p !== "/compare") return "Comparison";
  if (p === "/compare") return "Hub";
  if (p.startsWith("/brands/") && p !== "/brands") return "Brand";
  if (p === "/brands") return "Hub";
  if (p.startsWith("/setups/")) return "Setup";
  if (p === "/setups") return "Hub";
  if (p.startsWith("/authors/")) return "Author";
  if (p.match(/^\/tools\/[^/]+\/results/)) return "Finder Result";
  if (p.startsWith("/tools/")) {
    if (/calculator|predictor|pace/i.test(p)) return "Calculator";
    if (/finder/i.test(p)) return "Finder";
    return "Tool";
  }
  if (p === "/tools" || p === "/finders") return "Hub";
  if (p === "/gear" || p.startsWith("/gear/")) return "Gear";
  if (["/running", "/padel", "/fitness", "/tennis", "/pickleball"].includes(p)) return "Sport";
  if (raw.includes("?") && /[?&](brand|gender|price|sort|cushion|stability|terrain|surface)=/.test(raw)) {
    return "Filters";
  }
  const parts = p.split("/").filter(Boolean);
  if (parts.length === 1) return "Sport";
  if (parts.length === 2) return "Category";
  if (parts.length >= 3) return "Subcategory";
  return "Other";
}

function stripTags(s: string): string {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractMainHtml(html: string): string {
  const main = html.match(/<main[\s\S]*?<\/main>/i);
  if (main) return main[0];
  const article = html.match(/<article[\s\S]*?<\/article>/i);
  if (article) return article[0];
  // drop nav/footer/header chrome roughly
  return html
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ");
}

interface LinkHit {
  href: string;
  anchor: string;
}

function extractLinksWithAnchors(html: string): LinkHit[] {
  const out: LinkHit[] = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const inner = m[2];
    const hrefM = attrs.match(/href=["']([^"']+)["']/i);
    if (!hrefM) continue;
    const href = hrefM[1];
    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      continue;
    }
    out.push({ href, anchor: stripTags(inner) || stripTags(attrs.match(/aria-label=["']([^"']+)["']/i)?.[1] ?? "") });
  }
  return out;
}

function toInternalPath(href: string, fromPath: string): string | null {
  try {
    const abs = href.startsWith("http")
      ? new URL(href)
      : new URL(href, `${BASE}${fromPath}`);
    const host = abs.hostname;
    if (
      host !== "localhost" &&
      host !== "127.0.0.1" &&
      !host.includes("kitletics") &&
      abs.origin !== new URL(BASE).origin
    ) {
      return null;
    }
    const path = normalizePath(abs.pathname + abs.search);
    if (path.startsWith("/_next") || path.startsWith("/api/") || path.startsWith("/go/")) return null;
    if (/\.(png|jpg|jpeg|webp|svg|css|js|ico|xml|woff2?)$/i.test(path.split("?")[0])) return null;
    return path;
  } catch {
    return null;
  }
}

function isRunningPath(path: string, runningSlugs: Set<string>): boolean {
  const p = normalizePath(path).split("?")[0];
  if (p === "/running" || p.startsWith("/running/")) return true;
  if (p === "/gear" || p.startsWith("/gear/")) return true;
  // product/review/etc membership decided separately via catalog
  if (runningSlugs.has(p)) return true;
  return false;
}

function classifyAnchor(anchor: string): "generic" | "exactish" | "descriptive" | "empty" {
  const a = anchor.trim().toLowerCase();
  if (!a) return "empty";
  const generic = new Set([
    "learn more",
    "read more",
    "click here",
    "here",
    "view",
    "view all",
    "see all",
    "shop",
    "buy",
    "buy now",
    "check price",
    "view on amazon",
    "details",
    "more",
    "link",
    "this",
    "this guide",
    "this review",
    "this product",
    "compare",
    "compare now",
    "read review",
    "full review",
    "see review",
    "alternatives",
    "home",
  ]);
  if (generic.has(a) || /^(read|view|see|shop|buy|learn)\b/.test(a) && a.split(/\s+/).length <= 3) {
    if (generic.has(a) || a.split(/\s+/).length <= 2) return "generic";
  }
  // short product/brand-ish exact match tendency
  if (a.split(/\s+/).length <= 4 && !/[.!?]$/.test(a)) return "exactish";
  return "descriptive";
}

async function fetchHtml(path: string): Promise<{
  path: string;
  status: number;
  finalPath: string;
  html: string;
  robotsMeta?: string;
  title?: string;
}> {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "KitleticsPrelaunchAudit05/1.0" },
    });
    const html = await res.text();
    const robotsMeta =
      html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i)?.[1];
    const title = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    let finalPath = path;
    try {
      finalPath = normalizePath(new URL(res.url).pathname + new URL(res.url).search);
    } catch {
      /* keep */
    }
    return { path, status: res.status, finalPath, html, robotsMeta, title };
  } catch (e) {
    return {
      path,
      status: 0,
      finalPath: path,
      html: "",
      title: e instanceof Error ? e.message : String(e),
    };
  }
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

async function main() {
// ── Catalog universe ─────────────────────────────────────────────────────────
console.log("Loading catalog + sitemap...");
const sitemapEntries = await Promise.resolve(sitemapFn());
const sitemapPaths = [...new Set(sitemapEntries.map((e) => normalizePath(pathOf(String(e.url)))))];
const sitemapSet = new Set(sitemapPaths);

const sports = getSports(PROD);
const categories = getCategories(PROD);
const products = getProducts(PROD);
const reviews = getReviews(PROD);
const bestGuides = getBestGuides(PROD);
const comparisons = getComparisons(PROD);
const buyingGuides = getBuyingGuides(PROD);
const tools = getTools(PROD);
const relationships = getAllProductRelationships().filter((r) => r.status !== "deprecated");
void sports;

const runningSportId = "sport-running";
const runningCategories = categories.filter((c) => c.sportIds.includes(runningSportId));
const runningCatIds = new Set(runningCategories.map((c) => c.id));
const runningProducts = products.filter(
  (p) => runningCatIds.has(p.categoryId) || (p.sportIds ?? []).includes(runningSportId),
);
const runningProductIds = new Set(runningProducts.map((p) => p.id));
const runningProductSlugs = new Set(runningProducts.map((p) => p.slug));
const runningReviewSlugs = new Set(
  reviews.filter((r) => runningProductIds.has(r.productId)).map((r) => r.slug),
);
const runningBest = bestGuides.filter(
  (g) =>
    g.sportId === runningSportId ||
    (g.sportIds ?? []).includes(runningSportId) ||
    runningCatIds.has(g.categoryId) ||
    (g.categoryIds ?? []).some((id) => runningCatIds.has(id)) ||
    /running|shoe|watch|hydration|gps/i.test(`${g.slug} ${g.title}`),
);
const runningGuides = buyingGuides.filter(
  (g) =>
    g.sportId === runningSportId ||
    runningCatIds.has(g.categoryId ?? "") ||
    /running|shoe|watch|hydration|gps/i.test(`${g.slug} ${g.title}`),
);
const runningComparisons = comparisons.filter((c) =>
  (c.productIds ?? []).some((id) => runningProductIds.has(id)),
);
const runningTools = tools.filter(
  (t) =>
    (t.sportIds ?? []).includes(runningSportId) ||
    /running|shoe|pace|finder/i.test(`${t.slug} ${t.name}`),
);

const runningSlugPaths = new Set<string>([
  "/running",
  "/gear",
  ...runningCategories.map((c) => `/running/${c.pathSegment}`),
  ...runningProducts.map((p) => `/products/${p.slug}`),
  ...[...runningReviewSlugs].map((s) => `/reviews/${s}`),
  ...runningBest.map((g) => `/best/${g.slug}`),
  ...runningGuides.map((g) => `/guides/${g.slug}`),
  ...runningComparisons.map((c) => `/compare/${c.slug}`),
  ...runningTools.map((t) => `/tools/${t.slug}`),
  ...runningProducts.map((p) => `/products/${p.slug}/alternatives`),
]);

// Seed crawl list: all sitemap + key hubs
const seedPaths = [
  ...sitemapPaths,
  "/gear",
  "/reviews",
  "/best",
  "/guides",
  "/compare",
  "/brands",
  "/tools",
  "/search",
];
const uniqueSeeds = [...new Set(seedPaths.map(normalizePath))];

console.log(`Sitemap ${sitemapPaths.length}; fetching ${uniqueSeeds.length} pages from ${BASE}...`);

// Health check
{
  const health = await fetchHtml("/");
  if (health.status === 0 || health.status >= 500) {
    console.error("Server not reachable:", health.status, health.title);
    process.exit(1);
  }
  console.log(`Home OK status=${health.status}`);
}

const fetched = await mapPool(uniqueSeeds, CONCURRENCY, async (path, i) => {
  if ((i + 1) % 100 === 0 || i === 0) console.log(`  fetch ${i + 1}/${uniqueSeeds.length}`);
  return fetchHtml(path);
});

const nodes = new Map<string, NodeMeta>();
const edges: Edge[] = [];
const outboundMap = new Map<string, Set<string>>();
const inboundMap = new Map<string, Set<string>>();
const inboundContextualMap = new Map<string, Set<string>>();
const anchorStats = {
  generic: 0,
  exactish: 0,
  descriptive: 0,
  empty: 0,
  total: 0,
};
const anchorExamples: Record<string, string[]> = {
  generic: [],
  exactish: [],
  descriptive: [],
  empty: [],
};
const exactAnchorCounts = new Map<string, number>();

function ensureNode(path: string, partial: Partial<NodeMeta> = {}) {
  const n = nodes.get(path);
  if (n) {
    Object.assign(n, partial);
    return n;
  }
  const meta: NodeMeta = {
    path,
    pageType: classifyPageType(path),
    status: 0,
    indexable: false,
    inSitemap: sitemapSet.has(path) || sitemapSet.has(path.split("?")[0]),
    outbound: 0,
    inbound: 0,
    inboundContextual: 0,
    depthFromHome: null,
    isRunningCluster: isRunningPath(path, runningSlugPaths),
    ...partial,
  };
  nodes.set(path, meta);
  return meta;
}

for (const f of fetched) {
  const path = normalizePath(f.path);
  const noindex = /noindex/i.test(f.robotsMeta ?? "");
  const indexable = f.status === 200 && !noindex;
  ensureNode(path, {
    status: f.status,
    robotsMeta: f.robotsMeta,
    indexable,
    title: f.title,
    inSitemap: sitemapSet.has(path) || sitemapSet.has(path.split("?")[0]),
    isRunningCluster:
      isRunningPath(path, runningSlugPaths) ||
      (path.startsWith("/products/") && runningProductSlugs.has(path.split("/")[2])) ||
      (path.startsWith("/reviews/") && runningReviewSlugs.has(path.split("/")[2])),
  });

  if (!f.html || f.status !== 200) continue;

  const allLinks = extractLinksWithAnchors(f.html);
  const mainLinks = extractLinksWithAnchors(extractMainHtml(f.html));
  const mainSet = new Set(
    mainLinks
      .map((l) => toInternalPath(l.href, path))
      .filter((x): x is string => Boolean(x)),
  );

  const seenOut = new Set<string>();
  for (const link of allLinks) {
    const to = toInternalPath(link.href, path);
    if (!to || to === path) continue;
    ensureNode(to, {
      isRunningCluster: isRunningPath(to, runningSlugPaths) || nodes.get(to)?.isRunningCluster || false,
    });
    const contextual = mainSet.has(to);
    edges.push({ from: path, to, anchor: link.anchor, contextual });
    if (!seenOut.has(to)) {
      seenOut.add(to);
      if (!outboundMap.has(path)) outboundMap.set(path, new Set());
      outboundMap.get(path)!.add(to);
      if (!inboundMap.has(to)) inboundMap.set(to, new Set());
      inboundMap.get(to)!.add(path);
      if (contextual) {
        if (!inboundContextualMap.has(to)) inboundContextualMap.set(to, new Set());
        inboundContextualMap.get(to)!.add(path);
      }
    }
    const kind = classifyAnchor(link.anchor);
    anchorStats[kind]++;
    anchorStats.total++;
    if (anchorExamples[kind].length < 25) {
      anchorExamples[kind].push(`"${link.anchor}" → ${to} (from ${path})`);
    }
    if (kind === "exactish" && link.anchor) {
      const key = link.anchor.trim().toLowerCase();
      exactAnchorCounts.set(key, (exactAnchorCounts.get(key) ?? 0) + 1);
    }
  }
}

// Chrome heuristic: targets linked from ≥50% of fetched 200 pages are sitewide chrome
const fetchedOk = fetched.filter((f) => f.status === 200).length;
const chromeTargets = new Set<string>();
for (const [to, froms] of inboundMap) {
  if (fetchedOk > 0 && froms.size / fetchedOk >= 0.5) chromeTargets.add(to);
}

// Recompute contextual inbound excluding chrome-only edges where possible
for (const [path, node] of nodes) {
  node.outbound = outboundMap.get(path)?.size ?? 0;
  node.inbound = inboundMap.get(path)?.size ?? 0;
  // contextual = inbound from main content, excluding pages that only link via chrome if target is chrome
  const contextualFrom = inboundContextualMap.get(path) ?? new Set();
  node.inboundContextual = contextualFrom.size;
}

// BFS depth from homepage using outbound graph
const depthMap = new Map<string, number>();
const queue: string[] = ["/"];
depthMap.set("/", 0);
while (queue.length) {
  const cur = queue.shift()!;
  const d = depthMap.get(cur)!;
  for (const to of outboundMap.get(cur) ?? []) {
    if (depthMap.has(to)) continue;
    depthMap.set(to, d + 1);
    queue.push(to);
  }
}
for (const [path, node] of nodes) {
  node.depthFromHome = depthMap.has(path) ? depthMap.get(path)! : null;
}

// Indexable universe = sitemap ∩ (fetched indexable OR assumed indexable if in sitemap and not noindex)
const indexablePaths = new Set<string>();
for (const p of sitemapPaths) {
  const n = nodes.get(p);
  if (!n) {
    indexablePaths.add(p); // sitemap implies intended indexable
    ensureNode(p, { inSitemap: true, indexable: true, status: -1 });
    continue;
  }
  if (n.indexable || (n.inSitemap && n.status === 200 && !/noindex/i.test(n.robotsMeta ?? ""))) {
    indexablePaths.add(p);
  } else if (n.inSitemap && n.status === -1) {
    indexablePaths.add(p);
  } else if (n.inSitemap && n.status === 200 && n.indexable) {
    indexablePaths.add(p);
  }
}
// Also mark sitemap pages we fetched as indexable when 200 without noindex
for (const p of sitemapPaths) {
  const n = nodes.get(p);
  if (n && n.status === 200 && !/noindex/i.test(n.robotsMeta ?? "")) {
    n.indexable = true;
    indexablePaths.add(p);
  }
}

// Orphans: indexable with 0 inbound from other indexable pages (excluding self)
const orphans: string[] = [];
const inbound1: string[] = [];
const inbound0: string[] = [];
const lowContextual: { path: string; inbound: number; inboundContextual: number }[] = [];

for (const p of indexablePaths) {
  // also count inbound from any crawled page (nav still discovers)
  const anyFroms = [...(inboundMap.get(p) ?? [])].filter((f) => f !== p);
  const n = nodes.get(p)!;
  n.inbound = anyFroms.length;
  if (anyFroms.length === 0) {
    inbound0.push(p);
    orphans.push(p);
  } else if (anyFroms.length === 1) {
    inbound1.push(p);
  }
  if ((n.inboundContextual ?? 0) <= 1 && anyFroms.length > 0) {
    lowContextual.push({
      path: p,
      inbound: anyFroms.length,
      inboundContextual: n.inboundContextual,
    });
  }
}

// Hub strength
const HUBS = [
  { name: "Homepage", path: "/" },
  { name: "Running Hub", path: "/running" },
  { name: "Running Gear Hub", path: "/gear" },
  { name: "Reviews Hub", path: "/reviews" },
  { name: "Best Hub", path: "/best" },
  { name: "Guides Hub", path: "/guides" },
  { name: "Compare Hub", path: "/compare" },
  { name: "Brands Hub", path: "/brands" },
  { name: "Tools Hub", path: "/tools" },
];

// Category hubs for running
const runningCategoryHubs = runningCategories.map((c) => ({
  name: c.name,
  path: `/running/${c.pathSegment}`,
}));

function hubStats(path: string) {
  const outs = [...(outboundMap.get(path) ?? [])];
  const byType: Record<string, number> = {};
  let runningOut = 0;
  for (const to of outs) {
    const t = classifyPageType(to);
    byType[t] = (byType[t] ?? 0) + 1;
    if (nodes.get(to)?.isRunningCluster || isRunningPath(to, runningSlugPaths)) runningOut++;
  }
  const uniqueIndexableOut = outs.filter((t) => indexablePaths.has(t)).length;
  return {
    path,
    status: nodes.get(path)?.status ?? null,
    outboundUnique: outs.length,
    outboundIndexable: uniqueIndexableOut,
    runningOutbound: runningOut,
    byPageType: byType,
    inbound: nodes.get(path)?.inbound ?? 0,
  };
}

const hubReport = [
  ...HUBS.map((h) => ({ ...h, ...hubStats(h.path) })),
  ...runningCategoryHubs.map((h) => ({ ...h, ...hubStats(h.path) })),
];

// Depth by page type (indexable)
const depthByType: Record<string, Record<string, number>> = {};
for (const p of indexablePaths) {
  const n = nodes.get(p);
  const t = n?.pageType ?? classifyPageType(p);
  const d = n?.depthFromHome;
  const bucket =
    d === null || d === undefined
      ? "unreachable"
      : d === 0
        ? "0"
        : d === 1
          ? "1"
          : d === 2
            ? "2"
            : d === 3
              ? "3"
              : d === 4
                ? "4"
                : "5+";
  if (!depthByType[t]) depthByType[t] = {};
  depthByType[t][bucket] = (depthByType[t][bucket] ?? 0) + 1;
}

// Running cluster edge pattern checks
function hasEdgeType(fromType: PageType, toType: PageType, runningOnly = true): number {
  let n = 0;
  for (const e of edges) {
    const a = nodes.get(e.from);
    const b = nodes.get(e.to);
    if (!a || !b) continue;
    if (runningOnly && !(a.isRunningCluster && b.isRunningCluster)) continue;
    if (a.pageType === fromType && b.pageType === toType && e.contextual) n++;
  }
  return n;
}

const runningClusterRelations = {
  sportToCategory: hasEdgeType("Sport", "Category"),
  categoryToProduct: hasEdgeType("Category", "Product"),
  productToReview: hasEdgeType("Product", "Review"),
  reviewToProduct: hasEdgeType("Review", "Product"),
  productToComparison: hasEdgeType("Product", "Comparison"),
  comparisonToProduct: hasEdgeType("Comparison", "Product"),
  productToAlternatives: hasEdgeType("Product", "Alternatives"),
  alternativesToProduct: hasEdgeType("Alternatives", "Product"),
  guideToProduct: hasEdgeType("Guide", "Product"),
  guideToBest: hasEdgeType("Guide", "Best"),
  guideToFinder: hasEdgeType("Guide", "Finder"),
  bestToProduct: hasEdgeType("Best", "Product"),
  bestToReview: hasEdgeType("Best", "Review"),
  bestToComparison: hasEdgeType("Best", "Comparison"),
};

// Topical coverage map for running categories
function bestGuideProductIds(g: (typeof bestGuides)[number]): string[] {
  const fromRecs = (g.recommendations ?? []).map((r) => r.productId).filter(Boolean);
  return [
    ...fromRecs,
    ...(g.consideredProductIds ?? []),
    ...(g.shortlistedProductIds ?? []),
  ];
}

function coverageForCategory(catId: string, pathSegment: string) {
  const catProducts = runningProducts.filter((p) => p.categoryId === catId);
  const catProductIds = new Set(catProducts.map((p) => p.id));
  const catReviews = reviews.filter((r) => catProductIds.has(r.productId));
  const catBest = bestGuides.filter(
    (g) =>
      g.categoryId === catId ||
      (g.categoryIds ?? []).includes(catId) ||
      bestGuideProductIds(g).some((id) => catProductIds.has(id)),
  );
  const catGuides = buyingGuides.filter((g) => g.categoryId === catId);
  const catComps = comparisons.filter((c) =>
    (c.productIds ?? []).some((id) => catProductIds.has(id)),
  );
  const catTools = tools.filter((t) => (t.categoryIds ?? []).includes(catId));
  const finder = tools.filter(
    (t) =>
      (t.type === "finder" || /finder/i.test(t.slug)) &&
      ((t.categoryIds ?? []).includes(catId) ||
        (t.sportIds ?? []).includes(runningSportId)),
  );
  return {
    categoryId: catId,
    name: categories.find((c) => c.id === catId)?.name ?? catId,
    path: `/running/${pathSegment}`,
    products: catProducts.length,
    productPaths: catProducts.slice(0, 8).map((p) => `/products/${p.slug}`),
    reviews: catReviews.length,
    bestGuides: catBest.length,
    bestPaths: catBest.map((g) => `/best/${g.slug}`),
    educationalGuides: catGuides.length,
    guidePaths: catGuides.map((g) => `/guides/${g.slug}`),
    comparisons: catComps.length,
    finders: finder.filter(
      (t) => (t.categoryIds ?? []).includes(catId) || catId === "cat-running-shoes",
    ).length,
    tools: catTools.length,
    listingStatus: nodes.get(`/running/${pathSegment}`)?.status ?? null,
  };
}

const topicalCoverage = runningCategories.map((c) => coverageForCategory(c.id, c.pathSegment));

// Decision journey per major running category
type Stage = "LEARN" | "BROWSE" | "SHORTLIST" | "COMPARE" | "ASSESS_PRODUCT" | "PERSONALIZE" | "BUY";
function journeyFor(cov: ReturnType<typeof coverageForCategory>) {
  const stages: Record<Stage, { present: boolean; evidence: string[] }> = {
    LEARN: {
      present: cov.educationalGuides > 0 || cov.bestGuides > 0,
      evidence: [...cov.guidePaths.slice(0, 3), ...cov.bestPaths.slice(0, 2)],
    },
    BROWSE: {
      present: cov.listingStatus === 200 && cov.products > 0,
      evidence: [cov.path],
    },
    SHORTLIST: {
      present: cov.bestGuides > 0,
      evidence: cov.bestPaths.slice(0, 5),
    },
    COMPARE: {
      present: cov.comparisons > 0,
      evidence: [`${cov.comparisons} comparisons involving category products`],
    },
    ASSESS_PRODUCT: {
      present: cov.reviews > 0,
      evidence: [`${cov.reviews} reviews`],
    },
    PERSONALIZE: {
      present: cov.finders > 0 || runningTools.some((t) => /finder/i.test(t.slug)),
      evidence: runningTools.filter((t) => /finder/i.test(t.slug)).map((t) => `/tools/${t.slug}`).slice(0, 5),
    },
    BUY: {
      present: cov.products > 0, // offers checked lightly via product count; real buy CTAs on PDP
      evidence: ["Product pages exist (offer presence not re-audited here)"],
    },
  };
  const missing = (Object.entries(stages) as [Stage, { present: boolean }][])
    .filter(([, v]) => !v.present)
    .map(([k]) => k);
  return { category: cov.name, path: cov.path, stages, missing };
}

const decisionJourneys = topicalCoverage.map(journeyFor);

// Cannibalization: similar titles / overlapping intents
const titleGroups = new Map<string, string[]>();
function normalizeIntentTitle(t: string): string {
  return t
    .toLowerCase()
    .replace(/\s*\|\s*kitletics.*$/i, "")
    .replace(/\b(2024|2025|2026|best|guide|review|vs|compared?)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
for (const p of indexablePaths) {
  const n = nodes.get(p);
  if (!n?.title) continue;
  const key = normalizeIntentTitle(n.title);
  if (key.length < 8) continue;
  if (!titleGroups.has(key)) titleGroups.set(key, []);
  titleGroups.get(key)!.push(p);
}
const cannibalizationClusters = [...titleGroups.entries()]
  .filter(([, urls]) => urls.length >= 2)
  .map(([key, urls]) => ({
    normalizedTitle: key,
    urls,
    pageTypes: urls.map((u) => classifyPageType(u)),
  }))
  .filter((c) => {
    // same intent across Best+Guide or Best+Category etc.
    const types = new Set(c.pageTypes);
    return types.size >= 2 || c.urls.length >= 3;
  })
  .slice(0, 40);

// Also pair best vs guides with similar slugs
const bestGuidePairs: { best: string; guide: string; reason: string }[] = [];
for (const b of bestGuides) {
  for (const g of buyingGuides) {
    const bs = b.slug.replace(/^best-/, "");
    const gs = g.slug.replace(/^(how-to-choose-|how-to-|buying-)/, "");
    if (bs === gs || b.slug.includes(g.slug) || g.slug.includes(bs)) {
      bestGuidePairs.push({
        best: `/best/${b.slug}`,
        guide: `/guides/${g.slug}`,
        reason: "overlapping slug/intent",
      });
    }
  }
}

// Product relationship graph
const altTypes = relationships.filter((r) => isAlternativeType(r.type));
const familyLinks = relationships.filter((r) =>
  ["previous-generation", "next-generation"].includes(r.type),
);
const competitorLinks = relationships.filter((r) => r.type === "direct-competitor");
const comparisonCandidateLinks = relationships.filter((r) => r.type === "comparison-candidate");

const productsWithAlts = new Set<string>();
for (const r of altTypes) {
  productsWithAlts.add(r.sourceProductId);
  if (!r.directional) productsWithAlts.add(r.targetProductId);
}
const publishedIds = new Set(products.map((p) => p.id));
const withAlts = [...productsWithAlts].filter((id) => publishedIds.has(id));
const withoutAlts = products.filter((p) => !productsWithAlts.has(p.id)).map((p) => ({
  id: p.id,
  slug: p.slug,
  path: `/products/${p.slug}`,
  categoryId: p.categoryId,
}));

// Comparison editorial links
const productsInComparisons = new Set<string>();
for (const c of comparisons) {
  for (const id of c.productIds ?? []) {
    if (id) productsInComparisons.add(id);
  }
}

// Alternatives pages in sitemap
const altPages = sitemapPaths.filter((p) => p.endsWith("/alternatives"));

const productRelationshipReport = {
  totalRelationships: relationships.length,
  alternativeTyped: altTypes.length,
  familyGeneration: familyLinks.length,
  directCompetitor: competitorLinks.length,
  comparisonCandidate: comparisonCandidateLinks.length,
  publishedProducts: products.length,
  productsWithAlternatives: withAlts.length,
  productsWithoutAlternatives: withoutAlts.length,
  productsWithoutAlternativesSample: withoutAlts.slice(0, 40),
  productsInEditorialComparisons: [...productsInComparisons].filter((id) => publishedIds.has(id)).length,
  alternativesPagesInSitemap: altPages.length,
  running: {
    products: runningProducts.length,
    withAlternatives: runningProducts.filter((p) => productsWithAlts.has(p.id)).length,
    withoutAlternatives: runningProducts.filter((p) => !productsWithAlts.has(p.id)).length,
    inComparisons: runningProducts.filter((p) => productsInComparisons.has(p.id)).length,
  },
};

// Link concentration
const inboundList = [...indexablePaths].map((p) => ({
  path: p,
  pageType: nodes.get(p)?.pageType ?? classifyPageType(p),
  inbound: nodes.get(p)?.inbound ?? 0,
  inboundContextual: nodes.get(p)?.inboundContextual ?? 0,
  outbound: nodes.get(p)?.outbound ?? 0,
}));
inboundList.sort((a, b) => b.inbound - a.inbound);
const highInbound = inboundList.slice(0, 30);
const lowInbound = [...inboundList].sort((a, b) => a.inbound - b.inbound).slice(0, 40);

// Nodes by type
const nodesByType: Record<string, number> = {};
const indexableByType: Record<string, number> = {};
for (const p of nodes.keys()) {
  const t = nodes.get(p)!.pageType;
  nodesByType[t] = (nodesByType[t] ?? 0) + 1;
}
for (const p of indexablePaths) {
  const t = nodes.get(p)?.pageType ?? classifyPageType(p);
  indexableByType[t] = (indexableByType[t] ?? 0) + 1;
}

const runningIndexable = [...indexablePaths].filter((p) => nodes.get(p)?.isRunningCluster);
const runningOrphans = orphans.filter((p) => nodes.get(p)?.isRunningCluster);
const runningWeak = inbound1.filter((p) => nodes.get(p)?.isRunningCluster);

const repetitiveExact = [...exactAnchorCounts.entries()]
  .filter(([, n]) => n >= 8)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 40)
  .map(([anchor, count]) => ({ anchor, count }));

// Connected component size for running (undirected among running indexable)
const runSet = new Set(runningIndexable);
const visited = new Set<string>();
function explore(start: string) {
  const q = [start];
  visited.add(start);
  let size = 0;
  while (q.length) {
    const cur = q.shift()!;
    size++;
    const neigh = new Set([...(outboundMap.get(cur) ?? []), ...(inboundMap.get(cur) ?? [])]);
    for (const n of neigh) {
      if (!runSet.has(n) || visited.has(n)) continue;
      visited.add(n);
      q.push(n);
    }
  }
  return size;
}
let largestComponent = 0;
let components = 0;
for (const p of runSet) {
  if (visited.has(p)) continue;
  components++;
  largestComponent = Math.max(largestComponent, explore(p));
}

const report = {
  meta: {
    auditId: "05-architecture-internal-links",
    title: "Kitletics Pre-Launch Audit 05 — Site Architecture, Internal Links & Topical Coverage",
    generatedAt: new Date().toISOString(),
    auditClock: AUDIT_NOW.toISOString(),
    baseUrl: BASE,
    canonicalHost: CANONICAL_HOST,
    mode: "read-only-forensic",
    notes: [
      "Link graph built from live HTML fetch of sitemap URLs + hubs against production runtime.",
      "Contextual inbound approximated via <main>/<article> (else nav/footer/header stripped).",
      "Chrome targets = linked from ≥50% of successful fetches.",
      "No architecture or linking auto-fixes applied.",
    ],
  },
  graph: {
    nodesFetched: fetched.length,
    nodesTotal: nodes.size,
    edgesTotal: edges.length,
    uniqueEdges: [...outboundMap.values()].reduce((a, s) => a + s.size, 0),
    sitemapUrls: sitemapPaths.length,
    indexableUrls: indexablePaths.size,
    nodesByType,
    indexableByType,
    chromeTargetCount: chromeTargets.size,
    chromeTargetsSample: [...chromeTargets].slice(0, 40),
  },
  runningCluster: {
    categoryCount: runningCategories.length,
    products: runningProducts.length,
    reviews: runningReviewSlugs.size,
    bestGuides: runningBest.length,
    educationalGuides: runningGuides.length,
    comparisons: runningComparisons.length,
    tools: runningTools.length,
    indexableNodesInCluster: runningIndexable.length,
    connectedComponents: components,
    largestComponentSize: largestComponent,
    orphans: runningOrphans.length,
    weakInbound1: runningWeak.length,
    conceptualEdgeCounts: runningClusterRelations,
    coherent:
      runningClusterRelations.categoryToProduct > 0 &&
      runningClusterRelations.bestToProduct > 0 &&
      (runningClusterRelations.productToReview > 0 || runningClusterRelations.reviewToProduct > 0),
  },
  orphans: {
    definition: "Indexable sitemap URL with 0 inbound internal links from crawled pages",
    count: orphans.length,
    byPageType: orphans.reduce((acc: Record<string, number>, p) => {
      const t = classifyPageType(p);
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {}),
    urls: orphans,
  },
  weaklyConnected: {
    inbound0: { count: inbound0.length, urls: inbound0 },
    inbound1: { count: inbound1.length, urls: inbound1.slice(0, 200), urlsAllCount: inbound1.length },
    lowContextualInbound: {
      definition: "≤1 contextual (<main>) inbound while total inbound > 0",
      count: lowContextual.length,
      sample: lowContextual.sort((a, b) => a.inboundContextual - b.inboundContextual).slice(0, 80),
    },
  },
  hubs: hubReport,
  crawlDepth: {
    byPageType: depthByType,
    overall: (() => {
      const o: Record<string, number> = {};
      for (const p of indexablePaths) {
        const d = nodes.get(p)?.depthFromHome;
        const b =
          d === null || d === undefined
            ? "unreachable"
            : d === 0
              ? "0"
              : d <= 4
                ? String(d)
                : "5+";
        o[b] = (o[b] ?? 0) + 1;
      }
      return o;
    })(),
  },
  anchors: {
    stats: anchorStats,
    examples: anchorExamples,
    repetitiveExactMatch: repetitiveExact,
  },
  topicalCoverageRunning: topicalCoverage,
  decisionJourneys,
  cannibalization: {
    titleClusters: cannibalizationClusters,
    bestVsGuidePairs: bestGuidePairs.slice(0, 40),
  },
  productRelationships: productRelationshipReport,
  linkConcentration: {
    highestInbound: highInbound,
    lowestInbound: lowInbound,
  },
  launchClusterEvidence: {
    runningClusterSizeIndexable: runningIndexable.length,
    connectedPagesLargestComponent: largestComponent,
    connectedComponents: components,
    orphansTotal: orphans.length,
    orphansRunning: runningOrphans.length,
    weakInbound1Total: inbound1.length,
    weakInbound1Running: runningWeak.length,
    categoryCoverageRows: topicalCoverage.length,
    decisionJourneyMissingByCategory: decisionJourneys.map((j) => ({
      category: j.category,
      missing: j.missing,
    })),
  },
  // compact node dump for machine use (path + metrics only)
  nodesSample: inboundList.slice(0, 5),
  allNodes: inboundList,
};

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(join(DATA_DIR, "05-link-graph.json"), JSON.stringify(report, null, 2));

// ── Markdown ─────────────────────────────────────────────────────────────────
const lines: string[] = [];
const push = (...xs: string[]) => lines.push(...xs);

push(
  `# Kitletics Pre-Launch Audit 05 — Site Architecture, Internal Links & Topical Coverage`,
  ``,
  `**Mode:** READ-ONLY forensic (no architecture/link auto-fixes)`,
  `**Generated:** ${report.meta.generatedAt}`,
  `**Runtime base:** \`${BASE}\``,
  `**Canonical host (config):** \`${CANONICAL_HOST}\``,
  `**Machine-readable:** [\`data/05-link-graph.json\`](./data/05-link-graph.json)`,
  ``,
  `> Link graph built from live production HTML (sitemap URL universe + hubs). Catalog used for topical coverage and product-relationship edges.`,
  ``,
  `---`,
  ``,
  `## 1. Link graph`,
  ``,
  `| Metric | Count |`,
  `|---|---:|`,
  `| Pages fetched | ${report.graph.nodesFetched} |`,
  `| Graph nodes (incl. discovered) | ${report.graph.nodesTotal} |`,
  `| Directed edge instances (with anchors) | ${report.graph.edgesTotal} |`,
  `| Unique directed edges | ${report.graph.uniqueEdges} |`,
  `| Sitemap URLs | ${report.graph.sitemapUrls} |`,
  `| Indexable (sitemap ∩ 200 + not noindex) | ${report.graph.indexableUrls} |`,
  `| Sitewide chrome targets (≥50% of pages link) | ${report.graph.chromeTargetCount} |`,
  ``,
  `### Nodes by page type (all discovered)`,
  ``,
  `| Page type | Nodes |`,
  `|---|---:|`,
);
for (const [t, n] of Object.entries(nodesByType).sort((a, b) => b[1] - a[1])) {
  push(`| ${t} | ${n} |`);
}
push(``, `### Indexable by page type`, ``, `| Page type | URLs |`, `|---|---:|`);
for (const [t, n] of Object.entries(indexableByType).sort((a, b) => b[1] - a[1])) {
  push(`| ${t} | ${n} |`);
}

push(
  ``,
  `---`,
  ``,
  `## 2. Running cluster`,
  ``,
  `| Signal | Value |`,
  `|---|---:|`,
  `| Running categories | ${report.runningCluster.categoryCount} |`,
  `| Running products | ${report.runningCluster.products} |`,
  `| Running reviews | ${report.runningCluster.reviews} |`,
  `| Best guides (running-tagged) | ${report.runningCluster.bestGuides} |`,
  `| Educational guides | ${report.runningCluster.educationalGuides} |`,
  `| Comparisons | ${report.runningCluster.comparisons} |`,
  `| Tools | ${report.runningCluster.tools} |`,
  `| Indexable nodes in cluster | ${report.runningCluster.indexableNodesInCluster} |`,
  `| Undirected connected components | ${report.runningCluster.connectedComponents} |`,
  `| Largest component | ${report.runningCluster.largestComponentSize} |`,
  `| Cluster orphans | ${report.runningCluster.orphans} |`,
  `| Cluster inbound=1 | ${report.runningCluster.weakInbound1} |`,
  `| Coherent (basic edge patterns) | ${report.runningCluster.coherent} |`,
  ``,
  `### Conceptual relationship edge counts (Running contextual)`,
  ``,
  `| Expected relation | Contextual edge count |`,
  `|---|---:|`,
);
for (const [k, v] of Object.entries(runningClusterRelations)) {
  push(`| ${k} | ${v} |`);
}

push(
  ``,
  `---`,
  ``,
  `## 3. Orphans (indexable, 0 inbound)`,
  ``,
  `**Definition:** sitemap/indexable URL with zero inbound internal links from any crawled page.`,
  ``,
  `| Metric | Count |`,
  `|---|---:|`,
  `| Orphan indexable URLs | ${orphans.length} |`,
  ``,
  `### By page type`,
  ``,
  `| Page type | Count |`,
  `|---|---:|`,
);
for (const [t, n] of Object.entries(report.orphans.byPageType).sort((a, b) => b[1] - a[1])) {
  push(`| ${t} | ${n} |`);
}
push(``, `<details><summary>Orphan URL list (${orphans.length})</summary>`, ``);
for (const u of orphans) push(`- \`${u}\``);
push(``, `</details>`);

push(
  ``,
  `---`,
  ``,
  `## 4. Weakly connected`,
  ``,
  `| Bucket | Count |`,
  `|---|---:|`,
  `| 0 inbound | ${inbound0.length} |`,
  `| 1 inbound | ${inbound1.length} |`,
  `| Low contextual inbound (≤1 main-content inbound, total inbound > 0) | ${lowContextual.length} |`,
  ``,
  `### Sample inbound=1`,
  ``,
);
for (const u of inbound1.slice(0, 40)) push(`- \`${u}\``);
if (inbound1.length > 40) push(`- … +${inbound1.length - 40} more (see JSON)`);

push(``, `### Sample low contextual inbound`, ``);
for (const row of lowContextual.slice(0, 30)) {
  push(`- \`${row.path}\` — inbound=${row.inbound}, contextual=${row.inboundContextual}`);
}

push(
  ``,
  `---`,
  ``,
  `## 5. Hub strength`,
  ``,
  `| Hub | Status | Outbound unique | Outbound indexable | Running outbound | Inbound |`,
  `|---|---:|---:|---:|---:|---:|`,
);
for (const h of hubReport) {
  push(
    `| ${h.name} (\`${h.path}\`) | ${h.status ?? "—"} | ${h.outboundUnique} | ${h.outboundIndexable} | ${h.runningOutbound} | ${h.inbound} |`,
  );
}
push(``, `### Outbound mix (selected hubs)`, ``);
for (const h of hubReport.filter((x) =>
  ["/", "/running", "/gear", "/reviews", "/best", "/guides"].includes(x.path),
)) {
  push(`**${h.name}** — ${JSON.stringify(h.byPageType)}`);
}

push(
  ``,
  `---`,
  ``,
  `## 6. Crawl depth (from Homepage)`,
  ``,
  `### Overall (indexable)`,
  ``,
  `| Depth | URLs |`,
  `|---|---:|`,
);
for (const [k, v] of Object.entries(report.crawlDepth.overall).sort()) {
  push(`| ${k} | ${v} |`);
}
push(``, `### By page type`, ``, `| Page type | 0 | 1 | 2 | 3 | 4 | 5+ | unreachable |`, `|---|---:|---:|---:|---:|---:|---:|---:|`);
for (const [t, buckets] of Object.entries(depthByType).sort()) {
  push(
    `| ${t} | ${buckets["0"] ?? 0} | ${buckets["1"] ?? 0} | ${buckets["2"] ?? 0} | ${buckets["3"] ?? 0} | ${buckets["4"] ?? 0} | ${buckets["5+"] ?? 0} | ${buckets.unreachable ?? 0} |`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## 7. Anchor text`,
  ``,
  `| Class | Count | Share |`,
  `|---|---:|---:|`,
);
const at = anchorStats.total || 1;
for (const k of ["generic", "exactish", "descriptive", "empty"] as const) {
  push(`| ${k} | ${anchorStats[k]} | ${((100 * anchorStats[k]) / at).toFixed(1)}% |`);
}
push(``, `### Generic examples`, ``);
for (const e of anchorExamples.generic.slice(0, 12)) push(`- ${e}`);
push(``, `### Repetitive exact-ish anchors (≥8 uses)`, ``);
for (const r of repetitiveExact.slice(0, 20)) push(`- “${r.anchor}” × ${r.count}`);
push(``, `_No keyword-stuffing recommendations — counts only._`);

push(
  ``,
  `---`,
  ``,
  `## 8. Topical coverage map (Running)`,
  ``,
  `| Category | Path | Products | Reviews | Best | Guides | Comparisons | Finders | Listing status |`,
  `|---|---|---:|---:|---:|---:|---:|---:|---:|`,
);
for (const c of topicalCoverage) {
  push(
    `| ${c.name} | \`${c.path}\` | ${c.products} | ${c.reviews} | ${c.bestGuides} | ${c.educationalGuides} | ${c.comparisons} | ${c.finders} | ${c.listingStatus ?? "—"} |`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## 9. Decision journey gaps (Running categories)`,
  ``,
  `| Category | LEARN | BROWSE | SHORTLIST | COMPARE | ASSESS | PERSONALIZE | BUY | Missing |`,
  `|---|---|---|---|---|---|---|---|---|`,
);
for (const j of decisionJourneys) {
  const s = j.stages;
  const flag = (x: boolean) => (x ? "Y" : "N");
  push(
    `| ${j.category} | ${flag(s.LEARN.present)} | ${flag(s.BROWSE.present)} | ${flag(s.SHORTLIST.present)} | ${flag(s.COMPARE.present)} | ${flag(s.ASSESS_PRODUCT.present)} | ${flag(s.PERSONALIZE.present)} | ${flag(s.BUY.present)} | ${j.missing.join(", ") || "—"} |`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## 10. Content cannibalization`,
  ``,
  `### Near-duplicate title clusters (multi-type or ≥3 URLs)`,
  ``,
);
if (!cannibalizationClusters.length) {
  push(`_No multi-type title clusters detected in crawled titles._`);
} else {
  for (const c of cannibalizationClusters.slice(0, 25)) {
    push(`- **${c.normalizedTitle}** — ${c.urls.map((u) => `\`${u}\``).join(", ")}`);
  }
}
push(``, `### Best ↔ Guide slug overlaps`, ``);
for (const p of bestGuidePairs.slice(0, 25)) {
  push(`- \`${p.best}\` ↔ \`${p.guide}\` (${p.reason})`);
}
if (!bestGuidePairs.length) push(`_None detected._`);

push(
  ``,
  `---`,
  ``,
  `## 11. Product relationship graph`,
  ``,
  `| Metric | Count |`,
  `|---|---:|`,
  `| Total relationships (non-deprecated) | ${productRelationshipReport.totalRelationships} |`,
  `| Alternative-typed | ${productRelationshipReport.alternativeTyped} |`,
  `| Family / generation | ${productRelationshipReport.familyGeneration} |`,
  `| Direct competitor | ${productRelationshipReport.directCompetitor} |`,
  `| Comparison-candidate typed | ${productRelationshipReport.comparisonCandidate} |`,
  `| Published products | ${productRelationshipReport.publishedProducts} |`,
  `| Products with alternatives | ${productRelationshipReport.productsWithAlternatives} |`,
  `| Products without alternatives | ${productRelationshipReport.productsWithoutAlternatives} |`,
  `| Products in editorial comparisons | ${productRelationshipReport.productsInEditorialComparisons} |`,
  `| \`/alternatives\` pages in sitemap | ${productRelationshipReport.alternativesPagesInSitemap} |`,
  `| Running products with alternatives | ${productRelationshipReport.running.withAlternatives} |`,
  `| Running products without alternatives | ${productRelationshipReport.running.withoutAlternatives} |`,
  ``,
  `### Sample products without alternatives`,
  ``,
);
for (const p of productRelationshipReport.productsWithoutAlternativesSample.slice(0, 25)) {
  push(`- \`${p.path}\` (${p.categoryId})`);
}

push(
  ``,
  `---`,
  ``,
  `## 12. Link concentration`,
  ``,
  `### Highest inbound (raw)`,
  ``,
  `| Path | Type | Inbound | Contextual | Outbound |`,
  `|---|---|---:|---:|---:|`,
);
for (const r of highInbound.slice(0, 25)) {
  push(`| \`${r.path}\` | ${r.pageType} | ${r.inbound} | ${r.inboundContextual} | ${r.outbound} |`);
}
push(
  ``,
  `### Lowest inbound (raw, indexable)`,
  ``,
  `| Path | Type | Inbound | Contextual | Outbound |`,
  `|---|---|---:|---:|---:|`,
);
for (const r of lowInbound.slice(0, 25)) {
  push(`| \`${r.path}\` | ${r.pageType} | ${r.inbound} | ${r.inboundContextual} | ${r.outbound} |`);
}

push(
  ``,
  `---`,
  ``,
  `## 13. Launch cluster evidence (factual — no launch decision)`,
  ``,
  `| Evidence | Value |`,
  `|---|---:|`,
  `| Running cluster size (indexable nodes) | ${report.launchClusterEvidence.runningClusterSizeIndexable} |`,
  `| Largest connected component | ${report.launchClusterEvidence.connectedPagesLargestComponent} |`,
  `| Connected components | ${report.launchClusterEvidence.connectedComponents} |`,
  `| Orphans (all indexable) | ${report.launchClusterEvidence.orphansTotal} |`,
  `| Orphans (running) | ${report.launchClusterEvidence.orphansRunning} |`,
  `| Weak pages inbound=1 (all) | ${report.launchClusterEvidence.weakInbound1Total} |`,
  `| Weak pages inbound=1 (running) | ${report.launchClusterEvidence.weakInbound1Running} |`,
  `| Running category coverage rows | ${report.launchClusterEvidence.categoryCoverageRows} |`,
  ``,
  `### Decision-journey completeness by category`,
  ``,
);
for (const row of report.launchClusterEvidence.decisionJourneyMissingByCategory) {
  push(
    `- **${row.category}**: missing ${row.missing.length ? row.missing.join(", ") : "none (all stages present by heuristic)"}`,
  );
}

push(
  ``,
  `---`,
  ``,
  `## Notes`,
  ``,
  `- Orphans may include pages only linked from non-sitemap chrome we did not attribute, or linked solely via client-side navigation not present in HTML.`,
  `- PERSONALIZE stage treats Running finders as shared across categories when category-specific finder is absent.`,
  `- BUY stage confirms product pages exist; offer/CTA depth is covered in prior audits.`,
  `- No fixes applied.`,
  ``,
);

writeFileSync(join(OUT_DIR, "05-architecture-internal-links.md"), lines.join("\n"));
console.log("Wrote docs/prelaunch/05-architecture-internal-links.md");
console.log("Wrote docs/prelaunch/data/05-link-graph.json");
console.log(
  JSON.stringify(
    {
      indexable: indexablePaths.size,
      orphans: orphans.length,
      runningIndexable: runningIndexable.length,
      largestComponent,
      hubs: hubReport.slice(0, 5).map((h) => ({ name: h.name, out: h.outboundUnique })),
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
