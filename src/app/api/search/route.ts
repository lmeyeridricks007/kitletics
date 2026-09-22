import { NextResponse } from "next/server";
import { getSearchPageData } from "@/lib/search/get-search-page-data";
import { isRegionCode } from "@/lib/region/resolve";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { COMMERCE_ROBOTS } from "@/lib/product/product-commerce";

/** Do not ISR this route — q is unbounded. HTTP CDN cache only. */
export const dynamic = "force-dynamic";

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 80;

function first(value: string | null): string {
  return value?.trim() ?? "";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = first(url.searchParams.get("q")).slice(0, MAX_QUERY_LENGTH);
  const type = first(url.searchParams.get("type")) || undefined;
  const brand = first(url.searchParams.get("brand")) || undefined;
  const regionRaw = first(url.searchParams.get("region"));
  const region = isRegionCode(regionRaw) ? regionRaw : DEFAULT_REGION;
  const minRaw = url.searchParams.get("minPrice");
  const maxRaw = url.searchParams.get("maxPrice");
  const feature = url.searchParams.getAll("feature");
  const minPrice = minRaw != null ? Number(minRaw) : undefined;
  const maxPrice = maxRaw != null ? Number(maxRaw) : undefined;

  if (q.length > 0 && q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json(
      getSearchPageData({ query: "", region }),
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "X-Robots-Tag": COMMERCE_ROBOTS,
        },
      },
    );
  }

  const data = getSearchPageData({
    query: q,
    type,
    brand,
    minPrice:
      minPrice != null && Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice:
      maxPrice != null && Number.isFinite(maxPrice) ? maxPrice : undefined,
    features: feature.flatMap((f) => f.split(",")).map((f) => f.trim()).filter(Boolean),
    region,
    preview: false,
  });

  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Cache-Control": q
        ? "public, s-maxage=120, stale-while-revalidate=600"
        : "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": COMMERCE_ROBOTS,
    },
  });
}
