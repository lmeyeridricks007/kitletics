/**
 * Fix 29 — full sitemap HTTP probe with robots/redirect checks.
 * Usage: BASE_URL=http://127.0.0.1:3010 npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-29-sitemap-probe.ts
 */
import sitemapMod from "@/app/sitemap";
import { siteConfig } from "@/content/config";
import { writeFileSync } from "fs";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:3010").replace(
  /\/$/,
  "",
);

const sitemapFn =
  typeof sitemapMod === "function"
    ? sitemapMod
    : (sitemapMod as { default: () => { url: string }[] }).default;

function extractRobots(html: string): string | undefined {
  return (
    html.match(
      /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i,
    )?.[1] ??
    html.match(
      /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i,
    )?.[1]
  );
}

async function check(path: string, attempt = 1): Promise<{
  path: string;
  status: number;
  location: string | null;
  xRobots: string | null;
  robotsMeta?: string;
  noindex: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    const xRobots = res.headers.get("x-robots-tag");
    let robotsMeta: string | undefined;
    let noindex =
      /noindex/i.test(xRobots ?? "") ||
      (res.status >= 300 && res.status < 400);
    if (res.status === 200) {
      const html = await res.text();
      robotsMeta = extractRobots(html);
      noindex =
        /noindex/i.test(robotsMeta ?? "") || /noindex/i.test(xRobots ?? "");
    }
    return {
      path,
      status: res.status,
      location: res.headers.get("location"),
      xRobots,
      robotsMeta,
      noindex,
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
      noindex: false,
      error: String(e),
    };
  }
}

async function main() {
  const paths = sitemapFn().map((e) => {
    const u = e.url;
    if (u === siteConfig.url || u === `${siteConfig.url}/`) return "/";
    return u.replace(siteConfig.url, "") || "/";
  });

  const byStatus: Record<string, number> = {};
  const non200: Awaited<ReturnType<typeof check>>[] = [];
  const noindex200: Awaited<ReturnType<typeof check>>[] = [];
  const redirects: Awaited<ReturnType<typeof check>>[] = [];

  const CONC = 3;
  for (let i = 0; i < paths.length; i += CONC) {
    const chunk = paths.slice(i, i + CONC);
    const results = await Promise.all(chunk.map((p) => check(p)));
    for (const r of results) {
      byStatus[String(r.status)] = (byStatus[String(r.status)] || 0) + 1;
      if (r.status !== 200) non200.push(r);
      if (r.status >= 300 && r.status < 400) redirects.push(r);
      if (r.status === 200 && r.noindex) noindex200.push(r);
    }
    if (i % 60 === 0) console.error(`progress ${i}/${paths.length}`);
    await new Promise((r) => setTimeout(r, 40));
  }

  const summary = {
    base: BASE,
    n: paths.length,
    byStatus,
    non200Count: non200.length,
    noindex200Count: noindex200.length,
    redirectCount: redirects.length,
    non200,
    noindex200: noindex200.slice(0, 50),
    redirects,
    ok:
      non200.length === 0 &&
      noindex200.length === 0 &&
      redirects.length === 0,
  };

  writeFileSync(
    "docs/prelaunch/data/rc-final/sitemap-http-probe.json",
    JSON.stringify(summary, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        n: summary.n,
        byStatus,
        non200Count: non200.length,
        noindex200Count: noindex200.length,
        redirectCount: redirects.length,
        ok: summary.ok,
        non200Sample: non200.slice(0, 15),
        noindexSample: noindex200.slice(0, 10).map((r) => ({
          path: r.path,
          robotsMeta: r.robotsMeta,
          xRobots: r.xRobots,
        })),
      },
      null,
      2,
    ),
  );
  if (!summary.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
