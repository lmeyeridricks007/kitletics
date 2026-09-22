import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailPage } from "@/components/product/ProductDetailPage";
import { getProductPageData } from "@/lib/product/get-product-page-data";
import { getProductBySlug } from "@/repositories";
import { productMetadata } from "@/lib/seo/metadata";
import { DEFAULT_REGION } from "@/domain/shared/types";
import {
  getLaunchEligibility,
  isLaunchPreviewContext,
} from "@/domain/launch";
import {
  enforceLaunchEligibility,
  withLaunchRobots,
} from "@/lib/launch/apply-eligibility";
import { LaunchEligibilityDebug } from "@/components/launch/LaunchEligibilityDebug";

/**
 * Canonical PDP — on-demand ISR (Phase A).
 * One cached HTML document per pathname; default-region (NL) commerce in the
 * server document. Do not walk the catalog at build. Do not read cookies here.
 */
export const revalidate = 86400;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Empty list → first legitimate request generates, then Incremental Cache. */
export function generateStaticParams() {
  return [];
}

const getPdpProduct = cache((slug: string) =>
  getProductBySlug(slug, {
    isDev: process.env.NODE_ENV !== "production",
  }),
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getPdpProduct(slug);
  if (!product) return { title: "Product" };
  const elig = getLaunchEligibility({ kind: "product", entity: product });
  return withLaunchRobots(productMetadata(product), elig);
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getPdpProduct(slug);
  if (!product) notFound();

  const elig = getLaunchEligibility({ kind: "product", entity: product });
  enforceLaunchEligibility(elig);

  const data = getProductPageData(slug, {
    region: DEFAULT_REGION,
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
