/**
 * Canonical URL normalization for IndexNow — kitletics.com only.
 */

import { siteConfig } from "@/content/config";

const BLOCKED_PREFIXES = [
  "/go/",
  "/api/",
  "/admin/",
  "/preview/",
  "/search",
] as const;

const BLOCKED_EXACT = new Set(["/search", "/go", "/api", "/admin", "/preview"]);

export type NormalizeUrlResult =
  | { ok: true; url: string; path: string }
  | { ok: false; reason: string };

function stripTrailingSlash(path: string): string {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

/**
 * Paths that must never be submitted (robots disallow / non-canonical surfaces).
 * Facet/query URLs are rejected via search string check.
 */
export function isBlockedIndexNowPath(path: string): boolean {
  const bare = stripTrailingSlash(path.split("?")[0] || "/");
  if (BLOCKED_EXACT.has(bare)) return true;
  return BLOCKED_PREFIXES.some(
    (prefix) => bare === prefix.slice(0, -1) || bare.startsWith(prefix),
  );
}

/**
 * Accept absolute kitletics.com URLs or site-relative paths.
 * Rejects other hosts, credentials, fragments-only junk, and query facets.
 */
export function normalizeIndexNowUrl(input: string): NormalizeUrlResult {
  const raw = input.trim();
  if (!raw) return { ok: false, reason: "empty" };

  let url: URL;
  try {
    url = raw.startsWith("http://") || raw.startsWith("https://")
      ? new URL(raw)
      : new URL(raw.startsWith("/") ? raw : `/${raw}`, siteConfig.url);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: "invalid_protocol" };
  }

  const expectedHost = new URL(siteConfig.url).host;
  if (url.host !== expectedHost && url.host !== `www.${expectedHost}`) {
    return { ok: false, reason: "invalid_host" };
  }

  // Force apex + https canonical
  url.protocol = "https:";
  url.host = expectedHost;
  url.hash = "";

  if (url.search && url.search.length > 1) {
    return { ok: false, reason: "query_not_allowed" };
  }

  const path = stripTrailingSlash(url.pathname || "/") || "/";
  if (isBlockedIndexNowPath(path)) {
    return { ok: false, reason: "blocked_path" };
  }

  url.pathname = path;
  url.search = "";

  const canonical =
    path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;

  return { ok: true, url: canonical, path };
}

/** Dedupe while preserving first-seen order. */
export function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}
