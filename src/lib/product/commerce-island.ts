import { DEFAULT_REGION } from "@/domain/shared/types";
import type { RegionCode } from "@/domain/shared/types";
import type { ProductCommerceResponse } from "@/lib/product/product-commerce";

export function shouldFetchRegionalCommerce(region: RegionCode): boolean {
  return region !== DEFAULT_REGION;
}

export function regionalCommercePath(slug: string, region: RegionCode): string {
  return `/api/products/${encodeURIComponent(slug)}/commerce/${region}`;
}

export function isStaleCommerceGeneration(
  requestGeneration: number,
  activeGeneration: number,
): boolean {
  return requestGeneration !== activeGeneration;
}

export function parseCommerceResponse(
  payload: unknown,
): ProductCommerceResponse | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Partial<ProductCommerceResponse>;
  if (typeof data.productId !== "string") return null;
  if (typeof data.slug !== "string") return null;
  if (typeof data.region !== "string") return null;
  if (!Array.isArray(data.offers)) return null;
  if (!Array.isArray(data.offersOtherRegions)) return null;
  if (!data.peerPrices || typeof data.peerPrices !== "object") return null;
  return data as ProductCommerceResponse;
}
