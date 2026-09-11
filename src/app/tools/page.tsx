import type { Metadata } from "next";
import { ToolsHubPage } from "@/components/tools-hub/ToolsHubPage";
import { getToolsHubData } from "@/lib/tools/get-tools-hub-data";
import { breadcrumbsJsonLd } from "@/lib/navigation/breadcrumbs";
import { siteConfig } from "@/content/config";

interface PageProps {
  searchParams: Promise<{ sport?: string; type?: string; domain?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { domain, type, sport } = await searchParams;
  const { NOINDEX_FOLLOW } = await import("@/lib/seo/query-state");

  // Intentional shoes-domain landing (linked from shoes IA)
  if (domain === "shoes") {
    return {
      title: "Shoe Finders & Planners",
      description:
        "Running shoe finders and planners — match footwear to how you run, goals and budget.",
      alternates: {
        canonical: `${siteConfig.url}/tools?domain=shoes&type=finder`,
      },
    };
  }

  const filtered = Boolean(type || sport);
  return {
    title: "Sports Gear Finders, Calculators & Comparison Tools",
    description:
      "Discover Kitletics finders, comparison tools, planners and calculators — structured decision tools for sport gear.",
    alternates: { canonical: `${siteConfig.url}/tools` },
    robots: filtered ? NOINDEX_FOLLOW : undefined,
  };
}

export default async function ToolsPage({ searchParams }: PageProps) {
  const { sport, type, domain } = await searchParams;
  const shoesDomain = domain === "shoes";
  const data = getToolsHubData({
    sport: shoesDomain ? undefined : sport,
    type: type ?? (shoesDomain ? "finder" : undefined),
    domain: shoesDomain ? "shoes" : undefined,
    isDev: false,
  });

  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: shoesDomain ? "Kitletics Shoe Finders" : "Kitletics Tools",
    url: shoesDomain
      ? `${siteConfig.url}/tools?domain=shoes&type=finder`
      : `${siteConfig.url}/tools`,
    description: shoesDomain
      ? "Shoe finders and planners for running and training footwear."
      : "Discover Kitletics finders, comparison tools, planners and calculators.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbsJsonLd(data.breadcrumbs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemList),
        }}
      />
      <ToolsHubPage data={data} />
    </>
  );
}
