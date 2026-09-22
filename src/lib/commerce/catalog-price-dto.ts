import type { RegionCode } from "@/domain/shared/types";
import { REGION_META } from "@/domain/shared/types";
import type { CommercePrice } from "@/lib/product/product-commerce";

export type CatalogPriceRow = {
  lowestPrice: CommercePrice | null;
  offerCount: number;
  bestOfferId?: string;
  bestGoUrl?: string;
};

export type CatalogPriceMapResponse = {
  region: RegionCode;
  regionLabel: string;
  currency: string;
  products: Record<string, CatalogPriceRow>;
};

export function emptyCatalogPriceMap(
  region: RegionCode,
): CatalogPriceMapResponse {
  const meta = REGION_META[region];
  return {
    region,
    regionLabel: meta.label,
    currency: meta.currency,
    products: {},
  };
}

export function parseCatalogPriceMap(
  payload: unknown,
): CatalogPriceMapResponse | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Partial<CatalogPriceMapResponse>;
  if (typeof data.region !== "string") return null;
  if (typeof data.regionLabel !== "string") return null;
  if (typeof data.currency !== "string") return null;
  if (!data.products || typeof data.products !== "object") return null;
  return data as CatalogPriceMapResponse;
}
