import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getUseCaseListingConfig,
  getUseCaseListingPageData,
} from "@/lib/use-case-listing";
import { ProductUseCaseListingPage } from "@/components/use-case-listing/ProductUseCaseListingPage";
import { siteConfig } from "@/content/config";
import { getSportBySlug, getCategoryByPathSegment } from "@/repositories";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { CatalogPriceIsland } from "@/components/commerce/CatalogPriceIsland";
import { getListingCatalogPrices } from "@/lib/commerce/get-scoped-catalog-prices";
import { emptyCatalogPriceMap } from "@/lib/commerce/catalog-price-map";

/**
 * Canonical use-case listing — on-demand ISR.
 * Facets are client state. Card prices hydrate from the listing commerce API.
 */
export const revalidate = 86400;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ sport: string; segment: string; listing: string }>;
}

export function generateStaticParams() {
  return [];
}

const getCachedListing = cache(
  (sport: string, segment: string, listing: string) =>
    getUseCaseListingPageData({
      sportSlug: sport,
      categoryPathSegment: segment,
      listingSlug: listing,
      region: DEFAULT_REGION,
    }),
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { sport, segment, listing } = await params;
  const config = getUseCaseListingConfig(sport, segment, listing);
  if (!config) return { title: "Not found" };

  const title = config.seoTitle ?? config.title;
  const description = config.seoDescription ?? config.description;
  const canonicalPath = `/${config.sportSlug}/${config.categoryPathSegment}/${config.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
    },
    openGraph: {
      title,
      description,
      siteName: siteConfig.name,
      type: "website",
    },
  };
}

export default async function UseCaseListingRoute({ params }: PageProps) {
  const { sport, segment, listing } = await params;

  const sportEntity = getSportBySlug(sport);
  if (!sportEntity) notFound();
  const category = getCategoryByPathSegment(sportEntity.id, segment);
  if (!category) notFound();

  const data = getCachedListing(sport, segment, listing);
  if (!data) notFound();

  const initialMap =
    getListingCatalogPrices(sport, segment, listing, DEFAULT_REGION) ??
    emptyCatalogPriceMap(DEFAULT_REGION);

  return (
    <CatalogPriceIsland
      endpoint={`/api/catalog/${encodeURIComponent(sport)}/${encodeURIComponent(segment)}/${encodeURIComponent(listing)}/commerce`}
      initialMap={initialMap}
    >
      <ProductUseCaseListingPage data={data} />
    </CatalogPriceIsland>
  );
}
