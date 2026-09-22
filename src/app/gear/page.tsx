import type { Metadata } from "next";
import { siteConfig } from "@/content/config";
import { getGearHubData } from "@/lib/gear-hub";
import { GearHubPage } from "@/components/gear-hub/GearHubPage";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { CatalogPriceIsland } from "@/components/commerce/CatalogPriceIsland";
import { getGearHubCatalogPrices } from "@/lib/commerce/get-scoped-catalog-prices";

/**
 * Canonical /gear hub — ISR. Filters are client URL state.
 * Regional prices hydrate from GET /api/gear/commerce/[region].
 */
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Sports Gear & Equipment",
  description:
    "Explore sports gear across running, fitness, racket sports and more, with tools, comparisons and buying guides.",
  alternates: {
    canonical: `${siteConfig.url}/gear`,
  },
};

export default function GearRoutePage() {
  const data = getGearHubData({ region: DEFAULT_REGION, filters: {} });
  const initialMap = getGearHubCatalogPrices(DEFAULT_REGION);

  return (
    <CatalogPriceIsland endpoint="/api/gear/commerce" initialMap={initialMap}>
      <GearHubPage data={data} />
    </CatalogPriceIsland>
  );
}
