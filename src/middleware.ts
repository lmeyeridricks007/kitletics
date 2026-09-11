import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isFinderToolSlug } from "@/lib/tools/finder-slugs";

const APEX_HOST = "kitletics.com";

/**
 * - Canonical host: www → apex (308) so Ahrefs/Google don't split equity
 * - Finder URL rewrite for SEO-stable /tools/<slug>
 * - /images/* → Vercel Blob when MEDIA_BLOB_BASE_URL is set
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (host === `www.${APEX_HOST}`) {
    const url = request.nextUrl.clone();
    url.hostname = APEX_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

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
  matcher: [
    /*
     * Host redirect + existing rewrites. Skip static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/images/:path*",
  ],
};
