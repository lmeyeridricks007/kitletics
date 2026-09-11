/**
 * Fix 60 — full sitemap HTTP probe + robots + draft/future leakage.
 *
 * BASE_URL=http://127.0.0.1:3010 npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-60-sitemap-probe.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
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
const OUT_DIR = join(process.cwd(), "docs/prelaunch/data/rc-60");
mkdirSync(OUT_DIR, { recursive: true });

const NOW = new Date("2026-09-10T12:00:00.000Z");
const CONC = 3;

type ProbeRow = {
  path: string;
  status: number;
  location: string | null;
  xRobots: string | null;
  metaRobots: string | null;
  noindex: boolean;
  error?: string;
};

function toPath(url: string): string {
  if (url === siteConfig.url || url === `${siteConfig.url}/`) return "/";
  return url.replace(siteConfig.url, "") || "/";
}

function parseMetaRobots(html: string): string | null {
  const head = html.slice(0, 48_000);
  const a = head.match(
    /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i,
  );
  const b = head.match(
    /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i,
  );
  return a?.[1] ?? b?.[1] ?? null;
}

async function check(path: string, attempt = 1): Promise<ProbeRow> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      redirect: "manual",
      headers: { "user-agent": "kitletics-prelaunch-60-sitemap/1.0" },
      signal: AbortSignal.timeout(45000),
    });
    const xRobots = res.headers.get("x-robots-tag");
    let metaRobots: string | null = null;
    const ct = res.headers.get("content-type") ?? "";
    if (res.status === 200 && ct.includes("text/html")) {
      const html = await res.text();
      metaRobots = parseMetaRobots(html);
    } else {
      await res.arrayBuffer().catch(() => null);
    }
    const robotsBlob = `${xRobots ?? ""} ${metaRobots ?? ""}`;
    return {
      path,
      status: res.status,
      location: res.headers.get("location"),
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
      status: 0,
      location: null,
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
    if (p.status === "draft" && inSitemapWould) {
      issues.push({ kind: "product", slug: p.slug, reason: "draft INDEXABLE" });
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
      issues.push({
        kind: "review",
        slug: r.slug,
        reason: `status=${r.status}`,
      });
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
      issues.push({
        kind: "best",
        slug: g.slug,
        reason: `status=${g.status}`,
      });
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
      issues.push({
        kind: "guide",
        slug: g.slug,
        reason: `status=${g.status}`,
      });
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
      issues.push({
        kind: "brand",
        slug: b.slug,
        reason: `status=${b.status}`,
      });
    }
  }

  return issues;
}

async function main() {
  const entries = sitemapFn();
  const paths = entries.map((e) => toPath(e.url));
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
      byStatus[String(r.status)] = (byStatus[String(r.status)] || 0) + 1;
    }
    if (i % 60 === 0) {
      console.error(`progress ${Math.min(i, paths.length)}/${paths.length}`);
    }
    await new Promise((r) => setTimeout(r, 40));
  }

  const not200 = rows.filter((r) => r.status !== 200);
  const redirects = rows.filter((r) => r.status >= 300 && r.status < 400);
  const notFound = rows.filter((r) => r.status === 404);
  const serverErr = rows.filter((r) => r.status >= 500 || r.status === 0);
  const noindex = rows.filter((r) => r.noindex);

  const summary = {
    measuredAt: new Date().toISOString(),
    base: BASE,
    n: paths.length,
    byStatus,
    counts: {
      not200: not200.length,
      redirects: redirects.length,
      notFound: notFound.length,
      serverErr: serverErr.length,
      noindex: noindex.length,
      facetLeak: facetLeak.length,
      draftPathLeak: draftPathLeak.length,
      draftFutureEntities: draftIssues.length,
    },
    gates: {
      zero404: notFound.length === 0,
      zero5xx: serverErr.length === 0,
      zeroNoindex: noindex.length === 0,
      zeroRedirects: redirects.length === 0,
      zeroDraftsFuture: draftIssues.length === 0 && draftPathLeak.length === 0,
      zeroFacetLeak: facetLeak.length === 0,
    },
    not200,
    noindex: noindex.slice(0, 50),
    facetLeak,
    draftPathLeak,
    draftIssues,
  };

  writeFileSync(
    join(OUT_DIR, "sitemap-http-probe.json"),
    JSON.stringify(summary, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        n: summary.n,
        byStatus,
        counts: summary.counts,
        gates: summary.gates,
        sampleNot200: not200.slice(0, 20),
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
