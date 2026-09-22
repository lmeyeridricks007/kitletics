import { NextResponse } from "next/server";
import type { CatalogPriceMapResponse } from "@/lib/commerce/catalog-price-dto";
import {
  COMMERCE_CACHE_CONTROL,
  COMMERCE_NO_STORE,
  COMMERCE_ROBOTS,
} from "@/lib/product/product-commerce";

export const CATALOG_COMMERCE_OK_HEADERS = {
  "Cache-Control": COMMERCE_CACHE_CONTROL,
  "X-Robots-Tag": COMMERCE_ROBOTS,
};

export const CATALOG_COMMERCE_NO_STORE_HEADERS = {
  "Cache-Control": COMMERCE_NO_STORE,
  "X-Robots-Tag": COMMERCE_ROBOTS,
};

export function catalogCommerceJson(
  data: CatalogPriceMapResponse,
  status = 200,
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: CATALOG_COMMERCE_OK_HEADERS,
  });
}

export function catalogCommerceError(
  error: string,
  status: number,
  noStore = false,
): NextResponse {
  return NextResponse.json(
    { error },
    {
      status,
      headers: noStore
        ? CATALOG_COMMERCE_NO_STORE_HEADERS
        : CATALOG_COMMERCE_OK_HEADERS,
    },
  );
}
