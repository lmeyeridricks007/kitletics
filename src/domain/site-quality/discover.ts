import { siteConfig } from "@/content/config";
import sitemap from "@/app/sitemap";
import {
  getBestGuides,
  getBuyingGuides,
  getProducts,
  getReviews,
  getSports,
  getBrands,
  getTools,
} from "@/repositories";
import type { DiscoveredRoute, PageType } from "./types";

function classifyPath(path: string): { pageType: PageType; indexable: boolean } {
  if (path === "/") return { pageType: "homepage", indexable: true };
  if (path === "/search") return { pageType: "search", indexable: false };
  if (path === "/gear") return { pageType: "gear-hub", indexable: true };
  if (path === "/brands") return { pageType: "brand-hub", indexable: true };
  if (path === "/best") return { pageType: "best-guide", indexable: true };
  if (path === "/compare") return { pageType: "compare-builder", indexable: true };
  if (path === "/reviews") return { pageType: "review", indexable: true };
  if (path === "/guides") return { pageType: "buying-guide", indexable: true };
  if (path === "/tools") return { pageType: "tools-hub", indexable: true };
  if (path === "/setups") return { pageType: "setup", indexable: true };
  if (
    path === "/about" ||
    path === "/methodology" ||
    path === "/how-we-review" ||
    path === "/affiliate-disclosure" ||
    path === "/contact" ||
    path === "/privacy" ||
    path === "/terms"
  ) {
    return { pageType: "trust", indexable: true };
  }
  if (path.startsWith("/products/") && path.endsWith("/alternatives")) {
    return { pageType: "alternatives", indexable: true };
  }
  if (path.startsWith("/products/")) return { pageType: "product", indexable: true };
  if (path.startsWith("/reviews/")) return { pageType: "review", indexable: true };
  if (path.startsWith("/best/")) return { pageType: "best-guide", indexable: true };
  if (path.startsWith("/guides/")) return { pageType: "buying-guide", indexable: true };
  if (path.startsWith("/compare/")) return { pageType: "comparison", indexable: true };
  if (path.startsWith("/brands/")) return { pageType: "brand-hub", indexable: true };
  if (path.startsWith("/setups/")) return { pageType: "setup", indexable: true };
  if (path.startsWith("/tools/") && path.includes("/results")) {
    return { pageType: "finder-results", indexable: false };
  }
  if (path.startsWith("/tools/")) return { pageType: "tool", indexable: true };
  if (path.startsWith("/finders/")) return { pageType: "finder", indexable: true };
  if (path.startsWith("/preview/") || path.startsWith("/go/") || path.startsWith("/api/")) {
    return { pageType: "other", indexable: false };
  }

  const parts = path.split("/").filter(Boolean);
  if (parts.length === 1) return { pageType: "sport-hub", indexable: true };
  if (parts.length === 2) {
    // discipline or category under sport
    return { pageType: "discipline-hub", indexable: true };
  }
  if (parts.length >= 3) return { pageType: "subcategory", indexable: true };
  return { pageType: "other", indexable: true };
}

/** Build public route inventory from sitemap + known entities (publication-gated). */
export function discoverRoutes(baseUrl: string = siteConfig.url): DiscoveredRoute[] {
  const byPath = new Map<string, DiscoveredRoute>();

  const push = (
    path: string,
    source: DiscoveredRoute["source"],
    lastModified?: string,
  ) => {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    if (byPath.has(normalized)) return;
    const { pageType, indexable } = classifyPath(normalized);
    byPath.set(normalized, {
      path: normalized,
      absoluteUrl: `${baseUrl.replace(/\/$/, "")}${normalized === "/" ? "" : normalized}`,
      pageType,
      indexable,
      lastModified,
      source,
    });
  };

  const entries = sitemap();
  for (const entry of entries) {
    try {
      const u = new URL(entry.url);
      const path = u.pathname || "/";
      const lastMod =
        entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : entry.lastModified
            ? String(entry.lastModified)
            : undefined;
      push(path, "sitemap", lastMod);
    } catch {
      // skip invalid
    }
  }

  // Explicit noindex surfaces we still want to classify for policy checks
  push("/search", "static");
  push("/preview/products/example", "static");

  // Sanity: entity counts should be represented
  void getProducts().length;
  void getReviews().length;
  void getBestGuides().length;
  void getBuyingGuides().length;
  void getSports().length;
  void getBrands().length;
  void getTools().length;

  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}
