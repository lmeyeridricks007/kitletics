import { isRegionCode } from "@/lib/region/resolve";
import { getBrandCatalogPrices } from "@/lib/commerce/get-scoped-catalog-prices";
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
  params: Promise<{ slug: string; region: string }>;
}

/**
 * Compact brand hub price map. Region comes only from the path.
 * Does not read cookies or call getBrandHubPageData.
 */
export async function GET(_request: Request, context: RouteProps) {
  const { slug, region } = await context.params;
  if (!isRegionCode(region)) {
    return catalogCommerceError("invalid_region", 400, true);
  }
  const data = getBrandCatalogPrices(slug, region);
  if (!data) {
    return catalogCommerceError("not_found", 404);
  }
  return catalogCommerceJson(data);
}
