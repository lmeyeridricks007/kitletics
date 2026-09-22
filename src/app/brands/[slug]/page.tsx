import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBrandBySlug } from "@/repositories";
import { getBrandHubPageData } from "@/lib/brand-hub";
import { BrandHubPage } from "@/components/brand-hub/BrandHubPage";
import { siteConfig } from "@/content/config";
import { isBrandHubIndexable, canRenderBrandHub } from "@/lib/seo/brand-indexability";
import {
  JsonLdScript,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo/jsonld";
import { DEFAULT_REGION } from "@/domain/shared/types";
import { CatalogPriceIsland } from "@/components/commerce/CatalogPriceIsland";
import { getBrandCatalogPrices } from "@/lib/commerce/get-scoped-catalog-prices";
import { emptyCatalogPriceMap } from "@/lib/commerce/catalog-price-map";

/**
 * Canonical brand hub — on-demand ISR.
 * Product set and editorial order are DEFAULT_REGION (NL).
 * Regional card prices hydrate from GET /api/brands/[slug]/commerce/[region].
 */
export const revalidate = 86400;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [];
}

const getCachedBrand = cache((slug: string) => getBrandBySlug(slug));

const getCachedBrandHub = cache((slug: string) =>
  getBrandHubPageData({ brandSlug: slug, region: DEFAULT_REGION }),
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = getCachedBrand(slug);
  if (!brand || !canRenderBrandHub(brand)) {
    return { title: "Brand", robots: { index: false, follow: false } };
  }

  const data = getCachedBrandHub(slug);
  const indexable = isBrandHubIndexable(brand);
  const title = `${brand.name} Products, Reviews & Buying Guides`;
  const description =
    data?.brand.summary ??
    brand.seoDescription ??
    `Explore ${brand.name} products, product families, reviews, comparisons and current retailer offers on Kitletics.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/brands/${brand.slug}`,
    },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      siteName: siteConfig.name,
      type: "website",
    },
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getCachedBrandHub(slug);
  if (!data) notFound();

  const initialMap =
    getBrandCatalogPrices(slug, DEFAULT_REGION) ??
    emptyCatalogPriceMap(DEFAULT_REGION);

  return (
    <CatalogPriceIsland
      endpoint={`/api/brands/${encodeURIComponent(slug)}/commerce`}
      initialMap={initialMap}
    >
      <JsonLdScript
        data={[
          breadcrumbJsonLd(data.breadcrumbs),
          collectionPageJsonLd({
            name: data.brand.name,
            description: data.brand.description,
            url: `/brands/${data.brand.slug}`,
          }),
          data.products.items.length > 0
            ? itemListJsonLd(
                data.products.title,
                data.products.items.map((p) => ({
                  name: p.fullName,
                  url: p.href,
                })),
              )
            : null,
        ]}
      />
      <BrandHubPage data={data} />
    </CatalogPriceIsland>
  );
}
