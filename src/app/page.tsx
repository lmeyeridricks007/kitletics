import type { Metadata } from "next";
import { getCachedHomepageData } from "@/lib/performance/cached-hubs";
import { HomeHero } from "@/components/home/HomeHero";
import { FinderPanel } from "@/components/home/FinderPanel";
import { ExploreBySport } from "@/components/home/ExploreBySport";
import { BestProductsSection } from "@/components/home/BestProductsSection";
import { GuideComparisonsRow } from "@/components/home/GuideComparisonsRow";
import { GuidesJournalRow } from "@/components/home/GuidesJournalRow";
import { TrustRow } from "@/components/home/TrustRow";
import { NewsletterStrip } from "@/components/home/NewsletterStrip";
import {
  JsonLdScript,
  organizationJsonLd,
  webSiteJsonLd,
} from "@/lib/seo/jsonld";
import { siteConfig } from "@/content/config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} — ${siteConfig.tagline}`,
  },
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default async function HomePage() {
  const data = await getCachedHomepageData();

  return (
    <div className="bg-white overflow-x-clip">
      <JsonLdScript data={[organizationJsonLd(), webSiteJsonLd()]} />
      <HomeHero hero={data.hero} />
      <FinderPanel finder={data.finder} />
      <ExploreBySport />
      {data.bestSections.map((section) => (
        <BestProductsSection
          key={section.id}
          title={section.title}
          href={section.href}
          eyebrow={section.eyebrow}
          products={section.products}
        />
      ))}
      <GuideComparisonsRow
        featuredGuide={data.featuredGuide}
        comparisons={data.comparisons}
      />
      <GuidesJournalRow
        latestGuides={data.latestGuides}
        journalItems={data.journalItems}
      />
      <TrustRow />
      <NewsletterStrip />
    </div>
  );
}
