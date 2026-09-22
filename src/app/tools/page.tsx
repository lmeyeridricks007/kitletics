import type { Metadata } from "next";
import { ToolsHubPage } from "@/components/tools-hub/ToolsHubPage";
import { getToolsHubData } from "@/lib/tools/get-tools-hub-data";
import { breadcrumbsJsonLd } from "@/lib/navigation/breadcrumbs";
import { siteConfig } from "@/content/config";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Sports Gear Finders, Calculators & Comparison Tools",
  description:
    "Discover Kitletics finders, comparison tools, planners and calculators — structured decision tools for sport gear.",
  alternates: { canonical: `${siteConfig.url}/tools` },
};

export default function ToolsPage() {
  const data = getToolsHubData({ isDev: false });

  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Kitletics Tools",
    url: `${siteConfig.url}/tools`,
    description:
      "Discover Kitletics finders, comparison tools, planners and calculators.",
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
