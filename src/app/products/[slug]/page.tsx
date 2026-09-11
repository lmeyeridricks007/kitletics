import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailPage } from "@/components/product/ProductDetailPage";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getProductBySlug, getProducts } from "@/repositories";
import { productMetadata } from "@/lib/seo/metadata";
import { getRequestRegion } from "@/lib/region/server";
import {
  getLaunchEligibility,
  isLaunchPreviewContext,
} from "@/domain/launch";
import {
  enforceLaunchEligibility,
  withLaunchRobots,
} from "@/lib/launch/apply-eligibility";
import { LaunchEligibilityDebug } from "@/components/launch/LaunchEligibilityDebug";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  const elig = getLaunchEligibility({ kind: "product", entity: product });
  return withLaunchRobots(productMetadata(product), elig);
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug, {
    isDev: process.env.NODE_ENV !== "production",
  });
  if (!product) notFound();

  const elig = getLaunchEligibility({ kind: "product", entity: product });
  enforceLaunchEligibility(elig);

  const region = await getRequestRegion();
  const data = getProductPageData(slug, {
    region,
    isDev: process.env.NODE_ENV !== "production",
  });
  if (!data) notFound();

  return (
    <>
      <ProductDetailPage data={data} />
      <LaunchEligibilityDebug
        eligibility={elig}
        enabled={isLaunchPreviewContext()}
      />
    </>
  );
}
