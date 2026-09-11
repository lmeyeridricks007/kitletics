import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { GearSetupPage } from "@/components/setups/GearSetupPage";
import {
  getGearSetupPageData,
  getGearSetupCanonicalPath,
} from "@/lib/setups/get-gear-setup-page-data";
import { getGearSetups, getGearSetupBySlug } from "@/repositories";
import { breadcrumbsJsonLd } from "@/lib/navigation/breadcrumbs";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { siteConfig } from "@/content/config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const setups = getGearSetups();
  const slugs = new Set<string>();
  for (const s of setups) {
    slugs.add(s.slug);
    for (const alias of s.slugAliases ?? []) slugs.add(alias);
  }
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const setup = getGearSetupBySlug(slug);
  if (!setup) return { title: "Setup" };

  const canonical = `${siteConfig.url}/setups/${setup.slug}`;

  if (setup.slugAliases?.includes(slug) && setup.slug !== slug) {
    return {
      title: setup.seoTitle ?? setup.title,
      alternates: { canonical },
      robots: { index: false, follow: true },
    };
  }

  return {
    title: setup.seoTitle ?? setup.title,
    description: setup.seoDescription ?? setup.description,
    alternates: { canonical },
  };
}

export default async function SetupDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const setup = getGearSetupBySlug(slug);
  if (!setup) notFound();

  if (setup.slugAliases?.includes(slug) && setup.slug !== slug) {
    permanentRedirect(`/setups/${setup.slug}`);
  }

  const data = getGearSetupPageData(setup.slug, {
    region: DEFAULT_REGION,
    isDev: false,
  });
  if (!data) notFound();

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: data.setup.title,
    description: data.setup.description,
    numberOfItems: data.allListItems.length,
    itemListElement: data.allListItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.product.fullName,
      url: `${getGearSetupCanonicalPath(data.setup).replace(/\/setups\/.*/, "")}/products/${item.product.slug}`,
    })),
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
          __html: JSON.stringify(itemListLd),
        }}
      />
      <GearSetupPage data={data} />
    </>
  );
}
