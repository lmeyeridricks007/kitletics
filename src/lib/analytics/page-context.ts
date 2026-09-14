/**
 * Derive controlled page analytics context from a pathname.
 */

import type { AnalyticsPageType, PageContextParams } from "./types";

const SPORTS = new Set([
  "running",
  "padel",
  "tennis",
  "fitness",
  "cycling",
  "hiking",
  "swimming",
  "triathlon",
  "hyrox",
]);

export function classifyAnalyticsPageType(pathname: string): AnalyticsPageType {
  const path = pathname.split("?")[0] || "/";
  if (path === "/") return "home";
  if (path === "/search") return "search";
  if (path === "/running/shoes/database") return "shoe_database";
  if (path === "/padel/rackets/database") return "racket_database";
  if (path.startsWith("/products/") && path.endsWith("/alternatives")) {
    return "alternatives";
  }
  if (path.startsWith("/products/")) return "product";
  if (path.startsWith("/reviews/")) return "review";
  if (path.startsWith("/best/")) return "best_guide";
  if (path.startsWith("/guides/")) return "guide";
  if (path.startsWith("/compare/")) return "comparison";
  if (path === "/compare") return "comparison";
  if (path.startsWith("/brands/")) return "brand";
  if (path.startsWith("/tools/") && path.includes("/results")) return "finder";
  if (path.startsWith("/tools/finder") || path.startsWith("/finders/")) {
    return "finder";
  }
  if (path.startsWith("/tools/")) return "tool";

  const parts = path.split("/").filter(Boolean);
  if (parts.length === 1 && SPORTS.has(parts[0]!)) return "sport_hub";
  if (parts.length === 2 && SPORTS.has(parts[0]!)) return "discipline_hub";
  if (parts.length >= 3 && SPORTS.has(parts[0]!)) return "category";
  return "other";
}

export function buildPageContext(
  pathname: string,
  search = "",
): PageContextParams {
  const path = pathname.split("?")[0] || "/";
  const page_type = classifyAnalyticsPageType(path);
  const parts = path.split("/").filter(Boolean);
  const ctx: PageContextParams = {
    page_type,
    page_path: search ? `${path}${search.startsWith("?") ? search : `?${search}`}` : path,
  };

  if (page_type === "product" && parts[1]) {
    ctx.product_slug = parts[1];
  }
  if (page_type === "alternatives" && parts[1]) {
    ctx.product_slug = parts[1];
  }
  if (page_type === "review" && parts[1]) {
    ctx.content_slug = parts[1];
    ctx.product_slug = parts[1];
  }
  if (page_type === "best_guide" && parts[1]) {
    ctx.content_slug = parts[1];
  }
  if (page_type === "guide" && parts[1]) {
    ctx.content_slug = parts[1];
  }
  if (page_type === "comparison" && parts[1]) {
    ctx.content_slug = parts[1];
  }
  if (page_type === "brand" && parts[1]) {
    ctx.brand = parts[1];
  }
  if (page_type === "finder" && parts[1]) {
    ctx.content_slug = parts[1] === "finder" ? parts[2] : parts[1];
  }
  if (page_type === "tool" && parts[1]) {
    ctx.content_slug = parts[1];
  }
  if (page_type === "shoe_database") {
    ctx.sport = "running";
    ctx.discipline = "shoes";
    ctx.category = "database";
  }
  if (page_type === "racket_database") {
    ctx.sport = "padel";
    ctx.discipline = "rackets";
    ctx.category = "database";
  }
  if (
    (page_type === "sport_hub" ||
      page_type === "discipline_hub" ||
      page_type === "category") &&
    parts[0]
  ) {
    ctx.sport = parts[0];
  }
  if (page_type === "discipline_hub" && parts[1]) {
    ctx.discipline = parts[1];
  }
  if (page_type === "category") {
    if (parts[1]) ctx.discipline = parts[1];
    if (parts[2]) ctx.category = parts[2];
  }

  return ctx;
}

/** Decision-journey view_* event for a classified page, if any. */
export function viewEventForPageType(
  pageType: AnalyticsPageType,
):
  | "view_product"
  | "view_review"
  | "view_best_guide"
  | "view_guide"
  | "view_comparison"
  | "shoe_database_view"
  | "racket_database_view"
  | null {
  switch (pageType) {
    case "product":
      return "view_product";
    case "review":
      return "view_review";
    case "best_guide":
      return "view_best_guide";
    case "guide":
      return "view_guide";
    case "comparison":
      return "view_comparison";
    case "shoe_database":
      return "shoe_database_view";
    case "racket_database":
      return "racket_database_view";
    default:
      return null;
  }
}
