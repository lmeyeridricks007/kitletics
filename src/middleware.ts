import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isFinderToolSlug } from "@/lib/tools/finder-slugs";
import { isValidIndexNowKey } from "@/lib/seo/indexnow/config";
import {
  basicAuthOk,
  isAdminGrowthPath,
  should404Admin,
} from "@/lib/admin/growth-gate";

const APEX_HOST = "kitletics.com";

/**
 * - Canonical host: www → apex (308) so Ahrefs/Google don't split equity
 * - IndexNow `/{key}.txt` → `/indexnow-key.txt`
 * - Finder URL rewrite for SEO-stable /tools/<slug>
 * - /images/* → Vercel Blob when MEDIA_BLOB_BASE_URL is set
 * - /admin/* basic auth + X-Robots-Tag noindex
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

  if (isAdminGrowthPath(pathname)) {
    if (should404Admin()) {
      return new NextResponse(null, { status: 404 });
    }
    if (!basicAuthOk(request.headers.get("authorization"))) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Kitletics growth"',
          "X-Robots-Tag": "noindex, nofollow",
        },
      });
    }
    const next = NextResponse.next();
    next.headers.set("X-Robots-Tag", "noindex, nofollow");
    next.headers.set("Referrer-Policy", "no-referrer");
    return next;
  }

  const indexNowKey = process.env.INDEXNOW_KEY?.trim();
  if (
    indexNowKey &&
    isValidIndexNowKey(indexNowKey) &&
    pathname === `/${indexNowKey}.txt`
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/indexnow-key.txt";
    return NextResponse.rewrite(url);
  }

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
     * Host redirect + IndexNow key file + existing rewrites.
     * Allow `.txt` through (IndexNow); still skip common static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:js|css|png|jpe?g|gif|webp|avif|ico|woff2?|map)$).*)",
    "/images/:path*",
    "/indexnow-key.txt",
  ],
};
