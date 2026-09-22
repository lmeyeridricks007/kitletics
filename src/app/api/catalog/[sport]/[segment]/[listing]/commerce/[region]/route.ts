import { isRegionCode } from "@/lib/region/resolve";
import { getListingCatalogPrices } from "@/lib/commerce/get-scoped-catalog-prices";
import {
  catalogCommerceError,
  catalogCommerceJson,
} from "@/lib/commerce/catalog-commerce-http";

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

interface RouteProps {
  params: Promise<{
    sport: string;
    segment: string;
    listing: string;
    region: string;
  }>;
}

/**
 * Compact listing card-commerce map. Shares the category product universe.
 */
export async function GET(_request: Request, context: RouteProps) {
  const { sport, segment, listing, region } = await context.params;
  if (!isRegionCode(region)) {
    return catalogCommerceError("invalid_region", 400, true);
  }
  const data = getListingCatalogPrices(sport, segment, listing, region);
  if (!data) {
    return catalogCommerceError("not_found", 404);
  }
  return catalogCommerceJson(data);
}
