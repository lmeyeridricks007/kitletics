import type { Product } from "@/domain/products/types";
import type { RegionCode } from "@/domain/shared/types";
import {
  getBestGuideBySlug,
  getBrandBySlug,
  getCategoryByPathSegment,
  getCategoryBySlug,
  getProductsByBrand,
  getProductsByCategory,
  getProductsBySport,
  getSportBySlug,
} from "@/repositories";
import { getLaunchEligibility, isLaunchListable } from "@/domain/launch";
import { getUseCaseListingConfig } from "@/lib/use-case-listing/config";
import {
  GEAR_HUB_PICK_GUIDES,
  GEAR_HUB_SHOP_CARDS,
} from "@/lib/gear-hub/config";
import {
  buildCatalogPriceMapFromProductIds,
  type CatalogPriceMapResponse,
} from "@/lib/commerce/catalog-price-map";

const PUBLISH = { isDev: false } as const;

function listableProductIds(products: Product[]): string[] {
  return products
    .filter((p) =>
      isLaunchListable(
        getLaunchEligibility({ kind: "product", entity: p }, PUBLISH),
      ),
    )
    .map((p) => p.id);
}

/**
 * Compact guide commerce. Uses recommendation product ids only —
 * does not call getBestGuidePageData.
 */
export function getBestGuideCatalogPrices(
  slug: string,
  region: RegionCode,
): CatalogPriceMapResponse | undefined {
  const guide = getBestGuideBySlug(slug, PUBLISH);
  if (!guide) return undefined;
  const ids = [...guide.recommendations]
    .sort((a, b) => a.rank - b.rank)
    .map((r) => r.productId);
  return buildCatalogPriceMapFromProductIds(ids, region);
}

/**
 * Compact brand hub price map. Product graph only — no BrandHubPageData.
 */
export function getBrandCatalogPrices(
  slug: string,
  region: RegionCode,
): CatalogPriceMapResponse | undefined {
  const brand = getBrandBySlug(slug, PUBLISH);
  if (!brand) return undefined;
  const ids = listableProductIds(getProductsByBrand(brand.id, PUBLISH));
  return buildCatalogPriceMapFromProductIds(ids, region);
}

/**
 * Compact category listing price map.
 */
export function getCategoryCatalogPrices(
  sportSlug: string,
  pathSegment: string,
  region: RegionCode,
): CatalogPriceMapResponse | undefined {
  const sport = getSportBySlug(sportSlug, PUBLISH);
  if (!sport) return undefined;
  const category = getCategoryByPathSegment(sport.id, pathSegment, PUBLISH);
  if (!category) return undefined;
  const ids = listableProductIds(
    getProductsByCategory(category.id, PUBLISH).filter((p) =>
      p.sportIds.includes(sport.id),
    ),
  );
  return buildCatalogPriceMapFromProductIds(ids, region);
}

/**
 * Listing pages share the category product universe.
 */
export function getListingCatalogPrices(
  sportSlug: string,
  pathSegment: string,
  listingSlug: string,
  region: RegionCode,
): CatalogPriceMapResponse | undefined {
  const config = getUseCaseListingConfig(sportSlug, pathSegment, listingSlug);
  if (!config) return undefined;
  return getCategoryCatalogPrices(sportSlug, pathSegment, region);
}

/**
 * Gear hub overlay: shop-card categories + configured pick guides.
 * Does not call getGearHubData.
 */
export function getGearHubCatalogPrices(
  region: RegionCode,
): CatalogPriceMapResponse {
  const ids: string[] = [];
  for (const card of GEAR_HUB_SHOP_CARDS) {
    if (card.type === "category" && card.categorySlug) {
      const category = getCategoryBySlug(card.categorySlug, PUBLISH);
      if (!category) continue;
      ids.push(...listableProductIds(getProductsByCategory(category.id, PUBLISH)));
    } else if (card.type === "sport" && card.sportSlug) {
      const sport = getSportBySlug(card.sportSlug, PUBLISH);
      if (!sport) continue;
      ids.push(...listableProductIds(getProductsBySport(sport.id, PUBLISH)));
    }
  }
  for (const slot of GEAR_HUB_PICK_GUIDES) {
    const guide = getBestGuideBySlug(slot.guideSlug, PUBLISH);
    for (const rec of guide?.recommendations ?? []) {
      ids.push(rec.productId);
    }
  }
  return buildCatalogPriceMapFromProductIds(ids, region);
}
