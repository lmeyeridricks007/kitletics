import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getUseCaseListingConfig,
  getUseCaseListingConfigs,
  getUseCaseListingPageData,
} from "@/lib/use-case-listing";
import { ProductUseCaseListingPage } from "@/components/use-case-listing/ProductUseCaseListingPage";
import { siteConfig } from "@/content/config";
import { getSportBySlug, getCategoryByPathSegment } from "@/repositories";
import {
  hasNonCanonicalQueryState,
  NOINDEX_FOLLOW,
} from "@/lib/seo/query-state";


/** Request-time / heavy catalog pages — skip SSG to keep builds healthy. */
export const dynamic = "force-dynamic";
interface PageProps {
  params: Promise<{ sport: string; segment: string; listing: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  return getUseCaseListingConfigs().map((c) => ({
    sport: c.sportSlug,
    segment: c.categoryPathSegment,
    listing: c.slug,
  }));
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { sport, segment, listing } = await params;
  const sp = await searchParams;
  const config = getUseCaseListingConfig(sport, segment, listing);
  if (!config) return { title: "Not found" };

  const queryBlocked = hasNonCanonicalQueryState(sp);
  const title = config.seoTitle ?? config.title;
  const description = config.seoDescription ?? config.description;
  const canonicalPath = `/${config.sportSlug}/${config.categoryPathSegment}/${config.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
    },
    robots: queryBlocked ? NOINDEX_FOLLOW : undefined,
    openGraph: {
      title,
      description,
      siteName: siteConfig.name,
      type: "website",
    },
  };
}

export default async function UseCaseListingRoute({
  params,
  searchParams,
}: PageProps) {
  const { sport, segment, listing } = await params;
  const sp = await searchParams;

  // Guard: segment must be a category, not a discipline collision
  const sportEntity = getSportBySlug(sport);
  if (!sportEntity) notFound();
  const category = getCategoryByPathSegment(sportEntity.id, segment);
  if (!category) notFound();

  const { getRequestRegion } = await import("@/lib/region/server");
  const region = await getRequestRegion();

  const data = getUseCaseListingPageData({
    sportSlug: sport,
    categoryPathSegment: segment,
    listingSlug: listing,
    searchParams: sp,
    region,
  });
  if (!data) notFound();

  return <ProductUseCaseListingPage data={data} />;
}
