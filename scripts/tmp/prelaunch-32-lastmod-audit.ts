/**
 * Fix 32 — sitemap lastmod integrity audit.
 * Usage: npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-32-lastmod-audit.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import sitemapMod from "../../src/app/sitemap";
import { SEED_DATES, siteConfig } from "../../src/content/config";
import { isGlobalSeedTimestamp } from "../../src/lib/seo/sitemap-lastmod";

const sitemapFn =
  typeof sitemapMod === "function"
    ? sitemapMod
    : (sitemapMod as { default: typeof sitemapMod }).default;

const entries = sitemapFn();
const seedDays = new Set(
  Object.values(SEED_DATES).map((d) => d.slice(0, 10)),
);

const dayCounts: Record<string, number> = {};
let withLastmod = 0;
let withoutLastmod = 0;
let futureCount = 0;
let seedCluster = 0;
const byPrefix: Record<
  string,
  { n: number; withLastmod: number; without: number }
> = {};

function prefix(path: string): string {
  if (path === "/") return "home";
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "products" && parts[2] === "alternatives")
    return "alternatives";
  return parts[0] ?? "other";
}

const now = Date.now();
for (const e of entries) {
  const path = e.url.replace(siteConfig.url, "") || "/";
  const group = prefix(path);
  byPrefix[group] ??= { n: 0, withLastmod: 0, without: 0 };
  byPrefix[group].n++;

  if (!e.lastModified) {
    withoutLastmod++;
    byPrefix[group].without++;
    continue;
  }
  withLastmod++;
  byPrefix[group].withLastmod++;
  const iso = new Date(e.lastModified).toISOString();
  const day = iso.slice(0, 10);
  dayCounts[day] = (dayCounts[day] || 0) + 1;
  if (new Date(e.lastModified).getTime() > now + 86400000) futureCount++;
  if (seedDays.has(day) || isGlobalSeedTimestamp(iso)) seedCluster++;
}

const topDates = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);

const report = {
  measuredAt: new Date().toISOString(),
  n: entries.length,
  withLastmod,
  withoutLastmod,
  uniqueLastmodDays: topDates.length,
  topDates,
  futureCount,
  seedCluster,
  byPrefix,
  policy: {
    omitWhenUnknown: true,
    excludeSeedDates: true,
    excludeLastVerifiedAt: true,
    excludeBuildDeployToday: true,
  },
  SEED_DATES,
};

mkdirSync("docs/prelaunch/data/rc-final", { recursive: true });
writeFileSync(
  join("docs/prelaunch/data/rc-final/sitemap-lastmod.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
