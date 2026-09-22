import { isRegionCode } from "@/lib/region/resolve";
import { getGearHubCatalogPrices } from "@/lib/commerce/get-scoped-catalog-prices";
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
  params: Promise<{ region: string }>;
}

/**
 * Compact gear-hub price map. Does not call getGearHubData.
 */
export async function GET(_request: Request, context: RouteProps) {
  const { region } = await context.params;
  if (!isRegionCode(region)) {
    return catalogCommerceError("invalid_region", 400, true);
  }
  return catalogCommerceJson(getGearHubCatalogPrices(region));
}
