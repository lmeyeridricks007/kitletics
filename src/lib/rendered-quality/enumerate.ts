import sitemap from "@/app/sitemap";
import { discoverRoutes } from "@/domain/site-quality/discover";
import { siteConfig } from "@/content/config";
import { SITE_ORIGIN, type RenderedTemplate } from "./types";

export type IndexableUrl = {
  path: string;
  url: string;
  template: RenderedTemplate;
};

function templateOf(path: string, pageType: string): RenderedTemplate {
  if (path === "/running/shoes/database") return "data-product";
  if (path.startsWith("/authors/")) return "author";
  if (
    path === "/about" ||
    path === "/methodology" ||
    path === "/how-we-review" ||
    path === "/affiliate-disclosure" ||
    path === "/contact" ||
    path === "/privacy" ||
    path === "/terms" ||
    path === "/editorial-policy" ||
    path === "/evidence-policy" ||
    path === "/scoring-methodology"
  ) {
    return "static";
  }
  return pageType as RenderedTemplate;
}

/**
 * Every INDEXABLE URL in the production-candidate sitemap.
 * No sampling. Search / preview / API are excluded by sitemap + discover.
 */
export function enumerateIndexableUrls(): IndexableUrl[] {
  const routes = discoverRoutes(siteConfig.url);
  const byPath = new Map<string, IndexableUrl>();

  for (const route of routes) {
    if (!route.indexable) continue;
    byPath.set(route.path, {
      path: route.path,
      url: route.absoluteUrl,
      template: templateOf(route.path, route.pageType),
    });
  }

  // Sitemap is the publication contract — include any INDEXABLE path
  // discoverRoutes might classify as other but still ships.
  for (const entry of sitemap()) {
    try {
      const u = new URL(entry.url);
      const path = u.pathname || "/";
      if (byPath.has(path)) continue;
      byPath.set(path, {
        path,
        url: entry.url.startsWith("http") ? entry.url : `${SITE_ORIGIN}${path}`,
        template: templateOf(path, "other"),
      });
    } catch {
      // skip
    }
  }

  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}
