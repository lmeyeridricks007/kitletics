/**
 * Fix 84 — shared immutable sitemap fixture for integration tests.
 *
 * Cold sitemap construction walks the full launch-eligibility graph
 * (including Alternatives quality signals). Cache once per worker process
 * so suites that only need path membership do not rebuild.
 */
import sitemap from "@/app/sitemap";
import { siteConfig } from "@/content/config";

let cachedEntries: ReturnType<typeof sitemap> | undefined;
let cachedPaths: string[] | undefined;
let cachedPathSet: Set<string> | undefined;

function toPath(url: string): string {
  if (url === siteConfig.url || url === `${siteConfig.url}/`) return "/";
  const stripped = url.replace(siteConfig.url, "") || "/";
  return stripped.length > 1 && stripped.endsWith("/")
    ? stripped.slice(0, -1)
    : stripped;
}

/** Warm + return sitemap entries (module-cached per worker). */
export function getSitemapEntriesFixture(): ReturnType<typeof sitemap> {
  if (!cachedEntries) cachedEntries = sitemap();
  return cachedEntries;
}

/** Warm + return normalized sitemap paths. */
export function getSitemapPathsFixture(): string[] {
  if (!cachedPaths) {
    cachedPaths = getSitemapEntriesFixture().map((e) => toPath(e.url));
  }
  return cachedPaths;
}

export function getSitemapPathSetFixture(): Set<string> {
  if (!cachedPathSet) cachedPathSet = new Set(getSitemapPathsFixture());
  return cachedPathSet;
}
