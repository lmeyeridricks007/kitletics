import { isRegionCode } from "@/lib/region/resolve";
import { getCategoryCatalogPrices } from "@/lib/commerce/get-scoped-catalog-prices";
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
  params: Promise<{ sport: string; segment: string; region: string }>;
}

/**
 * Compact category card-commerce map. Region comes only from the path.
 * Does not assemble editorial category pages.
 */
export async function GET(_request: Request, context: RouteProps) {
  const { sport, segment, region } = await context.params;
  if (!isRegionCode(region)) {
    return catalogCommerceError("invalid_region", 400, true);
  }
  const data = getCategoryCatalogPrices(sport, segment, region);
  if (!data) {
    return catalogCommerceError("not_found", 404);
  }
  return catalogCommerceJson(data);
}
