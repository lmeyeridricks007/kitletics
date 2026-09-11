import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isFinderToolSlug } from "@/lib/tools/finder-slugs";

/**
 * Public Finder URLs stay `/tools/<slug>` for SEO and bookmarks.
 * Internally rewrite to `/tools/finder/<slug>` so the Finder client graph
 * never shares a page chunk with Home Gym / Hyrox / calculator catalogs.
 *
 * When MEDIA_BLOB_BASE_URL is set (Vercel Blob), `/images/*` is rewritten to
 * the public Blob store so production can omit the multi‑GB public/images tree.
 * Locally, leave unset and serve from public/images as usual.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const blobBase = process.env.MEDIA_BLOB_BASE_URL?.replace(/\/$/, "");
  if (blobBase && pathname.startsWith("/images/")) {
    return NextResponse.rewrite(new URL(pathname, `${blobBase}/`));
  }

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
  matcher: ["/tools/:slug", "/images/:path*"],
};
