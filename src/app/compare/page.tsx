import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareIndexClient } from "@/components/compare/CompareIndexClient";
import { getCompareIndexShellData } from "@/lib/comparison/get-compare-index-shell";
import { siteConfig } from "@/content/config";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Compare Sports Gear Side by Side",
  description:
    "Choose products and see the differences that matter — specs, use cases and prices.",
  alternates: { canonical: `${siteConfig.url}/compare` },
};

export default function ComparePage() {
  const data = getCompareIndexShellData();
  return (
    <Suspense fallback={null}>
      <CompareIndexClient data={data} />
    </Suspense>
  );
}
