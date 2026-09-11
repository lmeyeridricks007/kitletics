import type { Metadata } from "next";
import { BrandsHubPage } from "@/components/brands-hub/BrandsHubPage";
import { getCachedBrandsHubData } from "@/lib/performance/cached-hubs";
import { siteConfig } from "@/content/config";

export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{ sport?: string; q?: string; domain?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { domain, sport, q } = await searchParams;
  const { NOINDEX_FOLLOW } = await import("@/lib/seo/query-state");

  if (domain === "shoes") {
    return {
      title: "Shoe Brands",
      description:
        "Browse running and training shoe brands on Kitletics — logos, products, reviews and guides.",
      alternates: { canonical: `${siteConfig.url}/brands?domain=shoes` },
      robots: sport || q ? NOINDEX_FOLLOW : undefined,
    };
  }

  const filtered = Boolean(sport || q);
  return {
    title: "Brands",
    description:
      "Browse sports equipment brands on Kitletics — logos, products, reviews and guides.",
    alternates: { canonical: `${siteConfig.url}/brands` },
    robots: filtered ? NOINDEX_FOLLOW : undefined,
  };
}

export default async function BrandsPage({ searchParams }: PageProps) {
  const { sport, q, domain } = await searchParams;
  const shoesDomain = domain === "shoes";
  const data = await getCachedBrandsHubData({
    sportSlug: shoesDomain ? undefined : sport,
    query: q,
    domain: shoesDomain ? "shoes" : undefined,
  });
  return <BrandsHubPage data={data} />;
}
