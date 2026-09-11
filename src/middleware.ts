import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isFinderToolSlug } from "@/lib/tools/finder-slugs";

/**
 * Public Finder URLs stay `/tools/<slug>` for SEO and bookmarks.
 * Internally rewrite to `/tools/finder/<slug>` so the Finder client graph
 * never shares a page chunk with Home Gym / Hyrox / calculator catalogs.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const match = pathname.match(/^\/tools\/([^/]+)\/?$/);
  if (!match) return NextResponse.next();

  const slug = match[1];
  if (
    slug === "finder" ||
    slug === "workspace" ||
    slug === "page" ||
    !isFinderToolSlug(slug)
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/tools/finder/${slug}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/tools/:slug"],
};
