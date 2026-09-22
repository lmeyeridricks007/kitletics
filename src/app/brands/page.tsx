import type { Metadata } from "next";
import { Suspense } from "react";
import { BrandsHubClient } from "@/components/brands-hub/BrandsHubClient";
import { getBrandsIndexShellData } from "@/lib/brands/get-brands-index-shell";
import { siteConfig } from "@/content/config";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Brands",
  description:
    "Browse sports equipment brands on Kitletics — logos, products, reviews and guides.",
  alternates: { canonical: `${siteConfig.url}/brands` },
};

export default function BrandsPage() {
  const data = getBrandsIndexShellData();
  return (
    <Suspense fallback={null}>
      <BrandsHubClient data={data} />
    </Suspense>
  );
}
