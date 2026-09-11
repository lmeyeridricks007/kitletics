import type { Metadata } from "next";
import { SearchResultsPage } from "@/components/search/SearchResultsPage";
import { getSearchPageData } from "@/lib/search/get-search-page-data";
import { getRequestRegion } from "@/lib/region/server";
import { siteConfig } from "@/content/config";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Kitletics products, brands, guides and tools.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${siteConfig.url}/search` },
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    feature?: string | string[];
  }>;
}

function parseFeatures(feature?: string | string[]): string[] {
  if (!feature) return [];
  const list = Array.isArray(feature) ? feature : [feature];
  return list
    .flatMap((f) => f.split(","))
    .map((f) => f.trim())
    .filter(Boolean);
}

export default async function SearchPage({ searchParams }: PageProps) {
  const {
    q = "",
    type,
    brand,
    minPrice: minRaw,
    maxPrice: maxRaw,
    feature,
  } = await searchParams;
  const region = await getRequestRegion();
  const minPrice = minRaw != null ? Number(minRaw) : undefined;
  const maxPrice = maxRaw != null ? Number(maxRaw) : undefined;

  const data = getSearchPageData({
    query: q,
    type,
    brand,
    minPrice:
      minPrice != null && Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice:
      maxPrice != null && Number.isFinite(maxPrice) ? maxPrice : undefined,
    features: parseFeatures(feature),
    region,
    preview: process.env.NODE_ENV === "development",
  });

  return <SearchResultsPage data={data} />;
}
