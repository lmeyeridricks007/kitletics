import type { Metadata } from "next";
import { Suspense } from "react";
import { SetupsIndexClient } from "@/components/setups-hub/SetupsIndexClient";
import { getSetupsIndexShellData } from "@/lib/setups/get-setups-index-shell";
import { siteConfig } from "@/content/config";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Gear Setups & Kits | Kitletics",
  description:
    "Curated multi-category gear setups for race day, training and starter kits — real products, roles and live regional prices.",
  alternates: { canonical: `${siteConfig.url}/setups` },
};

export default function SetupsIndexPage() {
  const data = getSetupsIndexShellData();
  return (
    <Suspense fallback={null}>
      <SetupsIndexClient data={data} />
    </Suspense>
  );
}
