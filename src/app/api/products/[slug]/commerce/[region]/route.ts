import { NextResponse } from "next/server";
import { isRegionCode } from "@/lib/region/resolve";
import { getProductCommerce } from "@/lib/product/get-product-commerce";
import {
  COMMERCE_CACHE_CONTROL,
  COMMERCE_NO_STORE,
  COMMERCE_ROBOTS,
} from "@/lib/product/product-commerce";

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

const OK_HEADERS = {
  "Cache-Control": COMMERCE_CACHE_CONTROL,
  "X-Robots-Tag": COMMERCE_ROBOTS,
};

const NO_STORE_HEADERS = {
  "Cache-Control": COMMERCE_NO_STORE,
  "X-Robots-Tag": COMMERCE_ROBOTS,
};

interface RouteProps {
  params: Promise<{ slug: string; region: string }>;
}

/**
 * Regional PDP commerce JSON. Region comes only from the path.
 * Do not read cookies or request headers.
 */
export async function GET(_request: Request, context: RouteProps) {
  const { slug, region } = await context.params;
  if (!isRegionCode(region)) {
    return NextResponse.json(
      { error: "invalid_region" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const data = getProductCommerce(slug, region, { isDev: false });
  if (!data) {
    return NextResponse.json(
      { error: "not_found" },
      { status: 404, headers: OK_HEADERS },
    );
  }

  return NextResponse.json(data, { status: 200, headers: OK_HEADERS });
}
