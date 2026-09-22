import type { Metadata } from "next";
import { Suspense } from "react";
import { BestIndexClient } from "@/components/best-hub/BestIndexClient";
import { getBestIndexShellData } from "@/lib/best/get-best-index-shell";
import { siteConfig } from "@/content/config";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Best Gear Guides",
  description:
    "Evidence-led best gear guides organised by sport — recommendations tied to products, use cases and evidence.",
  alternates: { canonical: `${siteConfig.url}/best` },
};

export default function BestIndexPage() {
  const data = getBestIndexShellData();
  return (
    <Suspense fallback={null}>
      <BestIndexClient data={data} />
    </Suspense>
  );
}
