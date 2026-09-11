import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBrandBySlug, getBrands } from "@/repositories";
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getBrands()
    .filter((b) => canRenderBrandHub(b))
    .map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand || !canRenderBrandHub(brand)) {
    return { title: "Brand", robots: { index: false, follow: false } };
  }

  const data = getBrandHubPageData({ brandSlug: slug });
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
  const { getRequestRegion } = await import("@/lib/region/server");
  const region = await getRequestRegion();

  const data = getBrandHubPageData({ brandSlug: slug, region });
  if (!data) notFound();

  return (
    <>
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
    </>
  );
}
