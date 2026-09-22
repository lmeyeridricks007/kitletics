import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isFinderToolSlug } from "@/lib/tools/finder-slugs";
import { isValidIndexNowKey } from "@/lib/seo/indexnow/config";
import {
  basicAuthOk,
  isAdminGrowthPath,
  should404Admin,
} from "@/lib/admin/growth-gate";
import { resolveRunningShoesEntryRedirect } from "@/lib/catalog/params";

const APEX_HOST = "kitletics.com";

function searchParamsRecord(
  searchParams: URLSearchParams,
): Record<string, string> {
  const out: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

function shouldNoindexQuery(
  pathname: string,
  searchParams: URLSearchParams,
): boolean {
  if (searchParams.size === 0) return false;
  if (pathname === "/gear" || pathname === "/search") return true;
  if (
    pathname === "/best" ||
    pathname === "/brands" ||
    pathname === "/reviews" ||
    pathname === "/guides" ||
    pathname === "/compare" ||
    pathname === "/setups"
  ) {
    return true;
  }
  if (pathname.startsWith("/tools/")) return true;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return false;
  const reserved = new Set([
    "products",
    "reviews",
    "best",
    "brands",
    "guides",
    "compare",
    "authors",
    "blog",
    "api",
    "admin",
    "preview",
    "go",
    "tools",
  ]);
  if (reserved.has(parts[0])) return false;
  return true;
}

/**
 * - Canonical host: www → apex (308)
 * - IndexNow `/{key}.txt` → `/indexnow-key.txt`
 * - Finder URL rewrite for SEO-stable /tools/<slug>
 * - /running/shoes entry intents → canonical listing paths
 * - Facet/query HTML gets X-Robots-Tag noindex without dynamizing RSC
 * - /admin/* basic auth + X-Robots-Tag noindex
 *
 * Image Blob delivery is next.config rewrites, not this matcher.
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

  if (pathname === "/running/shoes") {
    const dest = resolveRunningShoesEntryRedirect(
      searchParamsRecord(request.nextUrl.searchParams),
    );
    if (dest) {
      const url = request.nextUrl.clone();
      const [path, qs] = dest.split("?");
      url.pathname = path;
      url.search = qs ? `?${qs}` : "";
      return NextResponse.redirect(url, 307);
    }
  }

  const finderMatch = pathname.match(/^\/tools\/([^/]+)\/?$/);
  if (finderMatch) {
    const slug = finderMatch[1];
    if (
      slug !== "finder" &&
      slug !== "workspace" &&
      slug !== "page" &&
      isFinderToolSlug(slug)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = `/tools/finder/${slug}`;
      const rewritten = NextResponse.rewrite(url);
      if (shouldNoindexQuery(pathname, request.nextUrl.searchParams)) {
        rewritten.headers.set("X-Robots-Tag", "noindex, follow");
      }
      return rewritten;
    }
  }

  if (shouldNoindexQuery(pathname, request.nextUrl.searchParams)) {
    const next = NextResponse.next();
    next.headers.set("X-Robots-Tag", "noindex, follow");
    return next;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Host redirect + IndexNow + finder rewrite + catalog query noindex.
     * Image files skip middleware (extension exclusion). Blob is next.config.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:js|css|png|jpe?g|gif|webp|avif|ico|woff2?|map)$).*)",
    "/indexnow-key.txt",
  ],
};
