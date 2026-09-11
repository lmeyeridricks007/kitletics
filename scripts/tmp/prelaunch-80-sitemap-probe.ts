/**
 * Fix 80 — full current sitemap HTTP probe (canonical, robots, delta vs Fix 60).
 *
 *   BASE_URL=http://127.0.0.1:3010 npm run sitemap:probe:current
 *   npm run sitemap:probe:current -- --inventory
 */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sitemapFn from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import {
  getProducts,
  getReviews,
  getBestGuides,
  getBuyingGuides,
  getComparisons,
  getBrands,
} from "@/repositories";
import {
  getLaunchEligibility,
  isIndexableEligibility,
} from "@/domain/launch";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(
  /\/$/,
  "",
);
const OUT_DIR = join(
  process.cwd(),
  process.env.SITEMAP_PROBE_OUT ?? "docs/prelaunch/data/rc-v3",
);
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(join(OUT_DIR, "logs"), { recursive: true });

const NOW = new Date("2026-09-10T20:00:00.000Z");
const CONC = Number(process.env.SITEMAP_CONCURRENCY ?? 4);
const FETCH_MS = Number(process.env.SITEMAP_FETCH_TIMEOUT_MS ?? 90_000);
const inventoryOnly = process.argv.includes("--inventory");

export type SitemapPageType =
  | "product"
  | "review"
  | "best"
  | "guide"
  | "comparison"
  | "alternatives"
  | "brand"
  | "category"
  | "tool"
  | "other";

type ProbeRow = {
  path: string;
  pageType: SitemapPageType;
  status: number;
  contentType: string | null;
  location: string | null;
  canonical: string | null;
  canonicalPath: string | null;
  selfCanonical: boolean;
  xRobots: string | null;
  metaRobots: string | null;
  noindex: boolean;
  error?: string;
};

function toPath(url: string): string {
  if (url === siteConfig.url || url === `${siteConfig.url}/`) return "/";
  const stripped = url.replace(siteConfig.url, "") || "/";
  return stripped.length > 1 && stripped.endsWith("/")
    ? stripped.slice(0, -1)
    : stripped;
}

export function classifySitemapPath(path: string): SitemapPageType {
  if (path.startsWith("/products/") && path.endsWith("/alternatives")) {
    return "alternatives";
  }
  if (path.startsWith("/products/")) return "product";
  if (path.startsWith("/reviews/")) return "review";
  if (path.startsWith("/best/")) return "best";
  if (path.startsWith("/guides/")) return "guide";
  if (path.startsWith("/compare/") || path === "/compare") return "comparison";
  if (path.startsWith("/brands/")) return "brand";
  if (path.startsWith("/tools/")) return "tool";
  if (
    path === "/running" ||
    path.startsWith("/running/") ||
    path === "/gear" ||
    path.startsWith("/padel") ||
    path.startsWith("/fitness") ||
    path.startsWith("/tennis")
  ) {
    return "category";
  }
  return "other";
}

function parseMetaRobots(html: string): string | null {
  // Next streams metadata after the body. Prefer the real <meta> tag via
  // indexOf — full-document regex on 3MB listing HTML blocks the event loop.
  const needle = 'name="robots"';
  const i = html.toLowerCase().indexOf(needle);
  if (i < 0) return null;
  const window = html.slice(Math.max(0, i - 80), i + 180);
  const m =
    window.match(/content=["']([^"']*)["']/i) ??
    html
      .slice(Math.max(0, i - 120), i + 200)
      .match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']robots["']/i);
  return m?.[1] ?? null;
}

function parseCanonical(html: string): string | null {
  const i = html.toLowerCase().indexOf('rel="canonical"');
  if (i < 0) {
    const j = html.toLowerCase().indexOf("rel='canonical'");
    if (j < 0) return null;
    const window = html.slice(j, j + 220);
    return window.match(/href=["']([^"']+)["']/i)?.[1] ?? null;
  }
  const window = html.slice(i, i + 220);
  return window.match(/href=["']([^"']+)["']/i)?.[1] ?? null;
}

function canonicalToPath(href: string | null): string | null {
  if (!href) return null;
  try {
    const u = new URL(href, siteConfig.url);
    return toPath(`${siteConfig.url}${u.pathname}`);
  } catch {
    return href.startsWith("/") ? href : null;
  }
}

function loadV3Day1Paths(): Set<string> {
  const csv = readFileSync(
    join(process.cwd(), "docs/prelaunch/data/FINAL-DAY1-URLS-V3.csv"),
    "utf8",
  );
  const set = new Set<string>();
  for (const line of csv.split("\n").slice(1)) {
    const url = line.split(",")[0]?.trim();
    if (url) set.add(url);
  }
  return set;
}

async function check(path: string, attempt = 1): Promise<ProbeRow> {
  const pageType = classifySitemapPath(path);
  try {
    const res = await fetch(`${BASE}${path}`, {
      redirect: "manual",
      headers: { "user-agent": "kitletics-prelaunch-80-sitemap/1.0" },
      signal: AbortSignal.timeout(FETCH_MS),
    });
    const xRobots = res.headers.get("x-robots-tag");
    const contentType = res.headers.get("content-type");
    let metaRobots: string | null = null;
    let canonical: string | null = null;
    if (res.status === 200 && (contentType ?? "").includes("text/html")) {
      const html = await res.text();
      metaRobots = parseMetaRobots(html);
      canonical = parseCanonical(html);
    } else {
      await res.arrayBuffer().catch(() => null);
    }
    const canonicalPath = canonicalToPath(canonical);
    const robotsBlob = `${xRobots ?? ""} ${metaRobots ?? ""}`;
    return {
      path,
      pageType,
      status: res.status,
      contentType,
      location: res.headers.get("location"),
      canonical,
      canonicalPath,
      selfCanonical: canonicalPath === path,
      xRobots,
      metaRobots,
      noindex: /noindex/i.test(robotsBlob),
    };
  } catch (e) {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 400 * attempt));
      return check(path, attempt + 1);
    }
    return {
      path,
      pageType,
      status: 0,
      contentType: null,
      location: null,
      canonical: null,
      canonicalPath: null,
      selfCanonical: false,
      xRobots: null,
      metaRobots: null,
      noindex: false,
      error: String(e),
    };
  }
}

function isFutureDate(iso?: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && d.getTime() > NOW.getTime();
}

function draftFutureScan() {
  const ctx = { isDev: false as const };
  const issues: Array<{ kind: string; slug: string; reason: string }> = [];

  for (const p of getProducts()) {
    const elig = getLaunchEligibility({ kind: "product", entity: p }, ctx);
    const inSitemapWould = isIndexableEligibility(elig);
    if (p.status !== "published" && inSitemapWould) {
      issues.push({
        kind: "product",
        slug: p.slug,
        reason: `status=${p.status} but INDEXABLE`,
      });
    }
    if (isFutureDate(p.publishedAt) && inSitemapWould) {
      issues.push({
        kind: "product",
        slug: p.slug,
        reason: `future publishedAt ${p.publishedAt}`,
      });
    }
  }

  for (const r of getReviews()) {
    const elig = getLaunchEligibility({ kind: "review", entity: r }, ctx);
    if (!isIndexableEligibility(elig)) continue;
    if (r.status !== "published") {
      issues.push({ kind: "review", slug: r.slug, reason: `status=${r.status}` });
    }
    if (isFutureDate(r.publishedAt)) {
      issues.push({
        kind: "review",
        slug: r.slug,
        reason: `future publishedAt ${r.publishedAt}`,
      });
    }
  }

  for (const g of getBestGuides()) {
    const elig = getLaunchEligibility({ kind: "best-guide", entity: g }, ctx);
    if (!isIndexableEligibility(elig)) continue;
    if (g.status && g.status !== "published") {
      issues.push({ kind: "best", slug: g.slug, reason: `status=${g.status}` });
    }
    if (isFutureDate(g.publishedAt)) {
      issues.push({
        kind: "best",
        slug: g.slug,
        reason: `future publishedAt ${g.publishedAt}`,
      });
    }
  }

  for (const g of getBuyingGuides()) {
    const elig = getLaunchEligibility({ kind: "buying-guide", entity: g }, ctx);
    if (!isIndexableEligibility(elig)) continue;
    if (g.status && g.status !== "published") {
      issues.push({ kind: "guide", slug: g.slug, reason: `status=${g.status}` });
    }
    if (isFutureDate(g.publishedAt)) {
      issues.push({
        kind: "guide",
        slug: g.slug,
        reason: `future publishedAt ${g.publishedAt}`,
      });
    }
  }

  for (const c of getComparisons()) {
    const elig = getLaunchEligibility({ kind: "comparison", entity: c }, ctx);
    if (!isIndexableEligibility(elig)) continue;
    if (c.status && c.status !== "published") {
      issues.push({
        kind: "comparison",
        slug: c.slug,
        reason: `status=${c.status}`,
      });
    }
  }

  for (const b of getBrands()) {
    const elig = getLaunchEligibility({ kind: "brand", entity: b }, ctx);
    if (!isIndexableEligibility(elig)) continue;
    if (b.status && b.status !== "published") {
      issues.push({ kind: "brand", slug: b.slug, reason: `status=${b.status}` });
    }
  }

  return issues;
}

function eligibilityForPath(path: string): string {
  const ctx = { isDev: false as const };
  const type = classifySitemapPath(path);
  if (type === "product") {
    const slug = path.slice("/products/".length);
    const p = getProducts().find((x) => x.slug === slug);
    if (!p) return "NO_ENTITY";
    return getLaunchEligibility({ kind: "product", entity: p }, ctx)
      .disposition;
  }
  if (type === "alternatives") {
    const slug = path.slice("/products/".length).replace(/\/alternatives$/, "");
    const p = getProducts().find((x) => x.slug === slug);
    if (!p) return "NO_ENTITY";
    return getLaunchEligibility({ kind: "alternatives", entity: p }, ctx)
      .disposition;
  }
  if (type === "review") {
    const slug = path.slice("/reviews/".length);
    const r = getReviews().find((x) => x.slug === slug);
    if (!r) return "NO_ENTITY";
    return getLaunchEligibility({ kind: "review", entity: r }, ctx)
      .disposition;
  }
  if (type === "brand") {
    const slug = path.slice("/brands/".length);
    const b = getBrands().find((x) => x.slug === slug);
    if (!b) return "NO_ENTITY";
    return getLaunchEligibility({ kind: "brand", entity: b }, ctx)
      .disposition;
  }
  if (type === "best") {
    const slug = path.slice("/best/".length);
    const g = getBestGuides().find((x) => x.slug === slug);
    if (!g) return "INDEXABLE";
    return getLaunchEligibility({ kind: "best-guide", entity: g }, ctx)
      .disposition;
  }
  if (type === "guide") {
    const slug = path.slice("/guides/".length);
    const g = getBuyingGuides().find((x) => x.slug === slug);
    if (!g) return "INDEXABLE";
    return getLaunchEligibility({ kind: "buying-guide", entity: g }, ctx)
      .disposition;
  }
  if (type === "comparison" && path.startsWith("/compare/")) {
    const slug = path.slice("/compare/".length);
    const c = getComparisons().find((x) => x.slug === slug);
    if (!c) return "INDEXABLE";
    return getLaunchEligibility({ kind: "comparison", entity: c }, ctx)
      .disposition;
  }
  return "INDEXABLE";
}

function reasonAdded(path: string): string {
  if (/nnormal-(kjerag|tomir)-02/.test(path) || path === "/brands/nnormal") {
    return "Fix 69 — NNormal Kjerag 02 / Tomir 02 + hub READY";
  }
  if (
    /amazfit-balance-3|amazfit-cheetah-2-pro|samsung-galaxy-watch-ultra-2|samsung-galaxy-watch-9|kiprun-900-race-5|kiprun-proteam-10/.test(
      path,
    ) ||
    path === "/brands/amazfit" ||
    path === "/brands/samsung" ||
    path === "/brands/decathlon"
  ) {
    return "Fix 75 — Amazfit / Samsung / Kiprun catalog gap close";
  }
  if (/buff-(original|coolnet-uv|merino-lightweight|polar)/.test(path)) {
    return "Fix 62 — Buff Running SKUs completed";
  }
  if (path.includes("fuelcell-rebel-v4")) {
    return "Fix 62 — Rebel v4 Running completion";
  }
  if (path.endsWith("/alternatives")) {
    return "Post-V3 alternatives INDEXABLE (Fix 65 graph / category gate)";
  }
  return "Post-Fix-60 INDEXABLE (not in V3 Day-1 URL export)";
}

async function main() {
  const entries = sitemapFn();
  const paths = entries.map((e) => toPath(e.url));
  const byType: Record<string, number> = {};
  for (const p of paths) {
    const t = classifySitemapPath(p);
    byType[t] = (byType[t] ?? 0) + 1;
  }

  const v3 = loadV3Day1Paths();
  const notInV3 = paths.filter((p) => !v3.has(p));
  const entityTypes = new Set([
    "product",
    "review",
    "best",
    "guide",
    "comparison",
    "alternatives",
    "brand",
    "tool",
  ]);
  const delta = notInV3.filter((p) => entityTypes.has(classifySitemapPath(p)));
  const sitemapOnlyVsV3 = notInV3.filter(
    (p) => !entityTypes.has(classifySitemapPath(p)),
  );

  const inventory = {
    generatedAt: new Date().toISOString(),
    n: paths.length,
    byType,
    v3Day1Csv: v3.size,
    notInV3Day1Csv: notInV3.length,
    entityDeltaVsV3: delta.length,
    sitemapChromeVsV3: sitemapOnlyVsV3.length,
    delta,
    sitemapOnlyVsV3,
  };
  writeFileSync(join(OUT_DIR, "sitemap-inventory.json"), JSON.stringify(inventory, null, 2));
  writeFileSync(join(OUT_DIR, "sitemap-paths.txt"), paths.join("\n") + "\n");
  console.log("inventory", {
    n: paths.length,
    byType,
    entityDeltaVsV3: delta.length,
    sitemapChromeVsV3: sitemapOnlyVsV3.length,
  });
  if (inventoryOnly) return;

  const draftIssues = draftFutureScan();
  const facetLeak = paths.filter((p) => /[?&](gender|sort|filter|q)=/i.test(p));
  const draftPathLeak = paths.filter((p) =>
    /\/(draft|preview|staging)\b/i.test(p),
  );

  const rows: ProbeRow[] = [];
  const byStatus: Record<string, number> = {};
  for (let i = 0; i < paths.length; i += CONC) {
    const chunk = paths.slice(i, i + CONC);
    const results = await Promise.all(chunk.map((p) => check(p)));
    for (const r of results) {
      rows.push(r);
      byStatus[String(r.status)] = (byStatus[String(r.status)] ?? 0) + 1;
    }
    if (i % 50 === 0) {
      console.error(`progress ${Math.min(i, paths.length)}/${paths.length}`);
    }
    await new Promise((r) => setTimeout(r, 25));
  }

  const not200 = rows.filter((r) => r.status !== 200);
  const redirects = rows.filter((r) => r.status >= 300 && r.status < 400);
  const notFound = rows.filter((r) => r.status === 404);
  const serverErr = rows.filter((r) => r.status >= 500 || r.status === 0);
  const noindex = rows.filter((r) => r.noindex);
  const canonicalMiss = rows.filter(
    (r) => r.status === 200 && !r.selfCanonical,
  );
  const nonHtml = rows.filter(
    (r) => r.status === 200 && !(r.contentType ?? "").includes("text/html"),
  );

  const deltaReport = delta.map((path) => {
    const row = rows.find((r) => r.path === path);
    return {
      path,
      pageType: classifySitemapPath(path),
      reasonAdded: reasonAdded(path),
      eligibility: eligibilityForPath(path),
      http: row?.status ?? null,
      selfCanonical: row?.selfCanonical ?? false,
      noindex: row?.noindex ?? false,
    };
  });

  const summary = {
    measuredAt: new Date().toISOString(),
    base: BASE,
    n: paths.length,
    previousProbeN: 1106,
    byStatus,
    byType,
    counts: {
      not200: not200.length,
      redirects: redirects.length,
      notFound: notFound.length,
      serverErr: serverErr.length,
      noindex: noindex.length,
      facetLeak: facetLeak.length,
      draftPathLeak: draftPathLeak.length,
      draftFutureEntities: draftIssues.length,
      canonicalMiss: canonicalMiss.length,
      nonHtml: nonHtml.length,
    },
    gates: {
      zero404: notFound.length === 0,
      zero5xx: serverErr.length === 0,
      zeroNoindex: noindex.length === 0,
      zeroRedirects: redirects.length === 0,
      zeroDraftsFuture: draftIssues.length === 0 && draftPathLeak.length === 0,
      zeroFacetLeak: facetLeak.length === 0,
      allSelfCanonical: canonicalMiss.length === 0,
      allHtml: nonHtml.length === 0,
    },
    delta: {
      vsV3Day1Entities: delta.length,
      vsFix60Count: paths.length - 1106,
      rows: deltaReport,
    },
    not200,
    noindex: noindex.slice(0, 50),
    canonicalMiss: canonicalMiss.slice(0, 80),
    facetLeak,
    draftPathLeak,
    draftIssues,
  };

  writeFileSync(
    join(OUT_DIR, "sitemap-http-probe.json"),
    JSON.stringify(summary, null, 2),
  );
  writeFileSync(
    join(OUT_DIR, "sitemap-http-rows.json"),
    JSON.stringify(rows, null, 2),
  );

  console.log(
    JSON.stringify(
      {
        n: summary.n,
        byStatus,
        byType,
        counts: summary.counts,
        gates: summary.gates,
        deltaN: delta.length,
        sampleNot200: not200.slice(0, 20),
        sampleCanonicalMiss: canonicalMiss.slice(0, 15),
      },
      null,
      2,
    ),
  );

  const ok = Object.values(summary.gates).every(Boolean);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
